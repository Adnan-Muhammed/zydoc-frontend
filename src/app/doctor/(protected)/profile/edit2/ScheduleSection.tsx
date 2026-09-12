'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { useRouter } from 'next/navigation';
import { validateDayBlocks, validateFullSchedule, snapToNearest5Mins } from '@/utils/scheduleValidator';

const DURATION_OPTIONS = [
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes (Standard)' },
    { value: 20, label: '20 Minutes' },
    { value: 30, label: '30 Minutes' },
    { value: 45, label: '45 Minutes' },
    { value: 60, label: '60 Minutes (1 Hour)' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type DayKey = typeof DAYS[number];

const WEEKDAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const ALL_DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const labelMap: Record<DayKey, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
};

export interface TimeBlock {
    id: string;
    start: string;
    end: string;
}

type WeekSchedule = Record<DayKey, TimeBlock[]>;
type ScheduleState = Record<'online' | 'offline', WeekSchedule>;

const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Normalizes incoming raw working hours into strict 7-day state
 */
function normalizeSchedule(rawWH: any): ScheduleState {
    const result: ScheduleState = {
        online: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
        offline: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    };

    (['online', 'offline'] as const).forEach((ch) => {
        const channelData = rawWH?.[ch] || {};

        DAYS.forEach((d) => {
            const val = channelData[d];
            if (Array.isArray(val)) {
                result[ch][d] = val.map((b: any) => ({
                    id: b.id || generateId(),
                    start: b.start || '09:00',
                    end: b.end || '17:00'
                }));
            } else if (val && typeof val === 'object' && val.active && val.start && val.end) {
                result[ch][d] = [{ id: generateId(), start: val.start, end: val.end }];
            } else {
                result[ch][d] = [];
            }
        });
    });

    return result;
}

/**
 * Checks if two sets of time blocks are exactly identical in count and times
 */
function areShiftsIdentical(shiftsA: TimeBlock[] = [], shiftsB: TimeBlock[] = []): boolean {
    if (shiftsA.length === 0 || shiftsB.length === 0) return false;
    if (shiftsA.length !== shiftsB.length) return false;
    return shiftsA.every((blockA, idx) => {
        const blockB = shiftsB[idx];
        return blockB && blockA.start === blockB.start && blockA.end === blockB.end;
    });
}

/**
 * Creates a unique string signature for a day's shifts (e.g. "09:00-12:00|14:00-18:00")
 */
function getShiftSignature(shifts: TimeBlock[] = []): string {
    if (!shifts || shifts.length === 0) return '';
    return shifts.map(s => `${s.start}-${s.end}`).join('|');
}

/**
 * Smart Default Time Resolution:
 * 1. Majority Rule (Mode): Finds the most frequently occurring schedule among active target days.
 * 2. Fallback: If tied or all distinct, selects the chronologically first active day's shifts.
 * 3. Empty State: Falls back to 09:00 - 17:00 if no days are currently active.
 */
function resolveSmartDefaultShifts(
    dayMap: WeekSchedule,
    targetDays?: DayKey[]
): TimeBlock[] {
    const candidateDays = targetDays && targetDays.length > 0 ? targetDays : ALL_DAYS;

    // 1. Gather active shifts
    let activeDayShifts = candidateDays
        .map(day => dayMap[day])
        .filter(shifts => shifts && shifts.length > 0);

    if (activeDayShifts.length === 0) {
        // Fallback: check across the entire week
        activeDayShifts = ALL_DAYS
            .map(day => dayMap[day])
            .filter(shifts => shifts && shifts.length > 0);
    }

    // If completely empty across all days
    if (activeDayShifts.length === 0) {
        return [{ id: generateId(), start: '09:00', end: '17:00' }];
    }

    // 2. Count frequency by shift signature
    const frequencyMap = new Map<string, { count: number; shifts: TimeBlock[] }>();
    for (const shifts of activeDayShifts) {
        const sig = getShiftSignature(shifts);
        if (!frequencyMap.has(sig)) {
            frequencyMap.set(sig, { count: 1, shifts });
        } else {
            frequencyMap.get(sig)!.count += 1;
        }
    }

    // 3. Find majority (mode)
    let maxCount = 0;
    let majorityShifts: TimeBlock[] | null = null;
    Array.from(frequencyMap.values()).forEach(item => {
        if (item.count > maxCount) {
            maxCount = item.count;
            majorityShifts = item.shifts;
        }
    });

    // If there is a majority (> 1 active day with the same schedule)
    if (maxCount > 1 && majorityShifts !== null) {
        const shiftsToClone: TimeBlock[] = majorityShifts;
        return shiftsToClone.map((s: TimeBlock) => ({ id: generateId(), start: s.start, end: s.end }));
    }

    // 4. Fallback: Chronologically first active day
    for (const day of candidateDays) {
        const shifts = dayMap[day];
        if (shifts && shifts.length > 0) {
            return shifts.map(s => ({ id: generateId(), start: s.start, end: s.end }));
        }
    }
    for (const day of ALL_DAYS) {
        const shifts = dayMap[day];
        if (shifts && shifts.length > 0) {
            return shifts.map(s => ({ id: generateId(), start: s.start, end: s.end }));
        }
    }

    return [{ id: generateId(), start: '09:00', end: '17:00' }];
}

export default function ScheduleSection({ 
    initialData, 
    consultationSettings, 
    slotDuration: initialSlotDuration = 15,
    timezone: initialTimezone,
    onNavigateToConsultation,
    onUpdate
}: { 
    initialData: any; 
    consultationSettings?: any; 
    slotDuration?: number; 
    timezone?: string;
    onNavigateToConsultation?: () => void;
    onUpdate?: (data: any) => void;
}) {
    const router = useRouter();
    const [schedule, setSchedule] = useState<ScheduleState>(() => normalizeSchedule(initialData));
    const [slotDuration, setSlotDuration] = useState(initialSlotDuration || 15);
    const [timezone, setTimezone] = useState<string>(() => {
        return initialTimezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata');
    });
    const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');
    const [loading, setLoading] = useState(false);

    // Ref to store custom day configuration prior to activating Mon-Fri for graceful restoration on uncheck
    const previousCustomDaysRef = useRef<Record<DayKey, TimeBlock[]> | null>(null);

    useEffect(() => {
        setSchedule(normalizeSchedule(initialData));
        setSlotDuration(initialSlotDuration || 15);
        if (initialTimezone) setTimezone(initialTimezone);
    }, [initialData, initialSlotDuration, initialTimezone]);

    const currentChannelSchedule = schedule[activeTab];

    const isVideoEnabled = Boolean(consultationSettings?.online?.enabled ?? consultationSettings?.video?.enabled ?? consultationSettings?.enableVideo ?? false);
    const isPhysicalEnabled = Boolean(consultationSettings?.offline?.enabled ?? consultationSettings?.physical?.enabled ?? consultationSettings?.enablePhysical ?? false);
    const clinicName = consultationSettings?.offline?.clinicName || consultationSettings?.physical?.clinicName || '';
    const clinicAddress = consultationSettings?.offline?.clinicAddress || consultationSettings?.physical?.clinicAddress || '';

    const isCurrentTabEnabled = activeTab === 'online' ? isVideoEnabled : isPhysicalEnabled;

    // =========================================================================
    // 1. DERIVED STATES: Single Source of Truth (Pure Auto-Check & Uncheck)
    // =========================================================================
    const activeDays = useMemo(() => {
        return ALL_DAYS.filter(d => (currentChannelSchedule[d] || []).length > 0);
    }, [currentChannelSchedule]);

    // Monday to Friday: Mon-Fri are active and share exact same shifts
    const isMonFriChecked = useMemo(() => {
        const monShifts = currentChannelSchedule.monday || [];
        if (monShifts.length === 0) return false;
        return WEEKDAYS.every(day => {
            const dayShifts = currentChannelSchedule[day] || [];
            return areShiftsIdentical(monShifts, dayShifts);
        });
    }, [currentChannelSchedule]);

    // Full Week: All 7 days are active and share exact same shifts
    const isFullWeekChecked = useMemo(() => {
        const monShifts = currentChannelSchedule.monday || [];
        if (monShifts.length === 0) return false;
        return ALL_DAYS.every(day => {
            const dayShifts = currentChannelSchedule[day] || [];
            return areShiftsIdentical(monShifts, dayShifts);
        });
    }, [currentChannelSchedule]);

    // Sync Active Days (Bulk Sync): Checked ONLY IF all currently active days (>= 2) share exact same shifts
    const isSyncActiveDaysChecked = useMemo(() => {
        if (activeDays.length < 2) return false;
        const firstDayShifts = currentChannelSchedule[activeDays[0]] || [];
        if (firstDayShifts.length === 0) return false;
        return activeDays.every(day => {
            const dayShifts = currentChannelSchedule[day] || [];
            return areShiftsIdentical(firstDayShifts, dayShifts);
        });
    }, [activeDays, currentChannelSchedule]);

    // Days governed by active Master Sync
    const governedDays = useMemo<DayKey[]>(() => {
        if (isFullWeekChecked) return [...ALL_DAYS];
        if (isMonFriChecked) return [...WEEKDAYS];
        if (isSyncActiveDaysChecked) return [...activeDays];
        return [];
    }, [isFullWeekChecked, isMonFriChecked, isSyncActiveDaysChecked, activeDays]);

    const anyGroupActive = governedDays.length > 0;

    // Master shifts for group controls (derived from first governed day)
    const masterShifts = useMemo(() => {
        if (governedDays.length > 0) {
            return currentChannelSchedule[governedDays[0]] || [];
        }
        return [];
    }, [governedDays, currentChannelSchedule]);

    // =========================================================================
    // 2. CENTRALIZED VALIDATION ERROR AGGREGATION
    // =========================================================================
    const daysWithErrors = useMemo(() => {
        const errorDays: { day: DayKey; label: string }[] = [];
        ALL_DAYS.forEach((day) => {
            const onlineBlocks = (isVideoEnabled || activeTab === 'online') ? (schedule.online?.[day] || []) : [];
            const offlineBlocks = (isPhysicalEnabled || activeTab === 'offline') ? (schedule.offline?.[day] || []) : [];
            const dayErrors = validateDayBlocks(
                activeTab === 'online' && !isPhysicalEnabled ? (schedule.online?.[day] || []) : onlineBlocks,
                activeTab === 'offline' && !isVideoEnabled ? (schedule.offline?.[day] || []) : offlineBlocks,
                Number(slotDuration) || 15
            );
            if (Object.keys(dayErrors).length > 0) {
                errorDays.push({ day, label: labelMap[day] });
            }
        });
        return errorDays;
    }, [schedule, activeTab, isVideoEnabled, isPhysicalEnabled, slotDuration]);

    // =========================================================================
    // 3. HIERARCHICAL UNCHECK FALLBACK & SMART GROUP TOGGLE HANDLERS
    // =========================================================================

    // Bulk apply a set of shifts to specified days
    const applyShiftsToDays = useCallback((targetDays: DayKey[], newShifts: TimeBlock[]) => {
        setSchedule(prev => {
            const updatedChannel = { ...prev[activeTab] };
            targetDays.forEach(day => {
                updatedChannel[day] = newShifts.map(s => ({
                    id: generateId(),
                    start: s.start,
                    end: s.end
                }));
            });
            return { ...prev, [activeTab]: updatedChannel };
        });
    }, [activeTab]);

    // 1. Toggle "Monday to Friday" with state preservation & restoration
    const handleToggleMonFri = (checked: boolean) => {
        if (checked) {
            // Before checking, if current state is a custom subset, save a snapshot in ref
            const currentActiveWeekdays = WEEKDAYS.filter(d => (currentChannelSchedule[d] || []).length > 0);
            if (currentActiveWeekdays.length > 0 && currentActiveWeekdays.length < 5) {
                previousCustomDaysRef.current = JSON.parse(JSON.stringify(currentChannelSchedule));
            } else {
                previousCustomDaysRef.current = null;
            }

            const resolvedShifts = resolveSmartDefaultShifts(currentChannelSchedule, WEEKDAYS);
            applyShiftsToDays(WEEKDAYS, resolvedShifts);
        } else {
            // On uncheck: restore previous custom days if available, otherwise deactivate Mon-Fri
            if (previousCustomDaysRef.current) {
                const restored = previousCustomDaysRef.current;
                previousCustomDaysRef.current = null;
                setSchedule(prev => ({
                    ...prev,
                    [activeTab]: restored
                }));
            } else {
                setSchedule(prev => {
                    const updatedChannel = { ...prev[activeTab] };
                    WEEKDAYS.forEach(day => {
                        updatedChannel[day] = [];
                    });
                    return { ...prev, [activeTab]: updatedChannel };
                });
            }
        }
    };

    // 2. Toggle "Full Week" with graceful fallback (deactivate only Sat & Sun)
    const handleToggleFullWeek = (checked: boolean) => {
        if (checked) {
            const resolvedShifts = resolveSmartDefaultShifts(currentChannelSchedule, ALL_DAYS);
            applyShiftsToDays(ALL_DAYS, resolvedShifts);
        } else {
            // Graceful fallback: deactivate ONLY Saturday & Sunday, leaving Monday-Friday active
            setSchedule(prev => {
                const updatedChannel = { ...prev[activeTab] };
                updatedChannel.saturday = [];
                updatedChannel.sunday = [];
                return { ...prev, [activeTab]: updatedChannel };
            });
        }
    };

    // 3. Toggle "Sync Active Days" (Uncheck acts as ultimate clear button)
    const handleToggleSyncActiveDays = (checked: boolean) => {
        if (checked) {
            const targetDays = activeDays.length >= 2 ? activeDays : (activeDays.length === 1 ? activeDays : WEEKDAYS);
            const resolvedShifts = resolveSmartDefaultShifts(currentChannelSchedule, targetDays);
            applyShiftsToDays(targetDays, resolvedShifts);
        } else {
            // Ultimate clear button: deactivates all currently active days
            if (activeDays.length > 0) {
                setSchedule(prev => {
                    const updatedChannel = { ...prev[activeTab] };
                    activeDays.forEach(day => {
                        updatedChannel[day] = [];
                    });
                    return { ...prev, [activeTab]: updatedChannel };
                });
            }
        }
    };

    // =========================================================================
    // 4. TWO-WAY SYNCHRONIZATION: Master Group Shift Editing
    // =========================================================================
    const handleMasterBlockTimeChange = (blockIndex: number, field: 'start' | 'end', val: string) => {
        if (governedDays.length === 0) return;

        const snappedVal = snapToNearest5Mins(val);

        setSchedule(prev => {
            const updatedChannel = { ...prev[activeTab] };
            governedDays.forEach(day => {
                const currentBlocks = [...(updatedChannel[day] || [])];
                if (currentBlocks[blockIndex]) {
                    currentBlocks[blockIndex] = {
                        ...currentBlocks[blockIndex],
                        [field]: snappedVal
                    };
                    updatedChannel[day] = currentBlocks;
                }
            });
            return { ...prev, [activeTab]: updatedChannel };
        });
    };

    const handleMasterAddBlock = () => {
        if (governedDays.length === 0) return;

        const repBlocks = currentChannelSchedule[governedDays[0]] || [];
        const lastBlock = repBlocks[repBlocks.length - 1];
        let nextStart = '14:00';
        let nextEnd = '18:00';
        if (lastBlock?.end) {
            const [h, m] = lastBlock.end.split(':').map(Number);
            const startH = Math.min(h + 1, 22);
            const endH = Math.min(startH + 4, 23);
            nextStart = `${String(startH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
            nextEnd = `${String(endH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
        }

        setSchedule(prev => {
            const updatedChannel = { ...prev[activeTab] };
            governedDays.forEach(day => {
                const currentBlocks = [...(updatedChannel[day] || [])];
                currentBlocks.push({ id: generateId(), start: nextStart, end: nextEnd });
                updatedChannel[day] = currentBlocks;
            });
            return { ...prev, [activeTab]: updatedChannel };
        });
    };

    const handleMasterRemoveBlock = (blockIndex: number) => {
        if (governedDays.length === 0) return;

        setSchedule(prev => {
            const updatedChannel = { ...prev[activeTab] };
            governedDays.forEach(day => {
                const currentBlocks = [...(updatedChannel[day] || [])];
                currentBlocks.splice(blockIndex, 1);
                updatedChannel[day] = currentBlocks;
            });
            return { ...prev, [activeTab]: updatedChannel };
        });
    };

    // =========================================================================
    // 5. INDIVIDUAL DAY MANUAL ENTRY HANDLERS
    // =========================================================================
    const handleToggleDay = (day: DayKey, checked: boolean) => {
        const currentBlocks = currentChannelSchedule[day] || [];
        let newBlocks: TimeBlock[] = [];

        if (checked) {
            if (currentBlocks.length > 0) {
                newBlocks = currentBlocks;
            } else {
                // Smart default resolution for single day activation
                newBlocks = resolveSmartDefaultShifts(currentChannelSchedule, [day]);
            }
        }

        setSchedule(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [day]: newBlocks
            }
        }));
    };

    const handleBlockTimeChange = (day: DayKey, blockId: string, field: 'start' | 'end', val: string) => {
        const snappedVal = snapToNearest5Mins(val);
        setSchedule(prev => {
            const currentBlocks = prev[activeTab][day] || [];
            const updatedBlocks = currentBlocks.map(b => b.id === blockId ? { ...b, [field]: snappedVal } : b);
            return {
                ...prev,
                [activeTab]: {
                    ...prev[activeTab],
                    [day]: updatedBlocks
                }
            };
        });
    };

    const handleAddBlock = (day: DayKey) => {
        const currentBlocks = currentChannelSchedule[day] || [];
        const lastBlock = currentBlocks[currentBlocks.length - 1];
        let nextStart = '14:00';
        let nextEnd = '18:00';
        if (lastBlock?.end) {
            const [h, m] = lastBlock.end.split(':').map(Number);
            const startH = Math.min(h + 1, 22);
            const endH = Math.min(startH + 4, 23);
            nextStart = `${String(startH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
            nextEnd = `${String(endH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
        }

        const newBlock: TimeBlock = { id: generateId(), start: nextStart, end: nextEnd };
        setSchedule(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [day]: [...currentBlocks, newBlock]
            }
        }));
    };

    const handleRemoveBlock = (day: DayKey, blockId: string) => {
        setSchedule(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [day]: (prev[activeTab][day] || []).filter(b => b.id !== blockId)
            }
        }));
    };

    // =========================================================================
    // 6. SAVE & BACKEND INTEGRATION
    // =========================================================================
    const handleSave = async (forceUpdate: boolean = false) => {
        const scheduleError = validateFullSchedule(schedule, Number(slotDuration) || 15, {
            isOnlineEnabled: isVideoEnabled,
            isOfflineEnabled: isPhysicalEnabled
        });
        if (scheduleError) {
            alert(`Schedule Validation Error:\n${scheduleError}`);
            return;
        }

        setLoading(true);
        try {
            const sanitize = (dayBlocks: TimeBlock[] = []) =>
                dayBlocks
                    .filter(b => b && b.start && b.end)
                    .map(b => ({ start: b.start, end: b.end }));

            const cleanedSchedule = {
                online: {
                    monday: sanitize(schedule.online.monday),
                    tuesday: sanitize(schedule.online.tuesday),
                    wednesday: sanitize(schedule.online.wednesday),
                    thursday: sanitize(schedule.online.thursday),
                    friday: sanitize(schedule.online.friday),
                    saturday: sanitize(schedule.online.saturday),
                    sunday: sanitize(schedule.online.sunday),
                },
                offline: {
                    monday: sanitize(schedule.offline.monday),
                    tuesday: sanitize(schedule.offline.tuesday),
                    wednesday: sanitize(schedule.offline.wednesday),
                    thursday: sanitize(schedule.offline.thursday),
                    friday: sanitize(schedule.offline.friday),
                    saturday: sanitize(schedule.offline.saturday),
                    sunday: sanitize(schedule.offline.sunday),
                }
            };

            const currentTz = timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata');
            const res = await axiosInstance.patch('/doctor/profile/schedule', { 
                workingHours: cleanedSchedule,
                slotDuration: Number(slotDuration) || 15,
                timezone: currentTz,
                forceUpdate
            });

            if (res.data?.success) {
                alert('Availability schedule saved successfully!');
                if (onUpdate) {
                    onUpdate({ 
                        workingHours: cleanedSchedule, 
                        slotDuration: Number(slotDuration) || 15,
                        timezone: currentTz
                    });
                }
                router.refresh();
            } else {
                alert(res.data?.message || 'Error saving details.');
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 409) {
                const message = err.response.data?.message || "You have upcoming consultations. Changing the schedule times or duration may cause time lapses and irregular slots around your existing bookings. Do you want to proceed anyway?";
                const proceed = window.confirm(`⚠️ Schedule Conflict Warning:\n\n${message}`);
                if (proceed) {
                    handleSave(true);
                    return;
                }
            } else {
                alert(err.response?.data?.message || 'An error occurred while saving schedule.');
            }
        } finally {
            setLoading(false);
        }
    };

    const syncLabelText = useMemo(() => {
        if (isFullWeekChecked) return 'Full Week (7 Days)';
        if (isMonFriChecked) return 'Mon - Fri (5 Days)';
        if (isSyncActiveDaysChecked) return `${activeDays.length} Active Days`;
        return '';
    }, [isFullWeekChecked, isMonFriChecked, isSyncActiveDaysChecked, activeDays]);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            {/* Header row with Slot Duration selector and Save button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-clock text-indigo-500" /> Operational Availability & Shifts
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Configure consultation duration and multiple shifts per day with smart bulk syncing.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 shadow-2xs" title="Operating Timezone">
                        <i className="fas fa-globe text-indigo-500 text-xs" />
                        <span>Operating Timezone: <strong>{timezone}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Slot Duration:</label>
                        <select
                            value={slotDuration}
                            onChange={(e) => setSlotDuration(Number(e.target.value))}
                            className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                            {DURATION_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin text-xs" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check text-xs" />
                                <span>Save Schedule</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Channel Tabs */}
            <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-slate-100 pt-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('online')}
                    className={`pb-2 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'online' 
                            ? 'text-indigo-600 border-b-2 border-indigo-600' 
                            : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <i className="fas fa-video text-xs" /> 
                    <span>Telehealth (Online)</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isVideoEnabled 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                        {isVideoEnabled ? 'ON' : 'OFF'}
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('offline')}
                    className={`pb-2 text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'offline' 
                            ? 'text-indigo-600 border-b-2 border-indigo-600' 
                            : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <i className="fas fa-building-medical text-xs" /> 
                    <span>In-Person (Offline)</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isPhysicalEnabled 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                        {isPhysicalEnabled ? 'ON' : 'OFF'}
                    </span>
                </button>
            </div>

            {/* Offline Clinic Info Context Banner */}
            {activeTab === 'offline' && clinicName && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <i className="fas fa-hospital text-xs" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{clinicName}</p>
                            {clinicAddress && <p className="text-[11px] text-slate-500 truncate">{clinicAddress}</p>}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase tracking-wide shrink-0">
                        Clinic Location
                    </span>
                </div>
            )}

            {/* Persistent Notice Banner when Consultation Mode is OFF */}
            {!isCurrentTabEnabled && (
                <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            <i className="fas fa-info-circle text-sm" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-bold text-amber-900">
                                Note: This consultation mode is currently OFF.
                            </p>
                            <p className="text-[11px] text-amber-800 leading-normal">
                                You can update your schedule here, but it won&apos;t be visible to patients until you enable it in the Consultation settings.
                            </p>
                        </div>
                    </div>
                    {onNavigateToConsultation && (
                        <button
                            type="button"
                            onClick={onNavigateToConsultation}
                            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                            <span>Enable Channel</span>
                            <i className="fas fa-arrow-right text-[9px]" />
                        </button>
                    )}
                </div>
            )}

            {/* ================================================================= */}
            {/* TOP GROUP CONTROLS (DERIVED STATE & SMART BULK SYNC)             */}
            {/* ================================================================= */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                            <i className="fas fa-layer-group text-indigo-500 text-xs" />
                            <span>Quick Presets & Bulk Sync</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                            Status auto-syncs based on day timings below. Checking a preset applies the smart majority schedule.
                        </p>
                    </div>
                    {anyGroupActive && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-full self-start sm:self-center">
                            ⚡ Two-Way Sync Active ({syncLabelText})
                        </span>
                    )}
                </div>

                {/* 3 Top Preset Checkbox Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Monday to Friday */}
                    <label className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isMonFriChecked 
                            ? 'bg-indigo-50/70 border-indigo-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}>
                        <input
                            type="checkbox"
                            checked={isMonFriChecked}
                            onChange={(e) => handleToggleMonFri(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block">Monday to Friday</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                {isMonFriChecked ? '5 weekdays synced' : 'Apply majority time to Mon-Fri'}
                            </span>
                        </div>
                    </label>

                    {/* 2. Full Week */}
                    <label className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isFullWeekChecked 
                            ? 'bg-indigo-50/70 border-indigo-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}>
                        <input
                            type="checkbox"
                            checked={isFullWeekChecked}
                            onChange={(e) => handleToggleFullWeek(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block">Full Week (Mon - Sun)</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                {isFullWeekChecked ? 'All 7 days synced' : 'Apply majority time to all 7 days'}
                            </span>
                        </div>
                    </label>

                    {/* 3. Sync Active Days (Bulk Sync) */}
                    <label className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isSyncActiveDaysChecked 
                            ? 'bg-indigo-50/70 border-indigo-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}>
                        <input
                            type="checkbox"
                            checked={isSyncActiveDaysChecked}
                            onChange={(e) => handleToggleSyncActiveDays(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 block">Sync Active Days</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                {isSyncActiveDaysChecked 
                                    ? `${activeDays.length} active days synced` 
                                    : (activeDays.length > 0 ? `Unify ${activeDays.length} active days to majority time` : 'Select days below to sync')}
                            </span>
                        </div>
                    </label>
                </div>

                {/* Master / Group Time Synchronizer Editor */}
                {anyGroupActive && masterShifts.length > 0 && (
                    <div className="bg-indigo-50/50 border border-indigo-200/70 rounded-xl p-3.5 sm:p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                <span className="text-xs font-bold text-indigo-900">
                                    Master Time Sync ({syncLabelText})
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleMasterAddBlock}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-100/50 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                            >
                                <i className="fas fa-plus text-[9px]" />
                                <span>Add Master Shift</span>
                            </button>
                        </div>

                        {/* Centralized Validation Alert Banner in Master Time Sync */}
                        {daysWithErrors.length > 0 && (
                            <div className="bg-yellow-50 text-yellow-800 border border-yellow-400 p-3 rounded-xl flex items-start gap-2.5 text-xs shadow-2xs">
                                <span className="text-sm shrink-0">⚠️</span>
                                <div className="space-y-0.5 min-w-0">
                                    <p className="font-bold text-yellow-900">
                                        Scheduling conflicts detected on: {daysWithErrors.map(d => d.label).join(', ')}
                                    </p>
                                    <p className="text-[11px] text-yellow-700 leading-normal">
                                        Please scroll down to the respective days to review and resolve them.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {masterShifts.map((shift, idx) => (
                                <div key={shift.id || idx} className="flex items-center gap-2 sm:gap-3 bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider shrink-0">
                                        Shift {idx + 1}:
                                    </span>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Start:</span>
                                            <input
                                                type="time"
                                                value={shift.start}
                                                onChange={(e) => handleMasterBlockTimeChange(idx, 'start', e.target.value)}
                                                className="w-full px-2 py-1 border border-slate-200 rounded-md text-slate-800 font-bold text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                        <span className="text-slate-300 font-bold shrink-0">—</span>
                                        <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">End:</span>
                                            <input
                                                type="time"
                                                value={shift.end}
                                                onChange={(e) => handleMasterBlockTimeChange(idx, 'end', e.target.value)}
                                                className="w-full px-2 py-1 border border-slate-200 rounded-md text-slate-800 font-bold text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            />
                                        </div>
                                    </div>
                                    {masterShifts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleMasterRemoveBlock(idx)}
                                            title="Remove this master shift"
                                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0"
                                        >
                                            <i className="fas fa-trash-alt text-xs" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ================================================================= */}
            {/* 7-DAY INDIVIDUAL SCHEDULE GRID                                   */}
            {/* ================================================================= */}
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Individual Daily Shifts (Mon - Sun)
                    </span>
                    <span className="text-[11px] text-slate-400">
                        {activeDays.length} of 7 days active
                    </span>
                </div>

                {DAYS.map((day) => {
                    const displayLabel = labelMap[day];
                    const blocks = currentChannelSchedule[day] || [];
                    const isDayActive = blocks.length > 0;

                    return (
                        <div 
                            key={day} 
                            className={`p-4 border rounded-xl text-xs transition-all space-y-3 ${
                                isDayActive 
                                    ? 'bg-indigo-50/15 border-indigo-100 shadow-2xs' 
                                    : 'bg-slate-50/60 border-slate-100'
                            }`}
                        >
                            {/* Top Row: Checkbox, Name, and Add Shift button */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isDayActive}
                                        onChange={e => handleToggleDay(day, e.target.checked)}
                                        className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 text-sm">{displayLabel}</span>
                                        {isDayActive ? (
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                                                {blocks.length} {blocks.length === 1 ? 'Shift' : 'Shifts'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {isDayActive && (
                                    <button
                                        type="button"
                                        onClick={() => handleAddBlock(day)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                                    >
                                        <i className="fas fa-plus text-[9px]" />
                                        <span>Add Shift / Break</span>
                                    </button>
                                )}
                            </div>

                            {/* Shift list for the day */}
                            {isDayActive ? (() => {
                                const onlineBlocks = (isVideoEnabled || activeTab === 'online') ? (schedule.online?.[day] || []) : [];
                                const offlineBlocks = (isPhysicalEnabled || activeTab === 'offline') ? (schedule.offline?.[day] || []) : [];
                                const dayErrors = validateDayBlocks(
                                    activeTab === 'online' && !isPhysicalEnabled ? (schedule.online?.[day] || []) : onlineBlocks,
                                    activeTab === 'offline' && !isVideoEnabled ? (schedule.offline?.[day] || []) : offlineBlocks,
                                    Number(slotDuration) || 15
                                );

                                return (
                                    <div className="space-y-2 pt-1 border-t border-slate-100">
                                        {blocks.map((block, idx) => {
                                            const blockError = dayErrors[block.id];
                                            const adjustField = blockError?.suggestion?.fieldToAdjust || 'end';
                                            return (
                                                <div key={block.id || idx} className="space-y-1">
                                                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border ${blockError ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 shadow-2xs'}`}>
                                                        {/* Header row on mobile / Inline prefix on desktop */}
                                                        <div className="flex items-center justify-between sm:justify-start gap-2">
                                                            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
                                                                Shift {idx + 1}:
                                                            </span>
                                                            {/* Mobile delete button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveBlock(day, block.id)}
                                                                title="Remove this shift"
                                                                className="sm:hidden p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <i className="fas fa-trash-alt text-xs" />
                                                            </button>
                                                        </div>

                                                        {/* Time Inputs row */}
                                                        <div className="flex items-center gap-2 flex-1 w-full">
                                                            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Start:</span>
                                                                <input
                                                                    type="time"
                                                                    value={block.start}
                                                                    onChange={e => handleBlockTimeChange(day, block.id, 'start', e.target.value)}
                                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-white shadow-2xs"
                                                                />
                                                            </div>

                                                            <span className="text-slate-300 font-bold shrink-0">—</span>

                                                            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">End:</span>
                                                                <input
                                                                    type="time"
                                                                    value={block.end}
                                                                    onChange={e => handleBlockTimeChange(day, block.id, 'end', e.target.value)}
                                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-white shadow-2xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Desktop delete button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBlock(day, block.id)}
                                                            title="Remove this shift"
                                                            className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                                                        >
                                                            <i className="fas fa-trash-alt text-xs" />
                                                        </button>
                                                    </div>

                                                    {/* Inline validation suggestions */}
                                                    {blockError && (
                                                        <div className="space-y-1.5 pl-1 pt-0.5">
                                                            <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1.5">
                                                                <span>⚠️</span>
                                                                <span>{blockError.message}</span>
                                                            </p>
                                                            {blockError.suggestion && (
                                                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                                    {blockError.suggestion.roundDownTimeStr && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleBlockTimeChange(day, block.id, adjustField, blockError.suggestion!.roundDownTimeStr!)}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95"
                                                                        >
                                                                            <i className="fas fa-magic text-[9px] text-amber-600" />
                                                                            <span>Adjust to {blockError.suggestion.roundDownLabel}</span>
                                                                        </button>
                                                                    )}
                                                                    {blockError.suggestion.roundUpTimeStr && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleBlockTimeChange(day, block.id, adjustField, blockError.suggestion!.roundUpTimeStr!)}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95"
                                                                        >
                                                                            <i className="fas fa-magic text-[9px] text-amber-600" />
                                                                            <span>Adjust to {blockError.suggestion.roundUpLabel}</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })() : (
                                <div className="pt-0.5">
                                    <span className="text-slate-400 italic font-medium">Closed</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}