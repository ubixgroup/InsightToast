export interface ParticipantResponse {
    speaker_name: string;
    joined_at: string;
    client_id: string;
}

interface JoinConversationPayload {
    conversation_id: string | null;
    is_baseline: boolean;
    speakers: Array<{ name: string }>;
}

export interface JoinConversationResponse {
    conversation_id: string;
    client_id: string;
    status: "created" | "joined" | "resumed";
    mode: "baseline" | "experimental";
    is_registered_conversation: boolean;
    expires_at: string | null;
    participants: ParticipantResponse[];
}

export interface LeaveConversationResponse {
    conversation_id: string;
    status: "left" | "ended";
    participants_removed: number;
    conversation_closed: boolean;
    analytics_submitted: boolean;
    analytics_accepted_count: number;
    analytics_deduped_count: number;
    analytics_invalid_count: number;
}

export interface ClickAnalyticsEventPayload {
    event_id: string;
    event_time: string;
    event_name: string;
    target_type?: string;
    target_id?: string;
    topic_id?: string;
    thread_id?: string;
    insight_id?: string;
    citation_id?: string;
    sidebar_name?: string;
    tab_name?: string;
    query_text?: string;
    url?: string;
    position_index?: number;
    surface?: string;
    metadata?: Record<string, unknown>;
}

export interface ClickAnalyticsBatchPayload {
    events: ClickAnalyticsEventPayload[];
    session_seq?: number;
    app_version?: string;
}

export interface EnqueueTranscriptResponse {
    conversation_id: string;
    status: "accepted";
    queue_size: number;
}

export interface DeepgramTokenResponse {
    provider: "deepgram";
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface LivekitTokenResponse {
    provider: "livekit";
    room_name: string;
    server_url: string;
    participant_token: string;
    expires_in: number;
}

export interface SpeechmaticsTokenResponse {
    provider: "speechmatics";
    key_value: string;
    type: string;
    expires_in: number;
}

export interface KbSearchResult {
    url: string;
    title: string;
    preview: string;
}

export interface KbSearchResponse {
    conversation_id: string;
    client_id: string;
    query: string;
    urls: string[];
    results?: KbSearchResult[];
    result_count: number;
    timestamp: string;
}

export interface InsightActionResponse {
    conversation_id: string;
    action: string;
    insight_id: string;
    result: string;
    selected_insight_id: string | null;
    pinned_insight_ids: string[];
    archived_insight_ids: string[];
}

export interface ExplainResponse {
    conversation_id: string;
    client_id: string;
    text: string;
    explanation: string;
    model: string;
    timestamp: string;
}

export interface ClientChatResponse {
    conversation_id: string;
    client_id: string;
    response: string;
    model: string;
    timestamp: string;
}

export interface RegisterConversationsResponse {
    registered_count: number;
    total_registered: number;
}

export interface AdminConversationSummary {
    conversation_id: string;
    is_registered: boolean;
    is_active: boolean;
    has_snapshot: boolean;
    started_at: string | null;
    participant_count: number;
}

export interface AdminConversationsCounts {
    total: number;
    registered: number;
    active: number;
    resumable: number;
}

export interface ListConversationsResponse {
    conversations: AdminConversationSummary[];
    counts: AdminConversationsCounts;
}

export interface ApiKeyMetadata {
    key_id: string;
    key_prefix: string;
    created_at: string;
    name: string | null;
    revoked: boolean;
    revoked_at: string | null;
}

export interface ListApiKeysResponse {
    api_keys: ApiKeyMetadata[];
}

export interface GenerateApiKeyResponse {
    key_id: string;
    key_prefix: string;
    api_key: string;
    created_at: string;
    name: string | null;
}

export interface RevokeApiKeyResponse {
    key_id: string;
    revoked: boolean;
}

export interface SSEEventMessage {
    event: string;
    data: unknown;
}

function normalizeBaseUrl(url: string): string {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getBaseUrl(): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!baseUrl) {
        throw new Error("Missing VITE_API_BASE_URL in environment.");
    }
    return normalizeBaseUrl(baseUrl);
}

function getConfig() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    const apiKey = import.meta.env.VITE_APP_API_KEY as string | undefined;

    if (!baseUrl || !apiKey) {
        throw new Error("Missing VITE_API_BASE_URL or VITE_APP_API_KEY in environment.");
    }

    return {
        baseUrl: normalizeBaseUrl(baseUrl),
        apiKey,
    };
}

function buildHeaders(apiKey: string): HeadersInit {
    return {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    };
}

function buildAdminHeaders(adminPassword: string): HeadersInit {
    return {
        Authorization: `Bearer ${adminPassword}`,
        "Content-Type": "application/json",
    };
}

export class ApiRequestError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
    }
}

