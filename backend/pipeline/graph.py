"""
LangGraph Definition for the Multi-Agentic RAG Pipeline.

Uses proper LangGraph patterns:
- Send API for parallel query processing (fan-out)
- Conditional edges for routing decisions
- Reducers for aggregating parallel results

All nodes are in the main graph (no subgraphs).
"""

from __future__ import annotations

from models.state import RAGPipelineState

import time
from datetime import datetime
from typing import Any, Dict, Literal, Optional, Sequence

from langgraph.graph import StateGraph, END, START
from langgraph.types import Send

from config import RAGConfig, get_default_config
from models.state import (
    RAGPipelineState,
    TranscriptInput,
)

# Import agent functions
from agents.initial_content_filter import initial_content_filter_node
from agents.topic_detector_LLM_few_shot import topic_detector_llm_few_shot_node
from agents.meeting_tracker import meeting_tracker_node
from agents.topic_description_updater import topic_description_updater_node
from agents.insight_need_assessment import insight_need_assessment_node

# DEPRECATED: insight_query_constructor and related_insight_finder removed — broken pipeline with near-zero useful matches
# from agents.insight_query_constructor import insight_query_constructor_node
# from agents.related_insight_finder import related_insight_finder_node
from agents.query_constructor import query_constructor_node
from agents.retriever_planner import retriever_planner_node
from agents.retriever_feedback import retriever_feedback_node
from agents.insight_selector import insight_selector_node
from agents.text_insight_generator import text_insight_generator_node
from agents.viz_insight_planner import viz_planner_node
from agents.viz_insight_generator import viz_generator_node

from services.llm import get_agent_llm_info


# =============================================================================
# VERBOSE LOGGING UTILITIES
# =============================================================================


class Colors:
    """ANSI color codes for terminal output."""

    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"


# Global config reference for verbose logging
_current_config: Optional[RAGConfig] = None


def vprint(*args, **kwargs):
    """Print only if verbose mode is enabled."""
    config = _current_config or get_default_config()
    if config and config.pipeline.verbose:
        print(*args, **kwargs)


def vlog_agent_start(agent_name: str) -> float:
    """Log agent start with configuration. Returns start time."""
    config = _current_config or get_default_config()
    if not config or not config.pipeline.verbose:
        return time.time()

    provider, model = get_agent_llm_info(agent_name, config)

    print(f"\n{Colors.BOLD}{Colors.BLUE}┌─ AGENT: {agent_name}{Colors.ENDC}")
    print(f"{Colors.DIM}│  LLM: {provider} ({model}){Colors.ENDC}")
    print(
        f"{Colors.DIM}│  Started: {datetime.now().strftime('%H:%M:%S.%f')[:-3]}{Colors.ENDC}"
    )
    return time.time()


def vlog_agent_end(agent_name: str, start_time: float, output_summary: str = ""):
    """Log agent completion with timing. Full output without truncation."""
    config = _current_config or get_default_config()
    if not config or not config.pipeline.verbose:
        return

    elapsed = time.time() - start_time
    print(
        f"{Colors.DIM}│  Duration: {elapsed:.2f}s ({elapsed*1000:.0f}ms){Colors.ENDC}"
    )
    if output_summary:
        print(f"{Colors.GREEN}│  Output: {output_summary}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}└─ {agent_name} complete{Colors.ENDC}")


def vlog_node_start(node_name: str) -> float:
    """Log graph node start."""
    config = _current_config or get_default_config()
    if not config or not config.pipeline.verbose:
        return time.time()

    print(
        f"\n{Colors.BOLD}{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.ENDC}"
    )
    print(f"{Colors.BOLD}{Colors.CYAN}  NODE: {node_name}{Colors.ENDC}")
    print(
        f"{Colors.BOLD}{Colors.CYAN}══════════════════════════════════════════════════════════════{Colors.ENDC}"
    )
    return time.time()


def vlog_node_end(
    node_name: str, start_time: float, key_updates: Dict[str, Any] = None
):
    """Log graph node completion. Full output without truncation."""
    config = _current_config or get_default_config()
    if not config or not config.pipeline.verbose:
        return

    elapsed = time.time() - start_time
    print(
        f"\n{Colors.DIM}Node '{node_name}' completed in {elapsed:.2f}s ({elapsed*1000:.0f}ms){Colors.ENDC}"
    )
    if key_updates:
        print(f"{Colors.DIM}State updates:{Colors.ENDC}")
        for key, value in key_updates.items():
            print(f"{Colors.DIM}  - {key}: {value}{Colors.ENDC}")


