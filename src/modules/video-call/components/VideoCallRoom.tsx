/**
 * VideoCallRoom.tsx
 *
 * Components Layer — src/modules/video-call/components/
 *
 * Layout:
 *  - Main container: Full height (100% of parent, no vertical scroll)
 *  - Left Section (flex-1): Video call stage with remote video, PiP local tile,
 *    and docked call controls at the bottom.
 *  - Right Section (350px): Consultation Sidebar with Chat, Prescriptions, and Files.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import { useCallTimer } from "../hooks/useCallTimer";
import { usePreventCallExit } from "../hooks/usePreventCallExit";
import CallControls from "./CallControls";
import ConsultationSidebar from "./ConsultationSidebar";
import CallExitConfirmModal from "./CallExitConfirmModal";
import DuplicateTabFallback from "./DuplicateTabFallback";

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
    cleanupMediaAndConnections,
    timerConfig,
    socket,
    isDuplicateTab,
    isTakenOver,
    requestTakeover,
    reclaimCall,
  } = useWebRTC({ appointmentId, userId, role });

  const defaultRedirectUrl =
    role?.toLowerCase() === "doctor" ? "/doctor/dashboard" : "/patient/appointments";

  const {
    isExitModalOpen,
    requestExit,
    cancelExit,
    confirmExit,
  } = usePreventCallExit({
    isActive: !isCallEnded && !error && !isDuplicateTab && !isTakenOver,
    onLeaveCall: cleanupMediaAndConnections,
    defaultRedirectUrl,
    appointmentId,
  });

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
    extendCall,
  } = useCallTimer(timerConfig);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

    const handlePatientArrived = (payload: any) => {
      // Only trigger if this is for the NEXT patient (different appointmentId) and call is in extension
      const isNextPatient = !payload?.appointmentId || payload.appointmentId !== appointmentId;
      if (isNextPatient && (phase === "Extension" || isExtended)) {
        console.log("[VideoCallRoom] Next patient arrived during overtime! Triggering 1-minute wrap-up countdown.");
        startWrapUpCountdown();
      }
    };

    socket.on("urgent-slot-booked", handleUrgentSlot);
    socket.on("patient-arrived", handlePatientArrived);

    return () => {
      socket.off("urgent-slot-booked", handleUrgentSlot);
      socket.off("patient-arrived", handlePatientArrived);
    };
  }, [socket, startWrapUpCountdown, phase, isExtended, appointmentId]);

  // ── Multi-Tab Fallback States ─────────────────────────────────────────────
  if (isDuplicateTab) {
    return (
      <DuplicateTabFallback
        mode="duplicate"
        role={role}
        onTakeover={requestTakeover}
      />
    );
  }

  if (isTakenOver) {
    return (
      <DuplicateTabFallback
        mode="taken_over"
        role={role}
        onReclaim={reclaimCall}
      />
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] p-6">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 border border-white/10 max-w-md text-center">
          <span className="text-4xl">📵</span>
          <p className="text-rose-300 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }


  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-row overflow-hidden bg-[#090d16] relative select-none">
      {/* ── Left Section: Video Stage (Flex-1) ───────────────────────────────── */}
      <div 
        className="flex-1 h-full min-w-0 relative overflow-hidden bg-black"
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {/* ── Remote Video (fills available video area) ────────────────────── */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover block bg-black"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          aria-label="Remote participant video"
        />

        {/* Waiting overlay — shown until the remote peer connects */}
        {!isRemoteReady && !isCallEnded && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-radial from-slate-900/95 to-black/98 z-10"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
          >
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400/60 animate-pulse flex items-center justify-center">
                <i className="fas fa-video text-indigo-400 text-xl"></i>
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium tracking-wide">
                  Waiting for the other participant…
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  The consultation will connect automatically once both join.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Call Ended Overlay */}
        {isCallEnded && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/90 z-20"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-white text-base font-semibold">
                Consultation Completed. Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* ── Front Camera View (Local PiP — floating in bottom-right corner) ── */}
        <div 
          className="absolute bottom-[80px] right-3 sm:bottom-5 sm:right-5 w-[115px] h-[150px] sm:w-[220px] sm:h-[165px] md:w-[240px] md:h-[180px] rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.6)] border-2 border-white/30 z-30 bg-slate-900 transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 ring-1 ring-black/40"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover block -scale-x-100 transition-opacity duration-300 ${
              localStream ? "opacity-100" : "opacity-0"
            }`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: 'block',
            }}
            aria-label="Your local video"
          />
          {!localStream && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white/40 gap-1 p-2"
            >
              <i className="fas fa-video-slash text-base sm:text-xl"></i>
              <span className="text-[9px] sm:text-[10px] text-slate-400">Camera Off</span>
            </div>
          )}
          <div 
            className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] text-white/90 font-medium flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>You</span>
          </div>
        </div>

        {/* ── Call Controls (Fixed / Docked at Bottom Center of Video) ─────── */}
        <CallControls
          isAudioMuted={!isAudioEnabled}
          isVideoOff={!isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onEndCall={() => requestExit()}
        />

        {/* ── Top Bar Overlay Elements ─────────────────────────────────────── */}
        <div 
          className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none"
          style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30, pointerEvents: 'none' }}
        >
          {/* Status & Timer */}
          <div className="flex items-center gap-2 pointer-events-auto" style={{ pointerEvents: 'auto', display: 'flex', gap: '8px' }}>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Live Consultation</span>
            </div>

            {timerConfig && isTimerVisible && (
              <div
                className={`rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-300 ${
                  isWarningPhase
                    ? "bg-red-500/90 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                    : "bg-black/60 text-white border border-white/10"
                }`}
              >
                <i className="fas fa-clock mr-1 text-[10px]"></i>
                {normalizedRole === "doctor" ? formattedElapsed : formattedRemaining}
              </div>
            )}
          </div>

          {/* Toggle Right Sidebar Button (Visible on all screens) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Collapse Panel" : "Open Panel"}
            className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-indigo-600 hover:border-indigo-500 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-all shadow-lg"
            style={{ pointerEvents: 'auto' }}
          >
            <i className={`fas ${isSidebarOpen ? "fa-columns" : "fa-sidebar"}`}></i>
            <span>{isSidebarOpen ? "Hide Panel" : "Show Panel"}</span>
          </button>
        </div>

        {/* ── Wrap-Up Alert (Scenario 3) ─────────────────────────────────── */}
        {isWrapUpPhase && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl animate-pulse text-center text-xs sm:text-sm">
            Next patient is waiting.<br />Consultation will auto-disconnect in {remainingSeconds}s
          </div>
        )}

        {/* ── Doctor Extension Popup ──────────────────────────────────────── */}
        {showExtensionPopup && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
              <h3 className="text-white text-base font-bold mb-2">Scheduled Time Completed</h3>
              <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                The standard duration has finished. Would you like to extend or conclude the call?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => requestExit()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  End Call
                </button>
                <button
                  onClick={extendCall}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Extend Time
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Right Section: Consultation Sidebar (350px fixed width) ────────── */}
      {isSidebarOpen && (
        <ConsultationSidebar
          appointmentId={appointmentId}
          userId={userId}
          role={role}
          socket={socket}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}

      {/* ── Call Exit Confirmation Modal ────────────────────────────────────── */}
      <CallExitConfirmModal
        isOpen={isExitModalOpen}
        role={role}
        onCancel={cancelExit}
        onConfirm={confirmExit}
      />
    </div>
  );
}
