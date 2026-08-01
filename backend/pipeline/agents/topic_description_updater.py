"""
Topic Description Updater Agent

Maintains and refines topic descriptions and example segments
as new content is added to topics.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, TranscriptSegment
from prompts.templates import TOPIC_DESCRIPTION_UPDATER_PROMPT
from prompts.utils import build_few_shot_examples_string, get_system_instruction
from services.llm import get_llm


class TopicDescriptionUpdaterOutput(BaseModel):
    """Structured output from the topic description updater agent."""

    updated_description: str = Field(
        ..., description="Updated one-paragraph description of the topic"
    )
    example_segment_ids: List[str] = Field(
        ..., description="Selected example segment IDs (max based on config)"
    )
    reasoning: str = Field(
        ..., description="Brief explanation of changes made (or why no changes)"
    )


def topic_description_updater_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Topic Description Updater node for the RAG pipeline.

    After a chunk is assigned to a topic, this agent:
    1. Evaluates if the new chunk should be an example
    2. Refines the topic description (one paragraph) if needed
    3. Maintains up to max_topic_examples best example segments

    Returns:
        Updated state with refined topic (only the modified topic)
    """
    config = config or get_default_config()
    llm = get_llm("topic_description_updater", config)

    topics = state.get("topics", {})
    current_topic_id = state.get("current_topic_id")

    # If no topic assigned, nothing to update
    if not current_topic_id or current_topic_id not in topics:
        return {}

    topic = topics[current_topic_id]
    transcript_segments = state.get("transcript_segments", [])

    # Get the latest segment (the one just added)
    latest_segment = transcript_segments[-1] if transcript_segments else None
    if not latest_segment:
        return {}
    new_chunk = (
        f"[ID: {latest_segment.id}] {latest_segment.speaker}: {latest_segment.text}"
    )

    # Format current examples from example_transcript_segment_ids
    current_examples = []
    for seg_id in topic.example_transcript_segment_ids:
        seg = next((s for s in transcript_segments if s.id == seg_id), None)
        if seg:
            speaker_prefix = f"{seg.speaker}: " if seg.speaker else ""
            current_examples.append(f"[ID: {seg_id}] {speaker_prefix}{seg.text}")

    current_examples_str = (
        "\n".join(f"- {ex}" for ex in current_examples)
        if current_examples
        else "(no examples yet)"
    )

    # Build few-shot examples string
    examples_str = build_few_shot_examples_string(
        "topic_description_updater", max_examples=2
    )

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt - template already has {examples} placeholder
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", TOPIC_DESCRIPTION_UPDATER_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(TopicDescriptionUpdaterOutput)
    chain = prompt | structured_llm

    result: TopicDescriptionUpdaterOutput = chain.invoke(
        {
            "domain_context": config.pipeline.domain_context,
            "meeting_title": (
                state.get("meeting_info").title
                if state.get("meeting_info")
                else "Not yet determined"
            ),
            "meeting_summary": (
                state.get("meeting_info").summary
                if state.get("meeting_info")
                else "No summary yet."
            ),
            "key_values_json": (
                json.dumps(state.get("meeting_info").key_values, indent=2)
                if state.get("meeting_info") and state.get("meeting_info").key_values
                else "{}"
            ),
            "topic_name": topic.name,
            "current_description": topic.description,
            "current_examples": current_examples_str,
            "new_chunk": new_chunk,
            "new_chunk_id": latest_segment.id,
            "max_topic_examples": config.pipeline.max_topic_examples,
            "examples": examples_str,
        }
    )

    # Update topic with new description and examples - create a copy to avoid mutating state
    updated_topic = topic.model_copy(deep=True)
    updated_topic.description = result.updated_description
    # Enforce max limit
    updated_topic.example_transcript_segment_ids = result.example_segment_ids[
        : config.pipeline.max_topic_examples
    ]

    # Return ONLY the modified topic (reducer will merge it)
    return {
        "topics": {current_topic_id: updated_topic},
    }
