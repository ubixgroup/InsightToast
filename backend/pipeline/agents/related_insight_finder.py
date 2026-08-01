"""
Related Insight Finder Agent

Searches the insight vector DB for related insights and evaluates their relevance.
Selects one relevant insight (if found) to assign new insight to same thread,
or determines that a new thread should be created.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState
from prompts.templates import RELATED_INSIGHT_FINDER_PROMPT
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)
from services.llm import get_llm


class RelatedInsightFinderOutput(BaseModel):
    """Structured output from the related insight finder."""

    relevant_insight_found: bool = Field(
        ..., description="Whether a relevant insight was found"
    )
    selected_insight_id: Optional[str] = Field(
        None, description="ID of the selected relevant insight (if found)"
    )
    reasoning: str = Field(..., description="Explanation for the selection decision")


def related_insight_finder_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Related Insight Finder node for the RAG pipeline.

    Searches for related insights in the current topic and evaluates their relevance.
    If a relevant insight is found, returns its thread_id for the new insight to join.
    Otherwise, signals that a new thread should be created.

    Always edges to query_constructor regardless of finding.

    Args:
        state: Pipeline state with search query and context
        config: RAG configuration

    Returns:
        Updated state with selected_thread_id and selected_related_insight
    """
    config = config or get_default_config()
    llm = get_llm("related_insight_finder", config)

    # Get search queries from previous node (now a list)
    search_queries = state.get("insight_search_queries")
    if not search_queries:
        # No search queries - create new thread
        return {
            "selected_thread_id": None,
            "selected_related_insight": None,
        }

    # Get current topic
    current_topic_id = state.get("current_topic_id")
    if not current_topic_id:
        # No topic - create new thread
        return {
            "selected_thread_id": None,
            "selected_related_insight": None,
        }

    # Get insight store singleton
    from services.insight_store import InsightStore

    insight_store = InsightStore.get_instance()
    if insight_store is None:
        # No insight store initialized - create new thread
        return {
            "selected_thread_id": None,
            "selected_related_insight": None,
        }

    # Debug logging - search strategy
    print(f"\n[DEBUG] Related Insight Finder:")
    print(f"  - Searching with {len(search_queries)} queries")
    
    # Search with each query and aggregate results
    all_matches_dict = {}  # insight_id -> (best_score, payload)
    
    for i, search_query in enumerate(search_queries, 1):
        print(f"  - Query {i}: {search_query[:80]}...")
        
        # Search for related insights in current topic
        matches = insight_store.search_insights_in_topic(
            query=search_query,
            topic_id=current_topic_id,
        )
        
        print(f"    Found {len(matches)} matches")
        
        # Aggregate results - keep best score per insight_id
        for insight_id, score, payload in matches:
            if insight_id not in all_matches_dict or score > all_matches_dict[insight_id][0]:
                all_matches_dict[insight_id] = (score, payload)
    
    # Convert back to list and sort by score
    aggregated_matches = [
        (insight_id, score, payload)
        for insight_id, (score, payload) in all_matches_dict.items()
    ]
    aggregated_matches.sort(key=lambda x: x[1], reverse=True)  # Sort by score descending
    
    print(f"  - Total unique insights found: {len(aggregated_matches)}")

    # If no matches, create new thread
    if not aggregated_matches:
        print(f"  - No matches found, will create new thread\n")
        return {
            "selected_thread_id": None,
            "selected_related_insight": None,
        }

    # Format retrieved insights for LLM evaluation
    insights_dict = state.get("insights", {})
    retrieved_insights_formatted = []

    for insight_id, score, payload in aggregated_matches:
        # Try to get full insight from state
        if insight_id in insights_dict:
            insight = insights_dict[insight_id]

            # Format insight content
            if hasattr(insight, "content"):
                # Text insight
                insight_text = insight.content
            elif hasattr(insight, "explanation"):
                # Viz insight
                insight_text = f"[VIZ: {insight.chart_type}] {insight.explanation}"
            else:
                insight_text = payload.get("text", "N/A")

            retrieved_insights_formatted.append(
                f"=== INSIGHT ID: {insight_id} ===\n"
                f"Similarity Score: {score:.2f}\n"
                f"Thread ID: {payload.get('thread_id', 'N/A')}\n"
                f"Content: {insight_text}\n"
                f"==========================================\n"
            )

    retrieved_insights_str = (
        "\n".join(retrieved_insights_formatted)
        if retrieved_insights_formatted
        else "No insights found."
    )
    
    # Debug logging - retrieved insights for evaluation
    print(f"  - Retrieved insights for evaluation:")
    for i, line in enumerate(retrieved_insights_formatted[:3], 1):
        print(f"    {i}. {line[:150]}...")
    if len(retrieved_insights_formatted) > 3:
        print(f"    ... and {len(retrieved_insights_formatted) - 3} more")

    # Get current chunk + context for evaluation
    current_chunk = state.get("transcript_chunk")
    current_speaker = state.get("current_speaker")

    formatted_current_chunk = (
        f"{current_speaker}: {current_chunk}" if current_speaker else current_chunk
    )

    # Get last N chunks for context
    n_chunks = config.pipeline.context_window_size
    transcript_segments = state.get("transcript_segments", [])

    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=n_chunks,
        include_speaker=True,
    )

    # Get topic context
    topics = state.get("topics", {})
    current_topic = "Not assigned"

    if current_topic_id in topics:
        topic = topics[current_topic_id]
        current_topic = (
            f"{topic.name}: {topic.description}" if topic.description else topic.name
        )

    # Build few-shot examples
    examples = build_few_shot_examples_string("related_insight_finder")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", RELATED_INSIGHT_FINDER_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(RelatedInsightFinderOutput)
    chain = prompt | structured_llm

    result: RelatedInsightFinderOutput = chain.invoke(
        {
            "system_instruction": system_instruction,
            "domain_context": config.pipeline.domain_context,
            "current_topic": current_topic,
            "n_chunks": n_chunks,
            "last_n_chunks": last_n_chunks_str,
            "current_chunk": formatted_current_chunk,
            "retrieved_insights": retrieved_insights_str,
            "num_retrieved": len(aggregated_matches),
            "examples": examples,
        }
    )

    # Prepare return values
    selected_thread_id = None
    selected_related_insight = None

    if result.relevant_insight_found and result.selected_insight_id:
        # Get thread_id programmatically from the selected insight
        # Option 1: From aggregated_matches payload (most reliable since we just retrieved it)
        for insight_id, score, payload in aggregated_matches:
            if insight_id == result.selected_insight_id:
                selected_thread_id = payload.get("thread_id")
                break

        # Load the full insight object if available in state
        if result.selected_insight_id in insights_dict:
            selected_related_insight = insights_dict[result.selected_insight_id]
            # Option 2: Could also get thread_id from insight object as fallback
            if not selected_thread_id and hasattr(selected_related_insight, "thread_id"):
                selected_thread_id = selected_related_insight.thread_id
    
    # Debug logging - decision
    print(f"  - Decision: relevant_insight_found={result.relevant_insight_found}")
    if result.relevant_insight_found:
        print(f"  - Selected insight ID: {result.selected_insight_id}")
        print(f"  - Will join thread: {selected_thread_id}")
    else:
        print(f"  - Will create new thread")
    print(f"  - Reasoning: {result.reasoning}\n")

    return {
        "selected_thread_id": selected_thread_id,
        "selected_related_insight": selected_related_insight,
    }
