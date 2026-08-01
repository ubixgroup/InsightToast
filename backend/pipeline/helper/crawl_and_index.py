"""
Crawl Vega-Altair documentation using Firecrawl and index into Qdrant vector store.
"""

import os
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv
from tqdm import tqdm

from firecrawl import FirecrawlApp
from langchain_qdrant import QdrantVectorStore
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import time


class DocumentationCrawler:
    """Crawls documentation websites and indexes them into Qdrant."""

    def __init__(
        self,
        firecrawl_api_key: Optional[str] = None,
        qdrant_url: str = "http://localhost:6333",
        qdrant_collection: str = "vega_altair_docs",
        embedding_model: str = "embeddinggemma:latest",
        vector_size: int = 768,
    ):
        """
        Initialize the documentation crawler.

        Args:
            firecrawl_api_key: Firecrawl API key (loads from env if not provided)
            qdrant_url: Qdrant server URL
            qdrant_collection: Qdrant collection name
            embedding_model: Ollama embedding model to use
            vector_size: Vector size for embeddings (768 for embeddinggemma)
        """
        load_dotenv()

        self.firecrawl_api_key = firecrawl_api_key or os.getenv("FIRECRAWL_API_KEY")
        if not self.firecrawl_api_key:
            raise ValueError("FIRECRAWL_API_KEY not found in environment or parameters")

        self.qdrant_url = qdrant_url
        self.qdrant_collection = qdrant_collection
        self.vector_size = vector_size

        self.firecrawl = FirecrawlApp(api_key=self.firecrawl_api_key)
        self.embeddings = OllamaEmbeddings(model=embedding_model)
        self.qdrant_client = self._setup_qdrant_client()

    def _setup_qdrant_client(self) -> QdrantClient:
        """
        Initialize Qdrant client and create collection if it doesn't exist.
        """
        client = QdrantClient(url=self.qdrant_url)

        # Check if collection exists
        try:
            collections = client.get_collections().collections
            collection_exists = any(
                col.name == self.qdrant_collection for col in collections
            )

            if not collection_exists:
                print(f"Creating collection: {self.qdrant_collection}")
                client.create_collection(
                    collection_name=self.qdrant_collection,
                    vectors_config=VectorParams(
                        size=self.vector_size, distance=Distance.COSINE
                    ),
                )
                print(f"Collection {self.qdrant_collection} created successfully")
            else:
                print(f"Collection {self.qdrant_collection} already exists")
        except Exception as e:
            print(f"Error setting up Qdrant collection: {e}")
            raise

        return client

    def crawl_documentation(
        self,
        root_url: str,
        limit: Optional[int] = None,
        max_depth: int = 3,
        only_main_content: bool = True,
    ) -> List[Document]:
        """
        Crawl documentation website using Firecrawl.

        Args:
            root_url: Root URL to start crawling from
            limit: Maximum number of pages to crawl (None for no limit)
            max_depth: Maximum depth to crawl (default: 3)
            only_main_content: Extract only main content (default: True)

        Returns:
            List of LangChain Document objects
        """
        print(f"🔍 Starting crawl of {root_url}...")
        if limit:
            print(f"   Page limit: {limit} pages")
        else:
            print(f"   Page limit: No limit")
        print(f"   Max depth: {max_depth}")
        print(f"   Only main content: {only_main_content}")
        print(f"   Firecrawl will poll every 2 seconds for updates...")

        # Crawl the website using Firecrawl with markdown format
        # Note: This is a blocking call that waits for completion
        print(f"\n⏳ Crawling in progress (this may take a few minutes)...")

        crawl_params = {
            "scrape_options": {
                "formats": ["markdown"],
                "onlyMainContent": only_main_content,
            },
            "poll_interval": 2,
        }

        # Add limit if specified
        if limit:
            crawl_params["limit"] = limit

        # Add max_depth - use maxDepth for crawl discovery
        crawl_params["max_discovery_depth"] = max_depth

        crawl_result = self.firecrawl.crawl(url=root_url, **crawl_params)

        # Extract data from crawl result
        if not hasattr(crawl_result, "data"):
            raise ValueError(f"Unexpected crawl result format: {type(crawl_result)}")

        data = crawl_result.data
        print(f"\n✓ Crawled {len(data)} pages successfully")
        print(f"  Status: {crawl_result.status}")
        print(f"  Credits used: {getattr(crawl_result, 'creditsUsed', 'N/A')}")

        # Convert Firecrawl results to LangChain Documents
        documents = []
        skipped = 0

        print(f"\n📝 Converting {len(data)} pages to LangChain documents...")
        for page in tqdm(data, desc="Processing pages", unit="page"):
            # Firecrawl returns Pydantic Document objects
            # Access markdown content directly as attribute
            content = getattr(page, "markdown", "")

            if not content:
                skipped += 1
                continue

            # Extract metadata from Firecrawl Document
            page_metadata = getattr(page, "metadata", None)
            if page_metadata:
                # metadata is a dict-like object
                if isinstance(page_metadata, dict):
                    source = page_metadata.get("sourceURL", "") or page_metadata.get(
                        "url", ""
                    )
                    title = page_metadata.get("title", "")
                else:
                    source = getattr(page_metadata, "sourceURL", "") or getattr(
                        page_metadata, "url", ""
                    )
                    title = getattr(page_metadata, "title", "")
            else:
                source = ""
                title = ""

            metadata = {
                "source": source,
                "title": title,
            }

            # Create LangChain Document
            doc = Document(page_content=content, metadata=metadata)
            documents.append(doc)

        if skipped > 0:
            print(f"⚠ Skipped {skipped} pages with no markdown content")

        print(f"✓ Successfully converted {len(documents)} pages to documents")
        return documents

    def crawl_documentation_async(
        self,
        root_url: str,
        limit: Optional[int] = None,
        max_depth: int = 3,
        only_main_content: bool = True,
        poll_interval: int = 2,
    ) -> List[Document]:
        """
        Crawl documentation website using Firecrawl with non-blocking status monitoring.

        Args:
            root_url: Root URL to start crawling from
            limit: Maximum number of pages to crawl (None for no limit)
            max_depth: Maximum depth to crawl (default: 3)
            only_main_content: Extract only main content (default: True)
            poll_interval: How often to check status in seconds (default: 2)

        Returns:
            List of LangChain Document objects
        """
        print(f"🔍 Starting async crawl of {root_url}...")
        if limit:
            print(f"   Page limit: {limit} pages")
        else:
            print(f"   Page limit: No limit")
        print(f"   Max depth: {max_depth}")
        print(f"   Only main content: {only_main_content}")
        print(f"   Poll interval: {poll_interval}s")

        # Start the crawl (non-blocking)
        crawl_params = {
            "scrape_options": {
                "formats": ["markdown"],
                "onlyMainContent": only_main_content,
            }
        }

        if limit:
            crawl_params["limit"] = limit

        crawl_params["max_discovery_depth"] = max_depth

        print(f"\n⏳ Starting crawl job...")
        job = self.firecrawl.start_crawl(url=root_url, **crawl_params)

        job_id = job.id
        print(f"✓ Crawl job started with ID: {job_id}")
        print(f"\n📊 Monitoring progress (refreshing every {poll_interval}s)...\n")

        # Monitor progress with tqdm
        pbar = None
        last_completed = 0

        while True:
            # Get current status
            status = self.firecrawl.get_crawl_status(job_id)

            current_status = status.status
            total = getattr(status, "total", 0)
            completed = getattr(status, "completed", 0)
            credits_used = getattr(status, "creditsUsed", 0)

            # Initialize or update progress bar
            if pbar is None and total > 0:
                pbar = tqdm(total=total, desc="Crawling pages", unit="page")
                pbar.update(completed)
                last_completed = completed
            elif pbar is not None:
                # Update progress bar with new pages
                new_pages = completed - last_completed
                if new_pages > 0:
                    pbar.update(new_pages)
                    last_completed = completed

            # Display status
            if current_status == "completed":
                if pbar:
                    pbar.close()
                print(f"\n✓ Crawl completed!")
                print(f"  Total pages: {total}")
                print(f"  Completed: {completed}")
                print(f"  Credits used: {credits_used}")
                break
            elif current_status == "failed":
                if pbar:
                    pbar.close()
                error = getattr(status, "error", "Unknown error")
                print(f"\n❌ Crawl failed: {error}")
                raise ValueError(f"Crawl failed: {error}")
            elif current_status in ["scraping", "processing"]:
                # Continue monitoring
                time.sleep(poll_interval)
            else:
                # Unknown status, wait and retry
                time.sleep(poll_interval)

        # Get final results
        data = status.data
        print(f"\n✓ Retrieved {len(data)} pages successfully")

        # Convert Firecrawl results to LangChain Documents
        documents = []
        skipped = 0

        print(f"\n📝 Converting {len(data)} pages to LangChain documents...")
        for page in tqdm(data, desc="Processing pages", unit="page"):
            # Firecrawl returns Pydantic Document objects
            content = getattr(page, "markdown", "")

            if not content:
                skipped += 1
                continue

            # Extract metadata from Firecrawl Document
            page_metadata = getattr(page, "metadata", None)
            if page_metadata:
                if isinstance(page_metadata, dict):
                    source = page_metadata.get("sourceURL", "") or page_metadata.get(
                        "url", ""
                    )
                    title = page_metadata.get("title", "")
                else:
                    source = getattr(page_metadata, "sourceURL", "") or getattr(
                        page_metadata, "url", ""
                    )
                    title = getattr(page_metadata, "title", "")
            else:
                source = ""
                title = ""

            metadata = {
                "source": source,
                "title": title,
            }

            # Create LangChain Document
            doc = Document(page_content=content, metadata=metadata)
            documents.append(doc)

        if skipped > 0:
            print(f"⚠ Skipped {skipped} pages with no markdown content")

        print(f"✓ Successfully converted {len(documents)} pages to documents")
        return documents

    def split_documents(
        self,
        documents: List[Document],
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ) -> List[Document]:
        """
        Split documents into smaller chunks for better retrieval.

        Args:
            documents: List of documents to split
            chunk_size: Size of each chunk
            chunk_overlap: Overlap between chunks

        Returns:
            List of split documents
        """
        print(f"📄 Splitting {len(documents)} documents into chunks...")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            is_separator_regex=False,
        )

        split_docs = []
        for doc in tqdm(documents, desc="Splitting documents", unit="doc"):
            chunks = text_splitter.split_documents([doc])
            split_docs.extend(chunks)

        print(f"✓ Created {len(split_docs)} chunks")

        return split_docs

    def create_vector_store(self, documents: List[Document]) -> QdrantVectorStore:
        """
        Create Qdrant vector store from documents.

        Args:
            documents: List of documents to index

        Returns:
            Qdrant vector store
        """
        print(f"🔧 Creating Qdrant vector store from {len(documents)} chunks...")
        print(f"   This may take a while for embedding generation...")

        # Create QdrantVectorStore instance
        vector_store = QdrantVectorStore(
            client=self.qdrant_client,
            collection_name=self.qdrant_collection,
            embedding=self.embeddings,
        )

        # Add documents in batches with progress tracking
        batch_size = 100
        with tqdm(total=len(documents), desc="Indexing chunks", unit="chunk") as pbar:
            for i in range(0, len(documents), batch_size):
                batch = documents[i : i + batch_size]
                vector_store.add_documents(batch)
                pbar.update(len(batch))

        print(f"✓ Vector store created successfully")
        print(
            f"✓ {len(documents)} documents indexed to Qdrant collection: {self.qdrant_collection}"
        )

        return vector_store

    def load_vector_store(self) -> QdrantVectorStore:
        """
        Load existing Qdrant vector store.

        Returns:
            Qdrant vector store
        """
        print(f"Loading vector store from Qdrant collection: {self.qdrant_collection}")
        return QdrantVectorStore(
            client=self.qdrant_client,
            collection_name=self.qdrant_collection,
            embedding=self.embeddings,
        )

    def save_sample_pages(self, documents: List[Document], output_path: str):
        """
        Save sample crawled pages to inspect.

        Args:
            documents: List of documents to save
            output_path: Path to save the samples (JSON file)
        """
        import json

        samples = []
        for i, doc in enumerate(documents):
            samples.append(
                {
                    "index": i,
                    "source": doc.metadata.get("source", ""),
                    "title": doc.metadata.get("title", ""),
                    "content": doc.page_content,
                    "content_length": len(doc.page_content),
                }
            )

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(samples, f, indent=2, ensure_ascii=False)

        print(f"✓ Saved {len(samples)} sample pages to: {output_path}")

    def crawl_and_index(
        self,
        root_url: str,
        limit: Optional[int] = None,
        max_depth: int = 3,
        only_main_content: bool = True,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ) -> QdrantVectorStore:
        """
        Complete pipeline: crawl, split, and index documentation.

        Args:
            root_url: Root URL to crawl
            limit: Maximum number of pages to crawl (None for no limit)
            max_depth: Maximum depth to crawl
            only_main_content: Extract only main content
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks

        Returns:
            Qdrant vector store
        """
        print("\n" + "=" * 60)
        print("📚 DOCUMENTATION INDEXING PIPELINE")
        print("=" * 60)

        # Step 1: Crawl the documentation
        print("\n[1/3] Crawling Documentation")
        print("-" * 60)
        documents = self.crawl_documentation(
            root_url=root_url,
            limit=limit,
            max_depth=max_depth,
            only_main_content=only_main_content,
        )

        if not documents:
            raise ValueError("No documents were crawled")

        # Step 2: Split documents into chunks
        print("\n[2/3] Splitting Documents")
        print("-" * 60)
        split_docs = self.split_documents(documents, chunk_size, chunk_overlap)

        # Step 3: Create and save vector store
        print("\n[3/3] Creating Vector Store")
        print("-" * 60)
        vectorstore = self.create_vector_store(split_docs)

        print("\n" + "=" * 60)
        print("✅ DOCUMENTATION INDEXED SUCCESSFULLY!")
        print("=" * 60)
        print(f"📊 Statistics:")
        print(f"   • Pages crawled: {len(documents)}")
        print(f"   • Chunks created: {len(split_docs)}")
        print(f"   • Qdrant collection: {self.qdrant_collection}")
        print(f"   • Qdrant URL: {self.qdrant_url}")
        print("=" * 60 + "\n")

        return vectorstore

    def crawl_and_index_async(
        self,
        root_url: str,
        limit: Optional[int] = None,
        max_depth: int = 3,
        only_main_content: bool = True,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        poll_interval: int = 2,
    ) -> QdrantVectorStore:
        """
        Complete pipeline with non-blocking crawl: crawl, split, and index documentation.

        Args:
            root_url: Root URL to crawl
            limit: Maximum number of pages to crawl (None for no limit)
            max_depth: Maximum depth to crawl
            only_main_content: Extract only main content
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
            poll_interval: Status check interval in seconds

        Returns:
            Qdrant vector store
        """
        print("\n" + "=" * 60)
        print("📚 DOCUMENTATION INDEXING PIPELINE (ASYNC)")
        print("=" * 60)

        # Step 1: Crawl the documentation (non-blocking with status updates)
        print("\n[1/3] Crawling Documentation (Non-blocking)")
        print("-" * 60)
        documents = self.crawl_documentation_async(
            root_url=root_url,
            limit=limit,
            max_depth=max_depth,
            only_main_content=only_main_content,
            poll_interval=poll_interval,
        )

        if not documents:
            raise ValueError("No documents were crawled")

        # Step 2: Split documents into chunks
        print("\n[2/3] Splitting Documents")
        print("-" * 60)
        split_docs = self.split_documents(documents, chunk_size, chunk_overlap)

        # Step 3: Create and save vector store
        print("\n[3/3] Creating Vector Store")
        print("-" * 60)
        vectorstore = self.create_vector_store(split_docs)

        print("\n" + "=" * 60)
        print("✅ DOCUMENTATION INDEXED SUCCESSFULLY!")
        print("=" * 60)
        print(f"📊 Statistics:")
        print(f"   • Pages crawled: {len(documents)}")
        print(f"   • Chunks created: {len(split_docs)}")
        print(f"   • Qdrant collection: {self.qdrant_collection}")
        print(f"   • Qdrant URL: {self.qdrant_url}")
        print("=" * 60 + "\n")

        return vectorstore


