"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Text } from "@chakra-ui/react";

// ============= Fade Keyframes CSS =============

const fadeKeyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}
`;

// Inject keyframes into document head (only once)
if (typeof document !== "undefined") {
    const styleId = "text-rotator-keyframes";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = fadeKeyframes;
        document.head.appendChild(style);
    }
}

// ============= Component Props =============

interface TextRotatorProps {
    texts: string[];
    intervalMs?: number;
    prefix?: string;
    fontSize?: string;
    color?: string;
    maxLength?: number;
}

// ============= Component =============

/**
 * Component that rotates through a list of text strings with fade animations.
 * Used in the progress toast to show search queries rotating through.
 * 
 * Features:
 * - Smooth fade in/out transitions between texts
 * - Optional prefix (e.g., "Searching for...")
 * - Auto-advances through the list
 * - Truncates long text with ellipsis
 */
export function TextRotator({
    texts,
    intervalMs = 3000,
    prefix,
    fontSize = "sm",
    color = "fg.muted",
    maxLength = 60,
}: TextRotatorProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Handle text rotation
    useEffect(() => {
        if (texts.length <= 1) return;

        const rotate = () => {
            // First fade out
            setIsVisible(false);

            // Then change text and fade in
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % texts.length);
                setIsVisible(true);
            }, 300); // Match fadeOut animation duration
        };

        timerRef.current = setInterval(rotate, intervalMs);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [texts.length, intervalMs]);

    // Reset index when texts change
    useEffect(() => {
        setCurrentIndex(0);
        setIsVisible(true);
    }, [texts]);

    if (texts.length === 0) return null;

    const currentText = texts[currentIndex] || "";
    const displayText = currentText.length > maxLength
        ? currentText.slice(0, maxLength) + "..."
        : currentText;

    return (
        <Box overflow="hidden" position="relative" minH="1.5em">
            <Text
                fontSize={fontSize}
                color={color}
                lineClamp={1}
                css={{
                    animation: isVisible ? "fadeIn 0.3s ease-out" : "fadeOut 0.3s ease-out",
                }}
            >
                {prefix && (
                    <Box as="span" fontWeight="medium" mr="1">
                        {prefix}
                    </Box>
                )}
                <Box as="span" fontStyle="italic">
                    "{displayText}"
                </Box>
            </Text>
        </Box>
    );
}

// ============= Number Rotator =============

interface NumberRotatorProps {
    value: number;
    prefix?: string;
    suffix?: string;
    fontSize?: string;
    fontWeight?: string;
}

/**
 * Animated number display that smoothly transitions between values.
 * Used to show increasing document count in the progress toast.
 */
export function NumberRotator({
    value,
    prefix,
    suffix,
    fontSize = "sm",
    fontWeight = "medium",
}: NumberRotatorProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const [numberAnimationKey, setNumberAnimationKey] = useState(0);
    const previousValue = useRef(value);

    useEffect(() => {
        if (value !== previousValue.current) {
            // Animate from previous to current value
            const diff = value - previousValue.current;
            const steps = Math.min(Math.abs(diff), 10);
            const stepValue = diff / steps;
            let current = previousValue.current;
            let step = 0;

            const animate = () => {
                step++;
                current += stepValue;
                setDisplayValue(Math.round(current));

                if (step < steps) {
                    requestAnimationFrame(animate);
                } else {
                    setDisplayValue(value);
                    setNumberAnimationKey((prev) => prev + 1);
                }
            };

            requestAnimationFrame(animate);
            previousValue.current = value;
        }
    }, [value]);

    return (
        <Text
            fontSize={fontSize}
            fontWeight={fontWeight}
            color="fg.muted"
            fontVariantNumeric="tabular-nums"
        >
            {prefix}
            <Box
                as="span"
                key={numberAnimationKey}
                display="inline-block"
                minW="2ch"
                textAlign="right"
                css={{
                    animation: "fadeIn 0.2s ease-out",
                }}
            >
                {displayValue}
            </Box>
            {suffix}
        </Text>
    );
}
