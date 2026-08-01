"""
Query Constructor Agent

Generates search queries for the knowledge base using:
- Query decomposition (for multi-aspect content)
- HyDE (Hypothetical Document Embeddings)
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, Query
from prompts.templates import QUERY_CONSTRUCTOR_PROMPT
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)
from services.llm import get_llm


class QueryItem(BaseModel):
    """A single query with its metadata."""

    query_text: str = Field(..., description="The search query")

    hypothetical_response: Optional[str] = Field(
        None,
        description=(
            "Optional hypothetical description of ideal retrieved content to strengthen "
            "semantic search. Should describe expected document types, approximate number "
            "of documents, and the quantitative structure of the information."
        ),
    )

    suggested_insight_types: List[str] = Field(
        ..., description="Types of insights suggested: 'text' and/or 'visualization'"
    )


class QueryConstructorLLMOutput(BaseModel):
    """Structured output from the query constructor LLM."""

    queries: List[QueryItem] = Field(
        default_factory=list, description="List of queries to execute"
    )


def query_constructor_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Query Constructor node for the RAG pipeline.

    Generates queries for retrieval using decomposition and HyDE.

    Returns:
        Updated state with generated queries
    """
    config = config or get_default_config()
    llm = get_llm("query_constructor", config)

    # Get context
    meeting_info = state.get("meeting_info")
    current_topic_id = state.get("current_topic_id")
    topics = state.get("topics", {})
    insights_dict = state.get("insights", {})

    current_topic = "Not assigned"

    if current_topic_id and current_topic_id in topics:
        topic = topics[current_topic_id]
        current_topic = (
            f"{topic.name}: {topic.description}" if topic.description else topic.name
        )

    # Get last N chunks for context
    n_chunks = config.pipeline.context_window_size
    transcript_segments = state.get("transcript_segments", [])

    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=n_chunks,
        include_speaker=True,
    )

    # Get last N session insights for context (replaces deprecated thread-based insight lookup)
    n_insights = config.pipeline.insight_context_window_size
    sorted_recent = sorted(
        insights_dict.items(),
        key=lambda x: x[1].created_at,
        reverse=True,
    )
    formatted_insights = []
    for _, insight in sorted_recent[:n_insights]:
        if hasattr(insight, "content"):
            # Text insight
            formatted_insights.append(f"- {insight.content}")
        elif hasattr(insight, "explanation") and insight.explanation:
            # Viz insight
            chart_type = getattr(insight, "chart_type", "chart")
            formatted_insights.append(f"- [{chart_type.upper()}] {insight.explanation}")
    last_n_insights_str = (
        "\n".join(formatted_insights)
        if formatted_insights
        else "No previous insights in this session."
    )

    # Format current chunk with speaker
    formatted_current_chunk = (
        f"{state['current_speaker']}: {state['transcript_chunk']}"
        if state.get("current_speaker")
        else state["transcript_chunk"]
    )

    # Format document types info from config
    document_types_dict = config.pipeline.document_types
    document_types_lines = []
    for doc_type, description in document_types_dict.items():
        document_types_lines.append(f"- {doc_type}: {description}")
    document_types_info = "\n".join(document_types_lines)

    # Build few-shot examples
    examples = build_few_shot_examples_string("query_constructor")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # --- Optional web search context note ---
    if config.pipeline.web_search_enabled:
        web_search_context = (
            "=============================================================================\n"
            "SUPPLEMENTARY WEB SEARCH AVAILABLE\n"
            "=============================================================================\n"
            "The retrieval pipeline has optional web search enabled alongside the knowledge base.\n"
            "You do NOT need to change your query formulation — the downstream Retriever Planner\n"
            "will decide when to trigger web search. However, if the current discussion references\n"
            "very recent events, external reports, or information unlikely to be in the parliamentary\n"
            "knowledge base, you may note this in the hypothetical_response to help the Retriever\n"
            "Planner make the web search decision.\n"
        )
    else:
        web_search_context = ""

    # Create prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", QUERY_CONSTRUCTOR_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(QueryConstructorLLMOutput)
    chain = prompt | structured_llm

    result: QueryConstructorLLMOutput = chain.invoke(
        {
            "domain_context": config.pipeline.domain_context,
            "current_topic": current_topic,
            "meeting_title": (
                meeting_info.title if meeting_info else "Not yet determined"
            ),
            "meeting_summary": (
                meeting_info.summary if meeting_info else "No summary yet."
            ),
            "key_values_json": (
                json.dumps(meeting_info.key_values, indent=2)
                if meeting_info and meeting_info.key_values
                else "{}"
            ),
            "transcript_chunk": formatted_current_chunk,
            "n_chunks": n_chunks,
            "last_n_chunks": last_n_chunks_str,
            "last_n_insights": last_n_insights_str,
            "document_types_info": document_types_info,
            "examples": examples,
            "web_search_context": web_search_context,
        }
    )

    # Convert to Query objects
    queries: List[Query] = []

    for item in result.queries[: config.pipeline.max_queries_per_chunk]:
        query = Query(
            text=item.query_text,
            hypothetical_response=item.hypothetical_response,
            source_transcript=state["transcript_chunk"],
            suggested_insight_types=item.suggested_insight_types,
        )
        queries.append(query)

    return {"queries": queries}
