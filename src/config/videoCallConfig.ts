// src/config/videoCallConfig.ts
//
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                                                                             ║
// ║   VIDEO CALL TIMING CONFIGURATION — SINGLE SOURCE OF TRUTH (FRONTEND)       ║
// ║                                                                             ║
// ║   These constants MUST stay in sync with the backend config file:            ║
// ║   zydoc-backend/src/config/videoCallConfig.js                                ║
// ║                                                                             ║
// ║   ⚠️  If you change any value here, also update the backend file above.     ║
// ║                                                                             ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * EARLY_JOIN_MINUTES
 * ──────────────────
 * The earliest boundary (in minutes before ScheduledStartAt) at which
 * a patient is permitted to enter the waiting room.
 *
 * Current value: 10 minutes
 */
export const EARLY_JOIN_MINUTES = 10;

/**
 * EARLY_START_MINUTES
 * ───────────────────
 * The earliest boundary (in minutes before ScheduledStartAt) at which
 * the live consultation call can be initiated (EarlyStartAt = ScheduledStartAt - 7 min).
 *
 * Current value: 7 minutes
 */
export const EARLY_START_MINUTES = 7;

/**
 * MAX_EXTENSION_MINUTES
 * ─────────────────────
 * The MAXIMUM extra time (in minutes) a doctor can extend a call AFTER the
 * base duration ends. Used for UI label display ("Extend 10m") and as a
 * client-side safety check.
 *
 * ⭐ TO CHANGE: Update the number below (e.g., 10 → 15) AND update
 *    the matching backend file: zydoc-backend/src/config/videoCallConfig.js
 *
 * Current value: 10 minutes
 */
export const MAX_EXTENSION_MINUTES = 10;

/**
 * WRAP_UP_COUNTDOWN_SECONDS
 * ─────────────────────────
 * The strict, non-reversible auto-cut countdown (in seconds) before forced disconnection
 * when Patient B goes live or at hard limit.
 * UI turns RED during this phase. Once started, it CANNOT be cancelled.
 *
 * Current value: 20 seconds (Rule 2 auto-cut standard)
 */
export const WRAP_UP_COUNTDOWN_SECONDS = 20;

/**
 * DEFAULT_BASE_DURATION_MINUTES
 * ─────────────────────────────
 * Fallback base duration if the server doesn't provide baseDurationMinutes.
 *
 * Current value: 10 minutes
 */
export const DEFAULT_BASE_DURATION_MINUTES = 10;

/**
 * MIN_CONSULTATION_DURATION_SECONDS
 * ─────────────────────────────────
 * Minimum required active consultation time (in seconds) before the doctor
 * is permitted to conclude the consultation (Rule 4).
 *
 * Current value: 180 seconds (3 minutes)
 */
export const MIN_CONSULTATION_DURATION_SECONDS = 180;

/**
 * RECONNECTION_GRACE_SECONDS
 * ──────────────────────────
 * Grace period (in seconds) buffered upon socket disconnect to allow participants
 * to seamlessly re-establish WebRTC without room tear-down (Rule 6).
 *
 * Current value: 30 seconds
 */
export const RECONNECTION_GRACE_SECONDS = 30;
