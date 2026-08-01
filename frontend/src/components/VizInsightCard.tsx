
"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { Box, Card, Text, HStack, IconButton, Icon, Portal } from "@chakra-ui/react";
import { LuPin, LuPinOff, LuArchive, LuEye, LuExpand, LuX, LuQuote, LuSparkles } from "react-icons/lu";
import { useVegaEmbed } from "react-vega";
import type { VizInsight } from "@/types";
import type { VisualizationSpec } from "vega-embed";
import { renderCitationChips } from "@/utils/parseCitations";
import type { CitationClickContext } from "@/utils/parseCitations";

const vegaTooltipZIndexFix = `
.vg-tooltip {
    z-index: 2000 !important;
}
`;

if (typeof document !== "undefined") {
    const styleId = "vega-tooltip-zindex-fix";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = vegaTooltipZIndexFix;
        document.head.appendChild(style);
    }
}

// Note: Glow keyframes removed — unseen cards now use green border + "New!" badge

interface VizInsightCardProps {
    insight: VizInsight;
    isHighlighted?: boolean;
    isPinned?: boolean;
    isSelected?: boolean;
    isShowingTranscript?: boolean;
    isFocused?: boolean;
    onPin?: () => void;
    onDismiss?: () => void;
    onShowTranscript?: () => void;
    onCitationClick?: (url: string, context?: CitationClickContext) => void;
    onExpandChange?: (expanded: boolean) => void;
    timestamp?: string;
    // Seen tracking props
    isSeen?: boolean;
    registerRef?: (element: HTMLElement | null) => void;
    forceCollapseKey?: number;
}

const CHART_SCALE = 0.5;
const INTERNAL_WIDTH = 700;

const LABEL_ROTATE_THRESHOLD = 6;

interface LabelAnalysis {
    xMaxLen: number;
    yMaxLen: number;
    xIsText: boolean;
    yIsText: boolean;
}

/**
 * Analyze the spec to find max label lengths for x and y axes.
 * Only counts text (ordinal/nominal) axes — quantitative tick labels are short.
 */
function analyzeSpecLabels(spec: Record<string, unknown>): LabelAnalysis {
    const data = spec.data as Record<string, unknown> | undefined;
    const values = (data?.values as Record<string, unknown>[]) || [];

    let xField: string | null = null;
    let yField: string | null = null;
    let xIsText = false;
    let yIsText = false;

    function findFields(obj: unknown) {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) { obj.forEach(findFields); return; }
        const rec = obj as Record<string, unknown>;
        if (rec.encoding) {
            const enc = rec.encoding as Record<string, unknown>;
            if (enc.x && typeof enc.x === "object") {
                const xEnc = enc.x as Record<string, unknown>;
                if (!xField) {
                    xField = xEnc.field as string;
                    xIsText = ["nominal", "ordinal"].includes(xEnc.type as string);
                }
            }
            if (enc.y && typeof enc.y === "object") {
                const yEnc = enc.y as Record<string, unknown>;
                if (!yField) {
                    yField = yEnc.field as string;
                    yIsText = ["nominal", "ordinal"].includes(yEnc.type as string);
                }
            }
        }
        if (rec.layer) findFields(rec.layer);
        if (rec.hconcat) findFields(rec.hconcat);
        if (rec.vconcat) findFields(rec.vconcat);
        if (rec.spec) findFields(rec.spec);
    }
    findFields(spec);

    let xMaxLen = 0;
    let yMaxLen = 0;
    for (const row of values) {
        if (xField && row[xField] != null) {
            xMaxLen = Math.max(xMaxLen, String(row[xField]).length);
        }
        if (yField && row[yField] != null) {
            yMaxLen = Math.max(yMaxLen, String(row[yField]).length);
        }
    }

    return { xMaxLen, yMaxLen, xIsText, yIsText };
}

