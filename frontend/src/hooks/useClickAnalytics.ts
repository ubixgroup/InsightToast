import { useCallback, useRef } from "react";
import type {
    ClickAnalyticsBatchPayload,
    ClickAnalyticsEventPayload,
} from "@/services/v2Api";

const MAX_BUFFERED_EVENTS = 2000;

export type TrackAnalyticsInput = Omit<ClickAnalyticsEventPayload, "event_id" | "event_time">;

interface UseClickAnalyticsOptions {
    enabled?: boolean;
    appVersion?: string;
}

interface UseClickAnalyticsResult {
    track: (input: TrackAnalyticsInput) => void;
    consumeBatch: () => ClickAnalyticsBatchPayload | undefined;
    bufferedCount: () => number;
    clear: () => void;
}

function makeEventId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    const random = Math.random().toString(36).slice(2, 10);
    return `${Date.now()}-${random}`;
}

function trimUndefined<T extends Record<string, unknown>>(payload: T): T {
    const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
    return Object.fromEntries(entries) as T;
}

export function useClickAnalytics(options?: UseClickAnalyticsOptions): UseClickAnalyticsResult {
    const enabled = options?.enabled ?? true;
    const appVersion = options?.appVersion;
    const eventsRef = useRef<ClickAnalyticsEventPayload[]>([]);
    const sessionSeqRef = useRef(0);

    const track = useCallback((input: TrackAnalyticsInput) => {
        if (!enabled) return;

        const event = trimUndefined({
            ...input,
            event_id: makeEventId(),
            event_time: new Date().toISOString(),
            metadata: input.metadata ?? {},
        });

        eventsRef.current.push(event);
        if (eventsRef.current.length > MAX_BUFFERED_EVENTS) {
            eventsRef.current.shift();
        }
    }, [enabled]);

    const consumeBatch = useCallback((): ClickAnalyticsBatchPayload | undefined => {
        if (!enabled || eventsRef.current.length === 0) {
            return undefined;
        }

        sessionSeqRef.current += 1;
        const batch: ClickAnalyticsBatchPayload = {
            events: [...eventsRef.current],
            session_seq: sessionSeqRef.current,
        };

        if (appVersion) {
            batch.app_version = appVersion;
        }

        eventsRef.current = [];
        return batch;
    }, [appVersion, enabled]);

    const bufferedCount = useCallback(() => eventsRef.current.length, []);

    const clear = useCallback(() => {
        eventsRef.current = [];
    }, []);

    return {
        track,
        consumeBatch,
        bufferedCount,
        clear,
    };
}
