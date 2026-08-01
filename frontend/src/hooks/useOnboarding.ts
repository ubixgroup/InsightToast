import { useState, useCallback, useRef, useEffect } from "react";
import type { Step } from "react-joyride";
import type { ProgressStage } from "@/types/progressToast";
import type { Insight } from "@/types";

// ============= Types =============

export type OnboardingPhase =
    | "idle"
    | "welcome"
    | "demo-intro"
    | "meeting-context-1"
    | "meeting-context-2"
    | "meeting-context-3"
    | "meeting-context-play"
    | "waiting-for-toast"
    | "progress-toast"
    | "waiting-for-banners"
    | "insight-banners"
    | "waiting-for-sidebar"
    | "insight-selected"
    | "citation-highlight"
    | "citation-kb-info"
    | "waiting-for-preview"
    | "source-preview-expand-action"
    | "source-preview-expanded-view"
    | "chart-insight"
    | "chart-expand-action"
    | "chart-expanded-view"
    | "topic-accordion"
    | "cc-toggle"
    | "waiting-for-regenerated-insights"
    | "regenerated-insights"
    | "tabs-overview"
    | "kb-search-input"
    | "kb-search-results"
    | "chat-tab"
    | "chat-panel"
    | "google-tab"
    | "close-transcript-before-insights-tab"
    | "click-insights-tab"
    | "waiting-for-topic-checkpoint"
    | "topic-evolution"
    | "collapse-active-topic"
    | "open-transcript-sidebar"
    | "transcript-running"
    | "expand-active-topic"
    | "transcript-topic-only"
    | "quote-action"
    | "quote-result"
    | "pin-action"
    | "archive-action"
    | "text-select-action"
    | "explain-action"
    | "complete";

export type RegeneratedInsightsMode = "toast-progress" | "toast-banners" | "sidebar-final";

/** Callback signals for App.tsx to act on */
export interface OnboardingSignals {
    shouldPausePlayback: boolean;
    shouldPauseBannerDismiss: boolean;
}

interface UseOnboardingOptions {
    /** Whether data has loaded and the tour can start */
    isReady: boolean;
}

interface UseOnboardingReturn {
    // Joyride props
    steps: Step[];
    stepIndex: number;
    run: boolean;
    // Signals
    signals: OnboardingSignals;
    // Phase info
    phase: OnboardingPhase;
    isOnboardingActive: boolean;
    /** Dynamic subtitle for the progress toast step, updated per stage */
    progressSubtext: string;
    regeneratedInsightsMode: RegeneratedInsightsMode;
    regeneratedInsightsSubtext: string;
    // Lifecycle handlers
    handleJoyrideCallback: (data: JoyrideCallbackData) => void;
    handleProgressStageChange: (toastId: string, stage: ProgressStage) => void;
    handleBannerCreated: (insight?: Insight) => void;
    handleBannerClicked: (insightType: "text" | "viz") => void;
    handleCitationClicked: () => void;
    handleSourcePreviewOpened: () => void;
    handleSourcePreviewExpanded: (expanded: boolean) => void;
    handleCcToggled: (enabled: boolean) => void;
    handlePlaybackCheckpointReached: () => void;
    handleSidebarOnboardingEvent: (event: { type: string; payload?: Record<string, string | number | boolean> }) => void;
    skipOnboarding: () => void;
    // For App.tsx to call after sidebar fully expands
    notifySidebarExpanded: () => void;
    // For App.tsx to call to start playback after step 5
    requestPlay: () => void;
    // For App.tsx to close transcript sidebar before topic step
    requestCloseTranscriptSidebar: () => void;
}

// Minimal type for the joyride callback data (avoids importing the full types)
interface JoyrideCallbackData {
    action: string;
    index: number;
    status: string;
    type: string;
    lifecycle?: string;
}

// ============= Constants =============

const JOYRIDE_ACTIONS = {
    NEXT: "next",
    PREV: "prev",
    CLOSE: "close",
    SKIP: "skip",
    RESET: "reset",
} as const;

const JOYRIDE_EVENTS = {
    STEP_AFTER: "step:after",
    TARGET_NOT_FOUND: "target_not_found",
    TOUR_END: "tour:end",
    TOUR_START: "tour:start",
} as const;

const JOYRIDE_STATUS = {
    FINISHED: "finished",
    SKIPPED: "skipped",
    RUNNING: "running",
} as const;

// Step indices
const STEP = {
    WELCOME: 0,
    DEMO_INTRO: 1,
    MEETING_1: 2,
    MEETING_2: 3,
    MEETING_3: 4,
    MEETING_PLAY: 5,
    PROGRESS_TOAST: 6,
    INSIGHT_BANNERS: 7,
    INSIGHT_SELECTED: 8,
    CITATION_HIGHLIGHT: 9,
    CITATION_KB_INFO: 10,
    SOURCE_PREVIEW_EXPAND_ACTION: 11,
    SOURCE_PREVIEW_EXPANDED_VIEW: 12,
    CHART_INSIGHT: 13,
    CHART_EXPAND_ACTION: 14,
    CHART_EXPANDED_VIEW: 15,
    TOPIC_ACCORDION: 16,
    CC_TOGGLE: 17,
    REGENERATED_INSIGHTS: 18,
    TABS_OVERVIEW: 19,
    KB_SEARCH_INPUT: 20,
    KB_SEARCH_RESULTS: 21,
    CHAT_TAB: 22,
    CHAT_PANEL: 23,
    GOOGLE_TAB: 24,
    CLOSE_TRANSCRIPT_BEFORE_INSIGHTS_TAB: 25,
    CLICK_INSIGHTS_TAB: 26,
    TOPIC_EVOLUTION: 27,
    COLLAPSE_ACTIVE_TOPIC: 28,
    OPEN_TRANSCRIPT_SIDEBAR: 29,
    TRANSCRIPT_RUNNING: 30,
    EXPAND_ACTIVE_TOPIC: 31,
    TRANSCRIPT_TOPIC_ONLY: 32,
    QUOTE_ACTION: 33,
    QUOTE_RESULT: 34,
    PIN_ACTION: 35,
    ARCHIVE_ACTION: 36,
    TEXT_SELECT_ACTION: 37,
    EXPLAIN_ACTION: 38,
} as const;