function adjustSpecForSidebar(
    obj: unknown,
    analysis: LabelAnalysis,
    parentKey?: string,
): unknown {
    if (obj === null || obj === undefined || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map((item) => adjustSpecForSidebar(item, analysis, parentKey));

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (key === "legend" && typeof value === "object" && value !== null) {
            const legend = value as Record<string, unknown>;
            result[key] = {
                ...legend,
                orient: "bottom",
                direction: "vertical",
                columns: 1,
                offset: 50,        // gap between chart/axis and legend
                rowPadding: 15,      // space between legend rows
                symbolSize: 80,     // slightly larger symbols
                labelOffset: 4,     // gap between symbol and label text
                //       direction: "horizontal",
                // offset: 20,
                // symbolSize: 80,
                // labelOffset: 4,
            };
        } else if (key === "axis" && typeof value === "object" && value !== null) {
            const { labelAngle, ...axisRest } = value as Record<string, unknown>;

            // Determine rotation based on which encoding channel we're in
            let angle: number | undefined = undefined;
            if (parentKey === "x" && analysis.xIsText && analysis.xMaxLen > LABEL_ROTATE_THRESHOLD) {
                angle = -45;
            } else if (parentKey === "y" && analysis.yIsText && analysis.yMaxLen > LABEL_ROTATE_THRESHOLD) {
                angle = -45;
            }

            result[key] = {
                ...axisRest,
                titlePadding: 30,
                labelPadding: 6,
                labelLimit: 180,   // truncate long axis labels
                titleLimit: 200,   // truncate long axis titles
                ...(angle !== undefined ? { labelAngle: angle } : {}),
            };
        } else if (key === "mark" && typeof value === "object" && value !== null) {
            // Prevent marks/text from being clipped at chart edges
            result[key] = {
                ...(value as Record<string, unknown>),
                clip: false,
            };
        } else if (key === "x" || key === "y") {
            // Pass encoding channel name as context so child "axis" knows which channel
            result[key] = adjustSpecForSidebar(value, analysis, key);
        } else {
            result[key] = adjustSpecForSidebar(value, analysis, parentKey);
        }
    }
    return result;
}

/**
 * Calculate left padding based on y-axis label length.
 */
function calculatePadding(analysis: LabelAnalysis): {
    top: number; bottom: number; left: number; right: number;
} {
    const charWidth = 7;

    // Left padding based on y-axis labels
    let leftPadding = 60;
    if (analysis.yIsText) {
        if (analysis.yMaxLen > LABEL_ROTATE_THRESHOLD) {
            leftPadding = Math.min(analysis.yMaxLen * charWidth * 0.7, 200);
        } else {
            leftPadding = Math.min(analysis.yMaxLen * charWidth, 200);
        }
    }

    // Bottom padding based on x-axis labels
    let bottomPadding = 20;
    if (analysis.xIsText) {
        if (analysis.xMaxLen > LABEL_ROTATE_THRESHOLD) {
            // Rotated at -45°: vertical extent ≈ length * charWidth * sin(45°)
            bottomPadding = Math.min(analysis.xMaxLen * charWidth * 0.7, 180);
        } else {
            // Short horizontal labels — just a small bump
            bottomPadding = 30;
        }
    }

    return {
        top: 20,
        bottom: Math.round(bottomPadding),
        left: Math.round(leftPadding),
        right: 90,
    };
}

