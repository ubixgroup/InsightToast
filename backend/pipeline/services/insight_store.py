"""
Insight Store Service

Manages a Qdrant collection for storing insight embeddings
to enable semantic search and threading of related insights.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    Filter,
    FieldCondition,
    MatchValue,
    SearchParams,
)

from config import RAGConfig, get_default_config


class InsightStore:
    """
    Manages insight embeddings in Qdrant for semantic search and threading.

    Qdrant collection stores:
    - Insight text embeddings (content for text insights, explanation for viz)
    - Thread assignments
    - Topic associations
    - Timestamps and metadata

    Supports:
    - Adding insights with automatic embedding
    - Topic-scoped semantic search
    - Thread management
    - Session dump and cleanup
    """

    _instance = None

    @classmethod
    def get_instance(
        cls,
        config: Optional[RAGConfig] = None,
        session_id: Optional[str] = None,
    ) -> Optional["InsightStore"]:
        """Get singleton instance, create if doesn't exist."""
        if cls._instance is None and config is not None:
            cls._instance = cls(config, session_id)
        return cls._instance

    def __init__(
        self,
        config: Optional[RAGConfig] = None,
        session_id: Optional[str] = None,
    ):
        """
        Initialize insight store for a session.

        Args:
            config: RAG configuration
            session_id: Unique session identifier (generates new if None)
        """
        self.config = config or get_default_config()
        self.session_id = session_id or str(uuid.uuid4())
        self.collection_name = f"insight_session_{self.session_id}"

        # Initialize Qdrant client
        self.client = QdrantClient(
            url=self.config.qdrant.url,
            timeout=self.config.qdrant.timeout,
        )

        # Initialize embedding model
        self.embeddings = OllamaEmbeddings(
            model=self.config.llm.embedding_model,
            base_url=self.config.llm.ollama_base_url,
        )

        # Initialize collection
        self._initialize_collection()

    def _initialize_collection(self) -> None:
        """Create Qdrant collection for insights."""
        # Get embedding dimension
        sample_embedding = self.embeddings.embed_query("test")
        embedding_dim = len(sample_embedding)

        # Check if collection exists
        collections = self.client.get_collections().collections
        collection_names = {c.name for c in collections}

        # Create collection if needed
        if self.collection_name not in collection_names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=embedding_dim,
                    distance=Distance.COSINE,
                ),
            )

        # Initialize LangChain vector store
        self._vector_store = QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embeddings,
        )

    def add_insight(
        self,
        insight_id: str,
        text: str,
        thread_id: str,
        topic_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Add an insight with automatic embedding.

        Args:
            insight_id: Unique insight identifier
            text: Insight text to embed (content for text insights, explanation for viz)
            thread_id: Thread this insight belongs to
            topic_id: Topic this insight belongs to
            metadata: Additional metadata

        Returns:
            The insight_id
        """
        # Prepare metadata
        insight_metadata = {
            "insight_id": insight_id,
            "thread_id": thread_id,
            "topic_id": topic_id,
            "timestamp": datetime.now().isoformat(),
            **(metadata or {}),
        }

        # Create Document and add to vector store
        doc = Document(page_content=text, metadata=insight_metadata)
        self._vector_store.add_documents([doc], ids=[insight_id])

        return insight_id

    def search_insights_in_topic(
        self,
        query: str,
        topic_id: str,
        top_k: Optional[int] = None,
        threshold: Optional[float] = None,
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """
        Search for similar insights within a specific topic.

        Args:
            query: Search query (or hypothetical insight text)
            topic_id: Topic to search within
            top_k: Number of results to return (default from config)
            threshold: Minimum similarity score (default from config)

        Returns:
            List of (insight_id, similarity_score, payload) tuples
        """
        top_k = top_k or self.config.pipeline.insight_retrieval_top_k
        threshold = threshold or self.config.pipeline.insight_similarity_threshold

        # Create filter for topic
        topic_filter = Filter(
            must=[
                FieldCondition(
                    key="metadata.topic_id",
                    match=MatchValue(value=topic_id),
                )
            ]
        )

        # Build search params for HNSW optimization (same as main retriever)
        search_params = SearchParams(
            hnsw_ef=self.config.qdrant.hnsw_ef,
            exact=self.config.qdrant.exact_search,
        )

        # Search with topic filter using QdrantVectorStore
        results = self._vector_store.similarity_search_with_score(
            query,
            k=top_k,
            filter=topic_filter,
            score_threshold=threshold,
            search_params=search_params,
        )

        # Extract results - format: List[(Document, score)]
        matches = [
            (doc.metadata.get("insight_id", ""), score, doc.metadata)
            for doc, score in results
        ]

        return matches

    def _save_session_dump(self, output_dir: Optional[Path] = None) -> Path:
        """
        Save session dump to JSON file.

        Args:
            output_dir: Output directory (default: ./session_dumps)

        Returns:
            Path to dump file
        """
        if output_dir is None:
            output_dir = Path("./session_dumps")
        output_dir.mkdir(parents=True, exist_ok=True)

        # Query all insights
        results = self.client.scroll(
            collection_name=self.collection_name,
            limit=10000,
            with_payload=True,
            with_vectors=True,
        )

        points = results[0]

        # Build dump data
        dump_data = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "insights": [
                {
                    "id": point.id,
                    "embedding": point.vector,
                    "payload": point.payload,
                }
                for point in points
            ],
        }

        # Write to file
        dump_file = (
            output_dir
            / f"insights_{self.session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        with open(dump_file, "w") as f:
            json.dump(dump_data, f, indent=2)

        return dump_file

    def _clear_collection(self) -> None:
        """Delete the session collection from Qdrant."""
        try:
            self.client.delete_collection(collection_name=self.collection_name)
        except Exception:
            pass  # Collection might not exist

    def close_session(
        self, save_dump: bool = True, output_dir: Optional[Path] = None
    ) -> Optional[Path]:
        """
        Close session: save dump and clear Qdrant collection.

        Args:
            save_dump: Whether to save dump before clearing
            output_dir: Output directory for dump

        Returns:
            Path to dump file if save_dump=True, else None
        """
        dump_file = None

        if save_dump:
            dump_file = self._save_session_dump(output_dir)

        self._clear_collection()

        return dump_file
