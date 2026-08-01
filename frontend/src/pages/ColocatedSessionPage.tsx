import {
    Avatar,
    AvatarGroup,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Container,
    Flex,
    HStack,
    Separator,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";
import { motion, useMotionValue } from "motion/react";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    LuAudioLines,
    LuBug,
    LuCaptions,
    LuCaptionsOff,
    LuLoaderCircle,
    LuLogOut,
} from "react-icons/lu";

import { ColorModeToggle } from "@/components/ColorModeToggle";
import { Tooltip } from "@/components/ui/tooltip";
import { InsightBanner } from "@/components/InsightBanner";
import { InsightsSidebar } from "@/components/InsightsSidebar";
import { ProgressToast } from "@/components/ProgressToast";
import MacOSDesktop from "@/components/MacOSDesktop";
import { useSpeechmaticsStt } from "@/hooks/useSpeechmaticsStt";
import { useInsightVisibility } from "@/hooks/useInsightVisibility";
import { useInteractiveConversation } from "@/hooks/useInteractiveConversation";
import { useClickAnalytics, type TrackAnalyticsInput } from "@/hooks/useClickAnalytics";
import { useProgressToast } from "@/hooks/useProgressToast";
import {
    createSpeechmaticsTokenV2,
    enqueueTranscriptV2,
    insightActionV2,
    leaveConversationKeepalive,
    leaveConversationV2,
    type SSEEventMessage,
} from "@/services/v2Api";
import type { DismissedInsight, Insight } from "@/types";
import type { InsightBannerState } from "@/types/progressToast";
import type { CitationClickContext } from "@/utils/parseCitations";
import type { ColocatedRouteState } from "@/pages/colocatedTypes";
import {
    normalizeColocatedSessionState,
    readColocatedSessionState,
    saveColocatedSessionState,
    clearColocatedSessionState,
} from "@/pages/colocatedTypes";

/* ─────────────── constants ─────────────── */

const NOTIFICATION_WIDTH = 400;
const DRAG_DISMISS_RATIO = 0.4;
const MAX_SESSION_DURATION_MS = 60 * 60 * 1000;
const AUTO_LEAVE_BUFFER_MS = 10 * 1000;
const TIMER_WARNING_MS = 2 * 60 * 1000;

/* ─────────────── helpers ─────────────── */

function Frame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
    return (
        <Center minH="100vh" bg="bg">
            <Container maxW="4xl" py="10">
                <Stack gap="8">
                    <HStack justify="space-between" align="start">
                        <Stack gap="2">
                            <Text fontSize="4xl" fontWeight="bold">{title}</Text>
                            <Text color="fg.muted" maxW="2xl">{subtitle}</Text>
                        </Stack>
                        <ColorModeToggle size="sm" />
                    </HStack>
                    {children}
                </Stack>
            </Container>
        </Center>
    );
}

/* ── Drag-to-dismiss notification wrapper (same as RootApp) ── */

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
            style={{ x, width: `${width}px`, pointerEvents: "auto" }}
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={lifecycle === "exiting" ? { opacity: 0, x: 120, scale: 0.98 } : { opacity: 1, x: 0, scale: 1 }}
            transition={lifecycle === "exiting" ? { duration: 0.26, ease: [0.4, 0, 1, 1] } : { type: "spring", stiffness: 260, damping: 30, mass: 1.0 }}
            drag="x"
            dragMomentum={false}
            dragElastic={0.3}
            dragConstraints={{ left: 0, right: 0 }}
            onDrag={(_, info) => {
                if (info.offset.x < 0) { x.set(0); return; }
                if (info.offset.x > 6) setDidDrag(true);
            }}
            onDragEnd={(_, info) => {
                if (info.offset.x >= width * DRAG_DISMISS_RATIO) { onRequestDismiss(); return; }
                setDidDrag(false);
            }}
            onClickCapture={(event) => {
                if (cancelClickOnDrag && didDrag) { event.preventDefault(); event.stopPropagation(); setDidDrag(false); }
            }}
            onAnimationComplete={() => { if (lifecycle === "exiting") onFinalizeDismiss(); }}
        >
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   ▌  ColocatedSessionPage
   ═══════════════════════════════════════ */