def vlog_decision(decision_name: str, value: str, reason: str = ""):
    """Log a decision point."""
    config = _current_config or get_default_config()
    if not config or not config.pipeline.verbose:
        return

    print(f"{Colors.YELLOW}│  Decision [{decision_name}]: {value}{Colors.ENDC}")
    if reason:
        print(f"{Colors.DIM}│  Reason: {reason}{Colors.ENDC}")


# =============================================================================
# PROCEDURAL CHECK, TOPIC ROUTING AND PARALLEL EXTRACTION
# =============================================================================


def procedural_check_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Procedural Check

    First node in pipeline - filters out procedural/filler content.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("procedural_check")
    agent_start = vlog_agent_start("procedural_check")

    result = initial_content_filter_node(state, config)

    output_summary = (
        "PROCEDURAL - halting"
        if result.get("is_procedural")
        else "SUBSTANTIVE - continuing"
    )

    vlog_agent_end("procedural_check", agent_start, output_summary)
    vlog_node_end(
        "procedural_check",
        node_start,
        {
            "is_procedural": result.get("is_procedural", False),
            "reasoning": result.get("procedural_reasoning", ""),
        },
    )

    return result


def route_after_procedural_check(
    state: RAGPipelineState,
) -> Literal["halt", "topic_detector"]:
    """
    Conditional edge: After procedural check, either halt or go to topic detection.
    """
    if state.get("is_procedural", False):
        return "halt"
    return "topic_detector"


def topic_detector_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Topic Detector (LLM-based Few-Shot)

    Analyzes transcript chunk and decides:
    - HALT: Stop processing (procedural content)
    - CONTINUE: Assign/create topic and proceed

    Uses LLM-based classification with all existing topics' descriptions and examples.
    No embedding-based similarity - purely LLM reasoning.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("topic_detector")
    agent_start = vlog_agent_start("topic_detector")

    result = topic_detector_llm_few_shot_node(state, config)

    # Build output summary
    output_summary = ""
    if result.get("is_procedural"):
        output_summary = "HALT - procedural/irrelevant content"
    elif result.get("current_topic_id"):
        topics = result.get("topics", {})
        topic = topics.get(result["current_topic_id"])
        if topic:
            output_summary = f"Topic: '{topic.name}'"

    vlog_agent_end("topic_detector", agent_start, output_summary)
    vlog_node_end(
        "topic_detector",
        node_start,
        {
            "topic_action": result.get("topic_action", None),
            "current_topic_id": result.get("current_topic_id"),
        },
    )

    return result


def meeting_tracker_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Meeting Tracker

    Tracks/updates meeting-level information (problem, summary, key-values).
    Runs in parallel with topic_description_updater.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("meeting_tracker")
    agent_start = vlog_agent_start("meeting_tracker")

    result = meeting_tracker_node(state, config)

    meeting_info = result.get("meeting_info")
    meeting_summary = ""
    if meeting_info:
        meeting_summary = f"Title: '{meeting_info.title or 'N/A'}'"

    vlog_agent_end("meeting_tracker", agent_start, meeting_summary)
    vlog_node_end(
        "meeting_tracker",
        node_start,
        {
            "meeting_title": meeting_info.title if meeting_info else None,
            "meeting_updated": result.get("meeting_updated", False),
        },
    )

    return result


def topic_description_updater_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Topic Description Updater

    Updates topic description and example segments with new chunk.
    Runs in parallel with meeting_tracker.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("topic_description_updater")
    agent_start = vlog_agent_start("topic_description_updater")

    result = topic_description_updater_node(state, config)

    output_summary = "Updated" if result.get("topics") else "No changes"

    vlog_agent_end("topic_description_updater", agent_start, output_summary)
    vlog_node_end(
        "topic_description_updater",
        node_start,
        {
            "updated": bool(result.get("topics")),
        },
    )

    return result


