"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDoctorAppointments } from '@/redux/features/appointment/appointmentThunk';

export default function DoctorAppointmentsPage() {
    const dispatch = useAppDispatch();
    const { doctorAppointments: appointments, isLoading, error } = useAppSelector((state) => state.appointment);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchDoctorAppointments());
    }, [dispatch]);

    // Separate into upcoming and past
    const now = new Date();
    const upcoming = appointments.filter((app: any) => new Date(app.appointmentDate) >= now && app.status !== 'cancelled');
    const past = appointments.filter((app: any) => new Date(app.appointmentDate) < now || app.status === 'cancelled');

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

    const getPatientName = (patientData: any) => {
        if (!patientData) return "Patient";
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

    const getPatientInitials = (patientData: any) => {
        const name = getPatientName(patientData);
        if (name === "Patient") return "PT";
        return name.substring(0, 2).toUpperCase();
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const renderAppointmentCard = (app: any) => {
        const patientName = getPatientName(app.patientId);
        const initials = getPatientInitials(app.patientId);

        const date = new Date(app.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = formatTime(app.appointmentTime);

        let statusBadge = "bg-amber-100 text-amber-700";
        if (app.status === 'completed') statusBadge = "bg-emerald-100 text-emerald-700";
        if (app.status === 'cancelled') statusBadge = "bg-red-100 text-red-700";

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
                        {avatarUrl ? (
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
                        <h3 className="text-base font-bold text-slate-800">{patientName}</h3>
                        <p className="text-sm text-slate-500">{app.patientId?.email || 'No email provided'}</p>

                        <div className="flex items-center gap-3 mt-2 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-1.5"><i className="far fa-calendar text-slate-400"></i> {date}</span>
                            <span className="flex items-center gap-1.5"><i className="far fa-clock text-slate-400"></i> {formattedTime}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                        {app.consultationType === 'video' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 flex items-center gap-1.5"><i className="fas fa-video"></i> Online</span>
                        ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1.5"><i className="fas fa-building"></i> In-Person</span>
                        )}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md capitalize ${statusBadge}`}>
                            {app.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
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
                        <i className="fas fa-calendar-check text-indigo-500"></i> Upcoming Consultations
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
                            <h3 className="text-slate-700 font-bold mb-1">No upcoming appointments</h3>
                            <p className="text-sm text-slate-500">You don't have any scheduled patient consultations at the moment.</p>
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <i className="fas fa-history text-slate-400"></i> Past & Cancelled
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
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <i className="fas fa-notes-medical text-xl"></i>
                                <h2 className="text-lg font-bold">Patient Health Card</h2>
                            </div>
                            <button
                                onClick={() => setSelectedAppointment(null)}
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
                                        {getPatientInitials(selectedAppointment.patientId)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">{getPatientName(selectedAppointment.patientId)}</h3>
                                        <p className="text-slate-500 text-sm">{selectedAppointment.patientId?.email}</p>
                                        {selectedAppointment.patientId?.profileId?.phone && (
                                            <p className="text-slate-500 text-sm mt-0.5"><i className="fas fa-phone text-slate-400 text-xs mr-1"></i> {selectedAppointment.patientId.profileId.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Vitals & Details */}
                                <div className="flex gap-4">
                                    {selectedAppointment.patientId?.profileId?.dateOfBirth && (
                                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[4rem]">
                                            <i className="fas fa-birthday-cake text-sky-500 mb-1"></i>
                                            <span className="text-sky-700 font-bold text-sm">
                                                {(() => {
                                                    const dob = new Date(selectedAppointment.patientId.profileId.dateOfBirth);
                                                    const ageDifMs = Date.now() - dob.getTime();
                                                    const ageDate = new Date(ageDifMs);
                                                    return Math.abs(ageDate.getUTCFullYear() - 1970) + " Yrs";
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    {selectedAppointment.patientId?.profileId?.bloodGroup && (
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[4rem]">
                                            <i className="fas fa-tint text-red-500 mb-1"></i>
                                            <span className="text-red-700 font-bold text-sm">{selectedAppointment.patientId.profileId.bloodGroup}</span>
                                        </div>
                                    )}
                                    {selectedAppointment.patientId?.profileId?.gender && (
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[4rem]">
                                            <i className={`fas fa-venus-mars text-indigo-500 mb-1`}></i>
                                            <span className="text-indigo-700 font-bold text-sm capitalize">{selectedAppointment.patientId.profileId.gender}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Schedule Details */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Booking Details</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-1"><i className="far fa-calendar text-slate-400 mr-1"></i> Date</div>
                                        <div className="font-semibold text-slate-800 text-sm">{new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-1"><i className="far fa-clock text-slate-400 mr-1"></i> Time</div>
                                        <div className="font-semibold text-slate-800 text-sm">{formatTime(selectedAppointment.appointmentTime)}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-1"><i className="fas fa-stethoscope text-slate-400 mr-1"></i> Type</div>
                                        <div className="font-semibold text-slate-800 text-sm capitalize">{selectedAppointment.consultationType === 'video' ? 'Online' : 'In-Person'}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="text-xs text-slate-500 mb-1"><i className="fas fa-wallet text-slate-400 mr-1"></i> Fee Paid</div>
                                        <div className="font-semibold text-emerald-600 text-sm">₹{selectedAppointment.fee}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Medical History */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Medical History</h4>
                                <div className="space-y-3">
                                    {/* Allergies */}
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                            <i className="fas fa-allergies"></i>
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <div className="text-xs font-semibold text-slate-500 mb-1">Allergies</div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAppointment.patientId?.profileId?.medicalHistory?.allergies?.length > 0 ? (
                                                    selectedAppointment.patientId.profileId.medicalHistory.allergies.map((allergy: string, idx: number) => (
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
                                                {selectedAppointment.patientId?.profileId?.medicalHistory?.chronicConditions?.length > 0 ? (
                                                    selectedAppointment.patientId.profileId.medicalHistory.chronicConditions.map((condition: string, idx: number) => (
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
                                                {selectedAppointment.patientId?.profileId?.medicalHistory?.currentMedications?.length > 0 ? (
                                                    selectedAppointment.patientId.profileId.medicalHistory.currentMedications.map((med: string, idx: number) => (
                                                        <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">{med}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-slate-400 italic">No current medications</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Notes & Symptoms */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Appointment Specifics</h4>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                                    <i className="far fa-comment-alt text-amber-500 mt-1"></i>
                                    <div>
                                        <div className="text-xs font-semibold text-amber-600 mb-1">Patient Notes / Symptoms</div>
                                        <div className="text-sm text-amber-900 whitespace-pre-wrap">
                                            {selectedAppointment.notes || <span className="italic opacity-60">No additional notes provided for this consultation.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            {selectedAppointment.status === 'scheduled' && (
                                <>
                                    {selectedAppointment.consultationType === 'video' ? (
                                        <button disabled title="Feature in development" className="flex-1 bg-indigo-600/50 text-white py-2.5 rounded-lg font-bold cursor-not-allowed shadow-sm flex justify-center items-center">
                                            <i className="fas fa-video mr-2"></i> Join Call
                                        </button>
                                    ) : (
                                        <button disabled title="Feature in development" className="flex-1 bg-emerald-600/50 text-white py-2.5 rounded-lg font-bold cursor-not-allowed shadow-sm flex justify-center items-center">
                                            <i className="fas fa-check mr-2"></i> Mark Completed
                                        </button>
                                    )}
                                    <button disabled title="Feature in development" className="flex-1 bg-white border border-slate-200 text-slate-400 py-2.5 rounded-lg font-bold cursor-not-allowed shadow-sm flex justify-center items-center">
                                        <i className="fas fa-times mr-2"></i> Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
