import { Box, CloseButton, HStack, Stack, Text } from "@chakra-ui/react";
import type { DevTelemetryToastItem } from "@/hooks/useDevTelemetryToast";

interface DevTelemetryToastsProps {
    items: DevTelemetryToastItem[];
    onDismiss: (id: string) => void;
}

function statusColor(status: DevTelemetryToastItem["status"]): string {
    if (status === "success") return "green.500";
    if (status === "error") return "red.500";
    return "blue.500";
}

export function DevTelemetryToasts({ items, onDismiss }: DevTelemetryToastsProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <Stack
            position="fixed"
            right="4"
            bottom="4"
            zIndex="toast"
            gap="2"
            maxW="420px"
            pointerEvents="none"
        >
            {items.map((item) => (
                <Box
                    key={item.id}
                    pointerEvents="auto"
                    borderWidth="1px"
                    borderColor="border.muted"
                    borderLeftWidth="3px"
                    borderLeftColor={statusColor(item.status)}
                    bg="bg.panel"
                    borderRadius="md"
                    shadow="md"
                    px="3"
                    py="2"
                >
                    <HStack align="start" justify="space-between" gap="3">
                        <Text fontSize="xs" color="fg" lineHeight="shorter">
                            {item.message}
                        </Text>
                        <CloseButton size="2xs" onClick={() => onDismiss(item.id)} />
                    </HStack>
                </Box>
            ))}
        </Stack>
    );
}
