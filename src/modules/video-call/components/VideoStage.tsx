// src/modules/video-call/components/VideoStage.tsx
"use client";

import React, { useState } from "react";

interface VideoStageProps {
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
}

export default function VideoStage({
  remoteVideoRef,
  localVideoRef,
  localStream,
}: VideoStageProps) {
  const [isSwapped, setIsSwapped] = useState(false);

  const toggleSwap = () => {
    setIsSwapped((prev) => !prev);
  };

  // Base classes for the PiP (small side video) container
  // Elevated slightly on mobile (bottom-[108px]) and desktop (sm:bottom-7) to match the elevated call controls
  const pipContainerClass =
    "absolute bottom-[108px] right-3 sm:bottom-7 sm:right-5 w-[115px] h-[150px] sm:w-[220px] sm:h-[165px] md:w-[240px] md:h-[180px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.6)] border-2 border-white/30 z-30 bg-slate-900 transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 ring-1 ring-black/40 cursor-pointer";

  // Base classes for the full screen video container
  const fullScreenContainerClass =
    "absolute inset-0 w-full h-full bg-black z-0 transition-all duration-300 overflow-hidden";

  return (
    <>
      {/* ── Remote Participant Video ───────────────────────────────────── */}
      {/* In normal view: Fullscreen (z-0). In swapped view: Small PiP (z-30) */}
      <div
        className={isSwapped ? pipContainerClass : fullScreenContainerClass}
        onClick={isSwapped ? toggleSwap : undefined}
        title={isSwapped ? "Click to switch to full screen" : undefined}
      >
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover block bg-black pointer-events-none"
          aria-label={isSwapped ? "Remote participant video (PiP)" : "Remote participant video"}
        />

        {/* When Remote is in PiP, display badge and swap indicator */}
        {isSwapped && (
          <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] text-white/90 font-medium flex items-center gap-1 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Remote</span>
            <i className="fas fa-arrows-rotate text-[8px] text-slate-300 ml-0.5 opacity-80"></i>
          </div>
        )}
      </div>

      {/* ── Local Participant Video ────────────────────────────────────── */}
      {/* In normal view: Small PiP (z-30). In swapped view: Fullscreen (z-0) */}
      <div
        className={!isSwapped ? pipContainerClass : fullScreenContainerClass}
        onClick={!isSwapped ? toggleSwap : undefined}
        title={!isSwapped ? "Click to switch to full screen" : undefined}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted={true}
          className={`w-full h-full object-cover block pointer-events-none ${
            !localStream ? "opacity-0" : "opacity-100"
          }`}
          style={{ transform: "scaleX(-1)" }}
          aria-label={!isSwapped ? "Your local video" : "Your local video (fullscreen)"}
        />

        {/* Camera Off Overlay for Local Video */}
        {!localStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white/40 gap-1 p-2 pointer-events-none">
            <i className={`fas fa-video-slash ${!isSwapped ? "text-base sm:text-xl" : "text-3xl sm:text-4xl"}`}></i>
            <span className={!isSwapped ? "text-[9px] sm:text-[10px] text-slate-400" : "text-xs sm:text-sm text-slate-400 font-medium"}>
              Camera Off
            </span>
          </div>
        )}

        {/* When Local is in PiP, display badge and swap indicator */}
        {!isSwapped && (
          <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] text-white/90 font-medium flex items-center gap-1 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>You</span>
            <i className="fas fa-arrows-rotate text-[8px] text-slate-300 ml-0.5 opacity-80"></i>
          </div>
        )}
      </div>
    </>
  );
}