def insight_need_assessment_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Insight Need Assessment

    Determines if background information from knowledge base is needed.
    Runs in parallel with meeting_tracker and topic_description_updater.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("insight_need_assessment")
    agent_start = vlog_agent_start("insight_need_assessment")

    result = insight_need_assessment_node(state, config)

    insight_needed = result.get("insight_needed", True)
    reasoning = result.get("insight_need_reasoning", "")

    output_summary = (
        f"{'NEEDED' if insight_needed else 'NOT NEEDED'}: {reasoning[:60]}..."
    )

    vlog_agent_end("insight_need_assessment", agent_start, output_summary)
    vlog_node_end(
        "insight_need_assessment",
        node_start,
        {
            "insight_needed": insight_needed,
        },
    )

    vlog_decision(
        "Insight Need", "NEEDED" if insight_needed else "NOT NEEDED", reasoning
    )

    return result


# def insight_query_constructor_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
#     """
#     Node: Insight Query Constructor

#     Generates search query for insight vector DB using HyDE technique.
#     Transforms conversation context into hypothetical insight for better semantic matching.
#     """
#     config = _current_config or get_default_config()

#     node_start = vlog_node_start("insight_query_constructor")
#     agent_start = vlog_agent_start("insight_query_constructor")

#     result = insight_query_constructor_node(state, config)

#     search_query = result.get("insight_search_query", "")
#     output_summary = (
#         f"Query: {search_query[:80]}..."
#         if len(search_query) > 80
#         else f"Query: {search_query}"
#     )

#     vlog_agent_end("insight_query_constructor", agent_start, output_summary)
#     vlog_node_end(
#         "insight_query_constructor",
#         node_start,
#         {
#             "has_query": bool(search_query),
#         },
#     )

#     return result


# def related_insight_finder_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
#     """
#     Node: Related Insight Finder

#     Searches for related insights in current topic and evaluates relevance.
#     Returns thread_id to join existing thread or None to create new thread.
#     """
#     config = _current_config or get_default_config()

#     node_start = vlog_node_start("related_insight_finder")
#     agent_start = vlog_agent_start("related_insight_finder")

#     result = related_insight_finder_node(state, config)

#     selected_thread_id = result.get("selected_thread_id")
#     has_related = selected_thread_id is not None

#     output_summary = f"{'FOUND' if has_related else 'NOT FOUND'}: {selected_thread_id if selected_thread_id else 'will create new thread'}"

#     vlog_agent_end("related_insight_finder", agent_start, output_summary)
#     vlog_node_end(
#         "related_insight_finder",
#         node_start,
#         {
#             "has_related_insight": has_related,
#             "selected_thread_id": selected_thread_id,
#         },
#     )

#     vlog_decision(
#         "Related Insight",
#         "FOUND" if has_related else "NOT FOUND",
#         f"Thread: {selected_thread_id if selected_thread_id else 'new'}",
#     )

#     return result


def query_constructor_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Query Constructor

    Generates search queries using decomposition and HyDE.
    Runs in parallel with meeting_extractor.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("query_constructor")
    agent_start = vlog_agent_start("query_constructor")

    result = query_constructor_node(state, config)

    queries = result.get("queries", [])
    query_texts = [q.text for q in queries]
    query_summary = f"Generated {len(queries)} queries: {query_texts}"

    vlog_agent_end("query_constructor", agent_start, query_summary)
    vlog_node_end(
        "query_constructor",
        node_start,
        {
            "queries_count": len(queries),
        },
    )

    # Mark that query construction is done (for sync point)
    result["_queries_constructed"] = True
    return result


def route_insight_needed(
    state: RAGPipelineState,
) -> Literal["query_constructor", "halt"]:
    """
    Conditional edge after parallel nodes halt.
    Routes to query_constructor if insight is needed, otherwise to halt.

    All three parallel nodes (meeting_tracker, topic_description_updater, insight_need_assessment)
    must complete before this routing decision is made.

    NOTE: Previously routed to insight_query_constructor → related_insight_finder first,
    but that pipeline was broken. Now routes directly to query_constructor.
    """
    insight_needed = state.get("insight_needed", True)  # Default to True if not set

    if insight_needed:
        vlog_decision(
            "Routing",
            "query_constructor",
            "Insight needed - proceeding to query construction",
        )
        return "query_constructor"
    else:
        vlog_decision("Routing", "halt", "No insight needed - halting pipeline")
        return "halt"


