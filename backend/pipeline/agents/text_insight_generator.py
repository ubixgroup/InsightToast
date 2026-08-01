"""
Text Insight Generator Agent

Generates succinct, informative text insights with inline citations
from the retrieved documents.

UPDATED: Now uses generalized document formatting with [doc_id] citations.
Maximum 280 characters for insight text (excluding citations).
"""

from __future__ import annotations

import json
import re
import uuid
from datetime import datetime
from typing import Any, Dict, List

from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, Query
from models.insights import TextInsight, InsightThread, filter_metadata_for_llm
from prompts.templates import TEXT_INSIGHT_GENERATOR_PROMPT
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)
from services.llm import get_llm


def strip_citations(text: str) -> str:
    """
    Remove inline UUID-style citations [doc_id] from text for embedding.

    Uses specific regex to match UUID v4 format:
    [xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx] where x is a hex digit.

    Args:
        text: Text with potential inline citations

    Returns:
        Text with citations removed and extra whitespace cleaned
    """
    # Match UUID v4 format citations: [8-4-4-4-12 hex digits]
    pattern = r"\[[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\]"
    cleaned = re.sub(pattern, "", text, flags=re.IGNORECASE)
    # Clean up multiple spaces and strip
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def format_documents_with_metadata(docs: List[Document], config: RAGConfig) -> str:
    """
    Format documents with metadata for the generator (generalized approach).

    Includes:
    - Document ID (for citations)
    - All metadata (filtered based on config)
    - Full document content

    Args:
        docs: List of retrieved documents
        config: RAG configuration with metadata filtering settings

    Returns:
        Formatted string with documents and their metadata
    """
    if not docs:
        return "No documents available."

    formatted = []

    for doc in docs:
        metadata = doc.metadata

        # Get doc ID from metadata (_id field)
        doc_id = metadata.get("_id")
        # print(f"[TEXT INSIGHT GENERATOR] Formatting document with ID: {doc_id}")
        if not doc_id:
            continue

        # Filter metadata
        filtered_metadata = filter_metadata_for_llm(metadata, config)

        # Format metadata as key-value pairs
        metadata_lines = []
        for key, value in filtered_metadata.items():
            metadata_lines.append(f"  {key}: {value}")

        metadata_str = (
            "\n".join(metadata_lines) if metadata_lines else "  (no metadata)"
        )

        formatted.append(
            f"### [NEXT DOCUMENT] ###\n"
            f"Doc ID (THIS IS THE ID THAT YOU SHOULD CITE IF YOU USE THIS DOCUMENT): {doc_id}\n"
            f"Metadata:\n{metadata_str}\n"
            f"Content:\n{doc.page_content}\n"
            f"---"
        )

    if not formatted:
        return "No citable documents available."

    return "\n\n".join(formatted)


class TextInsightOutput(BaseModel):
    """Structured output from the text insight generator."""

    title: str = Field(
        ...,
        description="Short title for the insight (max 5 words).",
    )
    content: str = Field(
        ...,
        description="The insight text with [doc_id] citations. Maximum 280 characters (excluding citations).",
    )
    cited_document_ids: List[str] = Field(
        default_factory=list, description="List of document IDs cited in this insight"
    )


