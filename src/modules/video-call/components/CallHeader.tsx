// src/modules/video-call/components/CallHeader.tsx
"use client";

import React from "react";
import { getAppointmentStartTimestamp } from "@/utils/appointmentStatus";

interface CallHeaderProps {
  isTimerVisible: boolean;
  isWrapUpPhase: boolean;
  isBaseTimeExceeded: boolean;
  baseDurationMinutes?: number;
  formattedRemaining: string;
  formattedElapsed: string;
  isExtended: boolean;
  normalizedRole: string;
  onExtendCall: () => void;
  maxExtensionMinutes: number;
  phase: string;
  remainingSeconds: number;
  isConstrainedByNextPatient: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  wrapUpReason: string | null;
  waitingNextPatient: {
    appointmentId?: string;
    patientName?: string;
    patientType?: string;
    appointmentTime?: string;
  } | null;
  upcomingOfflineAppointment: any;
  callCurrentTime: number;
  setDismissedOfflineAlertIds: React.Dispatch<React.SetStateAction<string[]>>;
  nextPatientOnlineAlert: { patientName: string } | null;
  setNextPatientOnlineAlert: (alert: { patientName: string } | null) => void;
  patientLockWarning: string | null;
  setPatientLockWarning: (warning: string | null) => void;
}

