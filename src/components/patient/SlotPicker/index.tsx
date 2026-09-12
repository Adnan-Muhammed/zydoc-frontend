'use client';

import React from 'react';

export interface Slot {
    time: string;               // Display string e.g. "09:00 AM" — for rendering only
    startTimeUTC?: string;      // ISO 8601 UTC e.g. "2026-09-10T03:30:00.000Z"
    endTimeUTC?: string;        // ISO 8601 UTC e.g. "2026-09-10T03:45:00.000Z"
    status: 'available' | 'booked' | 'past' | 'locked' | 'Locked' | 'Booked' | 'unavailable' | 'break' | 'closed' | string;
    available?: boolean;
    isLocked?: boolean;
    lockedBy?: string | null;
    razorpayOrderId?: string | null;
    appointmentId?: string | null;
    isBookable?: boolean;
    isExpired?: boolean;
    isOngoing?: boolean;
    remainingMinutes?: number;
    graceMinutes?: number;
    bookingCutoffMs?: number;
    isFollowUpOnly?: boolean;
    isBreak?: boolean;
    breakReason?: string;
    shiftIndex?: number;
    shiftName?: string;
    shiftStart?: string;
    shiftEnd?: string;
}

interface SlotPickerProps {
    allSlots: Slot[];
    selectedTime: string;
    onTimeSelect: (time: string) => void;
    isLoading?: boolean;
    doctorWorking?: boolean;
    fee?: number;
    consultationType?: string;
    onPaymentResume?: (appointmentId: string, razorpayOrderId: string) => void;
    currentUserId?: string;
    isSlotLocked?: boolean;
    doctorTimezone?: string;
    patientTimezone?: string;
}

function formatTimeInTimezone(isoUtcString: string | undefined, targetTz: string): string | null {
    if (!isoUtcString) return null;
    try {
        const date = new Date(isoUtcString);
        if (isNaN(date.getTime())) return null;
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: targetTz
        }).format(date);
    } catch {
        return null;
    }
}

