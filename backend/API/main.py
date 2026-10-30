"""
FastAPI endpoints for the Multi-Agentic RAG conversation workflow.

This module defines the REST API for managing conversations, streaming
real-time updates from the RAG pipeline, and tracking session state.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

from API.conversation_service import ConversationAPIService
from API.schemas import (
    ClientChatRequest,
    ClientChatResponse,
    DeepgramTokenRequest,
    DeepgramTokenResponse,
    EnqueueTranscriptRequest,
    EnqueueTranscriptResponse,
    EndConversationResponse,
    GenerateApiKeyRequest,
    GenerateApiKeyResponse,
    JoinConversationRequest,
    JoinConversationResponse,
    ExplainRequest,
    ExplainResponse,
    InsightActionRequest,
    InsightActionResponse,
    KbSearchRequest,
    KbSearchResponse,
    LeaveConversationRequest,
    LeaveConversationResponse,
    ListConversationsResponse,
    ListApiKeysResponse,
    LiveKitTokenRequest,
    LiveKitTokenResponse,
    ParticipantsResponse,
    RegisterConversationsRequest,
    RegisterConversationsResponse,
    RemoveConversationRequest,
    RemoveConversationResponse,
    RevokeApiKeyRequest,
    RevokeApiKeyResponse,
    SpeechmaticsTokenRequest,
    SpeechmaticsTokenResponse,
    StartConversationRequest,
    StartConversationResponse,
    TranscriptChunkRequest,
    ValidateAdminPasswordResponse,
)


# =============================================================================
# LIFESPAN EVENTS
# =============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.

    Runs once when the application starts and cleans up when it shuts down.
    """
    # Startup
    print("=" * 80)
    print("🚀 InsightToast API Starting...")
    print("=" * 80)
    print(f"📝 API Documentation: http://127.0.0.1:4343/docs")
    print(f"📊 ReDoc: http://127.0.0.1:4343/redoc")
    print(f"❤️  Health Check: http://127.0.0.1:4343/health")
    print("=" * 80)

    yield

    # Shutdown
    print("\n" + "=" * 80)
    print("👋 InsightToast API Shutting Down...")
    print("=" * 80)


# =============================================================================
# FASTAPI APP CONFIGURATION
# =============================================================================

app = FastAPI(
    title="InsightToast API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
    openapi_url="/openapi.json",
    # Development mode - no authentication required
    debug=True,
)

# Initialize service
service = ConversationAPIService()


# =============================================================================
# CORS MIDDLEWARE
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Add your actual frontend origin(s) here, e.g.:
        # "https://your-frontend.vercel.app",
        "*"
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# EXCEPTION HANDLERS
# =============================================================================


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed messages."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "body": exc.body,
            "message": "Validation error - please check your request",
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
            "message": "An unexpected error occurred",
        },
    )


# =============================================================================
# HEALTH AND INFO ENDPOINTS
# =============================================================================


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: str
    version: str
    service: str


class InfoResponse(BaseModel):
    """API information response model."""

    name: str
    version: str
    description: str
    endpoints: Dict[str, str]


