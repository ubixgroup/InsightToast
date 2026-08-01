import { useMemo } from "react";
import type { Chunk } from "@/types";

interface DemoCaptionState {
    text: string;
    phase: "final";
}

function wordsFromContent(content: string): string[] {
    return content
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

export function useDemoCaptions(
    chunks: Chunk[],
    currentTime: number,
    enabled: boolean,
): DemoCaptionState {
    return useMemo(() => {
        if (!enabled) {
            return { text: "", phase: "final" as const };
        }

        const activeChunk = chunks.find((chunk) => {
            if (chunk.start_timestamp === undefined || chunk.end_timestamp === undefined) {
                return false;
            }
            return currentTime >= chunk.start_timestamp && currentTime < chunk.end_timestamp;
        });

        if (!activeChunk || activeChunk.start_timestamp === undefined || activeChunk.end_timestamp === undefined) {
            return { text: "", phase: "final" as const };
        }

        const words = wordsFromContent(activeChunk.content);
        if (words.length === 0) {
            return { text: "", phase: "final" as const };
        }

        const duration = Math.max(activeChunk.end_timestamp - activeChunk.start_timestamp, 0.001);
        const elapsed = Math.min(Math.max(currentTime - activeChunk.start_timestamp, 0), duration);
        const progress = elapsed / duration;

        const shownWordCount = Math.max(1, Math.min(words.length, Math.ceil(progress * words.length)));

        return {
            text: words.slice(0, shownWordCount).join(" "),
            phase: "final" as const,
        };
    }, [chunks, currentTime, enabled]);
}
