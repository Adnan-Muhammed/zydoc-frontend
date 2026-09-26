// src/modules/video-call/hooks/usePreventCallExit.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Rewinds any sentinel pushState entries added by usePreventCallExit
 * before a programmatic navigation so that router.replace replaces
 * only the consultation page entry and the Back button won't land on "/".
 *
 * @param count - number of sentinel entries to rewind (same value as sentinelCountRef)
 * @returns a Promise that resolves after the history.go() popstate fires
 */
export function rewindHistorySentinels(count: number): Promise<void> {
  if (count <= 0 || typeof window === "undefined") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const handlePop = () => {
      window.removeEventListener("popstate", handlePop);
      resolve();
    };
    window.addEventListener("popstate", handlePop);
    window.history.go(-count);
  });
}

export interface UsePreventCallExitOptions {
  /** Whether the guard is currently active (call is live/connected and has not ended) */
  isActive: boolean;
  /** Callback to clean up local media tracks, RTCPeerConnection, and socket connection on pagehide/unload */
  onLeaveCall: () => void;
  /** Explicit callback when user confirms exit/end in modal (emits end_call) */
  onConfirmExit?: () => void;
  /** Default redirect URL when leaving (e.g. '/doctor/dashboard' or '/patient/appointments') */
  defaultRedirectUrl: string;
  /** Appointment ObjectId to tag session exit flags */
  appointmentId: string;
  /** Optional guard condition: return false to disallow exiting (e.g. mandatory 1-minute wait) */
  canExit?: () => boolean;
  /** Callback fired when an exit attempt is blocked by canExit */
  onExitBlocked?: () => void;
}

export interface UsePreventCallExitReturn {
  /** Whether the confirmation modal should be visible */
  isExitModalOpen: boolean;
  /** Programmatic trigger to request exiting the call (e.g. End Call button) */
  requestExit: (targetUrl?: string) => void;
  /** User cancelled exit — keeps them inside the call room */
  cancelExit: () => void;
  /** User confirmed exit — cleans up connections and replaces history with target URL */
  confirmExit: () => void;
  /**
   * Number of sentinel pushState entries currently in the stack.
   * Pass this to rewindHistorySentinels() before any programmatic router.replace
   * that happens outside of confirmExit (e.g. from useWebRTC call_ended / endCall).
   */
  sentinelCount: number;
}

