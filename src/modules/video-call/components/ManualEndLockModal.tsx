// src/modules/video-call/components/ManualEndLockModal.tsx
"use client";

import React, { useEffect, useState } from "react";

interface ManualEndLockModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  remainingSeconds: number;
  manualEndAllowedAt?: string | Date | null;
  onClose: () => void;
}

export default function ManualEndLockModal({
  isOpen,
  elapsedSeconds: initialElapsed,
  remainingSeconds: initialRemaining,
  manualEndAllowedAt,
  onClose,
}: ManualEndLockModalProps) {
  const [liveRemaining, setLiveRemaining] = useState(initialRemaining);
  const [liveElapsed, setLiveElapsed] = useState(initialElapsed);

  useEffect(() => {
    setLiveRemaining(initialRemaining);
    setLiveElapsed(initialElapsed);
  }, [initialRemaining, initialElapsed, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setLiveRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
      setLiveElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatMinSec = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const unlockTimeFormatted = manualEndAllowedAt
    ? new Date(manualEndAllowedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      style={{ position: "fixed", inset: 0, zIndex: 60 }}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/90 flex flex-col items-center text-center">
        {/* Animated Amber/Rose Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-[0_0_25px_rgba(245,158,11,0.25)] mb-4">
          <i className="fas fa-lock"></i>
        </div>

        {/* Modal Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
          Consultation End Locked
        </h3>

        {/* Policy Notice */}
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Platform timing policy requires a minimum of{" "}
          <strong className="text-white font-semibold">3 continuous minutes</strong> of consultation before a session can be concluded manually.
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 w-full my-5">
          {/* Elapsed */}
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Elapsed Time
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-slate-100 mt-0.5">
              {formatMinSec(liveElapsed)}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              {liveElapsed}s total
            </span>
          </div>

          {/* Remaining */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Lock Remaining
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-amber-300 mt-0.5">
              {formatMinSec(liveRemaining)}
            </span>
            <span className="text-[10px] text-amber-400/80 mt-0.5">
              {liveRemaining > 0 ? `${liveRemaining}s left` : "Unlocked"}
            </span>
          </div>
        </div>

        {/* Unlock Timestamp & Interruption Note */}
        <div className="w-full bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-left text-xs text-slate-400 space-y-1 mb-5 leading-normal">
          {unlockTimeFormatted && (
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <i className="fas fa-clock text-amber-400 text-[11px]"></i>
              <span>Manual end allowed at: <strong>{unlockTimeFormatted}</strong></span>
            </div>
          )}
          <div className="flex items-start gap-1.5 text-[11px]">
            <i className="fas fa-info-circle text-slate-400 text-[11px] mt-0.5"></i>
            <span>If temporarily disconnected, participants retain the right to rejoin to complete the session.</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30"
        >
          <i className="fas fa-video text-xs"></i>
          <span>Continue Consultation</span>
        </button>
      </div>
    </div>
  );
}
