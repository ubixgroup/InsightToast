"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Box, Card, Collapsible, HStack, Icon, Span, Stack, Text } from "@chakra-ui/react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { TextInsightCard } from "./TextInsightCard";
import { VizInsightCard } from "./VizInsightCard";
import { InsightLoadingSkeleton } from "./InsightLoadingSkeleton";
import { formatTimestamp, getInsightDisplayTime } from "@/utils/formatTimestamp";
import type { TrackAnalyticsInput } from "@/hooks/useClickAnalytics";
import type { CitationClickContext } from "@/utils/parseCitations";
import type { Topic, Insight, LoadingInsight, Chunk } from "@/types";

interface TopicItemProps {
    topic: Topic;
    insights: Insight[];
    loadingInsights: LoadingInsight[];
    isActive: boolean;
    isHighlighted: boolean;
    highlightedInsightIds: Set<string>;
    isOpen: boolean;
    onToggle: () => void;
    // Pin/dismiss props
    pinnedInsightIds: Set<string>;
    onPinInsight: (insightId: string) => void;
    onDismissInsight: (insightId: string, topicId: string, topicName: string) => void;
    // Selection props
    selectedInsightId: string | null;
    onSelectInsight: (insightId: string | null) => void;
    // Transcript chunk viewing
    showTranscriptForInsightId: string | null;
    onShowTranscript: (insightId: string) => void;
    // Citation click
    onCitationClick?: (url: string, context?: CitationClickContext) => void;
    // Timestamp props
    chunks: Chunk[];
    insightToChunkMap: Map<string, number>;
    pageLoadTime: Date;
    stickyTopOffset?: number;
    // Seen tracking props
    seenInsightIds: Set<string>;
    registerInsightRef: (insightId: string, element: HTMLElement | null) => void;
    getUnseenCount: (insightIds: string[]) => number;
    focusedInsightId?: string | null;
    onTrackEvent?: (input: TrackAnalyticsInput) => void;
    // Explain props (threaded to TextInsightCard)
    isExplainEnabled?: boolean;
    conversationId?: string | null;
    clientId?: string | null;
    onTextInsightOnboardingAction?: (action: "quote-click" | "pin-click" | "archive-click" | "text-selected" | "explain-click") => void;
    onVizExpandOnboardingAction?: (expanded: boolean) => void;
    onboardingForceCollapseChartsToken?: number;
}

