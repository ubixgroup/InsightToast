import { useCallback, useEffect, useRef, useState } from "react";
import { createDeepgramLiveSession } from "@/services/deepgramLive";

interface UseDeepgramSttOptions {
    enabled: boolean;
    getAccessToken: () => Promise<string>;
    onTurnComplete: (content: string) => Promise<void>;
    onTelemetry?: (message: string, status?: "info" | "success" | "error") => void;
}

type SttStatus = "idle" | "starting" | "reconnecting" | "active" | "stopped" | "error";
type CaptionPhase = "interim" | "final";

const CAPTION_HOLD_MS = 2000;
const MAX_RECONNECT_DELAY_MS = 10_000;
const DG_STT_TAG = "[DG-STT]";

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

export function useDeepgramStt({ enabled, getAccessToken, onTurnComplete, onTelemetry }: UseDeepgramSttOptions) {
    const [status, setStatus] = useState<SttStatus>("idle");
    const [captionText, setCaptionText] = useState("");
    const [captionPhase, setCaptionPhase] = useState<CaptionPhase>("final");
    const [lastCommittedTranscript, setLastCommittedTranscript] = useState("");

    const sessionRef = useRef<ReturnType<typeof createDeepgramLiveSession> | null>(null);
    const finalSegmentsRef = useRef<string[]>([]);
    const interimRef = useRef("");
    const committingRef = useRef(false);
    const clearCaptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastCommittedNormalizedRef = useRef("");
    const onTurnCompleteRef = useRef(onTurnComplete);
    const onTelemetryRef = useRef(onTelemetry);
    const getAccessTokenRef = useRef(getAccessToken);
    const enabledRef = useRef(enabled);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef(0);
    const startInFlightRef = useRef(false);
    const stoppingRef = useRef(false);
    const terminalFailureRef = useRef(false);

    useEffect(() => {
        onTurnCompleteRef.current = onTurnComplete;
        onTelemetryRef.current = onTelemetry;
        getAccessTokenRef.current = getAccessToken;
    }, [getAccessToken, onTelemetry, onTurnComplete]);

    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    const normalizeTranscript = useCallback((value: string) => value.replace(/\s+/g, " ").trim().toLowerCase(), []);

    const clearCaptionTimer = useCallback(() => {
        if (clearCaptionTimerRef.current) {
            clearTimeout(clearCaptionTimerRef.current);
            clearCaptionTimerRef.current = null;
        }
    }, []);

    const resetTurnBuffers = useCallback((options?: { preserveCaption?: boolean }) => {
        finalSegmentsRef.current = [];
        interimRef.current = "";
        if (!options?.preserveCaption) {
            setCaptionText("");
            setCaptionPhase("final");
        }
    }, []);

    const flushCurrentTurn = useCallback(async () => {
        if (committingRef.current) {
            return;
        }

        const finalizedCombined = finalSegmentsRef.current.join(" ").replace(/\s+/g, " ").trim();
        const combined = finalizedCombined || interimRef.current.trim();
        if (!combined) {
            resetTurnBuffers();
            return;
        }

        const normalizedCombined = normalizeTranscript(combined);
        if (!normalizedCombined || normalizedCombined === lastCommittedNormalizedRef.current) {
            resetTurnBuffers({ preserveCaption: true });
            return;
        }

        committingRef.current = true;
        try {
            await onTurnCompleteRef.current(combined);
            setLastCommittedTranscript(combined);
            lastCommittedNormalizedRef.current = normalizedCombined;
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
        if (!enabledRef.current || sessionRef.current || startInFlightRef.current) {
            return;
        }

        startInFlightRef.current = true;
        stoppingRef.current = false;
        terminalFailureRef.current = false;
        setStatus(isReconnect ? "reconnecting" : "starting");
        if (import.meta.env.DEV) {
            console.info(`${DG_STT_TAG} start attempt`, {
                reconnect: isReconnect,
                attempt: reconnectAttemptRef.current,
            });
        }

        const scheduleReconnect = (reason: string) => {
            if (!enabledRef.current || reconnectTimerRef.current || stoppingRef.current || terminalFailureRef.current) {
                return;
            }

            const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, MAX_RECONNECT_DELAY_MS);
            if (import.meta.env.DEV) {
                console.info(`${DG_STT_TAG} schedule reconnect`, {
                    attempt: reconnectAttemptRef.current,
                    delayMs,
                    reason,
                });
            }
            reconnectTimerRef.current = setTimeout(() => {
                reconnectTimerRef.current = null;
                reconnectAttemptRef.current += 1;
                void start(true);
            }, delayMs);
        };

        let session: ReturnType<typeof createDeepgramLiveSession> | null = null;
        try {
            const accessToken = await getAccessTokenRef.current();
            if (import.meta.env.DEV) {
                console.info(`${DG_STT_TAG} token acquired`, { length: accessToken.length });
            }
            if (!enabledRef.current) {
                return;
            }

            session = createDeepgramLiveSession({
                accessToken,
                callbacks: {
                    onOpen: () => {
                        reconnectAttemptRef.current = 0;
                        setStatus("active");
                        onTelemetryRef.current?.("Deepgram connected.", "success");
                    },
                    onClose: () => {
                        sessionRef.current = null;
                        if (!enabledRef.current || stoppingRef.current) {
                            setStatus("stopped");
                            onTelemetryRef.current?.("Deepgram connection closed.", "info");
                            return;
                        }

                        if (terminalFailureRef.current) {
                            setStatus("error");
                            return;
                        }

                        onTelemetryRef.current?.("Deepgram disconnected. Reconnecting...", "info");
                        scheduleReconnect("close_event");
                    },
                    onError: (message) => {
                        onTelemetryRef.current?.(`Deepgram error: ${message}`, "error");
                        if (!enabledRef.current || stoppingRef.current) {
                            setStatus("error");
                            return;
                        }

                        if (!isRetryableSttError(message)) {
                            terminalFailureRef.current = true;
                            setStatus("error");
                            if (import.meta.env.DEV) {
                                console.error(`${DG_STT_TAG} non-retryable error`, { message });
                            }
                            sessionRef.current?.stop();
                            sessionRef.current = null;
                            return;
                        }

                        setStatus("reconnecting");
                        scheduleReconnect(`error:${message}`);
                    },
                    onSpeechStarted: () => {
                        clearCaptionTimer();
                        setCaptionText("");
                        setCaptionPhase("interim");
                    },
                    onTranscript: ({ transcript, isFinal }) => {
                        if (!transcript) return;

                        const normalizedTranscript = transcript.replace(/\s+/g, " ").trim();
                        if (!normalizedTranscript) return;

                        if (isFinal) {
                            finalSegmentsRef.current = [...finalSegmentsRef.current, normalizedTranscript];
                            interimRef.current = "";
                            setCaptionText(finalSegmentsRef.current.join(" ").replace(/\s+/g, " ").trim());
                            setCaptionPhase("final");
                            return;
                        }

                        interimRef.current = normalizedTranscript;
                        const committedPrefix = finalSegmentsRef.current.join(" ").replace(/\s+/g, " ").trim();
                        const composedCaption = `${committedPrefix} ${normalizedTranscript}`.trim();
                        setCaptionText(composedCaption);
                        setCaptionPhase("interim");
                    },
                    onUtteranceEnd: () => {
                        void flushCurrentTurn();
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
                    if (import.meta.env.DEV) {
                        console.error(`${DG_STT_TAG} terminal start failure`, { message });
                    }
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
        stopStream: stop,
    };
}
