/**
 * Raw WebSocket abstraction for Speechmatics real-time API.
 *
 * Provides two factory functions:
 * 1. `createSpeechmaticsEnrollmentSession` — captures a single speaker's voice
 *    and returns their speaker_identifiers via the GetSpeakers flow.
 * 2. `createSpeechmaticsLiveSession` — runs diarised real-time STT with enrolled
 *    speakers mapped to known names.
 *
 * Both use an inline AudioWorklet (Blob URL) for PCM_S16LE capture at 16 kHz,
 * so no external dependencies or served worklet files are needed.
 */

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface EnrolledSpeaker {
    name: string;
    speakerIdentifiers: string[];
}

// ---------------------------------------------------------------------------
// PCM worklet (inline, compiled to Blob URL once)
// ---------------------------------------------------------------------------

const SAMPLE_RATE = 16_000;
const SM_WS_TAG = "[SM-WS]";

const WORKLET_PROCESSOR_CODE = /* js */ `
class PCMProcessor extends AudioWorkletProcessor {
    process(inputs) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;
        const float32 = input[0];
        if (!float32 || float32.length === 0) return true;
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
            const s = Math.max(-1, Math.min(1, float32[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        this.port.postMessage(int16.buffer, [int16.buffer]);
        return true;
    }
}
registerProcessor("pcm-processor", PCMProcessor);
`;

let workletBlobUrl: string | null = null;

function getWorkletUrl(): string {
    if (!workletBlobUrl) {
        const blob = new Blob([WORKLET_PROCESSOR_CODE], { type: "application/javascript" });
        workletBlobUrl = URL.createObjectURL(blob);
    }
    return workletBlobUrl;
}

// ---------------------------------------------------------------------------
// Shared mic + worklet helpers
// ---------------------------------------------------------------------------

interface AudioPipeline {
    context: AudioContext;
    stream: MediaStream;
    source: MediaStreamAudioSourceNode;
    worklet: AudioWorkletNode;
}

async function createAudioPipeline(onPcmChunk: (buffer: ArrayBuffer) => void): Promise<AudioPipeline> {
    const context = new AudioContext({ sampleRate: SAMPLE_RATE });

    await context.audioWorklet.addModule(getWorkletUrl());

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            sampleRate: SAMPLE_RATE,
            channelCount: 1,
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true,
        },
    });

    const source = context.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(context, "pcm-processor");

    worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        onPcmChunk(event.data);
    };

    source.connect(worklet);
    worklet.connect(context.destination); // needed to keep the graph alive

    return { context, stream, source, worklet };
}

function teardownAudioPipeline(pipeline: AudioPipeline | null) {
    if (!pipeline) return;
    try {
        pipeline.worklet.port.onmessage = null;
        pipeline.source.disconnect();
        pipeline.worklet.disconnect();
    } catch { /* no-op */ }
    pipeline.stream.getTracks().forEach((t) => { try { t.stop(); } catch { /* no-op */ } });
    void pipeline.context.close().catch(() => { /* no-op */ });
}

// ---------------------------------------------------------------------------
// 1. Enrollment session
// ---------------------------------------------------------------------------

export interface EnrollmentCallbacks {
    onOpen?: () => void;
    onError?: (message: string) => void;
    onClose?: () => void;
    onTranscript?: (text: string) => void;
    onSpeakersResult?: (speakers: Array<{ label: string; speaker_identifiers: string[] }>) => void;
}

export interface SpeechmaticsEnrollmentSession {
    start: () => Promise<void>;
    stop: () => void;
}

interface CreateEnrollmentInput {
    tempKey: string;
    callbacks: EnrollmentCallbacks;
}

