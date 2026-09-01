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
    <div style={styles.container}>
      <button
        onClick={onToggleAudio}
        style={{
          ...styles.button,
          backgroundColor: isAudioMuted ? "#ef4444" : "rgba(255, 255, 255, 0.1)",
        }}
        title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
      >
        <i className={`fas ${isAudioMuted ? "fa-microphone-slash" : "fa-microphone"}`}></i>
      </button>

      <button
        onClick={onToggleVideo}
        style={{
          ...styles.button,
          backgroundColor: isVideoOff ? "#ef4444" : "rgba(255, 255, 255, 0.1)",
        }}
        title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
      >
        <i className={`fas ${isVideoOff ? "fa-video-slash" : "fa-video"}`}></i>
      </button>

      <div style={styles.divider}></div>

      <button
        onClick={onEndCall}
        style={styles.endCallButton}
      >
        <i className="fas fa-phone-slash"></i>
        End Call
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    bottom: "28px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(12px)",
    padding: "12px 24px",
    borderRadius: "9999px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    zIndex: 50,
  },
  button: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "1.1rem",
  },
  divider: {
    width: "1px",
    height: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    margin: "0 8px",
  },
  endCallButton: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "9999px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.39)",
  },
};
