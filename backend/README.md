# InsightToast — Backend

Real-time multi-agentic retrieval-augmented generation (RAG) pipeline that processes live conversation transcripts, detects discussion topics, and generates contextual insights by retrieving relevant information from a knowledge base. This is the backend component of [InsightToast](../README.md); see the root README for the paper reference and system overview.

The pipeline is built on [LangGraph](https://github.com/langchain-ai/langgraph) and orchestrates 15 specialized agents that analyze each transcript chunk as it arrives, streamed back to clients over Server-Sent Events (SSE). It ships pre-configured for the paper's usage scenario, a knowledge base of Canadian parliamentary documents used to support policy discussion meetings.

---

## Requirements

### System

In our studies, we ran InsightToast on a server with **4 vCPUs and 16 GB of memory**. We recommend similar or higher specifications for reliable performance, particularly given the local Ollama model requirements.

### Software

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- A **Google Cloud API key** with access to the Gemini API, used as the primary LLM provider

### Disk space

The Ollama init container automatically downloads the following models on first startup:

| Model | Purpose | Approximate size |
|---|---|---|
| `gemma3:12b` | Local LLM for simpler tasks | ~8 GB |
| `embeddinggemma:latest` | Embedding model for vector search | ~1.6 GB |

Plan for at least **15 GB** of free disk space for model storage plus the application itself, in addition to the knowledge base described below.

### Ports

| Port | Service |
|---|---|
| `4343` | API (FastAPI) |
| `6333` | Qdrant (vector database) |
| `11435` | Ollama (local LLM) |

---

## Setup and running

All commands below are run from this directory (`backend/`).

### 1. Environment variables

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | Yes | Google Cloud API key for Gemini. |
| `ADMIN_PASSWORD` | Yes | Password for admin endpoints, used to generate API keys. Change from the default. |
| `FRONTEND_GOOGLE_API_KEY` | Yes, for the chat endpoint | Google Cloud API key used by `POST /v2/conversations/{id}/chat`. Can be the same value as `GOOGLE_API_KEY`. |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `LIVEKIT_URL` | Yes, for frontend remote sessions | LiveKit credentials for video conferencing in remote interactive sessions (`/interactive/remote/*`). |
| `DEEPGRAM_API_KEY` | Yes, for frontend remote sessions | Deepgram API key for live speech-to-text in remote interactive sessions (`/interactive/remote/*`). |
| `SPEECHMATICS_API_KEY` | Yes, for frontend co-located sessions | Speechmatics API key for speaker voiceprint enrollment and diarized STT in co-located interactive sessions (`/interactive/colocated/*`). |
| `QDRANT_URL` | No | Auto-set by Docker Compose (`http://qdrant:6333`); defaults to `http://localhost:6333` for local runs. |
| `OLLAMA_BASE_URL` | No | Auto-set by Docker Compose (`http://ollama:11434`); defaults to `http://localhost:11434` for local runs. |
| `API_HOST_PORT` / `QDRANT_HOST_PORT` / `OLLAMA_HOST_PORT` | No | Host port overrides for API (`4343`), Qdrant (`6333`), and Ollama (`11435`). |
| `QDRANT_COLLECTION` | No | Name of the Qdrant collection to query. Default: `parliament_documents`. |
| `OLLAMA_EMBEDDING_MODEL` | No | Embedding model to auto-pull. Default: `embeddinggemma:latest`. |
| `OLLAMA_MAIN_MODEL` | No | Local LLM to auto-pull. Default: `gemma3:12b`. |
| `V2_UNREGISTERED_CONVERSATION_TTL_SECONDS` | No | TTL for conversations created without prior registration, in seconds. Default: `900`. |
| `FIRECRAWL_API_KEY` | No | Only needed to regenerate the viz-generator reference docs in `pipeline/helper/`, not needed to run the pipeline. |

### 2. Knowledge base (Qdrant)

InsightToast retrieves contextual information from a pre-indexed vector knowledge base, mounted into the API container from `qdrant_storage/`. The pre-built knowledge base used in the paper, an embedded index of 43,878 Canadian parliamentary records, is published as part of the paper's supplemental dataset on Zenodo:

**[https://zenodo.org/records/21502545](https://zenodo.org/records/21502545)**

Only `qdrant_storage.tar.gz` (~21 GB compressed, ~27 GB extracted) is required to run the backend. Download it and extract it into this directory:

```bash
tar -xzf qdrant_storage.tar.gz -C .
```

so that `qdrant_storage/` sits alongside `docker-compose.yml`. To use your own knowledge base instead, index your documents into Qdrant separately and place the resulting storage under `qdrant_storage/`, or build one from source documents using `pipeline/helper/crawl_and_index.py` as a starting point.

### 3. Configuration

To adapt the pipeline to a different domain, configure:

**Pipeline configuration** (`pipeline/config.py`):
- **Domain context**: `domain_context`, `knowledge_base_context`, and `document_types` describe the meeting domain and knowledge base contents to the agents. These currently describe the Canadian parliamentary domain used in the paper.
- **Pipeline parameters**: `max_retrieved_documents`, `max_retrieval_iterations`, `context_window_size`, and the agent-to-LLM mappings.

**Few-shot examples** (`pipeline/prompts/few_shot_examples.json`): guide topic detection, insight formats, query construction, and retrieval feedback decisions. Update these to reflect a new domain.

### 4. Start the services

```bash
docker compose up --build -d
```

This starts four services: `api` (FastAPI), `qdrant` (vector database), `ollama` (local LLM), and `ollama-init` (a one-time model pull that the API waits on before starting).

Once running:
- **API**: `http://localhost:4343`
- **Swagger docs**: `http://localhost:4343/docs`
- **Health check**: `http://localhost:4343/health`

For local, non-Docker development, see `api.sh` (`./api.sh {init|dev|start|stop|restart|logs|status}`).

---

## Using the API

InsightToast uses a two-step authentication flow. All conversation endpoints require an API key.

### 1. Generate an API key

```
POST /v2/admin/api-keys/generate
Header: Authorization: Bearer <ADMIN_PASSWORD>
Body: { "name": "my-key" }
```

The response includes an `api_key` field (for example, `sk_v2_...`). Save this key; it is only shown once.

### 2. Use the API key

```
Authorization: Bearer sk_v2_...
```

### Key endpoints

| Endpoint | Description |
|---|---|
| `POST /v2/conversations/join` | Join or create a conversation session |
| `POST /v2/conversations/{id}/transcript` | Send a transcript chunk for processing |
| `GET /v2/conversations/{id}/events` | SSE stream of real-time pipeline updates (topics, insights, visualizations) |
| `POST /v2/conversations/{id}/chat` | Chat with the pipeline about the conversation |
| `POST /v2/conversations/{id}/search` | Search the knowledge base directly |

For the complete endpoint reference, see `http://localhost:4343/docs`. `/v1` endpoints also exist for backward compatibility but are considered legacy; new integrations should use `/v2`. The [frontend](../frontend) provides the intended interactive client against this API.

---

## Project structure

```
backend/
├── pipeline/                  # Multi-agentic RAG pipeline
│   ├── config.py                #   All configuration (LLMs, retrieval, domain)
│   ├── graph.py                 #   LangGraph pipeline definition (agent DAG)
│   ├── run.py                   #   Conversation manager and streaming interface
│   ├── agents/                  #   15 specialized agent implementations
│   ├── models/                  #   State, topic, and insight data models
│   ├── prompts/                 #   Prompt templates and few-shot examples
│   ├── services/                #   LLM, retrieval, citation, web search services
│   └── helper/                  #   Viz-doc crawling and indexing utilities
│
├── API/                       # FastAPI application
│   ├── main.py                  #   Endpoint definitions
│   ├── conversation_service.py  #   Core service logic
│   ├── schemas.py                #   Request/response models
│   └── utils.py                   #  Utilities
│
├── qdrant_storage/            # Qdrant vector DB data (populated from the Zenodo dataset)
├── session_dumps/             # Persisted conversation session state
├── study logs/                # Structured per-session logs
│
├── docker-compose.yml         # Service orchestration (API, Qdrant, Ollama)
├── Dockerfile.api              # API container build
├── requirements.txt            # Python dependencies
├── .env.example                 # Environment variable template
└── api.sh                        # Local (non-Docker) run/dev script
```
