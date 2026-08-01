import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type {
    Chunk,
    Topic,
    Insight,
    VisibleState,
    LoadingInsight,
    HighlightState,
    InsightGeneratedEventData,
    TopicDetectorEventData,
    ChunkEvent,
} from "@/types";
import type { ChunkEventForProgress } from "@/types/progressToast";

interface PlaybackStateOptions {
    chunks: Chunk[];
    topics: Topic[];
    insights: Insight[];
    meetingTitle: string;
    meetingSummary: string;
    chunkToTopicMap: Map<number, string>;
    currentTime: number;
    isPlaying: boolean;
    // Optional callback to trigger progress toast simulation when a chunk starts processing
    onChunkProcessingStart?: (events: ChunkEventForProgress[], topicId: string | null, topicName: string | null) => void;
    // Optional callback invoked when playback is reset after a seek
    onPlaybackReset?: () => void;
}

interface PlaybackState {
    visibleState: VisibleState;
    loadingInsights: LoadingInsight[];
    highlights: HighlightState;
    visibleChunkIndices: Set<number>;
    processingChunkIndices: Set<number>;
}

const LOADING_DURATION_MS = 5000; // 5 seconds loading animation
const HIGHLIGHT_DURATION_MS = 4000; // 4 seconds highlight duration
const MAX_CONTINUOUS_STEP_SECONDS = 1;

/**
 * Extract insights generated in a specific chunk from its events
 */
function getInsightsFromChunk(chunk: Chunk, allInsights: Insight[]): Insight[] {
    const insightIds = new Set<string>();

    for (const event of chunk.events) {
        if (event.event === "insight_generated") {
            const data = event.data as InsightGeneratedEventData;
            insightIds.add(data.insight.id);
        }
    }

    return allInsights.filter((insight) => insightIds.has(insight.id));
}

function getSortedSyncedChunks(chunks: Chunk[]): Chunk[] {
    return chunks
        .filter((chunk) => chunk.start_timestamp !== undefined)
        .sort((a, b) => {
            const aStart = a.start_timestamp ?? 0;
            const bStart = b.start_timestamp ?? 0;
            if (aStart !== bStart) return aStart - bStart;
            return a.chunk_index - b.chunk_index;
        });
}

function getAnchorChunk(chunks: Chunk[], currentTime: number): Chunk | null {
    const syncedChunks = getSortedSyncedChunks(chunks);
    let anchor: Chunk | null = null;

    for (const chunk of syncedChunks) {
        const start = chunk.start_timestamp;
        if (start === undefined) continue;
        if (start <= currentTime) {
            anchor = chunk;
            continue;
        }
        break;
    }

    return anchor;
}

/**
 * Visibility rule:
 * - Find the anchor synced chunk: largest start_timestamp <= currentTime
 * - Show all chunks with chunk_index < anchor.chunk_index
 * - Show anchor chunk only when currentTime >= anchor.end_timestamp (inclusive)
 * - If no anchor exists yet, show nothing
 */
function getVisibleChunkIndices(chunks: Chunk[], currentTime: number): Set<number> {
    const visibleIndices = new Set<number>();
    const anchor = getAnchorChunk(chunks, currentTime);

    if (!anchor) {
        return visibleIndices;
    }

    for (const chunk of chunks) {
        if (chunk.chunk_index < anchor.chunk_index) {
            visibleIndices.add(chunk.chunk_index);
        }
    }

    if (anchor.end_timestamp === undefined || currentTime >= anchor.end_timestamp) {
        visibleIndices.add(anchor.chunk_index);
    }

    return visibleIndices;
}

/**
 * Find synced chunks whose end boundary was crossed.
 */
function getNewlyCompletedChunks(
    chunks: Chunk[],
    lastTime: number,
    currentTime: number,
    alreadyProcessed: Set<number>
): Chunk[] {
    return chunks.filter((chunk) => {
        if (chunk.start_timestamp === undefined || chunk.end_timestamp === undefined) return false;
        if (alreadyProcessed.has(chunk.chunk_index)) return false;
        return lastTime < chunk.end_timestamp && currentTime >= chunk.end_timestamp;
    });
}

/**
 * Find synced chunks whose end boundary was crossed.
 */
function getChunksCrossedEnd(chunks: Chunk[], lastTime: number, currentTime: number): Chunk[] {
    return chunks.filter((chunk) => {
        if (chunk.end_timestamp === undefined) return false;
        return lastTime < chunk.end_timestamp && currentTime >= chunk.end_timestamp;
    });
}

