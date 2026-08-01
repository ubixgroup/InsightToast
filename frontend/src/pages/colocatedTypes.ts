import type { EnrolledSpeaker } from "@/services/speechmaticsLive";

export type { EnrolledSpeaker } from "@/services/speechmaticsLive";

export interface Participant {
    speaker_name: string;
    joined_at: string;
    client_id: string;
}

export interface ColocatedRouteState {
    conversationId: string;
    clientId: string;
    speakerNames: string[];
    condition: "condition-1" | "condition-2";
    mode: "experimental" | "baseline";
    participants: Participant[];
    isRegisteredConversation: boolean;
    expiresAt: string | null;
    joinedAt: string;
    enrolledSpeakers: EnrolledSpeaker[];
    setting: "colocated";
}

const SESSION_STORAGE_KEY = "interactive-colocated-session";

export function saveColocatedSessionState(state: ColocatedRouteState) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
}

export function normalizeColocatedSessionState(
    raw?: Partial<ColocatedRouteState>,
): ColocatedRouteState | null {
    if (!raw) return null;
    if (
        !raw.conversationId ||
        !raw.clientId ||
        !Array.isArray(raw.speakerNames) ||
        raw.speakerNames.length === 0 ||
        !Array.isArray(raw.participants)
    ) {
        return null;
    }

    return {
        conversationId: raw.conversationId,
        clientId: raw.clientId,
        speakerNames: raw.speakerNames,
        condition: raw.condition === "condition-2" ? "condition-2" : "condition-1",
        mode: raw.mode === "baseline" ? "baseline" : "experimental",
        participants: raw.participants,
        isRegisteredConversation: raw.isRegisteredConversation ?? false,
        expiresAt: raw.expiresAt ?? null,
        joinedAt: raw.joinedAt ?? new Date().toISOString(),
        enrolledSpeakers: raw.enrolledSpeakers ?? [],
        setting: "colocated",
    };
}

export function readColocatedSessionState(): ColocatedRouteState | null {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
        return normalizeColocatedSessionState(
            JSON.parse(raw) as Partial<ColocatedRouteState>,
        );
    } catch {
        return null;
    }
}

export function clearColocatedSessionState() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/* ── Voice-print cache (per conversation ID) ── */

const VOICEPRINT_PREFIX = "voiceprints:";

export function saveVoicePrintCache(conversationId: string, speakers: EnrolledSpeaker[]) {
    try {
        sessionStorage.setItem(VOICEPRINT_PREFIX + conversationId, JSON.stringify(speakers));
    } catch { /* quota exceeded — silently ignore */ }
}

export function readVoicePrintCache(conversationId: string): EnrolledSpeaker[] | null {
    const raw = sessionStorage.getItem(VOICEPRINT_PREFIX + conversationId);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return null;
        // Validate each entry has name and non-empty speakerIdentifiers
        const valid = parsed.every(
            (e: unknown) =>
                typeof e === "object" &&
                e !== null &&
                typeof (e as EnrolledSpeaker).name === "string" &&
                Array.isArray((e as EnrolledSpeaker).speakerIdentifiers) &&
                (e as EnrolledSpeaker).speakerIdentifiers.length > 0,
        );
        return valid ? (parsed as EnrolledSpeaker[]) : null;
    } catch {
        return null;
    }
}

/**
 * Check if cached voice prints cover all the given speaker names.
 * Returns the matching EnrolledSpeaker[] if every name is present, else null.
 */
export function matchVoicePrintCache(
    conversationId: string,
    speakerNames: string[],
): EnrolledSpeaker[] | null {
    const cached = readVoicePrintCache(conversationId);
    if (!cached) return null;
    const cachedNames = new Set(cached.map((s) => s.name));
    const allMatch = speakerNames.every((n) => cachedNames.has(n));
    if (!allMatch) return null;
    // Return only the entries for the requested names, in order
    return speakerNames.map((n) => cached.find((s) => s.name === n)!);
}
