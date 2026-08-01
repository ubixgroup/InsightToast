"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Button,
    Card,
    Flex,
    HStack,
    Icon,
    IconButton,
    Input,
    Link,
    Spinner,
    Stack,
    Textarea,
    Text,
    Collapsible,
    Span,
    Image,
} from "@chakra-ui/react";
import {
    LuBookOpen,
    LuBot,
    LuPanelRightClose,
    LuPanelRightOpen,
    LuArchive,
    LuUndo2,
    LuChevronDown,
    LuChevronRight,
    LuGlobe,
    LuMessageSquare,
    LuSendHorizontal,
    LuSearch,
    LuPin,
} from "react-icons/lu";
import { TopicItem } from "./TopicItem";
import { TextInsightCard } from "./TextInsightCard";
import { VizInsightCard } from "./VizInsightCard";
import { TranscriptSidebar } from "./TranscriptSidebar";
import ReactMarkdown from "react-markdown";
import { chatWithClientV2, searchKnowledgeBaseV2 } from "@/services/v2Api";
import { formatTimestamp, getInsightDisplayTime } from "@/utils/formatTimestamp";
import type { KbSearchResult } from "@/services/v2Api";
import type { TrackAnalyticsInput } from "@/hooks/useClickAnalytics";
import type { CitationClickContext } from "@/utils/parseCitations";
import type {
    Topic,
    Insight,
    LoadingInsight,
    HighlightState,
    DismissedInsight,
    Chunk,
} from "@/types";

interface InsightsSidebarProps {
    topics: Topic[];
    insights: Insight[];
    loadingInsights: LoadingInsight[];
    currentTopicId: string | null;
    highlights: HighlightState;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    // Pin/dismiss props
    pinnedInsightIds: Set<string>;
    onPinInsight: (insightId: string) => void;
    onDismissInsight: (insightId: string, topicId: string, topicName: string) => void;
    dismissedInsights: DismissedInsight[];
    onRestoreInsight: (insightId: string) => void;
    // Selection props
    selectedInsightId: string | null;
    onSelectInsight: (insightId: string | null) => void;
    // Citation click
    onCitationClick: (url: string, context?: CitationClickContext) => void;
    // Transcript sidebar props
    chunks: Chunk[];
    chunkToTopicMap: Map<number, string>;
    insightToChunkMap: Map<string, number>;
    topicToChunksMap: Map<string, number[]>;
    visibleChunkIndices: Set<number>;
    isTranscriptSidebarOpen: boolean;
    onToggleTranscriptSidebar: () => void;
    activeUrl: string | null;
    onCloseUrl: () => void;
    onSourcePreviewExpandChange?: (expanded: boolean) => void;
    pageLoadTime: Date;
    // Focus navigation from progress banners
    focusInsightRequest: { insightId: string; topicId: string | null; requestId: number } | null;
    onFocusHandled: () => void;
    // Seen tracking props
    seenInsightIds: Set<string>;
    registerInsightRef: (insightId: string, element: HTMLElement | null) => void;
    getUnseenCount: (insightIds: string[]) => number;
    // Scroll-to-insight support
    getInsightElement?: (insightId: string) => HTMLElement | null;
    isInteractiveTabsEnabled?: boolean;
    showInsightsTab?: boolean;
    conversationId?: string | null;
    clientId?: string | null;
    isExplainEnabled?: boolean;
    onTrackEvent?: (input: TrackAnalyticsInput) => void;
    chatPresetMessages?: Array<{ role: "user" | "assistant"; content: string }>;
    isChatReadOnly?: boolean;
    onOnboardingEvent?: (event: { type: string; payload?: Record<string, string | number | boolean> }) => void;
    onboardingPhase?: string;
    onboardingForceCollapseChartsToken?: number;
}

type PrimarySidebarTab = "insights" | "kb-search" | "chat" | "google";

interface SidebarTabDef {
    key: PrimarySidebarTab;
    label: string;
    icon: typeof LuBookOpen;
}

const INTERACTIVE_TABS: SidebarTabDef[] = [
    { key: "insights", label: "Insights", icon: LuBookOpen },
    { key: "kb-search", label: "KB Search", icon: LuSearch },
    { key: "chat", label: "Chat", icon: LuBot },
    { key: "google", label: "Google", icon: LuGlobe },
];

const INSIGHTS_TAB_ICON_SRC = "/insight-toast-icon.svg";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

const GOOGLE_SEARCH_ORIGIN = "https://www.google.com";
const EMPTY_CHAT_PRESET_MESSAGES: Array<{ role: "user" | "assistant"; content: string }> = [];

