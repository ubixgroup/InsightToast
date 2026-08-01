from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class StartConversationRequest(BaseModel):
    conversation_id: str = Field(
        ..., description="Client-provided conversation id (e.g., participant id)"
    )
    current_date: str | None = Field(
        default=None,
        description="Optional override for pipeline current date (YYYY-MM-DD)",
    )
    verbose: bool = Field(
        default=False,
        description="Enable verbose pipeline output for this conversation",
    )


class StartConversationResponse(BaseModel):
    conversation_id: str
    started_at: str
    status: str = "started"


class TranscriptChunkRequest(BaseModel):
    content: str
    speaker: str | None = None


class EndConversationResponse(BaseModel):
    conversation_id: str
    status: str = "ended"
    session_summary: dict


class SpeakerInput(BaseModel):
    name: str = Field(..., min_length=1)


class JoinConversationRequest(BaseModel):
    conversation_id: str | None = Field(
        default=None,
        description="Conversation ID to join/resume. If null, a new ID is created.",
    )
    is_baseline: bool = Field(
        default=False,
        description="When true, conversation runs in baseline mode without multi-agent pipeline.",
    )
    speakers: list[SpeakerInput] = Field(
        default_factory=list,
        description="Speakers registered by this client device.",
    )


class ParticipantResponse(BaseModel):
    speaker_name: str
    joined_at: str
    client_id: str


class JoinConversationResponse(BaseModel):
    conversation_id: str
    client_id: str
    status: str
    mode: str
    is_registered_conversation: bool
    expires_at: str | None = None
    participants: list[ParticipantResponse]


class ParticipantsResponse(BaseModel):
    conversation_id: str
    participants: list[ParticipantResponse]


class EnqueueTranscriptRequest(BaseModel):
    client_id: str
    content: str
    speaker: str | None = None


class EnqueueTranscriptResponse(BaseModel):
    conversation_id: str
    status: str = "accepted"
    queue_size: int


class LeaveConversationRequest(BaseModel):
    client_id: str
    click_analytics: "ClickAnalyticsBatch | None" = Field(
        default=None,
        description=(
            "Optional batched click analytics payload collected on the frontend and submitted at leave time."
        ),
    )


class LeaveConversationResponse(BaseModel):
    conversation_id: str
    status: str
    participants_removed: int
    conversation_closed: bool
    analytics_submitted: bool = False
    analytics_accepted_count: int = 0
    analytics_deduped_count: int = 0
    analytics_invalid_count: int = 0


class ClickAnalyticsEvent(BaseModel):
    event_id: str = Field(
        ...,
        min_length=1,
        description="Client-generated unique event ID used for server-side deduplication.",
    )
    event_time: str = Field(
        ...,
        min_length=1,
        description="Client timestamp in ISO-8601 format.",
    )
    event_name: str = Field(
        ...,
        min_length=1,
        description=(
            "Frontend action name. Recommended values: primary_sidebar_expanded, primary_sidebar_collapsed, "
            "primary_tab_selected, topic_expanded, topic_collapsed, insight_clicked, insight_deselected, "
            "insight_expanded, insight_collapsed, insight_pinned, insight_unpinned, insight_dismissed, "
            "insight_restored, secondary_sidebar_opened, secondary_sidebar_closed, insight_toast_dismissed, "
            "insight_banner_expanded, insight_citation_clicked, kb_search_submitted, kb_result_clicked, "
            "llm_chat_submitted, google_search_submitted, google_result_opened, transcript_ellipsis_clicked, "
            "transcript_context_chunk_clicked, leave_clicked, cc_toggled, transcription_toggled, general_click."
        ),
    )
    target_type: str | None = Field(
        default=None,
        description="Entity type clicked (e.g., insight, citation, topic, control).",
    )
    target_id: str | None = Field(
        default=None, description="Stable identifier of clicked entity, if any."
    )
    topic_id: str | None = Field(default=None, description="Current topic ID context.")
    thread_id: str | None = Field(
        default=None, description="Current thread ID context."
    )
    insight_id: str | None = Field(
        default=None, description="Insight ID context, if applicable."
    )
    citation_id: str | None = Field(
        default=None, description="Citation identifier context, if applicable."
    )
    sidebar_name: str | None = Field(
        default=None, description="Sidebar context (primary or secondary)."
    )
    tab_name: str | None = Field(
        default=None, description="Primary sidebar tab name, if applicable."
    )
    query_text: str | None = Field(
        default=None, description="Associated query text for search/chat actions."
    )
    url: str | None = Field(
        default=None, description="Associated URL for citation/source actions."
    )
    position_index: int | None = Field(
        default=None, description="Position/rank of clicked item in UI list."
    )
    surface: str | None = Field(
        default=None, description="UI surface name where event happened."
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional custom analytics properties."
    )


