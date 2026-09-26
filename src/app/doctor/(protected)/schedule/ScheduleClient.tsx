'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import { fetchDoctorAppointments, cancelAppointment } from '@/redux/features/appointment/appointmentThunk';
import { getAvailableSlots, toggleDoctorSlotOverride, manualBookDoctorSlot } from "@/lib/appointments";
 
/* ═══════════════════════════════════════════════════════════════════
   Constants & Helpers (Matching BookingForm.tsx Exactly)
═══════════════════════════════════════════════════════════════════ */
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]; 
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_JS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export interface DoctorSlot { 
    time: string;
    status: 'available' | 'booked' | 'past' | 'locked' | 'Locked' | 'Booked' | 'unavailable' | 'break' | 'closed' | string;
    available?: boolean;
    type?: 'mixed' | 'online' | 'offline' | 'physical' | string;
    bookedType?: 'video' | 'online' | 'physical' | 'offline' | string;
    isLocked?: boolean;
    lockedBy?: string | null;
    razorpayOrderId?: string | null;
    appointmentId?: string | null;
    isBookable?: boolean;
    isExpired?: boolean;
    isFollowUpOnly?: boolean;
    isBreak?: boolean;
    breakReason?: string;
    shiftIndex?: number;
    shiftName?: string;
    shiftStart?: string;
    shiftEnd?: string;
    shiftType?: 'mixed' | 'online' | 'offline' | string;
    isManualBooking?: boolean;
    manualPatientDetails?: {
        name?: string;
        opNumber?: string;
        phone?: string;
        notes?: string;
    };
}

function isDoctorAvailableOn(date: Date, rawWH: any): boolean {
    if (!rawWH) return false;
    const jsDay = date.getDay();
    const dayName = DAY_NAMES_JS[jsDay] as string;

    const checkChannel = (channelKey: 'online' | 'offline') => {
        const channelSchedule = rawWH[channelKey] || (rawWH.online || rawWH.offline ? null : rawWH);
        if (!channelSchedule) return false;
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
    };

    return checkChannel('online') || checkChannel('offline');
}

function findNextWorkingDate(rawWH: any, today: Date, maxDate: Date): Date {
    for (let i = 0; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        if (d > maxDate) break;

        if (isDoctorAvailableOn(d, rawWH)) {
            return d;
        }
    }
    return today;
}

function normalizeSlotTime(timeStr: string) {
    if (!timeStr) return "";
    const trimmed = timeStr.trim().toUpperCase();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return trimmed;
    let [_, hStr, mStr, ampm] = match;
    let h = parseInt(hStr, 10);
    if (!ampm) {
        ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
    }
    return `${String(h).padStart(2, "0")}:${mStr} ${ampm}`;
}

function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    let cleaned = timeStr.trim();
    if (cleaned.includes('-')) {
        cleaned = cleaned.split('-')[0].trim();
    } else if (cleaned.toLowerCase().includes(' to ')) {
        cleaned = cleaned.split(/ to /i)[0].trim();
    }
    const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;
    let [_, hStr, mStr, ampm] = match;
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (ampm) {
        const upper = ampm.toUpperCase();
        if (upper === 'PM' && h < 12) h += 12;
        if (upper === 'AM' && h === 12) h = 0;
    }
    return h * 60 + m;
}

