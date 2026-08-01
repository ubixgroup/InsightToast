"use client";

import { useState, useRef, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { Box, Flex, Spinner, Center, Text, Stack } from "@chakra-ui/react";
import { motion, useMotionValue } from "motion/react";
import { useConversationData } from "@/hooks/useConversationData";
import { usePlaybackState } from "@/hooks/usePlaybackState";
import { useProgressToast } from "@/hooks/useProgressToast";
import { useInsightVisibility } from "@/hooks/useInsightVisibility";
import { useDemoCaptions } from "@/hooks/useDemoCaptions";
import { PlaybackControls } from "@/components/PlaybackControls";
import { VideoPlayer } from "@/components/VideoPlayer";
import { InsightsSidebar } from "@/components/InsightsSidebar";
import { ProgressToast } from "@/components/ProgressToast";
import { InsightBanner } from "@/components/InsightBanner";
import {
  SessionActionControls,
  type SessionHoverControl,
} from "@/components/SessionControls";
import { joinConversationV2, leaveConversationV2 } from "@/services/v2Api";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingTour } from "@/components/OnboardingTour";
import type { DismissedInsight } from "@/types";
import type { InsightBannerState } from "@/types/progressToast";

const NOTIFICATION_WIDTH = 400;
const DRAG_DISMISS_RATIO = 0.4;

// Fill these training messages for read-only demo chat (2 user + 1 assistant suggested).
const DEMO_CHAT_PRESET_MESSAGES: Array<{ role: "user" | "assistant"; content: string }> = [
  { role: "user", content: "Which sectors and provinces are driving Canada's emissions increase since 1990?" },
  { role: "assistant", content: "Alberta's oil and gas sector is the dominant driver — bitumen extraction has expanded massively since 1990, and volume growth has outpaced efficiency gains. Saskatchewan's heavy industry and agriculture contribute as well. Transportation is the second-largest national driver, growing steadily across all provinces due to increased freight and personal vehicle use. Ontario and Quebec have actually reduced emissions, largely because their electricity grids were already low-carbon. The short answer is that Canada's emissions problem is heavily concentrated in western fossil fuel production." },
  { role: "user", content: "Can you give me more details on the transportation emissions?" },
  { role: "assistant", content: "Transportation emissions have increased by about 40% since 1990, making it the second-largest source of emissions in Canada. The growth is driven by both freight and passenger transportation. Freight transportation has expanded due to increased trade and e-commerce, leading to more trucks on the road. Personal vehicle use has also increased, with more Canadians owning cars and driving longer distances. While there have been improvements in fuel efficiency, they haven't kept pace with the growth in transportation activity. This trend is consistent across all provinces, but it's particularly pronounced in Ontario and Quebec, which have large urban centers and significant commuter traffic." },
];

interface AnimatedNotificationItemProps {
  lifecycle: "active" | "exiting";
  width: number;
  cancelClickOnDrag?: boolean;
  onRequestDismiss: () => void;
  onFinalizeDismiss: () => void;
  children: ReactNode;
}

function AnimatedNotificationItem({
  lifecycle,
  width,
  cancelClickOnDrag = false,
  onRequestDismiss,
  onFinalizeDismiss,
  children,
}: AnimatedNotificationItemProps) {
  const x = useMotionValue(0);
  const [didDrag, setDidDrag] = useState(false);

  return (
    <motion.div
      style={{
        x,
        width: `${width}px`,
        pointerEvents: lifecycle === "exiting" ? "none" : "auto",
      }}
      initial={{ opacity: 0, x: 80, scale: 0.98 }}
      animate={lifecycle === "exiting"
        ? { opacity: 0, x: 120, scale: 0.98 }
        : { opacity: 1, x: 0, scale: 1 }}
      transition={lifecycle === "exiting"
        ? { duration: 0.26, ease: [0.4, 0, 1, 1] }
        : { type: "spring", stiffness: 260, damping: 30, mass: 1.0 }}
      drag="x"
      dragMomentum={false}
      dragElastic={0.3}
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={(_, info) => {
        if (info.offset.x < 0) {
          x.set(0);
          return;
        }

        if (info.offset.x > 6) {
          setDidDrag(true);
        }
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x >= width * DRAG_DISMISS_RATIO) {
          onRequestDismiss();
          return;
        }

        setDidDrag(false);
      }}
      onClickCapture={(event) => {
        if (cancelClickOnDrag && didDrag) {
          event.preventDefault();
          event.stopPropagation();
          setDidDrag(false);
        }
      }}
      onAnimationComplete={() => {
        if (lifecycle === "exiting") {
          onFinalizeDismiss();
        }
      }}
    >
      {children}
    </motion.div>
  );
}

