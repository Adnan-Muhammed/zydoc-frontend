// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutUser } from '@/redux/auth/authThunk';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  CalendarCheck,
  RotateCcw,
  Settings,
  BarChart3,
  FileSpreadsheet,
  CreditCard,
  Bell,
  Clock,
  Pill,
  Wallet,
  ShieldCheck,
  User,
  Search,
  FileHeart,
  Stethoscope,
  Lock,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'doctor' | 'patient';
  isOpen: boolean;
  onClose: () => void;
}

interface Badge {
  text: string;
  color: string;
}

interface LinkItem {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: Badge;
  disabled?: boolean;
}

interface NavSection {
  label: string;
  links: LinkItem[];
}

function getAdminNav(pendingApprovals: number = 0, pendingRefunds: number = 0): NavSection[] {
  return [
    {
      label: 'Core Operations',
      links: [
        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        {
          href: '/admin/approvals',
          icon: UserCheck,
          label: 'Approvals',
          badge: pendingApprovals > 0 ? { text: String(pendingApprovals), color: 'badge-yellow' } : undefined,
        },
        { href: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
        { href: '/admin/patients', icon: Users, label: 'Patients' },
        { href: '/admin/appointments', icon: CalendarCheck, label: 'Appointments' },
        {
          href: '/admin/refunds',
          icon: RotateCcw,
          label: 'Refunds',
          badge: pendingRefunds > 0 ? { text: String(pendingRefunds), color: 'badge-yellow' } : undefined,
        },
      ],
    },
    {
      label: 'System & Control',
      links: [
        { href: '/admin/settings', icon: Settings, label: 'Settings' },
        { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { href: '/admin/financials', icon: FileSpreadsheet, label: 'Financials' },
        { href: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
        { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
      ],
    },
  ];
}

function getDoctorNav(isDoctorLocked: boolean): NavSection[] {
  return [
    {
      label: 'Consultations',
      links: [
        { href: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/doctor/appointments', icon: CalendarCheck, label: 'Appointments', disabled: isDoctorLocked },
        { href: '/doctor/schedule', icon: Clock, label: 'My Schedule', disabled: isDoctorLocked },
      ],
    },
    {
      label: 'Patients & Clinical',
      links: [
        { href: '/doctor/patients', icon: Users, label: 'My Patients', disabled: isDoctorLocked },
        { href: '/doctor/prescriptions', icon: Pill, label: 'Prescriptions', disabled: isDoctorLocked },
      ],
    },
    {
      label: 'Account & Finance',
      links: [
        { href: '/doctor/earnings', icon: Wallet, label: 'Earnings & Payouts', disabled: isDoctorLocked },
        { href: '/doctor/notifications', icon: Bell, label: 'Notifications', disabled: isDoctorLocked },
        { href: '/doctor/profile', icon: User, label: 'Profile', disabled: isDoctorLocked },
        { href: '/doctor/security', icon: ShieldCheck, label: 'Security', disabled: isDoctorLocked },
      ],
    },
  ];
}

const PATIENT_NAV: NavSection[] = [
  {
    label: 'Healthcare',
    links: [
      { href: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/patient/find-doctor', icon: Search, label: 'Find Doctors' },
      { href: '/patient/my-doctors', icon: Stethoscope, label: 'My Doctors' },
      { href: '/patient/appointments', icon: CalendarCheck, label: 'My Appointments' },
    ],
  },
  {
    label: 'Medical Care',
    links: [
      { href: '/patient/prescriptions', icon: Pill, label: 'Prescriptions' },
      { href: '/patient/records', icon: FileHeart, label: 'Medical Records' },
      { href: '/patient/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    label: 'Account',
    links: [
      { href: '/patient/wallet', icon: Wallet, label: 'Wallet' },
      { href: '/patient/security', icon: ShieldCheck, label: 'Security' },
      { href: '/patient/profile', icon: User, label: 'My Profile' },
    ],
  },
];

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { pendingDoctorsTotal, pendingRefundsTotal } = useAppSelector((state) => state.admin);

  const isDoctorLocked = user?.verificationStatus !== 'approved';
  const navSections: NavSection[] =
    role === 'admin'
      ? getAdminNav(pendingDoctorsTotal, pendingRefundsTotal)
      : role === 'doctor'
      ? getDoctorNav(isDoctorLocked)
      : PATIENT_NAV;

  const handleLogout = () => {
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          style={{
            display: 'block',
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-logo-area">
          <div className="flex items-center gap-3 min-w-0">
            <div className="sidebar-logo-icon">
              <Stethoscope className="size-5 text-white" />
            </div>
            <div className="sidebar-brand-wrapper">
              <div className="sidebar-logo-text">
                Zy<span>doc</span>
              </div>
              <span className="sidebar-portal-badge">
                {role === 'admin' ? 'Admin Portal' : role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
              </span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          {navSections.map((section, idx) => (
            <div className="nav-section" key={idx}>
              <div className="nav-label">{section.label}</div>
              <div className="nav-items-group">
                {section.links.map((link, linkIdx) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== `/${role}/dashboard` && pathname.startsWith(`${link.href}/`));
                  const IconComponent = link.icon;

                  if (link.disabled) {
                    return (
                      <div
                        key={linkIdx}
                        className="nav-item disabled"
                        title="Waiting for Admin Approval"
                      >
                        <IconComponent className="nav-icon" />
                        <span className="nav-text truncate">{link.label}</span>
                        <Lock className="nav-lock-icon" />
                      </div>
                    );
                  }

                  return (
                    <Link
                      href={link.href}
                      key={linkIdx}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth <= 900) {
                          onClose();
                        }
                      }}
                    >
                      <IconComponent className="nav-icon" />
                      <span className="nav-text truncate">{link.label}</span>
                      {link.badge && (
                        <span className={`nav-badge ${link.badge.color}`}>{link.badge.text}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Identity & Logout at Bottom */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatarUrl ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`}
                alt="Profile"
                className="size-full object-cover rounded-xl"
              />
            ) : (
              getInitials(user?.name || role)
            )}
          </div>
          <div className="sidebar-user-info min-w-0">
            <div className="sidebar-user-name truncate">
              {user?.name || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)}` : 'User')}
            </div>
            <div className="sidebar-user-role truncate">{user?.email || `${role}@zydoc.com`}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Log Out" aria-label="Log Out">
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
