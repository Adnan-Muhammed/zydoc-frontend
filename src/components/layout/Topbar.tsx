'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useSocket } from '../../hooks/useSocket';
import { fetchNotifications, markNotificationRead } from '../../redux/features/notification/notificationThunk';
import { NotificationItem } from '../../redux/features/notification/notificationService';
import {
  fetchAdminNotifications,
  markAdminNotifRead,
  markAllAdminNotifsRead,
} from '@/redux/features/admin/adminThunk';
import { AdminNotification } from '@/redux/features/admin/adminTypes';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import { logoutUser } from '@/redux/auth/authThunk';

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
  const { adminNotifications, adminUnreadCount } = useAppSelector((state) => state.admin);
  const { doctorAppointments, waitingRoomPresence } = useAppSelector((state) => state.appointment);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Get correct ID based on the user object shape
  const userId = (user as any)?.profileId || user?.id || (user as any)?._id;

  // Initialize socket for real-time notifications
  useSocket({ userId, role });

  useEffect(() => {
    if (role === 'admin') {
      dispatch(fetchAdminNotifications());
    } else if (userId) {
      dispatch(fetchNotifications());
    }
  }, [role, userId, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
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

  const handleAdminNotificationClick = (notif: AdminNotification) => {
    if (!notif.isRead && !notif._id.startsWith('alert-')) {
      dispatch(markAdminNotifRead(notif._id));
    }
    setDropdownOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllAdminRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markAllAdminNotifsRead());
  };

  const displayTitle = title || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard` : 'Dashboard');

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const recentNotifications = notifications.filter(n => !n.isRead).slice(0, 5);

  const waitingPatients = role === 'doctor' && doctorAppointments && waitingRoomPresence
    ? doctorAppointments.filter(appt => waitingRoomPresence[appt._id])
    : [];

  const effectiveUnreadCount = role === 'admin' ? adminUnreadCount : unreadCount;
  const totalBadges = role === 'admin' ? adminUnreadCount : unreadCount + waitingPatients.length;

  const pathname = usePathname();
  const isConsultation = pathname?.includes('/consultation/');

  const handleLogout = () => {
    setProfileMenuOpen(false);
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        const target = role === 'admin' ? '/admin/login' : '/';
        router.replace(target);
        router.refresh();
      })
      .catch((err: unknown) => {
        console.error('Logout failed:', err);
        const target = role === 'admin' ? '/admin/login' : '/';
        router.replace(target);
        router.refresh();
      });
  };

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
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                if (!dropdownOpen && role === 'admin') {
                  dispatch(fetchAdminNotifications());
                }
              }}
              className="topbar-icon-btn flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative"
              title="Notifications & Alerts"
            >
              <i className="fas fa-bell"></i>
              {totalBadges > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white px-1 shadow-sm animate-pulse">
                  {totalBadges > 99 ? '99+' : totalBadges}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800">
                      {role === 'admin' ? 'System Alerts & Notifications' : 'Notifications'}
                    </h3>
                    {effectiveUnreadCount > 0 && (
                      <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        {effectiveUnreadCount} new
                      </span>
                    )}
                  </div>
                  {role === 'admin' && adminUnreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAdminRead}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                  {/* ADMIN ROLE NOTIFICATIONS */}
                  {role === 'admin' ? (
                    adminNotifications.length > 0 ? (
                      adminNotifications.map((notif) => {
                        const isApproval = notif.type === 'APPROVAL_PENDING';
                        const isRefund = notif.type === 'REFUND_PENDING';
                        const isDisputed =
                          notif.title.includes('Disputed') || notif.title.includes('No-Show');

                        return (
                          <div
                            key={notif._id}
                            onClick={() => handleAdminNotificationClick(notif)}
                            className={`p-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors border-l-4 ${
                              !notif.isRead
                                ? isApproval
                                  ? 'bg-amber-50/50 border-amber-500'
                                  : isRefund
                                  ? 'bg-rose-50/50 border-rose-500'
                                  : isDisputed
                                  ? 'bg-orange-50/50 border-orange-500'
                                  : 'bg-indigo-50/40 border-indigo-500'
                                : 'bg-white border-transparent opacity-80 hover:opacity-100'
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-xs ${
                                  isApproval
                                    ? 'bg-amber-100 text-amber-700'
                                    : isRefund
                                    ? 'bg-rose-100 text-rose-700'
                                    : isDisputed
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                <i
                                  className={
                                    isApproval
                                      ? 'fas fa-user-check'
                                      : isRefund
                                      ? 'fas fa-hand-holding-dollar'
                                      : isDisputed
                                      ? 'fas fa-triangle-exclamation'
                                      : 'fas fa-bell'
                                  }
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p
                                    className={`text-xs truncate ${
                                      !notif.isRead
                                        ? 'font-bold text-slate-900'
                                        : 'font-semibold text-slate-700'
                                    }`}
                                  >
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {timeAgo(notif.createdAt)}
                                  </span>
                                  {notif.link && (
                                    <span className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                      Take Action <i className="fas fa-chevron-right text-[8px]" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3">
                          <i className="fas fa-shield-check"></i>
                        </div>
                        <p className="font-semibold text-slate-800">All systems clear</p>
                        <p className="text-xs text-slate-400 mt-1">No pending administrative alerts or flags</p>
                      </div>
                    )
                  ) : (
                    /* DOCTOR / PATIENT ROLE NOTIFICATIONS */
                    <>
                      {/* Early Arrival Waiting Room Notifications */}
                      {waitingPatients.length > 0 &&
                        waitingPatients.map((appt) => {
                          const patientName = appt.patientId?.profileId?.firstName
                            ? `${appt.patientId.profileId.firstName} ${
                                appt.patientId.profileId.lastName || ''
                              }`.trim()
                            : appt.patientId?.googleName || 'A patient';

                          return (
                            <div
                              key={`waiting-${appt._id}`}
                              onClick={() => {
                                setDropdownOpen(false);
                                router.push(`/doctor/consultation/${appt._id}?join=true`);
                              }}
                              className="p-4 cursor-pointer hover:bg-emerald-50 transition-colors border-l-4 bg-emerald-50/50 border-emerald-500"
                            >
                              <div className="flex gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-emerald-500 animate-pulse" />
                                <div>
                                  <p className="text-sm font-semibold text-emerald-800">
                                    Patient in Waiting Room
                                  </p>
                                  <p className="text-xs text-emerald-600 mt-1 line-clamp-2">
                                    {patientName} is waiting for their {appt.appointmentTime} slot.
                                    Click to join now.
                                  </p>
                                  <p className="text-[10px] text-emerald-500 mt-2 font-medium uppercase tracking-wider">
                                    Live Now
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Standard Notifications */}
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${
                              !notif.isRead
                                ? 'bg-green-50 border-green-500'
                                : 'bg-white border-transparent'
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                  !notif.isRead ? 'bg-green-500' : 'bg-transparent'
                                }`}
                              />
                              <div>
                                <p
                                  className={`text-sm ${
                                    !notif.isRead
                                      ? 'font-semibold text-slate-800'
                                      : 'font-medium text-slate-600'
                                  }`}
                                >
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                                  {timeAgo(notif.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : waitingPatients.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm flex flex-col items-center">
                          <i className="fas fa-check-circle text-2xl mb-2 text-green-500"></i>
                          <p>You have no unread notifications</p>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
                
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <Link 
                    href={`/${role}/notifications`}
                    onClick={() => setDropdownOpen(false)} 
                    className="block w-full text-center py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
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

          {/* Profile Dropdown Container */}
          <div ref={profileMenuRef} className="relative">
            <div 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="topbar-profile flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-100 transition-colors"
            >
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
              <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {/* Profile Dropdown Popover */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
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
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.name || `${role.charAt(0).toUpperCase() + role.slice(1)}`}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@zydoc.com'}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                        {role === 'admin' ? 'Administrator' : role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  {role === 'admin' ? (
                    <>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <i className="fas fa-gauge-high text-slate-400 w-4"></i>
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        href="/admin/approvals"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <i className="fas fa-user-check text-slate-400 w-4"></i>
                        <span>Doctor Approvals</span>
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <i className="fas fa-gear text-slate-400 w-4"></i>
                        <span>System Settings</span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/${role}/profile`}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <i className="fas fa-user text-slate-400 w-4"></i>
                      <span>My Profile</span>
                    </Link>
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                  >
                    <i className="fas fa-right-from-bracket text-red-500 w-4"></i>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}