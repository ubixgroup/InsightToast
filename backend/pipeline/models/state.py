"""
Shared state models for the RAG pipeline.

The state is passed through all nodes in the LangGraph and serves as
the shared memory between agents.

IMPORTANT: We use a SINGLE state type (RAGPipelineState) throughout the entire
pipeline, including subgraphs. The Send API automatically creates separate
instances for parallel execution, so there's no need for separate state types.
"""

from __future__ import annotations

import operator
import uuid
from datetime import datetime
from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langchain_core.documents import Document
from pydantic import BaseModel, Field, ConfigDict

# Import models (no circular imports since these don't import from state)
from models.topics import Topic
from models.insights import Insight, InsightThread


# =============================================================================
# QUERY MODEL
# =============================================================================


class RetrievalMetrics(BaseModel):
    """IR evaluation metrics for retrieval performance."""

    # Precision@K: fraction of retrieved docs above relevance threshold
    precision_at_k: float = Field(
        ..., description="Precision@K (relevant docs / total retrieved docs)"
    )

    # Mean Reciprocal Rank: 1/rank of first highly relevant document
    mrr: float = Field(
        ...,
        description="Mean Reciprocal Rank (1/rank of first doc with relevance >= 0.8)",
    )

    # Normalized Discounted Cumulative Gain@K
    ndcg_at_k: float = Field(
        ..., description="Normalized Discounted Cumulative Gain@K"
    )

    # Mean Average Precision@K
    map_at_k: float = Field(..., description="Mean Average Precision@K")

    # Additional metrics
    total_retrieved: int = Field(..., description="Total documents retrieved")
    relevant_count: int = Field(
        ..., description="Number of documents above relevance threshold"
    )
    avg_relevance_score: float = Field(
        ..., description="Average relevance score across all retrieved docs"
    )

    # Timing metrics (milliseconds)
    embedding_time_ms: float = Field(..., description="Time for embedding generation")
    search_time_ms: float = Field(..., description="Time for Qdrant search")
    feedback_time_ms: float = Field(
        ..., description="Time for retriever feedback evaluation"
    )
    total_time_ms: float = Field(..., description="Total retrieval time")


class Query(BaseModel):
    """A query for retrieval from the knowledge base."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # The query text
    text: str = Field(..., description="The query text for semantic search")

    # Hypothetical response for HyDE retrieval technique (optional)
    hypothetical_response: Optional[str] = Field(
        None,
        description="A hypothetical answer/insight that would satisfy this query (used for HyDE embedding)",
    )

    # Source context
    source_transcript: str = Field(
        default="", description="The transcript segment this query was generated from"
    )

    # Suggested insight types (can be text, visualization, or both)
    suggested_insight_types: List[str] = Field(
        default_factory=list,
        description="Types of insights suggested: 'text' and/or 'visualization'",
    )

    # Retrieval state (populated during retrieval subgraph execution)

    # List of documents retrieved for this query (keyed by document _id in documents metadata)
    retrieved_documents: Dict[str, Document] = Field(
        default_factory=dict,
        description="Documents retrieved for this query (keyed by document _id)",
    )
    attempted_queries: List[AttemptedQuery] = Field(
        default_factory=list, description="History of retrieval attempts for this query"
    )
    iteration_count: int = Field(
        default=0, description="Number of retrieval iterations performed"
    )
    retrieval_feedback: Optional[str] = Field(
        None, description="Feedback from retriever_feedback agent for query refinement"
    )
    retriever_feedback_action: Optional[str] = Field(
        None,
        description="Action decided by retriever_feedback: refine_query, expand_chunks, or proceed_to_insight_generation",
    )

    # IR evaluation metrics
    retrieval_metrics: Optional[RetrievalMetrics] = Field(
        None, description="Information retrieval evaluation metrics"
    )


# =============================================================================
# INPUT MODELS
# =============================================================================


class TranscriptInput(BaseModel):
    """Input model for transcript chunks with metadata."""

    content: str = Field(..., description="The transcript text content")
    speaker: Optional[str] = Field(None, description="Speaker identifier if available")

    model_config = ConfigDict(frozen=True)  # Make immutable for safety


# =============================================================================
# SUPPORTING MODELS
# =============================================================================


class TranscriptSegment(BaseModel):
    """A segment of the conversation transcript."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str = Field(..., description="The transcript text content")
    timestamp: datetime = Field(default_factory=datetime.now)
    speaker: Optional[str] = Field(None, description="Speaker identifier if available")
    topic_id: Optional[str] = Field(
        None, description="Associated topic ID if classified"
    )

    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


