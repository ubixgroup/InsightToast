"""
Retriever Feedback Agent

Evaluates retrieved documents against the query and decides the next action:
- REFINE_QUERY: Return to planner with feedback to optimize search query
- EXPAND_CHUNKS: Get peripheral chunks for more context, then re-evaluate
- PROCEED_TO_INSIGHT_GENERATION: Documents are sufficient, exit retrieval subgraph
"""

from __future__ import annotations

import math
import time
from enum import Enum
from typing import Any, Dict, List, Optional

from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, RetrievalMetrics
from prompts.templates import RETRIEVER_FEEDBACK_PROMPT
from prompts.utils import build_few_shot_examples_string, get_system_instruction
from services.llm import get_llm
from services.retriever import RetrieverService


class RetrieverFeedbackAction(str, Enum):
    """Actions the retriever feedback agent can take."""

    REFINE_QUERY = "refine_query"
    EXPAND_CHUNKS = "expand_chunks"
    PROCEED_TO_INSIGHT_GENERATION = "proceed_to_insight_generation"


class DocumentRanking(BaseModel):
    """Ranking information for a single document."""

    document_id: str = Field(..., description="The document ID (_id) of the document")
    relevance_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Relevance score from 0.0 (lowest) to 1.0 (highest)",
    )


class RetrieverFeedbackOutput(BaseModel):
    """Structured output from the retriever feedback agent."""

    action: RetrieverFeedbackAction = Field(..., description="The action to take")
    reasoning: str = Field(..., description="Explanation for the decision")

    # Document rankings (required for all actions)
    document_rankings: List[DocumentRanking] = Field(
        default_factory=list,
        description="Relevance ranking for all retrieved documents (1-10 scale)",
    )

    # For REFINE_QUERY
    refinement_feedback: Optional[str] = Field(
        None, description="Feedback for refining the query/retrieval strategy"
    )

    # For EXPAND_CHUNKS
    chunk_ids_to_expand: Optional[List[str]] = Field(
        default=None,
        description="Document IDs to fetch peripheral content for (only required for EXPAND_CHUNKS action)",
    )


def _calculate_retrieval_metrics(
    ranked_docs: List[tuple],  # List of (score, doc_id, doc)
    relevance_threshold: float,
    embedding_time_ms: float,
    search_time_ms: float,
    feedback_time_ms: float,
) -> RetrievalMetrics:
    """
    Calculate IR evaluation metrics for retrieval performance.

    Args:
        ranked_docs: List of (score, doc_id, doc) tuples sorted by score descending
        relevance_threshold: Threshold for considering a document relevant
        embedding_time_ms: Time spent on embedding generation
        search_time_ms: Time spent on Qdrant search
        feedback_time_ms: Time spent on feedback evaluation

    Returns:
        RetrievalMetrics object with calculated metrics
    """
    if not ranked_docs:
        return RetrievalMetrics(
            precision_at_k=0.0,
            mrr=0.0,
            ndcg_at_k=0.0,
            map_at_k=0.0,
            total_retrieved=0,
            relevant_count=0,
            avg_relevance_score=0.0,
            embedding_time_ms=embedding_time_ms,
            search_time_ms=search_time_ms,
            feedback_time_ms=feedback_time_ms,
            total_time_ms=embedding_time_ms + search_time_ms + feedback_time_ms,
        )

    scores = [score for score, _, _ in ranked_docs]
    total_retrieved = len(ranked_docs)
    avg_score = sum(scores) / total_retrieved if total_retrieved > 0 else 0.0

    # Count relevant documents (above threshold)
    relevant_count = sum(1 for score in scores if score >= relevance_threshold)

    # Precision@K: fraction of retrieved docs that are relevant
    precision = relevant_count / total_retrieved if total_retrieved > 0 else 0.0

    # MRR: 1/rank of first highly relevant document (score >= 0.8)
    mrr = 0.0
    for i, score in enumerate(scores, 1):
        if score >= 0.8:
            mrr = 1.0 / i
            break

    # nDCG@K: Normalized Discounted Cumulative Gain
    # DCG = sum(rel_i / log2(i+1)) for i in 1..k
    dcg = sum(score / math.log2(i + 1) for i, score in enumerate(scores, 1))

    # Ideal DCG: sort scores and calculate best possible DCG
    ideal_scores = sorted(scores, reverse=True)
    idcg = sum(score / math.log2(i + 1) for i, score in enumerate(ideal_scores, 1))

    ndcg = dcg / idcg if idcg > 0 else 0.0

    # MAP@K: Mean Average Precision
    # AP = (sum of precision@i for each relevant doc) / total relevant docs
    precision_sum = 0.0
    relevant_seen = 0
    for i, score in enumerate(scores, 1):
        if score >= relevance_threshold:
            relevant_seen += 1
            precision_at_i = relevant_seen / i
            precision_sum += precision_at_i

    map_score = precision_sum / relevant_count if relevant_count > 0 else 0.0

    return RetrievalMetrics(
        precision_at_k=precision,
        mrr=mrr,
        ndcg_at_k=ndcg,
        map_at_k=map_score,
        total_retrieved=total_retrieved,
        relevant_count=relevant_count,
        avg_relevance_score=avg_score,
        embedding_time_ms=embedding_time_ms,
        search_time_ms=search_time_ms,
        feedback_time_ms=feedback_time_ms,
        total_time_ms=embedding_time_ms + search_time_ms + feedback_time_ms,
    )


