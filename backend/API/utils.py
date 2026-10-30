"""
Utility functions for the InsightToast API.

This module provides helper functions for data serialization, SSE formatting,
logging, and payload transformation.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from zoneinfo import ZoneInfo

from pydantic import BaseModel

# Make pipeline modules importable
PIPELINE_DIR = Path(__file__).resolve().parent.parent / "pipeline"
if str(PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(PIPELINE_DIR))

from config import RAGConfig, get_default_config


def get_current_time(config: Optional[RAGConfig] = None) -> datetime:
    """
    Get current time in the configured timezone.

    Args:
        config: Optional RAG configuration (defaults to get_default_config())

    Returns:
        Timezone-aware datetime object in the configured timezone

    Example:
        >>> get_current_time()  # Returns datetime in America/New_York timezone
        datetime.datetime(2026, 2, 13, 12, 0, 0, tzinfo=zoneinfo.ZoneInfo('America/New_York'))
    """
    if config is None:
        config = get_default_config()
    tz = ZoneInfo(config.pipeline.timezone)
    return datetime.now(tz)


def _parse_iso_datetime(raw_value: Any) -> Optional[datetime]:
    """Parse ISO-8601 datetime safely, including trailing Z."""
    if not isinstance(raw_value, str) or not raw_value.strip():
        return None
    candidate = raw_value.strip()
    if candidate.endswith("Z"):
        candidate = candidate[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(candidate)
    except Exception:
        return None


def clean_click_analytics_report(
    batch_payload: Dict[str, Any],
    conversation_id: str,
    client_id: str,
    received_at: str,
) -> Dict[str, Any]:
    """Validate, dedupe, and order click analytics into a report format."""
    raw_events = (
        batch_payload.get("events", []) if isinstance(batch_payload, dict) else []
    )
    submitted_count = len(raw_events) if isinstance(raw_events, list) else 0

    if not isinstance(raw_events, list):
        raw_events = []

    invalid_count = 0
    deduped_count = 0
    seen_event_ids: set[str] = set()
    accepted: List[Dict[str, Any]] = []

    for index, raw_event in enumerate(raw_events):
        if not isinstance(raw_event, dict):
            invalid_count += 1
            continue

        event_id = str(raw_event.get("event_id", "")).strip()
        event_name = str(raw_event.get("event_name", "")).strip()
        event_time = str(raw_event.get("event_time", "")).strip()

        if not event_id or not event_name or not event_time:
            invalid_count += 1
            continue

        if event_id in seen_event_ids:
            deduped_count += 1
            continue

        seen_event_ids.add(event_id)

        parsed_time = _parse_iso_datetime(event_time)
        normalized_event = {
            **raw_event,
            "event_id": event_id,
            "event_name": event_name,
            "event_time": event_time,
            "server_received_at": received_at,
            "_sequence": index,
            "_parsed_event_time": parsed_time.isoformat() if parsed_time else None,
        }
        accepted.append(normalized_event)

    accepted.sort(
        key=lambda event: (
            event.get("_parsed_event_time") is None,
            event.get("_parsed_event_time") or "",
            event.get("_sequence", 0),
        )
    )

    event_name_counts: Dict[str, int] = {}
    output_events: List[Dict[str, Any]] = []
    for event in accepted:
        name = event.get("event_name", "unknown")
        event_name_counts[name] = event_name_counts.get(name, 0) + 1

        output_event = {
            key: value
            for key, value in event.items()
            if key not in {"_sequence", "_parsed_event_time"}
        }
        output_events.append(output_event)

    return {
        "header": {
            "conversation_id": conversation_id,
            "client_id": client_id,
            "received_at": received_at,
            "submitted_count": submitted_count,
            "accepted_count": len(output_events),
            "deduped_count": deduped_count,
            "invalid_count": invalid_count,
            "session_seq": (
                batch_payload.get("session_seq")
                if isinstance(batch_payload, dict)
                else None
            ),
            "app_version": (
                batch_payload.get("app_version")
                if isinstance(batch_payload, dict)
                else None
            ),
            "event_name_counts": event_name_counts,
        },
        "events": output_events,
    }


def to_jsonable(value: Any) -> Any:
    """
    Recursively convert a value to a JSON-serializable format.

    Handles Pydantic models, datetime objects, dictionaries, lists, and tuples.

    Args:
        value: The value to convert (can be BaseModel, datetime, dict, list, tuple, or primitive)

    Returns:
        JSON-serializable version of the input value

    Example:
        >>> from datetime import datetime
        >>> to_jsonable({"date": datetime(2024, 1, 1)})
        {'date': '2024-01-01T00:00:00'}
    """
    if isinstance(value, BaseModel):
        return to_jsonable(value.model_dump())
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(k): to_jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_jsonable(v) for v in value]
    return value


def format_sse(event_name: str, data: Dict[str, Any]) -> str:
    """
    Format data as a Server-Sent Event (SSE) string.

    Args:
        event_name: The SSE event name
        data: The event data dictionary

    Returns:
        Formatted SSE string with event name and JSON data

    Example:
        >>> format_sse("test", {"key": "value"})
        'event: test\\ndata: {"key":"value"}\\n\\n'
    """
    return f"event: {event_name}\ndata: {json.dumps(to_jsonable(data), ensure_ascii=True)}\n\n"


def unwrap_node_output(node_output: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    """
    Extract node name and payload from LangGraph node output.

    LangGraph stream updates come as {node_name: {state_updates}}.
    This function unwraps to get the node name and actual payload.

    Args:
        node_output: Raw node output dictionary from LangGraph stream

    Returns:
        Tuple of (node_name, payload_dict)

    Example:
        >>> unwrap_node_output({"procedural_check": {"is_procedural": True}})
        ('procedural_check', {'is_procedural': True})
    """
    if (
        isinstance(node_output, dict)
        and len(node_output) == 1
        and isinstance(next(iter(node_output.values())), dict)
    ):
        node_name = next(iter(node_output.keys()))
        return node_name, next(iter(node_output.values()))
    return "unknown", node_output


def compact_query(query: Any) -> Dict[str, Any]:
    """
    Create a compact representation of a Query object for study logs.

    Includes essential query information: text, hypothetical response, retrieval metrics,
    attempted queries, and feedback actions. Filters out verbose internal state.

    Args:
        query: Query object (from RAG pipeline state)

    Returns:
        Dictionary with compact query information suitable for analysis

    Example:
        >>> compact_query(query_obj)
        {'query_id': '...', 'query_text': '...', 'retrieval_metrics': {...}}
    """
    retrieval_metrics = getattr(query, "retrieval_metrics", None)
    attempted_queries = getattr(query, "attempted_queries", []) or []
    return {
        "query_id": getattr(query, "id", None),
        "query_text": getattr(query, "text", ""),
        "hypothetical_response": getattr(query, "hypothetical_response", None),
        "suggested_insight_types": getattr(query, "suggested_insight_types", []),
        "retriever_feedback_action": getattr(query, "retriever_feedback_action", None),
        "retrieval_feedback": getattr(query, "retrieval_feedback", None),
        "iteration_count": getattr(query, "iteration_count", 0),
        "retrieved_document_count": len(
            getattr(query, "retrieved_documents", {}) or {}
        ),
        "retrieval_metrics": to_jsonable(retrieval_metrics),
        "attempted_queries": [
            {
                "search_query": getattr(item, "search_query", ""),
                "document_types": getattr(item, "document_types", []),
                "date_range": getattr(item, "date_range", None),
                "top_k": getattr(item, "top_k", None),
                "docs_retrieved": getattr(item, "docs_retrieved", None),
            }
            for item in attempted_queries
        ],
    }


def format_topic_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format topic detector output for frontend consumption.

    Includes topic action, current topic ID, and created topic details if applicable.

    Args:
        payload: Raw payload from topic_detector node

    Returns:
        Formatted topic payload with action and topic details
    """
    output = {
        "topic_action": payload.get("topic_action"),
        "current_topic_id": payload.get("current_topic_id"),
    }
    if payload.get("topic_action") == "create_topic":
        topics = payload.get("topics", {}) or {}
        current_topic_id = payload.get("current_topic_id")
        created_topic = topics.get(current_topic_id)
        if created_topic is not None:
            output["created_topic"] = to_jsonable(created_topic)
    return output


