"use client";

import { IconButton } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";

interface ColorModeToggleProps {
    size?: "sm" | "md" | "lg";
}

export function ColorModeToggle({ size = "md" }: ColorModeToggleProps) {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <IconButton
            aria-label="Toggle color mode"
            variant="ghost"
            size={size}
            onClick={toggleColorMode}
            colorPalette="gray"
        >
            {colorMode === "dark" ? <LuSun /> : <LuMoon />}
        </IconButton>
    );
}