def format_full_documents(docs_dict: Dict[str, Document]) -> str:
    """
    Format full documents for the feedback prompt.

    Documents are already truncated to <1000 chars during indexing,
    so we can include full content.

    Args:
        docs_dict: Dictionary of documents keyed by document _id

    Returns:
        Formatted string with documents
    """
    if not docs_dict:
        return "No documents retrieved."

    formatted = []
    for i, (doc_id, doc) in enumerate(docs_dict.items(), 1):
        metadata = doc.metadata
        doc_type = metadata.get("document_type", "unknown")
        source = metadata.get("source_file", "unknown")

        # Include basic metadata
        meta_str = f"Type: {doc_type} | Source: {source}"

        # Add relevant metadata fields
        if metadata.get("date"):
            meta_str += f" | Date: {metadata['date']}"
        if metadata.get("session"):
            meta_str += f" | Session: {metadata['session']}"

        formatted.append(
            f"### [NEXT DOCUMENT] ###\n"
            f"Doc ID (THIS IS THE DOCUMENT ID THAT YOU SHOULD USE IN RANKING AND (IF NEEDED) IDS TO EXPAND CHUNKS): {doc_id}\n"
            f"Metadata:\n{meta_str}\n"
            f"Content:\n{doc.page_content}\n"
            f"---"
        )

    return "\n\n".join(formatted)