const STEP_PHASE_TO_INDEX = {
    welcome: STEP.WELCOME,
    "demo-intro": STEP.DEMO_INTRO,
    "meeting-context-1": STEP.MEETING_1,
    "meeting-context-2": STEP.MEETING_2,
    "meeting-context-3": STEP.MEETING_3,
    "meeting-context-play": STEP.MEETING_PLAY,
    "progress-toast": STEP.PROGRESS_TOAST,
    "insight-banners": STEP.INSIGHT_BANNERS,
    "insight-selected": STEP.INSIGHT_SELECTED,
    "citation-highlight": STEP.CITATION_HIGHLIGHT,
    "citation-kb-info": STEP.CITATION_KB_INFO,
    "source-preview-expand-action": STEP.SOURCE_PREVIEW_EXPAND_ACTION,
    "source-preview-expanded-view": STEP.SOURCE_PREVIEW_EXPANDED_VIEW,
    "chart-insight": STEP.CHART_INSIGHT,
    "chart-expand-action": STEP.CHART_EXPAND_ACTION,
    "chart-expanded-view": STEP.CHART_EXPANDED_VIEW,
    "topic-accordion": STEP.TOPIC_ACCORDION,
    "cc-toggle": STEP.CC_TOGGLE,
    "regenerated-insights": STEP.REGENERATED_INSIGHTS,
    "tabs-overview": STEP.TABS_OVERVIEW,
    "kb-search-input": STEP.KB_SEARCH_INPUT,
    "kb-search-results": STEP.KB_SEARCH_RESULTS,
    "chat-tab": STEP.CHAT_TAB,
    "chat-panel": STEP.CHAT_PANEL,
    "google-tab": STEP.GOOGLE_TAB,
    "close-transcript-before-insights-tab": STEP.CLOSE_TRANSCRIPT_BEFORE_INSIGHTS_TAB,
    "click-insights-tab": STEP.CLICK_INSIGHTS_TAB,
    "topic-evolution": STEP.TOPIC_EVOLUTION,
    "collapse-active-topic": STEP.COLLAPSE_ACTIVE_TOPIC,
    "open-transcript-sidebar": STEP.OPEN_TRANSCRIPT_SIDEBAR,
    "transcript-running": STEP.TRANSCRIPT_RUNNING,
    "expand-active-topic": STEP.EXPAND_ACTIVE_TOPIC,
    "transcript-topic-only": STEP.TRANSCRIPT_TOPIC_ONLY,
    "quote-action": STEP.QUOTE_ACTION,
    "quote-result": STEP.QUOTE_RESULT,
    "pin-action": STEP.PIN_ACTION,
    "archive-action": STEP.ARCHIVE_ACTION,
    "text-select-action": STEP.TEXT_SELECT_ACTION,
    "explain-action": STEP.EXPLAIN_ACTION,
} as const;

type StepPhase = keyof typeof STEP_PHASE_TO_INDEX;

// ============= Step Definitions =============

