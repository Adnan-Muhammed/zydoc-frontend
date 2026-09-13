// src/modules/video-call/hooks/useWebRTC.ts
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { TimerConfig, ExtensionState } from "./useCallTimer";
import { useCallTabSync } from "./useCallTabSync";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseWebRTCOptions {
  /** MongoDB ObjectId of the appointment — used as the socket room key. */
  appointmentId: string;
  /** The authenticated user's ID, forwarded to the server for logging. */
  userId: string;
  /** "doctor" | "patient" — forwarded to the server for logging. */
  role: string;
  onCallEnded?: () => void;
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
  endCall: () => void;
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
}: UseWebRTCOptions): UseWebRTCReturn {
  const router = useRouter();

  // ── Refs ────────────────────────────────────────────────────────────────
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);

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

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Create a fresh RTCPeerConnection and wire up its callbacks. */
  const createPeerConnection = useCallback(
    (socket: Socket): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // 1. Forward ICE candidates to the other peer via the signaling server.
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit("webrtc_ice_candidate", { appointmentId, candidate });
        }
      };

      // 2. Attach the remote stream to the remote video element when tracks arrive.
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteStream(event.streams[0]);
          setIsRemoteReady(true);
        }
      };

      // 3. Log connection state changes (useful for debugging).
      pc.onconnectionstatechange = () => {
        console.log(
          `[useWebRTC] PeerConnection state: ${pc.connectionState}`
        );
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

        // ── Step 2: Connect dedicated signaling socket ─────────────────
        const newSocket = io(
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
          { withCredentials: true }
        );
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("[useWebRTC] Signaling socket connected:", newSocket.id);
          newSocket.emit("register", { userId, role });
          newSocket.emit("join_room", { appointmentId });
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
                } catch (e) {}
              });
              localStreamRef.current = null;
              setLocalStream(null);
            }
            newSocket.disconnect();
          }
        );

        newSocket.on("peer_joined", async () => {
          console.log("[useWebRTC] Peer joined. Creating offer…");

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
        });

        newSocket.on(
          "webrtc_offer",
          async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
            console.log("[useWebRTC] Received offer. Creating answer…");

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
          }
        );

        newSocket.on(
          "webrtc_answer",
          async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
            console.log("[useWebRTC] Received answer. Setting remote desc…");
            await peerConnectionRef.current?.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        );

        newSocket.on(
          "webrtc_ice_candidate",
          async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
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
            if (payload.message === 'This consultation has already ended.' || payload.message?.includes('expired') || payload.message?.includes('ended')) {
              if (typeof window !== "undefined" && appointmentId) {
                sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
                sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
              }
              const destination = role?.toLowerCase() === "doctor" ? "/doctor/dashboard" : "/patient/appointments";
              router.replace(destination);
            }
            setIsCallEnded(true);
          }
          newSocket.disconnect();
        });

        newSocket.on("call_ended", (payload) => {
          console.log("[useWebRTC] Call officially ended by backend.", payload);
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
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch (_) {} });
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
            sessionStorage.setItem(`consultation_exited_${appointmentId}`, Date.now().toString());
          }
          if (onCallEnded) {
            onCallEnded();
          } else {
            const destination =
              role?.toLowerCase() === "doctor"
                ? "/doctor/dashboard"
                : `/patient/appointments?appointmentId=${appointmentId}&reviewModal=true`;
            router.replace(destination);
          }
        });


        newSocket.on("peer_left", () => {
          console.log("[useWebRTC] Peer left the call.");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          setRemoteStream(null);
          setIsRemoteReady(false);
          peerConnectionRef.current?.close();
          peerConnectionRef.current = null;
        });

        newSocket.on("disconnect", () => {
          console.log("[useWebRTC] Signaling socket disconnected.");
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
          } catch (_) {}
        }, 300);
      } catch (err) {
        console.warn("[useWebRTC] Failed to disconnect socket:", err);
      }
      socketRef.current = null;
      setSocket(null);
    }
  }, [releaseTab]);

  const endCall = useCallback(() => {
    // Explicit call termination: emit end_call to backend to mark appointment completed
    const isDoctor = role?.toLowerCase() === "doctor";
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

    // Dual-channel reliability: call backend REST endpoint as doctor to guarantee completion
    if (isDoctor && appointmentId) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "";
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/appointments/${appointmentId}/end-call`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: "include"
        }).catch((e) => console.warn("[useWebRTC] Fallback end-call REST failed:", e));
      } catch (e) {}
    }

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`consultation_chat_${appointmentId}`);
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
        router.replace(destination);
      }
    }, 150);
  }, [cleanupMediaAndConnections, role, appointmentId, router, onCallEnded]);

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
  };
}