export function createSpeechmaticsEnrollmentSession({ tempKey, callbacks }: CreateEnrollmentInput): SpeechmaticsEnrollmentSession {
    let ws: WebSocket | null = null;
    let pipeline: AudioPipeline | null = null;
    let didOpen = false;
    let isStopping = false;

    const cleanup = () => {
        teardownAudioPipeline(pipeline);
        pipeline = null;
        if (ws && ws.readyState <= WebSocket.OPEN) {
            try { ws.close(); } catch { /* no-op */ }
        }
        ws = null;
    };

    const stop = () => {
        if (isStopping) return;
        isStopping = true;

        // Send EndOfStream to trigger final SpeakersResult
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify({ message: "EndOfStream", last_seq_no: 0 }));
            } catch {
                // fall through to cleanup
                cleanup();
            }
        } else {
            cleanup();
        }

        // Stop sending audio immediately
        teardownAudioPipeline(pipeline);
        pipeline = null;
    };

    const start = async () => {
        if (ws) return;

        const url = `wss://eu2.rt.speechmatics.com/v2?jwt=${encodeURIComponent(tempKey)}`;
        ws = new WebSocket(url);
        ws.binaryType = "arraybuffer";

        const openPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Speechmatics enrollment WebSocket open timeout"));
                cleanup();
            }, 15_000);

            ws!.onopen = () => {
                didOpen = true;
                clearTimeout(timeout);
                if (import.meta.env.DEV) console.info(`${SM_WS_TAG} enrollment open`);
                callbacks.onOpen?.();

                // Send StartRecognition with diarization enabled
                ws!.send(JSON.stringify({
                    message: "StartRecognition",
                    audio_format: {
                        type: "raw",
                        encoding: "pcm_s16le",
                        sample_rate: SAMPLE_RATE,
                    },
                    transcription_config: {
                        language: "en",
                        diarization: "speaker",
                        max_delay: 2.0,
                        operating_point: "enhanced",
                    },
                }));

                resolve();
            };

            ws!.onerror = (event) => {
                const msg = "Speechmatics enrollment WebSocket error";
                if (import.meta.env.DEV) console.error(`${SM_WS_TAG} enrollment error`, event);
                callbacks.onError?.(msg);
                if (!didOpen) {
                    clearTimeout(timeout);
                    reject(new Error(msg));
                }
            };

            ws!.onclose = () => {
                if (import.meta.env.DEV) console.info(`${SM_WS_TAG} enrollment close`);
                callbacks.onClose?.();
                if (!didOpen) {
                    clearTimeout(timeout);
                    reject(new Error("Speechmatics enrollment WebSocket closed before open"));
                }
                cleanup();
            };
        });

        ws.onmessage = (event: MessageEvent) => {
            if (typeof event.data !== "string") return;
            try {
                const msg = JSON.parse(event.data) as Record<string, unknown>;
                const messageType = msg.message as string;

                if (messageType === "RecognitionStarted") {
                    if (import.meta.env.DEV) console.info(`${SM_WS_TAG} enrollment RecognitionStarted`);
                    // Send GetSpeakers with final=true so identifiers arrive after EndOfStream
                    ws!.send(JSON.stringify({ message: "GetSpeakers", final: true }));
                }

                if (messageType === "AddTranscript") {
                    const results = msg.results as Array<{ alternatives?: Array<{ content?: string }> }> | undefined;
                    if (results) {
                        const text = results
                            .map((r) => r.alternatives?.[0]?.content ?? "")
                            .join(" ")
                            .trim();
                        if (text) callbacks.onTranscript?.(text);
                    }
                }

                if (messageType === "SpeakersResult") {
                    const speakers = (msg.speakers ?? []) as Array<{ label: string; speaker_identifiers: string[] }>;
                    if (import.meta.env.DEV) console.info(`${SM_WS_TAG} enrollment SpeakersResult`, speakers);
                    callbacks.onSpeakersResult?.(speakers);
                    // Enrollment complete — close the socket
                    cleanup();
                }

                if (messageType === "EndOfTranscript") {
                    // Server finished — clean up if SpeakersResult hasn't arrived
                    if (import.meta.env.DEV) console.info(`${SM_WS_TAG} enrollment EndOfTranscript`);
                }

                if (messageType === "Error") {
                    const reason = (msg.reason ?? msg.type ?? "Unknown Speechmatics error") as string;
                    if (import.meta.env.DEV) console.error(`${SM_WS_TAG} enrollment error message`, msg);
                    callbacks.onError?.(reason);
                }
            } catch {
                // ignore unparseable frames
            }
        };

        await openPromise;

        // Start mic capture and stream PCM to the WebSocket
        pipeline = await createAudioPipeline((buffer: ArrayBuffer) => {
            if (ws && ws.readyState === WebSocket.OPEN && !isStopping) {
                ws.send(buffer);
            }
        });
    };

    return { start, stop };
}

// ---------------------------------------------------------------------------
// 2. Live diarised session
// ---------------------------------------------------------------------------

export interface SpeechmaticsTranscriptEvent {
    transcript: string;
    speaker: string | null;
    isFinal: boolean;
}

export interface LiveSessionCallbacks {
    onOpen?: () => void;
    onError?: (message: string) => void;
    onClose?: () => void;
    onTranscript?: (event: SpeechmaticsTranscriptEvent) => void;
    onEndOfUtterance?: () => void;
}

export interface SpeechmaticsLiveSession {
    start: () => Promise<void>;
    stop: () => void;
}

interface CreateLiveSessionInput {
    tempKey: string;
    enrolledSpeakers: EnrolledSpeaker[];
    callbacks: LiveSessionCallbacks;
}

