// src/utils/scheduleValidator.ts

export interface TimeBlock {
    id: string;
    start: string;
    end: string;
    startTime?: string;
    endTime?: string;
    [key: string]: any;
}

export interface BlockAdjustmentSuggestion {
    roundDownTimeStr?: string; // e.g. "09:45"
    roundDownLabel?: string;   // e.g. "09:45 AM"
    roundDownDuration?: number; // 45
    roundUpTimeStr?: string;   // e.g. "10:00"
    roundUpLabel?: string;     // e.g. "10:00 AM"
    roundUpDuration?: number;   // 60
    fieldToAdjust?: 'start' | 'end';
}

export interface BlockValidationError {
    message: string;
    type?: 'overlap' | 'duration_too_short' | 'invalid_times' | 'duration_remainder' | 'grid_alignment' | 'gap_misalignment';
    suggestion?: BlockAdjustmentSuggestion;
}

export const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
};

export const parseTimeToMins = timeToMinutes;

export const minsToTimeStr = (totalMins: number): string => {
    const norm = (totalMins % (24 * 60) + 24 * 60) % (24 * 60);
    const h = Math.floor(norm / 60);
    const m = norm % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const formatMinsTo12H = (totalMins: number): string => {
    const norm = (totalMins % (24 * 60) + 24 * 60) % (24 * 60);
    let h = Math.floor(norm / 60);
    const m = norm % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

export const isValidGridAlignment = (timeInMins: number, slotDuration: number): boolean => {
    return timeInMins % slotDuration === 0;
};

export const snapToNearest5Mins = (timeStr: string): string => {
    if (!timeStr || !timeStr.includes(':')) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    let roundedM = Math.round(m / 5) * 5;
    let finalH = h;
    if (roundedM >= 60) {
        finalH = (finalH + 1) % 24;
        roundedM = 0;
    }
    return `${String(finalH).padStart(2, '0')}:${String(roundedM).padStart(2, '0')}`;
};

/**
 * Validates daily shifts for both Online and Offline channels according to the rules:
 * 1. Strict Grid Alignment on start and end times.
 * 2. Mixed Shifts (Online & Offline shifts can overlap partially or fully).
 * 3. Shifts of the same type cannot overlap.
 * 4. Inter-shift gaps must align with slotDuration.
 * 
 * Returns map of block.id -> BlockValidationError
 */
export const validateDailyShifts = (
    onlineShifts: TimeBlock[] = [],
    offlineShifts: TimeBlock[] = [],
    slotDuration: number = 15
): Record<string, BlockValidationError> => {
    const errors: Record<string, BlockValidationError> = {};

    const clean = (b: TimeBlock, type: 'online' | 'offline') => {
        const startStr = b.start || b.startTime || '';
        const endStr = b.end || b.endTime || '';
        return {
            id: b.id,
            type,
            startStr,
            endStr,
            startMins: timeToMinutes(startStr),
            endMins: timeToMinutes(endStr),
            raw: b
        };
    };

    const validOnline = onlineShifts.filter(b => b && (b.start || b.startTime) && (b.end || b.endTime)).map(b => clean(b, 'online'));
    const validOffline = offlineShifts.filter(b => b && (b.start || b.startTime) && (b.end || b.endTime)).map(b => clean(b, 'offline'));

    const allShifts = [...validOnline, ...validOffline].sort((a, b) => a.startMins - b.startMins || a.endMins - b.endMins);

    // 1. Validate individual shift boundaries & total duration alignment
    for (const shift of allShifts) {
        if (shift.endMins <= shift.startMins) {
            errors[shift.id] = {
                message: `Shift end time must be after start time.`,
                type: 'invalid_times'
            };
            continue;
        }

        // Rule 1: Absolute 5-Minute Rule (start and end must be multiples of 5 mins)
        if (shift.startMins % 5 !== 0 || shift.endMins % 5 !== 0) {
            errors[shift.id] = {
                message: `Shift start and end times must be rounded to the nearest 5 minutes.`,
                type: 'invalid_times'
            };
            continue;
        }

        const duration = shift.endMins - shift.startMins;

        // Minimum duration check
        if (duration < slotDuration) {
            const roundUpEndMins = shift.startMins + slotDuration;
            errors[shift.id] = {
                message: `Shift duration (${duration}m) must be at least slot duration (${slotDuration}m).`,
                type: 'duration_too_short',
                suggestion: {
                    roundUpTimeStr: minsToTimeStr(roundUpEndMins),
                    roundUpLabel: formatMinsTo12H(roundUpEndMins),
                    roundUpDuration: slotDuration,
                    fieldToAdjust: 'end'
                }
            };
            continue;
        }

        // Rule 2: Total Duration Remainder Rule (duration must be an exact multiple of slotDuration)
        if (duration % slotDuration !== 0) {
            const rem = duration % slotDuration;
            const roundDownEnd = shift.endMins - rem;
            const roundUpEnd = roundDownEnd + slotDuration;

            const suggestion: BlockAdjustmentSuggestion = {
                roundUpTimeStr: minsToTimeStr(roundUpEnd),
                roundUpLabel: formatMinsTo12H(roundUpEnd),
                roundUpDuration: roundUpEnd - shift.startMins,
                fieldToAdjust: 'end'
            };

            if (roundDownEnd - shift.startMins >= slotDuration) {
                suggestion.roundDownTimeStr = minsToTimeStr(roundDownEnd);
                suggestion.roundDownLabel = formatMinsTo12H(roundDownEnd);
                suggestion.roundDownDuration = roundDownEnd - shift.startMins;
            }

            errors[shift.id] = {
                message: `Shift duration (${duration}m) must be an exact multiple of the slot duration (${slotDuration}m).`,
                type: 'duration_remainder',
                suggestion
            };
            continue;
        }
    }

    // 2. Overlap Check between all shifts (Inter-shift gaps are free and do not need alignment)
    for (let i = 0; i < allShifts.length; i++) {
        const current = allShifts[i];

        for (let j = i + 1; j < allShifts.length; j++) {
            const next = allShifts[j];
            const isOverlapping = current.endMins > next.startMins;

            if (isOverlapping) {
                if (current.type === next.type) {
                    // Same type overlap
                    const channelLabel = current.type === 'online' ? 'Telehealth' : 'In-Person';
                    const errMsg = `Consecutive ${channelLabel} shifts cannot overlap (${current.startStr} - ${current.endStr}) and (${next.startStr} - ${next.endStr}).`;
                    if (!errors[current.id]) errors[current.id] = { message: errMsg, type: 'overlap' };
                    if (!errors[next.id]) errors[next.id] = { message: errMsg, type: 'overlap' };
                } else {
                    // Mixed shifts (Online & Offline overlap) - Relative Grid Alignment Check
                    const startDiff = Math.abs(current.startMins - next.startMins);
                    if (startDiff % slotDuration !== 0) {
                        const rem = startDiff % slotDuration;
                        const roundDownStart = next.startMins - rem;
                        const roundUpStart = roundDownStart + slotDuration;
                        const nextDuration = next.endMins - next.startMins;

                        const suggestion: BlockAdjustmentSuggestion = {
                            roundDownTimeStr: minsToTimeStr(roundDownStart),
                            roundDownLabel: formatMinsTo12H(roundDownStart),
                            roundDownDuration: nextDuration,
                            roundUpTimeStr: minsToTimeStr(roundUpStart),
                            roundUpLabel: formatMinsTo12H(roundUpStart),
                            roundUpDuration: nextDuration,
                            fieldToAdjust: 'start'
                        };

                        const currentLabel = current.type === 'online' ? 'Telehealth' : 'In-Person';
                        const nextLabel = next.type === 'online' ? 'Telehealth' : 'In-Person';

                        if (!errors[next.id]) {
                            errors[next.id] = {
                                message: `Overlapping ${nextLabel} shift (${next.startStr} - ${next.endStr}) must align with the ${slotDuration}-min grid of ${currentLabel} shift (${current.startStr} - ${current.endStr}).`,
                                type: 'grid_alignment',
                                suggestion
                            };
                        }
                    }
                }
            }
        }
    }

    return errors;
};

/**
 * Backward-compatible helper for single day channel blocks or full day blocks
 */
export const validateDayBlocks = (
    blocks: TimeBlock[], 
    slotDurationOrOfflineBlocks: number | TimeBlock[] = 15,
    slotDuration: number = 15
): Record<string, BlockValidationError> => {
    if (Array.isArray(slotDurationOrOfflineBlocks)) {
        return validateDailyShifts(blocks, slotDurationOrOfflineBlocks, slotDuration);
    }
    const duration = typeof slotDurationOrOfflineBlocks === 'number' ? slotDurationOrOfflineBlocks : 15;
    return validateDailyShifts(blocks, [], duration);
};

/**
 * Validates the entire schedule across all days and channels.
 * Returns first error string found, or null if 100% valid.
 */
export const validateFullSchedule = (
    schedule: { online?: Record<string, TimeBlock[] | undefined>; offline?: Record<string, TimeBlock[] | undefined> } | any,
    slotDuration: number = 15,
    options: { isOnlineEnabled?: boolean; isOfflineEnabled?: boolean } = { isOnlineEnabled: true, isOfflineEnabled: true }
): string | null => {
    if (!schedule) return null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const checkOnline = options.isOnlineEnabled !== false;
    const checkOffline = options.isOfflineEnabled !== false;

    for (const day of days) {
        const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
        const onlineBlocks = checkOnline ? (schedule?.online?.[day] || []) : [];
        const offlineBlocks = checkOffline ? (schedule?.offline?.[day] || []) : [];

        const dayErrors = validateDailyShifts(onlineBlocks, offlineBlocks, slotDuration);
        const errorKeys = Object.keys(dayErrors);
        if (errorKeys.length > 0) {
            return `${dayLabel}: ${dayErrors[errorKeys[0]].message}`;
        }
    }
    return null;
};
