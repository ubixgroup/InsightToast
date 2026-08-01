"""
Diagnostic script for Qdrant retriever performance analysis.

This script helps identify bottlenecks in the retrieval pipeline:
- Qdrant collection configuration and memory usage
- Embedding generation speed
- Vector search speed
- Overall retrieval performance

Run this to diagnose slow retrieval times and guide optimization efforts.
"""

import time
from typing import Optional

from config import RAGConfig, get_default_config
from services.retriever import RetrieverService


def check_qdrant_collection_config():
    """Check Qdrant collection configuration and memory settings."""
    print("\n" + "=" * 80)
    print("QDRANT COLLECTION CONFIGURATION")
    print("=" * 80)
    
    config = get_default_config()
    retriever = RetrieverService.get_instance(config)
    
    try:
        # Get collection info
        collection_info = retriever._client.get_collection(
            collection_name=retriever.collection_name
        )
        
        print(f"\nCollection: {retriever.collection_name}")
        print(f"Vectors count: {collection_info.vectors_count:,}")
        print(f"Points count: {collection_info.points_count:,}")
        print(f"Status: {collection_info.status}")
        
        # Check optimizer config
        optimizer_config = collection_info.config.optimizer_config
        print(f"\nOptimizer Configuration:")
        print(f"  Memmap threshold: {optimizer_config.memmap_threshold}")
        print(f"  Indexing threshold: {optimizer_config.indexing_threshold}")
        print(f"  Max optimization threads: {optimizer_config.max_optimization_threads}")
        
        # Check HNSW config
        hnsw_config = collection_info.config.hnsw_config
        print(f"\nHNSW Configuration:")
        print(f"  M (max connections): {hnsw_config.m}")
        print(f"  EF construct: {hnsw_config.ef_construct}")
        print(f"  Full scan threshold: {hnsw_config.full_scan_threshold}")
        print(f"  On disk: {hnsw_config.on_disk}")
        
        # Payload storage
        print(f"\nStorage:")
        print(f"  On disk payload: {collection_info.config.params.on_disk_payload}")
        
        # Memory recommendations
        print(f"\n{'='*80}")
        print("MEMORY OPTIMIZATION RECOMMENDATIONS:")
        print("="*80)
        
        if optimizer_config.memmap_threshold > 0:
            print("⚠️  ISSUE: memmap_threshold > 0 means vectors may be on disk")
            print("   SOLUTION: Set memmap_threshold = 0 to force all data into RAM")
            print("   (This was applied automatically during initialization)")
        else:
            print("✓ Good: memmap_threshold = 0 (forced in-memory storage)")
        
        if hnsw_config.on_disk:
            print("⚠️  WARNING: HNSW index is on disk, not in memory")
            print("   This significantly impacts search speed")
        else:
            print("✓ Good: HNSW index is in memory")
        
        if collection_info.config.params.on_disk_payload:
            print("⚠️  WARNING: Payloads are stored on disk")
            print("   Consider setting on_disk_payload=False for faster retrieval")
        else:
            print("✓ Good: Payloads are in memory")
            
        return collection_info
        
    except Exception as e:
        print(f"❌ Error checking collection config: {e}")
        return None


def test_embedding_speed(num_tests: int = 5):
    """Test embedding generation speed."""
    print("\n" + "=" * 80)
    print("EMBEDDING GENERATION SPEED TEST")
    print("=" * 80)
    
    config = get_default_config()
    retriever = RetrieverService.get_instance(config)
    
    test_queries = [
        "What are the main provisions of Bill C-11?",
        "When was the debate on climate change policy held?",
        "Which committee reviewed the budget implementation act?",
        "What amendments were proposed to the immigration legislation?",
        "How did members vote on the motion regarding healthcare funding?",
    ]
    
    print(f"\nTesting embedding generation with {num_tests} queries...")
    print(f"Embedding model: {config.llm.embedding_model}")
    
    times = []
    for i, query in enumerate(test_queries[:num_tests], 1):
        start = time.time()
        embedding = retriever._embeddings.embed_query(query)
        elapsed = time.time() - start
        times.append(elapsed)
        print(f"  Query {i}: {elapsed:.3f}s (vector dim: {len(embedding)})")
    
    avg_time = sum(times) / len(times)
    print(f"\nAverage embedding time: {avg_time:.3f}s")
    
    if avg_time > 1.0:
        print("\n⚠️  WARNING: Embedding generation is slow (>1s per query)")
        print("   SOLUTIONS:")
        print("   1. Use a faster embedding model (e.g., 'nomic-embed-text')")
        print("   2. Use GPU acceleration for Ollama")
        print("   3. Consider using OpenAI embeddings for production")
    elif avg_time > 0.5:
        print("\n⚠️  Embedding generation is moderate (~0.5-1s per query)")
        print("   Consider optimizing for production use")
    else:
        print(f"\n✓ Good: Embedding generation is fast (<0.5s per query)")
    
    return avg_time


