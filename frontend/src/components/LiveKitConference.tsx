import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useTracks,
    VideoTrack,
    useRoomContext,
    useParticipants,
    useLocalParticipant,
    useConnectionState,
    isTrackReference,
} from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client";
import {
    Box,
    Button,
    Center,
    Grid,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import { createLivekitTokenV2 } from "@/services/v2Api";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface LiveKitConferenceProps {
    conversationId: string;
    clientId: string;
    speakerName: string;
    /** Signal from parent that we should disconnect immediately. */
    shouldDisconnect?: boolean;
    /** Fired once after the LiveKit room connection is established. */
    onConnected?: () => void;
    /** Fired when the room disconnects (user leaves or error). */
    onDisconnected?: () => void;
    /** Fired when token fetch or connection fails. */
    onError?: (message: string) => void;
    /** Fired when local mic/camera state changes so parent can reflect in controls. */
    onMediaStateChange?: (state: { isMicEnabled: boolean; isCameraEnabled: boolean }) => void;
}

export interface LiveKitConferenceHandle {
    disconnect: () => void;
    toggleMic: () => Promise<void>;
    toggleCamera: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Inner: VideoGrid (renders inside LiveKitRoom provider)              */
/* ------------------------------------------------------------------ */

function VideoGrid() {
    const trackRefs = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    const { localParticipant } = useLocalParticipant();
    const participants = useParticipants();

    // Separate local participant tracks from remote tracks
    const localTrack = trackRefs.find(
        (t) => t.participant.identity === localParticipant.identity && t.source === Track.Source.Camera,
    );
    const remoteTracks = trackRefs.filter(
        (t) => t.participant.identity !== localParticipant.identity,
    );

    if (trackRefs.length === 0 && participants.length === 0) {
        return (
            <Center height="100%">
                <Text color="fg.muted">Waiting for participants...</Text>
            </Center>
        );
    }

    // Compute responsive column count for remote tracks only
    const count = remoteTracks.length || 1;
    const cols = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4;

    const localHasVideo =
        localTrack?.publication?.track && !localTrack.publication.isMuted;

    return (
        <Box position="relative" height="100%" width="100%">
            {/* Main grid — remote participants */}
            <Grid
                height="100%"
                width="100%"
                templateColumns={`repeat(${cols}, 1fr)`}
                gap="2"
                p="2"
                autoRows="1fr"
            >
                {remoteTracks.length === 0 ? (
                    <Center height="100%">
                        <Text color="fg.muted">Waiting for other participants...</Text>
                    </Center>
                ) : (
                    remoteTracks.map((trackRef) => {
                        const participant = trackRef.participant;
                        const hasVideo =
                            trackRef.publication?.track &&
                            !trackRef.publication.isMuted;

                        return (
                            <Box
                                key={`${participant.identity}-${trackRef.source}`}
                                position="relative"
                                borderRadius="lg"
                                overflow="hidden"
                                bg="gray.900"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                {hasVideo && isTrackReference(trackRef) ? (
                                    <VideoTrack
                                        trackRef={trackRef}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            ...(trackRef.source === Track.Source.Camera && { transform: "scaleX(-1)" }),
                                        }}
                                    />
                                ) : (
                                    <Center height="100%" width="100%">
                                        <Stack align="center" gap="1">
                                            <Box
                                                width="14"
                                                height="14"
                                                borderRadius="full"
                                                bg="gray.700"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Text
                                                    fontSize="xl"
                                                    fontWeight="bold"
                                                    color="white"
                                                >
                                                    {(participant.name || participant.identity || "?")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </Text>
                                            </Box>
                                            <Text
                                                fontSize="xs"
                                                color="gray.300"
                                                maxW="120px"
                                                overflow="hidden"
                                                textOverflow="ellipsis"
                                                whiteSpace="nowrap"
                                            >
                                                {participant.name || participant.identity}
                                            </Text>
                                        </Stack>
                                    </Center>
                                )}

                                {/* Participant name overlay */}
                                <Box
                                    position="absolute"
                                    bottom="1"
                                    left="1"
                                    px="2"
                                    py="0.5"
                                    borderRadius="md"
                                    bg="blackAlpha.600"
                                    backdropFilter="blur(4px)"
                                >
                                    <Text fontSize="xs" color="white" maxW="140px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                                        {participant.name || participant.identity}
                                    </Text>
                                </Box>
                            </Box>
                        );
                    })
                )}
            </Grid>

            {/* Local participant pip (bottom-right, Google-Meet-style) */}
            <Box
                position="absolute"
                bottom="80px"
                right="12px"
                width="160px"
                height="120px"
                borderRadius="lg"
                overflow="hidden"
                bg="gray.900"
                shadow="lg"
                borderWidth="2px"
                borderColor="gray.700"
                zIndex="5"
            >
                {localHasVideo && localTrack && isTrackReference(localTrack) ? (
                    <VideoTrack
                        trackRef={localTrack}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: "scaleX(-1)",
                        }}
                    />
                ) : (
                    <Center height="100%" width="100%">
                        <Box
                            width="10"
                            height="10"
                            borderRadius="full"
                            bg="gray.700"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text fontSize="md" fontWeight="bold" color="white">
                                {(localParticipant.name || localParticipant.identity || "?")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </Text>
                        </Box>
                    </Center>
                )}
                {/* Name label */}
                <Box
                    position="absolute"
                    bottom="1"
                    left="1"
                    px="1.5"
                    py="0.5"
                    borderRadius="md"
                    bg="blackAlpha.600"
                    backdropFilter="blur(4px)"
                >
                    <Text fontSize="2xs" color="white" maxW="100px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        You
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Inner: RoomContent (rendered inside LiveKitRoom)                    */
/* ------------------------------------------------------------------ */

interface RoomContentProps {
    shouldDisconnect?: boolean;
    onConnected?: () => void;
    onMediaStateChange?: (state: { isMicEnabled: boolean; isCameraEnabled: boolean }) => void;
    imperativeRef: React.RefObject<LiveKitConferenceHandle | null>;
}

function RoomContent({ shouldDisconnect, onConnected, onMediaStateChange, imperativeRef }: RoomContentProps) {
    const room = useRoomContext();
    const connectionState = useConnectionState();
    const hasNotifiedConnected = useRef(false);
    const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

    // Expose disconnect + mic/camera toggles to parent via imperative handle
    useImperativeHandle(imperativeRef, () => ({
        disconnect: () => {
            room.disconnect();
        },
        toggleMic: async () => {
            await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
        },
        toggleCamera: async () => {
            await localParticipant.setCameraEnabled(!isCameraEnabled);
        },
    }), [room, localParticipant, isMicrophoneEnabled, isCameraEnabled]);

    // Sync media state to parent
    useEffect(() => {
        onMediaStateChange?.({ isMicEnabled: isMicrophoneEnabled, isCameraEnabled });
    }, [isMicrophoneEnabled, isCameraEnabled, onMediaStateChange]);

    // Fire onConnected when connection state becomes Connected
    useEffect(() => {
        console.log("[LK] connectionState =", connectionState);
        if (connectionState === ConnectionState.Connected && !hasNotifiedConnected.current) {
            hasNotifiedConnected.current = true;
            console.log("[LK] RoomContent: notifying onConnected");
            onConnected?.();
        }
    }, [connectionState, onConnected]);

    // Disconnect when parent signals
    useEffect(() => {
        if (shouldDisconnect) {
            room.disconnect();
        }
    }, [shouldDisconnect, room]);

    return (
        <>
            <RoomAudioRenderer />
            <VideoGrid />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Outer: LiveKitConference                                            */
/* ------------------------------------------------------------------ */

export const LiveKitConference = forwardRef<
    LiveKitConferenceHandle,
    LiveKitConferenceProps
>(function LiveKitConference(
    {
        conversationId,
        clientId,
        speakerName,
        shouldDisconnect,
        onConnected,
        onDisconnected,
        onError,
        onMediaStateChange,
    },
    ref,
) {
    const [token, setToken] = useState<string | null>(null);
    const [serverUrl, setServerUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const innerRef = useRef<LiveKitConferenceHandle | null>(null);

    // Expose disconnect + mic/camera toggles to parent via forwarded ref  
    useImperativeHandle(ref, () => ({
        disconnect: () => {
            innerRef.current?.disconnect();
        },
        toggleMic: async () => {
            await innerRef.current?.toggleMic();
        },
        toggleCamera: async () => {
            await innerRef.current?.toggleCamera();
        },
    }));

    // Fetch LiveKit token on mount
    // Note: no fetchedRef guard — React StrictMode double-fires effects;
    // the `cancelled` flag handles cleanup correctly on its own.
    useEffect(() => {
        let cancelled = false;

        async function fetchToken() {
            try {
                setIsLoading(true);
                setError(null);
                console.log("[LK] fetching token…", { conversationId, clientId, speakerName });
                const response = await createLivekitTokenV2({
                    conversationId,
                    clientId,
                    participantName: speakerName,
                });
                if (cancelled) return;
                console.log("[LK] token received, server_url =", response.server_url);
                setToken(response.participant_token);
                // Prefer VITE_LIVEKIT_URL env var; fall back to API response
                const envUrl = import.meta.env.VITE_LIVEKIT_URL as string | undefined;
                setServerUrl(envUrl?.trim() || response.server_url);
            } catch (err) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Failed to fetch LiveKit token";
                setError(message);
                console.error("[LK] token fetch error", err);
                onError?.(message);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        void fetchToken();
        return () => {
            cancelled = true;
        };
    }, [conversationId, clientId, speakerName, retryCount]);

    if (isLoading) {
        return (
            <Center height="100%">
                <Stack align="center" gap="3">
                    <Spinner size="lg" color="blue.400" />
                    <Text color="fg.muted" fontSize="sm">Connecting to video conference...</Text>
                </Stack>
            </Center>
        );
    }

    if (error || !token || !serverUrl) {
        return (
            <Center height="100%">
                <Stack align="center" gap="3" maxW="md" textAlign="center">
                    <Text color="red.400" fontWeight="semibold">Video Conference Error</Text>
                    <Text color="fg.muted" fontSize="sm">{error || "Missing token or server URL."}</Text>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setRetryCount((c) => c + 1);
                        }}
                    >
                        Retry
                    </Button>
                </Stack>
            </Center>
        );
    }

    return (
        <LiveKitRoom
            serverUrl={serverUrl}
            token={token}
            connect={true}
            video={true}
            audio={false}
            style={{ height: "100%", width: "100%", position: "relative", overflow: "visible", backgroundColor: "transparent" }}
            onConnected={() => {
                console.log("[LK] LiveKitRoom onConnected fired");
                onConnected?.();
            }}
            onDisconnected={() => {
                console.log("[LK] LiveKitRoom onDisconnected fired");
                onDisconnected?.();
            }}
        >
            <RoomContent
                shouldDisconnect={shouldDisconnect}
                onConnected={onConnected}
                onMediaStateChange={onMediaStateChange}
                imperativeRef={innerRef}
            />
        </LiveKitRoom>
    );
});

export default LiveKitConference;
