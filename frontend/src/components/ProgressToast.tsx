"use client";

import { Box, HStack, VStack, Text, IconButton, Icon, Spinner, Avatar } from "@chakra-ui/react";
import { LuX, LuCheck, LuSearch, LuSparkles } from "react-icons/lu";
import { useColorModeValue } from "./ui/color-mode";
import { ShimmerText } from "./ShimmerText";
import { NumberRotator } from "./TextRotator";
import { pickSpeakerColor, getSpeakerInitials } from "@/utils/speakerAvatar";
import type { ProgressToastState } from "@/types/progressToast";

// ============= Keyframes CSS =============

const toastKeyframes = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulseGreen {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
  50% {
    box-shadow: 0 0 12px 2px rgba(34, 197, 94, 0.3);
  }
}

@keyframes pulseGreenLight {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
  50% {
    box-shadow: 0 0 12px 2px rgba(34, 197, 94, 0.15);
  }
}

@keyframes stepSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject keyframes into document head
if (typeof document !== "undefined") {
    const styleId = "progress-toast-keyframes";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = toastKeyframes;
        document.head.appendChild(style);
    }
}

// ============= Component Props =============

interface ProgressToastProps {
    toast: ProgressToastState;
    onDismiss: () => void;
    onDismissClick?: () => void;
}

// ============= Helper Components =============

/**
 * Bullet point indicator for step list
 */
function StepBullet({ isActive, isComplete }: { isActive: boolean; isComplete: boolean }) {
    return (
        <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg={isComplete ? "green.500" : isActive ? "blue.500" : "fg.muted"}
            flexShrink={0}
            mt="1.5"
        />
    );
}

// ============= Main Component =============

/**
 * Progress toast component showing insight generation progress.
 * 
 * Design:
 * - Fixed width for consistency
 * - Initial header: "Recognized to generate insight..." (not a step)
 * - Step 1: "Searching for..." with query list + "Retrieved N documents..."
 * - Step 2: "Generating N insights" with sub-steps for each type
 * - Completion: Green toast with success message
 * 
 * All text has shimmer effect. Steps transition with slide-up animation.
 */