interface DemoAppProps {
  onBack?: () => void;
}

export default function App({ onBack }: DemoAppProps) {
  const {
    chunks,
    topics,
    insights,
    meetingTitle,
    meetingSummary,
    chunkToTopicMap,
    insightToChunkMap,
    topicToChunksMap,
    events,
    isLoading,
    error,
  } = useConversationData();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isCcEnabled, setIsCcEnabled] = useState(false);
  const [hoveredControl, setHoveredControl] = useState<SessionHoverControl>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [demoSession, setDemoSession] = useState<{ conversationId: string; clientId: string } | null>(null);
  const [isDemoSessionReady, setIsDemoSessionReady] = useState(false);

  // New state for features
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [pinnedInsightIds, setPinnedInsightIds] = useState<Set<string>>(new Set());
  const [dismissedInsights, setDismissedInsights] = useState<DismissedInsight[]>([]);
  const [isTranscriptSidebarOpen, setIsTranscriptSidebarOpen] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [focusInsightRequest, setFocusInsightRequest] = useState<{ insightId: string; topicId: string | null; requestId: number } | null>(null);

  // Page load time for timestamp calculation (simulates real-time)
  const [pageLoadTime] = useState(() => new Date());

  const videoRef = useRef<HTMLVideoElement>(null);
  const demoSessionRef = useRef<{ conversationId: string; clientId: string } | null>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    demoSessionRef.current = demoSession;
  }, [demoSession]);

  useEffect(() => {
    let isCancelled = false;
    const envConversationId = (import.meta.env.VITE_DEMO_ID as string | undefined)?.trim() ?? "";

    const joinDemoSession = async () => {
      if (!envConversationId) {
        setIsDemoSessionReady(false);
        return;
      }

      try {
        const joined = await joinConversationV2({
          conversationId: envConversationId,
          speakerName: "Demo User",
          isBaseline: false,
        });

        if (isCancelled) return;

        const nextSession = {
          conversationId: joined.conversation_id,
          clientId: joined.client_id,
        };
        demoSessionRef.current = nextSession;
        setDemoSession(nextSession);
        setIsDemoSessionReady(true);
      } catch {
        if (isCancelled) return;
        demoSessionRef.current = null;
        setDemoSession(null);
        setIsDemoSessionReady(false);
      }
    };

    void joinDemoSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Onboarding tour hook — must be before useProgressToast so signals are available
  const onboarding = useOnboarding({ isReady: !isLoading && !error });

  // Progress toast hook for showing insight generation progress
  const {
    activeToasts,
    insightBanners,
    dismissToast,
    dismissBanner,
    finalizeDismissToast,
    finalizeDismissBanner,
    simulateChunkEvents,
    advanceProgressStage,
    resetProgressState,
  } = useProgressToast({
    topics,
    pauseAutoDismiss: onboarding.signals.shouldPauseBannerDismiss,
    pauseProgressSimulation: onboarding.signals.shouldPauseBannerDismiss,
    onStageChange: onboarding.handleProgressStageChange,
    onBannerCreated: onboarding.handleBannerCreated,
  });

  // Insight visibility tracking for seen/unseen state
  const {
    seenInsightIds,
    registerRef: registerInsightRef,
    getUnseenCount,
    getElement: getInsightElement,
  } = useInsightVisibility();

  const { visibleState, loadingInsights, highlights, visibleChunkIndices, processingChunkIndices } = usePlaybackState({
    chunks,
    topics,
    insights,
    meetingTitle,
    meetingSummary,
    chunkToTopicMap,
    currentTime,
    isPlaying,
    // Trigger progress toast simulation when a chunk starts processing
    onChunkProcessingStart: simulateChunkEvents,
    onPlaybackReset: resetProgressState,
  });

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  // Pin/Dismiss handlers
  const handlePinInsight = useCallback((insightId: string) => {
    setPinnedInsightIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  }, []);

  const handleDismissInsight = useCallback((insightId: string, topicId: string, topicName: string) => {
    const insight = visibleState.insights.find((i) => i.id === insightId);
    if (!insight) return;

    setDismissedInsights((prev) => [
      ...prev,
      {
        insight,
        originalTopicId: topicId,
        topicName,
        dismissedAt: Date.now(),
      },
    ]);
  }, [visibleState.insights]);

  const handleRestoreInsight = useCallback((insightId: string) => {
    setDismissedInsights((prev) => prev.filter((d) => d.insight.id !== insightId));
  }, []);

  // Filter out dismissed insights from visible insights
  const dismissedIds = new Set(dismissedInsights.map((d) => d.insight.id));
  const activeInsights = visibleState.insights.filter((i) => !dismissedIds.has(i.id));

  const activeProgressChunkIndices = useMemo(() => {
    return new Set(
      activeToasts
        .filter((toast) => toast.stage !== "complete")
        .map((toast) => toast.chunkIndex)
    );
  }, [activeToasts]);

  const shouldGateByProgress =
    activeProgressChunkIndices.size > 0 || processingChunkIndices.size > 0;

  const blockedChunkIndices = useMemo(() => {
    return new Set([
      ...activeProgressChunkIndices,
      ...processingChunkIndices,
    ]);
  }, [activeProgressChunkIndices, processingChunkIndices]);

  const gatedInsights = useMemo(() => {
    if (!shouldGateByProgress) return activeInsights;

    return activeInsights.filter((insight) => {
      if (focusInsightRequest?.insightId === insight.id) {
        return true;
      }

      const chunkIndex = insightToChunkMap.get(insight.id);
      if (chunkIndex === undefined) return true;
      return !blockedChunkIndices.has(chunkIndex);
    });
  }, [activeInsights, shouldGateByProgress, focusInsightRequest, insightToChunkMap, blockedChunkIndices]);

  const gatedLoadingInsights = useMemo(() => {
    if (!shouldGateByProgress) return loadingInsights;

    return loadingInsights.filter((item) => {
      const chunkIndex = insightToChunkMap.get(item.insightId);
      if (chunkIndex === undefined) return true;
      return !blockedChunkIndices.has(chunkIndex);
    });
  }, [loadingInsights, shouldGateByProgress, insightToChunkMap, blockedChunkIndices]);

  // Citation click handler
  const handleCitationClick = useCallback((url: string) => {
    setActiveUrl(url);
    setIsTranscriptSidebarOpen(true);
    // Notify onboarding that a citation was clicked
    onboarding.handleCitationClicked();
  }, [onboarding]);

  const handleToggleCc = useCallback(() => {
    setIsCcEnabled((prev) => {
      const next = !prev;
      onboarding.handleCcToggled(next);
      return next;
    });
  }, [onboarding]);

  const handleCloseSourcePreview = useCallback(() => {
    setActiveUrl(null);
    onboarding.handleSidebarOnboardingEvent({ type: "source-preview-closed" });
  }, [onboarding]);

  const handleSelectInsight = useCallback((insightId: string | null) => {
    setSelectedInsightId(insightId);
  }, []);

  const handleExpandFromBanner = useCallback((banner: InsightBannerState) => {
    const insightType = banner.insight.type === "viz" ? "viz" : "text";

    if (onboarding.phase === "insight-banners" && insightType === "text") {
      activeToasts.forEach((toast) => {
        if (toast.lifecycle === "active") {
          dismissToast(toast.id);
        }
      });
      insightBanners.forEach((item) => {
        if (item.lifecycle === "active") {
          dismissBanner(item.id);
        }
      });
    }

    setIsSidebarCollapsed(false);
    setFocusInsightRequest({
      insightId: banner.insight.id,
      topicId: banner.topicId ?? banner.insight.thread?.topic_id ?? null,
      requestId: Date.now(),
    });
    // Notify onboarding that a banner was clicked
    onboarding.handleBannerClicked(insightType as "text" | "viz");
  }, [activeToasts, dismissBanner, dismissToast, insightBanners, onboarding]);

  const sidebarWidth = isSidebarCollapsed
    ? 48 + (isTranscriptSidebarOpen ? 350 : 0)
    : 450 + (isTranscriptSidebarOpen ? 350 : 0);
  const overlayRight = isSidebarCollapsed
    ? "48px"
    : `${450 + (isTranscriptSidebarOpen ? 350 : 0)}px`;

  const leaveDemoSession = useCallback(async () => {
    if (leavingRef.current) return;

    const current = demoSessionRef.current;
    if (!current) return;

    leavingRef.current = true;
    try {
      await leaveConversationV2({
        conversationId: current.conversationId,
        clientId: current.clientId,
      });
    } catch {
      // Best effort only for demo teardown.
    } finally {
      demoSessionRef.current = null;
      setDemoSession(null);
      setIsDemoSessionReady(false);
      leavingRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      void leaveDemoSession();
    };
  }, [leaveDemoSession]);

  const handleBackClick = useCallback(() => {
    if (typeof document !== "undefined") {
      const mediaElements = document.querySelectorAll("video, audio");
      mediaElements.forEach((element) => {
        const mediaElement = element as HTMLMediaElement;
        const srcObject = mediaElement.srcObject;
        if (srcObject && srcObject instanceof MediaStream) {
          srcObject.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {
              // best effort
            }
          });
          mediaElement.srcObject = null;
        }
      });
    }

    onBack?.();
  }, [onBack]);

  const handleLeaveClick = useCallback(async () => {
    await leaveDemoSession();
    handleBackClick();
  }, [handleBackClick, leaveDemoSession]);

  const { text: demoCaptionText, phase: demoCaptionPhase } = useDemoCaptions(
    chunks,
    currentTime,
    isCcEnabled,
  );

  // Onboarding: pause/resume video based on onboarding signals
  useEffect(() => {
    if (!videoRef.current) return;
    if (onboarding.signals.shouldPausePlayback) {
      videoRef.current.pause();
    }
  }, [onboarding.signals.shouldPausePlayback]);

  // Onboarding: auto-play video when "waiting-for-toast" phase begins
  useEffect(() => {
    if (onboarding.phase === "waiting-for-toast" && videoRef.current) {
      videoRef.current.play();
    }
  }, [onboarding.phase]);

  useEffect(() => {
    if (onboarding.phase !== "waiting-for-topic-checkpoint") {
      return;
    }

    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }

    let didAdvance = false;
    const pauseAndAdvance = () => {
      if (didAdvance) return;
      didAdvance = true;
      videoEl.pause();
      onboarding.handlePlaybackCheckpointReached();
    };

    // Lock the checkpoint from the current playback position once for this phase entry.
    const playbackNow = videoEl.currentTime;
    const nextChunkWithStart = chunks.find((chunk) => chunk.start_timestamp !== undefined && chunk.start_timestamp > playbackNow);
    if (!nextChunkWithStart) {
      // Near end-of-video there may be no future synced chunk; avoid dead-end in onboarding.
      pauseAndAdvance();
      return;
    }

    void videoEl.play();

    const checkpoint = nextChunkWithStart.start_timestamp;
    if (checkpoint === undefined) {
      pauseAndAdvance();
      return;
    }

    const timer = window.setInterval(() => {
      if (videoEl.currentTime >= checkpoint) {
        window.clearInterval(timer);
        pauseAndAdvance();
      }
    }, 120);

    return () => {
      window.clearInterval(timer);
    };
  }, [chunks, onboarding.phase, onboarding.handlePlaybackCheckpointReached]);

  // Onboarding: after CC toggle, resume playback so regenerated insights can be generated.
  useEffect(() => {
    if (onboarding.phase !== "waiting-for-regenerated-insights") {
      return;
    }
    if (!videoRef.current || !videoRef.current.paused) {
      return;
    }
    videoRef.current.play();
  }, [onboarding.phase]);

  // Onboarding: in regenerated-insights auto mode, advance paused progress stages without Next clicks.
  useEffect(() => {
    if (onboarding.phase !== "regenerated-insights") {
      return;
    }

    if (onboarding.regeneratedInsightsMode !== "toast-progress") {
      return;
    }

    // Kick once immediately, then continue until mode transitions to toast-banners/sidebar-final.
    advanceProgressStage();
    const timer = window.setInterval(() => {
      advanceProgressStage();
    }, 1200);

    return () => {
      window.clearInterval(timer);
    };
  }, [advanceProgressStage, onboarding.phase, onboarding.regeneratedInsightsMode]);

  if (isLoading) {
    return (
      <Center height="100vh" bg="bg">
        <Stack align="center" gap="4">
          <Spinner size="xl" color="blue.500" />
          <Text color="fg.muted">Loading conversation data...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center height="100vh" bg="bg">
        <Stack align="center" gap="4" maxW="400px" textAlign="center">
          <Text color="red.500" fontWeight="semibold">
            Error loading data
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {error}
          </Text>
          <Text color="fg.subtle" fontSize="xs">
            Make sure input.json and video.mp4 are in the public folder.
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box height="100vh" overflow="hidden" bg="bg">
      {/* Playback controls - hidden by default, shows on hover */}
      <PlaybackControls
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        events={events}
        onSeek={handleSeek}
        onPlayPause={handlePlayPause}
        sidebarWidth={sidebarWidth}
      />

      {/* Main content area */}
      <Flex height="100%">
        {/* Video player area */}
        <Box flex="1" height="100%" position="relative" data-onboarding="video-area">
          <VideoPlayer
            videoRef={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onPlayStateChange={handlePlayStateChange}
            isCameraOn={isCameraOn}
            onCameraPermissionDenied={() => setIsCameraOn(false)}
          />

          <SessionActionControls
            isCcEnabled={isCcEnabled}
            isTranscriptEnabled={false}
            isTranscriptDisabled
            showTranscriptStartHint={false}
            isMuted={isMuted}
            isCameraOn={isCameraOn}
            hoveredControl={hoveredControl}
            onHoverControl={setHoveredControl}
            onToggleCc={handleToggleCc}
            onToggleTranscript={() => undefined}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onToggleCamera={() => setIsCameraOn((prev) => !prev)}
            onLeave={() => {
              void handleLeaveClick();
            }}
          />

          {isCcEnabled && demoCaptionText && (
            <Box
              position="absolute"
              left="50%"
              transform="translateX(-50%)"
              bottom="calc(3.5rem + 30px)"
              maxW="min(900px, 80vw)"
              px="4"
              py="2"
              borderRadius="md"
              bg={demoCaptionPhase === "final" ? "blackAlpha.700" : "gray.600"}
              backdropFilter="blur(6px)"
              borderWidth="1px"
              borderColor={demoCaptionPhase === "final" ? "whiteAlpha.300" : "gray.500"}
              zIndex="2"
              pointerEvents="none"
            >
              <Text color="white" fontSize="sm" textAlign="center" lineHeight="tall">
                {demoCaptionText}
              </Text>
            </Box>
          )}
        </Box>

        {/* Insights sidebar */}
        <InsightsSidebar
          topics={visibleState.topics}
          insights={gatedInsights}
          loadingInsights={gatedLoadingInsights}
          currentTopicId={visibleState.currentTopicId}
          highlights={highlights}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          pinnedInsightIds={pinnedInsightIds}
          onPinInsight={handlePinInsight}
          onDismissInsight={handleDismissInsight}
          dismissedInsights={dismissedInsights}
          onRestoreInsight={handleRestoreInsight}
          selectedInsightId={selectedInsightId}
          onSelectInsight={handleSelectInsight}
          onCitationClick={handleCitationClick}
          // Transcript sidebar props
          chunks={chunks}
          chunkToTopicMap={chunkToTopicMap}
          insightToChunkMap={insightToChunkMap}
          topicToChunksMap={topicToChunksMap}
          visibleChunkIndices={visibleChunkIndices}
          isTranscriptSidebarOpen={isTranscriptSidebarOpen}
          onToggleTranscriptSidebar={() => setIsTranscriptSidebarOpen(!isTranscriptSidebarOpen)}
          activeUrl={activeUrl}
          onCloseUrl={handleCloseSourcePreview}
          onSourcePreviewExpandChange={onboarding.handleSourcePreviewExpanded}
          pageLoadTime={pageLoadTime}
          focusInsightRequest={focusInsightRequest}
          onFocusHandled={() => setFocusInsightRequest(null)}
          // Seen tracking props
          seenInsightIds={seenInsightIds}
          registerInsightRef={registerInsightRef}
          getUnseenCount={getUnseenCount}
          getInsightElement={getInsightElement}
          isInteractiveTabsEnabled
          conversationId={isDemoSessionReady ? demoSession?.conversationId ?? null : null}
          clientId={isDemoSessionReady ? demoSession?.clientId ?? null : null}
          isExplainEnabled={isDemoSessionReady}
          chatPresetMessages={DEMO_CHAT_PRESET_MESSAGES}
          isChatReadOnly
          onOnboardingEvent={onboarding.handleSidebarOnboardingEvent}
          onboardingPhase={onboarding.phase}
        />
      </Flex>

      {/* Progress toasts and generated insight banners - always shown as overlay for consistency */}
      {(activeToasts.length > 0 || insightBanners.length > 0) && (
        <Box
          data-onboarding="toast-container"
          position="fixed"
          top="4"
          right={overlayRight}
          zIndex="toast"
          display="flex"
          flexDirection="column"
          gap="2"
          maxH="calc(100vh - 32px)"
          overflowY="auto"
          pointerEvents="none"
          css={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {/* Progress toasts first */}
          {activeToasts.map((toast) => (
            <AnimatedNotificationItem
              key={toast.id}
              lifecycle={toast.lifecycle}
              width={NOTIFICATION_WIDTH}
              onRequestDismiss={() => dismissToast(toast.id)}
              onFinalizeDismiss={() => finalizeDismissToast(toast.id)}
            >
              <ProgressToast
                toast={toast}
                onDismiss={() => dismissToast(toast.id)}
              />
            </AnimatedNotificationItem>
          ))}
          {/* Insight banners below */}
          {insightBanners.map((banner) => (
            <AnimatedNotificationItem
              key={banner.id}
              lifecycle={banner.lifecycle}
              width={NOTIFICATION_WIDTH}
              cancelClickOnDrag
              onRequestDismiss={() => dismissBanner(banner.id)}
              onFinalizeDismiss={() => finalizeDismissBanner(banner.id)}
            >
              <InsightBanner
                banner={banner}
                onDismiss={() => dismissBanner(banner.id)}
                onExpand={handleExpandFromBanner}
              />
            </AnimatedNotificationItem>
          ))}
        </Box>
      )}

      {/* Onboarding tour overlay */}
      <OnboardingTour
        steps={onboarding.steps}
        stepIndex={onboarding.stepIndex}
        run={onboarding.run}
        onCallback={onboarding.handleJoyrideCallback}
        progressSubtext={onboarding.progressSubtext}
        onboardingPhase={onboarding.phase}
        regeneratedInsightsMode={onboarding.regeneratedInsightsMode}
        regeneratedInsightsSubtext={onboarding.regeneratedInsightsSubtext}
        onAdvanceProgress={advanceProgressStage}
      />
    </Box>
  );
}
