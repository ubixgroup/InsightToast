"""
Basic integration test for the Multi-Agentic RAG Pipeline.

Tests the pipeline with sample transcript chunks using the streaming interface.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from run import ConversationManager, process_single_chunk, EventType, PipelineEvent
from config import get_default_config
from models.state import TranscriptInput


def consume_generator(generator):
    """Consume a generator and return the final output, printing events."""
    final_output = None
    events = []
    try:
        while True:
            event = next(generator)
            events.append(event)
            print(f"    [{event.event_type.value}] {event.node_name}")
    except StopIteration as e:
        final_output = e.value
    return final_output, events


def test_single_chunk_processing():
    """Test processing a single transcript chunk with streaming."""
    print("=" * 60)
    print("Test: Single Chunk Processing (Streaming)")
    print("=" * 60)

    transcript = """
    We need to discuss the carbon tax and its impact on Canadian families.
    The cost of living has increased significantly, and many constituents
    are concerned about heating costs this winter.
    """

    print(f"Input: {transcript.strip()[:100]}...")
    print()

    try:
        transcript_input = TranscriptInput(content=transcript)
        result = process_single_chunk(transcript_input)

        print(f"Processing Time: {result.processing_time_ms:.0f}ms")
        print(f"Was Halted: {result.was_halted}")
        print(f"Error: {result.error or 'None'}")
        print()

        if not result.was_halted and not result.error:
            print(f"Topic: {result.current_topic_name or 'None'}")
            print(f"Meeting Title: {result.meeting_title or 'Not set'}")

            if result.generated_insight:
                print(f"\nGenerated Insight:")
                print(f"  Type: {result.generated_insight.get('type')}")
                content = result.generated_insight.get("content", "")
                print(
                    f"  Content: {content[:200]}..."
                    if len(content) > 200
                    else f"  Content: {content}"
                )
            else:
                print("\nNo insight generated")

        print("\n✓ Test passed")
        return True

    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_streaming_events():
    """Test that streaming events are emitted correctly."""
    print("\n" + "=" * 60)
    print("Test: Streaming Events")
    print("=" * 60)

    transcript = """
    The Minister spoke about the new healthcare funding proposal. 
    We should look up previous debates on healthcare funding.
    """

    print(f"Input: {transcript.strip()[:80]}...")
    print()

    try:
        manager = ConversationManager()
        transcript_input = TranscriptInput(content=transcript)
        generator = manager.process_transcript(transcript_input)

        print("Events received:")
        final_output, events = consume_generator(generator)

        # Verify we got expected event types
        event_types = [e.event_type for e in events]

        print(f"\nTotal events: {len(events)}")
        print(f"Event types: {[et.value for et in event_types]}")

        # Should have at least procedural_check event
        has_procedural_check = EventType.PROCEDURAL_CHECK in event_types
        print(f"Has procedural_check event: {has_procedural_check}")

        # Close session
        summary = manager.close_session()
        print(f"\nSession closed: {summary}")

        print("\n✓ Test passed")
        return True

    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_conversation_flow():
    """Test processing multiple transcript chunks in a conversation."""
    print("\n" + "=" * 60)
    print("Test: Conversation Flow (Streaming)")
    print("=" * 60)

    chunks = [
        "Good morning everyone. Today we're here to discuss Bill C-234 regarding farm fuel exemptions.",
        "The carbon tax has placed a significant burden on agricultural operations, particularly grain drying.",
        "I'd like to hear from the committee about previous votes on similar agricultural exemptions.",
    ]

    try:
        manager = ConversationManager()

        for i, chunk in enumerate(chunks, 1):
            print(f"\n--- Chunk {i} ---")
            print(f"Input: {chunk[:80]}...")

            transcript_input = TranscriptInput(content=chunk)
            generator = manager.process_transcript(transcript_input)

            # Consume generator with event printing
            final_output, events = consume_generator(generator)

            if final_output:
                print(f"  Time: {final_output.processing_time_ms:.0f}ms")
                print(f"  Halted: {final_output.was_halted}")
                print(f"  Topic: {final_output.current_topic_name or 'None'}")

                if final_output.generated_insight:
                    print(
                        f"  Insight: Yes ({final_output.generated_insight.get('type')})"
                    )

        # Check final state
        print("\n--- Final State ---")
        print(f"Topics: {len(manager.topics)}")
        for tid, topic in manager.topics.items():
            print(f"  - {topic.name}")

        if manager.meeting_info:
            print(f"Meeting Title: {manager.meeting_info.title or 'Not set'}")

        # Close session
        summary = manager.close_session()
        print(f"\nSession closed: {summary}")

        print("\n✓ Test passed")
        return True

    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_procedural_content_halt():
    """Test that procedural content is properly halted."""
    print("\n" + "=" * 60)
    print("Test: Procedural Content Detection")
    print("=" * 60)

    procedural_chunks = [
        "Can everyone hear me? Is the microphone working?",
        "Let's take a 10 minute break and reconvene at 2:30.",
        "Good morning, how is everyone doing today?",
    ]

    try:
        for chunk in procedural_chunks:
            print(f"\nInput: {chunk}")
            transcript_input = TranscriptInput(content=chunk)
            result = process_single_chunk(transcript_input)

            # Check if halted event was received
            print(f"  Halted: {result.was_halted}")
            print(f"  Topic: {result.current_topic_name or 'None'}")

        print("\n✓ Test completed (behavior depends on LLM)")
        return True

    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_config():
    """Test configuration loading."""
    print("\n" + "=" * 60)
    print("Test: Configuration")
    print("=" * 60)

    try:
        config = get_default_config()

        print(f"Gemini Model: {config.llm.default_gemini_model}")
        print(f"Ollama Model: {config.llm.default_ollama_model}")
        print(f"Qdrant URL: {config.qdrant.url}")
        print(f"Collection: {config.qdrant.collection_name}")
        print(f"Max Iterations: {config.pipeline.max_retrieval_iterations}")
        print(f"Domain Context: {config.pipeline.domain_context[:50]}...")
        print(f"Document Types: {config.pipeline.document_types}")

        print("\nAgent LLM Mapping:")
        for agent, llm in config.agent_llm_mapping.items():
            print(f"  {agent}: {llm.provider}/{llm.model}")

        print("\n✓ Test passed")
        return True

    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("Multi-Agentic RAG Pipeline - Integration Tests (Streaming)")
    print("=" * 60)
    print()

    results = []

    # Always run config test first
    results.append(("Configuration", test_config()))

    # Check if we should run full tests
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--full", action="store_true", help="Run full integration tests (requires LLM)"
    )
    parser.add_argument(
        "--stream", action="store_true", help="Test streaming events only"
    )
    args = parser.parse_args()

    if args.stream:
        results.append(("Streaming Events", test_streaming_events()))
    elif args.full:
        results.append(("Single Chunk", test_single_chunk_processing()))
        results.append(("Streaming Events", test_streaming_events()))
        results.append(("Conversation Flow", test_conversation_flow()))
        results.append(("Procedural Detection", test_procedural_content_halt()))
    else:
        print("\nSkipping LLM-dependent tests.")
        print("Use --stream to test streaming events only.")
        print("Use --full to run all tests.")
    print(f"Passed: {passed}/{total}")

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
