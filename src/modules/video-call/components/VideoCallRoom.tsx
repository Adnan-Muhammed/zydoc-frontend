/**
 * VideoCallRoom.tsx
 *
 * Components Layer — src/modules/video-call/components/
 *
 * Layout: Picture-in-Picture (PiP)
 *  - Remote video fills the entire container (black background).
 *  - Local video is an absolute-positioned small floating tile at
 *    the bottom-right corner, with a subtle border and rounded corners.
 *
 * Usage:
 *   <VideoCallRoom
 *     appointmentId="abc123"
 *     userId={currentUser._id}
 *     role={currentUser.role}
 *   />
 */

"use client";

import React, { useState, useEffect } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import { useCallTimer } from "../hooks/useCallTimer";
import CallControls from "./CallControls";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoCallRoomProps {
  appointmentId: string;
  userId: string;
  role: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoCallRoom({
  appointmentId,
  userId,
  role,
}: VideoCallRoomProps) {
  const {
    localVideoRef,
    remoteVideoRef,
    localStream,
    isRemoteReady,
    isCallEnded,
    error,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    endCall,
    timerConfig,
    socket
  } = useWebRTC({ appointmentId, userId, role });

  const {
    elapsedSeconds,
    remainingSeconds,
    phase,
    isWarningPhase,
    isExtended,
    isWrapUpPhase,
    shouldAutoDisconnect,
    formattedElapsed,
    formattedRemaining,
    startWrapUpCountdown,
    extendCall
  } = useCallTimer(timerConfig);

  const normalizedRole = role?.toLowerCase() || "";
  const showTimerToPatient = isWarningPhase;
  const isTimerVisible = normalizedRole === "doctor" || showTimerToPatient;

  // Doctor popup at the end of primary time (if not yet extended)
  const showExtensionPopup = normalizedRole === "doctor" && phase === "Extension" && !isExtended;

  // ── Auto Disconnect Logic ─────────────────────────────────────────────────
  useEffect(() => {
    if (shouldAutoDisconnect) {
      console.log("[VideoCallRoom] Time limit reached or wrap-up completed. Auto-disconnecting...");
      endCall();
    }
  }, [shouldAutoDisconnect, endCall]);

  // ── Socket Listener for Scenario 3 (Urgent Slot Booked) & Overtime Patient Arrival ──
  useEffect(() => {
    if (!socket) return;
    
    const handleUrgentSlot = () => {
      console.log("[VideoCallRoom] Urgent slot booked! Triggering wrap-up countdown.");
      startWrapUpCountdown();
    };

    const handlePatientArrived = () => {
      // If we are already past the primary time (Extension phase) and a patient arrives, start countdown
      if (phase === 'Extension') {
        console.log("[VideoCallRoom] Next patient arrived during overtime! Triggering wrap-up countdown.");
        startWrapUpCountdown();
      }
    };

    socket.on("urgent-slot-booked", handleUrgentSlot);
    socket.on("patient-arrived", handlePatientArrived);

    return () => {
      socket.off("urgent-slot-booked", handleUrgentSlot);
      socket.off("patient-arrived", handlePatientArrived);
    };
  }, [socket, startWrapUpCountdown, phase]);

  // ── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>📵</span>
          <p style={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.roomContainer}>
      {/* ── Remote Video (fills the room) ─────────────────────────────── */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={styles.remoteVideo}
        aria-label="Remote participant video"
      />

      {/* Waiting overlay — shown until the remote peer connects */}
      {!isRemoteReady && !isCallEnded && (
        <div style={styles.waitingOverlay}>
          <div style={styles.waitingContent}>
            <div style={styles.pulsingDot} />
            <p style={styles.waitingText}>Waiting for the other participant…</p>
          </div>
        </div>
      )}

      {/* Call Ended Overlay */}
      {isCallEnded && (
        <div style={styles.waitingOverlay}>
          <div style={styles.waitingContent}>
            <span style={styles.errorIcon}>✅</span>
            <p style={styles.waitingText}>Consultation Completed. Redirecting...</p>
          </div>
        </div>
      )}

      {/* ── Local Video (PiP — bottom-right corner) ───────────────────── */}
      <div style={styles.pipWrapper}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted /* Always mute local — prevents audio feedback loop */
          style={{
            ...styles.localVideo,
            opacity: localStream ? 1 : 0,
          }}
          aria-label="Your local video"
        />
        {!localStream && (
          <div style={styles.pipPlaceholder}>
            <span style={styles.pipCameraIcon}>📷</span>
          </div>
        )}
      </div>

      {/* ── Call Controls (Mute/Video/End) ─────────────────────────────────── */}
      <CallControls
        isAudioMuted={!isAudioEnabled}
        isVideoOff={!isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
      />

      {/* ── Timer Badge ────────────────────────────────────────────────────── */}
      {timerConfig && isTimerVisible && (
        <div 
          className={`absolute top-4 right-4 z-50 rounded-full px-3 py-1 text-sm font-semibold backdrop-blur-sm transition-all duration-300 ${
            isWarningPhase 
              ? 'bg-red-500/90 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-black/50 text-white border border-white/20'
          }`}
        >
          {normalizedRole === 'doctor' ? formattedElapsed : formattedRemaining}
        </div>
      )}

      {/* ── Wrap-Up Alert (Scenario 3) ────────────────────────────────────── */}
      {isWrapUpPhase && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-2xl animate-pulse text-center">
          Next patient is waiting.<br/>Consultation will auto-disconnect in {remainingSeconds}s
        </div>
      )}

      {/* ── Doctor Extension Popup ─────────────────────────────────────────── */}
      {showExtensionPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupCard}>
            <h3 style={styles.popupTitle}>Scheduled Time Completed</h3>
            <p style={styles.popupText}>The 45 minutes have been completed. Do you want to end the call or extend?</p>
            <div style={styles.popupActions}>
              <button style={styles.btnEndCall} onClick={endCall}>End Call</button>
              <button style={styles.btnExtend} onClick={extendCall}>Extend</button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded styles for animations */}
      <style>{globalKeyframes}</style>
    </div>
  );
}

