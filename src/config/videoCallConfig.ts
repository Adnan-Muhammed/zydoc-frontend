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
 * The strict, non-reversible countdown (in seconds) before forced disconnection.
 * UI turns RED during this phase. Once started, it CANNOT be cancelled.
 *
 * Current value: 60 seconds (1 minute)
 */
export const WRAP_UP_COUNTDOWN_SECONDS = 60;

/**
 * DEFAULT_BASE_DURATION_MINUTES
 * ─────────────────────────────
 * Fallback base duration if the server doesn't provide baseDurationMinutes.
 *
 * Current value: 10 minutes
 */
export const DEFAULT_BASE_DURATION_MINUTES = 10;
