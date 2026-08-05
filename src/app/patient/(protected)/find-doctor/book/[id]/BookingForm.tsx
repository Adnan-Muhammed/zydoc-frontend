"use client";
 
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAppointment, getAvailableSlots } from "@/lib/appointments";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { lockSlot, unlockSlot, createRazorpayOrder, verifyPayment } from "@/redux/features/appointment/appointmentThunk";
import SlotPicker from "@/components/patient/SlotPicker";

/* ═══════════════════════════════════════════════════════════════════
   Constants
═══════════════════════════════════════════════════════════════════ */
const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
]; 
const DAY_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_NAMES_JS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
const DAY_KEYS     = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday","mondayToFriday"];

/* ═══════════════════════════════════════════════════════════════════
   WorkingHours helpers (mirrors backend resolveWorkingHours exactly)
═══════════════════════════════════════════════════════════════════ */
function resolveWorkingHours(rawWH: any, consultationType: string) {
    const channelKey = consultationType === "physical" ? "offline" : "online";
    const channelObj: any = rawWH?.[channelKey] || {};

    // New nested format: channel object has day-level keys with start/end
    const channelHasDays = DAY_KEYS.some(k => channelObj[k]?.start !== undefined);
    if (channelHasDays) return channelObj;

    // Old flat format: workingHours itself has day-level keys
    const flatHasDays = DAY_KEYS.some(k => rawWH?.[k]?.start !== undefined);
    if (flatHasDays) return rawWH;

    return {};
}

function isDoctorAvailableOn(date: Date, rawWH: any, consultationType: string): boolean {
    const wh = resolveWorkingHours(rawWH, consultationType);
    const hasAnyConfig = Object.keys(wh).length > 0;
    const jsDay   = date.getDay();
    const dayName = DAY_NAMES_JS[jsDay] as string;
    const isWeekday = jsDay >= 1 && jsDay <= 5;

    if (!hasAnyConfig) return isWeekday; // MVP fallback: open Mon–Fri

    let sch: any = wh[dayName];
    if ((!sch || !sch.active) && isWeekday && wh.mondayToFriday?.active) {
        sch = wh.mondayToFriday;
    }
    if (!sch) return isWeekday;
    return sch.active === true;
}

/* ═══════════════════════════════════════════════════════════════════
   Find next working date
   - Checks the RECURRING weekly pattern: mondayToFriday covers every
     Mon–Fri throughout the entire year; saturday covers every Saturday.
   - Skips today if the doctor's shift end time has already passed.
   - Scans up to 60 days ahead.
═══════════════════════════════════════════════════════════════════ */

/**
 * Returns the local end-of-shift time for a given date, or null if the
 * day has no schedule. Used to decide whether today still has future slots.
 */
function getDayEndTime(rawWH: any, consultationType: string, d: Date): Date | null {
    const wh = resolveWorkingHours(rawWH, consultationType);
    const dayName  = DAY_NAMES_JS[d.getDay()] as string;
    const isWeekday = d.getDay() >= 1 && d.getDay() <= 5;

    let sch: any = wh[dayName];
    if ((!sch || !sch.active) && isWeekday && wh.mondayToFriday?.active)
        sch = wh.mondayToFriday;

    // MVP fallback for unconfigured weekdays
    const hasAnyActive = Object.values(wh).some((s: any) => s?.active === true);
    if (!sch?.active && !hasAnyActive && isWeekday)
        sch = { end: '17:00' };

    if (!sch?.end || sch.end === '00:00') return null;

    const [endH, endM] = sch.end.split(':').map(Number);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), endH, endM, 0, 0);
}

function findNextWorkingDate(rawWH: any, consultationType: string): Date {
    const now   = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);

        // Skip if the doctor doesn't work on this day-of-week at all
        // (mondayToFriday covers every Monday–Friday of the year;
        //  saturday covers every Saturday of the year, etc.)
        if (!isDoctorAvailableOn(d, rawWH, consultationType)) continue;

        // For today only: skip if the shift end time has already passed
        if (i === 0) {
            const shiftEnd = getDayEndTime(rawWH, consultationType, d);
            if (shiftEnd && now >= shiftEnd) continue;
        }

        return d;
    }
    return today; // absolute fallback
}

