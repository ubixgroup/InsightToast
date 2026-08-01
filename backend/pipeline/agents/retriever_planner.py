"""
Retriever Planner Agent

Materializes queries into retrieval strategies and executes document retrieval.
Defines:
- Refined search queries
- Metadata filters (document types, date ranges)
- Top-k parameter
"""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, AttemptedQuery
from prompts.templates import RETRIEVER_PLANNER_PROMPT
from prompts.utils import build_few_shot_examples_string, get_system_instruction
from services.llm import get_llm
from services.retriever import RetrieverService


class RetrievalPlanOutput(BaseModel):
    """Structured output from the retriever planner LLM."""

    search_query: str = Field(
        ..., description="The refined search query text for semantic search"
    )
    document_types: List[str] = Field(
        default_factory=list,
        description="Document types to search (leave empty for no filter - searches all types)",
    )
    date_range_start: Optional[str] = Field(
        None, description="Start date for filtering (YYYY-MM-DD format)"
    )
    date_range_end: Optional[str] = Field(
        None, description="End date for filtering (YYYY-MM-DD format)"
    )
    top_k: int = Field(
        default=15, ge=5, le=30, description="Number of documents to retrieve"
    )
    reasoning: str = Field(
        default="", description="Explanation for the retrieval strategy"
    )


class RetrievalPlanWithWebOutput(RetrievalPlanOutput):
    """Extended output that includes an optional web search flag.

    Only used when ``web_search_enabled`` is True in the pipeline config.
    """

    use_web_search: bool = Field(
        default=False,
        description=(
            "Whether to supplement KB retrieval with a web search. "
            "Set to true when: (a) the speaker or query explicitly mentions "
            "the internet, web, or online sources, (b) the topic covers "
            "provincial, external, or non-parliamentary programs/reports "
            "unlikely to be in the federal KB, (c) very recent or real-time "
            "information is needed, or (d) the query asks for information "
            "from sources outside parliamentary records. "
            "The KB search always runs; web results are merged in additively."
        ),
    )


