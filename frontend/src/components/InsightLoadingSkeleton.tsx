"use client";

import { Box, Skeleton, Stack, Text } from "@chakra-ui/react";

interface InsightLoadingSkeletonProps {
    isViz?: boolean;
}

export function InsightLoadingSkeleton({ isViz = false }: InsightLoadingSkeletonProps) {
    return (
        <Box
            p="3"
            borderRadius="md"
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border.muted"
        >
            <Stack gap="2">
                {isViz ? (
                    <>
                        <Skeleton height="4" width="60%" variant="shine" />
                        <Skeleton height="120px" variant="shine" />
                        <Skeleton height="3" width="80%" variant="shine" />
                    </>
                ) : (
                    <>
                        <Skeleton height="4" variant="shine" />
                        <Skeleton height="4" variant="shine" />
                        <Skeleton height="4" width="70%" variant="shine" />
                    </>
                )}
                <Text fontSize="xs" color="fg.muted" mt="1">
                    Generating insight...
                </Text>
            </Stack>
        </Box>
    );
}
