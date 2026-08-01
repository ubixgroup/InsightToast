"""
VIZ Insight Generator Agent

Generates actual Vega-Lite specifications from visualization plans.
Uses LangChain agent with Python REPL tool to write and execute Altair code.
Handles insight threading and storage.
"""

from __future__ import annotations

import uuid
import json
from datetime import datetime
from typing import Any, Dict

from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain.tools import tool
from langchain.tools.tool_node import ToolCallRequest
from langchain.messages import ToolMessage
from langchain_experimental.tools import PythonREPLTool
from langgraph.types import Command
from pydantic import BaseModel, Field
from typing import Callable

from config import RAGConfig, get_default_config
from models.state import RAGPipelineState
from models.insights import VizInsight, InsightThread
from prompts.templates import (
    VIZ_INSIGHT_GENERATOR_PROMPT,
    VIZ_INSIGHT_GENERATOR_RETRY_PROMPT,
)
from services.llm import get_llm
from services.retriever import RetrieverService
from prompts.utils import get_system_instruction, build_few_shot_examples_string


def viz_generator_node(
    state: RAGPipelineState,
    config: RAGConfig | None = None,
) -> Dict[str, Any]:
    """
    VIZ Generator node that generates Vega-Lite spec from plan.

    Uses LangChain agent to write and execute Altair code.

    Args:
        state: RAGPipelineState with viz_plan from viz_planner
        config: Optional RAGConfig

    Returns:
        Updated state with insights, insight_threads, topics
    """
    config = config or get_default_config()
    llm = get_llm("viz_generator", config)

    # ============================================================
    # 1. Get viz_plan from state
    # ============================================================
    viz_plan = state.get("viz_plan")
    print(f"[VIZ_GENERATOR] viz_plan: {viz_plan}")
    print(f"\n[VIZ_GENERATOR] ========== DATA INSPECTION ==========")
    print(f"[VIZ_GENERATOR] Chart Type: {viz_plan.chart_type if viz_plan else 'None'}")
    print(f"[VIZ_GENERATOR] Title: {viz_plan.title if viz_plan else 'None'}")
    print(f"[VIZ_GENERATOR] Labels: {viz_plan.labels if viz_plan else 'None'}")
    print(f"[VIZ_GENERATOR] Data type: {type(viz_plan.data) if viz_plan else 'None'}")
    print(
        f"[VIZ_GENERATOR] Data length: {len(viz_plan.data) if viz_plan and viz_plan.data else 0}"
    )
    if viz_plan and viz_plan.data and len(viz_plan.data) > 0:
        print(f"[VIZ_GENERATOR] First data item: {viz_plan.data[0]}")
        print(f"[VIZ_GENERATOR] Full data:\n{viz_plan.data}")
    else:
        print(f"[VIZ_GENERATOR] WARNING: Data is empty or None!")
    print(f"[VIZ_GENERATOR] ========================================\n")

    if not viz_plan:
        raise ValueError("viz_generator_node requires viz_plan in state")

    # ============================================================
    # 2. Get context from state
    # ============================================================
    current_topic_id = state.get("current_topic_id")
    transcript_segments = state.get("transcript_segments", [])
    source_chunk_id = transcript_segments[-1].id if transcript_segments else None

    # Get queries for generation (for metadata)
    queries_for_generation = state.get("queries_for_generation", [])
    primary_query = queries_for_generation[0] if queries_for_generation else None

    # ============================================================
    # 3. Create tools and middleware for observability
    # ============================================================

    # Python REPL tool for executing Altair code
    repl_tool = PythonREPLTool()

    # Retrieval tool for Vega-Altair documentation
    vega_retriever = RetrieverService(
        config=config, collection_name=config.qdrant.vega_docs_collection
    )

    @tool
    def search_vega_docs(query: str) -> str:
        """Search Vega-Altair documentation if you need API clarification or examples.

        Args:
            query: Search query for documentation
        """
        results = vega_retriever.search(query, top_k=3)
        if not results:
            return "No documentation found."

        formatted = []
        for doc, score in results:
            formatted.append(f"{doc.page_content}\n")
        return "\n---\n".join(formatted)

    tools = [repl_tool, search_vega_docs]

    # Middleware for tool call observability
    @wrap_tool_call
    def monitor_viz_generator_tools(
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], ToolMessage | Command],
    ) -> ToolMessage | Command:
        """Monitor tool calls in viz generator, specifically PythonREPLTool."""
        tool_name = request.tool_call["name"]
        tool_args = request.tool_call["args"]

        # Special logging for PythonREPLTool (note: tool name is "Python_REPL" with capitals)
        if tool_name.lower() == "python_repl":
            print("\n" + "=" * 80)
            print("[VIZ_GENERATOR_REPL] CODE EXECUTION START")
            print("=" * 80)
            print(tool_args.get("command", ""))
            print("=" * 80)

            try:
                result = handler(request)
                print("[VIZ_GENERATOR_REPL] OUTPUT:")
                print(result.content if hasattr(result, "content") else result)
                print("=" * 80)
                print("[VIZ_GENERATOR_REPL] CODE EXECUTION SUCCESS")
                print("=" * 80 + "\n")
                return result
            except Exception as e:
                print("[VIZ_GENERATOR_REPL] ERROR:")
                print(str(e))
                print("=" * 80)
                print("[VIZ_GENERATOR_REPL] CODE EXECUTION FAILED")
                print("=" * 80 + "\n")
                raise
        else:
            # For other tools, just pass through
            return handler(request)

    # ============================================================
    # 4. Get examples
    # ============================================================
    system_instruction = get_system_instruction(config.pipeline.current_date)
    examples = build_few_shot_examples_string("viz_insight_generator")

    # ============================================================
    # 5. Create user prompt from template
    # ============================================================
    # Use manual string replacement to avoid .format() issues with curly braces in examples
    data_str = json.dumps(viz_plan.data, indent=2)
    labels_str = json.dumps(viz_plan.labels, indent=2)

    print(f"[VIZ_GENERATOR] data_str: {data_str}")
    print(f"[VIZ_GENERATOR] labels_str: {labels_str}")

    # Manual replacement to avoid .format() interpreting braces in examples/data
    user_prompt = VIZ_INSIGHT_GENERATOR_PROMPT
    user_prompt = user_prompt.replace("{chart_type}", viz_plan.chart_type)
    user_prompt = user_prompt.replace("{title}", viz_plan.title)
    user_prompt = user_prompt.replace("{subtitle}", viz_plan.subtitle or "")
    user_prompt = user_prompt.replace("{labels}", labels_str)
    user_prompt = user_prompt.replace("{data}", data_str)
    user_prompt = user_prompt.replace(
        "{visualization_context}", viz_plan.visualization_context
    )
    user_prompt = user_prompt.replace("{examples}", examples)

    # ============================================================
    # 6. Create agent WITHOUT structured output
    # ============================================================
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_instruction,
        middleware=[monitor_viz_generator_tools],
    )

    # ============================================================
    # 7. Run agent to generate Vega-Lite code and spec
    # ============================================================
    result = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": user_prompt,
                }
            ]
        }
    )

    print(f"[VIZ_GENERATOR] result keys: {result.keys()}")

    # ============================================================
    # 8. Extract agent's final response
    # ============================================================
    messages = result.get("messages", [])
    final_message = None
    for msg in reversed(messages):
        if hasattr(msg, "type") and msg.type == "ai":
            content = msg.content
            # Handle both string and list formats
            if isinstance(content, list):
                # Extract text from list format: [{'type': 'text', 'text': '...'}]
                for item in content:
                    if isinstance(item, dict) and item.get("type") == "text":
                        final_message = item.get("text", "")
                        break
            elif isinstance(content, str):
                final_message = content

            if final_message:
                break

    if not final_message:
        raise ValueError("Agent did not return a response")

    print(f"[VIZ_GENERATOR] Agent response (first 500 chars): {final_message[:500]}...")

    # ============================================================
    # 9. Try to parse the response as JSON (ONLY from agent's final message)
    # ============================================================
    vega_spec = None

    # Parse the final message directly as JSON (do NOT use REPL outputs)
    try:
        # Strip whitespace and try parsing
        final_message_stripped = final_message.strip()
        vega_spec = json.loads(final_message_stripped)
        if isinstance(vega_spec, dict) and "$schema" in vega_spec:
            print(
                f"[VIZ_GENERATOR] Successfully parsed spec from agent response (keys: {list(vega_spec.keys())})"
            )
        else:
            vega_spec = None
    except Exception as e:
        print(f"[VIZ_GENERATOR] Direct JSON parsing failed: {e}")
        vega_spec = None

    # ============================================================
    # 10. If parsing failed, use retry loop with simpler LLM call
    # ============================================================
    retry_llm = get_llm("viz_generator_parser", config)

    max_retries = 3
    retry_count = 0

    while not vega_spec and retry_count < max_retries:
        retry_count += 1
        print(
            f"\n[VIZ_GENERATOR] Parsing failed. Retry {retry_count}/{max_retries}: Asking LLM for clean JSON..."
        )

        # Use centralized retry prompt from templates with FULL context (no truncation)
        retry_prompt = VIZ_INSIGHT_GENERATOR_RETRY_PROMPT.format(
            chart_type=viz_plan.chart_type,
            title=viz_plan.title,
            subtitle=viz_plan.subtitle or "",
            labels=json.dumps(viz_plan.labels, indent=2),
            data=json.dumps(viz_plan.data, indent=2),  # Full data, no truncation
            visualization_context=viz_plan.visualization_context,
            previous_response=final_message,  # Full response, no truncation
        )

        retry_result = retry_llm.invoke(retry_prompt)
        retry_response_raw = (
            retry_result.content
            if hasattr(retry_result, "content")
            else str(retry_result)
        )

        # Handle list format in retry response
        retry_response = retry_response_raw
        if isinstance(retry_response_raw, list):
            # Extract text from list format: [{'type': 'text', 'text': '...'}]
            for item in retry_response_raw:
                if isinstance(item, dict) and item.get("type") == "text":
                    retry_response = item.get("text", "")
                    break

        print(
            f"[VIZ_GENERATOR] Retry response (first 300 chars): {retry_response[:300]}..."
        )

        # Try to parse retry response
        try:
            retry_response_stripped = retry_response.strip()
            vega_spec = json.loads(retry_response_stripped)
            if isinstance(vega_spec, dict) and "$schema" in vega_spec:
                print(
                    f"[VIZ_GENERATOR] Successfully parsed spec from retry {retry_count}"
                )
                break
            else:
                vega_spec = None
        except json.JSONDecodeError as e:
            print(f"[VIZ_GENERATOR] Retry {retry_count} JSON parsing failed: {e}")
            # Try to extract JSON from text (in case it's wrapped in markdown or other text)
            try:
                # Look for content between first { and last }
                start_idx = retry_response.find("{")
                end_idx = retry_response.rfind("}")
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    json_str = retry_response[start_idx : end_idx + 1]
                    vega_spec = json.loads(json_str)
                    if isinstance(vega_spec, dict) and "$schema" in vega_spec:
                        print(
                            f"[VIZ_GENERATOR] Successfully extracted and parsed JSON from retry {retry_count}"
                        )
                        break
                    else:
                        vega_spec = None
            except Exception as e:
                print(
                    f"[VIZ_GENERATOR] JSON extraction from retry {retry_count} failed: {e}"
                )
                vega_spec = None

        # Update final_message for next retry
        final_message = retry_response

    # Final fallback: create minimal spec if all attempts failed
    if not vega_spec or not isinstance(vega_spec, dict):
        print(
            f"\n[VIZ_GENERATOR] WARNING: All parsing attempts failed, using minimal fallback spec"
        )
        vega_spec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "description": viz_plan.visualization_context,
            "data": {"values": viz_plan.data if viz_plan.data else []},
            "mark": (
                viz_plan.chart_type.lower().replace(" ", "_")
                if viz_plan.chart_type
                else "point"
            ),
            "encoding": {},
        }

    # ============================================================
    # 7. Thread handling
    # ============================================================
    selected_thread_id = state.get("selected_thread_id")

    new_thread_created = False
    if not selected_thread_id:
        selected_thread_id = f"thread_{str(uuid.uuid4())}"
        new_thread_created = True

    # ============================================================
    # 8. Create VizInsight object
    # ============================================================
    # Get retrieved documents from state (passed by viz_planner)
    viz_retrieved_documents = state.get("viz_retrieved_documents", {})

    # Create cited documents with sources
    from models.insights import create_cited_documents

    cited_docs = create_cited_documents(
        document_ids=viz_plan.source_document_ids,
        retrieved_documents=viz_retrieved_documents,
        config=config,
    )

    insight_explanation = ""

    # Make sure insight_explanation is not None (replace with actual data if None)
    if viz_plan.insight_explanation:
        insight_explanation = viz_plan.insight_explanation
    else:
        insight_explanation = f""" 
        Chart Type: {viz_plan.chart_type}
        Title: {viz_plan.title}
        Subtitle: {viz_plan.subtitle}
        Visualization Context: {viz_plan.visualization_context}
        Data: {json.dumps(viz_plan.data, indent=2) if viz_plan.data else 'None'}
        Labels: {json.dumps(viz_plan.labels, indent=2) if viz_plan.labels else 'None'}
        """

    insight = VizInsight(
        query_id=primary_query.id if primary_query else str(uuid.uuid4()),
        query_text=primary_query.text if primary_query else "",
        topic_id=current_topic_id,
        source_chunk_id=source_chunk_id,
        thread_id=selected_thread_id,
        chart_type=viz_plan.chart_type,
        chart_title=viz_plan.title,
        subtitle=viz_plan.subtitle,
        data=vega_spec,  # Store the Vega-Lite spec
        explanation=insight_explanation,
        cited_documents=cited_docs,
    )

    # ============================================================
    # 9. DEPRECATED: Store insight in vector DB
    # InsightStore removed — only used by the broken related_insight_finder pipeline
    # ============================================================
    # from services.insight_store import InsightStore
    # insight_store = InsightStore.get_instance()
    # if insight_store:
    #     insight_text = f"[VIZ: {viz_plan.chart_type}] {viz_plan.title}: {viz_plan.insight_explanation}"
    #     insight_store.add_insight(
    #         insight_id=insight.id,
    #         text=insight_text,
    #         thread_id=selected_thread_id,
    #         topic_id=current_topic_id,
    #         metadata={
    #             "query_id": primary_query.id if primary_query else None,
    #             "query_text": primary_query.text if primary_query else "",
    #             "source_chunk_id": source_chunk_id,
    #             "chart_type": viz_plan.chart_type,
    #         },
    #     )

    # ============================================================
    # 10. Create or update InsightThread
    # ============================================================
    updates = {
        "insights": {insight.id: insight},
    }

    insight_threads = state.get("insight_threads", {})
    topics_dict = state.get("topics", {})

    if new_thread_created:
        # Create new thread
        new_thread = InsightThread(
            id=selected_thread_id,
            insight_ids=[insight.id],
            topic_id=current_topic_id,
        )
        updates["insight_threads"] = {selected_thread_id: new_thread}

        # Add thread to topic - create a copy with updated thread list
        if current_topic_id and current_topic_id in topics_dict:
            topic = topics_dict[current_topic_id]
            # Create a copy using model_copy()
            updated_topic = topic.model_copy(deep=True)
            if selected_thread_id not in updated_topic.thread_ids:
                updated_topic.thread_ids.append(selected_thread_id)
                updated_topic.updated_at = datetime.now()
                updates["topics"] = {current_topic_id: updated_topic}
    else:
        # Update existing thread - create a copy
        if selected_thread_id in insight_threads:
            thread = insight_threads[selected_thread_id]
            # Create a copy using model_copy()
            updated_thread = thread.model_copy(deep=True)
            updated_thread.insight_ids.append(insight.id)
            updates["insight_threads"] = {selected_thread_id: updated_thread}

    # ============================================================
    # 11. Return state updates
    # ============================================================
    return updates
