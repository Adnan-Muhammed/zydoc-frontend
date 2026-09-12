"use client";
 
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAvailableSlots, extendLock } from "@/lib/appointments";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { lockSlot, unlockSlot, createRazorpayOrder, verifyPayment } from "@/redux/features/appointment/appointmentThunk";
import SlotPicker, { Slot } from "@/components/patient/SlotPicker";

/* ═══════════════════════════════════════════════════════════════════ 
   Constants  
═══════════════════════════════════════════════════════════════════ */
const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
]; 
const DAY_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY_NAMES_JS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

/* ═══════════════════════════════════════════════════════════════════
   WorkingHours helpers (Checks doctor's working blocks)
═══════════════════════════════════════════════════════════════════ */
function isDoctorAvailableOn(date: Date, rawWH: any, consultationType: string): boolean {
    if (!rawWH) return false;
    const channelKey = (consultationType === "physical" || consultationType === "offline") ? "offline" : "online";
    const channelSchedule = rawWH?.[channelKey] || (rawWH?.online || rawWH?.offline ? null : rawWH) || {};
    const jsDay = date.getDay();
    const dayName = DAY_NAMES_JS[jsDay] as string;

    let dayConfig = channelSchedule[dayName];
    const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayName);
    const isDayEmpty = !dayConfig || (Array.isArray(dayConfig) && dayConfig.length === 0) || (typeof dayConfig === 'object' && !dayConfig.active);

    if (isDayEmpty) {
        if (isWeekday && channelSchedule.mondayToFriday) {
            dayConfig = channelSchedule.mondayToFriday;
        } else if (channelSchedule.fullWeek) {
            dayConfig = channelSchedule.fullWeek;
        }
    }

    if (Array.isArray(dayConfig)) {
        return dayConfig.length > 0 && dayConfig.some((b: any) => b && b.start && b.end);
    }
    if (dayConfig && typeof dayConfig === "object") {
        return !!dayConfig.active && !!dayConfig.start && !!dayConfig.end;
    }
    return false;
}