class AttemptedQuery(BaseModel):
    """Record of a retrieval attempt."""

    search_query: str = Field(..., description="The search query used")
    document_types: List[str] = Field(
        default_factory=list, description="Document types filtered"
    )
    date_range: Optional[str] = Field(None, description="Date range applied (if any)")
    sessions: List[str] = Field(default_factory=list, description="Sessions filtered")
    top_k: int = Field(..., description="Number of documents requested")
    docs_retrieved: int = Field(
        default=0, description="Number of documents actually retrieved"
    )


class MeetingInfo(BaseModel):
    """Information about the current meeting/conversation."""

    title: str = Field(default="", description="The meeting title/subject")
    summary: str = Field(default="", description="Running summary of the meeting")
    key_values: Dict[str, str] = Field(
        default_factory=dict,
        description="Key-value pairs of important canonical information",
    )
    last_updated: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})


# =============================================================================
# REDUCER FUNCTIONS
# =============================================================================


def reduce_documents(existing: List[Document], new: List[Document]) -> List[Document]:
    """
    Reducer for merging retrieved documents without duplicates.
    Deduplicates by page_content.
    """
    if not existing:
        return new

    existing_contents = {doc.page_content for doc in existing}
    merged = list(existing)

    for doc in new:
        if doc.page_content not in existing_contents:
            merged.append(doc)
            existing_contents.add(doc.page_content)

    return merged


def reduce_queries(existing: List[Query], new: List[Query]) -> List[Query]:
    """
    Reducer for merging query results from parallel retrieval subgraphs.

    Matches queries by ID and merges their retrieval state (documents, attempts, etc.).
    This is called after each retrieval subgraph completes to aggregate results.
    """
    if not existing:
        return new

    # Create a mapping of existing queries by ID
    existing_map = {q.id: q for q in existing}

    # Merge new query results into existing
    for new_query in new:
        if new_query.id in existing_map:
            # Merge retrieval state from subgraph execution
            existing_query = existing_map[new_query.id]

            # Merge documents
            for doc_id, doc in new_query.retrieved_documents.items():
                if doc_id not in existing_query.retrieved_documents:
                    existing_query.retrieved_documents[doc_id] = doc

            # Merge attempted queries
            existing_query.attempted_queries = (
                existing_query.attempted_queries + new_query.attempted_queries
            )

            # Update other retrieval state (take latest from subgraph)
            existing_query.iteration_count = new_query.iteration_count
            existing_query.retrieval_feedback = new_query.retrieval_feedback
            existing_query.retriever_feedback_action = (
                new_query.retriever_feedback_action
            )
        else:
            # New query not seen before, add it
            existing.append(new_query)

    return existing


