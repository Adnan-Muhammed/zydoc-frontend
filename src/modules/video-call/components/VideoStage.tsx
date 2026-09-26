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

  // Base classes for the full screen video
  const fullScreenVideoClass = "w-full h-full object-cover block bg-black transition-all duration-300";
  // Base classes for the PiP video container
  const pipContainerClass =
    "absolute bottom-[80px] right-3 sm:bottom-5 sm:right-5 w-[115px] h-[150px] sm:w-[220px] sm:h-[165px] md:w-[240px] md:h-[180px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.6)] border-2 border-white/30 z-30 bg-slate-900 transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 ring-1 ring-black/40 cursor-pointer";
  // Base classes for the PiP video element
  const pipVideoClass = "w-full h-full object-cover block transition-all duration-300";

  return (
    <>
      {/* ── Main Full-Screen Video ────────────────────────────────────── */}
      <video
        ref={isSwapped ? localVideoRef : remoteVideoRef}
        autoPlay
        playsInline
        muted={isSwapped} // mute if local is fullscreen
        className={`${fullScreenVideoClass} ${isSwapped ? "-scale-x-100" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: isSwapped ? "scaleX(-1)" : "none",
        }}
        aria-label={isSwapped ? "Your local video (fullscreen)" : "Remote participant video"}
      />

      {/* ── Picture-in-Picture (PiP) Video ────────────────────────────── */}
      <div className={pipContainerClass} onClick={toggleSwap} title="Click to swap views">
        <video
          ref={isSwapped ? remoteVideoRef : localVideoRef}
          autoPlay
          playsInline
          muted={!isSwapped} // mute if local is PiP
          className={`${pipVideoClass} ${
            !isSwapped ? "-scale-x-100" : ""
          } ${!isSwapped && !localStream ? "opacity-0" : "opacity-100"}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: !isSwapped ? "scaleX(-1)" : "none",
            display: "block",
          }}
          aria-label={!isSwapped ? "Your local video" : "Remote participant video (PiP)"}
        />
        
        {/* Camera Off Overlay for Local Video when it's in PiP */}
        {!isSwapped && !localStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white/40 gap-1 p-2 pointer-events-none">
            <i className="fas fa-video-slash text-base sm:text-xl"></i>
            <span className="text-[9px] sm:text-[10px] text-slate-400">Camera Off</span>
          </div>
        )}

        {/* Name Badge for PiP */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] text-white/90 font-medium flex items-center gap-1 pointer-events-none">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              !isSwapped ? "bg-emerald-400" : "bg-indigo-400"
            }`}
          ></span>
          <span>{!isSwapped ? "You" : "Remote"}</span>
        </div>
      </div>
    </>
  );
}
