'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../redux/features/notification/notificationThunk';
import { NotificationItem } from '../../redux/features/notification/notificationService';
import { useRouter } from 'next/navigation';

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <i className="fas fa-check-double mr-2"></i>
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100">
            {error}
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-6 flex gap-4 transition-colors cursor-pointer hover:bg-slate-50 border-l-4 ${!notif.isRead ? 'bg-green-50 border-green-500' : 'bg-white border-transparent'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notif.type === 'BOOKING' ? 'bg-blue-100 text-blue-600' :
                    notif.type === 'PAYMENT' ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <i className={`fas ${
                      notif.type === 'BOOKING' ? 'fa-calendar-alt' :
                      notif.type === 'PAYMENT' ? 'fa-credit-card' :
                      'fa-bell'
                    }`}></i>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <p className={`text-base truncate ${!notif.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{notif.message}</p>
                </div>

                {!notif.isRead && (
                  <div className="flex-shrink-0 flex items-center justify-center pl-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bell-slash text-3xl text-slate-300"></i>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-1">No notifications</h3>
              <p className="text-sm">You're all caught up! Check back later for updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