def format_meeting_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format meeting tracker output for frontend consumption.

    Extracts meeting summary, key-value pairs, and title from meeting_info object.

    Args:
        payload: Raw payload from meeting_tracker node

    Returns:
        Formatted meeting payload with summary, key values, and title
    """
    meeting_info = payload.get("meeting_info")
    if not meeting_info:
        return {}
    return {
        "meeting_summary": getattr(meeting_info, "summary", ""),
        "meeting_key_values": getattr(meeting_info, "key_values", {}),
        "meeting_title": getattr(meeting_info, "title", ""),
    }


def format_related_insight_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format related insight finder output for frontend consumption.

    Includes selected related insight details and thread ID.

    Args:
        payload: Raw payload from related_insight_finder node

    Returns:
        Formatted related insight payload with insight and thread details
    """
    related = payload.get("selected_related_insight")
    if not related:
        return {
            "selected_related_insight": None,
            "selected_thread_id": payload.get("selected_thread_id"),
        }
    return {
        "selected_related_insight": to_jsonable(related),
        "selected_thread_id": payload.get("selected_thread_id"),
    }


def session_log_dir(base_dir: Path, conversation_id: str) -> Path:
    """
    Get or create the session-specific log directory.

    Creates a subdirectory under base_dir named after the conversation_id.

    Args:
        base_dir: Base directory for all study logs
        conversation_id: Unique conversation identifier

    Returns:
        Path to the session-specific log directory

    Example:
        >>> session_log_dir(Path("study logs"), "conv_123")
        PosixPath('study logs/conv_123')
    """
    session_dir = base_dir / conversation_id
    session_dir.mkdir(parents=True, exist_ok=True)
    return session_dir


def study_log_path(base_dir: Path, conversation_id: str) -> Path:
    """
    Get the path to the study log file for a conversation.

    Study logs contain filtered, analysis-focused events.

    Args:
        base_dir: Base directory for all study logs
        conversation_id: Unique conversation identifier

    Returns:
        Path to the study.json file
    """
    return session_log_dir(base_dir, conversation_id) / "study.json"


def full_log_path(base_dir: Path, conversation_id: str) -> Path:
    """
    Get the path to the full debug log file for a conversation.

    Full logs contain all state updates for debugging purposes.

    Args:
        base_dir: Base directory for all study logs
        conversation_id: Unique conversation identifier

    Returns:
        Path to the full.json file
    """
    return session_log_dir(base_dir, conversation_id) / "full.json"
