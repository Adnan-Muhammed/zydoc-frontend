// src/utils/appointmentTiming.ts
/**
 * Canonical Appointment Timing & Lifecycle Policy (Frontend Single Source of Truth)
 * Aligns strictly with Master Specification (TIMING_POLICY_V1) & Backend timingPolicy.js.
 * All calculations use exact milliseconds with pure functions.
 */

export const SUPPORTED_DURATIONS: readonly number[] = Object.freeze([10, 15, 20, 25, 30, 45]);

export const TERMINAL_STATUSES: ReadonlySet<string> = Object.freeze(new Set([
  'completed',
  'handover_ended',
  'interrupted',
  'failed_not_started',
  'patient_no_show',
  'no-show',
  'doctor_no_show',
  'doctor_missed',
  'unresolved_not_started',
  'cancelled',
  'cancelled_by_doctor',
  'cancelled_by_admin',
  'disputed',
  'refunded',
  'booking_failed',
  'system_terminated',
]));

export interface TimingBoundaries {
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  earlyJoinAt: Date;     // Patient early entry: T - 10 minutes (600s)
  earlyStartAt: Date;    // Doctor early start: T - 7 minutes (420s)
  lastJoinAt: Date;      // Initial join cutoff: T + min(Duration * 15s, 600s)
  lastBookingAt: Date;   // Booking cutoff: T - 3 minutes (180s)
  lateJoinGraceMs: number;
  lateJoinGraceSeconds: number;
  unconstrainedExtensionDeadlineAt: Date;
}

export function isSupportedDuration(durationMinutes: number): boolean {
  return SUPPORTED_DURATIONS.includes(Number(durationMinutes));
}

/**
 * Computes canonical timing boundaries for an appointment.
 * @param scheduledStartAt Date, ISO string, or timestamp of scheduled start
 * @param durationMinutes Slot duration in minutes (10, 15, 20, 25, 30, 45)
 */
export function computeTimings(
  scheduledStartAt: Date | number | string,
  durationMinutes: number = 15
): TimingBoundaries {
  const dur = Number(durationMinutes) || 15;
  const startMs = new Date(scheduledStartAt).getTime();
  if (isNaN(startMs)) {
    throw new Error('Invalid scheduledStartAt Date');
  }

  // Formula: LateJoinGraceSeconds = min(DurationMinutes * 60 * 0.25, 600)
  const lateJoinGraceMs = Math.min(dur * 60 * 1000 * 0.25, 600 * 1000);

  const scheduledStart = new Date(startMs);
  const scheduledEnd = new Date(startMs + dur * 60 * 1000);
  const earlyJoinAt = new Date(startMs - 600 * 1000);      // T - 10m
  const earlyStartAt = new Date(startMs - 420 * 1000);     // T - 7m
  const lastJoinAt = new Date(startMs + lateJoinGraceMs);  // T + min(dur * 15s, 600s)
  const lastBookingAt = new Date(startMs - 180 * 1000);    // T - 3m
  const unconstrainedExtensionDeadlineAt = new Date(scheduledEnd.getTime() + 600 * 1000); // T_end + 10m

  return {
    scheduledStartAt: scheduledStart,
    scheduledEndAt: scheduledEnd,
    earlyJoinAt,
    earlyStartAt,
    lastJoinAt,
    lastBookingAt,
    lateJoinGraceMs,
    lateJoinGraceSeconds: lateJoinGraceMs / 1000,
    unconstrainedExtensionDeadlineAt,
  };
}

/**
 * Checks whether an initial join is allowed at the given time.
 * - Patient: opens at EarlyJoinAt (inclusive), closes at LastJoinAt (exclusive).
 * - Doctor: opens at EarlyStartAt (inclusive), closes at LastJoinAt (exclusive).
 */
export function canInitialJoin(
  role: 'doctor' | 'patient' | string,
  timings: TimingBoundaries,
  now: Date | number = Date.now()
): boolean {
  const nowMs = typeof now === 'number' ? now : now.getTime();
  const normalizedRole = role.toLowerCase();
  const openMs = normalizedRole === 'doctor'
    ? timings.earlyStartAt.getTime()
    : timings.earlyJoinAt.getTime();
  const closeMs = timings.lastJoinAt.getTime();

  return nowMs >= openMs && nowMs < closeMs;
}

/**
 * Checks whether rejoining an active ongoing consultation is permitted.
 * If the consultation has started, both doctor and patient retain rejoin access
 * until the Scheduled End Time or effective extension deadline.
 */
export function canRejoin(
  appointment: any,
  timings: TimingBoundaries,
  now: Date | number = Date.now()
): boolean {
  const nowMs = typeof now === 'number' ? now : now.getTime();
  const hasStarted = Boolean(
    appointment?.actualStartAt ||
    appointment?.hasOverlapped ||
    appointment?.sessionStartedAt ||
    (appointment?.doctorJoinedAt && appointment?.patientJoinedAt)
  );

  if (!hasStarted) return false;

  const maxAllowedRejoinMs = appointment?.effectiveExtensionDeadlineAt
    ? new Date(appointment.effectiveExtensionDeadlineAt).getTime()
    : (appointment?.durationEndAt ? new Date(appointment.durationEndAt).getTime() : timings.scheduledEndAt.getTime());

  return nowMs < maxAllowedRejoinMs;
}

/**
 * Checks whether an appointment can be booked at the given time.
 * Closes at LastBookingAt (T - 3m).
 */
