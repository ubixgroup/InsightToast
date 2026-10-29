"""
Entry point and API interface for the Multi-Agentic RAG Pipeline.

Provides a streaming interface to run the pipeline and manage conversation state.
Uses LangGraph stream_mode="updates" to emit raw state updates after each node completion.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Generator, List, Optional, Tuple

from pydantic import BaseModel

from config import RAGConfig, get_default_config
from graph import create_rag_pipeline
from models.state import (
    RAGPipelineState,
    MeetingInfo,
    PERSISTENT_FIELDS,
    TranscriptSegment,
    TranscriptInput,
    create_initial_state,
)
from models.topics import Topic
from models.insights import Insight, InsightThread, TextInsight, VizInsight

# DEPRECATED: TranscriptStore and InsightStore only used by removed insight_query_constructor pipeline
# from services.transcript_store import TranscriptStore
# from services.insight_store import InsightStore
from services.retriever import RetrieverService


@dataclass
class PipelineOutput:
    """Final output from the RAG pipeline for frontend consumption."""

    # Meeting-level information
    meeting_title: str = ""
    meeting_summary: str = ""
    meeting_key_values: Dict[str, str] = field(default_factory=dict)

    # Topics
    topics: List[Dict[str, Any]] = field(default_factory=list)

    # Current processing info
    current_topic_id: Optional[str] = None
    current_topic_name: Optional[str] = None

    # Insights - ALL insights across all topics
    insights: List[Dict[str, Any]] = field(default_factory=list)

    # Insight threads - ALL threads with their insight IDs
    insight_threads: List[Dict[str, Any]] = field(default_factory=list)

    # Newly generated insights in this chunk (if any)
    generated_insights: List[Dict[str, Any]] = field(default_factory=list)

    # Processing metadata
    was_halted: bool = False
    error: Optional[str] = None
    processing_time_ms: Optional[float] = None


class ConversationManager:
    """
    Manages the state of an ongoing conversation with streaming support.

    Uses LangGraph stream_mode="updates" to emit events after each node.
    Maintains state across multiple transcript chunks.
    """

    def __init__(
        self,
        config: Optional[RAGConfig] = None,
        session_id: Optional[str] = None,
    ):
        self.config = config or get_default_config()
        self._state: Optional[Dict[str, Any]] = None
        self._history: List[Dict[str, Any]] = []
        self._pipeline = create_rag_pipeline(self.config)

        # Track insight IDs to detect newly generated insights
        self._previous_insight_ids: set = set()

        # Generate session ID if not provided by caller
        session_id = session_id or f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # DEPRECATED: transcript_store and insight_store removed (broken related_insight_finder pipeline)
        # self._transcript_store = TranscriptStore.get_instance(
        #     config=self.config,
        #     session_id=session_id,
        # )
        # self._transcript_store = None

        # DEPRECATED: insight_store removed
        # self._insight_store = InsightStore.get_instance(
        #     config=self.config,
        #     session_id=session_id,
        # )
        # self._insight_store = None

        # Initialize retriever service singleton
        RetrieverService.get_instance(config=self.config)

    @property
    def topics(self) -> Dict[str, Topic]:
        """Get the current topics."""
        if self._state:
            return self._state.get("topics", {})
        return {}

    @property
    def meeting_info(self) -> Optional[MeetingInfo]:
        """Get the current meeting info."""
        if self._state:
            return self._state.get("meeting_info")
        return None

    def process_transcript(
        self, transcript_input: TranscriptInput
    ) -> Generator[Tuple, None, PipelineOutput]:
        """
        Process a new transcript chunk with streaming raw state updates.

        Yields raw tuples (namespace, node_output) from LangGraph stream.
        Returns final PipelineOutput when generator is exhausted.

        Args:
            transcript_input: The transcript input with content and speaker

        Yields:
            Tuple of (namespace, node_output) where:
            - namespace is () for main graph or ("parent:id", "child:id", ...) for subgraphs
            - node_output is Dict[str, Any] with state field updates

        Returns:
            PipelineOutput with final results
        """
        start_time = datetime.now()
        final_output = PipelineOutput()

        try:
            # Track insights before processing to detect new ones
            insights_before = (
                set(self._state.get("insights", {}).keys()) if self._state else set()
            )

            # Create initial state
            initial_state = create_initial_state(transcript_input, self._state)

            # Stream through the pipeline with "updates" mode and subgraphs enabled
            # With subgraphs=True, each update is a tuple: (namespace, node_output_dict)
            # namespace is () for main graph or ("parent:id", "child:id") for subgraphs
            for update in self._pipeline.stream(
                initial_state, stream_mode="updates", subgraphs=True
            ):
                # Yield raw tuple directly
                yield update

                # Update internal state progressively
                # Extract node_output from the tuple structure
                if isinstance(update, tuple) and len(update) == 2:
                    _, node_output = update
                    if isinstance(node_output, dict):
                        self._update_state(node_output)

            # Build final output
            if self._state:
                # Detect newly generated insights
                insights_after = set(self._state.get("insights", {}).keys())
                new_insight_ids = list(insights_after - insights_before)

                final_output = self._build_output(self._state, new_insight_ids)

            # Record history
            self._history.append(
                {
                    "timestamp": datetime.now().isoformat(),
                    "transcript_chunk": transcript_input.content,
                    "speaker": transcript_input.speaker,
                    "was_halted": (
                        self._state.get("should_halt", False) if self._state else False
                    ),
                }
            )

        except Exception as e:
            import traceback
            import sys

            error_msg = f"{type(e).__name__}: {str(e)}"
            full_traceback = traceback.format_exc()
            # Use sys.stderr.write with try/except to avoid BrokenPipeError
            try:
                sys.stderr.write(f"\n[ERROR] Pipeline execution failed\n")
                sys.stderr.write(f"[ERROR] {error_msg}\n")
                sys.stderr.write(f"[ERROR] Full traceback:\n{full_traceback}\n")
                sys.stderr.flush()
            except (BrokenPipeError, OSError):
                pass  # Ignore if stderr is broken
            # Yield error as tuple
            yield ((), {"error": error_msg})
            final_output.error = error_msg
            final_output.was_halted = True

        # Calculate processing time
        end_time = datetime.now()
        final_output.processing_time_ms = (end_time - start_time).total_seconds() * 1000

        return final_output

    def _update_state(self, node_output: Dict[str, Any]) -> None:
        """Progressively update internal state from node output."""
        from models.state import reduce_dict_by_id, reduce_queries

        if self._state is None:
            self._state = {}

        # LangGraph stream with stream_mode="updates" returns: {node_name: state_updates}
        # Extract the actual state updates (skip node name wrapper)
        state_updates = node_output

        # If node_output has a single key that's a node name wrapper, extract the inner dict
        if len(node_output) == 1:
            inner_key = list(node_output.keys())[0]
            inner_value = node_output[inner_key]
            # Check if this looks like a state updates dict
            if isinstance(inner_value, dict):
                state_updates = inner_value

        # Merge state updates using proper reducers
        for key, value in state_updates.items():
            if value is None:
                continue

            # Apply reducers for fields that need them
            if key in {"topics", "insights", "insight_threads"}:
                # Dict reducers - merge by ID
                existing = self._state.get(key, {})
                self._state[key] = reduce_dict_by_id(existing, value)
            elif key == "queries":
                # Query reducer - merge by ID
                existing = self._state.get(key, [])
                self._state[key] = reduce_queries(existing, value)
            elif key == "transcript_segments":
                # List accumulator
                existing = self._state.get(key, [])
                self._state[key] = existing + (
                    value if isinstance(value, list) else [value]
                )
            else:
                # Simple replacement (last write wins)
                self._state[key] = value

    def _build_output(
        self,
        state: RAGPipelineState,
        newly_generated_insight_ids: Optional[List[str]] = None,
    ) -> PipelineOutput:
        """Build PipelineOutput from state."""
        output = PipelineOutput()

        # Meeting info
        meeting_info = state.get("meeting_info")
        if meeting_info:
            output.meeting_title = meeting_info.title
            output.meeting_summary = meeting_info.summary
            output.meeting_key_values = meeting_info.key_values

        # Topics with thread information
        topics = state.get("topics", {})
        insight_threads = state.get("insight_threads", {})
        output.topics = [
            {
                "id": topic.id,
                "name": topic.name,
                "description": topic.description,
                "transcript_segment_count": len(topic.transcript_segment_ids),
                "thread_count": len(topic.thread_ids),
                "created_at": topic.created_at.isoformat(),
                "updated_at": topic.updated_at.isoformat(),
            }
            for topic in topics.values()
        ]

        # Current topic
        current_topic_id = state.get("current_topic_id")
        if current_topic_id and current_topic_id in topics:
            output.current_topic_id = current_topic_id
            output.current_topic_name = topics[current_topic_id].name

        # All insights
        insights = state.get("insights", {})
        output.insights = [
            self._format_insight(insight) for insight in insights.values()
        ]

        # All insight threads with their insight IDs
        output.insight_threads = [
            {
                "id": thread.id,
                "topic_id": thread.topic_id,
                "insight_ids": list(thread.insight_ids),
            }
            for thread in insight_threads.values()
        ]

        # Newly generated insights (if any)
        if newly_generated_insight_ids:
            for insight_id in newly_generated_insight_ids:
                if insight_id in insights:
                    insight = insights[insight_id]
                    insight_dict = self._format_insight(insight)
                    # Add thread info if available
                    if hasattr(insight, "thread_id") and insight.thread_id:
                        insight_dict["thread_id"] = insight.thread_id
                        if insight.thread_id in insight_threads:
                            thread = insight_threads[insight.thread_id]
                            insight_dict["thread_info"] = {
                                "thread_id": thread.id,
                                "insight_count": len(thread.insight_ids),
                                "topic_id": thread.topic_id,
                            }
                    output.generated_insights.append(insight_dict)

        # Was halted
        output.was_halted = state.get("should_halt", False)

        return output

    def _format_insight(self, insight: Insight) -> Dict[str, Any]:
        """Format an insight for output."""
        base = {
            "id": insight.id,
            "type": insight.insight_type.value,
            "query_id": insight.query_id,
            "query_text": insight.query_text,
            "topic_id": insight.topic_id,
            "created_at": insight.created_at.isoformat(),
        }

        # Add thread_id if available
        if hasattr(insight, "thread_id") and insight.thread_id:
            base["thread_id"] = insight.thread_id

        if isinstance(insight, TextInsight):
            base["title"] = insight.title
            base["content"] = insight.content
            base["cited_document_ids"] = insight.cited_document_ids
        elif isinstance(insight, VizInsight):
            base["chart_type"] = insight.chart_type
            base["chart_title"] = insight.chart_title
            base["subtitle"] = insight.subtitle
            base["data"] = insight.data
            base["explanation"] = insight.explanation
            base["cited_document_ids"] = insight.cited_document_ids

        return base

    def export_state(self) -> Dict[str, Any]:
        """Export persistent conversation state for serialization."""
        state = self._state or {}
        persistent = {
            field: self._to_jsonable(state.get(field))
            for field in PERSISTENT_FIELDS
            if field in state
        }
        return {
            "state": persistent,
            "history": self._to_jsonable(self._history),
        }

    def restore_state(self, snapshot: Dict[str, Any]) -> None:
        """Restore persistent conversation state from a serialized snapshot."""
        state_data = (snapshot or {}).get("state", {}) or {}
        restored_state: Dict[str, Any] = {}

        if "meeting_info" in state_data and state_data["meeting_info"]:
            restored_state["meeting_info"] = MeetingInfo.model_validate(
                state_data["meeting_info"]
            )

        if "topics" in state_data and state_data["topics"]:
            restored_state["topics"] = {
                topic_id: Topic.model_validate(topic)
                for topic_id, topic in state_data["topics"].items()
            }

        if "insights" in state_data and state_data["insights"]:
            insights: Dict[str, Insight] = {}
            for insight_id, insight_data in state_data["insights"].items():
                insight_type = (insight_data or {}).get("insight_type")
                if insight_type == "viz":
                    insights[insight_id] = VizInsight.model_validate(insight_data)
                else:
                    insights[insight_id] = TextInsight.model_validate(insight_data)
            restored_state["insights"] = insights

        if "insight_threads" in state_data and state_data["insight_threads"]:
            restored_state["insight_threads"] = {
                thread_id: InsightThread.model_validate(thread)
                for thread_id, thread in state_data["insight_threads"].items()
            }

        if "transcript_segments" in state_data and state_data["transcript_segments"]:
            restored_state["transcript_segments"] = [
                TranscriptSegment.model_validate(segment)
                for segment in state_data["transcript_segments"]
            ]

        restored_state["current_topic_id"] = state_data.get("current_topic_id")

        self._state = restored_state
        self._history = (snapshot or {}).get("history", []) or []

    def _to_jsonable(self, value: Any) -> Any:
        """Convert nested values to JSON-serializable structures."""
        if isinstance(value, BaseModel):
            return value.model_dump(mode="json")
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, dict):
            return {str(k): self._to_jsonable(v) for k, v in value.items()}
        if isinstance(value, (list, tuple)):
            return [self._to_jsonable(v) for v in value]
        return value

    def close_session(self, dump_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Close the session and cleanup resources.

        Dumps transcript chunks and insight threads to file and clears Qdrant collections.

        Args:
            dump_path: Optional path to save session data. If None, uses default.

        Returns:
            Session summary with statistics
        """
        session_summary = {
            "chunks_processed": len(self._history),
            "topics_created": len(self.topics),
            "insights_generated": (
                len(self._state.get("insights", {})) if self._state else 0
            ),
            "insight_threads": (
                len(self._state.get("insight_threads", {})) if self._state else 0
            ),
            "session_ended": datetime.now().isoformat(),
        }

        output_dir = Path(dump_path) if dump_path else None

        # DEPRECATED: transcript_store and insight_store removed
        # if self._transcript_store:
        #     transcript_dump_file = self._transcript_store.close_session(
        #         save_dump=True, output_dir=output_dir
        #     )
        #     session_summary["transcript_dump_file"] = (
        #         str(transcript_dump_file) if transcript_dump_file else None
        #     )

        # DEPRECATED: insight_store removed
        # if self._insight_store:
        #     insight_dump_file = self._insight_store.close_session(
        #         save_dump=True, output_dir=output_dir
        #     )
        #     session_summary["insight_dump_file"] = (
        #         str(insight_dump_file) if insight_dump_file else None
        #     )

        # Reset state
        self._state = None
        self._history = []

        return session_summary

    def get_transcript_history(self) -> List[Dict[str, Any]]:
        """Get the transcript processing history."""
        return self._history.copy()


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================


