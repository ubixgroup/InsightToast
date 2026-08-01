import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface DevTelemetryToastItem {
    id: string;
    message: string;
    status: "info" | "success" | "error";
    createdAt: number;
}

const AUTO_DISMISS_MS = 4000;

export function useDevTelemetryToast(enabled: boolean) {
    const [items, setItems] = useState<DevTelemetryToastItem[]>([]);
    const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const push = useCallback((message: string, status: DevTelemetryToastItem["status"] = "info") => {
        if (!enabled) return;

        const id = `dev-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const item: DevTelemetryToastItem = {
            id,
            message,
            status,
            createdAt: Date.now(),
        };

        setItems((prev) => [...prev, item].slice(-6));

        const timer = setTimeout(() => {
            setItems((prev) => prev.filter((existing) => existing.id !== id));
            dismissTimersRef.current.delete(id);
        }, AUTO_DISMISS_MS);

        dismissTimersRef.current.set(id, timer);
    }, [enabled]);

    const dismiss = useCallback((id: string) => {
        const timer = dismissTimersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            dismissTimersRef.current.delete(id);
        }

        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const clear = useCallback(() => {
        dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
        dismissTimersRef.current.clear();
        setItems([]);
    }, []);

    useEffect(() => {
        const timers = dismissTimersRef.current;
        return () => {
            timers.forEach((timer) => clearTimeout(timer));
            timers.clear();
        };
    }, []);

    return useMemo(() => ({
        items,
        push,
        dismiss,
        clear,
    }), [clear, dismiss, items, push]);
}
