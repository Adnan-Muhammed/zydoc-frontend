// src/modules/video-call/hooks/usePreventCallExit.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface UsePreventCallExitOptions {
  /** Whether the guard is currently active (call is live/connected and has not ended) */
  isActive: boolean;
  /** Callback to clean up local media tracks, RTCPeerConnection, and socket connection */
  onLeaveCall: () => void;
  /** Default redirect URL when leaving (e.g. '/doctor/dashboard' or '/patient/appointments') */
  defaultRedirectUrl: string;
  /** Appointment ObjectId to tag session exit flags */
  appointmentId: string;
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
}

export function usePreventCallExit({
  isActive,
  onLeaveCall,
  defaultRedirectUrl,
  appointmentId,
}: UsePreventCallExitOptions): UsePreventCallExitReturn {
  const router = useRouter();

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const isBypassingGuardRef = useRef(false);
  const onLeaveCallRef = useRef(onLeaveCall);

  useEffect(() => {
    onLeaveCallRef.current = onLeaveCall;
  }, [onLeaveCall]);

  // ── 1. Browser Tab Close / Page Refresh Prevention (beforeunload) ────────
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isBypassingGuardRef.current) return;

      e.preventDefault();
      // Standard confirmation message for modern browsers
      e.returnValue = "Are you sure you want to leave? Your call will be disconnected.";
      return e.returnValue;
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
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [isActive]);

  // ── 2. Browser Back / Forward Button Guard (popstate) ───────────────────
  useEffect(() => {
    if (!isActive) return;

    // Push sentinel state so browser has an entry to pop before leaving page
    window.history.pushState({ inCallGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (isBypassingGuardRef.current) return;

      // Restore current history state so the URL does not change and user stays in room
      window.history.pushState({ inCallGuard: true }, "", window.location.href);

      pendingUrlRef.current = null; // Exit via back button redirects to default page
      setIsExitModalOpen(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
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

    // Properly disconnect/clean up local media tracks and socket/WebRTC connections
    try {
      onLeaveCallRef.current?.();
    } catch (err) {
      console.warn("[usePreventCallExit] Error during exit cleanup:", err);
    }

    // Determine target URL and replace history so Back button will NOT return to call
    const destination = pendingUrlRef.current || defaultRedirectUrl;
    router.replace(destination);
  }, [appointmentId, defaultRedirectUrl, router]);

  return {
    isExitModalOpen,
    requestExit,
    cancelExit,
    confirmExit,
  };
}
