'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { validateDayBlocks, validateFullSchedule, snapToNearest5Mins } from '@/utils/scheduleValidator';

const DURATION_OPTIONS = [
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes (Standard)' },
    { value: 20, label: '20 Minutes' },
    { value: 30, label: '30 Minutes' },
    { value: 45, label: '45 Minutes' },
    { value: 60, label: '60 Minutes (1 Hour)' },
];

const DAYS = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const labelMap: Record<string, string> = {
    fullWeek: 'Full Week (Mon-Sun)',
    mondayToFriday: 'Monday to Friday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
};

interface TimeBlock {
    id: string;
    start: string;
    end: string;
}

interface ScheduleManagerProps {
    initialData: any;
    slotDuration?: number;
}

function normalizeSchedule(rawWH: any) {
    const generateId = () => Math.random().toString(36).substring(2, 9);
    const result: Record<'online' | 'offline', Record<string, TimeBlock[]>> = {
        online: { fullWeek: [], mondayToFriday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
        offline: { fullWeek: [], mondayToFriday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
    };

    ['online', 'offline'].forEach((ch) => {
        const channelKey = ch as 'online' | 'offline';
        const channelData = rawWH?.[channelKey] || {};

        DAYS.forEach((d) => {
            const val = channelData[d];
            if (Array.isArray(val)) {
                result[channelKey][d] = val.map((b: any) => ({
                    id: b.id || generateId(),
                    start: b.start || '09:00',
                    end: b.end || '17:00'
                }));
            } else if (val && typeof val === 'object' && val.active && val.start && val.end) {
                result[channelKey][d] = [{ id: generateId(), start: val.start, end: val.end }];
            } else {
                result[channelKey][d] = [];
            }
        });
    });

    return result;
}

export default function ScheduleManager({ initialData, slotDuration: initialSlotDuration = 15 }: ScheduleManagerProps) {
    const [schedule, setSchedule] = useState(() => normalizeSchedule(initialData));
    const [slotDuration, setSlotDuration] = useState(initialSlotDuration || 15);
    const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSchedule(normalizeSchedule(initialData));
        setSlotDuration(initialSlotDuration || 15);
    }, [initialData, initialSlotDuration]);

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const handleToggleDay = (type: 'online' | 'offline', key: typeof DAYS[number], checked: boolean) => {
        const typeSchedule = { ...schedule[type] };
        const newBlocks: TimeBlock[] = checked ? [{ id: generateId(), start: '09:00', end: '17:00' }] : [];

        if (key === 'fullWeek') {
            const allDays = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
            allDays.forEach(d => {
                typeSchedule[d] = checked ? [{ id: generateId(), start: '09:00', end: '17:00' }] : [];
            });
        } else if (key === 'mondayToFriday') {
            const weekdays = ['mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
            weekdays.forEach(d => {
                typeSchedule[d] = checked ? [{ id: generateId(), start: '09:00', end: '17:00' }] : [];
            });
        } else {
            typeSchedule[key] = newBlocks;
            typeSchedule.fullWeek = [];
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key)) {
                typeSchedule.mondayToFriday = [];
            }
        }

        setSchedule({ ...schedule, [type]: typeSchedule });
    };

    const handleBlockTimeChange = (type: 'online' | 'offline', key: typeof DAYS[number], blockId: string, field: 'start' | 'end', val: string) => {
        const typeSchedule = { ...schedule[type] };
        const currentBlocks = typeSchedule[key] || [];
        const snappedVal = snapToNearest5Mins(val);
        const updatedBlocks = currentBlocks.map(b => b.id === blockId ? { ...b, [field]: snappedVal } : b);

        if (key === 'fullWeek') {
            const allDays = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
            allDays.forEach(d => {
                typeSchedule[d] = updatedBlocks.map(b => ({ ...b, id: generateId() }));
            });
        } else if (key === 'mondayToFriday') {
            const weekdays = ['mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
            weekdays.forEach(d => {
                typeSchedule[d] = updatedBlocks.map(b => ({ ...b, id: generateId() }));
            });
        } else {
            typeSchedule[key] = updatedBlocks;
            typeSchedule.fullWeek = [];
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key)) {
                typeSchedule.mondayToFriday = [];
            }
        }

        setSchedule({ ...schedule, [type]: typeSchedule });
    };

    const handleAddBlock = (type: 'online' | 'offline', key: typeof DAYS[number]) => {
        const typeSchedule = { ...schedule[type] };
        const currentBlocks = typeSchedule[key] || [];

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
        const updatedBlocks = [...currentBlocks, newBlock];

        if (key === 'fullWeek') {
            const allDays = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
            allDays.forEach(d => {
                typeSchedule[d] = updatedBlocks.map(b => ({ ...b, id: generateId() }));
            });
        } else if (key === 'mondayToFriday') {
            const weekdays = ['mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
            weekdays.forEach(d => {
                typeSchedule[d] = updatedBlocks.map(b => ({ ...b, id: generateId() }));
            });
        } else {
            typeSchedule[key] = updatedBlocks;
            typeSchedule.fullWeek = [];
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key)) {
                typeSchedule.mondayToFriday = [];
            }
        }

        setSchedule({ ...schedule, [type]: typeSchedule });
    };

    const handleRemoveBlock = (type: 'online' | 'offline', key: typeof DAYS[number], blockId: string) => {
        const typeSchedule = { ...schedule[type] };
        const currentBlocks = typeSchedule[key] || [];
        const updatedBlocks = currentBlocks.filter(b => b.id !== blockId);

        if (key === 'fullWeek') {
            const allDays = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
            allDays.forEach(d => {
                typeSchedule[d] = updatedBlocks.map(b => ({ ...b, id: generateId() }));
            });
        } else if (key === 'mondayToFriday') {
            const weekdays = ['mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
            weekdays.forEach(d => {
                typeSchedule[d] = updatedBlocks.map(b => ({ ...b, id: generateId() }));
            });
        } else {
            typeSchedule[key] = updatedBlocks;
            typeSchedule.fullWeek = [];
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key)) {
                typeSchedule.mondayToFriday = [];
            }
        }

        setSchedule({ ...schedule, [type]: typeSchedule });
    };

    const handleSave = async () => {
        // Run frontend validation for shift durations and overlaps
        const scheduleError = validateFullSchedule(schedule, Number(slotDuration) || 15);
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

            const res = await axiosInstance.patch('/doctor/profile/schedule', { 
                workingHours: cleanedSchedule,
                slotDuration: Number(slotDuration) || 15
            });

            if (res.data?.success) {
                alert('Availability hours saved successfully!');
            } else {
                alert(res.data?.message || 'Error saving details.');
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-clock text-indigo-500 text-xs" /> Schedule Manager
                </h3>

                <div className="flex flex-wrap items-center gap-3">
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
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>
            </div>

            <div className="flex gap-6 border-b border-slate-100 pt-1">
                <button
                    onClick={() => setActiveTab('online')}
                    className={`pb-2 text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'online' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <i className="fas fa-video text-xs" /> Online (Video)
                </button>
                <button
                    onClick={() => setActiveTab('offline')}
                    className={`pb-2 text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'offline' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <i className="fas fa-building-medical text-xs" /> Offline (In-Person)
                </button>
            </div>

            <div className="space-y-3 pt-2">
                {DAYS.map((day) => {
                    const displayLabel = labelMap[day] || day;
                    const blocks = schedule[activeTab]?.[day] || [];
                    const isDayActive = blocks.length > 0;

                    return (
                        <div key={day} className={`p-4 border rounded-xl text-xs transition-all space-y-3 ${isDayActive ? 'bg-indigo-50/20 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isDayActive}
                                        onChange={e => handleToggleDay(activeTab, day, e.target.checked)}
                                        className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                                    />
                                    <div>
                                        <span className="font-bold text-slate-700 text-sm">{displayLabel}</span>
                                        {(day === 'fullWeek' || day === 'mondayToFriday') && (
                                            <div className="text-[10px] text-indigo-500 font-semibold">Bulk Action</div>
                                        )}
                                    </div>
                                </div>

                                {isDayActive && (
                                    <button
                                        type="button"
                                        onClick={() => handleAddBlock(activeTab, day)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm transition-colors"
                                    >
                                        <i className="fas fa-plus text-[9px]"></i>
                                        <span>Add Shift / Break</span>
                                    </button>
                                )}
                            </div>

                            {isDayActive ? (() => {
                                const dayErrors = validateDayBlocks(schedule.online?.[day] || [], schedule.offline?.[day] || [], Number(slotDuration) || 15);
                                return (
                                    <div className="space-y-2 pt-1 border-t border-indigo-50">
                                        {blocks.map((block, idx) => {
                                            const blockError = dayErrors[block.id];
                                            const adjustField = blockError?.suggestion?.fieldToAdjust || 'end';
                                            return (
                                                <div key={block.id || idx} className="space-y-1">
                                                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border ${blockError ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 shadow-sm'}`}>
                                                        {/* Header row on mobile / Inline prefix on desktop */}
                                                        <div className="flex items-center justify-between sm:justify-start gap-2">
                                                            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
                                                                Shift {idx + 1}:
                                                            </span>
                                                            {/* Mobile delete button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveBlock(activeTab, day, block.id)}
                                                                title="Remove this shift"
                                                                className="sm:hidden p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <i className="fas fa-trash-alt text-xs"></i>
                                                            </button>
                                                        </div>

                                                        {/* Time Inputs row */}
                                                        <div className="flex items-center gap-2 flex-1 w-full">
                                                            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Start:</span>
                                                                <input
                                                                    type="time"
                                                                    value={block.start}
                                                                    onChange={e => handleBlockTimeChange(activeTab, day, block.id, 'start', e.target.value)}
                                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-white shadow-xs"
                                                                />
                                                            </div>

                                                            <span className="text-slate-300 font-bold shrink-0">—</span>

                                                            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">End:</span>
                                                                <input
                                                                    type="time"
                                                                    value={block.end}
                                                                    onChange={e => handleBlockTimeChange(activeTab, day, block.id, 'end', e.target.value)}
                                                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-white shadow-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Desktop delete button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveBlock(activeTab, day, block.id)}
                                                            title="Remove this shift"
                                                            className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                        >
                                                            <i className="fas fa-trash-alt text-xs"></i>
                                                        </button>
                                                    </div>
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
                                                                            onClick={() => handleBlockTimeChange(activeTab, day, block.id, adjustField, blockError.suggestion!.roundDownTimeStr!)}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
                                                                        >
                                                                            <i className="fas fa-magic text-[9px] text-amber-600" />
                                                                            <span>Adjust to {blockError.suggestion.roundDownLabel}</span>
                                                                        </button>
                                                                    )}
                                                                    {blockError.suggestion.roundUpTimeStr && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleBlockTimeChange(activeTab, day, block.id, adjustField, blockError.suggestion!.roundUpTimeStr!)}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
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