/* ═══════════════════════════════════════════════════════════════════
   Generate Half Hour Slots
═══════════════════════════════════════════════════════════════════ */
function generateHalfHourSlots(rawWH: any, consultationType: string, date: Date) {
    const wh = resolveWorkingHours(rawWH, consultationType);
    const dayName = DAY_NAMES_JS[date.getDay()] as string;
    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;

    let sch: any = wh[dayName];
    if ((!sch || !sch.active) && isWeekday && wh.mondayToFriday?.active) {
        sch = wh.mondayToFriday;
    }

    const hasAnyActive = Object.values(wh).some((s: any) => s?.active === true);
    if (!sch?.active && !hasAnyActive && isWeekday) {
        sch = { start: '09:00', end: '17:00', active: true };
    }

    if (!sch || !sch.active || !sch.start || !sch.end || sch.start === '00:00') return [];

    const slots: { time: string; status: "available"|"booked"|"past"|"locked"|"Locked"|"Booked"|string; available: boolean; isLocked?: boolean }[] = [];
    const [startH, startM] = sch.start.split(':').map(Number);
    const [endH, endM] = sch.end.split(':').map(Number);

    let current = new Date(date);
    current.setHours(startH, startM, 0, 0);

    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);

    const now = new Date();

    const SLOT_DURATION = 30;
    const BUFFER = 10;
    const TOTAL_STEP = SLOT_DURATION + BUFFER;

    while (current < end) {
        // If adding the slot duration exceeds the end time, break
        const slotEnd = new Date(current);
        slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_DURATION);
        if (slotEnd > end) break;

        const timeString = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
        const isPast = current < now;

        slots.push({
            time: timeString,
            status: isPast ? "past" : "available",
            available: !isPast
        });

        current.setMinutes(current.getMinutes() + TOTAL_STEP);
    }

    return slots;
}

