// src/modules/video-call/hooks/useWebRTC.ts
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { TimerConfig, ExtensionState } from "./useCallTimer";
import { useCallTabSync } from "./useCallTabSync";
import { appointmentService } from "@/redux/features/appointment/appointmentService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseWebRTCOptions {
  /** MongoDB ObjectId of the appointment — used as the socket room key. */
  appointmentId: string;
  /** The authenticated user's ID, forwarded to the server for logging. */
  userId: string;
  /** "doctor" | "patient" — forwarded to the server for logging. */
  role: string;
  onCallEnded?: () => void;
  /**
   * Optional async hook called right before any internal router.replace.
   * Use this to rewind sentinel history entries so the browser Back button
   * lands on the correct previous page instead of "/".
   */
  rewindBeforeNavigate?: () => Promise<void>;
  token?: string | null;
  /** Explicit rejoin flag for session reconnect (§18.2) */
  isRejoin?: boolean;
}

export interface WaitingRoomStatus {
  appointmentId: string;
  serverNow: string;
  waitingRoomEnteredAt: string;
  holdSeconds: number;
  remainingHoldSeconds: number;
}

export interface ReconnectionGrace {
  isDisconnected: boolean;
  userRole: string;
  userId?: string;
  gracePeriodSeconds: number;
  disconnectedAt: number;
}

export interface TerminationInfo {
  reason: string;
  message: string;
  nextAppointmentId?: string;
  patientName?: string;
}

export interface ManualEndLockResult {
  locked: boolean;
  elapsedSeconds?: number;
  remainingSeconds?: number;
  manualEndAllowedAt?: string;
  message?: string;
}

interface UseWebRTCReturn {
  /** Ref to attach to the local <video> element. Stream = camera + mic. */
  localVideoRef: React.RefObject<HTMLVideoElement>;
  /** Ref to attach to the remote <video> element. Stream from the other peer. */
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isRemoteReady: boolean;
  isCallEnded: boolean;
  /** Non-null when something goes wrong (permissions denied, etc.). */
  error: string | null;
  /** Audio/Video toggle states */
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  /** Action functions */
  toggleAudio: () => void;
  toggleVideo: () => void;
  endCall: () => Promise<ManualEndLockResult | void>;
  cleanupMediaAndConnections: () => void;
  /** Timer Config from Server */
  timerConfig: TimerConfig | null;
  /** The active socket instance so parent components can listen to custom events */
  socket: Socket | null;
  /** Multi-tab coordination states and actions */
  isDuplicateTab: boolean;
  isTakenOver: boolean;
  requestTakeover: () => void;
  reclaimCall: () => void;
  /** Waiting room and reconnection lifecycle */
  waitingRoomStatus: WaitingRoomStatus | null;
  reconnectionGrace: ReconnectionGrace | null;
  terminationInfo: TerminationInfo | null;
}

// ─── STUN Servers ─────────────────────────────────────────────────────────────

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * Module-level guard against React 18 StrictMode's double effect invocation.
 */
