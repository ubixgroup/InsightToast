"use client";

import { useEffect, useMemo, useRef } from "react";
import Joyride from "react-joyride";
import type { CallBackProps, Step, TooltipRenderProps } from "react-joyride";
import { Box, Text, HStack, Button } from "@chakra-ui/react";

// ============= Types =============

interface OnboardingTourProps {
    steps: Step[];
    stepIndex: number;
    run: boolean;
    onCallback: (data: CallBackProps) => void;
    /** Dynamic content for the progress toast step */
    progressSubtext: string;
    onboardingPhase?: string;
    regeneratedInsightsMode?: "toast-progress" | "toast-banners" | "sidebar-final";
    regeneratedInsightsSubtext?: string;
    /** Called when the user clicks Next on the progress-toast step (bypasses Joyride callback) */
    onAdvanceProgress?: () => void;
}

// ============= Knowledge Base Bullet List =============

const KB_CONTENT_LIST = [
    "* Debates from past parliamentary meetings",
    "* Bills and proposed legislation",
    "* Library of Parliament research papers and studies",
    "* Petitions submitted to Parliament",
    "* Past votes and division records",
];

// ============= Custom Tooltip =============

function OnboardingTooltip({
    continuous,
    index,
    step,
    size,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
    isLastStep,
    onAdvanceProgress,
}: TooltipRenderProps & { onAdvanceProgress?: () => void }) {
    const data = (step.data ?? {}) as Record<string, unknown>;
    const hideNext = data.hideNext === true;
    const hideBack = data.hideBack === true;
    const actionHint = data.actionHint as string | undefined;
    const nextLabel = (data.nextLabel as string | undefined) ?? (isLastStep ? "Finish" : "Next");
    const smallText = data.smallText as string | undefined;
    const phase = data.phase as string | undefined;

    // For the KB info step, render the bullet list
    const isKbStep = phase === "citation-kb-info";
    // For the progress-toast step, Next bypasses Joyride and calls advanceProgressStage directly
    const isProgressStep = phase === "progress-toast";

    return (
        <Box
            {...tooltipProps}
            bg="gray.900"
            color="white"
            borderRadius="xl"
            boxShadow="0 8px 32px rgba(0,0,0,0.4)"
            w="min(420px, calc(100vw - 48px))"
            maxH="calc(100vh - 24px)"
            overflowY="auto"
            p="5"
            position="relative"
        >
            {/* Title */}
            {step.title && (
                <Text fontSize="lg" fontWeight="bold" mb="2">
                    {step.title as string}
                </Text>
            )}

            {/* Content */}
            {isKbStep ? (
                <Box mb="3">
                    <Text fontSize="md" lineHeight="tall" mb="2">
                        The documents in this knowledge base include:
                    </Text>
                    <Box as="ul" pl="4" fontSize="md" lineHeight="tall">
                        {KB_CONTENT_LIST.map((item) => (
                            <Box as="li" key={item} mb="1">
                                {item}
                            </Box>
                        ))}
                    </Box>
                </Box>
            ) : step.content ? (
                <Text fontSize="md" lineHeight="tall" mb={smallText ? "1" : "3"}>
                    {step.content as string}
                </Text>
            ) : null}

            {/* Small muted text (e.g., parliament explanation) */}
            {smallText && (
                <Text fontSize="sm" color="whiteAlpha.700" lineHeight="tall" mb="3">
                    {smallText}
                </Text>
            )}

            {/* Action hint (for steps that wait for user interaction) */}
            {actionHint && (
                <Text fontSize="sm" color="blue.300" fontStyle="italic" mb="3">
                    {actionHint}
                </Text>
            )}

            {/* Footer: progress + buttons */}
            <HStack justify="space-between" align="center">
                {/* Step counter */}
                <Text fontSize="xs" color="whiteAlpha.500">
                    {index + 1} / {size}
                </Text>

                <HStack gap="2">
                    {/* Skip button */}
                    <Button
                        {...skipProps}
                        size="sm"
                        variant="ghost"
                        color="whiteAlpha.600"
                        _hover={{ color: "white", bg: "whiteAlpha.200" }}
                    >
                        End Tour
                    </Button>

                    {/* Back button */}
                    {index > 0 && !hideBack && (
                        <Button
                            {...backProps}
                            size="sm"
                            variant="outline"
                            borderColor="whiteAlpha.300"
                            color="white"
                            _hover={{ bg: "whiteAlpha.200" }}
                        >
                            Back
                        </Button>
                    )}

                    {/* Next button */}
                    {continuous && !hideNext && (
                        <Button
                            {...primaryProps}
                            onClick={
                                isProgressStep && onAdvanceProgress
                                    ? (e: React.MouseEvent) => { e.preventDefault(); onAdvanceProgress(); }
                                    : primaryProps.onClick
                            }
                            size="sm"
                            colorPalette="blue"
                            variant="solid"
                        >
                            {nextLabel}
                        </Button>
                    )}
                </HStack>
            </HStack>
        </Box>
    );
}

