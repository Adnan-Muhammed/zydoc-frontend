'use client';

import React from 'react';
import { useAppSelector } from '../../redux/hooks'; // redux

interface TopbarProps {
  onToggleSidebar: () => void;
  title?: string;
  role: string;
}

export default function Topbar({ onToggleSidebar, title = 'Dashboard', role }: TopbarProps) {
  const { user } = useAppSelector((state) => state.auth);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <header className="dashboard-topbar">
      <button className="topbar-menu-btn" onClick={onToggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>

      <div className="topbar-title">{title}</div>

      <div className="topbar-search">
        <i className="fas fa-search"></i>
        <input type="text" placeholder="Search anything..." />
      </div>

      <div className="topbar-actions">
        <div className="topbar-icon-btn" title="Notifications">
          <i className="fas fa-bell"></i>
          <span className="topbar-notif-dot"></span>
        </div>
        <div className="topbar-icon-btn" title="Messages">
          <i className="fas fa-envelope"></i>
        </div>
        <div className="topbar-profile">
          <div className="topbar-avatar">{getInitials(user?.name || role)}</div>
          <div className="topbar-name">{user?.name || `Demo ${role}`}</div>
          <i className="fas fa-chevron-down" style={{ fontSize: '11px', color: 'var(--gray-400)' }}></i>
        </div>
      </div>
    </header>
  );
}

