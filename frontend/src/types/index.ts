// Types for the conversation insight data - Event-based format

// ============= Cited Documents =============

export interface CitedDocument {
    document_id: string;
    source_url: string | null;
}

// ============= Topic =============

export interface Topic {
    id: string;
    name: string;
    description: string;
    example_transcript_segment_ids?: string[];
    transcript_segment_ids?: string[];
    thread_ids?: string[];
    created_at: string;
    updated_at: string;
}

// ============= Thread Info =============

export interface ThreadInfo {
    thread_id: string;
    topic_id: string;
    insight_ids: string[];
}

// ============= Insights =============

export interface BaseInsight {
    id: string;
    created_at: string;
    thread: ThreadInfo;
    cited_documents: CitedDocument[];
    // Computed field - which chunk generated this insight
    source_chunk_index?: number;
}

export interface TextInsight extends BaseInsight {
    type: "text";
    title?: string;   // Short title (max ~5 words). May be absent in older sessions.
    content: string;
}

export interface VizInsight extends BaseInsight {
    type: "viz";
    chart_type: string;
    chart_title: string;
    subtitle: string;
    data: Record<string, unknown>; // Vega-Lite specification
}

export type Insight = TextInsight | VizInsight;

// ============= Event Types =============

export interface ChunkStartedEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    event: "chunk_started";
}

export interface ProceduralCheckEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    node_name: "procedural_check";
    is_procedural: boolean;
    procedural_reasoning: string;
    event: "procedural_check";
}

export interface TopicDetectorEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    node_name: "topic_detector";
    topic_action: "create_topic" | "continue_topic" | "switch_topic";
    current_topic_id: string | null;
    created_topic?: Topic;
    event: "topic_detector";
}

export interface InsightNeedAssessmentEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    node_name: "insight_need_assessment";
    insight_needed: boolean;
    insight_need_reasoning: string;
    event: "insight_need_assessment";
}

export interface MeetingTrackerEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    node_name: "meeting_tracker";
    meeting_summary: string;
    meeting_key_values: Record<string, string>;
    meeting_title: string;
    event: "meeting_tracker";
}

export interface QueryConstructorEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    node_name: "query_constructor";
    queries: Array<{
        query_id: string;
        query_text: string;
        hypothetical_response: string;
        suggested_insight_types: string[];
    }>;
    event: "query_constructor";
}

export interface RelatedInsightFinderEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    insight_id: string | null;
    thread_id: string | null;
    event: "related_insight_finder";
}

export interface RetrieverPlannerEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    retrieved_document_count: number;
    document_types: string[];
    event: "retriever_planner";
}

export interface InsightSelectorEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    generator_types: ("viz" | "text")[];
    event: "insight_selector";
}

export interface InsightGeneratedEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    node_name: "text_insight_generator" | "viz_generator";
    insight: Insight;
    event: "insight_generated";
}

export interface ChunkCompleteEventData {
    timestamp: string;
    conversation_id: string;
    chunk_index: number;
    transcript_chunk: string;
    speaker: string;
    transcript_id: string | null;
    processing_time_ms: number;
    event: "chunk_complete";
}

export type ChunkEventData =
    | ChunkStartedEventData
    | ProceduralCheckEventData
    | TopicDetectorEventData
    | InsightNeedAssessmentEventData
    | MeetingTrackerEventData
    | QueryConstructorEventData
    | RelatedInsightFinderEventData
    | RetrieverPlannerEventData
    | InsightSelectorEventData
    | InsightGeneratedEventData
    | ChunkCompleteEventData;

export interface ChunkEvent {
    event: string;
    data: ChunkEventData;
}

// ============= Chunk (New Format) =============

export interface Chunk {
    chunk_index: number;
    content: string;
    speaker: string;
    duration_seconds: number;
    events: ChunkEvent[];
    // Video sync timestamps (from JSON - only present for video-synced chunks)
    start_timestamp?: number;
    end_timestamp?: number;
    // Whether this chunk has video sync timestamps
    has_video_sync: boolean;
    // Cumulative timestamp calculated from duration_seconds (for display purposes)
    cumulative_timestamp: number;
}

// ============= Parsed Data (extracted from events) =============

export interface ParsedConversationData {
    chunks: Chunk[];
    topics: Topic[];
    insights: Insight[];
    meetingTitle: string;
    meetingSummary: string;
    meetingKeyValues: Record<string, string>;
    // Mappings for transcript-topic-insight relationships
    chunkToTopicMap: Map<number, string>; // chunk_index -> topic_id
    insightToChunkMap: Map<string, number>; // insight_id -> chunk_index
    topicToChunksMap: Map<string, number[]>; // topic_id -> chunk_indices
    // Video time to chunks mapping (for showing non-timestamped chunks at the right time)
    videoTimeToChunksMap: Map<number, number[]>; // video_timestamp -> chunk_indices to show at that time
}

// ============= Computed types for the UI =============

export interface TimestampedEvent {
    timestamp: number;
    type: "start" | "end";
    chunkIndex: number;
    chunk: Chunk;
}

export interface VisibleState {
    topics: Topic[];
    insights: Insight[];
    currentTopicId: string | null;
    meetingTitle: string;
    meetingSummary: string;
}

export interface LoadingInsight {
    insightId: string;
    startTime: number;
    insight: Insight;
}

export interface HighlightState {
    topicIds: Set<string>;
    insightIds: Set<string>;
}

// ============= Pin/Dismiss State =============

export interface DismissedInsight {
    insight: Insight;
    originalTopicId: string;
    topicName: string;
    dismissedAt: number;
}

// ============= Selection State =============

export interface SelectionState {
    expandedTopicId: string | null;
    selectedInsightId: string | null;
}

// ============= Seen Tracking State =============

/**
 * Tracks which insights have been viewed by the user.
 * Used for showing "unseen" indicators and glow effects.
 */
export interface InsightSeenState {
    seenInsightIds: Set<string>;
}

// Re-export progress toast types
export * from "./progressToast";
