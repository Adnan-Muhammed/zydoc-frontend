import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface UseSocketProps {
  userId?: string | null;
  role?: string | null;
}

export const useSocket = ({ userId, role }: UseSocketProps) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if we have a userId
    if (!userId) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      // Register user with socket server
      socket.emit('register', { userId, role });
    });

    socket.on('new_booking', (payload: any) => {
      console.log('New booking notification received:', payload);
      setHasUnreadNotifications(true);
      toast.success(payload.message || 'New Appointment Received!', {
        duration: 4000,
        position: 'top-right',
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, role]);

  const markNotificationsAsRead = () => {
    setHasUnreadNotifications(false);
  };

  return {
    socket: socketRef.current,
    hasUnreadNotifications,
    markNotificationsAsRead,
  };
};
