// src/modules/video-call/components/CallControls.tsx
"use client";

import React from "react";

interface CallControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  isDoctor?: boolean;
  elapsedSeconds?: number;
  minDurationSeconds?: number;
  isPatient?: boolean;
  patientRoomElapsedSeconds?: number;
  minPatientWaitSeconds?: number;
}

export default function CallControls({
  isAudioMuted,
  isVideoOff,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  isDoctor = false,
  elapsedSeconds = 0,
  minDurationSeconds = 180,
  isPatient = false,
  patientRoomElapsedSeconds = 0,
  minPatientWaitSeconds = 60,
}: CallControlsProps) {
  const isDoctorLocked = Boolean(isDoctor && elapsedSeconds < minDurationSeconds);
  const doctorLockRemaining = Math.max(0, minDurationSeconds - elapsedSeconds);

  const isPatientLocked = Boolean(isPatient && patientRoomElapsedSeconds < minPatientWaitSeconds);
  const patientLockRemaining = Math.max(0, minPatientWaitSeconds - patientRoomElapsedSeconds);

  const isLocked = isDoctorLocked || isPatientLocked;
  const lockRemaining = isDoctorLocked ? doctorLockRemaining : patientLockRemaining;

  return (
    <nav 
      aria-label="Call controls"
      className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 sm:gap-4 bg-slate-950/85 backdrop-blur-2xl px-3.5 py-2 sm:px-6 sm:py-3 rounded-full border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(255,255,255,0.06)] z-40 transition-all"
    >
      {/* Audio / Mic Toggle Button */}
      <div className="relative group">
        <button
          type="button"
          onClick={onToggleAudio}
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer active:scale-95 ${
            isAudioMuted
              ? "bg-gradient-to-br from-rose-500 to-rose-700 border-2 border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.45)] hover:brightness-110"
              : "bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 shadow-md hover:scale-105"
          }`}
          title={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
          aria-label={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          <i
            className={`fas ${
              isAudioMuted ? "fa-microphone-slash text-base sm:text-lg text-white" : "fa-microphone text-base sm:text-lg text-slate-100"
            }`}
          ></i>
        </button>
        {/* Subtle Tooltip on hover */}
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block shadow-lg">
          {isAudioMuted ? "Unmute Mic" : "Mute Mic"}
        </span>
      </div>

      {/* Video / Camera Toggle Button */}
      <div className="relative group">
        <button
          type="button"
          onClick={onToggleVideo}
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer active:scale-95 ${
            isVideoOff
              ? "bg-gradient-to-br from-rose-500 to-rose-700 border-2 border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.45)] hover:brightness-110"
              : "bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 shadow-md hover:scale-105"
          }`}
          title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
          aria-label={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
        >
          <i
            className={`fas ${
              isVideoOff ? "fa-video-slash text-base sm:text-lg text-white" : "fa-video text-base sm:text-lg text-slate-100"
            }`}
          ></i>
        </button>
        {/* Subtle Tooltip on hover */}
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block shadow-lg">
          {isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
        </span>
      </div>

      {/* Vertical Sleek Separator */}
      <div className="w-[1px] h-7 sm:h-9 bg-white/20 mx-0.5 sm:mx-1"></div>

      {/* End Call Button — Prominent, Polished Red Pill */}
      <div className="relative group">
        <button
          type="button"
          onClick={isLocked ? undefined : onEndCall}
          disabled={isLocked}
          className={`bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 sm:gap-2.5 shadow-[0_6px_25px_rgba(225,29,72,0.45)] transition-all duration-200 border tracking-wide ${
            isLocked
              ? "opacity-70 cursor-not-allowed border-amber-400/80 shadow-[0_6px_25px_rgba(245,158,11,0.3)]"
              : "hover:from-red-500 hover:to-rose-500 active:scale-95 hover:shadow-[0_8px_30px_rgba(225,29,72,0.65)] hover:scale-105 border-rose-400/50 cursor-pointer"
          }`}
          aria-label={
            isDoctorLocked
              ? `End Call (Locked: 3m Minimum, ${lockRemaining}s remaining)`
              : isPatientLocked
              ? `Leave Call (Mandatory 1m Wait: ${lockRemaining}s remaining)`
              : (isDoctor ? "End Consultation Call" : "Leave Consultation")
          }
          aria-disabled={isLocked}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            {isLocked ? (
              <i className="fas fa-lock text-xs sm:text-sm text-amber-200"></i>
            ) : (
              <i className="fas fa-phone-slash text-xs sm:text-sm text-white"></i>
            )}
          </div>
          <span className="font-semibold">
            {isLocked ? `Locked (${lockRemaining}s)` : (isDoctor ? "End Call" : "Leave Call")}
          </span>
        </button>
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block shadow-lg">
          {isDoctorLocked
            ? `Minimum 3m required before ending (${lockRemaining}s remaining)`
            : isPatientLocked
            ? `Mandatory 1-minute waiting period (${lockRemaining}s remaining)`
            : (isDoctor ? "Conclude Session" : "Leave Consultation Room")}
        </span>
      </div>
    </nav>
  );
}
