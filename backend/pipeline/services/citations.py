"""
Citation Service for the RAG Pipeline.

Handles formatting, parsing, and management of inline citations
in generated insights.

Citation Format:
    - Source documents: [[type:session:id]] or [[type:identifier]]
    - Transcript references: [[TRANSCRIPT:segment_id]]
    - Insight references: [[INSIGHT:insight_id]]
    
    Valid characters: alphanumeric, colons, hyphens, underscores, dots
    Multiple citations: [[doc1]] [[doc2]] (space-separated)
    
    Examples:
        - [[debate:43-1:2020-03-15]]
        - [[vote:39-1:45]]
        - [[library:alma99584690602616]]
        - [[TRANSCRIPT:abc123]]
        - [[INSIGHT:xyz789]]
"""

from __future__ import annotations

import re
from typing import Dict, List, Optional
from langchain_core.documents import Document

# Citation pattern: [[type:session:number]] or [[type:identifier]]
# NOTE: Changed from [[SOURCE:...]] to [[...]] format for simpler LLM generation
# Pattern matches: alphanumeric, colons, hyphens, underscores, dots (but no commas, spaces, or brackets)
CITATION_PATTERN = r'\[\[([\w\-:.]+)\]\]'
TRANSCRIPT_CITATION_PATTERN = r'\[\[TRANSCRIPT:([\w\-:.]+)\]\]'
INSIGHT_CITATION_PATTERN = r'\[\[INSIGHT:([\w\-:.]+)\]\]'


def extract_source_url(metadata: Dict) -> Optional[str]:
    """
    Extract source URL from metadata with priority fallback.
    
    Priority order:
    1. source_url (direct link to document)
    2. legisinfo_url (for bills)
    3. related_debate (for votes)
    4. entry_url (for library/research)
    5. api_url (for committees/politicians)
    6. source_file (fallback, not a URL)
    
    Args:
        metadata: Document metadata dictionary
        
    Returns:
        URL string or None
    """
    return (
        metadata.get("source_url") or
        metadata.get("legisinfo_url") or
        metadata.get("related_debate") or
        metadata.get("entry_url") or
        metadata.get("api_url") or
        metadata.get("source_file")
    )


def generate_citation_key(doc: Document) -> Optional[str]:
    """
    Generate a consistent citation key (citation_key) for a document.
    
    This is the single source of truth for generating citation keys.
    The format follows:
    - Pattern 1: type:session:number (when both available)
    - Pattern 2: type:identifier (for types without session)
    - Pattern 3: type:truncated_file (fallback)
    
    Politician documents return None (should not be cited).
    
    Args:
        doc: The document to generate key for
        
    Returns:
        Citation key string (e.g., "debate:43-1:2020-03-15") or None for politicians
    """
    metadata = doc.metadata
    doc_type = metadata.get("document_type", "unknown")
    session = metadata.get("session")
    
    # Skip politician documents - they should not be cited
    if doc_type == "politician":
        return None
    
    # Pattern 1: Has session and number/id (most document types)
    if session:
        # Try to find the appropriate number/id field
        number = (
            metadata.get("vote_number") or
            metadata.get("bill_number") or
            metadata.get("report_number") or
            metadata.get("number") or
            metadata.get("date")  # Use date for debates
        )
        if number:
            return f"{doc_type}:{session}:{number}"
    
    # Pattern 2: Type-specific unique identifiers (no session)
    if doc_type == "petition":
        petition_id = metadata.get("petition_id")
        if petition_id:
            return f"{doc_type}:{petition_id}"
    
    elif doc_type == "committee":
        committee_slug = metadata.get("committee_slug")
        if committee_slug:
            return f"{doc_type}:{committee_slug}"
    
    elif doc_type == "library" or doc_type == "research":
        document_id = metadata.get("document_id")
        if document_id:
            return f"{doc_type}:{document_id}"
    
    # Pattern 3: Fallback to truncated source file
    source_file = metadata.get("source_file", "unknown")
    # Remove directory prefix and extension, keep last part
    filename = source_file.split("/")[-1].replace(".txt", "").replace(".pdf", "")
    if len(filename) > 40:
        filename = filename[:37] + "..."
    return f"{doc_type}:{filename}"


