"""
Topic Router Agent

Analyzes incoming transcript segments and determines:
1. Which topic it belongs to (existing or new)

Uses embedding similarity with topic centroids to find candidates,
then uses LLM to make final decision considering conversation context.
"""

from __future__ import annotations

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
from services.transcript_store import TranscriptStore


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


def format_candidate_topics_with_examples(
    topic_candidates: List[str],
    topics: Dict[str, Topic],
    transcript_segments: List[TranscriptSegment],
    max_examples: int,
) -> str:
    """Format candidate topics with their descriptions and example chunks for prompt."""
    if not topic_candidates:
        return "No candidate topics found (similarity below threshold with all existing topics)."

    lines = []
    for tid in topic_candidates:
        if tid in topics:
            topic = topics[tid]

            # Format topic header
            lines.append(f"### {topic.name} (ID: {tid})")
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

    return "\n".join(lines) if lines else "No candidate topics found."


def prepare_topic_context(
    state: RAGPipelineState,
    config: RAGConfig,
) -> tuple[List[str], str]:
    """
    Prepare topic routing data: candidates from similarity and last N chunks.

    Returns:
        (candidate_topic_ids, last_n_chunks_str)
    """
    topics = state.get("topics", {})
    topic_ids = list(topics.keys())
    candidates = []

    # Get transcript store singleton
    transcript_store = TranscriptStore.get_instance()

    # Find candidate topics using embedding similarity
    if transcript_store and topic_ids:
        similarity_results = transcript_store.find_similar_topics(
            chunk_text=state["transcript_chunk"],
            topic_ids=topic_ids,
            threshold=config.pipeline.topic_similarity_threshold,
        )
        candidates = [tid for tid, _ in similarity_results]

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

    # Add topic IDs from last N chunks to candidates (unique)
    for seg in last_n_segments:
        if seg.topic_id and seg.topic_id not in candidates:
            candidates.append(seg.topic_id)

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

    return candidates, last_n_chunks_str


def topic_detector_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Topic Router node for the RAG pipeline.

    Analyzes the transcript chunk and decides:
    - ASSIGN_TOPIC: Assign to existing topic
    - CREATE_TOPIC: Create a new topic

    Uses topic candidates from embedding similarity + conversation context.

    Returns:
        Updated state with topic assignment
    """
    config = config or get_default_config()
    llm = get_llm("topic_detector", config)

    topics = state.get("topics", {})

    # Prepare topic context (similarity + last N chunks)
    topic_candidates, last_n_chunks_str = prepare_topic_context(state, config)

    print(f"Topics: {topics}")
    print(f"Topic Candidates: {topic_candidates}")

    # Get meeting info
    meeting_info = state.get("meeting_info")
    meeting_title = meeting_info.title if meeting_info else ""
    meeting_summary = meeting_info.summary if meeting_info else ""

    # Get transcript segments for formatting examples
    transcript_segments = state.get("transcript_segments", [])

    # Format candidate topics with their examples
    candidate_topics_str = format_candidate_topics_with_examples(
        topic_candidates,
        topics,
        transcript_segments,
        config.pipeline.max_topic_examples,
    )

    # Format ongoing topic (topic assigned to previous chunks before this one)
    ongoing_topic_info = "No topic assigned yet (this is the first substantive chunk)."
    ongoing_topic_id = state.get("current_topic_id")
    if ongoing_topic_id and ongoing_topic_id in topics:
        ongoing_topic = topics[ongoing_topic_id]
        ongoing_topic_info = f"{ongoing_topic.name} (ID: {ongoing_topic_id}): {ongoing_topic.description}"

    # Build few-shot examples string
    examples_str = build_few_shot_examples_string("topic_detector")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt - template already has {examples} placeholder
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", TOPIC_DETECTOR_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(TopicDetectorOutput)
    chain = prompt | structured_llm

    result: TopicDetectorOutput = chain.invoke(
        {
            "domain_context": config.pipeline.domain_context,
            "meeting_title": meeting_title or "Not yet determined",
            "meeting_summary": meeting_summary or "No summary yet.",
            "ongoing_topic_info": ongoing_topic_info,
            "transcript_chunk": state["transcript_chunk"],
            "last_n_chunks": last_n_chunks_str,
            "candidate_topics_info": candidate_topics_str,
            "similarity_threshold": config.pipeline.topic_similarity_threshold,
            "context_window_size": config.pipeline.context_window_size,
            "max_topic_examples": config.pipeline.max_topic_examples,
            "examples": examples_str,
        }
    )

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
            # Topic not found, fall back to creating new topic
            result.action = TopicAction.CREATE_TOPIC
            result.topic_name = result.topic_name or "Unnamed Topic"
            result.topic_description = result.topic_description or ""

    if result.action == TopicAction.CREATE_TOPIC:
        # Create transcript segment
        segment = TranscriptSegment(
            text=state["transcript_chunk"],
            speaker=state.get("current_speaker"),
            topic_id=None,  # Will be set after topic creation
        )
        
        # Create new topic with first segment
        new_topic = Topic(
            name=result.topic_name or "Unnamed Topic",
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

    # Update transcript store with this chunk
    transcript_store = TranscriptStore.get_instance()
    if transcript_store:
        current_topic_id = updates.get("current_topic_id")
        segments = updates.get("transcript_segments", [])
        if segments:
            latest_segment = segments[-1] if segments else None
            if latest_segment:
                transcript_store.add_chunk(
                    chunk_id=latest_segment.id,
                    text=latest_segment.text,
                    topic_id=current_topic_id,
                    speaker=latest_segment.speaker,
                )

    return updates
