// src/modules/video-call/components/CallControls.tsx
"use client";
import React from "react";

interface CallControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export default function CallControls({
  isAudioMuted,
  isVideoOff,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
}: CallControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-slate-950/85 backdrop-blur-xl px-3.5 py-2 sm:px-6 sm:py-3 rounded-full border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6)] z-40 transition-all">
      {/* Audio Toggle */}
      <button
        onClick={onToggleAudio}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white transition-all text-sm sm:text-base border border-white/10 ${
          isAudioMuted
            ? "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
            : "bg-white/10 hover:bg-white/20"
        }`}
        title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
      >
        <i className={`fas ${isAudioMuted ? "fa-microphone-slash" : "fa-microphone"}`}></i>
      </button>

      {/* Video Toggle */}
      <button
        onClick={onToggleVideo}
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white transition-all text-sm sm:text-base border border-white/10 ${
          isVideoOff
            ? "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
            : "bg-white/10 hover:bg-white/20"
        }`}
        title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
      >
        <i className={`fas ${isVideoOff ? "fa-video-slash" : "fa-video"}`}></i>
      </button>

      <div className="w-[1px] h-6 sm:h-8 bg-white/20 mx-0.5 sm:mx-1"></div>

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/40 transition-all border border-rose-500/40"
      >
        <i className="fas fa-phone-slash"></i>
        <span>End Call</span>
      </button>
    </div>
  );
}
