"""
Insight Need Assessment Agent

Determines whether the current conversation moment would benefit from
retrieving background information (insights) from the knowledge base.

Evaluates based on:
- Uncertainty markers and hedge words
- Information requests
- Knowledge gaps
- Decision-making contexts
- Conversation dead-ends
- Existing insights from recent chunks
"""

from __future__ import annotations

import json
from typing import Any, Dict

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState
from prompts.templates import INSIGHT_NEED_ASSESSMENT_PROMPT
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)
from services.llm import get_llm


class InsightNeedAssessmentOutput(BaseModel):
    """Structured output from the insight need assessment agent."""

    insight_needed: bool = Field(
        ..., description="Whether an insight from the knowledge base is needed"
    )
    reasoning: str = Field(..., description="Explanation for the decision")


def insight_need_assessment_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Insight Need Assessment node for the RAG pipeline.

    Determines if the current conversation moment needs background information
    from the knowledge base by evaluating:
    - The current transcript chunk (primary focus)
    - Last N chunks for context
    - Existing insights from recent chunks
    - Conversation patterns (uncertainty, information requests, dead-ends)

    Returns:
        Updated state with insight_needed and insight_need_reasoning
    """
    config = config or get_default_config()
    llm = get_llm("insight_need_assessment", config)

    # Get current chunk
    current_chunk = state["transcript_chunk"]
    current_speaker = state.get("current_speaker")

    # Format current chunk with speaker
    formatted_current_chunk = (
        f"{current_speaker}: {current_chunk}" if current_speaker else current_chunk
    )

    # Get last N chunks for context — use the larger assessment window
    n_chunks = config.pipeline.assessment_context_window_size
    transcript_segments = state.get("transcript_segments", [])

    # Use utility function to format last N chunks
    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=n_chunks,
        include_speaker=True,
    )

    # Get the N most-recent session insights (sorted by created_at, newest first)
    insights_dict = state.get("insights", {})
    max_recent = config.pipeline.max_recent_insights

    sorted_insights = sorted(
        insights_dict.items(),
        key=lambda x: x[1].created_at,
        reverse=True,
    )

    # Build transcript segment lookup for source chunks
    segment_dict = {seg.id: seg for seg in transcript_segments}

    formatted_insights = []
    for insight_id, insight in sorted_insights[:max_recent]:
        if hasattr(insight, "content"):
            # Text insight
            insight_text = insight.content
        elif hasattr(insight, "explanation") and insight.explanation:
            # Viz insight – use accessible explanation
            insight_text = f"[VIZ: {insight.chart_type}] {insight.explanation}"
        else:
            insight_text = "Insight generated."

        # Get the source transcript chunk that triggered this insight
        source_chunk_text = "<source chunk not found>"
        if insight.source_chunk_id and insight.source_chunk_id in segment_dict:
            source_seg = segment_dict[insight.source_chunk_id]
            source_chunk_text = (
                f"{source_seg.speaker}: {source_seg.text}"
                if source_seg.speaker
                else source_seg.text
            )

        formatted_insights.append(
            f"Insight #{insight_id}:\n"
            f"  Triggered by transcript chunk: {source_chunk_text}\n"
            f"  Content: {insight_text}\n"
        )

    existing_insights_str = (
        "\n".join(formatted_insights)
        if formatted_insights
        else "No insights have been generated yet in this conversation."
    )

    # Get topic context
    current_topic_id = state.get("current_topic_id")
    topics = state.get("topics", {})
    current_topic = "Not assigned"

    if current_topic_id and current_topic_id in topics:
        topic = topics[current_topic_id]
        current_topic = (
            f"{topic.name}: {topic.description}" if topic.description else topic.name
        )

    # Get meeting context
    meeting_info = state.get("meeting_info")
    meeting_title = meeting_info.title if meeting_info else "Not yet determined"
    meeting_summary = (
        meeting_info.summary if meeting_info else "No meeting summary yet."
    )
    key_values_json = (
        json.dumps(meeting_info.key_values, indent=2)
        if meeting_info and meeting_info.key_values
        else "{}"
    )

    # Build few-shot examples
    examples = build_few_shot_examples_string("insight_need_assessment")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", INSIGHT_NEED_ASSESSMENT_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(InsightNeedAssessmentOutput)
    chain = prompt | structured_llm

    result: InsightNeedAssessmentOutput = chain.invoke(
        {
            "domain_context": config.pipeline.domain_context,
            "current_topic": current_topic,
            "meeting_title": meeting_title,
            "meeting_summary": meeting_summary,
            "key_values_json": key_values_json,
            "n_chunks": n_chunks,
            "last_n_chunks": last_n_chunks_str,
            "current_chunk": formatted_current_chunk,
            "existing_insights": existing_insights_str,
            "examples": examples,
        }
    )

    return {
        "insight_needed": result.insight_needed,
        "insight_need_reasoning": result.reasoning,
        "should_halt": not result.insight_needed,
    }
