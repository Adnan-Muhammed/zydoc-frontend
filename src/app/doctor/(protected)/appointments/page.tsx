"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDoctorAppointments, completeOfflineAppointment, markNoShowOfflineAppointment } from '@/redux/features/appointment/appointmentThunk';

import { getAppointmentStatusConfig, getAppointmentStartTimestamp, getAppointmentEndTimestamp, isAppointmentUpcomingOrActive } from '@/utils/appointmentStatus';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';

export default function DoctorAppointmentsPage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { doctorAppointments: appointments, isLoading, error } = useAppSelector((state) => state.appointment);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [otpInput, setOtpInput] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    const upcoming = (appointments || [])
        .filter((app: any) => isAppointmentUpcomingOrActive(app))
        .sort((a: any, b: any) => getAppointmentStartTimestamp(a) - getAppointmentStartTimestamp(b));
        
    const past = (appointments || [])
        .filter((app: any) => !isAppointmentUpcomingOrActive(app))
        .sort((a: any, b: any) => getAppointmentStartTimestamp(b) - getAppointmentStartTimestamp(a));


    if (isLoading) {
        return (
            <div className="p-8 text-center text-slate-500 flex justify-center items-center min-h-[50vh]">
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading appointments...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg mx-auto max-w-5xl mt-8 border border-red-200">
                Error loading appointments: {error}
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
        const doctor = user || {};
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
            <div key={app._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0 overflow-hidden">
                        {isManual ? (
                            <span className="text-amber-700 bg-amber-100 w-full h-full flex items-center justify-center font-bold text-sm">
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
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-800">{patientName}</h3>
                            {isManual && (
                                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                                    Direct Booking
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">
                            {isManual 
                                ? (app.manualPatientDetails?.opNumber ? `OP: ${app.manualPatientDetails.opNumber}` : (app.manualPatientDetails?.phone || 'Direct Walk-In (0% Platform Fee)'))
                                : (app.patientId?.email || 'No email provided')}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-1.5"><i className="far fa-calendar text-slate-400"></i> {date}</span>
                            <span className="flex items-center gap-1.5"><i className="far fa-clock text-slate-400"></i> {formattedTime}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                        {isManual ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                                <i className="fas fa-user-check"></i> Direct Booking
                            </span>
                        ) : (app.consultationType === 'online' || app.consultationType === 'video') ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 flex items-center gap-1.5"><i className="fas fa-video"></i> Online</span>
                        ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1.5"><i className="fas fa-building"></i> In-Person</span>
                        )}
                        {app.patientType === 'NEW' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 flex items-center gap-1.5"><i className="fas fa-user-plus"></i> New</span>
                        ) : app.patientType === 'FOLLOW_UP' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1.5"><i className="fas fa-user-check"></i> Follow-up</span>
                        ) : null}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${statusConfig.badgeClass}`}>
                            {statusConfig.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start flex-wrap">
                        {app.prescriptions && app.prescriptions.length > 0 && (
                            <button
                                onClick={() => handleDownloadPrescription(app)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors flex items-center gap-1.5"
                                title="Download prescription PDF"
                            >
                                <i className="fas fa-file-pdf text-rose-500"></i>
                                <span>e-Rx ({app.prescriptions.length})</span>
                            </button>
                        )}
                        {app.consultationFiles && app.consultationFiles.length > 0 && (
                            <button
                                onClick={() => setSelectedAppointment(app)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
                                title="View consultation documents"
                            >
                                <i className="fas fa-paperclip text-emerald-600"></i>
                                <span>Files ({app.consultationFiles.length})</span>
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedAppointment(app)}
                            className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Patient Appointments</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your upcoming and past consultations.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg">
                    <i className="fas fa-calendar-alt"></i> Total: {appointments.length}
                </div>
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
                            <p className="text-sm text-slate-500">You don't have any scheduled patient consultations at the moment.</p>
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

            {/* Appointment Details Modal - Patient Health Card */}
            {selectedAppointment && (() => {
                const activeAppointment = appointments.find((a: any) => a._id === selectedAppointment._id) || selectedAppointment;
                const isTerminal = ['completed', 'no-show', 'cancelled', 'cancelled-by-doctor', 'disputed', 'refunded'].includes(
                    (activeAppointment.status || '').toLowerCase().trim()
                );

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div className="flex items-center gap-2 text-indigo-700">
                                    <i className="fas fa-notes-medical text-xl"></i>
                                    <h2 className="text-lg font-bold">Patient Health Card</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedAppointment(null);
                                        setOtpInput('');
                                        setOtpError('');
                                        setOtpSuccess(false);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6 overflow-y-auto">
                                {/* 1. Patient Vitals & Profile */}
                                <div className="flex flex-col sm:flex-row gap-6">
                                    {/* Profile Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xl overflow-hidden shrink-0">
                                            {activeAppointment.isManualBooking ? (
                                                <span className="text-amber-700 bg-amber-100 w-full h-full flex items-center justify-center font-bold text-lg">
                                                    {getPatientInitials(activeAppointment.patientId, activeAppointment.manualPatientDetails, true)}
                                                </span>
                                            ) : (
                                                getPatientInitials(activeAppointment.patientId, activeAppointment.manualPatientDetails, false)
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-slate-800">
                                                    {getPatientName(activeAppointment.patientId, activeAppointment.manualPatientDetails, activeAppointment.isManualBooking)}
                                                </h3>
                                                {activeAppointment.isManualBooking && (
                                                    <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                                                        Direct Booking
                                                    </span>
                                                )}
                                            </div>
                                            {activeAppointment.isManualBooking ? (
                                                <>
                                                    {activeAppointment.manualPatientDetails?.opNumber && (
                                                        <p className="text-slate-700 text-sm font-medium mt-0.5">
                                                            <i className="fas fa-id-card text-amber-600 text-xs mr-1"></i> OP No: {activeAppointment.manualPatientDetails.opNumber}
                                                        </p>
                                                    )}
                                                    {activeAppointment.manualPatientDetails?.phone ? (
                                                        <p className="text-slate-500 text-sm mt-0.5"><i className="fas fa-phone text-slate-400 text-xs mr-1"></i> {activeAppointment.manualPatientDetails.phone}</p>
                                                    ) : (
                                                        <p className="text-slate-400 text-xs mt-0.5 italic">No phone number recorded</p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-slate-500 text-sm">{activeAppointment.patientId?.email || 'No email'}</p>
                                                    {activeAppointment.patientId?.profileId?.phone && (
                                                        <p className="text-slate-500 text-sm mt-0.5"><i className="fas fa-phone text-slate-400 text-xs mr-1"></i> {activeAppointment.patientId.profileId.phone}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vitals & Details */}
                                    {!activeAppointment.isManualBooking && (
                                        <div className="flex gap-4">
                                            {activeAppointment.patientId?.profileId?.dateOfBirth && (
                                                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[4rem]">
                                                    <i className="fas fa-birthday-cake text-sky-500 mb-1"></i>
                                                    <span className="text-sky-700 font-bold text-sm">
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
                                                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[4rem]">
                                                    <i className="fas fa-tint text-red-500 mb-1"></i>
                                                    <span className="text-red-700 font-bold text-sm">{activeAppointment.patientId.profileId.bloodGroup}</span>
                                                </div>
                                            )}
                                            {activeAppointment.patientId?.profileId?.gender && (
                                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[4rem]">
                                                    <i className={`fas fa-venus-mars text-indigo-500 mb-1`}></i>
                                                    <span className="text-indigo-700 font-bold text-sm capitalize">{activeAppointment.patientId.profileId.gender}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 2. Schedule Details */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Booking Details</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1"><i className="far fa-calendar text-slate-400 mr-1"></i> Date</div>
                                            <div className="font-semibold text-slate-800 text-sm">{new Date(activeAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1"><i className="far fa-clock text-slate-400 mr-1"></i> Time</div>
                                            <div className="font-semibold text-slate-800 text-sm">{activeAppointment.appointmentTime}</div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1"><i className="fas fa-stethoscope text-slate-400 mr-1"></i> Method</div>
                                            <div className="font-semibold text-slate-800 text-sm capitalize">
                                                {activeAppointment.isManualBooking ? 'Direct Booking' : (activeAppointment.consultationType === 'online' || activeAppointment.consultationType === 'video') ? 'Online' : 'In-Person'}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1"><i className="fas fa-user text-slate-400 mr-1"></i> Visit Type</div>
                                            <div className="font-semibold text-slate-800 text-sm capitalize">{activeAppointment.patientType === 'NEW' ? 'New Consultation' : activeAppointment.patientType === 'FOLLOW_UP' ? 'Follow-up' : 'Regular'}</div>
                                        </div>
                                        {!activeAppointment.isManualBooking && (
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="text-xs text-slate-500 mb-1"><i className="fas fa-wallet text-slate-400 mr-1"></i> Fee Collected</div>
                                                <div className="font-semibold text-emerald-600 text-sm">
                                                    ₹{activeAppointment.fee || 0}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Medical History */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Medical History</h4>
                                    {activeAppointment.isManualBooking ? (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-500 flex items-center gap-2">
                                            <i className="fas fa-info-circle text-amber-500"></i>
                                            <span>Direct walk-in consultation. Platform digital medical history is not linked to manual bookings.</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Allergies */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                                    <i className="fas fa-allergies"></i>
                                                </div>
                                                <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                    <div className="text-xs font-semibold text-slate-500 mb-1">Allergies</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeAppointment.patientId?.profileId?.medicalHistory?.allergies?.length > 0 ? (
                                                            activeAppointment.patientId.profileId.medicalHistory.allergies.map((allergy: string, idx: number) => (
                                                                <span key={idx} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-medium">{allergy}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-slate-400 italic">No known allergies</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chronic Conditions */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                                    <i className="fas fa-heartbeat"></i>
                                                </div>
                                                <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                    <div className="text-xs font-semibold text-slate-500 mb-1">Chronic Conditions</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeAppointment.patientId?.profileId?.medicalHistory?.chronicConditions?.length > 0 ? (
                                                            activeAppointment.patientId.profileId.medicalHistory.chronicConditions.map((condition: string, idx: number) => (
                                                                <span key={idx} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-medium">{condition}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-slate-400 italic">None reported</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Current Medications */}
                                            <div className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                                    <i className="fas fa-pills"></i>
                                                </div>
                                                <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                    <div className="text-xs font-semibold text-slate-500 mb-1">Current Medications</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeAppointment.patientId?.profileId?.medicalHistory?.currentMedications?.length > 0 ? (
                                                            activeAppointment.patientId.profileId.medicalHistory.currentMedications.map((med: string, idx: number) => (
                                                                <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">{med}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-slate-400 italic">No current medications</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Notes & Symptoms */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Appointment Specifics</h4>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                                        <i className="far fa-comment-alt text-amber-500 mt-1"></i>
                                        <div>
                                            <div className="text-xs font-semibold text-amber-600 mb-1">Patient Notes / Symptoms</div>
                                            <div className="text-sm text-amber-900 whitespace-pre-wrap">
                                                {activeAppointment.manualPatientDetails?.notes || activeAppointment.notes || <span className="italic opacity-60">No additional notes provided for this consultation.</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Prescriptions & Medications */}
                                {activeAppointment.prescriptions && activeAppointment.prescriptions.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <i className="fas fa-prescription text-indigo-600"></i>
                                                <span>Prescriptions ({activeAppointment.prescriptions.length})</span>
                                            </h4>
                                            <button
                                                onClick={() => handleDownloadPrescription(activeAppointment)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                                            >
                                                <i className="fas fa-download text-[10px]"></i>
                                                <span>Download PDF</span>
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {activeAppointment.prescriptions.map((rx: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                                                {i + 1}
                                                            </span>
                                                            <span>{rx.medicine}</span>
                                                        </div>
                                                        <div className="text-slate-500 text-[11px] mt-1 ml-7 flex items-center gap-2">
                                                            <span>{rx.dosage}</span>
                                                            <span>•</span>
                                                            <span className="text-indigo-600 font-medium">{rx.frequency}</span>
                                                            <span>•</span>
                                                            <span>{rx.duration}</span>
                                                        </div>
                                                        {rx.instructions && (
                                                            <div className="text-slate-400 italic text-[10px] mt-0.5 ml-7">
                                                                Instructions: {rx.instructions}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md">
                                                        {rx.duration || 'Active'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 6. Consultation Documents & Uploaded Files */}
                                {activeAppointment.consultationFiles && activeAppointment.consultationFiles.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <i className="fas fa-paperclip text-emerald-600"></i>
                                                <span>Consultation Documents & Files ({activeAppointment.consultationFiles.length})</span>
                                            </h4>
                                        </div>
                                        <div className="space-y-2">
                                            {activeAppointment.consultationFiles.map((file: any, i: number) => {
                                                const fileType = (file.type || '').toLowerCase();
                                                const isPdf = fileType === 'pdf';
                                                const isImg = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(fileType);
                                                const iconClass = isPdf ? 'fa-file-pdf text-rose-500' : isImg ? 'fa-file-image text-emerald-500' : 'fa-file-alt text-indigo-500';
                                                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                                                const fileUrl = file.url?.startsWith('http') ? file.url : `${baseUrl}${file.url?.startsWith('/') ? '' : '/'}${file.url}`;

                                                return (
                                                    <div
                                                        key={file.id || i}
                                                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                                                <i className={`fas ${iconClass} text-sm`}></i>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-800 truncate" title={file.name}>
                                                                    {file.name}
                                                                </div>
                                                                <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                                                                    <span>{file.size || 'Attachment'}</span>
                                                                    <span>•</span>
                                                                    <span className="text-emerald-600 font-medium">{file.category || 'Consultation File'}</span>
                                                                    {file.uploadedBy && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>By {file.uploadedBy}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {file.url && (
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs shrink-0 transition-colors"
                                                            >
                                                                <i className="fas fa-download text-[10px]"></i>
                                                                <span>View / Download</span>
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
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
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

                                                // Call can be joined 15 mins early up until end of session window
                                                const isReady = diffMins <= 15 && nowMs <= maxSessionEnd;
                                                const isExpired = nowMs > maxSessionEnd;

                                                if (isExpired) {
                                                    return (
                                                        <button disabled title="Appointment time has expired" className="flex-1 bg-slate-100 text-slate-400 py-2.5 rounded-lg font-bold cursor-not-allowed shadow-sm flex justify-center items-center border border-slate-200">
                                                            <i className="fas fa-video-slash mr-2"></i> Expired
                                                        </button>
                                                    );
                                                }

                                                return isReady ? (
                                                    <Link
                                                        href={`/doctor/consultation/${activeAppointment._id}`}
                                                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold shadow-sm flex justify-center items-center hover:bg-indigo-700 transition-colors"
                                                    >
                                                        <i className="fas fa-video mr-2"></i> Join Call
                                                    </Link>
                                                ) : (
                                                    <button
                                                        disabled
                                                        title="You can join 15 minutes before the scheduled time."
                                                        className="flex-1 bg-indigo-600/50 text-white py-2.5 rounded-lg font-bold cursor-not-allowed shadow-sm flex justify-center items-center"
                                                    >
                                                        <i className="fas fa-video mr-2"></i> Join Call
                                                    </button>
                                                );
                                            })()
                                        ) : activeAppointment.isManualBooking ? (
                                            // Manual Offline Booking: Direct 1-click completion without OTP
                                            <div className="flex-1 flex flex-col gap-2">
                                                {otpSuccess ? (
                                                    <div className="w-full py-2.5 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2">
                                                        <i className="fas fa-check-circle"></i> Appointment marked as completed!
                                                    </div>
                                                ) : (
                                                    <button
                                                        id="complete-manual-offline-btn"
                                                        disabled={isLoading}
                                                        onClick={async () => {
                                                            setOtpError('');
                                                            const result = await dispatch(
                                                                completeOfflineAppointment({
                                                                    appointmentId: activeAppointment._id,
                                                                    otp: '0000', // Bypassed by backend for manual bookings
                                                                })
                                                            );
                                                            if (completeOfflineAppointment.fulfilled.match(result)) {
                                                                setOtpSuccess(true);
                                                                dispatch(fetchDoctorAppointments());
                                                                setTimeout(() => {
                                                                    setSelectedAppointment(null);
                                                                    setOtpSuccess(false);
                                                                }, 1500);
                                                            } else {
                                                                setOtpError((result.payload as string) || 'Failed to complete appointment.');
                                                            }
                                                        }}
                                                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                                                        Mark Consultation Completed
                                                    </button>
                                                )}
                                                {otpError && (
                                                    <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                                                        <i className="fas fa-exclamation-circle"></i> {otpError}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            // Regular Offline appointment: OTP verification to mark completed
                                            <div className="flex-1 flex flex-col gap-2">
                                                {otpSuccess ? (
                                                    <div className="w-full py-2.5 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2">
                                                        <i className="fas fa-check-circle"></i> Appointment completed!
                                                    </div>
                                                ) : (
                                                    <>
                                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                                            <i className="fas fa-shield-alt text-emerald-500"></i>
                                                            Enter patient's 4-digit verification code:
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                id="offline-otp-input"
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={4}
                                                                placeholder="_ _ _ _"
                                                                value={otpInput}
                                                                onChange={(e) => {
                                                                    const v = e.target.value.replace(/\D/g, '');
                                                                    setOtpInput(v);
                                                                    if (otpError) setOtpError('');
                                                                }}
                                                                className="flex-1 text-center tracking-[0.4em] text-lg font-bold border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-slate-800 bg-emerald-50"
                                                            />
                                                            <button
                                                                id="complete-offline-btn"
                                                                disabled={otpInput.length !== 4 || isLoading}
                                                                onClick={async () => {
                                                                    setOtpError('');
                                                                    const result = await dispatch(
                                                                        completeOfflineAppointment({
                                                                            appointmentId: activeAppointment._id,
                                                                            otp: otpInput,
                                                                        })
                                                                    );
                                                                    if (completeOfflineAppointment.fulfilled.match(result)) {
                                                                        setOtpSuccess(true);
                                                                        dispatch(fetchDoctorAppointments());
                                                                        setTimeout(() => {
                                                                            setSelectedAppointment(null);
                                                                            setOtpInput('');
                                                                            setOtpSuccess(false);
                                                                        }, 1800);
                                                                    } else {
                                                                        setOtpError((result.payload as string) || 'Invalid code. Please try again.');
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors shadow-sm"
                                                            >
                                                                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                                                            </button>
                                                        </div>
                                                        {otpError && (
                                                            <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                                                                <i className="fas fa-exclamation-circle"></i> {otpError}
                                                            </p>
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
                                                    disabled={!canMarkNoShow || isLoading}
                                                    title={!canMarkNoShow ? "Cannot mark no-show before the scheduled end time" : "Mark Patient as No-Show"} 
                                                    onClick={async () => {
                                                        if (confirm("Are you sure you want to mark this patient as a No-Show?")) {
                                                            const result = await dispatch(markNoShowOfflineAppointment({ appointmentId: activeAppointment._id }));
                                                            if (markNoShowOfflineAppointment.fulfilled.match(result)) {
                                                                setSelectedAppointment(null);
                                                                dispatch(fetchDoctorAppointments());
                                                            } else {
                                                                alert((result.payload as string) || "Failed to mark patient as no-show.");
                                                            }
                                                        }
                                                    }}
                                                    className="flex-1 bg-white border border-red-200 text-red-500 py-2.5 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 shadow-sm flex justify-center items-center transition-colors">
                                                    {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-user-times mr-2"></i>}
                                                    Mark No-Show
                                                </button>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <div className="w-full flex items-center justify-center py-1 text-sm font-semibold text-slate-500 gap-2">
                                        <span>Status:</span>
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${getAppointmentStatusConfig(activeAppointment.status, 'doctor').badgeClass}`}>
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