export function VizInsightCard({
    insight,
    isHighlighted,
    isPinned,
    isSelected,
    isShowingTranscript,
    isFocused,
    onPin,
    onDismiss,
    onShowTranscript,
    onCitationClick,
    onExpandChange,
    timestamp,
    isSeen = true,
    registerRef,
    forceCollapseKey,
}: VizInsightCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const lastForceCollapseKeyRef = useRef<number | undefined>(forceCollapseKey);

    useEffect(() => {
        if (forceCollapseKey === undefined) return;
        if (lastForceCollapseKeyRef.current === forceCollapseKey) return;

        lastForceCollapseKeyRef.current = forceCollapseKey;
        if (!isChartExpanded) return;
        setIsChartExpanded(false);
        onExpandChange?.(false);
    }, [forceCollapseKey, isChartExpanded, onExpandChange]);

    // Register the card element for visibility tracking
    useEffect(() => {
        if (registerRef) {
            registerRef(cardRef.current);
        }
        return () => {
            if (registerRef) {
                registerRef(null);
            }
        };
    }, [registerRef]);

    const spec = useMemo(() => {
        if (!insight.data) return null;
        return buildVizSidebarSpec(insight);
    }, [insight]);
    const citationChips = useMemo(
        () =>
            renderCitationChips(insight.cited_documents, onCitationClick, {
                insightId: insight.id,
                topicId: insight.thread?.topic_id,
            }),
        [insight.cited_documents, insight.id, insight.thread?.topic_id, onCitationClick]
    );

    const cardAnimation = [
        isSelected ? "selectedGlowPulse 2.8s ease-in-out infinite" : null,
        isFocused ? "focusFlash 2s ease-in-out" : null,
    ].filter(Boolean).join(", ") || undefined;

    return (
        <Card.Root
            ref={cardRef}
            data-onboarding="viz-insight-card"
            size="sm"
            variant="outline"
            bg="bg.muted"
            w="100%"
            borderLeftWidth="3px"
            borderLeftColor={
                isHighlighted
                    ? "blue.500"
                    : isShowingTranscript
                        ? "purple.500"
                        : "transparent"
            }
            borderWidth={!isSeen && !isPinned ? "1.5px" : undefined}
            borderColor={
                !isSeen && !isPinned
                    ? "green.500"
                    : isSelected
                        ? "blue.300"
                        : undefined
            }
            boxShadow={
                isSelected
                    ? "0 0 0 1px color-mix(in srgb, var(--chakra-colors-blue-400) 75%, transparent), 0 10px 26px color-mix(in srgb, var(--chakra-colors-blue-400) 22%, transparent), 0 0 18px color-mix(in srgb, var(--chakra-colors-blue-300) 18%, transparent)"
                    : isShowingTranscript
                        ? "md"
                        : undefined
            }
            transform={isSelected ? "translateY(-2px)" : undefined}
            transition="box-shadow 0.28s ease, transform 0.28s ease, border-color 0.2s ease"
            overflow="hidden"
            animation={cardAnimation}
            css={cardAnimation ? {
                "@keyframes selectedGlowPulse": {
                    "0%": {
                        boxShadow: "0 0 0 1px color-mix(in srgb, var(--chakra-colors-blue-400) 70%, transparent), 0 8px 22px color-mix(in srgb, var(--chakra-colors-blue-400) 18%, transparent), 0 0 14px color-mix(in srgb, var(--chakra-colors-blue-300) 14%, transparent)",
                    },
                    "50%": {
                        boxShadow: "0 0 0 1px color-mix(in srgb, var(--chakra-colors-blue-400) 82%, transparent), 0 12px 30px color-mix(in srgb, var(--chakra-colors-blue-400) 26%, transparent), 0 0 22px color-mix(in srgb, var(--chakra-colors-blue-300) 22%, transparent)",
                    },
                    "100%": {
                        boxShadow: "0 0 0 1px color-mix(in srgb, var(--chakra-colors-blue-400) 70%, transparent), 0 8px 22px color-mix(in srgb, var(--chakra-colors-blue-400) 18%, transparent), 0 0 14px color-mix(in srgb, var(--chakra-colors-blue-300) 14%, transparent)",
                    },
                },
                "@keyframes focusFlash": {
                    "0%": { boxShadow: "0 0 0 0px var(--chakra-colors-blue-400)" },
                    "15%": { boxShadow: "0 0 0 3px var(--chakra-colors-blue-400)" },
                    "30%": { boxShadow: "0 0 0 0px var(--chakra-colors-blue-400)" },
                    "45%": { boxShadow: "0 0 0 3px var(--chakra-colors-blue-400)" },
                    "60%": { boxShadow: "0 0 0 0px var(--chakra-colors-blue-400)" },
                    "100%": { boxShadow: "0 0 0 0px transparent" },
                },
            } : undefined}
        >
            <Card.Body py="3" px="3">
                <HStack justify="space-between" align="start" mb="2">
                    <Box flex="1" minW="0" overflow="hidden">
                        {timestamp && (
                            <HStack gap="1" mb="1">
                                <Text fontSize="xs" color="fg.subtle">
                                    {timestamp}
                                </Text>
                                <Text fontSize="xs" color="fg.subtle">•</Text>
                                {isSeen ? (
                                    <>
                                        <Icon as={LuEye} boxSize="3" color="fg.subtle" />
                                        <Text fontSize="xs" color="fg.subtle">Seen</Text>
                                    </>
                                ) : (
                                    <>
                                        <Icon as={LuSparkles} boxSize="3" color="green.500" />
                                        <Text fontSize="xs" fontWeight="bold" color="green.500">New!</Text>
                                    </>
                                )}
                            </HStack>
                        )}
                        {insight.chart_title && (
                            <Text fontSize="sm" fontWeight="medium">
                                {insight.chart_title}
                            </Text>
                        )}
                    </Box>
                    <HStack gap="1" flexShrink={0}>
                        <IconButton
                            data-onboarding="viz-expand-button"
                            aria-label="Expand chart"
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsChartExpanded(true);
                                // Emit expansion after the modal portal has had a chance to mount.
                                window.setTimeout(() => {
                                    onExpandChange?.(true);
                                }, 0);
                            }}
                        >
                            <LuExpand />
                        </IconButton>
                        {onShowTranscript && (
                            <IconButton
                                aria-label="Show transcript chunk"
                                variant="ghost"
                                size="xs"
                                color={isShowingTranscript ? "purple.500" : undefined}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShowTranscript();
                                }}
                            >
                                <LuQuote />
                            </IconButton>
                        )}
                        {onPin && (
                            <IconButton
                                aria-label={isPinned ? "Unpin insight" : "Pin insight"}
                                variant="ghost"
                                size="xs"
                                color={isPinned ? "orange.500" : undefined}
                                onClick={(e) => { e.stopPropagation(); onPin(); }}
                            >
                                {isPinned ? <LuPinOff /> : <LuPin />}
                            </IconButton>
                        )}
                        {onDismiss && (
                            <IconButton
                                aria-label="Dismiss insight"
                                variant="ghost"
                                size="xs"
                                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                            >
                                <LuArchive />
                            </IconButton>
                        )}
                    </HStack>
                </HStack>

                <Box position="relative">
                    <VizInsightChartPreview insight={insight} scale={CHART_SCALE} spec={spec} />
                </Box>

                {(insight.subtitle || citationChips.length > 0) && (
                    <Box fontSize="xs" color="fg.muted" mt="2" lineHeight="short">
                        {insight.subtitle}
                        {insight.subtitle && citationChips.length > 0 ? " " : null}
                        {citationChips}
                    </Box>
                )}
            </Card.Body>

            {isChartExpanded && (
                <Portal>
                    <Box
                        data-onboarding="viz-expanded-view"
                        position="fixed"
                        top="0"
                        left="0"
                        right="0"
                        bottom="0"
                        bg="blackAlpha.600"
                        zIndex="modal"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => {
                            onExpandChange?.(false);
                            setIsChartExpanded(false);
                        }}
                    >
                        <Card.Root
                            width="fit-content"
                            maxW="calc(100vw - 32px)"
                            maxH="calc(100vh - 32px)"
                            overflow="auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Card.Body p="4">
                                <HStack justify="space-between" mb="3">
                                    <Text fontSize="md" fontWeight="semibold" lineClamp={1}>
                                        {insight.chart_title}
                                    </Text>
                                    <IconButton
                                        data-onboarding="viz-expanded-close-button"
                                        aria-label="Close expanded chart"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            onExpandChange?.(false);
                                            setIsChartExpanded(false);
                                        }}
                                    >
                                        <LuX />
                                    </IconButton>
                                </HStack>
                                <Box width={`${INTERNAL_WIDTH}px`} maxW="calc(100vw - 64px)">
                                    <VizInsightChartPreview insight={insight} scale={1} spec={spec} />
                                </Box>
                            </Card.Body>
                        </Card.Root>
                    </Box>
                </Portal>
            )}
        </Card.Root>
    );
}