def text_insight_generator_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Text Insight Generator node for generating ONE insight from multiple queries.

    Accepts multiple complementary queries and generates a single text insight
    using all retrieved documents from all queries.

    Returns:
        Updated state with insights, insight_threads, and topics dicts updated
    """
    config = config or get_default_config()
    llm = get_llm("text_insight_generator", config)

    # Get queries for generation
    queries_for_generation = state.get("queries_for_generation", [])
    if not queries_for_generation:
        return {}  # No queries provided

    # Merge all retrieved documents from all queries
    # retrieved_documents is now a dict keyed by _id
    all_docs_dict = {}
    for query in queries_for_generation:
        for doc_id, doc in query.retrieved_documents.items():
            if doc_id not in all_docs_dict:
                all_docs_dict[doc_id] = doc

    if not all_docs_dict:
        return {}  # No documents to generate insight from

    # Convert to list for formatting
    all_docs = list(all_docs_dict.values())

    # Get context
    current_topic_id = state.get("current_topic_id")
    topics = state.get("topics", {})
    current_topic = topics.get(current_topic_id) if topics else None

    # Format documents with generalized approach
    documents_formatted = format_documents_with_metadata(all_docs, config)

    # Get transcript context
    transcript_chunk = state.get("transcript_chunk")
    current_speaker = state.get("current_speaker")

    formatted_current_chunk = (
        f"{current_speaker}: {transcript_chunk}"
        if current_speaker
        else transcript_chunk
    )

    # Get last N chunks for context
    n_chunks = config.pipeline.context_window_size
    transcript_segments = state.get("transcript_segments", [])
    last_n_chunks_str = get_last_n_chunks(
        transcript_segments, n_chunks, include_speaker=True
    )

    # Get last N session insights for context (replaces deprecated selected_related_insight)
    insights_dict = state.get("insights", {})
    n_insights = config.pipeline.insight_context_window_size
    sorted_recent = sorted(
        insights_dict.items(),
        key=lambda x: x[1].created_at,
        reverse=True,
    )
    formatted_last_n_insights = []
    for _, insight in sorted_recent[:n_insights]:
        if hasattr(insight, "content"):
            title_str = (
                f"[Title: {insight.title}] " if getattr(insight, "title", "") else ""
            )
            insight_text = f"[TEXT] {title_str}{insight.content}"
        elif hasattr(insight, "chart_type"):
            parts = [f"[VIZ: {insight.chart_type}]"]
            if getattr(insight, "chart_title", ""):
                parts.append(f"Title: {insight.chart_title}")
            if getattr(insight, "subtitle", ""):
                parts.append(f"Subtitle: {insight.subtitle}")
            if getattr(insight, "explanation", ""):
                parts.append(insight.explanation)
            data = getattr(insight, "data", None)
            if data and isinstance(data, list) and len(data) > 0:
                fields = list(data[0].keys()) if isinstance(data[0], dict) else []
                parts.append(f"Data: {len(data)} rows, fields={fields}")
            insight_text = " | ".join(parts)
        else:
            insight_text = "Insight generated."
        formatted_last_n_insights.append(insight_text)
    last_n_insights_str = (
        "\n".join(formatted_last_n_insights)
        if formatted_last_n_insights
        else "No previous insights in this session."
    )

    # Format topic context
    topic_context = "Not assigned"
    if current_topic:
        topic_context = (
            f"{current_topic.name}: {current_topic.description}"
            if current_topic.description
            else current_topic.name
        )

    # Get meeting context
    meeting_info = state.get("meeting_info")
    meeting_title = meeting_info.title if meeting_info else "Not yet determined"
    meeting_summary = meeting_info.summary if meeting_info else "No summary yet."
    key_values_json = (
        json.dumps(meeting_info.key_values, indent=2)
        if meeting_info and meeting_info.key_values
        else "{}"
    )

    # Build few-shot examples
    examples = build_few_shot_examples_string("text_insight_generator")

    # Get system instruction
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", TEXT_INSIGHT_GENERATOR_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(TextInsightOutput)
    chain = prompt | structured_llm

    result: TextInsightOutput = chain.invoke(
        {
            "domain_context": config.pipeline.domain_context,
            "current_topic": topic_context,
            "meeting_title": meeting_title,
            "meeting_summary": meeting_summary,
            "key_values_json": key_values_json,
            "transcript_chunk": formatted_current_chunk,
            "last_n_chunks": last_n_chunks_str,
            "n_chunks": n_chunks,
            "query_texts": " | ".join([q.text for q in queries_for_generation]),
            "documents_with_metadata": documents_formatted,
            "last_n_insights": last_n_insights_str,
            "examples": examples,
        }
    )

    # ========================================================================
    # DEPRECATED: Citation parsing - now handled by frontend
    # ========================================================================
    # The following code was used to parse [[doc_id]] citations and create
    # Citation objects. This is now delegated to the frontend.
    #
    # # Parse citations from the content
    # citation_data = parse_citations(result.content)
    #
    # # Build Citation objects
    # citations = []
    # for cit_info in citation_data:
    #     if cit_info["type"] == "source":
    #         doc_id = cit_info["key"]
    #
    #         # Find matching document
    #         matching_doc = None
    #         for doc in all_docs:
    #             if generate_citation_key(doc) == doc_id:
    #                 matching_doc = doc
    #                 break
    #
    #         if matching_doc:
    #             # Create Citation object with metadata
    #             citations.append(Citation(...))
    # ========================================================================

    # Extract cited document IDs from content
    # Pattern: [doc_id] format
    cited_ids = re.findall(r"\[([^\]]+)\]", result.content)

    # Get the source chunk ID (latest transcript segment)
    transcript_segments = state.get("transcript_segments", [])
    source_chunk_id = transcript_segments[-1].id if transcript_segments else None

    # === THREAD HANDLING ===
    # Get selected_thread_id from state (from related_insight_finder)
    selected_thread_id = state.get("selected_thread_id")
    new_thread_created = False

    # If no thread selected, create a new thread
    if not selected_thread_id:
        selected_thread_id = f"thread_{str(uuid.uuid4())}"
        new_thread_created = True

    # Use first query for metadata (all queries are complementary)
    primary_query = queries_for_generation[0]

    # Merge retrieved documents from all queries for source extraction
    all_retrieved_docs = {}
    for query in queries_for_generation:
        retrieved = getattr(query, "retrieved_documents", {}) or {}
        all_retrieved_docs.update(retrieved)

    # Extract cited document IDs
    final_cited_ids = (
        result.cited_document_ids if result.cited_document_ids else cited_ids
    )

    # Create cited documents with sources
    from models.insights import create_cited_documents

    cited_docs = create_cited_documents(
        document_ids=final_cited_ids,
        retrieved_documents=all_retrieved_docs,
        config=config,
    )

    # Create insight
    insight = TextInsight(
        query_id=primary_query.id,
        query_text=primary_query.text,
        topic_id=current_topic_id,
        source_chunk_id=source_chunk_id,
        thread_id=selected_thread_id,
        title=result.title,
        content=result.content,
        cited_documents=cited_docs,
    )

    # DEPRECATED: InsightStore removed — only used by the broken related_insight_finder pipeline
    # from services.insight_store import InsightStore
    # insight_store = InsightStore.get_instance()
    # if insight_store:
    #     text_for_embedding = strip_citations(insight.content)
    #     insight_store.add_insight(
    #         insight_id=insight.id,
    #         text=text_for_embedding,
    #         thread_id=selected_thread_id,
    #         topic_id=current_topic_id,
    #         metadata={
    #             "query_id": primary_query.id,
    #             "query_text": primary_query.text,
    #             "source_chunk_id": source_chunk_id,
    #         },
    #     )

    # Build return dict with ONLY modified entities
    updates = {
        "insights": {insight.id: insight},  # Only the new insight
    }

    # Update InsightThread
    insight_threads = state.get("insight_threads", {})
    if new_thread_created:
        new_thread = InsightThread(
            id=selected_thread_id,
            insight_ids=[insight.id],
            topic_id=current_topic_id,
        )
        updates["insight_threads"] = {selected_thread_id: new_thread}

        # Add thread to topic - create a copy with updated thread list
        if current_topic:
            # Create a copy using model_copy()
            updated_topic = current_topic.model_copy(deep=True)
            if selected_thread_id not in updated_topic.thread_ids:
                updated_topic.thread_ids.append(selected_thread_id)
                updated_topic.updated_at = datetime.now()
                updates["topics"] = {current_topic_id: updated_topic}
    else:
        # Add to existing thread - create a copy
        if selected_thread_id in insight_threads:
            thread = insight_threads[selected_thread_id]
            # Create a copy using model_copy()
            updated_thread = thread.model_copy(deep=True)
            updated_thread.insight_ids.append(insight.id)
            updates["insight_threads"] = {selected_thread_id: updated_thread}

    # Return state updates (only modified entities)
    return updates
