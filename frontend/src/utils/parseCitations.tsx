import { Tag } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import type { CitedDocument } from "@/types";

// UUID regex pattern for citations
const CITATION_REGEX = /\[([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\]/g;

export interface ParsedCitation {
    uuid: string;
    number: number;
    url: string | null;
}

export interface CitationClickContext {
    documentId: string;
    citationNumber: number;
    insightId?: string;
    topicId?: string;
}

interface ParseCitationOptions {
    interactive?: boolean;
    insightId?: string;
    topicId?: string;
}

/**
 * Parse text content with citation UUIDs and return React nodes
 * with citation tags replacing the UUID placeholders
 */
export function parseCitations(
    content: string,
    citedDocuments?: CitedDocument[],
    onCitationClick?: (url: string, context?: CitationClickContext) => void,
    options: ParseCitationOptions = {}
): ReactNode[] {
    const { interactive = true, insightId, topicId } = options;
    const nodes: ReactNode[] = [];
    const uuidToNumber = new Map<string, number>();
    const uuidToUrl = new Map<string, string | null>();
    let citationCounter = 1;
    let lastIndex = 0;

    // Build UUID to URL mapping from citedDocuments
    if (citedDocuments) {
        for (const doc of citedDocuments) {
            uuidToUrl.set(doc.document_id.toLowerCase(), doc.source_url);
        }
    }

    // First pass: assign numbers to unique UUIDs in order of appearance
    const matches = Array.from(content.matchAll(CITATION_REGEX));
    for (const match of matches) {
        const uuid = match[1].toLowerCase();
        if (!uuidToNumber.has(uuid)) {
            uuidToNumber.set(uuid, citationCounter++);
        }
    }

    // Second pass: build the nodes
    CITATION_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = CITATION_REGEX.exec(content)) !== null) {
        // Add text before this citation
        if (match.index > lastIndex) {
            nodes.push(content.slice(lastIndex, match.index));
        }

        const uuid = match[1].toLowerCase();
        const number = uuidToNumber.get(uuid)!;
        const url = uuidToUrl.get(uuid) ?? null;
        const hasUrl = url !== null;

        const handleClick = () => {
            if (interactive && hasUrl && onCitationClick) {
                onCitationClick(url, {
                    documentId: uuid,
                    citationNumber: number,
                    insightId,
                    topicId,
                });
            }
        };

        // Create the citation tag
        const citationTag = (
            <Tag.Root
                key={`citation-${key++}`}
                as="span"
                data-no-card-select="true"
                data-onboarding="citation-link"
                data-onboarding-index={number}
                size="sm"
                variant="surface"
                colorPalette="blue"
                cursor={interactive && hasUrl ? "pointer" : "default"}
                onClick={interactive && hasUrl ? (event) => {
                    event.stopPropagation();
                    handleClick();
                } : undefined}
                mx="0.5"
                display="inline-flex"
                _hover={interactive && hasUrl ? { bg: "blue.100" } : undefined}
            >
                <Tag.Label>{number}</Tag.Label>
            </Tag.Root>
        );

        // Wrap in tooltip if no URL
        if (!hasUrl) {
            nodes.push(
                <Tooltip key={`tooltip-${key}`} openDelay={200} content="Source unavailable">
                    {citationTag}
                </Tooltip>
            );
        } else {
            nodes.push(citationTag);
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last citation
    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex));
    }

    return nodes;
}

/**
 * Extract unique citation UUIDs from content
 */
export function extractCitationIds(content: string): string[] {
    const ids = new Set<string>();
    const matches = content.matchAll(CITATION_REGEX);
    for (const match of matches) {
        ids.add(match[1].toLowerCase());
    }
    return Array.from(ids);
}

/**
 * Render citation chips for cited documents when there are no inline citation
 * placeholders in the content (e.g. visualization insights).
 */
export function renderCitationChips(
    citedDocuments?: CitedDocument[],
    onCitationClick?: (url: string, context?: CitationClickContext) => void,
    options: ParseCitationOptions = {}
): ReactNode[] {
    const { interactive = true, insightId, topicId } = options;
    if (!citedDocuments || citedDocuments.length === 0) return [];

    const uniqueDocuments = citedDocuments.filter((doc, index, array) =>
        array.findIndex((candidate) => candidate.document_id.toLowerCase() === doc.document_id.toLowerCase()) === index
    );

    return uniqueDocuments.map((doc, index) => {
        const url = doc.source_url;
        const hasUrl = Boolean(url);

        const citationTag = (
            <Tag.Root
                key={`citation-chip-${doc.document_id}`}
                as="span"
                data-no-card-select="true"
                size="sm"
                variant="surface"
                colorPalette="blue"
                cursor={interactive && hasUrl ? "pointer" : "default"}
                onClick={
                    interactive && url && onCitationClick
                        ? (event) => {
                            event.stopPropagation();
                            onCitationClick(url, {
                                documentId: doc.document_id,
                                citationNumber: index + 1,
                                insightId,
                                topicId,
                            });
                        }
                        : undefined
                }
                mx="0.5"
                display="inline-flex"
                _hover={interactive && hasUrl ? { bg: "blue.100" } : undefined}
            >
                <Tag.Label>{index + 1}</Tag.Label>
            </Tag.Root>
        );

        if (!hasUrl) {
            return (
                <Tooltip key={`citation-chip-tooltip-${doc.document_id}`} openDelay={200} content="Source unavailable">
                    {citationTag}
                </Tooltip>
            );
        }

        return citationTag;
    });
}
