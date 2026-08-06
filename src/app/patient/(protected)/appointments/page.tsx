"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchPatientAppointments } from '@/redux/features/appointment/appointmentThunk';

export default function PatientAppointmentsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { appointments, isLoading, error } = useSelector((state: RootState) => state.appointment);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchPatientAppointments());
    }, [dispatch]);

    // Separate into upcoming and past
    const now = new Date();
    // Reset time for current day to allow today's appointments to show as upcoming based on time if we wanted to be strict,
    // but a simple date compare works for the MVP.
    const upcoming = appointments.filter((app: any) => new Date(app.appointmentDate) >= now && app.status !== 'cancelled');
    const past = appointments.filter((app: any) => new Date(app.appointmentDate) < now || app.status === 'cancelled');

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
        
        // Format time to 12-hour format
        const formatTime = (timeStr: string) => {
            if (!timeStr) return '';
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        };
        const formattedTime = formatTime(app.appointmentTime);

        let statusBadge = "bg-amber-100 text-amber-700";
        if (app.status === 'completed') statusBadge = "bg-emerald-100 text-emerald-700";
        if (app.status === 'cancelled') statusBadge = "bg-red-100 text-red-700";

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
            <div key={app._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0 overflow-hidden">
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
                    <div>
                        <h3 className="text-base font-bold text-slate-800">{doctorName}</h3>
                        <p className="text-sm text-slate-500">{capitalize(doctor.specialty) || "General Practice"}</p>
                        
                        <div className="flex items-center gap-3 mt-2 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-1.5"><i className="far fa-calendar text-slate-400"></i> {date}</span>
                            <span className="flex items-center gap-1.5"><i className="far fa-clock text-slate-400"></i> {formattedTime}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                        {app.consultationType === 'video' ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 flex items-center gap-1.5"><i className="fas fa-video"></i> Video</span>
                        ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-1.5"><i className="fas fa-building"></i> Clinic</span>
                        )}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md capitalize ${statusBadge}`}>
                            {app.status}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                        <div className="text-sm font-bold text-slate-800 mr-2">
                            ₹{app.fee}
                        </div>
                        {app.status === 'scheduled' && (
                            <button 
                                onClick={() => setSelectedAppointment(app)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                            >
                                View Details
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your upcoming consultations and view past visits.</p>
                </div>
                <Link href="/patient/find-doctor" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                    <i className="fas fa-plus"></i> Book New
                </Link>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <i className="fas fa-calendar-check text-indigo-500"></i> Upcoming
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
                            <p className="text-sm text-slate-500 mb-4">You don't have any scheduled consultations at the moment.</p>
                            <Link href="/patient/find-doctor" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 text-sm font-semibold rounded-lg transition-colors">
                                Find a Doctor
                            </Link>
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

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Appointment Details</h2>
                            <button 
                                onClick={() => setSelectedAppointment(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Doctor Info */}
                            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-lg overflow-hidden shrink-0">
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
                                        <span>DR</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Dr. {selectedAppointment.doctorId?.firstName} {selectedAppointment.doctorId?.lastName}</h3>
                                    <p className="text-slate-500 capitalize">{selectedAppointment.doctorId?.specialty || "General Practice"}</p>
                                </div>
                            </div>
                            
                            {/* Schedule Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date & Time</div>
                                    <div className="font-medium text-slate-800">
                                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        <br/>
                                        <span className="text-slate-500">{(() => {
                                            const [h, m] = selectedAppointment.appointmentTime.split(':');
                                            const hr = parseInt(h, 10);
                                            return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                                        })()}</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type & Fee</div>
                                    <div className="font-medium text-slate-800 capitalize">
                                        {selectedAppointment.consultationType} Visit
                                        <br/>
                                        <span className="text-indigo-600">₹{selectedAppointment.fee}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Conditional Info (Clinic vs Video) */}
                            {selectedAppointment.consultationType === 'physical' ? (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <i className="fas fa-map-marker-alt text-emerald-500"></i> Clinic Location
                                    </h4>
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                        <p className="font-semibold text-emerald-800">{selectedAppointment.doctorId?.consultationSettings?.physical?.clinicName || "Clinic Name Not Provided"}</p>
                                        <p className="text-sm text-emerald-600 mt-1">{selectedAppointment.doctorId?.consultationSettings?.physical?.clinicAddress || "Address not provided."}</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <i className="fas fa-video text-indigo-500"></i> Online Consultation
                                    </h4>
                                    <p className="text-sm text-slate-600 mb-4">Please ensure you have a stable internet connection. The Join button will be active 15 minutes prior to the appointment.</p>
                                    
                                    {(() => {
                                        const now = new Date();
                                        const appDate = new Date(selectedAppointment.appointmentDate);
                                        const [hours, minutes] = selectedAppointment.appointmentTime.split(':').map(Number);
                                        
                                        const exactAppTime = new Date(
                                            appDate.getFullYear(),
                                            appDate.getMonth(),
                                            appDate.getDate(),
                                            hours,
                                            minutes,
                                            0
                                        );
                                        
                                        const diffMins = (exactAppTime.getTime() - now.getTime()) / 1000 / 60;
                                        // Enable 15 mins before and up to 60 mins after
                                        const isJoinEnabled = diffMins <= 15 && diffMins >= -60;
                                        
                                        return (
                                            <button 
                                                disabled={!isJoinEnabled}
                                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isJoinEnabled ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                            >
                                                <i className="fas fa-phone-alt"></i> {isJoinEnabled ? "Join Video Call" : "Call not available yet"}
                                            </button>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Notes */}
                            {selectedAppointment.notes && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-2"><i className="far fa-sticky-note text-slate-400"></i> My Notes</h4>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 whitespace-pre-wrap">
                                        {selectedAppointment.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