export function TopicItem({
    topic,
    insights,
    loadingInsights,
    isActive,
    isHighlighted,
    highlightedInsightIds,
    isOpen,
    onToggle,
    pinnedInsightIds,
    onPinInsight,
    onDismissInsight,
    selectedInsightId,
    onSelectInsight,
    showTranscriptForInsightId,
    onShowTranscript,
    onCitationClick,
    chunks,
    insightToChunkMap,
    pageLoadTime,
    stickyTopOffset = 0,
    seenInsightIds,
    registerInsightRef,
    getUnseenCount,
    focusedInsightId,
    onTrackEvent,
    isExplainEnabled,
    conversationId,
    clientId,
    onTextInsightOnboardingAction,
    onVizExpandOnboardingAction,
    onboardingForceCollapseChartsToken,
}: TopicItemProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const insightRegisterCallbacksRef = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map());

    // Current time for relative timestamps (updates every minute)
    const [now, setNow] = useState(() => new Date());

    // Update current time every minute for relative timestamps
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Build a map from chunk_index to chunk for quick lookup
    const chunkMap = useMemo(() => {
        const map = new Map<number, Chunk>();
        for (const chunk of chunks) {
            map.set(chunk.chunk_index, chunk);
        }
        return map;
    }, [chunks]);

    // Sort insights by created_at (pinned insights are shown in separate section)
    const sortedInsights = useMemo(() => {
        return [...insights].sort((a, b) => {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    }, [insights]);

    const firstTextInsightId = useMemo(() => {
        const firstTextInsight = sortedInsights.find((insight) => insight.type === "text");
        return firstTextInsight?.id ?? null;
    }, [sortedInsights]);

    const insightCount = sortedInsights.length + loadingInsights.length;

    // Calculate unseen count for this topic's insights
    const unseenCount = useMemo(() => {
        const insightIds = insights.map((i) => i.id);
        return getUnseenCount(insightIds);
    }, [insights, getUnseenCount]);

    const handleInsightShowTranscript = (insightId: string) => {
        const clickedInsight = insights.find((item) => item.id === insightId);
        const isDeselect = showTranscriptForInsightId === insightId;

        onTrackEvent?.({
            event_name: isDeselect ? "insight_transcript_deselected" : "insight_transcript_selected",
            target_type: "insight",
            target_id: insightId,
            topic_id: topic.id,
            thread_id: clickedInsight?.thread?.thread_id,
            insight_id: insightId,
            surface: "insights_sidebar",
        });

        onShowTranscript(insightId);
    };

    const shouldIgnoreCardSelection = (event: ReactMouseEvent<HTMLElement>) => {
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
    };

    const getInsightRegisterRef = (insightId: string) => {
        const existing = insightRegisterCallbacksRef.current.get(insightId);
        if (existing) return existing;

        const callback = (el: HTMLElement | null) => {
            registerInsightRef(insightId, el);
        };

        insightRegisterCallbacksRef.current.set(insightId, callback);
        return callback;
    };

    // Get timestamp string for an insight
    const getInsightTimestamp = (insightId: string): string => {
        const chunkIndex = insightToChunkMap.get(insightId);
        if (chunkIndex === undefined) return "";

        const chunk = chunkMap.get(chunkIndex);
        if (!chunk) return "";

        const insightTime = getInsightDisplayTime(chunk.cumulative_timestamp, pageLoadTime);
        return formatTimestamp(insightTime, now);
    };

    return (
        <Card.Root
            ref={cardRef}
            data-onboarding="topic-item"
            data-onboarding-active={isActive ? "true" : undefined}
            size="sm"
            variant="outline"
            borderLeftWidth="3px"
            borderLeftColor={
                isActive
                    ? "blue.500"
                    : isHighlighted
                        ? "green.500"
                        : "transparent"
            }
            bg={isActive ? "bg.emphasized" : "bg.panel"}
            transition="all 0.3s ease"
            position="relative"
        >
            <Collapsible.Root open={isOpen} onOpenChange={onToggle}>
                {/* Sticky header */}
                <Collapsible.Trigger asChild>
                    <Card.Header
                        data-onboarding="topic-title"
                        data-onboarding-active={isActive ? "true" : undefined}
                        as="button"
                        width="100%"
                        px="3"
                        py="3"
                        cursor="pointer"
                        _hover={{ bg: "bg.subtle" }}
                        display="flex"
                        alignItems="left"
                        textAlign="left"
                        position="sticky"
                        top={`${stickyTopOffset}px`}
                        zIndex="1"
                        bg={isActive ? "bg.emphasized" : "bg.panel"}
                        borderBottomWidth={isOpen ? "1px" : "0"}
                        borderBottomColor="border.muted"
                    >
                        <HStack flex="1" gap="2">
                            <Icon
                                as={isOpen ? LuChevronDown : LuChevronRight}
                                boxSize="4"
                                color="fg.muted"
                            />
                            <Span
                                flex="1"
                                fontWeight={isActive ? "semibold" : "medium"}
                                fontSize={isActive ? "md" : "sm"}
                                lineClamp={1}
                            >
                                {topic.name}
                            </Span>
                            {/* Show "N insights" text and unseen badge if any */}
                            {insightCount > 0 && (
                                <HStack gap="2">
                                    <Text fontSize="xs" color="fg.muted">
                                        {insightCount} insight{insightCount !== 1 ? "s" : ""}
                                    </Text>
                                    {unseenCount > 0 && (
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            minW="5"
                                            h="5"
                                            borderRadius="full"
                                            bg="blue.500"
                                            color="white"
                                            fontSize="xs"
                                            fontWeight="bold"
                                        >
                                            {unseenCount}
                                        </Box>
                                    )}
                                </HStack>
                            )}
                        </HStack>
                    </Card.Header>
                </Collapsible.Trigger>
                <Collapsible.Content>
                    <Card.Body pt="3" pb="3" px="3">
                        <Stack gap="4">
                            {sortedInsights.map((insight) => {
                                const isHighlightedInsight = highlightedInsightIds.has(insight.id);
                                const isPinned = pinnedInsightIds.has(insight.id);
                                const isSelected = selectedInsightId === insight.id;
                                const timestamp = getInsightTimestamp(insight.id);
                                const isSeen = seenInsightIds.has(insight.id);
                                const isShowingTranscript = showTranscriptForInsightId === insight.id;
                                const isFocused = focusedInsightId === insight.id;

                                const handleCardClick = (event: ReactMouseEvent<HTMLElement>) => {
                                    if (shouldIgnoreCardSelection(event)) {
                                        return;
                                    }
                                    const nextId = isSelected ? null : insight.id;
                                    onTrackEvent?.({
                                        event_name: isSelected ? "insight_deselected" : "insight_clicked",
                                        target_type: "insight",
                                        target_id: insight.id,
                                        topic_id: topic.id,
                                        thread_id: insight.thread?.thread_id,
                                        insight_id: insight.id,
                                        surface: "insight_card",
                                    });
                                    onSelectInsight(nextId);
                                };

                                if (insight.type === "text") {
                                    return (
                                        <Box key={insight.id} onClick={handleCardClick} cursor="pointer">
                                            <TextInsightCard
                                                insight={insight}
                                                isHighlighted={isHighlightedInsight}
                                                isPinned={isPinned}
                                                isSelected={isSelected}
                                                isShowingTranscript={isShowingTranscript}
                                                isFocused={isFocused}
                                                onPin={() => {
                                                    onTrackEvent?.({
                                                        event_name: isPinned ? "insight_unpinned" : "insight_pinned",
                                                        target_type: "insight",
                                                        target_id: insight.id,
                                                        topic_id: topic.id,
                                                        thread_id: insight.thread?.thread_id,
                                                        insight_id: insight.id,
                                                        surface: "insight_card",
                                                    });
                                                    onPinInsight(insight.id);
                                                }}
                                                onDismiss={() => {
                                                    onTrackEvent?.({
                                                        event_name: "insight_dismissed",
                                                        target_type: "insight",
                                                        target_id: insight.id,
                                                        topic_id: topic.id,
                                                        thread_id: insight.thread?.thread_id,
                                                        insight_id: insight.id,
                                                        surface: "insight_card",
                                                    });
                                                    onDismissInsight(insight.id, topic.id, topic.name);
                                                }}
                                                onShowTranscript={() => handleInsightShowTranscript(insight.id)}
                                                onCitationClick={onCitationClick}
                                                timestamp={timestamp}
                                                isSeen={isSeen}
                                                registerRef={getInsightRegisterRef(insight.id)}
                                                isExplainEnabled={isExplainEnabled}
                                                conversationId={conversationId}
                                                clientId={clientId}
                                                onOnboardingAction={onTextInsightOnboardingAction}
                                                isPrimaryOnboardingQuoteTarget={isActive && insight.id === firstTextInsightId}
                                            />
                                        </Box>
                                    );
                                } else {
                                    return (
                                        <Box key={insight.id} onClick={handleCardClick} cursor="pointer">
                                            <VizInsightCard
                                                insight={insight}
                                                isHighlighted={isHighlightedInsight}
                                                isPinned={isPinned}
                                                isSelected={isSelected}
                                                isShowingTranscript={isShowingTranscript}
                                                isFocused={isFocused}
                                                onPin={() => {
                                                    onTrackEvent?.({
                                                        event_name: isPinned ? "insight_unpinned" : "insight_pinned",
                                                        target_type: "insight",
                                                        target_id: insight.id,
                                                        topic_id: topic.id,
                                                        thread_id: insight.thread?.thread_id,
                                                        insight_id: insight.id,
                                                        surface: "insight_card",
                                                    });
                                                    onPinInsight(insight.id);
                                                }}
                                                onDismiss={() => {
                                                    onTrackEvent?.({
                                                        event_name: "insight_dismissed",
                                                        target_type: "insight",
                                                        target_id: insight.id,
                                                        topic_id: topic.id,
                                                        thread_id: insight.thread?.thread_id,
                                                        insight_id: insight.id,
                                                        surface: "insight_card",
                                                    });
                                                    onDismissInsight(insight.id, topic.id, topic.name);
                                                }}
                                                onShowTranscript={() => handleInsightShowTranscript(insight.id)}
                                                onExpandChange={(expanded: boolean) => {
                                                    onVizExpandOnboardingAction?.(expanded);
                                                    onTrackEvent?.({
                                                        event_name: expanded ? "insight_expanded" : "insight_collapsed",
                                                        target_type: "insight",
                                                        target_id: insight.id,
                                                        topic_id: topic.id,
                                                        thread_id: insight.thread?.thread_id,
                                                        insight_id: insight.id,
                                                        surface: "insight_card",
                                                        metadata: {
                                                            insight_type: "viz",
                                                        },
                                                    });
                                                }}
                                                onCitationClick={onCitationClick}
                                                timestamp={timestamp}
                                                isSeen={isSeen}
                                                registerRef={getInsightRegisterRef(insight.id)}
                                                forceCollapseKey={onboardingForceCollapseChartsToken}
                                            />
                                        </Box>
                                    );
                                }
                            })}
                            {loadingInsights.map((item) => (
                                <InsightLoadingSkeleton
                                    key={item.insightId}
                                    isViz={item.insight.type === "viz"}
                                />
                            ))}
                            {insightCount === 0 && (
                                <Box py="4" textAlign="center">
                                    <Span fontSize="sm" color="fg.muted">
                                        No insights yet
                                    </Span>
                                </Box>
                            )}
                        </Stack>
                    </Card.Body>
                </Collapsible.Content>
            </Collapsible.Root>
        </Card.Root>
    );
}