/**
 * Get the current topic ID from a chunk's events
 */
function getCurrentTopicFromChunk(chunk: Chunk): string | null {
    let currentTopicId: string | null = null;

    for (const event of chunk.events) {
        if (event.event === "topic_detector") {
            const data = event.data as TopicDetectorEventData;
            currentTopicId = data.current_topic_id;
        }
    }

    return currentTopicId;
}

function getChunkTopicId(
    chunk: Chunk,
    chunkToTopicMap: Map<number, string>
): string | null {
    const fromEvents = getCurrentTopicFromChunk(chunk);
    if (fromEvents) return fromEvents;
    return chunkToTopicMap.get(chunk.chunk_index) ?? null;
}

/**
 * Converts chunk events to progress toast format.
 */
function convertEventsForProgress(events: ChunkEvent[]): ChunkEventForProgress[] {
    return events.map((event) => ({
        event: event.event,
        data: event.data as ChunkEventForProgress["data"],
    }));
}

/**
 * Gets topic info from chunk events.
 */
function getTopicInfoFromChunk(chunk: Chunk, topics: Topic[]): { topicId: string | null; topicName: string | null } {
    let topicId: string | null = null;
    let topicName: string | null = null;

    for (const event of chunk.events) {
        if (event.event === "topic_detector") {
            const data = event.data as TopicDetectorEventData;
            topicId = data.current_topic_id;
            if (data.created_topic) {
                topicName = data.created_topic.name;
            }
        }
    }

    // If we have a topicId but no name, look it up in topics
    if (topicId && !topicName) {
        const topic = topics.find((t) => t.id === topicId);
        topicName = topic?.name ?? null;
    }

    return { topicId, topicName };
}

/**
 * Check if a chunk has insight generation events (needs progress toast).
 */
function chunkHasInsightGeneration(chunk: Chunk): boolean {
    return chunk.events.some(
        (event) => event.event === "insight_need_assessment" &&
            (event.data as { insight_needed?: boolean }).insight_needed === true
    );
}

