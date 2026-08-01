"""
Configuration for the Multi-Agentic RAG Pipeline.

Provides settings for LLMs (Ollama/Gemini), Qdrant vector store,
and other pipeline parameters.
"""

import os
from dataclasses import dataclass, field
from datetime import datetime
from typing import List
from pathlib import Path
from typing import Dict, Optional

from dotenv import load_dotenv

# Load .env from project root
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = _PROJECT_ROOT / ".env"
if _ENV_FILE.exists():
    load_dotenv(_ENV_FILE)
else:
    # Try loading from current directory as fallback
    load_dotenv()


@dataclass
class LLMConfig:
    """Configuration for LLM providers."""

    # Gemini settings (for complex reasoning tasks)
    default_gemini_model: str = "gemini-2.0-flash"
    gemini_temperature: float = 0.1
    gemini_api_key: Optional[str] = field(
        default_factory=lambda: os.getenv("GOOGLE_API_KEY")
    )

    # Ollama settings (for simpler tasks, local)
    default_ollama_model: str = "gemma3:12b"
    ollama_base_url: str = field(
        default_factory=lambda: os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    )
    ollama_temperature: float = 0.1

    # Embedding model
    embedding_model: str = "embeddinggemma:latest"


@dataclass
class QdrantConfig:
    """Configuration for Qdrant vector store."""

    url: str = field(
        default_factory=lambda: os.getenv("QDRANT_URL", "http://localhost:6333")
    )
    collection_name: str = field(
        default_factory=lambda: os.getenv("QDRANT_COLLECTION", "parliament_documents")
    )

    # Vega-Altair documentation collection for viz generation
    vega_docs_collection: str = "vega_altair_docs"

    # Retrieval defaults
    default_top_k: int = 10
    score_threshold: Optional[float] = None

    # Timeout for Qdrant client operations (in seconds)
    timeout: float = 60.0

    # HNSW search optimization parameters
    # Lower hnsw_ef reduces search time but may slightly reduce recall
    # Default Qdrant ef is 128; we use 64 for 2x faster search with minimal quality loss
    hnsw_ef: int = 64
    exact_search: bool = False


@dataclass
class PipelineConfig:
    """Configuration for the RAG pipeline behavior."""

    # Max number of retrieved documents (reduced from 30 to 15 for speed)
    max_retrieved_documents: int = 15

    # Max iterations for retrieval refinement loop.
    # Set to 0 to skip retriever_feedback entirely (retriever_planner exits directly to insight_selector).
    # max_retrieval_iterations: int = 2
    max_retrieval_iterations: int = 0

    # Document relevance threshold for filtering (0.0-1.0 scale)
    document_relevance_threshold: float = 0.6

    # Max queries to generate per transcript chunk
    max_queries_per_chunk: int = 3

    # Max topics to maintain in memory
    max_active_topics: int = 10

    # Domain context for prompts (describes the conversation domain and organization)
    # -- Committee meeting demo context --
    # domain_context: str = (
    #     "parliamentary committee meetings in the Parliament of Canada, "
    #     "involving Members of Parliament (MPs), witnesses, and committee staff "
    #     "deliberating on legislative and policy matters"
    # )
    # -- User study context --
    # domain_context: str = (
    #     "a collaborative decision-making discussion on a legislative matter, "
    #     "where participants review and analyze Canadian parliamentary documents "
    #     "to inform their decisions"
    # )

    domain_context: str = (
        "A multi-national sustainability team at a Canadian energy company deliberates on market expansion"
        ", with environmental considerations globally and nationally."
    )

    # Knowledge base context for prompts (describes the knowledge base and its contents)
    knowledge_base_context: str = (
        "Knowledge base contains Canadian legislative and regulatory documents and information, including debates, bills, committee reports, research papers, petitions, journals, order papers, politicians, library, and voting records from the Canadian Parliament. "
        "These parliamentary documents contain legislative information, voting records, and committee reports."
        "These legislative documents are true, accurate historical information from the Canadian Parliament."
    )

    # Document types available in the knowledge base with descriptions
    # Used by retrieval agents to understand what information sources are available
    document_types: Dict[str, str] = field(
        default_factory=lambda: {
            "debate": "Hansard transcripts of parliamentary debates with speaker, date, and session information, from January 17th 1994",
            "bill": "Legislative bill texts with status, sponsors, and session details, from February 2nd 2001",
            "committee": "Committee meeting records and witness testimonies",
            "committee-report": "Formal committee reports with findings and recommendations",
            "research": "Library of Parliament research papers and briefings on policy issues",
            "petition": "Public petitions submitted to Parliament",
            "journal": "Official House journals documenting daily proceedings",
            "order-paper": "Order papers listing scheduled parliamentary business",
            "politician": "Information about MPs, ministers, and their parliamentary roles",
            "library": "Library of Parliament research papers, Studies, and sessional papers",
            "vote": "Voting records with session, date, result, and party voting patterns",
        }
    )

    # Topic detection settings
    topic_similarity_threshold: float = (
        0.75  # Cosine similarity threshold for topic matching (kept for backward compatibility)
    )
    max_topic_examples: int = (
        10  # Number of example chunks per topic prompt (increased for LLM-based classification)
    )

    # Context window size (used across multiple agents for conversation context)
    context_window_size: int = 5  # Number of recent chunks to provide as context

    # Assessment-specific context window (insight_need_assessment + insight_selector)
    # Larger than context_window_size so these agents see more conversation history
    assessment_context_window_size: int = (
        10  # Number of recent chunks for assessment agents
    )

    # Number of recent session insights shown to assessment agents (need_assessment + selector)
    # These are the N most-recent insights sorted by created_at, independent of chunk ID
    max_recent_insights: int = 10

    # Number of recent session insights shown
    # These replace the deprecated {selected_related_insight}
    insight_context_window_size: int = 5

    # Insight need assessment and search settings
    insight_similarity_threshold: float = (
        0.8  # Cosine similarity threshold for insight retrieval
    )
    insight_retrieval_top_k: int = 5  # Number of top insights to retrieve

    # Meeting tracker settings
    max_summary_words: int = 300  # Max words for meeting summary
    max_key_values: int = 30  # Max key-value pairs to track

    # Current date for system operations (simulated date for testing purposes)
    # Format: "YYYY-MM-DD" - defaults to today but can be overridden
    current_date: str = field(
        default_factory=lambda: datetime.now().strftime("%Y-%m-%d")
    )

    # Metadata filtering for insight generators
    # These fields will be filtered out before passing documents to LLMs
    filtered_metadata_fields: List[str] = field(
        default_factory=lambda: [
            "source_file",
            "legisinfo_url",
            "processed_date",
            "api_url",
            "bill_text_url",
            "chunk_id",
        ]
    )

    # Document source extraction priority (checked in order)
    # Used to extract source URLs from document metadata for cited documents
    document_source_fields: List[str] = field(
        default_factory=lambda: [
            "legisinfo_url",
            "source_url",
            "delivery_url",
            "minutes_url",  # Special case: /minutes -> /evidence
            "api_url",
        ]
    )

    # Metadata fields used to build human-readable result titles per document type
    # Each document type maps to a list of metadata field names (appended after document type label)
    document_type_title_fields: Dict[str, List[str]] = field(
        default_factory=lambda: {
            "bill": ["session", "bill_number", "introduced"],
            "committee": ["committee_slug"],
            "committee-report": ["committee_slug", "session"],
            "debate": ["date", "session", "number", "committee"],
            "journal": ["date", "session", "number"],
            "library": ["title"],
            "order-paper": ["date", "session", "number"],
            "petition": ["title"],
            "politician": ["politician_slug"],
            "research": ["title"],
            "vote": ["date", "session", "vote_number"],
        }
    )

    # Timezone for timestamps
    timezone: str = "UTC"  # UTC (+0)

    # Verbose output for debugging
    verbose: bool = False

    # Web search settings (optional, for supplementary retrieval alongside KB)
    # When enabled, retriever planner can optionally trigger web search alongside Qdrant KB search
    web_search_enabled: bool = True
    web_search_provider: str = (
        "duckduckgo"  # Provider: "duckduckgo" (future: "tavily", etc.)
    )
    web_search_max_results: int = 5  # Hard cap on web results per query


