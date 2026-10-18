import { isTerminalStatus, getAuthoritativeRefundStatus } from './appointmentTiming';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface StatusConfig {
  label: string;
  badgeClass: string;
}

export { isTerminalStatus, getAuthoritativeRefundStatus };

/**
 * Returns role-specific labels and badge styling for appointment statuses.
 *
 * Rules:
 * - Patient: 'no-show' -> 'Missed Appointment' (bg-rose-50 text-rose-700 border border-rose-200)
 * - Doctor:  'no-show' -> 'Patient No-Show' (bg-amber-50 text-amber-700 border border-amber-200)
 * - Admin:   'no-show' -> 'No-Show' (bg-amber-50 text-amber-700 border border-amber-200)
 */
export function getAppointmentStatusConfig(status?: string | null, role: UserRole = 'patient', app?: any): StatusConfig {
  const normalized = (status || '').toLowerCase().trim();

  // If full app object is passed and it has a pending manual review, reflect that authoritatively
  const refundUpper = (app?.refundState || app?.refundStatus || '').toUpperCase();
  const paymentUpper = (app?.paymentState || app?.paymentStatus || '').toUpperCase();
  const statusUpper = (app?.status || status || '').toUpperCase();
  const isDoctorNoShow = statusUpper === 'DOCTOR_NO_SHOW' || statusUpper === 'DOCTOR_MISSED';

  if (app && (
    refundUpper === 'PENDING_REVIEW' ||
    refundUpper === 'MANUAL_REVIEW' ||
    paymentUpper === 'MANUAL_REVIEW' ||
    app.status === 'disputed' ||
    (isDoctorNoShow && refundUpper !== 'COMPLETED' && refundUpper !== 'SUCCEEDED' && paymentUpper !== 'REFUNDED' && statusUpper !== 'REFUNDED')
  )) {
    return {
      label: role === 'doctor'
        ? (isDoctorNoShow ? 'Missed Consultation (Under Review)' : 'Disputed / Under Review')
        : (isDoctorNoShow ? 'Doctor Missed (Under Review)' : 'Cancellation Under Review'),
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    };
  }

  switch (normalized) {
    case 'no-show':
    case 'patient_no_show':
      if (role === 'patient') {
        return {
          label: 'Missed Appointment',
          badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      }
      if (role === 'doctor') {
        return {
          label: 'Patient No-Show',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      }
      return {
        label: 'No-Show',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
      };

    case 'completed':
    case 'handover_ended':
      return {
        label: 'Completed',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };

    case 'cancelled':
      return {
        label: 'Cancelled',
        badgeClass: 'bg-red-50 text-red-700 border border-red-200',
      };

    case 'doctor_missed':
    case 'doctor_no_show':
      if (role === 'doctor') {
        return {
          label: 'Missed Consultation',
          badgeClass: 'bg-red-50 text-red-700 border border-red-200',
        };
      }
      return {
        label: 'Doctor Missed',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
      };

    case 'cancelled_by_doctor':
      return {
        label: 'Cancelled by Doctor',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
      };

    case 'disputed':
      if (role === 'patient') {
        return {
          label: 'Dispute Under Review',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      }
      if (role === 'doctor') {
        return {
          label: 'Disputed by Patient',
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        };
      }
      return {
        label: 'Dispute Pending',
        badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
      };

    case 'refunded':
      return {
        label: role === 'patient' ? 'Refunded' : 'Refunded',
        badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
      };

    case 'scheduled':
    case 'confirmed':
      return {
        label: 'Scheduled',
        badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
      };

    case 'waiting':
      return {
        label: 'In Waiting Room',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
      };

    case 'active':
    case 'in_progress':
      return {
        label: 'In Consultation',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };

    case 'time reached':
      return {
        label: 'Time Reached',
        badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200',
      };

    case 'patient joined':
      return {
        label: 'Patient Joined',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };

    case 'patient disconnected':
      return {
        label: 'Patient Ended Call',
        badgeClass: 'bg-red-50 text-red-700 border border-red-200',
      };

    case 'system_terminated':
      return {
        label: 'System Terminated',
        badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      };

    default:
      if (!status) {
        return {
          label: 'Scheduled',
          badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
        };
      }
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
        badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      };
  }
}

/**
 * Parses appointment date and time to return the exact start timestamp in ms.
 */
export function getAppointmentStartTimestamp(app: any): number {
  if (!app) return 0;
  if (app.scheduledStartAt) {
    const t = new Date(app.scheduledStartAt).getTime();
    if (!isNaN(t)) return t;
  }

  if (!app.appointmentDate) return 0;
  const appDate = new Date(app.appointmentDate);
  if (isNaN(appDate.getTime())) return 0;

  if (!app.appointmentTime) return appDate.getTime();

  const match = String(app.appointmentTime).trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return appDate.getTime();

  let [, hStr, mStr, modifier] = match;
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10) || 0;

  if (modifier) {
    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }

  const dateStr = typeof app.appointmentDate === 'string' ? app.appointmentDate : appDate.toISOString();
  const [y, m, d] = dateStr.split('T')[0].split(/[-/]/).map(Number);

  return new Date(
    y,
    m - 1,
    d,
    hours,
    minutes,
    0,
    0
  ).getTime();
}

/**
 * Returns the exact scheduled or inferred end timestamp in ms.
 */
export function getAppointmentEndTimestamp(app: any): number {
  if (!app) return 0;
  if (app.scheduledEndAt) {
    const t = new Date(app.scheduledEndAt).getTime();
    if (!isNaN(t)) return t;
  }

  const startMs = getAppointmentStartTimestamp(app);
  if (startMs === 0) return 0;

  const durationMins = Number(app?.slotDuration) || Number(app?.doctorId?.slotDuration) || 15;
  return startMs + durationMins * 60000;
}

/**
 * Returns true if the appointment is active, in-progress, or upcoming.
 * Returns false if the appointment is in a terminal status or its scheduled time + grace period has passed.
 */
export function isAppointmentUpcomingOrActive(app: any): boolean {
  if (!app) return false;

  const status = (app.status || '').trim();
  if (isTerminalStatus(status)) {
    return false;
  }

  const endMs = getAppointmentEndTimestamp(app);
  if (endMs === 0) return false;

  // Moves to past once scheduledEndAt has passed
  return Date.now() <= endMs;
}


