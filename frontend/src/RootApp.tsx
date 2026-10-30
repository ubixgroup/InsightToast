import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Container,
    Flex,
    HStack,
    Icon,
    Input,
    Stack,
    Text,
    VStack,
    Avatar,
    AvatarGroup,
    Separator,
    Switch,
    Alert,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "motion/react";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    LuArrowRight,
    LuBug,
    LuLoaderCircle,
    LuRadio,
} from "react-icons/lu";
import { useMotionValue } from "motion/react";

import DemoApp from "@/App";
import { ColorModeToggle } from "@/components/ColorModeToggle";
import { InsightBanner } from "@/components/InsightBanner";
import { InsightsSidebar } from "@/components/InsightsSidebar";
import { LiveKitConference, type LiveKitConferenceHandle } from "@/components/LiveKitConference";
import { ProgressToast } from "@/components/ProgressToast";
import { SessionActionControls, type SessionHoverControl } from "@/components/SessionControls";
import { Tooltip } from "@/components/ui/tooltip";
import { useDeepgramStt } from "@/hooks/useDeepgramStt";
import { useInsightVisibility } from "@/hooks/useInsightVisibility";
import { useInteractiveConversation, type Participant } from "@/hooks/useInteractiveConversation";
import { useClickAnalytics, type TrackAnalyticsInput } from "@/hooks/useClickAnalytics";
import { useProgressToast } from "@/hooks/useProgressToast";
import {
    createDeepgramTokenV2,
    enqueueTranscriptV2,
    insightActionV2,
    leaveConversationKeepalive,
    leaveConversationV2,
    joinConversationV2,
    type SSEEventMessage,
} from "@/services/v2Api";
import AdminPage from "@/pages/AdminPage";
import ColocatedJoinPage from "@/pages/ColocatedJoinPage";
import SpeakerEnrollmentPage from "@/pages/SpeakerEnrollmentPage";
import ColocatedSessionPage from "@/pages/ColocatedSessionPage";
import type { DismissedInsight } from "@/types";
import type { Insight } from "@/types";
import type { InsightBannerState } from "@/types/progressToast";
import type { CitationClickContext } from "@/utils/parseCitations";

const NOTIFICATION_WIDTH = 400;
const DRAG_DISMISS_RATIO = 0.4;
const SESSION_STORAGE_KEY = "interactive-session";
const MAX_SESSION_DURATION_MS = 60 * 60 * 1000;
const AUTO_LEAVE_BUFFER_MS = 10 * 1000;
const TIMER_WARNING_MS = 2 * 60 * 1000;

interface AnimatedNotificationItemProps {
    lifecycle: "active" | "exiting";
    width: number;
    cancelClickOnDrag?: boolean;
    onRequestDismiss: () => void;
    onFinalizeDismiss: () => void;
    children: ReactNode;
}

function AnimatedNotificationItem({
    lifecycle,
    width,
    cancelClickOnDrag = false,
    onRequestDismiss,
    onFinalizeDismiss,
    children,
}: AnimatedNotificationItemProps) {
    const x = useMotionValue(0);
    const [didDrag, setDidDrag] = useState(false);

    return (
        <motion.div
            style={{
                x,
                width: `${width}px`,
                pointerEvents: lifecycle === "exiting" ? "none" : "auto",
            }}
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={
                lifecycle === "exiting"
                    ? { opacity: 0, x: 120, scale: 0.98 }
                    : { opacity: 1, x: 0, scale: 1 }
            }
            transition={
                lifecycle === "exiting"
                    ? { duration: 0.26, ease: [0.4, 0, 1, 1] }
                    : { type: "spring", stiffness: 260, damping: 30, mass: 1.0 }
            }
            drag="x"
            dragMomentum={false}
            dragElastic={0.3}
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={(_, info) => {
                if (info.offset.x < 0) {
                    x.set(0);
                    return;
                }

                if (info.offset.x > 6) {
                    setDidDrag(true);
                }
            }}
            onDragEnd={(_, info) => {
                if (info.offset.x >= width * DRAG_DISMISS_RATIO) {
                    onRequestDismiss();
                    return;
                }

                setDidDrag(false);
            }}
            onClickCapture={(event) => {
                if (cancelClickOnDrag && didDrag) {
                    event.preventDefault();
                    event.stopPropagation();
                    setDidDrag(false);
                }
            }}
            onAnimationComplete={() => {
                if (lifecycle === "exiting") {
                    onFinalizeDismiss();
                }
            }}
        >
            {children}
        </motion.div>
    );
}

interface SessionRouteState {
    conversationId: string;
    clientId: string;
    speakerName: string;
    condition: "condition-1" | "condition-2";
    mode: "experimental" | "baseline";
    participants: Participant[];
    isRegisteredConversation: boolean;
    expiresAt: string | null;
    joinedAt: string;
}

function saveSessionState(state: SessionRouteState) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
}

function normalizeSessionState(raw?: Partial<SessionRouteState>): SessionRouteState | null {
    if (!raw) {
        return null;
    }

    if (!raw.conversationId || !raw.clientId || !raw.speakerName || !Array.isArray(raw.participants)) {
        return null;
    }

    return {
        conversationId: raw.conversationId,
        clientId: raw.clientId,
        speakerName: raw.speakerName,
        condition: raw.condition === "condition-2" ? "condition-2" : "condition-1",
        mode: raw.mode === "baseline" ? "baseline" : "experimental",
        participants: raw.participants,
        isRegisteredConversation: raw.isRegisteredConversation ?? false,
        expiresAt: raw.expiresAt ?? null,
        joinedAt: raw.joinedAt ?? new Date().toISOString(),
    };
}

