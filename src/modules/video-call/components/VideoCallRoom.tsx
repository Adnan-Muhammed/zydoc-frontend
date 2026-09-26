/**
 * VideoCallRoom.tsx
 *
 * Components Layer — src/modules/video-call/components/
 *
 * Layout:
 *  - Main container: Full height (100% of parent, no vertical scroll)
 *  - Left Section (flex-1): Video call stage with remote video, PiP local tile,
 *    and docked call controls at the bottom.
 *  - Right Section (350px): Consultation Sidebar with Chat, Prescriptions, and Files.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { cleanupConsultationState } from "@/redux/features/consultation/consultationSlice";
import { fetchDoctorAppointments, fetchAppointmentById } from "@/redux/features/appointment/appointmentThunk";
import { getAppointmentStartTimestamp, getAppointmentEndTimestamp } from "@/utils/appointmentStatus";
import { useWebRTC } from "../hooks/useWebRTC";
import { useCallTimer } from "../hooks/useCallTimer";
import { usePreventCallExit, rewindHistorySentinels } from "../hooks/usePreventCallExit";
import CallControls from "./CallControls";
import CallHeader from "./CallHeader";
import VideoStage from "./VideoStage";
import ConsultationSidebar from "./ConsultationSidebar";
import CallExitConfirmModal from "./CallExitConfirmModal";
import DuplicateTabFallback from "./DuplicateTabFallback";
import WaitingOverlay from "./WaitingOverlay";
import { WRAP_UP_COUNTDOWN_SECONDS, EARLY_START_MINUTES, EARLY_JOIN_MINUTES, MIN_CONSULTATION_DURATION_SECONDS } from "@/config/videoCallConfig";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoCallRoomProps {
  appointmentId: string;
  userId: string;
  role: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoCallRoom({
  appointmentId,
  userId,
  role,
}: VideoCallRoomProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const waitingNextPatientRef = useRef<{ appointmentId: string; } | null>(null);

  // Rigorous session unmount cleanup: wipe consultation state and appointment keys when leaving room
  useEffect(() => {
    return () => {
      console.log(`[VideoCallRoom] Unmounting room session for appointment: ${appointmentId}`);
      dispatch(cleanupConsultationState(appointmentId));
    };
  }, [appointmentId, dispatch]);

  // Sentinel count ref lets onCallEnded read the latest value without stale closure
  const sentinelCountRef = useRef(0);

  const onCallEnded = useCallback(() => {
    if (typeof window !== "undefined" && appointmentId) {
      sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
      sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
    }
    const dest = role?.toLowerCase() === "doctor"
      ? "/doctor/dashboard"
      : "/patient/appointments";
    // Rewind any sentinel pushState entries before navigating so that the
    // browser Back button goes to the correct previous page, not to "/".
    rewindHistorySentinels(sentinelCountRef.current).then(() => {
      router.replace(dest);
    });
  }, [role, appointmentId, router]);

  // Stable callback so useWebRTC can rewind history sentinels before any internal router.replace
  const rewindBeforeNavigate = useCallback(
    () => rewindHistorySentinels(sentinelCountRef.current),
    [] // sentinelCountRef is a ref — no dep needed
  );

  const {
    localVideoRef,
    remoteVideoRef,
    localStream,
    isRemoteReady,
    isCallEnded,
    error,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    endCall,
    cleanupMediaAndConnections,
    timerConfig,
    socket,
    isDuplicateTab,
    isTakenOver,
    requestTakeover,
    reclaimCall,
  } = useWebRTC({ appointmentId, userId, role, onCallEnded, rewindBeforeNavigate });

  const normalizedRole = role?.toLowerCase() || "";
  const defaultRedirectUrl =
    normalizedRole === "doctor"
      ? "/doctor/dashboard"
      : `/patient/appointments?appointmentId=${appointmentId}&reviewModal=true`;

  // ── Patient 1-Minute Mandatory Waiting & Lock State (Rule 2) ────────────────
  const [patientRoomElapsedSeconds, setPatientRoomElapsedSeconds] = useState<number>(0);
  const patientJoinedTimeRef = useRef<number>(Date.now());
  const [patientLockWarning, setPatientLockWarning] = useState<string | null>(null);

  useEffect(() => {
    if (normalizedRole !== "patient") return;
    patientJoinedTimeRef.current = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - patientJoinedTimeRef.current) / 1000);
      setPatientRoomElapsedSeconds(elapsed);
    }, 1000);
    return () => clearInterval(timer);
  }, [normalizedRole]);

  const canExit = useCallback(() => {
    if (normalizedRole === "patient" && patientRoomElapsedSeconds < 60) {
      return false;
    }
    return true;
  }, [normalizedRole, patientRoomElapsedSeconds]);

  const onExitBlocked = useCallback(() => {
    if (normalizedRole === "patient" && patientRoomElapsedSeconds < 60) {
      const remaining = 60 - patientRoomElapsedSeconds;
      setPatientLockWarning(
        `Mandatory Waiting Period: Please remain in the consultation room for at least 1 minute (${remaining}s remaining) while the doctor connects.`
      );
      setTimeout(() => setPatientLockWarning(null), 5000);
    }
  }, [normalizedRole, patientRoomElapsedSeconds]);

  const {
    isExitModalOpen,
    requestExit,
    cancelExit,
    confirmExit,
    sentinelCount,
  } = usePreventCallExit({
    isActive: !isCallEnded && !error && !isDuplicateTab && !isTakenOver,
    onLeaveCall: cleanupMediaAndConnections,
    onConfirmExit: endCall,
    defaultRedirectUrl,
    appointmentId,
    canExit,
    onExitBlocked,
  });

  // Keep ref in sync so onCallEnded (which is memoized) can always read the latest count
  useEffect(() => {
    sentinelCountRef.current = sentinelCount;
  }, [sentinelCount]);

  const {
    elapsedSeconds,
    remainingSeconds,
    phase,
    isWarningPhase,
    isExtended,
    isWrapUpPhase,
    shouldAutoDisconnect,
    formattedElapsed,
    formattedRemaining,
    startWrapUpCountdown,
    extendCall,
    triggerWrapUpPhase,
    isBaseTimeExceeded,
    handleExtensionGranted,
    handleExtensionDeadlineUpdated,
    isConstrainedByNextPatient,
    extensionDeadlineMs,
    maxExtensionMinutes,
  } = useCallTimer(timerConfig);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [nextPatientOnlineAlert, setNextPatientOnlineAlert] = useState<{ patientName: string } | null>(null);
  const [wrapUpReason, setWrapUpReason] = useState<string | null>(null);
  const [waitingNextPatient, setWaitingNextPatient] = useState<{
    appointmentId: string;
    patientName?: string;
    patientType?: string;
    appointmentTime?: string;
  } | null>(null);

  const { doctorAppointments, currentAppointment } = useAppSelector((state) => state.appointment);
  const [dismissedOfflineAlertIds, setDismissedOfflineAlertIds] = useState<string[]>([]);
  const [callCurrentTime, setCallCurrentTime] = useState<number>(Date.now());
  const [doctorAbsenceWarning, setDoctorAbsenceWarning] = useState<{ message: string; lateJoinCutoffAt?: string } | null>(null);
  const [isDoctorMissed, setIsDoctorMissed] = useState<{ message: string } | null>(null);
  
  // Track strictly continuous overlap time (Rule 2)
  const [continuousOverlapSeconds, setContinuousOverlapSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRemoteReady) {
      interval = setInterval(() => {
        setContinuousOverlapSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setContinuousOverlapSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRemoteReady]);

  useEffect(() => {
    if (appointmentId && (!currentAppointment || currentAppointment._id !== appointmentId)) {
      dispatch(fetchAppointmentById(appointmentId));
    }
  }, [appointmentId, currentAppointment, dispatch]);

  // Appointment timing calculations for Waiting Overlay
  const scheduledStartMs = React.useMemo(() => {
    if (currentAppointment?.scheduledStartAt) {
      const t = new Date(currentAppointment.scheduledStartAt).getTime();
      if (!isNaN(t)) return t;
    }
    if (currentAppointment?.appointmentDate && currentAppointment?.appointmentTime) {
      const appDate = new Date(currentAppointment.appointmentDate);
      const [timePart, modifier] = (currentAppointment.appointmentTime || "").trim().split(/\s+/);
      let [hours, minutes] = (timePart || "").split(":").map(Number);
      if (modifier?.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;
      return new Date(
        appDate.getFullYear(),
        appDate.getMonth(),
        appDate.getDate(),
        hours || 0,
        minutes || 0,
        0
      ).getTime();
    }
    return 0;
  }, [currentAppointment]);

  const earlyStartMs = scheduledStartMs > 0 ? scheduledStartMs - EARLY_START_MINUTES * 60 * 1000 : 0;

  const earlyStartTimeStr = React.useMemo(() => {
    if (earlyStartMs > 0) {
      return new Date(earlyStartMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return "";
  }, [earlyStartMs]);

  const scheduledStartTimeStr = React.useMemo(() => {
    if (scheduledStartMs > 0) {
      return new Date(scheduledStartMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (currentAppointment?.appointmentTime) {
      return currentAppointment.appointmentTime;
    }
    return "";
  }, [scheduledStartMs, currentAppointment]);

  const doctorDisplayName = React.useMemo(() => {
    const doc = currentAppointment?.doctorId;
    if (doc?.firstName) {
      return `Dr. ${doc.firstName} ${doc.lastName || ''}`.trim();
    }
    if (currentAppointment?.doctor?.name) {
      return `Dr. ${currentAppointment.doctor.name}`.trim();
    }
    return "the doctor";
  }, [currentAppointment]);

  const isBeforeEarlyStart = earlyStartMs > 0 && callCurrentTime < earlyStartMs;
  const isEarlyStartWindow = earlyStartMs > 0 && callCurrentTime >= earlyStartMs && scheduledStartMs > 0 && callCurrentTime < scheduledStartMs;
  const isPastScheduledStart = scheduledStartMs > 0 && callCurrentTime >= scheduledStartMs;

  const secondsUntilEarlyStart = isBeforeEarlyStart ? Math.max(0, Math.floor((earlyStartMs - callCurrentTime) / 1000)) : 0;
  const formattedCountdownToEarlyStart = React.useMemo(() => {
    const mins = Math.floor(secondsUntilEarlyStart / 60);
    const secs = secondsUntilEarlyStart % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [secondsUntilEarlyStart]);

  useEffect(() => {
    waitingNextPatientRef.current = waitingNextPatient;
  }, [waitingNextPatient]);

  // Timer is visible to both doctor and patient
  const isTimerVisible = true;

  const [redirectCountdown, setRedirectCountdown] = useState(2);

  const handleExitCompletedConsultation = useCallback(() => {
    if (typeof window !== "undefined" && appointmentId) {
      sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
      sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
    }
    const destination = normalizedRole === "doctor" ? "/doctor/dashboard" : "/patient/appointments";
    router.replace(destination);
  }, [appointmentId, normalizedRole, router]);

  useEffect(() => {
    if (!isCallEnded) return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExitCompletedConsultation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCallEnded, handleExitCompletedConsultation]);

  // We no longer periodically refresh callCurrentTime.
  // It is now strictly updated via socket events or when specific time-based hooks recalculate.

  // Fetch doctor appointments on mount if doctor role
  useEffect(() => {
    if (normalizedRole === "doctor") {
      dispatch(fetchDoctorAppointments());
    }
  }, [normalizedRole, dispatch]);

  const getPatientDisplayName = (patientData: any) => {
    if (!patientData) return "Patient";
    if (patientData.profileId?.firstName) {
      return `${patientData.profileId.firstName} ${patientData.profileId.lastName || ""}`.trim();
    }
    if (patientData.name) return patientData.name;
    if (patientData.googleName) return patientData.googleName;
    return "Patient";
  };

  // The offline appointment is now provided dynamically by the backend during extension requests
  // or real-time booking alerts, preventing unnecessary polling.
  const [upcomingOfflineAppointment, setUpcomingOfflineAppointment] = useState<any>(null);

  // When a new booking arrives, the socket triggers fetchDoctorAppointments,
  // which updates the store. We evaluate it here once without polling.
  useEffect(() => {
    if (normalizedRole !== "doctor" || !doctorAppointments?.length) return;
    const now = Date.now();
    const offlineApp = doctorAppointments
      .filter((a: any) => {
        const isOffline = a.consultationType === "offline" || a.consultationType === "physical";
        const status = (a.status || "").toLowerCase().trim();
        if (!isOffline || status !== "scheduled") return false;
        if (dismissedOfflineAlertIds.includes(String(a._id))) return false;

        const startMs = getAppointmentStartTimestamp(a);
        const endMs = getAppointmentEndTimestamp(a);
        if (!startMs || !endMs) return false;

        return (startMs - now <= 10 * 60 * 1000) && (now <= endMs);
      })
      .sort((a: any, b: any) => getAppointmentStartTimestamp(a) - getAppointmentStartTimestamp(b))[0];

    if (offlineApp) {
      setUpcomingOfflineAppointment(offlineApp);
    }
  }, [doctorAppointments, dismissedOfflineAlertIds, normalizedRole]);

  // Doctor popup at the end of primary time (if not yet extended)
  const showExtensionPopup = normalizedRole === "doctor" && phase === "Extension" && !isExtended;

  // ── Auto Disconnect Logic ─────────────────────────────────────────────────
  useEffect(() => {
    if (shouldAutoDisconnect) {
      console.log("[VideoCallRoom] Time limit reached or wrap-up completed. Auto-disconnecting...");
      endCall();
    }
  }, [shouldAutoDisconnect, endCall]);

  // Auto-trigger wrap-up countdown based on patient arrival is REMOVED.
  // The system now exclusively relies on exact slot timing in useCallTimer.

  // ── Socket Listener for Scenario 3 (Urgent Slot Booked) & Overtime Patient Arrival ──
  useEffect(() => {
    if (!socket) return;

    const handleUrgentSlot = () => {
      console.log("[VideoCallRoom] Urgent slot booked! Triggering wrap-up countdown.");
      startWrapUpCountdown();
    };

    const handlePatientArrived = (payload: any) => {
      // Check if this is for the NEXT patient (different appointmentId)
      const isNextPatient = !payload?.appointmentId || payload.appointmentId !== appointmentId;
      if (isNextPatient) {
        console.log("[VideoCallRoom] Next patient arrived in waiting room:", payload);
        const nextPatientData = {
          appointmentId: payload?.appointmentId || "unknown",
          patientName: payload?.patientName || "Next Patient",
          patientType: payload?.patientType,
          appointmentTime: payload?.appointmentTime,
        };
        setWaitingNextPatient(nextPatientData);
      }
    };

    // Offline→Online: alert the doctor that their next online patient has arrived
    const handleNextPatientOnline = (payload: any) => {
      console.log("[VideoCallRoom] next_patient_joining_online received:", payload);
      setNextPatientOnlineAlert({ patientName: payload?.patientName || "A patient" });
      // Auto-clear after 60 seconds
      setTimeout(() => setNextPatientOnlineAlert(null), 60 * 1000);
    };

    const handleWrapUpWarning = (payload: any) => {
      console.log("[VideoCallRoom] server_wrap_up_warning received:", payload);
      const reason = payload?.reason || (payload?.isNextPatientWaiting ? 'next_patient_waiting' : 'max_extension_reached');
      setWrapUpReason(reason);
      if (payload?.patientName) {
        setWaitingNextPatient((prev) => ({
          appointmentId: payload?.appointmentId || prev?.appointmentId || "unknown",
          patientName: payload?.patientName || prev?.patientName || "Next Patient",
          patientType: payload?.patientType || prev?.patientType,
          appointmentTime: payload?.appointmentTime || prev?.appointmentTime,
        }));
      }
      triggerWrapUpPhase(payload?.remainingSeconds ?? WRAP_UP_COUNTDOWN_SECONDS);
    };

    // ── Extension Event Handlers ───────────────────────────────────────────
    // Wire server events to useCallTimer handlers
    const handleExtensionGrantedEvent = (payload: any) => {
      console.log("[VideoCallRoom] extension_granted received:", payload);
      handleExtensionGranted(payload);
      if (payload?.upcomingOfflineAppointment) {
        setUpcomingOfflineAppointment(payload.upcomingOfflineAppointment);
      }
    };

    const handleExtensionDeadlineUpdatedEvent = (payload: any) => {
      console.log("[VideoCallRoom] extension_deadline_updated received:", payload);
      handleExtensionDeadlineUpdated(payload);
    };

    const handleExtensionDenied = (payload: any) => {
      console.warn("[VideoCallRoom] Extension denied:", payload?.message);
    };

    const handleNewBooking = () => {
      if (normalizedRole === "doctor") {
        dispatch(fetchDoctorAppointments());
      }
    };

    const handleDoctorAbsenceWarning = (payload: any) => {
      console.warn("[VideoCallRoom] doctor_absence_warning received:", payload);
      setDoctorAbsenceWarning(payload);
    };

    const handleDoctorMissed = (payload: any) => {
      console.warn("[VideoCallRoom] doctor_missed received:", payload);
      setIsDoctorMissed(payload);
      cleanupMediaAndConnections();
    };

    socket.on("urgent-slot-booked", handleUrgentSlot);
    socket.on("patient-arrived", handlePatientArrived);
    socket.on("next_patient_joining_online", handleNextPatientOnline);
    socket.on("server_wrap_up_warning", handleWrapUpWarning);
    socket.on("extension_granted", handleExtensionGrantedEvent);
    socket.on("extension_deadline_updated", handleExtensionDeadlineUpdatedEvent);
    socket.on("extension_denied", handleExtensionDenied);
    socket.on("new_booking", handleNewBooking);
    socket.on("doctor_absence_warning", handleDoctorAbsenceWarning);
    socket.on("doctor_missed", handleDoctorMissed);

    return () => {
      socket.off("urgent-slot-booked", handleUrgentSlot);
      socket.off("patient-arrived", handlePatientArrived);
      socket.off("next_patient_joining_online", handleNextPatientOnline);
      socket.off("server_wrap_up_warning", handleWrapUpWarning);
      socket.off("extension_granted", handleExtensionGrantedEvent);
      socket.off("extension_deadline_updated", handleExtensionDeadlineUpdatedEvent);
      socket.off("extension_denied", handleExtensionDenied);
      socket.off("new_booking", handleNewBooking);
      socket.off("doctor_absence_warning", handleDoctorAbsenceWarning);
      socket.off("doctor_missed", handleDoctorMissed);
    };
  }, [socket, startWrapUpCountdown, phase, isExtended, appointmentId, handleExtensionGranted, handleExtensionDeadlineUpdated, normalizedRole, dispatch, cleanupMediaAndConnections]);

  // ── Multi-Tab Fallback States ─────────────────────────────────────────────
  if (isDuplicateTab) {
    return (
      <DuplicateTabFallback
        mode="duplicate"
        role={role}
        onTakeover={requestTakeover}
      />
    );
  }

  if (isTakenOver) {
    return (
      <DuplicateTabFallback
        mode="taken_over"
        role={role}
        onReclaim={reclaimCall}
      />
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] p-6">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 max-w-md text-center">
          <span className="text-4xl">📵</span>
          <p className="text-rose-300 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => {
              const destination = normalizedRole === "doctor" ? "/doctor/appointments" : "/patient/appointments";
              router.replace(destination);
            }}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Return to Appointments
          </button>
        </div>
      </div>
    );
  }


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-row overflow-hidden bg-[#090d16] relative select-none">
      {/* ── Left Section: Video Stage (Flex-1) ───────────────────────────────── */}
      <div
        className="flex-1 h-full min-w-0 relative overflow-hidden bg-black"
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {/* VideoStage replaces both the main Remote Video and local PiP */}
        <VideoStage
          remoteVideoRef={remoteVideoRef}
          localVideoRef={localVideoRef}
          localStream={localStream}
        />

        {/* Waiting overlay — shown until the remote peer connects */}
        {!isRemoteReady && !isCallEnded && (
          <WaitingOverlay
            normalizedRole={normalizedRole}
            doctorDisplayName={doctorDisplayName}
            earlyStartTimeStr={earlyStartTimeStr}
            scheduledStartTimeStr={scheduledStartTimeStr}
            patientRoomElapsedSeconds={patientRoomElapsedSeconds}
            doctorAbsenceWarning={doctorAbsenceWarning}
            isBeforeEarlyStart={isBeforeEarlyStart}
            formattedCountdownToEarlyStart={formattedCountdownToEarlyStart}
            isEarlyStartWindow={isEarlyStartWindow}
            isPastScheduledStart={isPastScheduledStart}
          />
        )}

        {/* Call Ended / Consultation Completed Overlay */}
        {isCallEnded && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-md z-50 p-4"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          >
            <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-black/80 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              {/* Green Tick Icon with glowing emerald ring */}
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 text-3xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4">
                ✓
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Consultation Completed
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm mt-2 mb-6 leading-relaxed max-w-xs">
                {normalizedRole === "doctor"
                  ? "Consultation session has been concluded. Records and prescriptions have been saved."
                  : "Your consultation has ended successfully. Prescriptions, clinical notes, and session details are available in your appointments."}
              </p>

              {/* Primary Navigation Button */}
              <button
                onClick={handleExitCompletedConsultation}
                className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/50"
              >
                <span>{normalizedRole === "doctor" ? "Back to Dashboard" : "Go to Appointments"}</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </button>

              {/* Auto-redirect countdown */}
              <p className="text-[11px] text-slate-500 mt-4">
                Auto-redirecting in {redirectCountdown}s...
              </p>
            </div>
          </div>
        )}

        {/* Doctor Missed Consultation Overlay */}
        {isDoctorMissed && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-md z-50 p-4"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          >
            <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-black/80 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 text-3xl shadow-[0_0_30px_rgba(244,63,94,0.3)] mb-4">
                <i className="fas fa-user-xmark"></i>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Doctor Missed Consultation
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm mt-2 mb-6 leading-relaxed max-w-xs">
                {isDoctorMissed.message || "The doctor did not attend the scheduled consultation. A full refund has been credited to your wallet."}
              </p>

              <button
                onClick={() => router.replace("/patient/appointments")}
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/50"
              >
                <span>Return to Appointments</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        )}

        {/* ── Call Controls (Fixed / Docked at Bottom Center of Video) ─────── */}
        <CallControls
          isAudioMuted={!isAudioEnabled}
          isVideoOff={!isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          isDoctor={normalizedRole === "doctor"}
          elapsedSeconds={continuousOverlapSeconds}
          minDurationSeconds={timerConfig ? MIN_CONSULTATION_DURATION_SECONDS : 0}
          isPatient={normalizedRole === "patient"}
          patientRoomElapsedSeconds={patientRoomElapsedSeconds}
          minPatientWaitSeconds={60}
          onEndCall={() => {
            // Guard: doctor cannot open End Call modal until 3-minute strictly continuous overlap elapses.
            // Server enforces this too (EndRoomUseCase), but we also block the UI modal
            // here so the doctor gets clear feedback without a server round-trip rejection.
            if (normalizedRole === "doctor" && timerConfig && continuousOverlapSeconds < MIN_CONSULTATION_DURATION_SECONDS) {
              return; // Button is already visually locked — do nothing
            }
            // Guard: patient cannot open Leave modal during mandatory 1-minute waiting period (Rule 2)
            if (normalizedRole === "patient" && patientRoomElapsedSeconds < 60) {
              onExitBlocked();
              return;
            }
            requestExit();
          }}
        />

        {/* ── Top Bar Overlay Elements & Floating Alerts ─────────────────────────────── */}
        <CallHeader
          isTimerVisible={isTimerVisible}
          isWrapUpPhase={isWrapUpPhase}
          isBaseTimeExceeded={isBaseTimeExceeded}
          baseDurationMinutes={timerConfig?.baseDurationMinutes}
          formattedRemaining={formattedRemaining}
          formattedElapsed={formattedElapsed}
          isExtended={isExtended}
          normalizedRole={normalizedRole}
          onExtendCall={() => {
            extendCall();
            if (socket) socket.emit('extend_call', { appointmentId });
          }}
          maxExtensionMinutes={maxExtensionMinutes}
          phase={phase}
          remainingSeconds={remainingSeconds}
          isConstrainedByNextPatient={isConstrainedByNextPatient}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          wrapUpReason={wrapUpReason}
          waitingNextPatient={waitingNextPatient}
          upcomingOfflineAppointment={upcomingOfflineAppointment}
          callCurrentTime={callCurrentTime}
          setDismissedOfflineAlertIds={setDismissedOfflineAlertIds}
          nextPatientOnlineAlert={nextPatientOnlineAlert}
          setNextPatientOnlineAlert={setNextPatientOnlineAlert}
          patientLockWarning={patientLockWarning}
          setPatientLockWarning={setPatientLockWarning}
        />

      </div>

      {/* ── Right Section: Consultation Sidebar ────────── */}
      <ConsultationSidebar
        appointmentId={appointmentId}
        userId={userId}
        role={role}
        socket={socket}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* ── Call Exit Confirmation Modal ────────────────────────────────────── */}
      <CallExitConfirmModal
        isOpen={isExitModalOpen}
        role={role}
        onCancel={cancelExit}
        onConfirm={confirmExit}
      />
    </div>
  );
}
