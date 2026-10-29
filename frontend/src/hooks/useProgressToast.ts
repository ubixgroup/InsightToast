import { useState, useCallback, useRef, useEffect } from "react";
import type {
    ProgressToastState,
    ProgressStage,
    ChunkEventForProgress,
    InsightBannerState,
} from "@/types/progressToast";
import type { Insight, Topic } from "@/types";

// ============= Constants =============

// Time in ms before a completed toast auto-dismisses
const COMPLETE_TOAST_DISMISS_MS = 5000;
// Time in ms before an insight banner auto-dismisses (when sidebar collapsed)
const INSIGHT_BANNER_DISMISS_MS = 6000;
const EXIT_LIFECYCLE_DISMISS_MS = 340;
const TRANSCRIPT_PREVIEW_MAX_CHARS = 140;

// ============= Helper Functions =============

/**
 * Creates a unique ID for a progress toast based on chunk index and timestamp.
 */
function createToastId(chunkIndex: number): string {
    return `progress-${chunkIndex}-${Date.now()}`;
}

// ============= Hook Interface =============

interface UseProgressToastOptions {
    topics: Topic[];
    pauseAutoDismiss?: boolean;
    /** When true, simulation events after the initial toast creation are buffered instead of processed. */
    pauseProgressSimulation?: boolean;
    onStageChange?: (toastId: string, stage: ProgressStage) => void;
    onBannerCreated?: (insight: Insight) => void;
}

interface ChunkContext {
    topicId: string | null;
    topicName: string | null;
    transcriptChunk: string | null;
    speaker: string | null;
}

const EMPTY_CHUNK_CONTEXT: ChunkContext = {
    topicId: null,
    topicName: null,
    transcriptChunk: null,
    speaker: null,
};

function normalizeGeneratorType(nodeName?: string): "viz" | "text" | null {
    if (nodeName === "viz_generator") return "viz";
    if (nodeName === "text_insight_generator") return "text";
    return null;
}

function toTranscriptPreview(raw?: string | null): string | null {
    if (!raw) return null;
    const normalized = raw.replace(/\s+/g, " ").trim();
    if (!normalized) return null;
    if (normalized.length <= TRANSCRIPT_PREVIEW_MAX_CHARS) return normalized;
    return `${normalized.slice(0, TRANSCRIPT_PREVIEW_MAX_CHARS - 1).trimEnd()}…`;
}

interface UseProgressToastReturn {
    activeToasts: ProgressToastState[];
    insightBanners: InsightBannerState[];
    dismissToast: (id: string) => void;
    dismissBanner: (id: string) => void;
    finalizeDismissToast: (id: string) => void;
    finalizeDismissBanner: (id: string) => void;
    processEvent: (event: ChunkEventForProgress, topicId?: string | null, topicName?: string | null) => void;
    // For demo mode: process all events from a chunk with simulated delays
    simulateChunkEvents: (events: ChunkEventForProgress[], topicId: string | null, topicName: string | null) => void;
    /** Process buffered events up to the next stage-changing event. Only useful when pauseProgressSimulation is true. */
    advanceProgressStage: () => void;
    resetProgressState: () => void;
}

// ============= Main Hook =============

/**
 * Hook for managing progress toast state during insight generation.
 * 
 * This hook:
 * - Tracks the progress of insight generation through various stages
 * - Shows toast notifications for each stage
 * - Auto-dismisses completed toasts after 5 seconds
 * - Creates insight banners when sidebar is collapsed
 * 
 * @param options - Configuration options including topics and sidebar state
 * @returns Object with active toasts, banners, and methods to manage them
 */
