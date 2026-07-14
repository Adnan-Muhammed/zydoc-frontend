'use client';

import React from 'react';
import Input from '@/components/ui/Input'; 
import { DraftState, WorkingHours, DailySchedule } from './types';

const DAYS = ['mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

interface StepScheduleSectionProps {
    draft: Pick<DraftState, 'enableVideo' | 'videoFee' | 'enablePhysical' | 'physicalFee' | 'clinicName' | 'clinicAddress' | 'workingHours'>;
    setDraft: (updater: Partial<DraftState>) => void;
}

export default function StepScheduleSection({ draft, setDraft }: StepScheduleSectionProps) {
    const { enableVideo, videoFee, enablePhysical, physicalFee, clinicName, clinicAddress, workingHours } = draft;

    return ( 
        <div className="space-y-8 animate-fade-in py-2 px-1">

            {/* Consultation Setup */}
            <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#24274d] pb-2">
                    Consultation Setup
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Telehealth Card */}
                    <div className={`p-6 rounded-xl border transition-all shadow-md flex flex-col justify-between min-h-[220px] ${enableVideo ? 'border-blue-500/40 bg-blue-500/[0.02]' : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732]'}`}>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <i className="fas fa-video text-blue-500 text-lg"></i>
                                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Telehealth</h4>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={enableVideo}
                                    onChange={(e) => setDraft({ enableVideo: e.target.checked })}
                                    className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none relative checked:bg-blue-600 before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform cursor-pointer shadow-inner"
                                />
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">Enable virtual consultation visits.</p>
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
                                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">In-Person</h4>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={enablePhysical}
                                    onChange={(e) => setDraft({ enablePhysical: e.target.checked })}
                                    className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none relative checked:bg-green-600 before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform cursor-pointer shadow-inner"
                                />
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">Enable physical in-clinic visits.</p>
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
                                        placeholder="Metro Health"
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
                        Standard Availability Hours
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
                                        const dayData = workingHours[type][key];
                                        return (
                                            <div
                                                key={key}
                                                className="bg-white dark:bg-[#151732] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#24274d] flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50"
                                            >
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <input
                                                        type="checkbox"
                                                        checked={dayData.active}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            if (key === 'mondayToFriday') {
                                                                setDraft({
                                                                    workingHours: {
                                                                        ...workingHours,
                                                                        [type]: {
                                                                            ...workingHours[type],
                                                                            mondayToFriday: { ...dayData, active: isChecked },
                                                                            monday: { ...workingHours[type].monday, active: isChecked, start: dayData.start, end: dayData.end },
                                                                            tuesday: { ...workingHours[type].tuesday, active: isChecked, start: dayData.start, end: dayData.end },
                                                                            wednesday: { ...workingHours[type].wednesday, active: isChecked, start: dayData.start, end: dayData.end },
                                                                            thursday: { ...workingHours[type].thursday, active: isChecked, start: dayData.start, end: dayData.end },
                                                                            friday: { ...workingHours[type].friday, active: isChecked, start: dayData.start, end: dayData.end },
                                                                        },
                                                                    },
                                                                });
                                                            } else {
                                                                const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key);
                                                                setDraft({
                                                                    workingHours: {
                                                                        ...workingHours,
                                                                        [type]: {
                                                                            ...workingHours[type],
                                                                            [key]: { ...dayData, active: isChecked },
                                                                            ...(isWeekday && !isChecked ? { mondayToFriday: { ...workingHours[type].mondayToFriday, active: false } } : {})
                                                                        },
                                                                    },
                                                                });
                                                            }
                                                        }}
                                                        className="w-5 h-5 bg-slate-100 border-slate-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                    <div>
                                                         <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 text-sm">
                                                            {key === 'mondayToFriday' ? 'Monday - Friday' : key}
                                                        </span>
                                                        <div className="text-xs text-slate-400 mt-0.5">
                                                            {key === 'mondayToFriday' ? 'Bulk update weekdays' : 'Individual day'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 sm:ml-auto pl-9 sm:pl-0">
                                                    {dayData.active ? (
                                                        <div className="flex items-center gap-2 animate-fade-in w-full sm:w-auto">
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <i className="fas fa-clock text-slate-400 text-xs"></i>
                                                                </div>
                                                                <input
                                                                    type="time"
                                                                    value={dayData.start}
                                                                    onChange={(e) => {
                                                                        const newStart = e.target.value;
                                                                        if (key === 'mondayToFriday') {
                                                                            setDraft({
                                                                                workingHours: {
                                                                                    ...workingHours,
                                                                                    [type]: {
                                                                                        ...workingHours[type],
                                                                                        mondayToFriday: { ...dayData, start: newStart },
                                                                                        monday: { ...workingHours[type].monday, start: newStart },
                                                                                        tuesday: { ...workingHours[type].tuesday, start: newStart },
                                                                                        wednesday: { ...workingHours[type].wednesday, start: newStart },
                                                                                        thursday: { ...workingHours[type].thursday, start: newStart },
                                                                                        friday: { ...workingHours[type].friday, start: newStart },
                                                                                    },
                                                                                },
                                                                            });
                                                                        } else {
                                                                            const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key);
                                                                            setDraft({
                                                                                workingHours: {
                                                                                    ...workingHours,
                                                                                    [type]: {
                                                                                        ...workingHours[type],
                                                                                        [key]: { ...dayData, start: newStart },
                                                                                        ...(isWeekday ? { mondayToFriday: { ...workingHours[type].mondayToFriday, active: false } } : {})
                                                                                    },
                                                                                },
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="pl-8 pr-3 py-2 border border-slate-200 dark:border-[#24274d] bg-slate-50 dark:bg-[#1a1c3d] rounded-lg outline-none text-slate-700 dark:text-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 transition w-full sm:w-32"
                                                                />
                                                            </div>
                                                            <span className="text-slate-400 font-bold text-xs uppercase mx-1">to</span>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                    <i className="fas fa-clock text-slate-400 text-xs"></i>
                                                                </div>
                                                                <input
                                                                    type="time"
                                                                    value={dayData.end}
                                                                    onChange={(e) => {
                                                                        const newEnd = e.target.value;
                                                                        if (key === 'mondayToFriday') {
                                                                            setDraft({
                                                                                workingHours: {
                                                                                    ...workingHours,
                                                                                    [type]: {
                                                                                        ...workingHours[type],
                                                                                        mondayToFriday: { ...dayData, end: newEnd },
                                                                                        monday: { ...workingHours[type].monday, end: newEnd },
                                                                                        tuesday: { ...workingHours[type].tuesday, end: newEnd },
                                                                                        wednesday: { ...workingHours[type].wednesday, end: newEnd },
                                                                                        thursday: { ...workingHours[type].thursday, end: newEnd },
                                                                                        friday: { ...workingHours[type].friday, end: newEnd },
                                                                                    },
                                                                                },
                                                                            });
                                                                        } else {
                                                                            const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(key);
                                                                            setDraft({
                                                                                workingHours: {
                                                                                    ...workingHours,
                                                                                    [type]: {
                                                                                        ...workingHours[type],
                                                                                        [key]: { ...dayData, end: newEnd },
                                                                                        ...(isWeekday ? { mondayToFriday: { ...workingHours[type].mondayToFriday, active: false } } : {})
                                                                                    },
                                                                                },
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="pl-8 pr-3 py-2 border border-slate-200 dark:border-[#24274d] bg-slate-50 dark:bg-[#1a1c3d] rounded-lg outline-none text-slate-700 dark:text-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 transition w-full sm:w-32"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-block px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1a1c3d] text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                                            Closed
                                                        </span>
                                                    )}
                                                </div>
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
