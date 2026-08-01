// Types for Progress Toast feature
// This module defines the state and types for the insight generation progress indicator

import type { Insight } from "./index";

// ============= Progress Stages =============

/**
 * Represents the current stage of insight generation.
 * The stages flow in order: generating -> searching -> creating -> complete
 * 
 * Note: "retrieving" was removed - retriever_planner updates are part of the "searching" stage
 */
export type ProgressStage =
    | "generating"   // After insight_need_assessment with insight_needed=true - shows "Recognized to generate insight..."
    | "searching"    // After query_constructor - shows query list + retrieved doc count
    | "creating"     // After insight_selector - shows which insight types are being created
    | "complete";    // After all insight_generated events received

// ============= Progress Toast State =============

/**
 * State for a single progress toast instance.
 * Each chunk that generates insights gets its own progress toast.
 */
export interface ProgressToastState {
    id: string;                              // Unique ID for this progress session (usually chunk_index based)
    chunkIndex: number;                      // The chunk being processed
    stage: ProgressStage;                    // Current stage of processing
    topicId: string | null;                  // Topic this insight belongs to (from topic_detector)
    topicName: string | null;                // Human-readable topic name
    transcriptChunk: string | null;          // Transcript chunk being processed
    speaker: string | null;                  // Speaker name for the transcript chunk
    queries: string[];                       // Search queries from query_constructor
    retrievedDocCount: number;               // Cumulative document count from retriever_planner
    generatorTypes: ("viz" | "text")[];      // Which types of insights are being generated
    generatedInsightIds: string[];           // IDs of insights as they're generated
    generatedGeneratorTypes: ("viz" | "text")[]; // Generator types completed based on node_name
    generatedInsights: Insight[];            // Full insight objects as they're generated
    expectedInsightCount: number;            // Based on generatorTypes length
    startedAt: number;                       // Timestamp when progress started
    completedAt: number | null;              // Timestamp when complete, null if still in progress
    lifecycle: "active" | "exiting";
}

// ============= Progress Toast Actions =============

/**
 * Actions that can be dispatched to update progress toast state.
 * Used internally by the useProgressToast hook.
 */
export type ProgressToastAction =
    | { type: "START_PROGRESS"; payload: { chunkIndex: number; topicId: string | null; topicName: string | null; transcriptChunk: string | null } }
    | { type: "SET_QUERIES"; payload: { queries: string[] } }
    | { type: "UPDATE_DOC_COUNT"; payload: { count: number } }
    | { type: "SET_GENERATOR_TYPES"; payload: { types: ("viz" | "text")[] } }
    | { type: "INSIGHT_GENERATED"; payload: { insightId: string; insight: Insight } }
    | { type: "COMPLETE"; payload: { completedAt: number } }
    | { type: "DISMISS"; payload: { id: string } };

// ============= Seen Tracking State =============

/**
 * Tracks which insights have been "seen" by the user.
 * An insight is considered seen after being visible in the viewport for 10 seconds.
 */
export interface SeenTrackingState {
    seenInsightIds: Set<string>;             // Insights that have been marked as seen
    viewingTimers: Map<string, ReturnType<typeof setTimeout>>; // Active timers for insights in viewport
}

// ============= Progress Toast Hook Return =============

/**
 * Return type for the useProgressToast hook.
 */
export interface UseProgressToastReturn {
    activeToasts: ProgressToastState[];      // Currently active progress toasts
    dismissToast: (id: string) => void;      // Manually dismiss a toast
    processEvent: (event: ChunkEventForProgress) => void; // Process a chunk event
}

// ============= Event Types for Progress Processing =============

/**
 * Simplified event type for progress toast processing.
 * Contains only the fields needed for progress tracking.
 */
export interface ChunkEventForProgress {
    event: string;
    data: {
        chunk_index: number;
        transcript_chunk?: string;
        speaker?: string;
        // Fields from different event types
        insight_needed?: boolean;
        current_topic_id?: string;
        created_topic?: { id: string; name: string };
        queries?: Array<{ query_text: string }>;
        retrieved_document_count?: number;
        generator_types?: string[];
        node_name?: "text_insight_generator" | "viz_generator";
        insight?: Insight;
    };
}

// ============= Insight Banner State =============

/**
 * State for insight banners shown when sidebar is collapsed.
 * Each generated insight gets its own banner that auto-dismisses after 20 seconds.
 */
export interface InsightBannerState {
    id: string;                              // Unique ID for the banner
    insight: Insight;                        // The insight to display
    topicId: string | null;                  // Topic ID for navigation when opening sidebar
    topicName: string;                       // Topic name for context
    transcriptChunk: string | null;          // Transcript chunk that triggered the insight
    speaker: string | null;                  // Speaker name for the transcript chunk
    showAt: number;                          // Timestamp when to show (for staggering)
    dismissAt: number;                       // Timestamp when to auto-dismiss
    lifecycle: "active" | "exiting";
}
