"""
Multi-Agentic RAG Pipeline for Parliamentary Decision Support.

This module provides a LangGraph-based pipeline that processes real-time
conversation transcripts, extracts topics, generates queries, retrieves
relevant parliamentary documents, and produces insights with inline citations.

Usage:
    from RAG import create_conversation, process_single_chunk

    # For ongoing conversations:
    manager = create_conversation()
    result = manager.process_transcript("Transcript chunk here...")

    # For single chunk processing:
    result = process_single_chunk("Transcript chunk here...")
"""

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