function findNextWorkingDate(rawWH: any, consultationType: string, today: Date, maxDate: Date): Date {
    for (let i = 0; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        if (d > maxDate) break;

        if (isDoctorAvailableOn(d, rawWH, consultationType)) {
            return d;
        }
    }
    return today;
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
    const router = useRouter();
    const rawWH = doctor.workingHours || {};
    
    const dispatch = useDispatch<AppDispatch>();
    const { isSlotLocked } = useSelector((state: RootState) => state.appointment);
    const { user } = useSelector((state: RootState) => state.auth);
    const currentUserId = user?._id || user?.id;
    const paymentCompleted = useRef(false);

    // 14-Day Rolling Window Boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxBookingDate = new Date(today);
    maxBookingDate.setDate(today.getDate() + 14);
    maxBookingDate.setHours(23, 59, 59, 999);

    /* ── Channel Availability ── */
    const isOnlineEnabled = doctor.consultationSettings?.online?.enabled ?? doctor.consultationSettings?.video?.enabled ?? true;
    const onlineFee = doctor.consultationSettings?.online?.fee ?? doctor.consultationSettings?.video?.fee ?? 0;
    const isOfflineEnabled = doctor.consultationSettings?.offline?.enabled ?? doctor.consultationSettings?.physical?.enabled ?? false;
    const offlineFee = doctor.consultationSettings?.offline?.fee ?? doctor.consultationSettings?.physical?.fee ?? 0;

    /* ── State ── */
    const [type, setType] = useState<"online" | "offline">(isOnlineEnabled ? "online" : "offline");
    const [patientType, setPatientType] = useState<"NEW" | "FOLLOW_UP" | "">("NEW");
    
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        return findNextWorkingDate(rawWH, isOnlineEnabled ? "online" : "offline", today, maxBookingDate);
    });
    
    const [calendarYear, setCalendarYear] = useState(() => selectedDate.getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(() => selectedDate.getMonth());

    const [time, setTime] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");

    const [allSlots, setAllSlots] = useState<Slot[]>([]);
    const [doctorWorking, setDoctorWorking] = useState(true);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    
    // Timezone states (Auto-detected patient IANA timezone and doctor's operating timezone)
    const [patientTimezone] = useState<string>(() => {
        return typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    });
    const [doctorTimezone, setDoctorTimezone] = useState<string>(() => {
        return doctor?.timezone || "Asia/Kolkata";
    });
    
    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    /* ── Derived ── */
    const fee = type === "online" ? onlineFee : offlineFee;
    const dateString = [
        selectedDate.getFullYear(),
        String(selectedDate.getMonth() + 1).padStart(2, "0"),
        String(selectedDate.getDate()).padStart(2, "0"),
    ].join("-");

    /* ── Default channel selection ── */
    useEffect(() => {
        if (!isOnlineEnabled && isOfflineEnabled) setType("offline");
        else if (isOnlineEnabled) setType("online");
    }, [isOnlineEnabled, isOfflineEnabled]);

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

    /* ── Fetch slots directly from backend API ── */
    const fetchSlots = useCallback(async (preserveTime = false) => {
        setIsLoadingSlots(true);
        if (!preserveTime) setTime("");
        setDoctorWorking(true);
        try {
            const res = await getAvailableSlots(doctor._id || doctor.id, dateString, type);
            if (res.success) {
                const slotsData = res.allSlots || [];
                setAllSlots(slotsData);
                setDoctorWorking(res.doctorWorking !== false);
                if (res.doctorTimezone) {
                    setDoctorTimezone(res.doctorTimezone);
                }
                // If preserving time, make sure the chosen slot is still available and not on break
                if (preserveTime) {
                    setTime((prevTime) => {
                        if (!prevTime) return "";
                        const matching = slotsData.find((s: any) => s.time === prevTime);
                        if (!matching || matching.status !== "available" || matching.isBreak) {
                            return "";
                        }
                        return prevTime;
                    });
                }
            } else {
                setAllSlots([]);
                setDoctorWorking(false);
            }
        } catch {
            setAllSlots([]);
            setDoctorWorking(false);
        } finally {
            setIsLoadingSlots(false);
        }
    }, [dateString, type, doctor._id, doctor.id]);

    useEffect(() => { 
        fetchSlots(); 
    }, [fetchSlots]);

    // Refresh slot availability when patient returns to or focuses the tab
    useEffect(() => {
        const handleFocus = () => {
            if (!isSlotLocked && !showConfirmModal) {
                fetchSlots(true);
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleFocus);
        };
    }, [fetchSlots, isSlotLocked, showConfirmModal]);

    /* ── Submit ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!patientType) { setError("Please select a Consultation Type (New or Follow-up)."); return; }
        if (!dateString || !time) { setError("Please select an available appointment slot."); return; }

        const chosenSlot = allSlots.find(s => s.time === time);
        if (!chosenSlot || chosenSlot.status !== 'available' || chosenSlot.isBreak) {
            setError("The selected slot is unavailable or closed by the doctor. Please choose an active slot.");
            return;
        }

        setShowConfirmModal(true);
    };

    const handlePayment = async (appointmentId: string, existingOrderId?: string) => {
        setIsPaymentLoading(true);
        const res = await loadRazorpayScript();
        if (!res) {
            setModalError('Razorpay SDK failed to load. Are you online?');
            setIsPaymentLoading(false);
            return;
        }

        try {
            let orderId = existingOrderId;
            let orderAmount = fee * 100;
            let orderCurrency = 'INR';

            if (!orderId) {
                const orderResult = await dispatch(createRazorpayOrder({ appointmentId })).unwrap();
                orderId = orderResult.id;
                orderAmount = orderResult.amount;
                orderCurrency = orderResult.currency;
            }

            let heartbeatInterval: NodeJS.Timeout;
            const clearHeartbeat = () => {
                if (heartbeatInterval) clearInterval(heartbeatInterval);
            };

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderAmount,
                currency: orderCurrency,
                name: "Zydoc Healthcare",
                description: `Consultation with Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim(),
                order_id: orderId,
                handler: async function (response: any) {
                    clearHeartbeat();
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
                        if (err?.code === 'SLOT_EXPIRED_REFUNDED') {
                            setModalError("Your slot lock expired and was booked by another patient. Any amount charged has been refunded.");
                        } else {
                            setModalError(err?.message || err || "Payment verification failed.");
                        }
                    } finally {
                        setIsPaymentLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        clearHeartbeat();
                        dispatch(unlockSlot({
                            doctorId: doctor._id || doctor.id,
                            date: dateString,
                            time,
                            consultationType: type
                        }));
                        
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
                    color: "#4f46e5"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

            // Heartbeat lock extension
            heartbeatInterval = setInterval(async () => {
                try {
                    await extendLock(appointmentId);
                } catch (e) {
                    console.error("Failed to extend lock", e);
                }
            }, 60000);

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
                consultationType: type,
                patientType,
                notes,
                patientTimezone,
                doctorTimezone,
                // Forward the pre-computed UTC timestamps from the slot object when available.
                // The backend uses these as the authoritative slot boundaries instead of
                // re-deriving them from the display time string.
                ...(allSlots.find(s => s.time === time)?.startTimeUTC && {
                    startTimeUTC: allSlots.find(s => s.time === time)!.startTimeUTC,
                    endTimeUTC:   allSlots.find(s => s.time === time)!.endTimeUTC,
                }),
            })).unwrap();
            lockSuccess = true;
            
            setAllSlots(prev => prev.map(slotObj => 
                slotObj.time === time 
                    ? { ...slotObj, status: "Locked", isLocked: true } 
                    : slotObj
            ));
        } catch (err: any) {
            setModalError(err?.message || 'Unfortunately, this slot was just locked or booked by another patient.');
            setIsLocking(false);
            fetchSlots(true);
            return;
        }

        if (lockSuccess && lockResult) {
            const appointmentId = lockResult._id || lockResult.appointmentId || lockResult.id;
            if (appointmentId) {
                await handlePayment(appointmentId);
            } else {
                setModalError("Could not retrieve appointment confirmation details.");
            }
            setIsLocking(false);
        } 
    };

    /* ── 14-Day Calendar helpers ── */
    const canGoPrevMonth = !(calendarMonth === today.getMonth() && calendarYear === today.getFullYear());
    const canGoNextMonth = !(calendarMonth === maxBookingDate.getMonth() && calendarYear === maxBookingDate.getFullYear());

    const goToPrevMonth = () => {
        if (!canGoPrevMonth) return;
        if (calendarMonth === 0) { 
            setCalendarYear(y => y - 1); 
            setCalendarMonth(11); 
        } else {
            setCalendarMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (!canGoNextMonth) return;
        if (calendarMonth === 11) { 
            setCalendarYear(y => y + 1); 
            setCalendarMonth(0); 
        } else {
            setCalendarMonth(m => m + 1);
        }
    };

    const buildCalendarDays = (): (Date | null)[] => {
        const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
        const startDow = (firstOfMonth.getDay() + 6) % 7; // Mon=0
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const cells: (Date | null)[] = [];
        for (let i = 0; i < startDow; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calendarYear, calendarMonth, d));
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    };

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const isPastDate = (d: Date) => d < today;
    const isBeyond14Days = (d: Date) => d > maxBookingDate;
    const isDrWorking = (d: Date) => isDoctorAvailableOn(d, rawWH, type);

    const calendarDays = buildCalendarDays();
    const availableCount = allSlots.filter(s => s.status === "available" && !s.isBreak).length;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle" />
                    <span>{error}</span>
                </div>
            )}

            {/* ─── Consultation Method ─── */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Consultation Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {isOnlineEnabled && (
                        <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all
                            ${type === "online" ? "bg-indigo-50/60 border-indigo-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                            <input 
                                type="radio" 
                                name="consultationType" 
                                value="online" 
                                className="sr-only"
                                checked={type === "online"} 
                                onChange={() => setType("online")} 
                            />
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        ${type === "online" ? "bg-indigo-100" : "bg-slate-100"}`}>
                                        <i className={`fas fa-video text-sm ${type === "online" ? "text-indigo-600" : "text-slate-500"}`} />
                                    </span>
                                    <div className="text-sm">
                                        <p className={`font-bold ${type === "online" ? "text-indigo-900" : "text-slate-900"}`}>
                                            Telehealth Video Call
                                        </p>
                                        <p className={`text-xs mt-0.5 ${type === "online" ? "text-indigo-600" : "text-slate-400"}`}>
                                            Online Virtual Visit
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-base font-bold ${type === "online" ? "text-indigo-600" : "text-slate-600"}`}>
                                    ₹{onlineFee}
                                </div>
                            </div>
                            {type === "online" && (
                                <div className="absolute -inset-px rounded-xl border-2 border-indigo-500 pointer-events-none" />
                            )}
                        </label>
                    )}
                    {isOfflineEnabled && (
                        <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all
                            ${type === "offline" ? "bg-emerald-50/60 border-emerald-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                            <input 
                                type="radio" 
                                name="consultationType" 
                                value="offline" 
                                className="sr-only"
                                checked={type === "offline"} 
                                onChange={() => setType("offline")} 
                            />
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center
                                        ${type === "offline" ? "bg-emerald-100" : "bg-slate-100"}`}>
                                        <i className={`fas fa-hospital text-sm ${type === "offline" ? "text-emerald-600" : "text-slate-500"}`} />
                                    </span>
                                    <div className="text-sm">
                                        <p className={`font-bold ${type === "offline" ? "text-emerald-900" : "text-slate-900"}`}>
                                            In-Person Clinic Visit
                                        </p>
                                        <p className={`text-xs mt-0.5 ${type === "offline" ? "text-emerald-600" : "text-slate-400"}`}>
                                            Physical Consultation
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-base font-bold ${type === "offline" ? "text-emerald-600" : "text-slate-600"}`}>
                                    ₹{offlineFee}
                                </div>
                            </div>
                            {type === "offline" && (
                                <div className="absolute -inset-px rounded-xl border-2 border-emerald-500 pointer-events-none" />
                            )}
                        </label>
                    )}
                </div>
            </div>

            {/* ─── Date + Time card ─── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* ── Calendar (14-Day Rolling Window) ── */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <i className="fas fa-calendar-alt text-indigo-600 text-xs" />
                                </span>
                                Select Date
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">Booking available up to 14 days in advance</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">
                                {MONTH_NAMES[calendarMonth]} {calendarYear}
                            </span>
                            <div className="flex gap-1">
                                <button 
                                    type="button" 
                                    onClick={goToPrevMonth}
                                    disabled={!canGoPrevMonth}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-slate-500 transition-colors ${!canGoPrevMonth ? 'opacity-30 cursor-not-allowed border-slate-100' : 'border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`}
                                >
                                    <i className="fas fa-chevron-left text-[10px]" />
                                </button>
                                <button 
                                    type="button" 
                                    onClick={goToNextMonth}
                                    disabled={!canGoNextMonth}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-slate-500 transition-colors ${!canGoNextMonth ? 'opacity-30 cursor-not-allowed border-slate-100' : 'border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`}
                                >
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

                            const past = isPastDate(day);
                            const outOfWindow = isBeyond14Days(day);
                            const drOff = !past && !outOfWindow && !isDrWorking(day);
                            const disabled = past || outOfWindow;
                            const selected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, today);

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
                                    title={outOfWindow ? "Outside 14-day booking window" : drOff ? "Doctor not scheduled" : past ? "Past date" : "Select date"}
                                    className={`
                                        mx-auto flex flex-col items-center justify-center w-11 h-12 rounded-xl
                                        transition-all duration-150
                                        ${past || outOfWindow
                                            ? "text-slate-300 cursor-not-allowed opacity-50"
                                            : drOff
                                                ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-dashed border-slate-200"
                                                : selected
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold"
                                                    : isToday
                                                        ? "border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold"
                                                        : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100"
                                        }
                                    `}
                                >
                                    <span className="text-sm leading-none font-bold">
                                        {day.getDate()}
                                    </span>
                                    <span className={`text-[9px] leading-none mt-0.5 font-medium
                                        ${past || outOfWindow ? "text-slate-300" : drOff ? "text-slate-300" : selected ? "text-indigo-200" : "text-slate-400"}`}>
                                        {drOff ? "Closed" : outOfWindow ? "—" : MONTH_NAMES[day.getMonth()].slice(0, 3)}
                                    </span>
                                </button> 
                            );
                        })}
                    </div>

                    {/* Calendar legend */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-slate-50">
                        {[
                            { color: "bg-indigo-600", label: "Selected" },
                            { color: "bg-white border-2 border-indigo-300", label: "Today" },
                            { color: "bg-white border border-slate-200", label: "Available" },
                            { color: "bg-slate-100 border border-dashed border-slate-300", label: "Closed" },
                            { color: "bg-slate-100", label: "Out of Window" },
                        ].map(({ color, label }) => (
                            <span key={label} className="flex items-center gap-1 text-[10px] text-slate-500">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ─── Patient Consultation Type ─── */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <i className="fas fa-users text-indigo-600 text-xs" />
                            </span>
                            Visit Classification
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all
                                ${patientType === "NEW" ? "bg-indigo-50/60 border-indigo-300 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                                <input 
                                    type="radio" 
                                    name="patientType" 
                                    value="NEW" 
                                    className="sr-only"
                                    checked={patientType === "NEW"} 
                                    onChange={() => setPatientType("NEW")} 
                                />
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center
                                            ${patientType === "NEW" ? "bg-indigo-100" : "bg-slate-100"}`}>
                                            <i className={`fas fa-user-plus text-sm ${patientType === "NEW" ? "text-indigo-600" : "text-slate-500"}`} />
                                        </span>
                                        <div className="text-sm">
                                            <p className={`font-bold ${patientType === "NEW" ? "text-indigo-900" : "text-slate-900"}`}>
                                                New Consultation
                                            </p>
                                            <p className={`text-xs mt-0.5 ${patientType === "NEW" ? "text-indigo-600" : "text-slate-400"}`}>
                                                First-time appointment
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {patientType === "NEW" && (
                                    <div className="absolute -inset-px rounded-xl border-2 border-indigo-500 pointer-events-none" />
                                )}
                            </label>

                            <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all
                                ${patientType === "FOLLOW_UP" ? "bg-emerald-50/60 border-emerald-300 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                                <input 
                                    type="radio" 
                                    name="patientType" 
                                    value="FOLLOW_UP" 
                                    className="sr-only"
                                    checked={patientType === "FOLLOW_UP"} 
                                    onChange={() => setPatientType("FOLLOW_UP")} 
                                />
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center
                                            ${patientType === "FOLLOW_UP" ? "bg-emerald-100" : "bg-slate-100"}`}>
                                            <i className={`fas fa-user-check text-sm ${patientType === "FOLLOW_UP" ? "text-emerald-600" : "text-slate-500"}`} />
                                        </span>
                                        <div className="text-sm">
                                            <p className={`font-bold ${patientType === "FOLLOW_UP" ? "text-emerald-900" : "text-slate-900"}`}>
                                                Follow-Up Visit
                                            </p>
                                            <p className={`text-xs mt-0.5 ${patientType === "FOLLOW_UP" ? "text-emerald-600" : "text-slate-400"}`}>
                                                Returning follow-up
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {patientType === "FOLLOW_UP" && (
                                    <div className="absolute -inset-px rounded-xl border-2 border-emerald-500 pointer-events-none" />
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* ── Time slots (SlotPicker Component Integration) ── */}
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <i className="fas fa-clock text-indigo-600 text-xs" />
                            </span>
                            Select Time Slot
                            <span className="text-[11px] font-normal text-slate-400">
                                — {MONTH_NAMES[selectedDate.getMonth()].slice(0,3)} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                            </span>
                        </h2>
                        {availableCount > 0 && !isLoadingSlots && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {availableCount} slot{availableCount !== 1 ? "s" : ""} available
                            </span>
                        )}
                    </div>

                    <SlotPicker
                        allSlots={allSlots}
                        selectedTime={time}
                        onTimeSelect={(selectedSlotTime) => {
                            if (isSlotLocked) return;
                            setTime(selectedSlotTime);
                        }}
                        isLoading={isLoadingSlots}
                        doctorWorking={doctorWorking}
                        fee={fee}
                        consultationType={type}
                        onPaymentResume={(appId, orderId) => handlePayment(appId, orderId)}
                        currentUserId={currentUserId}
                        isSlotLocked={isSlotLocked}
                        doctorTimezone={doctorTimezone}
                        patientTimezone={patientTimezone}
                    />
                </div>
            </div>

            {/* ─── Notes / Reason for visit ─── */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-notes-medical text-indigo-500 text-xs" />
                    Symptoms & Medical Notes (Optional)
                </label>
                <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for the consultation..."
                    className="w-full text-sm rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400 resize-none shadow-sm"
                />
            </div>

            {/* ─── Submit button ─── */}
            <button
                type="submit"
                disabled={!time || isSlotLocked}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <i className="fas fa-lock text-xs" />
                <span>Book & Proceed to Payment (₹{fee})</span>
            </button>

            {/* ─── Confirmation & Payment Modal ─── */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-shield-halved text-indigo-600" />
                                Confirm Appointment Slot
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isPaymentLoading && !isLocking) {
                                        setShowConfirmModal(false);
                                        setModalError(null);
                                    }
                                }}
                                disabled={isPaymentLoading || isLocking}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>

                        {modalError && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                                {modalError}
                            </div>
                        )}

                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs text-slate-600 border border-slate-100">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Doctor:</span>
                                <span className="font-bold text-slate-800">Dr. {doctor.firstName} {doctor.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Date & Time:</span>
                                <span className="font-bold text-slate-800">{dateString} at {time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Channel:</span>
                                <span className="font-bold text-slate-800 capitalize">{type === "online" ? "Telehealth (Online)" : "In-Person (Offline)"}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200/60 pt-2 text-sm font-bold text-slate-800">
                                <span>Total Fee:</span>
                                <span className="text-indigo-600">₹{fee}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                disabled={isLocking || isPaymentLoading}
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setModalError(null);
                                }}
                                className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isLocking || isPaymentLoading}
                                onClick={handleProceedToPay}
                                className="w-1/2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition"
                            >
                                {isLocking || isPaymentLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                        <span>Processing…</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-credit-card text-xs" />
                                        <span>Pay Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
