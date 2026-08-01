"""
Knowledge-base URL search helper for v2 API clients.

Uses RetrieverService semantic search and returns ordered source URLs
extracted from metadata using configured source field priority.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from config import RAGConfig, get_default_config
from services.retriever import RetrieverService


def extract_source_url_from_metadata(
    metadata: Dict[str, Any],
    source_fields: List[str],
) -> Optional[str]:
    """Extract source URL from metadata using priority list."""
    for field in source_fields:
        if field in metadata and metadata[field]:
            source = metadata[field]
            if field == "minutes_url" and "/minutes" in source:
                source = source.replace("/minutes", "/evidence")
            return source
    return None


def build_result_title(
    metadata: Dict[str, Any],
    title_fields_config: Dict[str, List[str]],
) -> str:
    """Build a human-readable title from document metadata.

    Format: "Document Type · field1 · field2 ...".
    Falls back to just the document type label when no configured fields are present.
    """
    doc_type = str(metadata.get("document_type", "document"))
    label = doc_type.replace("-", " ").title()

    field_names = title_fields_config.get(doc_type, [])
    parts: List[str] = []
    for field_name in field_names:
        value = metadata.get(field_name)
        if value is not None and str(value).strip():
            parts.append(str(value).strip())

    if parts:
        sep = " \u00b7 "
        return f"{label} \u00b7 {sep.join(parts)}"
    return label


def build_result_preview(page_content: str, max_chars: int = 200) -> str:
    """Return the first *max_chars* characters of page content as a preview."""
    text = (page_content or "").strip()
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\u2026"


def _get_retriever(config: RAGConfig) -> RetrieverService:
    """Obtain the RetrieverService singleton, creating it if necessary."""
    retriever = RetrieverService.get_instance()
    if retriever is None:
        retriever = RetrieverService.get_instance(config=config)
    if retriever is None:
        raise RuntimeError("Retriever service is not available")
    return retriever


def search_source_urls(
    query: str,
    config: Optional[RAGConfig] = None,
    top_k: int = 10,
) -> List[str]:
    """Search the knowledge base and return ordered unique source URLs."""
    active_config = config or get_default_config()
    retriever = _get_retriever(active_config)
    results = retriever.search(query=query, top_k=top_k)

    urls: List[str] = []
    seen: set[str] = set()
    source_fields = active_config.pipeline.document_source_fields

    for doc, _ in results:
        metadata = doc.metadata if hasattr(doc, "metadata") else {}
        source_url = extract_source_url_from_metadata(metadata, source_fields)
        if source_url and source_url not in seen:
            seen.add(source_url)
            urls.append(source_url)

    return urls


def search_kb(
    query: str,
    config: Optional[RAGConfig] = None,
    top_k: int = 10,
) -> List[Dict[str, str]]:
    """Search the knowledge base and return enriched results with URL, title, and preview."""
    active_config = config or get_default_config()
    retriever = _get_retriever(active_config)
    results = retriever.search(query=query, top_k=top_k)

    source_fields = active_config.pipeline.document_source_fields
    title_fields_config = active_config.pipeline.document_type_title_fields

    enriched: List[Dict[str, str]] = []
    seen: set[str] = set()

    for doc, _ in results:
        metadata = doc.metadata if hasattr(doc, "metadata") else {}
        source_url = extract_source_url_from_metadata(metadata, source_fields)
        if not source_url or source_url in seen:
            continue
        seen.add(source_url)
        enriched.append({
            "url": source_url,
            "title": build_result_title(metadata, title_fields_config),
            "preview": build_result_preview(
                doc.page_content if hasattr(doc, "page_content") else "",
            ),
        })

    return enriched
