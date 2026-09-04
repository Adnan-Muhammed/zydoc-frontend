// src/modules/video-call/components/CallExitConfirmModal.tsx
"use client";

import React, { useEffect } from "react";

interface CallExitConfirmModalProps {
  isOpen: boolean;
  role: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CallExitConfirmModal({
  isOpen,
  role,
  onCancel,
  onConfirm,
}: CallExitConfirmModalProps) {
  const isDoctor = role?.toLowerCase() === "doctor";

  // Handle ESC key to cancel/close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1320] border border-white/15 p-6 shadow-2xl shadow-black/80 text-center">
        {/* Glow accent */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-16 bg-rose-500/20 blur-2xl rounded-full pointer-events-none" />

        {/* Warning Icon */}
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl shadow-inner">
          <i className="fas fa-phone-slash"></i>
        </div>

        {/* Title */}
        <h3
          id="exit-modal-title"
          className="text-lg font-bold text-white tracking-tight"
        >
          {isDoctor ? "End Consultation?" : "Leave Consultation Room?"}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {isDoctor
            ? "Are you sure you want to leave the consultation room? This will conclude the session for all participants and mark the consultation as completed."
            : "Are you sure you want to leave the consultation room? Your video call will be disconnected. You can rejoin later from your appointments page."}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold tracking-wide transition-all active:scale-95"
          >
            Stay in Call
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold tracking-wide shadow-lg shadow-rose-600/40 transition-all border border-rose-500/50"
          >
            {isDoctor ? "End & Leave Call" : "Leave Call"}
          </button>
        </div>
      </div>
    </div>
  );
}
