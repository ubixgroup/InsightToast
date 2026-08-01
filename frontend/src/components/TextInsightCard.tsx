"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Box, Card, Text, HStack, IconButton, Icon, Spinner, Portal } from "@chakra-ui/react";
import { LuPin, LuPinOff, LuArchive, LuEye, LuQuote, LuSparkles, LuSparkle } from "react-icons/lu";
import { parseCitations } from "@/utils/parseCitations";
import { explainTextV2 } from "@/services/v2Api";
import type { CitationClickContext } from "@/utils/parseCitations";
import type { TextInsight } from "@/types";

interface TextInsightCardProps {
    insight: TextInsight;
    isHighlighted?: boolean;
    isPinned?: boolean;
    isSelected?: boolean;
    isShowingTranscript?: boolean;
    isFocused?: boolean;
    onPin?: () => void;
    onDismiss?: () => void;
    onShowTranscript?: () => void;
    onCitationClick?: (url: string, context?: CitationClickContext) => void;
    timestamp?: string;
    isSeen?: boolean;
    registerRef?: (element: HTMLElement | null) => void;
    isExplainEnabled?: boolean;
    conversationId?: string | null;
    clientId?: string | null;
    onOnboardingAction?: (action: "quote-click" | "pin-click" | "archive-click" | "text-selected" | "explain-click") => void;
    isPrimaryOnboardingQuoteTarget?: boolean;
}