def spawn_retrieval_subgraphs(
    state: RAGPipelineState,
) -> Sequence[Send] | Literal["halt"]:
    """
    Conditional edge after query_constructor halts.

    Spawns retrieval subgraphs for each query in parallel.
    Each subgraph retrieves documents for its assigned query.

    Returns:
        - List of Send objects for parallel retrieval subgraphs, OR
        - "halt" string if no queries were generated
    """
    queries = state.get("queries", [])

    if not queries:
        vprint(f"{Colors.YELLOW}No queries generated - halting pipeline{Colors.ENDC}")
        return "halt"

    vprint(
        f"\n{Colors.BOLD}{Colors.CYAN}Fanning out {len(queries)} queries for parallel processing...{Colors.ENDC}"
    )

    # Shared context fields needed by retrieval subgraph
    # These fields provide read-only context from parent state
    # shared_context = {
    #     "transcript_chunk": state["transcript_chunk"],
    #     "current_speaker": state.get("current_speaker"),
    #     "meeting_info": state["meeting_info"],
    #     "topics": state["topics"],
    #     "current_topic_id": state["current_topic_id"],
    #     "insights": state.get("insights", {}),
    #     "transcript_segments": state.get("transcript_segments", []),
    # }

    # Create a Send for each query to spawn an independent retrieval subgraph
    sends = []
    for i, query in enumerate(queries):
        vprint(f"{Colors.DIM}  Query {i+1}: {query.text}{Colors.ENDC}")

        # Create state for subgraph instance
        # Only pass what's needed: the query object + metadata for logging
        subgraph_state: RAGPipelineState = {
            # Shared context from parent (read-only in subgraph)
            # **shared_context,
            # Query-specific data (unique per Send)
            "query": query,
            # Metadata for logging/tracking
            "query_index": i,
            "total_queries": len(queries),
            # Routing state (used by conditional edge in subgraph)
            "retriever_feedback_action": None,
        }
        sends.append(Send("retrieval_subgraph", subgraph_state))

    return sends


def halt_node(state: RAGPipelineState) -> Dict[str, Any]:
    """Node: Halt - Mark processing as complete when halting."""
    vprint(f"{Colors.YELLOW}Pipeline halted - content not relevant{Colors.ENDC}")
    return {"processing_completed": datetime.now()}


# =============================================================================
# QUERY PROCESSING SUBGRAPH (one instance per query)
# =============================================================================


