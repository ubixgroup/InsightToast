import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Container,
    HStack,
    Icon,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    LuArrowRight,
    LuCheck,
    LuLoaderCircle,
    LuMic,
    LuSquare,
} from "react-icons/lu";

import { ColorModeToggle } from "@/components/ColorModeToggle";
import { createSpeechmaticsTokenV2, leaveConversationV2 } from "@/services/v2Api";
import {
    createSpeechmaticsEnrollmentSession,
    type EnrolledSpeaker,
} from "@/services/speechmaticsLive";
import type { ColocatedRouteState } from "@/pages/colocatedTypes";
import {
    normalizeColocatedSessionState,
    readColocatedSessionState,
    saveColocatedSessionState,
    saveVoicePrintCache,
    matchVoicePrintCache,
} from "@/pages/colocatedTypes";
import type { ReactNode } from "react";

function Frame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
    return (
        <Center minH="100vh" bg="bg">
            <Container maxW="4xl" py="10">
                <Stack gap="8">
                    <HStack justify="space-between" align="start">
                        <Stack gap="2">
                            <Text fontSize="4xl" fontWeight="bold">
                                {title}
                            </Text>
                            <Text color="fg.muted" maxW="2xl">
                                {subtitle}
                            </Text>
                        </Stack>
                        <ColorModeToggle size="sm" />
                    </HStack>
                    {children}
                </Stack>
            </Container>
        </Center>
    );
}

type EnrollmentPhase = "waiting" | "recording" | "processing" | "done" | "error";

interface SpeakerEnrollmentState {
    phase: EnrollmentPhase;
    previewText: string;
    error: string | null;
    speakerIdentifiers: string[];
}

const ENROLLMENT_INSTRUCTION =
    "Please read aloud from the provided text clearly and at your normal speaking pace.";

