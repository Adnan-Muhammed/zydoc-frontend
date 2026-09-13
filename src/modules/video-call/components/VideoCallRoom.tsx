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
import { fetchDoctorAppointments } from "@/redux/features/appointment/appointmentThunk";
import { getAppointmentStartTimestamp, getAppointmentEndTimestamp } from "@/utils/appointmentStatus";
import { useWebRTC } from "../hooks/useWebRTC";
import { useCallTimer } from "../hooks/useCallTimer";
import { usePreventCallExit } from "../hooks/usePreventCallExit";
import CallControls from "./CallControls";
import ConsultationSidebar from "./ConsultationSidebar";
import CallExitConfirmModal from "./CallExitConfirmModal";
import DuplicateTabFallback from "./DuplicateTabFallback";

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

  const onCallEnded = useCallback(() => {
    if (typeof window !== "undefined" && appointmentId) {
      sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
      sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
    }
    const dest = role?.toLowerCase() === "doctor" 
      ? "/doctor/dashboard" 
      : "/patient/appointments";
    router.replace(dest);
  }, [role, appointmentId, router]);

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
  } = useWebRTC({ appointmentId, userId, role, onCallEnded });

  const defaultRedirectUrl =
    role?.toLowerCase() === "doctor"
      ? "/doctor/dashboard"
      : `/patient/appointments?appointmentId=${appointmentId}&reviewModal=true`;

  const {
    isExitModalOpen,
    requestExit,
    cancelExit,
    confirmExit,
  } = usePreventCallExit({
    isActive: !isCallEnded && !error && !isDuplicateTab && !isTakenOver,
    onLeaveCall: cleanupMediaAndConnections,
    onConfirmExit: endCall,
    defaultRedirectUrl,
    appointmentId,
  });

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
  const [waitingNextPatient, setWaitingNextPatient] = useState<{
    appointmentId: string;
    patientName?: string;
    patientType?: string;
    appointmentTime?: string;
  } | null>(null);

  const { doctorAppointments } = useAppSelector((state) => state.appointment);
  const [dismissedOfflineAlertIds, setDismissedOfflineAlertIds] = useState<string[]>([]);
  const [callCurrentTime, setCallCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    waitingNextPatientRef.current = waitingNextPatient;
  }, [waitingNextPatient]);

  const normalizedRole = role?.toLowerCase() || "";
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

  // Periodically refresh current time to detect upcoming appointments entering the 10-minute window
  useEffect(() => {
    const timer = setInterval(() => {
      setCallCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

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

  // Find nearest upcoming offline appointment within the next 10 minutes (or due now) that hasn't been manually dismissed
  const upcomingOfflineAppointment = normalizedRole === "doctor"
    ? (doctorAppointments || [])
        .filter((a: any) => {
          const isOffline = a.consultationType === "offline" || a.consultationType === "physical";
          const status = (a.status || "").toLowerCase().trim();
          if (!isOffline || status !== "scheduled") return false;
          if (dismissedOfflineAlertIds.includes(String(a._id))) return false;

          const startMs = getAppointmentStartTimestamp(a);
          const endMs = getAppointmentEndTimestamp(a);
          if (!startMs || !endMs) return false;

          // Coming up within the next 10 minutes (<= 10 mins) or actively due now in clinic
          return (startMs - callCurrentTime <= 10 * 60 * 1000) && (callCurrentTime <= endMs);
        })
        .sort((a: any, b: any) => getAppointmentStartTimestamp(a) - getAppointmentStartTimestamp(b))[0] || null
    : null;

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
      triggerWrapUpPhase(payload?.remainingSeconds || 60);
    };

    // ── Extension Event Handlers ───────────────────────────────────────────
    // Wire server events to useCallTimer handlers
    const handleExtensionGrantedEvent = (payload: any) => {
      console.log("[VideoCallRoom] extension_granted received:", payload);
      handleExtensionGranted(payload);
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

    socket.on("urgent-slot-booked", handleUrgentSlot);
    socket.on("patient-arrived", handlePatientArrived);
    socket.on("next_patient_joining_online", handleNextPatientOnline);
    socket.on("server_wrap_up_warning", handleWrapUpWarning);
    socket.on("extension_granted", handleExtensionGrantedEvent);
    socket.on("extension_deadline_updated", handleExtensionDeadlineUpdatedEvent);
    socket.on("extension_denied", handleExtensionDenied);
    socket.on("new_booking", handleNewBooking);

    return () => {
      socket.off("urgent-slot-booked", handleUrgentSlot);
      socket.off("patient-arrived", handlePatientArrived);
      socket.off("next_patient_joining_online", handleNextPatientOnline);
      socket.off("server_wrap_up_warning", handleWrapUpWarning);
      socket.off("extension_granted", handleExtensionGrantedEvent);
      socket.off("extension_deadline_updated", handleExtensionDeadlineUpdatedEvent);
      socket.off("extension_denied", handleExtensionDenied);
      socket.off("new_booking", handleNewBooking);
    };
  }, [socket, startWrapUpCountdown, phase, isExtended, appointmentId, handleExtensionGranted, handleExtensionDeadlineUpdated, normalizedRole, dispatch]);

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
        {/* ── Remote Video (fills available video area) ────────────────────── */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover block bg-black"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          aria-label="Remote participant video"
        />

        {/* Waiting overlay — shown until the remote peer connects */}
        {!isRemoteReady && !isCallEnded && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-radial from-slate-900/95 to-black/98 z-10"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400/60 animate-pulse flex items-center justify-center">
                <i className="fas fa-video text-indigo-400 text-xl"></i>
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium tracking-wide">
                  Waiting for the other participant…
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  The consultation will connect automatically once both join.
                </p>
              </div>
            </div>
          </div>
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

        {/* ── Front Camera View (Local PiP — floating in bottom-right corner) ── */}
        <div 
          className="absolute bottom-[80px] right-3 sm:bottom-5 sm:right-5 w-[115px] h-[150px] sm:w-[220px] sm:h-[165px] md:w-[240px] md:h-[180px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.6)] border-2 border-white/30 z-30 bg-slate-900 transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 ring-1 ring-black/40"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover block -scale-x-100 transition-opacity duration-300 ${
              localStream ? "opacity-100" : "opacity-0"
            }`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: 'block',
            }}
            aria-label="Your local video"
          />
          {!localStream && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white/40 gap-1 p-2"
            >
              <i className="fas fa-video-slash text-base sm:text-xl"></i>
              <span className="text-[9px] sm:text-[10px] text-slate-400">Camera Off</span>
            </div>
          )}
          <div 
            className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] text-white/90 font-medium flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>You</span>
          </div>
        </div>

        {/* ── Call Controls (Fixed / Docked at Bottom Center of Video) ─────── */}
        <CallControls
          isAudioMuted={!isAudioEnabled}
          isVideoOff={!isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onEndCall={() => requestExit()}
        />

        {/* ── Top Bar Overlay Elements ─────────────────────────────────────── */}
        <div 
          className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between z-30 pointer-events-none"
          style={{ position: 'absolute', zIndex: 30, pointerEvents: 'none' }}
        >
          {/* Status & Timer Container */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto" style={{ pointerEvents: 'auto' }}>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="hidden xs:inline sm:inline">Live Consultation</span>
              <span className="xs:hidden sm:hidden">Live</span>
            </div>

            {isTimerVisible && (
              <div className={`
                backdrop-blur-md border border-white/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl flex flex-col transition-colors
                ${isWrapUpPhase ? 'bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 
                  isBaseTimeExceeded ? 'bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-slate-900/60'}
              `}>
                <div className="flex justify-between items-end gap-2 sm:gap-4">
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    {isWrapUpPhase ? "Wrap-Up" : isBaseTimeExceeded ? "Overtime" : "Time"}
                  </span>
                  {(!isWrapUpPhase && timerConfig?.baseDurationMinutes) && (
                    <span className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:inline">
                      Base: {timerConfig.baseDurationMinutes}m
                    </span>
                  )}
                </div>
                <div className={`font-mono font-medium tracking-tight text-xs sm:text-base ${
                  isWrapUpPhase ? 'text-rose-400 animate-pulse' : 
                  isBaseTimeExceeded ? 'text-amber-400' : 'text-slate-100'
                }`}>
                  {isWrapUpPhase ? formattedRemaining : formattedElapsed}
                </div>
              </div>
            )}

            {isBaseTimeExceeded && !isExtended && normalizedRole === "doctor" && !isWrapUpPhase && (
              <button 
                onClick={() => {
                  extendCall();
                  if (socket) socket.emit('extend_call', { appointmentId });
                }}
                className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-slate-900 px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                <i className="fas fa-plus text-[10px]"></i>
                <span>+{maxExtensionMinutes}m</span>
              </button>
            )}

            {/* Extension Countdown — shown when doctor has extended and server provided deadline */}
            {isExtended && phase === 'Extension' && remainingSeconds > 0 && normalizedRole === 'doctor' && !isWrapUpPhase && (
              <div className={`backdrop-blur-md border px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
                isConstrainedByNextPatient 
                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-300' 
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              }`}>
                {isConstrainedByNextPatient && <span>⚠️</span>}
                <span>Ext: {formattedRemaining}</span>
                {isConstrainedByNextPatient && <span className="text-[9px] text-orange-400 hidden sm:inline">(next patient)</span>}
              </div>
            )}
          </div>

          {/* Toggle Right Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Collapse Panel" : "Open Panel"}
            className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-indigo-600 hover:border-indigo-500 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-all shadow-lg shrink-0"
          >
            <i className={`fas ${isSidebarOpen ? "fa-columns" : "fa-sidebar"}`}></i>
            <span className="hidden sm:inline">{isSidebarOpen ? "Hide Panel" : "Show Panel"}</span>
          </button>
        </div>

        {/* ── Wrap-Up Alert (Emergency forced countdown — DOCTOR ONLY) ───────── */}
        {isWrapUpPhase && normalizedRole === 'doctor' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-2xl animate-pulse text-center text-xs sm:text-sm max-w-sm w-full mx-4">
            Next patient is waiting.<br />Consultation will auto-disconnect in {remainingSeconds}s
          </div>
        )}

        {/* ── Compact Single-Line In-Call Offline Appointment Warning Banner ───────── */}
        {upcomingOfflineAppointment && normalizedRole === 'doctor' && (
          <div className="absolute top-16 sm:top-18 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-md w-full px-2 pointer-events-auto">
            <div className="bg-gradient-to-r from-amber-600/95 to-orange-600/95 backdrop-blur-md text-white py-1.5 px-3 rounded-full font-medium shadow-xl border border-amber-300/40 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-sm shrink-0">🏥</span>
                <span className="font-bold shrink-0 text-amber-200 uppercase text-[10px] sm:text-[11px] tracking-wide">
                  In-Person:
                </span>
                <span className="font-semibold text-white truncate text-[11px] sm:text-xs">
                  {getPatientDisplayName(upcomingOfflineAppointment.patientId)} ({upcomingOfflineAppointment.appointmentTime || "Clinic"})
                </span>
                <span className="shrink-0 text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold text-amber-100">
                  {getAppointmentStartTimestamp(upcomingOfflineAppointment) > callCurrentTime
                    ? `~${Math.max(1, Math.ceil((getAppointmentStartTimestamp(upcomingOfflineAppointment) - callCurrentTime) / 60000))}m`
                    : "Due Now"}
                </span>
              </div>
              <button
                onClick={() => setDismissedOfflineAlertIds((prev) => [...prev, String(upcomingOfflineAppointment._id)])}
                className="w-5 h-5 rounded-full bg-black/30 hover:bg-black/50 text-amber-100 hover:text-white flex items-center justify-center shrink-0 transition-colors font-bold text-[10px]"
                title="Dismiss reminder"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ── Offline→Online Doctor Alert Banner ─────────────────────────── */}
        {nextPatientOnlineAlert && normalizedRole === 'doctor' && (
          <div className={`absolute ${upcomingOfflineAppointment ? "top-28 sm:top-32" : "top-16 sm:top-18"} left-1/2 -translate-x-1/2 z-40 max-w-sm w-full mx-4`}>
            <div className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold shadow-xl text-xs flex items-center gap-2.5">
              <span className="text-base shrink-0">⚡</span>
              <div className="flex-1 truncate">
                <span className="font-bold">{nextPatientOnlineAlert.patientName}</span> is waiting for next call
              </div>
              <button
                onClick={() => setNextPatientOnlineAlert(null)}
                className="text-amber-200 hover:text-white shrink-0 font-bold ml-1"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