def reduce_dict_by_id(existing: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generic reducer for dict state fields containing entities with ID keys.

    Merges new entities into existing dict by ID:
    - If ID exists in existing dict: replace with new value
    - If ID doesn't exist: add as new entry

    This allows nodes to return only modified/new entities instead of the entire dict.
    Used for: topics, insights, insight_threads

    Args:
        existing: Current state dict
        new: Dict containing only new/modified entities

    Returns:
        Merged dict with all entities
    """
    if not existing:
        return new

    # Copy existing dict
    merged = existing.copy()

    # Merge new entities (update existing or add new)
    for entity_id, entity_value in new.items():
        merged[entity_id] = entity_value

    return merged


# =============================================================================
# MAIN STATE
# =============================================================================


class RAGPipelineState(TypedDict, total=False):
    """
    This TypedDict is used by both the main graph and subgraphs.

    Notes on reducers:
    - Fields without annotations are simple replacements (last write wins)
    - Fields with Annotated[..., operator.add] or Annotated[..., reducer_fn]
      use reducers to merge values from parallel executions
    - Subgraphs share the same state schema but get their own instances via Send()
    """

    # =========================================================================
    # SHARED CONTEXT (Available to all nodes)
    # =========================================================================

    # Input - the new transcript chunk to process
    transcript_chunk: str
    current_speaker: Optional[str]  # Speaker of the current transcript chunk

    # Procedural check results
    is_procedural: bool  # Whether chunk is procedural/filler
    procedural_reasoning: Optional[str]  # Explanation for procedural decision

    # Topic detection results
    topic_action: Optional[
        str
    ]  # Action from topic_detector: "ASSIGN_TOPIC" or "CREATE_TOPIC"

    # Full transcript history with topic assignments
    transcript_segments: Annotated[List[TranscriptSegment], operator.add]

    # Meeting-level information
    meeting_info: MeetingInfo

    # Topics being tracked in the conversation
    current_topic_id: Optional[str]
    topics: Annotated[Dict[str, Topic], reduce_dict_by_id]  # topic_id -> Topic

    # All generated insights
    insights: Annotated[Dict[str, Insight], reduce_dict_by_id]  # insight_id -> Insight

    # Insight threads
    insight_threads: Annotated[
        Dict[str, InsightThread], reduce_dict_by_id
    ]  # thread_id -> InsightThread

    # Insight need assessment results
    insight_needed: Optional[bool]  # Whether an insight is needed for current chunk
    insight_need_reasoning: Optional[str]  # Reasoning for insight need decision

    # Insight search results (from related_insight_finder)
    insight_search_queries: Optional[List[str]]  # Queries used to search for related insights (list of hypothetical insights)
    selected_thread_id: Optional[str]  # Thread ID to assign new insight to
    selected_related_insight: Optional[
        Insight
    ]  # Related insight found (for future use in query_constructor)

    # =========================================================================
    # QUERY GENERATION (Main graph)
    # =========================================================================

    # Queries generated from the current transcript chunk (with reducer to merge retrieval results)
    queries: Annotated[List[Query], reduce_queries]

    # =========================================================================
    # INSIGHT GENERATION (Main graph)
    # =========================================================================

    insight_selection_reasoning: Optional[
        str
    ]  # Reasoning for insight selection decision

    # Generator assignments from insight_selector (for Send API spawning)
    generator_assignments: List[
        Dict[str, Any]
    ]  # List of {generator_type, query_ids, reasoning}

    # Queries assigned to current generator (passed via Send payload)
    queries_for_generation: List[Query]

    # Viz planning (passed from viz_planner to viz_generator)
    viz_plan: Optional[Any]  # VizInsightOutput from viz_planner
    viz_retrieved_documents: Dict[str, Any]  # Documents for viz citation extraction

    # =========================================================================
    # PER-QUERY PROCESSING (Subgraph - each Send() instance has its own copy)
    # =========================================================================

    # Current query being processed (set by Send())
    # Uses overwrite reducer to handle updates in retrieval feedback loop
    query: Annotated[Query, lambda x, y: y]
    query_index: Annotated[int, lambda x, y: y]  # For logging only, overwrite reducer
    total_queries: Annotated[int, lambda x, y: y]  # For logging only, overwrite reducer

    # Internal retriever feedback state (for conditional edges within retrieval subgraph)
    retriever_feedback_action: Annotated[Optional[str], lambda x, y: y]
    retriever_feedback_refinement_reasoning: Annotated[Optional[str], lambda x, y: y]

    # Control flags
    should_halt: bool  # Set by topic_router if chunk should not be processed

    # Metadata
    processing_started: Optional[datetime]
    processing_completed: Optional[datetime]


# =============================================================================
# STATE FIELD CATEGORIZATION
# =============================================================================

# Fields that persist across chunks (accumulated conversation state)
PERSISTENT_FIELDS = {
    "transcript_segments",
    "meeting_info",
    "topics",
    "current_topic_id",
    "insights",
    "insight_threads",
}

# Fields that are reset for each new chunk (transient processing state)
TRANSIENT_FIELDS = {
    "transcript_chunk",
    "current_speaker",
    "is_procedural",
    "procedural_reasoning",
    "topic_action",
    "insight_needed",
    "insight_need_reasoning",
    "insight_search_queries",
    "selected_thread_id",
    "selected_related_insight",
    "queries",
    "query",
    "query_index",
    "total_queries",
    "retriever_feedback_action",
    "generator_assignments",
    "queries_for_generation",
    "viz_plan",
    "error",
    "processing_started",
    "processing_completed",
    "halt",
    "procedural_check",
    "should_halt",
    "insight_selection_reasoning",
    "retriever_feedback_refinement_reasoning",
    "messages",
}


def _get_default_value(field_name: str) -> Any:
    """Get the default value for a field based on its type/name."""
    # Special cases
    if field_name == "meeting_info":
        return MeetingInfo()
    elif field_name == "is_procedural":
        return False
    elif (
        field_name == "query_index"
        or field_name == "total_queries"
        or field_name == "iteration_count"
    ):
        return 0
    # Default to None for scalars, [] for lists, {} for dicts
    elif "_ids" in field_name or field_name in {
        "queries",
        "last_n_chunks",
        "retrieved_documents",
        "attempted_queries",
        "queries_for_generation",
        "generator_assignments",
        "transcript_segments",
    }:
        return []
    elif field_name in {"topics", "insights", "insight_threads"}:
        return {}
    else:
        return None


def create_initial_state(
    transcript_input: TranscriptInput,
    existing_state: Optional[Dict[str, Any]] = None,
) -> RAGPipelineState:
    """
    Create an initial state for a pipeline run.

    Uses explicit field categorization to ensure consistency:
    - PERSISTENT_FIELDS: Preserved across chunks (accumulated state)
    - TRANSIENT_FIELDS: Reset for each new chunk (processing state)

    Defaults are inferred from field names/types to avoid redundancy.

    Args:
        transcript_input: The transcript input with content and speaker
        existing_state: Optional previous state to continue from

    Returns:
        RAGPipelineState ready for processing
    """
    new_state = RAGPipelineState()

    # Set new input
    new_state["transcript_chunk"] = transcript_input.content
    new_state["current_speaker"] = transcript_input.speaker
    new_state["processing_started"] = datetime.now()

    if existing_state:
        # PRESERVE persistent fields from existing state
        for field in PERSISTENT_FIELDS:
            new_state[field] = existing_state.get(field, _get_default_value(field))

        # RESET transient fields to defaults
        for field in TRANSIENT_FIELDS:
            if field not in {
                "transcript_chunk",
                "current_speaker",
                "processing_started",
                "messages"
            }:
                new_state[field] = _get_default_value(field)

        # Validation: Check for fields in existing_state that aren't categorized
        uncategorized = (
            set(existing_state.keys()) - PERSISTENT_FIELDS - TRANSIENT_FIELDS
        )
        if uncategorized:
            import warnings

            warnings.warn(
                f"State fields not categorized: {uncategorized}. "
                f"Add to PERSISTENT_FIELDS or TRANSIENT_FIELDS in models/state.py"
            )
    else:
        # Fresh start - initialize all fields with defaults
        for field in PERSISTENT_FIELDS:
            new_state[field] = _get_default_value(field)

        for field in TRANSIENT_FIELDS:
            if field not in {
                "transcript_chunk",
                "current_speaker",
                "processing_started",
                "messages",
            }:
                new_state[field] = _get_default_value(field)

    return new_state