export function usePreventCallExit({
  isActive,
  onLeaveCall,
  onConfirmExit,
  defaultRedirectUrl,
  appointmentId,
  canExit,
  onExitBlocked,
}: UsePreventCallExitOptions): UsePreventCallExitReturn {
  const router = useRouter();

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [sentinelCount, setSentinelCount] = useState(0);
  const sentinelCountRef = useRef(0);
  const pendingUrlRef = useRef<string | null>(null);
  const isBypassingGuardRef = useRef(false);
  const onLeaveCallRef = useRef(onLeaveCall);
  const onConfirmExitRef = useRef(onConfirmExit);
  const canExitRef = useRef(canExit);
  const onExitBlockedRef = useRef(onExitBlocked);

  useEffect(() => {
    onLeaveCallRef.current = onLeaveCall;
  }, [onLeaveCall]);

  useEffect(() => {
    onConfirmExitRef.current = onConfirmExit;
  }, [onConfirmExit]);

  useEffect(() => {
    canExitRef.current = canExit;
  }, [canExit]);

  useEffect(() => {
    onExitBlockedRef.current = onExitBlocked;
  }, [onExitBlocked]);

  // ── 1. Browser Tab Close / Page Refresh & Pull-to-Refresh Prevention (Rule 5) ──
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBypassingGuardRef.current) return;

      e.preventDefault();
      // Standard confirmation message for modern browsers
      e.returnValue = "Are you sure you want to leave? Your call will be disconnected.";
      return e.returnValue;
    };

    // Block keyboard reload shortcuts (F5, Ctrl+R, Cmd+R, Ctrl+Shift+R, Cmd+Shift+R)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBypassingGuardRef.current) return;
      const isF5 = e.key === "F5";
      const isReload = (e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R");
      if (isF5 || isReload) {
        e.preventDefault();
        e.stopPropagation();
        console.log("[usePreventCallExit] Blocked browser reload attempt during active call (Rule 5)");
      }
    };

    // Lock pull-to-refresh on mobile browsers via overscroll-behavior and touchmove interception
    const originalBodyOverscroll = document.body.style.overscrollBehaviorY;
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;
    document.body.style.overscrollBehaviorY = "contain";
    document.documentElement.style.overscrollBehaviorY = "contain";

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length === 1) {
        const touchY = e.touches[0].clientY;
        const diff = touchY - touchStartY;
        // If at top of scroll and pulling downward, cancel pull-to-refresh gesture
        if (window.scrollY <= 0 && diff > 0 && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    // If page is actually being closed/unloaded (e.g. user confirmed native browser dialog),
    // make sure local tracks and socket are immediately stopped on pagehide
    const handlePageHide = () => {
      try {
        onLeaveCallRef.current?.();
      } catch (err) {
        console.warn("[usePreventCallExit] Error during pagehide cleanup:", err);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("pagehide", handlePageHide);
      document.body.style.overscrollBehaviorY = originalBodyOverscroll;
      document.documentElement.style.overscrollBehaviorY = originalHtmlOverscroll;
    };
  }, [isActive]);

  // ── 2. Browser Back / Forward Button Guard (popstate) ───────────────────
  useEffect(() => {
    if (!isActive) return;

    // Push one sentinel state so browser has an entry to pop before leaving page.
    // We track the count so we can rewind them before programmatic navigation.
    window.history.pushState({ inCallGuard: true }, "", window.location.href);
    sentinelCountRef.current += 1;
    setSentinelCount((c) => c + 1);

    const handlePopState = (e: PopStateEvent) => {
      if (isBypassingGuardRef.current) return;

      // Restore the sentinel so the user stays on the call page.
      window.history.pushState({ inCallGuard: true }, "", window.location.href);
      sentinelCountRef.current += 1;
      setSentinelCount((c) => c + 1);

      if (canExitRef.current && !canExitRef.current()) {
        onExitBlockedRef.current?.();
        return;
      }

      pendingUrlRef.current = null; // Exit via back button redirects to default page
      setIsExitModalOpen(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Reset count on deactivation so stale sentinels aren't tracked
      sentinelCountRef.current = 0;
      setSentinelCount(0);
    };
  }, [isActive]);

  // ── 3. In-App Navigation Guard (Intercepting link clicks) ────────────────
  useEffect(() => {
    if (!isActive) return;

    const handleAnchorClick = (e: MouseEvent) => {
      if (isBypassingGuardRef.current) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Allow same-page anchors, external links opening in new tab, mailto, tel, downloads
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }

      // Check if href is same page
      try {
        const url = new URL(href, window.location.href);
        if (url.pathname === window.location.pathname) {
          return;
        }
      } catch {
        // Fallback for relative paths
        if (href === window.location.pathname) return;
      }

      // Intercept in-app navigation
      e.preventDefault();
      e.stopPropagation();

      if (canExitRef.current && !canExitRef.current()) {
        onExitBlockedRef.current?.();
        return;
      }

      pendingUrlRef.current = href;
      setIsExitModalOpen(true);
    };

    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isActive]);

  // ── 4. Actions: Request, Cancel, and Confirm Exit ───────────────────────

  const requestExit = useCallback((targetUrl?: string) => {
    if (canExitRef.current && !canExitRef.current()) {
      onExitBlockedRef.current?.();
      return;
    }
    pendingUrlRef.current = targetUrl || null;
    setIsExitModalOpen(true);
  }, []);

  const cancelExit = useCallback(() => {
    pendingUrlRef.current = null;
    setIsExitModalOpen(false);
  }, []);

  const confirmExit = useCallback(() => {
    isBypassingGuardRef.current = true;
    setIsExitModalOpen(false);

    // Record session exit flag to prevent history back re-entry
    if (typeof window !== "undefined" && appointmentId) {
      sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
    }

    const destination = pendingUrlRef.current || defaultRedirectUrl;
    const currentSentinelCount = sentinelCountRef.current;

    // Rewind sentinel entries first, then navigate — prevents Back button from
    // landing on ghost states that resolve to "/".
    const doNavigate = () => {
      try {
        if (onConfirmExitRef.current) {
          onConfirmExitRef.current();
        } else {
          onLeaveCallRef.current?.();
          router.replace(destination);
        }
      } catch (err) {
        console.warn("[usePreventCallExit] Error during exit cleanup:", err);
        router.replace(destination);
      }
    };

    if (currentSentinelCount > 0) {
      rewindHistorySentinels(currentSentinelCount).then(doNavigate);
    } else {
      doNavigate();
    }
  }, [appointmentId, defaultRedirectUrl, router]);

  return {
    isExitModalOpen,
    requestExit,
    cancelExit,
    confirmExit,
    sentinelCount,
  };
}
