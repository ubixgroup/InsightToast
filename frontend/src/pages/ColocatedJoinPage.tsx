import {
    Alert,
    Box,
    Button,
    Card,
    Center,
    Container,
    HStack,
    Icon,
    IconButton,
    Input,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowRight, LuLoaderCircle, LuMinus, LuPlus } from "react-icons/lu";

import { ColorModeToggle } from "@/components/ColorModeToggle";
import { Tooltip } from "@/components/ui/tooltip";
import {
    joinConversationV2,
    leaveConversationV2,
} from "@/services/v2Api";
import { saveColocatedSessionState, type ColocatedRouteState } from "@/pages/colocatedTypes";

import type { ReactNode } from "react";

function Frame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
    return (
        <Center minH="100vh" bg="bg">
            <Container maxW="4xl" py="10">
                <Stack gap="8">
                    <HStack justify="space-between" align="start">
                        <Stack gap="2">
                            <Text fontSize="4xl" fontWeight="bold">
                                {title}
                            </Text>
                            <Text color="fg.muted" maxW="2xl">
                                {subtitle}
                            </Text>
                        </Stack>
                        <ColorModeToggle size="sm" />
                    </HStack>
                    {children}
                </Stack>
            </Container>
        </Center>
    );
}

export default function ColocatedJoinPage() {
    const navigate = useNavigate();
    const [conversationId, setConversationId] = useState("");
    const [condition, setCondition] = useState<"condition-1" | "condition-2">("condition-1");
    const [speakers, setSpeakers] = useState<string[]>([""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedSpeakers = speakers.map((s) => s.trim()).filter(Boolean);
    const canSubmit = trimmedSpeakers.length > 0 && conversationId.trim().length > 0;

    const addSpeaker = () => setSpeakers((prev) => [...prev, ""]);
    const removeSpeaker = (index: number) => setSpeakers((prev) => prev.filter((_, i) => i !== index));
    const updateSpeaker = (index: number, value: string) =>
        setSpeakers((prev) => prev.map((s, i) => (i === index ? value : s)));

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await joinConversationV2({
                conversationId: conversationId.trim(),
                speakerNames: trimmedSpeakers,
                isBaseline: condition === "condition-2",
            });

            // Co-located conversations must be registered — reject expired unregistered ones
            const expiresAtMs = response.expires_at ? Date.parse(response.expires_at) : Number.NaN;
            const isJoinExpired =
                !response.is_registered_conversation &&
                Number.isFinite(expiresAtMs) &&
                expiresAtMs <= Date.now();

            if (isJoinExpired) {
                try {
                    await leaveConversationV2({
                        conversationId: response.conversation_id,
                        clientId: response.client_id,
                    });
                } catch {
                    // best effort cleanup
                }
                setError("This conversation has expired. Ask the coordinator for a fresh conversation.");
                return;
            }

            const nextState: ColocatedRouteState = {
                conversationId: response.conversation_id,
                clientId: response.client_id,
                speakerNames: trimmedSpeakers,
                condition,
                mode: response.mode,
                participants: response.participants,
                isRegisteredConversation: response.is_registered_conversation,
                expiresAt: response.expires_at,
                joinedAt: new Date().toISOString(),
                enrolledSpeakers: [],
                setting: "colocated",
            };

            saveColocatedSessionState(nextState);
            navigate("/interactive/colocated/enroll", { state: nextState, replace: true });
        } catch (joinError) {
            const message = joinError instanceof Error ? joinError.message : "Failed to join conversation";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Frame
            title="Join Co-located Session"
            subtitle="Enter the conversation ID and the names of all speakers present in the room."
        >
            <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                <Card.Body>
                    <Stack gap="5">
                        {/* Study condition */}
                        <Stack gap="2">
                            <Text fontSize="sm" color="fg.muted">Study condition</Text>
                            <HStack align="stretch" gap="3">
                                <Tooltip content="Insight Toast" positioning={{ placement: "top" }}>
                                    <Box
                                        as="button"
                                        flex="1"
                                        textAlign="left"
                                        borderWidth="1px"
                                        borderColor={condition === "condition-1" ? "blue.500" : "border.muted"}
                                        borderRadius="md"
                                        px="4"
                                        py="3"
                                        bg={condition === "condition-1" ? "blue.subtle" : "bg"}
                                        onClick={() => setCondition("condition-1")}
                                    >
                                        <Text fontWeight="semibold">Condition 1</Text>
                                    </Box>
                                </Tooltip>

                                <Box
                                    as="button"
                                    flex="1"
                                    textAlign="left"
                                    borderWidth="1px"
                                    borderColor={condition === "condition-2" ? "blue.500" : "border.muted"}
                                    borderRadius="md"
                                    px="4"
                                    py="3"
                                    bg={condition === "condition-2" ? "blue.subtle" : "bg"}
                                    onClick={() => setCondition("condition-2")}
                                >
                                    <Text fontWeight="semibold">Condition 2</Text>
                                </Box>
                            </HStack>
                        </Stack>

                        {/* Conversation ID */}
                        <Stack gap="2">
                            <Text fontSize="sm" color="fg.muted">Conversation ID</Text>
                            <Input
                                value={conversationId}
                                onChange={(event) => setConversationId(event.target.value)}
                                placeholder="Enter registered conversation ID"
                                size="lg"
                            />
                        </Stack>

                        {/* Speaker names */}
                        <Stack gap="2">
                            <HStack justify="space-between">
                                <Text fontSize="sm" color="fg.muted">
                                    Speakers in the room ({trimmedSpeakers.length > 0 ? trimmedSpeakers.length : 0})
                                </Text>
                                <Button size="xs" variant="ghost" onClick={addSpeaker}>
                                    <Icon as={LuPlus} />
                                    Add speaker
                                </Button>
                            </HStack>
                            {speakers.map((name, index) => (
                                <HStack key={index} gap="2">
                                    <Input
                                        value={name}
                                        onChange={(event) => updateSpeaker(index, event.target.value)}
                                        placeholder={`Speaker ${index + 1} name`}
                                        size="lg"
                                        flex="1"
                                    />
                                    {speakers.length > 1 && (
                                        <IconButton
                                            aria-label="Remove speaker"
                                            size="sm"
                                            variant="ghost"
                                            colorPalette="red"
                                            onClick={() => removeSpeaker(index)}
                                        >
                                            <LuMinus />
                                        </IconButton>
                                    )}
                                </HStack>
                            ))}
                        </Stack>

                        {error && (
                            <Alert.Root status="error" borderRadius="md">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>{error}</Alert.Title>
                                </Alert.Content>
                            </Alert.Root>
                        )}

                        <HStack justify="space-between" pt="2">
                            <Button variant="ghost" onClick={() => navigate("/interactive/study-setting")}>
                                Back
                            </Button>
                            <Button
                                colorPalette="blue"
                                onClick={handleSubmit}
                                disabled={!canSubmit || isSubmitting}
                            >
                                {isSubmitting ? <LuLoaderCircle className="animate-spin" /> : <LuArrowRight />}
                                Go to speaker identification
                            </Button>
                        </HStack>
                    </Stack>
                </Card.Body>
            </Card.Root>
        </Frame>
    );
}
