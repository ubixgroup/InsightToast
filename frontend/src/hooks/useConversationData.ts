import { useState, useEffect } from "react";
import type {
    Chunk,
    ChunkEvent,
    Topic,
    Insight,
    TimestampedEvent,
    TopicDetectorEventData,
    InsightGeneratedEventData,
    MeetingTrackerEventData,
    ParsedConversationData,
} from "@/types";

// Raw chunk from JSON (before processing)
interface RawChunk {
    chunk_index: number;
    content: string;
    speaker: string;
    duration_seconds: number;
    events: ChunkEvent[];
    // Optional video sync timestamps (only present for some chunks)
    start_timestamp?: number;
    end_timestamp?: number;
}

interface ConversationData extends ParsedConversationData {
    timestampedChunks: Chunk[];
    events: TimestampedEvent[];
    snapPoints: number[];
    isLoading: boolean;
    error: string | null;
}

const emptyState: ParsedConversationData = {
    chunks: [],
    topics: [],
    insights: [],
    meetingTitle: "",
    meetingSummary: "",
    meetingKeyValues: {},
    chunkToTopicMap: new Map<number, string>(),
    insightToChunkMap: new Map<string, number>(),
    topicToChunksMap: new Map<string, number[]>(),
    videoTimeToChunksMap: new Map<number, number[]>(),
};

/**
 * Parse chunks and extract all data from events
 * Handles both video-synced and non-video-synced chunks properly
 */
function parseConversationData(rawChunks: RawChunk[]): ParsedConversationData {
    // Sort chunks by index
    const sortedRawChunks = [...rawChunks].sort((a, b) => a.chunk_index - b.chunk_index);
    
    // Compute cumulative timestamps from duration_seconds (for display purposes)
    // Also track which chunks have video sync and which don't
    let cumulativeTime = 0;
    const chunks: Chunk[] = sortedRawChunks.map((rawChunk) => {
        const chunkCumulativeTimestamp = cumulativeTime;
        cumulativeTime += rawChunk.duration_seconds;
        
        // Check if this chunk has video sync timestamps from JSON
        const hasVideoSync = rawChunk.start_timestamp !== undefined && rawChunk.end_timestamp !== undefined;
        
        return {
            chunk_index: rawChunk.chunk_index,
            content: rawChunk.content,
            speaker: rawChunk.speaker,
            duration_seconds: rawChunk.duration_seconds,
            events: rawChunk.events,
            // Preserve original video sync timestamps if present
            start_timestamp: rawChunk.start_timestamp,
            end_timestamp: rawChunk.end_timestamp,
            // New fields
            has_video_sync: hasVideoSync,
            cumulative_timestamp: chunkCumulativeTimestamp,
        };
    });
    
    // Build videoTimeToChunksMap:
    // Non-video-synced chunks appear when the next video-synced chunk starts
    const videoTimeToChunksMap = new Map<number, number[]>();
    
    // Find all video-synced chunks and group non-synced chunks with them
    let pendingNonSyncedChunks: number[] = [];
    
    for (const chunk of chunks) {
        if (chunk.has_video_sync && chunk.start_timestamp !== undefined) {
            // This is a video-synced chunk
            // Add all pending non-synced chunks to appear at this video time
            const chunksAtTime = videoTimeToChunksMap.get(chunk.start_timestamp) || [];
            chunksAtTime.push(...pendingNonSyncedChunks, chunk.chunk_index);
            videoTimeToChunksMap.set(chunk.start_timestamp, chunksAtTime);
            pendingNonSyncedChunks = [];
        } else {
            // Non-video-synced chunk - add to pending
            pendingNonSyncedChunks.push(chunk.chunk_index);
        }
    }
    
    // If there are remaining non-synced chunks at the end, 
    // they appear at time 0 (immediately visible)
    if (pendingNonSyncedChunks.length > 0) {
        const chunksAtZero = videoTimeToChunksMap.get(0) || [];
        // Prepend them to time 0
        videoTimeToChunksMap.set(0, [...pendingNonSyncedChunks, ...chunksAtZero]);
    }
    
    // Extract data from events
    const topicsMap = new Map<string, Topic>();
    const insightsMap = new Map<string, Insight>();
    const chunkToTopicMap = new Map<number, string>();
    const insightToChunkMap = new Map<string, number>();
    const topicToChunksMap = new Map<string, number[]>();
    
    let meetingTitle = "";
    let meetingSummary = "";
    let meetingKeyValues: Record<string, string> = {};
    let currentTopicId: string | null = null;
    
    for (const chunk of chunks) {
        for (const event of chunk.events) {
            const eventType = event.event;
            const data = event.data;
            
            // Handle topic_detector events
            if (eventType === "topic_detector") {
                const topicData = data as TopicDetectorEventData;
                currentTopicId = topicData.current_topic_id;
                
                // Store chunk-to-topic mapping
                if (currentTopicId) {
                    chunkToTopicMap.set(chunk.chunk_index, currentTopicId);
                    
                    // Add chunk to topic's chunk list
                    const existingChunks = topicToChunksMap.get(currentTopicId) || [];
                    if (!existingChunks.includes(chunk.chunk_index)) {
                        existingChunks.push(chunk.chunk_index);
                        topicToChunksMap.set(currentTopicId, existingChunks);
                    }
                }
                
                // If a topic was created, add it
                if (topicData.created_topic) {
                    topicsMap.set(topicData.created_topic.id, topicData.created_topic);
                }
            }
            
            // Handle insight_generated events
            if (eventType === "insight_generated") {
                const insightData = data as InsightGeneratedEventData;
                const insight: Insight = {
                    ...insightData.insight,
                    source_chunk_index: chunk.chunk_index,
                };
                insightsMap.set(insight.id, insight);
                insightToChunkMap.set(insight.id, chunk.chunk_index);
                
                // Also ensure chunk-to-topic mapping exists via insight's topic
                const topicId = insight.thread?.topic_id;
                if (topicId && !chunkToTopicMap.has(chunk.chunk_index)) {
                    chunkToTopicMap.set(chunk.chunk_index, topicId);
                }
            }
            
            // Handle meeting_tracker events
            if (eventType === "meeting_tracker") {
                const meetingData = data as MeetingTrackerEventData;
                meetingTitle = meetingData.meeting_title;
                meetingSummary = meetingData.meeting_summary;
                meetingKeyValues = meetingData.meeting_key_values;
            }
        }
    }
    
    // Convert maps to arrays, sorted by creation time
    const topics = Array.from(topicsMap.values()).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const insights = Array.from(insightsMap.values()).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return {
        chunks,
        topics,
        insights,
        meetingTitle,
        meetingSummary,
        meetingKeyValues,
        chunkToTopicMap,
        insightToChunkMap,
        topicToChunksMap,
        videoTimeToChunksMap,
    };
}

