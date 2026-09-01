

// src/app/doctor/(protected)/dashboard/doctor-dasboardClient.tsx

'use client';

import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchDoctorAppointments } from '@/redux/features/appointment/appointmentThunk';
import { useSocket } from '@/hooks/useSocket';
import './doctor-dashboard.css';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const isPending =
    user?.isProfileCompleted &&
    user?.verificationStatus === 'pending';

  const isRejected =
    user?.isProfileCompleted &&
    user?.verificationStatus === 'rejected';

  const isApproved =
    user?.isProfileCompleted &&
    user?.verificationStatus === 'approved';

  const dispatch = useAppDispatch();
  const { doctorAppointments: appointments, isLoading: loadingAppointments } = useAppSelector((state) => state.appointment);

  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'video' | 'physical'>('all');
  const [isNextPatientLive, setIsNextPatientLive] = useState(false);
  const timerRef = useRef<HTMLDivElement>(null);

  // Timer Effect using useRef to avoid re-renders
  useEffect(() => {
    if (!appointments || appointments.length === 0) return;
    const nextAppt = appointments[0];

    // Only run timer if status is 'scheduled' (Upcoming)
    if (nextAppt.status !== 'scheduled') {
      if (timerRef.current) timerRef.current.innerText = "00:00:00";
      return;
    }

    const apptDate = new Date(nextAppt.appointmentDate);
    const [timeStr, modifier] = (nextAppt.appointmentTime || "").trim().split(/\s+/);
    let [hours, minutes] = (timeStr || "").split(":").map(Number);
    if (modifier?.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;
    apptDate.setHours(hours, minutes, 0, 0);

    const exactTime = apptDate.getTime();

    const updateTimer = () => {
      if (!timerRef.current) return;
      const diff = exactTime - new Date().getTime();
      if (diff <= 0) {
        timerRef.current.innerText = "00:00:00";
        return;
      }
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      timerRef.current.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [appointments]);

  // Get the socket instance
  const { socket } = useSocket({ userId: user?._id || user?.id, role: user?.role });

  useEffect(() => {
    if (!socket) return;
    // Local socket listeners (if any others are needed in the future) can go here
    // patient-arrived is now handled globally in useAppointmentTracker
  }, [socket]);

  useEffect(() => {
    if (user && isApproved) {
      dispatch(fetchDoctorAppointments());
    }
  }, [user, isApproved, dispatch]);

  const getPatientName = (patientData: any) => {
    if (!patientData) return "Patient";
    if (patientData.profileId?.firstName) {
      return `${patientData.profileId.firstName} ${patientData.profileId.lastName || ''}`.trim();
    }
    if (patientData.googleName) return patientData.googleName;
    return "Patient";
  };

  const getPatientInitials = (patientData: any) => {
    const name = getPatientName(patientData);
    if (name === "Patient") return "PT";
    return name.substring(0, 2).toUpperCase();
  };


  useEffect(() => {
    if (user && !user.isProfileCompleted) {
      router.replace('/doctor/profile-update');
    }
  }, [user, router]);





  if (user && !user.isProfileCompleted) return null; // Prevent flash of dashboard






  return (
    <div className="flex flex-col flex-1 bg-slate-100 p-6 overflow-y-auto rounded-xl">

      {/* Pending Banner */}
      {isPending && (
        <div className="mb-8 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-3xl text-amber-600">
              <i className="fas fa-shield-check"></i>
            </div>

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-amber-900">
                  Credentials Under Review
                </h2>

                <span className="rounded-full bg-amber-200 px-4 py-1 text-xs font-bold uppercase text-amber-800">
                  Pending Approval
                </span>
              </div>

              <p className="mt-4 max-w-4xl leading-relaxed text-amber-800">
                Your medical council registration, identity proof,
                and verification documents are currently being
                reviewed by our compliance team.
              </p>

              <div className="mt-6">

                <div className="mb-2 flex justify-between text-sm text-amber-700">
                  <span>Verification Progress</span>
                  <span>Review In Progress</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-amber-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                </div>

              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-amber-700">
                <i className="fas fa-clock"></i>
                <span>Estimated review time: 24–48 hours</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">

          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
              <i className="fas fa-ban"></i>
            </div>

            <div>
              <h3 className="text-xl font-bold text-red-800">
                Application Rejected
              </h3>

              <p className="mt-2 text-red-700">
                Your application has been rejected by administration.
                Please contact support for more details.
              </p>
            </div>

          </div>
        </div>
      )}

      {isApproved ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, Dr. {user?.name || 'Smith'}! 👋
            </h1>

            <p className="mt-1 text-slate-500">
              Here's what's happening with your practice today
            </p>
          </div>

          {/* Top Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6">

            {/* Next Patient */}
            {(() => {
              const nextAppt = appointments.length > 0 ? appointments[0] : null;
              const apptStatus = nextAppt?.status || 'Upcoming';

              let cardBgClass = 'bg-gradient-to-r from-blue-500 to-blue-700';
              let textClass = 'text-blue-600';
              let lightTextClass = 'text-blue-100';
              let hoverClass = 'text-blue-700 hover:bg-slate-100';
              let badgeText = 'Up Next';
              let btnText = 'Start Consultation';
              let isPulsing = false;
              let pulseColor = 'bg-blue-400';
              let pulseDotColor = 'bg-blue-500';

              if (apptStatus === 'Time Reached') {
                cardBgClass = 'bg-gradient-to-r from-orange-500 to-orange-700';
                textClass = 'text-orange-600';
                lightTextClass = 'text-orange-100';
                hoverClass = 'text-orange-700 hover:bg-orange-50';
                badgeText = 'Time Reached';
                btnText = 'Join Call';
                isPulsing = true;
                pulseColor = 'bg-orange-400';
                pulseDotColor = 'bg-orange-500';
              } else if (apptStatus === 'Patient Joined') {
                cardBgClass = 'bg-gradient-to-r from-emerald-500 to-emerald-700';
                textClass = 'text-emerald-600';
                lightTextClass = 'text-emerald-100';
                hoverClass = 'text-emerald-700 hover:bg-emerald-50';
                badgeText = 'Patient Joined';
                btnText = 'Join Call (Patient Waiting)';
                isPulsing = true;
                pulseColor = 'bg-emerald-400';
                pulseDotColor = 'bg-emerald-500';
              } else if (apptStatus === 'Patient Disconnected') {
                cardBgClass = 'bg-gradient-to-r from-red-500 to-red-700';
                textClass = 'text-red-600';
                lightTextClass = 'text-red-100';
                hoverClass = 'text-red-700 hover:bg-red-50';
                badgeText = 'Patient Ended Call';
                btnText = 'Rejoin Call';
                isPulsing = false;
              }

              return (
                <div className={`rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between ${cardBgClass}`}>
                  <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      {isPulsing && <span className="relative flex h-2 w-2"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span><span className={`relative inline-flex rounded-full h-2 w-2 ${pulseDotColor}`}></span></span>}
                      {badgeText}
                    </div>

                    {nextAppt ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-5">
                          <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold uppercase ${textClass}`}>
                            {getPatientInitials(nextAppt.patientId)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold">
                              {getPatientName(nextAppt.patientId)}
                            </h3>
                            <p className={`mt-1 ${lightTextClass}`}>
                              <i className="fas fa-clock mr-2"></i>
                              {new Date(nextAppt.appointmentDate).toLocaleDateString()} at {nextAppt.appointmentTime}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <span className="inline-block rounded-lg bg-white/20 px-3 py-1 text-sm capitalize">
                                {nextAppt.consultationType} Consultation
                              </span>
                              <span className="inline-block rounded-lg bg-white/20 px-3 py-1 text-sm capitalize">
                                {nextAppt.patientType === 'NEW' ? 'New Consultation' : nextAppt.patientType === 'FOLLOW_UP' ? 'Follow-up' : 'Appointment'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Timer Display */}
                        {apptStatus === 'scheduled' && (
                          <div className="text-right hidden sm:block pr-4">
                            <p className={`text-sm ${lightTextClass} mb-1 uppercase tracking-wider font-bold`}>Starts In</p>
                            <div className="text-3xl font-mono font-bold tracking-tight" ref={timerRef}>
                              00:00:00
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-xl text-white/50">
                          <i className="fas fa-calendar-times"></i>
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white/80">No upcoming appointments</h3>
                          <p className={`mt-1 ${lightTextClass}`}>You're all caught up for now.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <button
                      disabled={!nextAppt}
                      onClick={() => nextAppt && router.push(`/doctor/consultation/${nextAppt._id}`)}
                      className={`flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${hoverClass}`}
                    >
                      {isPulsing && <span className="relative flex h-3 w-3"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span><span className={`relative inline-flex rounded-full h-3 w-3 ${pulseDotColor}`}></span></span>}
                      {btnText}
                    </button>
                    <button className="rounded-xl border border-white/40 px-5 py-2.5 transition hover:bg-white/10">
                      View History
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Attention Card - Temporarily removed for MVP */}
            {/* 
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">

            <h3 className="text-lg font-bold text-slate-800">
              Needs Your Attention
            </h3>

            <div className="mt-5 space-y-4">

              <div className="flex items-center gap-3 rounded-2xl border-l-4 border-red-500 bg-slate-50 p-4">
                <i className="fas fa-file-medical-alt text-indigo-600"></i>
                <span className="text-slate-700">
                  3 Lab results to review
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <i className="fas fa-prescription text-indigo-600"></i>
                <span className="text-slate-700">
                  2 Refill requests
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <i className="fas fa-comment-dots text-indigo-600"></i>
                <span className="text-slate-700">
                  5 Unread messages
                </span>
              </div>

            </div>
          </div>
          */}
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl text-indigo-600">
                <i className="fas fa-users"></i>
              </div>

              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Total Patients
              </p>

              <h2 className="mt-2 text-4xl font-bold text-slate-800">
                342
              </h2>

              <p className="mt-2 text-sm text-emerald-600">
                <i className="fas fa-arrow-up mr-1"></i>
                +12 this month
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-2xl text-pink-600">
                <i className="fas fa-calendar-check"></i>
              </div>

              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Appointments
              </p>

              <h2 className="mt-2 text-4xl font-bold text-slate-800">
                28
              </h2>

              <p className="mt-2 text-sm text-emerald-600">
                <i className="fas fa-arrow-up mr-1"></i>
                +5 vs last month
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600">
                <i className="fas fa-dollar-sign"></i>
              </div>

              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Earnings
              </p>

              <h2 className="mt-2 text-4xl font-bold text-slate-800">
                $2,840
              </h2>

              <p className="mt-2 text-sm text-emerald-600">
                <i className="fas fa-arrow-up mr-1"></i>
                +$340 vs last month
              </p>

            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-2xl text-yellow-600">
                <i className="fas fa-star"></i>
              </div>

              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Your Rating
              </p>

              <h2 className="mt-2 text-4xl font-bold text-slate-800">
                4.8
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                125 reviews
              </p>

            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* Appointments */}
            <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-md">

              <div className="mb-6 flex items-center justify-between">

                <h3 className="text-xl font-bold text-slate-800">
                  Upcoming Appointments
                </h3>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setAppointmentFilter('all')}
                    className={`text-xs px-3 py-1 font-bold rounded-md transition-colors ${appointmentFilter === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('video')}
                    className={`text-xs px-3 py-1 font-bold rounded-md transition-colors ${appointmentFilter === 'video' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('physical')}
                    className={`text-xs px-3 py-1 font-bold rounded-md transition-colors ${appointmentFilter === 'physical' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    In-Person
                  </button>
                </div>

                <Link
                  href="#"
                  className="hidden sm:block rounded-xl border border-slate-200 px-4 py-2 font-medium text-indigo-600 hover:bg-slate-100"
                >
                  View All
                </Link>

              </div>

              {loadingAppointments ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (() => {
                const filteredAppointments = appointments.filter(appt => appointmentFilter === 'all' || appt.consultationType === appointmentFilter);

                return filteredAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAppointments.slice(0, 5).map((appt) => (
                      <div key={appt._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                            {getPatientInitials(appt.patientId)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{getPatientName(appt.patientId)}</h4>
                            <p className="text-sm text-slate-500">
                              {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${appt.consultationType === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {appt.consultationType === 'video' ? 'Online' : 'In-Person'}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">₹{appt.fee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <i className="far fa-calendar-times text-slate-300 text-4xl mb-3"></i>
                    <p className="text-slate-500 font-medium">No upcoming appointments for this filter.</p>
                  </div>
                )
              })()}

            </div>

            {/* Reviews */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">

              <h3 className="mb-6 text-xl font-bold text-slate-800">
                Recent Reviews
              </h3>

            </div>

          </div>
        </>
      ) : (

        <>
          <div className="flex-1 w-full min-h-[220px] rounded-3xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center shadow-md flex flex-col items-center justify-center mb-6 shrink-0">
            <div className="  mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl text-slate-400">
              <i className={isRejected ? "fas fa-ban" : "fas fa-hourglass-half"}></i>
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              {isRejected ? "Access Denied" : "Waiting Room"}
            </h2>

            <p className="mt-3 max-w-md leading-relaxed text-slate-500">
              {isRejected
                ? "Your profile has been rejected. You cannot access dashboard features."
                : "Your dashboard will unlock automatically once your verification is approved."}
            </p></div>



        </>

      )}

    </div>
  );
}




