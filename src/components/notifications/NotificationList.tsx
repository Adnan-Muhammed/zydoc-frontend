'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../redux/features/notification/notificationThunk';
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
  ChevronRight,
  Info,
  Filter,
  CheckCircle2
} from 'lucide-react';

const timeAgo = (date: string | Date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 30) return 'Just now';
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return Math.floor(seconds) + 's ago';
};

interface NotificationListProps {
  role: 'patient' | 'doctor' | 'admin' | string;
}

export default function NotificationList({ role }: NotificationListProps) {
  const { notifications, loading, error, unreadCount } = useAppSelector((state) => state.notification);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'booking' | 'payment'>('all');

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

    // Role-specific intelligent routing
    if (notification.type === 'BOOKING') {
      router.push(`/${role}/appointments`);
    } else if (notification.type === 'PAYMENT') {
      if (role === 'doctor') {
        router.push('/doctor/earnings');
      } else if (role === 'patient') {
        router.push('/patient/wallet');
      } else {
        router.push('/admin/transactions');
      }
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    return notifications.filter((notif) => {
      if (activeFilter === 'unread') return !notif.isRead;
      if (activeFilter === 'booking') return notif.type === 'BOOKING';
      if (activeFilter === 'payment') return notif.type === 'PAYMENT';
      return true;
    });
  }, [notifications, activeFilter]);

  if (loading && notifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="size-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-slate-400">Loading your notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 lg:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50/40">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="size-8 sm:size-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Bell className="size-4 sm:size-4.5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#101044] tracking-tight truncate">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-10 sm:pl-11">
              Stay informed on appointment bookings, schedules, and account updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition active:scale-95 shadow-2xs self-start sm:self-auto shrink-0 w-full sm:w-auto"
            >
              <CheckCheck className="size-4 text-indigo-600" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs (Horizontal Scrollable on Mobile) */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#181852] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'unread'
                ? 'bg-[#181852] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`size-1.5 rounded-full ${
                  activeFilter === 'unread' ? 'bg-amber-400' : 'bg-indigo-600'
                }`}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('booking')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeFilter === 'booking'
                ? 'bg-[#181852] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('payment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeFilter === 'payment'
                ? 'bg-[#181852] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Payments
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-medium border-b border-rose-100 flex items-center gap-2">
            <Info className="size-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Notifications Feed */}
        <div className="divide-y divide-slate-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const isBooking = notif.type === 'BOOKING';
              const isPayment = notif.type === 'PAYMENT';

              return (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4 transition-all cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/70 ${
                    !notif.isRead
                      ? 'bg-indigo-50/30 border-l-4 border-l-indigo-600'
                      : 'bg-white border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`size-9 sm:size-10 rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-2xs ${
                        isBooking
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : isPayment
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}
                    >
                      {isBooking ? (
                        <Calendar className="size-4 sm:size-4.5" />
                      ) : isPayment ? (
                        <CreditCard className="size-4 sm:size-4.5" />
                      ) : (
                        <Bell className="size-4 sm:size-4.5" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h2
                        className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                          !notif.isRead ? 'text-[#101044]' : 'text-slate-700'
                        }`}
                      >
                        {notif.title}
                      </h2>
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1">
                        <Clock className="size-2.5 sm:size-3 text-slate-300" />
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {notif.message}
                    </p>
                  </div>

                  {/* Right Status / Arrow */}
                  <div className="shrink-0 flex items-center justify-center pl-1 self-center">
                    {!notif.isRead ? (
                      <span className="size-2 rounded-full bg-indigo-600 animate-pulse" />
                    ) : (
                      <ChevronRight className="size-3.5 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 sm:p-16 text-center text-slate-500">
              <div className="size-16 sm:size-20 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 text-slate-300 shadow-2xs">
                <BellOff className="size-8 sm:size-9" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#101044] mb-1">No notifications found</h3>
              <p className="text-xs text-slate-400 max-w-xs sm:max-w-sm mx-auto">
                {activeFilter !== 'all'
                  ? `No notifications in the "${activeFilter}" category.`
                  : "You're all caught up! New appointment bookings, messages, and updates will appear here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
