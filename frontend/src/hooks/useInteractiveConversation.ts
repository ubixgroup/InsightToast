import { useEffect, useMemo, useRef, useState } from "react";
import type { Chunk, Insight, Topic } from "@/types";
import {
    streamConversationEventsV2,
    type SSEEventMessage,
} from "@/services/v2Api";

export interface Participant {
    speaker_name: string;
    joined_at: string;
    client_id: string;
}

interface StateSnapshotPayload {
    participants?: Participant[];
    topics?: Record<string, Topic> | Topic[];
    insights?: Record<string, Insight> | Insight[];
    insight_threads?: Record<string, { thread_id: string; topic_id: string; insight_ids: string[] }>;
    meeting_info?: {
        title?: string;
        summary?: string;
    };
    transcript_chunks?: Array<{
        chunk_index?: number;
        timestamp?: string;
        content?: string;
        speaker?: string;
    }>;
    current_topic_id?: string | null;
    chunk_to_topic_map?: Record<string, string>;
    insight_to_chunk_map?: Record<string, number>;
    selected_insight_id?: string | null;
    pinned_insight_ids?: string[];
    archived_insight_ids?: string[];
}

interface UseInteractiveConversationOptions {
    conversationId: string;
    clientId: string;
    initialParticipants: Participant[];
    onRawEvent?: (message: SSEEventMessage) => void;
}

type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

const EMPTY_SET = new Set<number>();

function normalizeTopics(raw: StateSnapshotPayload["topics"]): Topic[] {
    if (!raw) return [];
    const values = Array.isArray(raw) ? raw : Object.values(raw);
    return values.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
}