@app.get(
    "/",
    response_model=InfoResponse,
    tags=["info"],
    summary="API Information",
)
def root() -> InfoResponse:
    """
    Get API information and available endpoints.

    Returns basic information about the API and links to documentation.
    """
    return InfoResponse(
        name="InsightToast API",
        version="0.1.0",
        description="Real-time multi-agentic RAG conversation processing",
        endpoints={
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
            "openapi": "/openapi.json",
        },
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["health"],
    summary="Health Check",
    status_code=status.HTTP_200_OK,
)
def health_check() -> HealthResponse:
    """
    Health check endpoint for monitoring and load balancers.

    Returns the current status of the API service.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="0.1.0",
        service="multi-agentic-rag-api",
    )


# =============================================================================
# CONVERSATION ENDPOINTS
# =============================================================================


@app.post(
    "/v1/conversations/start",
    response_model=StartConversationResponse,
    tags=["conversations"],
    summary="Start Conversation",
    status_code=status.HTTP_201_CREATED,
)
@app.post(
    "/conversations/start",
    response_model=StartConversationResponse,
    tags=["conversations"],
    summary="Start Conversation",
    status_code=status.HTTP_201_CREATED,
)
def start_conversation(payload: StartConversationRequest) -> StartConversationResponse:
    """
    Start a new conversation session.

    Creates a new conversation with a unique ID and initializes the RAG pipeline
    with the specified configuration.

    Args:
        payload: Request containing conversation_id, optional current_date, and verbose flag

    Returns:
        Response with the timestamped conversation_id and status

    Raises:
        HTTPException: 409 if conversation with this ID already exists
        HTTPException: 422 if conversation_id is missing or invalid
    """
    return StartConversationResponse(
        **service.start_conversation(
            client_conversation_id=payload.conversation_id,
            current_date=payload.current_date,
            verbose=payload.verbose,
        )
    )


@app.post(
    "/v1/conversations/{conversation_id}/transcript/stream",
    tags=["conversations"],
    summary="Stream Transcript Chunk",
    response_class=StreamingResponse,
)
@app.post(
    "/conversations/{conversation_id}/transcript/stream",
    tags=["conversations"],
    summary="Stream Transcript Chunk",
    response_class=StreamingResponse,
)
def stream_transcript_chunk(
    conversation_id: str, payload: TranscriptChunkRequest
) -> StreamingResponse:
    """
    Process a transcript chunk and stream real-time updates via SSE.

    Sends the transcript chunk through the RAG pipeline and returns
    Server-Sent Events (SSE) with real-time updates including topic detection,
    meeting tracking, insight generation, and more.

    Args:
        conversation_id: Unique conversation identifier
        payload: Transcript content and optional speaker information

    Returns:
        SSE stream with events: chunk_started, procedural_check, topic_detector,
        meeting_tracker, insight_need_assessment, query_updates, insight_generated,
        chunk_complete, and error

    Raises:
        HTTPException: 404 if conversation not found
    """
    event_stream = service.stream_chunk(
        conversation_id=conversation_id,
        content=payload.content,
        speaker=payload.speaker,
    )
    return StreamingResponse(event_stream, media_type="text/event-stream")


@app.post(
    "/v1/conversations/{conversation_id}/end",
    response_model=EndConversationResponse,
    tags=["conversations"],
    summary="End Conversation",
)
@app.post(
    "/conversations/{conversation_id}/end",
    response_model=EndConversationResponse,
    tags=["conversations"],
    summary="End Conversation",
)
def end_conversation(conversation_id: str) -> EndConversationResponse:
    """
    End a conversation session and cleanup resources.

    Closes the conversation, writes accumulated logs to disk, and releases
    all session resources including the ConversationManager instance.

    Args:
        conversation_id: Unique conversation identifier

    Returns:
        Response with conversation_id, status, and session summary including
        chunk count, topics created, and insights generated

    Raises:
        HTTPException: 404 if conversation not found
    """
    return EndConversationResponse(**service.end_conversation(conversation_id))


def require_v2_api_key(
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> Dict[str, Any]:
    """Validate API key from Bearer auth header for v2 conversation endpoints."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization")
    token = authorization.split(" ", 1)[1].strip()
    return service.validate_v2_api_key(token)


# =============================================================================
# V2 CONVERSATION ENDPOINTS
# =============================================================================


@app.post(
    "/v2/conversations/join",
    response_model=JoinConversationResponse,
    tags=["conversations-v2"],
    summary="Create, Join, or Resume Conversation",
    dependencies=[Depends(require_v2_api_key)],
)
async def join_conversation_v2(
    payload: JoinConversationRequest,
) -> JoinConversationResponse:
    """Create a new conversation, or join/resume an existing v2 conversation."""
    response = await service.join_conversation_v2(
        conversation_id=payload.conversation_id,
        is_baseline=payload.is_baseline,
        speaker_names=[speaker.name for speaker in payload.speakers],
    )
    return JoinConversationResponse(**response)


@app.get(
    "/v2/conversations/{conversation_id}/participants",
    response_model=ParticipantsResponse,
    tags=["conversations-v2"],
    summary="List Conversation Participants",
    dependencies=[Depends(require_v2_api_key)],
)
def get_participants_v2(
    conversation_id: str,
    client_id: str = Query(..., description="Client ID returned by join endpoint"),
) -> ParticipantsResponse:
    """Return all currently registered participants for a v2 conversation."""
    return ParticipantsResponse(
        **service.get_participants_v2(
            conversation_id=conversation_id, client_id=client_id
        )
    )


@app.post(
    "/v2/conversations/{conversation_id}/transcript",
    response_model=EnqueueTranscriptResponse,
    tags=["conversations-v2"],
    summary="Enqueue Transcript Chunk",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_v2_api_key)],
)
async def enqueue_transcript_v2(
    conversation_id: str,
    payload: EnqueueTranscriptRequest,
) -> EnqueueTranscriptResponse:
    """Queue a transcript chunk for asynchronous processing (returns immediately)."""
    response = await service.enqueue_transcript_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        content=payload.content,
        speaker=payload.speaker,
    )
    return EnqueueTranscriptResponse(**response)


