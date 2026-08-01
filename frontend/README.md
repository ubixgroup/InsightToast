# InsightToast — Frontend

User interface for [InsightToast](../README.md). The frontend supports two modes:

- **Demo mode**: plays back a pre-recorded session with timed insights, captions, and an interactive chat pane. Works without a backend.
- **Interactive mode**: live sessions with real-time speech-to-text, streamed AI insights, and video conferencing.

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`
- **npm**

## Getting started

All commands below are run from this directory (`frontend/`).

```bash
npm install
```

Copy the environment template and fill in your values (see below):

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

To view the demo without any backend setup, skip the `.env` configuration and navigate to `/demo` after starting the dev server.

## Environment variables

| Variable | Description |
|---|---|
| `VITE_APP_API_KEY` | API key for authenticating with the backend service. See `../backend`, `POST /v2/admin/api-keys`. |
| `VITE_API_BASE_URL` | Base URL of the backend API server. |
| `VITE_LIVEKIT_URL` | LiveKit server WebSocket URL, used for video conferencing in remote sessions. A free-tier [LiveKit Cloud](https://cloud.livekit.io/) account provides sufficient credits. |
| `VITE_DEMO_ID` | Conversation ID to join automatically on load, for presenting a live or pre-populated session. |

These variables are only required for interactive (live) sessions. The demo mode at `/demo` works without any configuration.

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Tech stack

React 19, TypeScript, Vite, Chakra UI, LiveKit, Deepgram, Speechmatics, Vega-Lite.

## Acknowledgements

The macOS-styled desktop component used in sessions is based on [quanla/macos-demo](https://github.com/quanla/macos-demo).