export function canBook(
  scheduledStartAt: Date | number | string,
  now: Date | number = Date.now()
): boolean {
  const startMs = new Date(scheduledStartAt).getTime();
  if (isNaN(startMs)) return false;
  const nowMs = typeof now === 'number' ? now : now.getTime();
  const lastBookingMs = startMs - 180 * 1000; // T - 3m
  return nowMs < lastBookingMs;
}

/**
 * Computes DurationEndAt at consultation start (§5.8).
 * - Early start (actual < scheduled): full booked duration from actual start
 * - On-time start (actual == scheduled): ends at scheduledEndAt
 * - Late start (actual > scheduled): min(actualStart + duration, scheduledEndAt)
 */
export function computeDurationEndAt(
  actualStartAt: Date | number | string,
  scheduledStartAt?: Date | number | string,
  durationMinutes: number = 15
): Date {
  // Support flexible 2-argument call: computeDurationEndAt(actualStartAt, durationMinutes)
  let sched = scheduledStartAt;
  let dur = durationMinutes;
  if (typeof scheduledStartAt === 'number' && arguments.length === 2) {
    dur = scheduledStartAt;
    sched = actualStartAt;
  } else if (!sched) {
    sched = actualStartAt;
  }

  const a = new Date(actualStartAt).getTime();
  const s = new Date(sched).getTime();
  const durMs = Number(dur) * 60 * 1000;
  const e = s + durMs;

  if (a < s) {
    return new Date(a + durMs);
  }
  if (a === s) {
    return new Date(e);
  }
  return new Date(Math.min(a + durMs, e));
}

/**
 * Computes timestamp after which doctor manual End Call is permitted (180s from actualStartAt).
 */
export function computeManualEndAllowedAt(actualStartAt: Date | number | string): Date {
  const a = new Date(actualStartAt).getTime();
  return new Date(a + 180 * 1000);
}

/**
 * Checks whether a session status is terminal. Rejoining must be prevented.
 */
export function isTerminalStatus(status?: string | null): boolean {
  if (!status) return false;
  return TERMINAL_STATUSES.has(status.toLowerCase().trim());
}

/**
 * Authoritative Refund & Cancellation Status Formatter.
 * Reflects actual backend state without falsely claiming refunds.
 */
export interface AuthoritativeRefundState {
  badgeLabel: string;
  badgeClass: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NONE';
  description: string;
}

export function getAuthoritativeRefundStatus(app: any): AuthoritativeRefundState {
  if (!app) {
    return {
      badgeLabel: 'None',
      badgeClass: 'bg-slate-100 text-slate-500',
      status: 'NONE',
      description: 'No refund associated with this appointment.'
    };
  }

  const rawRefund = (app.refundStatus || app.refundState || app.refundRecord?.status || '').toUpperCase();
  const rawPayment = (app.paymentState || app.paymentStatus || '').toLowerCase();
  const rawStatus = (app.status || '').toUpperCase();
  const isDoctorNoShow = rawStatus === 'DOCTOR_NO_SHOW' || rawStatus === 'DOCTOR_MISSED';

  const isReviewRequired = Boolean(
    app.manualReviewRequired ||
    app.refundReviewRequired ||
    rawRefund === 'PENDING_REVIEW' ||
    rawRefund === 'MANUAL_REVIEW' ||
    rawPayment === 'manual_review' ||
    app.status === 'disputed' ||
    (isDoctorNoShow && rawRefund !== 'COMPLETED' && rawRefund !== 'SUCCEEDED' && rawPayment !== 'refunded' && rawStatus !== 'REFUNDED')
  );

  // 1. Manual Review states
  if (isReviewRequired) {
    return {
      badgeLabel: isDoctorNoShow ? 'Doctor Missed (Under Review)' : 'Under Manual Review',
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
      status: 'PENDING_REVIEW',
      description: isDoctorNoShow
        ? 'The doctor did not attend the scheduled consultation. Your appointment has been routed for administrative review and refund processing.'
        : 'Cancellation / refund is pending manual administrative review. No funds have been disbursed yet.'
    };
  }

  // 2. Processing
  if (rawRefund === 'PROCESSING') {
    return {
      badgeLabel: 'Refund Processing',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
      status: 'PROCESSING',
      description: 'Refund has been initiated and is being processed by the payment provider.'
    };
  }

  // 3. Approved
  if (rawRefund === 'APPROVED') {
    return {
      badgeLabel: 'Refund Approved',
      badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      status: 'APPROVED',
      description: 'Refund has been approved and queued for payout processing.'
    };
  }

  // 4. Completed / Succeeded
  if (
    rawRefund === 'COMPLETED' ||
    rawRefund === 'SUCCEEDED' ||
    rawPayment === 'refunded' ||
    app.status === 'refunded'
  ) {
    return {
      badgeLabel: 'Refunded',
      badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
      status: 'COMPLETED',
      description: 'Refund has been confirmed and credited.'
    };
  }

  // 5. Failed
  if (rawRefund === 'FAILED') {
    return {
      badgeLabel: 'Refund Failed',
      badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
      status: 'FAILED',
      description: 'Refund attempt failed. Please contact support or request review.'
    };
  }

  // 6. Cancelled without confirmed refund
  if (app.status === 'cancelled' || app.status === 'cancelled_by_doctor' || app.status === 'doctor_missed') {
    return {
      badgeLabel: 'Cancelled',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      status: 'NONE',
      description: 'Appointment cancelled. No refund transaction confirmed.'
    };
  }

  return {
    badgeLabel: 'None',
    badgeClass: 'bg-slate-100 text-slate-500',
    status: 'NONE',
    description: 'No refund applicable.'
  };
}