@app.post(
    "/v2/conversations/{conversation_id}/chat",
    response_model=ClientChatResponse,
    tags=["conversations-v2"],
    summary="Chat with Gemini",
    dependencies=[Depends(require_v2_api_key)],
)
async def chat_with_client_llm_v2(
    conversation_id: str,
    payload: ClientChatRequest,
) -> ClientChatResponse:
    """Send one prompt to per-client Gemini chat with conversation-local history."""
    response = await service.chat_with_client_llm_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        prompt=payload.prompt,
    )
    return ClientChatResponse(**response)


@app.post(
    "/v2/conversations/{conversation_id}/search",
    response_model=KbSearchResponse,
    tags=["conversations-v2"],
    summary="Search Knowledge Base URLs",
    dependencies=[Depends(require_v2_api_key)],
)
async def search_kb_urls_v2(
    conversation_id: str,
    payload: KbSearchRequest,
) -> KbSearchResponse:
    """Search KB via retriever and return ordered source URLs only."""
    response = await service.search_kb_urls_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        query=payload.query,
    )
    return KbSearchResponse(**response)


@app.post(
    "/v2/conversations/{conversation_id}/explain",
    response_model=ExplainResponse,
    tags=["conversations-v2"],
    summary="Explain Text",
    dependencies=[Depends(require_v2_api_key)],
)
async def explain_text_v2(
    conversation_id: str,
    payload: ExplainRequest,
) -> ExplainResponse:
    """Generate a concise one-sentence explanation for a selected text excerpt."""
    response = await service.explain_text_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        text=payload.text,
    )
    return ExplainResponse(**response)


@app.post(
    "/v2/conversations/{conversation_id}/insights/actions",
    response_model=InsightActionResponse,
    tags=["conversations-v2"],
    summary="Insight Action (Select, Pin, Archive)",
    dependencies=[Depends(require_v2_api_key)],
)
async def insight_action_v2(
    conversation_id: str,
    payload: InsightActionRequest,
) -> InsightActionResponse:
    """Apply a shared insight curation action (select, pin, unpin, archive, unarchive)."""
    response = await service.insight_action_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        insight_id=payload.insight_id,
        action=payload.action,
    )
    return InsightActionResponse(**response)


@app.get(
    "/v2/conversations/{conversation_id}/events",
    tags=["conversations-v2"],
    summary="Subscribe to Conversation Events (SSE)",
    response_class=StreamingResponse,
    dependencies=[Depends(require_v2_api_key)],
)
async def stream_events_v2(
    conversation_id: str,
    client_id: str = Query(..., description="Client ID returned by join endpoint"),
) -> StreamingResponse:
    """Open an SSE stream for conversation events; starts with state snapshot."""
    event_stream = await service.stream_events_v2(
        conversation_id=conversation_id,
        client_id=client_id,
    )
    return StreamingResponse(
        event_stream,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post(
    "/v2/conversations/{conversation_id}/leave",
    response_model=LeaveConversationResponse,
    tags=["conversations-v2"],
    summary="Leave Conversation",
    dependencies=[Depends(require_v2_api_key)],
)
async def leave_conversation_v2(
    conversation_id: str,
    payload: LeaveConversationRequest,
) -> LeaveConversationResponse:
    """Remove a client from a conversation and optionally submit batched click analytics."""
    response = await service.leave_conversation_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        click_analytics=(
            payload.click_analytics.model_dump()
            if payload.click_analytics is not None
            else None
        ),
    )
    return LeaveConversationResponse(**response)


@app.post(
    "/v2/conversations/{conversation_id}/tokens/deepgram",
    response_model=DeepgramTokenResponse,
    tags=["conversations-v2"],
    summary="Create Deepgram Token",
    dependencies=[Depends(require_v2_api_key)],
)
async def create_deepgram_token_v2(
    conversation_id: str,
    payload: DeepgramTokenRequest,
) -> DeepgramTokenResponse:
    """Issue a temporary Deepgram token for a registered conversation member."""
    response = await service.issue_deepgram_token_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        ttl_seconds=payload.ttl_seconds,
    )
    return DeepgramTokenResponse(**response)


@app.post(
    "/v2/conversations/{conversation_id}/tokens/speechmatics",
    response_model=SpeechmaticsTokenResponse,
    tags=["conversations-v2"],
    summary="Create Speechmatics Realtime Token",
    dependencies=[Depends(require_v2_api_key)],
)
async def create_speechmatics_token_v2(
    conversation_id: str,
    payload: SpeechmaticsTokenRequest,
) -> SpeechmaticsTokenResponse:
    """Issue a Speechmatics realtime temporary key for a conversation member."""
    response = await service.issue_speechmatics_token_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        ttl=payload.ttl,
    )
    return SpeechmaticsTokenResponse(**response)


