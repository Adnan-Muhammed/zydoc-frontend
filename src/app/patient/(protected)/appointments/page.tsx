"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchPatientAppointments, cancelAppointment, disputeAppointment } from '@/redux/features/appointment/appointmentThunk';
import { getAppointmentStatusConfig } from '@/utils/appointmentStatus';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { ReviewModal, reviewService } from '@/modules/reviews-ratings';
import { EARLY_JOIN_MINUTES, MAX_EXTENSION_MINUTES } from '@/config/videoCallConfig';

const AppointmentTimer = ({ startTime }: { startTime: number }) => {
    const timerRef = React.useRef<HTMLSpanElement>(null);
    
    React.useEffect(() => {
        const updateTimer = () => {
            if (!timerRef.current) return;
            const now = new Date().getTime();
            const diff = startTime - now;
            
            if (diff <= 0) {
                timerRef.current.innerText = "00:00:00";
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);
            
            if (days > 0) {
                timerRef.current.innerText = `${days}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            } else {
                timerRef.current.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
        };
        
        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        return () => clearInterval(intervalId);
    }, [startTime]);

    return <span ref={timerRef} className="font-mono font-bold text-indigo-600 ml-1">00:00:00</span>;
};


export default function PatientAppointmentsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const { appointments, isLoading, error } = useSelector((state: RootState) => state.appointment);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    const handleDownloadPrescription = (app: any) => {
        if (!app) return;
        const doctor = app.doctorId || {};
        const doctorName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Dr. Consultant';
        const patientName = user?.name || user?.googleName || user?.email || 'Patient';

        generatePrescriptionPdf({
            appointmentId: app._id,
            date: new Date(app.appointmentDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            time: app.appointmentTime,
            consultationType:
                app.consultationType === 'offline' || app.consultationType === 'physical'
                    ? 'In-Person Consultation'
                    : 'Online Video Consultation',
            patient: {
                name: patientName,
            },
            doctor: {
                name: doctorName,
                specialty: doctor.specialty || 'General Practice',
                qualifications: doctor.qualifications,
                clinicName:
                    doctor.consultationSettings?.offline?.clinicName ||
                    doctor.consultationSettings?.physical?.clinicName,
            },
            prescriptions: app.prescriptions || [],
            clinicalAdvice:
                'Take medications strictly as directed. If symptoms persist or adverse reactions occur, contact your doctor immediately.',
        });
    };
    const [cancelModalAppointment, setCancelModalAppointment] = useState<any>(null);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [isCancelling, setIsCancelling] = useState<boolean>(false);

    const [disputeModalAppointment, setDisputeModalAppointment] = useState<any>(null);
    const [disputeReason, setDisputeReason] = useState<string>('');
    const [disputeProofUrl, setDisputeProofUrl] = useState<string>('');
    const [isDisputing, setIsDisputing] = useState<boolean>(false);

    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Reviews & Ratings state
    const [reviewModalAppointment, setReviewModalAppointment] = useState<any>(null);
    const [reviewedAppointmentsMap, setReviewedAppointmentsMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchPatientAppointments());
    }, [dispatch]);

    // Check review status for completed and no-show appointments to update button state
    useEffect(() => {
        if (!appointments || appointments.length === 0) return;
        const reviewable = appointments.filter((a: any) => a.status === 'completed' || a.status === 'no-show');
        reviewable.forEach(async (app: any) => {
            if (reviewedAppointmentsMap[app._id] !== undefined) return;
            try {
                const res = await reviewService.getAppointmentReview(app._id);
                if (res && res.reviewed) {
                    setReviewedAppointmentsMap((prev) => ({ ...prev, [app._id]: true }));
                } else {
                    setReviewedAppointmentsMap((prev) => ({ ...prev, [app._id]: false }));
                }
            } catch (err) {
                // Ignore silent check errors
            }
        });
    }, [appointments]);

    // Requirement 1: After consultation redirect, open Review & Rating modal
    useEffect(() => {
        const shouldPromptReview = searchParams?.get('reviewModal') === 'true';
        const targetAppointmentId = searchParams?.get('appointmentId');

        if (shouldPromptReview && targetAppointmentId && appointments.length > 0) {
            const targetApp = appointments.find((a: any) => a._id === targetAppointmentId);
            if (targetApp) {
                reviewService.getAppointmentReview(targetAppointmentId).then((res) => {
                    if (res && res.reviewed) {
                        setReviewedAppointmentsMap((prev) => ({ ...prev, [targetAppointmentId]: true }));
                    } else {
                        setReviewModalAppointment(targetApp);
                    }
                }).catch(() => {
                    setReviewModalAppointment(targetApp);
                });
            }
        }
    }, [searchParams, appointments]);

    const getAppTimestamp = (app: any) => {
        if (app?.scheduledStartAt) {
            const t = new Date(app.scheduledStartAt).getTime();
            if (!isNaN(t)) return t;
        }

        const appDate = new Date(app?.appointmentDate);
        if (!app?.appointmentTime) return appDate.getTime();
        
        const [timePart, modifier] = app.appointmentTime.trim().split(/\s+/);
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
        
        return new Date(
            appDate.getFullYear(),
            appDate.getMonth(),
            appDate.getDate(),
            hours,
            minutes,
            0
        ).getTime();
    };

    const getAppointmentTimeState = (app: any) => {
        const now = new Date().getTime();
        const startTime = getAppTimestamp(app);
        const slotDurationMins = (app.scheduledStartAt && app.scheduledEndAt)
            ? Math.round((new Date(app.scheduledEndAt).getTime() - new Date(app.scheduledStartAt).getTime()) / 60000)
            : (Number(app.doctorId?.slotDuration) || 15);

        // ── Active Consultation Re-joins vs First-Join Cut-Off (Rule 4) ─────────
        // If doctor and patient successfully connected previously (hasOverlapped = true),
        // patient can re-join anytime until the Slot End Time (unless doctor ended it).
        const slotEndMs = app.scheduledEndAt
            ? new Date(app.scheduledEndAt).getTime()
            : startTime + slotDurationMins * 60 * 1000;

        if (app.hasOverlapped) {
            if (now >= slotEndMs) {
                return 'EXPIRED';
            }
            return 'ACTIVE';
        }

        // ── Strict Patient Join Window (no prior overlap) ──────────────────────────
        // Patient is allowed between earlyJoinAt (scheduledStart - 10min) and
        // lateJoinCutoffAt. Past the cutoff = EXPIRED.
        let lateJoinCutoffMs: number;
        if (app.lateJoinCutoffAt) {
            lateJoinCutoffMs = new Date(app.lateJoinCutoffAt).getTime();
        } else {
            let graceMins = 5;
            if (slotDurationMins <= 10) graceMins = 3;
            else if (slotDurationMins <= 20) graceMins = 5;
            else if (slotDurationMins <= 30) graceMins = 8;
            else if (slotDurationMins <= 45) graceMins = 10;
            else graceMins = 15;
            lateJoinCutoffMs = startTime + graceMins * 60 * 1000;
        }

        // Past lateJoinCutoffAt → permanently blocked (both first-join and un-overlapped re-join)
        if (now >= lateJoinCutoffMs) {
            return 'EXPIRED';
        }

        // Within earlyJoinAt to lateJoinCutoffAt → ACTIVE (button enabled)
        const earlyJoinMs = EARLY_JOIN_MINUTES * 60 * 1000;
        if (now >= startTime - earlyJoinMs) {
            return 'ACTIVE';
        }

        // Before earlyJoinAt → UPCOMING (button disabled, shows countdown)
        return 'UPCOMING';
    };

    const getCancellationEligibility = (app: any) => {
        if (app.status !== 'scheduled') return { canCancel: false, hoursLeft: 0 };
        const startMs = app.scheduledStartAt 
            ? new Date(app.scheduledStartAt).getTime() 
            : getAppTimestamp(app);
        const diffHours = (startMs - Date.now()) / (1000 * 60 * 60);
        return {
            canCancel: diffHours >= 24,
            hoursLeft: Math.max(0, diffHours)
        };
    };

    const handleConfirmCancel = async () => {
        if (!cancelModalAppointment) return;
        setIsCancelling(true);
        try {
            const res = await dispatch(cancelAppointment({ 
                appointmentId: cancelModalAppointment._id, 
                reason: cancelReason || 'Patient cancelled (>=24h prior)' 
            })).unwrap();
            setActionMessage({ 
                type: 'success', 
                text: res?.message || 'Appointment cancelled successfully. Full refund credited to your wallet.' 
            });
            setCancelModalAppointment(null);
            dispatch(fetchPatientAppointments());
        } catch (err: any) {
            setActionMessage({ 
                type: 'error', 
                text: typeof err === 'string' ? err : err?.message || 'Failed to cancel appointment.' 
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConfirmDispute = async () => {
        if (!disputeModalAppointment) return;
        if (!disputeReason.trim()) {
            alert('Please provide a reason for the dispute.');
            return;
        }
        setIsDisputing(true);
        try {
            const res = await dispatch(disputeAppointment({ 
                appointmentId: disputeModalAppointment._id, 
                reason: disputeReason.trim(),
                proofUrl: disputeProofUrl.trim() || undefined,
            })).unwrap();
            setActionMessage({ 
                type: 'success', 
                text: res?.message || 'Issue reported. Admin will review the dispute and process your refund.' 
            });
            setDisputeModalAppointment(null);
            setDisputeProofUrl('');
            dispatch(fetchPatientAppointments());
        } catch (err: any) {
            setActionMessage({ 
                type: 'error', 
                text: typeof err === 'string' ? err : err?.message || 'Failed to submit dispute.' 
            });
        } finally {
            setIsDisputing(false);
        }
    };

    // Separate into upcoming and past
    const now = new Date();
    
    const isUpcoming = (app: any) => {
        if (['cancelled', 'completed', 'no-show', 'cancelled_by_doctor', 'disputed', 'refunded', 'doctor_missed'].includes(app.status)) return false;
        
        const slotDurationMins = Number(app.doctorId?.slotDuration) || 15;
        const exactAppEndTime = (app.scheduledEndAt 
            ? new Date(app.scheduledEndAt).getTime() 
            : getAppTimestamp(app) + slotDurationMins * 60 * 1000) + MAX_EXTENSION_MINUTES * 60 * 1000;
        return Date.now() <= exactAppEndTime;
    };

    const upcoming = appointments
        .filter((app: any) => isUpcoming(app))
        .sort((a: any, b: any) => getAppTimestamp(a) - getAppTimestamp(b));
        
    const past = appointments
        .filter((app: any) => !isUpcoming(app))
        .sort((a: any, b: any) => getAppTimestamp(b) - getAppTimestamp(a));

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500 flex justify-center items-center min-h-[50vh]"><i className="fas fa-spinner fa-spin mr-2"></i> Loading appointments...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg mx-auto max-w-5xl mt-8 border border-red-200">Error loading appointments: {error}</div>;
    }

    const renderAppointmentCard = (app: any) => {
        const doctor = app.doctorId || {};
        
        // Helper to capitalize names
        const capitalize = (str: string) => str ? str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : '';
        const rawName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
        const formattedName = rawName ? capitalize(rawName) : 'Unknown Doctor';
        const doctorName = `Dr. ${formattedName}`;
        
        const date = new Date(app.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
        // Time is already formatted like "05:40 PM" from backend
        const formattedTime = app.appointmentTime;

        const statusConfig = getAppointmentStatusConfig(app.status, 'patient');

        // Parse avatar correctly if needed
        let avatarUrl = "";
        if (doctor.avatarUrl) {
            if (doctor.avatarUrl.startsWith('http://') || doctor.avatarUrl.startsWith('https://')) {
                avatarUrl = doctor.avatarUrl;
            } else {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                const cleanPath = doctor.avatarUrl.startsWith('/') ? doctor.avatarUrl : `/${doctor.avatarUrl}`;
                avatarUrl = `${baseUrl}${cleanPath}`;
            }
        }

        // Get initials for avatar fallback
        const initials = formattedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        return (
            <div key={app._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">

                {/* ── Card Body ── */}
                <div className="p-4 sm:p-5">

                    {/* Row 1: Avatar + Doctor Info + Status */}
                    <div className="flex items-start gap-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0 overflow-hidden border border-indigo-200/50 text-sm">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={doctorName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                        (e.target as HTMLElement).parentElement!.innerText = initials || 'DR';
                                    }}
                                />
                            ) : (
                                <span>{initials || 'DR'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">{doctorName}</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 truncate">{capitalize(doctor.specialty) || "General Practice"}</p>
                                </div>
                                {/* Status badge — always visible top-right */}
                                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${statusConfig.badgeClass}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Date / Time / Type chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <i className="far fa-calendar text-slate-400 text-[10px]"></i> {date}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <i className="far fa-clock text-slate-400 text-[10px]"></i> {formattedTime}
                        </span>
                        {(app.consultationType === 'online' || app.consultationType === 'video') ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 flex items-center gap-1">
                                <i className="fas fa-video text-[10px]"></i> Video
                            </span>
                        ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1">
                                <i className="fas fa-building text-[10px]"></i> Clinic
                            </span>
                        )}
                        {app.patientType === 'NEW' ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 flex items-center gap-1">
                                <i className="fas fa-user-plus text-[10px]"></i> New
                            </span>
                        ) : app.patientType === 'FOLLOW_UP' ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 flex items-center gap-1">
                                <i className="fas fa-user-check text-[10px]"></i> Follow-up
                            </span>
                        ) : null}
                        {/* Payment badge */}
                        {(app.paymentStatus === 'refunded' || app.status === 'refunded' || app.status === 'cancelled_by_doctor' || app.status === 'doctor_missed' || app.status === 'cancelled') ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                                <i className="fas fa-undo text-[10px] text-teal-500"></i> Refunded
                            </span>
                        ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                                <i className="fas fa-check-circle text-[10px] text-emerald-500"></i>
                                {app.paymentMethod === 'FULL_WALLET' ? 'Wallet' : app.paymentMethod === 'SPLIT' ? 'Split' : 'Paid'}
                            </span>
                        )}
                    </div>

                    {/* Row 3: Fee (left) + Primary CTA/Join (right) */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Amount Paid</div>
                            <div className="text-base font-extrabold text-slate-800">₹{app.fee}</div>
                        </div>

                        {/* Primary CTA: Join / Expired / Upcoming timer */}
                        {(app.consultationType === 'online' || app.consultationType === 'video') && app.status === 'scheduled' && (() => {
                            const timeState = getAppointmentTimeState(app);
                            const startTime = getAppTimestamp(app);
                            const nowMs = Date.now();
                            const isLiveOrOngoing = nowMs >= startTime;

                            if (timeState === 'EXPIRED') {
                                return (
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Expired</span>
                                        <button disabled className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5">
                                            <i className="fas fa-lock text-[10px]" /> Closed
                                        </button>
                                    </div>
                                );
                            }

                            if (timeState === 'ACTIVE') {
                                return (
                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                                            {isLiveOrOngoing ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live / In Progress
                                                </span>
                                            ) : (
                                                <>In: <AppointmentTimer startTime={startTime} /></>
                                            )}
                                        </div>
                                        <Link
                                            href={`/patient/consultation/${app._id}?join=true`}
                                            onClick={() => {
                                                if (typeof window !== 'undefined') {
                                                    sessionStorage.removeItem(`consultation_exited_${app._id}`);
                                                }
                                            }}
                                            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-1.5"
                                        >
                                            {app.patientJoinedAt ? (
                                                <>
                                                    <i className="fas fa-redo text-[10px]"></i> Rejoin Call
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-phone-alt text-[10px]"></i> Join Now
                                                </>
                                            )}
                                        </Link>
                                    </div>
                                );
                            }

                            // UPCOMING
                            return (
                                <div className="flex flex-col items-end gap-0.5">
                                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                                        In: <AppointmentTimer startTime={startTime} />
                                    </div>
                                    <button disabled className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5" title="Join button opens 10 minutes before scheduled start time">
                                        <i className="fas fa-phone-alt text-[10px]"></i> Join
                                    </button>
                                </div>
                            );
                        })()}

                        {/* Dispute/Status info on the right if not a video join card */}
                        {app.status === 'disputed' && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                                <i className="fas fa-clock text-amber-500"></i> Under Review
                            </span>
                        )}
                        {app.status === 'cancelled_by_doctor' && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                                <i className="fas fa-ban text-rose-500"></i> <span className="hidden sm:inline">Doctor Cancelled</span><span className="sm:hidden">Cancelled</span>
                            </span>
                        )}
                        {app.status === 'doctor_missed' && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                                <i className="fas fa-user-xmark text-rose-500"></i> <span className="hidden sm:inline">Doctor Missed</span><span className="sm:hidden">Missed</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Action Buttons Row (full-width footer) ── */}
                {(() => {
                    const { canCancel, hoursLeft } = getCancellationEligibility(app);

                    return (
                        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 bg-slate-50/80 border-t border-slate-100">

                            {/* Cancel button */}
                            {app.status === 'scheduled' && (
                                canCancel ? (
                                    <button
                                        onClick={() => { setCancelModalAppointment(app); setCancelReason(''); }}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center gap-1 bg-white"
                                        title="Cancel booking (≥24h prior, full refund)"
                                    >
                                        <i className="fas fa-ban text-[10px]"></i> Cancel
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-400 bg-white cursor-not-allowed flex items-center gap-1"
                                        title={`Cancel locked (${hoursLeft.toFixed(1)}h left, need ≥24h)`}
                                    >
                                        <i className="fas fa-lock text-[10px]"></i> <span className="hidden sm:inline">Cancel Locked</span><span className="sm:hidden">Locked</span>
                                    </button>
                                )
                            )}

                            {/* Dispute / Refund request (offline no-show) */}
                            {app.status === 'no-show' && (app.consultationType === 'offline' || app.consultationType === 'physical') && (() => {
                                const endMs = app.scheduledEndAt
                                    ? new Date(app.scheduledEndAt).getTime()
                                    : (getAppTimestamp(app) + (Number(app.doctorId?.slotDuration) || 15) * 60 * 1000);
                                const withinWindow = Date.now() <= endMs + (24 * 60 * 60 * 1000);
                                return withinWindow ? (
                                    <button
                                        onClick={() => { setDisputeModalAppointment(app); setDisputeReason(''); setDisputeProofUrl(''); }}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                                    >
                                        <i className="fas fa-exclamation-triangle text-[10px]"></i>
                                        <span className="hidden sm:inline">Report Issue / Refund</span>
                                        <span className="sm:hidden">Report Issue</span>
                                    </button>
                                ) : (
                                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                                        <i className="fas fa-lock text-[10px]"></i> Window Expired
                                    </span>
                                );
                            })()}

                            {/* Prescription PDF download */}
                            {app.prescriptions && app.prescriptions.length > 0 && (
                                <button
                                    onClick={() => handleDownloadPrescription(app)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
                                    title="Download prescription PDF"
                                >
                                    <i className="fas fa-file-pdf text-rose-500 text-[11px]"></i>
                                    <span className="hidden sm:inline">Prescription ({app.prescriptions.length})</span>
                                    <span className="sm:hidden">Rx ({app.prescriptions.length})</span>
                                </button>
                            )}

                            {/* Consultation files */}
                            {app.consultationFiles && app.consultationFiles.length > 0 && (
                                <button
                                    onClick={() => setSelectedAppointment(app)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
                                    title="View consultation files"
                                >
                                    <i className="fas fa-paperclip text-emerald-600 text-[11px]"></i>
                                    <span>Files ({app.consultationFiles.length})</span>
                                </button>
                            )}

                            {/* Rate / Review */}
                            {(app.status === 'completed' || app.status === 'no-show') && (
                                <button
                                    onClick={() => setReviewModalAppointment(app)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                                        reviewedAppointmentsMap[app._id]
                                            ? 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                            : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
                                    }`}
                                >
                                    <i className="fas fa-star text-amber-400 text-[11px]"></i>
                                    <span>{reviewedAppointmentsMap[app._id] ? 'Reviewed ★' : 'Rate Doctor'}</span>
                                </button>
                            )}

                            {/* View Details — always last, pushed right */}
                            <button
                                onClick={() => setSelectedAppointment(app)}
                                className="ml-auto px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center gap-1.5"
                            >
                                <i className="fas fa-eye text-[10px]"></i>
                                <span className="hidden sm:inline">View Details</span>
                                <span className="sm:hidden">Details</span>
                            </button>
                        </div>
                    );
                })()}
            </div>
        );
    };

    return (
        <div className="pat-page" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Banner feedback */}
            {actionMessage && (
                <div className={`p-4 rounded-xl flex items-center justify-between shadow-sm border ${
                    actionMessage.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <i className={`fas ${actionMessage.type === 'success' ? 'fa-check-circle text-emerald-500' : 'fa-circle-exclamation text-rose-500'}`}></i>
                        <span>{actionMessage.text}</span>
                    </div>
                    <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            <div className="pat-page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1>My Appointments</h1>
                    <p>Manage your upcoming consultations and view past visits.</p>
                </div>
                <Link
                    href="/patient/find-doctor"
                    className="pat-btn pat-btn-primary pat-btn-lg"
                >
                    <i className="fas fa-plus text-xs"></i>
                    <span>Book New Consultation</span>
                </Link>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <i className="fas fa-calendar-check text-indigo-500"></i> Upcoming & Current
                    </h2>
                    {upcoming.length > 0 ? (
                        <div className="space-y-4">
                            {upcoming.map(renderAppointmentCard)}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3">
                                <i className="far fa-calendar-times text-slate-400 text-lg"></i>
                            </div>
                            <h3 className="text-slate-700 font-bold mb-1">No upcoming or current appointments</h3>
                            <p className="text-sm text-slate-500 mb-4">You don't have any scheduled consultations at the moment.</p>
                            <Link href="/patient/find-doctor" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 text-sm font-semibold rounded-lg transition-colors">
                                Find a Doctor
                            </Link>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <i className="fas fa-history text-slate-400"></i> Past & Completed
                    </h2>
                    {past.length > 0 ? (
                        <div className="space-y-4 opacity-75 hover:opacity-100 transition-opacity">
                            {past.map(renderAppointmentCard)}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No past appointments found.</p>
                    )}
                </section>
            </div>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setSelectedAppointment(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Gradient accent top bar */}
                        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-t-2xl shrink-0" />

                        {/* Sticky Header */}
                        <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                    <i className="fas fa-calendar-check text-sm"></i>
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">Appointment Details</h2>
                                    <p className="text-[11px] text-slate-400 hidden sm:block">
                                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="text-slate-400 hover:text-slate-700 transition-colors w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 shrink-0"
                                aria-label="Close"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="overflow-y-auto flex-1 px-5 sm:px-7 py-5 sm:py-6 space-y-5 sm:space-y-6">

                            {/* ── Doctor Info Card ── */}
                            <div className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 rounded-2xl border border-indigo-100/80">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-lg overflow-hidden shrink-0 shadow-sm border border-indigo-200/60">
                                    {selectedAppointment.doctorId?.avatarUrl ? (
                                        <img
                                            src={
                                                selectedAppointment.doctorId.avatarUrl.startsWith('http')
                                                ? selectedAppointment.doctorId.avatarUrl
                                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'}${selectedAppointment.doctorId.avatarUrl.startsWith('/') ? '' : '/'}${selectedAppointment.doctorId.avatarUrl}`
                                            }
                                            alt="Doctor"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-black">DR</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                                        Dr. {selectedAppointment.doctorId?.firstName} {selectedAppointment.doctorId?.lastName}
                                    </h3>
                                    <p className="text-sm text-indigo-600 font-medium capitalize truncate">
                                        {selectedAppointment.doctorId?.specialty || 'General Practice'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {(() => {
                                            const cfg = getAppointmentStatusConfig(selectedAppointment.status, 'patient');
                                            return (
                                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cfg.badgeClass}`}>
                                                    {cfg.label}
                                                </span>
                                            );
                                        })()}
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            ID: {selectedAppointment._id?.slice(-8)?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Schedule Details ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <i className="fas fa-calendar text-indigo-400"></i> Date
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">
                                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <i className="fas fa-clock text-indigo-400"></i> Time
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">{selectedAppointment.appointmentTime}</div>
                                </div>
                                <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <i className="fas fa-wallet text-emerald-400"></i> Fee
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-black text-emerald-700 text-sm">₹{selectedAppointment.fee}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase border border-emerald-200">Paid</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5 capitalize">
                                        {selectedAppointment.patientType === 'NEW' ? 'New ' : selectedAppointment.patientType === 'FOLLOW_UP' ? 'Follow-up ' : ''}
                                        {(selectedAppointment.consultationType === 'online' || selectedAppointment.consultationType === 'video') ? 'Online' : 'In-Person'} Visit
                                    </div>
                                </div>
                            </div>

                            {/* ── Clinic Location / Video Call Section ── */}
                            {(selectedAppointment.consultationType === 'offline' || selectedAppointment.consultationType === 'physical') ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <i className="fas fa-map-marker-alt text-emerald-500"></i> Clinic Location
                                    </h4>
                                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                                        <p className="font-bold text-emerald-800 text-sm">
                                            {selectedAppointment.doctorId?.consultationSettings?.offline?.clinicName || selectedAppointment.doctorId?.consultationSettings?.physical?.clinicName || 'Clinic Name Not Provided'}
                                        </p>
                                        <p className="text-sm text-emerald-600 mt-1">
                                            {selectedAppointment.doctorId?.consultationSettings?.offline?.clinicAddress || selectedAppointment.doctorId?.consultationSettings?.physical?.clinicAddress || 'Address not provided.'}
                                        </p>
                                    </div>

                                    {/* Offline OTP */}
                                    {(() => {
                                        const endMs = selectedAppointment.scheduledEndAt
                                            ? new Date(selectedAppointment.scheduledEndAt).getTime()
                                            : (getAppTimestamp(selectedAppointment) + (Number(selectedAppointment.doctorId?.slotDuration) || 15) * 60 * 1000);
                                        const isBeforeScheduledEnd = Date.now() <= endMs;
                                        const isNotTerminal = !['cancelled', 'completed', 'no-show', 'cancelled_by_doctor', 'doctor_missed', 'disputed', 'refunded'].includes((selectedAppointment.status || '').toLowerCase().trim());
                                        if (!isNotTerminal || !selectedAppointment.offlineOTP || !isBeforeScheduledEnd) return null;
                                        return (
                                            <div className="bg-white border border-emerald-200 rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm">
                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                                    <i className="fas fa-shield-alt"></i> Your Verification Code
                                                </div>
                                                <div className="flex gap-2.5 mt-1">
                                                    {selectedAppointment.offlineOTP.toString().split('').map((digit: string, i: number) => (
                                                        <div key={i} className="w-11 h-13 rounded-xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-2xl font-black text-emerald-800 shadow-sm">
                                                            {digit}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[11px] text-slate-500 text-center mt-1">Show this code to the doctor at the clinic to confirm your visit.</p>
                                            </div>
                                        );
                                    })()}

                                    {/* No-Show Dispute */}
                                    {selectedAppointment.status === 'no-show' && (() => {
                                        const endMs = selectedAppointment.scheduledEndAt
                                            ? new Date(selectedAppointment.scheduledEndAt).getTime()
                                            : (getAppTimestamp(selectedAppointment) + (Number(selectedAppointment.doctorId?.slotDuration) || 15) * 60 * 1000);
                                        const withinWindow = Date.now() <= endMs + (24 * 60 * 60 * 1000);
                                        return withinWindow ? (
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-2.5">
                                                <div className="text-xs text-amber-800">
                                                    <span className="font-bold flex items-center gap-1.5 mb-1">
                                                        <i className="fas fa-exclamation-triangle text-amber-600"></i>
                                                        Marked as Missed / No-Show
                                                    </span>
                                                    If the doctor was absent from the clinic or you could not be consulted, you can report this issue for a full refund within 24 hours.
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const appToDispute = selectedAppointment;
                                                        setSelectedAppointment(null);
                                                        setDisputeModalAppointment(appToDispute);
                                                        setDisputeReason('');
                                                        setDisputeProofUrl('');
                                                    }}
                                                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                >
                                                    <i className="fas fa-hand-holding-dollar"></i> Report Issue / Request Refund
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                                                <i className="fas fa-lock"></i>
                                                <span>24-hour dispute window has expired</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <i className="fas fa-video text-indigo-500"></i> Online Consultation
                                    </h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Please ensure you have a stable internet connection. The Join button will be active 10 minutes prior to the appointment.
                                    </p>
                                    {(() => {
                                        const timeState = getAppointmentTimeState(selectedAppointment);
                                        if (selectedAppointment.status !== 'scheduled') {
                                            const modalStatus = getAppointmentStatusConfig(selectedAppointment.status, 'patient');
                                            return (
                                                <button disabled className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 text-sm">
                                                    <i className="fas fa-video-slash"></i> {modalStatus.label}
                                                </button>
                                            );
                                        }
                                        if (timeState === 'EXPIRED') {
                                            return (
                                                <div className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-100 text-slate-500 border border-slate-200 text-sm">
                                                    <i className="fas fa-phone-slash"></i> Call Expired
                                                </div>
                                            );
                                        }
                                        if (timeState === 'ACTIVE') {
                                            return (
                                                <Link
                                                    href={`/patient/consultation/${selectedAppointment._id}?join=true`}
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined') {
                                                            sessionStorage.removeItem(`consultation_exited_${selectedAppointment._id}`);
                                                        }
                                                    }}
                                                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all text-sm"
                                                >
                                                    <i className="fas fa-phone-alt"></i> {selectedAppointment.patientJoinedAt ? 'Rejoin Video Call' : 'Join Video Call'}
                                                </Link>
                                            );
                                        }
                                        return (
                                            <button disabled className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 text-sm">
                                                <i className="fas fa-phone-alt"></i> Call not available yet
                                            </button>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* ── My Notes ── */}
                            {selectedAppointment.notes && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <i className="far fa-sticky-note text-amber-500"></i> My Notes
                                    </h4>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">
                                        {selectedAppointment.notes}
                                    </div>
                                </div>
                            )}

                            {/* ── Prescriptions ── */}
                            {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <i className="fas fa-prescription-bottle-alt text-indigo-600"></i>
                                            <span>Prescribed Medications <span className="text-slate-400 font-normal">({selectedAppointment.prescriptions.length})</span></span>
                                        </h4>
                                        <button
                                            onClick={() => handleDownloadPrescription(selectedAppointment)}
                                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                                        >
                                            <i className="fas fa-download text-[10px]"></i>
                                            <span>Download PDF</span>
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedAppointment.prescriptions.map((rx: any, i: number) => (
                                            <div
                                                key={i}
                                                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs flex items-start sm:items-center justify-between gap-3"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        <span>{rx.medicine}</span>
                                                    </div>
                                                    <div className="text-slate-500 text-[11px] mt-1.5 ml-7 flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-medium">{rx.dosage}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-indigo-600 font-semibold">{rx.frequency}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span>{rx.duration}</span>
                                                    </div>
                                                    {rx.instructions && (
                                                        <div className="text-slate-400 italic text-[10px] mt-0.5 ml-7">
                                                            Note: {rx.instructions}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md shrink-0">
                                                    {rx.duration || 'Active'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Consultation Documents & Files ── */}
                            {selectedAppointment.consultationFiles && selectedAppointment.consultationFiles.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <i className="fas fa-paperclip text-emerald-600"></i>
                                        <span>Consultation Documents <span className="text-slate-400 font-normal">({selectedAppointment.consultationFiles.length})</span></span>
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedAppointment.consultationFiles.map((file: any, i: number) => {
                                            const fileType = (file.type || '').toLowerCase();
                                            const isPdf = fileType === 'pdf';
                                            const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(fileType);
                                            const iconClass = isPdf ? 'fa-file-pdf text-rose-500' : isImg ? 'fa-file-image text-emerald-500' : 'fa-file-alt text-indigo-500';
                                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                                            const fileUrl = file.url?.startsWith('http') ? file.url : `${baseUrl}${file.url?.startsWith('/') ? '' : '/'}${file.url}`;
                                            return (
                                                <div
                                                    key={file.id || i}
                                                    className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                                                            <i className={`fas ${iconClass} text-base`}></i>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-800 truncate" title={file.name}>{file.name}</div>
                                                            <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                <span>{file.size || 'Attachment'}</span>
                                                                <span>•</span>
                                                                <span className="text-emerald-600 font-medium">{file.category || 'Consultation File'}</span>
                                                                {file.uploadedBy && <><span>•</span><span>By {file.uploadedBy}</span></>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {file.url && (
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center gap-1.5 shadow-sm shrink-0 transition-all"
                                                        >
                                                            <i className="fas fa-download text-[10px]"></i>
                                                            <span className="hidden sm:inline">View / Download</span>
                                                            <span className="sm:hidden">Download</span>
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bottom spacer for mobile scroll comfort */}
                            <div className="h-2" />
                        </div>

                        {/* Sticky Footer */}
                        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0 rounded-b-2xl">
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 bg-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Task 1: Patient Cancellation Modal */}
            {cancelModalAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Cancel Appointment</h3>
                            </div>
                            <button onClick={() => setCancelModalAppointment(null)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-1">
                                <div className="font-semibold text-slate-800">
                                    Dr. {cancelModalAppointment.doctorId?.firstName} {cancelModalAppointment.doctorId?.lastName}
                                </div>
                                <div className="text-slate-500">
                                    {new Date(cancelModalAppointment.appointmentDate).toDateString()} at {cancelModalAppointment.appointmentTime}
                                </div>
                                <div className="text-emerald-700 font-bold pt-1">
                                    Refund Amount: ₹{cancelModalAppointment.fee} (100% Wallet Refund)
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                                <i className="fas fa-shield-check text-emerald-600 text-sm mt-0.5"></i>
                                <div>
                                    <p className="font-bold mb-0.5">24-Hour Cancellation Rule Satisfied</p>
                                    <p>Your appointment is scheduled more than 24 hours from now. Cancelling will immediately free your slot and credit 100% of the booking fee back to your Zydoc Wallet.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Reason for cancellation (optional)
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Please let us know why you are cancelling..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setCancelModalAppointment(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={isCancelling}
                                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isCancelling && <i className="fas fa-spinner fa-spin"></i>}
                                {isCancelling ? 'Refunding...' : 'Confirm & Refund ₹' + cancelModalAppointment.fee}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task 3: Offline No-Show Dispute / Refund Request Modal */}
            {disputeModalAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <i className="fas fa-hand-holding-dollar"></i>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Request Refund for In-Person Visit</h3>
                            </div>
                            <button onClick={() => setDisputeModalAppointment(null)} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                If you visited the clinic and the doctor was absent or could not see you, you can report this issue for administrative investigation and a full refund within 24 hours of the scheduled end time.
                            </p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-1">
                                <div className="font-semibold text-slate-800">
                                    Dr. {disputeModalAppointment.doctorId?.firstName} {disputeModalAppointment.doctorId?.lastName}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {disputeModalAppointment.doctorId?.consultationSettings?.offline?.clinicName || "Clinic"} - {disputeModalAppointment.appointmentTime}
                                </div>
                                <div className="text-amber-800 font-bold pt-1">
                                    Amount to Refund: ₹{disputeModalAppointment.fee}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Describe what happened <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    placeholder="e.g., I arrived at the clinic at 10:00 AM but the doctor was not present and clinic staff said they were unavailable."
                                    rows={4}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Proof / Evidence URL <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="url"
                                    value={disputeProofUrl}
                                    onChange={(e) => setDisputeProofUrl(e.target.value)}
                                    placeholder="e.g., Google Drive / photo link showing closed clinic"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                <p className="text-xs text-slate-400 mt-1">Paste a shareable link to a photo or document (e.g., Google Drive, Dropbox).</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setDisputeModalAppointment(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDispute}
                                disabled={isDisputing || !disputeReason.trim()}
                                className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDisputing && <i className="fas fa-spinner fa-spin"></i>}
                                {isDisputing ? 'Submitting...' : 'Submit Dispute'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Doctor Review & Rating Modal */}
            {reviewModalAppointment && (
                <ReviewModal
                    isOpen={Boolean(reviewModalAppointment)}
                    onClose={() => {
                        setReviewModalAppointment(null);
                        // Clean URL query params if opened via post-call redirect
                        if (searchParams?.get('reviewModal')) {
                            router.replace('/patient/appointments', { scroll: false });
                        }
                    }}
                    onSuccess={() => {
                        if (reviewModalAppointment) {
                            setReviewedAppointmentsMap((prev) => ({
                                ...prev,
                                [reviewModalAppointment._id]: true,
                            }));
                        }
                        setActionMessage({
                            type: 'success',
                            text: 'Thank you! Your doctor rating and review was submitted successfully.',
                        });
                        if (searchParams?.get('reviewModal')) {
                            router.replace('/patient/appointments', { scroll: false });
                        }
                    }}
                    appointmentId={reviewModalAppointment._id}
                    doctor={{
                        id: reviewModalAppointment.doctorId?._id || reviewModalAppointment.doctorId?.id,
                        name: reviewModalAppointment.doctorId?.name || `${reviewModalAppointment.doctorId?.firstName || ''} ${reviewModalAppointment.doctorId?.lastName || ''}`.trim() || 'Doctor',
                        specialty: reviewModalAppointment.doctorId?.specialty || 'Medical Specialist',
                        avatarUrl: reviewModalAppointment.doctorId?.avatarUrl,
                    }}
                />
            )}
        </div>
    );
}
