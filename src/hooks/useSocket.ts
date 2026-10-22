// src/hooks/useSocket.ts
'use client';

import { Socket } from 'socket.io-client';

interface UseSocketProps {
  userId?: string | null;
  role?: string | null;
}

/**
 * DEPRECATED: Global socket connection is removed in favor of Firebase Cloud Messaging (FCM).
 * Sockets are strictly restricted to Video Call and Consultation Room components.
 */
export const useSocket = (_props?: UseSocketProps): { socket: Socket | null } => {
  return { socket: null };
};
