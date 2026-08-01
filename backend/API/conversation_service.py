"""
API service for managing multi-agentic RAG conversation sessions.

Handles conversation lifecycle, real-time streaming, and session management
with support for concurrent conversations.
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import sys
import threading
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, Generator, List, Optional, Tuple
from urllib.parse import urlparse

import requests
from fastapi import HTTPException
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Make pipeline modules importable when API is launched from project root.
PIPELINE_DIR = Path(__file__).resolve().parent.parent / "pipeline"
if str(PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(PIPELINE_DIR))

from config import RAGConfig, get_default_config
from models.insights import TextInsight, VizInsight
from models.state import TranscriptInput
from run import ConversationManager
from services.kb_search import search_kb, search_source_urls

# Import utility functions
from API.utils import (
    clean_click_analytics_report,
    to_jsonable,
    format_sse,
    unwrap_node_output,
    compact_query,
    format_topic_payload,
    format_meeting_payload,
    session_log_dir,
    study_log_path,
    full_log_path,
    get_current_time,
)


@dataclass
class _SessionContext:
    """Context for an active conversation session."""

    conversation_id: str
    manager: Optional[ConversationManager]
    config: RAGConfig
    started_at: datetime
    is_baseline: bool = False
    chunk_index: int = 0
    study_events: List[Dict[str, Any]] = field(default_factory=list)
    full_events: List[Dict[str, Any]] = field(default_factory=list)

    # v2 fields
    participants: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    client_ids: set[str] = field(default_factory=set)
    event_queues: Dict[str, asyncio.Queue[str]] = field(default_factory=dict)
    transcript_queue: Optional[asyncio.Queue[Optional[Dict[str, Any]]]] = None
    worker_task: Optional[asyncio.Task[Any]] = None
    livekit_room_name: Optional[str] = None
    client_chat_histories: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    client_search_logs: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    client_click_analytics: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    client_explain_logs: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    client_speaker_names: Dict[str, List[str]] = field(default_factory=dict)
    is_closing: bool = False
    selected_insight_id: Optional[str] = None
    pinned_insight_ids: List[str] = field(default_factory=list)
    archived_insight_ids: List[str] = field(default_factory=list)


class ConversationAPIService:
    """
    API service for managing multi-agentic RAG conversations.

    Supports multiple concurrent conversations with thread-safe session management.
    Each conversation maintains its own ConversationManager instance and accumulates
    events in memory for later writing to disk.
    """

    # Node names that emit study log events
    STUDY_LOG_NODES = {
        "procedural_check",
        "topic_detector",
        "meeting_tracker",
        "insight_need_assessment",
        "query_constructor",
        "text_insight_generator",
        "viz_generator",
    }

    def __init__(self) -> None:
        """Initialize service state and runtime persistence paths."""
        self._sessions: Dict[str, _SessionContext] = {}
        self._sessions_lock = threading.Lock()
        self._event_queue_maxsize = 200
        self._transcript_queue_maxsize = 200

        root_dir = Path(__file__).resolve().parent.parent
        self._study_logs_dir = root_dir / "study logs"
        self._study_logs_dir.mkdir(parents=True, exist_ok=True)

        self._v2_state_dir = root_dir / "session_dumps" / "v2_state"
        self._v2_state_dir.mkdir(parents=True, exist_ok=True)

        self._registered_conversations_path = (
            root_dir / "session_dumps" / "registered_conversations.json"
        )
        self._api_keys_path = root_dir / "session_dumps" / "api_keys.json"
        self._admin_password = os.getenv("ADMIN_PASSWORD")
        self._registered_conversations = self._load_registered_conversations()
        self._api_keys_lock = threading.Lock()
        self._api_keys = self._load_api_keys()
        self._deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")
        self._speechmatics_api_key = os.getenv("SPEECHMATICS_API_KEY")
        self._livekit_api_key = os.getenv("LIVEKIT_API_KEY")
        self._livekit_api_secret = os.getenv("LIVEKIT_API_SECRET")
        self._livekit_url = os.getenv("LIVEKIT_URL")
        self._frontend_google_api_key = os.getenv("FRONTEND_GOOGLE_API_KEY")

        raw_ttl = os.getenv("V2_UNREGISTERED_CONVERSATION_TTL_SECONDS", "900")
        try:
            self._unregistered_ttl_seconds = max(1, int(raw_ttl))
        except (TypeError, ValueError):
            self._unregistered_ttl_seconds = 900

    # ---------------------------------------------------------------------
    # Common helpers
    # ---------------------------------------------------------------------

    def _handle_procedural_check(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from procedural_check node."""
        if "is_procedural" not in payload:
            return None
        return {
            "is_procedural": payload.get("is_procedural"),
            "procedural_reasoning": payload.get("procedural_reasoning"),
        }

    def _handle_topic_detector(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from topic_detector node."""
        if "topic_action" not in payload:
            return None
        return format_topic_payload(payload)

    def _handle_meeting_tracker(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from meeting_tracker node."""
        if "meeting_info" not in payload:
            return None
        return format_meeting_payload(payload)

    def _handle_insight_need_assessment(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from insight_need_assessment node."""
        if "insight_needed" not in payload:
            return None
        return {
            "insight_needed": payload.get("insight_needed"),
            "insight_need_reasoning": payload.get("insight_need_reasoning"),
        }

    def _handle_query_constructor(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from query_constructor node."""
        if "queries" not in payload:
            return None
        queries_data = [compact_query(query) for query in payload.get("queries", [])]
        return {"queries": queries_data}

    def _handle_related_insight_finder(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from related_insight_finder node."""
        selected_related_insight = payload.get("selected_related_insight")

        insight_id = None
        thread_id = payload.get("selected_thread_id")

        if selected_related_insight is not None:
            insight_id = getattr(selected_related_insight, "id", None)
            if thread_id is None:
                thread_id = getattr(selected_related_insight, "thread_id", None)

        return {
            "insight_id": insight_id,
            "thread_id": thread_id,
        }

    def _handle_retriever_planner(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from retriever_planner node."""
        query = payload.get("query")
        if query is None:
            return None

        attempted_queries = getattr(query, "attempted_queries", [])
        if not attempted_queries:
            return {
                "retrieved_document_count": 0,
                "document_types": [],
            }

        latest_attempt = attempted_queries[-1]

        return {
            "retrieved_document_count": getattr(latest_attempt, "docs_retrieved", 0),
            "document_types": getattr(latest_attempt, "document_types", []),
        }

    def _handle_insight_selector(
        self, payload: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Extract data from insight_selector node."""
        generator_assignments = payload.get("generator_assignments", [])

        generator_types = list(
            {
                assignment.get("generator_type")
                for assignment in generator_assignments
                if assignment.get("generator_type") is not None
            }
        )

        return {
            "generator_types": generator_types,
        }

    def _format_conversation_id(self, base_id: str) -> str:
        """Format conversation ID with timestamp suffix."""
        safe = (base_id or "").strip()
        if not safe:
            raise HTTPException(status_code=422, detail="conversation_id is required")
        suffix = get_current_time().strftime("%Y%m%d_%H%M%S")
        return f"{safe}__{suffix}"

    def _generate_v2_conversation_id(self) -> str:
        """Generate a conversation ID for v2 when none is provided."""
        return f"conversation_{get_current_time().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"

    def _conversation_mode(self, session: _SessionContext) -> str:
        """Get canonical conversation mode string for API responses."""
        return "baseline" if session.is_baseline else "experimental"

    def _require_experimental_mode_v2(
        self,
        session: _SessionContext,
        endpoint_name: str,
    ) -> None:
        """Guard endpoints that require multi-agent pipeline runtime."""
        if session.is_baseline:
            raise HTTPException(
                status_code=409,
                detail=(f"{endpoint_name} is unavailable for baseline conversations"),
            )

    def _get_session(self, conversation_id: str) -> _SessionContext:
        """Get an active session by conversation ID."""
        with self._sessions_lock:
            if conversation_id not in self._sessions:
                raise HTTPException(
                    status_code=404,
                    detail=f"Conversation '{conversation_id}' not found",
                )
            return self._sessions[conversation_id]

    def _participants_list(self, session: _SessionContext) -> List[Dict[str, Any]]:
        """Return participants in API response format."""
        return [
            {
                "speaker_name": p["speaker_name"],
                "joined_at": p["joined_at"],
                "client_id": p["client_id"],
            }
            for p in session.participants.values()
        ]

    def _new_insight_events(
        self,
        payload: Dict[str, Any],
        seen_ids: set[str],
    ) -> list[Dict[str, Any]]:
        """Extract newly generated insights from payload with thread information."""
        insights = payload.get("insights", {}) or {}
        threads = payload.get("insight_threads", {}) or {}
        events: list[Dict[str, Any]] = []

        for insight_id, insight in insights.items():
            if insight_id in seen_ids:
                continue
            seen_ids.add(insight_id)

            thread_id = getattr(insight, "thread_id", None)
            thread_obj = threads.get(thread_id) if thread_id else None
            event_payload: Dict[str, Any] = {
                "id": insight_id,
                "type": getattr(getattr(insight, "insight_type", None), "value", None),
                "created_at": getattr(insight, "created_at", None),
                "thread": {
                    "thread_id": thread_id,
                    "topic_id": (
                        getattr(thread_obj, "topic_id", None)
                        if thread_obj
                        else getattr(insight, "topic_id", None)
                    ),
                    "insight_ids": (
                        getattr(thread_obj, "insight_ids", None) if thread_obj else None
                    ),
                },
            }

            if isinstance(insight, TextInsight):
                event_payload.update(
                    {
                        "title": insight.title,
                        "content": insight.content,
                        "cited_documents": to_jsonable(insight.cited_documents),
                    }
                )
            elif isinstance(insight, VizInsight):
                event_payload.update(
                    {
                        "chart_type": insight.chart_type,
                        "chart_title": insight.chart_title,
                        "subtitle": insight.subtitle,
                        "data": insight.data,
                        "cited_documents": to_jsonable(insight.cited_documents),
                    }
                )
            events.append(event_payload)
        return events

    def _write_session_logs(self, session: _SessionContext) -> None:
        """Write session logs to disk."""
        study_path = study_log_path(self._study_logs_dir, session.conversation_id)
        full_path = full_log_path(self._study_logs_dir, session.conversation_id)

        with open(study_path, "w", encoding="utf-8") as f:
            json.dump(
                to_jsonable(session.study_events), f, indent=2, ensure_ascii=False
            )

        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(to_jsonable(session.full_events), f, indent=2, ensure_ascii=False)

        self._write_client_logs(session)

    def _sanitize_path_token(self, value: str) -> str:
        """Sanitize user-provided values for directory names."""
        cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", (value or "").strip())
        cleaned = re.sub(r"_+", "_", cleaned).strip("_.-")
        return cleaned or "unknown"

    def _client_speaker_names(
        self, session: _SessionContext, client_id: str
    ) -> List[str]:
        """Resolve speaker names for a client, preferring cached join payload."""
        names = session.client_speaker_names.get(client_id, [])
        if names:
            return names

        inferred = [
            participant.get("speaker_name", "")
            for participant in session.participants.values()
            if participant.get("client_id") == client_id
        ]
        return [name for name in inferred if name]

    def _client_log_dir(self, session: _SessionContext, client_id: str) -> Path:
        """Create and return per-client study log directory."""
        speakers = self._client_speaker_names(session, client_id)
        speaker_suffix = "_".join(self._sanitize_path_token(name) for name in speakers)
        folder_name = (
            f"{self._sanitize_path_token(client_id)}__{speaker_suffix}"
            if speaker_suffix
            else self._sanitize_path_token(client_id)
        )
        return (
            session_log_dir(self._study_logs_dir, session.conversation_id) / folder_name
        )

    def _write_client_logs(
        self,
        session: _SessionContext,
        client_id: Optional[str] = None,
    ) -> None:
        """Write per-client LLM chat history, KB search, explain, and click analytics logs to disk."""
        target_ids = (
            [client_id]
            if client_id
            else sorted(
                set(session.client_chat_histories.keys())
                | set(session.client_search_logs.keys())
                | set(session.client_explain_logs.keys())
                | set(session.client_click_analytics.keys())
                | set(session.client_speaker_names.keys())
            )
        )

        for target_client_id in target_ids:
            client_dir = self._client_log_dir(session, target_client_id)
            client_dir.mkdir(parents=True, exist_ok=True)

            chat_history_path = client_dir / "llm_chat_history.json"
            kb_search_path = client_dir / "kb_search.json"
            explain_log_path = client_dir / "explain_log.json"
            click_analytics_path = client_dir / "click_analytics.json"

            with open(chat_history_path, "w", encoding="utf-8") as f:
                json.dump(
                    to_jsonable(
                        session.client_chat_histories.get(target_client_id, [])
                    ),
                    f,
                    indent=2,
                    ensure_ascii=False,
                )

            with open(kb_search_path, "w", encoding="utf-8") as f:
                json.dump(
                    to_jsonable(session.client_search_logs.get(target_client_id, [])),
                    f,
                    indent=2,
                    ensure_ascii=False,
                )

            with open(explain_log_path, "w", encoding="utf-8") as f:
                json.dump(
                    to_jsonable(session.client_explain_logs.get(target_client_id, [])),
                    f,
                    indent=2,
                    ensure_ascii=False,
                )

            click_report = session.client_click_analytics.get(target_client_id)
            if click_report is not None:
                with open(click_analytics_path, "w", encoding="utf-8") as f:
                    json.dump(
                        to_jsonable(click_report),
                        f,
                        indent=2,
                        ensure_ascii=False,
                    )

    def _normalize_llm_content(self, content: Any) -> str:
        """Normalize LangChain model content into plain text."""
        if isinstance(content, str):
            return content.strip()

        if isinstance(content, list):
            parts: List[str] = []
            for item in content:
                if isinstance(item, str):
                    if item.strip():
                        parts.append(item.strip())
                elif isinstance(item, dict):
                    text = item.get("text")
                    if isinstance(text, str) and text.strip():
                        parts.append(text.strip())
            return "\n".join(parts).strip()

        return str(content).strip() if content is not None else ""

    def _iter_chunk_events(
        self,
        session: _SessionContext,
        conversation_id: str,
        content: str,
        speaker: Optional[str],
    ) -> Generator[Tuple[str, Dict[str, Any]], None, None]:
        """Process one chunk and emit structured events for SSE/broadcast."""
        manager = session.manager
        if manager is None:
            raise RuntimeError("Conversation manager is unavailable for this session")

        chunk_index = session.chunk_index
        session.chunk_index += 1

        config = session.config
        chunk_started = get_current_time(config).isoformat()

        seen_insights: set[str] = set(
            (manager._state or {}).get("insights", {}).keys()  # noqa: SLF001
        )

        transcript = TranscriptInput(content=content, speaker=speaker)
        generator = manager.process_transcript(transcript)

        transcript_segment_id: Optional[str] = None

        chunk_header = {
            "timestamp": chunk_started,
            "conversation_id": conversation_id,
            "chunk_index": chunk_index,
            "transcript_chunk": content,
            "speaker": speaker,
            "transcript_id": None,
        }
        session.study_events.append(chunk_header)
        session.full_events.append(chunk_header)
        yield "chunk_started", chunk_header

        try:
            while True:
                namespace, node_output = next(generator)
                node_name, payload = unwrap_node_output(node_output)
                now = get_current_time(config).isoformat()

                if transcript_segment_id is None and manager._state:  # noqa: SLF001
                    segments = manager._state.get(
                        "transcript_segments", []
                    )  # noqa: SLF001
                    if segments:
                        transcript_segment_id = getattr(segments[-1], "id", None)

                base_event = {
                    "timestamp": now,
                    "conversation_id": conversation_id,
                    "chunk_index": chunk_index,
                    "transcript_chunk": content,
                    "speaker": speaker,
                    "transcript_id": transcript_segment_id,
                }

                full_record = {
                    **base_event,
                    "namespace": namespace,
                    "node_name": node_name,
                    "payload": payload,
                }
                session.full_events.append(full_record)

                if "error" in payload:
                    error_event = {
                        **base_event,
                        "node_name": node_name,
                        "error": payload.get("error"),
                    }
                    session.study_events.append(error_event)
                    yield "error", error_event
                    continue

                node_data = None
                if node_name == "procedural_check":
                    node_data = self._handle_procedural_check(payload)
                elif node_name == "topic_detector":
                    node_data = self._handle_topic_detector(payload)
                elif node_name == "meeting_tracker":
                    node_data = self._handle_meeting_tracker(payload)
                elif node_name == "insight_need_assessment":
                    node_data = self._handle_insight_need_assessment(payload)
                elif node_name == "query_constructor":
                    node_data = self._handle_query_constructor(payload)
                elif node_name == "related_insight_finder":
                    node_data = self._handle_related_insight_finder(payload)
                elif node_name == "retriever_planner":
                    node_data = self._handle_retriever_planner(payload)
                elif node_name == "insight_selector":
                    node_data = self._handle_insight_selector(payload)
                elif node_name in ("text_insight_generator", "viz_generator"):
                    new_insight_payloads = self._new_insight_events(
                        payload, seen_insights
                    )
                    for insight_data in new_insight_payloads:
                        event_payload = {
                            **base_event,
                            "node_name": node_name,
                            "insight": insight_data,
                        }
                        session.study_events.append(event_payload)
                        yield "insight_generated", event_payload

                if node_data is not None:
                    event_payload = {
                        **base_event,
                        "node_name": node_name,
                        **node_data,
                    }
                    session.study_events.append(event_payload)
                    yield node_name, event_payload

        except StopIteration as stop:
            final_output = stop.value
            now = get_current_time(config).isoformat()
            completion_payload = {
                "timestamp": now,
                "conversation_id": conversation_id,
                "chunk_index": chunk_index,
                "transcript_chunk": content,
                "speaker": speaker,
                "transcript_id": transcript_segment_id,
                "processing_time_ms": (
                    final_output.processing_time_ms if final_output else None
                ),
            }
            session.study_events.append(completion_payload)
            session.full_events.append(completion_payload)
            yield "chunk_complete", completion_payload
        except Exception as exc:
            now = get_current_time(config).isoformat()
            error_payload = {
                "timestamp": now,
                "conversation_id": conversation_id,
                "chunk_index": chunk_index,
                "transcript_chunk": content,
                "speaker": speaker,
                "transcript_id": transcript_segment_id,
                "error": f"{type(exc).__name__}: {exc}",
            }
            session.study_events.append(error_payload)
            session.full_events.append(error_payload)
            yield "error", error_payload

    # ---------------------------------------------------------------------
    # v1 API (unchanged behavior)
    # ---------------------------------------------------------------------

    def start_conversation(
        self,
        client_conversation_id: str,
        current_date: Optional[str] = None,
        verbose: bool = False,
    ) -> Dict[str, Any]:
        """Start a new v1 conversation session."""
        conversation_id = self._format_conversation_id(client_conversation_id)

        with self._sessions_lock:
            if conversation_id in self._sessions:
                raise HTTPException(
                    status_code=409,
                    detail=f"Conversation '{conversation_id}' already exists",
                )

            config = get_default_config()
            if current_date:
                config.pipeline.current_date = current_date
            config.pipeline.verbose = verbose

            manager = ConversationManager(config=config, session_id=conversation_id)
            self._sessions[conversation_id] = _SessionContext(
                conversation_id=conversation_id,
                manager=manager,
                config=config,
                started_at=get_current_time(config),
            )

        return {
            "conversation_id": conversation_id,
            "started_at": self._sessions[conversation_id].started_at.isoformat(),
            "status": "started",
        }

    def end_conversation(self, conversation_id: str) -> Dict[str, Any]:
        """End a v1 conversation session and write logs to disk."""
        with self._sessions_lock:
            if conversation_id not in self._sessions:
                raise HTTPException(
                    status_code=404,
                    detail=f"Conversation '{conversation_id}' not found",
                )
            session = self._sessions.pop(conversation_id)

        self._write_session_logs(session)

        if session.manager is None:
            session_summary = {
                "chunks_processed": len(session.study_events),
                "topics_created": 0,
                "insights_generated": 0,
                "insight_threads": 0,
                "session_ended": datetime.now().isoformat(),
            }
        else:
            session_summary = session.manager.close_session(
                dump_path=str(self._study_logs_dir)
            )

        return {
            "conversation_id": conversation_id,
            "status": "ended",
            "session_summary": to_jsonable(session_summary),
        }

    def stream_chunk(
        self,
        conversation_id: str,
        content: str,
        speaker: Optional[str],
    ) -> Generator[str, None, None]:
        """Process a transcript chunk and stream real-time updates via SSE (v1)."""
        session = self._get_session(conversation_id)
        for event_name, event_payload in self._iter_chunk_events(
            session=session,
            conversation_id=conversation_id,
            content=content,
            speaker=speaker,
        ):
            yield format_sse(event_name, event_payload)

    # ---------------------------------------------------------------------
    # v2 state persistence + registration
    # ---------------------------------------------------------------------

    def _state_file_path(self, conversation_id: str) -> Path:
        """Build on-disk snapshot path for a v2 conversation."""
        safe_name = conversation_id.replace("/", "_")
        return self._v2_state_dir / f"{safe_name}.json"

    def _delete_state_snapshot(self, conversation_id: str) -> bool:
        """Delete persisted session snapshot if present."""
        state_file = self._state_file_path(conversation_id)
        if not state_file.exists():
            return False
        state_file.unlink()
        return True

    def _write_json_atomic(self, path: Path, payload: Dict[str, Any]) -> None:
        """Atomically write JSON payload to disk to avoid partial writes."""
        path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = path.with_suffix(path.suffix + ".tmp")
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        os.replace(temp_path, path)

    def _extract_bearer_token(self, authorization_header: Optional[str]) -> str:
        """Extract bearer token from Authorization header."""
        if not authorization_header or not authorization_header.startswith("Bearer "):
            raise HTTPException(
                status_code=401, detail="Missing or invalid authorization"
            )
        token = authorization_header.split(" ", 1)[1].strip()
        if not token:
            raise HTTPException(status_code=401, detail="Missing bearer token")
        return token

    def _validate_admin_token(self, authorization_header: Optional[str]) -> None:
        """Validate admin bearer token against ADMIN_PASSWORD."""
        if not self._admin_password:
            raise HTTPException(status_code=404, detail="Admin endpoint is disabled")
        token = self._extract_bearer_token(authorization_header)
        if not hmac.compare_digest(token, self._admin_password):
            raise HTTPException(status_code=401, detail="Invalid admin token")

    def _hash_api_key(self, api_key: str) -> str:
        """Hash API key for secure at-rest storage."""
        return hashlib.sha256(api_key.encode("utf-8")).hexdigest()

    def _load_api_keys(self) -> Dict[str, Dict[str, Any]]:
        """Load API key metadata from disk."""
        if not self._api_keys_path.exists():
            return {}
        try:
            with open(self._api_keys_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            api_keys = data.get("api_keys", {}) if isinstance(data, dict) else {}
            return api_keys if isinstance(api_keys, dict) else {}
        except Exception:
            return {}

    def _persist_api_keys(self) -> None:
        """Persist API key metadata to disk."""
        self._write_json_atomic(
            self._api_keys_path,
            {
                "api_keys": self._api_keys,
                "updated_at": get_current_time().isoformat(),
            },
        )

    def _load_registered_conversations(self) -> set[str]:
        """Load registered study conversation IDs from disk."""
        if not self._registered_conversations_path.exists():
            return set()
        try:
            with open(self._registered_conversations_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            conversation_ids = (
                data.get("conversation_ids", []) if isinstance(data, dict) else []
            )
            return {str(item).strip() for item in conversation_ids if str(item).strip()}
        except Exception:
            return set()

    def _persist_registered_conversations(self) -> None:
        """Persist registered study conversation IDs to disk."""
        self._write_json_atomic(
            self._registered_conversations_path,
            {
                "conversation_ids": sorted(self._registered_conversations),
                "updated_at": get_current_time().isoformat(),
            },
        )

    def register_conversations_v2(
        self,
        authorization_header: Optional[str],
        conversation_ids: List[str],
    ) -> Dict[str, Any]:
        """Register allowed study conversation IDs via admin-protected endpoint."""
        self._validate_admin_token(authorization_header)

        clean_ids = {item.strip() for item in conversation_ids if item and item.strip()}
        self._registered_conversations.update(clean_ids)
        self._persist_registered_conversations()

        return {
            "registered_count": len(clean_ids),
            "total_registered": len(self._registered_conversations),
        }

    def validate_admin_password_v2(
        self,
        authorization_header: Optional[str],
    ) -> Dict[str, Any]:
        """Validate admin bearer password for v2 admin access."""
        self._validate_admin_token(authorization_header)
        return {"is_valid": True}

    def create_api_key_v2(
        self,
        authorization_header: Optional[str],
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate and persist a new API key for v2 endpoint access."""
        self._validate_admin_token(authorization_header)

        now = get_current_time().isoformat()
        key_id = f"key_{uuid.uuid4().hex[:12]}"
        raw_key = f"sk_v2_{secrets.token_urlsafe(32)}"
        key_prefix = raw_key[:12]
        entry = {
            "key_prefix": key_prefix,
            "name": name.strip() if name else None,
            "hashed_key": self._hash_api_key(raw_key),
            "created_at": now,
            "revoked": False,
            "revoked_at": None,
        }

        with self._api_keys_lock:
            self._api_keys[key_id] = entry
            self._persist_api_keys()

        return {
            "key_id": key_id,
            "key_prefix": key_prefix,
            "api_key": raw_key,
            "created_at": now,
            "name": entry["name"],
        }

    def list_api_keys_v2(self, authorization_header: Optional[str]) -> Dict[str, Any]:
        """List API key metadata for admin inspection (without secret values)."""
        self._validate_admin_token(authorization_header)

        with self._api_keys_lock:
            items = []
            for key_id, item in self._api_keys.items():
                items.append(
                    {
                        "key_id": key_id,
                        "key_prefix": item.get("key_prefix"),
                        "created_at": item.get("created_at"),
                        "name": item.get("name"),
                        "revoked": bool(item.get("revoked", False)),
                        "revoked_at": item.get("revoked_at"),
                    }
                )

        items.sort(key=lambda x: (x.get("created_at") or ""), reverse=True)
        return {"api_keys": items}

    def revoke_api_key_v2(
        self,
        authorization_header: Optional[str],
        key_id: str,
    ) -> Dict[str, Any]:
        """Revoke an existing API key so it can no longer access v2 endpoints."""
        self._validate_admin_token(authorization_header)

        with self._api_keys_lock:
            if key_id not in self._api_keys:
                raise HTTPException(status_code=404, detail="API key not found")

            key_data = self._api_keys[key_id]
            key_data["revoked"] = True
            key_data["revoked_at"] = get_current_time().isoformat()
            self._persist_api_keys()

        return {"key_id": key_id, "revoked": True}

    def validate_v2_api_key(self, api_key: str) -> Dict[str, Any]:
        """Validate API key for v2 conversation endpoint access."""
        if not api_key:
            raise HTTPException(status_code=401, detail="Missing API key")

        submitted_hash = self._hash_api_key(api_key)

        with self._api_keys_lock:
            matched_key_id: Optional[str] = None
            matched_item: Optional[Dict[str, Any]] = None
            for key_id, item in self._api_keys.items():
                stored_hash = item.get("hashed_key", "")
                if hmac.compare_digest(submitted_hash, stored_hash):
                    matched_key_id = key_id
                    matched_item = item
                    break

        if not matched_key_id or not matched_item:
            raise HTTPException(status_code=401, detail="Invalid API key")

        if matched_item.get("revoked"):
            raise HTTPException(status_code=401, detail="API key is revoked")

        return {
            "key_id": matched_key_id,
            "key_prefix": matched_item.get("key_prefix"),
            "name": matched_item.get("name"),
        }

    def _is_registered_conversation(self, conversation_id: str) -> bool:
        """Return whether a conversation is currently registered."""
        return conversation_id in self._registered_conversations

    def _parse_iso_datetime(self, raw_value: Any) -> Optional[datetime]:
        """Parse an ISO datetime string safely."""
        if not raw_value or not isinstance(raw_value, str):
            return None
        try:
            return datetime.fromisoformat(raw_value)
        except Exception:
            return None

    def _conversation_expires_at(
        self,
        conversation_id: str,
        started_at: datetime,
    ) -> Optional[datetime]:
        """Return expiry datetime for unregistered conversations, else None."""
        if self._is_registered_conversation(conversation_id):
            return None
        return started_at + timedelta(seconds=self._unregistered_ttl_seconds)

    def _is_conversation_expired(
        self,
        conversation_id: str,
        started_at: datetime,
    ) -> bool:
        """Check if an unregistered conversation is expired."""
        expires_at = self._conversation_expires_at(conversation_id, started_at)
        if expires_at is None:
            return False
        return get_current_time() >= expires_at

    def _snapshot_started_at(self, conversation_id: str) -> Optional[datetime]:
        """Read started_at from persisted snapshot when available."""
        snapshot = self._load_v2_session_snapshot(conversation_id)
        if not snapshot:
            return None
        return self._parse_iso_datetime(snapshot.get("started_at"))

    def _require_membership_v2(
        self,
        conversation_id: str,
        client_id: str,
        allow_expired: bool = False,
    ) -> _SessionContext:
        """Require that client_id belongs to this active conversation."""
        if not client_id or not client_id.strip():
            raise HTTPException(status_code=422, detail="client_id is required")

        try:
            session = self._get_session(conversation_id)
        except HTTPException as exc:
            if exc.status_code == 404 and not self._is_registered_conversation(
                conversation_id
            ):
                snapshot_started_at = self._snapshot_started_at(conversation_id)
                if snapshot_started_at and self._is_conversation_expired(
                    conversation_id,
                    snapshot_started_at,
                ):
                    raise HTTPException(
                        status_code=410, detail="Conversation is expired"
                    )
            raise

        if (not allow_expired) and self._is_conversation_expired(
            conversation_id, session.started_at
        ):
            raise HTTPException(status_code=410, detail="Conversation is expired")

        if client_id not in session.client_ids:
            raise HTTPException(
                status_code=403,
                detail="client_id is not registered for this conversation",
            )
        return session

    def list_conversations_v2(
        self, authorization_header: Optional[str]
    ) -> Dict[str, Any]:
        """List union of registered, active, and resumable v2 conversations."""
        self._validate_admin_token(authorization_header)

        with self._sessions_lock:
            active_sessions = dict(self._sessions)

        registered_ids = set(self._registered_conversations)
        snapshot_ids: set[str] = set()
        try:
            for state_file in self._v2_state_dir.glob("*.json"):
                snapshot_ids.add(state_file.stem)
        except Exception:
            snapshot_ids = set()

        all_ids = sorted(registered_ids | set(active_sessions.keys()) | snapshot_ids)
        conversations: List[Dict[str, Any]] = []

        for conversation_id in all_ids:
            active_session = active_sessions.get(conversation_id)
            snapshot = (
                self._load_v2_session_snapshot(conversation_id)
                if active_session is None and conversation_id in snapshot_ids
                else None
            )

            active_started_at = active_session.started_at if active_session else None
            snapshot_started_at = (
                self._parse_iso_datetime(snapshot.get("started_at"))
                if snapshot
                else None
            )
            started_at = active_started_at or snapshot_started_at

            is_baseline: Optional[bool] = None
            if active_session is not None:
                is_baseline = bool(active_session.is_baseline)
            elif snapshot is not None:
                is_baseline = bool(snapshot.get("is_baseline", False))

            expires_at = (
                self._conversation_expires_at(conversation_id, started_at)
                if started_at is not None
                else None
            )

            conversations.append(
                {
                    "conversation_id": conversation_id,
                    "is_registered": conversation_id in registered_ids,
                    "is_active": active_session is not None,
                    "has_snapshot": conversation_id in snapshot_ids,
                    "started_at": started_at.isoformat() if started_at else None,
                    "is_baseline": is_baseline,
                    "mode": (
                        "baseline"
                        if is_baseline is True
                        else ("experimental" if is_baseline is False else None)
                    ),
                    "expires_at": expires_at.isoformat() if expires_at else None,
                    "is_expired": (
                        get_current_time() >= expires_at
                        if expires_at is not None
                        else False
                    ),
                    "saved_at": snapshot.get("saved_at") if snapshot else None,
                    "participant_count": (
                        len(active_session.participants) if active_session else 0
                    ),
                    "client_count": (
                        len(active_session.client_ids) if active_session else 0
                    ),
                }
            )

        return {
            "conversations": conversations,
            "counts": {
                "total": len(conversations),
                "registered": len(registered_ids),
                "active": len(active_sessions),
                "resumable": len(snapshot_ids),
            },
        }

    async def remove_conversation_v2(
        self,
        authorization_header: Optional[str],
        conversation_id: str,
    ) -> Dict[str, Any]:
        """Remove a conversation from active sessions, snapshots, and registrations."""
        self._validate_admin_token(authorization_header)

        clean_id = (conversation_id or "").strip()
        if not clean_id:
            raise HTTPException(status_code=422, detail="conversation_id is required")

        with self._sessions_lock:
            active_session = self._sessions.get(clean_id)

        removed_active_session = active_session is not None
        if active_session is not None:
            await self._close_session_v2(
                active_session,
                reason="admin_removed",
                persist_snapshot=False,
            )

        removed_snapshot = self._delete_state_snapshot(clean_id)

        removed_registration = clean_id in self._registered_conversations
        if removed_registration:
            self._registered_conversations.remove(clean_id)
            self._persist_registered_conversations()

        existed_anywhere = (
            removed_active_session or removed_snapshot or removed_registration
        )

        return {
            "conversation_id": clean_id,
            "status": "removed" if existed_anywhere else "not_found",
            "existed_anywhere": existed_anywhere,
            "removed_active_session": removed_active_session,
            "removed_snapshot": removed_snapshot,
            "removed_registration": removed_registration,
        }

    def _build_hs256_jwt(self, secret: str, claims: Dict[str, Any]) -> str:
        """Build an HS256 JWT using stdlib only."""
        header = {"alg": "HS256", "typ": "JWT"}

        def _encode_part(value: Dict[str, Any]) -> bytes:
            raw = json.dumps(value, separators=(",", ":")).encode("utf-8")
            return base64.urlsafe_b64encode(raw).rstrip(b"=")

        signing_input = _encode_part(header) + b"." + _encode_part(claims)
        signature = hmac.new(
            secret.encode("utf-8"),
            signing_input,
            hashlib.sha256,
        ).digest()
        encoded_sig = base64.urlsafe_b64encode(signature).rstrip(b"=")
        return (signing_input + b"." + encoded_sig).decode("utf-8")

    def _create_livekit_server_token(self, ttl_seconds: int = 60) -> str:
        """Create short-lived server token for LiveKit room management APIs."""
        if not self._livekit_api_key or not self._livekit_api_secret:
            raise HTTPException(
                status_code=500, detail="LiveKit server config is missing"
            )

        now = int(time.time())
        claims = {
            "iss": self._livekit_api_key,
            "sub": "insighttoast-api",
            "nbf": now - 5,
            "exp": now + max(10, ttl_seconds),
            "video": {
                "roomCreate": True,
                "roomList": True,
                "roomAdmin": True,
            },
        }
        return self._build_hs256_jwt(self._livekit_api_secret, claims)

    def _livekit_http_base_url(self) -> str:
        """Convert LIVEKIT_URL to HTTP(S) base URL for server API calls."""
        if not self._livekit_url:
            raise HTTPException(status_code=500, detail="LIVEKIT_URL is not configured")

        parsed = urlparse(self._livekit_url)
        if parsed.scheme in {"ws", "wss"}:
            scheme = "https" if parsed.scheme == "wss" else "http"
        elif parsed.scheme in {"http", "https"}:
            scheme = parsed.scheme
        else:
            scheme = "https"

        host = parsed.netloc or parsed.path
        return f"{scheme}://{host}".rstrip("/")

    async def _close_livekit_room_if_present(self, session: _SessionContext) -> None:
        """Best-effort LiveKit room close when a conversation ends."""
        room_name = session.livekit_room_name
        if not room_name:
            return

        base_url = self._livekit_http_base_url()
        bearer_token = self._create_livekit_server_token(ttl_seconds=60)

        def _delete_room() -> None:
            requests.post(
                f"{base_url}/twirp/livekit.RoomService/DeleteRoom",
                headers={
                    "Authorization": f"Bearer {bearer_token}",
                    "Content-Type": "application/json",
                },
                json={"room": room_name},
                timeout=10,
            )

        try:
            await asyncio.to_thread(_delete_room)
        except Exception:
            pass

    async def issue_deepgram_token_v2(
        self,
        conversation_id: str,
        client_id: str,
        ttl_seconds: int,
    ) -> Dict[str, Any]:
        """Issue Deepgram temporary token for a conversation member."""
        self._require_membership_v2(conversation_id, client_id)
        if not self._deepgram_api_key:
            raise HTTPException(
                status_code=500, detail="DEEPGRAM_API_KEY is not configured"
            )

        clamped_ttl = max(1, min(int(ttl_seconds), 3600))

        def _request_token() -> Dict[str, Any]:
            try:
                response = requests.post(
                    "https://api.deepgram.com/v1/auth/grant",
                    headers={
                        "Authorization": f"Token {self._deepgram_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={"ttl_seconds": clamped_ttl},
                    timeout=10,
                )
            except requests.RequestException as exc:
                raise HTTPException(
                    status_code=502,
                    detail=f"Failed to reach Deepgram token endpoint: {exc}",
                ) from exc
            if response.status_code >= 400:
                error_body = (response.text or "").strip().replace("\n", " ")
                if len(error_body) > 300:
                    error_body = error_body[:300] + "..."
                raise HTTPException(
                    status_code=502,
                    detail=(
                        "Failed to create Deepgram token "
                        f"(status={response.status_code}, body={error_body})"
                    ),
                )
            data = response.json()
            access_token = data.get("access_token")
            if not access_token:
                raise HTTPException(
                    status_code=502, detail="Invalid Deepgram token response"
                )
            expires_in = data.get("expires_in")
            return {
                "provider": "deepgram",
                "access_token": access_token,
                "token_type": "Bearer",
                "expires_in": (
                    int(expires_in) if expires_in is not None else clamped_ttl
                ),
            }

        return await asyncio.to_thread(_request_token)

    async def issue_speechmatics_token_v2(
        self,
        conversation_id: str,
        client_id: str,
        ttl: int,
    ) -> Dict[str, Any]:
        """Issue Speechmatics realtime temporary key for a conversation member."""
        self._require_membership_v2(conversation_id, client_id)
        if not self._speechmatics_api_key:
            raise HTTPException(
                status_code=500, detail="SPEECHMATICS_API_KEY is not configured"
            )

        clamped_ttl = max(60, min(int(ttl), 86400))

        def _request_token() -> Dict[str, Any]:
            response = requests.post(
                "https://mp.speechmatics.com/v1/api_keys?type=rt",
                headers={
                    "Authorization": f"Bearer {self._speechmatics_api_key}",
                    "Content-Type": "application/json",
                },
                json={"ttl": clamped_ttl},
                timeout=10,
            )
            if response.status_code >= 400:
                raise HTTPException(
                    status_code=502,
                    detail="Failed to create Speechmatics temporary key",
                )
            data = response.json()
            key_value = data.get("key_value")
            if not key_value:
                raise HTTPException(
                    status_code=502, detail="Invalid Speechmatics token response"
                )
            return {
                "provider": "speechmatics",
                "key_value": key_value,
                "type": "rt",
                "expires_in": clamped_ttl,
            }

        return await asyncio.to_thread(_request_token)

    async def issue_livekit_token_v2(
        self,
        conversation_id: str,
        client_id: str,
        participant_identity: Optional[str],
        participant_name: Optional[str],
        participant_metadata: Optional[str],
        participant_attributes: Dict[str, str],
        ttl_seconds: int,
    ) -> Dict[str, Any]:
        """Issue LiveKit participant token for a conversation member."""
        session = self._require_membership_v2(conversation_id, client_id)
        if (
            not self._livekit_api_key
            or not self._livekit_api_secret
            or not self._livekit_url
        ):
            raise HTTPException(
                status_code=500, detail="LiveKit configuration is missing"
            )

        room_name = session.livekit_room_name or conversation_id
        session.livekit_room_name = room_name

        safe_identity = (
            participant_identity or f"{conversation_id}:{client_id}"
        ).strip()
        safe_name = (participant_name or safe_identity).strip()
        clamped_ttl = max(1, int(ttl_seconds))
        now = int(time.time())

        claims = {
            "iss": self._livekit_api_key,
            "sub": safe_identity,
            "nbf": now - 5,
            "exp": now + clamped_ttl,
            "name": safe_name,
            "video": {
                "roomJoin": True,
                "room": room_name,
                "canPublish": True,
                "canSubscribe": True,
            },
        }
        if participant_metadata:
            claims["metadata"] = participant_metadata
        if participant_attributes:
            claims["attributes"] = participant_attributes

        participant_token = self._build_hs256_jwt(self._livekit_api_secret, claims)
        return {
            "provider": "livekit",
            "room_name": room_name,
            "server_url": self._livekit_url,
            "participant_token": participant_token,
            "expires_in": clamped_ttl,
        }

    async def chat_with_client_llm_v2(
        self,
        conversation_id: str,
        client_id: str,
        prompt: str,
    ) -> Dict[str, Any]:
        """Run direct Gemini chat for a conversation client with local chat history."""
        session = self._require_membership_v2(conversation_id, client_id)

        clean_prompt = (prompt or "").strip()
        if not clean_prompt:
            raise HTTPException(status_code=422, detail="prompt is required")

        if not self._frontend_google_api_key:
            raise HTTPException(
                status_code=500,
                detail="FRONTEND_GOOGLE_API_KEY is not configured",
            )

        model_name = "gemini-flash-latest"
        temperature = 0.2
        history = session.client_chat_histories.setdefault(client_id, [])
        prior_history = history[-40:]

        def _invoke_chat() -> str:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                temperature=temperature,
                api_key=self._frontend_google_api_key,
                timeout=30,
            )

            messages = [
                SystemMessage(
                    content=(
                        "You are a helpful assistant answering questions. "
                        "Give responses in Markdown format for better rendering "
                        "if you need to bold, make list, and other basic formatting. "
                        "Keep responses concise and factual."
                    )
                )
            ]

            for entry in prior_history:
                role = entry.get("role")
                text = str(entry.get("content", "")).strip()
                if not text:
                    continue
                if role == "assistant":
                    messages.append(AIMessage(content=text))
                elif role == "user":
                    messages.append(HumanMessage(content=text))

            messages.append(HumanMessage(content=clean_prompt))
            result = llm.invoke(messages)
            response_text = self._normalize_llm_content(getattr(result, "content", ""))
            return response_text or "I couldn't generate a response right now."

        response_text = await asyncio.to_thread(_invoke_chat)
        now = get_current_time(session.config).isoformat()

        history.append({"role": "user", "content": clean_prompt, "timestamp": now})
        history.append(
            {"role": "assistant", "content": response_text, "timestamp": now}
        )
        if len(history) > 120:
            del history[:-120]

        self._write_client_logs(session, client_id=client_id)

        return {
            "conversation_id": conversation_id,
            "client_id": client_id,
            "response": response_text,
            "model": model_name,
            "timestamp": now,
        }

    async def search_kb_urls_v2(
        self,
        conversation_id: str,
        client_id: str,
        query: str,
    ) -> Dict[str, Any]:
        """Search knowledge base and return enriched results with URLs, titles, and previews."""
        session = self._require_membership_v2(conversation_id, client_id)

        clean_query = (query or "").strip()
        if not clean_query:
            raise HTTPException(status_code=422, detail="query is required")

        enriched_results = await asyncio.to_thread(
            search_kb,
            clean_query,
            session.config,
            10,
        )

        urls = [r["url"] for r in enriched_results]

        now = get_current_time(session.config).isoformat()
        search_logs = session.client_search_logs.setdefault(client_id, [])
        search_logs.append(
            {
                "timestamp": now,
                "query": clean_query,
                "urls": urls,
                "results": enriched_results,
                "result_count": len(urls),
            }
        )
        if len(search_logs) > 200:
            del search_logs[:-200]

        self._write_client_logs(session, client_id=client_id)

        return {
            "conversation_id": conversation_id,
            "client_id": client_id,
            "query": clean_query,
            "urls": urls,
            "results": enriched_results,
            "result_count": len(urls),
            "timestamp": now,
        }

    async def explain_text_v2(
        self,
        conversation_id: str,
        client_id: str,
        text: str,
    ) -> Dict[str, Any]:
        """Generate a concise one-sentence explanation for a text excerpt."""
        session = self._require_membership_v2(conversation_id, client_id)

        clean_text = (text or "").strip()
        if not clean_text:
            raise HTTPException(status_code=422, detail="text is required")

        if not self._frontend_google_api_key:
            raise HTTPException(
                status_code=500,
                detail="FRONTEND_GOOGLE_API_KEY is not configured",
            )

        model_name = "gemini-flash-lite-latest"

        def _invoke_explain() -> str:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                temperature=0.2,
                api_key=self._frontend_google_api_key,
                timeout=15,
            )
            messages = [
                SystemMessage(
                    content=(
                        "You are a concise explanation assistant. "
                        "Given a text excerpt from an insight (you will be given the insight and the text excerpt), "
                        "provide a single clear sentence explaining it in plain language. "
                        "Do not add any additional commentary. "
                        "Only one concise sentence to explain."
                    )
                ),
                HumanMessage(content=clean_text),
            ]
            result = llm.invoke(messages)
            return (
                self._normalize_llm_content(getattr(result, "content", ""))
                or "Unable to generate an explanation."
            )

        explanation = await asyncio.to_thread(_invoke_explain)
        now = get_current_time(session.config).isoformat()

        explain_logs = session.client_explain_logs.setdefault(client_id, [])
        explain_logs.append(
            {
                "timestamp": now,
                "text": clean_text,
                "explanation": explanation,
            }
        )
        if len(explain_logs) > 200:
            del explain_logs[:-200]

        self._write_client_logs(session, client_id=client_id)

        return {
            "conversation_id": conversation_id,
            "client_id": client_id,
            "text": clean_text,
            "explanation": explanation,
            "model": model_name,
            "timestamp": now,
        }

    # ---------------------------------------------------------------------
    # v2 session and broadcasting
    # ---------------------------------------------------------------------

    async def _ensure_worker(self, session: _SessionContext) -> None:
        """Ensure per-conversation transcript queue and worker are running."""
        if session.transcript_queue is None:
            session.transcript_queue = asyncio.Queue(
                maxsize=self._transcript_queue_maxsize
            )

        if session.worker_task is None or session.worker_task.done():
            session.worker_task = asyncio.create_task(
                self._transcript_worker(session.conversation_id)
            )

    async def _broadcast_event(
        self,
        session: _SessionContext,
        event_name: str,
        payload: Dict[str, Any],
    ) -> None:
        """Broadcast one SSE event to all connected clients of a session."""
        if not session.event_queues:
            return

        message = format_sse(event_name, payload)
        stale_clients: List[str] = []

        for client_id, queue in list(session.event_queues.items()):
            try:
                queue.put_nowait(message)
            except asyncio.QueueFull:
                try:
                    queue.get_nowait()
                    queue.put_nowait(message)
                except Exception:
                    stale_clients.append(client_id)
            except Exception:
                stale_clients.append(client_id)

        for client_id in stale_clients:
            session.event_queues.pop(client_id, None)

    def _normalize_snapshot_insights(
        self,
        raw_insights: Dict[str, Any],
        raw_threads: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Transform serialized (model_dump) insights to match the live SSE event shape.

        The live ``insight_generated`` events use ``type`` (not ``insight_type``),
        ``cited_documents`` (full objects, not ``cited_document_ids``), and a nested
        ``thread`` object.  ``export_state`` / ``model_dump`` produces the raw Pydantic
        field names which differ.  This helper normalises the snapshot dict so the
        frontend receives a consistent shape regardless of live vs. snapshot delivery.
        """
        if not raw_insights:
            return {}

        normalised: Dict[str, Any] = {}
        for insight_id, insight in raw_insights.items():
            entry: Dict[str, Any] = {"id": insight_id}

            # --- type ---
            raw_type = insight.get("type") or insight.get("insight_type")
            # Handle enum-style values (e.g. {"value": "text"})
            if isinstance(raw_type, dict):
                raw_type = raw_type.get("value", raw_type)
            entry["type"] = raw_type

            # --- passthrough scalar fields ---
            for key in (
                "created_at",
                "chart_type",
                "chart_title",
                "subtitle",
                "data",
                "explanation",
                "content",
                "title",
            ):
                if key in insight:
                    entry[key] = insight[key]

            # --- thread ---
            if "thread" in insight and isinstance(insight["thread"], dict):
                entry["thread"] = insight["thread"]
            else:
                thread_id = insight.get("thread_id")
                thread_obj = raw_threads.get(thread_id) if thread_id else None
                if isinstance(thread_obj, dict):
                    entry["thread"] = {
                        "thread_id": thread_obj.get("thread_id", thread_id),
                        "topic_id": thread_obj.get("topic_id", insight.get("topic_id")),
                        "insight_ids": thread_obj.get("insight_ids", [insight_id]),
                    }
                else:
                    entry["thread"] = {
                        "thread_id": thread_id,
                        "topic_id": insight.get("topic_id"),
                        "insight_ids": [insight_id],
                    }

            # --- cited_documents ---
            if "cited_documents" in insight:
                entry["cited_documents"] = insight["cited_documents"]
            elif "cited_document_ids" in insight:
                entry["cited_documents"] = [
                    {"document_id": did, "source_url": None}
                    for did in (insight["cited_document_ids"] or [])
                ]
            else:
                entry["cited_documents"] = []

            normalised[insight_id] = entry

        return normalised

    def _build_state_snapshot(self, session: _SessionContext) -> Dict[str, Any]:
        """Build a full state snapshot for SSE client initialization."""
        manager_snapshot = session.manager.export_state() if session.manager else {}
        state = manager_snapshot.get("state", {})
        history = manager_snapshot.get("history", []) or []
        transcript_segments = state.get("transcript_segments", []) or []

        # Build transcript_chunks with explicit chunk_index
        transcript_chunks = []
        for idx, item in enumerate(history):
            transcript_chunks.append(
                {
                    "chunk_index": idx,
                    "timestamp": item.get("timestamp"),
                    "content": item.get("transcript_chunk"),
                    "speaker": item.get("speaker"),
                    "was_halted": item.get("was_halted"),
                }
            )

        # Baseline conversations do not use ConversationManager history,
        # so rebuild transcript history from stored transcript_chunk events.
        if session.is_baseline and not transcript_chunks:
            baseline_chunks: List[Dict[str, Any]] = []
            for event in session.study_events:
                if event.get("event_name") != "transcript_chunk":
                    continue
                baseline_chunks.append(
                    {
                        "chunk_index": event.get("chunk_index"),
                        "timestamp": event.get("timestamp"),
                        "content": event.get("content"),
                        "speaker": event.get("speaker"),
                        "was_halted": None,
                    }
                )

            baseline_chunks.sort(key=lambda item: int(item.get("chunk_index", 0) or 0))
            transcript_chunks = baseline_chunks

        # Build segment UUID → chunk_index lookup (segments are 1:1 with history)
        seg_id_to_chunk: Dict[str, int] = {}
        for idx, seg in enumerate(transcript_segments):
            seg_id = (
                seg.get("id") if isinstance(seg, dict) else getattr(seg, "id", None)
            )
            if seg_id:
                seg_id_to_chunk[seg_id] = idx

        # chunk_to_topic_map: chunk_index (str) → topic_id
        chunk_to_topic_map: Dict[str, str] = {}
        for seg in transcript_segments:
            seg_id = (
                seg.get("id") if isinstance(seg, dict) else getattr(seg, "id", None)
            )
            topic_id = (
                seg.get("topic_id")
                if isinstance(seg, dict)
                else getattr(seg, "topic_id", None)
            )
            if seg_id and topic_id and seg_id in seg_id_to_chunk:
                chunk_to_topic_map[str(seg_id_to_chunk[seg_id])] = topic_id

        # insight_to_chunk_map: insight_id → chunk_index
        raw_insights = state.get("insights", {}) or {}
        insight_to_chunk_map: Dict[str, int] = {}
        for insight_id, insight in raw_insights.items():
            source_id = (
                insight.get("source_chunk_id")
                if isinstance(insight, dict)
                else getattr(insight, "source_chunk_id", None)
            )
            if source_id and source_id in seg_id_to_chunk:
                insight_to_chunk_map[insight_id] = seg_id_to_chunk[source_id]

        # Normalise insight_threads entries: add thread_id alias for frontend compat
        raw_threads = state.get("insight_threads", {}) or {}
        normalised_threads: Dict[str, Any] = {}
        for tid, tobj in raw_threads.items():
            if isinstance(tobj, dict):
                entry = {
                    **tobj,
                    "thread_id": tobj.get("thread_id") or tobj.get("id") or tid,
                }
                normalised_threads[tid] = entry
            else:
                dumped = (
                    tobj.model_dump(mode="json")
                    if hasattr(tobj, "model_dump")
                    else {"id": tid}
                )
                dumped["thread_id"] = dumped.get("thread_id") or dumped.get("id") or tid
                normalised_threads[tid] = dumped

        return {
            "timestamp": get_current_time(session.config).isoformat(),
            "conversation_id": session.conversation_id,
            "mode": self._conversation_mode(session),
            "participants": self._participants_list(session),
            "meeting_info": state.get("meeting_info"),
            "topics": state.get("topics", {}),
            "insights": self._normalize_snapshot_insights(
                raw_insights,
                raw_threads,
            ),
            "insight_threads": normalised_threads,
            "current_topic_id": state.get("current_topic_id"),
            "transcript_chunks": transcript_chunks,
            "chunk_index": session.chunk_index,
            "chunk_to_topic_map": chunk_to_topic_map,
            "insight_to_chunk_map": insight_to_chunk_map,
            "selected_insight_id": session.selected_insight_id,
            "pinned_insight_ids": list(session.pinned_insight_ids),
            "archived_insight_ids": list(session.archived_insight_ids),
        }

    async def _serialize_v2_session(self, session: _SessionContext) -> None:
        """Serialize v2 session state for later resume."""
        state_payload = {
            "conversation_id": session.conversation_id,
            "saved_at": get_current_time(session.config).isoformat(),
            "started_at": session.started_at.isoformat(),
            "chunk_index": session.chunk_index,
            "livekit_room_name": session.livekit_room_name,
            "is_baseline": session.is_baseline,
            "manager_snapshot": (
                session.manager.export_state() if session.manager is not None else {}
            ),
            "study_events": to_jsonable(session.study_events),
            "full_events": to_jsonable(session.full_events),
            "pinned_insight_ids": list(session.pinned_insight_ids),
            "archived_insight_ids": list(session.archived_insight_ids),
        }

        self._write_json_atomic(
            self._state_file_path(session.conversation_id), state_payload
        )

    def _load_v2_session_snapshot(
        self, conversation_id: str
    ) -> Optional[Dict[str, Any]]:
        """Load persisted session snapshot if one exists."""
        state_file = self._state_file_path(conversation_id)
        if not state_file.exists():
            return None
        try:
            with open(state_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None

    async def _close_session_v2(
        self,
        session: _SessionContext,
        reason: Optional[str] = None,
        persist_snapshot: bool = True,
    ) -> None:
        """Close a v2 session once (idempotent) and cleanup resources."""
        if session.is_closing:
            return
        session.is_closing = True

        # Clear transient selected insight (not persisted across sessions)
        session.selected_insight_id = None

        conversation_id = session.conversation_id
        if reason == "expired":
            payload = {
                "timestamp": get_current_time(session.config).isoformat(),
                "conversation_id": conversation_id,
                "message": "Conversation is expired",
            }
            await self._broadcast_event(session, "conversation_expired", payload)

        if session.transcript_queue is not None:
            try:
                session.transcript_queue.put_nowait(None)
            except asyncio.QueueFull:
                pass

        current_task = asyncio.current_task()
        if (
            session.worker_task
            and not session.worker_task.done()
            and session.worker_task is not current_task
        ):
            try:
                await session.worker_task
            except Exception:
                pass

        if persist_snapshot:
            await self._serialize_v2_session(session)
        self._write_session_logs(session)
        await self._close_livekit_room_if_present(session)
        if session.manager is not None:
            session.manager.close_session(dump_path=str(self._study_logs_dir))

        with self._sessions_lock:
            self._sessions.pop(conversation_id, None)

    async def _expire_if_needed_v2(self, conversation_id: str) -> bool:
        """Expire and cleanup a conversation if its unregistered TTL has elapsed."""
        try:
            session = self._get_session(conversation_id)
        except HTTPException:
            return False

        if self._is_conversation_expired(conversation_id, session.started_at):
            await self._close_session_v2(session, reason="expired")
            return True
        return False

    async def _transcript_worker(self, conversation_id: str) -> None:
        """Sequential worker consuming transcript queue for one conversation."""
        while True:
            if await self._expire_if_needed_v2(conversation_id):
                return

            try:
                session = self._get_session(conversation_id)
            except HTTPException:
                return
            if session.transcript_queue is None:
                return

            item = await session.transcript_queue.get()
            if item is None:
                session.transcript_queue.task_done()
                return

            content = item.get("content", "")
            speaker = item.get("speaker")

            try:
                if session.is_baseline:
                    chunk_index = session.chunk_index
                    session.chunk_index += 1
                    now = get_current_time(session.config).isoformat()

                    transcript_payload = {
                        "timestamp": now,
                        "conversation_id": conversation_id,
                        "chunk_index": chunk_index,
                        "content": content,
                        "speaker": speaker,
                    }
                    study_record = {
                        **transcript_payload,
                        "event_name": "transcript_chunk",
                    }
                    session.study_events.append(study_record)
                    session.full_events.append(study_record)
                    await self._broadcast_event(
                        session,
                        "transcript_chunk",
                        transcript_payload,
                    )
                    continue

                # Bridge queue: background thread pushes events here,
                # async consumer reads them without blocking the event loop.
                bridge: asyncio.Queue = asyncio.Queue()
                loop = asyncio.get_running_loop()

                def _produce_events() -> None:
                    """Run sync generator in a thread; forward each event."""
                    try:
                        for event_name, payload in self._iter_chunk_events(
                            session=session,
                            conversation_id=conversation_id,
                            content=content,
                            speaker=speaker,
                        ):
                            loop.call_soon_threadsafe(
                                bridge.put_nowait, (event_name, payload)
                            )
                    except Exception as exc:
                        loop.call_soon_threadsafe(bridge.put_nowait, (None, exc))
                    finally:
                        loop.call_soon_threadsafe(bridge.put_nowait, None)

                # Start generator in background thread
                producer = asyncio.ensure_future(asyncio.to_thread(_produce_events))

                # Consume events from bridge as they arrive
                while True:
                    msg = await bridge.get()
                    if msg is None:
                        break
                    event_name, payload_or_exc = msg
                    if event_name is None and isinstance(payload_or_exc, Exception):
                        raise payload_or_exc
                    print(
                        "[V2_EVENT_EMIT] "
                        f"conversation_id={conversation_id} "
                        f"event={event_name} "
                        f"chunk_index={payload_or_exc.get('chunk_index')} "
                        f"timestamp={payload_or_exc.get('timestamp')}"
                    )
                    await self._broadcast_event(session, event_name, payload_or_exc)

                # Ensure thread finished cleanly
                await producer

            except Exception as exc:
                error_payload = {
                    "timestamp": get_current_time(session.config).isoformat(),
                    "conversation_id": conversation_id,
                    "transcript_chunk": content,
                    "speaker": speaker,
                    "error": f"{type(exc).__name__}: {exc}",
                }
                session.study_events.append(error_payload)
                session.full_events.append(error_payload)
                await self._broadcast_event(session, "error", error_payload)
            finally:
                session.transcript_queue.task_done()

    async def join_conversation_v2(
        self,
        conversation_id: Optional[str],
        is_baseline: bool,
        speaker_names: List[str],
    ) -> Dict[str, Any]:
        """Create, join, or resume a v2 conversation and register participants."""
        clean_speakers = [
            name.strip() for name in speaker_names if name and name.strip()
        ]

        status = "created"
        now = get_current_time().isoformat()
        requested_id = conversation_id.strip() if conversation_id else None

        with self._sessions_lock:
            if requested_id and requested_id in self._sessions:
                session = self._sessions[requested_id]
                if session.is_baseline != bool(is_baseline):
                    raise HTTPException(
                        status_code=409,
                        detail=(
                            "Conversation mode does not match existing session "
                            f"({self._conversation_mode(session)})"
                        ),
                    )
                status = "joined"
            else:
                target_id = requested_id or self._generate_v2_conversation_id()

                if requested_id and requested_id not in self._registered_conversations:
                    raise HTTPException(
                        status_code=404,
                        detail="Conversation is not registered",
                    )

                snapshot = self._load_v2_session_snapshot(target_id)
                config = get_default_config()
                snapshot_is_baseline = (
                    bool(snapshot.get("is_baseline", False))
                    if snapshot
                    else bool(is_baseline)
                )
                if snapshot is not None and snapshot_is_baseline != bool(is_baseline):
                    expected_mode = (
                        "baseline" if snapshot_is_baseline else "experimental"
                    )
                    raise HTTPException(
                        status_code=409,
                        detail=(
                            "Conversation mode does not match saved session "
                            f"({expected_mode})"
                        ),
                    )

                manager: Optional[ConversationManager] = None
                if not snapshot_is_baseline:
                    manager = ConversationManager(config=config, session_id=target_id)
                    if snapshot is not None:
                        manager.restore_state(snapshot.get("manager_snapshot", {}))

                if snapshot is not None:
                    status = "resumed"

                snapshot_started_at = (
                    self._parse_iso_datetime(snapshot.get("started_at"))
                    if snapshot
                    else None
                )

                if snapshot_started_at and self._is_conversation_expired(
                    target_id,
                    snapshot_started_at,
                ):
                    raise HTTPException(
                        status_code=410, detail="Conversation is expired"
                    )

                session = _SessionContext(
                    conversation_id=target_id,
                    manager=manager,
                    config=config,
                    is_baseline=snapshot_is_baseline,
                    started_at=snapshot_started_at or get_current_time(config),
                )

                if snapshot is not None:
                    session.chunk_index = int(snapshot.get("chunk_index", 0) or 0)
                    session.livekit_room_name = snapshot.get("livekit_room_name")
                    session.study_events = snapshot.get("study_events", []) or []
                    session.full_events = snapshot.get("full_events", []) or []
                    session.pinned_insight_ids = (
                        snapshot.get("pinned_insight_ids", []) or []
                    )
                    session.archived_insight_ids = (
                        snapshot.get("archived_insight_ids", []) or []
                    )

                self._sessions[target_id] = session

        client_id = f"c_{uuid.uuid4().hex[:10]}"
        session.client_ids.add(client_id)
        session.client_chat_histories.setdefault(client_id, [])
        session.client_search_logs.setdefault(client_id, [])
        session.client_explain_logs.setdefault(client_id, [])
        session.client_speaker_names[client_id] = list(dict.fromkeys(clean_speakers))

        existing_names = {
            participant["speaker_name"] for participant in session.participants.values()
        }
        new_participants: List[Dict[str, Any]] = []

        for speaker_name in clean_speakers:
            if speaker_name in existing_names:
                continue
            participant_id = f"p_{uuid.uuid4().hex[:10]}"
            participant = {
                "speaker_name": speaker_name,
                "joined_at": now,
                "client_id": client_id,
            }
            session.participants[participant_id] = participant
            existing_names.add(speaker_name)
            new_participants.append(participant)

        await self._ensure_worker(session)

        if self._is_conversation_expired(session.conversation_id, session.started_at):
            await self._close_session_v2(session, reason="expired")
            raise HTTPException(status_code=410, detail="Conversation is expired")

        for participant in new_participants:
            await self._broadcast_event(
                session,
                "participant_joined",
                {
                    "timestamp": now,
                    "conversation_id": session.conversation_id,
                    "participant": participant,
                },
            )

        expires_at = self._conversation_expires_at(
            session.conversation_id,
            session.started_at,
        )

        return {
            "conversation_id": session.conversation_id,
            "client_id": client_id,
            "status": status,
            "mode": self._conversation_mode(session),
            "is_registered_conversation": session.conversation_id
            in self._registered_conversations,
            "expires_at": expires_at.isoformat() if expires_at else None,
            "participants": self._participants_list(session),
        }

    def get_participants_v2(
        self, conversation_id: str, client_id: str
    ) -> Dict[str, Any]:
        """Return the current participant list for a conversation."""
        session = self._require_membership_v2(conversation_id, client_id)
        return {
            "conversation_id": conversation_id,
            "participants": self._participants_list(session),
        }

    VALID_INSIGHT_ACTIONS = {"select", "pin", "unpin", "archive", "unarchive"}

    async def insight_action_v2(
        self,
        conversation_id: str,
        client_id: str,
        insight_id: str,
        action: str,
    ) -> Dict[str, Any]:
        """Apply a shared insight curation action and broadcast to all clients."""
        session = self._require_membership_v2(conversation_id, client_id)
        self._require_experimental_mode_v2(session, "Insight actions")

        if action not in self.VALID_INSIGHT_ACTIONS:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Invalid action '{action}'. "
                    f"Must be one of: {', '.join(sorted(self.VALID_INSIGHT_ACTIONS))}"
                ),
            )

        # Validate insight exists in conversation state
        insights = (
            session.manager._state.get("insights", {})
            if session.manager and session.manager._state
            else {}
        )
        if insight_id not in insights:
            raise HTTPException(
                status_code=404,
                detail="Insight not found in conversation",
            )

        # Execute action
        result: str
        if action == "select":
            if session.selected_insight_id == insight_id:
                session.selected_insight_id = None
                result = "deselected"
            else:
                session.selected_insight_id = insight_id
                result = "selected"
        elif action == "pin":
            if insight_id in session.archived_insight_ids:
                session.archived_insight_ids.remove(insight_id)
            if insight_id not in session.pinned_insight_ids:
                session.pinned_insight_ids.append(insight_id)
            result = "pinned"
        elif action == "unpin":
            if insight_id in session.pinned_insight_ids:
                session.pinned_insight_ids.remove(insight_id)
            result = "unpinned"
        elif action == "archive":
            if insight_id in session.pinned_insight_ids:
                session.pinned_insight_ids.remove(insight_id)
            if insight_id not in session.archived_insight_ids:
                session.archived_insight_ids.append(insight_id)
            result = "archived"
        else:  # unarchive
            if insight_id in session.archived_insight_ids:
                session.archived_insight_ids.remove(insight_id)
            result = "unarchived"

        event_payload = {
            "timestamp": get_current_time(session.config).isoformat(),
            "conversation_id": conversation_id,
            "action": action,
            "result": result,
            "insight_id": insight_id,
            "client_id": client_id,
            "selected_insight_id": session.selected_insight_id,
            "pinned_insight_ids": list(session.pinned_insight_ids),
            "archived_insight_ids": list(session.archived_insight_ids),
        }
        await self._broadcast_event(session, "insight_action", event_payload)

        return {
            "conversation_id": conversation_id,
            "action": action,
            "insight_id": insight_id,
            "result": result,
            "selected_insight_id": session.selected_insight_id,
            "pinned_insight_ids": list(session.pinned_insight_ids),
            "archived_insight_ids": list(session.archived_insight_ids),
        }

    async def enqueue_transcript_v2(
        self,
        conversation_id: str,
        client_id: str,
        content: str,
        speaker: Optional[str],
    ) -> Dict[str, Any]:
        """Enqueue transcript input for asynchronous sequential processing."""
        session = self._require_membership_v2(conversation_id, client_id)
        await self._ensure_worker(session)

        if session.transcript_queue is None:
            raise HTTPException(status_code=500, detail="Transcript queue unavailable")

        try:
            session.transcript_queue.put_nowait(
                {"content": content, "speaker": speaker}
            )
        except asyncio.QueueFull:
            raise HTTPException(
                status_code=429,
                detail="Transcript queue is full. Try again shortly.",
            )

        return {
            "conversation_id": conversation_id,
            "status": "accepted",
            "queue_size": session.transcript_queue.qsize(),
        }

    async def stream_events_v2(
        self,
        conversation_id: str,
        client_id: str,
    ) -> AsyncGenerator[str, None]:
        """Stream SSE events for a registered v2 client with periodic keepalive."""
        session = self._require_membership_v2(conversation_id, client_id)

        queue: asyncio.Queue[str] = asyncio.Queue(maxsize=self._event_queue_maxsize)
        session.event_queues[client_id] = queue

        snapshot_payload = self._build_state_snapshot(session)
        queue.put_nowait(format_sse("state_snapshot", snapshot_payload))

        async def _event_stream() -> AsyncGenerator[str, None]:
            try:
                while True:
                    try:
                        message = await asyncio.wait_for(queue.get(), timeout=15)
                        yield message
                    except asyncio.TimeoutError:
                        if await self._expire_if_needed_v2(conversation_id):
                            return
                        try:
                            self._get_session(conversation_id)
                        except HTTPException:
                            return
                        yield ": keepalive\n\n"
            finally:
                existing = session.event_queues.get(client_id)
                if existing is queue:
                    session.event_queues.pop(client_id, None)

        return _event_stream()

    async def leave_conversation_v2(
        self,
        conversation_id: str,
        client_id: str,
        click_analytics: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Remove a client from a conversation and cleanup when empty."""
        session = self._require_membership_v2(
            conversation_id,
            client_id,
            allow_expired=True,
        )

        analytics_submitted = bool(
            isinstance(click_analytics, dict) and click_analytics.get("events")
        )
        analytics_accepted_count = 0
        analytics_deduped_count = 0
        analytics_invalid_count = 0

        if isinstance(click_analytics, dict):
            report = clean_click_analytics_report(
                batch_payload=click_analytics,
                conversation_id=conversation_id,
                client_id=client_id,
                received_at=get_current_time(session.config).isoformat(),
            )
            session.client_click_analytics[client_id] = report

            header = report.get("header", {})
            analytics_accepted_count = int(header.get("accepted_count", 0) or 0)
            analytics_deduped_count = int(header.get("deduped_count", 0) or 0)
            analytics_invalid_count = int(header.get("invalid_count", 0) or 0)

        self._write_client_logs(session, client_id=client_id)

        session.client_ids.discard(client_id)
        session.event_queues.pop(client_id, None)
        session.client_chat_histories.pop(client_id, None)
        session.client_search_logs.pop(client_id, None)
        session.client_explain_logs.pop(client_id, None)
        session.client_click_analytics.pop(client_id, None)
        session.client_speaker_names.pop(client_id, None)

        removed_participants: List[Dict[str, Any]] = []
        for participant_id, participant in list(session.participants.items()):
            if participant.get("client_id") == client_id:
                removed_participants.append(session.participants.pop(participant_id))

        now = get_current_time(session.config).isoformat()
        for participant in removed_participants:
            await self._broadcast_event(
                session,
                "participant_left",
                {
                    "timestamp": now,
                    "conversation_id": conversation_id,
                    "participant": participant,
                },
            )

        should_close = len(session.participants) == 0
        is_expired = self._is_conversation_expired(
            conversation_id,
            session.started_at,
        )
        if should_close or is_expired:
            await self._close_session_v2(
                session,
                reason="expired" if is_expired else None,
            )

        return {
            "conversation_id": conversation_id,
            "status": "ended" if (should_close or is_expired) else "left",
            "participants_removed": len(removed_participants),
            "conversation_closed": should_close or is_expired,
            "analytics_submitted": analytics_submitted,
            "analytics_accepted_count": analytics_accepted_count,
            "analytics_deduped_count": analytics_deduped_count,
            "analytics_invalid_count": analytics_invalid_count,
        }
