import { useState, useCallback, useRef, useEffect } from "react";

// ============= Constants =============

// Time in ms an insight must be visible before marking as seen
const SEEN_THRESHOLD_MS = 350;

// Intersection Observer threshold (percentage visible)
const VISIBILITY_THRESHOLD = 0.6;
const FULLY_VISIBLE_RATIO = 0.95;

// ============= Types =============

interface UseInsightVisibilityOptions {
    // Initial set of insight IDs that are already seen (for persistence)
    initialSeenIds?: Set<string>;
}

interface UseInsightVisibilityReturn {
    // Set of insight IDs that have been marked as seen
    seenInsightIds: Set<string>;
    // Register an element to be observed for visibility
    registerRef: (insightId: string, element: HTMLElement | null) => void;
    // Manually mark an insight as seen
    markAsSeen: (insightId: string) => void;
    // Check if an insight is currently being viewed (in viewport)
    isBeingViewed: (insightId: string) => boolean;
    // Get unseen count for a set of insight IDs
    getUnseenCount: (insightIds: string[]) => number;
    // Get the DOM element for a registered insight (for scroll-into-view)
    getElement: (insightId: string) => HTMLElement | null;
}

// ============= Main Hook =============

/**
 * Hook for tracking insight visibility and managing "seen" state.
 * 
 * An insight is marked as "seen" after it has been visible in the viewport
 * for at least 2 seconds. This provides a "new message" like experience
 * where unseen insights have a glow effect.
 * 
 * Uses Intersection Observer API for efficient viewport tracking.
 * 
 * Note: Uses refs for the seen set to avoid closure issues with timers.
 */
export function useInsightVisibility(
    options: UseInsightVisibilityOptions = {}
): UseInsightVisibilityReturn {
    const { initialSeenIds = new Set() } = options;

    // Set of insight IDs that have been marked as seen
    const [seenInsightIds, setSeenInsightIds] = useState<Set<string>>(initialSeenIds);

    // Ref to track seen IDs without stale closure issues
    const seenIdsRef = useRef<Set<string>>(initialSeenIds);

    // Keep ref in sync with state
    useEffect(() => {
        seenIdsRef.current = seenInsightIds;
    }, [seenInsightIds]);

    // Set of insight IDs currently in the viewport
    const viewingSet = useRef<Set<string>>(new Set());

    // Timers for each insight being viewed (starts when enters viewport)
    const viewingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    // Map of insight IDs to their DOM elements
    const elementMap = useRef<Map<string, HTMLElement>>(new Map());

    // Intersection Observer instance
    const observerRef = useRef<IntersectionObserver | null>(null);

    const isMostlyInViewport = useCallback((element: HTMLElement): boolean => {
        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
        const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));

        const visibleArea = visibleWidth * visibleHeight;
        const totalArea = Math.max(1, rect.width * rect.height);

        return visibleArea / totalArea >= FULLY_VISIBLE_RATIO;
    }, []);

    /**
     * Marks an insight as seen and clears its viewing timer.
     */
    const markAsSeen = useCallback((insightId: string) => {
        setSeenInsightIds((prev) => {
            if (prev.has(insightId)) return prev;
            const newSet = new Set(prev);
            newSet.add(insightId);
            return newSet;
        });

        // Clear any pending timer
        const timer = viewingTimers.current.get(insightId);
        if (timer) {
            clearTimeout(timer);
            viewingTimers.current.delete(insightId);
        }
    }, []);

    /**
     * Starts the "seen" timer when an insight enters the viewport.
     * Uses refs to avoid stale closure issues.
     */
    const startSeenTimer = useCallback((insightId: string) => {
        // Don't start timer if already seen (use ref for current value)
        if (seenIdsRef.current.has(insightId)) return;

        // Clear existing timer if any
        const existingTimer = viewingTimers.current.get(insightId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Start new timer
        const timer = setTimeout(() => {
            markAsSeen(insightId);
            viewingTimers.current.delete(insightId);
        }, SEEN_THRESHOLD_MS);

        viewingTimers.current.set(insightId, timer);
        viewingSet.current.add(insightId);
    }, [markAsSeen]);

    /**
     * Clears the "seen" timer when an insight leaves the viewport.
     */
    const clearSeenTimer = useCallback((insightId: string) => {
        const timer = viewingTimers.current.get(insightId);
        if (timer) {
            clearTimeout(timer);
            viewingTimers.current.delete(insightId);
        }
        viewingSet.current.delete(insightId);
    }, []);

    /**
     * Intersection Observer callback for tracking visibility changes.
     * Stable reference to avoid recreating the observer.
     */
    const handleIntersectionRef = useRef<((entries: IntersectionObserverEntry[]) => void) | null>(null);
    handleIntersectionRef.current = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            // Find insight ID from element
            const element = entry.target as HTMLElement;
            const insightId = element.dataset.insightId;

            if (!insightId) return;

            if (entry.isIntersecting) {
                if (entry.intersectionRatio >= FULLY_VISIBLE_RATIO) {
                    markAsSeen(insightId);
                    return;
                }

                // Element is now visible - start seen timer
                startSeenTimer(insightId);
            } else {
                // Element left viewport - clear timer
                clearSeenTimer(insightId);
            }
        });
    };

    // Initialize Intersection Observer once (stable reference via ref)
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => handleIntersectionRef.current?.(entries),
            {
                threshold: [VISIBILITY_THRESHOLD, FULLY_VISIBLE_RATIO],
                rootMargin: "0px",
            }
        );

        // Observe all currently registered elements
        elementMap.current.forEach((element) => {
            observerRef.current?.observe(element);
        });

        return () => {
            observerRef.current?.disconnect();
            // Clear all timers on unmount
            viewingTimers.current.forEach((timer) => clearTimeout(timer));
            viewingTimers.current.clear();
        };
    }, []); // Empty deps - observer created once

    /**
     * Registers a DOM element to be observed for visibility.
     * Call this with the insight card's ref.
     * 
     * @param insightId - The ID of the insight
     * @param element - The DOM element, or null to unregister
     */
    const registerRef = useCallback((insightId: string, element: HTMLElement | null) => {
        const previousElement = elementMap.current.get(insightId);

        // Unobserve previous element if different
        if (previousElement && previousElement !== element) {
            observerRef.current?.unobserve(previousElement);
            elementMap.current.delete(insightId);
        }

        if (element) {
            // Set data attribute for lookup in intersection callback
            element.dataset.insightId = insightId;
            elementMap.current.set(insightId, element);
            observerRef.current?.observe(element);

            if (!seenIdsRef.current.has(insightId) && isMostlyInViewport(element)) {
                markAsSeen(insightId);
            }
        } else {
            // Element removed - clear any timer
            clearSeenTimer(insightId);
        }
    }, [clearSeenTimer, isMostlyInViewport, markAsSeen]);

    /**
     * Checks if an insight is currently being viewed (in the viewport).
     */
    const isBeingViewed = useCallback((insightId: string): boolean => {
        return viewingSet.current.has(insightId);
    }, []);

    /**
     * Gets the count of unseen insights from a list of insight IDs.
     */
    const getUnseenCount = useCallback((insightIds: string[]): number => {
        return insightIds.filter((id) => !seenInsightIds.has(id)).length;
    }, [seenInsightIds]);

    /**
     * Returns the DOM element for a registered insight (for scroll-into-view).
     */
    const getElement = useCallback((insightId: string): HTMLElement | null => {
        return elementMap.current.get(insightId) ?? null;
    }, []);

    return {
        seenInsightIds,
        registerRef,
        markAsSeen,
        isBeingViewed,
        getUnseenCount,
        getElement,
    };
}
