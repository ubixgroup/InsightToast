"""
Insight Selector Agent

Evaluates queries and their retrieved documents to determine:
1. Whether meaningful insights can be generated
2. Which queries are complementary and should be grouped
3. Which generator type(s) should process each group

Uses Send API to fan out to multiple generators in parallel.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Literal

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, Query
from models.insights import filter_metadata_for_llm
from prompts.templates import INSIGHT_SELECTOR_PROMPT
from services.llm import get_llm
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)


class GeneratorAssignment(BaseModel):
    """Assignment of queries to a specific generator."""

    generator_type: Literal["text", "viz"] = Field(
        ..., description="Type of generator to use: 'text' or 'viz'"
    )
    query_ids: List[str] = Field(
        ...,
        description="List of query IDs that should be processed together by this generator",
    )
    reasoning: str = Field(
        ...,
        description="Brief explanation of why these queries are grouped for this generator",
    )


class InsightSelectorOutput(BaseModel):
    """Structured output from the insight selector."""

    action: Literal["generate_insights", "halt"] = Field(
        ...,
        description="Whether to generate insights or halt (if no meaningful insights possible)",
    )
    generator_assignments: List[GeneratorAssignment] = Field(
        default_factory=list,
        description="List of generator assignments (empty if action is 'halt')",
    )
    overall_reasoning: str = Field(
        ..., description="Overall reasoning for the decision"
    )


def format_queries_with_documents(
    queries: List[Query],
    config: RAGConfig,
) -> str:
    """
    Format queries with their retrieved documents for the selector prompt.

    Args:
        queries: List of Query objects with retrieved_documents
        config: RAGConfig for metadata filtering

    Returns:
        Formatted string with queries and full document content
    """
    if not queries:
        return "No queries available."

    formatted_queries = []

    for idx, query in enumerate(queries, start=1):
        # Format basic query info
        query_str = (
            # f"[Query {idx}]\n"
            f"Query:\n"
            f"Query ID: {query.id}\n"
            f"Text: {query.text}\n"
            f"Suggested Types: {', '.join(query.suggested_insight_types) if query.suggested_insight_types else 'None'}\n"
        )

        if query.retrieved_documents:
            query_str += f"\\nRetrieved Documents ({len(query.retrieved_documents)} total):\\n\\n"

            for doc_idx, (doc_id, doc) in enumerate(
                query.retrieved_documents.items(), start=1
            ):
                # Filter metadata
                filtered_meta = filter_metadata_for_llm(doc.metadata, config)

                # Format metadata as key: value pairs
                meta_str = "\\n".join(f"    {k}: {v}" for k, v in filtered_meta.items())

                # Full document with metadata and content
                doc_str = (
                    # f"  [Document {doc_idx}]\\n"
                    f"  Document:\n"
                    f"  Doc ID: {doc_id}\\n"
                    f"  Metadata:\\n{meta_str}\\n"
                    f"  Content:\\n{doc.page_content}\\n"
                )
                query_str += doc_str + "\\n"
        else:
            query_str += "Retrieved Documents: None\\n"

        formatted_queries.append(query_str)

    return "\\n---\\n\\n".join(formatted_queries)


def insight_selector_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Insight Selector node - evaluates queries and routes to generators.

    Responsibilities:
    1. Evaluate if meaningful insights can be generated from queries+documents
    2. Group complementary queries together
    3. Determine which generator type should process each group
    4. Return generator_assignments for Send API to fan out

    Args:
        state: RAGPipelineState with queries from query_constructor
        config: Optional RAGConfig

    Returns:
        Updated state with:
        - generator_assignments: List[GeneratorAssignment] for routing
        - action: "generate_insights" or "halt"
    """
    config = config or get_default_config()
    llm = get_llm("insight_selector", config)

    # ============================================================
    # 1. Get queries from state
    # ============================================================
    queries: List[Query] = state.get("queries", [])

    if not queries:
        return {
            "action": "halt",
            "generator_assignments": [],
        }

    # ============================================================
    # 2. Get context from state
    # ============================================================
    current_topic_id = state.get("current_topic_id")
    topics = state.get("topics", {})
    topic = topics.get(current_topic_id) if topics else None
    current_topic = (
        f"{topic.name}: {topic.description}" if topic.description else topic.name
    )

    domain_context = state.get("domain_context", "")

    # Get meeting context
    meeting_info = state.get("meeting_info")
    meeting_title = meeting_info.title if meeting_info else "Not yet determined"
    meeting_summary = meeting_info.summary if meeting_info else "No summary yet."
    key_values_json = (
        json.dumps(meeting_info.key_values, indent=2)
        if meeting_info and meeting_info.key_values
        else "{}"
    )

    # Get the latest transcript chunk
    # Get transcript context
    transcript_chunk = state.get("transcript_chunk")
    current_speaker = state.get("current_speaker")

    formatted_current_chunk = (
        f"{current_speaker}: {transcript_chunk}"
        if current_speaker
        else transcript_chunk
    )

    # Get last N chunks for context — use the larger assessment window
    n_chunks = config.pipeline.assessment_context_window_size
    transcript_segments = state.get("transcript_segments", [])
    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=n_chunks,
        include_speaker=True,
    )

    # Get N most-recent session insights for redundancy checking
    insights_dict = state.get("insights", {})
    max_recent = config.pipeline.max_recent_insights

    sorted_recent = sorted(
        insights_dict.items(),
        key=lambda x: x[1].created_at,
        reverse=True,
    )

    formatted_recent_insights = []
    for insight_id, insight in sorted_recent[:max_recent]:
        if hasattr(insight, "content"):
            # TextInsight: include content and cited doc IDs for dedup comparison
            cited_ids = insight.cited_document_ids if insight.cited_document_ids else []
            cited_str = f" | Cited docs: {', '.join(cited_ids)}" if cited_ids else ""
            title_str = (
                f" | Title: {insight.title}" if getattr(insight, "title", "") else ""
            )
            insight_text = f"[TEXT]{title_str} {insight.content}{cited_str}"
        elif hasattr(insight, "chart_type"):
            # VizInsight: include chart_type, chart_title, subtitle, data field summary for dedup
            parts = [f"[VIZ: {insight.chart_type}]"]
            if getattr(insight, "chart_title", ""):
                parts.append(f"Title: {insight.chart_title}")
            if getattr(insight, "subtitle", ""):
                parts.append(f"Subtitle: {insight.subtitle}")
            if getattr(insight, "explanation", ""):
                parts.append(insight.explanation)
            # Summarize data structure so the LLM can detect duplicate data
            data = getattr(insight, "data", None)
            if data and isinstance(data, list) and len(data) > 0:
                fields = list(data[0].keys()) if isinstance(data[0], dict) else []
                parts.append(f"Data: {len(data)} rows, fields={fields}")
            cited_ids = insight.cited_document_ids if insight.cited_document_ids else []
            if cited_ids:
                parts.append(f"Cited docs: {', '.join(cited_ids)}")
            insight_text = " | ".join(parts)
        else:
            insight_text = "Insight generated."
        formatted_recent_insights.append(f"Insight #{insight_id}: {insight_text}")

    recent_insights_str = (
        "\n".join(formatted_recent_insights)
        if formatted_recent_insights
        else "No insights have been generated yet in this conversation."
    )

    # ============================================================
    # 3. Format queries with document summaries
    # ============================================================
    queries_formatted = format_queries_with_documents(queries, config)

    # ============================================================
    # 4. Get system instruction and examples
    # ============================================================
    system_instruction = get_system_instruction(config.pipeline.current_date)
    examples = build_few_shot_examples_string("insight_selector")

    # ============================================================
    # 5. Invoke LLM with structured output
    # ============================================================
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", INSIGHT_SELECTOR_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(InsightSelectorOutput)
    chain = prompt | structured_llm

    result: InsightSelectorOutput = chain.invoke(
        {
            "domain_context": domain_context,
            "current_topic": current_topic,
            "meeting_title": meeting_title,
            "meeting_summary": meeting_summary,
            "key_values_json": key_values_json,
            "transcript_chunk": formatted_current_chunk,
            "last_n_chunks": last_n_chunks_str,
            "recent_insights": recent_insights_str,
            "queries_formatted": queries_formatted,
            "examples": examples,
        }
    )

    # ============================================================
    # 6. Return state updates with routing decision
    # ============================================================
    return {
        "generator_assignments": [
            {
                "generator_type": assignment.generator_type,
                "query_ids": assignment.query_ids,
                "reasoning": assignment.reasoning,
            }
            for assignment in result.generator_assignments
        ],
        "should_halt": result.action == "halt",
        "insight_selection_reasoning": result.overall_reasoning,
    }