export default function SpeakerEnrollmentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as Partial<ColocatedRouteState> | null;
    const routeState = useMemo(
        () => normalizeColocatedSessionState(locationState ?? readColocatedSessionState() ?? undefined),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
    const [enrollments, setEnrollments] = useState<SpeakerEnrollmentState[]>(() =>
        (routeState?.speakerNames ?? []).map(() => ({
            phase: "waiting" as const,
            previewText: "",
            error: null,
            speakerIdentifiers: [],
        })),
    );
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [cachedSpeakers, setCachedSpeakers] = useState<import("@/services/speechmaticsLive").EnrolledSpeaker[] | null>(
        () => {
            if (!routeState) return null;
            return matchVoicePrintCache(routeState.conversationId, routeState.speakerNames);
        },
    );
    const sessionRef = useRef<ReturnType<typeof createSpeechmaticsEnrollmentSession> | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        if (!routeState) {
            navigate("/interactive/colocated/join", { replace: true });
            return;
        }
    }, [navigate, routeState]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            sessionRef.current?.stop();
            sessionRef.current = null;
        };
    }, []);

    /* ──── browser back / pagehide guards ──── */
    useEffect(() => {
        if (!routeState) return;
        const onPageHide = () => {
            sessionRef.current?.stop();
            sessionRef.current = null;
            void leaveConversationV2({
                conversationId: routeState.conversationId,
                clientId: routeState.clientId,
            });
        };
        window.addEventListener("pagehide", onPageHide);
        window.addEventListener("beforeunload", onPageHide);
        return () => {
            window.removeEventListener("pagehide", onPageHide);
            window.removeEventListener("beforeunload", onPageHide);
        };
    }, [routeState]);

    useEffect(() => {
        if (!routeState) return;
        window.history.pushState({ enrollmentGuard: true }, "");
        const onPopState = () => {
            window.history.pushState({ enrollmentGuard: true }, "");
        };
        window.addEventListener("popstate", onPopState);
        return () => { window.removeEventListener("popstate", onPopState); };
    }, [navigate, routeState]);

    const speakerNames = useMemo(() => routeState?.speakerNames ?? [], [routeState?.speakerNames]);
    const totalSpeakers = speakerNames.length;
    const allEnrolled = enrollments.every((e) => e.phase === "done");
    const currentEnrollment = enrollments[currentSpeakerIndex];
    const currentSpeakerName = speakerNames[currentSpeakerIndex] ?? "";

    const updateEnrollment = useCallback(
        (index: number, patch: Partial<SpeakerEnrollmentState>) => {
            if (!isMountedRef.current) return;
            setEnrollments((prev) =>
                prev.map((e, i) => (i === index ? { ...e, ...patch } : e)),
            );
        },
        [],
    );

    const handleStartRecording = useCallback(async () => {
        if (!routeState) return;
        const idx = currentSpeakerIndex;

        setGlobalError(null);
        updateEnrollment(idx, { phase: "recording", previewText: "", error: null });

        try {
            // Get a Speechmatics temp key from our backend
            const tokenResponse = await createSpeechmaticsTokenV2({
                conversationId: routeState.conversationId,
                clientId: routeState.clientId,
                ttlSeconds: 120,
            });

            if (!isMountedRef.current) return;

            const session = createSpeechmaticsEnrollmentSession({
                tempKey: tokenResponse.key_value,
                callbacks: {
                    onOpen: () => {
                    },
                    onError: (message) => {
                        if (!isMountedRef.current) return;
                        updateEnrollment(idx, { phase: "error", error: message });
                    },
                    onClose: () => {
                    },
                    onTranscript: (text) => {
                        if (!isMountedRef.current) return;
                        updateEnrollment(idx, { previewText: text });
                    },
                    onSpeakersResult: (speakers) => {
                        if (!isMountedRef.current) return;

                        // We expect one speaker from this enrollment session
                        const ids = speakers.flatMap((s) => s.speaker_identifiers);
                        if (ids.length > 0) {
                            updateEnrollment(idx, {
                                phase: "done",
                                speakerIdentifiers: ids,
                                error: null,
                            });
                        } else {
                            updateEnrollment(idx, {
                                phase: "error",
                                error: "No voice print captured. Please try again, speaking clearly for at least 10 seconds.",
                            });
                        }
                        sessionRef.current = null;
                    },
                },
            });

            sessionRef.current = session;
            await session.start();
        } catch (err) {
            if (!isMountedRef.current) return;
            const message = err instanceof Error ? err.message : "Failed to start enrollment";
            updateEnrollment(idx, { phase: "error", error: message });
        }
    }, [routeState, currentSpeakerIndex, updateEnrollment]);

    const handleStopRecording = useCallback(() => {
        updateEnrollment(currentSpeakerIndex, { phase: "processing" });
        sessionRef.current?.stop();
        // Don't null sessionRef — the onSpeakersResult callback still needs to fire
    }, [currentSpeakerIndex, updateEnrollment]);

    const handleRetry = useCallback(() => {
        sessionRef.current?.stop();
        sessionRef.current = null;
        updateEnrollment(currentSpeakerIndex, {
            phase: "waiting",
            previewText: "",
            error: null,
            speakerIdentifiers: [],
        });
    }, [currentSpeakerIndex, updateEnrollment]);

    const handleNextSpeaker = useCallback(() => {
        if (currentSpeakerIndex < totalSpeakers - 1) {
            setCurrentSpeakerIndex((prev) => prev + 1);
        }
    }, [currentSpeakerIndex, totalSpeakers]);

    const handleStartSession = useCallback(() => {
        if (!routeState) return;

        const enrolledSpeakers: EnrolledSpeaker[] = speakerNames.map((name, i) => ({
            name,
            speakerIdentifiers: enrollments[i]?.speakerIdentifiers ?? [],
        }));

        const updatedState: ColocatedRouteState = {
            ...routeState,
            enrolledSpeakers,
        };

        saveVoicePrintCache(routeState.conversationId, enrolledSpeakers);
        saveColocatedSessionState(updatedState);
        navigate("/interactive/colocated/session", { state: updatedState, replace: true });
    }, [routeState, speakerNames, enrollments, navigate]);

    const handleUseCachedEnrollment = useCallback(() => {
        if (!routeState || !cachedSpeakers) return;
        const updatedState: ColocatedRouteState = {
            ...routeState,
            enrolledSpeakers: cachedSpeakers,
        };
        saveColocatedSessionState(updatedState);
        navigate("/interactive/colocated/session", { state: updatedState, replace: true });
    }, [routeState, cachedSpeakers, navigate]);

    const handleDismissCache = useCallback(() => {
        setCachedSpeakers(null);
    }, []);

    if (!routeState) return null;

    return (
        <Frame
            title="Speaker Identification"
            subtitle="Each speaker will read a short passage so their voice can be recognized during the session."
        >
            {/* Cached enrollment prompt */}
            {cachedSpeakers && (
                <Card.Root variant="elevated" borderWidth="1px" borderColor="green.muted" bg="green.subtle">
                    <Card.Body>
                        <Stack gap="4">
                            <Stack gap="1">
                                <Text fontSize="lg" fontWeight="semibold">
                                    Previous enrollment found
                                </Text>
                                <Text fontSize="sm" color="fg.muted">
                                    Voice prints from a previous session with the same speakers are available.
                                    You can skip enrollment and use the cached data, or re-enroll if needed.
                                </Text>
                            </Stack>
                            <HStack gap="2" flexWrap="wrap">
                                {cachedSpeakers.map((s, i) => (
                                    <Badge key={i} colorPalette="green" variant="subtle" px="2" py="1">
                                        <Icon as={LuCheck} mr="1" />
                                        {s.name} ({s.speakerIdentifiers.length} id)
                                    </Badge>
                                ))}
                            </HStack>
                            <HStack gap="3">
                                <Button colorPalette="green" size="lg" onClick={handleUseCachedEnrollment}>
                                    <Icon as={LuCheck} />
                                    Use Cached Enrollment
                                </Button>
                                <Button variant="outline" size="lg" onClick={handleDismissCache}>
                                    Re-enroll
                                </Button>
                            </HStack>
                        </Stack>
                    </Card.Body>
                </Card.Root>
            )}

            {/* Progress indicator */}
            <HStack gap="2" flexWrap="wrap">
                {speakerNames.map((name, i) => {
                    const enrollment = enrollments[i];
                    const isDone = enrollment?.phase === "done";
                    const isCurrent = i === currentSpeakerIndex;
                    return (
                        <Badge
                            key={i}
                            size="lg"
                            colorPalette={isDone ? "green" : isCurrent ? "blue" : "gray"}
                            variant={isCurrent ? "solid" : "subtle"}
                            px="3"
                            py="1"
                        >
                            {isDone && <Icon as={LuCheck} mr="1" />}
                            {name}
                        </Badge>
                    );
                })}
            </HStack>

            <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                <Card.Body>
                    {!allEnrolled ? (
                        <Stack gap="5">
                            <VStack gap="1" align="start">
                                <Text fontSize="xs" color="fg.muted">
                                    Speaker {currentSpeakerIndex + 1} of {totalSpeakers}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold">
                                    {currentSpeakerName}
                                </Text>
                            </VStack>

                            {/* Enrollment instruction */}
                            <Box
                                borderWidth="1px"
                                borderColor="border.muted"
                                borderRadius="md"
                                px="5"
                                py="4"
                                bg="bg.subtle"
                            >
                                <Text
                                    fontSize="md"
                                    lineHeight="tall"
                                    color="fg.muted"
                                >
                                    {ENROLLMENT_INSTRUCTION}
                                </Text>
                            </Box>

                            {/* Live transcript preview */}
                            {(currentEnrollment?.phase === "recording" ||
                                currentEnrollment?.phase === "processing") &&
                                currentEnrollment.previewText && (
                                    <Box
                                        borderWidth="1px"
                                        borderColor="blue.200"
                                        borderRadius="md"
                                        px="4"
                                        py="3"
                                        bg="blue.subtle"
                                    >
                                        <Text fontSize="sm" color="fg.muted">
                                            {currentEnrollment.previewText}
                                        </Text>
                                    </Box>
                                )}

                            {/* Recording controls */}
                            <HStack gap="3" justify="center">
                                {currentEnrollment?.phase === "waiting" && (
                                    <Button
                                        colorPalette="red"
                                        size="lg"
                                        onClick={handleStartRecording}
                                    >
                                        <Icon as={LuMic} />
                                        Start Recording
                                    </Button>
                                )}

                                {currentEnrollment?.phase === "recording" && (
                                    <Button
                                        colorPalette="gray"
                                        variant="solid"
                                        size="lg"
                                        onClick={handleStopRecording}
                                    >
                                        <HStack gap="2">
                                            <Box
                                                w="3"
                                                h="3"
                                                borderRadius="full"
                                                bg="red.500"
                                                css={{ animation: "pulse 1.5s infinite", "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }}
                                            />
                                            <Icon as={LuSquare} />
                                            <Text>Stop Recording</Text>
                                        </HStack>
                                    </Button>
                                )}

                                {currentEnrollment?.phase === "processing" && (
                                    <Button disabled size="lg" colorPalette="gray" variant="subtle">
                                        <LuLoaderCircle className="animate-spin" />
                                        Processing voice print...
                                    </Button>
                                )}

                                {currentEnrollment?.phase === "done" &&
                                    currentSpeakerIndex < totalSpeakers - 1 && (
                                        <Button
                                            colorPalette="blue"
                                            size="lg"
                                            onClick={handleNextSpeaker}
                                        >
                                            <Icon as={LuArrowRight} />
                                            Next Speaker
                                        </Button>
                                    )}

                                {currentEnrollment?.phase === "error" && (
                                    <Button
                                        colorPalette="orange"
                                        size="lg"
                                        onClick={handleRetry}
                                    >
                                        Retry
                                    </Button>
                                )}
                            </HStack>

                            {/* Status badge */}
                            {currentEnrollment?.phase === "recording" && (
                                <HStack justify="center">
                                    <Badge colorPalette="red" variant="subtle" px="3" py="1">
                                        <HStack gap="2">
                                            <Box
                                                w="2"
                                                h="2"
                                                borderRadius="full"
                                                bg="red.500"
                                                css={{ animation: "pulse 1.5s infinite", "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }}
                                            />
                                            <Text>Recording — speak clearly</Text>
                                        </HStack>
                                    </Badge>
                                </HStack>
                            )}

                            {currentEnrollment?.phase === "done" && (
                                <HStack justify="center">
                                    <Badge colorPalette="green" variant="subtle" px="3" py="1">
                                        <Icon as={LuCheck} mr="1" />
                                        Voice print captured for {currentSpeakerName}
                                    </Badge>
                                </HStack>
                            )}

                            {currentEnrollment?.error && (
                                <Alert.Root status="error" borderRadius="md">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Title>{currentEnrollment.error}</Alert.Title>
                                    </Alert.Content>
                                </Alert.Root>
                            )}

                            {globalError && (
                                <Alert.Root status="error" borderRadius="md">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Title>{globalError}</Alert.Title>
                                    </Alert.Content>
                                </Alert.Root>
                            )}
                        </Stack>
                    ) : (
                        /* All speakers enrolled — summary */
                        <Stack gap="5">
                            <Text fontSize="lg" fontWeight="semibold">
                                All speakers enrolled
                            </Text>
                            <Stack gap="2">
                                {speakerNames.map((name, i) => (
                                    <HStack key={i} gap="3">
                                        <Badge colorPalette="green" variant="subtle">
                                            <Icon as={LuCheck} />
                                        </Badge>
                                        <Text>{name}</Text>
                                        <Badge colorPalette="gray" variant="subtle" fontSize="xs">
                                            {enrollments[i]?.speakerIdentifiers.length ?? 0} identifier(s)
                                        </Badge>
                                    </HStack>
                                ))}
                            </Stack>
                            <Button
                                colorPalette="blue"
                                size="lg"
                                onClick={handleStartSession}
                                alignSelf="center"
                            >
                                <Icon as={LuArrowRight} />
                                Start Session
                            </Button>
                        </Stack>
                    )}
                </Card.Body>
            </Card.Root>

            {/* Back button */}
            {!allEnrolled && (
                <Button
                    variant="ghost"
                    onClick={() => {
                        sessionRef.current?.stop();
                        sessionRef.current = null;
                        if (routeState) {
                            void leaveConversationV2({
                                conversationId: routeState.conversationId,
                                clientId: routeState.clientId,
                            });
                        }
                        navigate("/interactive/colocated/join");
                    }}
                    alignSelf="start"
                >
                    Back
                </Button>
            )}
        </Frame>
    );
}
