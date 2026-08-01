"""
Procedural Check Agent

Filters out procedural/filler content from transcript chunks.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, TranscriptSegment
from prompts.templates import INITIAL_CONTENT_FILTER
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)
from services.llm import get_llm


class ProceduralCheckOutput(BaseModel):
    """Structured output from the procedural check agent."""

    is_procedural: bool = Field(
        ...,
        description="True if the chunk is procedural/filler with no substantive content",
    )
    reasoning: str = Field(..., description="Brief explanation for the decision")


def initial_content_filter_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Procedural check node for the RAG pipeline.

    Analyzes the transcript chunk to determine if it contains substantive
    content or is merely procedural/filler.

    Returns:
        Updated state with is_procedural and procedural_reasoning
    """
    config = config or get_default_config()
    llm = get_llm("procedural_check", config)

    # Get last N chunks for context
    transcript_segments = state.get("transcript_segments", [])
    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=config.pipeline.context_window_size,
        include_speaker=True,
    )

    # Build few-shot examples string
    examples_str = build_few_shot_examples_string("procedural_check")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt with system instruction
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("user", INITIAL_CONTENT_FILTER),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(ProceduralCheckOutput)
    chain = prompt | structured_llm

    result: ProceduralCheckOutput = chain.invoke(
        {
            "domain_context": config.pipeline.domain_context,
            "transcript_chunk": state["transcript_chunk"],
            "last_n_chunks": last_n_chunks_str,
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
            "examples": examples_str,
        }
    )

    # Return updates
    updates = {
        "is_procedural": result.is_procedural,
        "procedural_reasoning": result.reasoning,
        "should_halt": result.is_procedural,  # Halt if procedural
    }

    # Add procedural chunk as topic-less segment for record-keeping
    if result.is_procedural:
        segment = TranscriptSegment(
            text=state["transcript_chunk"],
            speaker=state.get("current_speaker"),
            topic_id=None,  # No topic for procedural content
        )
        updates["transcript_segments"] = [segment]

    return updates
