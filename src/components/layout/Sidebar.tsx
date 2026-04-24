'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks'; // redux
import { logoutUser } from '@/redux/auth/authThunk'; // redux

interface SidebarProps {
  role: 'admin' | 'doctor' | 'patient';
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  type Badge = {
    text: string;
    color: string;
  };

  type LinkItem = {
    href: string;
    icon: string;
    label: string;
    badge?: Badge;
  };

  type NavSection = {
    label: string;
    links: LinkItem[];
  };

  let navSections: NavSection[] = [];

  if (role === 'admin') {
    navSections = [
      {
        label: 'Overview',
        links: [
          { href: '/admin/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
          { href: '/admin/analytics', icon: 'fas fa-chart-line', label: 'Analytics' }
        ]
      },
      {
        label: 'User Management',
        links: [
          { href: '/admin/doctors', icon: 'fas fa-user-doctor', label: 'Doctors' },
          { href: '/admin/patients', icon: 'fas fa-users', label: 'Patients' },
          { href: '/admin/approvals', icon: 'fas fa-user-check', label: 'Approvals', badge: { text: '7', color: 'badge-yellow' } }
        ]
      },
      {
        label: 'System',
        links: [
          { href: '/admin/support', icon: 'fas fa-headset', label: 'Support', badge: { text: '12', color: 'badge-red' } },
          { href: '/admin/transactions', icon: 'fas fa-credit-card', label: 'Transactions' },
          { href: '/admin/settings', icon: 'fas fa-gear', label: 'Settings' }
        ]
      }
    ];
  } else if (role === 'doctor') {
    navSections = [
      {
        label: 'Consultations',
        links: [
          { href: '/doctor/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
          { href: '/doctor/appointments', icon: 'fas fa-calendar-check', label: 'Appointments' },
          { href: '/doctor/schedule', icon: 'fas fa-clock', label: 'My Schedule' }
        ]
      },
      {
        label: 'Patients',
        links: [
          { href: '/doctor/messages', icon: 'fas fa-comments', label: 'Messages', badge: { text: '3', color: 'badge-red' } },
          { href: '/doctor/prescriptions', icon: 'fas fa-prescription-bottle', label: 'Prescriptions' }
        ]
      },
      {
        label: 'Account',
        links: [
          { href: '/doctor/earnings', icon: 'fas fa-dollar-sign', label: 'Earnings' },
          { href: '/doctor/settings', icon: 'fas fa-gear', label: 'Settings' }
        ]
      }
    ];
  } else if (role === 'patient') {
    navSections = [
      {
        label: 'Healthcare',
        links: [
          { href: '/patient/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
          { href: '/patient/doctors', icon: 'fas fa-user-doctor', label: 'Find Doctors' },
          { href: '/patient/appointments', icon: 'fas fa-calendar-alt', label: 'My Appointments' }
        ]
      },
      {
        label: 'Medical',
        links: [
          { href: '/patient/prescriptions', icon: 'fas fa-prescription', label: 'Prescriptions' },
          { href: '/patient/records', icon: 'fas fa-file-medical', label: 'Medical Records' }
        ]
      },
      {
        label: 'Account',
        links: [
          { href: '/patient/settings', icon: 'fas fa-gear', label: 'Settings' }
        ]
      }
    ];
  }

  // const handleLogout = () => {
  //   dispatch(logoutUser())
  //     .unwrap()
  //     .then(() => {
  //       router.push('/');

  //     })
  //     .catch((err) => {
  //       console.error('Logout failed:', err);
  //       // Still redirect as a safety measure for the UI
  //       router.push('/');
  //     });
  // };

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        router.replace('/');   // better than push
        router.refresh();      // 🔥 FORCE re-render
      })
      .catch((err) => {
        console.error('Logout failed:', err);
        router.replace('/');
        router.refresh();      // 🔥 safety
      });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <>
      {/* Overlay for mobile view */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          style={{ display: 'block', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={onClose}
        />
      )}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-area">
          <div className="sidebar-logo-icon">
            <i className="fas fa-stethoscope"></i>
          </div>
          <div className="sidebar-logo-text">Docti<span>fy</span></div>
          <button className="sidebar-close" onClick={onClose}><i className="fas fa-xmark"></i></button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section, idx) => (
            <div className="nav-section" key={idx}>
              <div className="nav-label">{section.label}</div>
              {section.links.map((link, linkIdx) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    href={link.href}
                    key={linkIdx}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => { if (window.innerWidth <= 900) onClose(); }}
                  >
                    <i className={link.icon}></i> {link.label}
                    {link.badge && <span className={`nav-badge ${link.badge.color}`}>{link.badge.text}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{getInitials(user?.name || role)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || `Demo ${role}`}</div>
            <div className="sidebar-user-role">{user?.email || `${role}@doctify.com`}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            <i className="fas fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>
    </>
  );
}