export function createSpeechmaticsLiveSession({ tempKey, enrolledSpeakers, callbacks }: CreateLiveSessionInput): SpeechmaticsLiveSession {
    let ws: WebSocket | null = null;
    let pipeline: AudioPipeline | null = null;
    let didOpen = false;
    let isStopping = false;

    // Build a map from SM label → enrolled name for identification
    // During enrollment each speaker gets label "S1", "S2", etc. keyed by index.
    // At live time we pass enrolled identifiers with custom labels matching speaker names.
    const speakerLabelMap = new Map<string, string>();
    enrolledSpeakers.forEach((s) => {
        speakerLabelMap.set(s.name, s.name);
    });

    const cleanup = () => {
        teardownAudioPipeline(pipeline);
        pipeline = null;
        if (ws && ws.readyState <= WebSocket.OPEN) {
            try { ws.close(); } catch { /* no-op */ }
        }
        ws = null;
    };

    const stop = () => {
        if (isStopping) return;
        isStopping = true;
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify({ message: "EndOfStream", last_seq_no: 0 }));
            } catch { /* no-op */ }
        }
        cleanup();
    };

    const start = async () => {
        if (ws) return;

        const url = `wss://eu2.rt.speechmatics.com/v2?jwt=${encodeURIComponent(tempKey)}`;
        ws = new WebSocket(url);
        ws.binaryType = "arraybuffer";

        const openPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Speechmatics live WebSocket open timeout"));
                cleanup();
            }, 15_000);

            ws!.onopen = () => {
                didOpen = true;
                clearTimeout(timeout);
                if (import.meta.env.DEV) console.info(`${SM_WS_TAG} live open`);
                callbacks.onOpen?.();

                // Build speaker config from enrolled data
                const speakersConfig = enrolledSpeakers.map((s) => ({
                    label: s.name,
                    speaker_identifiers: s.speakerIdentifiers,
                }));

                ws!.send(JSON.stringify({
                    message: "StartRecognition",
                    audio_format: {
                        type: "raw",
                        encoding: "pcm_s16le",
                        sample_rate: SAMPLE_RATE,
                    },
                    transcription_config: {
                        language: "en",
                        diarization: "speaker",
                        operating_point: "enhanced",
                        max_delay: 2.0,
                        enable_partials: true,
                        conversation_config: {
                            end_of_utterance_silence_trigger: 1.5,
                        },
                        speaker_diarization_config: {
                            max_speakers: Math.max(enrolledSpeakers.length, 2),
                            prefer_current_speaker: true,
                            speakers: speakersConfig,
                        },
                    },
                }));

                resolve();
            };

            ws!.onerror = (event) => {
                const msg = "Speechmatics live WebSocket error";
                if (import.meta.env.DEV) console.error(`${SM_WS_TAG} live error`, event);
                callbacks.onError?.(msg);
                if (!didOpen) {
                    clearTimeout(timeout);
                    reject(new Error(msg));
                }
            };

            ws!.onclose = () => {
                if (import.meta.env.DEV) console.info(`${SM_WS_TAG} live close`);
                callbacks.onClose?.();
                if (!didOpen) {
                    clearTimeout(timeout);
                    reject(new Error("Speechmatics live WebSocket closed before open"));
                }
            };
        });

        ws.onmessage = (event: MessageEvent) => {
            if (typeof event.data !== "string") return;
            try {
                const msg = JSON.parse(event.data) as Record<string, unknown>;
                const messageType = msg.message as string;

                if (messageType === "RecognitionStarted") {
                    if (import.meta.env.DEV) console.info(`${SM_WS_TAG} live RecognitionStarted`);
                }

                if (messageType === "AddTranscript" || messageType === "AddPartialTranscript") {
                    const isFinal = messageType === "AddTranscript";
                    const results = msg.results as Array<{
                        type?: string;
                        alternatives?: Array<{ content?: string; speaker?: string; language?: string }>;
                        is_eos?: boolean;
                    }> | undefined;

                    if (results && results.length > 0) {
                        // Accumulate text and determine primary speaker from this block
                        let text = "";
                        let speaker: string | null = null;

                        for (const result of results) {
                            const alt = result.alternatives?.[0];
                            if (!alt) continue;
                            const content = alt.content ?? "";
                            if (result.type === "word" && text) {
                                text += " ";
                            }
                            text += content;

                            // Speaker attribution — prefer the most frequent speaker label
                            const spk = alt.speaker;
                            if (spk && !speaker) {
                                speaker = spk;
                            }
                        }

                        text = text.trim();
                        if (text) {
                            callbacks.onTranscript?.({ transcript: text, speaker, isFinal });
                        }
                    }
                }

                if (messageType === "EndOfUtterance") {
                    if (import.meta.env.DEV) console.info(`${SM_WS_TAG} live EndOfUtterance`);
                    callbacks.onEndOfUtterance?.();
                }

                if (messageType === "EndOfTranscript") {
                    if (import.meta.env.DEV) console.info(`${SM_WS_TAG} live EndOfTranscript`);
                    callbacks.onClose?.();
                }

                if (messageType === "Error") {
                    const reason = (msg.reason ?? msg.type ?? "Unknown Speechmatics error") as string;
                    if (import.meta.env.DEV) console.error(`${SM_WS_TAG} live error message`, msg);
                    callbacks.onError?.(reason);
                }
            } catch {
                // ignore unparseable frames
            }
        };

        await openPromise;

        // Start mic capture
        pipeline = await createAudioPipeline((buffer: ArrayBuffer) => {
            if (ws && ws.readyState === WebSocket.OPEN && !isStopping) {
                ws.send(buffer);
            }
        });
    };

    return { start, stop };
}