export default function SlotPicker({ 
    allSlots = [], 
    selectedTime, 
    onTimeSelect, 
    isLoading, 
    doctorWorking = true,
    onPaymentResume,
    currentUserId,
    isSlotLocked = false,
    doctorTimezone,
    patientTimezone
}: SlotPickerProps) {

    const shiftGroups = React.useMemo(() => {
        const groups: { [key: string]: { name: string; start?: string; end?: string; slots: Slot[] } } = {};
        
        allSlots.forEach((slot) => {
            const key = slot.shiftName || `shift_${slot.shiftIndex || 'default'}`;
            if (!groups[key]) {
                groups[key] = {
                    name: slot.shiftName || (slot.shiftIndex ? `Shift ${slot.shiftIndex}` : 'Available Slots'),
                    start: slot.shiftStart,
                    end: slot.shiftEnd,
                    slots: []
                };
            }
            groups[key].slots.push(slot);
        });

        return Object.values(groups);
    }, [allSlots]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                <span>Checking live slot availability…</span>
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
                    <p className="text-amber-800 text-sm font-bold">Doctor not scheduled on this day</p>
                    <p className="text-amber-600 text-xs mt-0.5">Please choose a different date within the 14-day booking window.</p>
                </div>
            </div>
        );
    }

    if (allSlots.length === 0) {
        return (
            <div className="flex flex-col items-center py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <i className="far fa-calendar-times text-slate-400 text-xl" />
                </span>
                <p className="text-slate-700 text-sm font-bold">No slots available</p>
                <p className="text-slate-400 text-xs mt-0.5">Please select another date from the calendar.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-5 ${isSlotLocked ? "pointer-events-none opacity-75" : ""}`}>
            {/* Timezone Context Banner */}
            {doctorTimezone && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-globe text-indigo-500 text-xs" />
                        <span>Doctor's Operating Time: <strong className="text-slate-800">{doctorTimezone}</strong></span>
                    </div>
                    {patientTimezone && patientTimezone !== doctorTimezone && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-[11px] text-indigo-700 font-medium">
                            <i className="far fa-clock text-indigo-500" />
                            <span>Your Time: <strong>{patientTimezone}</strong> (converted on each slot)</span>
                        </div>
                    )}
                </div>
            )}

            {shiftGroups.map((group, groupIdx) => {
                const availableInGroup = group.slots.filter(s => s.status === "available" && !s.isBreak).length;
                const allSlotsInGroupPassed = group.slots.length > 0 && group.slots.every(s => s.status === "past" || s.isExpired);
                const hasShiftMeta = group.name && (group.start || shiftGroups.length > 1);

                return (
                    <div key={`group-${groupIdx}`} className="space-y-2.5">
                        {hasShiftMeta && (
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        {group.name}
                                    </span>
                                    {group.start && group.end && (
                                        <span className="text-xs text-slate-500 font-medium">
                                            ({group.start} – {group.end})
                                        </span>
                                    )}
                                </div>
                                {availableInGroup === 0 && allSlotsInGroupPassed ? (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                        Shift Concluded
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                        {availableInGroup} slot{availableInGroup !== 1 ? 's' : ''} available
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {group.slots.map((slotObj, idx) => {
                                const { 
                                    time: slotTime, 
                                    status, 
                                    isLocked: apiIsLocked, 
                                    lockedBy, 
                                    razorpayOrderId, 
                                    appointmentId, 
                                    isExpired,
                                    isBreak: apiIsBreak,
                                    breakReason,
                                    isOngoing,
                                    remainingMinutes
                                } = slotObj;

                                const isAnyLocked = status === "locked" || status === "Locked" || apiIsLocked === true;
                                const isPendingPayment = isAnyLocked && !!lockedBy && String(lockedBy) === String(currentUserId);
                                const isLockedByMe = (isAnyLocked && selectedTime === slotTime && isSlotLocked) || isPendingPayment;
                                const isLockedByOther = isAnyLocked && !isLockedByMe;
                                const isBooked = status === "booked" || status === "Booked";
                                const isPast = status === "past" || isExpired === true;
                                const isBreak = status === "unavailable" || status === "break" || status === "closed" || apiIsBreak === true || (slotObj.available === false && !isBooked && !isAnyLocked && !isPast);
                                
                                const patientLocalTime = patientTimezone && doctorTimezone && patientTimezone !== doctorTimezone && slotObj.startTimeUTC
                                    ? formatTimeInTimezone(slotObj.startTimeUTC, patientTimezone)
                                    : null;

                                const isDisabled = isLockedByOther || isBooked || isPast || isBreak || status !== "available";
                                const isSelected = selectedTime === slotTime && !isPendingPayment && !isBreak;
                                const isAvailable = status === "available" && !isDisabled && !isPendingPayment && !isBreak;

                                return (
                                    <button
                                        key={`${slotTime}-${idx}`}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => {
                                            if (isPendingPayment && appointmentId && razorpayOrderId && onPaymentResume) {
                                                onPaymentResume(appointmentId, razorpayOrderId);
                                                return;
                                            }
                                            if (isSlotLocked) return;
                                            if (isAvailable) {
                                                onTimeSelect(slotTime);
                                            }
                                        }}
                                        title={
                                            patientLocalTime ? `${slotTime} (${doctorTimezone}) = ${patientLocalTime} (Your local time in ${patientTimezone})`
                                            : isPendingPayment ? "Resume Payment for this slot"
                                            : isLockedByOther ? "Locked by another patient"
                                            : isLockedByMe ? "Locked for your payment"
                                            : isBooked ? "Already booked"
                                            : isBreak ? (breakReason || "Doctor is on break / slot unavailable")
                                            : isPast ? "Slot has passed"
                                            : isOngoing ? `Ongoing session: ~${remainingMinutes} mins remaining upon joining`
                                            : "Click to select"
                                        }
                                        className={`
                                            relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                                            ${isPast
                                                ? "bg-slate-50/50 text-slate-300 border-slate-100 cursor-not-allowed"
                                                : isPendingPayment
                                                    ? "bg-amber-100 text-amber-800 border-amber-400 hover:bg-amber-200 shadow-sm cursor-pointer"
                                                : isLockedByOther
                                                    ? "bg-orange-50 text-orange-600 border-orange-300 font-semibold opacity-75 cursor-not-allowed pointer-events-none"
                                                : isBooked
                                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                                : isBreak
                                                    ? "bg-rose-50/50 text-slate-400 border-rose-200/80 cursor-not-allowed opacity-75 select-none pointer-events-none"
                                                : isSelected
                                                    ? isOngoing 
                                                        ? "bg-amber-50 text-amber-900 border-amber-500 shadow-md ring-2 ring-amber-400/50"
                                                        : "bg-indigo-50 text-indigo-700 border-indigo-600 shadow-md"
                                                : isOngoing
                                                    ? "bg-amber-50/60 text-amber-900 border-amber-300 hover:border-amber-400 hover:bg-amber-100/50 shadow-xs"
                                                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm"
                                            }
                                        `}
                                    >
                                        <span className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${isPast || isBooked || isLockedByOther || isBreak ? 'opacity-60' : ''}`}>
                                            {isAnyLocked && !isPendingPayment && <i className="fas fa-lock text-[10px] opacity-70" />}
                                            {isBreak && <i className="fas fa-ban text-[10px] text-rose-500/80" />}
                                            {isOngoing && isAvailable && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                            {slotTime}
                                        </span>

                                        {patientLocalTime && !isPast && !isBooked && !isBreak && (
                                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-tight">
                                                {patientLocalTime}
                                            </span>
                                        )}

                                        {isOngoing && isAvailable && (
                                            <span className="text-[8.5px] font-extrabold uppercase tracking-tight text-amber-700 bg-amber-100/90 border border-amber-300/80 px-1.5 py-0.5 rounded-md mt-0.5">
                                                Live • {remainingMinutes}m
                                            </span>
                                        )}
                                        {isPendingPayment && (
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 mt-0.5">Resume Pay</span>
                                        )}
                                        {isBooked && (
                                            <span className="text-[9px] font-black tracking-wider uppercase mt-0.5 text-slate-400">Booked</span>
                                        )}
                                        {isBreak && (
                                            <span className="text-[8px] sm:text-[8.5px] font-extrabold tracking-wider uppercase mt-0.5 text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                                Unavailable
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* In-Progress / Ongoing Slot Acknowledgment Notice */}
            {(() => {
                const selectedSlotObj = allSlots.find(s => s.time === selectedTime);
                if (selectedSlotObj && selectedSlotObj.isOngoing) {
                    return (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
                            <span className="text-amber-600 text-sm mt-0.5 font-bold">⚡</span>
                            <div>
                                <p className="font-bold">Ongoing Consultation Notice</p>
                                <p className="text-amber-800 text-[11px] mt-0.5">
                                    This time slot is currently in progress. Upon completing payment and joining, you will have approximately <strong>{selectedSlotObj.remainingMinutes} minutes</strong> of consultation remaining.
                                </p>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}
        </div>
    );
}