function parseErrorDetail(text: string): string {
    try {
        const parsed = JSON.parse(text) as { detail?: unknown; message?: unknown };

        if (typeof parsed.detail === "string" && parsed.detail.trim()) {
            return parsed.detail;
        }

        if (Array.isArray(parsed.detail) && parsed.detail.length > 0) {
            return JSON.stringify(parsed.detail);
        }

        if (typeof parsed.message === "string" && parsed.message.trim()) {
            return parsed.message;
        }
    } catch {
        // fall through to raw text
    }

    return text.trim();
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const text = await response.text();
        const detail = parseErrorDetail(text);
        throw new ApiRequestError(response.status, detail || `Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
}

export async function joinConversationV2(input: {
    conversationId: string | null;
    speakerName?: string;
    speakerNames?: string[];
    isBaseline?: boolean;
}): Promise<JoinConversationResponse> {
    const { baseUrl, apiKey } = getConfig();

    const speakers: Array<{ name: string }> = input.speakerNames
        ? input.speakerNames.map((name) => ({ name }))
        : input.speakerName
            ? [{ name: input.speakerName }]
            : [];

    const payload: JoinConversationPayload = {
        conversation_id: input.conversationId,
        is_baseline: Boolean(input.isBaseline),
        speakers,
    };

    const response = await fetch(`${baseUrl}/v2/conversations/join`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify(payload),
    });

    return parseJsonResponse<JoinConversationResponse>(response);
}

export async function leaveConversationV2(input: {
    conversationId: string;
    clientId: string;
    clickAnalytics?: ClickAnalyticsBatchPayload;
}): Promise<LeaveConversationResponse> {
    const { baseUrl, apiKey } = getConfig();

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/leave`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            click_analytics: input.clickAnalytics,
        }),
    });

    return parseJsonResponse<LeaveConversationResponse>(response);
}

export async function enqueueTranscriptV2(input: {
    conversationId: string;
    clientId: string;
    content: string;
    speaker?: string;
}): Promise<EnqueueTranscriptResponse> {
    const { baseUrl, apiKey } = getConfig();

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/transcript`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            content: input.content,
            speaker: input.speaker,
        }),
    });

    return parseJsonResponse<EnqueueTranscriptResponse>(response);
}

export async function createDeepgramTokenV2(input: {
    conversationId: string;
    clientId: string;
}): Promise<DeepgramTokenResponse> {
    const { baseUrl, apiKey } = getConfig();
    if (import.meta.env.DEV) {
        console.info("[DG-TOKEN] request", {
            conversationId: input.conversationId,
            clientId: input.clientId,
        });
    }

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/tokens/deepgram`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
        }),
    });
    const parsed = await parseJsonResponse<DeepgramTokenResponse>(response);
    if (import.meta.env.DEV) {
        console.info("[DG-TOKEN] response", {
            provider: parsed.provider,
            tokenType: parsed.token_type,
            expiresIn: parsed.expires_in,
        });
    }

    return parsed;
}

export async function createSpeechmaticsTokenV2(input: {
    conversationId: string;
    clientId: string;
    ttlSeconds?: number;
}): Promise<SpeechmaticsTokenResponse> {
    const { baseUrl, apiKey } = getConfig();
    if (import.meta.env.DEV) {
        console.info("[SM-TOKEN] request", {
            conversationId: input.conversationId,
            clientId: input.clientId,
        });
    }

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/tokens/speechmatics`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            ttl: input.ttlSeconds ?? 300,
        }),
    });
    const parsed = await parseJsonResponse<SpeechmaticsTokenResponse>(response);
    if (import.meta.env.DEV) {
        console.info("[SM-TOKEN] response", {
            provider: parsed.provider,
            type: parsed.type,
            expiresIn: parsed.expires_in,
        });
    }

    return parsed;
}

export async function createLivekitTokenV2(input: {
    conversationId: string;
    clientId: string;
    participantName?: string;
    ttlSeconds?: number;
}): Promise<LivekitTokenResponse> {
    const { baseUrl, apiKey } = getConfig();
    if (import.meta.env.DEV) {
        console.info("[LK-TOKEN] request", {
            conversationId: input.conversationId,
            clientId: input.clientId,
        });
    }

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/tokens/livekit`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            participant_name: input.participantName,
            ttl_seconds: input.ttlSeconds ?? 600,
        }),
    });
    const parsed = await parseJsonResponse<LivekitTokenResponse>(response);
    if (import.meta.env.DEV) {
        console.info("[LK-TOKEN] response", {
            provider: parsed.provider,
            roomName: parsed.room_name,
            expiresIn: parsed.expires_in,
        });
    }

    return parsed;
}

export async function searchKnowledgeBaseV2(input: {
    conversationId: string;
    clientId: string;
    query: string;
}): Promise<KbSearchResponse> {
    const { baseUrl, apiKey } = getConfig();

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/search`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            query: input.query,
        }),
    });

    return parseJsonResponse<KbSearchResponse>(response);
}

export async function insightActionV2(input: {
    conversationId: string;
    clientId: string;
    insightId: string;
    action: "select" | "pin" | "unpin" | "archive" | "unarchive";
}): Promise<InsightActionResponse> {
    const { baseUrl, apiKey } = getConfig();

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/insights/actions`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            insight_id: input.insightId,
            action: input.action,
        }),
    });

    return parseJsonResponse<InsightActionResponse>(response);
}

