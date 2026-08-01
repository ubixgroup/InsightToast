"""
Retriever Service for the RAG Pipeline.

Provides retrieval functionality with metadata filtering,
and peripheral chunk expansion.
"""

from __future__ import annotations

import time
from typing import List, Optional, Tuple

from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue, SearchParams

from config import RAGConfig, get_default_config


class RetrieverService:
    """
    Service for retrieving documents from Qdrant vector store.

    Supports:
    - Semantic search with metadata filtering
    - Peripheral chunk expansion
    """

    _instance = None

    @classmethod
    def get_instance(
        cls, config: Optional[RAGConfig] = None
    ) -> Optional["RetrieverService"]:
        """Get singleton instance, create if doesn't exist."""
        if cls._instance is None and config is not None:
            cls._instance = cls(config)
        return cls._instance

    def __init__(
        self, config: Optional[RAGConfig] = None, collection_name: Optional[str] = None
    ):
        self.config = config or get_default_config()

        # Use provided collection_name or default from config
        self.collection_name = collection_name or self.config.qdrant.collection_name

        # Initialize Qdrant client with optimized settings for performance
        # - Increased timeout for large collections
        # - Connection pooling via max_retries and pool_size for concurrent requests
        self._client = QdrantClient(
            url=self.config.qdrant.url,
            timeout=self.config.qdrant.timeout,
            # Enable connection pooling for better performance
            pool_size=10,  # Allow up to 10 concurrent connections
        )
        
        # Initialize embeddings model
        self._embeddings = OllamaEmbeddings(
            model=self.config.llm.embedding_model,
            base_url=self.config.llm.ollama_base_url,
            keep_alive=-1,# Keep model loaded indefinitely
        )
        
        self._vector_store = QdrantVectorStore(
            client=self._client,
            collection_name=self.collection_name,
            embedding=self._embeddings,
        )
        
        # Preload collection into memory for faster searches
        # self._preload_collection()

    # def _preload_collection(self) -> None:
    #     """Preload collection into RAM for faster searches.
        
    #     This ensures that vectors and payloads are loaded into memory
    #     rather than being read from disk on each query.
    #     """
    #     try:
    #         print(f"[RETRIEVER] Preloading collection '{self.collection_name}' into memory...")
    #         preload_start = time.time()
            
    #         # Update collection to use in-memory storage
    #         self._client.update_collection(
    #             collection_name=self.collection_name,
    #             optimizers_config={
    #                 "memmap_threshold": 0,  # Force all data into RAM
    #             },
    #         )
            
    #         preload_time = time.time() - preload_start
    #         print(f"[RETRIEVER] Collection preloaded in {preload_time:.2f}s")
    #     except Exception as e:
    #         # Non-fatal: continue even if preload fails
    #         print(f"[RETRIEVER] Warning: Failed to preload collection: {e}")

    def search(
        self,
        query: str,
        top_k: int = 15,
        document_types: Optional[List[str]] = None,
        date_range_start: Optional[str] = None,
        date_range_end: Optional[str] = None,
    ) -> List[Tuple[Document, float]]:
        """
        Search for documents matching the query.

        Args:
            query: The search query (already refined by retriever planner using HyDE if needed)
            top_k: Number of documents to retrieve (default: 15)
            document_types: Optional list of document types to filter by (e.g., ['debate', 'bill'])
            date_range_start: Optional start date for filtering (YYYY-MM-DD format)
            date_range_end: Optional end date for filtering (YYYY-MM-DD format)

        Returns:
            List of (Document, score) tuples
        """
        overall_start = time.time()
        
        # Build filter
        filter_start = time.time()
        qdrant_filter = self._build_filter(document_types or [])
        filter_time = time.time() - filter_start

        # Build search params for HNSW optimization
        search_params = SearchParams(
            hnsw_ef=self.config.qdrant.hnsw_ef,
            exact=self.config.qdrant.exact_search,
        )

        # Embedding generation timing
        embed_start = time.time()
        # Pre-generate embedding to isolate timing
        query_embedding = self._embeddings.embed_query(query)
        embed_time = time.time() - embed_start
        print(f"[RETRIEVER] Embedding generation: {embed_time:.2f}s")

        # Qdrant search timing
        search_start = time.time()
        # Use similarity_search_by_vector if available, otherwise fall back to regular method
        try:
            results = self._vector_store.similarity_search_with_score_by_vector(
                query_embedding,
                k=top_k,
                filter=qdrant_filter,
                search_params=search_params,
            )
        except AttributeError:
            # Fallback if method doesn't exist
            results = self._vector_store.similarity_search_with_score(
                query,
                k=top_k,
                filter=qdrant_filter,
                search_params=search_params,
            )
        search_time = time.time() - search_start
        print(f"[RETRIEVER] Qdrant search: {search_time:.2f}s")

        # Apply date filters (post-retrieval since Qdrant Range is numeric-only)
        date_filter_start = time.time()
        results = self._apply_date_filters(results, date_range_start, date_range_end)
        date_filter_time = time.time() - date_filter_start
        
        overall_time = time.time() - overall_start
        print(f"[RETRIEVER] Total search time: {overall_time:.2f}s (filter: {filter_time:.3f}s, embed: {embed_time:.2f}s, search: {search_time:.2f}s, date_filter: {date_filter_time:.3f}s)")

        return results

    # async def async_search(
    #     self,
    #     query: str,
    #     top_k: int = 15,
    #     document_types: Optional[List[str]] = None,
    #     date_range_start: Optional[str] = None,
    #     date_range_end: Optional[str] = None,
    # ) -> List[Tuple[Document, float]]:
    #     """
    #     Async search for documents matching the query.

    #     Args:
    #         query: The search query (already refined by retriever planner using HyDE if needed)
    #         top_k: Number of documents to retrieve (default: 15)
    #         document_types: Optional list of document types to filter by (e.g., ['debate', 'bill'])
    #         date_range_start: Optional start date for filtering (YYYY-MM-DD format)
    #         date_range_end: Optional end date for filtering (YYYY-MM-DD format)

    #     Returns:
    #         List of (Document, score) tuples
    #     """
    #     overall_start = time.time()
        
    #     # Build filter
    #     filter_start = time.time()
    #     qdrant_filter = self._build_filter(document_types or [])
    #     filter_time = time.time() - filter_start

    #     # Build search params for HNSW optimization
    #     search_params = SearchParams(
    #         hnsw_ef=self.config.qdrant.hnsw_ef,
    #         exact=self.config.qdrant.exact_search,
    #     )

    #     # Embedding generation timing
    #     embed_start = time.time()
    #     query_embedding = self._embeddings.embed_query(query)
    #     embed_time = time.time() - embed_start
    #     print(f"[RETRIEVER ASYNC] Embedding generation: {embed_time:.2f}s")

    #     # Async search - use LangChain's async method
    #     search_start = time.time()
    #     try:
    #         # Try async method with pre-generated embedding
    #         results = await self._vector_store._asimilarity_search_with_score(
    #             query,
    #             k=top_k,
    #             filter=qdrant_filter,
    #             search_params=search_params,
    #         )
    #     except AttributeError:
    #         # Fallback to sync if async not available
    #         results = self._vector_store.similarity_search_with_score(
    #             query,
    #             k=top_k,
    #             filter=qdrant_filter,
    #             search_params=search_params,
    #         )
    #     search_time = time.time() - search_start
    #     print(f"[RETRIEVER ASYNC] Qdrant search: {search_time:.2f}s")

    #     # Apply date filters (post-retrieval since Qdrant Range is numeric-only)
    #     date_filter_start = time.time()
    #     results = self._apply_date_filters(results, date_range_start, date_range_end)
    #     date_filter_time = time.time() - date_filter_start
        
    #     overall_time = time.time() - overall_start
    #     print(f"[RETRIEVER ASYNC] Total search time: {overall_time:.2f}s (filter: {filter_time:.3f}s, embed: {embed_time:.2f}s, search: {search_time:.2f}s, date_filter: {date_filter_time:.3f}s)")

    #     return results

    def _apply_date_filters(
        self,
        results: List[Tuple[Document, float]],
        date_start: Optional[str] = None,
        date_end: Optional[str] = None,
    ) -> List[Tuple[Document, float]]:
        """
        Filter results by date criteria.

        Handles date_range filtering.

        NOTE: This is done post-retrieval because Qdrant's Range filter only supports
        numeric values, not string date comparisons. This means we might retrieve 100 docs
        and filter down to 10, wasting retrieval slots.

        OPTIMIZATION STRATEGY: If date filtering becomes a performance bottleneck:
        1. Store dates as numeric timestamps (Unix epoch) in Qdrant during indexing
        2. Use Qdrant's Range filter pre-retrieval for better efficiency
        3. Keep string dates in metadata for display purposes
        """
        # If no date filters, return as-is
        if not date_start and not date_end:
            return results

        from datetime import datetime

        # Helper function to extract and parse date
        def get_document_date(doc: Document) -> Optional[datetime]:
            # Try 'date' field first
            date_str = doc.metadata.get("date")
            # If not present, try 'introduced' field
            if not date_str:
                date_str = doc.metadata.get("introduced")

            if not date_str:
                return None

            # Parse date string to datetime
            try:
                # Handle various date formats
                if isinstance(date_str, str):
                    # Try YYYY-MM-DD format
                    return datetime.strptime(date_str, "%Y-%m-%d")
                elif isinstance(date_str, datetime):
                    return date_str
                else:
                    return None
            except ValueError:
                # If parsing fails, return None
                return None

        # Parse filter dates
        start_dt = None
        end_dt = None
        try:
            if date_start:
                start_dt = datetime.strptime(date_start, "%Y-%m-%d")
            if date_end:
                end_dt = datetime.strptime(date_end, "%Y-%m-%d")
        except ValueError:
            # If filter dates are invalid, return results unfiltered
            return results

        filtered = []
        for doc, score in results:
            doc_date = get_document_date(doc)

            if doc_date is None:
                # No date - include the document
                filtered.append((doc, score))
                continue

            # Check date range start
            if start_dt and doc_date < start_dt:
                continue

            # Check date range end
            if end_dt and doc_date > end_dt:
                continue

            # Passed all filters
            filtered.append((doc, score))

        return filtered

    def get_peripheral_chunks(
        self,
        document: Document,
        before: int = 1,
        after: int = 1,
    ) -> List[Document]:
        """
        Get chunks adjacent to the given document.

        Args:
            document: The document to expand around
            before: Number of chunks to get before
            after: Number of chunks to get after

        Returns:
            List of peripheral documents (may be empty if not found)
        """
        metadata = document.metadata
        source_file = metadata.get("source_file")
        chunk_id = metadata.get("chunk_id")

        if source_file is None or chunk_id is None:
            return []

        peripheral_docs = []

        # Get chunks before and after
        for offset in range(-before, after + 1):
            if offset == 0:
                continue  # Skip the original chunk

            target_chunk_id = chunk_id + offset
            if target_chunk_id < 0:
                continue

            # Query for the specific chunk
            try:
                results = self._client.scroll(
                    collection_name=self.collection_name,
                    scroll_filter=Filter(
                        must=[
                            FieldCondition(
                                key="metadata.source_file",
                                match=MatchValue(value=source_file),
                            ),
                            FieldCondition(
                                key="metadata.chunk_id",
                                match=MatchValue(value=target_chunk_id),
                            ),
                        ]
                    ),
                    limit=1,
                    with_payload=True,
                )

                points = results[0]
                if points:
                    point = points[0]
                    doc = Document(
                        page_content=point.payload.get("page_content", ""),
                        metadata=point.payload.get("metadata", {}),
                    )
                    peripheral_docs.append(doc)
            except Exception:
                # Chunk doesn't exist, skip
                continue

        return peripheral_docs

    def _build_filter(self, document_types: List[str]) -> Optional[Filter]:
        """Build a Qdrant filter from document types."""
        if not document_types:
            return None

        must_conditions = []

        # Document type filter
        if len(document_types) == 1:
            must_conditions.append(
                FieldCondition(
                    key="metadata.document_type",
                    match=MatchValue(value=document_types[0]),
                )
            )
        else:
            # For multiple types, we need a should clause
            # Qdrant requires nested filters for OR conditions
            should_filters = []
            for dt in document_types:
                should_filters.append(
                    FieldCondition(
                        key="metadata.document_type",
                        match=MatchValue(value=dt),
                    )
                )
            # Create a filter with should conditions
            must_conditions.append(Filter(should=should_filters))

        if not must_conditions:
            return None

        return Filter(must=must_conditions)
