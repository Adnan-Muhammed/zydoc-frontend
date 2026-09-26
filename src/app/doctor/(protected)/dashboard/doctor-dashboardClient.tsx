// src/app/doctor/(protected)/dashboard/doctor-dashboardClient.tsx

'use client';

import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; 
import Link from 'next/link';
import { fetchDoctorAppointments } from '@/redux/features/appointment/appointmentThunk';
import { useSocket } from '@/hooks/useSocket';
import { getAppointmentStatusConfig, getAppointmentStartTimestamp, isAppointmentUpcomingOrActive } from '@/utils/appointmentStatus';
import {
  Users,
  CalendarCheck,
  Wallet,
  Star,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Hourglass,
  Ban,
  Lock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  ChevronRight,
  FileEdit,
  Activity,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import './doctor-dashboard.css';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const isPending =
    user?.verificationStatus === 'pending' ||
    (Boolean(user?.isProfileCompleted) && !user?.verificationStatus);

  const isRejected = user?.verificationStatus === 'rejected';

  const isApproved = user?.verificationStatus === 'approved';

  const dispatch = useAppDispatch();
  const { doctorAppointments: appointments, isLoading: loadingAppointments, waitingRoomPresence } = useAppSelector((state) => state.appointment);

  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'video' | 'physical'>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // 1-second live clock ticker to guarantee reactive slot transitions and countdown updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formatCountdown = (diffMs: number) => {
    if (diffMs <= 0) return "00:00:00";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diffMs / 1000 / 60) % 60);
    const s = Math.floor((diffMs / 1000) % 60);

    if (days > 0) {
      return `${days}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Get the socket instance
  const { socket } = useSocket({ userId: user?._id || user?.id, role: user?.role });

  useEffect(() => {
    if (!socket) return;
    // Local socket listeners if any
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

  // Rule 2 & 2.1: Handover prompt for next patient waiting live after 20s auto-cut
  const [patientBPrompt, setPatientBPrompt] = useState<{
    appointmentId: string;
    patientName: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const promptJoin = params.get('promptJoin');
    const patientBId = params.get('patientBId');
    const patientBName = params.get('patientBName');

    let storedPrompt: any = null;
    try {
      const stored = sessionStorage.getItem('pending_patient_b');
      if (stored) {
        storedPrompt = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to parse pending_patient_b from sessionStorage:", e);
    }

    if (promptJoin === 'true' || storedPrompt) {
      let targetId = (patientBId && patientBId !== 'unknown') ? patientBId : storedPrompt?.appointmentId;
      let targetName = patientBName || storedPrompt?.patientName;

      // Fallback: If targetId is missing or "unknown", match first active/upcoming online appointment
      if (!targetId || targetId === 'unknown') {
        const nextOnline = (appointments || []).find((a: any) => {
          const isOffline = a.consultationType === 'offline' || a.consultationType === 'physical';
          const status = (a.status || '').toLowerCase().trim();
          return !isOffline && (status === 'scheduled' || status === 'patient joined' || status === 'time reached');
        });
        if (nextOnline) {
          targetId = String(nextOnline._id);
          targetName = targetName || getPatientName(nextOnline.patientId);
        }
      }

      if (targetId && targetId !== 'unknown') {
        setPatientBPrompt({
          appointmentId: targetId,
          patientName: targetName || 'Patient B',
        });
      }
    }
  }, [appointments]);

  useEffect(() => {
    if (user && !user.isProfileCompleted) {
      router.replace('/doctor/profile-update');
    }
  }, [user, router]);

  if (user && !user.isProfileCompleted) return null; // Prevent flash of dashboard

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const doctorSpecialty = (user as any)?.specialty || (user as any)?.profileId?.specialization || 'Medical Specialist';

  return (
    <div className="doc-page flex flex-col flex-1 space-y-6 sm:space-y-8">

      {/* Pending Banner */}
      {isPending && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white p-6 sm:p-8 shadow-sm">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-200/20 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-6 lg:flex-row items-start">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 border border-amber-200/80 shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-950">
                  Credentials Under Review
                </h2>
                <span className="rounded-full bg-amber-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 border border-amber-300/50">
                  Pending Approval
                </span>
              </div>

              <p className="mt-2 max-w-4xl text-sm sm:text-base leading-relaxed text-amber-900/80">
                Your medical council registration, identity proof, and verification documents are currently being
                reviewed by our clinical compliance team.
              </p>

              <div className="mt-5 max-w-2xl">
                <div className="mb-2 flex justify-between text-xs sm:text-sm font-semibold text-amber-800">
                  <span>Verification Progress</span>
                  <span>Review In Progress (2/3 completed)</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-amber-200/60 p-0.5">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm font-medium text-amber-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Estimated verification turnaround: 24–48 hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-rose-950">
                  Profile Application Requires Revisions
                </h3>
                <span className="self-center sm:self-auto px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  Action Required
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Your profile submission was reviewed by our medical administration team. One or more documents or credential entries could not be verified and require your attention.
              </p>

              {/* Admin Feedback Box */}
              <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/70 text-left">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                  <FileEdit className="w-4 h-4 text-rose-600" />
                  <span>Administrator Feedback & Rejection Reason:</span>
                </div>
                <p className="mt-2 text-sm sm:text-base font-medium text-rose-950 whitespace-pre-wrap leading-relaxed">
                  {user?.rejectionReason || 'Please review your uploaded certificates and ensure all details match your medical credentials.'}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/doctor/complete-profile"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-sm shadow-rose-200 hover:shadow-md"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>Edit Profile / Resubmit Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-slate-500">
                  Updating your documents will automatically reset your application to <strong>Pending Review</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isApproved ? (
        <>
          {/* Rule 2 & 2.1: Urgent Patient B Handover Modal / Action Banner */}
          {patientBPrompt && (
            <div className="rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-0.5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-950/95 rounded-[22px] p-5 sm:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400 text-xl shadow-inner">
                    <span className="animate-pulse">⚡</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500/30 text-red-200 border border-red-500/40 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        Rule 2: Urgent Next Patient Waiting Live
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      Patient Waiting in Room: {patientBPrompt.patientName}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                      Consultation A was automatically ended and marked completed after the 20s auto-cut. Please enter <strong className="text-white">{patientBPrompt.patientName}</strong>&apos;s consultation room promptly. Per <strong className="text-amber-300">Rule 2.1</strong>, manual entry is required and delays are flagged as a Doctor&apos;s Issue.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = patientBPrompt.appointmentId;
                      if (typeof window !== 'undefined') {
                        sessionStorage.removeItem('pending_patient_b');
                        sessionStorage.removeItem(`consultation_exited_${targetId}`);
                        window.history.replaceState({}, '', window.location.pathname);
                      }
                      setPatientBPrompt(null);
                      router.push(`/doctor/consultation/${targetId}?join=true`);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join {patientBPrompt.patientName}&apos;s Room Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        sessionStorage.removeItem('pending_patient_b');
                        window.history.replaceState({}, '', window.location.pathname);
                      }
                      setPatientBPrompt(null);
                    }}
                    className="px-3 py-2 bg-white/10 hover:bg-white/15 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Welcome & Practice Overview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#101044] to-indigo-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md shadow-indigo-900/10 uppercase">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Physician
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                  <span className="text-xs font-medium text-slate-500 hidden sm:inline">{doctorSpecialty}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight mt-1">
                  Welcome, Dr. {user?.name || 'Doctor'}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Today is <span className="font-semibold text-slate-700">{todayFormatted}</span>. Here's your practice activity.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto pt-2 md:pt-0">
              <Link
                href="/doctor/appointments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition shadow-2xs"
              >
                <CalendarCheck className="w-4 h-4 text-[#101044]" />
                <span>My Appointments</span>
              </Link>
              <Link
                href="/doctor/schedule"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#101044] hover:bg-[#1a1a6b] text-white text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow-md"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Manage Schedule</span>
              </Link>
            </div>
          </div>

          {/* Up Next Patient Focus Card */}
          {(() => {
            const upcomingOrActive = (appointments || [])
              .filter((a: any) => isAppointmentUpcomingOrActive(a))
              .sort((a: any, b: any) => getAppointmentStartTimestamp(a) - getAppointmentStartTimestamp(b));

            const nextAppt = upcomingOrActive[0] || null;
            const apptStatus = (nextAppt?.status || 'Upcoming').toLowerCase();

            let cardBgClass = 'bg-gradient-to-br from-[#101044] via-[#16165a] to-[#1f1f72]';
            let textAccentClass = 'text-[#101044]';
            let lightTextClass = 'text-blue-100/90';
            let hoverClass = 'text-[#101044] hover:bg-white/90';
            let badgeText = 'Upcoming Consultation';
            let btnText = 'Start Consultation';
            let isPulsing = false;
            let pulseColor = 'bg-blue-400';
            let pulseDotColor = 'bg-blue-500';

            const isOffline = nextAppt?.consultationType === 'offline' || nextAppt?.consultationType === 'physical';
            const nowMs = currentTime;
            const startMs = nextAppt ? getAppointmentStartTimestamp(nextAppt) : 0;
            const tenMinsMs = 10 * 60 * 1000;
            const isWithin10Mins = Boolean(startMs > 0 && nowMs >= startMs - tenMinsMs);
            const isSlotLive = Boolean(nextAppt && startMs > 0 && nowMs >= startMs);
            const canJoinCall = isOffline ? false : (isSlotLive || isWithin10Mins || apptStatus === 'patient joined' || apptStatus === 'time reached');
            const isWaiting = nextAppt ? Boolean(waitingRoomPresence?.[nextAppt._id]) : false;

            if (nextAppt) {
              if (isOffline) {
                if (isSlotLive) {
                  cardBgClass = 'bg-gradient-to-br from-emerald-600 via-teal-700 to-[#101044]';
                  textAccentClass = 'text-emerald-700';
                  lightTextClass = 'text-emerald-100';
                  hoverClass = 'text-emerald-900 hover:bg-emerald-50';
                  badgeText = 'Patient Due / In Clinic';
                  btnText = 'Verify OTP & Complete';
                  isPulsing = true;
                  pulseColor = 'bg-emerald-400';
                  pulseDotColor = 'bg-emerald-500';
                } else {
                  cardBgClass = 'bg-gradient-to-br from-[#101044] via-indigo-950 to-slate-900';
                  textAccentClass = 'text-indigo-600';
                  lightTextClass = 'text-indigo-100/80';
                  hoverClass = 'text-[#101044] hover:bg-slate-100';
                  badgeText = 'Upcoming In-Person Visit';
                  btnText = 'View Appointment Details';
                  isPulsing = false;
                }
              } else if (isWaiting) {
                // Rule 1: Green when patient is actively live in waiting room
                cardBgClass = 'bg-gradient-to-br from-emerald-600 via-teal-700 to-[#101044]';
                textAccentClass = 'text-emerald-700';
                lightTextClass = 'text-emerald-100';
                hoverClass = 'text-emerald-900 hover:bg-emerald-50';
                badgeText = 'Patient Waiting in Room';
                btnText = 'Join Call (Patient Waiting)';
                isPulsing = true;
                pulseColor = 'bg-emerald-400';
                pulseDotColor = 'bg-emerald-500';
              } else if (isSlotLive || apptStatus === 'time reached') {
                // Rule 2: Orange when scheduled slot time reached
                cardBgClass = 'bg-gradient-to-br from-amber-500 via-orange-600 to-[#101044]';
                textAccentClass = 'text-amber-800';
                lightTextClass = 'text-amber-100';
                hoverClass = 'text-amber-900 hover:bg-amber-50';
                badgeText = 'Consultation Slot Live';
                btnText = 'Join Call (Live Now)';
                isPulsing = true;
                pulseColor = 'bg-orange-400';
                pulseDotColor = 'bg-orange-500';
              } else if (isWithin10Mins) {
                // Rule 3: Within 10m early join window
                cardBgClass = 'bg-gradient-to-br from-indigo-600 via-blue-700 to-[#101044]';
                textAccentClass = 'text-indigo-700';
                lightTextClass = 'text-indigo-100';
                hoverClass = 'text-indigo-900 hover:bg-indigo-50';
                badgeText = 'Starting Soon (10m Early Join)';
                btnText = 'Join Call Early';
                isPulsing = true;
                pulseColor = 'bg-indigo-400';
                pulseDotColor = 'bg-indigo-500';
              } else {
                // Scheduled in the future (>10m away)
                cardBgClass = 'bg-gradient-to-br from-[#101044] via-[#16165a] to-[#1f1f72]';
                textAccentClass = 'text-[#101044]';
                lightTextClass = 'text-blue-100/80';
                hoverClass = 'text-[#101044] hover:bg-slate-100';
                badgeText = 'Upcoming Online Consultation';
                btnText = 'Join Opens 10m Prior';
                isPulsing = false;
              }
            }

            return (
              <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col justify-between ${cardBgClass} transition-all duration-300`}>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                <div>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold uppercase tracking-wider border border-white/20">
                      {isPulsing && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseDotColor}`}></span>
                        </span>
                      )}
                      <span>{badgeText}</span>
                    </div>

                    {nextAppt && (
                      <div className="flex items-center gap-2 text-xs font-semibold bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white/90">
                        {isOffline ? (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>In-Clinic Visit</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>Video Consultation</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {nextAppt ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 w-full">
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className={`flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-2xl bg-white text-xl sm:text-2xl font-extrabold uppercase shadow-md ${textAccentClass}`}>
                          {getPatientInitials(nextAppt.patientId)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                              {getPatientName(nextAppt.patientId)}
                            </h3>
                            <span className="hidden sm:inline-block rounded-lg bg-white/15 px-2.5 py-0.5 text-xs font-medium capitalize">
                              {nextAppt.patientType === 'NEW' ? 'New Patient' : nextAppt.patientType === 'FOLLOW_UP' ? 'Follow-up' : 'Appointment'}
                            </span>
                          </div>

                          <p className={`mt-1.5 flex items-center gap-1.5 text-sm ${lightTextClass}`}>
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(nextAppt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {nextAppt.appointmentTime}
                            </span>
                          </p>

                          <div className="mt-2.5 flex flex-wrap gap-2 sm:hidden">
                            <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-xs capitalize">
                              {nextAppt.patientType === 'NEW' ? 'New Patient' : 'Follow-up'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timer Display */}
                      {!isSlotLive && startMs > nowMs && (
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:px-6 sm:py-3.5 shadow-inner">
                          <span className="text-[11px] uppercase tracking-wider font-bold text-white/80 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Starts In
                          </span>
                          <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight text-white mt-0.5">
                            {formatCountdown(startMs - nowMs)}
                          </span>
                        </div>
                      )}

                      {isSlotLive && (
                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                            </span>
                            {isOffline ? 'In-Clinic Slot Live' : 'Live Now'}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-5 py-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white/50 border border-white/10">
                        <Calendar className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white/90">No upcoming appointments scheduled</h3>
                        <p className={`mt-1 text-sm ${lightTextClass}`}>You're all caught up for now. Upcoming bookings will appear here automatically.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-white/15">
                  <button
                    disabled={!nextAppt || (!isOffline && !canJoinCall)}
                    title={
                      !nextAppt
                        ? undefined
                        : !isOffline && !canJoinCall
                        ? "You can only join the consultation up to 10 minutes before the scheduled time."
                        : undefined
                    }
                    onClick={() => {
                      if (nextAppt) {
                        if (isOffline) {
                          router.push('/doctor/appointments');
                          return;
                        }
                        if (!canJoinCall) {
                          return;
                        }
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem(`consultation_exited_${nextAppt._id}`);
                        }
                        router.push(`/doctor/consultation/${nextAppt._id}?join=true`);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition shadow-sm ${
                      !isOffline && !canJoinCall
                        ? 'bg-white/40 text-white/70 cursor-not-allowed border border-white/20'
                        : `bg-white ${hoverClass} hover:shadow-md cursor-pointer active:scale-98`
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {!isOffline && !canJoinCall ? (
                      <Lock className="w-4 h-4 opacity-75" />
                    ) : isPulsing ? (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pulseDotColor}`}></span>
                      </span>
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    <span>{btnText}</span>
                  </button>

                  <Link
                    href="/doctor/appointments"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold transition hover:bg-white/15 text-center text-white"
                  >
                    <span>{nextAppt ? 'View Appointment Details' : 'View Full Schedule'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })()}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6">
            {/* Metric 1: Total Patients */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/70 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  +12%
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Patients
                </p>
                <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#101044] tracking-tight">
                  342
                </h2>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Active patients under your care
                </p>
              </div>
            </div>

            {/* Metric 2: Appointments */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/70 group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  +5 vs last mo
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Appointments
                </p>
                <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#101044] tracking-tight">
                  {appointments ? appointments.length : 28}
                </h2>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Scheduled & completed consultations
                </p>
              </div>
            </div>

            {/* Metric 3: Earnings */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/70 group-hover:scale-105 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  +14%
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Practice Revenue
                </p>
                <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold text-[#101044] tracking-tight">
                  ₹2,840
                </h2>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Disbursed directly to your wallet
                </p>
              </div>
            </div>

            {/* Metric 4: Rating */}
            <div className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-100/70 group-hover:scale-105 transition-transform">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200/60">
                  Top 5% Rated
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Physician Rating
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101044] tracking-tight">
                    4.8
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Based on 125 patient reviews
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Upcoming Appointments & Practice Insights */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* Upcoming Appointments List */}
            <div className="xl:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-[#101044] tracking-tight">
                      Upcoming Consultations
                    </h3>
                    {appointments && appointments.length > 0 && (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
                        {appointments.filter(a => isAppointmentUpcomingOrActive(a)).length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Real-time schedule of your incoming patients
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
                    <button
                      onClick={() => setAppointmentFilter('all')}
                      className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                        appointmentFilter === 'all'
                          ? 'bg-white shadow-2xs text-[#101044]'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAppointmentFilter('video')}
                      className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                        appointmentFilter === 'video'
                          ? 'bg-white shadow-2xs text-blue-600'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Online</span>
                    </button>
                    <button
                      onClick={() => setAppointmentFilter('physical')}
                      className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                        appointmentFilter === 'physical'
                          ? 'bg-white shadow-2xs text-emerald-600'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>In-Person</span>
                    </button>
                  </div>

                  <Link
                    href="/doctor/appointments"
                    className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {loadingAppointments ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
                  <p className="mt-3 text-xs font-medium text-slate-400">Loading your schedule...</p>
                </div>
              ) : (() => {
                const filteredAppointments = (appointments || [])
                  .filter(appt => {
                    const matchesFilter = appointmentFilter === 'all' || appt.consultationType === appointmentFilter;
                    return matchesFilter && isAppointmentUpcomingOrActive(appt);
                  })
                  .sort((a, b) => getAppointmentStartTimestamp(a) - getAppointmentStartTimestamp(b));

                return filteredAppointments.length > 0 ? (
                  <div className="space-y-3.5">
                    {filteredAppointments.slice(0, 5).map((appt) => {
                      const isOnline = appt.consultationType === 'online' || appt.consultationType === 'video';
                      const st = getAppointmentStatusConfig(appt.status, 'doctor');

                      return (
                        <div
                          key={appt._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/20 transition-all gap-4 group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#101044]/5 text-[#101044] border border-[#101044]/10 flex items-center justify-center font-bold text-sm uppercase group-hover:bg-[#101044] group-hover:text-white transition-colors">
                              {getPatientInitials(appt.patientId)}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[#101044] text-base">
                                  {getPatientName(appt.patientId)}
                                </h4>
                                <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-medium capitalize">
                                  {appt.patientType === 'NEW' ? 'New' : 'Follow-up'}
                                </span>
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {appt.appointmentTime}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                isOnline
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              }`}>
                                {isOnline ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                                <span>{isOnline ? 'Online' : 'In-Person'}</span>
                              </span>

                              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${st.badgeClass}`}>
                                {st.label}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                              ₹{appt.fee}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">No appointments for this filter</h4>
                    <p className="text-xs text-slate-500 mt-1">There are no upcoming appointments scheduled under this category.</p>
                  </div>
                );
              })()}

              <div className="mt-5 pt-4 border-t border-slate-100 text-center sm:hidden">
                <Link
                  href="/doctor/appointments"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>View Full Appointment History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Practice Insights & Quick Clinic Status */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-[#101044] tracking-tight">
                      Practice Insights
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Live
                  </span>
                </div>

                {/* Rating Breakdown */}
                <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Rating</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-extrabold text-[#101044]">4.8</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      125 reviews
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs font-medium text-slate-600">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Consultation Quality</span>
                        <span className="font-bold text-[#101044]">98%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[98%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Patient Satisfaction</span>
                        <span className="font-bold text-[#101044]">96%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full w-[96%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability Status Card */}
                <div className="mt-5 rounded-2xl border border-slate-100 p-4 bg-white shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-[#101044]">Online & In-Clinic Bookings Active</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    Patients can book instant video consults and clinic visits based on your configured weekly slots.
                  </p>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  href="/doctor/schedule"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-[#101044] text-slate-700 hover:text-white border border-slate-200 hover:border-transparent text-xs sm:text-sm font-bold transition-all group"
                >
                  <Clock className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  <span>Configure Slot Timings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </>
      ) : (
        /* Fallback / Waiting Room State */
        <div className="flex-1 w-full min-h-[300px] rounded-3xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center my-auto">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200">
            {isRejected ? <Ban className="w-10 h-10 text-rose-500" /> : <Hourglass className="w-10 h-10 text-amber-500" />}
          </div>

          <h2 className="text-2xl font-bold text-[#101044]">
            {isRejected ? "Access Denied" : "Account Verification In Progress"}
          </h2>

          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-slate-500">
            {isRejected
              ? "Your physician profile application has been flagged for revisions. Please check the feedback banner above to update your credentials."
              : "Your doctor dashboard tools and live consultation rooms will unlock automatically as soon as your medical credentials are approved."}
          </p>
        </div>
      )}

    </div>
  );
}