export function InsightsSidebar({
    topics,
    insights,
    loadingInsights,
    currentTopicId,
    highlights,
    isCollapsed,
    onToggleCollapse,
    pinnedInsightIds,
    onPinInsight,
    onDismissInsight,
    dismissedInsights,
    onRestoreInsight,
    selectedInsightId,
    onSelectInsight,
    onCitationClick,
    chunks,
    chunkToTopicMap,
    insightToChunkMap,
    topicToChunksMap,
    visibleChunkIndices,
    isTranscriptSidebarOpen,
    onToggleTranscriptSidebar,
    activeUrl,
    onCloseUrl,
    onSourcePreviewExpandChange,
    pageLoadTime,
    focusInsightRequest,
    onFocusHandled,
    seenInsightIds,
    registerInsightRef,
    getUnseenCount,
    getInsightElement,
    isInteractiveTabsEnabled = false,
    showInsightsTab = true,
    conversationId,
    clientId,
    isExplainEnabled = false,
    onTrackEvent,
    chatPresetMessages,
    isChatReadOnly = false,
    onOnboardingEvent,
    onboardingPhase,
    onboardingForceCollapseChartsToken,
}: InsightsSidebarProps) {
    const stableChatPresetMessages = chatPresetMessages ?? EMPTY_CHAT_PRESET_MESSAGES;

    const [activeTab, setActiveTab] = useState<PrimarySidebarTab>(showInsightsTab ? "insights" : "kb-search");

    const interactiveTabs = useMemo(() => {
        if (showInsightsTab) {
            return INTERACTIVE_TABS;
        }

        return INTERACTIVE_TABS.filter((tab) => tab.key !== "insights");
    }, [showInsightsTab]);

    // Track which topic is expanded (only one at a time)
    const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
    // Track which insight is showing its transcript chunk
    const [showTranscriptForInsightId, setShowTranscriptForInsightId] = useState<string | null>(null);
    // Track previously known topic IDs to detect new topics
    const previousTopicIdsRef = useRef<Set<string>>(new Set());
    // Archive section expanded state
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    // Pinned section expanded state
    const [isPinnedOpen, setIsPinnedOpen] = useState(true);

    // Focused insight (from banner click) — used for scroll-into-view + flash border
    const [focusedInsightId, setFocusedInsightId] = useState<string | null>(null);
    const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // KB search tab state (interactive mode only)
    const [kbQuery, setKbQuery] = useState("");
    const [kbSubmittedQuery, setKbSubmittedQuery] = useState<string | null>(null);
    const [kbSearchResults, setKbSearchResults] = useState<string[]>([]);
    const [kbSearchResultsRich, setKbSearchResultsRich] = useState<KbSearchResult[] | null>(null);
    const [kbSearchError, setKbSearchError] = useState<string | null>(null);
    const [isKbSearching, setIsKbSearching] = useState(false);

    // Chat tab state
    const [chatDraft, setChatDraft] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatError, setChatError] = useState<string | null>(null);
    const [isChatPending, setIsChatPending] = useState(false);
    const chatRequestIdRef = useRef(0);
    const chatMessagesScrollRef = useRef<HTMLDivElement | null>(null);
    const sessionKeyRef = useRef<string>("");
    const previousOnboardingPhaseRef = useRef<string | undefined>(undefined);

    // Google tab state
    const [googleQuery, setGoogleQuery] = useState("");
    const [googleError, setGoogleError] = useState<string | null>(null);

    // Sort topics by creation date (oldest first)
    const sortedTopics = useMemo(() => {
        return [...topics].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, [topics]);

    // Compute pinned insights (separate from topic lists)
    const pinnedInsights = useMemo(() => {
        if (pinnedInsightIds.size === 0) return [];
        return insights.filter((i) => pinnedInsightIds.has(i.id));
    }, [insights, pinnedInsightIds]);

    // Group insights by topic, excluding pinned insights
    const insightsByTopic = useMemo(() => {
        const map = new Map<string, Insight[]>();
        for (const insight of insights) {
            if (pinnedInsightIds.has(insight.id)) continue;
            const topicId = insight.thread?.topic_id;
            if (topicId) {
                const existing = map.get(topicId) || [];
                existing.push(insight);
                map.set(topicId, existing);
            }
        }
        return map;
    }, [insights, pinnedInsightIds]);

    // Group loading insights by topic
    const loadingByTopic = useMemo(() => {
        const map = new Map<string, LoadingInsight[]>();
        for (const item of loadingInsights) {
            const topicId = item.insight.thread?.topic_id;
            if (topicId) {
                const existing = map.get(topicId) || [];
                existing.push(item);
                map.set(topicId, existing);
            }
        }
        return map;
    }, [loadingInsights]);

    // Detect new topics and expand only the newest one
    useEffect(() => {
        const currentTopicIds = new Set(topics.map((t) => t.id));
        const previousIds = previousTopicIdsRef.current;

        // Find newly added topics
        const newTopicIds: string[] = [];
        currentTopicIds.forEach((id) => {
            if (!previousIds.has(id)) {
                newTopicIds.push(id);
            }
        });

        // If there are new topics, expand only the newest one
        if (newTopicIds.length > 0 && previousIds.size > 0) {
            setExpandedTopicId(newTopicIds[newTopicIds.length - 1]);
        }

        // Update the ref for next comparison
        previousTopicIdsRef.current = currentTopicIds;
    }, [topics]);

    // Auto-expand current topic when it changes
    useEffect(() => {
        if (currentTopicId) {
            setExpandedTopicId(currentTopicId);
        }
    }, [currentTopicId]);

    // Keep pinned selection behavior inside pinned section instead of expanding a topic section.
    useEffect(() => {
        if (!selectedInsightId) return;
        if (!pinnedInsightIds.has(selectedInsightId)) return;

        setIsPinnedOpen(true);
        setExpandedTopicId(null);
    }, [selectedInsightId, pinnedInsightIds]);

    // Auto-expand topics that have loading insights (to show skeleton animation)
    useEffect(() => {
        if (loadingInsights.length > 0) {
            const topicsWithLoading = loadingInsights.map((li) => li.insight.thread?.topic_id).filter(Boolean);
            if (topicsWithLoading.length > 0) {
                setExpandedTopicId(topicsWithLoading[0] as string);
            }
        }
    }, [loadingInsights]);

    // Toggle handler for individual topics - only one expanded at a time
    const handleToggleTopic = useCallback((topicId: string) => {
        const isCollapsingCurrentTopic = expandedTopicId === topicId;

        if (isCollapsingCurrentTopic) {
            if (selectedInsightId) {
                onSelectInsight(null);
            }
            // Also clear transcript viewing when collapsing topic
            setShowTranscriptForInsightId(null);

            onTrackEvent?.({
                event_name: "topic_collapsed",
                target_type: "topic",
                target_id: topicId,
                topic_id: topicId,
                surface: "insights_sidebar",
            });
            onOnboardingEvent?.({ type: "topic-toggled", payload: { topicId, expanded: false } });
            setExpandedTopicId(null);
            return;
        }

        onTrackEvent?.({
            event_name: "topic_expanded",
            target_type: "topic",
            target_id: topicId,
            topic_id: topicId,
            surface: "insights_sidebar",
        });
        onOnboardingEvent?.({ type: "topic-toggled", payload: { topicId, expanded: true } });
        setExpandedTopicId(topicId);
    }, [expandedTopicId, onOnboardingEvent, onSelectInsight, onTrackEvent, selectedInsightId]);

    // Clear expanded topic (used when clicking ellipsis in transcript)
    const handleClearExpandedTopic = useCallback(() => {
        setExpandedTopicId(null);
        setShowTranscriptForInsightId(null);
    }, []);

    // Handler for transcript icon on insight cards
    const handleShowTranscript = useCallback((insightId: string) => {
        if (showTranscriptForInsightId === insightId) {
            // Exit provenance mode for this insight.
            setShowTranscriptForInsightId(null);
        } else {
            // Enter provenance mode for this insight.
            setShowTranscriptForInsightId(insightId);
            if (!isTranscriptSidebarOpen) {
                onToggleTranscriptSidebar();
            }
        }
    }, [showTranscriptForInsightId, isTranscriptSidebarOpen, onToggleTranscriptSidebar]);

    // Auto-open transcript sidebar when a topic is expanded or insight is selected
    useEffect(() => {
        if (expandedTopicId || selectedInsightId) {
            // Could auto-open transcript sidebar here if desired
        }
    }, [expandedTopicId, selectedInsightId]);

    // Handle external focus requests (from collapsed insight banners)
    useEffect(() => {
        if (!showInsightsTab && activeTab === "insights") {
            setActiveTab("kb-search");
        }
    }, [activeTab, showInsightsTab]);

    useEffect(() => {
        if (!focusInsightRequest) return;

        if (isInteractiveTabsEnabled && showInsightsTab) {
            setActiveTab("insights");
            onOnboardingEvent?.({ type: "tab-selected", payload: { tab: "insights" } });
        }

        if (focusInsightRequest.topicId) {
            setExpandedTopicId(focusInsightRequest.topicId);
        }
        // Parent already set selectedInsightId — no need to call onSelectInsight here
        // (calling it would open the transcript sidebar, which we don't want on banner click)
        setFocusedInsightId(focusInsightRequest.insightId);
        onFocusHandled();
    }, [focusInsightRequest, isInteractiveTabsEnabled, onFocusHandled, onOnboardingEvent, showInsightsTab]);

    useEffect(() => {
        if (!onboardingPhase) return;

        // Prefill KB query once when entering the KB search step.
        if (
            onboardingPhase === "kb-search-input" &&
            previousOnboardingPhaseRef.current !== "kb-search-input"
        ) {
            setKbQuery("Electricity sector's carbon emission performance");
            setKbSearchError(null);
            setKbSubmittedQuery(null);
            setKbSearchResults([]);
            setKbSearchResultsRich(null);
        }

        previousOnboardingPhaseRef.current = onboardingPhase;
    }, [onboardingPhase]);

    const handleTextInsightOnboardingAction = useCallback((action: "quote-click" | "pin-click" | "archive-click" | "text-selected" | "explain-click") => {
        onOnboardingEvent?.({ type: action });
    }, [onOnboardingEvent]);

    const handleVizExpandOnboardingAction = useCallback((expanded: boolean) => {
        onOnboardingEvent?.({ type: expanded ? "viz-expanded" : "viz-collapsed" });
    }, [onOnboardingEvent]);

    // Scroll the focused insight into view and clear focus after 2 seconds
    useEffect(() => {
        if (!focusedInsightId || !getInsightElement) return;

        // Small delay to let the topic expand and render the insight card
        const scrollTimer = setTimeout(() => {
            const el = getInsightElement(focusedInsightId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 200);

        // Clear the flash after 2 seconds
        focusTimerRef.current = setTimeout(() => {
            setFocusedInsightId(null);
            focusTimerRef.current = null;
        }, 2200);

        return () => {
            clearTimeout(scrollTimer);
            if (focusTimerRef.current) {
                clearTimeout(focusTimerRef.current);
                focusTimerRef.current = null;
            }
        };
    }, [focusedInsightId, getInsightElement]);

    useEffect(() => {
        const sessionKey = `${conversationId ?? ""}::${clientId ?? ""}`;
        sessionKeyRef.current = sessionKey;

        setKbSearchError(null);
        setKbSubmittedQuery(null);
        setKbSearchResults([]);
        setKbSearchResultsRich(null);
        setKbQuery("");

        chatRequestIdRef.current += 1;
        setChatDraft("");
        const presetMessages = isChatReadOnly
            ? stableChatPresetMessages
                .filter((message) => message.content.trim().length > 0)
                .map((message, index) => ({
                    id: `preset-${index}`,
                    role: message.role,
                    content: message.content,
                    timestamp: new Date().toISOString(),
                }))
            : [];
        setChatMessages(presetMessages);
        setChatError(null);
        setIsChatPending(false);

        setGoogleQuery("");
        setGoogleError(null);
    }, [conversationId, clientId, stableChatPresetMessages, isChatReadOnly]);

    useEffect(() => {
        if (!chatMessagesScrollRef.current) return;
        chatMessagesScrollRef.current.scrollTo({
            top: chatMessagesScrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [chatMessages, isChatPending, activeTab]);

    const handleKbSearch = useCallback(async () => {
        const query = kbQuery.trim();
        if (!query) {
            setKbSearchError("Enter a query to search the knowledge base.");
            return;
        }

        if (!conversationId || !clientId) {
            setKbSearchError("Missing conversation session context. Rejoin the interactive session and try again.");
            return;
        }

        setIsKbSearching(true);
        setKbSearchError(null);

        onTrackEvent?.({
            event_name: "kb_search_submitted",
            target_type: "control",
            target_id: "kb_search",
            tab_name: "kb-search",
            sidebar_name: "primary",
            query_text: query,
            surface: "insights_sidebar",
        });

        try {
            const response = await searchKnowledgeBaseV2({
                conversationId,
                clientId,
                query,
            });
            setKbSubmittedQuery(response.query);
            setKbSearchResults(response.urls);
            setKbSearchResultsRich(response.results ?? null);
            onOnboardingEvent?.({
                type: "kb-search-submitted",
                payload: {
                    query: response.query,
                    resultCount: response.results?.length ?? response.urls.length,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to search knowledge base.";
            setKbSearchError(message);
        } finally {
            setIsKbSearching(false);
        }
    }, [kbQuery, conversationId, clientId, onOnboardingEvent, onTrackEvent]);

    const resetKbSearch = useCallback(() => {
        setKbSubmittedQuery(null);
        setKbSearchResults([]);
        setKbSearchResultsRich(null);
        setKbSearchError(null);
        setKbQuery("");
    }, []);

    const handleSendChat = useCallback(async () => {
        if (isChatReadOnly) {
            return;
        }

        if (isChatPending) {
            return;
        }

        const prompt = chatDraft.trim();
        if (!prompt) {
            setChatError("Enter a prompt to send.");
            return;
        }

        if (!conversationId || !clientId) {
            setChatError("Missing conversation session context. Rejoin the interactive session and try again.");
            return;
        }

        const sessionKeyAtRequest = sessionKeyRef.current;
        const requestId = ++chatRequestIdRef.current;
        const now = new Date().toISOString();

        onTrackEvent?.({
            event_name: "llm_chat_submitted",
            target_type: "control",
            target_id: "chat_send",
            tab_name: "chat",
            sidebar_name: "primary",
            query_text: prompt,
            surface: "insights_sidebar",
        });

        setChatError(null);
        setIsChatPending(true);
        setChatMessages((prev) => [
            ...prev,
            {
                id: `user-${requestId}`,
                role: "user",
                content: prompt,
                timestamp: now,
            },
        ]);
        setChatDraft("");

        try {
            const response = await chatWithClientV2({
                conversationId,
                clientId,
                prompt,
            });

            if (requestId !== chatRequestIdRef.current || sessionKeyRef.current !== sessionKeyAtRequest) {
                return;
            }

            setChatMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${requestId}`,
                    role: "assistant",
                    content: response.response,
                    timestamp: response.timestamp,
                },
            ]);
        } catch (error) {
            if (requestId !== chatRequestIdRef.current || sessionKeyRef.current !== sessionKeyAtRequest) {
                return;
            }

            const message = error instanceof Error ? error.message : "Failed to get chat response.";
            setChatError(message);
            setChatDraft(prompt);
        } finally {
            if (requestId === chatRequestIdRef.current && sessionKeyRef.current === sessionKeyAtRequest) {
                setIsChatPending(false);
            }
        }
    }, [chatDraft, clientId, conversationId, isChatPending, isChatReadOnly, onTrackEvent]);

    const handleGoogleSearch = useCallback(() => {
        const query = googleQuery.trim();
        if (!query) {
            setGoogleError("Enter a query to search Google.");
            return;
        }

        setGoogleError(null);
        const searchUrl = `${GOOGLE_SEARCH_ORIGIN}/search?${new URLSearchParams({ q: query, igu: "1" }).toString()}`;

        onTrackEvent?.({
            event_name: "google_search_submitted",
            target_type: "control",
            target_id: "google_search",
            tab_name: "google",
            sidebar_name: "primary",
            query_text: query,
            url: searchUrl,
            surface: "insights_sidebar",
        });
        onTrackEvent?.({
            event_name: "google_result_opened",
            target_type: "external_link",
            target_id: "google_search_result",
            tab_name: "google",
            sidebar_name: "primary",
            query_text: query,
            url: searchUrl,
            surface: "insights_sidebar",
        });
        window.open(searchUrl, "_blank", "noopener,noreferrer");
    }, [googleQuery, onTrackEvent]);

    const handleCitationClick = useCallback((url: string, context?: CitationClickContext) => {
        onCitationClick(url, context);
    }, [onCitationClick]);

    const shouldIgnoreCardSelection = useCallback((event: React.MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement | null;
        if (!target) return false;

        if (
            target.closest(
                "button, a, input, textarea, select, label, [role='button'], [contenteditable='true'], [data-no-card-select='true']"
            )
        ) {
            return true;
        }

        const selection = window.getSelection();
        return Boolean(selection && !selection.isCollapsed && selection.toString().trim().length > 0);
    }, []);

    const renderInsightsPanel = () => (
        <>
            {/* Pinned section – frozen at top, outside scroll container */}
            {pinnedInsights.length > 0 && (
                <Box borderBottomWidth="1px" borderBottomColor="border.muted" pb="2" px="2">
                    <Collapsible.Root open={isPinnedOpen} onOpenChange={() => setIsPinnedOpen(!isPinnedOpen)}>
                        <Collapsible.Trigger asChild>
                            <Box
                                as="button"
                                width="100%"
                                px="1"
                                py="1"
                                cursor="pointer"
                                _hover={{ bg: "bg.subtle" }}
                                display="flex"
                                alignItems="center"
                                borderRadius="md"
                            >
                                <HStack flex="1" gap="2">
                                    <Icon
                                        as={isPinnedOpen ? LuChevronDown : LuChevronRight}
                                        boxSize="4"
                                        color="fg.muted"
                                    />
                                    <LuPin size={14} />
                                    <Span fontSize="sm" fontWeight="medium">
                                        Pinned
                                    </Span>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        minW="5"
                                        h="5"
                                        borderRadius="full"
                                        bg="orange.500"
                                        color="white"
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {pinnedInsights.length}
                                    </Box>
                                </HStack>
                            </Box>
                        </Collapsible.Trigger>
                        <Collapsible.Content>
                            <Box maxH="300px" overflowY="auto">
                                <Stack gap="2" pt="2" px="3">
                                    {pinnedInsights.map((insight) => {
                                        const chunkIndex = insightToChunkMap.get(insight.id);
                                        const chunk = chunkIndex !== undefined ? chunks[chunkIndex] : undefined;
                                        const now = new Date();
                                        const timestamp = chunk
                                            ? formatTimestamp(
                                                getInsightDisplayTime(chunk.cumulative_timestamp, pageLoadTime),
                                                now
                                            )
                                            : undefined;

                                        return (
                                            <Box
                                                key={insight.id}
                                                cursor="pointer"
                                                width="100%"
                                                onClick={(event) => {
                                                    if (shouldIgnoreCardSelection(event)) {
                                                        return;
                                                    }
                                                    onSelectInsight(
                                                        selectedInsightId === insight.id ? null : insight.id
                                                    );
                                                }}
                                            >
                                                {insight.type === "text" ? (
                                                    <TextInsightCard
                                                        insight={insight}
                                                        isPinned
                                                        isSelected={selectedInsightId === insight.id}
                                                        isFocused={focusedInsightId === insight.id}
                                                        onPin={() => onPinInsight(insight.id)}
                                                        onCitationClick={handleCitationClick}
                                                        timestamp={timestamp}
                                                        isSeen={seenInsightIds.has(insight.id)}
                                                        registerRef={(el) => registerInsightRef(insight.id, el)}
                                                        isExplainEnabled={isExplainEnabled}
                                                        conversationId={conversationId}
                                                        clientId={clientId}
                                                        onOnboardingAction={handleTextInsightOnboardingAction}
                                                    />
                                                ) : (
                                                    <VizInsightCard
                                                        insight={insight}
                                                        isPinned
                                                        isSelected={selectedInsightId === insight.id}
                                                        isFocused={focusedInsightId === insight.id}
                                                        onPin={() => onPinInsight(insight.id)}
                                                        timestamp={timestamp}
                                                        isSeen={seenInsightIds.has(insight.id)}
                                                        registerRef={(el) => registerInsightRef(insight.id, el)}
                                                    />
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </Box>
            )}

            <Box flex="1" overflowY="auto" px="2" pt="0" pb="2">
                {sortedTopics.length === 0 ? (
                    <Stack align="center" justify="center" height="200px" gap="2">
                        <Text color="fg.muted" fontSize="sm" textAlign="center">
                            No insights yet.
                        </Text>
                        <Text color="fg.subtle" fontSize="xs" textAlign="center">
                            Insights will appear as the conversation progresses.
                        </Text>
                    </Stack>
                ) : (
                    <Stack gap="3">
                        {sortedTopics.map((topic) => (
                            <TopicItem
                                key={topic.id}
                                topic={topic}
                                insights={insightsByTopic.get(topic.id) || []}
                                loadingInsights={loadingByTopic.get(topic.id) || []}
                                isActive={topic.id === currentTopicId}
                                isHighlighted={highlights.topicIds.has(topic.id)}
                                highlightedInsightIds={highlights.insightIds}
                                isOpen={expandedTopicId === topic.id}
                                onToggle={() => handleToggleTopic(topic.id)}
                                pinnedInsightIds={pinnedInsightIds}
                                onPinInsight={onPinInsight}
                                onDismissInsight={onDismissInsight}
                                selectedInsightId={selectedInsightId}
                                onSelectInsight={onSelectInsight}
                                showTranscriptForInsightId={showTranscriptForInsightId}
                                onShowTranscript={handleShowTranscript}
                                onCitationClick={handleCitationClick}
                                chunks={chunks}
                                insightToChunkMap={insightToChunkMap}
                                pageLoadTime={pageLoadTime}
                                stickyTopOffset={0}
                                seenInsightIds={seenInsightIds}
                                registerInsightRef={registerInsightRef}
                                getUnseenCount={getUnseenCount}
                                focusedInsightId={focusedInsightId}
                                onTrackEvent={onTrackEvent}
                                isExplainEnabled={isExplainEnabled}
                                conversationId={conversationId}
                                clientId={clientId}
                                onTextInsightOnboardingAction={handleTextInsightOnboardingAction}
                                onVizExpandOnboardingAction={handleVizExpandOnboardingAction}
                                onboardingForceCollapseChartsToken={onboardingForceCollapseChartsToken}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {dismissedInsights.length > 0 && (
                <Box borderTopWidth="1px" borderTopColor="border.muted">
                    <Collapsible.Root open={isArchiveOpen} onOpenChange={() => setIsArchiveOpen(!isArchiveOpen)}>
                        <Collapsible.Trigger asChild>
                            <Box
                                as="button"
                                width="100%"
                                px="3"
                                py="2"
                                cursor="pointer"
                                _hover={{ bg: "bg.subtle" }}
                                display="flex"
                                alignItems="center"
                            >
                                <HStack flex="1" gap="2">
                                    <Icon
                                        as={isArchiveOpen ? LuChevronDown : LuChevronRight}
                                        boxSize="4"
                                        color="fg.muted"
                                    />
                                    <LuArchive size={16} />
                                    <Span fontSize="sm" fontWeight="medium">
                                        Archive
                                    </Span>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        minW="5"
                                        h="5"
                                        borderRadius="full"
                                        bg="gray.500"
                                        color="white"
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {dismissedInsights.length}
                                    </Box>
                                </HStack>
                            </Box>
                        </Collapsible.Trigger>
                        <Collapsible.Content>
                            <Box px="3" pb="3" maxH="200px" overflowY="auto">
                                <Stack gap="2">
                                    {dismissedInsights.map((dismissed) => (
                                        <Card.Root
                                            key={dismissed.insight.id}
                                            size="sm"
                                            variant="subtle"
                                        >
                                            <Card.Body py="2" px="3">
                                                <HStack justify="space-between" align="start">
                                                    <Box flex="1">
                                                        <Text fontSize="xs" color="fg.muted" mb="1">
                                                            {dismissed.topicName}
                                                        </Text>
                                                        <Text fontSize="sm" lineClamp={2}>
                                                            {dismissed.insight.type === "text"
                                                                ? dismissed.insight.content.slice(0, 100) + "..."
                                                                : dismissed.insight.chart_title
                                                            }
                                                        </Text>
                                                    </Box>
                                                    <IconButton
                                                        aria-label="Restore insight"
                                                        variant="ghost"
                                                        size="xs"
                                                        onClick={() => {
                                                            onTrackEvent?.({
                                                                event_name: "insight_restored",
                                                                target_type: "insight",
                                                                target_id: dismissed.insight.id,
                                                                topic_id: dismissed.originalTopicId,
                                                                thread_id: dismissed.insight.thread?.thread_id,
                                                                insight_id: dismissed.insight.id,
                                                                surface: "insights_sidebar",
                                                            });
                                                            onRestoreInsight(dismissed.insight.id);
                                                        }}
                                                    >
                                                        <LuUndo2 />
                                                    </IconButton>
                                                </HStack>
                                            </Card.Body>
                                        </Card.Root>
                                    ))}
                                </Stack>
                            </Box>
                        </Collapsible.Content>
                    </Collapsible.Root>
                </Box>
            )}
        </>
    );

    const renderKbSearchPanel = () => {
        const isResultsView = kbSubmittedQuery !== null;

        if (isResultsView) {
            return (
                <Stack data-onboarding="kb-search-results" gap="4" px="3" py="3" height="100%" overflowY="auto">
                    <Button alignSelf="start" variant="subtle" onClick={resetKbSearch}>
                        New Search
                    </Button>

                    <Stack gap="1">
                        <Text fontSize="sm" color="fg.muted">Results for</Text>
                        <Text fontSize="sm" fontWeight="semibold" lineClamp={2}>
                            “{kbSubmittedQuery}”
                        </Text>
                    </Stack>

                    {kbSearchResults.length === 0 && (!kbSearchResultsRich || kbSearchResultsRich.length === 0) ? (
                        <Text fontSize="sm" color="fg.muted">
                            No matching sources found.
                        </Text>
                    ) : kbSearchResultsRich && kbSearchResultsRich.length > 0 ? (
                        /* Google-style rich results */
                        <Stack gap="3">
                            {kbSearchResultsRich.map((result, index) => (
                                <Link
                                    data-onboarding={index === 0 ? "kb-result-item" : undefined}
                                    key={`${result.url}-${index}`}
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    _hover={{ textDecoration: "none" }}
                                    display="block"
                                    overflow="hidden"
                                    minW="0"
                                    onClick={() => {
                                        onOnboardingEvent?.({ type: "kb-result-clicked", payload: { url: result.url, index: index + 1 } });
                                        onTrackEvent?.({
                                            event_name: "kb_result_clicked",
                                            target_type: "kb_result",
                                            target_id: `kb_result_${index + 1}`,
                                            tab_name: "kb-search",
                                            sidebar_name: "primary",
                                            position_index: index + 1,
                                            query_text: kbSubmittedQuery ?? undefined,
                                            url: result.url,
                                            surface: "insights_sidebar",
                                        });
                                    }}
                                >
                                    <Stack gap="0.5" minW="0" _hover={{ "& > [data-title]": { textDecoration: "underline" } }}>
                                        <Text
                                            fontSize="xs"
                                            color="fg.subtle"
                                            whiteSpace="nowrap"
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                        >
                                            {result.url}
                                        </Text>
                                        <Text
                                            data-title=""
                                            fontSize="md"
                                            fontWeight="medium"
                                            color="blue.fg"
                                            lineClamp={2}
                                            wordBreak="break-word"
                                        >
                                            {result.title}
                                        </Text>
                                        {result.preview && (
                                            <Text fontSize="xs" color="fg.subtle" lineClamp={3}>
                                                {result.preview}
                                            </Text>
                                        )}
                                    </Stack>
                                </Link>
                            ))}
                        </Stack>
                    ) : (
                        /* URL-only fallback */
                        <Stack gap="2">
                            {kbSearchResults.map((url, index) => (
                                <Card.Root key={`${url}-${index}`} size="sm" variant="outline">
                                    <Card.Body py="2" px="3">
                                        <Stack align="start" gap="1">
                                            <Text fontSize="xs" color="fg.muted">Result {index + 1}</Text>
                                            <Link
                                                data-onboarding={index === 0 ? "kb-result-item" : undefined}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                color="blue.fg"
                                                fontSize="sm"
                                                title={url}
                                                display="block"
                                                maxW="100%"
                                                whiteSpace="nowrap"
                                                overflow="hidden"
                                                textOverflow="ellipsis"
                                                onClick={() => {
                                                    onOnboardingEvent?.({ type: "kb-result-clicked", payload: { url, index: index + 1 } });
                                                    onTrackEvent?.({
                                                        event_name: "kb_result_clicked",
                                                        target_type: "kb_result",
                                                        target_id: `kb_result_${index + 1}`,
                                                        tab_name: "kb-search",
                                                        sidebar_name: "primary",
                                                        position_index: index + 1,
                                                        query_text: kbSubmittedQuery ?? undefined,
                                                        url,
                                                        surface: "insights_sidebar",
                                                    });
                                                }}
                                            >
                                                {url}
                                            </Link>
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </Stack>
                    )}
                </Stack>
            );
        }

        return (
            <Stack gap="3" px="3" py="3" height="100%" overflowY="auto">
                <Text fontSize="sm" color="fg.muted">
                    Search the conversation knowledge base and open ranked source URLs in a new browser tab.
                </Text>

                <Stack data-onboarding="kb-search-controls" gap="2" align="start">
                    <Input
                        data-onboarding="kb-search-input"
                        value={kbQuery}
                        onChange={(event) => setKbQuery(event.target.value)}
                        placeholder="Search topic, concept, or question"
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void handleKbSearch();
                            }
                        }}
                    />

                    <Button
                        data-onboarding="kb-search-submit"
                        onClick={() => void handleKbSearch()}
                        loading={isKbSearching}
                        disabled={kbQuery.trim().length === 0}
                        alignSelf="start"
                        colorPalette="blue"
                    >
                        Search
                    </Button>
                </Stack>

                {kbSearchError && (
                    <Text fontSize="sm" color="red.500">
                        {kbSearchError}
                    </Text>
                )}

            </Stack>
        );
    };

    const renderChatPanel = () => (
        <Box data-onboarding="chat-panel" display="flex" flexDirection="column" flex="1" minH="0">
            <Box ref={chatMessagesScrollRef} flex="1" overflowY="auto" px="3" py="3">
                {chatMessages.length === 0 ? (
                    <Stack align="center" justify="center" height="100%" gap="2" textAlign="center">
                        <Text fontSize="sm" color="fg.muted">Start a chat for quick help during the session.</Text>
                        <Text fontSize="xs" color="fg.subtle">Responses are generated from the conversation assistant.</Text>
                    </Stack>
                ) : (
                    <Stack gap="3">
                        {chatMessages.map((message) => {
                            const isUser = message.role === "user";

                            return (
                                <Flex key={message.id} justify={isUser ? "flex-end" : "flex-start"}>
                                    <Card.Root
                                        maxW="90%"
                                        size="sm"
                                        variant={isUser ? "subtle" : "outline"}
                                        bg={isUser ? "blue.solid" : undefined}
                                        color={isUser ? "blue.contrast" : undefined}
                                    >
                                        <Card.Body py="2" px="3">
                                            {isUser ? (
                                                <Text whiteSpace="pre-wrap" fontSize="sm">{message.content}</Text>
                                            ) : (
                                                <Box
                                                    fontSize="sm"
                                                    css={{
                                                        "& p": { marginTop: "0.25rem", marginBottom: "0.25rem" },
                                                        "& ul, & ol": { paddingLeft: "1.25rem", marginTop: "0.25rem", marginBottom: "0.25rem" },
                                                        "& li": { marginTop: "0.125rem", marginBottom: "0.125rem" },
                                                        "& h1, & h2, & h3": { marginTop: "0.35rem", marginBottom: "0.35rem", fontWeight: 600 },
                                                        "& a": { color: "var(--chakra-colors-blue-fg)", textDecoration: "underline" },
                                                    }}
                                                >
                                                    <ReactMarkdown
                                                        components={{
                                                            a: ({ href, children }) => (
                                                                <a href={href} target="_blank" rel="noopener noreferrer">
                                                                    {children}
                                                                </a>
                                                            ),
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </Box>
                                            )}
                                        </Card.Body>
                                    </Card.Root>
                                </Flex>
                            );
                        })}

                        {isChatPending && (
                            <Flex justify="flex-start">
                                <Card.Root size="sm" variant="outline" maxW="90%">
                                    <Card.Body py="2" px="3">
                                        <HStack gap="2">
                                            <Spinner size="sm" />
                                            <Text fontSize="sm" color="fg.muted">Thinking…</Text>
                                        </HStack>
                                    </Card.Body>
                                </Card.Root>
                            </Flex>
                        )}
                    </Stack>
                )}
            </Box>

            <Box borderTopWidth="1px" borderTopColor="border.muted" px="3" py="3">
                <Stack gap="2">
                    {chatError && <Text fontSize="sm" color="red.500">{chatError}</Text>}
                    {isChatReadOnly && (
                        <Text fontSize="xs" color="fg.subtle">
                            Chat is in training mode for demo and does not accept new prompts.
                        </Text>
                    )}
                    <Textarea
                        data-onboarding="chat-input"
                        value={chatDraft}
                        onChange={(event) => setChatDraft(event.target.value)}
                        placeholder="Ask anything about the discussion..."
                        resize="vertical"
                        minH="88px"
                        maxH="180px"
                        disabled={isChatPending || isChatReadOnly}
                        onKeyDown={(event) => {
                            if (isChatReadOnly) {
                                event.preventDefault();
                                return;
                            }
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void handleSendChat();
                            }
                        }}
                    />
                    <Flex justify="flex-end">
                        <Button
                            onClick={() => void handleSendChat()}
                            disabled={isChatReadOnly || isChatPending || chatDraft.trim().length === 0}
                            colorPalette="blue"
                        >
                            <LuSendHorizontal />
                            Send
                        </Button>
                    </Flex>
                </Stack>
            </Box>
        </Box>
    );

    const renderGooglePanel = () => {
        return (
            <Stack gap="3" px="3" py="3" height="100%" overflowY="auto">
                <Text fontSize="sm" color="fg.muted">
                    Search Google and open results in a new browser tab.
                </Text>
                <Input
                    data-onboarding="google-search-input"
                    value={googleQuery}
                    onChange={(event) => setGoogleQuery(event.target.value)}
                    placeholder="Search Google"
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            handleGoogleSearch();
                        }
                    }}
                />
                {googleError && (
                    <Text fontSize="sm" color="red.500">
                        {googleError}
                    </Text>
                )}
                <Button alignSelf="start" colorPalette="blue" onClick={handleGoogleSearch}>
                    Search
                </Button>
            </Stack>
        );
    };

    if (isCollapsed) {
        return (
            <Box
                width="48px"
                height="100%"
                bg="bg.panel"
                borderLeftWidth="1px"
                borderLeftColor="border.muted"
                display="flex"
                flexDirection="column"
                alignItems="center"
                pt="4"
            >
                <IconButton
                    aria-label="Expand sidebar"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        onTrackEvent?.({
                            event_name: "primary_sidebar_expanded",
                            target_type: "control",
                            target_id: "primary_sidebar",
                            sidebar_name: "primary",
                            surface: "insights_sidebar",
                        });
                        onToggleCollapse();
                    }}
                >
                    <LuPanelRightOpen />
                </IconButton>
            </Box>
        );
    }

    return (
        <Flex height="100%">
            {/* Main insights sidebar */}
            <Box
                data-onboarding="insights-sidebar"
                width="450px"
                height="100%"
                bg="bg.panel"
                borderLeftWidth="1px"
                borderLeftColor="border.muted"
                display="flex"
                flexDirection="column"
                overflow="hidden"
            >
                {/* Header */}
                <HStack px="3" py="2" borderBottomWidth="1px" borderBottomColor="border.muted" justify="space-between">
                    <IconButton
                        aria-label="Collapse sidebar"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onTrackEvent?.({
                                event_name: "primary_sidebar_collapsed",
                                target_type: "control",
                                target_id: "primary_sidebar",
                                sidebar_name: "primary",
                                surface: "insights_sidebar",
                            });
                            onToggleCollapse();
                        }}
                    >
                        <LuPanelRightClose />
                    </IconButton>
                    <IconButton
                        data-onboarding="transcript-toggle"
                        aria-label={isTranscriptSidebarOpen ? "Hide transcript" : "Show transcript"}
                        variant={isTranscriptSidebarOpen ? "solid" : "ghost"}
                        colorPalette={isTranscriptSidebarOpen ? "blue" : undefined}
                        size="sm"
                        onClick={() => {
                            const nextOpenState = !isTranscriptSidebarOpen;
                            onTrackEvent?.({
                                event_name: isTranscriptSidebarOpen ? "secondary_sidebar_closed" : "secondary_sidebar_opened",
                                target_type: "control",
                                target_id: "transcript_sidebar",
                                sidebar_name: "secondary",
                                surface: "insights_sidebar",
                            });
                            onOnboardingEvent?.({ type: "transcript-toggled", payload: { open: nextOpenState } });
                            onToggleTranscriptSidebar();
                        }}
                    >
                        <LuMessageSquare />
                    </IconButton>
                </HStack>

                {isInteractiveTabsEnabled && (
                    <HStack px="2" py="2" gap="2" borderBottomWidth="1px" borderBottomColor="border.muted" align="stretch">
                        {interactiveTabs.map((tab) => {
                            const isActive = tab.key === activeTab;
                            const isInsightsTab = tab.key === "insights";

                            return (
                                <Button
                                    key={tab.key}
                                    data-onboarding={tab.key === "kb-search" ? "tab-kb-search" : tab.key === "chat" ? "tab-chat" : tab.key === "google" ? "tab-google" : tab.key === "insights" ? "tab-insights" : undefined}
                                    size="sm"
                                    variant={isActive ? "subtle" : "ghost"}
                                    colorPalette={isActive && isInsightsTab ? "blue" : undefined}
                                    flex={isActive ? "2" : "1"}
                                    minW="0"
                                    px={isActive ? "3" : "2"}
                                    justifyContent={isActive ? "flex-start" : "center"}
                                    onClick={() => {
                                        setActiveTab(tab.key);
                                        onOnboardingEvent?.({ type: "tab-selected", payload: { tab: tab.key } });
                                        onTrackEvent?.({
                                            event_name: "primary_tab_selected",
                                            target_type: "tab",
                                            target_id: tab.key,
                                            tab_name: tab.key,
                                            sidebar_name: "primary",
                                            surface: "insights_sidebar",
                                        });
                                    }}
                                    transition="all 0.2s ease"
                                    borderWidth="1px"
                                    borderColor={isActive ? "border.emphasized" : "transparent"}
                                    boxShadow={
                                        isInsightsTab
                                            ? isActive
                                                ? "0 0 0 1px var(--chakra-colors-color-palette-emphasized), 0 0 12px var(--chakra-colors-color-palette-subtle)"
                                                : "0 0 0 1px var(--chakra-colors-blue-200), 0 0 8px var(--chakra-colors-blue-100)"
                                            : undefined
                                    }
                                >
                                    <HStack minW="0" gap="2">
                                        {isInsightsTab ? (
                                            <Image src={INSIGHTS_TAB_ICON_SRC} alt="" boxSize="4" />
                                        ) : (
                                            <Icon as={tab.icon} boxSize="4" />
                                        )}
                                        <Text
                                            fontSize="xs"
                                            fontWeight="medium"
                                            whiteSpace="nowrap"
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                            maxW={isActive ? "120px" : "0px"}
                                            opacity={isActive ? 1 : 0}
                                            transition="all 0.2s ease"
                                        >
                                            {tab.label}
                                        </Text>
                                    </HStack>
                                </Button>
                            );
                        })}
                    </HStack>
                )}

                <Box display="flex" flexDirection="column" flex="1" minH="0">
                    {(!isInteractiveTabsEnabled || activeTab === "insights") && renderInsightsPanel()}
                    {isInteractiveTabsEnabled && activeTab === "kb-search" && renderKbSearchPanel()}
                    {isInteractiveTabsEnabled && activeTab === "chat" && renderChatPanel()}
                    {isInteractiveTabsEnabled && activeTab === "google" && renderGooglePanel()}
                </Box>
            </Box>

            {/* Transcript sidebar */}
            {isTranscriptSidebarOpen && (
                <TranscriptSidebar
                    chunks={chunks}
                    chunkToTopicMap={chunkToTopicMap}
                    insightToChunkMap={insightToChunkMap}
                    topicToChunksMap={topicToChunksMap}
                    visibleChunkIndices={visibleChunkIndices}
                    currentTopicId={currentTopicId}
                    expandedTopicId={expandedTopicId}
                    provenanceInsightId={showTranscriptForInsightId}
                    onClearProvenanceSelection={() => setShowTranscriptForInsightId(null)}
                    onClearExpandedTopic={handleClearExpandedTopic}
                    activeUrl={activeUrl}
                    onCloseUrl={onCloseUrl}
                    onSourcePreviewExpandChange={onSourcePreviewExpandChange}
                    pageLoadTime={pageLoadTime}
                    onEllipsisClick={() =>
                        onTrackEvent?.({
                            event_name: "transcript_ellipsis_clicked",
                            target_type: "control",
                            target_id: "transcript_ellipsis",
                            sidebar_name: "secondary",
                            surface: "transcript_sidebar",
                        })
                    }
                    onContextChunkClick={() =>
                        onTrackEvent?.({
                            event_name: "transcript_context_chunk_clicked",
                            target_type: "chunk",
                            target_id: showTranscriptForInsightId ?? undefined,
                            sidebar_name: "secondary",
                            surface: "transcript_sidebar",
                        })
                    }
                />
            )}
        </Flex>
    );
}
