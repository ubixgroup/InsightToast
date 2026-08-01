"""
VIZ Insight Planner Agent

Plans visualization-based insights by selecting chart types and extracting data.
Uses LangChain agent with retrieval tool (for Vega docs) and Python REPL tool.
"""

from __future__ import annotations

import json
import re
import time
from typing import Any, Dict, List

from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain.tools import tool
from langchain.tools.tool_node import ToolCallRequest
from langchain.messages import ToolMessage
from langchain_core.documents import Document
from langchain_experimental.tools import PythonREPLTool
from langgraph.types import Command
from pydantic import BaseModel, Field
from typing import Callable

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState, Query
from prompts.templates import (
    VIZ_INSIGHT_PLANNER_PROMPT,
    VIZ_INSIGHT_PLANNER_PARSING_PROMPT,
)
from services.llm import get_llm
from services.retriever import RetrieverService
from prompts.utils import (
    build_few_shot_examples_string,
    get_system_instruction,
    get_last_n_chunks,
)


def format_documents_with_metadata(
    docs: List[Document],
    config: RAGConfig,
) -> str:
    """
    Format documents with filtered metadata and full content.
    """
    if not docs:
        return "No documents available."

    from models.insights import filter_metadata_for_llm

    formatted_docs = []

    for idx, doc in enumerate(docs, 1):
        # Filter metadata using centralized function
        filtered_meta = filter_metadata_for_llm(doc.metadata, config)

        # Format metadata as key: value pairs
        meta_str = "\n".join(f"  {k}: {v}" for k, v in filtered_meta.items())

        # Get document ID from _id field in metadata
        doc_id = doc.metadata.get("_id")
        if not doc_id:
            continue  # Skip documents without _id

        # Build formatted document string
        formatted = (
            f"[### NEXT DOCUMENT ###]\n"
            f"Doc ID (THIS IS THE ID THAT YOU SHOULD CITE IF YOU USE THIS DOCUMENT): {doc_id}\n"
            f"Metadata:\n{meta_str}\n"
            f"Content:\n{doc.page_content}\n"
        )
        formatted_docs.append(formatted)

    return "\n---\n\n".join(formatted_docs)


class VizInsightOutput(BaseModel):
    """Structured output from the viz insight planner."""

    chart_type: str = Field(
        ...,
        description=(
            "Selected chart type from the Altair gallery inventory "
            "(exact name as listed)."
        ),
    )

    title: str = Field(
        ...,
        description="Short title for the visualization (max 5 words).",
    )

    subtitle: str = Field(
        default="",
        description="1-2 sentence explanation of what the chart shows, displayed to the user alongside the chart.",
    )

    labels: Dict[str, str] = Field(
        default_factory=dict,
        description=(
            "Axis and legend labels. Example: "
            "{'x': 'Year', 'y': 'Number of Votes', 'color': 'Party'}"
        ),
    )

    visualization_context: str = Field(
        ...,
        description=(
            "Internal guidance for the downstream chart generator: what the visualization "
            "should show, why this chart type was selected, and any specific encoding notes. "
            "This is NOT shown to the user."
        ),
    )

    data: List[Dict[str, Any]] = Field(
        default_factory=list,
        description=(
            "Structured data extracted from the documents. "
            "Each object should contain consistent, descriptive field names "
            "(e.g., year, category, value, group, percentage)."
        ),
    )

    source_document_ids: List[str] = Field(
        default_factory=list,
        description=(
            "List of document IDs whose data was used to construct this visualization."
        ),
    )

    insight_explanation: str = Field(
        default="",
        description=(
            "Accessible text version of the visualization. "
            "A prose description that explains what the chart shows, including the key data points, "
            "trends, comparisons, or conclusions visible in it — as if explaining the chart to "
            "someone who cannot see it. This becomes the stored explanation of the insight and is "
            "shown to agents for redundancy checking. It is distinct from visualization_context "
            "(which is internal chart-generation guidance only)."
        ),
    )


