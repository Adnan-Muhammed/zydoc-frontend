// src/hooks/useFcmForeground.tsx
'use client';

import React, { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import toast from 'react-hot-toast';
import { getFirebaseMessaging } from '@/lib/firebase/client';
import { useAppDispatch } from '@/redux/hooks';
import { addRealTimeNotification } from '@/redux/features/notification/notificationSlice';
import { fetchNotifications } from '@/redux/features/notification/notificationThunk';
import { fetchAdminNotifications } from '@/redux/features/admin/adminThunk';
import { fetchDoctorAppointments } from '@/redux/features/appointment/appointmentThunk';
import { NotificationItem } from '@/redux/features/notification/notificationService';

interface UseFcmForegroundProps {
  userId?: string | null;
  role?: string | null;
}

// Module-level cache to deduplicate foreground messages across components (e.g. Topbar and FcmTokenManager)
const seenForegroundNotificationIds = new Set<string>();

/**
 * useFcmForeground
 * Listens for FCM push notifications when the application is open in the foreground.
 * Displays an immediate toast and updates Redux state (badge count / notification list).
 */
export function useFcmForeground({ userId, role }: UseFcmForegroundProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unsubscribe: (() => void) | undefined;

    const setupForegroundListener = async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
          console.warn('[FCM] Firebase Messaging is not supported in this browser.');
          return;
        }

        // Listen for foreground push notifications
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[FCM] Foreground notification received:', payload);

          const notifId = payload.data?.notificationId || payload.messageId || `${payload.notification?.title || ''}-${payload.data?.referenceId || ''}-${Date.now()}`;
          if (seenForegroundNotificationIds.has(notifId)) {
            console.log('[FCM] Duplicate foreground notification suppressed:', notifId);
            return;
          }
          seenForegroundNotificationIds.add(notifId);
          setTimeout(() => seenForegroundNotificationIds.delete(notifId), 15000);

          const title = payload.notification?.title || payload.data?.title || 'New Notification';
          const body = payload.notification?.body || payload.data?.body || payload.data?.message || '';
          const rawType = payload.data?.type || 'general';
          const normalizedType = rawType.toLowerCase();

          // The actionable Socket.io toast handles patient arrivals while the
          // doctor is online. Avoid a second generic toast from foreground FCM.
          if (normalizedType === 'patient_live' || normalizedType === 'patient_waiting') return;

          // 1. Display Toast Notification
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex border border-gray-100 border-l-4 border-l-blue-600 p-4`}
              >
                <div className="flex-1 w-0">
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  {body && <p className="mt-1 text-xs text-gray-600 line-clamp-2">{body}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-3 text-gray-400 hover:text-gray-600 text-sm focus:outline-none"
                >
                  ✕
                </button>
              </div>
            ),
            { duration: 4500, position: 'top-right' }
          );

          // 2. Play subtle notification chime
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              const osc = ctx.createOscillator();
              const gainNode = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
              osc.connect(gainNode);
              gainNode.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.35);
            }
          } catch (_) {}

          // 3. Update Redux notification state in-memory (updates badge count instantly)
          const newNotificationItem: NotificationItem = {
            _id: payload.data?.notificationId || payload.messageId || `fcm-${Date.now()}`,
            recipientId: userId || '',
            recipientModel: role?.toLowerCase() === 'doctor' ? 'Doctor' : 'User',
            title,
            message: body,
            type: rawType,
            referenceId: payload.data?.referenceId || payload.data?.appointmentId,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          dispatch(addRealTimeNotification(newNotificationItem));

          // 4. Sync lists with backend
          if (role === 'admin') {
            dispatch(fetchAdminNotifications());
          } else if (userId) {
            dispatch(fetchNotifications());
          }

          // If this is a booking-related notification for a doctor, refresh appointment slots
          if (
            role?.toLowerCase() === 'doctor' &&
            (normalizedType === 'booking' || normalizedType === 'new_booking' || normalizedType === 'appointment_update')
          ) {
            dispatch(fetchDoctorAppointments());
          }
        });
      } catch (err) {
        console.error('[FCM] Error setting up foreground message listener:', err);
      }
    };

    setupForegroundListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch, userId, role]);
}

