// src/modules/video-call/hooks/useCallTabSync.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";


interface UseCallTabSyncOptions {
  appointmentId: string;
  userId: string;
  enabled?: boolean;
}

interface UseCallTabSyncReturn {
  /** True if another tab is currently active for this appointment and user */
  isDuplicateTab: boolean;
  /** True if this tab was active, but another tab took over the session */
  isTakenOver: boolean;
  /** True if this tab currently owns the active session */
  isActiveTab: boolean;
  /** Unique ID generated for this browser tab instance */
  tabId: string;
  /** Request to take over the consultation from another active tab */
  requestTakeover: () => void;
  /** Reclaim the consultation back to this tab */
  reclaimCall: () => void;
  /** Manually trigger duplicate tab state (e.g. from server rejection) */
  setDuplicateDetected: () => void;
  /** Release the active tab lock */
  releaseTab: () => void;
}

const HEARTBEAT_INTERVAL_MS = 2000;
const STALE_HEARTBEAT_THRESHOLD_MS = 5000;

export function useCallTabSync({
  appointmentId,
  userId,
  enabled = true,
}: UseCallTabSyncOptions): UseCallTabSyncReturn {
  const tabIdRef = useRef<string>("");
  if (!tabIdRef.current) {
    tabIdRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  const tabId = tabIdRef.current;

  const [isDuplicateTab, setIsDuplicateTab] = useState<boolean>(false);
  const [isTakenOver, setIsTakenOver] = useState<boolean>(false);
  const [isActiveTab, setIsActiveTab] = useState<boolean>(false);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `active_call_${appointmentId}_${userId}`;
  const channelName = `zydoc_call_sync_${appointmentId}_${userId}`;

  // ── Helper to write heartbeat to localStorage ───────────────────────────
  const writeHeartbeat = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ tabId, timestamp: Date.now() })
      );
    } catch (e) {
      console.warn("[useCallTabSync] Failed to write heartbeat:", e);
    }
  }, [storageKey, tabId]);

  // ── Release the active tab lock ─────────────────────────────────────────
  const releaseTab = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const currentVal = localStorage.getItem(storageKey);
      if (currentVal) {
        const parsed = JSON.parse(currentVal);
        if (parsed.tabId === tabId) {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      // Ignore parse error
    }

    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: "TAB_CLOSED", senderTabId: tabId });
      } catch (e) {
        // Channel may be closed
      }
    }

    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, [storageKey, tabId]);

  // ── Manually set duplicate state (e.g. from backend join_rejected) ───────
  const setDuplicateDetected = useCallback(() => {
    setIsDuplicateTab(true);
    setIsActiveTab(false);
    setIsTakenOver(false);
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  // ── Request Takeover ────────────────────────────────────────────────────
  const requestTakeover = useCallback(() => {
    console.log(`[useCallTabSync] Tab ${tabId} requesting takeover...`);
    setIsDuplicateTab(false);
    setIsTakenOver(false);
    setIsActiveTab(true);

    // Broadcast takeover to any active tab
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type: "TAKEOVER_REQUEST",
          senderTabId: tabId,
        });
      } catch (e) {
        console.warn("[useCallTabSync] Error posting takeover message:", e);
      }
    }

    // Immediately claim localStorage
    writeHeartbeat();

    // Start heartbeat
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setInterval(writeHeartbeat, HEARTBEAT_INTERVAL_MS);
  }, [tabId, writeHeartbeat]);

  const reclaimCall = useCallback(() => {
    requestTakeover();
  }, [requestTakeover]);

  // ── Main Coordination Effect ────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !appointmentId || !userId || typeof window === "undefined") {
      return;
    }

    // 1. Check existing localStorage lock
    let hasActiveOtherTab = false;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - (parsed.timestamp || 0);
        if (parsed.tabId && parsed.tabId !== tabId && age < STALE_HEARTBEAT_THRESHOLD_MS) {
          hasActiveOtherTab = true;
        }
      }
    } catch (e) {
      console.warn("[useCallTabSync] Error reading localStorage lock:", e);
    }

    if (hasActiveOtherTab) {
      console.log(`[useCallTabSync] Another tab is currently active for ${storageKey}. Blocking tab ${tabId}.`);
      setIsDuplicateTab(true);
      setIsActiveTab(false);
      setIsTakenOver(false);
    } else {
      // Claim this tab as active
      setIsDuplicateTab(false);
      setIsTakenOver(false);
      setIsActiveTab(true);
      writeHeartbeat();
      heartbeatTimerRef.current = setInterval(writeHeartbeat, HEARTBEAT_INTERVAL_MS);
    }

    // 2. Setup BroadcastChannel for real-time inter-tab messaging
    let channel: BroadcastChannel | null = null;
    try {
      if ("BroadcastChannel" in window) {
        channel = new BroadcastChannel(channelName);
        channelRef.current = channel;

        channel.onmessage = (event) => {
          const { type, senderTabId } = event.data || {};
          if (senderTabId === tabId) return; // Ignore own messages

          if (type === "CHECK_ACTIVE") {
            // If we are the active tab, acknowledge our presence
            setIsActiveTab((currentActive) => {
              if (currentActive) {
                try {
                  channel?.postMessage({
                    type: "ACTIVE_ACK",
                    senderTabId: tabId,
                  });
                } catch (e) {}
              }
              return currentActive;
            });
          } else if (type === "ACTIVE_ACK") {
            // Another tab proved it's active
            setIsActiveTab((currentActive) => {
              if (!currentActive) {
                setIsDuplicateTab(true);
              }
              return currentActive;
            });
          } else if (type === "TAKEOVER_REQUEST") {
            // Another tab is taking over
            console.log(`[useCallTabSync] Tab ${senderTabId} took over. Deactivating tab ${tabId}.`);
            setIsActiveTab(false);
            setIsDuplicateTab(false);
            setIsTakenOver(true);

            if (heartbeatTimerRef.current) {
              clearInterval(heartbeatTimerRef.current);
              heartbeatTimerRef.current = null;
            }
          } else if (type === "TAB_CLOSED") {
            // If active tab closed, duplicate tab can become ready or stay clean
            console.log(`[useCallTabSync] Active tab ${senderTabId} closed.`);
          }
        };

        // If we thought no other tab was active, double-check via broadcast ping
        if (!hasActiveOtherTab) {
          channel.postMessage({ type: "CHECK_ACTIVE", senderTabId: tabId });
        }
      }
    } catch (err) {
      console.warn("[useCallTabSync] BroadcastChannel not supported or error:", err);
    }

    // 3. Setup Storage Event Listener as fallback for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      if (!e.newValue) {
        // Active tab cleared the key
        return;
      }
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.tabId && parsed.tabId !== tabId) {
          const age = Date.now() - (parsed.timestamp || 0);
          if (age < STALE_HEARTBEAT_THRESHOLD_MS) {
            // Another tab claimed or renewed ownership
            setIsActiveTab((currentActive) => {
              if (currentActive) {
                // We were overtaken
                setIsTakenOver(true);
                if (heartbeatTimerRef.current) {
                  clearInterval(heartbeatTimerRef.current);
                  heartbeatTimerRef.current = null;
                }
                return false;
              }
              return currentActive;
            });
          }
        }
      } catch (err) {}
    };

    window.addEventListener("storage", handleStorage);

    // 4. Handle beforeunload / unload
    const handleUnload = () => {
      releaseTab();
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("beforeunload", handleUnload);
      releaseTab();
      if (channel) {
        channel.close();
        channelRef.current = null;
      }
    };
  }, [enabled, appointmentId, userId, storageKey, channelName, tabId, writeHeartbeat, releaseTab]);

  return {
    isDuplicateTab,
    isTakenOver,
    isActiveTab,
    tabId,
    requestTakeover,
    reclaimCall,
    setDuplicateDetected,
    releaseTab,
  };
}
