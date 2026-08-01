"""
Web Search Service for the RAG Pipeline.

Provides optional web search functionality using DuckDuckGo (via langchain-community)
to supplement knowledge base retrieval with current web information.

This service is ADDITIVE — it never replaces KB search, only augments it.
"""

from __future__ import annotations

import uuid
from typing import List, Optional

from langchain_core.documents import Document


class WebSearchService:
    """
    Web search service that queries DuckDuckGo and returns LangChain Documents.

    Results are tagged with `document_type: "web"` metadata so downstream agents
    and insight generators can distinguish them from KB documents.
    """

    def __init__(self, max_results: int = 5):
        self.max_results = max_results

        # Lazy-import to avoid hard dependency when web search is disabled
        try:
            from langchain_community.tools import DuckDuckGoSearchResults

            self._tool = DuckDuckGoSearchResults(
                num_results=self.max_results,
                output_format="list",
            )
        except ImportError as e:
            raise ImportError(
                "langchain-community is required for web search. "
                "Install it with: pip install langchain-community"
            ) from e

    def search(
        self,
        query: str,
        max_results: Optional[int] = None,
    ) -> List[Document]:
        """
        Execute a web search and return results as LangChain Documents.

        Args:
            query: The search query string.
            max_results: Override for max results (capped by instance max_results).

        Returns:
            List of LangChain Document objects with web metadata.
        """
        effective_max = min(max_results or self.max_results, self.max_results)

        try:
            raw_results = self._tool.invoke(query)
        except Exception as e:
            print(f"[WEB_SEARCH] Search failed for query '{query}': {e}")
            return []

        if not raw_results:
            return []

        documents: List[Document] = []
        for item in raw_results[:effective_max]:
            if isinstance(item, dict):
                snippet = item.get("snippet", item.get("body", ""))
                title = item.get("title", "Web Result")
                link = item.get("link", item.get("url", ""))
            else:
                # Fallback for string results
                snippet = str(item)
                title = "Web Result"
                link = ""

            if not snippet:
                continue

            doc = Document(
                page_content=snippet,
                metadata={
                    "_id": str(uuid.uuid4()),
                    "document_type": "web",
                    "title": title,
                    "source_url": link,
                    "search_query": query,
                },
            )
            documents.append(doc)

        print(
            f"[WEB_SEARCH] Retrieved {len(documents)} web results for query: "
            f"'{query[:80]}...'" if len(query) > 80 else
            f"[WEB_SEARCH] Retrieved {len(documents)} web results for query: '{query}'"
        )
        return documents


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

_web_search_instance: Optional[WebSearchService] = None


def get_web_search_service(
    provider: str = "duckduckgo",
    max_results: int = 5,
) -> WebSearchService:
    """
    Get or create a web search service instance.

    Args:
        provider: Search provider name (currently only "duckduckgo" supported).
        max_results: Maximum number of results per search.

    Returns:
        WebSearchService instance.
    """
    global _web_search_instance

    if provider != "duckduckgo":
        raise ValueError(
            f"Unsupported web search provider: '{provider}'. "
            "Currently only 'duckduckgo' is supported."
        )

    if _web_search_instance is None:
        _web_search_instance = WebSearchService(max_results=max_results)

    return _web_search_instance
