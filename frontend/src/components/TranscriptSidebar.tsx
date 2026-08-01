"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Box, Text, Stack, VStack, HStack, Avatar } from "@chakra-ui/react";
import { EmbeddedWebViewer } from "./EmbeddedWebViewer";
import { formatTimestamp, getChunkDisplayTime } from "@/utils/formatTimestamp";
import { pickSpeakerColor, getSpeakerInitials } from "@/utils/speakerAvatar";
import type { Chunk } from "@/types";

interface TranscriptSidebarProps {
    chunks: Chunk[];
    chunkToTopicMap: Map<number, string>;
    insightToChunkMap: Map<string, number>;
    topicToChunksMap: Map<string, number[]>;
    visibleChunkIndices: Set<number>;
    currentTopicId: string | null;
    expandedTopicId: string | null;
    provenanceInsightId: string | null;
    onClearProvenanceSelection: () => void;
    onClearExpandedTopic: () => void;
    activeUrl: string | null;
    onCloseUrl: () => void;
    onSourcePreviewExpandChange?: (expanded: boolean) => void;
    pageLoadTime: Date;
    onEllipsisClick?: () => void;
    onContextChunkClick?: () => void;
}

type DisplayMode = "all" | "topic" | "insight";

interface ChunkDisplayInfo {
    chunk: Chunk;
    isVisible: boolean;
    isHighlighted: boolean;
    isGreyed: boolean;
    showEllipsis: boolean;
}

// Color palettes and initials are now imported from @/utils/speakerAvatar
// (pickSpeakerColor, getSpeakerInitials)

