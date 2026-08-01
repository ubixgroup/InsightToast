import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Container,
    Flex,
    HStack,
    Input,
    Separator,
    Stack,
    Switch,
    Tabs,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";

import { ColorModeToggle } from "@/components/ColorModeToggle";
import {
    ApiRequestError,
    generateApiKeyV2,
    listAdminApiKeysV2,
    listConversationsV2,
    registerConversationsV2,
    revokeApiKeyV2,
    type ApiKeyMetadata,
    type GenerateApiKeyResponse,
    type ListConversationsResponse,
    validateAdminPasswordV2,
} from "@/services/v2Api";

function isUnauthorizedError(error: unknown): boolean {
    return error instanceof ApiRequestError && (error.status === 401 || error.status === 403);
}

export default function AdminPage() {
    const [passwordInput, setPasswordInput] = useState("");
    const [adminPassword, setAdminPassword] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const [registerInput, setRegisterInput] = useState("");
    const [registerStatus, setRegisterStatus] = useState<string | null>(null);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const [conversationsResponse, setConversationsResponse] = useState<ListConversationsResponse | null>(null);
    const [showRegisteredOnly, setShowRegisteredOnly] = useState(false);
    const [conversationsError, setConversationsError] = useState<string | null>(null);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);

    const [apiKeys, setApiKeys] = useState<ApiKeyMetadata[] | null>(null);
    const [apiKeysError, setApiKeysError] = useState<string | null>(null);
    const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);

    const [apiKeyName, setApiKeyName] = useState("");
    const [generatedKey, setGeneratedKey] = useState<GenerateApiKeyResponse | null>(null);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [isGeneratingKey, setIsGeneratingKey] = useState(false);

    const [revokeKeyId, setRevokeKeyId] = useState("");
    const [revokeStatus, setRevokeStatus] = useState<string | null>(null);
    const [revokeError, setRevokeError] = useState<string | null>(null);
    const [isRevokingKey, setIsRevokingKey] = useState(false);

    const resetToPasswordForm = (message: string) => {
        setAdminPassword(null);
        setPasswordInput("");
        setAuthError(message);
    };

    const conversationRows = useMemo(() => {
        const source = conversationsResponse?.conversations ?? [];
        if (!showRegisteredOnly) {
            return source;
        }

        return source.filter((item) => item.is_registered);
    }, [conversationsResponse, showRegisteredOnly]);

    const handleValidatePassword = async () => {
        if (!passwordInput.trim()) {
            setAuthError("Enter admin password.");
            return;
        }

        setIsAuthenticating(true);
        setAuthError(null);

        try {
            await validateAdminPasswordV2({ adminPassword: passwordInput.trim() });
            setAdminPassword(passwordInput.trim());
            setPasswordInput("");
            setAuthError(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to validate password.";
            setAuthError(message);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleRegisterConversations = async () => {
        if (!adminPassword) {
            resetToPasswordForm("Admin session missing. Enter password again.");
            return;
        }

        const conversationIds = Array.from(
            new Set(
                registerInput
                    .split(/[\n,\s]+/)
                    .map((item) => item.trim())
                    .filter(Boolean),
            ),
        );

        if (conversationIds.length === 0) {
            setRegisterError("Enter at least one conversation ID.");
            return;
        }

        setIsRegistering(true);
        setRegisterError(null);
        setRegisterStatus(null);

        try {
            const response = await registerConversationsV2({
                adminPassword,
                conversationIds,
            });
            setRegisterStatus(`Registered ${response.registered_count}. Total registered: ${response.total_registered}.`);
        } catch (error) {
            if (isUnauthorizedError(error)) {
                resetToPasswordForm("Unauthorized. Enter admin password again.");
                return;
            }
            const message = error instanceof Error ? error.message : "Failed to register conversations.";
            setRegisterError(message);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleLoadConversations = async () => {
        if (!adminPassword) {
            resetToPasswordForm("Admin session missing. Enter password again.");
            return;
        }

        setIsLoadingConversations(true);
        setConversationsError(null);

        try {
            const response = await listConversationsV2({ adminPassword });
            setConversationsResponse(response);
        } catch (error) {
            if (isUnauthorizedError(error)) {
                resetToPasswordForm("Unauthorized. Enter admin password again.");
                return;
            }
            const message = error instanceof Error ? error.message : "Failed to load conversations.";
            setConversationsError(message);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const handleLoadApiKeys = async () => {
        if (!adminPassword) {
            resetToPasswordForm("Admin session missing. Enter password again.");
            return;
        }

        setIsLoadingApiKeys(true);
        setApiKeysError(null);

        try {
            const response = await listAdminApiKeysV2({ adminPassword });
            setApiKeys(response.api_keys);
        } catch (error) {
            if (isUnauthorizedError(error)) {
                resetToPasswordForm("Unauthorized. Enter admin password again.");
                return;
            }
            const message = error instanceof Error ? error.message : "Failed to load API keys.";
            setApiKeysError(message);
        } finally {
            setIsLoadingApiKeys(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (!adminPassword) {
            resetToPasswordForm("Admin session missing. Enter password again.");
            return;
        }

        setIsGeneratingKey(true);
        setGenerateError(null);
        setGeneratedKey(null);

        try {
            const response = await generateApiKeyV2({
                adminPassword,
                name: apiKeyName.trim() || undefined,
            });
            setGeneratedKey(response);
            await handleLoadApiKeys();
        } catch (error) {
            if (isUnauthorizedError(error)) {
                resetToPasswordForm("Unauthorized. Enter admin password again.");
                return;
            }
            const message = error instanceof Error ? error.message : "Failed to generate API key.";
            setGenerateError(message);
        } finally {
            setIsGeneratingKey(false);
        }
    };

    const handleRevokeApiKey = async () => {
        if (!adminPassword) {
            resetToPasswordForm("Admin session missing. Enter password again.");
            return;
        }

        if (!revokeKeyId.trim()) {
            setRevokeError("Enter key ID to revoke.");
            return;
        }

        setIsRevokingKey(true);
        setRevokeError(null);
        setRevokeStatus(null);

        try {
            const response = await revokeApiKeyV2({
                adminPassword,
                keyId: revokeKeyId.trim(),
            });
            setRevokeStatus(`Revoked: ${response.key_id}`);
            await handleLoadApiKeys();
        } catch (error) {
            if (isUnauthorizedError(error)) {
                resetToPasswordForm("Unauthorized. Enter admin password again.");
                return;
            }
            const message = error instanceof Error ? error.message : "Failed to revoke API key.";
            setRevokeError(message);
        } finally {
            setIsRevokingKey(false);
        }
    };

    if (!adminPassword) {
        return (
            <Box minH="100vh" bg="bg">
                <Container maxW="2xl" py="10">
                    <Stack gap="8">
                        <Flex justify="space-between" align="start">
                            <Stack gap="2">
                                <Text fontSize="3xl" fontWeight="bold">Admin</Text>
                                <Text color="fg.muted">Enter admin password to access v2 admin endpoints.</Text>
                            </Stack>
                            <ColorModeToggle size="sm" />
                        </Flex>

                        <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                            <Card.Body>
                                <Stack gap="4">
                                    <Input
                                        type="password"
                                        placeholder="Admin password"
                                        value={passwordInput}
                                        onChange={(event) => setPasswordInput(event.target.value)}
                                    />
                                    {authError && (
                                        <Alert.Root status="error" borderRadius="md">
                                            <Alert.Indicator />
                                            <Alert.Content>
                                                <Alert.Title>{authError}</Alert.Title>
                                            </Alert.Content>
                                        </Alert.Root>
                                    )}
                                    <Button
                                        colorPalette="blue"
                                        onClick={() => void handleValidatePassword()}
                                        disabled={isAuthenticating}
                                    >
                                        {isAuthenticating ? "Validating..." : "Validate Password"}
                                    </Button>
                                </Stack>
                            </Card.Body>
                        </Card.Root>
                    </Stack>
                </Container>
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg="bg">
            <Container maxW="6xl" py="8">
                <Stack gap="5">
                    <Flex justify="space-between" align="center" wrap="wrap" gap="3">
                        <Text fontSize="2xl" fontWeight="bold">Admin Console</Text>
                        <HStack>
                            <ColorModeToggle size="sm" />
                            <Button variant="outline" onClick={() => resetToPasswordForm("Admin session locked.")}>Lock</Button>
                        </HStack>
                    </Flex>

                    <Tabs.Root defaultValue="conversations" variant="line" fitted>
                        <Tabs.List>
                            <Tabs.Trigger value="conversations">Conversations</Tabs.Trigger>
                            <Tabs.Trigger value="keys">API Keys</Tabs.Trigger>
                            <Tabs.Trigger value="generate">Generate Key</Tabs.Trigger>
                            <Tabs.Trigger value="revoke">Revoke Key</Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="conversations" pt="4">
                            <Stack gap="4">
                                <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                                    <Card.Body>
                                        <Stack gap="3">
                                            <Text fontWeight="semibold">Register conversation IDs</Text>
                                            <Textarea
                                                value={registerInput}
                                                onChange={(event) => setRegisterInput(event.target.value)}
                                                minH="120px"
                                                placeholder="One or multiple IDs (comma, space, or newline separated)"
                                            />
                                            <HStack>
                                                <Button
                                                    colorPalette="blue"
                                                    onClick={() => void handleRegisterConversations()}
                                                    disabled={isRegistering}
                                                >
                                                    {isRegistering ? "Registering..." : "Register Conversations"}
                                                </Button>
                                                {registerStatus && <Text color="green.500">{registerStatus}</Text>}
                                            </HStack>
                                            {registerError && <Text color="red.500">{registerError}</Text>}
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>

                                <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                                    <Card.Body>
                                        <Stack gap="3">
                                            <Flex justify="space-between" align="center" wrap="wrap" gap="3">
                                                <Text fontWeight="semibold">Conversations</Text>
                                                <HStack>
                                                    <Switch.Root
                                                        checked={showRegisteredOnly}
                                                        onCheckedChange={(event) => setShowRegisteredOnly(event.checked)}
                                                    >
                                                        <Switch.HiddenInput />
                                                        <Switch.Control />
                                                        <Switch.Label>Only registered</Switch.Label>
                                                    </Switch.Root>
                                                    <Button
                                                        onClick={() => void handleLoadConversations()}
                                                        disabled={isLoadingConversations}
                                                    >
                                                        {isLoadingConversations ? "Loading..." : "Load Conversations"}
                                                    </Button>
                                                </HStack>
                                            </Flex>

                                            {conversationsResponse && (
                                                <HStack gap="3" flexWrap="wrap">
                                                    <Badge>total: {conversationsResponse.counts.total}</Badge>
                                                    <Badge>registered: {conversationsResponse.counts.registered}</Badge>
                                                    <Badge>active: {conversationsResponse.counts.active}</Badge>
                                                    <Badge>resumable: {conversationsResponse.counts.resumable}</Badge>
                                                    <Badge>shown: {conversationRows.length}</Badge>
                                                </HStack>
                                            )}

                                            {conversationsError && <Text color="red.500">{conversationsError}</Text>}

                                            {conversationRows.length > 0 && (
                                                <VStack align="stretch" gap="1" maxH="260px" overflowY="auto">
                                                    {conversationRows.map((item) => (
                                                        <Box key={item.conversation_id} borderWidth="1px" borderColor="border.muted" borderRadius="md" px="3" py="2">
                                                            <HStack justify="space-between" align="start" gap="3" flexWrap="wrap">
                                                                <Text fontSize="sm" fontWeight="medium">{item.conversation_id}</Text>
                                                                <HStack>
                                                                    <Badge colorPalette={item.is_registered ? "green" : "gray"}>{item.is_registered ? "registered" : "unregistered"}</Badge>
                                                                    <Badge colorPalette={item.is_active ? "blue" : "gray"}>{item.is_active ? "active" : "inactive"}</Badge>
                                                                    <Badge>participants: {item.participant_count}</Badge>
                                                                </HStack>
                                                            </HStack>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            )}
                                        </Stack>
                                    </Card.Body>
                                </Card.Root>
                            </Stack>
                        </Tabs.Content>

                        <Tabs.Content value="keys" pt="4">
                            <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                                <Card.Body>
                                    <Stack gap="3">
                                        <Text fontWeight="semibold">API keys</Text>
                                        <HStack>
                                            <Button
                                                onClick={() => void handleLoadApiKeys()}
                                                disabled={isLoadingApiKeys}
                                            >
                                                {isLoadingApiKeys ? "Loading..." : "Load API Keys"}
                                            </Button>
                                            {apiKeys && <Badge>{apiKeys.length} keys</Badge>}
                                        </HStack>
                                        {apiKeysError && <Text color="red.500">{apiKeysError}</Text>}

                                        {apiKeys && apiKeys.length > 0 && (
                                            <VStack align="stretch" gap="1" maxH="320px" overflowY="auto">
                                                {apiKeys.map((item) => (
                                                    <Box key={item.key_id} borderWidth="1px" borderColor="border.muted" borderRadius="md" px="3" py="2">
                                                        <HStack justify="space-between" align="start" gap="3" flexWrap="wrap">
                                                            <Stack gap="0">
                                                                <Text fontSize="sm" fontWeight="medium">{item.key_id}</Text>
                                                                <Text fontSize="xs" color="fg.muted">prefix: {item.key_prefix}</Text>
                                                            </Stack>
                                                            <HStack>
                                                                <Badge colorPalette={item.revoked ? "red" : "green"}>{item.revoked ? "revoked" : "active"}</Badge>
                                                                <Badge>{new Date(item.created_at).toLocaleString()}</Badge>
                                                            </HStack>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        )}
                                    </Stack>
                                </Card.Body>
                            </Card.Root>
                        </Tabs.Content>

                        <Tabs.Content value="generate" pt="4">
                            <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                                <Card.Body>
                                    <Stack gap="3">
                                        <Text fontWeight="semibold">Generate API key</Text>
                                        <HStack align="end" flexWrap="wrap">
                                            <Box flex="1" minW="250px">
                                                <Text fontSize="sm" color="fg.muted" mb="1">Optional key label</Text>
                                                <Input
                                                    value={apiKeyName}
                                                    onChange={(event) => setApiKeyName(event.target.value)}
                                                    placeholder="study-key"
                                                />
                                            </Box>
                                            <Button
                                                colorPalette="blue"
                                                onClick={() => void handleGenerateApiKey()}
                                                disabled={isGeneratingKey}
                                            >
                                                {isGeneratingKey ? "Generating..." : "Generate API Key"}
                                            </Button>
                                        </HStack>
                                        {generateError && <Text color="red.500">{generateError}</Text>}
                                        {generatedKey && (
                                            <Box borderWidth="1px" borderColor="border.muted" borderRadius="md" px="3" py="2">
                                                <Stack gap="1">
                                                    <Text fontSize="sm">key_id: {generatedKey.key_id}</Text>
                                                    <Text fontSize="sm">prefix: {generatedKey.key_prefix}</Text>
                                                    <Separator />
                                                    <Text fontSize="sm" fontWeight="semibold">api_key (shown once):</Text>
                                                    <Text fontSize="sm" wordBreak="break-all">{generatedKey.api_key}</Text>
                                                </Stack>
                                            </Box>
                                        )}
                                    </Stack>
                                </Card.Body>
                            </Card.Root>
                        </Tabs.Content>

                        <Tabs.Content value="revoke" pt="4">
                            <Card.Root variant="elevated" borderWidth="1px" borderColor="border.muted">
                                <Card.Body>
                                    <Stack gap="3">
                                        <Text fontWeight="semibold">Revoke API key</Text>
                                        <HStack align="end" flexWrap="wrap">
                                            <Box flex="1" minW="320px">
                                                <Text fontSize="sm" color="fg.muted" mb="1">Key ID</Text>
                                                <Input
                                                    value={revokeKeyId}
                                                    onChange={(event) => setRevokeKeyId(event.target.value)}
                                                    placeholder="key_xxxxxxxxxxxx"
                                                />
                                            </Box>
                                            <Button
                                                colorPalette="red"
                                                onClick={() => void handleRevokeApiKey()}
                                                disabled={isRevokingKey}
                                            >
                                                {isRevokingKey ? "Revoking..." : "Revoke API Key"}
                                            </Button>
                                        </HStack>
                                        {revokeStatus && <Text color="green.500">{revokeStatus}</Text>}
                                        {revokeError && <Text color="red.500">{revokeError}</Text>}
                                    </Stack>
                                </Card.Body>
                            </Card.Root>
                        </Tabs.Content>
                    </Tabs.Root>
                </Stack>
            </Container>
        </Box>
    );
}