def test_search_speed(num_tests: int = 5):
    """Test vector search speed (excluding embedding generation)."""
    print("\n" + "=" * 80)
    print("VECTOR SEARCH SPEED TEST")
    print("=" * 80)
    
    config = get_default_config()
    retriever = RetrieverService.get_instance(config)
    
    test_queries = [
        "What are the main provisions of Bill C-11?",
        "When was the debate on climate change policy held?",
        "Which committee reviewed the budget implementation act?",
        "What amendments were proposed to the immigration legislation?",
        "How did members vote on the motion regarding healthcare funding?",
    ]
    
    print(f"\nTesting Qdrant search with {num_tests} queries...")
    print(f"HNSW EF: {config.qdrant.hnsw_ef}")
    print(f"Exact search: {config.qdrant.exact_search}")
    print(f"Top-k: 15")
    
    # Pre-generate embeddings to isolate search time
    print("\nPre-generating embeddings...")
    embeddings = []
    for query in test_queries[:num_tests]:
        embeddings.append(retriever._embeddings.embed_query(query))
    
    # Test search
    print("\nExecuting searches...")
    times = []
    for i, (query, embedding) in enumerate(zip(test_queries[:num_tests], embeddings), 1):
        start = time.time()
        
        # Direct Qdrant search to isolate vector search time
        search_result = retriever._client.search(
            collection_name=retriever.collection_name,
            query_vector=embedding,
            limit=15,
            search_params={
                "hnsw_ef": config.qdrant.hnsw_ef,
                "exact": config.qdrant.exact_search,
            },
        )
        
        elapsed = time.time() - start
        times.append(elapsed)
        print(f"  Query {i}: {elapsed:.3f}s ({len(search_result)} results)")
    
    avg_time = sum(times) / len(times)
    print(f"\nAverage search time: {avg_time:.3f}s")
    
    if avg_time > 1.0:
        print("\n⚠️  WARNING: Vector search is slow (>1s per query)")
        print("   SOLUTIONS:")
        print("   1. Ensure collection is loaded into memory (memmap_threshold=0)")
        print("   2. Reduce hnsw_ef value (currently: {})".format(config.qdrant.hnsw_ef))
        print("   3. Check if HNSW index is in memory (on_disk=False)")
        print("   4. Ensure Qdrant has sufficient RAM allocated")
    elif avg_time > 0.1:
        print("\n⚠️  Vector search is moderate (0.1-1s per query)")
        print("   Consider further optimization for high-throughput use cases")
    else:
        print(f"\n✓ Good: Vector search is fast (<0.1s per query)")
    
    return avg_time


def test_end_to_end_retrieval(num_tests: int = 3):
    """Test end-to-end retrieval performance."""
    print("\n" + "=" * 80)
    print("END-TO-END RETRIEVAL TEST")
    print("=" * 80)
    
    config = get_default_config()
    retriever = RetrieverService.get_instance(config)
    
    test_queries = [
        "What are the main provisions of Bill C-11?",
        "When was the debate on climate change policy held?",
        "Which committee reviewed the budget implementation act?",
    ]
    
    print(f"\nTesting full retrieval pipeline with {num_tests} queries...")
    
    times = []
    for i, query in enumerate(test_queries[:num_tests], 1):
        print(f"\n--- Query {i}: {query[:60]}... ---")
        start = time.time()
        
        results = retriever.search(
            query=query,
            top_k=15,
        )
        
        elapsed = time.time() - start
        times.append(elapsed)
        print(f"Total time: {elapsed:.3f}s | Retrieved: {len(results)} documents")
    
    avg_time = sum(times) / len(times)
    print(f"\n{'='*80}")
    print(f"Average end-to-end retrieval time: {avg_time:.3f}s")
    
    if avg_time > 2.0:
        print("\n⚠️  WARNING: End-to-end retrieval is very slow (>2s per query)")
        print("   This will significantly impact user experience")
    elif avg_time > 1.0:
        print("\n⚠️  End-to-end retrieval is slow (1-2s per query)")
        print("   Review the breakdown above to identify bottlenecks")
    else:
        print(f"\n✓ Good: End-to-end retrieval is acceptably fast (<1s per query)")
    
    return avg_time


def main():
    """Run all diagnostics."""
    print("\n" + "=" * 80)
    print("QDRANT RETRIEVER PERFORMANCE DIAGNOSTICS")
    print("Starting analysis...")
    print("=" * 80)
    
    # 1. Check configuration
    collection_info = check_qdrant_collection_config()
    
    # 2. Test embedding speed
    embed_time = test_embedding_speed(num_tests=5)
    
    # 3. Test search speed
    search_time = test_search_speed(num_tests=5)
    
    # 4. Test end-to-end
    e2e_time = test_end_to_end_retrieval(num_tests=3)
    
    # Summary
    print("\n" + "=" * 80)
    print("PERFORMANCE SUMMARY")
    print("=" * 80)
    print(f"\nAverage embedding generation: {embed_time:.3f}s")
    print(f"Average vector search: {search_time:.3f}s")
    print(f"Average end-to-end retrieval: {e2e_time:.3f}s")
    
    # Calculate expected vs actual
    expected = embed_time + search_time + 0.05  # +50ms for overhead
    overhead = e2e_time - expected
    print(f"\nExpected time: {expected:.3f}s")
    print(f"Actual time: {e2e_time:.3f}s")
    print(f"Overhead: {overhead:.3f}s ({(overhead/e2e_time)*100:.1f}%)")
    
    # Bottleneck analysis
    print("\n" + "=" * 80)
    print("BOTTLENECK ANALYSIS")
    print("=" * 80)
    
    embed_pct = (embed_time / e2e_time) * 100
    search_pct = (search_time / e2e_time) * 100
    
    print(f"\nEmbedding generation: {embed_pct:.1f}% of total time")
    print(f"Vector search: {search_pct:.1f}% of total time")
    
    if embed_pct > 70:
        print("\n🔴 BOTTLENECK: Embedding generation is the primary bottleneck")
        print("   Priority: Optimize or replace the embedding model")
    elif search_pct > 70:
        print("\n🔴 BOTTLENECK: Vector search is the primary bottleneck")
        print("   Priority: Optimize Qdrant configuration and ensure in-memory storage")
    else:
        print("\n✓ Balanced: No single major bottleneck identified")
    
    print("\n" + "=" * 80)
    print("DIAGNOSTICS COMPLETE")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
