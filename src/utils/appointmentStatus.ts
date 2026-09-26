export type UserRole = 'patient' | 'doctor' | 'admin';

export interface StatusConfig {
  label: string;
  badgeClass: string;
}

/**
 * Returns role-specific labels and badge styling for appointment statuses.
 *
 * Rules:
 * - Patient: 'no-show' -> 'Missed Appointment' (bg-rose-50 text-rose-700 border border-rose-200)
 * - Doctor:  'no-show' -> 'Patient No-Show' (bg-amber-50 text-amber-700 border border-amber-200)
 * - Admin:   'no-show' -> 'No-Show' (bg-amber-50 text-amber-700 border border-amber-200)
 */
export function getAppointmentStatusConfig(status?: string | null, role: UserRole = 'patient'): StatusConfig {
  const normalized = (status || '').toLowerCase().trim();

  switch (normalized) {
    case 'no-show':
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
      return {
        label: 'Completed',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };

    case 'cancelled':
      if (role === 'patient') {
        return {
          label: 'Cancelled (Refunded to Wallet)',
          badgeClass: 'bg-red-50 text-red-700 border border-red-200',
        };
      }
      return {
        label: 'Cancelled',
        badgeClass: 'bg-red-50 text-red-700 border border-red-200',
      };

    case 'doctor_missed':
      if (role === 'patient') {
        return {
          label: 'Doctor Missed (Refunded to Wallet)',
          badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      }
      if (role === 'doctor') {
        return {
          label: 'Missed Consultation',
          badgeClass: 'bg-red-50 text-red-700 border border-red-200',
        };
      }
      return {
        label: 'Doctor Missed (Refunded)',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
      };

    case 'cancelled_by_doctor':
      if (role === 'patient') {
        return {
          label: 'Cancelled by Doctor (Refunded to Wallet)',
          badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      }
      if (role === 'doctor') {
        return {
          label: 'Cancelled by Doctor',
          badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        };
      }
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
      if (role === 'patient') {
        return {
          label: 'Dispute Approved (Refunded to Wallet)',
          badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
        };
      }
      return {
        label: 'Refunded',
        badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
      };

    case 'scheduled':
      return {
        label: 'Scheduled',
        badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
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

    default:
      if (!status) {
        return {
          label: 'Scheduled',
          badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
        };
      }
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
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

  const terminalStatuses = [
    'completed',
    'no-show',
    'cancelled',
    'cancelled_by_doctor',
    'doctor_missed',
    'disputed',
    'refunded',
  ];

  const status = (app.status || '').toLowerCase().trim();
  if (terminalStatuses.includes(status)) {
    return false;
  }

  const endMs = getAppointmentEndTimestamp(app);
  if (endMs === 0) return false;

  // Moves to past once scheduledEndAt has passed
  return Date.now() <= endMs;
}

