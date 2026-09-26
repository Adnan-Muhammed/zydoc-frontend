'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../redux/features/notification/notificationThunk';
import { NotificationItem } from '../../redux/features/notification/notificationService';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
  Calendar,
  CreditCard,
  CheckCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

const timeAgo = (date: string | Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
};

interface NotificationListProps { 
  role: string; 
}

export default function NotificationList({ role }: NotificationListProps) {
  const { notifications, loading, error, unreadCount } = useAppSelector((state) => state.notification);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const userId = (user as any)?.profileId || user?.id || (user as any)?._id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications());
    }
  }, [userId, dispatch]);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    
    // Route based on notification type and user role
    if (notification.type === 'BOOKING') {
      router.push(`/${role}/appointments`);
    } else if (notification.type === 'PAYMENT') {
      router.push(`/${role}/payments`);
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent"></div>
        <p className="text-xs font-medium text-slate-400">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-7 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#101044] tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} across your consultations and account.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all active:scale-98 shadow-2xs"
            >
              <CheckCheck className="w-4 h-4 text-indigo-600" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-700 text-xs font-medium border-b border-rose-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Notifications Feed */}
        <div className="divide-y divide-slate-100">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const isBooking = notif.type === 'BOOKING';
              const isPayment = notif.type === 'PAYMENT';

              return (
                <div 
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-5 sm:p-6 flex items-start gap-4 transition-all cursor-pointer hover:bg-slate-50/80 ${
                    !notif.isRead 
                      ? 'bg-indigo-50/25 border-l-4 border-l-indigo-600' 
                      : 'bg-white border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs ${
                      isBooking 
                        ? 'bg-blue-50 text-blue-600 border-blue-100/80' 
                        : isPayment 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/80' 
                        : 'bg-slate-100 text-slate-600 border-slate-200/80'
                    }`}>
                      {isBooking ? (
                        <Calendar className="w-5 h-5" />
                      ) : isPayment ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <p className={`text-sm sm:text-base truncate ${
                        !notif.isRead 
                          ? 'font-bold text-[#101044]' 
                          : 'font-semibold text-slate-700'
                      }`}>
                        {notif.title}
                      </p>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                  </div>

                  {!notif.isRead && (
                    <div className="flex-shrink-0 flex items-center justify-center pt-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center text-slate-500">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-2xs">
                <BellOff className="w-9 h-9" />
              </div>
              <h3 className="text-base font-bold text-[#101044] mb-1">No notifications yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You're all caught up! New appointment bookings, messages, and payout updates will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
