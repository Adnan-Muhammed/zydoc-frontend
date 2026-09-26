"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDoctorAppointments, completeOfflineAppointment, markNoShowOfflineAppointment } from '@/redux/features/appointment/appointmentThunk';
import { clearAppointmentError } from '@/redux/features/appointment/appointmentSlice';

import { getAppointmentStatusConfig, getAppointmentStartTimestamp, getAppointmentEndTimestamp, isAppointmentUpcomingOrActive } from '@/utils/appointmentStatus';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  Video,
  VideoOff,
  Building2,
  User,
  UserPlus,
  UserCheck,
  UserX,
  FileText,
  Paperclip,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  Download,
  Loader2,
  ShieldCheck,
  Activity,
  HeartPulse,
  Pill,
  Wallet,
  Info,
  ArrowRight,
  ChevronRight,
  History,
  Sparkles,
  FileImage,
  Check,
  Phone,
  Stethoscope,
} from 'lucide-react';

export default function DoctorAppointmentsPage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { doctorAppointments: appointments, isLoading, error } = useAppSelector((state) => state.appointment);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isCompletingManual, setIsCompletingManual] = useState(false);
    const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);

    useEffect(() => {
        dispatch(clearAppointmentError());
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    const handleOpenModal = (app: any) => {
        setSelectedAppointment(app);
        setOtpInput('');
        setOtpError('');
        setOtpSuccess(false);
    };

    const handleCloseModal = () => {
        setSelectedAppointment(null);
        setOtpInput('');
        setOtpError('');
        setOtpSuccess(false);
    };

    const handleCompleteOffline = async (appointmentId: string) => {
        if (otpInput.length !== 4 || isVerifyingOtp) return;
        setOtpError('');
        setIsVerifyingOtp(true);
        try {
            const result = await dispatch(
                completeOfflineAppointment({
                    appointmentId,
                    otp: otpInput,
                })
            );
            if (completeOfflineAppointment.fulfilled.match(result)) {
                setOtpSuccess(true);
                dispatch(fetchDoctorAppointments());
                setTimeout(() => {
                    handleCloseModal();
                }, 1800);
            } else {
                setOtpError((result.payload as string) || 'Invalid verification code. Please ask the patient to check their code.');
            }
        } catch (err: any) {
            setOtpError(err?.message || 'Invalid verification code. Please ask the patient to check their code.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleCompleteManualOffline = async (appointmentId: string) => {
        if (isCompletingManual) return;
        setOtpError('');
        setIsCompletingManual(true);
        try {
            const result = await dispatch(
                completeOfflineAppointment({
                    appointmentId,
                    otp: '0000', // Bypassed by backend for manual bookings
                })
            );
            if (completeOfflineAppointment.fulfilled.match(result)) {
                setOtpSuccess(true);
                dispatch(fetchDoctorAppointments());
                setTimeout(() => {
                    handleCloseModal();
                }, 1500);
            } else {
                setOtpError((result.payload as string) || 'Failed to complete appointment.');
            }
        } catch (err: any) {
            setOtpError(err?.message || 'Failed to complete appointment.');
        } finally {
            setIsCompletingManual(false);
        }
    };

    const handleMarkNoShow = async (appointmentId: string) => {
        if (isMarkingNoShow) return;
        if (confirm("Are you sure you want to mark this patient as a No-Show?")) {
            setIsMarkingNoShow(true);
            try {
                const result = await dispatch(markNoShowOfflineAppointment({ appointmentId }));
                if (markNoShowOfflineAppointment.fulfilled.match(result)) {
                    handleCloseModal();
                    dispatch(fetchDoctorAppointments());
                } else {
                    alert((result.payload as string) || "Failed to mark patient as no-show.");
                }
            } catch (err: any) {
                alert(err?.message || "Failed to mark patient as no-show.");
            } finally {
                setIsMarkingNoShow(false);
            }
        }
    };

    const upcoming = (appointments || [])
        .filter((app: any) => isAppointmentUpcomingOrActive(app))
        .sort((a: any, b: any) => getAppointmentStartTimestamp(a) - getAppointmentStartTimestamp(b));
        
    const past = (appointments || [])
        .filter((app: any) => !isAppointmentUpcomingOrActive(app))
        .sort((a: any, b: any) => getAppointmentStartTimestamp(b) - getAppointmentStartTimestamp(a));

    if (isLoading && (!appointments || appointments.length === 0)) {
        return (
            <div className="p-16 text-center text-slate-500 flex flex-col justify-center items-center min-h-[50vh] space-y-3">
                <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
                <span className="text-xs font-medium text-slate-400">Loading your appointments schedule...</span>
            </div>
        );
    }

    if (error && (!appointments || appointments.length === 0)) {
        return (
            <div className="p-8 text-center bg-rose-50 rounded-3xl mx-auto max-w-2xl mt-12 border border-rose-200 shadow-xs">
                <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                <p className="font-bold text-base text-rose-950 mb-1">Error Loading Consultations</p>
                <p className="text-xs text-rose-800/80 mb-5 leading-relaxed">{error}</p>
                <button
                    onClick={() => {
                        dispatch(clearAppointmentError());
                        dispatch(fetchDoctorAppointments());
                    }}
                    className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all shadow-xs active:scale-98"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    const getPatientName = (patientData: any, manualPatientDetails?: any, isManual?: boolean) => {
        if (isManual && manualPatientDetails?.name) {
            return manualPatientDetails.name;
        }
        if (!patientData) return manualPatientDetails?.name || "Patient";
        if (patientData.profileId?.firstName) {
            return `${patientData.profileId.firstName} ${patientData.profileId.lastName || ''}`.trim();
        }
        if (patientData.googleName) return patientData.googleName;
        if (patientData.email) {
            const emailName = patientData.email.split('@')[0];
            return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
        }
        return "Patient";
    };

    const getPatientInitials = (patientData: any, manualPatientDetails?: any, isManual?: boolean) => {
        const name = getPatientName(patientData, manualPatientDetails, isManual);
        if (name === "Patient") return "PT";
        return name.substring(0, 2).toUpperCase();
    };

    const handleDownloadPrescription = (app: any) => {
        if (!app) return;
        const patientName = getPatientName(app.patientId, app.manualPatientDetails, app.isManualBooking);
        const doctor: any = user || {};
        generatePrescriptionPdf({
            appointmentId: app._id,
            date: new Date(app.appointmentDate).toDateString(),
            time: app.appointmentTime,
            consultationType: app.consultationType === 'offline' ? 'In-Person Consultation' : 'Online Video Consultation',
            patient: {
                name: patientName,
                gender: app.patientId?.profileId?.gender,
                phone: app.patientId?.profileId?.phone,
                bloodGroup: app.patientId?.profileId?.bloodGroup,
            },
            doctor: {
                name: `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Dr. Consultant',
                specialty: doctor.specialty || 'General Practice',
                qualifications: doctor.qualifications,
                regNumber: doctor.registrationNumber,
                clinicName: doctor.consultationSettings?.offline?.clinicName,
            },
            prescriptions: app.prescriptions || [],
            clinicalAdvice: app.clinicalNotes || 'Take medications strictly as directed by your physician.',
        });
    };

    const renderAppointmentCard = (app: any) => {
        const isManual = app.isManualBooking;
        const patientName = getPatientName(app.patientId, app.manualPatientDetails, isManual);
        const initials = getPatientInitials(app.patientId, app.manualPatientDetails, isManual);

        const date = new Date(app.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = app.appointmentTime;

        const statusConfig = getAppointmentStatusConfig(app.status, 'doctor');

        let avatarUrl = "";
        const rawAvatar = app.patientId?.profileId?.avatarUrl || app.patientId?.googleAvatarUrl;
        if (rawAvatar) {
            if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://')) {
                avatarUrl = rawAvatar;
            } else {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                const cleanPath = rawAvatar.startsWith('/') ? rawAvatar : `/${rawAvatar}`;
                avatarUrl = `${baseUrl}${cleanPath}`;
            }
        }

        return (
            <div key={app._id} className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 group">
                <div className="flex items-start gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#101044]/5 text-[#101044] border border-[#101044]/10 font-bold flex items-center justify-center shrink-0 overflow-hidden text-sm uppercase group-hover:bg-[#101044] group-hover:text-white transition-colors">
                        {isManual ? (
                            <span className="text-amber-800 bg-amber-100/90 w-full h-full flex items-center justify-center font-bold text-xs">
                                {initials || 'OP'}
                            </span>
                        ) : avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={patientName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                    (e.target as HTMLElement).parentElement!.innerText = initials || 'PT';
                                }}
                            />
                        ) : (
                            <span>{initials || 'PT'}</span>
                        )}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-[#101044]">{patientName}</h3>
                            {isManual && (
                                <span className="text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                                    Direct Booking
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isManual 
                                ? (app.manualPatientDetails?.opNumber ? `OP: ${app.manualPatientDetails.opNumber}` : (app.manualPatientDetails?.phone || 'Direct Walk-In (0% Platform Fee)'))
                                : (app.patientId?.email || 'No email provided')}
                        </p>

                        <div className="flex items-center gap-3.5 mt-2 text-xs font-medium text-slate-600">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {formattedTime}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                        {isManual ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1.5">
                                <UserCheck className="w-3 h-3" /> Direct Booking
                            </span>
                        ) : (app.consultationType === 'online' || app.consultationType === 'video') ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1.5">
                                <Video className="w-3 h-3" /> Online
                            </span>
                        ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" /> In-Person
                            </span>
                        )}
                        {app.patientType === 'NEW' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1.5">
                                <UserPlus className="w-3 h-3" /> New
                            </span>
                        ) : app.patientType === 'FOLLOW_UP' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                                <UserCheck className="w-3 h-3" /> Follow-up
                            </span>
                        ) : null}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${statusConfig.badgeClass}`}>
                            {statusConfig.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start flex-wrap">
                        {app.prescriptions && app.prescriptions.length > 0 && (
                            <button
                                onClick={() => handleDownloadPrescription(app)}
                                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 hover:bg-indigo-100 transition-all flex items-center gap-1.5 shadow-2xs"
                                title="Download prescription PDF"
                            >
                                <FileText className="w-3.5 h-3.5 text-rose-500" />
                                <span>e-Rx ({app.prescriptions.length})</span>
                            </button>
                        )}
                        {app.consultationFiles && app.consultationFiles.length > 0 && (
                            <button
                                onClick={() => handleOpenModal(app)}
                                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-2xs"
                                title="View consultation documents"
                            >
                                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Files ({app.consultationFiles.length})</span>
                            </button>
                        )}
                        <button
                            onClick={() => handleOpenModal(app)}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-50 hover:bg-[#101044] text-slate-700 hover:text-white border border-slate-200 hover:border-transparent transition-all shadow-2xs active:scale-98"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {error && appointments && appointments.length > 0 && (
                <div className="p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => dispatch(clearAppointmentError())}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold px-2 py-1 rounded-lg hover:bg-rose-100 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/70 flex items-center justify-center shadow-2xs">
                            <CalendarCheck className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">
                            Patient Appointments
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12">
                        Schedule overview of your scheduled and historical patient consultations.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50/80 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 shadow-2xs self-start sm:self-auto ml-12 sm:ml-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Total: {appointments.length} Consultations</span>
                </div>
            </div>

            <div className="space-y-8">
                {/* Upcoming & Current */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-[#101044] flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-indigo-600" />
                            <span>Upcoming & In-Progress</span>
                        </h2>
                        {upcoming.length > 0 && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {upcoming.length} active
                            </span>
                        )}
                    </div>

                    {upcoming.length > 0 ? (
                        <div className="space-y-4">
                            {upcoming.map(renderAppointmentCard)}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-200/80 border-dashed p-10 text-center shadow-2xs">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                <CalendarX className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-bold text-[#101044] mb-1">No upcoming appointments</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                You do not have any patient consultations scheduled right now.
                            </p>
                        </div>
                    )}
                </section>

                {/* Past & Completed */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-slate-700 flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-400" />
                            <span>Past & Completed Consultations</span>
                        </h2>
                        {past.length > 0 && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {past.length} completed
                            </span>
                        )}
                    </div>

                    {past.length > 0 ? (
                        <div className="space-y-4 opacity-85 hover:opacity-100 transition-opacity">
                            {past.map(renderAppointmentCard)}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No past appointments found.</p>
                    )}
                </section>
            </div>

            {/* Appointment Details Modal - Patient Health Card */}
            {selectedAppointment && (() => {
                const activeAppointment = appointments.find((a: any) => a._id === selectedAppointment._id) || selectedAppointment;
                const isTerminal = ['completed', 'no-show', 'cancelled', 'cancelled_by_doctor', 'doctor_missed', 'disputed', 'refunded'].includes(
                    (activeAppointment.status || '').toLowerCase().trim()
                );

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101044]/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleCloseModal}>
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-100" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-base sm:text-lg font-bold text-[#101044]">Patient Health Card</h2>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6 overflow-y-auto">
                                {/* 1. Patient Vitals & Profile */}
                                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-100">
                                    {/* Profile Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-[#101044]/5 text-[#101044] border border-[#101044]/10 font-bold flex items-center justify-center text-lg overflow-hidden shrink-0 uppercase">
                                            {activeAppointment.isManualBooking ? (
                                                <span className="text-amber-800 bg-amber-100 w-full h-full flex items-center justify-center font-bold text-base">
                                                    {getPatientInitials(activeAppointment.patientId, activeAppointment.manualPatientDetails, true)}
                                                </span>
                                            ) : (
                                                getPatientInitials(activeAppointment.patientId, activeAppointment.manualPatientDetails, false)
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-[#101044]">
                                                    {getPatientName(activeAppointment.patientId, activeAppointment.manualPatientDetails, activeAppointment.isManualBooking)}
                                                </h3>
                                                {activeAppointment.isManualBooking && (
                                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                                        Direct Booking
                                                    </span>
                                                )}
                                            </div>
                                            {activeAppointment.isManualBooking ? (
                                                <>
                                                    {activeAppointment.manualPatientDetails?.opNumber && (
                                                        <p className="text-slate-700 text-xs font-semibold mt-0.5">
                                                            OP No: {activeAppointment.manualPatientDetails.opNumber}
                                                        </p>
                                                    )}
                                                    {activeAppointment.manualPatientDetails?.phone ? (
                                                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {activeAppointment.manualPatientDetails.phone}
                                                        </p>
                                                    ) : (
                                                        <p className="text-slate-400 text-xs mt-0.5 italic">No phone number recorded</p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-slate-500 text-xs">{activeAppointment.patientId?.email || 'No email'}</p>
                                                    {activeAppointment.patientId?.profileId?.phone && (
                                                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {activeAppointment.patientId.profileId.phone}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vitals */}
                                    {!activeAppointment.isManualBooking && (
                                        <div className="flex gap-3">
                                            {activeAppointment.patientId?.profileId?.dateOfBirth && (
                                                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center min-w-[4.2rem] shadow-2xs">
                                                    <Calendar className="w-4 h-4 text-sky-500 mb-1" />
                                                    <span className="text-sky-800 font-extrabold text-xs">
                                                        {(() => {
                                                            const dob = new Date(activeAppointment.patientId.profileId.dateOfBirth);
                                                            const ageDifMs = Date.now() - dob.getTime();
                                                            const ageDate = new Date(ageDifMs);
                                                            return Math.abs(ageDate.getUTCFullYear() - 1970) + " Yrs";
                                                        })()}
                                                    </span>
                                                </div>
                                            )}
                                            {activeAppointment.patientId?.profileId?.bloodGroup && (
                                                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center min-w-[4.2rem] shadow-2xs">
                                                    <HeartPulse className="w-4 h-4 text-rose-500 mb-1" />
                                                    <span className="text-rose-800 font-extrabold text-xs">{activeAppointment.patientId.profileId.bloodGroup}</span>
                                                </div>
                                            )}
                                            {activeAppointment.patientId?.profileId?.gender && (
                                                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center min-w-[4.2rem] shadow-2xs">
                                                    <User className="w-4 h-4 text-indigo-500 mb-1" />
                                                    <span className="text-indigo-800 font-extrabold text-xs capitalize">{activeAppointment.patientId.profileId.gender}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 2. Schedule Details */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Booking Parameters</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                                                <Calendar className="w-3 h-3" /> Date
                                            </div>
                                            <div className="font-bold text-[#101044] text-xs sm:text-sm">
                                                {new Date(activeAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                                                <Clock className="w-3 h-3" /> Time
                                            </div>
                                            <div className="font-bold text-[#101044] text-xs sm:text-sm">{activeAppointment.appointmentTime}</div>
                                        </div>
                                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                                                <Stethoscope className="w-3 h-3" /> Mode
                                            </div>
                                            <div className="font-bold text-[#101044] text-xs sm:text-sm capitalize">
                                                {activeAppointment.isManualBooking ? 'Direct Booking' : (activeAppointment.consultationType === 'online' || activeAppointment.consultationType === 'video') ? 'Online' : 'In-Person'}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                                                <User className="w-3 h-3" /> Visit Type
                                            </div>
                                            <div className="font-bold text-[#101044] text-xs sm:text-sm capitalize">
                                                {activeAppointment.patientType === 'NEW' ? 'New Consultation' : activeAppointment.patientType === 'FOLLOW_UP' ? 'Follow-up' : 'Regular'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Medical History */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Clinical Profile</h4>
                                    {activeAppointment.isManualBooking ? (
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-amber-500 shrink-0" />
                                            <span>Direct clinic walk-in consultation. Platform digital medical records are not linked to manual bookings.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Allergies */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <AlertCircle className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                                                    <div className="text-[11px] font-bold text-slate-500 mb-1">Allergies</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {activeAppointment.patientId?.profileId?.medicalHistory?.allergies?.length > 0 ? (
                                                            activeAppointment.patientId.profileId.medicalHistory.allergies.map((allergy: string, idx: number) => (
                                                                <span key={idx} className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md">{allergy}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No known allergies</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chronic Conditions */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <HeartPulse className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                                                    <div className="text-[11px] font-bold text-slate-500 mb-1">Chronic Conditions</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {activeAppointment.patientId?.profileId?.medicalHistory?.chronicConditions?.length > 0 ? (
                                                            activeAppointment.patientId.profileId.medicalHistory.chronicConditions.map((condition: string, idx: number) => (
                                                                <span key={idx} className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md">{condition}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">None reported</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Current Medications */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Pill className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                                                    <div className="text-[11px] font-bold text-slate-500 mb-1">Current Medications</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {activeAppointment.patientId?.profileId?.medicalHistory?.currentMedications?.length > 0 ? (
                                                            activeAppointment.patientId.profileId.medicalHistory.currentMedications.map((med: string, idx: number) => (
                                                                <span key={idx} className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md">{med}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No active medications</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Notes & Symptoms */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Appointment Notes</h4>
                                    <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/60 flex gap-3">
                                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="text-xs font-bold text-amber-900 mb-1">Patient Symptoms & History</div>
                                            <div className="text-xs sm:text-sm text-amber-950 whitespace-pre-wrap leading-relaxed">
                                                {activeAppointment.manualPatientDetails?.notes || activeAppointment.notes || <span className="italic opacity-60">No additional symptoms or patient notes entered.</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Prescriptions */}
                                {activeAppointment.prescriptions && activeAppointment.prescriptions.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-[#101044] uppercase tracking-wider flex items-center gap-2">
                                                <Pill className="w-4 h-4 text-indigo-600" />
                                                <span>Prescribed Medications ({activeAppointment.prescriptions.length})</span>
                                            </h4>
                                            <button
                                                onClick={() => handleDownloadPrescription(activeAppointment)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-2xs transition-all active:scale-98"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Download e-Rx</span>
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {activeAppointment.prescriptions.map((rx: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div className="font-bold text-[#101044] flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                                                {i + 1}
                                                            </span>
                                                            <span>{rx.medicine}</span>
                                                        </div>
                                                        <div className="text-slate-500 text-[11px] mt-1 ml-7 flex items-center gap-2">
                                                            <span>{rx.dosage}</span>
                                                            <span>•</span>
                                                            <span className="text-indigo-600 font-semibold">{rx.frequency}</span>
                                                            <span>•</span>
                                                            <span>{rx.duration}</span>
                                                        </div>
                                                        {rx.instructions && (
                                                            <div className="text-slate-400 italic text-[10px] mt-0.5 ml-7">
                                                                Instructions: {rx.instructions}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-lg">
                                                        {rx.duration || 'Active'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 6. Consultation Documents */}
                                {activeAppointment.consultationFiles && activeAppointment.consultationFiles.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-[#101044] uppercase tracking-wider flex items-center gap-2">
                                                <Paperclip className="w-4 h-4 text-emerald-600" />
                                                <span>Consultation Attachments ({activeAppointment.consultationFiles.length})</span>
                                            </h4>
                                        </div>
                                        <div className="space-y-2">
                                            {activeAppointment.consultationFiles.map((file: any, i: number) => {
                                                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                                                const fileUrl = file.url?.startsWith('http') ? file.url : `${baseUrl}${file.url?.startsWith('/') ? '' : '/'}${file.url}`;

                                                return (
                                                    <div
                                                        key={file.id || i}
                                                        className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-500">
                                                                <FileText className="w-4 h-4 text-rose-500" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-[#101044] truncate" title={file.name}>
                                                                    {file.name}
                                                                </div>
                                                                <div className="text-slate-500 text-[10px] mt-0.5">
                                                                    <span>{file.size || 'Attachment'}</span> • <span className="text-emerald-700 font-semibold">{file.category || 'Document'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {file.url && (
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs shrink-0 transition-all active:scale-98"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span>Download</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 shrink-0">
                                {!isTerminal ? (
                                    <>
                                        {(activeAppointment.consultationType === 'online' || activeAppointment.consultationType === 'video') ? (
                                            (() => {
                                                const appTimeMs = getAppointmentStartTimestamp(activeAppointment);
                                                const nowMs = new Date().getTime();
                                                const diffMins = (appTimeMs - nowMs) / 1000 / 60;
                                                const slotDurationMins = (activeAppointment.scheduledStartAt && activeAppointment.scheduledEndAt)
                                                    ? Math.round((new Date(activeAppointment.scheduledEndAt).getTime() - new Date(activeAppointment.scheduledStartAt).getTime()) / 60000)
                                                    : (Number(activeAppointment.doctorId?.slotDuration) || 15);
                                                const maxSessionEnd = activeAppointment.scheduledEndAt
                                                    ? new Date(activeAppointment.scheduledEndAt).getTime() + 15 * 60000
                                                    : appTimeMs + (slotDurationMins + 15) * 60000;

                                                const isReady = diffMins <= 15 && nowMs <= maxSessionEnd;
                                                const isExpired = nowMs > maxSessionEnd;

                                                if (isExpired) {
                                                    return (
                                                        <button disabled title="Appointment window has closed" className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-xl font-bold cursor-not-allowed shadow-2xs flex justify-center items-center border border-slate-200/80 text-xs">
                                                            <VideoOff className="w-4 h-4 mr-2" /> Consultation Window Expired
                                                        </button>
                                                    );
                                                }

                                                return isReady ? (
                                                    <Link
                                                        href={`/doctor/consultation/${activeAppointment._id}`}
                                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs shadow-xs flex justify-center items-center transition-all active:scale-98"
                                                    >
                                                        <Video className="w-4 h-4 mr-2" /> Join Video Call
                                                    </Link>
                                                ) : (
                                                    <button
                                                        disabled
                                                        title="You can join 15 minutes before the scheduled time."
                                                        className="flex-1 bg-indigo-600/40 text-white py-3 rounded-xl font-bold text-xs cursor-not-allowed shadow-2xs flex justify-center items-center"
                                                    >
                                                        <Video className="w-4 h-4 mr-2" /> Join Video Call (Opens 15m Prior)
                                                    </button>
                                                );
                                            })()
                                        ) : activeAppointment.isManualBooking ? (
                                            <div className="flex-1 flex flex-col gap-2">
                                                {otpSuccess ? (
                                                    <div className="w-full py-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Consultation marked as completed!
                                                    </div>
                                                ) : (
                                                    <button
                                                        id="complete-manual-offline-btn"
                                                        disabled={isCompletingManual}
                                                        onClick={() => handleCompleteManualOffline(activeAppointment._id)}
                                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                                                    >
                                                        {isCompletingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        <span>Mark Consultation Completed</span>
                                                    </button>
                                                )}
                                                {otpError && (
                                                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                                                        <span>{otpError}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col gap-2">
                                                {otpSuccess ? (
                                                    <div className="w-full py-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Appointment completed successfully!
                                                    </div>
                                                ) : (
                                                    <>
                                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                            Patient 4-digit verification code:
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                id="offline-otp-input"
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={4}
                                                                placeholder="• • • •"
                                                                value={otpInput}
                                                                disabled={isVerifyingOtp}
                                                                onChange={(e) => {
                                                                    const v = e.target.value.replace(/\D/g, '');
                                                                    setOtpInput(v);
                                                                    if (otpError) setOtpError('');
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && otpInput.length === 4 && !isVerifyingOtp) {
                                                                        handleCompleteOffline(activeAppointment._id);
                                                                    }
                                                                }}
                                                                className={`flex-1 text-center tracking-[0.4em] text-base font-bold border-2 ${
                                                                    otpError ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500' : 'border-emerald-300 bg-emerald-50/30 focus:border-emerald-500'
                                                                } focus:outline-none rounded-xl px-3 py-2 text-[#101044] transition-all`}
                                                            />
                                                            <button
                                                                id="complete-offline-btn"
                                                                disabled={otpInput.length !== 4 || isVerifyingOtp}
                                                                onClick={() => handleCompleteOffline(activeAppointment._id)}
                                                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-1.5 min-w-[50px] active:scale-98"
                                                            >
                                                                {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                        {otpError && (
                                                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                                                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                                                                <span>{otpError}</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {(() => {
                                            const endMs = getAppointmentEndTimestamp(activeAppointment);
                                            const canMarkNoShow = endMs > 0 ? Date.now() >= endMs : true;
                                            return (
                                                <button 
                                                    disabled={!canMarkNoShow || isMarkingNoShow}
                                                    title={!canMarkNoShow ? "Cannot mark no-show before the scheduled end time" : "Mark Patient as No-Show"} 
                                                    onClick={() => handleMarkNoShow(activeAppointment._id)}
                                                    className="flex-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 py-3 rounded-xl font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs flex justify-center items-center gap-1.5 transition-all active:scale-98"
                                                >
                                                    {isMarkingNoShow ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                                                    <span>Mark No-Show</span>
                                                </button>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="w-full flex items-center justify-center py-2 text-xs font-bold text-slate-500 gap-2">
                                        <span>Status:</span>
                                        <span className={`px-3 py-1 rounded-full font-bold ${getAppointmentStatusConfig(activeAppointment.status, 'doctor').badgeClass}`}>
                                            {getAppointmentStatusConfig(activeAppointment.status, 'doctor').label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
