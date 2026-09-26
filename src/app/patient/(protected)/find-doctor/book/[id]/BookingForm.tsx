"use client";
 
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAvailableSlots, extendLock } from "@/lib/appointments";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { lockSlot, unlockSlot, createRazorpayOrder, verifyPayment } from "@/redux/features/appointment/appointmentThunk";
import { fetchWalletDetails } from "@/redux/features/wallet/walletThunk";
import SlotPicker, { Slot } from "@/components/patient/SlotPicker";
import {
  Video,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock, 
  Users,
  UserPlus,
  UserCheck,
  FileText,
  Lock,
  ShieldCheck,
  X,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  CalendarCheck,
} from "lucide-react";

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
    const { balance: walletBalance } = useSelector((state: RootState) => state.wallet);
    const currentUserId = user?._id || user?.id;
    const paymentCompleted = useRef(false);

    const [useWallet, setUseWallet] = useState<boolean>(true);

    // Fetch patient wallet balance on mount
    useEffect(() => {
        dispatch(fetchWalletDetails());
    }, [dispatch]);

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

        const walletDeduction = useWallet && walletBalance > 0 ? Math.min(walletBalance, fee) : 0;
        const netPayable = Math.max(0, fee - walletDeduction);
        const isFullWallet = useWallet && walletBalance >= fee;

        try {
            let orderId = existingOrderId;
            let orderAmount = (useWallet && walletDeduction > 0 ? netPayable : fee) * 100;
            let orderCurrency = 'INR';

            if (!orderId) {
                const orderResult = await dispatch(createRazorpayOrder({
                    appointmentId,
                    useWallet: Boolean(useWallet && walletBalance > 0)
                })).unwrap();

                // ── Seamless Full Wallet Completion ──
                if (orderResult?.status === 'COMPLETED_VIA_WALLET') {
                    paymentCompleted.current = true;
                    setShowConfirmModal(false);
                    dispatch(fetchWalletDetails());
                    router.push("/patient/appointments");
                    return;
                }

                orderId = orderResult.id;
                orderAmount = orderResult.amount;
                orderCurrency = orderResult.currency;
            }

            const res = await loadRazorpayScript();
            if (!res) {
                setModalError('Razorpay SDK failed to load. Are you online?');
                setIsPaymentLoading(false);
                return;
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
                        dispatch(fetchWalletDetails());
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

    const isPastDate = (d: Date) => {
        const cmp = new Date(d);
        cmp.setHours(0, 0, 0, 0);
        return cmp < today;
    };

    const isBeyond14Days = (d: Date) => {
        const cmp = new Date(d);
        cmp.setHours(0, 0, 0, 0);
        return cmp > maxBookingDate;
    };

    const isDrWorking = (d: Date) => isDoctorAvailableOn(d, rawWH, type);

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
    const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const calendarDays: (Date | null)[] = [];
    for (let i = 0; i < startingDayIndex; i++) {
        calendarDays.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        calendarDays.push(new Date(calendarYear, calendarMonth, d));
    }

    const availableCount = allSlots.filter(s => s.status === 'available' && !s.isBreak).length;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs sm:text-sm border border-rose-200/90 flex items-center gap-2.5 animate-fade-in shadow-2xs">
                    <AlertCircle className="size-4 text-rose-600 shrink-0" />
                    <span className="font-semibold">{error}</span>
                </div>
            )}

            {/* ─── 1. Consultation Method ─── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-extrabold text-[#101044] flex items-center gap-2">
                        <span className="size-6 rounded-lg bg-[#101044]/5 text-[#101044] flex items-center justify-center shrink-0">
                            <Video className="size-3.5" />
                        </span>
                        Consultation Method
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Step 1 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {isOnlineEnabled && (
                        <label className={`relative flex cursor-pointer rounded-2xl border-2 p-4 sm:p-5 transition-all
                            ${type === "online" 
                                ? "bg-gradient-to-br from-[#101044]/[0.03] via-white to-indigo-50/20 border-[#101044] shadow-md shadow-[#101044]/5" 
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 shadow-2xs"}`}>
                            <input 
                                type="radio" 
                                name="consultationType" 
                                value="online" 
                                className="sr-only"
                                checked={type === "online"} 
                                onChange={() => setType("online")} 
                            />
                            <div className="flex w-full items-center justify-between gap-3">
                                <div className="flex items-center gap-3.5">
                                    <span className={`size-11 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                        ${type === "online" ? "bg-[#101044] text-white shadow-xs" : "bg-slate-100 text-slate-600"}`}>
                                        <Video className="size-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold ${type === "online" ? "text-[#101044]" : "text-slate-800"}`}>
                                            Telehealth Video Call
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Online Virtual Consultation
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-base sm:text-lg font-extrabold text-[#101044]">
                                        ₹{onlineFee}
                                    </span>
                                </div>
                            </div>
                            {type === "online" && (
                                <span className="absolute top-2.5 right-2.5 size-5 rounded-full bg-[#101044] text-white flex items-center justify-center shadow-xs">
                                    <Check className="size-3 stroke-[3]" />
                                </span>
                            )}
                        </label>
                    )}
                    {isOfflineEnabled && (
                        <label className={`relative flex cursor-pointer rounded-2xl border-2 p-4 sm:p-5 transition-all
                            ${type === "offline" 
                                ? "bg-gradient-to-br from-[#101044]/[0.03] via-white to-emerald-50/20 border-[#101044] shadow-md shadow-[#101044]/5" 
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 shadow-2xs"}`}>
                            <input 
                                type="radio" 
                                name="consultationType" 
                                value="offline" 
                                className="sr-only"
                                checked={type === "offline"} 
                                onChange={() => setType("offline")} 
                            />
                            <div className="flex w-full items-center justify-between gap-3">
                                <div className="flex items-center gap-3.5">
                                    <span className={`size-11 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                        ${type === "offline" ? "bg-[#101044] text-white shadow-xs" : "bg-slate-100 text-slate-600"}`}>
                                        <Building2 className="size-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold ${type === "offline" ? "text-[#101044]" : "text-slate-800"}`}>
                                            In-Person Clinic Visit
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Physical Consultation
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-base sm:text-lg font-extrabold text-[#101044]">
                                        ₹{offlineFee}
                                    </span>
                                </div>
                            </div>
                            {type === "offline" && (
                                <span className="absolute top-2.5 right-2.5 size-5 rounded-full bg-[#101044] text-white flex items-center justify-center shadow-xs">
                                    <Check className="size-3 stroke-[3]" />
                                </span>
                            )}
                        </label>
                    )}
                </div>
            </div>

            {/* ─── 2. Date + Time Card ─── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                {/* ── Calendar (14-Day Rolling Window) ── */}
                <div className="p-5 sm:p-6 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-sm sm:text-base font-extrabold text-[#101044] flex items-center gap-2">
                                <span className="size-7 rounded-lg bg-[#101044]/5 text-[#101044] flex items-center justify-center shrink-0">
                                    <Calendar className="size-4" />
                                </span>
                                Select Consultation Date
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Booking available up to 14 days in advance
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200/80">
                            <span className="text-xs sm:text-sm font-bold text-[#101044]">
                                {MONTH_NAMES[calendarMonth]} {calendarYear}
                            </span>
                            <div className="flex items-center gap-1">
                                <button 
                                    type="button" 
                                    onClick={goToPrevMonth}
                                    disabled={!canGoPrevMonth}
                                    title="Previous Month"
                                    className={`size-7 flex items-center justify-center rounded-lg border text-slate-600 transition-colors ${!canGoPrevMonth ? 'opacity-25 cursor-not-allowed border-transparent' : 'border-slate-200 bg-white hover:border-[#101044] hover:text-[#101044] shadow-2xs'}`}
                                >
                                    <ChevronLeft className="size-3.5" />
                                </button>
                                <button 
                                    type="button" 
                                    onClick={goToNextMonth}
                                    disabled={!canGoNextMonth}
                                    title="Next Month"
                                    className={`size-7 flex items-center justify-center rounded-lg border text-slate-600 transition-colors ${!canGoNextMonth ? 'opacity-25 cursor-not-allowed border-transparent' : 'border-slate-200 bg-white hover:border-[#101044] hover:text-[#101044] shadow-2xs'}`}
                                >
                                    <ChevronRight className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {DAY_LABELS.map(d => (
                            <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Date cells */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`e-${idx}`} className="h-12" />;

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
                                        mx-auto flex flex-col items-center justify-center w-full max-w-[48px] h-12 sm:h-13 rounded-xl
                                        transition-all duration-150 select-none active:scale-95
                                        ${past || outOfWindow
                                            ? "text-slate-300 cursor-not-allowed opacity-35"
                                            : drOff
                                                ? "bg-slate-50/70 text-slate-300 cursor-not-allowed border border-dashed border-slate-200"
                                                : selected
                                                    ? "bg-[#101044] text-white shadow-md shadow-[#101044]/25 font-bold scale-[1.04] ring-2 ring-[#101044]/15"
                                                    : isToday
                                                        ? "border-2 border-emerald-500 bg-emerald-50/40 text-emerald-900 font-bold hover:bg-emerald-100/50"
                                                        : "text-slate-700 hover:bg-slate-100 hover:text-[#101044] border border-slate-200/80 bg-white"
                                        }
                                    `}
                                >
                                    <span className="text-xs sm:text-sm leading-tight font-extrabold">
                                        {day.getDate()}
                                    </span>
                                    <span className={`text-[8.5px] sm:text-[9px] leading-tight mt-0.5 font-medium
                                        ${past || outOfWindow ? "text-slate-300" : drOff ? "text-slate-300" : selected ? "text-indigo-200" : "text-slate-400"}`}>
                                        {drOff ? "Off" : outOfWindow ? "—" : MONTH_NAMES[day.getMonth()].slice(0, 3)}
                                    </span>
                                </button> 
                            );
                        })}
                    </div>

                    {/* Calendar legend */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3.5 border-t border-slate-100">
                        {[
                            { color: "bg-[#101044]", label: "Selected" },
                            { color: "bg-white border-2 border-emerald-500", label: "Today" },
                            { color: "bg-white border border-slate-200", label: "Available" },
                            { color: "bg-slate-100 border border-dashed border-slate-300", label: "Closed / Off" },
                            { color: "bg-slate-100 opacity-50", label: "Out of Window" },
                        ].map(({ color, label }) => (
                            <span key={label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span className={`inline-block size-2.5 rounded-full ${color}`} />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ─── Patient Consultation Type ─── */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/40">
                    <div className="space-y-3">
                        <label className="text-xs sm:text-sm font-extrabold text-[#101044] flex items-center gap-2">
                            <span className="size-7 rounded-lg bg-[#101044]/5 text-[#101044] flex items-center justify-center shrink-0">
                                <Users className="size-4" />
                            </span>
                            Visit Classification
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`relative flex cursor-pointer rounded-2xl border-2 p-4 transition-all
                                ${patientType === "NEW" 
                                    ? "bg-gradient-to-br from-[#101044]/[0.03] via-white to-slate-50/50 border-[#101044] shadow-xs" 
                                    : "bg-white border-slate-200 hover:border-slate-300"}`}>
                                <input 
                                    type="radio" 
                                    name="patientType" 
                                    value="NEW" 
                                    className="sr-only"
                                    checked={patientType === "NEW"} 
                                    onChange={() => setPatientType("NEW")} 
                                />
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                            ${patientType === "NEW" ? "bg-[#101044] text-white shadow-xs" : "bg-slate-100 text-slate-600"}`}>
                                            <UserPlus className="size-5" />
                                        </span>
                                        <div>
                                            <p className={`text-sm font-bold ${patientType === "NEW" ? "text-[#101044]" : "text-slate-800"}`}>
                                                New Consultation
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                First-time appointment with doctor
                                            </p>
                                        </div>
                                    </div>
                                    {patientType === "NEW" && (
                                        <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                                    )}
                                </div>
                            </label>

                            <label className={`relative flex cursor-pointer rounded-2xl border-2 p-4 transition-all
                                ${patientType === "FOLLOW_UP" 
                                    ? "bg-gradient-to-br from-[#101044]/[0.03] via-white to-slate-50/50 border-[#101044] shadow-xs" 
                                    : "bg-white border-slate-200 hover:border-slate-300"}`}>
                                <input 
                                    type="radio" 
                                    name="patientType" 
                                    value="FOLLOW_UP" 
                                    className="sr-only"
                                    checked={patientType === "FOLLOW_UP"} 
                                    onChange={() => setPatientType("FOLLOW_UP")} 
                                />
                                <div className="flex w-full items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                                            ${patientType === "FOLLOW_UP" ? "bg-[#101044] text-white shadow-xs" : "bg-slate-100 text-slate-600"}`}>
                                            <UserCheck className="size-5" />
                                        </span>
                                        <div>
                                            <p className={`text-sm font-bold ${patientType === "FOLLOW_UP" ? "text-[#101044]" : "text-slate-800"}`}>
                                                Follow-Up Visit
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Returning visit or report review
                                            </p>
                                        </div>
                                    </div>
                                    {patientType === "FOLLOW_UP" && (
                                        <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* ── Time slots (SlotPicker Component Integration) ── */}
                <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm sm:text-base font-extrabold text-[#101044] flex items-center gap-2">
                            <span className="size-7 rounded-lg bg-[#101044]/5 text-[#101044] flex items-center justify-center shrink-0">
                                <Clock className="size-4" />
                            </span>
                            Select Time Slot
                            <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                                — {MONTH_NAMES[selectedDate.getMonth()].slice(0,3)} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                            </span>
                        </h2>
                        {availableCount > 0 && !isLoadingSlots && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
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

            {/* ─── 3. Notes / Reason for visit ─── */}
            <div className="space-y-2">
                <label className="text-xs sm:text-sm font-extrabold text-[#101044] flex items-center gap-2">
                    <span className="size-6 rounded-lg bg-[#101044]/5 text-[#101044] flex items-center justify-center shrink-0">
                        <FileText className="size-3.5" />
                    </span>
                    Symptoms & Medical Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe your symptoms, medical concerns, or questions for this consultation..."
                    className="w-full text-sm rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#101044]/15 focus:border-[#101044] transition placeholder:text-slate-400 resize-none shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Lock className="size-3 text-slate-400 shrink-0" />
                    Private & confidential — only your consulting physician will review these notes.
                </p>
            </div>

            {/* ─── 4. Summary & Submit Button ─── */}
            {(() => {
                const walletDeduction = useWallet && walletBalance > 0 ? Math.min(walletBalance, fee) : 0;
                const netPayable = Math.max(0, fee - walletDeduction);
                const isFullWallet = useWallet && walletBalance >= fee;

                return (
                    <div className="space-y-4 pt-2">
                        {/* Summary Preview Card */}
                        {time && (
                            <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CalendarCheck className="size-4 text-emerald-600" />
                                        <span className="text-xs sm:text-sm font-extrabold text-[#101044]">
                                            {dateString} at {time}
                                        </span>
                                        <span className="text-[11px] font-bold text-[#101044] bg-[#101044]/5 px-2.5 py-0.5 rounded-full border border-[#101044]/10">
                                            {type === "online" ? "Telehealth Video" : "Clinic Visit"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Slot is available and will be temporarily reserved upon proceeding.
                                    </p>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                    <span className="text-xs text-slate-400 font-medium block">Total Consultation Fee</span>
                                    <span className="text-xl sm:text-2xl font-extrabold text-[#101044]">
                                        ₹{fee}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!time || isSlotLocked}
                            className="w-full py-4 px-6 bg-gradient-to-r from-[#101044] via-[#151554] to-[#1c1c70] hover:from-[#0c0c36] hover:to-[#16165c] text-white font-extrabold rounded-2xl shadow-lg shadow-[#101044]/15 hover:shadow-xl hover:shadow-[#101044]/20 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer"
                        >
                            <Lock className="size-4 text-emerald-400" />
                            <span>
                                {!time
                                    ? "Please Select a Time Slot to Proceed"
                                    : isFullWallet
                                    ? `Confirm & Pay ₹${fee} with Wallet Balance`
                                    : walletDeduction > 0
                                    ? `Confirm & Pay ₹${netPayable} (₹${walletDeduction} Wallet Applied)`
                                    : `Confirm Appointment & Proceed (₹${fee})`}
                            </span>
                        </button>
                    </div>
                );
            })()}

            {/* ─── Confirmation & Payment Modal ─── */}
            {showConfirmModal && (() => {
                const walletDeduction = useWallet && walletBalance > 0 ? Math.min(walletBalance, fee) : 0;
                const netPayable = Math.max(0, fee - walletDeduction);
                const isFullWallet = useWallet && walletBalance >= fee;

                return (
                    <div className="fixed inset-0 z-50 bg-[#101044]/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                        <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                <h3 className="text-base font-extrabold text-[#101044] flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-emerald-600" />
                                    Confirm Appointment Booking
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
                                    className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            {modalError && (
                                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 flex items-center gap-2">
                                    <AlertCircle className="size-4 text-rose-600 shrink-0" />
                                    <span>{modalError}</span>
                                </div>
                            )}

                            {/* Wallet Option Card */}
                            {walletBalance > 0 && (
                                <div className="rounded-2xl border p-4 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 border-emerald-200/90 transition-all shadow-2xs">
                                    <label className="flex items-center gap-3.5 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={useWallet}
                                            onChange={(e) => setUseWallet(e.target.checked)}
                                            className="size-5 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300"
                                        />
                                        <div className="flex-1 flex items-center justify-between gap-2">
                                            <div>
                                                <p className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                                                    <Wallet className="size-3.5 text-emerald-600" />
                                                    Use Digital Wallet Balance
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Available: <span className="font-bold text-emerald-700">₹{walletBalance}</span>
                                                </p>
                                            </div>
                                            {useWallet && walletDeduction > 0 && (
                                                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg">
                                                    -₹{walletDeduction}
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            )}

                            {/* Summary Breakdown */}
                            <div className="space-y-2.5 bg-slate-50 p-4 sm:p-5 rounded-2xl text-xs text-slate-600 border border-slate-200/80">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Physician:</span>
                                    <span className="font-extrabold text-[#101044]">Dr. {doctor.firstName} {doctor.lastName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Date & Time:</span>
                                    <span className="font-bold text-slate-900">{dateString} at {time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Consultation Type:</span>
                                    <span className="font-bold text-slate-900 capitalize">{type === "online" ? "Telehealth Video Call" : "In-Person Clinic Visit"}</span>
                                </div>

                                <div className="border-t border-slate-200/80 pt-2.5 space-y-1.5 mt-2">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Consultation Fee:</span>
                                        <span className="font-bold">₹{fee}</span>
                                    </div>
                                    {useWallet && walletBalance > 0 && (
                                        <div className="flex justify-between text-emerald-700 font-semibold">
                                            <span>Wallet Applied:</span>
                                            <span>-₹{walletDeduction}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-slate-200/80 text-sm font-extrabold text-[#101044]">
                                        <span>Total Payable:</span>
                                        <span className="text-base font-black text-[#101044]">₹{netPayable}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    disabled={isLocking || isPaymentLoading}
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setModalError(null);
                                    }}
                                    className="w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isLocking || isPaymentLoading}
                                    onClick={handleProceedToPay}
                                    className="w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#101044] to-[#1c1c70] hover:from-[#0c0c36] hover:to-[#16165c] text-white text-xs font-extrabold shadow-md shadow-[#101044]/15 flex items-center justify-center gap-1.5 transition"
                                >
                                    {isLocking || isPaymentLoading ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin text-white" />
                                            <span>Processing…</span>
                                        </>
                                    ) : isFullWallet ? (
                                        <>
                                            <Wallet className="size-3.5 text-emerald-300" />
                                            <span>Pay ₹{fee} with Wallet</span>
                                        </>
                                    ) : useWallet && walletBalance > 0 ? (
                                        <>
                                            <CreditCard className="size-3.5 text-emerald-300" />
                                            <span>Pay ₹{netPayable}</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="size-3.5 text-emerald-300" />
                                            <span>Pay ₹{fee}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </form>
    );
}