@app.post(
    "/v2/conversations/{conversation_id}/tokens/livekit",
    response_model=LiveKitTokenResponse,
    tags=["conversations-v2"],
    summary="Create LiveKit Participant Token",
    dependencies=[Depends(require_v2_api_key)],
)
async def create_livekit_token_v2(
    conversation_id: str,
    payload: LiveKitTokenRequest,
) -> LiveKitTokenResponse:
    """Issue a LiveKit participant token for a registered conversation member."""
    response = await service.issue_livekit_token_v2(
        conversation_id=conversation_id,
        client_id=payload.client_id,
        participant_identity=payload.participant_identity,
        participant_name=payload.participant_name,
        participant_metadata=payload.participant_metadata,
        participant_attributes=payload.participant_attributes,
        ttl_seconds=payload.ttl_seconds,
    )
    return LiveKitTokenResponse(**response)


@app.post(
    "/v2/admin/validate-password",
    response_model=ValidateAdminPasswordResponse,
    tags=["admin-v2"],
    summary="Validate Admin Password",
)
def validate_admin_password_v2(
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> ValidateAdminPasswordResponse:
    """Validate admin bearer password for v2 admin endpoints."""
    response = service.validate_admin_password_v2(authorization_header=authorization)
    return ValidateAdminPasswordResponse(**response)


@app.post(
    "/v2/admin/conversations/register",
    response_model=RegisterConversationsResponse,
    tags=["admin-v2"],
    summary="Register Study Conversation IDs",
)
@app.post(
    "/v2/admin/register-conversations",
    response_model=RegisterConversationsResponse,
    tags=["admin-v2"],
    summary="Register Study Conversation IDs",
)
def register_conversations_v2(
    payload: RegisterConversationsRequest,
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> RegisterConversationsResponse:
    """Register study conversation IDs for admin-controlled study sessions."""
    response = service.register_conversations_v2(
        authorization_header=authorization,
        conversation_ids=payload.conversation_ids,
    )
    return RegisterConversationsResponse(**response)


@app.get(
    "/v2/admin/conversations",
    response_model=ListConversationsResponse,
    tags=["admin-v2"],
    summary="List Conversations",
)
def list_conversations_v2(
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> ListConversationsResponse:
    """List registered, active, and resumable conversations for admin users."""
    response = service.list_conversations_v2(authorization_header=authorization)
    return ListConversationsResponse(**response)


@app.post(
    "/v2/admin/conversations/remove",
    response_model=RemoveConversationResponse,
    tags=["admin-v2"],
    summary="Remove Conversation",
)
async def remove_conversation_v2(
    payload: RemoveConversationRequest,
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> RemoveConversationResponse:
    """Remove a conversation from active sessions, snapshots, and registration set."""
    response = await service.remove_conversation_v2(
        authorization_header=authorization,
        conversation_id=payload.conversation_id,
    )
    return RemoveConversationResponse(**response)


@app.post(
    "/v2/admin/api-keys/generate",
    response_model=GenerateApiKeyResponse,
    tags=["admin-v2"],
    summary="Generate API Key",
)
def generate_api_key_v2(
    payload: GenerateApiKeyRequest,
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> GenerateApiKeyResponse:
    """Generate a new API key for v2 conversation endpoint access."""
    response = service.create_api_key_v2(
        authorization_header=authorization,
        name=payload.name,
    )
    return GenerateApiKeyResponse(**response)


@app.get(
    "/v2/admin/api-keys",
    response_model=ListApiKeysResponse,
    tags=["admin-v2"],
    summary="List API Keys",
)
def list_api_keys_v2(
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> ListApiKeysResponse:
    """List API key metadata for admin users."""
    response = service.list_api_keys_v2(authorization_header=authorization)
    return ListApiKeysResponse(**response)


@app.post(
    "/v2/admin/api-keys/revoke",
    response_model=RevokeApiKeyResponse,
    tags=["admin-v2"],
    summary="Revoke API Key",
)
def revoke_api_key_v2(
    payload: RevokeApiKeyRequest,
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> RevokeApiKeyResponse:
    """Revoke an existing API key so it can no longer access v2 endpoints."""
    response = service.revoke_api_key_v2(
        authorization_header=authorization,
        key_id=payload.key_id,
    )
    return RevokeApiKeyResponse(**response)