def retriever_planner_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    Retriever Planner node for a single query.

    Materializes the query into a retrieval strategy and executes document search.
    Can be called multiple times if the retriever_feedback agent requests refinement.

    Returns:
        Updated state with query object containing retrieval results
    """
    overall_start = time.time()
    config = config or get_default_config()
    llm = get_llm("retriever_planner", config)
    retriever = RetrieverService.get_instance()

    query = state.get("query")

    # Format attempted queries for the prompt
    attempted_queries_summary = "None yet - this is the first retrieval attempt."
    if query.attempted_queries:
        attempts = []
        for i, attempt in enumerate(query.attempted_queries, 1):
            date_info = f" | dates: {attempt.date_range}" if attempt.date_range else ""
            attempts.append(
                f"Attempt {i}:\n"
                f'  Query: "{attempt.search_query}"\n'
                f"  Filters: types={attempt.document_types}{date_info}\n"
                f"  Requested: {attempt.top_k} docs | Retrieved: {attempt.docs_retrieved} docs"
            )
        attempted_queries_summary = "\n\n".join(attempts)

    # Format document types info from config
    document_types_dict = config.pipeline.document_types
    document_types_lines = []
    for doc_type, description in document_types_dict.items():
        document_types_lines.append(f"- {doc_type}: {description}")
    document_types_info = "\n".join(document_types_lines)

    # Build few-shot examples
    examples = build_few_shot_examples_string("retriever_planner")

    # Get system instruction with current date
    system_instruction = get_system_instruction(config.pipeline.current_date)

    # --- Web search: conditional prompt block & output model ---
    web_search_enabled = config.pipeline.web_search_enabled

    if web_search_enabled:
        web_search_instructions = (
            "\n\n7. WEB SEARCH (OPTIONAL — ADDITIVE)\n"
            "   A supplementary web search can run alongside the knowledge base.\n"
            "   The KB search ALWAYS runs regardless; web results are merged in additively.\n"
            "\n"
            "   Set use_web_search=true when ANY of the following apply:\n"
            "     - The speaker or query explicitly mentions the internet, web, online sources, or external reports\n"
            "     - The topic covers provincial programs, external organizations, or non-parliamentary\n"
            "       subjects that are unlikely to appear in the federal parliamentary KB\n"
            "       (e.g. OSAP, provincial education stats, WHO reports, industry studies)\n"
            "     - Very recent events, current affairs, or real-time data would improve the insight\n"
            "     - The query asks for information from sources outside parliamentary records\n"
            "\n"
            "   Leave use_web_search=false only when the query is clearly and fully\n"
            "   answerable from parliamentary records alone."
        )
        web_search_output_field = "- use_web_search: true or false — whether to also run a web search (see guideline 7)"
        output_model = RetrievalPlanWithWebOutput
    else:
        web_search_instructions = ""
        web_search_output_field = ""
        output_model = RetrievalPlanOutput

    # Create prompt
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_instruction),
            ("human", RETRIEVER_PLANNER_PROMPT),
        ]
    )

    # Use structured output
    structured_llm = llm.with_structured_output(output_model)
    chain = prompt | structured_llm

    llm_start = time.time()
    try:
        result: RetrievalPlanOutput = chain.invoke(
            {
                "domain_context": config.pipeline.domain_context,
                "query_text": query.text,
                "hypothetical_response": query.hypothetical_response or "Not provided",
                "suggested_insight_types": (
                    ", ".join(query.suggested_insight_types)
                    if query.suggested_insight_types
                    else "Not specified"
                ),
                "document_types_info": document_types_info,
                "knowledge_base_context": config.pipeline.knowledge_base_context,
                "feedback": query.retrieval_feedback
                or "None - no feedback from previous iteration.",
                "attempted_queries": attempted_queries_summary,
                "max_retrieved_documents": config.pipeline.max_retrieved_documents,
                "examples": examples,
                "web_search_instructions": web_search_instructions,
                "web_search_output_field": web_search_output_field,
            }
        )
        llm_time = time.time() - llm_start

        print(f"[MAMMAD] LLM time: {llm_time:.2f}s")
        if web_search_enabled:
            decided = getattr(result, "use_web_search", False)
            status = "TRIGGERED" if decided else "skipped (LLM opted out)"
            print(f"[WEB] use_web_search={decided} → {status}")
    except Exception as e:
        import traceback

        print(f"[ERROR] retriever_planner: LLM call failed")
        print(f"[ERROR] Exception type: {type(e).__name__}")
        print(f"[ERROR] Exception message: {str(e)}")
        print(f"[ERROR] Traceback:\n{traceback.format_exc()}")
        raise

    # Execute retrieval with the refined query and filters
    search_start = time.time()
    try:
        results = retriever.search(
            query=result.search_query,
            top_k=result.top_k,
            document_types=result.document_types,
            date_range_start=result.date_range_start,
            date_range_end=result.date_range_end,
        )
        search_time = time.time() - search_start

        print(f"[MAMMAD] Retrieval time: {search_time:.2f}s")
    except Exception as e:
        import traceback

        print(f"[ERROR] retriever_planner: Qdrant search failed")
        print(f"[ERROR] Exception type: {type(e).__name__}")
        print(f"[ERROR] Exception message: {str(e)}")
        print(f"[ERROR] Traceback:\n{traceback.format_exc()}")
        raise
    overall_time = time.time() - overall_start
    print(f"[MAMMAD] Overall retriever_planner_node time: {overall_time:.2f}s")

    # Create a deep copy of query to avoid mutating the original
    updated_query = query.model_copy(deep=True)

    # Extract documents and add to dict (keyed by _id)
    # results are tuples of (doc, score)
    for doc, _ in results:
        doc_id = doc.metadata.get("_id")
        if doc_id and doc_id not in updated_query.retrieved_documents:
            updated_query.retrieved_documents[doc_id] = doc

    # --- Optional web search (additive) ---
    use_web = web_search_enabled and getattr(result, "use_web_search", False)
    if use_web:
        print(f'[WEB] ↳ Executing DuckDuckGo search: "{result.search_query[:100]}"')
        try:
            from services.web_search import get_web_search_service

            web_service = get_web_search_service(
                provider=config.pipeline.web_search_provider,
                max_results=config.pipeline.web_search_max_results,
            )
            web_start = time.time()
            web_docs = web_service.search(
                query=result.search_query,
                max_results=min(result.top_k, config.pipeline.web_search_max_results),
            )
            web_time = time.time() - web_start
            print(
                f"[MAMMAD] Web search time: {web_time:.2f}s — {len(web_docs)} raw results"
            )

            merged = 0
            for doc in web_docs:
                doc_id = doc.metadata.get("_id")
                if doc_id and doc_id not in updated_query.retrieved_documents:
                    updated_query.retrieved_documents[doc_id] = doc
                    merged += 1
            print(
                f"[WEB] ↳ Merged {merged}/{len(web_docs)} web docs into retrieved_documents"
            )
        except Exception as e:
            # Web search failure is non-fatal — KB results are already stored
            print(f"[WEB] ✗ Non-fatal error during web search: {e}")

    # Format date range for recording
    date_range_str = None
    if result.date_range_start or result.date_range_end:
        date_range_str = (
            f"{result.date_range_start or '*'} to {result.date_range_end or '*'}"
        )

    # New docs for recording
    new_docs = [doc for doc, _ in results]

    # Record this attempt
    attempt = AttemptedQuery(
        search_query=result.search_query,
        document_types=result.document_types,
        date_range=date_range_str,
        sessions=[],  # No longer using sessions
        top_k=result.top_k,
        docs_retrieved=len(new_docs),
    )

    # Update query copy with retrieval results
    updated_query.attempted_queries.append(attempt)
    updated_query.iteration_count += 1

    # Return updated query copy
    # - "query" for next node within subgraph
    # - "queries" for merging back to main state via reduce_queries reducer
    return {
        "query": updated_query,
        "queries": [updated_query],
    }
