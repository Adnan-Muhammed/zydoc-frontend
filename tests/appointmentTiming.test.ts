/**
 * appointmentTiming.test.ts
 *
 * Comprehensive test suite validating:
 * 1. Supported appointment durations [10, 15, 20, 25, 30, 45]
 * 2. Timing boundaries: booking cutoff (T-3m), patient early entry (T-10m),
 *    doctor early start (T-7m), initial join cutoff (T + min(D * 15s, 600s))
 * 3. Initial join permissions for patient and doctor
 * 4. Active consultation rejoin rules and expiry boundaries
 * 5. Booking cutoff (T-3m)
 * 6. Doctor 3-minute lock calculation (computeManualEndAllowedAt)
 * 7. Duration end calculation (computeDurationEndAt)
 * 8. Terminal consultation statuses (isTerminalStatus)
 * 9. Authoritative refund status mapping (getAuthoritativeRefundStatus)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_DURATIONS,
  isSupportedDuration,
  computeTimings,
  canInitialJoin,
  canRejoin,
  canBook,
  computeDurationEndAt,
  computeManualEndAllowedAt,
  isTerminalStatus,
  getAuthoritativeRefundStatus,
} from '../src/utils/appointmentTiming.js';

describe('Appointment Timing & Lifecycle Specification Tests', () => {
  // ── 1. Supported Durations ──────────────────────────────────────────────
  describe('1. Supported Durations', () => {
    test('defines exact supported duration values: 10, 15, 20, 25, 30, 45 minutes', () => {
      assert.deepEqual(SUPPORTED_DURATIONS, [10, 15, 20, 25, 30, 45]);
    });

    test('validates supported durations and rejects invalid values', () => {
      for (const d of [10, 15, 20, 25, 30, 45]) {
        assert.equal(isSupportedDuration(d), true, `Duration ${d} should be supported`);
      }
      for (const d of [5, 7, 12, 18, 40, 50, 60, 90]) {
        assert.equal(isSupportedDuration(d), false, `Duration ${d} should not be supported`);
      }
    });
  });

  // ── 2. Timing Boundaries & Graces ───────────────────────────────────────
  describe('2. Timing Boundaries (computeTimings)', () => {
    const baseDate = new Date('2026-09-15T10:00:00.000Z');
    const baseMs = baseDate.getTime();

    test('10-minute slot: grace is 150s (2.5m), lastJoin is T + 2.5m', () => {
      const timings = computeTimings(baseDate, 10);
      assert.equal(timings.scheduledStartAt.getTime(), baseMs);
      assert.equal(timings.scheduledEndAt.getTime(), baseMs + 10 * 60 * 1000);
      assert.equal(timings.earlyJoinAt.getTime(), baseMs - 10 * 60 * 1000); // T - 10m
      assert.equal(timings.earlyStartAt.getTime(), baseMs - 7 * 60 * 1000);  // T - 7m
      assert.equal(timings.lastBookingAt.getTime(), baseMs - 3 * 60 * 1000); // T - 3m
      assert.equal(timings.lateJoinGraceSeconds, 150); // 10 * 15s = 150s = 2.5m
      assert.equal(timings.lastJoinAt.getTime(), baseMs + 150 * 1000);
    });

    test('15-minute slot: grace is 225s (3.75m), lastJoin is T + 3.75m', () => {
      const timings = computeTimings(baseDate, 15);
      assert.equal(timings.lateJoinGraceSeconds, 225); // 15 * 15s = 225s
      assert.equal(timings.lastJoinAt.getTime(), baseMs + 225 * 1000);
      assert.equal(timings.earlyJoinAt.getTime(), baseMs - 600 * 1000);
      assert.equal(timings.earlyStartAt.getTime(), baseMs - 420 * 1000);
    });

    test('20-minute slot: grace is 300s (5m), lastJoin is T + 5m', () => {
      const timings = computeTimings(baseDate, 20);
      assert.equal(timings.lateJoinGraceSeconds, 300);
      assert.equal(timings.lastJoinAt.getTime(), baseMs + 300 * 1000);
    });

    test('25-minute slot: grace is 375s (6.25m), lastJoin is T + 6.25m', () => {
      const timings = computeTimings(baseDate, 25);
      assert.equal(timings.lateJoinGraceSeconds, 375);
      assert.equal(timings.lastJoinAt.getTime(), baseMs + 375 * 1000);
    });

    test('30-minute slot: grace is 450s (7.5m), lastJoin is T + 7.5m', () => {
      const timings = computeTimings(baseDate, 30);
      assert.equal(timings.lateJoinGraceSeconds, 450);
      assert.equal(timings.lastJoinAt.getTime(), baseMs + 450 * 1000);
    });

    test('45-minute slot: grace is capped at 600s (10m), lastJoin is T + 10m', () => {
      const timings = computeTimings(baseDate, 45);
      assert.equal(timings.lateJoinGraceSeconds, 600); // 45 * 15s = 675s -> capped at 600s
      assert.equal(timings.lastJoinAt.getTime(), baseMs + 600 * 1000);
    });
  });

  // ── 3. Initial Join Eligibility ─────────────────────────────────────────
  describe('3. Initial Join Eligibility (canInitialJoin)', () => {
    const baseDate = new Date('2026-09-15T10:00:00.000Z');
    const baseMs = baseDate.getTime();
    const timings = computeTimings(baseDate, 15); // grace = 225s (3m 45s)

    test('Patient: blocked before T-10m', () => {
      assert.equal(canInitialJoin('patient', timings, baseMs - 601 * 1000), false);
    });

    test('Patient: allowed at and after T-10m', () => {
      assert.equal(canInitialJoin('patient', timings, baseMs - 600 * 1000), true);
      assert.equal(canInitialJoin('patient', timings, baseMs - 300 * 1000), true);
      assert.equal(canInitialJoin('patient', timings, baseMs), true);
      assert.equal(canInitialJoin('patient', timings, baseMs + 224 * 1000), true);
    });

    test('Patient: blocked at or after LastJoinAt (T + 225s)', () => {
      assert.equal(canInitialJoin('patient', timings, baseMs + 225 * 1000), false);
      assert.equal(canInitialJoin('patient', timings, baseMs + 300 * 1000), false);
    });

    test('Doctor: blocked before T-7m', () => {
      assert.equal(canInitialJoin('doctor', timings, baseMs - 421 * 1000), false);
    });

    test('Doctor: allowed at and after T-7m', () => {
      assert.equal(canInitialJoin('doctor', timings, baseMs - 420 * 1000), true);
      assert.equal(canInitialJoin('doctor', timings, baseMs - 120 * 1000), true);
      assert.equal(canInitialJoin('doctor', timings, baseMs), true);
      assert.equal(canInitialJoin('doctor', timings, baseMs + 224 * 1000), true);
    });

    test('Doctor: blocked at or after LastJoinAt (T + 225s)', () => {
      assert.equal(canInitialJoin('doctor', timings, baseMs + 225 * 1000), false);
    });
  });

  // ── 4. Active Consultation Re-join ─────────────────────────────────────
  describe('4. Active Consultation Re-join (canRejoin)', () => {
    const baseDate = new Date('2026-09-15T10:00:00.000Z');
    const baseMs = baseDate.getTime();
    const timings = computeTimings(baseDate, 15); // end = baseMs + 15m

    test('returns false if consultation never started', () => {
      const app = { actualStartAt: null, sessionStartedAt: null };
      assert.equal(canRejoin(app, timings, baseMs + 300 * 1000), false);
    });

    test('returns true if consultation started and currently before Scheduled End', () => {
      const app = { actualStartAt: '2026-09-15T10:01:00.000Z' };
      // 10 minutes past start, which is past initial join grace (3.75m), but consultation is active!
      assert.equal(canRejoin(app, timings, baseMs + 10 * 60 * 1000), true);
    });

    test('returns false if consultation started but now is past Scheduled End', () => {
      const app = { actualStartAt: '2026-09-15T10:01:00.000Z' };
      assert.equal(canRejoin(app, timings, baseMs + 16 * 60 * 1000), false);
    });

    test('returns true if extension deadline extends past scheduled end', () => {
      const app = {
        actualStartAt: '2026-09-15T10:01:00.000Z',
        effectiveExtensionDeadlineAt: new Date(baseMs + 20 * 60 * 1000).toISOString(),
      };
      // At 17m (past 15m scheduled end), extension is active until 20m
      assert.equal(canRejoin(app, timings, baseMs + 17 * 60 * 1000), true);
      // At 21m, extension deadline has expired
      assert.equal(canRejoin(app, timings, baseMs + 21 * 60 * 1000), false);
    });
  });

  // ── 5. Booking Cutoff ───────────────────────────────────────────────────
  describe('5. Booking Cutoff (canBook)', () => {
    const start = new Date('2026-09-15T10:00:00.000Z');
    const startMs = start.getTime();

    test('allows booking earlier than T - 3 minutes', () => {
      assert.equal(canBook(start, startMs - 181 * 1000), true);
      assert.equal(canBook(start, startMs - 600 * 1000), true);
    });

    test('blocks booking within 3 minutes of scheduled start (T - 3m to T)', () => {
      assert.equal(canBook(start, startMs - 180 * 1000), false);
      assert.equal(canBook(start, startMs - 60 * 1000), false);
    });

    test('blocks booking after scheduled start', () => {
      assert.equal(canBook(start, startMs + 1000), false);
    });
  });

  // ── 6. Duration & Manual End Calculations ──────────────────────────────
  describe('6. Duration & Manual End Calculations', () => {
    const actualStart = new Date('2026-09-15T10:02:00.000Z');
    const actualStartMs = actualStart.getTime();

    test('computeDurationEndAt computes exact duration end from actual start', () => {
      const end15 = computeDurationEndAt(actualStart, 15);
      assert.equal(end15.getTime(), actualStartMs + 15 * 60 * 1000);

      const end30 = computeDurationEndAt(actualStart, 30);
      assert.equal(end30.getTime(), actualStartMs + 30 * 60 * 1000);
    });

    test('computeManualEndAllowedAt computes exact 180s (3-minute) lock timestamp', () => {
      const lockUntil = computeManualEndAllowedAt(actualStart);
      assert.equal(lockUntil.getTime(), actualStartMs + 180 * 1000);
    });
  });

  // ── 7. Terminal Statuses ────────────────────────────────────────────────
  describe('7. Terminal Statuses (isTerminalStatus)', () => {
    test('identifies all terminal lifecycle statuses', () => {
      const terminalList = [
        'completed',
        'no-show',
        'cancelled',
        'cancelled_by_doctor',
        'doctor_missed',
        'disputed',
        'refunded',
        'handover_ended',
        'system_terminated',
      ];
      for (const st of terminalList) {
        assert.equal(isTerminalStatus(st), true, `Status ${st} should be terminal`);
        assert.equal(isTerminalStatus(st.toUpperCase()), true, `Status ${st.toUpperCase()} should be terminal`);
      }
    });

    test('identifies non-terminal statuses', () => {
      const nonTerminal = ['scheduled', 'CONFIRMED', 'WAITING', 'in_progress', 'active', 'ready'];
      for (const st of nonTerminal) {
        assert.equal(isTerminalStatus(st), false, `Status ${st} should not be terminal`);
      }
    });
  });

  // ── 8. Authoritative Refund Status ──────────────────────────────────────
  describe('8. Authoritative Refund Status (getAuthoritativeRefundStatus)', () => {
    test('returns PENDING_REVIEW when disputed or refundReviewRequired', () => {
      const res1 = getAuthoritativeRefundStatus({ status: 'disputed' });
      assert.equal(res1.status, 'PENDING_REVIEW');
      assert.equal(res1.badgeLabel, 'Under Manual Review');

      const res2 = getAuthoritativeRefundStatus({ refundReviewRequired: true, status: 'cancelled' });
      assert.equal(res2.status, 'PENDING_REVIEW');
      assert.equal(res2.badgeLabel, 'Under Manual Review');

      const res3 = getAuthoritativeRefundStatus({ refundStatus: 'manual_review' });
      assert.equal(res3.status, 'PENDING_REVIEW');
      assert.equal(res3.badgeLabel, 'Under Manual Review');
    });

    test('returns PROCESSING when refundStatus is PROCESSING', () => {
      const res = getAuthoritativeRefundStatus({ refundStatus: 'PROCESSING' });
      assert.equal(res.status, 'PROCESSING');
      assert.equal(res.badgeLabel, 'Refund Processing');
    });

    test('returns APPROVED when refundStatus is APPROVED', () => {
      const res = getAuthoritativeRefundStatus({ refundStatus: 'APPROVED' });
      assert.equal(res.status, 'APPROVED');
      assert.equal(res.badgeLabel, 'Refund Approved');
    });

    test('returns COMPLETED only when confirmed by backend paymentStatus or refundStatus', () => {
      const res1 = getAuthoritativeRefundStatus({ paymentStatus: 'refunded' });
      assert.equal(res1.status, 'COMPLETED');
      assert.equal(res1.badgeLabel, 'Refunded');

      const res2 = getAuthoritativeRefundStatus({ refundStatus: 'SUCCEEDED' });
      assert.equal(res2.status, 'COMPLETED');
      assert.equal(res2.badgeLabel, 'Refunded');
    });

    test('returns FAILED when refund attempt failed', () => {
      const res = getAuthoritativeRefundStatus({ refundStatus: 'FAILED' });
      assert.equal(res.status, 'FAILED');
      assert.equal(res.badgeLabel, 'Refund Failed');
    });

    test('never falsely claims "Refunded" on cancelled appointment without confirmation', () => {
      const res = getAuthoritativeRefundStatus({ status: 'cancelled', paymentStatus: 'paid' });
      assert.notEqual(res.badgeLabel, 'Refunded');
      assert.equal(res.badgeLabel, 'Cancelled');
    });

    test('routes unresolved doctor no-show to administrative review with accurate copy', () => {
      const res1 = getAuthoritativeRefundStatus({ status: 'DOCTOR_NO_SHOW', refundState: 'PENDING_REVIEW' });
      assert.equal(res1.status, 'PENDING_REVIEW');
      assert.equal(res1.badgeLabel, 'Doctor Missed (Under Review)');
      assert.match(res1.description, /administrative review and refund processing/i);
      assert.doesNotMatch(res1.description, /has been credited/i);

      const res2 = getAuthoritativeRefundStatus({ status: 'doctor_missed', refundState: 'PENDING_REVIEW' });
      assert.equal(res2.status, 'PENDING_REVIEW');
      assert.equal(res2.badgeLabel, 'Doctor Missed (Under Review)');
      assert.match(res2.description, /administrative review and refund processing/i);
    });

    test('displays Refunded only when backend explicitly confirms completed refund on doctor no-show', () => {
      const res = getAuthoritativeRefundStatus({ status: 'DOCTOR_NO_SHOW', refundStatus: 'COMPLETED' });
      assert.equal(res.status, 'COMPLETED');
      assert.equal(res.badgeLabel, 'Refunded');
      assert.equal(res.description, 'Refund has been confirmed and credited.');
    });

    test('returns NONE for active scheduled appointments without refund workflow', () => {
      const res = getAuthoritativeRefundStatus({ status: 'scheduled', paymentStatus: 'paid' });
      assert.equal(res.status, 'NONE');
    });
  });
});
