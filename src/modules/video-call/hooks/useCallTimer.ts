// src/modules/video-call/hooks/useCallTimer.ts
//
// The Three Phases of a Consultation:
// ┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
// │      PHASE 1: BASE       │    PHASE 2: EXTENSION    │     PHASE 3: WRAP-UP     │
// │  (e.g., First 10 Mins)   │ (Up to MAX_EXTENSION)    │  (Strict 60s Countdown)  │
// ├──────────────────────────┼──────────────────────────┼──────────────────────────┤
// │ - Timer runs normally.   │ - Doctor clicks "Extend" │ - Triggered by Server    │
// │ - Ends at sessionStart + │ - Timer counts down the  │   (next patient OR end   │
// │   Base Duration.         │   remaining extension.   │   of MAX_EXTENSION).     │
// │ - Alert prompts Doctor:  │ - Doctor can still end   │ - UI turns RED.          │
// │   "End or Extend?"       │   call early.            │ - Force Auto-Disconnect  │
// │                          │                          │   at 0:00. No Rejoin.    │
// └──────────────────────────┴──────────────────────────┴──────────────────────────┘

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MAX_EXTENSION_MINUTES,
  WRAP_UP_COUNTDOWN_SECONDS,
} from '../../../config/videoCallConfig';


export type TimerPhase = 'Normal' | 'Warning' | 'Extension' | 'WrapUp';

export interface TimerConfig {
  sessionStartedAt: string;
  scheduledEndTime: string;
  baseDurationMinutes: number;
  /** Configurable max extension — sent by server from videoCallConfig */
  maxExtensionMinutes?: number;
  /** Configurable wrap-up countdown — sent by server from videoCallConfig */
  wrapUpCountdownSeconds?: number;
  isNextSlotBooked?: boolean;
  nextAppointmentType?: 'online' | 'offline' | null;
  nextSlotStatus?: 'FREE' | 'PATIENT_LATE' | 'PATIENT_PRESENT' | null;
  nextAppointmentId?: string | null;
  nextSlotStartTime?: string | null;
  primaryEndTime?: string;
  absoluteHardLimitTime?: string;
  isAlreadyExtended?: boolean;
}

/**
 * Extension state received from the server's `extension_granted` event.
 * Contains the calculated deadline and whether it's constrained by a waiting patient.
 */
export interface ExtensionState {
  extensionDeadlineMs: number;
  extensionDeadlineISO: string;
  maxExtensionMinutes: number;
  extensionDurationSeconds: number;
  isConstrainedByNextPatient: boolean;
  wrapUpCountdownSeconds: number;
}

