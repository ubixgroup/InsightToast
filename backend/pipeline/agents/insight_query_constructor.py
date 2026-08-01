"""
Insight Query Constructor Agent

Generates a search query for finding related insights in the insight vector DB.
Uses HyDE (Hypothetical Document Embeddings) technique to transform
conversation context into a hypothetical insight for better semantic matching.
"""

from __future__ import annotations

from typing import Any, Dict

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState
from prompts.templates import INSIGHT_QUERY_CONSTRUCTOR_PROMPT
from prompts.utils import build_few_shot_examples_string, get_system_instruction, get_last_n_chunks
from services.llm import get_llm


class SearchQuery(BaseModel):
    """A single search query with its hypothetical insight."""
    
    hypothetical_insight: str = Field(
        ...,
        description="Hypothetical insight text that would answer a specific angle (for HyDE embedding)"
    )


class InsightQueryConstructorOutput(BaseModel):
    """Structured output from the insight query constructor."""
    
    queries: list[SearchQuery] = Field(
        ...,
        description="List of 2-3 search queries from different angles"
    )
    reasoning: str = Field(
        ...,
        description="Overall explanation for the query strategy"
    )


def insight_query_constructor_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Insight Query Constructor node for the RAG pipeline.
    
    Generates a search query to find related insights using HyDE technique.
    Transforms current conversation context into a hypothetical insight
    that would satisfy the information need.
    
    Args:
        state: Pipeline state with transcript context
        config: RAG configuration
        
    Returns:
        Updated state with insight_search_query
    """
    config = config or get_default_config()
    llm = get_llm("insight_query_constructor", config)
    
    # Get current chunk (primary focus)
    current_chunk = state["transcript_chunk"]
    current_speaker = state.get("current_speaker")
    
    # Format current chunk with speaker
    formatted_current_chunk = (
        f"{current_speaker}: {current_chunk}"
        if current_speaker
        else current_chunk
    )
    
    # Get last N chunks for context (same as insight_need_assessment)
    n_chunks = config.pipeline.context_window_size
    transcript_segments = state.get("transcript_segments", [])
    
    # Use utility function
    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=n_chunks,
        include_speaker=True,
    )
    
    # Get topic context
    current_topic_id = state.get("current_topic_id")
    topics = state.get("topics", {})
    current_topic = "Not assigned"
    
    if current_topic_id and current_topic_id in topics:
        topic = topics[current_topic_id]
        current_topic = f"{topic.name}: {topic.description}" if topic.description else topic.name
    
    # Get meeting context
    meeting_info = state.get("meeting_info")
    meeting_summary = meeting_info.summary if meeting_info else "No meeting summary yet."
    
    # Build few-shot examples
    examples = build_few_shot_examples_string("insight_query_constructor")
    
    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)
    
    # Create prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("human", INSIGHT_QUERY_CONSTRUCTOR_PROMPT),
    ])
    
    # Use structured output
    structured_llm = llm.with_structured_output(InsightQueryConstructorOutput)
    chain = prompt | structured_llm
    
    result: InsightQueryConstructorOutput = chain.invoke({
        "system_instruction": system_instruction,
        "domain_context": config.pipeline.domain_context,
        "current_topic": current_topic,
        "meeting_summary": meeting_summary,
        "n_chunks": n_chunks,
        "last_n_chunks": last_n_chunks_str,
        "current_chunk": formatted_current_chunk,
        "examples": examples,
    })
    
    # Debug logging
    print(f"\n[DEBUG] Insight Query Constructor:")
    print(f"  - Current chunk: {formatted_current_chunk[:100]}...")
    print(f"  - Generated {len(result.queries)} search queries:")
    for i, q in enumerate(result.queries, 1):
        print(f"    {i}. Hypothetical: {q.hypothetical_insight[:120]}...")
    print(f"  - Overall reasoning: {result.reasoning}")
    
    # Extract hypothetical insights for HyDE-based searching
    hypothetical_insights = [q.hypothetical_insight for q in result.queries]
    
    return {
        "insight_search_queries": hypothetical_insights,  # Use list of hypothetical insights for embedding (HyDE)
    }
