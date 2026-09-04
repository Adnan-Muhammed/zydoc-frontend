/**
 * DuplicateTabFallback.tsx
 *
 * Components Layer — src/modules/video-call/components/
 *
 * Fallback UI displayed when a duplicate tab is detected or when
 * the current consultation tab has been transferred/taken over by another tab.
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface DuplicateTabFallbackProps {
  /** "duplicate" (Tab B opened while Tab A active) | "taken_over" (Tab A deactivated by Tab B) */
  mode: "duplicate" | "taken_over";
  role?: string;
  onTakeover?: () => void;
  onReclaim?: () => void;
  onClose?: () => void;
}

export default function DuplicateTabFallback({
  mode,
  role = "patient",
  onTakeover,
  onReclaim,
  onClose,
}: DuplicateTabFallbackProps) {
  const router = useRouter();
  const isDoctor = role.toLowerCase() === "doctor";
  const defaultDestination = isDoctor ? "/doctor/dashboard" : "/patient/appointments";

  const handleLeave = () => {
    if (onClose) {
      onClose();
    } else {
      router.replace(defaultDestination);
    }
  };

  const isTakenOverMode = mode === "taken_over";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="tab-fallback-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070a13]/90 backdrop-blur-xl animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1320] border border-white/15 p-8 shadow-2xl shadow-black/90 text-center overflow-hidden">
        {/* Glow Accent */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 blur-3xl rounded-full pointer-events-none ${
            isTakenOverMode ? "bg-cyan-500/20" : "bg-amber-500/20"
          }`}
        />

        {/* Status Badge & Icon */}
        <div className="relative mb-6 inline-flex">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-all ${
              isTakenOverMode
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-cyan-500/10"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/10"
            }`}
          >
            {isTakenOverMode ? (
              <i className="fas fa-arrows-rotate animate-spin-slow"></i>
            ) : (
              <i className="fas fa-clone"></i>
            )}
          </div>
          <span
            className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${
              isTakenOverMode ? "bg-cyan-600 ring-2 ring-[#0e1320]" : "bg-amber-600 ring-2 ring-[#0e1320]"
            }`}
          >
            <i className={`fas ${isTakenOverMode ? "fa-arrow-right-arrow-left text-[10px]" : "fa-exclamation text-[11px]"}`}></i>
          </span>
        </div>

        {/* Title */}
        <h2
          id="tab-fallback-title"
          className="text-xl sm:text-2xl font-bold text-white tracking-tight"
        >
          {isTakenOverMode
            ? "Consultation Transferred"
            : "Active in Another Tab"}
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          {isTakenOverMode
            ? "This consultation room was transferred to another browser tab. Your camera, microphone, and connections in this tab have been safely deactivated to prevent conflicts."
            : "You are already active in this video consultation in another browser tab. To prevent audio feedback, echo, and hardware locking, video calls are limited to one active tab at a time."}
        </p>

        {/* Visual Tip Box */}
        <div className="mt-5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-400 flex items-start gap-3 text-left">
          <i
            className={`fas ${
              isTakenOverMode ? "fa-circle-info text-cyan-400" : "fa-shield-halved text-amber-400"
            } mt-0.5 text-sm shrink-0`}
          ></i>
          <span>
            {isTakenOverMode
              ? "You can continue the consultation in your other tab, or click below to switch back to this tab anytime."
              : "You can switch to this tab if you wish to continue here instead, or return to your dashboard."}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleLeave}
            className="w-full sm:w-1/2 px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-200 text-xs font-semibold tracking-wide transition-all"
          >
            {isDoctor ? "Return to Dashboard" : "Return to Appointments"}
          </button>

          {(onTakeover || onReclaim) && (
            <button
              type="button"
              onClick={isTakenOverMode ? onReclaim : onTakeover}
              className={`w-full sm:w-1/2 px-5 py-3 rounded-xl active:scale-95 text-white text-xs font-semibold tracking-wide shadow-lg transition-all border ${
                isTakenOverMode
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-400/40 shadow-cyan-600/30"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-400/40 shadow-blue-600/30"
              }`}
            >
              <i className="fas fa-arrow-right-to-bracket mr-2"></i>
              {isTakenOverMode ? "Reclaim in This Tab" : "Switch to This Tab"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