function buildSteps(): Step[] {
    return [
        // 0: Welcome
        {
            target: "body",
            placement: "center" as const,
            disableBeacon: true,
            title: "Welcome to the Study",
            content: "In this study, we are exploring an AI-powered tool that supports live conversations by surfacing relevant data as concise, real-time insights to support a decision-making tasks.",
            data: { phase: "welcome" },
        },
        // 1: Demo intro
        {
            target: '[data-onboarding="video-area"]',
            placement: "center" as const,
            disableBeacon: true,
            title: "Getting Started — Demo Walkthrough",
            content: "Before the interactive tasks and doing a live conversation and make decisions ourselves, let's walk through a demo on a pre-recorded meeting to get familiar with the system's features.",
            data: { phase: "demo-intro" },
        },
        // 2: Meeting context 1
        {
            target: '[data-onboarding="video-area"]',
            placement: "center" as const,
            disableBeacon: true,
            title: "About This Recorded Meeting",
            content: "This is the recording of a session of Canada's Standing Committee on Environment and Sustainable Development, held on December 9, 2024.",
            data: { phase: "meeting-context-1", smallText: "Parliamentary committees like this one invite expert witnesses to inform Members of Parliament (MPs) on specific policy issues." },
        },
        // 3: Meeting context 2
        {
            target: '[data-onboarding="video-area"]',
            placement: "center" as const,
            disableBeacon: true,
            title: "Who are the participants of this recorded meeting?",
            content: "The first speaker is the witness and his name is Jerry DeMarco. He is presenting findings on why Canada has consistently missed its emissions reduction targets since 1990, while MPs question him.",
            data: { phase: "meeting-context-2" },
        },
        // 4: Meeting context 3
        {
            target: '[data-onboarding="video-area"]',
            placement: "center" as const,
            disableBeacon: true,
            title: "The Decision in This Conversation",
            content: "In this meeting, the committee is deciding whether to formally report to the House of Commons its disappointment with the government's slow progress on 2030 emissions targets.",
            data: { phase: "meeting-context-3" },
        },
        // 5: Press next to play
        {
            target: '[data-onboarding="video-area"]',
            placement: "center" as const,
            disableBeacon: true,
            title: "Your Role",
            content: "Envision yourself as a passive participant in this meeting — pretend it is happening live and you are attending, but you cannot speak or intervene.",
            data: { phase: "meeting-context-play", nextLabel: "Play Meeting ▶" },
        },
        // 6: Progress toast appears
        {
            target: '[data-onboarding="progress-toast"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Insight Generation in Progress",
            content: "", // Dynamic — set by progressSubtext
            data: { phase: "progress-toast", hideBack: true },
            spotlightPadding: 12,
        },
        // 7: Insight banners
        {
            target: '[data-onboarding="insight-banner"][data-onboarding-type="text"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Insight Toasts",
            content: "These toasts appear when relevant insights are generated during the meeting. Click on the text insight to view it in the sidebar.",
            data: { phase: "insight-banners", hideNext: true, hideBack: true, actionHint: "👉 Click the insight" },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 8: Insight card selected in sidebar
        {
            target: '[data-onboarding="text-insight-card"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "The Insight",
            content: "This is the insight generated for this part of the conversation. The system detected that the discussion would benefit from relevant supporting information.",
            data: { phase: "insight-selected", hideBack: true },
            spotlightPadding: 6,
        },
        // 9: Citation highlight
        {
            target: '[data-onboarding="citation-link"][data-onboarding-index="1"]',
            placement: "bottom" as const,
            disableBeacon: true,
            title: "Citations",
            content: "Insights are grounded in retrieved documents from the meeting's knowledge base — in this case, official Parliament of Canada documents.",
            data: { phase: "citation-highlight", hideBack: true },
            spotlightPadding: 4,
        },
        // 10: Citation KB info
        {
            target: '[data-onboarding="citation-link"][data-onboarding-index="1"]',
            placement: "bottom" as const,
            disableBeacon: true,
            title: "Knowledge Base Contents",
            content: "", // Rendered as JSX in the tooltip component
            data: { phase: "citation-kb-info", hideNext: true, hideBack: true, actionHint: "👆 Click the citation to see the source" },
            spotlightClicks: true,
            spotlightPadding: 4,
        },
        // 11: Source preview
        {
            target: '[data-onboarding="source-preview-expand-button"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Source Preview",
            content: "Hit the expand button, explore the page to verify this is the source document, then continue.",
            data: { phase: "source-preview-expand-action", hideNext: true, hideBack: true, actionHint: "👆 Click expand" },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 12: Expanded source preview
        {
            target: '[data-onboarding="source-preview-expanded"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Expanded Source",
            content: "You can inspect the document in expanded mode. Close it to continue.",
            data: { phase: "source-preview-expanded-view", hideNext: true, hideBack: true, actionHint: "Explore the source page, then click close to continue" },
            spotlightClicks: true,
            spotlightPadding: 10,
        },
        // 13: Topic accordion title only
        {
            target: '[data-onboarding="viz-insight-card"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Chart Insights",
            content: "On top of text insights, the system also generates chart insights that you can gain comprehensive data from.",
            data: { phase: "chart-insight", hideBack: true },
            spotlightPadding: 6,
        },
        {
            target: '[data-onboarding="viz-expand-button"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Expand Chart",
            content: "You can expand chart insights to take a closer look at them.",
            data: { phase: "chart-expand-action", hideNext: true, hideBack: true, actionHint: "👆 Click expand" },
            spotlightClicks: true,
            spotlightPadding: 4,
        },
        {
            target: '[data-onboarding="viz-expanded-view"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Chart Interaction",
            content: "You can hover your pointer on chart data points to see specific data.",
            data: { phase: "chart-expanded-view", hideNext: true, hideBack: true, actionHint: "Explore the chart, then close it to continue" },
            spotlightClicks: true,
            spotlightPadding: 10,
        },
        // 16: Topic accordion title only
        {
            target: '[data-onboarding="topic-title"][data-onboarding-active="true"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Topic Detection",
            content: "The system also detects different topics discussed during the conversation. The active topic always has a blue ribbon on its left side.",
            data: { phase: "topic-accordion", hideNext: true, hideBack: true, actionHint: "👆 Click a topic" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 14: CC toggle
        {
            target: '[data-onboarding="cc-toggle"]',
            placement: "top" as const,
            disableBeacon: true,
            title: "Closed Captions",
            content: "During the conversation, you can also see the live closed caption of the transcript.",
            data: { phase: "cc-toggle", hideNext: true, hideBack: true, actionHint: "👆 Turn CC on" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 15: Regenerated insights
        {
            target: '[data-onboarding="toast-container"]',
            placement: "bottom" as const,
            disableBeacon: true,
            title: "Insights Again",
            content: "As you see again, these insights are generated for this part of the conversation.",
            data: { phase: "regenerated-insights", hideBack: true },
            spotlightPadding: 6,
        },
        // 16: Other tabs overview
        {
            target: '[data-onboarding="tab-kb-search"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "More Ways to Explore",
            content: "You can also find data directly yourself as well.",
            data: { phase: "tabs-overview", hideNext: true, hideBack: true, actionHint: "👆 Click KB Search" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 17: KB input (action gated)
        {
            target: '[data-onboarding="kb-search-controls"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "KB Search",
            content: "You can directly search the meeting's knowledge base with any query you want.",
            data: { phase: "kb-search-input", hideNext: true, hideBack: true, actionHint: "Type the prefilled query and click Search" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 18: KB results (action gated)
        {
            target: '[data-onboarding="kb-search-results"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Search Results",
            content: "Now you can see the relevant documents to your query. Click one of them.",
            data: { phase: "kb-search-results", hideNext: true, hideBack: true, actionHint: "Click a result link" },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 19: Chat tab intro
        {
            target: '[data-onboarding="tab-chat"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Chat Tab",
            content: "You can also directly chat with a chatbot to ask questions and get responses. These responses are not connected to the meeting's documents.",
            data: { phase: "chat-tab", hideNext: true, hideBack: true, actionHint: "👆 Click Chat" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 20: Chat panel sample
        {
            target: '[data-onboarding="chat-panel"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Sample Conversation",
            content: "You can see a sample back-and-forth chat here.",
            data: { phase: "chat-panel", hideBack: true },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 21: Google tab
        {
            target: '[data-onboarding="tab-google"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Google Search",
            content: "You can also search directly in Google. The rest of the conversation happens about 30 minutes later.",
            data: { phase: "google-tab", hideNext: true, hideBack: true, actionHint: "👆 Click Google" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 22: Return to Insights tab before playback resumes
        {
            target: '[data-onboarding="transcript-toggle"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Close Transcript",
            content: "Before returning to Insights, close the transcript sidebar so the next steps are easier to follow.",
            data: { phase: "close-transcript-before-insights-tab", hideNext: true, hideBack: true, actionHint: "👆 Close transcript" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        {
            target: '[data-onboarding="tab-insights"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Back to Insights",
            content: "Now return to Insights so we can continue and observe how topics evolve in the conversation.",
            data: { phase: "click-insights-tab", hideNext: true, hideBack: true, actionHint: "👆 Click Insights" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 22: Topic evolution
        {
            target: '[data-onboarding="insights-sidebar"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Growing Topics",
            content: "As the conversation goes forward, new topics get detected. The currently discussed topic is indicated with a blue indicator to its left.",
            data: { phase: "topic-evolution", hideBack: true },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 23: Collapse active topic
        {
            target: '[data-onboarding="topic-title"][data-onboarding-active="true"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Topic Focus",
            content: "Now collapse the active topic so we can view the full running transcript first.",
            data: { phase: "collapse-active-topic", hideNext: true, hideBack: true, actionHint: "👆 Collapse active topic" },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 24: Open transcript sidebar
        {
            target: '[data-onboarding="transcript-toggle"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Open Transcript",
            content: "Open the transcript sidebar now.",
            data: { phase: "open-transcript-sidebar", hideNext: true, hideBack: true, actionHint: "👆 Open transcript" },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 25: Transcript running view
        {
            target: '[data-onboarding="transcript-sidebar"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Running Transcript",
            content: "This is the running transcript.",
            data: { phase: "transcript-running", hideBack: true },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 26: Expand topic again
        {
            target: '[data-onboarding="topic-title"][data-onboarding-active="true"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Topic Transcript",
            content: "Expand the active topic again to filter the transcript to just this topic.",
            data: { phase: "expand-active-topic", hideNext: true, hideBack: true, actionHint: "👆 Expand active topic" },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 27: Transcript topic-only view
        {
            target: '[data-onboarding="transcript-sidebar"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Topic-Only Transcript",
            content: "Now this is the transcript only for this topic.",
            data: { phase: "transcript-topic-only", hideBack: true },
            spotlightClicks: true,
            spotlightPadding: 8,
        },
        // 25: Quote action
        {
            target: '[data-onboarding="insight-quote-button"][data-onboarding-primary="true"]',
            placement: "auto" as const,
            disableBeacon: true,
            title: "Insight Provenance",
            content: "You can also see what made an insight generated by hitting this icon on any insight.",
            data: { phase: "quote-action", hideNext: true, hideBack: true, actionHint: "👆 Click the quote icon" },
            spotlightClicks: true,
            spotlightPadding: 4,
        },
        // 26: Quote result
        {
            target: '[data-onboarding="transcript-sidebar"]',
            placement: "left" as const,
            disableBeacon: true,
            title: "Highlighted Transcript",
            content: "You can see the transcript chunk that made this insight generated highlighted.",
            data: { phase: "quote-result", hideBack: true },
            spotlightPadding: 8,
        },
        // 27: Pin action
        {
            target: '[data-onboarding="insight-pin-button"][data-onboarding-primary="true"]',
            placement: "auto" as const,
            disableBeacon: true,
            title: "Pin Insights",
            content: "You can also pin insights that you find useful.",
            data: { phase: "pin-action", hideBack: true },
            spotlightPadding: 4,
        },
        // 28: Archive action
        {
            target: '[data-onboarding="insight-archive-button"][data-onboarding-primary="true"]',
            placement: "auto" as const,
            disableBeacon: true,
            title: "Archive Insights",
            content: "Or you can archive an insight that you don't find useful.",
            data: { phase: "archive-action", hideBack: true },
            spotlightPadding: 4,
        },
        // 29: Text select action
        {
            target: '[data-onboarding="text-insight-card"][data-onboarding-primary="true"]',
            placement: "auto" as const,
            disableBeacon: true,
            title: "Explain Selected Text",
            content: "If you don't understand part of a text insight, select it with your mouse and a tooltip will appear.",
            data: { phase: "text-select-action", hideNext: true, hideBack: true, actionHint: "Select text inside this insight" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
        // 30: Explain action
        {
            target: '[data-onboarding="explain-tooltip"]',
            placement: "auto" as const,
            disableBeacon: true,
            title: "Explanation Tooltip",
            content: "You can hit Explain to see a direct explanation for the selected text.",
            data: { phase: "explain-action", hideNext: true, hideBack: true, actionHint: "Click Explain" },
            spotlightClicks: true,
            spotlightPadding: 6,
        },
    ];
}

// Progress toast substep text
const PROGRESS_SUBTEXT: Record<string, string> = {
    generating: "The system has detected that an insight is needed for this part of the conversation.",
    searching: "It is now retrieving relevant documents from the meeting's knowledge base.",
    creating: "Now it is synthesizing the retrieved documents into insights.",
    complete: "Insights have been generated!",
};

const REGENERATED_SUBTEXT: Record<RegeneratedInsightsMode, string> = {
    "toast-progress": "Watch as the system naturally progresses through retrieval and generation for this moment.",
    "toast-banners": "Now the newly generated insight toast appears for this same part of the conversation.",
    "sidebar-final": "As you see, these insights are generated for this part of the conversation.",
};

// ============= Hook =============

export function useOnboarding({ isReady }: UseOnboardingOptions): UseOnboardingReturn {
    const [phase, setPhase] = useState<OnboardingPhase>("idle");
    const [stepIndex, setStepIndex] = useState(0);
    const [run, setRun] = useState(false);
    const [progressSubtext, setProgressSubtext] = useState(PROGRESS_SUBTEXT.generating);
    const [regeneratedInsightsMode, setRegeneratedInsightsMode] = useState<RegeneratedInsightsMode>("sidebar-final");
    const [regeneratedInsightsSubtext, setRegeneratedInsightsSubtext] = useState(REGENERATED_SUBTEXT["sidebar-final"]);

    // Signals for App.tsx
    const [shouldPausePlayback, setShouldPausePlayback] = useState(false);
    const [shouldPauseBannerDismiss, setShouldPauseBannerDismiss] = useState(false);

    // Internal refs for tracking
    const bannerCountRef = useRef(0);
    const hasStartedRef = useRef(false);
    const progressStageRef = useRef<ProgressStage | null>(null);
    const waitingForSidebarRef = useRef(false);
    const waitingForPreviewRef = useRef(false);
    const timeoutIdsRef = useRef<number[]>([]);
    const phaseRef = useRef<OnboardingPhase>("idle");
    const regeneratedModeRef = useRef<RegeneratedInsightsMode>("sidebar-final");
    const latestRegeneratedTextInsightIdRef = useRef<string | null>(null);
    const regeneratedTextInsightIdsRef = useRef<Set<string>>(new Set());

    const steps = useRef(buildSteps()).current;

    const clearPendingTimeouts = useCallback(() => {
        timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
        timeoutIdsRef.current = [];
    }, []);

    const clearRegeneratedTargetMarker = useCallback(() => {
        const marked = document.querySelectorAll('[data-onboarding-regenerated-target="true"]');
        marked.forEach((element) => element.removeAttribute("data-onboarding-regenerated-target"));

        const highlighted = document.querySelectorAll<HTMLElement>('[data-onboarding-regenerated-highlight="true"]');
        highlighted.forEach((element) => {
            element.removeAttribute("data-onboarding-regenerated-highlight");
            element.style.boxShadow = "";
            element.style.borderColor = "";
        });
    }, []);

    const markRegeneratedSidebarTarget = useCallback((): HTMLElement | null => {
        clearRegeneratedTargetMarker();

        const textCards = Array.from(document.querySelectorAll<HTMLElement>('[data-onboarding="text-insight-card"]'));
        if (textCards.length === 0) {
            return null;
        }

        const idsToHighlight = regeneratedTextInsightIdsRef.current;
        const highlightedCards = textCards.filter((card) => {
            const id = card.getAttribute("data-insight-id");
            return id ? idsToHighlight.has(id) : false;
        });

        const cardsToMark = highlightedCards.length > 0 ? highlightedCards : textCards;
        cardsToMark.forEach((card) => {
            card.setAttribute("data-onboarding-regenerated-highlight", "true");
            card.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--chakra-colors-blue-400) 70%, transparent), 0 0 20px color-mix(in srgb, var(--chakra-colors-blue-300) 30%, transparent)";
            card.style.borderColor = "var(--chakra-colors-blue-400)";
        });

        const latestInsightId = latestRegeneratedTextInsightIdRef.current;
        const anchor = cardsToMark.find((card) => card.getAttribute("data-insight-id") === latestInsightId) ?? cardsToMark[0];
        anchor.setAttribute("data-onboarding-regenerated-target", "true");
        return anchor;
    }, [clearRegeneratedTargetMarker]);

    const isElementInFrame = useCallback((element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const topPadding = 56;
        const bottomPadding = 56;
        const sidePadding = 24;

        return (
            rect.top >= topPadding
            && rect.bottom <= window.innerHeight - bottomPadding
            && rect.left >= sidePadding
            && rect.right <= window.innerWidth - sidePadding
        );
    }, []);

    const scheduleTimeout = useCallback((callback: () => void, delayMs: number) => {
        const id = window.setTimeout(() => {
            timeoutIdsRef.current = timeoutIdsRef.current.filter((pendingId) => pendingId !== id);
            callback();
        }, delayMs);
        timeoutIdsRef.current.push(id);
    }, []);

    const resetInternalRefs = useCallback(() => {
        bannerCountRef.current = 0;
        progressStageRef.current = null;
        waitingForSidebarRef.current = false;
        waitingForPreviewRef.current = false;
        latestRegeneratedTextInsightIdRef.current = null;
        regeneratedTextInsightIdsRef.current.clear();
        regeneratedModeRef.current = "sidebar-final";
        clearRegeneratedTargetMarker();
    }, [clearRegeneratedTargetMarker]);

    const gotoStepPhase = useCallback((nextPhase: StepPhase) => {
        setPhase(nextPhase);
        setStepIndex(STEP_PHASE_TO_INDEX[nextPhase]);
    }, []);

    const setRegeneratedMode = useCallback((mode: RegeneratedInsightsMode) => {
        regeneratedModeRef.current = mode;
        setRegeneratedInsightsMode(mode);
        setRegeneratedInsightsSubtext(REGENERATED_SUBTEXT[mode]);
    }, []);

    const transitionToRegeneratedSidebar = useCallback(() => {
        setRun(false);
        setRegeneratedMode("sidebar-final");
        setShouldPauseBannerDismiss(false);
        const expectedCount = regeneratedTextInsightIdsRef.current.size;
        let attempts = 0;

        const tryMark = () => {
            const currentCards = Array.from(document.querySelectorAll<HTMLElement>('[data-onboarding="text-insight-card"]'));
            const matchedCount = currentCards.filter((card) => {
                const id = card.getAttribute("data-insight-id");
                return id ? regeneratedTextInsightIdsRef.current.has(id) : false;
            }).length;

            const ready = expectedCount === 0 ? currentCards.length > 0 : matchedCount >= expectedCount;
            if (ready) {
                const anchor = markRegeneratedSidebarTarget();
                if (anchor) {
                    anchor.scrollIntoView({ behavior: "auto", block: "center" });

                    scheduleTimeout(() => {
                        const activeAnchor = document.querySelector<HTMLElement>('[data-onboarding-regenerated-target="true"]');
                        if (activeAnchor && isElementInFrame(activeAnchor)) {
                            setRun(true);
                            return;
                        }

                        attempts += 1;
                        if (attempts >= 12) {
                            setRun(true);
                            return;
                        }

                        tryMark();
                    }, 140);
                    return;
                }
            }

            attempts += 1;
            if (attempts >= 12) {
                markRegeneratedSidebarTarget();
                setRun(true);
                return;
            }

            scheduleTimeout(tryMark, 180);
        };

        tryMark();
    }, [isElementInFrame, markRegeneratedSidebarTarget, scheduleTimeout, setRegeneratedMode]);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        regeneratedModeRef.current = regeneratedInsightsMode;
    }, [regeneratedInsightsMode]);

    // Auto-start when ready
    useEffect(() => {
        if (isReady && !hasStartedRef.current) {
            hasStartedRef.current = true;
            gotoStepPhase("welcome");
            setRun(true);
        }
    }, [isReady, gotoStepPhase]);

    useEffect(() => {
        return () => {
            clearPendingTimeouts();
        };
    }, [clearPendingTimeouts]);

    const endOnboarding = useCallback(() => {
        clearPendingTimeouts();
        resetInternalRefs();
        setRun(false);
        setPhase("complete");
        setShouldPausePlayback(false);
        setShouldPauseBannerDismiss(false);
    }, [clearPendingTimeouts, resetInternalRefs]);

    const skipOnboarding = useCallback(() => {
        endOnboarding();
    }, [endOnboarding]);

    // Main joyride callback handler
    const handleJoyrideCallback = useCallback((data: JoyrideCallbackData) => {
        const { action, index, status, type } = data;

        // Tour ended
        if (status === JOYRIDE_STATUS.FINISHED || status === JOYRIDE_STATUS.SKIPPED) {
            endOnboarding();
            return;
        }

        // Skip button
        if (action === JOYRIDE_ACTIONS.CLOSE || action === JOYRIDE_ACTIONS.SKIP) {
            endOnboarding();
            return;
        }

        if (type === JOYRIDE_EVENTS.TARGET_NOT_FOUND) {
            if (phase === "source-preview-expanded-view") {
                setRun(false);
                scheduleTimeout(() => {
                    const expandedTarget = document.querySelector('[data-onboarding="source-preview-expanded"]');
                    if (expandedTarget) {
                        setRun(true);
                        return;
                    }

                    // Recover to expand-action step if expanded target still is not mounted.
                    gotoStepPhase("source-preview-expand-action");
                    setRun(true);
                }, 120);
                return;
            }

            if (phase === "chart-expanded-view") {
                setRun(false);
                scheduleTimeout(() => {
                    const expandedTarget = document.querySelector('[data-onboarding="viz-expanded-view"]');
                    if (expandedTarget) {
                        setRun(true);
                        return;
                    }

                    // Recover to the expand-action step if the target still is not mounted.
                    gotoStepPhase("chart-expand-action");
                    setRun(true);
                }, 120);
            }

            if (phase === "regenerated-insights") {
                if (regeneratedModeRef.current === "sidebar-final") {
                    transitionToRegeneratedSidebar();
                    return;
                }

                setRun(true);
            }

            if (phase === "quote-action") {
                setRun(false);
                scheduleTimeout(() => {
                    const primaryQuoteButton = document.querySelector('[data-onboarding="insight-quote-button"][data-onboarding-primary="true"]');
                    if (primaryQuoteButton) {
                        setRun(true);
                        return;
                    }

                    // Fallback to previous transcript-topic-only step if the target is still unavailable.
                    gotoStepPhase("transcript-topic-only");
                    setRun(true);
                }, 180);
            }
            return;
        }

        if (type !== JOYRIDE_EVENTS.STEP_AFTER) return;

        const isNext = action === JOYRIDE_ACTIONS.NEXT;
        const isPrev = action === JOYRIDE_ACTIONS.PREV;

        // --- Handle per-step transitions ---

        if (isNext) {
            switch (index) {
                case STEP.WELCOME:
                    gotoStepPhase("demo-intro");
                    break;

                case STEP.DEMO_INTRO:
                    gotoStepPhase("meeting-context-1");
                    break;

                case STEP.MEETING_1:
                    gotoStepPhase("meeting-context-2");
                    break;

                case STEP.MEETING_2:
                    gotoStepPhase("meeting-context-3");
                    break;

                case STEP.MEETING_3:
                    gotoStepPhase("meeting-context-play");
                    break;

                case STEP.MEETING_PLAY:
                    // User pressed "Play Meeting" — hide joyride, start video, wait for progress toast
                    setPhase("waiting-for-toast");
                    setRun(false);
                    setShouldPausePlayback(false); // Allow playback
                    break;

                case STEP.INSIGHT_SELECTED:
                    gotoStepPhase("citation-highlight");
                    break;

                case STEP.CITATION_HIGHLIGHT:
                    gotoStepPhase("citation-kb-info");
                    break;

                case STEP.CHART_INSIGHT:
                    gotoStepPhase("chart-expand-action");
                    break;

                case STEP.REGENERATED_INSIGHTS:
                    gotoStepPhase("tabs-overview");
                    break;

                case STEP.CHAT_PANEL:
                    gotoStepPhase("google-tab");
                    break;

                case STEP.GOOGLE_TAB:
                    gotoStepPhase("close-transcript-before-insights-tab");
                    break;

                case STEP.TOPIC_EVOLUTION:
                    gotoStepPhase("collapse-active-topic");
                    break;

                case STEP.OPEN_TRANSCRIPT_SIDEBAR:
                    gotoStepPhase("transcript-running");
                    break;

                case STEP.TRANSCRIPT_RUNNING:
                    gotoStepPhase("expand-active-topic");
                    break;

                case STEP.TRANSCRIPT_TOPIC_ONLY:
                    gotoStepPhase("quote-action");
                    break;

                case STEP.QUOTE_RESULT:
                    gotoStepPhase("pin-action");
                    break;

                case STEP.PIN_ACTION:
                    gotoStepPhase("archive-action");
                    break;

                case STEP.ARCHIVE_ACTION:
                    gotoStepPhase("text-select-action");
                    break;

                default:
                    break;
            }
        }

        if (isPrev) {
            switch (index) {
                case STEP.DEMO_INTRO:
                    gotoStepPhase("welcome");
                    break;

                case STEP.MEETING_1:
                    gotoStepPhase("demo-intro");
                    break;

                case STEP.MEETING_2:
                    gotoStepPhase("meeting-context-1");
                    break;

                case STEP.MEETING_3:
                    gotoStepPhase("meeting-context-2");
                    break;

                case STEP.MEETING_PLAY:
                    gotoStepPhase("meeting-context-3");
                    break;

                case STEP.CITATION_HIGHLIGHT:
                    gotoStepPhase("insight-selected");
                    break;

                case STEP.CITATION_KB_INFO:
                    gotoStepPhase("citation-highlight");
                    break;

                case STEP.SOURCE_PREVIEW_EXPAND_ACTION:
                    gotoStepPhase("citation-kb-info");
                    break;

                case STEP.SOURCE_PREVIEW_EXPANDED_VIEW:
                    gotoStepPhase("source-preview-expand-action");
                    break;

                case STEP.CHART_INSIGHT:
                    gotoStepPhase("source-preview-expanded-view");
                    break;

                case STEP.CHART_EXPAND_ACTION:
                    gotoStepPhase("chart-insight");
                    break;

                case STEP.CHART_EXPANDED_VIEW:
                    gotoStepPhase("chart-expand-action");
                    break;

                case STEP.TOPIC_ACCORDION:
                    gotoStepPhase("chart-expanded-view");
                    break;

                case STEP.CC_TOGGLE:
                    gotoStepPhase("topic-accordion");
                    break;

                case STEP.REGENERATED_INSIGHTS:
                    gotoStepPhase("cc-toggle");
                    break;

                case STEP.TABS_OVERVIEW:
                    gotoStepPhase("regenerated-insights");
                    break;

                case STEP.KB_SEARCH_INPUT:
                    gotoStepPhase("tabs-overview");
                    break;

                case STEP.KB_SEARCH_RESULTS:
                    gotoStepPhase("kb-search-input");
                    break;

                case STEP.CHAT_TAB:
                    gotoStepPhase("kb-search-results");
                    break;

                case STEP.CHAT_PANEL:
                    gotoStepPhase("chat-tab");
                    break;

                case STEP.GOOGLE_TAB:
                    gotoStepPhase("chat-panel");
                    break;

                case STEP.CLOSE_TRANSCRIPT_BEFORE_INSIGHTS_TAB:
                    gotoStepPhase("google-tab");
                    break;

                case STEP.CLICK_INSIGHTS_TAB:
                    gotoStepPhase("close-transcript-before-insights-tab");
                    break;

                case STEP.TOPIC_EVOLUTION:
                    gotoStepPhase("click-insights-tab");
                    break;

                case STEP.COLLAPSE_ACTIVE_TOPIC:
                    gotoStepPhase("topic-evolution");
                    break;

                case STEP.OPEN_TRANSCRIPT_SIDEBAR:
                    gotoStepPhase("collapse-active-topic");
                    break;

                case STEP.TRANSCRIPT_RUNNING:
                    gotoStepPhase("open-transcript-sidebar");
                    break;

                case STEP.EXPAND_ACTIVE_TOPIC:
                    gotoStepPhase("transcript-running");
                    break;

                case STEP.TRANSCRIPT_TOPIC_ONLY:
                    gotoStepPhase("expand-active-topic");
                    break;

                case STEP.QUOTE_ACTION:
                    gotoStepPhase("transcript-topic-only");
                    break;

                case STEP.QUOTE_RESULT:
                    gotoStepPhase("quote-action");
                    break;

                case STEP.PIN_ACTION:
                    gotoStepPhase("quote-result");
                    break;

                case STEP.ARCHIVE_ACTION:
                    gotoStepPhase("pin-action");
                    break;

                case STEP.TEXT_SELECT_ACTION:
                    gotoStepPhase("archive-action");
                    break;

                case STEP.EXPLAIN_ACTION:
                    gotoStepPhase("text-select-action");
                    break;

                default:
                    break;
            }
        }
    }, [endOnboarding, gotoStepPhase, phase, scheduleTimeout, transitionToRegeneratedSidebar]);

    // Called by App.tsx when a progress toast stage changes
    const handleProgressStageChange = useCallback((_toastId: string, stage: ProgressStage) => {
        progressStageRef.current = stage;

        if (phase === "waiting-for-toast" && stage === "generating") {
            // First progress toast appeared — pause video and show the step
            setShouldPausePlayback(true);
            setShouldPauseBannerDismiss(true);
            setPhase("progress-toast");
            setProgressSubtext(PROGRESS_SUBTEXT.generating);
            setStepIndex(STEP_PHASE_TO_INDEX["progress-toast"]);
            setRun(true);
            return;
        }

        if (phase === "waiting-for-regenerated-insights" && stage === "generating") {
            setShouldPausePlayback(true);
            // Preserve default toast/banner lifecycle for this phase while we only highlight it in onboarding.
            setShouldPauseBannerDismiss(false);
            gotoStepPhase("regenerated-insights");
            setRegeneratedMode("toast-progress");
            setRun(true);

            // Fallback path in case banner callbacks are delayed or unavailable.
            scheduleTimeout(() => {
                if (phaseRef.current !== "regenerated-insights") return;
                if (regeneratedModeRef.current !== "toast-progress") return;
                setRegeneratedMode("toast-banners");
            }, 4000);

            scheduleTimeout(() => {
                if (phaseRef.current !== "regenerated-insights") return;
                if (regeneratedModeRef.current === "sidebar-final") return;
                transitionToRegeneratedSidebar();
            }, 6200);
            return;
        }

        if (phase === "regenerated-insights" && regeneratedModeRef.current === "toast-progress") {
            // Preserve natural stage progression while the user observes the toast updates.
            if (stage === "searching") {
                setRegeneratedInsightsSubtext("Now the system is retrieving relevant documents from the meeting's knowledge base.");
            } else if (stage === "creating") {
                setRegeneratedInsightsSubtext("Now it is synthesizing those documents into refreshed insights for this conversation segment.");
            }
        }

        if (phase === "progress-toast") {
            // Update dynamic text based on stage
            if (stage === "complete") {
                return;
            }
            const text = PROGRESS_SUBTEXT[stage];
            if (text) {
                setProgressSubtext(text);
            }
        }
    }, [gotoStepPhase, phase, scheduleTimeout, setRegeneratedMode, transitionToRegeneratedSidebar]);

    // Called by App.tsx when an insight banner is created
    const handleBannerCreated = useCallback((insight?: Insight) => {
        bannerCountRef.current += 1;

        // After the first banner appears during the progress toast phase,
        // wait a moment for the UI to stabilize, then advance to banner step
        if (phase === "progress-toast" && bannerCountRef.current === 1) {
            setPhase("waiting-for-banners");
            // Small delay to let both banners render and toast to finish animating
            scheduleTimeout(() => {
                setPhase("insight-banners");
                setStepIndex(STEP_PHASE_TO_INDEX["insight-banners"]);
                // Step stays visible — user must click the text banner
            }, 1200);
        }

        if (phase === "regenerated-insights") {
            if (insight?.type === "text") {
                latestRegeneratedTextInsightIdRef.current = insight.id;
                regeneratedTextInsightIdsRef.current.add(insight.id);
            }

            if (regeneratedModeRef.current === "toast-progress") {
                setRegeneratedMode("toast-banners");
                scheduleTimeout(() => {
                    if (phaseRef.current !== "regenerated-insights") return;
                    if (regeneratedModeRef.current !== "toast-banners") return;
                    transitionToRegeneratedSidebar();
                }, 1200);
            }
        }
    }, [phase, scheduleTimeout, setRegeneratedMode, transitionToRegeneratedSidebar]);

    // Called by App.tsx when a banner is clicked
    const handleBannerClicked = useCallback((insightType: "text" | "viz") => {
        if (phase !== "insight-banners" || insightType !== "text") return;

        // Banner click triggers sidebar expansion — wait for it
        setPhase("waiting-for-sidebar");
        waitingForSidebarRef.current = true;
        setRun(false);

        // Wait for sidebar to expand and insight card to render
        scheduleTimeout(() => {
            if (waitingForSidebarRef.current) {
                waitingForSidebarRef.current = false;
                setPhase("insight-selected");
                setStepIndex(STEP_PHASE_TO_INDEX["insight-selected"]);
                setRun(true);
            }
        }, 800);
    }, [phase, scheduleTimeout]);

    // Called by App.tsx when sidebar is fully expanded (unused for now — timeout approach suffices)
    const notifySidebarExpanded = useCallback(() => {
        // Reserved for future use if we need more precise timing
    }, []);

    // Called by App.tsx when user clicks a citation during onboarding
    const handleCitationClicked = useCallback(() => {
        if (phase !== "citation-kb-info") return;

        // Citation click opens the source preview — wait for it to render
        setPhase("waiting-for-preview");
        waitingForPreviewRef.current = true;
        setRun(false);

        scheduleTimeout(() => {
            if (waitingForPreviewRef.current) {
                waitingForPreviewRef.current = false;
                setPhase("source-preview-expand-action");
                setStepIndex(STEP_PHASE_TO_INDEX["source-preview-expand-action"]);
                setRun(true);
            }
        }, 500);
    }, [phase, scheduleTimeout]);

    // Called by App.tsx when the EmbeddedWebViewer becomes visible
    const handleSourcePreviewOpened = useCallback(() => {
        // Reserved — currently handled by timeout in handleCitationClicked
    }, []);

    const handleSourcePreviewExpanded = useCallback((expanded: boolean) => {
        if (phase !== "source-preview-expand-action") return;
        if (!expanded) return;
        gotoStepPhase("source-preview-expanded-view");
        setRun(true);
    }, [gotoStepPhase, phase]);

    const handleCcToggled = useCallback((enabled: boolean) => {
        if (phase !== "cc-toggle") return;
        if (!enabled) return;
        latestRegeneratedTextInsightIdRef.current = null;
        regeneratedTextInsightIdsRef.current.clear();
        clearRegeneratedTargetMarker();
        setPhase("waiting-for-regenerated-insights");
        setShouldPausePlayback(false);
        setShouldPauseBannerDismiss(false);
        setRun(false);
    }, [clearRegeneratedTargetMarker, phase]);

    const handlePlaybackCheckpointReached = useCallback(() => {
        if (phase !== "waiting-for-topic-checkpoint") return;
        gotoStepPhase("topic-evolution");
        setShouldPausePlayback(true);
        setRun(true);
    }, [gotoStepPhase, phase]);

    const handleSidebarOnboardingEvent = useCallback((event: { type: string; payload?: Record<string, string | number | boolean> }) => {
        if (event.type === "source-preview-closed" && phase === "source-preview-expanded-view") {
            gotoStepPhase("chart-insight");
            setRun(true);
            return;
        }

        if (event.type === "tab-selected" && phase === "tabs-overview" && event.payload?.tab === "kb-search") {
            gotoStepPhase("kb-search-input");
            setRun(true);
            return;
        }

        if (event.type === "kb-search-submitted" && phase === "kb-search-input") {
            gotoStepPhase("kb-search-results");
            setRun(true);
            return;
        }

        if (event.type === "kb-result-clicked" && phase === "kb-search-results") {
            gotoStepPhase("chat-tab");
            setRun(true);
            return;
        }

        if (event.type === "tab-selected" && phase === "chat-tab" && event.payload?.tab === "chat") {
            gotoStepPhase("chat-panel");
            setRun(true);
            return;
        }

        if (event.type === "tab-selected" && phase === "google-tab" && event.payload?.tab === "google") {
            if (document.querySelector('[data-onboarding="transcript-sidebar"]')) {
                gotoStepPhase("close-transcript-before-insights-tab");
            } else {
                gotoStepPhase("click-insights-tab");
            }
            setRun(true);
            return;
        }

        if (event.type === "transcript-toggled" && phase === "close-transcript-before-insights-tab" && event.payload?.open === false) {
            gotoStepPhase("click-insights-tab");
            setRun(true);
            return;
        }

        if (event.type === "tab-selected" && phase === "click-insights-tab" && event.payload?.tab === "insights") {
            setPhase("waiting-for-topic-checkpoint");
            setShouldPausePlayback(false);
            setRun(false);
            return;
        }

        if (event.type === "topic-toggled" && phase === "topic-accordion") {
            gotoStepPhase("cc-toggle");
            setRun(true);
            return;
        }

        if (event.type === "topic-toggled" && phase === "collapse-active-topic" && event.payload?.expanded === false) {
            gotoStepPhase("open-transcript-sidebar");
            setRun(true);
            return;
        }

        if (event.type === "transcript-toggled" && phase === "open-transcript-sidebar" && event.payload?.open === true) {
            gotoStepPhase("transcript-running");
            setRun(true);
            return;
        }

        if (event.type === "topic-toggled" && phase === "expand-active-topic" && event.payload?.expanded === true) {
            gotoStepPhase("transcript-topic-only");
            setRun(true);
            return;
        }

        if (event.type === "quote-click" && phase === "quote-action") {
            gotoStepPhase("quote-result");
            setRun(true);
            return;
        }

        if (event.type === "text-selected" && phase === "text-select-action") {
            gotoStepPhase("explain-action");
            setRun(true);
            return;
        }

        if (event.type === "explain-click" && phase === "explain-action") {
            endOnboarding();
        }

        if (event.type === "viz-expanded" && phase === "chart-expand-action") {
            setRun(false);
            gotoStepPhase("chart-expanded-view");
            // Wait for portal mount so Joyride can safely measure target geometry.
            scheduleTimeout(() => {
                const expandedTarget = document.querySelector('[data-onboarding="viz-expanded-view"]');
                if (expandedTarget) {
                    setRun(true);
                    return;
                }

                // One retry before fallback.
                scheduleTimeout(() => {
                    const retryTarget = document.querySelector('[data-onboarding="viz-expanded-view"]');
                    if (retryTarget) {
                        setRun(true);
                        return;
                    }

                    gotoStepPhase("chart-expand-action");
                    setRun(true);
                }, 120);
            }, 60);
            return;
        }

        if (event.type === "viz-collapsed" && phase === "chart-expanded-view") {
            gotoStepPhase("topic-accordion");
            setRun(true);
        }
    }, [endOnboarding, gotoStepPhase, phase, scheduleTimeout]);

    const requestPlay = useCallback(() => {
        // Reserved
    }, []);

    const requestCloseTranscriptSidebar = useCallback(() => {
        // Reserved
    }, []);

    return {
        steps,
        stepIndex,
        run,
        signals: {
            shouldPausePlayback,
            shouldPauseBannerDismiss,
        },
        phase,
        isOnboardingActive: phase !== "idle" && phase !== "complete",
        progressSubtext,
        regeneratedInsightsMode,
        regeneratedInsightsSubtext,
        handleJoyrideCallback,
        handleProgressStageChange,
        handleBannerCreated,
        handleBannerClicked,
        handleCitationClicked,
        handleSourcePreviewOpened,
        handleSourcePreviewExpanded,
        handleCcToggled,
        handlePlaybackCheckpointReached,
        handleSidebarOnboardingEvent,
        skipOnboarding,
        notifySidebarExpanded,
        requestPlay,
        requestCloseTranscriptSidebar,
    };
}
