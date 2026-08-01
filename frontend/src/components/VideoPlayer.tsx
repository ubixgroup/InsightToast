"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Icon, Center } from "@chakra-ui/react";
import {
    LuUser,
} from "react-icons/lu";

interface VideoPlayerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onTimeUpdate: (time: number) => void;
    onDurationChange: (duration: number) => void;
    onPlayStateChange: (isPlaying: boolean) => void;
    isCameraOn: boolean;
    onCameraPermissionDenied?: () => void;
}

export function VideoPlayer({
    videoRef,
    onTimeUpdate,
    onDurationChange,
    onPlayStateChange,
    isCameraOn,
    onCameraPermissionDenied,
}: VideoPlayerProps) {
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
    const [webcamError, setWebcamError] = useState(false);
    const webcamRef = useRef<HTMLVideoElement>(null);
    const webcamStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        webcamStreamRef.current = webcamStream;
    }, [webcamStream]);

    // Start webcam
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcamStreamRef.current = stream;
            setWebcamStream(stream);
            setWebcamError(false);
        } catch {
            setWebcamError(true);
            onCameraPermissionDenied?.();
        }
    };

    // Stop webcam
    const stopWebcam = useCallback(() => {
        const activeStream = webcamStreamRef.current;
        if (activeStream) {
            activeStream.getTracks().forEach((track) => track.stop());
            webcamStreamRef.current = null;
            setWebcamStream(null);
        }
    }, []);

    // Attach stream to video element when both are available
    useEffect(() => {
        if (webcamRef.current && webcamStream && isCameraOn) {
            webcamRef.current.srcObject = webcamStream;
        }
    }, [webcamStream, isCameraOn]);

    // Keep webcam stream in sync with external camera state.
    useEffect(() => {
        if (isCameraOn) {
            if (!webcamStreamRef.current) {
                void startWebcam();
            }
            return;
        }

        stopWebcam();
    }, [isCameraOn, stopWebcam]);

    useEffect(() => {
        return () => {
            stopWebcam();
        };
    }, [stopWebcam]);

    // Handle video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            onTimeUpdate(video.currentTime);
        };

        const handleDurationChange = () => {
            onDurationChange(video.duration);
        };

        const handlePlay = () => {
            onPlayStateChange(true);
        };

        const handlePause = () => {
            onPlayStateChange(false);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("durationchange", handleDurationChange);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("durationchange", handleDurationChange);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, [videoRef, onTimeUpdate, onDurationChange, onPlayStateChange]);

    return (
        <Box position="relative" width="100%" height="100%" bg="gray.900">
            {/* Main video */}
            <video
                ref={videoRef}
                src="/video.mp4"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                }}
            />

            {/* Self-view webcam overlay - only show when camera is on */}
            {isCameraOn && (
                <Box
                    position="absolute"
                    bottom="80px"
                    right="4"
                    width="160px"
                    height="120px"
                    borderRadius="lg"
                    overflow="hidden"
                    bg="gray.800"
                    boxShadow="lg"
                    border="2px solid"
                    borderColor="gray.700"
                >
                    {webcamError || !webcamStream ? (
                        <Center height="100%" bg="gray.800">
                            <Icon as={LuUser} boxSize="10" color="gray.500" />
                        </Center>
                    ) : (
                        <video
                            ref={webcamRef}
                            autoPlay
                            muted
                            playsInline
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transform: "scaleX(-1)",
                            }}
                        />
                    )}
                </Box>
            )}
        </Box>
    );
}
