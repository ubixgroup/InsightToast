"""
Multi-Agentic RAG Pipeline for Parliamentary Decision Support.

This module provides a LangGraph-based pipeline that processes real-time
conversation transcripts, extracts topics, generates queries, retrieves
relevant parliamentary documents, and produces insights with inline citations.

Usage:
    from pipeline import create_conversation, process_single_chunk, TranscriptInput

    # For ongoing conversations:
    manager = create_conversation()
    result = manager.process_transcript(TranscriptInput(content="Transcript chunk here..."))

    # For single chunk processing:
    result = process_single_chunk(TranscriptInput(content="Transcript chunk here..."))
"""

import sys
from pathlib import Path

_PIPELINE_DIR = str(Path(__file__).resolve().parent)
if _PIPELINE_DIR not in sys.path:
    sys.path.insert(0, _PIPELINE_DIR)

from config import RAGConfig, get_default_config
from graph import create_rag_pipeline
from models.state import RAGPipelineState, TranscriptInput
from run import (
    ConversationManager,
    PipelineOutput,
    create_conversation,
    process_single_chunk,
)

__all__ = [
    "RAGConfig",
    "get_default_config",
    "create_rag_pipeline",
    "RAGPipelineState",
    "TranscriptInput",
    "ConversationManager",
    "PipelineOutput",
    "create_conversation",
    "process_single_chunk",
]
