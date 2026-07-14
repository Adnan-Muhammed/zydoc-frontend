'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from '@/redux/hooks';
import axiosInstance from '@/api/axiosInstance';
import SlotPicker from "@/components/patient/SlotPicker"; // We can reuse this!
 
const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
]; 
const DAY_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function ScheduleClient() {
    const { user } = useAppSelector((state) => state.auth);
    
    const isVideoEnabled = user?.consultationSettings?.video?.enabled ?? user?.doctorProfile?.consultationSettings?.video?.enabled ?? false;
    const isPhysicalEnabled = user?.consultationSettings?.physical?.enabled ?? user?.doctorProfile?.consultationSettings?.physical?.enabled ?? false;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    
    const [type, setType] = useState<"video" | "physical">(() => {
        if (!isVideoEnabled && isPhysicalEnabled) return "physical";
        return "video";
    });
    
    const [allSlots, setAllSlots] = useState<any[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [doctorWorking, setDoctorWorking] = useState(true);
    const [selectedTime, setSelectedTime] = useState(""); // Doctor won't actually book, but can select to highlight
    
    // Fetch slots when date or type changes
    useEffect(() => {
        if (!user?._id && !user?.id) return;
        const doctorId = user?._id || user?.id;

        let isMounted = true;
        const fetchSlots = async () => {
            setIsLoadingSlots(true);
            setAllSlots([]);
            setDoctorWorking(true);

            try {
                // Ensure local date is sent formatted correctly (YYYY-MM-DD)
                const y = selectedDate.getFullYear();
                const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const d = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${y}-${m}-${d}`;

                const res = await axiosInstance.get(`/appointments/availability/${doctorId}?date=${dateStr}&consultationType=${type}`);
                
                if (isMounted && res.data.success) {
                    setAllSlots(res.data.allSlots || []);
                    setDoctorWorking(res.data.doctorWorking);
                }
            } catch (err) {
                console.error("Failed to fetch slots:", err);
            } finally {
                if (isMounted) setIsLoadingSlots(false);
            }
        };

        fetchSlots();

        return () => { isMounted = false; };
    }, [selectedDate, type, user]);

    // Calendar Helpers
    const buildCalendarDays = useCallback(() => {
        const firstDay = new Date(calendarYear, calendarMonth, 1);
        const lastDay  = new Date(calendarYear, calendarMonth + 1, 0);
        const days = [];

        // Adjust so Monday is 0, Sunday is 6
        let startJsDay = firstDay.getDay();
        startJsDay = startJsDay === 0 ? 6 : startJsDay - 1;

        for (let i = 0; i < startJsDay; i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(calendarYear, calendarMonth, i));
        }
        return days;
    }, [calendarYear, calendarMonth]);

    const goToPrevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(y => y - 1);
        } else {
            setCalendarMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(y => y + 1);
        } else {
            setCalendarMonth(m => m + 1);
        }
    };

    const isSameDay = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const today = new Date();
    
    const calendarDays = buildCalendarDays();
    const availableCount = allSlots.filter(s => s.status === "available").length;

    return (
        <div className="flex-1 bg-slate-100 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">My Schedule</h1>
                    <p className="mt-1 text-slate-500">View your daily availability and upcoming appointments.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
                    
                    {/* Consultation Type Toggle */}
                    {(isVideoEnabled || isPhysicalEnabled) && (
                        <div className="mb-6">
                            <label className="text-sm font-semibold text-slate-700 mb-3 block">Viewing Schedule For</label>
                            <div className="flex gap-3">
                                {isVideoEnabled && (
                                    <button
                                        onClick={() => setType('video')}
                                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                                            type === 'video' 
                                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <i className="fas fa-video"></i> Online Consultation
                                    </button>
                                )}
                                {isPhysicalEnabled && (
                                    <button
                                        onClick={() => setType('physical')}
                                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                                            type === 'physical' 
                                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <i className="fas fa-building-medical"></i> In-Person Clinic
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                        {/* ── Calendar ── */}
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            {/* Header row */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <i className="fas fa-calendar-alt text-indigo-600 text-xs" />
                                    </span>
                                    Select Date
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-700">
                                        {MONTH_NAMES[calendarMonth]} {calendarYear}
                                    </span>
                                    <div className="flex gap-1">
                                        <button type="button" onClick={goToPrevMonth}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm">
                                            <i className="fas fa-chevron-left text-[10px]" />
                                        </button>
                                        <button type="button" onClick={goToNextMonth}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm">
                                            <i className="fas fa-chevron-right text-[10px]" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Day-of-week headers */}
                            <div className="grid grid-cols-7 mb-1">
                                {DAY_LABELS.map(d => (
                                    <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1.5">{d}</div>
                                ))}
                            </div>

                            {/* Date cells */}
                            <div className="grid grid-cols-7 gap-y-1">
                                {calendarDays.map((day, idx) => {
                                    if (!day) return <div key={`e-${idx}`} />;
                                    const selected = isSameDay(day, selectedDate);
                                    const isToday  = isSameDay(day, today);

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDate(day);
                                                setCalendarYear(day.getFullYear());
                                                setCalendarMonth(day.getMonth());
                                            }}
                                            className={`
                                                mx-auto flex flex-col items-center justify-center w-11 h-12 rounded-xl
                                                transition-all duration-150
                                                ${selected
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                    : isToday
                                                        ? "border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 bg-white"
                                                        : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 bg-white"
                                                }
                                            `}
                                        >
                                            <span className={`text-sm leading-none font-bold`}>
                                                {day.getDate()}
                                            </span>
                                            <span className={`text-[9px] leading-none mt-0.5 font-medium
                                                ${selected ? "text-indigo-200" : "text-slate-400"}`}>
                                                {MONTH_NAMES[day.getMonth()].slice(0, 3)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Time slots ── */}
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <i className="fas fa-clock text-indigo-600 text-xs" />
                                    </span>
                                    Slots Overview
                                    <span className="text-[11px] font-normal text-slate-400">
                                        — {MONTH_NAMES[selectedDate.getMonth()].slice(0,3)} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                                    </span>
                                </h2>
                                {!isLoadingSlots && doctorWorking && allSlots.length > 0 && (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        {availableCount} slot{availableCount !== 1 ? "s" : ""} free
                                    </span>
                                )}
                            </div>

                            <SlotPicker 
                                allSlots={allSlots} 
                                selectedTime={selectedTime}
                                onTimeSelect={setSelectedTime}
                                isLoading={isLoadingSlots}
                                doctorWorking={doctorWorking}
                            />

                            {/* Slot legend */}
                            {allSlots.length > 0 && (
                                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 mt-6 pt-4 border-t border-slate-50">
                                    {[
                                        { color: "bg-white border border-slate-300", label: "Available" },
                                        { color: "bg-slate-200",   label: "Booked"    },
                                        { color: "bg-slate-100",   label: "Past"      },
                                    ].map(({ color, label }) => (
                                        <span key={label} className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