export default function CallHeader({
  isTimerVisible,
  isWrapUpPhase,
  isBaseTimeExceeded,
  baseDurationMinutes,
  formattedRemaining,
  formattedElapsed,
  isExtended,
  normalizedRole,
  onExtendCall,
  maxExtensionMinutes,
  phase,
  remainingSeconds,
  isConstrainedByNextPatient,
  isSidebarOpen,
  setIsSidebarOpen,
  wrapUpReason,
  waitingNextPatient,
  upcomingOfflineAppointment,
  callCurrentTime,
  setDismissedOfflineAlertIds,
  nextPatientOnlineAlert,
  setNextPatientOnlineAlert,
  patientLockWarning,
  setPatientLockWarning,
}: CallHeaderProps) {

  const getPatientDisplayName = (patientData: any) => {
    if (!patientData) return "Patient";
    if (patientData.profileId?.firstName) {
      return `${patientData.profileId.firstName} ${patientData.profileId.lastName || ""}`.trim();
    }
    if (patientData.name) return patientData.name;
    if (patientData.googleName) return patientData.googleName;
    return "Patient";
  };

  return (
    <>
      {/* ── Top Bar Overlay Elements ─────────────────────────────────────── */}
      <div
        className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between z-30 pointer-events-none"
        style={{ position: "absolute", zIndex: 30, pointerEvents: "none" }}
      >
        {/* Status & Timer Container */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto" style={{ pointerEvents: "auto" }}>
          <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="hidden xs:inline sm:inline">Live Consultation</span>
            <span className="xs:hidden sm:hidden">Live</span>
          </div>

          {isTimerVisible && (
            <div
              className={`
              backdrop-blur-md border border-white/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl flex flex-col transition-colors
              ${
                isWrapUpPhase
                  ? "bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  : isBaseTimeExceeded
                  ? "bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "bg-slate-900/60"
              }
            `}
            >
              <div className="flex justify-between items-end gap-2 sm:gap-4">
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {isWrapUpPhase ? "Wrap-Up" : isBaseTimeExceeded ? "Overtime" : "Time"}
                </span>
                {!isWrapUpPhase && baseDurationMinutes && (
                  <span className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:inline">
                    Base: {baseDurationMinutes}m
                  </span>
                )}
              </div>
              <div
                className={`font-mono font-medium tracking-tight text-xs sm:text-base ${
                  isWrapUpPhase
                    ? "text-rose-400 animate-pulse"
                    : isBaseTimeExceeded
                    ? "text-amber-400"
                    : "text-slate-100"
                }`}
              >
                {isWrapUpPhase ? formattedRemaining : formattedElapsed}
              </div>
            </div>
          )}

          {isBaseTimeExceeded && !isExtended && normalizedRole === "doctor" && !isWrapUpPhase && (
            <button
              onClick={onExtendCall}
              className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-slate-900 px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold shadow-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <i className="fas fa-plus text-[10px]"></i>
              <span>+{maxExtensionMinutes}m</span>
            </button>
          )}

          {/* Extension Countdown */}
          {isExtended && phase === "Extension" && remainingSeconds > 0 && normalizedRole === "doctor" && !isWrapUpPhase && (
            <div
              className={`backdrop-blur-md border px-2 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
                isConstrainedByNextPatient
                  ? "bg-orange-500/20 border-orange-500/30 text-orange-300"
                  : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {isConstrainedByNextPatient && <span>⚠️</span>}
              <span>Ext: {formattedRemaining}</span>
              {isConstrainedByNextPatient && (
                <span className="text-[9px] text-orange-400 hidden sm:inline">(next patient)</span>
              )}
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
      {isWrapUpPhase && normalizedRole === "doctor" && (
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 z-40 text-white px-5 py-2.5 rounded-xl font-bold shadow-2xl text-center text-xs sm:text-sm max-w-sm w-full mx-4 ${
            wrapUpReason === "next_patient_live" ||
            wrapUpReason === "next_patient_time_reached" ||
            wrapUpReason === "next_patient_waiting" ||
            (isConstrainedByNextPatient && wrapUpReason !== "max_extension_reached")
              ? "bg-red-600 animate-pulse"
              : "bg-amber-600"
          }`}
        >
          {wrapUpReason === "next_patient_live" ||
          wrapUpReason === "next_patient_time_reached" ||
          wrapUpReason === "next_patient_waiting" ||
          (isConstrainedByNextPatient && wrapUpReason !== "max_extension_reached") ? (
            <>
              {waitingNextPatient?.patientName ? (
                <span className="font-bold">{waitingNextPatient.patientName} is waiting in waiting room.</span>
              ) : (
                <span>Next patient is waiting in waiting room.</span>
              )}
              <br />
              Consultation will auto-disconnect in {remainingSeconds}s
            </>
          ) : (
            <>
              <span>Consultation extension time ended.</span>
              <br />
              Consultation will auto-disconnect in {remainingSeconds}s
            </>
          )}
        </div>
      )}

      {/* ── Early Join Alert (Next online patient waiting, but NOT yet auto-cutting) ───────── */}
      {!isWrapUpPhase && waitingNextPatient && normalizedRole === "doctor" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-blue-600/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg text-center text-xs sm:text-sm max-w-sm w-full mx-4 backdrop-blur-sm border border-blue-400">
          <i className="fas fa-info-circle mr-2"></i>
          {waitingNextPatient.patientName || "Next patient"} is online in the waiting room.
        </div>
      )}

      {/* ── Compact Single-Line In-Call Offline Appointment Warning Banner ───────── */}
      {upcomingOfflineAppointment && normalizedRole === "doctor" && (
        <div className="absolute top-16 sm:top-18 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-md w-full px-2 pointer-events-auto">
          <div className="bg-gradient-to-r from-amber-600/95 to-orange-600/95 backdrop-blur-md text-white py-1.5 px-3 rounded-full font-medium shadow-xl border border-amber-300/40 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-sm shrink-0">🏥</span>
              <span className="font-bold shrink-0 text-amber-200 uppercase text-[10px] sm:text-[11px] tracking-wide">
                In-Person:
              </span>
              <span className="font-semibold text-white truncate text-[11px] sm:text-xs">
                {getPatientDisplayName(upcomingOfflineAppointment.patientId)} (
                {upcomingOfflineAppointment.appointmentTime || "Clinic"})
              </span>
              <span className="shrink-0 text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-bold text-amber-100">
                {getAppointmentStartTimestamp(upcomingOfflineAppointment) > callCurrentTime
                  ? `~${Math.max(
                      1,
                      Math.ceil((getAppointmentStartTimestamp(upcomingOfflineAppointment) - callCurrentTime) / 60000)
                    )}m`
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
      {nextPatientOnlineAlert && normalizedRole === "doctor" && (
        <div
          className={`absolute ${
            upcomingOfflineAppointment ? "top-28 sm:top-32" : "top-16 sm:top-18"
          } left-1/2 -translate-x-1/2 z-40 max-w-sm w-full mx-4`}
        >
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

      {/* ── Patient 1-Minute Lock Floating Alert Banner (Rule 2) ─────────── */}
      {patientLockWarning && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-3 rounded-2xl font-medium shadow-2xl border border-amber-300/40 flex items-center gap-3 text-xs sm:text-sm">
            <i className="fas fa-shield-alt text-amber-200 text-lg shrink-0"></i>
            <div className="flex-1 leading-snug">{patientLockWarning}</div>
            <button
              onClick={() => setPatientLockWarning(null)}
              className="text-amber-200 hover:text-white shrink-0 font-bold ml-1 text-sm cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