export default function ColocatedSessionPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as Partial<ColocatedRouteState> | null;
    const routeState = useMemo(
        () => normalizeColocatedSessionState(locationState ?? readColocatedSessionState() ?? undefined),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const isBaselineConversation = routeState?.mode === "baseline";

    /* ──── redirect if state missing ──── */
    useEffect(() => {
        if (!routeState) {
            navigate("/interactive/colocated/join", { replace: true });
            return;
        }
        saveColocatedSessionState(routeState);
    }, [navigate, routeState]);

    /* ──── SSE event buffering for progress toast ──── */
    const progressProcessorRef = useRef<(message: SSEEventMessage) => void>(() => undefined);
    const pendingProgressEventsRef = useRef<SSEEventMessage[]>([]);
    const isProgressProcessorReadyRef = useRef(false);
    const handleRawConversationEvent = useCallback((message: SSEEventMessage) => {
        if (!isProgressProcessorReadyRef.current) {
            pendingProgressEventsRef.current.push(message);
            if (pendingProgressEventsRef.current.length > 200) pendingProgressEventsRef.current.shift();
            return;
        }
        progressProcessorRef.current(message);
    }, []);

    /* ──── interactive conversation hook ──── */
    const conversation = useInteractiveConversation({
        conversationId: routeState?.conversationId ?? "",
        clientId: routeState?.clientId ?? "",
        initialParticipants: routeState?.participants ?? [],
        onRawEvent: handleRawConversationEvent,
    });

    /* ──── local UI state ──── */
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
    const [showTranscriptHint, setShowTranscriptHint] = useState(true);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [hasSttBeenActive, setHasSttBeenActive] = useState(false);
    const [isCcEnabled, setIsCcEnabled] = useState(false);
    const [hoveredControl, setHoveredControl] = useState<"cc" | "listen" | "leave" | null>(null);
    const [hoveredParticipantName, setHoveredParticipantName] = useState<string | null>(null);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [highlights, setHighlights] = useState({ topicIds: new Set<string>(), insightIds: new Set<string>() });
    const [pageLoadTime] = useState(() => new Date());

    /* ──── analytics ──── */
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
                mode: "interactive_colocated",
                conversation_id: routeState.conversationId,
                client_id: routeState.clientId,
            },
        });
    }, [routeState, track]);

    /* ──── Speechmatics STT ──── */
    const {
        status: sttStatus,
        captionText,
        captionPhase,
        lastCommittedTranscript,
        currentSpeaker,
        stopStream,
    } = useSpeechmaticsStt({
        enabled: isListening,
        enrolledSpeakers: routeState?.enrolledSpeakers ?? [],
        getAccessToken: async () => {
            if (!routeState) throw new Error("Missing session state while requesting Speechmatics token.");
            const token = await createSpeechmaticsTokenV2({
                conversationId: routeState.conversationId,
                clientId: routeState.clientId,
                ttlSeconds: 120,
            });
            return token.key_value;
        },
        onTurnComplete: async (content, speaker) => {
            if (!routeState) return;
            try {
                const speakerLabel = speaker ?? routeState.speakerNames[0] ?? "Unknown";
                const response = await enqueueTranscriptV2({
                    conversationId: routeState.conversationId,
                    clientId: routeState.clientId,
                    content,
                    speaker: speakerLabel,
                });
                if (import.meta.env.DEV) {
                    console.info("[PROGRESS-EVT] transcript queued", { queueSize: response.queue_size, speaker: speakerLabel });
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (import.meta.env.DEV) console.error("[PROGRESS-EVT] transcript queue failed", { message });
                throw error;
            }
        },
    });

    useEffect(() => {
        if (sttStatus === "active") setHasSttBeenActive(true);
    }, [sttStatus]);

    /* ──── progress toast ──── */
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
                    setHighlights((prev) => ({ ...prev, topicIds: new Set([...prev.topicIds, targetTopicId]) }));
                    setTimeout(() => setHighlights((prev) => { const next = new Set(prev.topicIds); next.delete(targetTopicId); return { ...prev, topicIds: next }; }), 4000);
                }
                if (targetInsightId) {
                    setHighlights((prev) => ({ ...prev, insightIds: new Set([...prev.insightIds, targetInsightId]) }));
                    setTimeout(() => setHighlights((prev) => { const next = new Set(prev.insightIds); next.delete(targetInsightId); return { ...prev, insightIds: next }; }), 4000);
                }
            }
        };

        isProgressProcessorReadyRef.current = true;
        const pending = pendingProgressEventsRef.current;
        if (pending.length > 0) {
            pending.forEach((q) => progressProcessorRef.current(q));
            pendingProgressEventsRef.current = [];
        }

        return () => { isProgressProcessorReadyRef.current = false; progressProcessorRef.current = () => undefined; };
    }, [processEvent]);

    /* ──── insight visibility tracking ──── */
    const { seenInsightIds, registerRef: registerInsightRef, getUnseenCount, getElement: getInsightElement } = useInsightVisibility();

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
        setPinnedInsightIds((prev) => { const next = new Set(prev); if (next.has(insightId)) next.delete(insightId); else next.add(insightId); return next; });
    }, [isServerCurated, routeState, conversation.sharedPinnedInsightIds]);

    const handleDismissInsight = useCallback((insightId: string, topicId: string, topicName: string) => {
        if (isServerCurated && routeState) {
            void insightActionV2({ conversationId: routeState.conversationId, clientId: routeState.clientId, insightId, action: "archive" });
            return;
        }
        const insight = conversation.insights.find((item) => item.id === insightId);
        if (!insight) return;
        setDismissedInsights((prev) => [...prev, { insight, originalTopicId: topicId, topicName, dismissedAt: Date.now() }]);
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
        setFocusInsightRequest({ insightId: banner.insight.id, topicId: banner.topicId ?? banner.insight.thread?.topic_id ?? null, requestId: Date.now() });
        // Only select the insight — do NOT open the transcript sidebar
        setSelectedInsightId(banner.insight.id);
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

    const overlayRight = isSidebarCollapsed ? "48px" : `${450 + (isTranscriptSidebarOpen ? 350 : 0)}px`;
    const dismissedIds = useMemo(() => {
        if (isServerCurated) return conversation.sharedArchivedInsightIds;
        return new Set(dismissedInsights.map((item) => item.insight.id));
    }, [isServerCurated, conversation.sharedArchivedInsightIds, dismissedInsights]);
    const activeInsights = useMemo(() => conversation.insights.filter((insight) => !dismissedIds.has(insight.id)), [conversation.insights, dismissedIds]);

    /* ──── leave session ──── */
    const leavingRef = useRef(false);

    const cleanupLocalSession = useCallback(() => {
        stopStream();
        if (typeof document !== "undefined") {
            const mediaElements = document.querySelectorAll("video, audio");
            mediaElements.forEach((element) => {
                const el = element as HTMLMediaElement;
                const srcObj = el.srcObject;
                if (srcObj && srcObj instanceof MediaStream) {
                    srcObj.getTracks().forEach((t) => { try { t.stop(); } catch { /* best effort */ } });
                    el.srcObject = null;
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
                leaveConversationKeepalive({ conversationId: routeState.conversationId, clientId: routeState.clientId, clickAnalytics });
                cleanupLocalSession();
            } else {
                cleanupLocalSession();
                await leaveConversationV2({ conversationId: routeState.conversationId, clientId: routeState.clientId, clickAnalytics });
            }
        } finally {
            clearColocatedSessionState();
            if (options?.redirect) navigate("/interactive/colocated/join", { replace: true });
        }
    }, [cleanupLocalSession, consumeBatch, navigate, routeState]);

    /* ──── browser back / pagehide guards ──── */
    useEffect(() => {
        if (!routeState) return;
        const handleBrowserBack = () => {
            window.history.pushState({ sessionGuard: true }, "", window.location.pathname);
        };
        window.history.pushState({ sessionGuard: true }, "", window.location.pathname);
        window.addEventListener("popstate", handleBrowserBack);
        return () => window.removeEventListener("popstate", handleBrowserBack);
    }, [leaveSession, routeState]);

    useEffect(() => {
        const onPageHide = () => { void leaveSession({ keepalive: true, redirect: false }); };
        window.addEventListener("pagehide", onPageHide);
        window.addEventListener("beforeunload", onPageHide);
        return () => { window.removeEventListener("pagehide", onPageHide); window.removeEventListener("beforeunload", onPageHide); };
    }, [leaveSession]);

    useEffect(() => { return () => { cleanupLocalSession(); }; }, [cleanupLocalSession]);

    /* ──── session timer ──── */
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
        if (unregisteredExpiryMs !== null) return Math.min(oneHourDeadlineMs, unregisteredExpiryMs);
        return oneHourDeadlineMs;
    }, [oneHourDeadlineMs, unregisteredExpiryMs]);

    useEffect(() => { const interval = setInterval(() => setNowMs(Date.now()), 1000); return () => clearInterval(interval); }, []);

    const autoLeaveTriggeredRef = useRef(false);
    useEffect(() => {
        if (!routeState || autoLeaveTriggeredRef.current) return;
        const leaveAt = effectiveDeadlineMs - AUTO_LEAVE_BUFFER_MS;
        const delay = leaveAt - Date.now();
        if (delay <= 0) { autoLeaveTriggeredRef.current = true; void leaveSession({ redirect: true }); return; }
        const timeout = setTimeout(() => { autoLeaveTriggeredRef.current = true; void leaveSession({ redirect: true }); }, delay);
        return () => clearTimeout(timeout);
    }, [effectiveDeadlineMs, leaveSession, routeState]);

    useEffect(() => {
        if (!conversation.error) return;
        const normalized = conversation.error.toLowerCase();
        const shouldLeave = normalized.includes("expired") || normalized.includes("not found") || normalized.includes("authorization") || normalized.includes("missing or invalid authorization");
        if (shouldLeave) void leaveSession({ redirect: true });
    }, [conversation.error, leaveSession]);

    const remainingMs = Math.max(0, effectiveDeadlineMs - nowMs);
    const showUnregisteredTimer = Boolean(routeState && !routeState.isRegisteredConversation && routeState.expiresAt);
    const countdownMinutes = String(Math.floor(remainingMs / 60000)).padStart(2, "0");
    const countdownSeconds = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, "0");
    const isTimerWarning = remainingMs <= TIMER_WARNING_MS;

    const sttBootstrapping = isListening && !hasSttBeenActive && (sttStatus === "idle" || sttStatus === "starting" || sttStatus === "reconnecting");

    if (!routeState) return null;

    /* ═══════════════════  RENDER  ═══════════════════ */
    return (
        <>
            {/* Bootstrapping overlay */}
            {sttBootstrapping && (
                <Box position="fixed" inset="0" zIndex="overlay" bg="bg">
                    <Frame title="Connecting Session" subtitle="Joining your conversation and opening live transcription.">
                        <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                            <Card.Body>
                                <Stack gap="3">
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

            {/* Main session layout */}
            <Box height="100vh" overflow="hidden" bg="bg">
                <Flex height="100%">
                    {/* ── Left panel: macOS desktop replica with session overlays ── */}
                    <Box flex="1" height="100%" position="relative" overflow="hidden">
                        {/* macOS Desktop Replica */}
                        <MacOSDesktop />

                        {/* Top-left: participants + conversation info overlay */}
                        <HStack position="absolute" left="5" top="36px" gap="3" px="3" py="2" borderWidth="1px" borderColor="border.muted" borderRadius="xl" bg="bg.panel" shadow="md" zIndex="1">
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

                        {/* Session controls (top center, below macOS menu bar) */}
                        <HStack position="absolute" left="50%" transform="translateX(-50%)" top="36px" gap="2" zIndex="1">
                            <Button
                                size="md"
                                colorPalette={isCcEnabled ? "blue" : "gray"}
                                variant={isCcEnabled ? "solid" : "surface"}
                                minW={hoveredControl === "cc" ? "126px" : "44px"}
                                px="3"
                                overflow="hidden"
                                justifyContent="flex-start"
                                transition="all 0.2s ease"
                                onMouseEnter={() => setHoveredControl("cc")}
                                onMouseLeave={() => setHoveredControl((p) => (p === "cc" ? null : p))}
                                onClick={() => { trackAnalytics({ event_name: "cc_toggled", target_type: "control", target_id: "closed_caption_toggle", surface: "video_controls", metadata: { enabled: !isCcEnabled } }); setIsCcEnabled((v) => !v); }}
                            >
                                {isCcEnabled ? <LuCaptions /> : <LuCaptionsOff />}
                                <Text ml="2" whiteSpace="nowrap" opacity={hoveredControl === "cc" ? 1 : 0} maxW={hoveredControl === "cc" ? "90px" : "0"} overflow="hidden" transition="all 0.2s ease">
                                    {isCcEnabled ? "CC On" : "CC Off"}
                                </Text>
                            </Button>

                            <Tooltip
                                open={showTranscriptHint || undefined}
                                disabled={!showTranscriptHint}
                                content="Press this button to start the conversation"
                                showArrow
                                positioning={{ placement: "bottom" }}
                            >
                                <Button
                                    size="md"
                                    colorPalette={isListening ? "blue" : "gray"}
                                    variant={isListening ? "solid" : "surface"}
                                    minW={hoveredControl === "listen" ? "170px" : "44px"}
                                    px="3"
                                    overflow="hidden"
                                    justifyContent="flex-start"
                                    transition="all 0.2s ease"
                                    onMouseEnter={() => setHoveredControl("listen")}
                                    onMouseLeave={() => setHoveredControl((p) => (p === "listen" ? null : p))}
                                    disabled={sttStatus === "starting" || sttStatus === "reconnecting"}
                                    onClick={() => { setShowTranscriptHint(false); trackAnalytics({ event_name: "transcription_toggled", target_type: "control", target_id: "transcription_toggle", surface: "video_controls", metadata: { enabled: !isListening } }); setIsListening((v) => !v); }}
                                >
                                    <LuAudioLines />
                                    <Text ml="2" whiteSpace="nowrap" opacity={hoveredControl === "listen" ? 1 : 0} maxW={hoveredControl === "listen" ? "130px" : "0"} overflow="hidden" transition="all 0.2s ease">
                                        {isListening ? "Transcription On" : "Transcription Off"}
                                    </Text>
                                </Button>
                            </Tooltip>

                            <Button
                                size="md"
                                colorPalette="red"
                                variant="solid"
                                minW={hoveredControl === "leave" ? "96px" : "44px"}
                                px="3"
                                overflow="hidden"
                                justifyContent="flex-start"
                                transition="all 0.2s ease"
                                onMouseEnter={() => setHoveredControl("leave")}
                                onMouseLeave={() => setHoveredControl((p) => (p === "leave" ? null : p))}
                                onClick={() => { trackAnalytics({ event_name: "leave_clicked", target_type: "control", target_id: "leave_button", surface: "video_controls" }); void leaveSession({ redirect: true }); }}
                            >
                                <LuLogOut />
                                <Text ml="2" whiteSpace="nowrap" opacity={hoveredControl === "leave" ? 1 : 0} maxW={hoveredControl === "leave" ? "60px" : "0"} overflow="hidden" transition="all 0.2s ease">
                                    Leave
                                </Text>
                            </Button>
                        </HStack>

                        {/* Timer */}
                        {showUnregisteredTimer && (
                            <HStack position="absolute" right="5" top="36px" gap="2" px="3" py="2" borderWidth="1px" borderColor={isTimerWarning ? "orange.400" : "border.muted"} borderRadius="xl" bg="bg.panel" shadow="md" zIndex="1">
                                <Text fontSize="xs" color="fg.muted">Session time left</Text>
                                <Badge colorPalette={isTimerWarning ? "orange" : "blue"}>{countdownMinutes}:{countdownSeconds}</Badge>
                            </HStack>
                        )}

                        {/* Closed captions */}
                        {isCcEnabled && captionText && (
                            <Box
                                position="absolute"
                                left="50%"
                                transform="translateX(-50%)"
                                bottom="90px"
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
                                    {currentSpeaker && <Text as="span" fontWeight="bold" color="teal.200" mr="2">[{currentSpeaker}]</Text>}
                                    {captionText}
                                </Text>
                            </Box>
                        )}

                        {/* Debug status badges */}
                        {showDebugPanel && (
                            <HStack position="absolute" left="5" top="92px" gap="2" px="3" py="2" borderWidth="1px" borderColor="border.muted" borderRadius="xl" bg="bg.panel" shadow="md" zIndex="1">
                                <Badge colorPalette={conversation.connectionStatus === "connected" ? "green" : conversation.connectionStatus === "error" ? "red" : "yellow"}>
                                    {conversation.connectionStatus}
                                </Badge>
                                <Badge colorPalette={sttStatus === "active" ? "green" : sttStatus === "error" ? "red" : "gray"}>
                                    STT: {sttStatus}
                                </Badge>
                                {lastCommittedTranscript && (
                                    <Badge colorPalette="blue" maxW="260px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">Last turn queued</Badge>
                                )}
                                {conversation.error && (
                                    <Badge colorPalette="red" maxW="360px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{conversation.error}</Badge>
                                )}
                            </HStack>
                        )}
                    </Box>

                    {/* ── Right: Insights sidebar ── */}
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

                {/* Notification toasts & banners */}
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
                        css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
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
                                    onDismissClick={() => trackAnalytics({ event_name: "insight_toast_dismissed", target_type: "toast", target_id: toast.id, topic_id: toast.topicId ?? undefined, surface: "progress_toast" })}
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
                                    onDismissClick={() => trackAnalytics({ event_name: "insight_toast_dismissed", target_type: "banner", target_id: banner.id, topic_id: banner.topicId ?? banner.insight.thread?.topic_id, insight_id: banner.insight.id, surface: "insight_banner" })}
                                    onExpandClick={() => trackAnalytics({ event_name: "insight_banner_expanded", target_type: "banner", target_id: banner.id, topic_id: banner.topicId ?? banner.insight.thread?.topic_id, insight_id: banner.insight.id, surface: "insight_banner" })}
                                />
                            </AnimatedNotificationItem>
                        ))}
                    </Box>
                )}
            </Box>
        </>
    );
}
