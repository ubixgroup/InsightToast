"""
Insight-related models for the RAG pipeline.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# Import RAGConfig only for type hints to avoid circular imports
# from typing import TYPE_CHECKING
# if TYPE_CHECKING:
from config import RAGConfig


class InsightType(str, Enum):
    """Types of insights that can be generated."""

    TEXT = "text"
    VIZ = "viz"


class CitedDocument(BaseModel):
    """A cited document with its source URL."""

    document_id: str = Field(..., description="Document ID")
    source_url: Optional[str] = Field(
        None, description="Source URL extracted from metadata"
    )


def filter_metadata_for_llm(
    metadata: Dict[str, Any], config: "RAGConfig"
) -> Dict[str, Any]:
    """
    Filter out unwanted metadata fields before passing to LLM.

    Removes:
    1. Fields specified in config.pipeline.filtered_metadata_fields
    2. Vector store internals (_id, score, vector, embedding)

    Args:
        metadata: Document metadata dictionary
        config: RAG configuration with filtered_metadata_fields

    Returns:
        Filtered metadata dictionary
    """
    # Fields to always filter (vector store internals)
    always_filter = {"_id", "score", "vector", "embedding"}

    # Get configurable filter list
    config_filters = set(config.pipeline.filtered_metadata_fields) if config else set()

    # Combine both filter sets
    fields_to_filter = always_filter | config_filters

    # Return filtered dict
    return {k: v for k, v in metadata.items() if k not in fields_to_filter}


def extract_document_source(
    document_id: str, metadata: Dict[str, Any], config: RAGConfig
) -> Optional[str]:
    """
    Extract source URL from document metadata based on priority list.

    Special cases:
    - minutes_url: Replace /minutes with /evidence

    Args:
        document_id: The document ID
        metadata: Document metadata dictionary
        config: RAG configuration with source_fields priority

    Returns:
        Source URL if found, None otherwise
    """
    for field in config.pipeline.document_source_fields:
        if field in metadata and metadata[field]:
            source = metadata[field]

            # Special case: minutes_url -> replace /minutes with /evidence
            if field == "minutes_url" and "/minutes" in source:
                source = source.replace("/minutes", "/evidence")

            return source

    return None


def create_cited_documents(
    document_ids: List[str], retrieved_documents: Dict[str, Any], config: RAGConfig
) -> List[CitedDocument]:
    """
    Create list of CitedDocument objects with sources extracted from metadata.

    Args:
        document_ids: List of cited document IDs
        retrieved_documents: Dict mapping doc_id -> Document object (from langchain)
        config: RAG configuration

    Returns:
        List of CitedDocument objects with sources
    """
    cited_docs = []
    for doc_id in document_ids:
        doc = retrieved_documents.get(doc_id)

        if not doc:
            # Document not found - append with null source
            cited_docs.append(CitedDocument(document_id=doc_id, source_url=None))
            continue

        # Document is a langchain Document object with .metadata attribute
        metadata = doc.metadata if hasattr(doc, "metadata") else {}
        source_url = extract_document_source(doc_id, metadata, config)

        cited_docs.append(CitedDocument(document_id=doc_id, source_url=source_url))

    return cited_docs


# ============================================================================
# ACTIVE MODELS
# ============================================================================


class InsightThread(BaseModel):
    """A thread of related insights within a topic."""

    id: str = Field(..., description="Unique thread identifier")
    insight_ids: List[str] = Field(
        default_factory=list, description="List of insight IDs in this thread"
    )
    topic_id: str = Field(
        ..., description="Topic this thread belongs to (threads are topic-bound)"
    )


class Insight(BaseModel):
    """Base class for all insights."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    insight_type: InsightType = Field(..., description="Type of insight")

    # The query that led to this insight
    query_id: str = Field(
        ..., description="ID of the query that generated this insight"
    )
    query_text: str = Field(..., description="The original query text")

    # Topic association
    topic_id: Optional[str] = Field(None, description="Associated topic ID")

    # Thread association (insights are grouped in threads)
    thread_id: Optional[str] = Field(
        None, description="Thread ID this insight belongs to"
    )

    # Transcript chunk that triggered this insight
    source_chunk_id: Optional[str] = Field(
        None, description="ID of the transcript chunk that triggered this insight"
    )

    # Generation metadata
    created_at: datetime = Field(default_factory=datetime.now)

    # List of cited documents with source URLs
    cited_documents: List[CitedDocument] = Field(
        default_factory=list, description="List of cited documents with source URLs"
    )

    # Deprecated: kept for backwards compatibility, auto-populated from cited_documents
    @property
    def cited_document_ids(self) -> List[str]:
        """Get list of document IDs (for backwards compatibility)."""
        return [doc.document_id for doc in self.cited_documents]


class TextInsight(Insight):
    """A text-based insight with inline citations."""

    insight_type: InsightType = Field(default=InsightType.TEXT)

    # Short title for the insight (max 5 words)
    title: str = Field(
        default="", description="Short title for the insight (max 5 words)"
    )

    # The insight content with inline citations in [doc_id] format
    # Example: "Bill C-234 proposes exemptions [bill:43-2:C-234] and passed the House [vote:44-1:89]."
    content: str = Field(..., description="The insight text with [doc_id] citations")


class VizInsight(Insight):
    """A visualization-based insight."""

    insight_type: InsightType = Field(default=InsightType.VIZ)

    # Chart configuration
    chart_type: str = Field(
        ..., description="Type of chart: bar, line, pie, timeline, etc."
    )
    chart_title: str = Field(
        default="", description="Short title for the chart (max 5 words)"
    )
    subtitle: str = Field(
        default="",
        description="Short subtitle explaining the chart (1-2 sentences), displayed to the user alongside the chart",
    )

    # Data for the chart
    data: Dict[str, Any] = Field(
        default_factory=dict, description="Chart data in a structured format"
    )

    # Accessible text explanation (also with [doc_id] citations)
    explanation: str = Field(
        default="",
        description="Accessible text version of the visualization: prose description of what the chart shows, including key data points, trends, and conclusions — as if explaining it to someone who cannot see it.",
    )
