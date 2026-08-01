import type { TextInsight } from "@/types";

/**
 * Returns a short display title for a text insight.
 *
 * - If the insight has an explicit `title` field, use it.
 * - Otherwise, take the first 5 words of the content and append "…".
 */
export function getTextInsightTitle(insight: TextInsight): string {
    if (insight.title && insight.title.trim().length > 0) {
        return insight.title.trim();
    }
    const words = (insight.content ?? "").trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "Insight";
    if (words.length <= 5) return words.join(" ");
    return words.slice(0, 5).join(" ") + "…";
}