@dataclass
class AgentLLMConfig:
    """Configuration for a specific agent's LLM."""

    provider: str  # "gemini" or "ollama"
    model: str  # Exact model name (e.g., "gemini-2.0-flash", "gemma3:12b", "llama3.2:latest")
    temperature: Optional[float] = 0.0  # Optional temperature override


@dataclass
class RAGConfig:
    """Main configuration container."""

    llm: LLMConfig = field(default_factory=LLMConfig)
    qdrant: QdrantConfig = field(default_factory=QdrantConfig)
    pipeline: PipelineConfig = field(default_factory=PipelineConfig)

    # Agent-to-LLM mapping: specifies exact provider and model per agent
    # Optimized for speed and performance (map out this LLM selection to your usecase):
    # - gemini-flash-latest: For critical agents
    # - gemini-flash-lite-latest: For agents with large inputs (retriever_feedback)
    agent_llm_mapping: Dict[str, AgentLLMConfig] = field(
        default_factory=lambda: {
            "procedural_check": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "topic_detector": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "meeting_tracker": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "topic_description_updater": AgentLLMConfig(
                provider="gemini", model="gemini-flash-lite-latest"
            ),
            "insight_need_assessment": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "insight_query_constructor": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "related_insight_finder": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "query_constructor": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "retriever_planner": AgentLLMConfig(
                provider="gemini", model="gemini-flash-lite-latest"
            ),
            "retriever_feedback": AgentLLMConfig(
                provider="gemini", model="gemini-flash-lite-latest"
            ),
            "insight_selector": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "text_insight_generator": AgentLLMConfig(
                provider="gemini", model="gemini-flash-latest"
            ),
            "viz_planner": AgentLLMConfig(
                provider="gemini", model="gemini-3-flash-preview"
            ),
            "viz_planner_parser": AgentLLMConfig(
                provider="gemini", model="gemini-flash-lite-latest"
            ),
            "viz_generator": AgentLLMConfig(
                provider="gemini", model="gemini-3-flash-preview"
            ),
            "viz_generator_parser": AgentLLMConfig(
                provider="gemini", model="gemini-flash-lite-latest"
            ),
        }
    )


def get_default_config() -> RAGConfig:
    """Get default configuration, loading from environment variables."""
    return RAGConfig()