export function TranscriptSidebar({
    chunks,
    chunkToTopicMap,
    insightToChunkMap,
    topicToChunksMap,
    visibleChunkIndices,
    currentTopicId,
    expandedTopicId,
    provenanceInsightId,
    onClearProvenanceSelection,
    onClearExpandedTopic,
    activeUrl,
    onCloseUrl,
    onSourcePreviewExpandChange,
    pageLoadTime,
    onEllipsisClick,
    onContextChunkClick,
}: TranscriptSidebarProps) {
    // Current time for relative timestamps (updates every minute)
    const [now, setNow] = useState(() => new Date());
    const chunkElementMapRef = useRef<Map<number, HTMLDivElement>>(new Map());

    // Update current time every minute for relative timestamps
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Determine display mode
    const displayMode: DisplayMode = useMemo(() => {
        if (provenanceInsightId && expandedTopicId) return "insight";
        if (expandedTopicId) return "topic";
        return "all";
    }, [provenanceInsightId, expandedTopicId]);

    // Get the chunk index that generated the selected insight
    const selectedInsightChunkIndex = useMemo(() => {
        if (!provenanceInsightId) return null;
        return insightToChunkMap.get(provenanceInsightId) ?? null;
    }, [provenanceInsightId, insightToChunkMap]);

    useEffect(() => {
        if (selectedInsightChunkIndex === null) return;

        const timer = setTimeout(() => {
            const element = chunkElementMapRef.current.get(selectedInsightChunkIndex);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 40);

        return () => clearTimeout(timer);
    }, [selectedInsightChunkIndex, displayMode, visibleChunkIndices]);

    // Get chunks that belong to the expanded topic
    const expandedTopicChunks = useMemo(() => {
        if (!expandedTopicId) return new Set<number>();
        return new Set(topicToChunksMap.get(expandedTopicId) || []);
    }, [expandedTopicId, topicToChunksMap]);

    // Filter and prepare chunks for display
    const displayChunks = useMemo((): ChunkDisplayInfo[] => {
        // Filter chunks based on video time visibility
        const visibleChunks = chunks.filter(
            (chunk) => visibleChunkIndices.has(chunk.chunk_index)
        );

        // Sort by chunk_index
        const sortedChunks = [...visibleChunks].sort((a, b) => a.chunk_index - b.chunk_index);

        return sortedChunks.map((chunk, index, arr) => {
            const chunkTopicId = chunkToTopicMap.get(chunk.chunk_index);
            const belongsToExpandedTopic = expandedTopicChunks.has(chunk.chunk_index);
            const belongsToCurrentTopic = chunkTopicId === currentTopicId;
            const isSelectedInsightChunk = chunk.chunk_index === selectedInsightChunkIndex;

            let isVisible = true;
            let isHighlighted = false;
            let isGreyed = false;
            let showEllipsis = false;

            switch (displayMode) {
                case "all":
                    // Show all chunks, highlight current topic chunks
                    isVisible = true;
                    isHighlighted = belongsToCurrentTopic;
                    break;

                case "topic":
                    // Show only expanded topic's chunks, ellipsis for others
                    if (belongsToExpandedTopic) {
                        isVisible = true;
                    } else {
                        // Check if this is the first non-topic chunk after a topic chunk
                        // or before a topic chunk to show ellipsis
                        const prevChunk = index > 0 ? arr[index - 1] : null;
                        const nextChunk = index < arr.length - 1 ? arr[index + 1] : null;
                        const prevBelongsToTopic = prevChunk ? expandedTopicChunks.has(prevChunk.chunk_index) : false;
                        const nextBelongsToTopic = nextChunk ? expandedTopicChunks.has(nextChunk.chunk_index) : false;

                        // Show ellipsis if adjacent to a topic chunk
                        if (prevBelongsToTopic || nextBelongsToTopic) {
                            showEllipsis = true;
                        }
                        isVisible = false;
                    }
                    break;

                case "insight":
                    // Show expanded topic's chunks, highlight the selected insight's chunk
                    if (belongsToExpandedTopic) {
                        isVisible = true;
                        isGreyed = !isSelectedInsightChunk;
                    } else {
                        const prevChunk = index > 0 ? arr[index - 1] : null;
                        const nextChunk = index < arr.length - 1 ? arr[index + 1] : null;
                        const prevBelongsToTopic = prevChunk ? expandedTopicChunks.has(prevChunk.chunk_index) : false;
                        const nextBelongsToTopic = nextChunk ? expandedTopicChunks.has(nextChunk.chunk_index) : false;

                        if (prevBelongsToTopic || nextBelongsToTopic) {
                            showEllipsis = true;
                        }
                        isVisible = false;
                    }
                    break;
            }

            return {
                chunk,
                isVisible,
                isHighlighted,
                isGreyed,
                showEllipsis,
            };
        });
    }, [chunks, visibleChunkIndices, displayMode, chunkToTopicMap, currentTopicId, expandedTopicChunks, selectedInsightChunkIndex]);

    // Handle clicking on grey text (go back to topic mode)
    const handleGreyTextClick = () => {
        onContextChunkClick?.();
        onClearProvenanceSelection();
    };

    // Handle clicking on ellipsis (go back to all mode)
    const handleEllipsisClick = () => {
        onEllipsisClick?.();
        onClearProvenanceSelection();
        onClearExpandedTopic();
    };

    // Group consecutive ellipsis markers
    const renderedItems = useMemo(() => {
        const items: React.ReactNode[] = [];
        let lastWasEllipsis = false;
        let ellipsisKey = 0;

        displayChunks.forEach((info) => {
            if (info.showEllipsis && !info.isVisible) {
                if (!lastWasEllipsis) {
                    items.push(
                        <Box
                            key={`ellipsis-${ellipsisKey++}`}
                            py="2"
                            textAlign="center"
                            cursor="pointer"
                            onClick={handleEllipsisClick}
                            _hover={{ bg: "bg.subtle" }}
                        >
                            <Text color="fg.muted" fontSize="lg">
                                ...
                            </Text>
                        </Box>
                    );
                    lastWasEllipsis = true;
                }
            } else if (info.isVisible) {
                lastWasEllipsis = false;
                const speakerColor = pickSpeakerColor(info.chunk.speaker);
                const initials = getSpeakerInitials(info.chunk.speaker);

                // Calculate timestamp for this chunk
                const chunkTime = getChunkDisplayTime(info.chunk.cumulative_timestamp, pageLoadTime);
                const timestampStr = formatTimestamp(chunkTime, now);

                items.push(
                    <Box
                        key={`chunk-${info.chunk.chunk_index}`}
                        ref={(element: HTMLDivElement | null) => {
                            if (element) {
                                chunkElementMapRef.current.set(info.chunk.chunk_index, element);
                            } else {
                                chunkElementMapRef.current.delete(info.chunk.chunk_index);
                            }
                        }}
                        py="2"
                        px="3"
                        borderRadius="md"
                        bg={info.isHighlighted ? "blue.500/10" : "transparent"}
                        cursor={info.isGreyed ? "pointer" : "default"}
                        onClick={info.isGreyed ? handleGreyTextClick : undefined}
                        _hover={info.isGreyed ? { bg: "bg.subtle" } : undefined}
                    >
                        <HStack align="start" gap="2">
                            <Avatar.Root
                                size="sm"
                                colorPalette={speakerColor}
                            >
                                <Avatar.Fallback>{initials}</Avatar.Fallback>
                            </Avatar.Root>
                            <Box flex="1">
                                <HStack justify="space-between" align="center" mb="1">
                                    <Text
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color={info.isGreyed ? "fg.subtle" : "fg.muted"}
                                    >
                                        {info.chunk.speaker}
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        color="fg.subtle"
                                    >
                                        {timestampStr}
                                    </Text>
                                </HStack>
                                <Text
                                    fontSize="sm"
                                    color={info.isGreyed ? "fg.subtle" : "fg"}
                                    lineHeight="tall"
                                >
                                    {info.chunk.content}
                                </Text>
                            </Box>
                        </HStack>
                    </Box>
                );
            }
        });

        return items;
    }, [displayChunks, pageLoadTime, now]);

    return (
        <Box
            data-onboarding="transcript-sidebar"
            width="350px"
            height="100%"
            bg="bg.panel"
            borderLeftWidth="1px"
            borderLeftColor="border.muted"
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            {/* Header */}
            <Box px="3" py="2" borderBottomWidth="1px" borderBottomColor="border.muted">
                <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                    Transcript
                </Text>
                <Text fontSize="xs" color="fg.subtle">
                    {displayMode === "all" && "All chunks"}
                    {displayMode === "topic" && "Topic chunks only"}
                    {displayMode === "insight" && "Insight context"}
                </Text>
            </Box>

            {/* Transcript content */}
            <Box flex="1" overflowY="auto" py="2">
                {renderedItems.length === 0 ? (
                    <Stack align="center" justify="center" height="100px">
                        <Text color="fg.muted" fontSize="sm">
                            No transcript yet
                        </Text>
                    </Stack>
                ) : (
                    <VStack gap="1" align="stretch">
                        {renderedItems}
                    </VStack>
                )}
            </Box>

            {/* Embedded web viewer at bottom */}
            {activeUrl && (
                <EmbeddedWebViewer
                    url={activeUrl}
                    onClose={onCloseUrl}
                    onExpandChange={onSourcePreviewExpandChange}
                />
            )}
        </Box>
    );
}
