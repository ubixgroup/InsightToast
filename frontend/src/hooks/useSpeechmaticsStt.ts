import { useCallback, useEffect, useRef, useState } from "react";
import { createSpeechmaticsLiveSession, type EnrolledSpeaker } from "@/services/speechmaticsLive";

interface UseSpeechmaticsSttOptions {
    enabled: boolean;
    enrolledSpeakers: EnrolledSpeaker[];
    getAccessToken: () => Promise<string>;
    onTurnComplete: (content: string, speaker: string | null) => Promise<void>;
    onTelemetry?: (message: string, status?: "info" | "success" | "error") => void;
}

export type SttStatus = "idle" | "starting" | "reconnecting" | "active" | "stopped" | "error";
type CaptionPhase = "interim" | "final";

const CAPTION_HOLD_MS = 2000;
const MAX_RECONNECT_DELAY_MS = 10_000;
const SM_STT_TAG = "[SM-STT]";

function isRetryableSttError(message: string): boolean {
    const normalized = message.toLowerCase();
    const nonRetryableSignals = [
        "401",
        "403",
        "unauthorized",
        "forbidden",
        "invalid token",
        "token is invalid",
        "token expired",
        "permission",
        "not registered",
        "expired",
    ];
    return !nonRetryableSignals.some((signal) => normalized.includes(signal));
}