export function usePlaybackState({
    chunks,
    topics,
    insights,
    meetingTitle,
    meetingSummary,
    chunkToTopicMap,
    currentTime,
    isPlaying,
    onChunkProcessingStart,
    onPlaybackReset,
}: PlaybackStateOptions): PlaybackState {
    const [loadingInsights, setLoadingInsights] = useState<LoadingInsight[]>([]);
    const [highlights, setHighlights] = useState<HighlightState>({
        topicIds: new Set(),
        insightIds: new Set(),
    });
    const [processingChunkIndices, setProcessingChunkIndices] = useState<Set<number>>(new Set());

    const lastProcessedTimeRef = useRef<number>(0);
    const processedChunksRef = useRef<Set<number>>(new Set());
    const highlightTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
    const processingLockTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    const clearProcessingLock = useCallback((chunkIndex: number) => {
        const timer = processingLockTimersRef.current.get(chunkIndex);
        if (timer) {
            clearTimeout(timer);
            processingLockTimersRef.current.delete(chunkIndex);
        }

        setProcessingChunkIndices((prev) => {
            if (!prev.has(chunkIndex)) return prev;
            const next = new Set(prev);
            next.delete(chunkIndex);
            return next;
        });
    }, []);

    const setProcessingLock = useCallback((chunkIndex: number) => {
        setProcessingChunkIndices((prev) => {
            if (prev.has(chunkIndex)) return prev;
            const next = new Set(prev);
            next.add(chunkIndex);
            return next;
        });

        const existingTimer = processingLockTimersRef.current.get(chunkIndex);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
            clearProcessingLock(chunkIndex);
        }, 3000);

        processingLockTimersRef.current.set(chunkIndex, timer);
    }, [clearProcessingLock]);

    const clearAllProcessingLocks = useCallback(() => {
        processingLockTimersRef.current.forEach((timer) => clearTimeout(timer));
        processingLockTimersRef.current.clear();
        setProcessingChunkIndices(new Set());
    }, []);

    const clearHighlightTimers = useCallback(() => {
        highlightTimersRef.current.forEach((timer) => clearTimeout(timer));
        highlightTimersRef.current.clear();
    }, []);

    useEffect(() => {
        return () => {
            clearHighlightTimers();
            clearAllProcessingLocks();
        };
    }, [clearHighlightTimers, clearAllProcessingLocks]);

    // Get visible chunk indices based on current video time
    // When we pass a start_timestamp, all previous chunks become visible
    const visibleChunkIndices = useMemo(() => {
        return getVisibleChunkIndices(chunks, currentTime);
    }, [chunks, currentTime]);

    // Get visible chunks
    const visibleChunks = useMemo(() => {
        return chunks.filter((c) => visibleChunkIndices.has(c.chunk_index));
    }, [chunks, visibleChunkIndices]);

    // Get the latest visible chunk for current topic info
    const latestVisibleChunk = useMemo(() => {
        if (visibleChunks.length === 0) return null;
        return visibleChunks.reduce((latest, chunk) =>
            chunk.chunk_index > latest.chunk_index ? chunk : latest
        );
    }, [visibleChunks]);

    // Get current topic ID from the latest visible chunk
    const currentTopicId = useMemo(() => {
        if (visibleChunks.length === 0) return null;

        const sortedByNewest = [...visibleChunks].sort(
            (a, b) => b.chunk_index - a.chunk_index
        );

        for (const chunk of sortedByNewest) {
            const topicId = getChunkTopicId(chunk, chunkToTopicMap);
            if (topicId) return topicId;
        }

        if (!latestVisibleChunk) return null;
        return getChunkTopicId(latestVisibleChunk, chunkToTopicMap);
    }, [visibleChunks, latestVisibleChunk, chunkToTopicMap]);

    // Get visible topics (topics from all visible chunks)
    const visibleTopics = useMemo(() => {
        if (visibleChunks.length === 0) return [];

        const visibleTopicIds = new Set<string>();
        for (const chunk of visibleChunks) {
            const topicId = chunkToTopicMap.get(chunk.chunk_index);
            if (topicId) {
                visibleTopicIds.add(topicId);
            }
        }

        return topics.filter((topic) => visibleTopicIds.has(topic.id));
    }, [visibleChunks, topics, chunkToTopicMap]);

    // Get visible insights from visible chunks while respecting loading animations
    const visibleInsights = useMemo(() => {
        const loadingIds = new Set(loadingInsights.map((item) => item.insightId));
        const visibleInsightIds = new Set<string>();

        for (const chunk of visibleChunks) {
            const chunkInsights = getInsightsFromChunk(chunk, insights);
            for (const insight of chunkInsights) {
                if (!loadingIds.has(insight.id)) {
                    visibleInsightIds.add(insight.id);
                }
            }
        }

        return insights.filter((insight) => visibleInsightIds.has(insight.id));
    }, [insights, visibleChunks, loadingInsights]);

    // Compute the visible state
    const visibleState = useMemo((): VisibleState => {
        return {
            topics: visibleTopics,
            insights: visibleInsights,
            currentTopicId,
            meetingTitle: visibleChunks.length > 0 ? meetingTitle : "",
            meetingSummary: visibleChunks.length > 0 ? meetingSummary : "",
        };
    }, [visibleTopics, visibleInsights, currentTopicId, visibleChunks.length, meetingTitle, meetingSummary]);

    // Handle progress toast and loading transitions during continuous playback.
    useEffect(() => {
        const lastTime = lastProcessedTimeRef.current;
        const delta = currentTime - lastTime;
        const isContinuousForward = delta > 0 && delta <= MAX_CONTINUOUS_STEP_SECONDS;

        if (!isContinuousForward || !isPlaying) {
            lastProcessedTimeRef.current = currentTime;
            return;
        }

        const crossedEndChunks = getChunksCrossedEnd(chunks, lastTime, currentTime);
        for (const chunk of crossedEndChunks) {
            if (!onChunkProcessingStart) continue;
            if (!chunkHasInsightGeneration(chunk)) continue;

            setProcessingLock(chunk.chunk_index);
            const { topicId, topicName } = getTopicInfoFromChunk(chunk, topics);
            const progressEvents = convertEventsForProgress(chunk.events);
            onChunkProcessingStart(progressEvents, topicId, topicName);
        }

        const processedChunks = processedChunksRef.current;
        const newlyCompleted = getNewlyCompletedChunks(chunks, lastTime, currentTime, processedChunks);
        for (const chunk of newlyCompleted) {
            processedChunks.add(chunk.chunk_index);

            const newInsights = getInsightsFromChunk(chunk, insights);
            if (newInsights.length === 0) continue;

            const now = Date.now();
            const loadingItems: LoadingInsight[] = newInsights.map((insight) => ({
                insightId: insight.id,
                startTime: now,
                insight,
            }));

            setLoadingInsights((prev) => {
                const existingIds = new Set(prev.map((item) => item.insightId));
                const dedupedItems = loadingItems.filter((item) => !existingIds.has(item.insightId));
                if (dedupedItems.length === 0) return prev;
                return [...prev, ...dedupedItems];
            });

            const topicIds = new Set(newInsights.map((i) => i.thread?.topic_id).filter(Boolean) as string[]);
            if (topicIds.size > 0) {
                setHighlights((prev) => ({
                    topicIds: new Set([...prev.topicIds, ...topicIds]),
                    insightIds: prev.insightIds,
                }));

                const timer = setTimeout(() => {
                    setHighlights((prev) => {
                        const newTopicIds = new Set(prev.topicIds);
                        topicIds.forEach((id) => newTopicIds.delete(id));
                        return { ...prev, topicIds: newTopicIds };
                    });
                    highlightTimersRef.current.delete(timer);
                }, HIGHLIGHT_DURATION_MS);

                highlightTimersRef.current.add(timer);
            }
        }

        lastProcessedTimeRef.current = currentTime;
    }, [chunks, insights, currentTime, onChunkProcessingStart, topics, isPlaying, setProcessingLock]);

    // Process loading insights - move to shown after 5 seconds
    useEffect(() => {
        if (loadingInsights.length === 0) return;

        const now = Date.now();
        const readyToShow: LoadingInsight[] = [];
        const stillLoading: LoadingInsight[] = [];

        for (const item of loadingInsights) {
            if (now - item.startTime >= LOADING_DURATION_MS) {
                readyToShow.push(item);
            } else {
                stillLoading.push(item);
            }
        }

        if (readyToShow.length > 0) {
            setLoadingInsights(stillLoading);

            // Add insight highlight
            const insightIds = new Set(readyToShow.map((item) => item.insightId));
            setHighlights((prev) => ({
                topicIds: prev.topicIds,
                insightIds: new Set([...prev.insightIds, ...insightIds]),
            }));

            // Schedule removal of insight highlight
            const timerForHighlight = setTimeout(() => {
                setHighlights((prev) => {
                    const newInsightIds = new Set(prev.insightIds);
                    insightIds.forEach((id) => newInsightIds.delete(id));
                    return { ...prev, insightIds: newInsightIds };
                });
                highlightTimersRef.current.delete(timerForHighlight);
            }, HIGHLIGHT_DURATION_MS);

            highlightTimersRef.current.add(timerForHighlight);
        }

        // Set up timer for remaining loading insights
        if (stillLoading.length > 0) {
            const oldestItem = stillLoading.reduce((oldest, item) =>
                item.startTime < oldest.startTime ? item : oldest
            );
            const timeRemaining = LOADING_DURATION_MS - (now - oldestItem.startTime);

            const timer = setTimeout(() => {
                // Trigger re-evaluation
                setLoadingInsights((prev) => [...prev]);
            }, timeRemaining + 10);

            return () => clearTimeout(timer);
        }
    }, [loadingInsights]);

    // Reset derived playback state to an arbitrary time (used for forward/backward seeks).
    const resetToTime = useCallback((time: number) => {
        const processedIndices = new Set<number>();

        for (const chunk of chunks) {
            if (chunk.start_timestamp === undefined || chunk.end_timestamp === undefined) continue;
            if (time >= chunk.end_timestamp) {
                processedIndices.add(chunk.chunk_index);
            }
        }

        processedChunksRef.current = processedIndices;
        setLoadingInsights([]);
        clearAllProcessingLocks();
        setHighlights({ topicIds: new Set(), insightIds: new Set() });
        clearHighlightTimers();
        onPlaybackReset?.();
        lastProcessedTimeRef.current = time;
    }, [chunks, clearHighlightTimers, clearAllProcessingLocks, onPlaybackReset]);

    // Handle seeks
    useEffect(() => {
        const lastTime = lastProcessedTimeRef.current;

        // If we jumped backwards significantly, reset state
        if (currentTime < lastTime - 0.5) {
            resetToTime(currentTime);
        } else if (currentTime > lastTime + 1) {
            // Forward seek - reset to current time to properly set up state
            resetToTime(currentTime);
        }
    }, [currentTime, resetToTime]);

    // Initialize derived state on first load or when chunks change
    useEffect(() => {
        if (chunks.length > 0 && currentTime > 0) {
            resetToTime(currentTime);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chunks.length]); // Only reset on initial load

    return {
        visibleState,
        loadingInsights,
        highlights,
        visibleChunkIndices,
        processingChunkIndices,
    };
}