/* ═══════════════════════════════════════════════════════════════════
   Razorpay Script Loader
═══════════════════════════════════════════════════════════════════ */
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/* ═══════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════ */
export default function BookingForm({ doctor }: { doctor: any }) {
    const router  = useRouter();
    const rawWH   = doctor.workingHours || {};
    
    const dispatch = useDispatch<AppDispatch>();
    const { isSlotLocked, lockedSlotDetails } = useSelector((state: RootState) => state.appointment);
    const paymentCompleted = useRef(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ── State ── */
    const [type, setType]         = useState<"video"|"physical">("video");
    const [selectedDate, setSelectedDate] = useState<Date>(() =>
        findNextWorkingDate(rawWH, "video")
    );
    const [calendarYear,  setCalendarYear]  = useState(() => selectedDate.getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(() => selectedDate.getMonth());

    const [time, setTime]             = useState("");
    const [notes, setNotes]           = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError]           = useState("");

    const [allSlots, setAllSlots]     = useState<{ time: string; status: "available"|"booked"|"past"|"locked"|"Locked"|"Booked"|string; available: boolean; isLocked?: boolean }[]>([]);
    const [doctorWorking, setDoctorWorking] = useState(true);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    
    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const videoEnabled   = doctor.consultationSettings?.video?.enabled    ?? false;
    const videoFee       = doctor.consultationSettings?.video?.fee        || 0;
    const physicalEnabled = doctor.consultationSettings?.physical?.enabled ?? false;
    const physicalFee    = doctor.consultationSettings?.physical?.fee     || 0;

    /* ── Derived ── */
    const fee = type === "video" ? videoFee : physicalFee;
    const dateString = [
        selectedDate.getFullYear(),
        String(selectedDate.getMonth() + 1).padStart(2, "0"),
        String(selectedDate.getDate()).padStart(2, "0"),
    ].join("-");

    /* ── Default type ── */
    useEffect(() => {
        if (!videoEnabled && physicalEnabled) setType("physical");
        else if (videoEnabled)               setType("video");
    }, [videoEnabled, physicalEnabled]);

    /* ── When type changes, re-jump to next valid date for that channel ── */
    useEffect(() => {
        const next = findNextWorkingDate(rawWH, type);
        setSelectedDate(next);
        setCalendarYear(next.getFullYear());
        setCalendarMonth(next.getMonth());
    }, [type]);

    /* ── Slot Lock Edge Case ── */
    const lockInfoRef = useRef({
        isLocked: false,
        doctorId: doctor._id || doctor.id,
        date: dateString,
        time: time,
        type: type 
    });

    useEffect(() => {
        if (isSlotLocked) {
            lockInfoRef.current = {
                isLocked: true,
                doctorId: doctor._id || doctor.id,
                date: dateString,
                time: time,
                type: type
            };
        } else {
            lockInfoRef.current.isLocked = false;
        }
    }, [isSlotLocked, doctor, dateString, time, type]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!paymentCompleted.current && lockInfoRef.current.isLocked) {
                dispatch(unlockSlot({
                    doctorId: lockInfoRef.current.doctorId,
                    date: lockInfoRef.current.date,
                    time: lockInfoRef.current.time,
                    consultationType: lockInfoRef.current.type
                }));
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (!paymentCompleted.current && lockInfoRef.current.isLocked) {
                dispatch(unlockSlot({
                    doctorId: lockInfoRef.current.doctorId,
                    date: lockInfoRef.current.date,
                    time: lockInfoRef.current.time,
                    consultationType: lockInfoRef.current.type
                }));
            }
        };
    }, [dispatch]);

    /* ── Fetch slots ── */
    const fetchSlots = useCallback(async (preserveTime = false) => {
        setIsLoadingSlots(true);
        if (!preserveTime) setTime("");
        setDoctorWorking(true);
        try {
            const res = await getAvailableSlots(doctor._id || doctor.id, dateString, type);
            if (res.success && res.allSlots && res.allSlots.length > 0) {
                setAllSlots(res.allSlots);
                setDoctorWorking(res.doctorWorking !== false);
            } else {
                const generated = generateHalfHourSlots(rawWH, type, selectedDate);
                setAllSlots(generated);
                setDoctorWorking(generated.length > 0);
            }
        } catch {
            const generated = generateHalfHourSlots(rawWH, type, selectedDate);
            setAllSlots(generated);
            setDoctorWorking(generated.length > 0);
        } finally {
            setIsLoadingSlots(false);
        }
    }, [dateString, type, doctor._id, doctor.id, rawWH, selectedDate]);

    useEffect(() => { fetchSlots(); }, [fetchSlots]);

    /* ── Submit ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!dateString || !time) { setError("Please select a date and time."); return; }
        setShowConfirmModal(true);
    };

    const handlePayment = async (appointmentId: string) => {
        setIsPaymentLoading(true);
        const res = await loadRazorpayScript();
        if (!res) {
            setModalError('Razorpay SDK failed to load. Are you online?');
            setIsPaymentLoading(false);
            return;
        }

        try {
            // Generate Razorpay Order
            const orderResult = await dispatch(createRazorpayOrder({ appointmentId })).unwrap();
            
            // Configure Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderResult.amount,
                currency: orderResult.currency,
                name: "Zydoc Consultation",
                description: "Consultation Fee",
                order_id: orderResult.id,
                handler: async function (response: any) {
                    try {
                        setIsPaymentLoading(true);
                        await dispatch(verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            appointmentId
                        })).unwrap();
                        paymentCompleted.current = true;
                        setShowConfirmModal(false);
                        router.push("/patient/appointments");
                    } catch (err: any) {
                        setModalError(err || "Payment verification failed.");
                    } finally {
                        setIsPaymentLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        // Unlock the slot if user closes the payment window
                        dispatch(unlockSlot({
                            doctorId: doctor._id || doctor.id,
                            date: dateString,
                            time,
                            consultationType: type
                        }));
                        
                        // Revert local grid state so the slot appears available again
                        setAllSlots(prev => prev.map(slotObj => 
                            slotObj.time === time 
                                ? { ...slotObj, status: "available", isLocked: false } 
                                : slotObj
                        ));

                        setIsPaymentLoading(false);
                        setShowConfirmModal(false);
                    }
                },
                theme: {
                    color: "#4f46e5" // indigo-600
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            setModalError(error || "Failed to initiate payment. Please try again.");
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const handleProceedToPay = async () => {
        setIsLocking(true);
        let lockSuccess = false;
        let lockResult: any = null;
        try {
            lockResult = await dispatch(lockSlot({ 
                doctorId: doctor._id || doctor.id, 
                date: dateString, 
                time, 
                consultationType: type 
            })).unwrap();
            lockSuccess = true;
            
            // Instantly update the local grid to show the locked status
            setAllSlots(prev => prev.map(slotObj => 
                slotObj.time === time 
                    ? { ...slotObj, status: "Locked", isLocked: true } 
                    : slotObj
            ));
        } catch (err: any) {
            setModalError('unfortunately, This slot was just locked by another user');
            setIsLocking(false);
            fetchSlots(true); // Preserve time to keep the modal open!
            return;
        }

        if (lockSuccess && lockResult) {
            // Extract the appointmentId from the locked slot response
            const appointmentId = lockResult._id || lockResult.appointmentId || lockResult.id;
            
            if (appointmentId) {
                await handlePayment(appointmentId);
            } else {
                setModalError("Could not retrieve appointment ID from the lock response.");
            }
            
            setIsLocking(false);
        } 
    };

    /* ── Calendar helpers ── */
    const goToPrevMonth = () => {
        if (calendarMonth === 0) { setCalendarYear(y => y - 1); setCalendarMonth(11); }
        else setCalendarMonth(m => m - 1);
    };
    const goToNextMonth = () => {
        if (calendarMonth === 11) { setCalendarYear(y => y + 1); setCalendarMonth(0); }
        else setCalendarMonth(m => m + 1);
    };

    const buildCalendarDays = (): (Date | null)[] => {
        const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
        const startDow     = (firstOfMonth.getDay() + 6) % 7; // Mon=0
        const daysInMonth  = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const cells: (Date | null)[] = [];
        for (let i = 0; i < startDow; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calendarYear, calendarMonth, d));
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    };

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth()    === b.getMonth()    &&
        a.getDate()     === b.getDate();

    const isPastDate  = (d: Date) => d < today;
    const isDrWorking = (d: Date) => isDoctorAvailableOn(d, rawWH, type);

    /* ── Format time "14:00" → "2:00 PM" ── */
    const fmtTime = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    };

    const calendarDays   = buildCalendarDays();
    const hasAvailable   = allSlots.some(s => s.status === "available");
    const availableCount = allSlots.filter(s => s.status === "available").length;

    /* ════════════════════════════════════════════════════════
       Render
    ════════════════════════════════════════════════════════ */
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle" />
                    {error}
                </div>
            )}

            {/* ─── Consultation Type ─── */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Consultation Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {videoEnabled && (
                        <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all
                            ${type === "video" ? "bg-indigo-50/60 border-indigo-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                            <input type="radio" name="consultationType" value="video" className="sr-only"
                                checked={type === "video"} onChange={() => setType("video")} />
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        ${type === "video" ? "bg-indigo-100" : "bg-slate-100"}`}>
                                        <i className={`fas fa-video text-sm ${type === "video" ? "text-indigo-600" : "text-slate-500"}`} />
                                    </span>
                                    <div className="text-sm">
                                        <p className={`font-bold ${type === "video" ? "text-indigo-900" : "text-slate-900"}`}>
                                            Online Consultation
                                        </p>
                                        <p className={`text-xs mt-0.5 ${type === "video" ? "text-indigo-600" : "text-slate-400"}`}>
                                            Video Call
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-base font-bold ${type === "video" ? "text-indigo-600" : "text-slate-600"}`}>
                                    ₹{videoFee}
                                </div>
                            </div>
                            {type === "video" && (
                                <div className="absolute -inset-px rounded-xl border-2 border-indigo-500 pointer-events-none" />
                            )}
                        </label>
                    )}
                    {physicalEnabled && (
                        <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all
                            ${type === "physical" ? "bg-emerald-50/60 border-emerald-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                            <input type="radio" name="consultationType" value="physical" className="sr-only"
                                checked={type === "physical"} onChange={() => setType("physical")} />
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        ${type === "physical" ? "bg-emerald-100" : "bg-slate-100"}`}>
                                        <i className={`fas fa-hospital text-sm ${type === "physical" ? "text-emerald-600" : "text-slate-500"}`} />
                                    </span>
                                    <div className="text-sm">
                                        <p className={`font-bold ${type === "physical" ? "text-emerald-900" : "text-slate-900"}`}>
                                            Clinic Visit
                                        </p>
                                        <p className={`text-xs mt-0.5 ${type === "physical" ? "text-emerald-600" : "text-slate-400"}`}>
                                            In Person
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-base font-bold ${type === "physical" ? "text-emerald-600" : "text-slate-600"}`}>
                                    ₹{physicalFee}
                                </div>
                            </div>
                            {type === "physical" && (
                                <div className="absolute -inset-px rounded-xl border-2 border-emerald-500 pointer-events-none" />
                            )}
                        </label>
                    )}
                </div>
            </div>

            {/* ─── Date + Time card ─── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* ── Calendar ── */}
                <div className="p-5 border-b border-slate-100">
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
                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                                    <i className="fas fa-chevron-left text-[10px]" />
                                </button>
                                <button type="button" onClick={goToNextMonth}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
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

                            const past      = isPastDate(day);
                            const drOff     = !past && !isDrWorking(day);
                            const disabled  = past || drOff;
                            const selected  = isSameDay(day, selectedDate);
                            const isToday   = isSameDay(day, today);

                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        setCalendarYear(day.getFullYear());
                                        setCalendarMonth(day.getMonth());
                                    }}
                                    title={drOff ? "Doctor not working" : past ? "Past date" : ""}
                                    className={`
                                        mx-auto flex flex-col items-center justify-center w-11 h-12 rounded-xl
                                        transition-all duration-150
                                        ${past
                                            ? "text-slate-300 cursor-not-allowed"
                                            : drOff
                                                ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-dashed border-slate-200"
                                                : selected
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                                    : isToday
                                                        ? "border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                                                        : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100"
                                        }
                                    `}
                                >
                                    <span className={`text-sm leading-none font-bold`}>
                                        {day.getDate()}
                                    </span>
                                    <span className={`text-[9px] leading-none mt-0.5 font-medium
                                        ${past ? "text-slate-300" : drOff ? "text-slate-300" : selected ? "text-indigo-200" : "text-slate-400"}`}>
                                        {drOff ? "Closed" : MONTH_NAMES[day.getMonth()].slice(0, 3)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Calendar legend */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-slate-50">
                        {[
                            { color: "bg-indigo-600",   label: "Selected" },
                            { color: "bg-white border border-indigo-300", label: "Today" },
                            { color: "bg-white border border-slate-200",  label: "Available" },
                            { color: "bg-slate-100 border border-dashed border-slate-300", label: "Closed" },
                            { color: "bg-slate-100",    label: "Past" },
                        ].map(({ color, label }) => (
                            <span key={label} className="flex items-center gap-1 text-[10px] text-slate-500">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Time slots ── */}
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <i className="fas fa-clock text-indigo-600 text-xs" />
                            </span>
                            Select Time
                            <span className="text-[11px] font-normal text-slate-400">
                                — {MONTH_NAMES[selectedDate.getMonth()].slice(0,3)} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                            </span>
                        </h2>
                        {hasAvailable && !isLoadingSlots && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {availableCount} slot{availableCount !== 1 ? "s" : ""} free
                            </span>
                        )}
                    </div>

                    {/* Slots area */}
                    {isLoadingSlots ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                            Checking availability…
                        </div>
                    ) : !doctorWorking ? (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-calendar-xmark text-amber-500 text-sm" />
                            </span>
                            <div>
                                <p className="text-amber-700 text-sm font-semibold">Doctor not available on this day</p>
                                <p className="text-amber-600 text-xs mt-0.5">Please choose a different date from the calendar above.</p>
                            </div>
                        </div>
                    ) : allSlots.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-center">
                            <span className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <i className="far fa-calendar-times text-slate-400 text-xl" />
                            </span>
                            <p className="text-slate-600 text-sm font-semibold">No slots configured</p>
                            <p className="text-slate-400 text-xs mt-1">Try a different date or consultation type.</p>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 ${isSlotLocked ? "pointer-events-none opacity-75" : ""}`}>
                            {/* {console.log("BookingForm rendering slots:", allSlots)} */}
                            {allSlots.map((slotObj) => {
                                const { time: slotTime, status, isLocked: apiIsLocked } = slotObj;
                                console.log(`Slot time: ${slotTime}, Status: ${status}`);

                                const isAnyLocked = status === "locked" || status === "Locked" || apiIsLocked === true;
                                const isLockedByMe = isAnyLocked && time === slotTime && isSlotLocked;
                                const isLockedByOther = isAnyLocked && !isLockedByMe;
                                const isBooked = status === "booked" || status === "Booked";
                                const isPst = status === "past";
                                const isDisabled = isLockedByOther || isBooked || isPst;
                                const isSelected = time === slotTime;
                                const isAvailable = !isDisabled;

                                const formatTimeStr = (t: string) => {
                                    const [h, m] = t.split(":").map(Number);
                                    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                                };

                                return (
                                    <button
                                        key={slotTime}
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={() => {
                                            if (isSlotLocked) return;
                                            if (isAvailable) setTime(slotTime);
                                        }}
                                        title={
                                            isLockedByOther ? "Locked by another user"
                                            : isLockedByMe ? "Locked for your payment"
                                            : isBooked ? "Already booked"
                                            : isPst  ? "Time has passed"
                                            : "Click to select"
                                        }
                                        className={`
                                            relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                                            ${isPst
                                                ? "bg-slate-50/50 text-slate-300 border-slate-100 cursor-not-allowed"
                                                : isLockedByOther
                                                    ? "bg-orange-50 text-orange-600 border-orange-400 font-semibold opacity-75 cursor-not-allowed pointer-events-none"
                                                : isBooked
                                                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-50"
                                                : isSelected
                                                    ? "bg-indigo-50 text-indigo-700 border-indigo-600 shadow-sm"
                                                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm"
                                            }
                                        `}
                                    >
                                        <span className={`text-sm font-bold flex items-center gap-1.5 ${isPst || isBooked || isLockedByOther ? 'opacity-70' : ''}`}>
                                            {isAnyLocked && <i className="fas fa-lock text-[10px] opacity-70" />}
                                            {formatTimeStr(slotTime)}
                                        </span>
                                        {isBooked && (
                                            <span className="text-[10px] font-black tracking-wider uppercase mt-1 text-slate-400">Booked</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Green confirmation banner — matches screenshot 3 */}
                    {time && (
                        <div className="flex items-center gap-2.5 mt-4 px-4 py-3 bg-emerald-500 rounded-xl w-full">
                            <i className="fas fa-check-circle text-white text-base" />
                            <span className="text-white text-sm font-semibold">
                                Selected Time: {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()} at {fmtTime(time)}
                            </span>
                            <button
                                type="button"
                                onClick={() => setTime("")}
                                className="ml-auto text-white/70 hover:text-white transition-colors"
                                title="Clear selection"
                            >
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>
                    )}

                    {/* Slot legend */}
                    {allSlots.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 pt-3 border-t border-slate-50">
                            {[
                                { color: "bg-indigo-600",  label: "Selected"  },
                                { color: "bg-white border border-slate-300", label: "Available" },
                                { color: "bg-orange-400",  label: "Locked"    },
                                { color: "bg-slate-300",   label: "Booked"    },
                                { color: "bg-slate-100",   label: "Past"      },
                            ].map(({ color, label }) => (
                                <span key={label} className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Notes ─── */}
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                    Reason for visit
                    <span className="font-normal text-slate-400 ml-1">(Optional)</span>
                </label>
                <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for consultation…"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none text-sm"
                />
            </div>

            {/* ─── Submit bar ─── */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-slate-400">Total to pay</p>
                    <p className="text-2xl font-bold text-slate-800">₹{fee}</p>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || !time || isSlotLocked || showConfirmModal}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md
                               transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Confirming…
                        </span>
                    ) : "Confirm Booking"}
                </button>
            </div>

            {/* ─── Confirmation Modal ─── */}
            {showConfirmModal && time && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {modalError ? (
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="fas fa-lock text-2xl" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">slot is anavailable</h4>
                                <p className="text-sm text-slate-500 mb-6">{modalError}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setModalError(null);
                                        fetchSlots();
                                    }}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-slate-800">Confirm Booking</h3>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (!isLocking) {
                                                setShowConfirmModal(false);
                                            }
                                        }}
                                        disabled={isLocking}
                                        className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 text-sm">Time</span>
                                            <span className="font-semibold text-slate-700">{fmtTime(time)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 text-sm">Type</span>
                                            <span className="font-semibold text-slate-700 capitalize">{type || 'Not specified'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                            <span className="text-slate-500 text-sm font-medium">Total Fee</span>
                                            <span className="font-bold text-indigo-600">₹{fee || 0}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 text-center">
                                        Your slot will be locked for 5 minutes to complete the payment.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowConfirmModal(false);
                                        }}
                                        disabled={isLocking}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleProceedToPay}
                                        disabled={isLocking || isPaymentLoading}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {(isLocking || isPaymentLoading) ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isPaymentLoading ? "Loading..." : "Locking..."}</>
                                        ) : (
                                            "Proceed to Pay"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </form>
    );
}
