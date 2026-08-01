"use client";

import { Box, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useColorModeValue } from "./ui/color-mode";

// ============= Shimmer Keyframes CSS =============

// CSS keyframes for shimmer effect - inject into document once
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}
`;

// Inject keyframes into document head (only once)
if (typeof document !== "undefined") {
    const styleId = "shimmer-keyframes";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = shimmerKeyframes;
        document.head.appendChild(style);
    }
}

// ============= Component Props =============

interface ShimmerTextProps {
    children: ReactNode;
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    lineClamp?: number;
    isActive?: boolean;
}

// ============= Component =============

/**
 * Text component with a shimmer animation effect.
 * Used to indicate loading/processing state in the progress toast.
 * 
 * The shimmer creates a gradient that moves across the text,
 * giving a "thinking" or "processing" visual cue.
 */
export function ShimmerText({
    children,
    fontSize = "sm",
    fontWeight = "medium",
    color,
    lineClamp,
    isActive = true,
}: ShimmerTextProps) {
    if (!isActive) {
        return (
            <Text fontSize={fontSize} fontWeight={fontWeight} color={color} lineClamp={lineClamp}>
                {children}
            </Text>
        );
    }

    const shimmerGradient = useColorModeValue(
        "linear-gradient(90deg, var(--chakra-colors-fg) 20%, var(--chakra-colors-gray-400) 50%, var(--chakra-colors-fg) 80%)",
        "linear-gradient(90deg, var(--chakra-colors-fg) 25%, var(--chakra-colors-fg-muted) 50%, var(--chakra-colors-fg) 75%)"
    );

    return (
        <Box
            as="span"
            display="inline-block"
            fontSize={fontSize}
            fontWeight={fontWeight}
            lineClamp={lineClamp}
            css={{
                background: shimmerGradient,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 3s linear infinite",
            }}
        >
            {children}
        </Box>
    );
}