export function buildVizSidebarSpec(insight: VizInsight): VisualizationSpec {
    const baseData = insight.data as Record<string, unknown> | undefined;
    if (!baseData || typeof baseData !== "object") {
        console.warn(
            `[VizInsightCard] insight ${insight.id} has no valid data – returning empty spec`,
        );
        return { width: INTERNAL_WIDTH, height: 450 } as VisualizationSpec;
    }
    const { config, ...restSpec } = baseData;


    const analysis = analyzeSpecLabels(baseData);
    const adjustedSpec = adjustSpecForSidebar(restSpec, analysis) as Record<string, unknown>;
    const existingConfig = (config as Record<string, unknown>) || {};

    const sidebarConfig = {
        ...existingConfig,
        view: {
            ...((existingConfig.view as Record<string, unknown>) || {}),
            strokeWidth: 0,
            clip: false, // prevent clipping of marks/text at edges
        },
        mark: { clip: false },
        legend: {
            orient: "bottom",
            direction: "horizontal",
            symbolSize: 80,
            labelOffset: 4,
            offset: 20,
        },
    };

    const padding = calculatePadding(analysis);

    return {
        ...adjustedSpec,
        width: INTERNAL_WIDTH,
        height: 450,
        // padding: { top: 15, bottom: 30, left: 60, right: 90 },
        padding: padding,
        config: sidebarConfig,
        autosize: { type: "fit", contains: "padding" },
    } as VisualizationSpec;
}

interface VizInsightChartPreviewProps {
    insight: VizInsight;
    scale?: number;
    spec?: VisualizationSpec | null;
    maxHeight?: number;
}

export function VizInsightChartPreview({
    insight,
    scale = CHART_SCALE,
    spec,
    maxHeight,
}: VizInsightChartPreviewProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const [chartHeight, setChartHeight] = useState<number>(0);

    const resolvedSpec = useMemo(
        () => spec ?? (insight.data ? buildVizSidebarSpec(insight) : null),
        [spec, insight],
    );

    const embed = useVegaEmbed({
        ref: chartRef,
        spec: resolvedSpec ?? ({ width: INTERNAL_WIDTH, height: 200 } as VisualizationSpec),
        options: {
            actions: false,
            renderer: "svg",
            tooltip: true,
            mode: "vega-lite",
        },
    });

    useEffect(() => {
        if (!chartRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const scaledHeight = entry.contentRect.height * scale;
                setChartHeight(maxHeight ? Math.min(scaledHeight, maxHeight) : scaledHeight);
            }
            if (embed) embed.view.runAsync();
        });
        observer.observe(chartRef.current);
        return () => observer.disconnect();
    }, [embed, scale, maxHeight]);

    return (
        <Box
            width="100%"
            overflow="hidden"
            style={{ height: chartHeight || "auto" }}
        >
            <div
                ref={chartRef}
                style={{
                    width: `${100 / scale}%`,
                    transformOrigin: "top left",
                    transform: `scale(${scale})`,
                }}
            />
        </Box>
    );
}