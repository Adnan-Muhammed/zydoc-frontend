import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../redux/hooks';
import { addRealTimeNotification } from '../redux/features/notification/notificationSlice';

interface UseSocketProps {
  userId?: string | null;
  role?: string | null;
}

export const useSocket = ({ userId, role }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('register', { userId, role });
    });



    socket.on('new_notification', (notification: any) => {
      dispatch(addRealTimeNotification(notification));
      
      if (typeof document !== 'undefined') {
        if (document.visibilityState === 'visible') {
          // 1. Active Tab: Show in-app toast
          toast.success(notification.title || 'New Notification!', {
            duration: 4000,
            position: 'top-right',
          });
        } else {
          // 2. Background Tab: Trigger SYSTEM push notification
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(notification.title || "New Notification!", {
                body: notification.message || notification.body,
                icon: "/favicon.ico", // Ensure you have an icon, or it defaults
              });
            }
          }
          
          // Play a programmatic beep sound
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              const osc = ctx.createOscillator();
              const gainNode = ctx.createGain();
              
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch (A5)
              
              // Fade out to avoid clicks
              gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
              
              osc.connect(gainNode);
              gainNode.connect(ctx.destination);
              
              osc.start();
              osc.stop(ctx.currentTime + 0.5); // 500ms beep
            }
          } catch (e) {
            console.error("Audio playback failed", e);
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, role, dispatch]);

  return {
    socket: socketRef.current,
  };
};
