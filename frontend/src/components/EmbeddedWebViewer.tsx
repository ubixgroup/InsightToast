"use client";

import { useState, useRef } from "react";
import {
    Box,
    HStack,
    IconButton,
    Text,
    Portal,
    Card,
} from "@chakra-ui/react";
import {
    LuX,
    LuMaximize2,
    LuMinimize2,
    LuArrowLeft,
    LuArrowRight,
    LuExternalLink,
} from "react-icons/lu";

interface EmbeddedWebViewerProps {
    url: string;
    onClose: () => void;
    onExpandChange?: (expanded: boolean) => void;
}

export function EmbeddedWebViewer({ url, onClose, onExpandChange }: EmbeddedWebViewerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [history] = useState<string[]>([url]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const currentUrl = history[historyIndex];

    const handleBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
        }
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleOpenExternal = () => {
        window.open(currentUrl, "_blank");
    };

    const viewerContent = (
        <Box
            data-onboarding="embedded-viewer"
            height={isExpanded ? "80vh" : "50vh"}
            width="100%"
            display="flex"
            flexDirection="column"
            bg="bg.panel"
            borderTopWidth="1px"
            borderTopColor="border.muted"
        >
            {/* Toolbar */}
            <HStack
                px="2"
                py="1"
                borderBottomWidth="1px"
                borderBottomColor="border.muted"
                gap="1"
                bg="bg.subtle"
            >
                {/* Navigation */}
                <IconButton
                    aria-label="Go back"
                    variant="ghost"
                    size="xs"
                    onClick={handleBack}
                    disabled={historyIndex === 0}
                >
                    <LuArrowLeft />
                </IconButton>
                <IconButton
                    aria-label="Go forward"
                    variant="ghost"
                    size="xs"
                    onClick={handleForward}
                    disabled={historyIndex >= history.length - 1}
                >
                    <LuArrowRight />
                </IconButton>

                {/* URL display */}
                <Box flex="1" overflow="hidden">
                    <Text fontSize="xs" color="fg.muted" truncate>
                        {currentUrl}
                    </Text>
                </Box>

                {/* Open external */}
                <IconButton
                    aria-label="Open in new tab"
                    variant="ghost"
                    size="xs"
                    onClick={handleOpenExternal}
                >
                    <LuExternalLink />
                </IconButton>

                {/* Expand/collapse */}
                <IconButton
                    data-onboarding="source-preview-expand-button"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                        const nextExpanded = !isExpanded;
                        setIsExpanded(nextExpanded);
                        onExpandChange?.(nextExpanded);
                    }}
                >
                    {isExpanded ? <LuMinimize2 /> : <LuMaximize2 />}
                </IconButton>

                {/* Close */}
                <IconButton
                    data-onboarding="source-preview-close-button"
                    aria-label="Close viewer"
                    variant="ghost"
                    size="xs"
                    onClick={onClose}
                >
                    <LuX />
                </IconButton>
            </HStack>

            {/* Iframe */}
            <Box flex="1" overflow="hidden">
                <iframe
                    ref={iframeRef}
                    src={currentUrl}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    title="Citation source"
                />
            </Box>
        </Box>
    );

    // Render expanded view in a portal
    if (isExpanded) {
        return (
            <Portal>
                <Box
                    data-onboarding="source-preview-expanded"
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
                    onClick={onClose}
                >
                    <Card.Root
                        width="90vw"
                        maxWidth="1200px"
                        height="85vh"
                        onClick={(e) => e.stopPropagation()}
                        overflow="hidden"
                    >
                        <Card.Body p="0">
                            {viewerContent}
                        </Card.Body>
                    </Card.Root>
                </Box>
            </Portal>
        );
    }

    return viewerContent;
}