function readSessionState(): SessionRouteState | null {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    try {
        return normalizeSessionState(JSON.parse(raw) as Partial<SessionRouteState>);
    } catch {
        return null;
    }
}

function clearSessionState() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

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

function LandingPage() {
    const navigate = useNavigate();

    return (
        <Frame
            title="InsightToast"
            subtitle="Choose whether to run the static demo or the live interactive study flow."
        >
            <Stack gap="4">
                <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                    <Card.Body>
                        <Stack gap="4">
                            <HStack gap="2">
                                <Icon as={LuRadio} color="green.400" />
                                <Text fontWeight="semibold">Interactive Experience</Text>
                            </HStack>
                            {/* <Text color="fg.muted" fontSize="sm">
                                Remote study flow with conversation join, live SSE updates, and lifecycle-safe leave handling.
                            </Text> */}
                            <Button onClick={() => navigate("/interactive/study-setting")} alignSelf="start" colorPalette="green">
                                Start Interactive Session
                            </Button>
                        </Stack>
                    </Card.Body>
                </Card.Root>

                <HStack align="center" gap="3" py="1">
                    <Separator flex="1" />
                    <Text fontSize="xs" color="fg.muted" fontWeight="semibold" letterSpacing="widest">
                        OR
                    </Text>
                    <Separator flex="1" />
                </HStack>

                <Stack gap="2" align="start">
                    <Text fontSize="sm" color="fg.muted">Try a demo experience</Text>
                    <Button onClick={() => navigate("/demo")} colorPalette="blue" variant="subtle">
                        Open Demo
                    </Button>
                </Stack>
            </Stack>
        </Frame>
    );
}

function ScenarioPage() {
    const navigate = useNavigate();

    return (
        <Frame
            title="Study Setting"
            subtitle="Which study setting are you participating in?"
        >
            <Stack gap="4">
                <HStack align="stretch" gap="4" flexWrap="wrap">
                    <Button
                        size="lg"
                        height="110px"
                        flex="1"
                        minW="260px"
                        onClick={() => navigate("/interactive/remote/join")}
                        colorPalette="blue"
                        variant="solid"
                    >
                        Remote
                    </Button>
                    <Button
                        size="lg"
                        height="110px"
                        flex="1"
                        minW="260px"
                        onClick={() => navigate("/interactive/colocated/join")}
                        colorPalette="blue"
                        variant="solid"
                    >
                        Co-located
                    </Button>
                </HStack>
                <Button variant="ghost" onClick={() => navigate("/")} alignSelf="start" mb="2">
                    Back
                </Button>
            </Stack>
        </Frame>
    );
}

function JoinPage() {
    const navigate = useNavigate();
    const [speakerName, setSpeakerName] = useState("");
    const [conversationId, setConversationId] = useState("");
    const [condition, setCondition] = useState<"condition-1" | "condition-2">("condition-1");
    const [noConversationId, setNoConversationId] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = speakerName.trim().length > 0 && (noConversationId || conversationId.trim().length > 0);

    const handleJoin = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await joinConversationV2({
                conversationId: noConversationId ? null : conversationId.trim(),
                speakerName: speakerName.trim(),
                isBaseline: condition === "condition-2",
            });

            const expiresAtMs = response.expires_at ? Date.parse(response.expires_at) : Number.NaN;
            const isJoinExpired = !response.is_registered_conversation && Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now();

            if (isJoinExpired) {
                try {
                    await leaveConversationV2({
                        conversationId: response.conversation_id,
                        clientId: response.client_id,
                    });
                } catch {
                    // best effort cleanup
                }
                setError("This unregistered conversation has expired. Ask the coordinator for a fresh conversation.");
                return;
            }

            const nextState: SessionRouteState = {
                conversationId: response.conversation_id,
                clientId: response.client_id,
                speakerName: speakerName.trim(),
                condition,
                mode: response.mode,
                participants: response.participants,
                isRegisteredConversation: response.is_registered_conversation,
                expiresAt: response.expires_at,
                joinedAt: new Date().toISOString(),
            };

            saveSessionState(nextState);
            navigate("/interactive/remote/session", { state: nextState, replace: true });
        } catch (joinError) {
            const message = joinError instanceof Error ? joinError.message : "Failed to join conversation";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Frame
            title="Join Conversation"
            subtitle="Enter your speaker name and conversation ID to connect to the remote study session."
        >
            <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                <Card.Body>
                    <Stack gap="5">

                        <Stack gap="2">
                            <Text fontSize="sm" color="fg.muted">Study condition</Text>
                            <HStack align="stretch" gap="3">
                                <Tooltip content="InsightToast" positioning={{ placement: "top" }}>
                                    <Box
                                        as="button"
                                        flex="1"
                                        textAlign="left"
                                        borderWidth="1px"
                                        borderColor={condition === "condition-1" ? "blue.500" : "border.muted"}
                                        borderRadius="md"
                                        px="4"
                                        py="3"
                                        bg={condition === "condition-1" ? "blue.subtle" : "bg"}
                                        onClick={() => setCondition("condition-1")}
                                    >
                                        <Text fontWeight="semibold">Condition 1</Text>
                                    </Box>
                                </Tooltip>

                                <Box
                                    as="button"
                                    flex="1"
                                    textAlign="left"
                                    borderWidth="1px"
                                    borderColor={condition === "condition-2" ? "blue.500" : "border.muted"}
                                    borderRadius="md"
                                    px="4"
                                    py="3"
                                    bg={condition === "condition-2" ? "blue.subtle" : "bg"}
                                    onClick={() => setCondition("condition-2")}
                                >
                                    <Text fontWeight="semibold">Condition 2</Text>
                                </Box>
                            </HStack>
                        </Stack>

                        <Stack gap="2">
                            <Text fontSize="sm" color="fg.muted">Participant speaker name</Text>
                            <Input
                                value={speakerName}
                                onChange={(event) => setSpeakerName(event.target.value)}
                                placeholder="e.g., Alex"
                                size="lg"
                            />
                        </Stack>

                        <Switch.Root checked={noConversationId} onCheckedChange={(event) => setNoConversationId(event.checked)}>
                            <Switch.HiddenInput />
                            <Switch.Control />
                            <Switch.Label>I don’t have a conversation ID</Switch.Label>
                        </Switch.Root>

                        {!noConversationId && (
                            <Stack gap="2">
                                <Text fontSize="sm" color="fg.muted">Conversation ID</Text>
                                <Input
                                    value={conversationId}
                                    onChange={(event) => setConversationId(event.target.value)}
                                    placeholder="Enter registered conversation ID"
                                    size="lg"
                                />
                            </Stack>
                        )}

                        {error && (
                            <Alert.Root status="error" borderRadius="md">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>{error}</Alert.Title>
                                </Alert.Content>
                            </Alert.Root>
                        )}

                        <HStack justify="space-between" pt="2">
                            <Button variant="ghost" onClick={() => navigate("/interactive/study-setting")}>Back</Button>
                            <Button
                                colorPalette="blue"
                                onClick={handleJoin}
                                disabled={!canSubmit || isSubmitting}
                            >
                                {isSubmitting ? <LuLoaderCircle className="animate-spin" /> : <LuArrowRight />}
                                Join Session
                            </Button>
                        </HStack>
                    </Stack>
                </Card.Body>
            </Card.Root>
        </Frame>
    );
}

function InteractiveSessionPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as Partial<SessionRouteState> | null;
    const routeState = normalizeSessionState(locationState ?? readSessionState() ?? undefined);
    const isBaselineConversation = routeState?.mode === "baseline";

    useEffect(() => {
        if (!routeState) {
            navigate("/interactive/remote/join", { replace: true });
            return;
        }

        saveSessionState(routeState);
    }, [navigate, routeState]);

    const progressProcessorRef = useRef<(message: SSEEventMessage) => void>(() => undefined);
    const pendingProgressEventsRef = useRef<SSEEventMessage[]>([]);
    const isProgressProcessorReadyRef = useRef(false);
    const handleRawConversationEvent = useCallback((message: SSEEventMessage) => {
        if (!isProgressProcessorReadyRef.current) {
            pendingProgressEventsRef.current.push(message);
            if (pendingProgressEventsRef.current.length > 200) {
                pendingProgressEventsRef.current.shift();
            }
            return;
        }

        progressProcessorRef.current(message);
    }, []);

    const conversation = useInteractiveConversation({
        conversationId: routeState?.conversationId ?? "",
        clientId: routeState?.clientId ?? "",
        initialParticipants: routeState?.participants ?? [],
        onRawEvent: handleRawConversationEvent,
    });

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
    const [pinnedInsightIds, setPinnedInsightIds] = useState<Set<string>>(new Set());
    const [dismissedInsights, setDismissedInsights] = useState<DismissedInsight[]>([]);
    const [isTranscriptSidebarOpen, setIsTranscriptSidebarOpen] = useState(false);
    const [activeUrl, setActiveUrl] = useState<string | null>(null);
    const [focusInsightRequest, setFocusInsightRequest] = useState<{
        insightId: string;
        topicId: string | null;
        requestId: number;
    } | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [hasSttBeenActive, setHasSttBeenActive] = useState(false);
    const [isCcEnabled, setIsCcEnabled] = useState(false);
    const [hoveredControl, setHoveredControl] = useState<SessionHoverControl>(null);
    const [hoveredParticipantName, setHoveredParticipantName] = useState<string | null>(null);
    const [isLivekitConnected, setIsLivekitConnected] = useState(false);
    const [isMicEnabled, setIsMicEnabled] = useState(false);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const livekitRef = useRef<LiveKitConferenceHandle | null>(null);
    const [highlights, setHighlights] = useState({ topicIds: new Set<string>(), insightIds: new Set<string>() });
    const [pageLoadTime] = useState(() => new Date());
    const { track, consumeBatch } = useClickAnalytics({
        enabled: Boolean(routeState),
        appVersion: import.meta.env.VITE_APP_VERSION as string | undefined,
    });

    const trackAnalytics = useCallback((input: TrackAnalyticsInput) => {
        if (!routeState) return;

        track({
            ...input,
            metadata: {
                ...(input.metadata ?? {}),
                mode: "interactive_remote",
                conversation_id: routeState.conversationId,
                client_id: routeState.clientId,
            },
        });
    }, [routeState, track]);

    const { status: sttStatus, captionText, captionPhase, lastCommittedTranscript, stopStream } = useDeepgramStt({
        enabled: isListening,
        getAccessToken: async () => {
            if (!routeState) {
                throw new Error("Missing session state while requesting Deepgram token.");
            }

            if (import.meta.env.DEV) {
                console.info("[DG-TOKEN] RootApp requesting token", {
                    conversationId: routeState.conversationId,
                    clientId: routeState.clientId,
                });
            }

            const token = await createDeepgramTokenV2({
                conversationId: routeState.conversationId,
                clientId: routeState.clientId,
            });

            if (import.meta.env.DEV) {
                console.info("[DG-TOKEN] RootApp token received", {
                    expiresIn: token.expires_in,
                });
            }
            return token.access_token;
        },
        onTurnComplete: async (content) => {
            if (!routeState) return;

            try {
                const response = await enqueueTranscriptV2({
                    conversationId: routeState.conversationId,
                    clientId: routeState.clientId,
                    content,
                    speaker: routeState.speakerName,
                });
                if (import.meta.env.DEV) {
                    console.info("[PROGRESS-EVT] transcript queued", {
                        queueSize: response.queue_size,
                    });
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (import.meta.env.DEV) {
                    console.error("[PROGRESS-EVT] transcript queue failed", { message });
                }
                throw error;
            }
        },
    });

    useEffect(() => {
        if (sttStatus === "active") {
            setHasSttBeenActive(true);
        }
    }, [sttStatus]);

    const {
        activeToasts,
        insightBanners,
        dismissToast,
        dismissBanner,
        finalizeDismissToast,
        finalizeDismissBanner,
        processEvent,
    } = useProgressToast({ topics: conversation.topics });

    useEffect(() => {
        progressProcessorRef.current = (message: SSEEventMessage) => {
            const progressEvents = new Set([
                "insight_need_assessment",
                "topic_detector",
                "query_constructor",
                "query_updates",
                "retriever_planner",
                "insight_selector",
                "insight_generated",
                "chunk_complete",
            ]);

            if (!progressEvents.has(message.event)) return;
            if (!message.data || typeof message.data !== "object") return;

            if (import.meta.env.DEV) {
                const payload = message.data as Record<string, unknown>;
                console.info("[PROGRESS-EVT] workflow event", {
                    event: message.event,
                    chunkIndex: payload.chunk_index,
                    insightNeeded: payload.insight_needed,
                    generatorTypes: payload.generator_types,
                    hasInsight: Boolean(payload.insight),
                });
            }

            processEvent({
                event: message.event,
                data: message.data as {
                    chunk_index: number;
                    insight_needed?: boolean;
                    current_topic_id?: string;
                    created_topic?: { id: string; name: string };
                    queries?: Array<{ query_text: string }>;
                    retrieved_document_count?: number;
                    generator_types?: string[];
                    insight?: Insight;
                },
            });

            const payload = message.data as Record<string, unknown>;
            const topicId = typeof payload.current_topic_id === "string" ? payload.current_topic_id : null;
            if (message.event === "insight_generated") {
                const insight = payload.insight as { id?: string; thread?: { topic_id?: string } } | undefined;
                const targetTopicId = insight?.thread?.topic_id ?? topicId;
                const targetInsightId = insight?.id;

                if (targetTopicId) {
                    setHighlights((prev) => ({
                        ...prev,
                        topicIds: new Set([...prev.topicIds, targetTopicId]),
                    }));

                    setTimeout(() => {
                        setHighlights((prev) => {
                            const next = new Set(prev.topicIds);
                            next.delete(targetTopicId);
                            return { ...prev, topicIds: next };
                        });
                    }, 4000);
                }

                if (targetInsightId) {
                    setHighlights((prev) => ({
                        ...prev,
                        insightIds: new Set([...prev.insightIds, targetInsightId]),
                    }));

                    setTimeout(() => {
                        setHighlights((prev) => {
                            const next = new Set(prev.insightIds);
                            next.delete(targetInsightId);
                            return { ...prev, insightIds: next };
                        });
                    }, 4000);
                }
            }
        };

        isProgressProcessorReadyRef.current = true;
        const pending = pendingProgressEventsRef.current;
        if (pending.length > 0) {
            pending.forEach((queuedMessage) => progressProcessorRef.current(queuedMessage));
            pendingProgressEventsRef.current = [];
        }

        return () => {
            isProgressProcessorReadyRef.current = false;
            progressProcessorRef.current = () => undefined;
        };
    }, [processEvent]);

    const {
        seenInsightIds,
        registerRef: registerInsightRef,
        getUnseenCount,
        getElement: getInsightElement,
    } = useInsightVisibility();

    /* ──── server-curated shared state ──── */
    const isServerCurated = conversation.isServerCurated;

    const effectivePinnedIds = useMemo(() =>
        isServerCurated ? conversation.sharedPinnedInsightIds : pinnedInsightIds,
        [isServerCurated, conversation.sharedPinnedInsightIds, pinnedInsightIds]);

    /* Use local state as immediate source of truth for responsive deselect;
       sync from server state via effect below. */
    useEffect(() => {
        if (isServerCurated) {
            setSelectedInsightId(conversation.sharedSelectedInsightId);
        }
    }, [isServerCurated, conversation.sharedSelectedInsightId]);

    const effectiveSelectedId = selectedInsightId;

    const serverDismissedInsights = useMemo(() => {
        if (!isServerCurated) return [];
        return conversation.insights
            .filter((i) => conversation.sharedArchivedInsightIds.has(i.id))
            .map((insight) => ({
                insight,
                originalTopicId: insight.thread?.topic_id ?? "",
                topicName: conversation.topics.find((t) => t.id === insight.thread?.topic_id)?.name ?? "Unknown",
                dismissedAt: Date.now(),
            }));
    }, [isServerCurated, conversation.insights, conversation.sharedArchivedInsightIds, conversation.topics]);

    const effectiveDismissedInsights = isServerCurated ? serverDismissedInsights : dismissedInsights;

    const handlePinInsight = useCallback((insightId: string) => {
        if (isServerCurated && routeState) {
            const action = conversation.sharedPinnedInsightIds.has(insightId) ? "unpin" : "pin";
            void insightActionV2({ conversationId: routeState.conversationId, clientId: routeState.clientId, insightId, action });
            return;
        }
        setPinnedInsightIds((prev) => {
            const next = new Set(prev);
            if (next.has(insightId)) {
                next.delete(insightId);
            } else {
                next.add(insightId);
            }
            return next;
        });
    }, [isServerCurated, routeState, conversation.sharedPinnedInsightIds]);

    const handleDismissInsight = useCallback((insightId: string, topicId: string, topicName: string) => {
        if (isServerCurated && routeState) {
            void insightActionV2({ conversationId: routeState.conversationId, clientId: routeState.clientId, insightId, action: "archive" });
            return;
        }
        const insight = conversation.insights.find((item) => item.id === insightId);
        if (!insight) return;

        setDismissedInsights((prev) => [
            ...prev,
            {
                insight,
                originalTopicId: topicId,
                topicName,
                dismissedAt: Date.now(),
            },
        ]);
    }, [isServerCurated, routeState, conversation.insights]);

    const handleRestoreInsight = useCallback((insightId: string) => {
        if (isServerCurated && routeState) {
            void insightActionV2({ conversationId: routeState.conversationId, clientId: routeState.clientId, insightId, action: "unarchive" });
            return;
        }
        setDismissedInsights((prev) => prev.filter((item) => item.insight.id !== insightId));
    }, [isServerCurated, routeState]);

    const handleCitationClick = useCallback((url: string, context?: CitationClickContext) => {
        trackAnalytics({
            event_name: "insight_citation_clicked",
            target_type: "citation",
            target_id: context?.documentId,
            topic_id: context?.topicId,
            insight_id: context?.insightId,
            position_index: context?.citationNumber,
            url,
            surface: "insight_card",
        });
        setActiveUrl(url);
        setIsTranscriptSidebarOpen(true);
    }, [trackAnalytics]);

    const handleSelectInsight = useCallback((insightId: string | null) => {
        if (isServerCurated && routeState) {
            if (insightId) {
                void insightActionV2({ conversationId: routeState.conversationId, clientId: routeState.clientId, insightId, action: "select" });
            } else if (conversation.sharedSelectedInsightId) {
                void insightActionV2({
                    conversationId: routeState.conversationId,
                    clientId: routeState.clientId,
                    insightId: conversation.sharedSelectedInsightId,
                    action: "select",
                });
            }
        }
        setSelectedInsightId(insightId);
    }, [isServerCurated, routeState, conversation.sharedSelectedInsightId]);

    const handleExpandFromBanner = useCallback((banner: InsightBannerState) => {
        setIsSidebarCollapsed(false);
        setFocusInsightRequest({
            insightId: banner.insight.id,
            topicId: banner.topicId ?? banner.insight.thread?.topic_id ?? null,
            requestId: Date.now(),
        });
    }, []);

    /* ──── auto-reveal when server selects an insight ──── */
    const prevSharedSelectedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!isServerCurated) return;
        const newId = conversation.sharedSelectedInsightId;
        if (newId && newId !== prevSharedSelectedRef.current) {
            setIsSidebarCollapsed(false);
            if (conversation.sharedPinnedInsightIds.has(newId)) {
                prevSharedSelectedRef.current = newId;
                return;
            }
            const insight = conversation.insights.find((i) => i.id === newId);
            if (insight?.thread?.topic_id) {
                setFocusInsightRequest({ insightId: newId, topicId: insight.thread.topic_id, requestId: Date.now() });
            }
        }
        prevSharedSelectedRef.current = newId;
    }, [
        isServerCurated,
        conversation.sharedSelectedInsightId,
        conversation.sharedPinnedInsightIds,
        conversation.insights,
    ]);

    const overlayRight = isSidebarCollapsed
        ? "48px"
        : `${450 + (isTranscriptSidebarOpen ? 350 : 0)}px`;

    const dismissedIds = useMemo(() => {
        if (isServerCurated) return conversation.sharedArchivedInsightIds;
        return new Set(dismissedInsights.map((item) => item.insight.id));
    }, [isServerCurated, conversation.sharedArchivedInsightIds, dismissedInsights]);
    const activeInsights = useMemo(
        () => conversation.insights.filter((insight) => !dismissedIds.has(insight.id)),
        [conversation.insights, dismissedIds],
    );

    const leavingRef = useRef(false);

    const cleanupLocalSession = useCallback(() => {
        stopStream();

        try {
            livekitRef.current?.disconnect();
        } catch {
            // best effort
        }

        if (typeof document !== "undefined") {
            const mediaElements = document.querySelectorAll("video, audio");
            mediaElements.forEach((element) => {
                const mediaElement = element as HTMLMediaElement;
                const srcObject = mediaElement.srcObject;
                if (srcObject && srcObject instanceof MediaStream) {
                    srcObject.getTracks().forEach((track) => {
                        try {
                            track.stop();
                        } catch {
                            // best effort
                        }
                    });
                    mediaElement.srcObject = null;
                }
            });
        }
    }, [stopStream]);

    const leaveSession = useCallback(async (options?: { keepalive?: boolean; redirect?: boolean }) => {
        if (!routeState || leavingRef.current) return;
        leavingRef.current = true;
        const clickAnalytics = consumeBatch();

        try {
            if (options?.keepalive) {
                leaveConversationKeepalive({
                    conversationId: routeState.conversationId,
                    clientId: routeState.clientId,
                    clickAnalytics,
                });
                cleanupLocalSession();
            } else {
                cleanupLocalSession();
                await leaveConversationV2({
                    conversationId: routeState.conversationId,
                    clientId: routeState.clientId,
                    clickAnalytics,
                });
            }
        } finally {
            clearSessionState();
            if (options?.redirect) {
                navigate("/interactive/remote/join", { replace: true });
            }
        }
    }, [cleanupLocalSession, consumeBatch, navigate, routeState]);

    useEffect(() => {
        if (!routeState) return;

        const handleBrowserBack = () => {
            window.history.pushState({ sessionGuard: true }, "", window.location.pathname);
        };

        window.history.pushState({ sessionGuard: true }, "", window.location.pathname);
        window.addEventListener("popstate", handleBrowserBack);

        return () => {
            window.removeEventListener("popstate", handleBrowserBack);
        };
    }, [leaveSession, routeState]);

    useEffect(() => {
        const onPageHide = () => {
            void leaveSession({ keepalive: true, redirect: false });
        };

        window.addEventListener("pagehide", onPageHide);
        window.addEventListener("beforeunload", onPageHide);

        return () => {
            window.removeEventListener("pagehide", onPageHide);
            window.removeEventListener("beforeunload", onPageHide);
        };
    }, [leaveSession]);

    useEffect(() => {
        return () => {
            cleanupLocalSession();
        };
    }, [cleanupLocalSession]);

    const joinedAtMs = useMemo(() => {
        const parsed = routeState?.joinedAt ? Date.parse(routeState.joinedAt) : Number.NaN;
        return Number.isFinite(parsed) ? parsed : Date.now();
    }, [routeState?.joinedAt]);

    const oneHourDeadlineMs = joinedAtMs + MAX_SESSION_DURATION_MS;
    const unregisteredExpiryMs = useMemo(() => {
        if (!routeState?.expiresAt) return null;
        const parsed = Date.parse(routeState.expiresAt);
        return Number.isFinite(parsed) ? parsed : null;
    }, [routeState?.expiresAt]);

    const effectiveDeadlineMs = useMemo(() => {
        if (unregisteredExpiryMs !== null) {
            return Math.min(oneHourDeadlineMs, unregisteredExpiryMs);
        }
        return oneHourDeadlineMs;
    }, [oneHourDeadlineMs, unregisteredExpiryMs]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNowMs(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const autoLeaveTriggeredRef = useRef(false);
    useEffect(() => {
        if (!routeState || autoLeaveTriggeredRef.current) {
            return;
        }

        const leaveAt = effectiveDeadlineMs - AUTO_LEAVE_BUFFER_MS;
        const delay = leaveAt - Date.now();

        if (delay <= 0) {
            autoLeaveTriggeredRef.current = true;
            void leaveSession({ redirect: true });
            return;
        }

        const timeout = setTimeout(() => {
            autoLeaveTriggeredRef.current = true;
            void leaveSession({ redirect: true });
        }, delay);

        return () => clearTimeout(timeout);
    }, [effectiveDeadlineMs, leaveSession, routeState]);

    useEffect(() => {
        if (!conversation.error) {
            return;
        }

        const normalized = conversation.error.toLowerCase();
        const shouldLeave =
            normalized.includes("expired") ||
            normalized.includes("not found") ||
            normalized.includes("authorization") ||
            normalized.includes("invalid authorization") ||
            normalized.includes("missing or invalid authorization");

        if (shouldLeave) {
            void leaveSession({ redirect: true });
        }
    }, [conversation.error, leaveSession]);

    const remainingMs = Math.max(0, effectiveDeadlineMs - nowMs);
    const showUnregisteredTimer = Boolean(routeState && !routeState.isRegisteredConversation && routeState.expiresAt);
    const countdownMinutes = String(Math.floor(remainingMs / 60000)).padStart(2, "0");
    const countdownSeconds = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0");
    const isTimerWarning = remainingMs <= TIMER_WARNING_MS;
    const sttBootstrapping = isListening && !hasSttBeenActive && (sttStatus === "idle" || sttStatus === "starting" || sttStatus === "reconnecting");
    const showSessionBootstrapping = sttBootstrapping || !isLivekitConnected;

    if (!routeState) {
        return null;
    }

    return (
        <>
            {/* Bootstrapping overlay — shown while LiveKit + STT connect */}
            {showSessionBootstrapping && (
                <Box position="fixed" inset="0" zIndex="overlay" bg="bg">
                    <Frame
                        title="Connecting Session"
                        subtitle="Joining your conversation, connecting to video conference, and opening live transcription."
                    >
                        <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                            <Card.Body>
                                <Stack gap="3">
                                    <HStack gap="3">
                                        {isLivekitConnected ? (
                                            <Badge colorPalette="green" variant="subtle">Connected</Badge>
                                        ) : (
                                            <LuLoaderCircle className="animate-spin" />
                                        )}
                                        <Text>Connecting to video conference...</Text>
                                    </HStack>
                                    <HStack gap="3">
                                        {hasSttBeenActive ? (
                                            <Badge colorPalette="green" variant="subtle">Active</Badge>
                                        ) : (
                                            <LuLoaderCircle className="animate-spin" />
                                        )}
                                        <Text>Preparing speech transcription...</Text>
                                    </HStack>
                                </Stack>
                            </Card.Body>
                        </Card.Root>
                    </Frame>
                </Box>
            )}

            {/* Main session layout — always rendered so LiveKit stays mounted */}
            <Box height="100vh" overflow="hidden" bg="bg">
                <Flex height="100%">
                    <Box flex="1" height="100%" position="relative" bg="bg.subtle">
                        <LiveKitConference
                            ref={livekitRef}
                            conversationId={routeState.conversationId}
                            clientId={routeState.clientId}
                            speakerName={routeState.speakerName}
                            onConnected={() => setIsLivekitConnected(true)}
                            onMediaStateChange={({ isMicEnabled: mic, isCameraEnabled: cam }) => {
                                setIsMicEnabled(mic);
                                setIsCameraEnabled(cam);
                            }}
                            onError={() => {
                                // Dismiss overlay so user can see the error/retry UI in the video panel
                                setIsLivekitConnected(true);
                            }}
                            onDisconnected={() => {
                                if (!leavingRef.current) {
                                    void leaveSession({ redirect: true });
                                }
                            }}
                        />

                        <HStack position="absolute" left="5" top="5" gap="3" px="3" py="2" borderWidth="1px" borderColor="border.muted" borderRadius="xl" bg="bg.panel" shadow="md">
                            <AvatarGroup size="sm" spaceX="-4">
                                {conversation.participants.slice(0, 5).map((participant) => (
                                    <Avatar.Root
                                        key={`${participant.client_id}-${participant.speaker_name}`}
                                        onMouseEnter={() => setHoveredParticipantName(participant.speaker_name)}
                                        onMouseLeave={() => setHoveredParticipantName((prev) => (prev === participant.speaker_name ? null : prev))}
                                    >
                                        <Avatar.Fallback>{participant.speaker_name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                                    </Avatar.Root>
                                ))}
                            </AvatarGroup>
                            {hoveredParticipantName && (
                                <Text fontSize="sm" fontWeight="medium" maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                                    {hoveredParticipantName}
                                </Text>
                            )}
                            <Separator orientation="vertical" height="5" />
                            <VStack align="start" gap="0">
                                <HStack gap="1" css={{ "& > [data-debug-toggle]": { opacity: 0 }, "&:hover > [data-debug-toggle]": { opacity: 1 } }}>
                                    <Text fontSize="xs" color="fg.muted">Conversation</Text>
                                    <Box
                                        data-debug-toggle
                                        as="button"
                                        transition="opacity 0.2s"
                                        cursor="pointer"
                                        color={showDebugPanel ? "fg" : "fg.subtle"}
                                        _hover={{ color: "fg" }}
                                        display="inline-flex"
                                        alignItems="center"
                                        onClick={() => setShowDebugPanel((v) => !v)}
                                    >
                                        <LuBug size={12} />
                                    </Box>
                                </HStack>
                                <Text fontSize="sm" fontWeight="medium">{routeState.conversationId}</Text>
                            </VStack>
                        </HStack>

                        <SessionActionControls
                            isCcEnabled={isCcEnabled}
                            isTranscriptEnabled={isListening}
                            isTranscriptBusy={sttStatus === "starting" || sttStatus === "reconnecting"}
                            isMuted={!isMicEnabled}
                            isCameraOn={isCameraEnabled}
                            hoveredControl={hoveredControl}
                            onHoverControl={setHoveredControl}
                            onToggleCc={() => {
                                const next = !isCcEnabled;
                                trackAnalytics({
                                    event_name: "cc_toggled",
                                    target_type: "control",
                                    target_id: "closed_caption_toggle",
                                    surface: "video_controls",
                                    metadata: { enabled: next },
                                });
                                setIsCcEnabled(next);
                            }}
                            onToggleTranscript={() => {
                                const next = !isListening;
                                trackAnalytics({
                                    event_name: "transcription_toggled",
                                    target_type: "control",
                                    target_id: "transcription_toggle",
                                    surface: "video_controls",
                                    metadata: { enabled: next },
                                });
                                setIsListening(next);
                            }}
                            onToggleMute={() => {
                                void livekitRef.current?.toggleMic();
                            }}
                            onToggleCamera={() => {
                                void livekitRef.current?.toggleCamera();
                            }}
                            onLeave={() => {
                                trackAnalytics({
                                    event_name: "leave_clicked",
                                    target_type: "control",
                                    target_id: "leave_button",
                                    surface: "video_controls",
                                });
                                void leaveSession({ redirect: true });
                            }}
                        />

                        {showUnregisteredTimer && (
                            <HStack
                                position="absolute"
                                right="5"
                                bottom="5"
                                gap="2"
                                px="3"
                                py="2"
                                borderWidth="1px"
                                borderColor={isTimerWarning ? "orange.400" : "border.muted"}
                                borderRadius="xl"
                                bg="bg.panel"
                                shadow="md"
                            >
                                <Text fontSize="xs" color="fg.muted">Session time left</Text>
                                <Badge colorPalette={isTimerWarning ? "orange" : "blue"}>
                                    {countdownMinutes}:{countdownSeconds}
                                </Badge>
                            </HStack>
                        )}

                        {isCcEnabled && captionText && (
                            <Box
                                position="absolute"
                                left="50%"
                                transform="translateX(-50%)"
                                bottom="calc(3.5rem + 30px)"
                                maxW="min(900px, 80vw)"
                                px="4"
                                py="2"
                                borderRadius="md"
                                bg={captionPhase === "interim" ? "gray.600" : "blackAlpha.700"}
                                backdropFilter="blur(6px)"
                                borderWidth="1px"
                                borderColor={captionPhase === "interim" ? "gray.500" : "whiteAlpha.300"}
                                zIndex="2"
                                pointerEvents="none"
                            >
                                <Text color={captionPhase === "interim" ? "gray.100" : "white"} fontSize="sm" textAlign="center" lineHeight="tall">
                                    {captionText}
                                </Text>
                            </Box>
                        )}

                        {showDebugPanel && (
                            <HStack position="absolute" left="5" top="20" gap="2" px="3" py="2" borderWidth="1px" borderColor="border.muted" borderRadius="xl" bg="bg.panel" shadow="md">
                                <Badge colorPalette={conversation.connectionStatus === "connected" ? "green" : conversation.connectionStatus === "error" ? "red" : "yellow"}>
                                    {conversation.connectionStatus}
                                </Badge>
                                <Badge colorPalette={sttStatus === "active" ? "green" : sttStatus === "error" ? "red" : "gray"}>
                                    STT: {sttStatus}
                                </Badge>
                                {lastCommittedTranscript && (
                                    <Badge colorPalette="blue" maxW="260px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                                        Last turn queued
                                    </Badge>
                                )}
                                {conversation.error && (
                                    <Badge colorPalette="red" maxW="360px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                                        {conversation.error}
                                    </Badge>
                                )}
                            </HStack>
                        )}
                    </Box>

                    <InsightsSidebar
                        topics={conversation.topics}
                        insights={activeInsights}
                        loadingInsights={[]}
                        currentTopicId={conversation.currentTopicId}
                        highlights={highlights}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
                        pinnedInsightIds={effectivePinnedIds}
                        onPinInsight={handlePinInsight}
                        onDismissInsight={handleDismissInsight}
                        dismissedInsights={effectiveDismissedInsights}
                        onRestoreInsight={handleRestoreInsight}
                        selectedInsightId={effectiveSelectedId}
                        onSelectInsight={handleSelectInsight}
                        onCitationClick={handleCitationClick}
                        chunks={conversation.chunks}
                        chunkToTopicMap={conversation.chunkToTopicMap}
                        insightToChunkMap={conversation.insightToChunkMap}
                        topicToChunksMap={conversation.topicToChunksMap}
                        visibleChunkIndices={conversation.visibleChunkIndices}
                        isTranscriptSidebarOpen={isTranscriptSidebarOpen}
                        onToggleTranscriptSidebar={() => setIsTranscriptSidebarOpen((prev) => !prev)}
                        activeUrl={activeUrl}
                        onCloseUrl={() => setActiveUrl(null)}
                        pageLoadTime={pageLoadTime}
                        focusInsightRequest={focusInsightRequest}
                        onFocusHandled={() => setFocusInsightRequest(null)}
                        seenInsightIds={seenInsightIds}
                        registerInsightRef={registerInsightRef}
                        getUnseenCount={getUnseenCount}
                        getInsightElement={getInsightElement}
                        isInteractiveTabsEnabled
                        showInsightsTab={!isBaselineConversation}
                        conversationId={routeState.conversationId}
                        clientId={routeState.clientId}
                        isExplainEnabled={!isBaselineConversation}
                        onTrackEvent={trackAnalytics}
                    />
                </Flex>

                {(activeToasts.length > 0 || insightBanners.length > 0) && (
                    <Box
                        position="fixed"
                        top="4"
                        right={overlayRight}
                        zIndex="toast"
                        display="flex"
                        flexDirection="column"
                        gap="2"
                        maxH="calc(100vh - 32px)"
                        overflowY="auto"
                        pointerEvents="none"
                        css={{
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        {activeToasts.map((toast) => (
                            <AnimatedNotificationItem
                                key={toast.id}
                                lifecycle={toast.lifecycle}
                                width={NOTIFICATION_WIDTH}
                                onRequestDismiss={() => dismissToast(toast.id)}
                                onFinalizeDismiss={() => finalizeDismissToast(toast.id)}
                            >
                                <ProgressToast
                                    toast={toast}
                                    onDismiss={() => dismissToast(toast.id)}
                                    onDismissClick={() =>
                                        trackAnalytics({
                                            event_name: "insight_toast_dismissed",
                                            target_type: "toast",
                                            target_id: toast.id,
                                            topic_id: toast.topicId ?? undefined,
                                            surface: "progress_toast",
                                        })
                                    }
                                />
                            </AnimatedNotificationItem>
                        ))}
                        {insightBanners.map((banner) => (
                            <AnimatedNotificationItem
                                key={banner.id}
                                lifecycle={banner.lifecycle}
                                width={NOTIFICATION_WIDTH}
                                cancelClickOnDrag
                                onRequestDismiss={() => dismissBanner(banner.id)}
                                onFinalizeDismiss={() => finalizeDismissBanner(banner.id)}
                            >
                                <InsightBanner
                                    banner={banner}
                                    onDismiss={() => dismissBanner(banner.id)}
                                    onExpand={handleExpandFromBanner}
                                    onDismissClick={() =>
                                        trackAnalytics({
                                            event_name: "insight_toast_dismissed",
                                            target_type: "banner",
                                            target_id: banner.id,
                                            topic_id: banner.topicId ?? banner.insight.thread?.topic_id,
                                            insight_id: banner.insight.id,
                                            surface: "insight_banner",
                                        })
                                    }
                                    onExpandClick={() =>
                                        trackAnalytics({
                                            event_name: "insight_banner_expanded",
                                            target_type: "banner",
                                            target_id: banner.id,
                                            topic_id: banner.topicId ?? banner.insight.thread?.topic_id,
                                            insight_id: banner.insight.id,
                                            surface: "insight_banner",
                                        })
                                    }
                                />
                            </AnimatedNotificationItem>
                        ))}
                    </Box>
                )}

            </Box>
        </>
    );
}

function DemoPage() {
    const navigate = useNavigate();

    return (
        <DemoApp
            onBack={() => navigate("/")}
        />
    );
}

function TransitionedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
            >
                <Routes location={location}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/interactive/study-setting" element={<ScenarioPage />} />
                    <Route path="/interactive/remote/join" element={<JoinPage />} />
                    <Route path="/interactive/remote/session" element={<InteractiveSessionPage />} />
                    <Route path="/interactive/colocated/join" element={<ColocatedJoinPage />} />
                    <Route path="/interactive/colocated/enroll" element={<SpeakerEnrollmentPage />} />
                    <Route path="/interactive/colocated/session" element={<ColocatedSessionPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

export function RootApp() {
    return (
        <BrowserRouter>
            <TransitionedRoutes />
        </BrowserRouter>
    );
}
