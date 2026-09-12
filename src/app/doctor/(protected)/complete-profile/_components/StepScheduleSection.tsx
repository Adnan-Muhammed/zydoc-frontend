'use client';

import React from 'react';
import Input from '@/components/ui/Input'; 
import { DraftState, WorkingHours, DailySchedule, TimeBlock } from './types';
import { validateDayBlocks, snapToNearest5Mins } from '@/utils/scheduleValidator';

const DAYS = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

const DURATION_OPTIONS = [
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes (Standard)' }, 
    { value: 20, label: '20 Minutes' },
    { value: 30, label: '30 Minutes' },
    { value: 45, label: '45 Minutes' },
    { value: 60, label: '60 Minutes (1 Hour)' },
];

interface StepScheduleSectionProps {
    draft: Pick<DraftState, 'enableVideo' | 'videoFee' | 'enablePhysical' | 'physicalFee' | 'clinicName' | 'clinicAddress' | 'workingHours' | 'slotDuration' | 'timezone'>;
    setDraft: (updater: Partial<DraftState>) => void;
}

export default function StepScheduleSection({ draft, setDraft }: StepScheduleSectionProps) {
    const { enableVideo, videoFee, enablePhysical, physicalFee, clinicName, clinicAddress, workingHours, slotDuration = 15, timezone } = draft;

    React.useEffect(() => {
        if (!timezone && typeof Intl !== 'undefined') {
            const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (detected) {
                setDraft({ timezone: detected });
            }
        }
    }, [timezone, setDraft]);

    const activeTimezone = timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata');

    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Toggle active state for a day (or bulk group)
    const handleToggleDay = (type: 'online' | 'offline', key: typeof DAYS[number], checked: boolean) => {
        const typeSchedule = { ...workingHours[type] };

        const defaultBlock: TimeBlock[] = [{ id: generateId(), start: '09:00', end: '17:00' }];
        const newBlocks: TimeBlock[] = checked ? defaultBlock : [];

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
            // Unset bulk flags
            typeSchedule.fullWeek = [];
            if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key)) {
                typeSchedule.mondayToFriday = [];
            }
        }

        setDraft({
            workingHours: {
                ...workingHours,
                [type]: typeSchedule,
            }
        });
    };

    // Update specific time block in a day
    const handleBlockTimeChange = (type: 'online' | 'offline', key: typeof DAYS[number], blockId: string, field: 'start' | 'end', val: string) => {
        const typeSchedule = { ...workingHours[type] };
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

        setDraft({
            workingHours: {
                ...workingHours,
                [type]: typeSchedule,
            }
        });
    };

    // Add a new session/break block to a day
    const handleAddBlock = (type: 'online' | 'offline', key: typeof DAYS[number]) => {
        const typeSchedule = { ...workingHours[type] };
        const currentBlocks = typeSchedule[key] || [];

        // Estimate next reasonable block interval
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

        setDraft({
            workingHours: {
                ...workingHours,
                [type]: typeSchedule,
            }
        });
    };

    // Remove a session block from a day
    const handleRemoveBlock = (type: 'online' | 'offline', key: typeof DAYS[number], blockId: string) => {
        const typeSchedule = { ...workingHours[type] };
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

        setDraft({
            workingHours: {
                ...workingHours,
                [type]: typeSchedule,
            }
        });
    };

    return ( 
        <div className="space-y-8 animate-fade-in py-2 px-1">

            {/* Consultation Setup */}
            <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#24274d] pb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Consultation Channels & Duration
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Timezone Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm" title="Doctor's Operating Timezone (Auto-detected)">
                            <i className="fas fa-globe text-blue-500 text-xs"></i>
                            <span>Operating Timezone: <strong>{activeTimezone}</strong></span>
                        </div>

                        {/* Consultation Duration Field */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                <i className="fas fa-hourglass-half text-blue-500 mr-1.5"></i>
                                Slot Duration:
                            </label>
                            <select
                                value={slotDuration}
                                onChange={(e) => setDraft({ slotDuration: Number(e.target.value) })}
                                className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732] text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
                            >
                                {DURATION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Telehealth Card */}
                    <div className={`p-6 rounded-xl border transition-all shadow-md flex flex-col justify-between min-h-[220px] ${enableVideo ? 'border-blue-500/40 bg-blue-500/[0.02]' : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732]'}`}>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <i className="fas fa-video text-blue-500 text-lg"></i>
                                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Telehealth (Online)</h4>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={enableVideo}
                                    onChange={(e) => setDraft({ enableVideo: e.target.checked })}
                                    className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none relative checked:bg-blue-600 before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform cursor-pointer shadow-inner"
                                />
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">Enable virtual consultations via secure video calls.</p>
                        </div>
                        {enableVideo && (
                            <Input
                                label="Fee (INR) *"
                                type="number"
                                min="0"
                                value={videoFee}
                                onChange={(e) => setDraft({ videoFee: e.target.value })}
                                className="dark:bg-[#151732] dark:border-[#24274d] text-sm sm:text-base py-3 font-bold"
                                required
                            />
                        )}
                    </div>

                    {/* In-Person Card */}
                    <div className={`p-6 rounded-xl border transition-all shadow-md flex flex-col justify-between min-h-[220px] ${enablePhysical ? 'border-green-500/40 bg-green-500/[0.01]' : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732]'}`}>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <i className="fas fa-building-medical text-green-500 text-lg"></i>
                                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">In-Person (Offline)</h4>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={enablePhysical}
                                    onChange={(e) => setDraft({ enablePhysical: e.target.checked })}
                                    className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none relative checked:bg-green-600 before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform cursor-pointer shadow-inner"
                                />
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">Enable physical clinic consultations.</p>
                        </div>
                        {enablePhysical && (
                            <div className="space-y-4 animate-fade-in border-t border-slate-100 dark:border-[#24274d] pt-4 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Fee (INR) *"
                                        type="number"
                                        min="0"
                                        value={physicalFee}
                                        onChange={(e) => setDraft({ physicalFee: e.target.value })}
                                        className="dark:bg-[#151732] dark:border-[#24274d] text-sm sm:text-base py-3 font-bold"
                                        required
                                    />
                                    <Input
                                        label="Clinic Title *"
                                        value={clinicName}
                                        onChange={(e) => setDraft({ clinicName: e.target.value })}
                                        placeholder="Metro Health Clinic"
                                        className="dark:bg-[#151732] dark:border-[#24274d] text-sm sm:text-base py-3 font-bold placeholder:font-normal"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Clinic Address *</label>
                                    <textarea
                                        rows={2}
                                        value={clinicAddress}
                                        onChange={(e) => setDraft({ clinicAddress: e.target.value })}
                                        placeholder="City, State PIN Code"
                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition placeholder:text-slate-400 shadow-sm font-bold placeholder:font-normal resize-none"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Standard Availability Hours */}
            {(enableVideo || enablePhysical) && (
                <div className="space-y-6 pt-2 animate-fade-in">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#24274d] pb-1.5">
                        Standard Availability Hours (Multiple Shifts & Breaks)
                    </h3>

                    {(['online', 'offline'] as const)
                        .filter((type) => (type === 'online' ? enableVideo : enablePhysical))
                        .map((type) => (
                            <div key={type} className="space-y-4">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 capitalize flex items-center gap-2">
                                    {type === 'online' ? <i className="fas fa-video text-blue-500"></i> : <i className="fas fa-building-medical text-green-500"></i>}
                                    {type} Schedule
                                </h4>
                                <div className="space-y-3">
                                    {DAYS.map((key) => {
                                        const blocks = workingHours[type][key] || [];
                                        const isDayActive = blocks.length > 0;

                                        return (
                                            <div
                                                key={key}
                                                className="bg-white dark:bg-[#151732] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#24274d] flex flex-col gap-3 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50"
                                            >
                                                {/* Header row: Checkbox, Day name, and Add Block button */}
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={isDayActive}
                                                            onChange={(e) => handleToggleDay(type, key, e.target.checked)}
                                                            className="w-5 h-5 bg-slate-100 border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                        <div>
                                                            <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 text-sm">
                                                                {key === 'fullWeek' ? 'Full Week (Mon-Sun)' : key === 'mondayToFriday' ? 'Monday - Friday' : key}
                                                            </span>
                                                            <div className="text-xs text-slate-400 mt-0.5">
                                                                {key === 'fullWeek' || key === 'mondayToFriday' ? 'Bulk update for all corresponding days' : 'Individual day schedule'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isDayActive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddBlock(type, key)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/30"
                                                        >
                                                            <i className="fas fa-plus text-[10px]"></i>
                                                            <span>Add Shift / Break</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Shift Blocks Container */}
                                                {isDayActive ? (() => {
                                                    const onlineBlocks = enableVideo ? (workingHours.online[key as keyof typeof workingHours.online] || []) : [];
                                                    const offlineBlocks = enablePhysical ? (workingHours.offline[key as keyof typeof workingHours.offline] || []) : [];
                                                    const dayErrors = validateDayBlocks(
                                                        type === 'online' && !enablePhysical ? (workingHours.online[key as keyof typeof workingHours.online] || []) : onlineBlocks,
                                                        type === 'offline' && !enableVideo ? (workingHours.offline[key as keyof typeof workingHours.offline] || []) : offlineBlocks,
                                                        Number(slotDuration) || 15
                                                    );
                                                    return (
                                                        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#24274d]/60">
                                                            {blocks.map((block, idx) => {
                                                                const blockError = dayErrors[block.id];
                                                                const adjustField = blockError?.suggestion?.fieldToAdjust || 'end';
                                                                return (
                                                                    <div key={block.id || idx} className="space-y-1">
                                                                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-[#1a1c3d]/60 p-3 rounded-xl border ${blockError ? 'border-amber-400 dark:border-amber-500/50' : 'border-slate-100 dark:border-[#24274d]/40'}`}>
                                                                            {/* Header row on mobile / Inline prefix on desktop */}
                                                                            <div className="flex items-center justify-between sm:justify-start gap-2">
                                                                                <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
                                                                                    Shift {idx + 1}:
                                                                                </span>
                                                                                {/* Mobile delete button */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveBlock(type, key, block.id)}
                                                                                    title="Remove this shift"
                                                                                    className="sm:hidden p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                                                >
                                                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                                                </button>
                                                                            </div>

                                                                            {/* Time Inputs row */}
                                                                            <div className="flex items-center gap-2 flex-1 w-full">
                                                                                {/* Start Time */}
                                                                                <div className="relative flex-1 min-w-0">
                                                                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                                                        <i className="fas fa-clock text-slate-400 text-xs"></i>
                                                                                    </div>
                                                                                    <input
                                                                                        type="time"
                                                                                        value={block.start}
                                                                                        onChange={(e) => handleBlockTimeChange(type, key, block.id, 'start', e.target.value)}
                                                                                        className="w-full pl-7 pr-2.5 py-1.5 border border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732] rounded-lg outline-none text-slate-700 dark:text-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 transition"
                                                                                    />
                                                                                </div>

                                                                                <span className="text-slate-400 font-bold text-xs uppercase shrink-0">to</span>

                                                                                {/* End Time */}
                                                                                <div className="relative flex-1 min-w-0">
                                                                                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                                                        <i className="fas fa-clock text-slate-400 text-xs"></i>
                                                                                    </div>
                                                                                    <input
                                                                                        type="time"
                                                                                        value={block.end}
                                                                                        onChange={(e) => handleBlockTimeChange(type, key, block.id, 'end', e.target.value)}
                                                                                        className="w-full pl-7 pr-2.5 py-1.5 border border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732] rounded-lg outline-none text-slate-700 dark:text-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 transition"
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            {/* Desktop delete button */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveBlock(type, key, block.id)}
                                                                                title="Remove this shift"
                                                                                className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                                                                            >
                                                                                <i className="fas fa-trash-alt text-xs"></i>
                                                                            </button>
                                                                        </div>
                                                                        {blockError && (
                                                                            <div className="space-y-1.5 pl-1 pt-0.5">
                                                                                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                                                                    <span>⚠️</span>
                                                                                    <span>{blockError.message}</span>
                                                                                </p>
                                                                                {blockError.suggestion && (
                                                                                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                                                                        {blockError.suggestion.roundDownTimeStr && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleBlockTimeChange(type, key, block.id, adjustField, blockError.suggestion!.roundDownTimeStr!)}
                                                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
                                                                                            >
                                                                                                <i className="fas fa-magic text-[9px] text-amber-600 dark:text-amber-400" />
                                                                                                <span>Adjust to {blockError.suggestion.roundDownLabel}</span>
                                                                                            </button>
                                                                                        )}
                                                                                        {blockError.suggestion.roundUpTimeStr && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleBlockTimeChange(type, key, block.id, adjustField, blockError.suggestion!.roundUpTimeStr!)}
                                                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
                                                                                            >
                                                                                                <i className="fas fa-magic text-[9px] text-amber-600 dark:text-amber-400" />
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
                                                    <div className="pt-1">
                                                        <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1a1c3d] text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                                            Closed
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                </div>
            )}

        </div>
    );
}