export async function explainTextV2(input: {
    conversationId: string;
    clientId: string;
    text: string;
}): Promise<ExplainResponse> {
    const { baseUrl, apiKey } = getConfig();

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/explain`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            text: input.text,
        }),
    });

    return parseJsonResponse<ExplainResponse>(response);
}

export async function chatWithClientV2(input: {
    conversationId: string;
    clientId: string;
    prompt: string;
}): Promise<ClientChatResponse> {
    const { baseUrl, apiKey } = getConfig();

    const response = await fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/chat`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            prompt: input.prompt,
        }),
    });

    return parseJsonResponse<ClientChatResponse>(response);
}

export async function validateAdminPasswordV2(input: {
    adminPassword: string;
}): Promise<{ is_valid: boolean }> {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/admin/validate-password`, {
        method: "POST",
        headers: buildAdminHeaders(input.adminPassword),
    });

    return parseJsonResponse<{ is_valid: boolean }>(response);
}

export async function registerConversationsV2(input: {
    adminPassword: string;
    conversationIds: string[];
}): Promise<RegisterConversationsResponse> {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/admin/register-conversations`, {
        method: "POST",
        headers: buildAdminHeaders(input.adminPassword),
        body: JSON.stringify({
            conversation_ids: input.conversationIds,
        }),
    });

    return parseJsonResponse<RegisterConversationsResponse>(response);
}

export async function listConversationsV2(input: {
    adminPassword: string;
}): Promise<ListConversationsResponse> {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/admin/conversations`, {
        method: "GET",
        headers: buildAdminHeaders(input.adminPassword),
    });

    return parseJsonResponse<ListConversationsResponse>(response);
}

export async function generateApiKeyV2(input: {
    adminPassword: string;
    name?: string;
}): Promise<GenerateApiKeyResponse> {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/admin/api-keys/generate`, {
        method: "POST",
        headers: buildAdminHeaders(input.adminPassword),
        body: JSON.stringify({
            name: input.name?.trim() ? input.name.trim() : null,
        }),
    });

    return parseJsonResponse<GenerateApiKeyResponse>(response);
}

export async function listAdminApiKeysV2(input: {
    adminPassword: string;
}): Promise<ListApiKeysResponse> {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/admin/api-keys`, {
        method: "GET",
        headers: buildAdminHeaders(input.adminPassword),
    });

    return parseJsonResponse<ListApiKeysResponse>(response);
}

export async function revokeApiKeyV2(input: {
    adminPassword: string;
    keyId: string;
}): Promise<RevokeApiKeyResponse> {
    const baseUrl = getBaseUrl();

    const response = await fetch(`${baseUrl}/v2/admin/api-keys/revoke`, {
        method: "POST",
        headers: buildAdminHeaders(input.adminPassword),
        body: JSON.stringify({
            key_id: input.keyId,
        }),
    });

    return parseJsonResponse<RevokeApiKeyResponse>(response);
}

export function leaveConversationKeepalive(input: {
    conversationId: string;
    clientId: string;
    clickAnalytics?: ClickAnalyticsBatchPayload;
}): void {
    const { baseUrl, apiKey } = getConfig();

    fetch(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/leave`, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
            client_id: input.clientId,
            click_analytics: input.clickAnalytics,
        }),
        keepalive: true,
    }).catch(() => {
        // best effort
    });
}

function parseSSEBlock(rawBlock: string): SSEEventMessage | null {
    const block = rawBlock.replace(/\r/g, "").trim();
    if (!block || block.startsWith(":")) {
        return null;
    }

    let event = "message";
    const dataLines: string[] = [];

    for (const line of block.split("\n")) {
        if (line.startsWith(":")) {
            continue;
        }

        if (line.startsWith("event:")) {
            event = line.slice(6).trim();
            continue;
        }

        if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
        }
    }

    if (dataLines.length === 0) {
        return null;
    }

    const dataText = dataLines.join("\n");
    try {
        return { event, data: JSON.parse(dataText) };
    } catch {
        return { event, data: dataText };
    }
}

export async function streamConversationEventsV2(input: {
    conversationId: string;
    clientId: string;
    signal: AbortSignal;
    onEvent: (message: SSEEventMessage) => void;
}): Promise<void> {
    const { baseUrl, apiKey } = getConfig();

    const url = new URL(`${baseUrl}/v2/conversations/${encodeURIComponent(input.conversationId)}/events`);
    url.searchParams.set("client_id", input.clientId);

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
        },
        signal: input.signal,
    });

    if (!response.ok || !response.body) {
        const text = await response.text();
        const detail = parseErrorDetail(text);
        throw new ApiRequestError(response.status, detail || `Failed to open SSE stream (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (!input.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) {
            if (!input.signal.aborted) {
                throw new Error("SSE stream closed unexpectedly");
            }
            break;
        }

        buffer += decoder.decode(value, { stream: true });

        let splitIndex = buffer.indexOf("\n\n");
        while (splitIndex !== -1) {
            const rawBlock = buffer.slice(0, splitIndex);
            buffer = buffer.slice(splitIndex + 2);

            const parsed = parseSSEBlock(rawBlock);
            if (parsed) {
                input.onEvent(parsed);
            }

            splitIndex = buffer.indexOf("\n\n");
        }
    }
}
