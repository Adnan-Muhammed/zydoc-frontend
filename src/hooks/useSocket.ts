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
      toast.success(notification.title || 'New Notification!', {
        duration: 4000,
        position: 'top-right',
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, role, dispatch]);

  return {
    socket: socketRef.current,
  };
};
