"use client";

import { useState } from "react";
import { Box, IconButton, HStack, Slider } from "@chakra-ui/react";
import { LuPause, LuPlay } from "react-icons/lu";
import { ColorModeToggle } from "./ColorModeToggle";
import type { TimestampedEvent } from "@/types";

interface PlaybackControlsProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    events: TimestampedEvent[];
    onSeek: (time: number) => void;
    onPlayPause: () => void;
    sidebarWidth: number;
}

export function PlaybackControls({
    currentTime,
    duration,
    isPlaying,
    events,
    onSeek,
    onPlayPause,
    sidebarWidth,
}: PlaybackControlsProps) {
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [scrubValue, setScrubValue] = useState(currentTime);

    const handleValueChange = (details: { value: number[] }) => {
        setIsScrubbing(true);
        setScrubValue(details.value[0]);
    };

    const handleValueChangeEnd = (details: { value: number[] }) => {
        const nextTime = details.value[0];
        setScrubValue(nextTime);
        setIsScrubbing(false);
        onSeek(nextTime);
    };

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right={`${sidebarWidth}px`}
            zIndex="sticky"
            opacity="0"
            transition="opacity 0.3s ease"
            _hover={{ opacity: 1 }}
            bg="bg/80"
            backdropFilter="blur(8px)"
            px="6"
            py="4"
        >
            <Box maxW="700px" mx="auto">
                <Slider.Root
                    value={[isScrubbing ? scrubValue : currentTime]}
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleValueChange}
                    onValueChangeEnd={handleValueChangeEnd}
                    size="sm"
                >
                    <Slider.Control>
                        <Slider.Track bg="gray.700" height="1.5">
                            <Slider.Range bg="blue.500" />
                        </Slider.Track>
                        {/* Snap point markers - differentiated by type */}
                        {events.map((event, index) => (
                            <Box
                                key={`${event.type}-${event.chunkIndex}-${index}`}
                                position="absolute"
                                left={`${(event.timestamp / (duration || 100)) * 100}%`}
                                top="50%"
                                transform={event.type === "start"
                                    ? "translateX(-50%) translateY(-50%)"
                                    : "translateX(-50%) translateY(-50%) rotate(45deg)"
                                }
                                width={event.type === "start" ? "6px" : "5px"}
                                height={event.type === "start" ? "6px" : "5px"}
                                borderRadius={event.type === "start" ? "full" : "sm"}
                                bg={event.type === "start" ? "green.400" : "orange.400"}
                                zIndex="1"
                                pointerEvents="none"
                                title={event.type === "start" ? "Chunk start" : "Insights appear"}
                            />
                        ))}
                        <Slider.Thumb index={0} boxSize="4">
                            <Slider.HiddenInput />
                        </Slider.Thumb>
                    </Slider.Control>
                </Slider.Root>

                <HStack justify="center" mt="3" gap="2">
                    <ColorModeToggle size="md" />
                    <IconButton
                        aria-label={isPlaying ? "Pause" : "Play"}
                        variant="ghost"
                        size="md"
                        onClick={onPlayPause}
                        colorPalette="blue"
                    >
                        {isPlaying ? <LuPause size={20} /> : <LuPlay size={20} />}
                    </IconButton>
                </HStack>
            </Box>
        </Box>
    );
}
