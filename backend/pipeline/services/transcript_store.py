"""
Transcript Store Service

Manages a Qdrant collection for storing conversation transcript chunks
with embeddings for topic similarity computation.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from config import RAGConfig, get_default_config


class TranscriptStore:
    """
    Manages transcript chunks in Qdrant with embeddings for topic clustering.

    Qdrant collection stores:
    - Transcript chunk text and embeddings
    - Topic assignments
    - Speaker information
    - Timestamps

    Local storage (in-memory):
    - Topic centroids (incrementally updated as chunks are added)
    - Topic chunk counts

    Supports:
    - Adding chunks with automatic embedding
    - Incremental centroid updates (efficient, stored locally)
    - Finding similar topics based on cosine similarity
    - Session dump and cleanup
    """

    _instance = None

    @classmethod
    def get_instance(
        cls,
        config: Optional[RAGConfig] = None,
        session_id: Optional[str] = None,
    ) -> Optional["TranscriptStore"]:
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
        Initialize transcript store for a session.

        Args:
            config: RAG configuration
            session_id: Unique session identifier (generates new if None)
        """
        self.config = config or get_default_config()
        self.session_id = session_id or str(uuid.uuid4())
        self.collection_name = f"transcript_session_{self.session_id}"

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

        # Local storage for topic centroids: {topic_id: {"centroid": vector, "count": int}}
        self._centroid_cache: Dict[str, Dict[str, Any]] = {}

        # Initialize collection (must be after client and embeddings)
        self._initialize_collection()

    def _initialize_collection(self) -> None:
        """Create Qdrant collection for this session (chunks only)."""
        # Get embedding dimension
        sample_embedding = self.embeddings.embed_query("test")
        embedding_dim = len(sample_embedding)

        # Check if collection exists
        collections = self.client.get_collections().collections
        collection_names = {c.name for c in collections}

        # Create chunk collection if needed
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

    def add_chunk(
        self,
        chunk_id: str,
        text: str,
        topic_id: Optional[str] = None,
        speaker: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Add a transcript chunk with automatic embedding.
        Updates topic centroid incrementally if topic is assigned.

        Args:
            chunk_id: Unique chunk identifier
            text: Transcript text
            topic_id: Assigned topic ID (if any)
            speaker: Speaker identifier
            metadata: Additional metadata

        Returns:
            The chunk_id
        """
        # Generate embedding
        embedding = self.embeddings.embed_query(text)

        # Prepare metadata
        chunk_metadata = {
            "chunk_id": chunk_id,
            "topic_id": topic_id,
            "speaker": speaker,
            "timestamp": datetime.now().isoformat(),
            **(metadata or {}),
        }

        # Create Document and add to vector store
        doc = Document(page_content=text, metadata=chunk_metadata)
        self._vector_store.add_documents([doc], ids=[chunk_id])

        # Update centroid incrementally if topic assigned
        if topic_id:
            self._update_topic_centroid(topic_id, embedding)

        return chunk_id

    def _update_topic_centroid(self, topic_id: str, new_embedding: List[float]) -> None:
        """
        Incrementally update topic centroid with new chunk embedding.
        Centroids are stored locally, not in Qdrant.

        Uses formula: new_centroid = (old_centroid * n + new_embedding) / (n + 1)

        Args:
            topic_id: Topic identifier
            new_embedding: Embedding of new chunk
        """
        if topic_id in self._centroid_cache:
            # Update existing centroid
            cached = self._centroid_cache[topic_id]
            old_centroid = np.array(cached["centroid"])
            count = cached["count"]

            # Incremental update
            new_centroid = (old_centroid * count + np.array(new_embedding)) / (
                count + 1
            )

            # Normalize
            norm = np.linalg.norm(new_centroid)
            if norm > 0:
                new_centroid = new_centroid / norm

            # Update cache
            self._centroid_cache[topic_id] = {
                "centroid": new_centroid.tolist(),
                "count": count + 1,
            }
        else:
            # First chunk for this topic - create centroid
            normalized = np.array(new_embedding)
            norm = np.linalg.norm(normalized)
            if norm > 0:
                normalized = normalized / norm

            # Store in cache
            self._centroid_cache[topic_id] = {
                "centroid": normalized.tolist(),
                "count": 1,
            }

    def get_topic_centroid(self, topic_id: str) -> Optional[List[float]]:
        """
        Get stored topic centroid from local cache.

        Args:
            topic_id: Topic identifier

        Returns:
            Centroid embedding (normalized) or None if topic has no chunks
        """
        cached = self._centroid_cache.get(topic_id)
        if cached:
            return cached["centroid"]
        return None

    def find_similar_topics(
        self,
        chunk_text: str,
        topic_ids: List[str],
        threshold: float = 0.75,
    ) -> List[Tuple[str, float]]:
        """
        Find topics with centroid similarity above threshold.

        Args:
            chunk_text: New transcript chunk
            topic_ids: List of topic IDs to check
            threshold: Minimum cosine similarity (default 0.75)

        Returns:
            List of (topic_id, similarity_score) tuples for candidates
        """
        if not topic_ids:
            return []

        # Embed the chunk
        chunk_embedding = self.embeddings.embed_query(chunk_text)
        chunk_vec = np.array(chunk_embedding)

        # Normalize chunk vector
        chunk_norm = np.linalg.norm(chunk_vec)
        if chunk_norm > 0:
            chunk_vec = chunk_vec / chunk_norm

        # Compute similarity with each topic centroid
        candidates = []
        for topic_id in topic_ids:
            centroid = self.get_topic_centroid(topic_id)
            if centroid is None:
                continue

            centroid_vec = np.array(centroid)

            # Cosine similarity (vectors are already normalized)
            similarity = float(np.dot(chunk_vec, centroid_vec))

            if similarity >= threshold:
                candidates.append((topic_id, similarity))

        # Sort by similarity (descending)
        candidates.sort(key=lambda x: x[1], reverse=True)

        return candidates

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

        # Query all chunks
        chunk_results = self.client.scroll(
            collection_name=self.collection_name,
            limit=10000,
            with_payload=True,
            with_vectors=True,
        )

        chunk_points = chunk_results[0]

        # Build dump data
        dump_data = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "chunks": [
                {
                    "id": point.id,
                    "embedding": point.vector,
                    "payload": point.payload,
                }
                for point in chunk_points
            ],
            "centroids": self._centroid_cache,
        }

        # Write to file
        dump_file = (
            output_dir
            / f"session_{self.session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        with open(dump_file, "w") as f:
            json.dump(dump_data, f, indent=2)

        return dump_file

    def _clear_collection(self) -> None:
        """Delete the session collection from Qdrant and clear local cache."""
        try:
            self.client.delete_collection(collection_name=self.collection_name)
        except Exception:
            pass  # Collection might not exist

        # Clear local centroid cache
        self._centroid_cache.clear()

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
