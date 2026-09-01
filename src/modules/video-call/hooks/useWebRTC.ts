/**
 * useWebRTC.ts
 *
 * Hooks Layer — src/modules/video-call/hooks/
 *
 * Architecture Notes (per frontend_plan.md):
 *  - Uses Native RTCPeerConnection — no Agora, no third-party RTC libs.
 *  - Maintains its own dedicated socket connection for the call lifetime.
 *    This is intentional: the global useSocket is for notifications/chat;
 *    this socket is exclusively for WebRTC signaling.
 *  - All WebRTC state is local (useRef / useState). Do NOT lift to Redux.
 *  - The hook is symmetrical: both the doctor and patient run the same logic.
 *    The "offerer" role is determined by who receives the `peer_joined` event
 *    (i.e., the second person to join creates and sends the offer).
 */ 

import React, { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { TimerConfig } from "./useCallTimer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseWebRTCOptions {
  /** MongoDB ObjectId of the appointment — used as the socket room key. */
  appointmentId: string;
  /** The authenticated user's ID, forwarded to the server for logging. */
  userId: string;
  /** "doctor" | "patient" — forwarded to the server for logging. */
  role: string;
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
  /** Timer Config from Server */
  timerConfig: TimerConfig | null;
  /** The active socket instance so parent components can listen to custom events */
  socket: Socket | null;
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
}: UseWebRTCOptions): UseWebRTCReturn {
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
  
  // Track socket in state so parent components can attach their own listeners
  const [socket, setSocket] = useState<Socket | null>(null);

  const [timerConfig, setTimerConfig] = useState<TimerConfig | null>(null);

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
    if (!appointmentId || !userId) return;

    // ── StrictMode guard ────────────────────────────────────────────────
    if (activeCallSessions.has(appointmentId)) return;
    activeCallSessions.add(appointmentId);

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

        newSocket.on("call_error", (payload: { message: string }) => {
          console.error("[useWebRTC] Backend rejected join:", payload.message);
          if (isMounted) {
            setError(payload.message);
            setIsCallEnded(true);
          }
          newSocket.disconnect();
        });

        newSocket.on("call_ended", (payload) => {
          console.log("[useWebRTC] Call officially ended by backend.", payload);
          setIsCallEnded(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          setRemoteStream(null);
          setIsRemoteReady(false);
          peerConnectionRef.current?.close();
          peerConnectionRef.current = null;
          
          setTimeout(() => {
            window.location.href = role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
          }, 3000);
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
      activeCallSessions.delete(appointmentId);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [appointmentId, userId, role, createPeerConnection]);

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

  // const endCall = useCallback(() => {
  //   if (socketRef.current) {
  //     if (role === 'doctor') {
  //       socketRef.current.emit("end_call", { appointmentId });
  //     } else {
  //       socketRef.current.disconnect();
  //     }
  //   }
  //   // later we need to create here  review page logic for patient 
  //   window.location.href = role === "doctor" ? "/doctor/dashboard" : "/patient/appointments";
  // }, [role, appointmentId]);

  const endCall = useCallback(() => {
    if (socketRef.current) {
      if (role === 'doctor') {
        socketRef.current.emit("end_call", { appointmentId });
      } else {
        socketRef.current.disconnect();
      }
    }
    // later we need to create here  review page logic for patient 
    window.location.href = role === "doctor" ? "/doctor/dashboard" : "/patient/appointments";
  }, [role, appointmentId]);

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
    timerConfig,
    socket
  };
}
