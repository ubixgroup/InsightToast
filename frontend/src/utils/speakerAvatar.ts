// Shared speaker avatar utilities used by TranscriptSidebar, InsightBanner, and ProgressToast

// Color palettes for speaker avatars
const colorPalettes = ["red", "blue", "green", "yellow", "purple", "orange", "teal", "cyan"];

/**
 * Pick a consistent Chakra color palette name based on speaker name.
 * The same name always maps to the same color.
 */
export function pickSpeakerColor(name: string): string {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorPalettes[hash % colorPalettes.length];
}

/**
 * Get initials from speaker name.
 * Uses first letters of first two words, or first two characters if single word.
 */
export function getSpeakerInitials(name: string): string {
    // Remove parentheses content and clean up
    const cleanName = name.replace(/\([^)]*\)/g, "").trim();
    const words = cleanName.split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length >= 2) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
