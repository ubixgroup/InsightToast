"""
Topic-related models for the RAG pipeline.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import List

from pydantic import BaseModel, Field


class TopicAction(str, Enum):
    """Actions the topic router can take."""

    ASSIGN_TOPIC = "assign_topic"  # Assign chunk to existing topic
    CREATE_TOPIC = "create_topic"  # Create a new topic for this chunk


class Topic(BaseModel):
    """A topic being discussed in the conversation."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(
        ..., description="Short descriptive name of the topic (2-5 words)"
    )
    description: str = Field(
        default="", description="One paragraph description of what this topic covers"
    )

    # Example segments for few-shot learning in topic detection
    example_transcript_segment_ids: List[str] = Field(
        default_factory=list,
        description="IDs of example transcript segments for topic detection (max defined in config)",
    )

    # References to all segments in this topic
    transcript_segment_ids: List[str] = Field(
        default_factory=list,
        description="IDs of all transcript segments clustered under this topic",
    )
    thread_ids: List[str] = Field(
        default_factory=list,
        description="IDs of insight threads associated with this topic",
    )

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