class ClickAnalyticsBatch(BaseModel):
    events: list[ClickAnalyticsEvent] = Field(
        default_factory=list,
        description="Batched click analytics events sent together at leave time.",
    )
    session_seq: int | None = Field(
        default=None,
        description="Optional frontend sequence number for this submission.",
    )
    app_version: str | None = Field(
        default=None,
        description="Optional frontend application version.",
    )


class InsightActionRequest(BaseModel):
    client_id: str
    insight_id: str = Field(..., min_length=1)
    action: str = Field(
        ...,
        min_length=1,
        description=(
            "Action to perform. One of: select, pin, unpin, archive, unarchive."
        ),
    )


class InsightActionResponse(BaseModel):
    conversation_id: str
    action: str
    insight_id: str
    result: str
    selected_insight_id: str | None = None
    pinned_insight_ids: list[str] = Field(default_factory=list)
    archived_insight_ids: list[str] = Field(default_factory=list)


class ClientChatRequest(BaseModel):
    client_id: str
    prompt: str = Field(..., min_length=1)


class ClientChatResponse(BaseModel):
    conversation_id: str
    client_id: str
    response: str
    model: str
    timestamp: str


class KbSearchRequest(BaseModel):
    client_id: str
    query: str = Field(..., min_length=1)


class KbSearchResult(BaseModel):
    url: str
    title: str
    preview: str


class KbSearchResponse(BaseModel):
    conversation_id: str
    client_id: str
    query: str
    urls: list[str]
    results: list[KbSearchResult] = Field(default_factory=list)
    result_count: int
    timestamp: str


class ExplainRequest(BaseModel):
    client_id: str
    text: str = Field(..., min_length=1)


class ExplainResponse(BaseModel):
    conversation_id: str
    client_id: str
    text: str
    explanation: str
    model: str
    timestamp: str


class RegisterConversationsRequest(BaseModel):
    conversation_ids: list[str] = Field(default_factory=list)


class RegisterConversationsResponse(BaseModel):
    registered_count: int
    total_registered: int


class RemoveConversationRequest(BaseModel):
    conversation_id: str = Field(..., min_length=1)


class RemoveConversationResponse(BaseModel):
    conversation_id: str
    status: str
    existed_anywhere: bool
    removed_active_session: bool
    removed_snapshot: bool
    removed_registration: bool


class ValidateAdminPasswordResponse(BaseModel):
    is_valid: bool


class GenerateApiKeyRequest(BaseModel):
    name: str | None = Field(
        default=None,
        description="Optional human-readable label for this API key.",
    )


class GenerateApiKeyResponse(BaseModel):
    key_id: str
    key_prefix: str
    api_key: str
    created_at: str
    name: str | None = None


class ApiKeyMetadata(BaseModel):
    key_id: str
    key_prefix: str
    created_at: str
    name: str | None = None
    revoked: bool
    revoked_at: str | None = None


class ListApiKeysResponse(BaseModel):
    api_keys: list[ApiKeyMetadata]


class RevokeApiKeyRequest(BaseModel):
    key_id: str


class RevokeApiKeyResponse(BaseModel):
    key_id: str
    revoked: bool


class AdminConversationSummary(BaseModel):
    conversation_id: str
    is_registered: bool
    is_active: bool
    has_snapshot: bool
    started_at: str | None = None
    is_baseline: bool | None = None
    mode: str | None = None
    expires_at: str | None = None
    is_expired: bool = False
    saved_at: str | None = None
    participant_count: int = 0
    client_count: int = 0


class AdminConversationsCounts(BaseModel):
    total: int
    registered: int
    active: int
    resumable: int


class ListConversationsResponse(BaseModel):
    conversations: list[AdminConversationSummary]
    counts: AdminConversationsCounts


class DeepgramTokenRequest(BaseModel):
    client_id: str
    ttl_seconds: int = Field(default=60, ge=1)


class DeepgramTokenResponse(BaseModel):
    provider: str = "deepgram"
    access_token: str
    token_type: str = "Bearer"
    expires_in: int


class SpeechmaticsTokenRequest(BaseModel):
    client_id: str
    ttl: int = Field(default=300, ge=60, le=86400)


class SpeechmaticsTokenResponse(BaseModel):
    provider: str = "speechmatics"
    key_value: str
    type: str = "rt"
    expires_in: int


class LiveKitTokenRequest(BaseModel):
    client_id: str
    participant_identity: str | None = None
    participant_name: str | None = None
    participant_metadata: str | None = None
    participant_attributes: dict[str, str] = Field(default_factory=dict)
    ttl_seconds: int = Field(default=600, ge=1)


class LiveKitTokenResponse(BaseModel):
    provider: str = "livekit"
    room_name: str
    server_url: str
    participant_token: str
    expires_in: int
