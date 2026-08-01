"use client";

import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Tooltip } from "./ui/tooltip";
import {
    LuAudioLines,
    LuCaptions,
    LuCaptionsOff,
    LuLogOut,
    LuMic,
    LuMicOff,
    LuVideo,
    LuVideoOff,
} from "react-icons/lu";

export type SessionHoverControl = "cc" | "listen" | "mic" | "camera" | "leave" | null;

interface SessionActionControlsProps {
    isCcEnabled: boolean;
    isTranscriptEnabled: boolean;
    isTranscriptDisabled?: boolean;
    isTranscriptBusy?: boolean;
    showTranscriptStartHint?: boolean;
    isMuted: boolean;
    isCameraOn: boolean;
    hoveredControl: SessionHoverControl;
    onHoverControl: (value: SessionHoverControl) => void;
    onToggleCc: () => void;
    onToggleTranscript: () => void;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onLeave: () => void;
}

export function SessionActionControls({
    isCcEnabled,
    isTranscriptEnabled,
    isTranscriptDisabled = false,
    isTranscriptBusy = false,
    showTranscriptStartHint = true,
    isMuted,
    isCameraOn,
    hoveredControl,
    onHoverControl,
    onToggleCc,
    onToggleTranscript,
    onToggleMute,
    onToggleCamera,
    onLeave,
}: SessionActionControlsProps) {
    const [showTranscriptHint, setShowTranscriptHint] = useState(true);
    return (
        <Box
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            bottom="5"
            zIndex="2"
            px="3"
            py="1.5"
            borderRadius="md"
            bg="bg.panel/60"
            backdropFilter="blur(16px)"
            borderWidth="0"
            shadow="md"
        >
            <HStack gap="2">
                {/* Transcript toggle */}
                <Tooltip
                    open={showTranscriptStartHint && showTranscriptHint ? true : undefined}
                    disabled={!showTranscriptStartHint || !showTranscriptHint}
                    content="Press this button to start the conversation"
                    showArrow
                    positioning={{ placement: "top" }}
                >
                    <Button
                        size="md"
                        colorPalette={isTranscriptEnabled ? "blue" : "gray"}
                        variant={isTranscriptEnabled ? "solid" : "surface"}
                        minW={hoveredControl === "listen" ? "170px" : "44px"}
                        px="3"
                        overflow="hidden"
                        justifyContent="flex-start"
                        transition="all 0.2s ease"
                        onMouseEnter={() => onHoverControl("listen")}
                        onMouseLeave={() => onHoverControl(null)}
                        disabled={isTranscriptBusy || isTranscriptDisabled}
                        onClick={() => { setShowTranscriptHint(false); onToggleTranscript(); }}
                    >
                        <LuAudioLines />
                        <Text
                            ml="2"
                            whiteSpace="nowrap"
                            opacity={hoveredControl === "listen" ? 1 : 0}
                            maxW={hoveredControl === "listen" ? "130px" : "0"}
                            overflow="hidden"
                            transition="all 0.2s ease"
                        >
                            {isTranscriptEnabled ? "Transcription On" : "Transcription Off"}
                        </Text>
                    </Button>
                </Tooltip>

                {/* CC toggle */}
                <Button
                    data-onboarding="cc-toggle"
                    size="md"
                    colorPalette={isCcEnabled ? "blue" : "gray"}
                    variant={isCcEnabled ? "solid" : "surface"}
                    minW={hoveredControl === "cc" ? "126px" : "44px"}
                    px="3"
                    overflow="hidden"
                    justifyContent="flex-start"
                    transition="all 0.2s ease"
                    onMouseEnter={() => onHoverControl("cc")}
                    onMouseLeave={() => onHoverControl(null)}
                    onClick={onToggleCc}
                >
                    {isCcEnabled ? <LuCaptions /> : <LuCaptionsOff />}
                    <Text
                        ml="2"
                        whiteSpace="nowrap"
                        opacity={hoveredControl === "cc" ? 1 : 0}
                        maxW={hoveredControl === "cc" ? "90px" : "0"}
                        overflow="hidden"
                        transition="all 0.2s ease"
                    >
                        {isCcEnabled ? "CC On" : "CC Off"}
                    </Text>
                </Button>

                {/* Mic toggle */}
                <Button
                    size="md"
                    colorPalette={isMuted ? "gray" : "green"}
                    variant={isMuted ? "surface" : "solid"}
                    minW={hoveredControl === "mic" ? "110px" : "44px"}
                    px="3"
                    overflow="hidden"
                    justifyContent="flex-start"
                    transition="all 0.2s ease"
                    onMouseEnter={() => onHoverControl("mic")}
                    onMouseLeave={() => onHoverControl(null)}
                    onClick={onToggleMute}
                >
                    {isMuted ? <LuMicOff /> : <LuMic />}
                    <Text
                        ml="2"
                        whiteSpace="nowrap"
                        opacity={hoveredControl === "mic" ? 1 : 0}
                        maxW={hoveredControl === "mic" ? "70px" : "0"}
                        overflow="hidden"
                        transition="all 0.2s ease"
                    >
                        {isMuted ? "Mic Off" : "Mic On"}
                    </Text>
                </Button>

                {/* Camera toggle */}
                <Button
                    size="md"
                    colorPalette={isCameraOn ? "green" : "gray"}
                    variant={isCameraOn ? "solid" : "surface"}
                    minW={hoveredControl === "camera" ? "126px" : "44px"}
                    px="3"
                    overflow="hidden"
                    justifyContent="flex-start"
                    transition="all 0.2s ease"
                    onMouseEnter={() => onHoverControl("camera")}
                    onMouseLeave={() => onHoverControl(null)}
                    onClick={onToggleCamera}
                >
                    {isCameraOn ? <LuVideo /> : <LuVideoOff />}
                    <Text
                        ml="2"
                        whiteSpace="nowrap"
                        opacity={hoveredControl === "camera" ? 1 : 0}
                        maxW={hoveredControl === "camera" ? "90px" : "0"}
                        overflow="hidden"
                        transition="all 0.2s ease"
                    >
                        {isCameraOn ? "Video On" : "Video Off"}
                    </Text>
                </Button>

                {/* Leave */}
                <Button
                    size="md"
                    colorPalette="red"
                    variant="solid"
                    minW={hoveredControl === "leave" ? "96px" : "44px"}
                    px="3"
                    overflow="hidden"
                    justifyContent="flex-start"
                    transition="all 0.2s ease"
                    onMouseEnter={() => onHoverControl("leave")}
                    onMouseLeave={() => onHoverControl(null)}
                    onClick={onLeave}
                >
                    <LuLogOut />
                    <Text
                        ml="2"
                        whiteSpace="nowrap"
                        opacity={hoveredControl === "leave" ? 1 : 0}
                        maxW={hoveredControl === "leave" ? "60px" : "0"}
                        overflow="hidden"
                        transition="all 0.2s ease"
                    >
                        Leave
                    </Text>
                </Button>
            </HStack>
        </Box>
    );
}
