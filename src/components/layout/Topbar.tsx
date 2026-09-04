'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useSocket } from '../../hooks/useSocket';
import { fetchNotifications, markNotificationRead } from '../../redux/features/notification/notificationThunk';
import { NotificationItem } from '../../redux/features/notification/notificationService';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

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

interface TopbarProps {
  onToggleSidebar: () => void;
  title?: string;
  role: string;
}

export default function Topbar({ onToggleSidebar, title, role }: TopbarProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get correct ID based on the user object shape
  const userId = (user as any)?.profileId || user?.id || (user as any)?._id;

  // Initialize socket for real-time notifications
  useSocket({ userId, role });

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications());
    }
  }, [userId, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    setDropdownOpen(false);
    
    // Route based on notification type and user role
    if (notification.type === 'BOOKING') {
      router.push(`/${role}/appointments`);
    } else if (notification.type === 'PAYMENT') {
      router.push(`/${role}/payments`);
    } else {
      router.push(`/${role}/notifications`);
    }
  };

  const displayTitle = title || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : 'Dashboard');

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const recentNotifications = notifications.filter(n => !n.isRead).slice(0, 5);

  const pathname = usePathname();
  const isConsultation = pathname?.includes('/consultation/');

  return (
    <header className="dashboard-topbar flex justify-between w-full h-16 bg-white border-b border-slate-200 px-4 sm:px-6 sticky top-0 z-40">
      <div className="topbar-left flex items-center gap-3 sm:gap-4 h-full">
        {!isConsultation ? (
          <button className="topbar-menu-btn text-slate-500 hover:text-slate-800" onClick={onToggleSidebar}>
            <i className="fas fa-bars text-lg"></i>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-base mr-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm shadow-sm">
              <i className="fas fa-stethoscope"></i>
            </div>
            <span className="hidden sm:inline text-slate-900 font-bold">Docti<span className="text-indigo-600">fy</span></span>
          </div>
        )}
        <h2 className="topbar-page-title text-base sm:text-lg font-semibold text-slate-800 m-0 whitespace-nowrap truncate max-w-[150px] sm:max-w-none">
          {displayTitle}
        </h2>
      </div>

      <div className="topbar-right flex items-center gap-2 sm:gap-4 h-full">
        <div className="topbar-search-container hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 gap-2 border border-slate-200">
          <i className="fas fa-search text-slate-400"></i>
          <input
            type="text"
            placeholder="Search anything..."
            className="topbar-search-input bg-transparent border-none outline-none text-sm text-slate-700 w-48 focus:ring-0"
          />
        </div>

        <div className="topbar-actions flex items-center gap-2 sm:gap-3 relative">
          
          {/* Notifications Dropdown Container */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="topbar-icon-btn flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative"
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white px-1 shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                
                <div className="max-h-[360px] overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${!notif.isRead ? 'bg-green-50 border-green-500' : 'bg-white border-transparent'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-green-500' : 'bg-transparent'}`} />
                          <div>
                            <p className={`text-sm ${!notif.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center">
                      <i className="fas fa-check-circle text-2xl mb-2 text-green-500"></i>
                      <p>You have no unread notifications</p>
                    </div>
                  )}
                </div>
                
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <Link 
                    href={`/${role}/notifications`}
                    onClick={() => setDropdownOpen(false)} 
                    className="block w-full text-center py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button className="topbar-icon-btn flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            <i className="fas fa-envelope"></i>
          </button>

          <div className="topbar-profile flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-100 transition-colors">
            <div className="topbar-avatar flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white text-xs font-semibold overflow-hidden shadow-sm">
              {user?.avatarUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.name || role)
              )}
            </div>
            <span className="topbar-user-name text-xs sm:text-sm font-medium text-slate-700 hidden sm:block">
              {user?.name || `Demo ${role}`}
            </span>
            <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
          </div>
        </div>
      </div>
    </header>
  );
}