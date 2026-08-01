"use client";

import { Box, HStack, Text, Icon, IconButton, Card, Avatar } from "@chakra-ui/react";
import { LuX, LuChartBar, LuFileText, LuExternalLink } from "react-icons/lu";
import type { InsightBannerState } from "@/types/progressToast";
import type { TextInsight, VizInsight } from "@/types";
import { getTextInsightTitle } from "@/utils/insightTitle";
import { pickSpeakerColor, getSpeakerInitials } from "@/utils/speakerAvatar";

// ============= Keyframes CSS =============

const bannerKeyframes = `
@keyframes bannerSlideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bannerSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}
`;

// Inject keyframes into document head
if (typeof document !== "undefined") {
    const styleId = "insight-banner-keyframes";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = bannerKeyframes;
        document.head.appendChild(style);
    }
}

// ============= Component Props =============

interface InsightBannerProps {
    banner: InsightBannerState;
    onDismiss: () => void;
    onExpand?: (banner: InsightBannerState) => void;
    onDismissClick?: (banner: InsightBannerState) => void;
    onExpandClick?: (banner: InsightBannerState) => void;
}

// ============= Main Component =============

/**
 * Banner component for displaying insights when the sidebar is collapsed.
 * 
 * Shows a compact preview of the insight with:
 * - Speaker avatar + transcript chunk (provenance)
 * - Topic name
 * - Type indicator strip (text/viz)
 * - Insight title only (not full content)
 * - Auto-dismisses after 20 seconds
 * 
 * Clicking expands the sidebar and scrolls to the insight.
 */
export function InsightBanner({
    banner,
    onDismiss,
    onExpand,
    onDismissClick,
    onExpandClick,
}: InsightBannerProps) {
    const { insight, topicName, transcriptChunk, speaker } = banner;
    const isViz = insight.type === "viz";

    const vizInsight = isViz ? (insight as VizInsight) : null;
    const textInsight = !isViz ? (insight as TextInsight) : null;

    // Compute display title
    const displayTitle = isViz
        ? vizInsight!.chart_title
        : getTextInsightTitle(textInsight!);

    return (
        <Card.Root
            data-onboarding="insight-banner"
            data-onboarding-type={isViz ? "viz" : "text"}
            size="sm"
            variant="elevated"
            bg="bg.panel"
            borderWidth="1px"
            borderColor={isViz ? "purple.500" : "blue.500"}
            borderLeftWidth="3px"
            w="100%"
            css={{
                cursor: onExpand ? "pointer" : "default",
            }}
            onClick={() => {
                onExpandClick?.(banner);
                onExpand?.(banner);
            }}
        >
            <Card.Body p="3">
                {/* Header: dismiss button */}
                <HStack justify="space-between" align="start" mb="1.5">
                    {/* Transcript chunk with speaker avatar */}
                    <HStack gap="1.5" flex="1" minW="0">
                        {speaker && (
                            <Avatar.Root
                                size="2xs"
                                colorPalette={pickSpeakerColor(speaker)}
                            >
                                <Avatar.Fallback>{getSpeakerInitials(speaker)}</Avatar.Fallback>
                            </Avatar.Root>
                        )}
                        <Text fontSize="xs" color="fg" lineClamp={2} flex="1">
                            {transcriptChunk?.trim() || "Insight generated from current discussion."}
                        </Text>
                    </HStack>
                    <IconButton
                        aria-label="Dismiss"
                        variant="ghost"
                        size="xs"
                        mt="-1"
                        mr="-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismissClick?.(banner);
                            onDismiss();
                        }}
                    >
                        <LuX />
                    </IconButton>
                </HStack>

                {/* Topic name */}
                <Text fontSize="2xs" color="fg.subtle" lineClamp={1} mb="1.5">
                    {topicName || "New Topic"}
                </Text>

                {/* Type indicator strip — full width colored box */}
                <Box
                    bg={isViz ? "purple.500/10" : "blue.500/10"}
                    borderRadius="md"
                    px="2"
                    py="1.5"
                >
                    {/* Type label */}
                    <HStack gap="1.5" mb="0.5">
                        <Icon
                            as={isViz ? LuChartBar : LuFileText}
                            boxSize="3"
                            color={isViz ? "purple.400" : "blue.400"}
                        />
                        <Text
                            fontSize="2xs"
                            fontWeight="medium"
                            color={isViz ? "purple.400" : "blue.400"}
                        >
                            {isViz ? "Chart Insight" : "Text Insight"}
                        </Text>
                    </HStack>

                    {/* Insight title */}
                    <Text fontSize="sm" fontWeight="semibold" color="fg" lineClamp={2}>
                        {displayTitle}
                    </Text>
                </Box>

                {/* Expand hint */}
                {onExpand && (
                    <HStack justify="flex-end" mt="1.5">
                        <Text fontSize="xs" color="fg.muted">
                            Click to view
                        </Text>
                        <Icon as={LuExternalLink} boxSize="3" color="fg.muted" />
                    </HStack>
                )}
            </Card.Body>
        </Card.Root>
    );
}

// ============= Container Component =============

interface InsightBannerContainerProps {
    banners: InsightBannerState[];
    onDismiss: (id: string) => void;
    onExpandSidebar?: (banner: InsightBannerState) => void;
}

/**
 * Container for insight banners shown when sidebar is collapsed.
 * Positioned as fixed notification banners in top-right corner.
 */
export function InsightBannerContainer({
    banners,
    onDismiss,
    onExpandSidebar,
}: InsightBannerContainerProps) {
    if (banners.length === 0) return null;

    return (
        <Box
            position="fixed"
            top="4"
            right="60px" // Account for collapsed sidebar width + margin
            zIndex="toast"
            display="flex"
            flexDirection="column"
            gap="2"
            maxH="calc(100vh - 32px)"
            overflowY="auto"
            css={{
                // Hide scrollbar but allow scrolling
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                    display: "none",
                },
            }}
        >
            {banners.map((banner) => (
                <InsightBanner
                    key={banner.id}
                    banner={banner}
                    onDismiss={() => onDismiss(banner.id)}
                    onExpand={onExpandSidebar}
                />
            ))}
        </Box>
    );
}