export function ProgressToast({
    toast,
    onDismiss,
    onDismissClick,
}: ProgressToastProps) {
    const {
        stage,
        topicName,
        transcriptChunk,
        speaker,
        queries,
        retrievedDocCount,
        generatorTypes,
        generatedInsightIds,
        generatedGeneratorTypes,
        expectedInsightCount
    } = toast;

    const isComplete = stage === "complete";
    const completeBg = useColorModeValue("green.50", "green.950");
    const completeTextColor = useColorModeValue("green.700", "green.300");
    const completePulse = useColorModeValue("pulseGreenLight", "pulseGreen");

    // Determine which steps to show based on current stage
    // Note: "retrieving" stage was merged into "searching" - doc count shows within search step
    const showSearchStep = stage === "searching" || stage === "creating" || isComplete;
    const showGenerateStep = stage === "creating" || isComplete;
    const isSearchStepActive = stage === "searching";
    const isGenerateStepActive = stage === "creating";
    const queryCount = queries.length;

    return (
        <Box
            data-onboarding="progress-toast"
            bg={isComplete ? completeBg : "bg.panel"}
            borderWidth="1px"
            borderColor={isComplete ? "green.500" : "border.muted"}
            borderRadius="lg"
            p="3"
            shadow="lg"
            w="100%"
            overflow="hidden"
            css={{
                ...(isComplete && {
                    animation: `${completePulse} 2s ease-in-out infinite`,
                }),
            }}
        >
            {/* Header with speaker avatar, transcript chunk, topic name, and dismiss button */}
            <HStack justify="space-between" align="start" mb="2">
                <HStack gap="1.5" flex="1" minW="0" align="start">
                    {speaker && (
                        <Avatar.Root
                            size="2xs"
                            colorPalette={pickSpeakerColor(speaker)}
                            mt="0.5"
                        >
                            <Avatar.Fallback>{getSpeakerInitials(speaker)}</Avatar.Fallback>
                        </Avatar.Root>
                    )}
                    <VStack align="start" gap="0" flex="1" minW="0">
                        <Text fontSize="xs" color="fg" fontWeight="medium" lineClamp={2}>
                            {transcriptChunk?.trim() || "Generating insight for current discussion..."}
                        </Text>
                        <Text fontSize="2xs" color="fg.subtle" lineClamp={1}>
                            {topicName || "New Topic"}
                        </Text>
                    </VStack>
                </HStack>
                <IconButton
                    aria-label="Dismiss"
                    variant="ghost"
                    size="xs"
                    mt="-1"
                    mr="-1"
                    onClick={() => {
                        onDismissClick?.();
                        onDismiss();
                    }}
                >
                    <LuX />
                </IconButton>
            </HStack>

            {/* Initial state: "Recognized to generate insight..." (not a step) */}
            {stage === "generating" && (
                <HStack gap="2" css={{ animation: "stepSlideUp 0.3s ease-out" }}>
                    <Icon as={LuSparkles} boxSize="4" color="blue.400" />
                    <ShimmerText isActive fontSize="sm" fontWeight="medium">
                        Recognized to generate insight...
                    </ShimmerText>
                </HStack>
            )}

            {/* Completion state */}
            {isComplete && (
                <HStack gap="2" css={{ animation: "stepSlideUp 0.3s ease-out" }}>
                    <Box
                        w="5"
                        h="5"
                        borderRadius="full"
                        bg="green.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <LuCheck size={12} color="white" />
                    </Box>
                    <Text fontSize="sm" fontWeight="medium" color={completeTextColor}>
                        {generatedInsightIds.length} insight{generatedInsightIds.length !== 1 ? "s" : ""} generated
                    </Text>
                </HStack>
            )}

            {/* Step list (only shown after generating stage, before complete) */}
            {!isComplete && showSearchStep && (
                <VStack align="stretch" gap="0" mt="2">
                    {/* Step 1: Searching */}
                    <HStack align="start" gap="2" css={{ animation: "stepSlideUp 0.3s ease-out" }}>
                        <StepBullet isActive={isSearchStepActive} isComplete={showGenerateStep} />
                        <VStack align="stretch" gap="1" flex="1">
                            <HStack gap="1.5">
                                <Icon as={LuSearch} boxSize="3.5" color="blue.400" />
                                <ShimmerText isActive={isSearchStepActive} fontSize="sm" fontWeight="medium">
                                    Searching {queryCount} quer{queryCount === 1 ? "y" : "ies"}
                                </ShimmerText>
                            </HStack>

                            {/* Retrieved documents count (shown in same step) */}
                            <Box mt="1">
                                <HStack gap="1">
                                    {showGenerateStep ? (
                                        <Icon as={LuCheck} boxSize="3.5" color="green.500" />
                                    ) : (
                                        <Spinner
                                            size="xs"
                                            color={retrievedDocCount > 0 ? "blue.400" : "fg.subtle"}
                                            borderWidth="2px"
                                        />
                                    )}
                                    <NumberRotator
                                        value={retrievedDocCount}
                                        suffix={` document${retrievedDocCount === 1 ? "" : "s"} retrieved`}
                                        fontSize="xs"
                                        fontWeight="medium"
                                    />
                                </HStack>
                            </Box>
                        </VStack>
                    </HStack>

                    {/* Step 2: Generating */}
                    {showGenerateStep && (
                        <HStack align="start" gap="2" mt="2" css={{ animation: "stepSlideUp 0.3s ease-out" }}>
                            <StepBullet isActive={isGenerateStepActive} isComplete={isComplete} />
                            <VStack align="stretch" gap="1" flex="1">
                                <HStack gap="1.5">
                                    <Icon as={LuSparkles} boxSize="3.5" color="purple.400" />
                                    <ShimmerText isActive={isGenerateStepActive} fontSize="sm" fontWeight="medium">
                                        Generating {expectedInsightCount} insight{expectedInsightCount !== 1 ? "s" : ""}
                                    </ShimmerText>
                                </HStack>

                                {/* Sub-steps for each generator type */}
                                {generatorTypes.length > 0 && (
                                    <VStack align="stretch" gap="1" pl="2">
                                        {generatorTypes.map((type, idx) => {
                                            const isGenerated = generatedGeneratorTypes.includes(type);
                                            return (
                                                <HStack key={type + idx} gap="2">
                                                    <Box
                                                        w="4px"
                                                        h="4px"
                                                        borderRadius="full"
                                                        bg={isGenerated ? "green.500" : "fg.muted"}
                                                        flexShrink={0}
                                                    />
                                                    <ShimmerText
                                                        isActive={!isGenerated && isGenerateStepActive}
                                                        fontSize="xs"
                                                        color={isGenerated ? "green.400" : "fg.muted"}
                                                    >
                                                        {isGenerated ? "Generated" : "Generating"} {type === "viz" ? "Chart" : "Text"} Insight
                                                    </ShimmerText>
                                                </HStack>
                                            );
                                        })}
                                    </VStack>
                                )}
                            </VStack>
                        </HStack>
                    )}
                </VStack>
            )}
        </Box>
    );
}

// ============= Container Component =============

interface ProgressToastContainerProps {
    toasts: ProgressToastState[];
    onDismiss: (id: string) => void;
}

// CSS keyframes for smooth sidebar transition
const sidebarTransitionKeyframes = `
@keyframes toastAttachToSidebar {
  from {
    transform: translateX(20px);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toastDetachFromSidebar {
  from {
    transform: translateX(-20px);
    opacity: 0.8;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`;

// Inject transition keyframes
if (typeof document !== "undefined") {
    const styleId = "progress-toast-sidebar-transition";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = sidebarTransitionKeyframes;
        document.head.appendChild(style);
    }
}

/**
 * Container for multiple progress toasts.
 * 
 * Positioning strategy:
 * - When sidebar is collapsed: Fixed position in top-right corner (like macOS notifications)
 * - When sidebar is expanded: Sticky at top of sidebar content area
 * 
 * Smooth transitions are achieved by:
 * - Using CSS animations for the attach/detach effect
 * - Maintaining consistent Y positioning (top: 4) 
 * - Only animating the X position change
 */
export function ProgressToastContainer({
    toasts,
    onDismiss,
}: ProgressToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <Box
            position="fixed"
            top="4"
            right="60px"
            zIndex="toast"
            display="flex"
            flexDirection="column"
            gap="2"
            css={{
                animation: "toastDetachFromSidebar 0.3s ease-out",
            }}
        >
            {toasts.map((toast) => (
                <ProgressToast
                    key={toast.id}
                    toast={toast}
                    onDismiss={() => onDismiss(toast.id)}
                />
            ))}
        </Box>
    );
}