def main():
    """Main function to crawl and index Vega-Altair documentation."""

    # Configuration
    ROOT_URL = "https://altair-viz.github.io/"
    HELPER_DIR = Path(__file__).parent
    SAMPLES_PATH = str(HELPER_DIR / "sample_pages.json")

    # Initialize crawler
    print("\n" + "=" * 60)
    print("🚀 VEGA-ALTAIR DOCUMENTATION CRAWLER")
    print("=" * 60)
    print("\nInitializing crawler...")
    crawler = DocumentationCrawler()

    # # STAGE 1: Crawl 10 sample pages first
    # print("\n" + "=" * 60)
    # print("📋 STAGE 1: CRAWLING 10 SAMPLE PAGES")
    # print("=" * 60)
    # print("\nThis will help you inspect the quality of crawled content")
    # print("before proceeding with the full crawl.\n")

    # # Crawl 10 sample pages
    # sample_docs = crawler.crawl_documentation_async(
    #     root_url=ROOT_URL, limit=10, max_depth=3, only_main_content=True
    # )

    # if not sample_docs:
    #     print("\n❌ No documents were crawled. Exiting.")
    #     return

    # # Save sample pages for inspection
    # print(f"\n💾 Saving sample pages for inspection...")
    # crawler.save_sample_pages(sample_docs, SAMPLES_PATH)

    # # Display sample statistics
    # print("\n" + "=" * 60)
    # print("📊 SAMPLE STATISTICS")
    # print("=" * 60)
    # for i, doc in enumerate(sample_docs[:5], 1):  # Show first 5
    #     print(f"\nSample {i}:")
    #     print(f"  Title:  {doc.metadata.get('title', 'N/A')[:60]}...")
    #     print(f"  Source: {doc.metadata.get('source', 'N/A')}")
    #     print(f"  Length: {len(doc.page_content):,} characters")

    # if len(sample_docs) > 5:
    #     print(f"\n... and {len(sample_docs) - 5} more samples")

    # print(f"\n✓ All {len(sample_docs)} samples saved to: {SAMPLES_PATH}")

    # # STAGE 2: Ask for confirmation
    # print("\n" + "=" * 60)
    # print("⚠️  CONFIRMATION REQUIRED")
    # print("=" * 60)
    # print(f"\nPlease review the sample pages in: {SAMPLES_PATH}")
    # print("\nThe full crawl will:")
    # print("  • Crawl all pages up to depth 3 (no page limit)")
    # print("  • Extract only main content")
    # print("  • Use Firecrawl credits for each page")
    # print("  • Index to Qdrant vector store")

    # response = input("\n🤔 Continue with full crawl? (yes/no): ").strip().lower()

    # if response not in ["yes", "y"]:
    #     print("\n❌ Full crawl cancelled. Sample pages are saved for your review.")
    #     print(f"   Location: {SAMPLES_PATH}")
    #     return

    # STAGE 3: Full crawl and indexing
    print("\n" + "=" * 60)
    print("🚀 STAGE 2: FULL CRAWL AND INDEXING")
    print("=" * 60)
    print("\n⚠️  This will crawl all pages and consume credits!\n")

    vectorstore = crawler.crawl_and_index_async(
        root_url=ROOT_URL,
        limit=1000,  # No limit - crawl everything
        max_depth=3,
        only_main_content=True,
        chunk_size=1000,
        chunk_overlap=200,
    )

    print("\n" + "=" * 60)
    print("✅ INDEXING COMPLETE!")
    print("=" * 60)
    print(f"\n📁 Resources:")
    print(f"   • Qdrant collection: {crawler.qdrant_collection}")
    print(f"   • Qdrant URL: {crawler.qdrant_url}")
    print(f"   • Sample pages: {SAMPLES_PATH}")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