export function TextInsightCard({
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
    timestamp,
    isSeen = true,
    registerRef,
    isExplainEnabled = false,
    conversationId,
    clientId,
    onOnboardingAction,
    isPrimaryOnboardingQuoteTarget = false,
}: TextInsightCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const [selectedText, setSelectedText] = useState<string | null>(null);
    const [explainPopoverPos, setExplainPopoverPos] = useState<{ top: number; left: number } | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [explainError, setExplainError] = useState<string | null>(null);
    const explainPopoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isExplainEnabled) return;

        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || !cardRef.current) {
                return;
            }

            const range = selection.getRangeAt(0);
            if (!cardRef.current.contains(range.commonAncestorContainer)) {
                return;
            }

            const text = selection.toString().trim();
            if (text.length < 3 || text.length > 500) {
                return;
            }

            const rect = range.getBoundingClientRect();
            setSelectedText(text);
            setExplanation(null);
            setExplainError(null);
            setExplainPopoverPos({
                top: rect.top,
                left: rect.left + rect.width / 2,
            });
            onOnboardingAction?.("text-selected");
        };

        const card = cardRef.current;
        card?.addEventListener("mouseup", handleMouseUp);
        return () => {
            card?.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isExplainEnabled, onOnboardingAction]);

    useEffect(() => {
        if (!explainPopoverPos) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (explainPopoverRef.current && !explainPopoverRef.current.contains(event.target as Node)) {
                setSelectedText(null);
                setExplainPopoverPos(null);
                setExplanation(null);
                setExplainError(null);
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [explainPopoverPos]);

    const handleExplain = useCallback(async () => {
        if (!selectedText || !conversationId || !clientId) return;

        setIsExplaining(true);
        setExplainError(null);

        try {
            const response = await explainTextV2({
                conversationId,
                clientId,
                text: selectedText,
            });
            setExplanation(response.explanation);
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to get explanation.";
            setExplainError(msg);
        } finally {
            setIsExplaining(false);
        }
    }, [selectedText, conversationId, clientId]);

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

    const contentNodes = parseCitations(
        insight.content,
        insight.cited_documents,
        onCitationClick,
        {
            insightId: insight.id,
            topicId: insight.thread?.topic_id,
        }
    );

    const cardAnimation = [
        isSelected ? "selectedGlowPulse 2.8s ease-in-out infinite" : null,
        isFocused ? "focusFlash 2s ease-in-out" : null,
    ].filter(Boolean).join(", ") || undefined;

    return (
        <Card.Root
            ref={cardRef}
            data-onboarding="text-insight-card"
            data-insight-id={insight.id}
            data-onboarding-primary={isPrimaryOnboardingQuoteTarget ? "true" : undefined}
            size="sm"
            variant="outline"
            bg="bg.muted"
            position="relative"
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
                <HStack justify="space-between" mb="1" gap="1">
                    {timestamp && (
                        <HStack gap="1">
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
                    <HStack gap="1" ml="auto">
                        {onShowTranscript && (
                            <IconButton
                                data-onboarding="insight-quote-button"
                                data-onboarding-primary={isPrimaryOnboardingQuoteTarget ? "true" : undefined}
                                aria-label="Show transcript chunk"
                                variant="ghost"
                                size="xs"
                                color={isShowingTranscript ? "purple.500" : undefined}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onOnboardingAction?.("quote-click");
                                    onShowTranscript();
                                }}
                            >
                                <LuQuote />
                            </IconButton>
                        )}
                        {onPin && (
                            <IconButton
                                data-onboarding="insight-pin-button"
                                data-onboarding-primary={isPrimaryOnboardingQuoteTarget ? "true" : undefined}
                                aria-label={isPinned ? "Unpin insight" : "Pin insight"}
                                variant="ghost"
                                size="xs"
                                color={isPinned ? "orange.500" : undefined}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onOnboardingAction?.("pin-click");
                                    onPin();
                                }}
                            >
                                {isPinned ? <LuPinOff /> : <LuPin />}
                            </IconButton>
                        )}
                        {onDismiss && (
                            <IconButton
                                data-onboarding="insight-archive-button"
                                data-onboarding-primary={isPrimaryOnboardingQuoteTarget ? "true" : undefined}
                                aria-label="Dismiss insight"
                                variant="ghost"
                                size="xs"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onOnboardingAction?.("archive-click");
                                    onDismiss();
                                }}
                            >
                                <LuArchive />
                            </IconButton>
                        )}
                    </HStack>
                </HStack>

                {insight.title && insight.title.trim().length > 0 && (
                    <Text fontSize="sm" fontWeight="semibold" color="fg" mb="1">
                        {insight.title.trim()}
                    </Text>
                )}

                <Box fontSize="sm" lineHeight="tall">
                    {contentNodes}
                </Box>

                {isExplainEnabled && explainPopoverPos && selectedText && (
                    <Portal>
                        <Box
                            data-onboarding="explain-tooltip"
                            ref={explainPopoverRef}
                            data-no-card-select="true"
                            position="fixed"
                            top={`${Math.max(12, explainPopoverPos.top)}px`}
                            left={`${explainPopoverPos.left}px`}
                            transform="translate(-50%, calc(-100% - 8px))"
                            zIndex={3000}
                            bg="bg.panel"
                            borderWidth="1px"
                            borderColor="border.muted"
                            borderRadius="lg"
                            boxShadow="xl"
                            p="3"
                            maxW="400px"
                            minW="200px"
                        >
                            {!explanation && !isExplaining && !explainError && (
                                <HStack gap="2">
                                    <IconButton
                                        data-onboarding="explain-button"
                                        aria-label="Explain selected text"
                                        size="sm"
                                        variant="subtle"
                                        colorPalette="purple"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onOnboardingAction?.("explain-click");
                                            void handleExplain();
                                        }}
                                    >
                                        <LuSparkle />
                                    </IconButton>
                                    <Text fontSize="xs" color="fg.muted" lineClamp={1} flex="1">
                                        Explain "{selectedText.slice(0, 40)}{selectedText.length > 40 ? "..." : ""}"
                                    </Text>
                                </HStack>
                            )}
                            {isExplaining && (
                                <HStack gap="2" py="1">
                                    <Spinner size="sm" />
                                    <Text fontSize="sm" color="fg.muted">Explaining...</Text>
                                </HStack>
                            )}
                            {explanation && (
                                <Box>
                                    <HStack gap="1" mb="1">
                                        <Icon as={LuSparkle} boxSize="3.5" color="purple.500" />
                                        <Text fontSize="xs" fontWeight="semibold" color="purple.fg">Explanation</Text>
                                    </HStack>
                                    <Text fontSize="xs" lineHeight="tall" whiteSpace="pre-wrap">
                                        {explanation}
                                    </Text>
                                </Box>
                            )}
                            {explainError && (
                                <Text fontSize="sm" color="red.500">{explainError}</Text>
                            )}
                        </Box>
                    </Portal>
                )}
            </Card.Body>
        </Card.Root>
    );
}