const activeCallSessions = new Set<string>();

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWebRTC({
  appointmentId,
  userId,
  role,
  onCallEnded,
  rewindBeforeNavigate,
  token,
  isRejoin = false,
}: UseWebRTCOptions): UseWebRTCReturn {
  const router = useRouter();

  // ── Refs ────────────────────────────────────────────────────────────────
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentJoinTokenRef = useRef<string | null>(null);
  const hasJoinedOnceRef = useRef<boolean>(Boolean(isRejoin));

  // ── State ───────────────────────────────────────────────────────────────
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isRemoteReady, setIsRemoteReady] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timerConfig, setTimerConfig] = useState<TimerConfig | null>(null);
  const [waitingRoomStatus, setWaitingRoomStatus] = useState<WaitingRoomStatus | null>(null);
  const [reconnectionGrace, setReconnectionGrace] = useState<ReconnectionGrace | null>(null);
  const [terminationInfo, setTerminationInfo] = useState<TerminationInfo | null>(null);

  // ── Multi-Tab Coordination ─────────────────────────────────────────────
  const {
    isDuplicateTab,
    isTakenOver,
    isActiveTab,
    requestTakeover,
    reclaimCall,
    setDuplicateDetected,
    releaseTab,
  } = useCallTabSync({
    appointmentId,
    userId,
    enabled: !!appointmentId && !!userId,
  });

  // ── Stream Attachment Effects (Guarantees video plays reliably on re-renders) ──
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ── Handle Tab Takeover Cleanup ──────────────────────────────────────────
  useEffect(() => {
    if (isTakenOver) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch (e) {
            console.warn("[useWebRTC] Error stopping track on takeover:", e);
          }
        });
        localStreamRef.current = null;
        setLocalStream(null);
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setRemoteStream(null);
      setIsRemoteReady(false);
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, [isTakenOver]);

  // ── Countdown Effects for Waiting Room Hold & Reconnection Grace ───────
  useEffect(() => {
    if (!waitingRoomStatus || waitingRoomStatus.remainingHoldSeconds <= 0) return;
    const interval = setInterval(() => {
      setWaitingRoomStatus((prev) => {
        if (!prev || prev.remainingHoldSeconds <= 1) {
          return prev ? { ...prev, remainingHoldSeconds: 0 } : null;
        }
        return { ...prev, remainingHoldSeconds: prev.remainingHoldSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [waitingRoomStatus?.remainingHoldSeconds]);

  useEffect(() => {
    if (!reconnectionGrace || reconnectionGrace.gracePeriodSeconds <= 0) return;
    const interval = setInterval(() => {
      setReconnectionGrace((prev) => {
        if (!prev || prev.gracePeriodSeconds <= 1) {
          return null;
        }
        return { ...prev, gracePeriodSeconds: prev.gracePeriodSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reconnectionGrace?.gracePeriodSeconds]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Create a fresh RTCPeerConnection and wire up its callbacks. */
  const createPeerConnection = useCallback(
    (socket: Socket): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // 1. Forward ICE candidates to the other peer via the signaling server.
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          console.info("[webrtc] ICE candidate emitted", { appointmentId, role });
          socket.emit("webrtc_ice_candidate", { appointmentId, candidate });
        }
      };

      // 2. Attach the remote stream to the remote video element when tracks arrive.
      pc.ontrack = (event) => {
        console.info("[webrtc] remote media track received", {
          appointmentId,
          role,
          kind: event.track.kind,
        });
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteStream(event.streams[0]);
          setIsRemoteReady(true);
          setReconnectionGrace(null);
        }
      };

      // 3. Log connection state changes (useful for debugging).
      pc.onconnectionstatechange = () => {
        console.log(
          `[useWebRTC] PeerConnection state for appointment ${appointmentId} (${role}): ${pc.connectionState}`
        );
        if (pc.connectionState === "connected") {
          setReconnectionGrace(null);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.info("[webrtc] ICE connection state", {
          appointmentId,
          role,
          state: pc.iceConnectionState,
        });
      };

      pc.onsignalingstatechange = () => {
        console.info("[webrtc] signaling state", {
          appointmentId,
          role,
          state: pc.signalingState,
        });
      };

      return pc;
    },
    [appointmentId]
  );

  // ── Main Effect ──────────────────────────────────────────────────────────

  useEffect(() => {
    // Only initialize WebRTC & Socket if this tab is active and not a duplicate
    if (!appointmentId || !userId || !isActiveTab || isDuplicateTab || isTakenOver) {
      return;
    }

    let isMounted = true;

    // ── Helper: acquire camera + mic with graceful fallback ───────────────
    const getLocalStream = async (): Promise<MediaStream> => {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } catch (firstErr: any) {
        if (firstErr?.name === "OverconstrainedError" || firstErr?.name === "ConstraintNotSatisfiedError") {
          console.warn("[useWebRTC] Constraints rejected, retrying with defaults…");
          return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        }
        throw firstErr;
      }
    };

    // ── Step 1: Acquire local media ──────────────────────────────────────
    const initCall = async () => {
      try {
        const stream = await getLocalStream();

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Attach local stream to the local video element immediately.
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // ── Step 2: Request appointment-specific Join Token from Backend (§18.2) ──
        let joinTokenData: { token: string; jti?: string; sessionId?: string; expiresInSeconds?: number };
        try {
          const isRejoining = hasJoinedOnceRef.current;
          const res = await appointmentService.getJoinToken(appointmentId, isRejoining);
          joinTokenData = res;
          currentJoinTokenRef.current = res.token;
          hasJoinedOnceRef.current = true;
        } catch (tokenErr: any) {
          console.error("[useWebRTC] Failed to obtain join token:", tokenErr);
          if (!isMounted) return;

          const status = tokenErr?.response?.status;
          const errData = tokenErr?.response?.data;
          const code = errData?.code;
          let msg = errData?.message;

          if (code === "NOT_AUTHORIZED" || status === 403) {
            msg = msg || "Unauthorized: You are not an assigned participant for this appointment.";
          } else if (code === "JOIN_TOO_EARLY") {
            msg = msg || (errData?.earlyJoinAt 
              ? `Consultation room opens at ${new Date(errData.earlyJoinAt).toLocaleTimeString()}`
              : "Consultation room is not open yet.");
          } else if (code === "JOIN_WINDOW_CLOSED") {
            msg = msg || "The join window for this appointment has closed.";
          } else if (code === "SESSION_TERMINAL") {
            msg = msg || "This consultation session has ended.";
          } else if (status === 404) {
            msg = msg || "Appointment not found.";
          } else {
            msg = msg || "Failed to obtain secure consultation join token.";
          }

          setError(msg);
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => {
              try { t.stop(); } catch (_) {}
            });
            localStreamRef.current = null;
            setLocalStream(null);
          }
          return;
        }

        if (!isMounted) return;

        // ── Step 3: Connect dedicated signaling socket ─────────────────
        const newSocket = io(
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
          {
            withCredentials: true,
            auth: {
              token: token || undefined, // Normal user JWT preserves user auth & socket.userId binding
              joinToken: joinTokenData.token, // Issued appointment-specific join token
              roomToken: joinTokenData.token,
            },
          }
        );  
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.info("[socket] signaling connected", {
            appointmentId,
            role,
            socketId: newSocket.id,
            transport: newSocket.io.engine?.transport?.name,
          });
          newSocket.emit("register", { userId, role });
          console.info("[socket] join_room emitted", { appointmentId, role, socketId: newSocket.id });
          newSocket.emit("join_room", { appointmentId, joinToken: currentJoinTokenRef.current });
          if (role?.toLowerCase() === "patient") {
            console.info("[socket] join_waiting_room emitted", { appointmentId, role, socketId: newSocket.id });
            newSocket.emit("join_waiting_room", { appointmentId });
          }
        });

        // ── Fresh token lifecycle on reconnect (§18.2, §18.3) ────────
        // Reconnect must obtain a fresh token with isRejoin: true to avoid replay rejection
        newSocket.io.on("reconnect_attempt", async (attempt) => {
          console.log(`[useWebRTC] Reconnect attempt #${attempt}. Fetching fresh join token...`);
          try {
            const freshRes = await appointmentService.getJoinToken(appointmentId, true);
            currentJoinTokenRef.current = freshRes.token;
            newSocket.auth = {
              token: token || undefined,
              joinToken: freshRes.token,
              roomToken: freshRes.token,
            };
          } catch (reconnectErr: any) {
            console.error("[useWebRTC] Failed to refresh join token on reconnect:", reconnectErr);
            const status = reconnectErr?.response?.status;
            const code = reconnectErr?.response?.data?.code;
            if (status === 403 || code === "SESSION_TERMINAL") {
              newSocket.disconnect();
              setError(reconnectErr?.response?.data?.message || "Consultation session ended or unauthorized.");
            }
          }
        });

        newSocket.on("connect_error", async (err: any) => {
          console.warn("[socket] signaling connect_error", {
            appointmentId,
            role,
            message: err.message,
          });
          if (
            err?.message?.includes("TOKEN_EXPIRED") ||
            err?.message?.includes("TOKEN_REPLAYED") ||
            err?.message?.includes("jwt expired") ||
            err?.message?.includes("Invalid or expired join token")
          ) {
            try {
              console.log("[useWebRTC] Token expired/replayed. Fetching fresh join token for reconnect...");
              const freshRes = await appointmentService.getJoinToken(appointmentId, true);
              currentJoinTokenRef.current = freshRes.token;
              newSocket.auth = {
                token: token || undefined,
                joinToken: freshRes.token,
                roomToken: freshRes.token,
              };
              newSocket.connect();
              return;
            } catch (refreshErr: any) {
              console.error("[useWebRTC] Failed to refresh join token after connect_error:", refreshErr);
              setError(refreshErr?.response?.data?.message || refreshErr?.message || "Authentication error connecting to call.");
              newSocket.disconnect();
              return;
            }
          }
          if (err?.message?.includes("Unauthorized")) {
            setError(err.message);
          }
        });

        newSocket.on("call_error", (payload: { message?: string; code?: string }) => {
          console.error("[useWebRTC] Backend call_error received:", payload);
          setError(payload?.message || "Call error occurred.");
          if (payload?.code === "SESSION_TERMINAL") {
            setIsCallEnded(true);
          }
        });

        newSocket.on("waiting_room_status", (payload: WaitingRoomStatus) => {
          console.log("[useWebRTC] waiting_room_status received:", payload);
          setWaitingRoomStatus(payload);
        });

        newSocket.on("peer_temporarily_disconnected", (payload: any) => {
          console.warn("[useWebRTC] peer_temporarily_disconnected received:", payload);
          setReconnectionGrace({
            isDisconnected: true,
            userRole: payload?.userRole || (role?.toLowerCase() === "doctor" ? "patient" : "doctor"),
            userId: payload?.userId,
            gracePeriodSeconds: payload?.gracePeriodSeconds || 30,
            disconnectedAt: Date.now(),
          });
        });

        newSocket.on("peer_reconnected", (payload: any) => {
          console.log("[useWebRTC] peer_reconnected received:", payload);
          setReconnectionGrace(null);
        });

        // ── Step 3: Wire signaling events ─────────────────────────────

        newSocket.on(
          "join_rejected",
          (payload: { reason?: string; code?: string; message?: string }) => {
            console.warn("[useWebRTC] Server rejected join:", payload);
            if (
              payload?.code === "MULTIPLE_TABS_DETECTED" ||
              payload?.reason === "ALREADY_IN_ROOM"
            ) {
              setDuplicateDetected();
            } else {
              setError(payload?.message || "Join rejected by server.");
            }
            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((t) => {
                try {
                  t.stop();
                } catch (e) { }
              });
              localStreamRef.current = null;
              setLocalStream(null);
            }
            newSocket.disconnect();
          }
        );

        newSocket.on("peer_joined", async () => {
          console.info("[webrtc-signal] peer_joined received; creating offer", { appointmentId, role, socketId: newSocket.id });
          setReconnectionGrace(null);

          const pc = createPeerConnection(newSocket);
          peerConnectionRef.current = pc;

          localStreamRef.current
            ?.getTracks()
            .forEach((track) =>
              pc.addTrack(track, localStreamRef.current!)
            );

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          newSocket.emit("webrtc_offer", { appointmentId, offer });
          console.info("[webrtc-signal] offer emitted", { appointmentId, role, socketId: newSocket.id });
        });

        newSocket.on(
          "webrtc_offer",
          async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
            console.info("[webrtc-signal] offer received; creating answer", { appointmentId, role, socketId: newSocket.id });
            setReconnectionGrace(null);

            const pc = createPeerConnection(newSocket);
            peerConnectionRef.current = pc;

            localStreamRef.current
              ?.getTracks()
              .forEach((track) =>
                pc.addTrack(track, localStreamRef.current!)
              );

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            newSocket.emit("webrtc_answer", { appointmentId, answer });
            console.info("[webrtc-signal] answer emitted", { appointmentId, role, socketId: newSocket.id });
          }
        );

        newSocket.on(
          "webrtc_answer",
          async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
            console.info("[webrtc-signal] answer received", { appointmentId, role, socketId: newSocket.id });
            setReconnectionGrace(null);
            await peerConnectionRef.current?.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        );

        newSocket.on(
          "webrtc_ice_candidate",
          async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            console.info("[webrtc] ICE candidate received", { appointmentId, role });
            try {
              await peerConnectionRef.current?.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (err) {
              console.warn("[useWebRTC] Error adding ICE candidate:", err);
            }
          }
        );

        newSocket.on("call_timer_started", (payload) => {
          console.log("[useWebRTC] Timer started:", payload);
          setTimerConfig(payload);
        });

        // ── Extension Events ─────────────────────────────────────────────
        // Server emits extension_granted after doctor clicks Extend.
        // Contains the calculated deadline (Condition A or B).
        newSocket.on("extension_granted", (payload: ExtensionState) => {
          console.log("[useWebRTC] Extension granted:", payload);
          setTimerConfig((prev) => prev ? {
            ...prev,
            isAlreadyExtended: true,
            maxExtensionMinutes: payload.maxExtensionMinutes,
          } : prev);
          // The actual deadline handling is done via handleExtensionGranted
          // in useCallTimer, which VideoCallRoom wires up.
        });

        // Server emits extension_denied if wrap-up is already active
        newSocket.on("extension_denied", (payload: { reason: string; message: string }) => {
          console.warn("[useWebRTC] Extension denied:", payload);
        });

        // Server emits extension_deadline_updated when a next patient joins
        // the waiting room and tightens the existing extension deadline.
        newSocket.on("extension_deadline_updated", (payload) => {
          console.log("[useWebRTC] Extension deadline updated:", payload);
        });

        // Bug 11: Update timerConfig dynamically when urgent-slot-booked is received
        newSocket.on("urgent-slot-booked", (payload) => {
          console.log("[useWebRTC] Received urgent-slot-booked:", payload);
          setTimerConfig((prev) => prev ? { ...prev, isNextSlotBooked: true, nextSlotStatus: 'PATIENT_LATE' } : prev);
        });

        newSocket.on("call_error", (payload: { message: string }) => {
          console.error("[useWebRTC] Backend rejected join:", payload.message);
          if (isMounted) {
            console.log(1);

            setError(payload.message);
            if (
              payload.message === 'This consultation has already ended.' ||
              payload.message?.includes('expired') ||
              payload.message?.includes('ended') ||
              payload.message?.toLowerCase().includes('in-person')
            ) {
              if (typeof window !== "undefined" && appointmentId) {
                sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
                sessionStorage.removeItem(`consultation_rx_${appointmentId}`);
                sessionStorage.removeItem(`consultation_files_${appointmentId}`);
                sessionStorage.removeItem(`consultation_notes_${appointmentId}`);
                sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
              }
              const destination = role?.toLowerCase() === "doctor" ? "/doctor/appointments" : "/patient/appointments";
              const doNavigate = () => router.replace(destination);
              if (rewindBeforeNavigate) {
                rewindBeforeNavigate().then(doNavigate);
              } else {
                doNavigate();
              }
            }
            setIsCallEnded(true);
          }
          newSocket.disconnect();
        });

        newSocket.on("call_ended", (payload) => {
          console.log("[useWebRTC] Call officially ended by backend.", payload);
          setTerminationInfo({
            reason: payload?.reason || "consultation_ended",
            message: payload?.message || "Consultation successfully concluded and completed.",
          });
          setIsCallEnded(true);
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => {
              try {
                t.stop();
              } catch (e) {
                console.warn("[useWebRTC] Error stopping track:", e);
              }
            });
            localStreamRef.current = null;
            setLocalStream(null);
          }
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          setRemoteStream(null);
          setIsRemoteReady(false);
          peerConnectionRef.current?.close();
          peerConnectionRef.current = null;

          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
            sessionStorage.removeItem(`consultation_rx_${appointmentId}`);
            sessionStorage.removeItem(`consultation_files_${appointmentId}`);
            sessionStorage.removeItem(`consultation_notes_${appointmentId}`);
            sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
          }

          setTimeout(() => {
            if (onCallEnded) {
              onCallEnded();
            } else {
              const destination =
                role?.toLowerCase() === "doctor"
                  ? "/doctor/dashboard"
                  : `/patient/appointments?appointmentId=${appointmentId}&reviewModal=true`;
              router.replace(destination);
            }
          }, 2500);
        });

        // force_end_call: server-enforced hard cut (Online→Offline strict termination)
        newSocket.on("force_end_call", (payload) => {
          console.log("[useWebRTC] force_end_call received from server. Hard-terminating call.", payload);
          const reason = payload?.reason || "SYSTEM_TERMINATED";
          let message = payload?.message;
          if (!message) {
            if (
              reason === "HANDOVER_AUTO_CUT" ||
              reason === "next_patient_live" ||
              reason === "next_patient_waiting" ||
              reason === "next_patient_time_reached"
            ) {
              message = "Call ended by next patient handover. Please return to dashboard.";
            } else if (reason === "MAX_EXTENSION_HARD_STOP" || reason === "max_extension_reached") {
              message = "Maximum extension limit reached. Consultation automatically concluded.";
            } else {
              message = "Consultation terminated by system.";
            }
          }

          setTerminationInfo({
            reason,
            message,
            nextAppointmentId: payload?.appointmentId || payload?.nextAppointmentId,
            patientName: payload?.patientName,
          });

          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch (_) { } });
            localStreamRef.current = null;
            setLocalStream(null);
          }
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          setRemoteStream(null);
          setIsRemoteReady(false);
          peerConnectionRef.current?.close();
          peerConnectionRef.current = null;
          setIsCallEnded(true);

          // Patient cannot rejoin after force_end_call
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
            sessionStorage.removeItem(`consultation_rx_${appointmentId}`);
            sessionStorage.removeItem(`consultation_files_${appointmentId}`);
            sessionStorage.removeItem(`consultation_notes_${appointmentId}`);
            sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
            if (payload?.appointmentId && (payload?.reason === 'next_patient_live' || payload?.reason === 'next_patient_time_reached' || payload?.reason === 'HANDOVER_AUTO_CUT')) {
              sessionStorage.setItem('pending_patient_b', JSON.stringify({
                appointmentId: payload.appointmentId,
                patientName: payload.patientName || 'Next Patient',
              }));
            }
          }
          if (onCallEnded) {
            onCallEnded();
          } else {
            const isNextPatientCut =
              payload?.reason === 'next_patient_live' ||
              payload?.reason === 'next_patient_time_reached' ||
              payload?.reason === 'HANDOVER_AUTO_CUT';
            const destination =
              role?.toLowerCase() === "doctor"
                ? (isNextPatientCut && payload?.appointmentId
                  ? `/doctor/dashboard?promptJoin=true&patientBId=${payload.appointmentId}&patientBName=${encodeURIComponent(payload.patientName || '')}`
                  : "/doctor/dashboard")
                : `/patient/appointments?appointmentId=${appointmentId}&reviewModal=true`;
            router.replace(destination);
          }
        });


        newSocket.on("peer_left", () => {
          console.log("[useWebRTC] Peer left the call.");
          setReconnectionGrace(null);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          setRemoteStream(null);
          setIsRemoteReady(false);
          peerConnectionRef.current?.close();
          peerConnectionRef.current = null;
        });

        newSocket.on("disconnect", (reason) => {
          console.warn("[socket] signaling disconnected", { appointmentId, role, socketId: newSocket.id, reason });
        });
      } catch (err: any) {
        console.error("[useWebRTC] Initialization failed:", err);
        if (isMounted) {
          let message: string;
          switch (err?.name) {
            case "NotAllowedError":
            case "PermissionDeniedError":
              message = "Camera/microphone permission denied. Please click the camera icon in your browser's address bar to allow access, then refresh.";
              break;
            case "NotReadableError":
            case "AbortError":
              message = "Camera or microphone is already in use by another application or browser tab. Please close the other app/tab and refresh.";
              break;
            case "NotFoundError":
            case "DevicesNotFoundError":
              message = "No camera or microphone was found on this device. Please connect one and refresh.";
              break;
            default:
              message = `Could not start video call: ${err?.message ?? "Unknown error"}`;
          }
          setError(message);
        }
      }
    };

    initCall();

    return () => {
      isMounted = false;
      currentJoinTokenRef.current = null;
      if (socketRef.current && role?.toLowerCase() === "patient" && appointmentId) {
        try {
          socketRef.current.emit("leave_waiting_room", { appointmentId });
        } catch (_) {}
      }
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [appointmentId, userId, role, isActiveTab, isDuplicateTab, isTakenOver, createPeerConnection, setDuplicateDetected]);

  // ── Actions ─────────────────────────────────────────────────────────────

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const cleanupMediaAndConnections = useCallback(() => {
    // 1. Release active tab ownership
    releaseTab();

    // 2. Stop local media tracks immediately
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.warn("[useWebRTC] Failed to stop track:", err);
        }
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // 3. Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (err) {
        console.warn("[useWebRTC] Failed to close peer connection:", err);
      }
      peerConnectionRef.current = null;
    }

    // 4. Socket cleanup: Disconnect cleanly without emitting end_call (which is reserved strictly for endCall)
    if (socketRef.current) {
      try {
        const sock = socketRef.current;
        setTimeout(() => {
          try {
            sock.disconnect();
          } catch (_) { }
        }, 300);
      } catch (err) {
        console.warn("[useWebRTC] Failed to disconnect socket:", err);
      }
      socketRef.current = null;
      setSocket(null);
    }
    currentJoinTokenRef.current = null;
  }, [releaseTab]);

  const endCall = useCallback(async (): Promise<ManualEndLockResult | void> => {
    const isDoctor = role?.toLowerCase() === "doctor";

    // ── Check Manual End Lock via REST for Doctor (§8) ──────────────────────
    if (isDoctor && appointmentId) {
      try {
        const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/appointments/${appointmentId}/end-call`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.code === "MANUAL_END_LOCKED") {
            console.warn("[useWebRTC] End call locked by backend:", data);
            return {
              locked: true,
              elapsedSeconds: data.elapsedSeconds ?? 0,
              remainingSeconds: data.remainingSeconds ?? 180,
              manualEndAllowedAt: data.manualEndAllowedAt,
              message:
                data.message ||
                "Minimum 3 continuous minutes of consultation is required before ending this session.",
            };
          }
        }
      } catch (e) {
        console.warn("[useWebRTC] Verification end-call REST failed:", e);
      }
    }

    // Explicit call termination: emit end_call or leave_room
    if (socketRef.current) {
      try {
        if (isDoctor) {
          socketRef.current.emit("end_call", { appointmentId });
        } else {
          socketRef.current.emit("leave_room", { appointmentId });
        }
      } catch (err) {
        console.warn("[useWebRTC] Failed to emit end_call/leave_room in endCall:", err);
      }
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
      sessionStorage.removeItem(`consultation_rx_${appointmentId}`);
      sessionStorage.removeItem(`consultation_files_${appointmentId}`);
      sessionStorage.removeItem(`consultation_notes_${appointmentId}`);
      sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
    }

    // Buffer to ensure WebSocket packet flushes before local media teardown & navigation
    setTimeout(() => {
      cleanupMediaAndConnections();
      setIsCallEnded(true);

      if (onCallEnded) {
        onCallEnded();
      } else {
        const destination = isDoctor
          ? "/doctor/dashboard"
          : `/patient/appointments?appointmentId=${appointmentId}&reviewModal=true`;
        const doNavigate = () => router.replace(destination);
        if (rewindBeforeNavigate) {
          rewindBeforeNavigate().then(doNavigate);
        } else {
          doNavigate();
        }
      }
    }, 150);

    return { locked: false };
  }, [cleanupMediaAndConnections, role, appointmentId, router, onCallEnded, rewindBeforeNavigate, token]);

  return {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
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
    waitingRoomStatus,
    reconnectionGrace,
    terminationInfo,
  };
}

