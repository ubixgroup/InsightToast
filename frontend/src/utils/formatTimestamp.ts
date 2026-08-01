/**
 * Format a timestamp for display in a messaging-like UI.
 * - For times under 5 minutes ago: show relative format ("just now", "1m ago", "4m ago")
 * - For times 5+ minutes ago: show absolute format (HH:MM)
 * 
 * @param timestamp The timestamp to format (as a Date object)
 * @param referenceTime The current time to compare against (as a Date object)
 * @returns Formatted timestamp string
 */
export function formatTimestamp(timestamp: Date, referenceTime: Date): string {
    const diffMs = referenceTime.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    // Under 1 minute
    if (diffMins < 1) {
        return "just now";
    }
    
    // Under 5 minutes - show relative time
    if (diffMins < 5) {
        return `${diffMins}m ago`;
    }
    
    // 5+ minutes - show absolute HH:MM format
    return timestamp.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false 
    });
}

/**
 * Calculate the display timestamp for a chunk based on its cumulative timestamp
 * and the page load time.
 * 
 * @param cumulativeTimestamp The cumulative time in seconds from the start of the conversation
 * @param pageLoadTime The time when the page was loaded
 * @returns A Date object representing when this chunk "occurred"
 */
export function getChunkDisplayTime(cumulativeTimestamp: number, pageLoadTime: Date): Date {
    return new Date(pageLoadTime.getTime() + cumulativeTimestamp * 1000);
}

/**
 * Calculate the display timestamp for an insight based on the chunk that generated it.
 * 
 * @param chunkCumulativeTimestamp The cumulative timestamp of the chunk that generated the insight
 * @param pageLoadTime The time when the page was loaded
 * @returns A Date object representing when this insight "occurred"
 */
export function getInsightDisplayTime(chunkCumulativeTimestamp: number, pageLoadTime: Date): Date {
    return new Date(pageLoadTime.getTime() + chunkCumulativeTimestamp * 1000);
}