function normalizeInsights(
    rawInsights: StateSnapshotPayload["insights"],
    insightThreads: StateSnapshotPayload["insight_threads"],
): Insight[] {
    if (!rawInsights) return [];

    const values = Array.isArray(rawInsights) ? rawInsights : Object.values(rawInsights);

    return values
        .map((insight) => {
            // Normalise Pydantic field name differences that may arrive via
            // state snapshots: insight_type → type, cited_document_ids → cited_documents.
            const raw = insight as unknown as Record<string, unknown>;
            const patched = { ...insight } as Insight;

            if (!patched.type && raw.insight_type) {
                (patched as Record<string, unknown>).type =
                    typeof raw.insight_type === "object" && raw.insight_type !== null
                        ? (raw.insight_type as { value?: string }).value
                        : raw.insight_type;
            }

            if (
                !patched.cited_documents &&
                Array.isArray(raw.cited_document_ids)
            ) {
                (patched as unknown as Record<string, unknown>).cited_documents =
                    (raw.cited_document_ids as string[]).map((id: string) => ({
                        document_id: id,
                        source_url: null,
                    }));
            }

            if (patched.thread) {
                return patched;
            }

            const fallbackThreadId = (raw as Record<string, unknown>).thread_id as string | undefined;
            if (!fallbackThreadId || !insightThreads?.[fallbackThreadId]) {
                return patched;
            }

            const thread = insightThreads[fallbackThreadId];
            return {
                ...patched,
                thread: {
                    thread_id: thread.thread_id,
                    topic_id: thread.topic_id,
                    insight_ids: thread.insight_ids,
                },
            };
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

function addToTopicMap(map: Map<string, number[]>, topicId: string, chunkIndex: number): Map<string, number[]> {
    const next = new Map(map);
    const existing = next.get(topicId) ?? [];
    if (!existing.includes(chunkIndex)) {
        next.set(topicId, [...existing, chunkIndex].sort((a, b) => a - b));
    }
    return next;
}

export function useInteractiveConversation({
    conversationId,
    clientId,
    initialParticipants,
    onRawEvent,
}: UseInteractiveConversationOptions) {
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingSummary, setMeetingSummary] = useState("");
    const [chunkToTopicMap, setChunkToTopicMap] = useState<Map<number, string>>(new Map());
    const [insightToChunkMap, setInsightToChunkMap] = useState<Map<string, number>>(new Map());
    const [topicToChunksMap, setTopicToChunksMap] = useState<Map<string, number[]>>(new Map());
    const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
    const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
    const [sharedSelectedInsightId, setSharedSelectedInsightId] = useState<string | null>(null);
    const [sharedPinnedInsightIds, setSharedPinnedInsightIds] = useState<Set<string>>(new Set());
    const [sharedArchivedInsightIds, setSharedArchivedInsightIds] = useState<Set<string>>(new Set());
    const [isServerCurated, setIsServerCurated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

    const connectedOnceRef = useRef(false);
    const sessionStartRef = useRef(0);

    useEffect(() => {
        sessionStartRef.current = Date.now();
    }, []);

    const visibleChunkIndices = useMemo(() => {
        if (chunks.length === 0) return EMPTY_SET;
        return new Set(chunks.map((chunk) => chunk.chunk_index));
    }, [chunks]);

    useEffect(() => {
        const controller = new AbortController();
        let retryDelayMs = 1000;
        const maxRetryDelayMs = 6000;
        const jitterRatio = 0.2;

        const sleep = (ms: number) => new Promise((resolve) => {
            const timeout = setTimeout(resolve, ms);
            controller.signal.addEventListener(
                "abort",
                () => {
                    clearTimeout(timeout);
                    resolve(null);
                },
                { once: true },
            );
        });

        const upsertChunk = (chunkIndex: number, content: string, speaker: string | null) => {
            setChunks((prev) => {
                const existingIndex = prev.findIndex((item) => item.chunk_index === chunkIndex);
                const existing = existingIndex >= 0 ? prev[existingIndex] : null;
                if (existing) {
                    const hasNewContent = content.trim().length > 0 && content !== existing.content;
                    const hasNewSpeaker = Boolean(speaker) && speaker !== existing.speaker;

                    if (!hasNewContent && !hasNewSpeaker) {
                        return prev;
                    }

                    const updatedChunk: Chunk = {
                        ...existing,
                        content: hasNewContent ? content : existing.content,
                        speaker: hasNewSpeaker && speaker ? speaker : existing.speaker,
                    };

                    const next = [...prev];
                    next[existingIndex] = updatedChunk;
                    return next;
                }

                const elapsedSeconds = Math.max(0, (Date.now() - sessionStartRef.current) / 1000);
                const next: Chunk = {
                    chunk_index: chunkIndex,
                    content,
                    speaker: speaker ?? "Unknown",
                    duration_seconds: 0,
                    events: [],
                    has_video_sync: false,
                    cumulative_timestamp: elapsedSeconds,
                };

                return [...prev, next].sort((a, b) => a.chunk_index - b.chunk_index);
            });
        };

        const handleEvent = (message: SSEEventMessage) => {
            onRawEvent?.(message);

            const payload = (message.data ?? {}) as Record<string, unknown>;

            if (message.event === "state_snapshot") {
                const snapshot = payload as StateSnapshotPayload;

                setParticipants(snapshot.participants ?? []);

                const snapshotTopics = normalizeTopics(snapshot.topics);
                setTopics(snapshotTopics);

                const snapshotInsights = normalizeInsights(snapshot.insights, snapshot.insight_threads);
                setInsights(snapshotInsights);

                const legacySnapshot = snapshot as Record<string, unknown>;
                const titleFromInfo = snapshot.meeting_info?.title;
                const summaryFromInfo = snapshot.meeting_info?.summary;
                setMeetingTitle(
                    (typeof titleFromInfo === "string" && titleFromInfo) ||
                    ((legacySnapshot.meeting_title as string | undefined) ?? ""),
                );
                setMeetingSummary(
                    (typeof summaryFromInfo === "string" && summaryFromInfo) ||
                    ((legacySnapshot.meeting_summary as string | undefined) ?? ""),
                );

                const transcriptChunks = snapshot.transcript_chunks ?? [];
                const spacingSeconds = 10;
                const chunkMap = new Map<number, Chunk>();

                transcriptChunks.forEach((item, index) => {
                    const chunkIndex = typeof item.chunk_index === "number" ? item.chunk_index : index;
                    chunkMap.set(chunkIndex, {
                        chunk_index: chunkIndex,
                        content: item.content ?? "",
                        speaker: item.speaker ?? "Unknown",
                        duration_seconds: 0,
                        events: [],
                        has_video_sync: false,
                        cumulative_timestamp: index * spacingSeconds,
                    });
                });

                setChunks(Array.from(chunkMap.values()).sort((a, b) => a.chunk_index - b.chunk_index));

                // Restore current topic
                if (typeof snapshot.current_topic_id === "string") {
                    setCurrentTopicId(snapshot.current_topic_id);
                }

                // Restore shared curation state (new v2 fields)
                if ("pinned_insight_ids" in snapshot || "archived_insight_ids" in snapshot) {
                    setIsServerCurated(true);
                    setSharedSelectedInsightId(snapshot.selected_insight_id ?? null);
                    setSharedPinnedInsightIds(new Set(snapshot.pinned_insight_ids ?? []));
                    setSharedArchivedInsightIds(new Set(snapshot.archived_insight_ids ?? []));
                }

                // Restore chunk ↔ topic mappings
                if (snapshot.chunk_to_topic_map && typeof snapshot.chunk_to_topic_map === "object") {
                    const nextC2T = new Map<number, string>();
                    const nextT2C = new Map<string, number[]>();
                    for (const [ciStr, topicId] of Object.entries(snapshot.chunk_to_topic_map)) {
                        const ci = Number(ciStr);
                        if (!Number.isFinite(ci)) continue;
                        nextC2T.set(ci, topicId);
                        const arr = nextT2C.get(topicId) ?? [];
                        arr.push(ci);
                        nextT2C.set(topicId, arr);
                    }
                    // Sort chunk lists per topic
                    for (const [tid, arr] of nextT2C) {
                        nextT2C.set(tid, arr.sort((a, b) => a - b));
                    }
                    setChunkToTopicMap(nextC2T);
                    setTopicToChunksMap(nextT2C);
                }

                // Restore insight → chunk mapping
                if (snapshot.insight_to_chunk_map && typeof snapshot.insight_to_chunk_map === "object") {
                    const nextI2C = new Map<string, number>();
                    for (const [insightId, ci] of Object.entries(snapshot.insight_to_chunk_map)) {
                        if (typeof ci === "number") {
                            nextI2C.set(insightId, ci);
                        }
                    }
                    setInsightToChunkMap(nextI2C);
                }

                return;
            }

            if (message.event === "insight_action") {
                const actionPayload = payload as {
                    selected_insight_id?: string | null;
                    pinned_insight_ids?: string[];
                    archived_insight_ids?: string[];
                };
                setIsServerCurated(true);
                if ("selected_insight_id" in actionPayload) {
                    setSharedSelectedInsightId(actionPayload.selected_insight_id ?? null);
                }
                if (Array.isArray(actionPayload.pinned_insight_ids)) {
                    setSharedPinnedInsightIds(new Set(actionPayload.pinned_insight_ids));
                }
                if (Array.isArray(actionPayload.archived_insight_ids)) {
                    setSharedArchivedInsightIds(new Set(actionPayload.archived_insight_ids));
                }
                return;
            }

            if (message.event === "participant_joined") {
                const participant = payload.participant as Participant | undefined;
                if (!participant) return;
                setParticipants((prev) => {
                    const exists = prev.some((item) =>
                        item.client_id === participant.client_id && item.speaker_name === participant.speaker_name,
                    );
                    return exists ? prev : [...prev, participant];
                });
                return;
            }

            if (message.event === "participant_left") {
                const participant = payload.participant as Participant | undefined;
                if (!participant) return;
                setParticipants((prev) =>
                    prev.filter(
                        (item) =>
                            !(item.client_id === participant.client_id && item.speaker_name === participant.speaker_name),
                    ),
                );
                return;
            }

            const chunkIndex = typeof payload.chunk_index === "number" ? payload.chunk_index : null;
            const transcriptChunk = typeof payload.transcript_chunk === "string" ? payload.transcript_chunk : "";
            const transcriptContent = typeof payload.content === "string" ? payload.content : "";
            const speaker = typeof payload.speaker === "string" ? payload.speaker : null;

            if (chunkIndex !== null && message.event === "chunk_started") {
                upsertChunk(chunkIndex, transcriptChunk, speaker);
            }

            if (chunkIndex !== null && message.event === "transcript_chunk") {
                upsertChunk(chunkIndex, transcriptContent, speaker);
            }

            if (chunkIndex !== null && message.event === "topic_detector") {
                const topicId = typeof payload.current_topic_id === "string" ? payload.current_topic_id : null;
                if (topicId) {
                    setCurrentTopicId(topicId);
                    setChunkToTopicMap((prev) => {
                        const next = new Map(prev);
                        next.set(chunkIndex, topicId);
                        return next;
                    });
                    setTopicToChunksMap((prev) => addToTopicMap(prev, topicId, chunkIndex));
                }

                const createdTopic = payload.created_topic as Topic | undefined;
                if (createdTopic) {
                    setTopics((prev) => {
                        const exists = prev.some((topic) => topic.id === createdTopic.id);
                        if (exists) return prev;
                        return [...prev, createdTopic].sort(
                            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                        );
                    });
                }
            }

            if (message.event === "meeting_tracker") {
                const title = payload.meeting_title;
                const summary = payload.meeting_summary;

                if (typeof title === "string") {
                    setMeetingTitle(title);
                }
                if (typeof summary === "string") {
                    setMeetingSummary(summary);
                }
            }

            if (chunkIndex !== null && message.event === "insight_generated") {
                const insight = payload.insight as Insight | undefined;
                if (!insight) return;

                setInsights((prev) => {
                    const exists = prev.some((item) => item.id === insight.id);
                    if (exists) return prev;
                    return [...prev, insight].sort(
                        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                    );
                });

                setInsightToChunkMap((prev) => {
                    const next = new Map(prev);
                    next.set(insight.id, chunkIndex);
                    return next;
                });

                if (insight.thread?.topic_id) {
                    setTopicToChunksMap((prev) => addToTopicMap(prev, insight.thread.topic_id, chunkIndex));
                }
            }
        };

        const connect = async () => {
            while (!controller.signal.aborted) {
                setConnectionStatus(connectedOnceRef.current ? "reconnecting" : "connecting");

                try {
                    await streamConversationEventsV2({
                        conversationId,
                        clientId,
                        signal: controller.signal,
                        onEvent: (message) => {
                            retryDelayMs = 1000;
                            if (!connectedOnceRef.current) {
                                connectedOnceRef.current = true;
                                setConnectionStatus("connected");
                            }
                            setError(null);
                            handleEvent(message);
                        },
                    });

                    if (!controller.signal.aborted) {
                        setConnectionStatus("disconnected");
                    }
                    return;
                } catch (streamError) {
                    if (controller.signal.aborted) {
                        return;
                    }

                    const message = streamError instanceof Error ? streamError.message : "Connection failed";
                    setError(message);
                    setConnectionStatus("error");

                    const jitter = retryDelayMs * jitterRatio * (Math.random() * 2 - 1);
                    const waitMs = Math.max(0, Math.round(retryDelayMs + jitter));
                    await sleep(waitMs);
                    retryDelayMs = Math.min(retryDelayMs * 2, maxRetryDelayMs);
                }
            }
        };

        connect();

        return () => {
            controller.abort();
        };
    }, [clientId, conversationId, onRawEvent]);

    return {
        chunks,
        topics,
        insights,
        meetingTitle,
        meetingSummary,
        participants,
        currentTopicId,
        visibleChunkIndices,
        chunkToTopicMap,
        insightToChunkMap,
        topicToChunksMap,
        error,
        connectionStatus,
        sharedSelectedInsightId,
        sharedPinnedInsightIds,
        sharedArchivedInsightIds,
        isServerCurated,
    };
}