def format_display_label(citation_key: str) -> str:
    """
    Create a human-readable label from a citation key.
    
    Unified format: type:session:number or type:identifier
    
    Args:
        citation_key: The citation key (e.g., "debate:35-1:2010-05-30")
        
    Returns:
        Human-readable label (e.g., "Debate 35-1, May 30, 2010")
    """
    parts = citation_key.split(":")
    if len(parts) < 2:
        return citation_key.title()
    
    doc_type = parts[0]
    doc_type_display = doc_type.replace("-", " ").title()
    
    # Type with unique identifier only (no session)
    if len(parts) == 2:
        identifier = parts[1]
        
        # Special formatting based on doc type
        if doc_type == "committee":
            return f"Committee: {identifier.replace('-', ' ').title()}"
        elif doc_type == "petition":
            return f"Petition {identifier}"
        elif doc_type == "library":
            return f"Library Document {identifier[:12]}..."
        elif doc_type == "research":
            return f"Research {identifier[:12]}..."
        elif doc_type == "politician":
            return f"Politician: {identifier.replace('-', ' ').title()}"
        else:
            return f"{doc_type_display} {identifier}"
    
    # Type with session and number/identifier
    if len(parts) >= 3:
        session = parts[1]
        identifier = parts[2]
        
        # Special formatting for dates in debates
        if doc_type == "debate" and re.match(r'\d{4}-\d{2}-\d{2}', identifier):
            try:
                from datetime import datetime
                date = datetime.strptime(identifier, "%Y-%m-%d")
                date_str = date.strftime("%B %d, %Y")
                return f"{doc_type_display} {session}, {date_str}"
            except ValueError:
                pass
        
        # Standard format for types with session and number
        if doc_type == "vote":
            return f"Vote {session} #{identifier}"
        elif doc_type == "bill":
            return f"Bill {identifier}" if identifier.startswith("C-") or identifier.startswith("S-") else f"Bill {session}-{identifier}"
        elif doc_type == "committee-report":
            return f"Committee Report {session} #{identifier}"
        elif doc_type == "journal":
            return f"Journal {session} #{identifier}"
        elif doc_type == "order-paper":
            return f"Order Paper {session} #{identifier}"
        else:
            return f"{doc_type_display} {session} #{identifier}"
    
    return citation_key.title()


def parse_citations(text: str) -> List[Dict[str, str]]:
    """
    Parse all citations from text.
    
    Parses three types:
    - Regular source citations: [[type:session:id]]
    - Transcript citations: [[TRANSCRIPT:id]]
    - Insight citations: [[INSIGHT:id]]
    
    Valid citation keys contain: alphanumeric, colons, hyphens, underscores, dots
    Invalid patterns (automatically skipped):
    - Commas inside brackets: [[doc1], [doc2]]
    - Extra brackets: [[doc1] [doc2]]
    - Spaces: [[doc 1]]
    
    Args:
        text: Text containing citations
        
    Returns:
        List of dictionaries with citation info
    """
    citations = []
    
    # Parse TRANSCRIPT citations first (more specific pattern)
    for match in re.finditer(TRANSCRIPT_CITATION_PATTERN, text):
        segment_id = match.group(1)
        citations.append({
            "type": "transcript",
            "key": segment_id,
            "full_match": match.group(0),
            "display_label": f"Transcript segment {segment_id[:8]}...",
        })
    
    # Parse INSIGHT citations (more specific pattern)
    for match in re.finditer(INSIGHT_CITATION_PATTERN, text):
        insight_id = match.group(1)
        citations.append({
            "type": "insight",
            "key": insight_id,
            "full_match": match.group(0),
            "display_label": f"Insight {insight_id[:8]}...",
        })
    
    # Parse regular source citations (general pattern)
    # Skip citations that were already matched by TRANSCRIPT or INSIGHT patterns
    matched_positions = {(cit["full_match"], text.find(cit["full_match"])) for cit in citations}
    
    for match in re.finditer(CITATION_PATTERN, text):
        citation_text = match.group(0)
        citation_key = match.group(1)
        citation_pos = match.start()
        
        # Skip if this is a TRANSCRIPT or INSIGHT citation (case-insensitive)
        if citation_key.upper().startswith("TRANSCRIPT:") or citation_key.upper().startswith("INSIGHT:"):
            continue
        
        # Skip if this looks like a meeting/conversation reference (not a knowledge base document)
        if citation_key.lower().startswith("meeting:") or citation_key.lower().startswith("conversation:"):
            continue
        
        # Skip if already matched
        if any(pos == citation_pos for _, pos in matched_positions):
            continue
        
        citations.append({
            "type": "source",
            "key": citation_key,
            "full_match": citation_text,
            "display_label": format_display_label(citation_key),
        })
    
    return citations