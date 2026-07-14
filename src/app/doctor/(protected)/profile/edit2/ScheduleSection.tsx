'use client';
  
import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { useRouter } from 'next/navigation';

export default function ScheduleSection({ initialData, consultationSettings }: { initialData: any, consultationSettings?: any }) {
    const router = useRouter();
    // initialData is the new workingHours object: { online: {...}, offline: {...} }
    const [schedule, setSchedule] = useState(initialData);
    const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online');

    const [clinicName, setClinicName] = useState(consultationSettings?.physical?.clinicName || '');
    const [clinicAddress, setClinicAddress] = useState(consultationSettings?.physical?.clinicAddress || '');

    useEffect(() => {
        setSchedule(initialData); 
        setClinicName(consultationSettings?.physical?.clinicName || '');
        setClinicAddress(consultationSettings?.physical?.clinicAddress || '');
    }, [initialData, consultationSettings]);

    const [loading, setLoading] = useState(false);

    const handleTimeChange = (type: 'online' | 'offline', day: string, field: 'start' | 'end' | 'active', val: any) => {
        if (day === 'fullWeek') {
            const daysToUpdate = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const typeSchedule = { ...schedule[type] };
            daysToUpdate.forEach(d => {
                if (!typeSchedule[d]) typeSchedule[d] = { start: '09:00', end: '17:00', active: false };
                typeSchedule[d] = { ...typeSchedule[d], [field]: val };
            });
            setSchedule({ ...schedule, [type]: typeSchedule });
            return;
        } 

        setSchedule({
            ...schedule,
            [type]: {
                ...schedule[type],
                [day]: { ...(schedule[type][day] || { start: '09:00', end: '17:00', active: false }), [field]: val }
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.patch('/doctor/profile/schedule', { workingHours: schedule });

            if (activeTab === 'offline') {
                const isOfflineActive = Object.values(schedule.offline || {}).some((slot: any) => slot.active);
                const consultationPayload = { 
                    enableVideo: consultationSettings?.video?.enabled ?? false, 
                    videoFee: consultationSettings?.video?.fee ?? 0, 
                    enablePhysical: isOfflineActive || !!clinicName || (consultationSettings?.physical?.enabled ?? false), 
                    physicalFee: consultationSettings?.physical?.fee ?? 0, 
                    clinicName: clinicName, 
                    clinicAddress: clinicAddress 
                };
                await axiosInstance.patch('/doctor/profile/consultation', consultationPayload);
            }

            if (res.data?.success) {
                alert('Availability hours saved successfully!');
                router.refresh();
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

    const days = ['fullWeek', 'mondayToFriday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
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

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-clock text-indigo-500 text-xs" /> Operational Availability
                </h3>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
                >
                    {loading ? 'Saving...' : 'Save Schedule'}
                </button>
            </div>

            <div className="flex gap-6 border-b border-slate-100 pt-2">
                <button
                    onClick={() => setActiveTab('online')}
                    className={`pb-2 text-sm font-bold transition-all ${activeTab === 'online' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Online (Video)
                </button>
                <button
                    onClick={() => setActiveTab('offline')}
                    className={`pb-2 text-sm font-bold transition-all ${activeTab === 'offline' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Offline (In-Person)
                </button>
            </div>

            {activeTab === 'offline' && (
                <div className="pt-2 space-y-4 border-b border-slate-100 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic / Hospital Name</label>
                            <input 
                                type="text" 
                                value={clinicName} 
                                onChange={e => setClinicName(e.target.value)} 
                                placeholder="e.g. Neuro Care Hub" 
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic / Hospital Address</label>
                            <input 
                                type="text" 
                                value={clinicAddress} 
                                onChange={e => setClinicAddress(e.target.value)} 
                                placeholder="Street, City, Pin" 
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                            />
                        </div>
                    </div>
                </div>
            )}

            {(() => {
                const isTabEnabled = activeTab === 'online' 
                    ? consultationSettings?.video?.enabled 
                    : consultationSettings?.physical?.enabled;

                if (!isTabEnabled) {
                    return (
                        <div className="flex flex-col items-center justify-center py-10 mt-2 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                <i className={`fas ${activeTab === 'online' ? 'fa-video-slash' : 'fa-door-closed'} text-slate-400 text-lg`} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-bold text-slate-700">Currently Unavailable</h4>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                                    {activeTab === 'online' 
                                        ? 'Video Telehealth is disabled. Please enable it in the Consultation section to set your online availability.' 
                                        : 'In-Person Clinic Visits are disabled. Please enable it in the Consultation section to set your offline availability.'}
                                </p>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="space-y-3 pt-2">
                        {schedule && schedule[activeTab] && days.map((day) => {
                            const displayLabel = labelMap[day] || day;
                            const slot = schedule[activeTab][day];
                            if (!slot && day !== 'fullWeek') return null; // Safe guard
                            const currentSlot = slot || { start: '09:00', end: '17:00', active: false };

                            return (
                                <div key={day} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-xl text-xs transition-all ${currentSlot.active ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100'
                                    }`}>

                                    {/* Active Checkbox and Title Row */}
                                    <div className="flex items-center gap-3 sm:w-1/3">
                                        <input
                                            type="checkbox"
                                            checked={currentSlot.active}
                                            onChange={e => handleTimeChange(activeTab, day, 'active', e.target.checked)}
                                            className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                                        />
                                        <div>
                                            <span className="font-bold text-slate-700">{displayLabel}</span>
                                            {(day === 'fullWeek' || day === 'mondayToFriday') && (
                                                <div className="text-[10px] text-indigo-500 font-semibold mt-0.5">Bulk Update</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Conditional Time Range Slot Selection */}
                                    {currentSlot.active ? (
                                        <div className="flex items-center gap-2 sm:w-2/3 justify-start sm:justify-end">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Start:</span>
                                                <input
                                                    type="time"
                                                    value={currentSlot.start}
                                                    onChange={e => handleTimeChange(activeTab, day, 'start', e.target.value)}
                                                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                            <span className="text-slate-300 mx-1">—</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">End:</span>
                                                <input
                                                    type="time"
                                                    value={currentSlot.end}
                                                    onChange={e => handleTimeChange(activeTab, day, 'end', e.target.value)}
                                                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic font-medium sm:w-2/3 text-start sm:text-end">Closed</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })()}
        </div>
    );
} 