/**
 * Build timeline events from chunks for snap points
 */
function buildTimelineEvents(chunks: Chunk[]): TimestampedEvent[] {
    const eventList: TimestampedEvent[] = [];

    for (const chunk of chunks) {
        // Only add events for video-synced chunks
        if (chunk.has_video_sync) {
            if (chunk.start_timestamp !== undefined) {
                eventList.push({
                    timestamp: chunk.start_timestamp,
                    type: "start",
                    chunkIndex: chunk.chunk_index,
                    chunk,
                });
            }
            if (chunk.end_timestamp !== undefined) {
                eventList.push({
                    timestamp: chunk.end_timestamp,
                    type: "end",
                    chunkIndex: chunk.chunk_index,
                    chunk,
                });
            }
        }
    }

    // Sort by timestamp
    eventList.sort((a, b) => a.timestamp - b.timestamp);
    return eventList;
}

/**
 * Extract snap points from events
 */
function buildSnapPoints(events: TimestampedEvent[]): number[] {
    const points = new Set<number>();
    for (const event of events) {
        points.add(event.timestamp);
    }
    return Array.from(points).sort((a, b) => a - b);
}

export function useConversationData(): ConversationData {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Store parsed data in state for persistence
    const [conversationState, setConversationState] = useState<ParsedConversationData>(emptyState);
    const [events, setEvents] = useState<TimestampedEvent[]>([]);
    const [snapPoints, setSnapPoints] = useState<number[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch("/input.json");
                if (!response.ok) {
                    throw new Error(`Failed to load data: ${response.statusText}`);
                }
                const rawChunks: RawChunk[] = await response.json();
                
                // Parse and store in state
                const parsed = parseConversationData(rawChunks);
                setConversationState(parsed);
                
                // Build timeline events and snap points
                const timelineEvents = buildTimelineEvents(parsed.chunks);
                setEvents(timelineEvents);
                setSnapPoints(buildSnapPoints(timelineEvents));
                
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return {
        ...conversationState,
        timestampedChunks: conversationState.chunks,
        events,
        snapPoints,
        isLoading,
        error,
    };
}