def viz_planner_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    VIZ Planner node that uses LangChain agent to plan visualization.

    Uses:
    - Retrieval tool for Vega-Altair documentation
    - Python REPL tool for data extraction/transformation

    Args:
        state: RAGPipelineState with queries_for_generation: List[Query]
        config: Optional RAGConfig

    Returns:
        Updated state with viz_plan: VizInsightOutput
    """
    config = config or get_default_config()
    llm = get_llm("viz_planner", config)

    # ============================================================
    # 1. Extract queries from state
    # ============================================================
    queries_for_generation: List[Query] = state.get("queries_for_generation", [])

    if not queries_for_generation:
        raise ValueError("viz_planner_node requires queries_for_generation in state")

    # ============================================================
    # 2. Merge retrieved documents from all queries
    # ============================================================
    all_docs_dict = {}
    for query in queries_for_generation:
        for doc_id, doc in query.retrieved_documents.items():
            if doc_id not in all_docs_dict:
                all_docs_dict[doc_id] = doc

    all_docs = list(all_docs_dict.values())

    # ============================================================
    # 3. Get context from state
    # ============================================================
    current_topic_id = state.get("current_topic_id")
    topics = state.get("topics", {})
    current_topic = topics.get(current_topic_id) if topics else None

    domain_context = config.pipeline.domain_context

    # Get meeting context
    meeting_info = state.get("meeting_info")
    meeting_title = meeting_info.title if meeting_info else "Not yet determined"
    meeting_summary = meeting_info.summary if meeting_info else "No summary yet."
    key_values_json = (
        json.dumps(meeting_info.key_values, indent=2)
        if meeting_info and meeting_info.key_values
        else "{}"
    )

    # Get the latest transcript chunk
    transcript_segments = state.get("transcript_segments", [])
    transcript_chunk = transcript_segments[-1].text if transcript_segments else ""

    # Get last N chunks for context
    n_chunks = config.pipeline.context_window_size
    last_n_chunks_str = get_last_n_chunks(
        transcript_segments,
        n=n_chunks,
        include_speaker=True,
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

    # ============================================================
    # 4. Format documents
    # ============================================================
    documents_with_metadata = format_documents_with_metadata(all_docs, config)

    # ============================================================
    # 5. Format all query texts
    # ============================================================
    query_texts = "\n".join(f"- {q.text}" for q in queries_for_generation)

    # ============================================================
    # 6. Create tools and middleware for observability
    # ============================================================

    # Retrieval tool for Vega-Altair documentation
    vega_retriever = RetrieverService(
        config=config, collection_name=config.qdrant.vega_docs_collection
    )

    @tool
    def search_vega_docs(query: str) -> str:
        """Search Vega-Altair documentation and gallery examples for chart types and usage patterns.

        Args:
            query: Search query for documentation
        """
        results = vega_retriever.search(query, top_k=5)
        if not results:
            return "No documentation found."

        formatted = []
        for doc, score in results:
            formatted.append(f"[Score: {score:.3f}]\n{doc.page_content}\n")
        return "\n---\n".join(formatted)

    # Python REPL tool for data processing
    repl_tool = PythonREPLTool()

    tools = [search_vega_docs, repl_tool]

    # Middleware for tool call observability
    @wrap_tool_call
    def monitor_viz_planner_tools(
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], ToolMessage | Command],
    ) -> ToolMessage | Command:
        """Monitor tool calls in viz planner, specifically PythonREPLTool."""
        tool_name = request.tool_call["name"]
        tool_args = request.tool_call["args"]

        # Special logging for PythonREPLTool (note: tool name is "Python_REPL" with capitals)
        if tool_name == "Python_REPL":
            print("\n" + "=" * 80)
            print("[VIZ_PLANNER_REPL] CODE EXECUTION START")
            print("=" * 80)
            print(tool_args.get("command", ""))
            print("=" * 80)

            try:
                result = handler(request)
                print("[VIZ_PLANNER_REPL] OUTPUT:")
                print(result.content if hasattr(result, "content") else result)
                print("=" * 80)
                print("[VIZ_PLANNER_REPL] CODE EXECUTION SUCCESS")
                print("=" * 80 + "\n")
                return result
            except Exception as e:
                print("[VIZ_PLANNER_REPL] ERROR:")
                print(str(e))
                print("=" * 80)
                print("[VIZ_PLANNER_REPL] CODE EXECUTION FAILED")
                print("=" * 80 + "\n")
                raise
        else:
            # For other tools, just pass through
            return handler(request)

    # ============================================================
    # 7. Get examples
    # ============================================================
    system_instruction = get_system_instruction(config.pipeline.current_date)
    examples = build_few_shot_examples_string("viz_insight_planner")

    # ============================================================
    # 8. Create user prompt from template
    # ============================================================
    # Use manual string replacement to avoid .format() issues with curly braces in examples
    user_prompt = VIZ_INSIGHT_PLANNER_PROMPT
    user_prompt = user_prompt.replace("{domain_context}", domain_context)
    user_prompt = user_prompt.replace(
        "{current_topic}", current_topic.name if current_topic else "Not assigned"
    )
    user_prompt = user_prompt.replace("{meeting_title}", meeting_title)
    user_prompt = user_prompt.replace("{meeting_summary}", meeting_summary)
    user_prompt = user_prompt.replace("{key_values_json}", key_values_json)
    user_prompt = user_prompt.replace("{transcript_chunk}", transcript_chunk)
    user_prompt = user_prompt.replace("{last_n_chunks}", last_n_chunks_str)
    user_prompt = user_prompt.replace("{query_texts}", query_texts)
    user_prompt = user_prompt.replace(
        "{documents_with_metadata}", documents_with_metadata
    )
    user_prompt = user_prompt.replace("{last_n_insights}", last_n_insights_str)
    user_prompt = user_prompt.replace("{examples}", examples)

    # ============================================================
    # 9. Create agent WITHOUT structured output
    # ============================================================
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_instruction,
        middleware=[monitor_viz_planner_tools],
    )

    # ============================================================
    # 10. Run agent to generate visualization plan
    # ============================================================
    result = agent.invoke({"messages": [{"role": "user", "content": user_prompt}]})

    print(f"[VIZ_PLANNER] result keys: {result.keys()}")

    # ============================================================
    # 11. Extract agent's final response and REPL outputs
    # ============================================================
    messages = result.get("messages", [])
    final_message = None
    final_message_raw = None
    for msg in reversed(messages):
        if hasattr(msg, "type") and msg.type == "ai":
            final_message_raw = msg.content

            # Normalize LangChain content blocks to plain text
            if isinstance(final_message_raw, list):
                text_blocks = []
                for item in final_message_raw:
                    if isinstance(item, dict) and item.get("type") == "text":
                        text_blocks.append(item.get("text", ""))
                final_message = "\n".join(block for block in text_blocks if block)
            elif isinstance(final_message_raw, str):
                final_message = final_message_raw
            else:
                final_message = str(final_message_raw)
            break

    if not final_message:
        raise ValueError("Agent did not return a response")

    print(
        "[VIZ_PLANNER] Final message type: "
        f"raw={type(final_message_raw).__name__}, normalized={type(final_message).__name__}"
    )
    print(
        f"[VIZ_PLANNER] Agent response length: {len(final_message)} chars "
        f"(raw blocks: {len(final_message_raw) if isinstance(final_message_raw, list) else 0})"
    )
    print(f"[VIZ_PLANNER] Agent response (first 500 chars): {final_message[:500]}...")

    # Extract REPL outputs
    repl_outputs = []
    for msg in messages:
        if hasattr(msg, "name") and msg.name == "Python_REPL":
            repl_outputs.append(msg.content)

    repl_data_context = ""
    if repl_outputs:
        print(f"[VIZ_PLANNER] Found {len(repl_outputs)} REPL outputs")
        repl_data_context = (
            f"\n\nData extracted from Python REPL execution:\n{repl_outputs[-1]}"
        )
        print(
            f"[VIZ_PLANNER] Last REPL output length: {len(str(repl_outputs[-1]))} chars"
        )

    # Extract document IDs
    doc_ids = []
    for doc in all_docs:
        doc_id = doc.metadata.get("_id")
        if doc_id:
            doc_ids.append(doc_id)

    # ============================================================
    # 12. Use secondary LLM call with structured output
    # ============================================================

    viz_plan = None

    # Fast path: if planner already returned valid JSON, skip secondary LLM call
    try:
        fast_path_payload = json.loads(final_message.strip())
        viz_plan = VizInsightOutput.model_validate(fast_path_payload)
        print("[VIZ_PLANNER] Fast-path JSON parse succeeded; skipping parser LLM call.")
    except Exception as e:
        print(f"[VIZ_PLANNER] Fast-path JSON parse failed: {type(e).__name__}: {e}")

    if viz_plan is None:
        parsing_llm = get_llm("viz_planner_parser", config)
        structured_llm = parsing_llm.with_structured_output(VizInsightOutput)

        # Use centralized parsing prompt from templates
        parsing_prompt = VIZ_INSIGHT_PLANNER_PARSING_PROMPT.format(
            final_message=final_message,
            repl_data_context=repl_data_context,
            doc_ids=doc_ids,
        )

        print(
            f"[VIZ_PLANNER] Parser fallback input length: {len(parsing_prompt)} chars, "
            f"doc_ids={len(doc_ids)}"
        )

        max_retries = 3
        for attempt in range(1, max_retries + 1):
            start = time.perf_counter()
            try:
                print(f"[VIZ_PLANNER] Parser fallback attempt {attempt}/{max_retries}")
                viz_plan = structured_llm.invoke(parsing_prompt)
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                print(
                    f"[VIZ_PLANNER] Parser fallback succeeded on attempt {attempt} in {elapsed_ms}ms"
                )
                break
            except Exception as e:
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                print(
                    f"[VIZ_PLANNER] Parser fallback failed on attempt {attempt} in {elapsed_ms}ms: "
                    f"{type(e).__name__}: {e}"
                )
                if attempt == max_retries:
                    raise
                time.sleep(min(attempt, 2))

    # ============================================================
    # 13. Sanitize and validate output
    # ============================================================

    # Sanitize title if it has backspace characters or control chars
    if viz_plan.title and any(
        ord(c) < 32 for c in viz_plan.title if c not in ["\n", "\t"]
    ):
        print(f"[VIZ_PLANNER] WARNING: Title contains control characters, cleaning...")
        # Remove control characters
        viz_plan.title = "".join(
            c for c in viz_plan.title if ord(c) >= 32 or c in ["\n", "\t"]
        ).strip()
        # If empty after cleaning, extract from final_message
        if not viz_plan.title and "**Title**:" in final_message:
            title_match = re.search(r"\*\*Title\*\*:\s*([^\n]+)", final_message)
            if title_match:
                viz_plan.title = title_match.group(1).strip()

    # Ensure visualization_context is not empty (required field)
    if not viz_plan.visualization_context or not viz_plan.visualization_context.strip():
        print(
            f"[VIZ_PLANNER] WARNING: visualization_context is empty, extracting from response..."
        )
        # Try to extract from **Visualization Context** section
        context_match = re.search(
            r"\*\*Visualization Context\*\*:\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)",
            final_message,
        )
        if context_match:
            viz_plan.visualization_context = context_match.group(1).strip()
        else:
            # Fallback
            viz_plan.visualization_context = (
                f"Visualization showing {viz_plan.chart_type} based on retrieved data."
            )

    print(f"[VIZ_PLANNER] Parsed viz_plan: {viz_plan}")
    print(
        f"[VIZ_PLANNER] Data field length: {len(viz_plan.data) if viz_plan.data else 0}"
    )
    print(f"[VIZ_PLANNER] Labels: {viz_plan.labels}")

    if viz_plan.data and len(viz_plan.data) > 0:
        print(f"[VIZ_PLANNER] First data item: {viz_plan.data[0]}")
    else:
        print(f"[VIZ_PLANNER] WARNING: Data is empty!")

    # ============================================================
    # 11. Return state updates
    # ============================================================
    # Pass viz_plan and the merged retrieved documents to viz_generator
    return {
        "viz_plan": viz_plan,
        "viz_retrieved_documents": all_docs_dict,  # Pass docs for citation extraction
    }