// ============= Main Component =============

export function OnboardingTour({
    steps,
    stepIndex,
    run,
    onCallback,
    progressSubtext,
    onboardingPhase,
    regeneratedInsightsMode,
    regeneratedInsightsSubtext,
    onAdvanceProgress,
}: OnboardingTourProps) {
    // Use a ref so the stable tooltip component always reads the latest callback
    const advanceRef = useRef(onAdvanceProgress);
    advanceRef.current = onAdvanceProgress;

    // Stable tooltip component — never recreated, reads latest callback via ref
    const TooltipComponent = useMemo(
        () => function TooltipWrapper(props: TooltipRenderProps) {
            return <OnboardingTooltip {...props} onAdvanceProgress={() => advanceRef.current?.()} />;
        },
        [],
    );

    // Dynamically update the progress toast step content
    const patchedSteps = steps.map((step) => {
        const data = (step.data ?? {}) as Record<string, unknown>;
        if (data.phase === "progress-toast") {
            return { ...step, content: progressSubtext };
        }

        if (data.phase === "regenerated-insights" && onboardingPhase === "regenerated-insights") {
            const mode = regeneratedInsightsMode ?? "sidebar-final";
            const targetByMode: Record<typeof mode, string> = {
                "toast-progress": '[data-onboarding="progress-toast"]',
                "toast-banners": '[data-onboarding="toast-container"]',
                "sidebar-final": '[data-onboarding-regenerated-target="true"]',
            };
            const placementByMode: Record<typeof mode, Step["placement"]> = {
                "toast-progress": "bottom",
                "toast-banners": "bottom",
                "sidebar-final": "left",
            };

            return {
                ...step,
                target: targetByMode[mode],
                placement: placementByMode[mode],
                content: regeneratedInsightsSubtext ?? step.content,
                data: {
                    ...data,
                    hideNext: mode !== "sidebar-final",
                    hideBack: true,
                },
            };
        }
        return step;
    });

    useEffect(() => {
        if (!run) {
            return;
        }

        const previousHtmlOverflowX = document.documentElement.style.overflowX;
        const previousHtmlOverflowY = document.documentElement.style.overflowY;
        const previousBodyOverflowX = document.body.style.overflowX;
        const previousBodyOverflowY = document.body.style.overflowY;
        document.documentElement.style.overflowX = "hidden";
        document.documentElement.style.overflowY = "hidden";
        document.body.style.overflowX = "hidden";
        document.body.style.overflowY = "hidden";

        return () => {
            document.documentElement.style.overflowX = previousHtmlOverflowX;
            document.documentElement.style.overflowY = previousHtmlOverflowY;
            document.body.style.overflowX = previousBodyOverflowX;
            document.body.style.overflowY = previousBodyOverflowY;
        };
    }, [run]);

    return (
        <Joyride
            steps={patchedSteps}
            stepIndex={stepIndex}
            run={run}
            callback={onCallback}
            continuous
            showSkipButton
            disableCloseOnEsc={false}
            disableOverlayClose
            disableScrolling
            disableScrollParentFix
            scrollToFirstStep={false}
            spotlightPadding={10}
            tooltipComponent={TooltipComponent}
            floaterProps={{
                disableAnimation: false,
                options: {
                    preventOverflow: {
                        boundariesElement: "viewport",
                    },
                },
                styles: {
                    floater: {
                        filter: "none",
                        maxWidth: "calc(100vw - 48px)",
                    },
                },
            }}
            styles={{
                options: {
                    zIndex: 10000,
                    arrowColor: "#1a202c", // gray.900 to match tooltip bg
                },
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
                spotlight: {
                    borderRadius: "12px",
                },
            }}
        />
    );
}