export function useProgressToast({
    topics,
    pauseAutoDismiss,
    pauseProgressSimulation,
    onStageChange,
    onBannerCreated,
}: UseProgressToastOptions): UseProgressToastReturn {
    // Active progress toasts (one per chunk being processed)
    const [activeToasts, setActiveToasts] = useState<ProgressToastState[]>([]);

    // Insight banners for collapsed sidebar state
    const [insightBanners, setInsightBanners] = useState<InsightBannerState[]>([]);

    // Track toast IDs to chunk indices for quick lookup
    const chunkToToastId = useRef<Map<number, string>>(new Map());

    // Auto-dismiss timers for completed toasts
    const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const exitToastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Banner dismiss timers
    const bannerTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const exitBannerTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const activeBannerInsightIds = useRef<Set<string>>(new Set());
    const bannerIdToInsightId = useRef<Map<string, string>>(new Map());
    const chunkContextRef = useRef<Map<number, ChunkContext>>(new Map());

    // Timers used for staged demo simulation events
    const simulationTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
    const chunkSimulationTimers = useRef<Map<number, Set<ReturnType<typeof setTimeout>>>>(new Map());

    // Pause-progress refs (readable from stale timer closures via ref)
    const pauseProgressSimulationRef = useRef(false);
    useEffect(() => {
        pauseProgressSimulationRef.current = pauseProgressSimulation ?? false;
    }, [pauseProgressSimulation]);

    // Stored events for manual stage advancement (populated immediately, not timer-dependent)
    const advanceEventsRef = useRef<Array<{ event: ChunkEventForProgress; topicId: string | null; topicName: string | null }>>([]);
    const advanceIndexRef = useRef(0);

    const clearSimulationTimers = useCallback(() => {
        simulationTimers.current.forEach((timer) => clearTimeout(timer));
        simulationTimers.current.clear();
        chunkSimulationTimers.current.clear();
    }, []);

    const clearChunkSimulationTimers = useCallback((chunkIndex: number) => {
        const timers = chunkSimulationTimers.current.get(chunkIndex);
        if (!timers) return;

        timers.forEach((timer) => {
            clearTimeout(timer);
            simulationTimers.current.delete(timer);
        });
        chunkSimulationTimers.current.delete(chunkIndex);
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        const dismissTimersMap = dismissTimers.current;
        const bannerTimersMap = bannerTimers.current;
        const exitToastTimersMap = exitToastTimers.current;
        const exitBannerTimersMap = exitBannerTimers.current;
        return () => {
            dismissTimersMap.forEach((timer) => clearTimeout(timer));
            bannerTimersMap.forEach((timer) => clearTimeout(timer));
            exitToastTimersMap.forEach((timer) => clearTimeout(timer));
            exitBannerTimersMap.forEach((timer) => clearTimeout(timer));
            clearSimulationTimers();
        };
    }, [clearSimulationTimers]);

    /**
     * Dismisses a progress toast by ID.
     */
    const finalizeDismissToast = useCallback((id: string) => {
        setActiveToasts((prev) => prev.filter((toast) => toast.id !== id));

        // Clear any pending dismiss timer
        const timer = dismissTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            dismissTimers.current.delete(id);
        }

        const exitTimer = exitToastTimers.current.get(id);
        if (exitTimer) {
            clearTimeout(exitTimer);
            exitToastTimers.current.delete(id);
        }

        // Remove from chunk mapping
        chunkToToastId.current.forEach((toastId, chunkIndex) => {
            if (toastId === id) {
                chunkToToastId.current.delete(chunkIndex);
            }
        });
    }, []);

    const dismissToast = useCallback((id: string) => {
        let didTransitionToExiting = false;
        setActiveToasts((prev) => prev.map((toast) => {
            if (toast.id !== id || toast.lifecycle === "exiting") return toast;
            didTransitionToExiting = true;
            return { ...toast, lifecycle: "exiting" };
        }));

        const timer = dismissTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            dismissTimers.current.delete(id);
        }

        if (didTransitionToExiting) {
            const existingExitTimer = exitToastTimers.current.get(id);
            if (existingExitTimer) {
                clearTimeout(existingExitTimer);
            }

            const exitTimer = setTimeout(() => {
                finalizeDismissToast(id);
            }, EXIT_LIFECYCLE_DISMISS_MS);
            exitToastTimers.current.set(id, exitTimer);
        }
    }, [finalizeDismissToast]);

    /**
     * Dismisses an insight banner by ID.
     */
    const finalizeDismissBanner = useCallback((id: string) => {
        setInsightBanners((prev) => prev.filter((banner) => banner.id !== id));

        const insightId = bannerIdToInsightId.current.get(id);
        if (insightId) {
            activeBannerInsightIds.current.delete(insightId);
            bannerIdToInsightId.current.delete(id);
        }

        const timer = bannerTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            bannerTimers.current.delete(id);
        }

        const exitTimer = exitBannerTimers.current.get(id);
        if (exitTimer) {
            clearTimeout(exitTimer);
            exitBannerTimers.current.delete(id);
        }
    }, []);

    const dismissBanner = useCallback((id: string) => {
        let didTransitionToExiting = false;
        setInsightBanners((prev) => prev.map((banner) => {
            if (banner.id !== id || banner.lifecycle === "exiting") return banner;
            didTransitionToExiting = true;
            return { ...banner, lifecycle: "exiting" };
        }));

        const timer = bannerTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            bannerTimers.current.delete(id);
        }

        if (didTransitionToExiting) {
            const existingExitTimer = exitBannerTimers.current.get(id);
            if (existingExitTimer) {
                clearTimeout(existingExitTimer);
            }

            const exitTimer = setTimeout(() => {
                finalizeDismissBanner(id);
            }, EXIT_LIFECYCLE_DISMISS_MS);
            exitBannerTimers.current.set(id, exitTimer);
        }
    }, [finalizeDismissBanner]);

    const resetProgressState = useCallback(() => {
        clearSimulationTimers();

        dismissTimers.current.forEach((timer) => clearTimeout(timer));
        dismissTimers.current.clear();
        exitToastTimers.current.forEach((timer) => clearTimeout(timer));
        exitToastTimers.current.clear();

        bannerTimers.current.forEach((timer) => clearTimeout(timer));
        bannerTimers.current.clear();
        exitBannerTimers.current.forEach((timer) => clearTimeout(timer));
        exitBannerTimers.current.clear();
        activeBannerInsightIds.current.clear();
        bannerIdToInsightId.current.clear();

        chunkToToastId.current.clear();
        chunkContextRef.current.clear();
        setActiveToasts([]);
        setInsightBanners([]);
    }, [clearSimulationTimers]);

    /**
     * Schedules auto-dismiss for a completed toast.
     */
    const scheduleToastDismiss = useCallback((id: string, delayMs: number = COMPLETE_TOAST_DISMISS_MS) => {
        // Skip scheduling if auto-dismiss is paused
        if (pauseAutoDismiss) return;

        // Clear existing timer if any
        const existingTimer = dismissTimers.current.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
            dismissToast(id);
        }, delayMs);

        dismissTimers.current.set(id, timer);
    }, [dismissToast, pauseAutoDismiss]);

    /**
     * Creates an insight banner and schedules auto-dismiss.
     */
    const createInsightBanner = useCallback((
        insight: Insight,
        topicName: string,
        topicId: string | null,
        transcriptChunk: string | null,
        speaker: string | null,
    ) => {
        if (activeBannerInsightIds.current.has(insight.id)) {
            return;
        }

        const bannerId = `banner-${insight.id}-${Date.now()}`;
        const now = Date.now();

        const banner: InsightBannerState = {
            id: bannerId,
            insight,
            topicId,
            topicName,
            transcriptChunk,
            speaker,
            showAt: now,
            dismissAt: now + INSIGHT_BANNER_DISMISS_MS,
            lifecycle: "active",
        };

        activeBannerInsightIds.current.add(insight.id);
        bannerIdToInsightId.current.set(bannerId, insight.id);

        setInsightBanners((prev) => [...prev, banner]);

        onBannerCreated?.(insight);

        // Schedule auto-dismiss (skip if paused)
        if (!pauseAutoDismiss) {
            const timer = setTimeout(() => {
                dismissBanner(bannerId);
            }, INSIGHT_BANNER_DISMISS_MS);

            bannerTimers.current.set(bannerId, timer);
        }
    }, [dismissBanner, pauseAutoDismiss, onBannerCreated]);

    /**
     * Gets the topic name from a topic ID.
     */
    const getTopicName = useCallback((topicId: string | null): string | null => {
        if (!topicId) return null;
        const topic = topics.find((t) => t.id === topicId);
        return topic?.name ?? null;
    }, [topics]);

    const resolveChunkContext = useCallback((
        chunkIndex: number,
        data: ChunkEventForProgress["data"],
        topicIdOverride?: string | null,
        topicNameOverride?: string | null,
    ): ChunkContext => {
        const existing = chunkContextRef.current.get(chunkIndex) ?? EMPTY_CHUNK_CONTEXT;

        const nextTopicId =
            topicIdOverride
            ?? data.current_topic_id
            ?? data.created_topic?.id
            ?? data.insight?.thread?.topic_id
            ?? existing.topicId;

        const nextTopicName =
            topicNameOverride
            ?? data.created_topic?.name
            ?? (nextTopicId ? getTopicName(nextTopicId) : null)
            ?? existing.topicName;

        const transcriptChunk = toTranscriptPreview(data.transcript_chunk) ?? existing.transcriptChunk;
        const speaker = data.speaker ?? existing.speaker;

        const nextContext: ChunkContext = {
            topicId: nextTopicId ?? null,
            topicName: nextTopicName ?? null,
            transcriptChunk: transcriptChunk ?? null,
            speaker: speaker ?? null,
        };

        chunkContextRef.current.set(chunkIndex, nextContext);
        return nextContext;
    }, [getTopicName]);

    /**
     * Processes a single chunk event and updates toast state accordingly.
     * 
     * Event flow:
     * 1. insight_need_assessment (insight_needed=true) -> Create toast, stage="generating"
     * 2. query_constructor -> Update with queries, stage="searching"
     * 3. retriever_planner -> Update doc count, stage="retrieving"
     * 4. insight_selector -> Update generator types, stage="creating"
     * 5. insight_generated -> Add to generated insights, check completion
     * 6. (completion) -> stage="complete", schedule dismiss
     */
    const processEvent = useCallback((
        event: ChunkEventForProgress,
        topicIdOverride?: string | null,
        topicNameOverride?: string | null
    ) => {
        const { event: eventType, data } = event;
        const chunkIndex = data.chunk_index;
        const chunkContext = resolveChunkContext(chunkIndex, data, topicIdOverride, topicNameOverride);

        const insightNeededValue = data.insight_needed as unknown;
        const isInsightNeeded =
            insightNeededValue === true ||
            insightNeededValue === "true" ||
            insightNeededValue === 1;

        // Handle insight_need_assessment - start of progress tracking
        if (eventType === "insight_need_assessment" && isInsightNeeded) {
            const toastId = createToastId(chunkIndex);
            const topicId = chunkContext.topicId;
            const topicName = chunkContext.topicName;

            if (import.meta.env.DEV) {
                console.info("[PROGRESS-EVT] start toast", {
                    chunkIndex,
                    topicId,
                    topicName,
                    insightNeededRaw: insightNeededValue,
                });
            }

            const newToast: ProgressToastState = {
                id: toastId,
                chunkIndex,
                stage: "generating",
                topicId,
                topicName,
                transcriptChunk: chunkContext.transcriptChunk,
                speaker: chunkContext.speaker,
                queries: [],
                retrievedDocCount: 0,
                generatorTypes: [],
                generatedInsightIds: [],
                generatedGeneratorTypes: [],
                generatedInsights: [],
                expectedInsightCount: 0,
                startedAt: Date.now(),
                completedAt: null,
                lifecycle: "active",
            };

            chunkToToastId.current.set(chunkIndex, toastId);
            setActiveToasts((prev) => [newToast, ...prev]);
            onStageChange?.(toastId, "generating");
            return;
        }

        if (eventType === "insight_need_assessment" && import.meta.env.DEV) {
            console.info("[PROGRESS-EVT] assessment without toast", {
                chunkIndex,
                insightNeededRaw: insightNeededValue,
            });
        }

        // Get existing toast for this chunk
        const toastId = chunkToToastId.current.get(chunkIndex);
        if (!toastId) {
            if (import.meta.env.DEV && eventType !== "topic_detector") {
                console.info("[PROGRESS-EVT] no active toast for event", {
                    eventType,
                    chunkIndex,
                });
            }
            return;
        }

        // Update toast based on event type
        setActiveToasts((prev) => {
            return prev.map((toast) => {
                if (toast.id !== toastId) return toast;
                if (toast.lifecycle === "exiting") return toast;

                // Handle different event types
                switch (eventType) {
                    case "topic_detector": {
                        const newTopicId = chunkContext.topicId ?? toast.topicId;
                        const newTopicName = chunkContext.topicName ?? toast.topicName;
                        return {
                            ...toast,
                            topicId: newTopicId,
                            topicName: newTopicName,
                            transcriptChunk: chunkContext.transcriptChunk ?? toast.transcriptChunk,
                        };
                    }

                    case "query_constructor": {
                        const queries = data.queries?.map((q) => q.query_text) ?? [];
                        return {
                            ...toast,
                            stage: "searching" as ProgressStage,
                            queries,
                        };
                    }

                    case "retriever_planner": {
                        // Accumulate document count - stay in searching stage
                        const newCount = toast.retrievedDocCount + (data.retrieved_document_count ?? 0);
                        return {
                            ...toast,
                            // If retriever events arrive before query_constructor, move to searching now
                            stage: toast.stage === "generating" ? "searching" as ProgressStage : toast.stage,
                            retrievedDocCount: newCount,
                        };
                    }

                    case "insight_selector": {
                        const types = (data.generator_types ?? []) as ("viz" | "text")[];
                        return {
                            ...toast,
                            stage: "creating" as ProgressStage,
                            generatorTypes: types,
                            expectedInsightCount: types.length,
                            transcriptChunk: chunkContext.transcriptChunk ?? toast.transcriptChunk,
                        };
                    }

                    case "insight_generated": {
                        if (!data.insight) return toast;

                        // Prevent duplicate banners/ids for repeated identical events in one run
                        if (toast.generatedInsightIds.includes(data.insight.id)) {
                            return toast;
                        }

                        const newGeneratedIds = [...toast.generatedInsightIds, data.insight.id];
                        const newGeneratedInsights = [...toast.generatedInsights, data.insight];
                        const eventGeneratorType = normalizeGeneratorType(data.node_name) ?? data.insight.type;
                        const newGeneratedTypes = toast.generatedGeneratorTypes.includes(eventGeneratorType)
                            ? toast.generatedGeneratorTypes
                            : [...toast.generatedGeneratorTypes, eventGeneratorType];

                        // Always create insight banner (expanded/collapsed unified behavior)
                        const fallbackTopicName = chunkContext.topicName ?? toast.topicName ?? "New Topic";
                        const bannerTopicId = chunkContext.topicId ?? toast.topicId ?? data.insight.thread?.topic_id ?? null;
                        const bannerTranscript = chunkContext.transcriptChunk ?? toast.transcriptChunk;
                        const bannerSpeaker = chunkContext.speaker ?? toast.speaker;
                        createInsightBanner(data.insight, fallbackTopicName, bannerTopicId, bannerTranscript, bannerSpeaker);

                        return {
                            ...toast,
                            topicId: bannerTopicId,
                            topicName: fallbackTopicName,
                            transcriptChunk: bannerTranscript,
                            generatedInsightIds: newGeneratedIds,
                            generatedGeneratorTypes: newGeneratedTypes,
                            generatedInsights: newGeneratedInsights,
                            stage: toast.stage === "complete" ? "complete" as ProgressStage : "creating" as ProgressStage,
                        };
                    }

                    case "chunk_complete": {
                        if (toast.stage !== "complete") {
                            setTimeout(() => {
                                scheduleToastDismiss(toastId);
                            }, 100);
                        }

                        return {
                            ...toast,
                            topicId: chunkContext.topicId ?? toast.topicId,
                            topicName: chunkContext.topicName ?? toast.topicName,
                            transcriptChunk: chunkContext.transcriptChunk ?? toast.transcriptChunk,
                            stage: "complete" as ProgressStage,
                            completedAt: Date.now(),
                        };
                    }

                    default:
                        return toast;
                }
            });
        });

        // Fire onStageChange for events that transition stage
        if (onStageChange) {
            if (eventType === "query_constructor") {
                onStageChange(toastId, "searching");
            } else if (eventType === "insight_selector") {
                onStageChange(toastId, "creating");
            } else if (eventType === "chunk_complete") {
                onStageChange(toastId, "complete");
            }
        }
    }, [resolveChunkContext, createInsightBanner, scheduleToastDismiss, onStageChange]);

    /**
     * Simulates processing chunk events with delays for demo playback.
     * Events are processed with delays to show progress animation.
     * 
     * This is used when playing back pre-recorded demo data where all events
     * are available at once but should be shown progressively.
     * 
     * Timing:
     * - 2 seconds between major stages (generating, searching, creating)
     * - 800ms between retriever updates (for the incrementing counter effect)
     * - 1.5 seconds before each insight_generated event
     * 
     * Note: If a toast already exists for this chunk, it will be dismissed first
     * to allow clean re-triggering when seeking for debugging.
     */
    const simulateChunkEvents = useCallback((
        events: ChunkEventForProgress[],
        topicId: string | null,
        topicName: string | null
    ) => {
        // Filter to only relevant progress events
        const relevantEvents = events.filter((e) => [
            "insight_need_assessment",
            "topic_detector",
            "query_constructor",
            "retriever_planner",
            "insight_selector",
            "insight_generated",
            "chunk_complete",
        ].includes(e.event));

        if (relevantEvents.length === 0) return;

        // Check if we need to clear an existing toast for this chunk (for debugging/seeking)
        const firstEvent = relevantEvents[0];
        if (firstEvent) {
            const chunkIndex = firstEvent.data.chunk_index;

            // Clear in-flight timers for this chunk to prevent duplicate delivery
            clearChunkSimulationTimers(chunkIndex);

            const existingToastId = chunkToToastId.current.get(chunkIndex);
            if (existingToastId) {
                // Clear existing toast to allow fresh start
                finalizeDismissToast(existingToastId);
            }
        }

        // Store all non-initial events for manual advancement via advanceProgressStage
        advanceEventsRef.current = relevantEvents
            .filter(e => !(e.event === "insight_need_assessment" && e.data.insight_needed === true))
            .map(e => ({ event: e, topicId, topicName }));
        advanceIndexRef.current = 0;

        // Process events with delays - balanced for visibility
        let delay = 0;
        const STAGE_INTERVAL_MS = 2000; // 2 seconds between major stages
        const RETRIEVER_INTERVAL_MS = 800; // 800ms for retriever updates
        const INSIGHT_GENERATED_DELAY_MS = 1500; // 1.5 seconds before completion

        relevantEvents.forEach((event) => {
            const isRetriever = event.event === "retriever_planner";
            const isInsightGenerated = event.event === "insight_generated";
            const isInsightNeedStart =
                event.event === "insight_need_assessment" &&
                event.data.insight_needed === true;

            let eventDelay: number;
            if (isRetriever) {
                eventDelay = RETRIEVER_INTERVAL_MS;
            } else if (isInsightGenerated) {
                eventDelay = INSIGHT_GENERATED_DELAY_MS;
            } else {
                eventDelay = STAGE_INTERVAL_MS;
            }

            const scheduledDelay = isInsightNeedStart ? 0 : delay;

            const timer = setTimeout(() => {
                // When paused, skip — advanceProgressStage handles these from advanceEventsRef
                const isInitialAssessment =
                    event.event === "insight_need_assessment" &&
                    event.data.insight_needed === true;
                if (pauseProgressSimulationRef.current && !isInitialAssessment) {
                    // no-op: event is stored in advanceEventsRef for manual advancement
                } else {
                    processEvent(event, topicId, topicName);
                }

                simulationTimers.current.delete(timer);

                const chunkTimers = chunkSimulationTimers.current.get(event.data.chunk_index);
                if (chunkTimers) {
                    chunkTimers.delete(timer);
                    if (chunkTimers.size === 0) {
                        chunkSimulationTimers.current.delete(event.data.chunk_index);
                    }
                }
            }, scheduledDelay);

            simulationTimers.current.add(timer);

            const chunkTimers = chunkSimulationTimers.current.get(event.data.chunk_index) ?? new Set<ReturnType<typeof setTimeout>>();
            chunkTimers.add(timer);
            chunkSimulationTimers.current.set(event.data.chunk_index, chunkTimers);

            delay += eventDelay;
        });
    }, [processEvent, finalizeDismissToast, clearChunkSimulationTimers]);

    /** Process stored events up to and including the next stage-changing event.
     *  Cancels pending simulation timers first to prevent double-processing. */
    const advanceProgressStage = useCallback(() => {
        // Cancel all pending simulation timers — we process from the stored list instead
        simulationTimers.current.forEach(t => clearTimeout(t));
        simulationTimers.current.clear();
        chunkSimulationTimers.current.clear();

        const events = advanceEventsRef.current;
        let idx = advanceIndexRef.current;
        if (idx >= events.length) return;

        const stageChangingEvents = new Set(["query_constructor", "insight_selector", "chunk_complete"]);
        while (idx < events.length) {
            const item = events[idx];
            idx++;
            processEvent(item.event, item.topicId, item.topicName);
            if (stageChangingEvents.has(item.event.event)) break;
        }
        advanceIndexRef.current = idx;
    }, [processEvent]);

    return {
        activeToasts,
        insightBanners,
        dismissToast,
        dismissBanner,
        finalizeDismissToast,
        finalizeDismissBanner,
        processEvent,
        simulateChunkEvents,
        advanceProgressStage,
        resetProgressState,
    };
}
