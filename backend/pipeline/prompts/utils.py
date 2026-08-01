"""
Prompt Utilities

Utilities for loading few-shot examples and building formatted prompt strings.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


# Path to few-shot examples file
FEW_SHOT_EXAMPLES_PATH = Path(__file__).parent / "few_shot_examples.json"


def load_few_shot_examples(agent_name: str) -> List[Dict[str, Any]]:
    """
    Load few-shot examples for a specific agent.

    Args:
        agent_name: Name of the agent (e.g., 'procedural_check', 'topic_detector')

    Returns:
        List of example dictionaries
    """
    if not FEW_SHOT_EXAMPLES_PATH.exists():
        return []

    with open(FEW_SHOT_EXAMPLES_PATH, "r") as f:
        data = json.load(f)

    return data.get(agent_name, [])


def get_system_instruction(current_date: str) -> str:
    """
    Get the formatted system instruction with current date.

    Args:
        current_date: Current date string in YYYY-MM-DD format

    Returns:
        Formatted system instruction ready to use in prompts
    """
    from prompts.templates import SYSTEM_INSTRUCTION

    return SYSTEM_INSTRUCTION.format(current_date=current_date)


def get_last_n_chunks(
    transcript_segments: List[Any],
    n: int,
    include_speaker: bool = True,
) -> str:
    """
    Extract and format the last N transcript chunks for agent context.

    Args:
        transcript_segments: List of TranscriptSegment objects
        n: Number of recent chunks to include
        include_speaker: Whether to include speaker information

    Returns:
        Formatted string with last N chunks
    """
    if not transcript_segments:
        return "No previous chunks in this conversation."

    # Get last N segments
    last_n_segments = (
        transcript_segments[-n:]
        if len(transcript_segments) >= n
        else transcript_segments
    )

    # Format each segment
    formatted_chunks = []
    for segment in last_n_segments:
        if include_speaker and segment.speaker:
            formatted_chunks.append(f"{segment.speaker}: {segment.text}")
        else:
            formatted_chunks.append(segment.text)

    return (
        "\n".join(formatted_chunks)
        if formatted_chunks
        else "No previous chunks in this conversation."
    )


def build_few_shot_examples_string(
    agent_name: str,
    max_examples: int = 5,
) -> str:
    """
    Build a formatted few-shot examples string for an agent.

    Args:
        agent_name: Name of the agent
        max_examples: Maximum number of examples to include

    Returns:
        Formatted examples string ready to be inserted into prompt
    """
    examples = load_few_shot_examples(agent_name)

    if not examples:
        return ""

    lines = []
    for i, ex in enumerate(examples[:max_examples], 1):
        lines.append(f"Example {i}:")

        # Format input
        input_data = ex.get("input", {})
        if isinstance(input_data, dict):
            for key, value in input_data.items():
                value_str = (
                    str(value)[:80] + "..." if len(str(value)) > 80 else str(value)
                )
                lines.append(f'Input {key}: "{value_str}"')
        else:
            lines.append(f'Input: "{input_data}"')

        # Format output
        output_data = ex.get("output", {})
        lines.append(f"Output: {json.dumps(output_data, indent=2)}")
        lines.append("")

    return "\n".join(lines)