def subgraph_retriever_planner(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Retriever Planner node within query processing subgraph.

    Materializes query into retrieval strategy and executes search for a single query.
    Each query has its own subgraph instance with isolated state.
    """
    config = _current_config or get_default_config()

    # Log with query index for debugging
    query = state.get("query")
    iteration = query.iteration_count + 1 if query else 1
    max_iter = config.pipeline.max_retrieval_iterations
    query_index = state.get("query_index", 0)
    total_queries = state.get("total_queries", 1)

    vprint(
        f"\n{Colors.BOLD}{Colors.CYAN}Query {query_index+1}/{total_queries} - Iteration {iteration}/{max_iter}{Colors.ENDC}"
    )
    vprint(f"{Colors.DIM}  Query: {query.text if query else 'Unknown'}{Colors.ENDC}")

    agent_start = vlog_agent_start("retriever_planner")
    result = retriever_planner_node(state, config)

    # Get retrieved documents from the updated query
    updated_query = result.get("query")
    num_docs = len(updated_query.retrieved_documents) if updated_query else 0
    vlog_agent_end("retriever_planner", agent_start, f"Retrieved {num_docs} documents")

    return result


def subgraph_retriever_feedback(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Retriever Feedback node within retrieval subgraph.

    Evaluates retrieved documents and decides next action.
    """
    config = _current_config or get_default_config()

    agent_start = vlog_agent_start("retriever_feedback")
    result = retriever_feedback_node(state, config)
    refinement_reasoning = result.get("retriever_feedback_refinement_reasoning", "")

    feedback_action = result.get(
        "retriever_feedback_action", "proceed_to_insight_generation"
    )
    vlog_agent_end("retriever_feedback", agent_start, f"Action: {feedback_action}")
    vlog_decision("retrieval_action", feedback_action, refinement_reasoning)

    return result


def route_after_retriever_planner(
    state: RAGPipelineState,
) -> Literal[
    "retriever_feedback",  # max_retrieval_iterations > 0: proceed to feedback
    "__end__",  # max_retrieval_iterations == 0: skip feedback, exit subgraph immediately
]:
    """
    Conditional edge after retriever_planner.

    When max_retrieval_iterations == 0, bypasses retriever_feedback entirely
    and exits the subgraph directly. Otherwise routes to retriever_feedback
    as usual.
    """
    config = _current_config or get_default_config()
    if config.pipeline.max_retrieval_iterations == 0:
        return "__end__"
    return "retriever_feedback"


def route_in_subgraph(
    state: RAGPipelineState,
) -> Literal[
    "retriever_feedback",  # For EXPAND_CHUNKS (re-evaluate after chunk expansion)
    "retriever_planner",  # For REFINE_QUERY (loop back)
    "__end__",  # For PROCEED_TO_INSIGHT_GENERATION or max iterations
]:
    """
    Conditional edge within retrieval subgraph based on retriever feedback decision.

    Routes to:
    - retriever_planner: If REFINE_QUERY (loop back with feedback)
    - retriever_feedback: If EXPAND_CHUNKS (re-evaluate after expansion)
    - END: If PROCEED_TO_INSIGHT_GENERATION or max iterations reached
    """
    feedback_action = state.get(
        "retriever_feedback_action", "proceed_to_insight_generation"
    )

    if feedback_action == "refine_query":
        # Loop back to retriever_planner with feedback
        return "retriever_planner"
    elif feedback_action == "expand_chunks":
        # Chunks expanded, loop back to retriever_feedback to re-evaluate
        return "retriever_feedback"
    else:  # proceed_to_insight_generation
        # Exit retrieval subgraph
        return "__end__"


def build_retrieval_subgraph() -> StateGraph:
    """
    Build the retrieval subgraph for document retrieval with feedback loop.

    Flow: retriever_planner → retriever_feedback → (refine query | expand chunks | exit)

    Each query spawns its own instance of this subgraph using RAGPipelineState.
    The Send API automatically creates isolated instances for parallel execution.

    The subgraph exits when retriever_feedback decides documents are sufficient,
    then control returns to main graph which routes to insight_selector.
    """
    # Create subgraph
    subgraph = StateGraph(RAGPipelineState)

    # Add nodes
    subgraph.add_node("retriever_planner", subgraph_retriever_planner)
    subgraph.add_node("retriever_feedback", subgraph_retriever_feedback)

    # Set entry point
    subgraph.add_edge(START, "retriever_planner")

    # Edges
    # If max_retrieval_iterations == 0, skip retriever_feedback and exit immediately
    subgraph.add_conditional_edges(
        "retriever_planner",
        route_after_retriever_planner,
        {
            "retriever_feedback": "retriever_feedback",
            END: END,
        },
    )

    # Conditional routing from retriever_feedback
    subgraph.add_conditional_edges(
        "retriever_feedback",
        route_in_subgraph,
        {
            "retriever_planner": "retriever_planner",  # REFINE_QUERY: loop back
            "retriever_feedback": "retriever_feedback",  # EXPAND_CHUNKS: re-evaluate
            END: END,  # PROCEED_TO_INSIGHT_GENERATION: exit subgraph
        },
    )

    return subgraph


# =============================================================================
# MAIN GRAPH NODES: INSIGHT SELECTOR AND GENERATORS
# =============================================================================


def insight_selector_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Insight Selector

    Evaluates queries and determines which generators should process them.
    Groups complementary queries and assigns to text/viz generators.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("insight_selector")
    agent_start = vlog_agent_start("insight_selector")

    vprint(
        f"{Colors.BOLD}{Colors.CYAN}Evaluating queries for insight generation...{Colors.ENDC}"
    )

    result = insight_selector_node(state, config)

    generator_assignments = result.get("generator_assignments", [])

    # Log decision - empty generator_assignments means halt
    if not generator_assignments:
        output = "No insights to generate (halting)"
    else:
        num_assignments = len(generator_assignments)
        assignment_summary = ", ".join(
            [
                f"{a['generator_type']}({len(a['query_ids'])} queries)"
                for a in generator_assignments
            ]
        )
        output = f"Spawning {num_assignments} generators: {assignment_summary}"

    vlog_decision(
        "insight_selector_decision",
        "halt" if not generator_assignments else "generate",
        output,
    )
    vlog_agent_end("insight_selector", agent_start, output)
    vlog_node_end(
        "insight_selector", node_start, {"num_assignments": len(generator_assignments)}
    )

    return result


def text_insight_generator_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Text Insight Generator

    Generates a text insight from multiple complementary queries.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("text_insight_generator")
    agent_start = vlog_agent_start("text_insight_generator")

    # Log the queries being processed
    queries_for_generation = state.get("queries_for_generation", [])
    num_queries = len(queries_for_generation)
    query_texts = [q.text for q in queries_for_generation]

    vprint(
        f"{Colors.BOLD}{Colors.GREEN}Generating text insight from {num_queries} complementary queries...{Colors.ENDC}"
    )
    for idx, q_text in enumerate(query_texts, 1):
        vprint(f"  Query {idx}: {q_text}")

    result = text_insight_generator_node(state, config)

    insights_dict = result.get("insights", {})
    has_insights = len(insights_dict) > 0
    if has_insights:
        # Get the first (and only) insight from the dict
        insight = list(insights_dict.values())[0]
        num_citations = (
            len(insight.cited_document_ids)
            if hasattr(insight, "cited_document_ids")
            else 0
        )
        output = f"Generated text insight with {num_citations} citations"
    else:
        output = "No text insight generated"

    vlog_agent_end("text_insight_generator", agent_start, output)
    vlog_node_end("text_insight_generator", node_start, {"has_insight": has_insights})

    return result


def viz_planner_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Viz Planner

    Plans a visualization by selecting chart type and extracting data.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("viz_planner")
    agent_start = vlog_agent_start("viz_planner")

    # Log the queries being processed
    queries_for_generation = state.get("queries_for_generation", [])
    num_queries = len(queries_for_generation)
    query_texts = [q.text for q in queries_for_generation]

    vprint(
        f"{Colors.BOLD}{Colors.GREEN}Planning visualization from {num_queries} complementary queries...{Colors.ENDC}"
    )
    for idx, q_text in enumerate(query_texts, 1):
        vprint(f"  Query {idx}: {q_text}")

    result = viz_planner_node(state, config)

    viz_plan = result.get("viz_plan")
    if viz_plan:
        output = f"Planned {viz_plan.chart_type} visualization: {viz_plan.title}"
    else:
        output = "No viz plan generated"

    vlog_agent_end("viz_planner", agent_start, output)
    vlog_node_end("viz_planner", node_start, {"has_plan": viz_plan is not None})

    return result


def viz_generator_wrapper(state: RAGPipelineState) -> Dict[str, Any]:
    """
    Node: Viz Generator

    Generates Vega-Lite specification from visualization plan.
    """
    config = _current_config or get_default_config()

    node_start = vlog_node_start("viz_generator")
    agent_start = vlog_agent_start("viz_generator")

    viz_plan = state.get("viz_plan")
    if viz_plan:
        vprint(
            f"{Colors.BOLD}{Colors.GREEN}Generating {viz_plan.chart_type} chart code...{Colors.ENDC}"
        )

    result = viz_generator_node(state, config)

    insights_dict = result.get("insights", {})
    has_insights = len(insights_dict) > 0
    if has_insights:
        insight = list(insights_dict.values())[0]
        chart_type = insight.chart_type if hasattr(insight, "chart_type") else "unknown"
        output = f"Generated {chart_type} visualization with Vega-Lite spec"
    else:
        output = "No viz insight generated"

    vlog_agent_end("viz_generator", agent_start, output)
    vlog_node_end("viz_generator", node_start, {"has_insight": has_insights})

    return result


# =============================================================================
# INSIGHT ROUTING AND SPAWNING (Send API)
# =============================================================================


def spawn_insight_generators(
    state: RAGPipelineState,
) -> Sequence[Send] | Literal["halt"]:
    """
    Spawn multiple insight generator nodes in parallel using Send API.

    Reads generator_assignments from state (set by insight_selector_node).
    If no assignments, returns "halt".

    Each assignment contains:
    - generator_type: "text" or "viz"
    - query_ids: List of query IDs to process together
    - reasoning: Why these queries are grouped

    For each assignment, creates a Send object with:
    - Target node: "{generator_type}_insight_generator"
    - Payload: queries_for_generation (List[Query])

    Returns:
        Sequence[Send] objects for parallel generator execution, or
        "halt" if no assignments (including when selector decides to halt)
    """
    generator_assignments = state.get("generator_assignments", [])
    if not generator_assignments:
        vprint(f"{Colors.YELLOW}No generator assignments found, halting{Colors.ENDC}")
        return "halt"

    queries = state.get("queries", [])
    if not queries:
        vprint(f"{Colors.YELLOW}No queries available, halting{Colors.ENDC}")
        return "halt"

    vprint(
        f"\n{Colors.BOLD}{Colors.CYAN}Fanning out {len(generator_assignments)} generator assignments for parallel processing...{Colors.ENDC}"
    )

    # Build a map of query_id -> Query for easy lookup
    query_map = {q.id: q for q in queries}

    sends = []

    for i, assignment in enumerate(generator_assignments):
        generator_type = assignment["generator_type"]
        query_ids = assignment["query_ids"]
        reasoning = assignment.get("reasoning", "")

        # Get the actual Query objects for these IDs
        queries_for_generation = [
            query_map[qid] for qid in query_ids if qid in query_map
        ]

        if not queries_for_generation:
            continue

        queries_text = [q.text for q in queries_for_generation]
        vprint(
            f"{Colors.DIM}  Assignment {i+1}: {generator_type} generator with queries: {queries_text}{Colors.ENDC}"
        )
        vprint(f"{Colors.DIM}    Reasoning: {reasoning}{Colors.ENDC}")

        # Create Send object to spawn this generator
        # For viz, we spawn viz_planner which flows to viz_generator
        if generator_type == "viz":
            target_node = "viz_planner"
        else:
            target_node = f"{generator_type}_insight_generator"

        # Build the payload - pass shared context from parent state
        payload: RAGPipelineState = {
            # Shared context from parent (read-only in generator)
            "transcript_chunk": state["transcript_chunk"],
            "current_speaker": state.get("current_speaker"),
            "topics": state.get("topics", {}),
            "current_topic_id": state.get("current_topic_id"),
            "transcript_segments": state.get("transcript_segments", []),
            "selected_related_insight": state.get("selected_related_insight"),
            "insights": state.get("insights", {}),
            "insight_threads": state.get("insight_threads", {}),
            # Query-specific data (unique per Send)
            "queries_for_generation": queries_for_generation,
            # Metadata for logging
            "query_index": i,
            "total_queries": len(generator_assignments),
        }

        sends.append(Send(target_node, payload))

    if not sends:
        vprint(f"{Colors.YELLOW}No valid queries for generation, halting{Colors.ENDC}")
        return "halt"

    return sends


# =============================================================================
# MAIN GRAPH CONSTRUCTION
# =============================================================================


def complete_node(state: RAGPipelineState) -> Dict[str, Any]:
    """Node: Complete - Mark processing as complete."""
    vprint(f"{Colors.GREEN}Pipeline complete{Colors.ENDC}")
    return {"processing_completed": datetime.now()}


def create_rag_pipeline(config: Optional[RAGConfig] = None) -> StateGraph:
    """
      Create the complete RAG pipeline graph with retrieval subgraph and insight generation.

      Architecture:

      START
        │
        ▼
      procedural_check ──(filler)──► halt ──► END
        │(continue)
        ▼
      topic_detector ──(halt)──► halt ──► END
        │ (continue - parallel)
        ├─► meeting_tracker ──────────────┐
        ├─► topic_description_updater ────┤
        └─► insight_need_assessment ──────┤
                                │ (all three auto-sync)
                                ▼
                      (route based on insight_needed)
                                │
                      ┌─────────┴──────────┐
                      │                    │
                (needed)              (not needed)
                      │                    │
                      ▼                    ▼
          insight_query_constructor    complete ──► END
                      │
                      ▼
          related_insight_finder
                      │
                      ▼
              query_constructor
                      │
            ┌─────────┴────────┐
            │                  │
        (queries)          (no queries)
            │                  │
            ▼                  ▼
      ┌─────────────────────┐   complete ──► END
      │ Retrieval Subgraph  │
      │    (per query)      │
      │                     │
      │ retriever_planner   │
      │        │            │
      │        ▼            │
      │ retriever_feedback  │
      │   │    │       │    │
      │   │    │       └────┼─► (proceed) ──► EXIT SUBGRAPH
      │   │    └────────────┼─► (expand) ──┐
      │   └─────────────────┼─► (refine)   │
      │           ▲          │              │
      │           └──────────┘              │
      └─────────────────────┘               │
              │ (exit subgraph)              │
              ▼                              │
        insight_selector                     │
              │                              │
        ┌─────┴─────┐                        │
        │           │                        │
        ▼           ▼                        │
    text_gen    viz_gen                      │
        │           │                        │
        └─────┬─────┘                        │
              │                              │
              ▼                              │
            END ◄────────────────────────────┘
    """
    # Set global config for verbose logging
    global _current_config
    _current_config = config or get_default_config()

    # Build the main graph
    workflow = StateGraph(RAGPipelineState)

    # Add nodes for procedural check (entry gate)
    workflow.add_node("procedural_check", procedural_check_wrapper)

    # Add topic detector node (merged prepare_topic_routing + topic_router)
    workflow.add_node("topic_detector", topic_detector_wrapper)

    # Add parallel processing nodes (meeting tracker + topic description updater + insight need assessment)
    workflow.add_node("meeting_tracker", meeting_tracker_wrapper)
    workflow.add_node("topic_description_updater", topic_description_updater_wrapper)
    workflow.add_node("insight_need_assessment", insight_need_assessment_wrapper)

    # DEPRECATED: insight_query_constructor and related_insight_finder nodes removed
    # insight_need_assessment now routes directly to query_constructor
    # workflow.add_node("insight_query_constructor", insight_query_constructor_wrapper)
    # workflow.add_node("related_insight_finder", related_insight_finder_wrapper)

    # Add query constructor
    workflow.add_node("query_constructor", query_constructor_wrapper)

    # Add retrieval subgraph (compiled)
    # Each query spawns its own instance with isolated state
    compiled_subgraph = build_retrieval_subgraph().compile()
    workflow.add_node("retrieval_subgraph", compiled_subgraph)

    # Add insight selector and generator nodes (in main graph, after subgraph)
    workflow.add_node("insight_selector", insight_selector_wrapper)
    workflow.add_node("text_insight_generator", text_insight_generator_wrapper)
    workflow.add_node("viz_planner", viz_planner_wrapper)
    workflow.add_node("viz_generator", viz_generator_wrapper)

    workflow.add_node("halt", halt_node)
    workflow.add_node("complete", complete_node)

    # Set entry point
    workflow.add_edge(START, "procedural_check")

    # Edge: procedural_check → (topic_detector OR halt)
    workflow.add_conditional_edges(
        "procedural_check",
        route_after_procedural_check,
        {
            "topic_detector": "topic_detector",
            "halt": "halt",
        },
    )

    # Edges from topic_detector to three parallel nodes
    workflow.add_edge("topic_detector", "meeting_tracker")
    workflow.add_edge("topic_detector", "topic_description_updater")
    workflow.add_edge("topic_detector", "insight_need_assessment")

    # After all three parallel nodes halt, route based on insight_needed
    # Note: LangGraph automatically waits for all parallel edges to halt before routing
    workflow.add_conditional_edges(
        "insight_need_assessment",
        route_insight_needed,
        {
            "query_constructor": "query_constructor",
            "halt": "halt",
        },
    )

    # DEPRECATED: insight threading flow removed — routes directly to query_constructor now
    # workflow.add_edge("insight_query_constructor", "related_insight_finder")
    # workflow.add_edge("related_insight_finder", "query_constructor")

    # Query constructor decides: spawn retrieval subgraphs OR halt if no queries
    workflow.add_conditional_edges(
        "query_constructor",
        spawn_retrieval_subgraphs,
        {
            "retrieval_subgraph": "retrieval_subgraph",  # Target for Send objects
            "halt": "halt",  # If no queries generated
        },
    )

    # Subgraph instances automatically merge via reducers, then proceed to insight_selector
    workflow.add_edge("retrieval_subgraph", "insight_selector")

    # Conditional edge from insight_selector: spawn generators (Send API) or complete
    workflow.add_conditional_edges(
        "insight_selector",
        spawn_insight_generators,
        {
            "text_insight_generator": "text_insight_generator",  # Target for Send objects
            "viz_planner": "viz_planner",  # Target for Send objects (viz pipeline entry)
            "halt": "halt",  # If no assignments or halt
        },
    )

    # Viz pipeline: planner flows to generator
    workflow.add_edge("viz_planner", "viz_generator")

    # Both generators go to END (they return reduced candidate_insights)
    workflow.add_edge("text_insight_generator", END)
    workflow.add_edge("viz_generator", END)

    workflow.add_edge("halt", END)
    workflow.add_edge("complete", END)

    return workflow.compile()