def process_single_chunk(
    transcript_input: TranscriptInput,
    config: Optional[RAGConfig] = None,
) -> PipelineOutput:
    """
    Process a single transcript chunk without maintaining state.

    Consumes the generator and returns final output.
    Useful for testing or one-off processing.
    """
    manager = ConversationManager(config)
    generator = manager.process_transcript(transcript_input)

    # Consume all events
    final_output = None
    try:
        while True:
            next(generator)
    except StopIteration as e:
        final_output = e.value

    manager.close_session()
    return final_output


def create_conversation(config: Optional[RAGConfig] = None) -> ConversationManager:
    """Create a new conversation manager."""
    return ConversationManager(config)


# =============================================================================
# CLI INTERFACE
# =============================================================================


def main():
    """Command-line interface for testing the pipeline."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Multi-Agentic RAG Pipeline with Streaming Support"
    )
    parser.add_argument(
        "transcript",
        nargs="?",
        help="Transcript chunk to process (or use --interactive)",
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Run in interactive mode",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON",
    )
    parser.add_argument(
        "--stream",
        action="store_true",
        help="Show streaming events",
    )

    args = parser.parse_args()

    if args.interactive:
        print("Multi-Agentic RAG Pipeline - Interactive Mode (Streaming)")
        print("=" * 60)
        print("Enter transcript chunks (empty line to exit):")
        print()

        manager = create_conversation()

        while True:
            try:
                chunk = input("> ").strip()
                if not chunk:
                    break

                transcript_input = TranscriptInput(content=chunk)
                generator = manager.process_transcript(transcript_input)

                # Process raw updates
                final_output = None
                try:
                    while True:
                        update = next(generator)
                        if args.stream:
                            print(f"  Update: {update}")
                except StopIteration as e:
                    final_output = e.value

                if final_output:
                    if args.json:
                        print(json.dumps(final_output.__dict__, indent=2, default=str))
                    else:
                        print(f"\nProcessed in {final_output.processing_time_ms:.0f}ms")
                        if final_output.was_halted:
                            print("  Status: Halted (procedural content)")
                        else:
                            print(
                                f"  Topic: {final_output.current_topic_name or 'None'}"
                            )
                            for insight in final_output.generated_insights:
                                content = insight.get("content") or insight.get(
                                    "explanation", ""
                                )
                                print(f"  Insight: {content[:100]}...")
                        print()

            except KeyboardInterrupt:
                break

        # Close session
        summary = manager.close_session()
        print(f"\nSession closed. {summary}")

    elif args.transcript:
        transcript_input = TranscriptInput(content=args.transcript)

        if args.stream:
            manager = create_conversation()
            generator = manager.process_transcript(transcript_input)

            final_output = None
            try:
                while True:
                    update = next(generator)
                    print(f"Update: {update}")
            except StopIteration as e:
                final_output = e.value

            manager.close_session()
        else:
            final_output = process_single_chunk(transcript_input)

        if final_output:
            if args.json:
                print(json.dumps(final_output.__dict__, indent=2, default=str))
            else:
                print(f"Processed in {final_output.processing_time_ms:.0f}ms")
                if final_output.error:
                    print(f"Error: {final_output.error}")
                elif final_output.was_halted:
                    print("Status: Halted (procedural content)")
                else:
                    print(f"Topic: {final_output.current_topic_name or 'None'}")
                    for insight in final_output.generated_insights:
                        print(f"Insight Type: {insight.get('type')}")
                        print(
                            f"Content: {insight.get('content') or insight.get('explanation', '')}"
                        )