function formatMinutesTo12H(totalMinutes: number): string {
    const normMins = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    const h24 = Math.floor(normMins / 60);
    const m = normMins % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Calculates start and fill width percentages for an off-grid event overlapping a grid slot.
 * Used to render dynamic linear-gradient CSS background fills on grid buttons.
 *
 * @param slotStart - Slot start time in minutes from midnight (e.g. 14:00 = 840)
 * @param slotEnd - Slot end time in minutes from midnight (e.g. 14:15 = 855)
 * @param eventStart - Off-grid event start time in minutes from midnight (e.g. 14:10 = 850)
 * @param eventEnd - Off-grid event end time in minutes from midnight (e.g. 14:20 = 860)
 */
function calculateOverlapPercentages(
    slotStart: number,
    slotEnd: number,
    eventStart: number,
    eventEnd: number
) {
    const slotDuration = slotEnd - slotStart;
    if (slotDuration <= 0) {
        return {
            startPercentage: 0,
            startOffsetPercentage: 0,
            fillWidthPercentage: 0,
            overlapMinutes: 0,
            hasOverlap: false
        };
    }

    const overlapStart = Math.max(slotStart, eventStart);
    const overlapEnd = Math.min(slotEnd, eventEnd);

    if (overlapEnd <= overlapStart) {
        return {
            startPercentage: 0,
            startOffsetPercentage: 0,
            fillWidthPercentage: 0,
            overlapMinutes: 0,
            hasOverlap: false
        };
    }

    const overlapMinutes = overlapEnd - overlapStart;
    const fillWidthPercentage = ((overlapEnd - overlapStart) / slotDuration) * 100;
    const startOffsetPercentage = ((overlapStart - slotStart) / slotDuration) * 100;

    return {
        startPercentage: Number(startOffsetPercentage.toFixed(2)),
        startOffsetPercentage: Number(startOffsetPercentage.toFixed(2)),
        fillWidthPercentage: Number(fillWidthPercentage.toFixed(2)),
        overlapMinutes,
        hasOverlap: true
    };
}

interface EventThemeConfig {
    fillColor: string;
    borderClass: string;
    badgeBgClass: string;
    badgeTextClass: string;
    badgeBorderClass: string;
    textClass: string;
    label: string;
    icon: string;
}

/**
 * Returns dynamic theme colors, borders, and icons for overlapping events in Grid View.
 * Matches:
 *  - Break: Red/Pink (rgba(255, 99, 132, 0.25) / rose)
 *  - Manual Doctor Booking: Orange/Amber (rgba(245, 158, 11, 0.25) / amber)
 *  - Patient Appointment: Blue/Indigo (online) or Green/Emerald (in-person)
 */
function getEventTheme(eventType: string, consultationType?: string): EventThemeConfig {
    if (eventType === 'break') {
        return {
            fillColor: 'rgba(255, 99, 132, 0.25)', // Red / Pink theme
            borderClass: 'border-rose-400 border-dashed hover:border-rose-600',
            badgeBgClass: 'bg-rose-100/90',
            badgeTextClass: 'text-rose-900',
            badgeBorderClass: 'border-rose-300',
            textClass: 'text-rose-600',
            label: 'Break Overlap',
            icon: 'fa-mug-hot'
        };
    }

    if (eventType === 'manual_appointment') {
        return {
            fillColor: 'rgba(245, 158, 11, 0.25)', // Orange / Amber theme
            borderClass: 'border-amber-400 border-dashed hover:border-amber-600',
            badgeBgClass: 'bg-amber-100/90',
            badgeTextClass: 'text-amber-900',
            badgeBorderClass: 'border-amber-300',
            textClass: 'text-amber-700',
            label: 'Doctor Booking',
            icon: 'fa-user-tag'
        };
    }

    // Patient Appointment: In-Person (Green/Emerald) or Online (Blue/Indigo)
    const isPhysical = consultationType === 'offline' || consultationType === 'physical';
    if (isPhysical) {
        return {
            fillColor: 'rgba(16, 185, 129, 0.25)', // Green / Emerald theme
            borderClass: 'border-emerald-400 border-dashed hover:border-emerald-600',
            badgeBgClass: 'bg-emerald-100/90',
            badgeTextClass: 'text-emerald-900',
            badgeBorderClass: 'border-emerald-300',
            textClass: 'text-emerald-700',
            label: 'Clinic Appt Overlap',
            icon: 'fa-hospital'
        };
    }

    return {
        fillColor: 'rgba(99, 102, 241, 0.25)', // Blue / Indigo theme
        borderClass: 'border-indigo-400 border-dashed hover:border-indigo-600',
        badgeBgClass: 'bg-indigo-100/90',
        badgeTextClass: 'text-indigo-900',
        badgeBorderClass: 'border-indigo-300',
        textClass: 'text-indigo-700',
        label: 'Online Appt Overlap',
        icon: 'fa-video'
    };
}

function getPatientDisplayName(appointmentOrPatient: any): string {
    if (!appointmentOrPatient) return "Patient";
    if (appointmentOrPatient.manualPatientDetails?.name) {
        const op = appointmentOrPatient.manualPatientDetails.opNumber ? ` (OP: ${appointmentOrPatient.manualPatientDetails.opNumber})` : '';
        return `${appointmentOrPatient.manualPatientDetails.name}${op}`;
    }
    if (appointmentOrPatient.profileId?.firstName) {
        return `${appointmentOrPatient.profileId.firstName} ${appointmentOrPatient.profileId.lastName || ''}`.trim();
    }
    if (appointmentOrPatient.firstName) {
        return `${appointmentOrPatient.firstName} ${appointmentOrPatient.lastName || ''}`.trim();
    }
    if (appointmentOrPatient.googleName) return appointmentOrPatient.googleName;
    if (appointmentOrPatient.email) {
        const emailName = appointmentOrPatient.email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
    }
    return "Patient";
}

export default function ScheduleClient() {
    const dispatch = useAppDispatch();
    const { profile: doctorProfile } = useAppSelector((state) => state.doctor);
    const { user } = useAppSelector((state) => state.auth);
    const { doctorAppointments: appointments = [] } = useAppSelector((state) => state.appointment);

    // Doctor profile resolution (prioritize DoctorProfile ID for backend slot resolution)
    const doctor = doctorProfile || (typeof user?.profileId === 'object' ? user?.profileId : null) || user || {};
    const doctorId = 
        (typeof user?.profileId === 'string' ? user.profileId : user?.profileId?._id) ||
        doctorProfile?.profileId ||
        doctorProfile?._id ||
        doctorProfile?.id || 
        user?._id ||
        user?.id ||
        doctor?._id ||
        doctor?.id;

    const rawWH = doctor.workingHours || doctorProfile?.workingHours || user?.profileId?.workingHours || {};

    // 14-Day Rolling Window Boundaries (identical to BookingForm.tsx)
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const maxBookingDate = useMemo(() => {
        const max = new Date(today);
        max.setDate(today.getDate() + 14);
        max.setHours(23, 59, 59, 999);
        return max;
    }, [today]);

    const slotDuration = doctor.slotDuration || doctorProfile?.slotDuration || 15;

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const isPastDate = (d: Date) => d < today;

    /* ── State ── */
    const [selectedDate, setSelectedDate] = useState<Date>(today);

    const isSlotInPast = useCallback((timeStr: string) => {
        if (isPastDate(selectedDate)) return true;
        if (isSameDay(selectedDate, today)) {
            const slotMins = parseTimeToMinutes(timeStr);
            const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
            return slotMins <= nowMins;
        }
        return false;
    }, [selectedDate, today]);
    const [calendarYear, setCalendarYear] = useState(() => today.getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(() => today.getMonth());
    const [showFullCalendar, setShowFullCalendar] = useState<boolean>(false);
    const [allSlots, setAllSlots] = useState<DoctorSlot[]>([]);
    const [doctorWorking, setDoctorWorking] = useState(true);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
    const [managingSlot, setManagingSlot] = useState<DoctorSlot | null>(null);
    const [managingSlotTab, setManagingSlotTab] = useState<'book' | 'break'>('book');
    const [manualPatientName, setManualPatientName] = useState<string>('');
    const [manualOpNumber, setManualOpNumber] = useState<string>('');
    const [manualPhone, setManualPhone] = useState<string>('');
    const [manualPatientType, setManualPatientType] = useState<'NEW' | 'FOLLOW_UP'>('NEW');
    const [manualNotes, setManualNotes] = useState<string>('');
    const [isBookingManual, setIsBookingManual] = useState<boolean>(false);
    const [isUpdatingSlot, setIsUpdatingSlot] = useState<boolean>(false);
    const [slotActionFeedback, setSlotActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
    const [dayOverrides, setDayOverrides] = useState<any[]>([]);
    const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
    const [appointmentToCancel, setAppointmentToCancel] = useState<any | null>(null);
    const [isRemovingBreak, setIsRemovingBreak] = useState<boolean>(false);

    // Initial data fetch
    useEffect(() => {
        dispatch(fetchDoctorProfile());
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    // Calculate initial next working date when rawWH is populated
    useEffect(() => {
        if (rawWH && Object.keys(rawWH).length > 0) {
            const nextDate = findNextWorkingDate(rawWH, today, maxBookingDate);
            setSelectedDate(nextDate);
            setCalendarYear(nextDate.getFullYear());
            setCalendarMonth(nextDate.getMonth());
        }
    }, [rawWH, today, maxBookingDate]);

    const dateString = useMemo(() => {
        return [
            selectedDate.getFullYear(),
            String(selectedDate.getMonth() + 1).padStart(2, "0"),
            String(selectedDate.getDate()).padStart(2, "0"),
        ].join("-");
    }, [selectedDate]);

    /* ── Fetch Unified Slots From Backend API ── */
    const fetchSlots = useCallback(async () => {
        if (!doctorId) return;
        setIsLoadingSlots(true);
        setDoctorWorking(true);
        try {
            const res = await getAvailableSlots(doctorId, dateString, 'all');
            if (res.success) {
                setAllSlots(res.allSlots || []);
                setDayOverrides(res.overrides || res.slotOverrides || res.breaks || []);
                setDoctorWorking(res.doctorWorking !== false);
            } else {
                setAllSlots([]);
                setDayOverrides([]);
                setDoctorWorking(false);
            }
        } catch {
            setAllSlots([]);
            setDayOverrides([]);
            setDoctorWorking(false);
        } finally {
            setIsLoadingSlots(false);
        }
    }, [doctorId, dateString]);

    const handleRemoveBreak = async (timeStr: string, startTimeForPastCheck?: string) => {
        const checkTime = startTimeForPastCheck || timeStr;
        if (isSlotInPast(checkTime)) {
            setSlotActionFeedback({
                type: 'error',
                message: 'Cannot update or remove breaks for times that have already passed.'
            });
            return;
        }
        setIsRemovingBreak(true);
        setSlotActionFeedback(null);
        try {
            const res = await toggleDoctorSlotOverride(dateString, timeStr, 'open');
            if (res.success) {
                setSlotActionFeedback({
                    type: 'success',
                    message: res.message || `Break at ${timeStr} removed successfully. Overlapped slot is now open.`
                });
                await fetchSlots();
            } else {
                setSlotActionFeedback({
                    type: 'error',
                    message: res.message || 'Failed to remove break'
                });
            }
        } catch (err: any) {
            setSlotActionFeedback({
                type: 'error',
                message: err?.response?.data?.message || err?.message || 'Error removing break'
            });
        } finally {
            setIsRemovingBreak(false);
        }
    };

    const handleCancelManualAppointment = async (appointmentId: string) => {
        if (appointmentToCancel) {
            const appDate = new Date(appointmentToCancel.appointmentDate);
            const isPast = isPastDate(appDate) ||
                (isSameDay(appDate, today) &&
                 parseTimeToMinutes(appointmentToCancel.appointmentTime) <= (new Date().getHours() * 60 + new Date().getMinutes()));
            if (isPast) {
                setSlotActionFeedback({
                    type: 'error',
                    message: 'Cannot cancel an appointment for a time that has already passed.'
                });
                setAppointmentToCancel(null);
                return;
            }
        }
        setCancellingAppointmentId(appointmentId);
        setSlotActionFeedback(null);
        try {
            const res = await dispatch(cancelAppointment({
                appointmentId,
                reason: 'Cancelled by doctor via Agenda View'
            }));
            if (cancelAppointment.fulfilled.match(res)) {
                setSlotActionFeedback({
                    type: 'success',
                    message: 'Manual appointment cancelled successfully. The slot is now free.'
                });
                setAppointmentToCancel(null);
                await fetchSlots();
                dispatch(fetchDoctorAppointments());
            } else {
                setSlotActionFeedback({
                    type: 'error',
                    message: (res.payload as string) || 'Failed to cancel appointment'
                });
            }
        } catch (err: any) {
            setSlotActionFeedback({
                type: 'error',
                message: err?.message || 'Error cancelling appointment'
            });
        } finally {
            setCancellingAppointmentId(null);
        }
    };

    const handleToggleSlotOverride = async (slotTime: string, action: 'close' | 'open') => {
        if (isSlotInPast(slotTime)) {
            setSlotActionFeedback({
                type: 'error',
                message: 'Cannot update or modify slot status for times that have already passed.'
            });
            return;
        }
        setIsUpdatingSlot(true);
        setSlotActionFeedback(null);
        try {
            const startMins = parseTimeToMinutes(slotTime);
            const duration = slotDuration;
            const endMins = startMins + duration;
            const endTimeStr = formatMinutesTo12H(endMins);
            const res = await toggleDoctorSlotOverride(
                dateString, 
                slotTime, 
                action, 
                'Closed / On Break',
                slotTime,
                endTimeStr,
                duration
            );
            if (res.success) {
                setSlotActionFeedback({
                    type: 'success',
                    message: res.message || (action === 'close' ? 'Slot marked as closed / on break' : 'Slot reopened for booking successfully')
                });
                await fetchSlots();
                setTimeout(() => {
                    setManagingSlot(null);
                    setSlotActionFeedback(null);
                }, 600);
            } else {
                setSlotActionFeedback({
                    type: 'error',
                    message: res.message || 'Failed to update slot status'
                });
            }
            
        } catch (err: any) {
            setSlotActionFeedback({
                type: 'error',
                message: err?.response?.data?.message || err?.message || 'Error updating slot status'
            });
        } finally {
            setIsUpdatingSlot(false);
        }
    };

    const handleManualBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!managingSlot) return;
        if (isSlotInPast(managingSlot.time)) {
            setSlotActionFeedback({
                type: 'error',
                message: 'Cannot book a slot for a time that has already passed.'
            });
            return;
        }
        if (!manualPatientName.trim()) {
            setSlotActionFeedback({ type: 'error', message: 'Patient Name is required.' });
            return;
        }
        setIsBookingManual(true);
        setSlotActionFeedback(null);
        try {
            const res = await manualBookDoctorSlot({
                date: dateString,
                time: managingSlot.time,
                patientName: manualPatientName.trim(),
                opNumber: manualOpNumber.trim() || undefined,
                patientPhone: manualPhone.trim() || undefined,
                patientType: manualPatientType,
                notes: manualNotes.trim() || undefined,
                fee: 0
            });
            if (res.success) {
                setSlotActionFeedback({
                    type: 'success',
                    message: res.message || `Slot at ${managingSlot.time} successfully booked offline for ${manualPatientName.trim()}.`
                });
                await fetchSlots();
                dispatch(fetchDoctorAppointments());
                setTimeout(() => {
                    setManagingSlot(null);
                    setSlotActionFeedback(null);
                    setManualPatientName('');
                    setManualOpNumber('');
                    setManualPhone('');
                    setManualNotes('');
                }, 700);
            } else {
                setSlotActionFeedback({
                    type: 'error',
                    message: res.message || 'Failed to manually book slot'
                });
            }
        } catch (err: any) {
            setSlotActionFeedback({
                type: 'error',
                message: err?.response?.data?.message || err?.message || 'Error booking slot'
            });
        } finally {
            setIsBookingManual(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    /* ── Calendar Helpers (Allow Past Browsing for History & Analytics) ── */
    const minPastDate = useMemo(() => new Date(today.getFullYear() - 2, 0, 1), [today]);
    const maxFutureDate = useMemo(() => new Date(today.getFullYear() + 2, 11, 31), [today]);

    const canGoPrevMonth = new Date(calendarYear, calendarMonth, 1) > minPastDate;
    const canGoNextMonth = new Date(calendarYear, calendarMonth, 1) < maxFutureDate;

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

    const goToPrevDay = () => {
        setSelectedDate(prev => {
            const d = new Date(prev);
            d.setDate(prev.getDate() - 1);
            setCalendarYear(d.getFullYear());
            setCalendarMonth(d.getMonth());
            return d;
        });
    };

    const goToNextDay = () => {
        setSelectedDate(prev => {
            const d = new Date(prev);
            d.setDate(prev.getDate() + 1);
            setCalendarYear(d.getFullYear());
            setCalendarMonth(d.getMonth());
            return d;
        });
    };

    const goToToday = () => {
        setSelectedDate(today);
        setCalendarYear(today.getFullYear());
        setCalendarMonth(today.getMonth());
    };

    const buildCalendarDays = (): (Date | null)[] => {
        const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
        const startDow = (firstOfMonth.getDay() + 6) % 7; // Mon = 0
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const cells: (Date | null)[] = [];
        for (let i = 0; i < startDow; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(calendarYear, calendarMonth, d));
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    };

    const isBeyond14Days = (d: Date) => d > maxBookingDate;
    const isDrWorking = (d: Date) => isDoctorAvailableOn(d, rawWH);

    const calendarDays = buildCalendarDays();

    // 14-Day Quick Selection List
    const quick14Days = useMemo(() => {
        const list: Date[] = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            list.push(d);
        }
        return list;
    }, [today]);

    // Shift Groups: Group slots by their shift, ensuring separation when gaps occur
    const shiftGroups = useMemo(() => {
        if (!allSlots || allSlots.length === 0) return [];

        const groups: { [key: string]: { name: string; start?: string; end?: string; shiftType?: string; slots: DoctorSlot[] } } = {};

        allSlots.forEach((slot) => {
            const key = slot.shiftName || `shift_${slot.shiftIndex || '1'}`;
            if (!groups[key]) {
                groups[key] = {
                    name: slot.shiftName || (slot.shiftIndex ? `Shift ${slot.shiftIndex}` : 'Shift 1'),
                    start: slot.shiftStart,
                    end: slot.shiftEnd,
                    shiftType: slot.shiftType || 'mixed',
                    slots: []
                };
            }
            groups[key].slots.push(slot);
        });

        return Object.values(groups).map((group, idx) => {
            return {
                ...group,
                name: group.name || `Shift ${idx + 1}`,
                start: group.start,
                end: group.end
            };
        });
    }, [allSlots]);

    // Map booked appointments for quick lookup on selected date (supporting local & UTC dates)
    const appointmentsForSelectedDate = useMemo(() => {
        return appointments.filter((app: any) => {
            if (!app.appointmentDate) return false;
            const appDate = new Date(app.appointmentDate);
            const appDateStr = [
                appDate.getFullYear(),
                String(appDate.getMonth() + 1).padStart(2, "0"),
                String(appDate.getDate()).padStart(2, "0")
            ].join("-");
            
            const appUTCStr = typeof app.appointmentDate === 'string' 
                ? app.appointmentDate.split('T')[0] 
                : appDate.toISOString().split('T')[0];

            return (
                (appDateStr === dateString || appUTCStr === dateString) &&
                app.status !== 'cancelled' &&
                app.status !== 'cancelled_by_doctor'
            );
        });
    }, [appointments, selectedDate, dateString]);

    // Quick lookup from slot time to appointment doc
    const appointmentByTimeMap = useMemo(() => {
        const map = new Map<string, any>();
        appointmentsForSelectedDate.forEach((app: any) => {
            if (app.appointmentTime) {
                const norm = normalizeSlotTime(app.appointmentTime);
                map.set(norm, app);
                map.set(app.appointmentTime.trim(), app);
                map.set(app.appointmentTime.trim().toUpperCase(), app);
            }
        });
        return map;
    }, [appointmentsForSelectedDate]);

    // Unified Chronological Agenda Events (Appointments + Breaks) for selected day
    const agendaEvents = useMemo(() => {
        const events: any[] = [];
        const seenBreakTimes = new Set<string>();

        const isSelectedDatePast = isPastDate(selectedDate);
        const isSelectedDateToday = isSameDay(selectedDate, today);
        const currentMinutesToday = new Date().getHours() * 60 + new Date().getMinutes();

        const checkIsEventPast = (endMins: number, startMins: number) => {
            if (isSelectedDatePast) return true;
            if (isSelectedDateToday) return endMins <= currentMinutesToday;
            return false;
        };

        // 1. Process active appointments for selected day using exact raw appointment times
        appointmentsForSelectedDate.forEach((app: any) => {
            const timeStr = app.appointmentTime ? app.appointmentTime.trim() : "";
            const startMins = parseTimeToMinutes(timeStr);
            let durationMins = slotDuration;
            if (app.scheduledStartAt && app.scheduledEndAt) {
                const diff = Math.round((new Date(app.scheduledEndAt).getTime() - new Date(app.scheduledStartAt).getTime()) / 60000);
                if (diff > 0) durationMins = diff;
            }
            const endMins = startMins + durationMins;
            const endTimeStr = formatMinutesTo12H(endMins);
            const isManual = !!app.isManualBooking || !!app.bookedByDoctor;
            const isOffGrid = (startMins % slotDuration !== 0) || (durationMins % slotDuration !== 0);

            events.push({
                id: app._id || `app-${timeStr}`,
                eventType: isManual ? 'manual_appointment' : 'patient_appointment',
                startTimeStr: timeStr,
                endTimeStr,
                startMinutes: startMins,
                endMinutes: endMins,
                durationMinutes: durationMins,
                rawAppointment: app,
                patientName: isManual
                    ? (app.manualPatientDetails?.name || 'Walk-in Patient')
                    : getPatientDisplayName(app.patientId),
                opNumber: app.manualPatientDetails?.opNumber,
                patientPhone: app.manualPatientDetails?.phone,
                consultationType: app.consultationType || 'online',
                patientType: app.patientType || 'NEW',
                fee: app.fee,
                notes: app.notes || app.manualPatientDetails?.notes,
                status: app.status,
                isOffGrid,
                isPast: checkIsEventPast(endMins, startMins)
            });
        });

        // 2. Process breaks directly from RAW dayOverrides / slotOverrides (DB overrides)
        // DO NOT iterate over generated gridSlots or allSlots to avoid splitting off-grid breaks into multiple entries.
        // DO NOT add current global duration to start time. Use exact startTime and endTime from raw database object.
        (dayOverrides || []).forEach((ov: any) => {
            let startTimeStr = (ov.startTime || ov.startTimeStr || ov.start || "").trim();
            let endTimeStr = (ov.endTime || ov.endTimeStr || ov.end || "").trim();
            const rawTime = (ov.time || "").trim();

            if (rawTime.includes("-")) {
                const parts = rawTime.split("-").map((s: string) => s.trim());
                if (!startTimeStr) startTimeStr = parts[0];
                if (!endTimeStr && parts[1]) endTimeStr = parts[1];
            } else if (rawTime.toLowerCase().includes(" to ")) {
                const parts = rawTime.split(/ to /i).map((s: string) => s.trim());
                if (!startTimeStr) startTimeStr = parts[0];
                if (!endTimeStr && parts[1]) endTimeStr = parts[1];
            } else if (!startTimeStr && rawTime) {
                startTimeStr = rawTime;
            }

            if (!startTimeStr) return;

            const startMins = parseTimeToMinutes(startTimeStr);
            let endMins = endTimeStr ? parseTimeToMinutes(endTimeStr) : 0;
            const rawDuration = ov.duration || ov.durationMinutes;

            let durationMins: number;
            if (endTimeStr && endMins > startMins) {
                durationMins = endMins - startMins;
            } else if (rawDuration && rawDuration > 0) {
                durationMins = rawDuration;
                endMins = startMins + durationMins;
                endTimeStr = formatMinutesTo12H(endMins);
            } else {
                // If neither explicit endTime nor duration exists on the DB object,
                // use stored original duration or 10 min break default rather than current global slotDuration
                durationMins = ov.originalDuration || ov.initialSlotDuration || 10;
                endMins = startMins + durationMins;
                endTimeStr = formatMinutesTo12H(endMins);
            }

            const isOffGrid = (startMins % slotDuration !== 0) || (durationMins % slotDuration !== 0);

            // Deduplicate by override ID or normalized start time
            const uniqueKey = ov._id ? String(ov._id) : normalizeSlotTime(startTimeStr);
            if (seenBreakTimes.has(uniqueKey)) return;
            seenBreakTimes.add(uniqueKey);

            events.push({
                id: ov._id || `override-${startTimeStr}`,
                rawId: ov._id,
                eventType: 'break',
                startTimeStr,
                endTimeStr,
                startMinutes: startMins,
                endMinutes: endMins,
                durationMinutes: durationMins,
                rawTime: ov.time || startTimeStr,
                rawOverride: ov,
                reason: ov.reason || 'Closed / On Break',
                status: ov.status || 'unavailable',
                isOffGrid,
                isPast: checkIsEventPast(endMins, startMins)
            });
        });

        // 3. Merge appointments + breaks and sort chronologically by start time
        return events.sort((a, b) => a.startMinutes - b.startMinutes);
    }, [appointmentsForSelectedDate, dayOverrides, slotDuration, selectedDate, today]);

    const availableCount = allSlots.filter(s => s.status === "available" && !s.isBreak && !appointmentByTimeMap.get(normalizeSlotTime(s.time))).length;
    const bookedCount = allSlots.filter(s => s.status === "booked" || s.status === "Booked" || !!appointmentByTimeMap.get(normalizeSlotTime(s.time))).length;
    const breakCount = allSlots.filter(s => (s.status === "unavailable" || s.status === "break" || s.status === "closed" || s.isBreak) && !appointmentByTimeMap.get(normalizeSlotTime(s.time))).length;
    const lockedCount = allSlots.filter(s => s.status === "locked" || s.status === "Locked" || s.isLocked).length;

    return (
        <div className="doc-page flex flex-col gap-4 sm:gap-6 w-full max-w-7xl mx-auto overflow-x-hidden min-w-0">
            
            {/* ─── Top Header & Summary (Flexbox Row/Col) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-[#101044] via-[#16165a] to-[#1c1c70] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-[#101044]/15 border border-slate-800/20">
                <div className="flex flex-col gap-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-emerald-300 border border-white/10 w-fit">
                        <i className="fas fa-calendar-check text-emerald-400" />
                        <span>Doctor Schedule & Availability View</span>
                    </div>
                    <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                        My Schedule
                    </h1>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                        View live patient bookings, session shifts, and slot statuses across your 14-day rolling window.
                    </p>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 border border-white/10 flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold text-sm shrink-0">
                            <i className="fas fa-stopwatch text-emerald-300 text-xs sm:text-sm" />
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-wider">Slot Duration</p>
                            <p className="text-xs sm:text-sm font-extrabold whitespace-nowrap">{slotDuration} mins / session</p>
                        </div>
                    </div>

                    <Link
                        href="/doctor/profile/edit2?section=schedule"
                        className="flex-1 sm:flex-initial justify-center px-4 py-2.5 bg-white text-[#101044] hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap text-center"
                    >
                        <i className="fas fa-sliders text-[#101044] text-xs" />
                        <span>Edit Hours</span>
                    </Link>
                </div>
            </div>

            {/* ─── Date Navigation, Quick Controls & Daily Stats Bar ─── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm flex flex-col gap-3.5 w-full min-w-0">
                {/* Top Row: Prev Day / Date Display / Next Day / Today + Calendar Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    {/* Day Stepper */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button
                            type="button"
                            onClick={goToPrevDay}
                            title="Previous Day"
                            className="w-8 h-8 rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 bg-slate-50/70 hover:bg-indigo-50/50 flex items-center justify-center text-slate-600 transition active:scale-95 shrink-0"
                        >
                            <i className="fas fa-chevron-left text-xs" />
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                <i className="fas fa-calendar-day text-indigo-600 text-xs" />
                            </span>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                        {DAY_NAMES_JS[selectedDate.getDay()].toUpperCase().slice(0, 3)}, {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                                    </h2>
                                    {isSameDay(selectedDate, today) ? (
                                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Today</span>
                                    ) : isPastDate(selectedDate) ? (
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Past</span>
                                    ) : null}
                                </div>
                                <p className="text-[11px] text-slate-400">Viewing scheduled sessions for this day</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={goToNextDay}
                            title="Next Day"
                            className="w-8 h-8 rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 bg-slate-50/70 hover:bg-indigo-50/50 flex items-center justify-center text-slate-600 transition active:scale-95 shrink-0"
                        >
                            <i className="fas fa-chevron-right text-xs" />
                        </button>

                        {!isSameDay(selectedDate, today) && (
                            <button
                                type="button"
                                onClick={goToToday}
                                className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl hover:bg-indigo-100 transition whitespace-nowrap"
                            >
                                Jump to Today
                            </button>
                        )}
                    </div>

                    {/* Stats & Calendar Toggle */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* 4 Quick Day Stat Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {availableCount} Open
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                {bookedCount} Booked
                            </span>
                            {breakCount > 0 && (
                                <span className="text-[10px] sm:text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                                    <i className="fas fa-mug-hot text-[10px] text-rose-500" />
                                    {breakCount} Break
                                </span>
                            )}
                            {lockedCount > 0 && (
                                <span className="text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {lockedCount} In Cart
                                </span>
                            )}
                        </div>

                        {/* Calendar Dropdown Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowFullCalendar(prev => !prev)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                                showFullCalendar
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                            }`}
                        >
                            <i className={`fas ${showFullCalendar ? "fa-calendar-check" : "fa-calendar-alt"} text-xs`} />
                            <span>{showFullCalendar ? "Hide Calendar" : "Month Calendar & History"}</span>
                            <i className={`fas fa-chevron-${showFullCalendar ? "up" : "down"} text-[10px] ml-0.5 opacity-70`} />
                        </button>
                    </div>
                </div>

                {/* 14-Day Quick Selector (Grid 7x2 on mobile, 14 on desktop) */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <i className="fas fa-bolt text-amber-500 text-[10px]" />
                        <span>14-Day Rolling Window</span>
                    </span>
                    <div className="grid grid-cols-7 md:grid-cols-14 gap-1 sm:gap-1.5 w-full">
                        {quick14Days.map((d) => {
                            const isSelected = isSameDay(d, selectedDate);
                            const isDrOpen = isDrWorking(d);
                            const isToday = isSameDay(d, today);
                            
                            return (
                                <button
                                    key={d.toISOString()}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(d);
                                        setCalendarYear(d.getFullYear());
                                        setCalendarMonth(d.getMonth());
                                    }}
                                    className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-xl border transition-all text-center select-none active:scale-95 w-full
                                        ${isSelected
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 font-bold"
                                            : !isDrOpen
                                                ? "bg-slate-50 text-slate-400 border-dashed border-slate-200 hover:border-slate-300"
                                                : isToday
                                                    ? "bg-indigo-50/60 text-indigo-700 border-indigo-300 hover:bg-indigo-100 font-bold"
                                                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20"
                                        }`}
                                >
                                    <span className={`text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-wider ${isSelected ? 'text-indigo-200' : isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {isToday ? "Today" : DAY_LABELS[(d.getDay() + 6) % 7]}
                                    </span>
                                    <span className="text-xs sm:text-sm font-extrabold leading-tight mt-0.5">
                                        {d.getDate()}
                                    </span>
                                    <span className={`text-[8px] sm:text-[8.5px] font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        {!isDrOpen ? "Off" : MONTH_NAMES[d.getMonth()].slice(0, 3)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ─── Expandable Month Calendar & History Widget ─── */}
            {showFullCalendar && (
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-4 sm:p-5 flex flex-col gap-3 animate-fade-in w-full min-w-0">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <i className="fas fa-calendar-alt text-xs" />
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    {MONTH_NAMES[calendarMonth]} {calendarYear}
                                </h3>
                                <p className="text-[11px] text-slate-400">Click any date to view appointments or past records</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={goToPrevMonth}
                                disabled={!canGoPrevMonth}
                                aria-label="Previous month"
                                className={`w-8 h-8 flex items-center justify-center rounded-xl border text-slate-500 transition-colors ${!canGoPrevMonth ? 'opacity-30 cursor-not-allowed border-slate-100' : 'border-slate-200 hover:border-indigo-400 hover:text-indigo-600 bg-white active:scale-95'}`}
                            >
                                <i className="fas fa-chevron-left text-xs" />
                            </button>
                            <button
                                type="button"
                                onClick={goToNextMonth}
                                disabled={!canGoNextMonth}
                                aria-label="Next month"
                                className={`w-8 h-8 flex items-center justify-center rounded-xl border text-slate-500 transition-colors ${!canGoNextMonth ? 'opacity-30 cursor-not-allowed border-slate-100' : 'border-slate-200 hover:border-indigo-400 hover:text-indigo-600 bg-white active:scale-95'}`}
                            >
                                <i className="fas fa-chevron-right text-xs" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFullCalendar(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 bg-white ml-2 transition"
                                title="Close calendar view"
                            >
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar 7-Day Matrix */}
                    <div className="flex flex-col gap-1.5">
                        <div className="grid grid-cols-7 mb-1 gap-1">
                            {DAY_LABELS.map(d => (
                                <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-slate-400 py-1">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                            {calendarDays.map((day, idx) => {
                                if (!day) return <div key={`e-${idx}`} className="w-full h-10 sm:h-12" />;

                                const past = isPastDate(day);
                                const outOfWindow = isBeyond14Days(day);
                                const drOff = !past && !outOfWindow && !isDrWorking(day);
                                const selected = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, today);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDate(day);
                                            setCalendarYear(day.getFullYear());
                                            setCalendarMonth(day.getMonth());
                                        }}
                                        title={past ? "View past booking history" : outOfWindow ? "Future date outside 14-day booking window" : drOff ? "Doctor not scheduled" : "Select date"}
                                        className={`
                                            w-full h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center
                                            transition-all duration-150 relative text-center p-0.5 select-none active:scale-95
                                            ${selected
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-bold"
                                                : isToday
                                                    ? "border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold bg-white"
                                                    : past
                                                        ? "text-slate-600 bg-slate-100/80 border border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-600"
                                                        : drOff
                                                            ? "bg-slate-50 text-slate-400 border border-dashed border-slate-200 hover:bg-slate-100"
                                                            : outOfWindow
                                                                ? "text-slate-400 border border-slate-100 hover:bg-slate-100 bg-white"
                                                                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 bg-white"
                                            }
                                        `}
                                    >
                                        <span className="text-xs sm:text-sm leading-none font-bold">
                                            {day.getDate()}
                                        </span>
                                        <span className={`text-[8px] sm:text-[9px] leading-none mt-0.5 font-medium
                                            ${selected ? "text-indigo-200" : past ? "text-slate-400" : drOff ? "text-slate-400" : "text-slate-400"}`}>
                                            {past ? "Past" : drOff ? "Closed" : MONTH_NAMES[day.getMonth()].slice(0, 3)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Calendar legend */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                            {[
                                { color: "bg-indigo-600", label: "Selected" },
                                { color: "bg-white border-2 border-indigo-300", label: "Today" },
                                { color: "bg-white border border-slate-200", label: "Active Window" },
                                { color: "bg-slate-100 border border-slate-200", label: "Past History" },
                                { color: "bg-slate-100 border border-dashed border-slate-300", label: "Closed / Off" },
                            ].map(({ color, label }) => (
                                <span key={label} className="flex items-center gap-1">
                                    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${color}`} />
                                    <span>{label}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Main Scheduled Time Slots Container (Full Width, Vertical Scrolling) ─── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3.5 sm:p-5 flex flex-col gap-4 w-full min-w-0">
                        
                        {/* Past Date Banner */}
                        {isPastDate(selectedDate) && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                                        <i className="fas fa-history text-indigo-600 text-xs" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-950">
                                            Viewing Past History: {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] text-indigo-700">
                                            Review previous patient consultations and completed bookings.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(today);
                                        setCalendarYear(today.getFullYear());
                                        setCalendarMonth(today.getMonth());
                                    }}
                                    className="w-full sm:w-auto justify-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs hover:bg-indigo-50/50 transition-all flex items-center gap-1.5"
                                >
                                    <i className="fas fa-calendar-day text-[10px]" />
                                    <span>Back to Today</span>
                                </button>
                            </div>
                        )}

                        {/* Inline Feedback Banner */}
                        {slotActionFeedback && (
                            <div className={`p-3 sm:p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border animate-fade-in ${
                                slotActionFeedback.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <i className={`fas ${slotActionFeedback.type === 'success' ? 'fa-check-circle text-emerald-600' : 'fa-exclamation-circle text-rose-600'}`} />
                                    <span>{slotActionFeedback.message}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSlotActionFeedback(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <i className="fas fa-times text-xs" />
                                </button>
                            </div>
                        )}

                        {/* Time Slots Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex flex-col gap-0.5">
                                <h2 className="text-sm sm:text-base font-bold text-slate-800 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                        <i className={`fas ${viewMode === 'agenda' ? 'fa-list-check' : 'fa-clock'} text-indigo-600 text-xs`} />
                                    </span>
                                    <span>{viewMode === 'agenda' ? 'Daily Agenda Timeline' : 'Scheduled Time Slots'}</span>
                                    <span className="text-[11px] font-normal text-slate-400">
                                        — {MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                                    </span>
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    {viewMode === 'agenda'
                                        ? 'Detailed chronological timeline showing exact event intervals (bypassing grid intervals)'
                                        : `Grid view based on your configured ${slotDuration}-minute slot intervals`}
                                </p>
                            </div>

                            {/* View Toggle & Status Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Segmented Toggle (Grid View vs Agenda View) */}
                                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('grid')}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            viewMode === 'grid'
                                                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <i className="fas fa-border-all text-xs" />
                                        <span>Grid View</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('agenda')}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            viewMode === 'agenda'
                                                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <i className="fas fa-list-ul text-xs" />
                                        <span>Agenda View</span>
                                        {agendaEvents.length > 0 && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                                                viewMode === 'agenda' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {agendaEvents.length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Status Badges */}
                                {viewMode === 'grid' && (
                                    <div className="hidden lg:flex items-center gap-1.5">
                                        {availableCount > 0 && (
                                            <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                {availableCount} Available
                                            </span>
                                        )}
                                        {bookedCount > 0 && (
                                            <span className="text-[9.5px] sm:text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {bookedCount} Booked
                                            </span>
                                        )}
                                        {breakCount > 0 && (
                                            <span className="text-[9.5px] sm:text-[10px] font-bold text-rose-700 bg-rose-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-rose-200 flex items-center gap-1">
                                                <i className="fas fa-mug-hot text-[9px] text-rose-500" />
                                                {breakCount} Break
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Slots Content State */}
                        {isLoadingSlots ? (
                            <div className="flex items-center gap-2 text-slate-400 text-sm py-12 justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                                <span>Loading scheduled slots…</span>
                            </div>
                        ) : !doctorWorking ? (
                            <div className="flex items-start gap-3 p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl">
                                <span className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                    <i className="fas fa-calendar-xmark text-amber-600 text-base" />
                                </span>
                                <div>
                                    <p className="text-amber-900 text-sm font-bold">No Working Hours Configured for this Day</p>
                                    <p className="text-amber-700 text-xs mt-0.5">
                                        You have marked this day as off or no shifts are active in your working schedule.
                                    </p>
                                    <Link
                                        href="/doctor/profile/edit2?section=schedule"
                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2"
                                    >
                                        <span>Configure shifts for {DAY_NAMES_JS[selectedDate.getDay()]}</span>
                                        <i className="fas fa-arrow-right text-[10px]" />
                                    </Link>
                                </div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            allSlots.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                                        <i className="far fa-calendar-times text-slate-400 text-xl" />
                                    </span>
                                    <p className="text-slate-700 text-sm font-bold">No slots generated</p>
                                    <p className="text-slate-400 text-xs mt-0.5">Please check your shift start and end times in settings.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-5 sm:gap-6">
                                {shiftGroups.map((group, groupIdx) => {
                                    const availableInGroup = group.slots.filter(s => s.status === "available" && !s.isBreak && !appointmentByTimeMap.get(normalizeSlotTime(s.time))).length;
                                    const bookedInGroup = group.slots.filter(s => s.status === "booked" || s.status === "Booked" || !!appointmentByTimeMap.get(normalizeSlotTime(s.time))).length;
                                    const breakInGroup = group.slots.filter(s => (s.status === "unavailable" || s.status === "break" || s.status === "closed" || s.isBreak) && !appointmentByTimeMap.get(normalizeSlotTime(s.time))).length;
                                    const hasShiftMeta = group.name && (group.start || shiftGroups.length > 1);

                                    // Determine Shift Badge (Mixed, Online Only, In-Person Only)
                                    const isMixedShift = group.shiftType === 'mixed' || (group.slots.some(s => s.type === 'mixed') || (group.slots.some(s => s.type === 'online') && group.slots.some(s => s.type === 'offline')));
                                    const isOnlineOnlyShift = !isMixedShift && (group.shiftType === 'online' || group.slots.every(s => s.type === 'online'));
                                    const isOfflineOnlyShift = !isMixedShift && !isOnlineOnlyShift;

                                    return (
                                        <div key={`group-${groupIdx}`} className="flex flex-col gap-3">
                                            {hasShiftMeta && (
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                                                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                                            {group.name}
                                                        </span>
                                                        {group.start && group.end && (
                                                            <span className="text-xs text-slate-500 font-semibold">
                                                                ({group.start} – {group.end})
                                                            </span>
                                                        )}

                                                        {/* Shift Channel Badge */}
                                                        {isMixedShift ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                                <i className="fas fa-layer-group text-[8px] text-purple-500" />
                                                                Mixed (Online & In-Person)
                                                            </span>
                                                        ) : isOnlineOnlyShift ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                                <i className="fas fa-video text-[8px] text-indigo-500" />
                                                                Online Only
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <i className="fas fa-hospital text-[8px] text-emerald-500" />
                                                                In-Person Only
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-500 self-start sm:self-auto">
                                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                            {availableInGroup} Open
                                                        </span>
                                                        {bookedInGroup > 0 && (
                                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                                                                {bookedInGroup} Booked
                                                            </span>
                                                        )}
                                                        {breakInGroup > 0 && (
                                                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <i className="fas fa-mug-hot text-[8px]" />
                                                                {breakInGroup} Break
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Slot Grid: 2 cols on mobile, 3 on sm, 4 on md, 5 on lg, 6 on xl */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 w-full">
                                                {group.slots.map((slotObj, idx) => {
                                                    const { time: slotTime, status, isLocked, isExpired, type: slotCapability, bookedType: slotBookedType } = slotObj;
                                                    const normTime = normalizeSlotTime(slotTime);
                                                    const matchedAppointment = appointmentByTimeMap.get(normTime) || appointmentByTimeMap.get(slotTime) || appointmentByTimeMap.get(slotTime.trim());
                                                    const patientName = matchedAppointment
                                                        ? (matchedAppointment.manualPatientDetails?.name
                                                            ? `${matchedAppointment.manualPatientDetails.name}${matchedAppointment.manualPatientDetails.opNumber ? ` (OP: ${matchedAppointment.manualPatientDetails.opNumber})` : ''}`
                                                            : getPatientDisplayName(matchedAppointment.patientId))
                                                        : null;

                                                    const isSelectedDatePast = isPastDate(selectedDate);
                                                    const isSelectedDateToday = isSameDay(selectedDate, today);
                                                    const slotStartMins = parseTimeToMinutes(slotTime);
                                                    const slotEndMins = slotStartMins + slotDuration;
                                                    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
                                                    const isSlotPastTime = isSelectedDatePast || (isSelectedDateToday && slotStartMins < nowMins) || status === "past" || isExpired === true;

                                                    const isAnyLocked = (status === "locked" || status === "Locked" || isLocked === true) && !isSlotPastTime;
                                                    const isBooked = status === "booked" || status === "Booked" || !!matchedAppointment;
                                                    const isBreak = (status === "unavailable" || status === "break" || status === "closed" || slotObj.isBreak) && !isBooked && !isAnyLocked;
                                                    const isPastBreak = isBreak && isSlotPastTime;
                                                    const isPast = isSlotPastTime && !isBooked && !isBreak;
                                                    const isAvailable = status === "available" && !isBooked && !isAnyLocked && !isBreak && !isSlotPastTime;

                                                    // Identify any event (Patient Appointment, Doctor Manual Booking, or Break) that partially overlaps this slot
                                                    const conflictingEvent = agendaEvents.find(ev => {
                                                        const overlaps = slotStartMins < ev.endMinutes && slotEndMins > ev.startMinutes;
                                                        if (!overlaps) return false;
                                                        // Overlap is partial ONLY if the event does not completely engulf the slot
                                                        const isEngulfed = ev.startMinutes <= slotStartMins && ev.endMinutes >= slotEndMins;
                                                        return !isEngulfed;
                                                    });

                                                    const overlapData = conflictingEvent
                                                        ? calculateOverlapPercentages(slotStartMins, slotEndMins, conflictingEvent.startMinutes, conflictingEvent.endMinutes)
                                                        : null;

                                                    const isPartiallyOverlapped = !!conflictingEvent && !!overlapData?.hasOverlap && !isPast;
                                                    const eventTheme = (isPartiallyOverlapped && conflictingEvent)
                                                        ? getEventTheme(conflictingEvent.eventType, conflictingEvent.consultationType)
                                                        : null;

                                                    // Calculate dynamic linear-gradient CSS background fill using determined eventColor
                                                    let partialFillStyle: React.CSSProperties | undefined = undefined;
                                                    if (isPartiallyOverlapped && overlapData && eventTheme) {
                                                        const startOffset = overlapData.startOffsetPercentage;
                                                        const fillWidth = overlapData.fillWidthPercentage;
                                                        const endOffset = Math.min(100, Number((startOffset + fillWidth).toFixed(2)));
                                                        const eventColor = eventTheme.fillColor;

                                                        const gradient = `linear-gradient(to right, transparent 0%, transparent ${startOffset}%, ${eventColor} ${startOffset}%, ${eventColor} ${endOffset}%, transparent ${endOffset}%, transparent 100%)`;

                                                        partialFillStyle = {
                                                            background: gradient,
                                                            backgroundImage: gradient,
                                                            backgroundColor: '#ffffff'
                                                        };
                                                    }

                                                    // Determine booking channel type (Online vs In-Person)
                                                    const appConsultType = matchedAppointment?.consultationType || slotBookedType;
                                                    const isBookedOnline = appConsultType === 'online' || appConsultType === 'video';
                                                    const isBookedInPerson = appConsultType === 'offline' || appConsultType === 'physical';

                                                    return (
                                                        <div
                                                            key={`${slotTime}-${idx}`}
                                                            onClick={() => {
                                                                if (isPartiallyOverlapped && conflictingEvent) {
                                                                    if (conflictingEvent.rawAppointment) {
                                                                        setSelectedAppointment(conflictingEvent.rawAppointment);
                                                                    } else {
                                                                        setViewMode('agenda');
                                                                    }
                                                                } else if (matchedAppointment) {
                                                                    setSelectedAppointment(matchedAppointment);
                                                                } else if (!isSlotPastTime && (isAvailable || isBreak)) {
                                                                    setManagingSlot(slotObj);
                                                                    setSlotActionFeedback(null);
                                                                    setManagingSlotTab(isBreak ? 'break' : 'book');
                                                                }
                                                            }}
                                                            style={partialFillStyle}
                                                            title={
                                                                isPartiallyOverlapped
                                                                    ? `Partially overlapped (${overlapData?.overlapMinutes || 0}m) by ${eventTheme?.label || 'event'}. Click to view details.`
                                                                    : undefined
                                                            }
                                                            className={`
                                                                relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-center
                                                                ${isPast
                                                                    ? "bg-slate-50/70 text-slate-300 border-slate-100 cursor-default"
                                                                    : isPastBreak
                                                                        ? "bg-slate-50/80 text-slate-400 border-slate-200/80 cursor-default opacity-75"
                                                                        : isPartiallyOverlapped && eventTheme
                                                                            ? `${eventTheme.borderClass} text-slate-900 shadow-2xs cursor-pointer active:scale-[0.98] group`
                                                                            : isAnyLocked
                                                                                ? "bg-amber-50 text-amber-900 border-amber-300 shadow-sm cursor-default"
                                                                                : isBooked
                                                                                    ? isBookedInPerson 
                                                                                        ? "bg-emerald-50/60 text-emerald-950 border-emerald-300 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer active:scale-[0.98] group"
                                                                                        : "bg-indigo-50/60 text-indigo-950 border-indigo-300 shadow-sm hover:border-indigo-500 hover:shadow-md cursor-pointer active:scale-[0.98] group"
                                                                                    : isBreak
                                                                                        ? "bg-rose-50/70 text-rose-950 border-rose-300 shadow-2xs hover:border-rose-500 hover:bg-rose-100/60 cursor-pointer active:scale-[0.98] group"
                                                                                        : isAvailable
                                                                                            ? "bg-white text-slate-800 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer active:scale-[0.98] group"
                                                                                            : "bg-white text-slate-700 border-slate-200"
                                                                }
                                                            `}
                                                        >
                                                            {/* Slot Time - Always centered and above background */}
                                                            <span className={`text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 relative z-10 w-full ${isPast || isPastBreak ? 'opacity-50' : ''}`}>
                                                                {isAnyLocked && <i className="fas fa-lock text-[10px] text-amber-500" />}
                                                                {isPartiallyOverlapped && eventTheme && (
                                                                    <i className={`fas ${eventTheme.icon} text-[10px] ${eventTheme.textClass}`} />
                                                                )}
                                                                {isBreak && !isPastBreak && !isPartiallyOverlapped && <i className="fas fa-mug-hot text-[10px] text-rose-500" />}
                                                                {isPastBreak && <i className="fas fa-history text-[10px] text-slate-400" />}
                                                                <span>{slotTime}</span>
                                                            </span>

                                                            {/* Slot Capability Mode Badge (Mixed / Online / In-Person) */}
                                                            <div className="mt-1 flex flex-col items-center justify-center w-full relative z-10">
                                                                {slotCapability === 'mixed' ? (
                                                                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50/90 px-1.5 sm:px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1 shadow-2xs">
                                                                        <i className="fas fa-arrows-split-up-and-left text-[7px]" />
                                                                        Mixed
                                                                    </span>
                                                                ) : slotCapability === 'online' ? (
                                                                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/90 px-1.5 sm:px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1 shadow-2xs">
                                                                        <i className="fas fa-video text-[7px]" />
                                                                        Online
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50/90 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1 shadow-2xs">
                                                                        <i className="fas fa-hospital text-[7px]" />
                                                                        In-Person
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Booking Status / Break / Lock / Past Details */}
                                                            {isPartiallyOverlapped && eventTheme ? (
                                                                <div className="mt-1 flex flex-col items-center justify-center w-full relative z-10">
                                                                    <span className={`text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider ${eventTheme.badgeTextClass} ${eventTheme.badgeBgClass} px-1.5 sm:px-2 py-0.5 rounded-md border ${eventTheme.badgeBorderClass} flex items-center justify-center gap-1 shadow-2xs w-full`}>
                                                                        <span className="text-[8px]">⚠️</span>
                                                                        <span className="truncate">{overlapData?.overlapMinutes ? `${overlapData.overlapMinutes}m Overlap` : 'Partial Overlap'}</span>
                                                                    </span>
                                                                    <span className={`text-[7.5px] sm:text-[8px] ${eventTheme.textClass} font-bold group-hover:underline flex items-center justify-center gap-0.5 mt-0.5 transition truncate max-w-full`}>
                                                                        <i className="fas fa-stream text-[6.5px]" />
                                                                        <span className="truncate">
                                                                            {conflictingEvent?.patientName 
                                                                                ? conflictingEvent.patientName 
                                                                                : conflictingEvent?.eventType === 'break' 
                                                                                    ? 'Manage Break' 
                                                                                    : eventTheme.label}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            ) : isBooked ? (
                                                                <div className="mt-1 flex flex-col items-center w-full">
                                                                    <span className={`text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md flex items-center justify-center gap-1 shadow-2xs w-full
                                                                        ${isBookedInPerson ? 'text-emerald-800 bg-emerald-100/90 border border-emerald-200' : 'text-indigo-800 bg-indigo-100/90 border border-indigo-200'}`}>
                                                                        <i className={`fas ${isBookedInPerson ? 'fa-hospital' : 'fa-video'} text-[7px] shrink-0`} />
                                                                        <span className="truncate">Booked ({isBookedInPerson ? 'Clinic' : 'Online'})</span>
                                                                    </span>
                                                                    {patientName && (
                                                                        <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-700 mt-0.5 truncate max-w-[120px] w-full block group-hover:text-indigo-600">
                                                                            {patientName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : isPastBreak ? (
                                                                <div className="mt-1 flex flex-col items-center w-full">
                                                                    <span className="text-[7.5px] sm:text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-200 flex items-center justify-center gap-1 shadow-2xs w-full">
                                                                        <i className="fas fa-history text-[7px] text-slate-400 shrink-0" />
                                                                        <span className="truncate">Past Break</span>
                                                                    </span>
                                                                </div>
                                                            ) : isBreak ? (
                                                                <div className="mt-1 flex flex-col items-center w-full">
                                                                    <span className="text-[7.5px] sm:text-[8px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 px-1.5 sm:px-2 py-0.5 rounded-md border border-rose-200 flex items-center justify-center gap-1 shadow-2xs w-full">
                                                                        <i className="fas fa-ban text-[7px] text-rose-500 shrink-0" />
                                                                        <span className="truncate">Closed / On Break</span>
                                                                    </span>
                                                                    <span className="text-[7.5px] sm:text-[8px] text-rose-500 font-semibold group-hover:underline flex items-center gap-0.5 mt-0.5 transition">
                                                                        <i className="fas fa-undo-alt text-[6.5px]" />
                                                                        <span>Reopen</span>
                                                                    </span>
                                                                </div>
                                                            ) : isAvailable ? (
                                                                <div className="mt-1 flex flex-col items-center w-full">
                                                                    <span className="text-[7.5px] sm:text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                        Open
                                                                    </span>
                                                                    <span className="text-[7.5px] sm:text-[8px] text-slate-400 font-medium group-hover:text-indigo-600 flex items-center gap-0.5 mt-0.5 transition opacity-70 group-hover:opacity-100">
                                                                        <i className="fas fa-coffee text-[6.5px]" />
                                                                        <span>Take Break</span>
                                                                    </span>
                                                                </div>
                                                            ) : isAnyLocked ? (
                                                                <span className="text-[8px] sm:text-[8.5px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded-md mt-1 border border-amber-200">
                                                                    In Checkout
                                                                </span>
                                                            ) : isPast ? (
                                                                <span className="text-[8px] sm:text-[8.5px] font-medium text-slate-400 mt-1">
                                                                    Past
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Slot Legend */}
                                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 pt-4 border-t border-slate-100 text-[10.5px] sm:text-xs text-slate-500">
                                    <span className="font-semibold text-slate-700 w-full sm:w-auto">Slot Legend:</span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-purple-50 border border-purple-200 shrink-0" />
                                        Mixed Slot (Online & In-Person)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-indigo-50 border border-indigo-200 shrink-0" />
                                        Online Slot
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-200 shrink-0" />
                                        In-Person Slot
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-indigo-100 border border-indigo-400 shrink-0" />
                                        Booked (Click to view patient)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-md bg-rose-50 border border-rose-400 shrink-0" />
                                        On Break / Closed (Click to reopen)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span 
                                            className="w-3 h-3 rounded-md border border-rose-400 border-dashed shrink-0" 
                                            style={{ background: "linear-gradient(to right, transparent 50%, rgba(255, 99, 132, 0.35) 50%), #ffffff" }}
                                        />
                                        Break Overlap
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span 
                                            className="w-3 h-3 rounded-md border border-amber-400 border-dashed shrink-0" 
                                            style={{ background: "linear-gradient(to right, transparent 50%, rgba(245, 158, 11, 0.35) 50%), #ffffff" }}
                                        />
                                        Manual Overlap
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span 
                                            className="w-3 h-3 rounded-md border border-indigo-400 border-dashed shrink-0" 
                                            style={{ background: "linear-gradient(to right, transparent 50%, rgba(99, 102, 241, 0.35) 50%), #ffffff" }}
                                        />
                                        Appt Overlap
                                    </span>
                                </div>
                            </div>
                        )) : (
                            /* ─── Agenda View (Chronological Timeline) ─── */
                            <div className="flex flex-col gap-4 animate-fade-in">
                                {/* Informational Banner */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <i className="fas fa-stream text-xs" />
                                        </span>
                                        <p>
                                            Timeline displays <strong>exact start and end times</strong> for all events. Removing a break or cancelling a manual booking immediately frees up that time lapse in your Grid View.
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 self-start sm:self-auto shrink-0 shadow-2xs">
                                        {agendaEvents.length} {agendaEvents.length === 1 ? 'Event' : 'Events'} Today
                                    </span>
                                </div>

                                {agendaEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3 shadow-2xs">
                                            <i className="fas fa-calendar-check text-2xl" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-extrabold text-slate-800">No Events or Breaks Scheduled</h3>
                                        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                                            There are no patient consultations, direct manual bookings, or active breaks for this day. All shifts remain open for booking.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode('grid')}
                                            className="px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1.5 active:scale-95"
                                        >
                                            <i className="fas fa-border-all text-xs" />
                                            <span>Switch to Grid View</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {agendaEvents.map((event, idx) => {
                                            const isManual = event.eventType === 'manual_appointment';
                                            const isBreak = event.eventType === 'break';
                                            const isPatient = event.eventType === 'patient_appointment';

                                            return (
                                                <div
                                                    key={event.id || idx}
                                                    className={`p-3.5 sm:p-4.5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-2xs ${
                                                        isBreak
                                                            ? "bg-rose-50/40 border-rose-200/90 hover:border-rose-300"
                                                            : isManual
                                                                ? "bg-amber-50/40 border-amber-200/90 hover:border-amber-300"
                                                                : "bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs"
                                                    }`}
                                                >
                                                    {/* Left Section: Time Block & Details */}
                                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                                        {/* Precise Time Pill */}
                                                        <div className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border shrink-0 min-w-[110px] text-center ${
                                                            isBreak
                                                                ? "bg-white text-rose-950 border-rose-200 shadow-2xs"
                                                                : isManual
                                                                    ? "bg-white text-amber-950 border-amber-200 shadow-2xs"
                                                                    : "bg-indigo-50/70 text-indigo-950 border-indigo-200 shadow-2xs"
                                                        }`}>
                                                            <span className="text-xs sm:text-sm font-extrabold flex items-center gap-1 whitespace-nowrap">
                                                                <i className={`fas ${isBreak ? 'fa-mug-hot text-rose-500' : isManual ? 'fa-user-tag text-amber-600' : 'fa-clock text-indigo-600'} text-[10px]`} />
                                                                {event.startTimeStr}
                                                            </span>
                                                            <span className="text-[10.5px] text-slate-500 font-semibold whitespace-nowrap">
                                                                to {event.endTimeStr}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                                                                ({event.durationMinutes} mins)
                                                            </span>
                                                        </div>

                                                        {/* Content / Info */}
                                                        <div className="flex flex-col gap-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                {/* Type Badges */}
                                                                {isBreak && (
                                                                    <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                                                                        <i className="fas fa-ban text-[8px]" />
                                                                        Doctor Break / Closed
                                                                    </span>
                                                                )}
                                                                {isManual && (
                                                                    <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                                                        <i className="fas fa-user-tag text-[8px] text-amber-700" />
                                                                        Doctor Direct Booking
                                                                    </span>
                                                                )}
                                                                {isPatient && (
                                                                    <span className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200">
                                                                        <i className="fas fa-user-check text-[8px] text-indigo-600" />
                                                                        Patient Booking
                                                                    </span>
                                                                )}

                                                                {/* Grid Overlap Warning Badge */}
                                                                {event.isOffGrid && (
                                                                    <span 
                                                                        className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                                                                        title={`This event does not align with the current ${slotDuration}-minute grid intervals and locks adjacent slots.`}
                                                                    >
                                                                        <span className="text-[10px]">⚠️</span>
                                                                        <span>Grid Overlap</span>
                                                                    </span>
                                                                )}

                                                                {/* Consultation Channel Badge */}
                                                                {!isBreak && (
                                                                    <span className={`inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                                                        event.consultationType === 'offline' || event.consultationType === 'physical'
                                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                                                    }`}>
                                                                        <i className={`fas ${event.consultationType === 'offline' || event.consultationType === 'physical' ? 'fa-hospital' : 'fa-video'} text-[8px]`} />
                                                                        {event.consultationType === 'offline' || event.consultationType === 'physical' ? 'In-Person Clinic' : 'Telehealth Video'}
                                                                    </span>
                                                                )}

                                                                {/* Patient OP / Visit Badge */}
                                                                {isManual && event.opNumber && (
                                                                    <span className="text-[9.5px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                                                                        OP: {event.opNumber}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Primary Title / Name */}
                                                            <div>
                                                                {isBreak ? (
                                                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                                        <span>{event.reason || 'Doctor Break'}</span>
                                                                    </h4>
                                                                ) : (
                                                                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 truncate">
                                                                        <span className="truncate">{event.patientName}</span>
                                                                        {event.fee !== undefined && (
                                                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                                                                ₹{event.fee}
                                                                            </span>
                                                                        )}
                                                                    </h4>
                                                                )}

                                                                {/* Subtitle / Metadata */}
                                                                {isBreak ? (
                                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                                        {event.isOffGrid ? (
                                                                            <span className="text-amber-800 font-semibold flex items-center gap-1">
                                                                                <span>⚠️ Non-grid timing ({event.durationMinutes}m) locks adjacent {slotDuration}-minute slots in Grid View.</span>
                                                                            </span>
                                                                        ) : (
                                                                            "Blocks overlapping slots in the grid. Removing this will immediately free up the slot."
                                                                        )}
                                                                    </p>
                                                                ) : (
                                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
                                                                        {event.isOffGrid && (
                                                                            <span className="text-amber-800 font-semibold text-[11px] flex items-center gap-1">
                                                                                <span>⚠️ Non-grid timing locks adjacent slots in Grid View.</span>
                                                                            </span>
                                                                        )}
                                                                        {event.patientPhone && (
                                                                            <span className="flex items-center gap-1 text-[11px]">
                                                                                <i className="fas fa-phone text-[9px] text-slate-400" />
                                                                                {event.patientPhone}
                                                                            </span>
                                                                        )}
                                                                        {event.patientType && (
                                                                            <span className="text-[11px] font-medium text-slate-600">
                                                                                {event.patientType === 'FOLLOW_UP' ? 'Follow-Up' : 'New Visit'}
                                                                            </span>
                                                                        )}
                                                                        {event.notes && (
                                                                            <span className="italic text-slate-400 text-[11px] truncate max-w-xs block">
                                                                                &ldquo;{event.notes}&rdquo;
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Section: Actions */}
                                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                                        {isBreak && (
                                                            event.isPast ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs shadow-2xs">
                                                                    <i className="fas fa-history text-[10px]" />
                                                                    <span>Past Break</span>
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveBreak(event.rawTime || event.startTimeStr, event.startTimeStr)}
                                                                    disabled={isRemovingBreak}
                                                                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs shadow-2xs hover:shadow transition flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
                                                                >
                                                                    {isRemovingBreak ? (
                                                                        <>
                                                                            <i className="fas fa-spinner fa-spin text-xs" />
                                                                            <span>Removing...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fas fa-trash-alt text-[10px]" />
                                                                            <span>Remove Break</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )
                                                        )}

                                                        {isManual && (
                                                            event.isPast ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs shadow-2xs">
                                                                    <i className="fas fa-check-double text-[10px]" />
                                                                    <span>Completed / Past</span>
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAppointmentToCancel(event.rawAppointment)}
                                                                    disabled={cancellingAppointmentId === event.id}
                                                                    className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs shadow-2xs hover:shadow transition flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
                                                                >
                                                                    <i className="fas fa-times-circle text-[11px]" />
                                                                    <span>Cancel Booking</span>
                                                                </button>
                                                            )
                                                        )}

                                                        {isPatient && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedAppointment(event.rawAppointment)}
                                                                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs shadow-2xs transition flex items-center gap-1.5 active:scale-95"
                                                            >
                                                                <i className="fas fa-eye text-[10px]" />
                                                                <span>View Details</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

            {/* ─── Slot Break / Availability Management Modal (Drawer on Mobile, Modal on Desktop) ─── */}
            {managingSlot && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 border border-slate-100 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    (managingSlot.status === 'unavailable' || managingSlot.status === 'break' || managingSlot.status === 'closed' || managingSlot.isBreak)
                                        ? 'bg-rose-100 text-rose-600'
                                        : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                    <i className={`fas ${
                                        (managingSlot.status === 'unavailable' || managingSlot.status === 'break' || managingSlot.status === 'closed' || managingSlot.isBreak)
                                            ? 'fa-mug-hot'
                                            : 'fa-clock'
                                    } text-xs`} />
                                </span>
                                <span>
                                    {(managingSlot.status === 'unavailable' || managingSlot.status === 'break' || managingSlot.status === 'closed' || managingSlot.isBreak)
                                        ? 'Manage Slot: Closed / On Break'
                                        : 'Manage Slot Availability'}
                                </span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setManagingSlot(null);
                                    setSlotActionFeedback(null);
                                }}
                                disabled={isUpdatingSlot}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition disabled:opacity-50"
                            >
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>

                        {/* Inline Feedback Banner */}
                        {slotActionFeedback && (
                            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                                slotActionFeedback.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                                <i className={`fas ${slotActionFeedback.type === 'success' ? 'fa-check-circle text-emerald-600' : 'fa-exclamation-circle text-rose-600'}`} />
                                <span>{slotActionFeedback.message}</span>
                            </div>
                        )}

                        {/* Slot Info Card */}
                        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl text-xs text-slate-600 border border-slate-100 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">Selected Slot Time:</span>
                                <span className="font-extrabold text-slate-900 text-sm">
                                    {managingSlot.time}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">Date:</span>
                                <span className="font-bold text-slate-800">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">Current Status:</span>
                                {(managingSlot.status === 'unavailable' || managingSlot.status === 'break' || managingSlot.status === 'closed' || managingSlot.isBreak) ? (
                                    <span className="font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                                        <i className="fas fa-ban text-[8px]" />
                                        Closed / On Break
                                    </span>
                                ) : (
                                    <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Open for Booking
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions Based on Current Status */}
                        {isSlotInPast(managingSlot.time) ? (
                            <div className="space-y-4">
                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center gap-2.5">
                                    <i className="fas fa-history text-slate-400 text-sm shrink-0" />
                                    <p>This slot is for a time that has already passed and cannot be updated.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setManagingSlot(null);
                                        setSlotActionFeedback(null);
                                    }}
                                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (managingSlot.status === 'unavailable' || managingSlot.status === 'break' || managingSlot.status === 'closed' || managingSlot.isBreak) ? (
                            /* Slot is on break -> Allow reopening */
                            <div className="space-y-4">
                                <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                                    <i className="fas fa-info-circle text-amber-600 mt-0.5 shrink-0" />
                                    <p>
                                        This slot is currently <strong>blocked from patient booking</strong>. Reopening it will immediately make it bookable again on your schedule.
                                    </p>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setManagingSlot(null);
                                            setSlotActionFeedback(null);
                                        }}
                                        disabled={isUpdatingSlot}
                                        className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
                                    >
                                        Keep Closed
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleSlotOverride(managingSlot.time, 'open')}
                                        disabled={isUpdatingSlot}
                                        className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 disabled:opacity-60"
                                    >
                                        {isUpdatingSlot ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin text-xs" />
                                                <span>Reopening...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check-circle text-xs" />
                                                <span>Reopen Slot</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Slot is open -> Tabbed Selection (Manual Offline Booking vs Close Slot / Break) */
                            <div className="space-y-4">
                                {/* Tab Selector */}
                                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setManagingSlotTab('book')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                            managingSlotTab === 'book'
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <i className="fas fa-user-plus text-[11px]" />
                                        <span>Manual Booking</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setManagingSlotTab('break')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                            managingSlotTab === 'break'
                                                ? 'bg-white text-rose-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <i className="fas fa-mug-hot text-[11px]" />
                                        <span>Take Break</span>
                                    </button>
                                </div>

                                {managingSlotTab === 'book' ? (
                                    <form onSubmit={handleManualBooking} className="space-y-3.5">
                                        {/* Informational Banner */}
                                        <div className="p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
                                            <span className="flex items-center gap-1.5 font-bold">
                                                <i className="fas fa-user-check text-emerald-600" />
                                                Direct Booking
                                            </span>
                                        </div>

                                        {/* Patient Name */}
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 mb-1 block">
                                                Patient Full Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={manualPatientName}
                                                onChange={(e) => setManualPatientName(e.target.value)}
                                                placeholder="e.g. Rahul Sharma"
                                                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                        </div>

                                        {/* OP Number & Phone */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                    OP Number / ID (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={manualOpNumber}
                                                    onChange={(e) => setManualOpNumber(e.target.value)}
                                                    placeholder="e.g. OP-1048"
                                                    className="w-full text-xs font-mono rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400 font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                    Phone (Optional)
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={manualPhone}
                                                    onChange={(e) => setManualPhone(e.target.value)}
                                                    placeholder="+91 9876543210"
                                                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Visit Classification */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                Visit Classification
                                            </label>
                                            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => setManualPatientType('NEW')}
                                                    className={`py-1.5 text-[10.5px] font-bold rounded-lg transition ${
                                                        manualPatientType === 'NEW'
                                                            ? 'bg-white text-indigo-700 shadow-2xs'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    New Visit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setManualPatientType('FOLLOW_UP')}
                                                    className={`py-1.5 text-[10.5px] font-bold rounded-lg transition ${
                                                        manualPatientType === 'FOLLOW_UP'
                                                            ? 'bg-white text-indigo-700 shadow-2xs'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    Follow-Up
                                                </button>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="text-xs font-semibold text-slate-700 mb-1 block">
                                                Medical Notes / Symptoms (Optional)
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={manualNotes}
                                                onChange={(e) => setManualNotes(e.target.value)}
                                                placeholder="Enter reason for visit or clinical notes..."
                                                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none placeholder:text-slate-400"
                                            />
                                        </div>

                                        {/* Modal Footer Buttons */}
                                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setManagingSlot(null);
                                                    setSlotActionFeedback(null);
                                                }}
                                                disabled={isBookingManual}
                                                className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isBookingManual}
                                                className="w-full sm:w-2/3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 disabled:opacity-60"
                                            >
                                                {isBookingManual ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin text-xs" />
                                                        <span>Booking Slot...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-check-circle text-xs" />
                                                        <span>Confirm Offline Booking</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* Tab 2: Close Slot / Take Break */
                                    <div className="space-y-4">
                                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            Mark this slot as <strong>Closed / On Break</strong> to temporarily block patient bookings. You can reopen it at any time.
                                        </p>

                                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setManagingSlot(null);
                                                    setSlotActionFeedback(null);
                                                }}
                                                disabled={isUpdatingSlot}
                                                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleSlotOverride(managingSlot.time, 'close')}
                                                disabled={isUpdatingSlot}
                                                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 disabled:opacity-60"
                                            >
                                                {isUpdatingSlot ? (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin text-xs" />
                                                        <span>Closing Slot...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-ban text-xs" />
                                                        <span>Close Slot / Take Break</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Booked Appointment Details Modal (Drawer on Mobile, Modal on Desktop) ─── */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 border border-slate-100 max-h-[88vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                    <i className="fas fa-user-check text-xs" />
                                </span>
                                <span>Appointment Details</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedAppointment(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
                            >
                                <i className="fas fa-times text-xs" />
                            </button>
                        </div>

                        <div className="space-y-2.5 sm:space-y-3 bg-slate-50 p-3.5 sm:p-4 rounded-2xl text-xs text-slate-600 border border-slate-100">
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-slate-400 font-medium">Patient:</span>
                                {selectedAppointment.isManualBooking ? (
                                    <div className="space-y-1 text-right">
                                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                                            {selectedAppointment.manualPatientDetails?.name || 'Walk-in Patient'}
                                        </span>
                                        {selectedAppointment.manualPatientDetails?.opNumber && (
                                            <span className="inline-block text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                                OP: {selectedAppointment.manualPatientDetails.opNumber}
                                            </span>
                                        )}
                                        {selectedAppointment.manualPatientDetails?.phone && (
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                <i className="fas fa-phone mr-1 text-indigo-400" />
                                                {selectedAppointment.manualPatientDetails.phone}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm text-right truncate">
                                        {getPatientDisplayName(selectedAppointment.patientId)}
                                    </span>
                                )}
                            </div>

                            {selectedAppointment.isManualBooking && (
                                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-0.5">
                                    <div className="flex items-center justify-between font-bold">
                                        <span className="flex items-center gap-1.5">
                                            <i className="fas fa-user-tag text-amber-600" />
                                            Doctor Direct Booking
                                        </span>
                                        <span className="text-[9px] uppercase tracking-wider bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-800 font-extrabold">
                                            0% Platform Fee
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-amber-800/90 leading-tight">
                                        Direct clinic walk-in / call booking. Payment handled outside platform.
                                    </p>
                                </div>
                            )}
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-slate-400 font-medium">Visit Type:</span>
                                <span className="font-bold text-slate-800 uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] sm:text-xs">
                                    {selectedAppointment.patientType === 'FOLLOW_UP' ? 'Follow-Up Visit' : 'New Consultation'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-slate-400 font-medium">Date & Time:</span>
                                <span className="font-bold text-slate-800 text-right">
                                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {selectedAppointment.appointmentTime}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="text-slate-400 font-medium">Channel:</span>
                                <span className="font-bold text-indigo-600 capitalize flex items-center gap-1">
                                    <i className={`fas ${selectedAppointment.consultationType === 'video' || selectedAppointment.consultationType === 'online' ? 'fa-video' : 'fa-hospital'}`} />
                                    {selectedAppointment.consultationType === 'video' || selectedAppointment.consultationType === 'online' ? 'Telehealth Video' : 'In-Person Clinic'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 text-xs font-bold text-slate-800">
                                <span>Consultation Fee:</span>
                                <span className="text-emerald-600 font-extrabold text-xs sm:text-sm">₹{selectedAppointment.fee}</span>
                            </div>
                            {selectedAppointment.notes && (
                                <div className="border-t border-slate-200/60 pt-2 text-xs">
                                    <span className="text-slate-400 font-medium block mb-1">Patient Notes:</span>
                                    <p className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 italic text-[11px] sm:text-xs">
                                        &ldquo;{selectedAppointment.notes}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setSelectedAppointment(null)}
                                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
                            >
                                Close
                            </button>
                            <Link
                                href="/doctor/appointments"
                                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
                            >
                                <span>Go to Appointments</span>
                                <i className="fas fa-arrow-right text-[10px]" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Cancel Doctor Manual Appointment Confirmation Modal ─── */}
            {appointmentToCancel && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <i className="fas fa-exclamation-triangle text-base" />
                            </span>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Cancel Manual Booking?</h3>
                                <p className="text-xs text-slate-500">This will remove the offline booking and immediately free up the slot.</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Patient:</span>
                                <span className="font-bold text-slate-900">
                                    {appointmentToCancel.manualPatientDetails?.name || 'Walk-in Patient'}
                                </span>
                            </div>
                            {appointmentToCancel.manualPatientDetails?.opNumber && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">OP Number:</span>
                                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                        {appointmentToCancel.manualPatientDetails.opNumber}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Scheduled Time:</span>
                                <span className="font-bold text-slate-900">{appointmentToCancel.appointmentTime}</span>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setAppointmentToCancel(null)}
                                disabled={cancellingAppointmentId === appointmentToCancel._id}
                                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition disabled:opacity-50"
                            >
                                Keep Appointment
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCancelManualAppointment(appointmentToCancel._id)}
                                disabled={cancellingAppointmentId === appointmentToCancel._id}
                                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 disabled:opacity-60"
                            >
                                {cancellingAppointmentId === appointmentToCancel._id ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin text-xs" />
                                        <span>Cancelling...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-trash-alt text-xs" />
                                        <span>Confirm Cancel</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

 