export function useCallTimer(timerConfig: TimerConfig | null) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [phase, setPhase] = useState<TimerPhase>('Normal');
  
  const [isExtended, setIsExtended] = useState(timerConfig?.isAlreadyExtended ?? false);
  const [wrapUpEndTime, setWrapUpEndTime] = useState<number | null>(null);

  // Extension deadline state — set when server emits extension_granted
  const [extensionDeadlineMs, setExtensionDeadlineMs] = useState<number | null>(null);
  const [isConstrainedByNextPatient, setIsConstrainedByNextPatient] = useState(false);

  const isExtendedRef = useRef(isExtended);
  const wrapUpEndTimeRef = useRef(wrapUpEndTime);
  const extensionDeadlineRef = useRef(extensionDeadlineMs);
  const wrapUpStartedRef = useRef(false);
  const hasExtendedRef = useRef(timerConfig?.isAlreadyExtended ?? false);

  // Sync state changes to refs for interval closure
  useEffect(() => { 
    isExtendedRef.current = isExtended; 
  }, [isExtended]);
  
  useEffect(() => { 
    wrapUpEndTimeRef.current = wrapUpEndTime; 
  }, [wrapUpEndTime]);

  useEffect(() => {
    extensionDeadlineRef.current = extensionDeadlineMs;
  }, [extensionDeadlineMs]);

  // Sync timerConfig initialization
  useEffect(() => {
    if (timerConfig?.isAlreadyExtended) {
      setIsExtended(true);
      hasExtendedRef.current = true;
    }
  }, [timerConfig?.isAlreadyExtended]);

  // ── Server-Driven Wrap-Up (Race Condition #3: server authority) ──────────
  // Called when the server emits `server_wrap_up_warning`.
  // Once started, this countdown is IRREVERSIBLE (Race Condition #2).
  const triggerWrapUpPhase = useCallback((durationSeconds = WRAP_UP_COUNTDOWN_SECONDS) => {
    if (wrapUpStartedRef.current) return; // Already started — cannot restart or cancel
    wrapUpStartedRef.current = true;
    
    const end = Date.now() + durationSeconds * 1000;
    setWrapUpEndTime(end);
    wrapUpEndTimeRef.current = end;
    setPhase('WrapUp');
    setRemainingSeconds(durationSeconds);
  }, []);

  // Alias for backward compatibility
  const startWrapUpCountdown = triggerWrapUpPhase;

  // ── Extension Granted Handler ────────────────────────────────────────────
  // Called when the server emits `extension_granted` with the calculated
  // deadline (Condition A: capped by next patient, or Condition B: full MAX).
  const handleExtensionGranted = useCallback((extensionState: ExtensionState) => {
    if (hasExtendedRef.current && extensionDeadlineRef.current) return; // Already processed
    
    hasExtendedRef.current = true;
    setIsExtended(true);
    setExtensionDeadlineMs(extensionState.extensionDeadlineMs);
    extensionDeadlineRef.current = extensionState.extensionDeadlineMs;
    setIsConstrainedByNextPatient(extensionState.isConstrainedByNextPatient);
    setPhase('Extension');
  }, []);

  // ── Extension Deadline Updated Handler ───────────────────────────────────
  // Called when JoinWaitingRoomUseCase tightens the deadline mid-extension
  // (e.g., next patient joins waiting room while call is already extended).
  const handleExtensionDeadlineUpdated = useCallback((payload: {
    extensionDeadlineMs: number;
    isConstrainedByNextPatient: boolean;
    remainingSeconds: number;
  }) => {
    const currentDeadline = extensionDeadlineRef.current;
    // Only tighten the deadline, never loosen it
    if (!currentDeadline || payload.extensionDeadlineMs < currentDeadline) {
      setExtensionDeadlineMs(payload.extensionDeadlineMs);
      extensionDeadlineRef.current = payload.extensionDeadlineMs;
      setIsConstrainedByNextPatient(payload.isConstrainedByNextPatient);
    }
  }, []);

  // The extendCall function now simply tracks local UI state.
  // The actual deadline is set by the server via extension_granted.
  const extendCall = useCallback(() => {
    if (hasExtendedRef.current) return;
    hasExtendedRef.current = true;
    setIsExtended(true);
  }, []);

  // ── Main Timer Loop ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerConfig) {
      setElapsedSeconds(0);
      setRemainingSeconds(0);
      setPhase('Normal');
      return;
    }

    const { sessionStartedAt, baseDurationMinutes } = timerConfig;
    const startTime = new Date(sessionStartedAt).getTime();
    const standardDurationMs = baseDurationMinutes * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedSeconds(elapsed);

      const currentWrapUpEndTime = wrapUpEndTimeRef.current;
      const currentExtensionDeadline = extensionDeadlineRef.current;

      // ────────────────────────────────────────────────────────────────────
      // PHASE 3: Wrap-Up (highest priority — once started, irreversible)
      //
      // The wrap-up countdown is driven by the server's `server_wrap_up_warning`
      // event. Once triggered (wrapUpStartedRef = true), it CANNOT be cancelled,
      // even if the next patient leaves the waiting room.
      // (Satisfies Race Condition #2: irreversible wrap-up)
      // ────────────────────────────────────────────────────────────────────
      if (currentWrapUpEndTime) {
        const remainingWrapUp = Math.max(0, Math.floor((currentWrapUpEndTime - now) / 1000));
        setRemainingSeconds(remainingWrapUp);
        setPhase('WrapUp');
        return;
      }

      // ────────────────────────────────────────────────────────────────────
      // PHASE 2: Extension Countdown (if extension has been granted)
      //
      // Shows the remaining time until the extension deadline.
      // The deadline was calculated server-side:
      //   - Condition A: nextSlotStartMs (next patient waiting)
      //   - Condition B: baseDurationEnd + MAX_EXTENSION_MINUTES
      // ────────────────────────────────────────────────────────────────────
      if (currentExtensionDeadline && isExtendedRef.current) {
        const remainingExtension = Math.max(0, Math.floor((currentExtensionDeadline - now) / 1000));
        setRemainingSeconds(remainingExtension);
        setPhase('Extension');
        return;
      }

      // ────────────────────────────────────────────────────────────────────
      // PHASE 1: Base Time Monitoring (Normal / Warning)
      //
      // Shows elapsed time counting up. Switches to "Warning" phase when
      // 5 minutes or less remain in the base duration.
      // When base time is exceeded, switches to "Extension" phase to prompt
      // the doctor with "End Call" or "Extend" options.
      // ────────────────────────────────────────────────────────────────────
      const elapsedMs = now - startTime;
      const remainingBase = Math.floor((standardDurationMs - elapsedMs) / 1000);
      
      if (remainingBase > 0) {
        setRemainingSeconds(remainingBase);
        setPhase(remainingBase <= 5 * 60 ? 'Warning' : 'Normal');
      } else {
        // Base time exceeded — entering extension prompt mode
        setRemainingSeconds(0);
        setPhase('Extension');
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerConfig]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Use server-provided maxExtensionMinutes, fallback to frontend config constant
  const effectiveMaxExtensionMinutes = timerConfig?.maxExtensionMinutes ?? MAX_EXTENSION_MINUTES;

  return {
    elapsedSeconds,
    remainingSeconds,
    formattedElapsed: formatTime(elapsedSeconds),
    formattedRemaining: formatTime(remainingSeconds),
    phase,
    isWarningPhase: phase === 'Warning',
    isWrapUpPhase: phase === 'WrapUp',
    // Client-side backup: auto-disconnect when wrap-up reaches 0.
    // Primary disconnect is server-driven via force_end_call.
    shouldAutoDisconnect: phase === 'WrapUp' && remainingSeconds <= 0 && wrapUpStartedRef.current,
    startWrapUpCountdown,
    triggerWrapUpPhase,
    extendCall,
    handleExtensionGranted,
    handleExtensionDeadlineUpdated,
    isExtended,
    isBaseTimeExceeded: phase === 'Extension',
    isConstrainedByNextPatient,
    extensionDeadlineMs,
    /** The configurable max extension value for UI display ("Extend Xm") */
    maxExtensionMinutes: effectiveMaxExtensionMinutes,
  };
}
