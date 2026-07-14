'use client';

import React from 'react';

interface Slot {
    time: string;
    status: 'available' | 'booked' | 'past';
    available: boolean;
}

interface SlotPickerProps {
    allSlots: Slot[];
    selectedTime: string;
    onTimeSelect: (time: string) => void;
    isLoading?: boolean;
    doctorWorking?: boolean;
}

export default function SlotPicker({ allSlots, selectedTime, onTimeSelect, isLoading, doctorWorking }: SlotPickerProps) {
    const formatTime = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                Checking availability…
            </div>
        );
    }

    if (!doctorWorking) {
        return (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-calendar-xmark text-amber-500 text-sm" />
                </span>
                <div>
                    <p className="text-amber-700 text-sm font-semibold">Doctor not available on this day</p>
                    <p className="text-amber-600 text-xs mt-0.5">Please choose a different date from the calendar above.</p>
                </div>
            </div>
        );
    }

    if (allSlots.length === 0) {
        return (
            <div className="flex flex-col items-center py-8 text-center">
                <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <i className="far fa-calendar-times text-slate-400 text-xl" />
                </span>
                <p className="text-slate-600 text-sm font-semibold">No slots configured</p>
                <p className="text-slate-400 text-xs mt-1">Try a different date or consultation type.</p>
            </div>
        );
    }

    const hasAvailable = allSlots.some(s => s.status === 'available');

    if (!hasAvailable) {
        return (
            <>
                <div className="flex items-start gap-3 p-3 mb-3 bg-sky-50 border border-sky-200 rounded-xl">
                    <i className="fas fa-info-circle text-sky-500 mt-0.5 text-sm" />
                    <p className="text-sky-700 text-xs">
                        All slots for this date are {allSlots.every(s => s.status === "past") ? "in the past" : "fully booked"}.
                        Please pick another date.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {allSlots.map(({ time: slot, status }) => (
                        <span key={slot}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-not-allowed
                                ${status === "past"
                                    ? "bg-slate-50 text-slate-300 border-slate-100"
                                    : "bg-slate-100 text-slate-400 border-slate-200"
                                }`}>
                            {formatTime(slot)}
                            {status === "booked" && <span className="ml-1 text-[9px] uppercase">Booked</span>}
                        </span>
                    ))}
                </div>
            </>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {allSlots.map(({ time: slot, status }) => {
                const isSelected = selectedTime === slot;
                const isAvailable = status === "available";
                const isBooked = status === "booked";
                const isPst = status === "past";

                return (
                    <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && onTimeSelect(slot)}
                        title={
                            isBooked ? "Already booked"
                            : isPst  ? "Time has passed"
                            : "Click to select"
                        }
                        className={`
                            relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                            ${isPst
                                ? "bg-slate-50/50 text-slate-300 border-slate-100 cursor-not-allowed"
                                : isBooked
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : isSelected
                                        ? "bg-indigo-50 text-indigo-700 border-indigo-600 shadow-sm"
                                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm"
                            }
                        `}
                    >
                        <span className={`text-sm font-bold ${isPst || isBooked ? 'opacity-70' : ''}`}>
                            {formatTime(slot)}
                        </span>
                        {isBooked && (
                            <span className="text-[10px] font-black tracking-wider uppercase mt-1 text-slate-400">Booked</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
