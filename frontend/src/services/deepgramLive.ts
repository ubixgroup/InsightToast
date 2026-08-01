import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

export interface DeepgramTranscriptEvent {
    transcript: string;
    isFinal: boolean;
    speechFinalized: boolean;
}

export interface DeepgramLiveCallbacks {
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (message: string) => void;
    onSpeechStarted?: () => void;
    onUtteranceEnd?: () => void;
    onTranscript?: (event: DeepgramTranscriptEvent) => void;
}

export interface DeepgramLiveSession {
    start: () => Promise<void>;
    stop: () => void;
}

interface CreateDeepgramLiveSessionInput {
    accessToken: string;
    callbacks: DeepgramLiveCallbacks;
}

const CHUNK_INTERVAL_MS = 250;
const OPEN_TIMEOUT_MS = 12_000;
const DG_WS_TAG = "[DG-WS]";

export function createDeepgramLiveSession({ accessToken, callbacks }: CreateDeepgramLiveSessionInput): DeepgramLiveSession {
    let connection: ReturnType<ReturnType<typeof createClient>["listen"]["live"]> | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    let mediaStream: MediaStream | null = null;

    const stopMedia = () => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }

        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            mediaStream = null;
        }

        mediaRecorder = null;
    };

    const stopConnection = () => {
        if (connection) {
            try {
                connection.requestClose();
            } catch {
                // no-op
            }
            connection.removeAllListeners();
            connection = null;
        }
    };

    const start = async () => {
        if (connection) {
            return;
        }

        const deepgram = createClient({ accessToken });
        if (import.meta.env.DEV) {
            console.info(`${DG_WS_TAG} creating live connection`);
        }

        const nextConnection = deepgram.listen.live({
            model: "nova-3",
            language: "en",
            smart_format: true,
            interim_results: true,
            vad_events: true,
            utterance_end_ms: 1500,
            endpointing: 300,
        });

        let didOpen = false;
        let settled = false;
        let timeout: ReturnType<typeof setTimeout> | null = null;

        const waitForOpen = new Promise<void>((resolve, reject) => {
            const settleResolve = () => {
                if (settled) return;
                settled = true;
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                resolve();
            };

            const settleReject = (message: string) => {
                if (settled) return;
                settled = true;
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                reject(new Error(message));
            };

            timeout = setTimeout(() => {
                if (import.meta.env.DEV) {
                    console.error(`${DG_WS_TAG} open timeout`);
                }
                settleReject("Deepgram connection timed out while opening.");
            }, OPEN_TIMEOUT_MS);

            nextConnection.on(LiveTranscriptionEvents.Open, () => {
                didOpen = true;
                if (import.meta.env.DEV) {
                    console.info(`${DG_WS_TAG} open`);
                }
                callbacks.onOpen?.();
                settleResolve();
            });

            nextConnection.on(LiveTranscriptionEvents.Close, (event) => {
                if (import.meta.env.DEV) {
                    console.info(`${DG_WS_TAG} close`, event);
                }
                callbacks.onClose?.();
                if (!didOpen) {
                    settleReject("Deepgram connection closed before opening.");
                }
            });

            nextConnection.on(LiveTranscriptionEvents.Error, (error) => {
                const message = error instanceof Error ? error.message : String(error);
                if (import.meta.env.DEV) {
                    console.error(`${DG_WS_TAG} error`, message);
                }
                callbacks.onError?.(message);
                if (!didOpen) {
                    settleReject(message || "Deepgram connection error while opening.");
                }
            });
        });

        nextConnection.on(LiveTranscriptionEvents.SpeechStarted, () => {
            callbacks.onSpeechStarted?.();
        });

        nextConnection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
            callbacks.onUtteranceEnd?.();
        });

        nextConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
            const transcript = data.channel.alternatives[0]?.transcript?.trim() ?? "";
            callbacks.onTranscript?.({
                transcript,
                isFinal: Boolean(data.is_final),
                speechFinalized: Boolean(data.speech_final),
            });
        });

        connection = nextConnection;

        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                noiseSuppression: true,
                echoCancellation: true,
                autoGainControl: true,
            },
        });

        mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = async (event) => {
            if (!connection || event.data.size === 0) return;
            try {
                const audioBuffer = await event.data.arrayBuffer();
                connection.send(audioBuffer);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                callbacks.onError?.(message);
            }
        };

        mediaRecorder.start(CHUNK_INTERVAL_MS);

        try {
            await waitForOpen;
        } catch (error) {
            stopMedia();
            stopConnection();
            throw error;
        }
    };

    const stop = () => {
        stopMedia();
        stopConnection();
    };

    return {
        start,
        stop,
    };
}