// ─── Styles (inline — no CSS Module dependency for portability) ───────────────

const styles: Record<string, React.CSSProperties> = {
  // ── Room wrapper ──────────────────────────────────────────────────────────
  roomContainer: {
    position: "relative",
    width: "100%",
    height: "100vh",
    backgroundColor: "#0a0a0a",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Remote video ─────────────────────────────────────────────────────────
  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    backgroundColor: "#0a0a0a",
  },

  // ── Waiting overlay ───────────────────────────────────────────────────────
  waitingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(ellipse at center, rgba(20,20,30,0.95) 0%, rgba(0,0,0,0.98) 100%)",
    zIndex: 10,
  },
  waitingContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  pulsingDot: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "rgba(99, 179, 237, 0.25)",
    border: "2px solid rgba(99, 179, 237, 0.6)",
    animation: "pulse 2s ease-in-out infinite",
  },
  waitingText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: "1rem",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 400,
    letterSpacing: "0.02em",
    margin: 0,
  },

  // ── PiP local video wrapper ───────────────────────────────────────────────
  pipWrapper: {
    position: "absolute",
    bottom: "28px",
    right: "28px",
    width: "200px",
    height: "150px",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.12)",
    zIndex: 20,
    backgroundColor: "#1a1a2e",
    transition: "box-shadow 0.3s ease",
  },
  localVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transform: "scaleX(-1)", // Mirror the local video (feels more natural)
    transition: "opacity 0.4s ease",
  },
  pipPlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a2e",
  },
  pipCameraIcon: {
    fontSize: "2rem",
    opacity: 0.4,
  },

  // ── Error state ───────────────────────────────────────────────────────────
  errorContainer: {
    width: "100%",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a",
  },
  errorCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "40px 48px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    maxWidth: "400px",
    textAlign: "center",
  },
  errorIcon: {
    fontSize: "3rem",
  },
  errorText: {
    color: "rgba(255, 180, 180, 0.9)",
    fontSize: "0.95rem",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: 1.6,
    margin: 0,
  },
  


  // ── Extension Popup ───────────────────────────────────────────────────────
  popupOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 50,
  },
  popupCard: {
    backgroundColor: "#1a1a2e",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
  },
  popupTitle: {
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.25rem",
    margin: "0 0 16px 0",
  },
  popupText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    lineHeight: 1.5,
    margin: "0 0 24px 0",
  },
  popupActions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
  btnEndCall: {
    padding: "10px 20px",
    backgroundColor: "#e53e3e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  btnExtend: {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  }
};

// ── Keyframe animation (injected once via <style>) ────────────────────────────
const globalKeyframes = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
  }

`;
