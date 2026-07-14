import React from 'react';
import Link from 'next/link';
import { getPatientAppointments } from '@/lib/appointments';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Appointments | Dashboard',
};

export default async function PatientAppointmentsPage() {
    const data = await getPatientAppointments();
    const appointments = data?.appointments || [];

    // Separate into upcoming and past
    const now = new Date();
    // Reset time for current day to allow today's appointments to show as upcoming based on time if we wanted to be strict,
    // but a simple date compare works for the MVP.
    const upcoming = appointments.filter((app: any) => new Date(app.appointmentDate) >= now && app.status !== 'cancelled');
    const past = appointments.filter((app: any) => new Date(app.appointmentDate) < now || app.status === 'cancelled');

    const renderAppointmentCard = (app: any) => {
        const doctor = app.doctorId || {};
        const doctorName = doctor.firstName ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";
        const date = new Date(app.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        
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

        return (
            <div key={app._id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={doctorName} className="w-full h-full object-cover" />
                        ) : (
                            <i className="fas fa-user-doctor text-indigo-500"></i>
                        )}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">{doctorName}</h3>
                        <p className="text-sm text-slate-500">{doctor.specialty || "General Practice"}</p>
                        
                        <div className="flex items-center gap-3 mt-2 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-1.5"><i className="far fa-calendar text-slate-400"></i> {date}</span>
                            <span className="flex items-center gap-1.5"><i className="far fa-clock text-slate-400"></i> {app.appointmentTime}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
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
                    <div className="text-sm font-bold text-slate-800">
                        ₹{app.fee}
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
        </div>
    );
}
