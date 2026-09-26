// src/modules/video-call/components/WaitingOverlay.tsx
"use client";

import React from "react";

interface WaitingOverlayProps {
  normalizedRole: string;
  doctorDisplayName: string;
  earlyStartTimeStr: string;
  scheduledStartTimeStr: string;
  patientRoomElapsedSeconds: number;
  doctorAbsenceWarning: { message: string; lateJoinCutoffAt?: string } | null;
  isBeforeEarlyStart: boolean;
  formattedCountdownToEarlyStart: string;
  isEarlyStartWindow: boolean;
  isPastScheduledStart: boolean;
}

export default function WaitingOverlay({
  normalizedRole,
  doctorDisplayName,
  earlyStartTimeStr,
  scheduledStartTimeStr,
  patientRoomElapsedSeconds,
  doctorAbsenceWarning,
  isBeforeEarlyStart,
  formattedCountdownToEarlyStart,
  isEarlyStartWindow,
  isPastScheduledStart,
}: WaitingOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-radial from-slate-900/95 via-[#090d16]/98 to-black z-10 p-4 sm:p-6"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div className="max-w-lg w-full bg-slate-900/80 border border-slate-700/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-black/80 backdrop-blur-xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Subtle top ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Pulsing video / doctor radar icon */}
        <div className="relative mb-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-500/15 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 text-2xl sm:text-3xl shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            <i className="fas fa-user-md"></i>
          </div>
          <span className="absolute bottom-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {normalizedRole === "patient"
            ? `Waiting for ${doctorDisplayName}`
            : "Waiting for Patient to Connect"}
        </h3>

        {/* Timing Badges */}
        {(earlyStartTimeStr || scheduledStartTimeStr) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 mb-4">
            {earlyStartTimeStr && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <i className="fas fa-bolt text-[10px] text-amber-400"></i>
                <span>Early Start: {earlyStartTimeStr}</span>
              </div>
            )}
            {scheduledStartTimeStr && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <i className="fas fa-clock text-[10px] text-indigo-400"></i>
                <span>Scheduled Start: {scheduledStartTimeStr}</span>
              </div>
            )}
          </div>
        )}

        {/* User Requested Reassuring Message Banner */}
        <div className="w-full bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
          {normalizedRole === "patient" ? (
            <>
              <p className="flex items-start gap-2">
                <i className="fas fa-info-circle text-indigo-400 text-sm mt-0.5 shrink-0"></i>
                <span>
                  Consultation can start from{" "}
                  <strong className="text-white font-semibold">
                    {earlyStartTimeStr || "8:23 AM"}
                  </strong>{" "}
                  (Early Start window). The scheduled start time is{" "}
                  <strong className="text-white font-semibold">
                    {scheduledStartTimeStr || "8:30 AM"}
                  </strong>
                  .
                </span>
              </p>
              <p className="flex items-start gap-2 text-indigo-200/90 font-medium">
                <i className="fas fa-check-circle text-emerald-400 text-sm mt-0.5 shrink-0"></i>
                <span>
                  Please stay here on this screen until your doctor reaches here. The consultation will automatically connect as soon as the doctor joins.
                </span>
              </p>
            </>
          ) : (
            <p className="flex items-start gap-2">
              <i className="fas fa-info-circle text-indigo-400 text-sm mt-0.5 shrink-0"></i>
              <span>
                The consultation window is open. Please stay here until the patient joins. The call will connect automatically.
              </span>
            </p>
          )}
        </div>

        {/* Patient 1-Minute Mandatory Waiting & Doctor Buffer Progress */}
        {normalizedRole === "patient" &&
          (patientRoomElapsedSeconds < 60 ? (
            <div className="w-full mt-3 bg-amber-500/15 border border-amber-500/35 rounded-2xl p-3.5 sm:p-4 text-left text-xs text-amber-200 flex items-start gap-2.5 shadow-lg">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-300 mt-0.5">
                <i className="fas fa-lock text-[11px]"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between font-semibold text-amber-300 text-xs sm:text-sm">
                  <span>1-Minute Mandatory Wait Active</span>
                  <span className="font-mono text-[11px] bg-amber-500/25 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {60 - patientRoomElapsedSeconds}s left
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-200/90 mt-1 leading-relaxed">
                  The doctor has been instantly notified. A 20–30s buffer is provided for wrapping up before connecting.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full mt-3 bg-emerald-500/15 border border-emerald-500/35 rounded-2xl p-3 sm:p-3.5 text-left text-xs text-emerald-300 flex items-center gap-2.5">
              <i className="fas fa-check-circle text-emerald-400 text-base shrink-0"></i>
              <span className="leading-snug">
                Mandatory waiting period fulfilled. Doctor has been alerted and can join any moment.
              </span>
            </div>
          ))}

        {/* Doctor Absence Warning Notice */}
        {doctorAbsenceWarning && (
          <div className="w-full mt-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl p-3 sm:p-4 text-left text-xs sm:text-sm text-amber-200 flex items-start gap-2.5">
            <i className="fas fa-exclamation-triangle text-amber-400 text-sm mt-0.5 shrink-0"></i>
            <div>
              <span className="font-semibold text-amber-300">
                Doctor Attendance Notice:{" "}
              </span>
              <span>{doctorAbsenceWarning.message}</span>
            </div>
          </div>
        )}

        {/* Live Status indicator */}
        <div className="mt-4 flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
          {isBeforeEarlyStart && (
            <span className="flex items-center gap-1.5 text-amber-300 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Early start window opens in {formattedCountdownToEarlyStart}
            </span>
          )}
          {isEarlyStartWindow && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Early start window is currently active
            </span>
          )}
          {isPastScheduledStart && (
            <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Scheduled session is in progress
            </span>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <i className="fas fa-video text-slate-400"></i> Camera & mic ready
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <i className="fas fa-shield-alt text-emerald-400"></i> End-to-end encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