def retriever_feedback_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Retriever Feedback node for a single query.

    Evaluates retrieved documents and decides whether to:
    1. Refine query and loop back to retriever_planner
    2. Expand chunks for more context, then re-evaluate (loops back to self)
    3. Proceed to insight generation (exit subgraph)

    Returns:
        Updated state with query object containing action decision
    """
    overall_start = time.time()
    print(
        f"[TIMING] retriever_feedback: started at {time.strftime('%H:%M:%S', time.localtime(overall_start))}"
    )

    config = config or get_default_config()
    llm = get_llm("retriever_feedback", config)

    # Get query object with all retrieval state
    query = state.get("query")
    docs_dict = query.retrieved_documents
    iteration_count = query.iteration_count
    max_iterations = config.pipeline.max_retrieval_iterations

    # Get most recent attempted query
    if query.attempted_queries:
        latest_attempt = query.attempted_queries[-1]
        attempt_summary = (
            f'Search Query: "{latest_attempt.search_query}"\n'
            f"Document Types: {latest_attempt.document_types or 'All types'}\n"
            f"Date Range: {latest_attempt.date_range or 'No date filter'}\n"
            f"Top K: {latest_attempt.top_k}\n"
            f"Documents Retrieved: {latest_attempt.docs_retrieved}"
        )
    else:
        attempt_summary = "No attempts yet (this shouldn't happen)"

    # Format documents
    format_start = time.time()
    documents_content = format_full_documents(docs_dict)
    format_time = (time.time() - format_start) * 1000
    print(
        f"[TIMING] retriever_feedback: format_documents completed in {format_time:.2f}ms"
    )

    # Build few-shot examples
    examples = build_few_shot_examples_string("retriever_feedback")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # Create prompt
    prompt_start = time.time()
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", RETRIEVER_FEEDBACK_PROMPT),
        ]
    )
    prompt_time = (time.time() - prompt_start) * 1000
    print(f"[TIMING] retriever_feedback: build_prompt completed in {prompt_time:.2f}ms")

    # Use structured output
    structured_llm = llm.with_structured_output(RetrieverFeedbackOutput)
    chain = prompt | structured_llm

    llm_start = time.time()
    print(f"[TIMING] retriever_feedback: LLM call starting...")
    try:
        result: RetrieverFeedbackOutput = chain.invoke(
            {
                "domain_context": config.pipeline.domain_context,
                "query_text": query.text,
                "hypothetical_response": query.hypothetical_response or "Not provided",
                "suggested_insight_types": (
                    ", ".join(query.suggested_insight_types)
                    if query.suggested_insight_types
                    else "Not specified"
                ),
                "attempted_queries": attempt_summary,
                "documents_content": documents_content,
                "doc_count": len(docs_dict),
                "iteration": iteration_count,
                "max_iterations": max_iterations,
                "max_retrieved_documents": config.pipeline.max_retrieved_documents,
                "relevance_threshold": config.pipeline.document_relevance_threshold,
                "examples": examples,
            }
        )
        llm_time = (time.time() - llm_start) * 1000
        print(f"[TIMING] retriever_feedback: LLM call completed in {llm_time:.2f}ms")
    except Exception as e:
        import traceback

        print(f"[ERROR] retriever_feedback: LLM call failed")
        print(f"[ERROR] Exception type: {type(e).__name__}")
        print(f"[ERROR] Exception message: {str(e)}")
        print(f"[ERROR] Traceback:\n{traceback.format_exc()}")
        raise

    # Check if we've hit max iterations - force proceed if so (but still apply rankings)
    if iteration_count >= max_iterations:
        result.action = RetrieverFeedbackAction.PROCEED_TO_INSIGHT_GENERATION

    # Update query object with feedback decision
    query.retriever_feedback_action = result.action.value

    # Build ranking map from LLM output
    ranking_start = time.time()
    doc_id_to_score = {}
    for ranking in result.document_rankings:
        doc_id_to_score[ranking.document_id] = ranking.relevance_score
    ranking_time = (time.time() - ranking_start) * 1000
    print(
        f"[TIMING] retriever_feedback: process_rankings completed in {ranking_time:.2f}ms"
    )

    # Process the decision
    if result.action == RetrieverFeedbackAction.EXPAND_CHUNKS:
        # Get peripheral chunks
        try:
            retriever = RetrieverService.get_instance()

            # Ensure chunk_ids_to_expand is a list (handle None case)
            chunk_ids = result.chunk_ids_to_expand or []

            for doc_id in chunk_ids:
                # Find the document with this _id
                target_doc = docs_dict.get(doc_id)

                if target_doc:
                    peripheral = retriever.get_peripheral_chunks(
                        target_doc, before=1, after=1
                    )
                    # Add expanded docs to the dict
                    for pdoc in peripheral:
                        p_doc_id = pdoc.metadata.get("_id")
                        if p_doc_id and p_doc_id not in docs_dict:
                            docs_dict[p_doc_id] = pdoc

            # Increment iteration for expansion
            query.iteration_count += 1
        except Exception as e:
            import traceback

            print(f"[ERROR] retriever_feedback: chunk expansion failed")
            print(f"[ERROR] Exception type: {type(e).__name__}")
            print(f"[ERROR] Exception message: {str(e)}")
            print(f"[ERROR] Traceback:\n{traceback.format_exc()}")
            raise

    elif result.action == RetrieverFeedbackAction.REFINE_QUERY:
        # Set feedback for retriever_planner
        query.retrieval_feedback = result.refinement_feedback
        # Iteration already incremented by retriever_planner, don't increment again

    # Sort documents by relevance score (highest first)
    sort_start = time.time()
    ranked_docs = []
    for doc_id, doc in docs_dict.items():
        score = doc_id_to_score.get(doc_id, 0)  # Default score 0 if not ranked
        ranked_docs.append((score, doc_id, doc))

    # Sort by score descending
    ranked_docs.sort(key=lambda x: x[0], reverse=True)
    sort_time = (time.time() - sort_start) * 1000
    print(f"[TIMING] retriever_feedback: sort_documents completed in {sort_time:.2f}ms")

    # Calculate IR metrics before filtering
    metrics_start = time.time()
    retrieval_metrics = _calculate_retrieval_metrics(
        ranked_docs=ranked_docs,
        relevance_threshold=config.pipeline.document_relevance_threshold,
        embedding_time_ms=0,  # Will be set from retriever timing
        search_time_ms=0,  # Will be set from retriever timing
        feedback_time_ms=llm_time,
    )
    metrics_time = (time.time() - metrics_start) * 1000
    print(
        f"[TIMING] retriever_feedback: calculate_metrics completed in {metrics_time:.2f}ms"
    )

    # Create a deep copy of query to avoid mutating the original
    updated_query = query.model_copy(deep=True)

    # Store metrics
    updated_query.retrieval_metrics = retrieval_metrics

    # Apply max_retrieved_documents limit only when exiting the feedback loop
    # For EXPAND_CHUNKS, keep all documents so next iteration can rank them properly
    filter_start = time.time()
    if result.action == RetrieverFeedbackAction.EXPAND_CHUNKS:
        # Keep all documents (expanded chunks need to be ranked in next iteration)
        updated_query.retrieved_documents = {
            doc_id: doc for _, doc_id, doc in ranked_docs
        }
    else:
        # REFINE_QUERY or PROCEED_TO_INSIGHT_GENERATION: apply limit
        max_docs = config.pipeline.max_retrieved_documents
        updated_query.retrieved_documents = {
            doc_id: doc for _, doc_id, doc in ranked_docs[:max_docs]
        }
    filter_time = (time.time() - filter_start) * 1000
    print(
        f"[TIMING] retriever_feedback: apply_filters completed in {filter_time:.2f}ms"
    )

    overall_time = (time.time() - overall_start) * 1000
    print(f"[TIMING] retriever_feedback: completed in {overall_time:.2f}ms total")

    # Return updated query copy and routing action
    # - "query" for next node within subgraph
    # - "queries" for merging back to main state via reduce_queries reducer
    return {
        "query": updated_query,
        "queries": [updated_query],
        "retriever_feedback_action": updated_query.retriever_feedback_action,
        "retriever_feedback_refinement_reasoning": result.reasoning,
    }