export function useSpeechmaticsStt({
    enabled,
    enrolledSpeakers,
    getAccessToken,
    onTurnComplete,
    onTelemetry,
}: UseSpeechmaticsSttOptions) {
    const [status, setStatus] = useState<SttStatus>("idle");
    const [captionText, setCaptionText] = useState("");
    const [captionPhase, setCaptionPhase] = useState<CaptionPhase>("final");
    const [lastCommittedTranscript, setLastCommittedTranscript] = useState("");
    const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);

    const sessionRef = useRef<ReturnType<typeof createSpeechmaticsLiveSession> | null>(null);
    /** Accumulated final transcript segments for the current turn (same speaker). */
    const finalSegmentsRef = useRef<Array<{ text: string; speaker: string | null }>>([]);
    const interimRef = useRef("");
    const interimSpeakerRef = useRef<string | null>(null);
    const committingRef = useRef(false);
    const clearCaptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastCommittedNormalizedRef = useRef("");
    const onTurnCompleteRef = useRef(onTurnComplete);
    const onTelemetryRef = useRef(onTelemetry);
    const getAccessTokenRef = useRef(getAccessToken);
    const enabledRef = useRef(enabled);
    const enrolledSpeakersRef = useRef(enrolledSpeakers);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef(0);
    const startInFlightRef = useRef(false);
    const stoppingRef = useRef(false);
    const terminalFailureRef = useRef(false);
    /** Track the current turn's dominant speaker to detect speaker changes. */
    const currentTurnSpeakerRef = useRef<string | null>(null);

    useEffect(() => {
        onTurnCompleteRef.current = onTurnComplete;
        onTelemetryRef.current = onTelemetry;
        getAccessTokenRef.current = getAccessToken;
    }, [getAccessToken, onTelemetry, onTurnComplete]);

    useEffect(() => { enabledRef.current = enabled; }, [enabled]);
    useEffect(() => { enrolledSpeakersRef.current = enrolledSpeakers; }, [enrolledSpeakers]);

    const normalizeTranscript = useCallback(
        (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase(),
        [],
    );

    const clearCaptionTimer = useCallback(() => {
        if (clearCaptionTimerRef.current) {
            clearTimeout(clearCaptionTimerRef.current);
            clearCaptionTimerRef.current = null;
        }
    }, []);

    const resetTurnBuffers = useCallback((options?: { preserveCaption?: boolean }) => {
        finalSegmentsRef.current = [];
        interimRef.current = "";
        interimSpeakerRef.current = null;
        currentTurnSpeakerRef.current = null;
        if (!options?.preserveCaption) {
            setCaptionText("");
            setCaptionPhase("final");
        }
    }, []);

    /**
     * Flush the accumulated turn buffer to the backend.
     * Called on:
     *  1. Speechmatics `EndOfUtterance` (native silence-based turn detection, 1.5s)
     *  2. Speaker change (a final transcript arrives with a different speaker)
     */
    const flushCurrentTurn = useCallback(async () => {
        if (committingRef.current) return;

        const segments = finalSegmentsRef.current;
        const interim = interimRef.current.trim();
        const allTexts = segments.map((s) => s.text);
        if (interim) allTexts.push(interim);
        const combined = allTexts.join(" ").replace(/\s+/g, " ").trim();

        if (!combined) {
            resetTurnBuffers();
            return;
        }

        const normalizedCombined = normalizeTranscript(combined);
        if (!normalizedCombined || normalizedCombined === lastCommittedNormalizedRef.current) {
            resetTurnBuffers({ preserveCaption: true });
            return;
        }

        // Determine dominant speaker from accumulated segments
        const speakerCounts = new Map<string, number>();
        for (const seg of segments) {
            if (seg.speaker) {
                speakerCounts.set(seg.speaker, (speakerCounts.get(seg.speaker) ?? 0) + 1);
            }
        }
        let dominantSpeaker: string | null = interimSpeakerRef.current;
        let maxCount = 0;
        for (const [spk, count] of speakerCounts) {
            if (count > maxCount) {
                maxCount = count;
                dominantSpeaker = spk;
            }
        }

        committingRef.current = true;
        try {
            await onTurnCompleteRef.current(combined, dominantSpeaker);
            setLastCommittedTranscript(combined);
            lastCommittedNormalizedRef.current = normalizedCombined;
            setCurrentSpeaker(dominantSpeaker);

            // Show committed caption briefly then fade
            setCaptionText(combined);
            setCaptionPhase("final");
            clearCaptionTimer();
            clearCaptionTimerRef.current = setTimeout(() => {
                setCaptionText("");
                clearCaptionTimerRef.current = null;
            }, CAPTION_HOLD_MS);

            onTelemetryRef.current?.("Turn complete: transcript queued.", "success");
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onTelemetryRef.current?.(`Failed to queue transcript: ${message}`, "error");
        } finally {
            committingRef.current = false;
            resetTurnBuffers({ preserveCaption: true });
        }
    }, [clearCaptionTimer, normalizeTranscript, resetTurnBuffers]);

    const clearReconnectTimer = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    const stop = useCallback(() => {
        clearReconnectTimer();
        stoppingRef.current = true;
        terminalFailureRef.current = false;
        sessionRef.current?.stop();
        sessionRef.current = null;
        setStatus("stopped");
        clearCaptionTimer();
        resetTurnBuffers();
    }, [clearCaptionTimer, clearReconnectTimer, resetTurnBuffers]);

    const start = useCallback(async (isReconnect: boolean) => {
        if (!enabledRef.current || sessionRef.current || startInFlightRef.current) return;

        startInFlightRef.current = true;
        stoppingRef.current = false;
        terminalFailureRef.current = false;
        setStatus(isReconnect ? "reconnecting" : "starting");
        if (import.meta.env.DEV) {
            console.info(`${SM_STT_TAG} start attempt`, {
                reconnect: isReconnect,
                attempt: reconnectAttemptRef.current,
                speakerCount: enrolledSpeakersRef.current.length,
            });
        }

        const scheduleReconnect = (reason: string) => {
            if (!enabledRef.current || reconnectTimerRef.current || stoppingRef.current || terminalFailureRef.current) return;
            const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, MAX_RECONNECT_DELAY_MS);
            if (import.meta.env.DEV) {
                console.info(`${SM_STT_TAG} schedule reconnect`, { attempt: reconnectAttemptRef.current, delayMs, reason });
            }
            reconnectTimerRef.current = setTimeout(() => {
                reconnectTimerRef.current = null;
                reconnectAttemptRef.current += 1;
                void start(true);
            }, delayMs);
        };

        let session: ReturnType<typeof createSpeechmaticsLiveSession> | null = null;
        try {
            const accessToken = await getAccessTokenRef.current();
            if (import.meta.env.DEV) {
                console.info(`${SM_STT_TAG} token acquired`, { length: accessToken.length });
            }
            if (!enabledRef.current) return;

            session = createSpeechmaticsLiveSession({
                tempKey: accessToken,
                enrolledSpeakers: enrolledSpeakersRef.current,
                callbacks: {
                    onOpen: () => {
                        reconnectAttemptRef.current = 0;
                        setStatus("active");
                        onTelemetryRef.current?.("Speechmatics connected.", "success");
                    },
                    onClose: () => {
                        sessionRef.current = null;
                        if (!enabledRef.current || stoppingRef.current) {
                            setStatus("stopped");
                            onTelemetryRef.current?.("Speechmatics connection closed.", "info");
                            return;
                        }
                        if (terminalFailureRef.current) {
                            setStatus("error");
                            return;
                        }
                        onTelemetryRef.current?.("Speechmatics disconnected. Reconnecting...", "info");
                        scheduleReconnect("close_event");
                    },
                    onError: (message) => {
                        onTelemetryRef.current?.(`Speechmatics error: ${message}`, "error");
                        if (!enabledRef.current || stoppingRef.current) {
                            setStatus("error");
                            return;
                        }
                        if (!isRetryableSttError(message)) {
                            terminalFailureRef.current = true;
                            setStatus("error");
                            if (import.meta.env.DEV) console.error(`${SM_STT_TAG} non-retryable error`, { message });
                            sessionRef.current?.stop();
                            sessionRef.current = null;
                            return;
                        }
                        setStatus("reconnecting");
                        scheduleReconnect(`error:${message}`);
                    },
                    onEndOfUtterance: () => {
                        // Speechmatics detected end of utterance (1.5s silence).
                        // Flush accumulated turn buffer to backend.
                        if (import.meta.env.DEV) {
                            console.info(`${SM_STT_TAG} EndOfUtterance → flushing turn`, {
                                segments: finalSegmentsRef.current.length,
                                speaker: currentTurnSpeakerRef.current,
                            });
                        }
                        void flushCurrentTurn();
                    },
                    onTranscript: ({ transcript, speaker, isFinal }) => {
                        if (!transcript) return;
                        const normalizedTranscript = transcript.replace(/\s+/g, " ").trim();
                        if (!normalizedTranscript) return;

                        setCurrentSpeaker(speaker);

                        if (isFinal) {
                            // ── Speaker change detection ──
                            // If the new segment has a different speaker than the
                            // accumulated turn, flush the previous turn FIRST so
                            // each chunk is attributed to a single speaker.
                            const prevTurnSpeaker = currentTurnSpeakerRef.current;
                            if (
                                prevTurnSpeaker !== null &&
                                speaker !== null &&
                                speaker !== prevTurnSpeaker &&
                                finalSegmentsRef.current.length > 0
                            ) {
                                if (import.meta.env.DEV) {
                                    console.info(`${SM_STT_TAG} speaker change detected`, {
                                        from: prevTurnSpeaker,
                                        to: speaker,
                                    });
                                }
                                // Flush the previous speaker's accumulated segments
                                void flushCurrentTurn();
                            }

                            // Append this segment to the (possibly fresh) buffer
                            finalSegmentsRef.current = [
                                ...finalSegmentsRef.current,
                                { text: normalizedTranscript, speaker },
                            ];
                            interimRef.current = "";
                            interimSpeakerRef.current = null;

                            // Track the current turn's speaker
                            if (speaker) {
                                currentTurnSpeakerRef.current = speaker;
                            }

                            // Update caption display (raw text, no speaker prefix —
                            // the UI component adds the colored speaker label)
                            const compositeFinal = finalSegmentsRef.current.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
                            setCaptionText(compositeFinal);
                            setCaptionPhase("final");
                        } else {
                            interimRef.current = normalizedTranscript;
                            interimSpeakerRef.current = speaker;

                            const committedPrefix = finalSegmentsRef.current.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
                            const composedCaption = `${committedPrefix} ${normalizedTranscript}`.trim();
                            setCaptionText(composedCaption);
                            setCaptionPhase("interim");
                        }
                    },
                },
            });

            await session.start();
            sessionRef.current = session;
        } catch (error) {
            session?.stop();
            sessionRef.current?.stop();
            sessionRef.current = null;
            setStatus("error");
            const message = error instanceof Error ? error.message : String(error);
            onTelemetryRef.current?.(`Unable to start STT: ${message}`, "error");
            if (enabledRef.current && !stoppingRef.current) {
                if (isRetryableSttError(message)) {
                    scheduleReconnect(`start_failure:${message}`);
                } else {
                    terminalFailureRef.current = true;
                    if (import.meta.env.DEV) console.error(`${SM_STT_TAG} terminal start failure`, { message });
                }
            }
        } finally {
            startInFlightRef.current = false;
        }
    }, [clearCaptionTimer, flushCurrentTurn]);

    useEffect(() => {
        if (enabled) {
            void start(false);
        } else {
            stop();
        }
    }, [enabled, start, stop]);

    useEffect(() => {
        return () => {
            clearReconnectTimer();
            clearCaptionTimer();
            sessionRef.current?.stop();
            sessionRef.current = null;
        };
    }, [clearCaptionTimer, clearReconnectTimer]);

    return {
        status,
        captionText,
        captionPhase,
        lastCommittedTranscript,
        currentSpeaker,
        stopStream: stop,
    };
}
