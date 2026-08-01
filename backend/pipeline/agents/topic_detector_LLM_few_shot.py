"""
Topic Detector Agent (LLM-based Few-Shot)

Analyzes incoming transcript segments and determines:
1. Which topic it belongs to (existing or new)

Uses LLM with few-shot examples from all existing topics to make classification decisions.
No embedding-based similarity - purely LLM reasoning with topic descriptions and examples.
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, TranscriptSegment
from models.topics import Topic, TopicAction
from prompts.templates import TOPIC_DETECTOR_PROMPT
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
)
from services.llm import get_llm
# DEPRECATED: TranscriptStore removed — only used by the broken related_insight_finder pipeline
# from services.transcript_store import TranscriptStore


class TopicDetectorOutput(BaseModel):
    """Structured output from the topic detector agent."""

    action: TopicAction = Field(
        ..., description="The action to take: ASSIGN_TOPIC or CREATE_TOPIC"
    )

    # For ASSIGN_TOPIC action only
    topic_id: Optional[str] = Field(
        None,
        description="ID of existing topic to assign to (ONLY for ASSIGN_TOPIC action, leave None for CREATE_TOPIC)",
    )

    # For CREATE_TOPIC action only
    topic_name: Optional[str] = Field(
        None,
        description="Name for the new topic - 2-5 words (ONLY for CREATE_TOPIC action, leave None for ASSIGN_TOPIC)",
    )
    topic_description: Optional[str] = Field(
        None,
        description="One paragraph description for the new topic (ONLY for CREATE_TOPIC action, leave None for ASSIGN_TOPIC)",
    )

    # Reasoning
    reasoning: str = Field(..., description="Brief explanation for the decision")


def format_all_topics_with_examples(
    topics: Dict[str, Topic],
    transcript_segments: List[TranscriptSegment],
    max_examples: int,
) -> str:
    """
    Format ALL topics with their descriptions and example chunks for the prompt.
    
    Args:
        topics: Dictionary of all topics (id -> Topic)
        transcript_segments: All transcript segments for looking up examples
        max_examples: Maximum number of example chunks to show per topic
        
    Returns:
        Formatted string with all topics, their descriptions, and examples
    """
    if not topics:
        return "No existing topics yet. This is the first substantive chunk in the conversation."

    lines = []
    for topic_id, topic in topics.items():
        # Format topic header with name, ID, and description
        lines.append(f"### {topic.name} (ID: {topic_id})")
        lines.append(f"Description: {topic.description}")

        # Format example chunks
        example_ids = topic.example_transcript_segment_ids[:max_examples]
        if example_ids:
            lines.append("Example chunks:")
            for seg_id in example_ids:
                seg = next((s for s in transcript_segments if s.id == seg_id), None)
                if seg:
                    speaker_prefix = f"{seg.speaker}: " if seg.speaker else ""
                    lines.append(f"  - {speaker_prefix}{seg.text}")
        else:
            lines.append("Example chunks: (no examples yet)")

        lines.append("")  # Empty line between topics

    return "\n".join(lines)


def prepare_topic_context(
    state: RAGPipelineState,
    config: RAGConfig,
) -> str:
    """
    Prepare topic context with last N chunks for conversation flow awareness.

    Returns:
        Formatted string with last N chunks and their topic assignments
    """
    topics = state.get("topics", {})
    
    # Get last N chunks with topics from transcript_segments state
    transcript_segments = state.get("transcript_segments", [])

    # Filter to only segments with topic_id assigned
    segments_with_topics = [
        seg for seg in transcript_segments if seg.topic_id is not None
    ]

    # Take last N
    n = config.pipeline.context_window_size
    last_n_segments = (
        segments_with_topics[-n:]
        if len(segments_with_topics) > n
        else segments_with_topics
    )

    # Format last N chunks with speaker and topic names
    last_n_chunks_lines = []
    for seg in last_n_segments:
        topic_name = "Unknown"
        if seg.topic_id and seg.topic_id in topics:
            topic_name = topics[seg.topic_id].name

        speaker_prefix = f"{seg.speaker}: " if seg.speaker else ""
        last_n_chunks_lines.append(f"[Topic: {topic_name}] {speaker_prefix}{seg.text}")

    last_n_chunks_str = (
        "\n".join(last_n_chunks_lines)
        if last_n_chunks_lines
        else "No previous chunks with topics."
    )

    return last_n_chunks_str


def topic_detector_llm_few_shot_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Topic Detector node using LLM-based few-shot classification.

    Analyzes the transcript chunk and decides:
    - ASSIGN_TOPIC: Assign to existing topic
    - CREATE_TOPIC: Create a new topic

    Uses ALL existing topics with their descriptions and examples for LLM classification.
    No embedding-based similarity - purely LLM reasoning.

    Returns:
        Updated state with topic assignment
    """
    config = config or get_default_config()
    llm = get_llm("topic_detector", config)

    topics = state.get("topics", {})

    # Get last N chunks for conversation context
    last_n_chunks_str = prepare_topic_context(state, config)

    print(f"Topics: {list(topics.keys())}")
    print(f"Total topics for classification: {len(topics)}")

    # Get meeting info
    meeting_info = state.get("meeting_info")
    meeting_title = meeting_info.title if meeting_info else ""
    meeting_summary = meeting_info.summary if meeting_info else ""

    # Get transcript segments for formatting examples
    transcript_segments = state.get("transcript_segments", [])

    # Format ALL topics with their descriptions and examples
    all_topics_str = format_all_topics_with_examples(
        topics,
        transcript_segments,
        config.pipeline.max_topic_examples,
    )

    # Format ongoing topic (topic assigned to previous chunks before this one)
    ongoing_topic_info = "No topic assigned yet (this is the first substantive chunk)."
    ongoing_topic_id = state.get("current_topic_id")
    if ongoing_topic_id and ongoing_topic_id in topics:
        ongoing_topic = topics[ongoing_topic_id]
        ongoing_topic_info = f"{ongoing_topic.name} (ID: {ongoing_topic_id})"

    # Build few-shot examples string
    examples_str = build_few_shot_examples_string("topic_detector")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", TOPIC_DETECTOR_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(TopicDetectorOutput)
    chain = prompt | structured_llm

    # Retry logic for topic name generation
    max_retries = 3
    result: TopicDetectorOutput = None
    
    for attempt in range(max_retries):
        result = chain.invoke(
            {
                "domain_context": config.pipeline.domain_context,
                "meeting_title": meeting_title or "Not yet determined",
                "meeting_summary": meeting_summary or "No summary yet.",
                "key_values_json": (
                    json.dumps(meeting_info.key_values, indent=2)
                    if meeting_info and meeting_info.key_values
                    else "{}"
                ),
                "ongoing_topic_info": ongoing_topic_info,
                "transcript_chunk": state["transcript_chunk"],
                "last_n_chunks": last_n_chunks_str,
                "all_topics_info": all_topics_str,
                "context_window_size": config.pipeline.context_window_size,
                "max_topic_examples": config.pipeline.max_topic_examples,
                "examples": examples_str,
            }
        )
        
        # Validate result - if creating topic, MUST have a topic_name
        if result.action == TopicAction.CREATE_TOPIC:
            if not result.topic_name or result.topic_name.strip() == "":
                print(f"[WARNING] Topic Detector attempt {attempt + 1}/{max_retries}: "
                      f"CREATE_TOPIC selected but topic_name is empty. Retrying...")
                
                if attempt < max_retries - 1:
                    # Add retry instruction to prompt for next attempt
                    continue
                else:
                    # Last resort fallback after all retries
                    print(f"[ERROR] Topic Detector failed after {max_retries} attempts. "
                          f"Using fallback name 'Unnamed Topic'")
                    result.topic_name = "Unnamed Topic"
                    result.topic_description = result.topic_description or "No description provided"
            else:
                # Valid topic_name provided
                break
        else:
            # ASSIGN_TOPIC action - no validation needed
            break

    # Process the result
    updates: Dict[str, Any] = {}
    updates["topic_action"] = result.action.value  # Store as string in state

    if result.action == TopicAction.ASSIGN_TOPIC:
        # Assign to existing topic
        topic_id = result.topic_id
        if topic_id and topic_id in topics:
            # Create transcript segment
            segment = TranscriptSegment(
                text=state["transcript_chunk"],
                speaker=state.get("current_speaker"),
                topic_id=topic_id,
            )

            # Update topic - create a copy with updated segment list
            topic = topics[topic_id]
            updated_topic = topic.model_copy(deep=True)
            if segment.id not in updated_topic.transcript_segment_ids:
                updated_topic.transcript_segment_ids.append(segment.id)
            updated_topic.updated_at = datetime.now()

            updates["current_topic_id"] = topic_id
            # Return ONLY the modified topic (reducer will merge it)
            updates["topics"] = {topic_id: updated_topic}
            updates["transcript_segments"] = [segment]
        else:
            # Topic not found, treat as CREATE_TOPIC
            print(f"[WARNING] Topic {topic_id} not found. Creating new topic instead.")
            result.action = TopicAction.CREATE_TOPIC
            if not result.topic_name or result.topic_name.strip() == "":
                result.topic_name = "Unnamed Topic"
            result.topic_description = result.topic_description or ""

    if result.action == TopicAction.CREATE_TOPIC:
        # Create transcript segment
        segment = TranscriptSegment(
            text=state["transcript_chunk"],
            speaker=state.get("current_speaker"),
            topic_id=None,  # Will be set after topic creation
        )
        
        # Create new topic with first segment
        # Validation already done in retry loop above
        new_topic = Topic(
            name=result.topic_name,
            description=result.topic_description or "",
            example_transcript_segment_ids=[segment.id],  # First segment as example
            transcript_segment_ids=[segment.id],  # First segment in list
        )
        
        # Update segment with topic_id
        segment.topic_id = new_topic.id

        updates["current_topic_id"] = new_topic.id
        # Return ONLY the new topic (reducer will merge it)
        updates["topics"] = {new_topic.id: new_topic}
        updates["transcript_segments"] = [segment]

    # DEPRECATED: transcript store update removed (related_insight_finder pipeline removed)
    # transcript_store = TranscriptStore.get_instance()
    # if transcript_store:
    #     current_topic_id = updates.get("current_topic_id")
    #     segments = updates.get("transcript_segments", [])
    #     if segments:
    #         latest_segment = segments[-1] if segments else None
    #         if latest_segment:
    #             transcript_store.add_chunk(
    #                 chunk_id=latest_segment.id,
    #                 text=latest_segment.text,
    #                 topic_id=current_topic_id,
    #                 speaker=latest_segment.speaker,
    #             )

    return updates
