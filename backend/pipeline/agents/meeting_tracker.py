"""
Meeting Tracker Agent

Tracks and updates meeting-level information:
- Problem/Title
- Summary
- Key-Value pairs of important information
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, MeetingInfo
from prompts.templates import MEETING_TRACKER_PROMPT
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)
from services.llm import get_llm


class MeetingTrackerOutput(BaseModel):
    """Structured output from the meeting tracker.

    Simplified to only track: title, summary (≤300 words), key_values (≤10).
    """

    title: Optional[str] = Field(
        None, description="The meeting title/subject. Leave null if no update."
    )
    summary: Optional[str] = Field(
        None,
        description="Updated summary incorporating new information (max 300 words). Leave null if no update.",
    )
    key_values: Dict[str, str] = Field(
        default_factory=dict,
        description="Key-value pairs of important information. Only include truly important canonical info.",
    )


def meeting_tracker_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Meeting Tracker node for the RAG pipeline.

    Tracks and updates meeting-level information from the transcript:
    - title: Meeting subject/title
    - summary: Running summary (max 300 words)
    - key_values: Important canonical information (max 10 items)

    Runs in parallel with topic_description_updater.

    Returns:
        Updated state with meeting info
    """
    config = config or get_default_config()
    llm = get_llm("meeting_tracker", config)

    # Get current meeting info
    meeting_info = state.get("meeting_info") or MeetingInfo()

    # Format key-values for prompt
    key_values_json = (
        json.dumps(meeting_info.key_values, indent=2)
        if meeting_info.key_values
        else "{}"
    )

    # Get current topic name
    current_topic_id = state.get("current_topic_id")
    topics = state.get("topics", {})
    current_topic = (
        topics.get(current_topic_id).name
        if current_topic_id and current_topic_id in topics
        else "Not assigned"
    )

    # Get last N chunks for context
    transcript_segments = state.get("transcript_segments", [])
    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=config.pipeline.context_window_size,
        include_speaker=True,
    )

    # Build few-shot examples string
    examples_str = build_few_shot_examples_string("meeting_tracker")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt - template already has {examples} placeholder
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", MEETING_TRACKER_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(MeetingTrackerOutput)
    chain = prompt | structured_llm

    result: MeetingTrackerOutput = chain.invoke(
        {
            "domain_context": config.pipeline.domain_context,
            "meeting_title": meeting_info.title or "Not yet determined",
            "meeting_summary": meeting_info.summary or "No summary yet.",
            "key_values_json": key_values_json,
            "transcript_chunk": state["transcript_chunk"],
            "current_topic": current_topic,
            "last_n_chunks": last_n_chunks_str,
            "max_summary_words": config.pipeline.max_summary_words,
            "max_key_values": config.pipeline.max_key_values,
            "examples": examples_str,
        }
    )

    # Track if any updates were made
    has_updates = False

    # Update title if provided
    if result.title:
        meeting_info.title = result.title
        has_updates = True

    # Update summary if provided
    if result.summary:
        meeting_info.summary = result.summary
        has_updates = True

    # Merge key-values (new values override existing)
    if result.key_values:
        meeting_info.key_values.update(result.key_values)
        has_updates = True

        # Enforce limit on key-values
        max_kv = config.pipeline.max_key_values
        if len(meeting_info.key_values) > max_kv:
            keys_to_keep = list(meeting_info.key_values.keys())[-max_kv:]
            meeting_info.key_values = {
                k: meeting_info.key_values[k] for k in keys_to_keep
            }

    return {
        "meeting_info": meeting_info,
        "meeting_updated": has_updates,
    }
