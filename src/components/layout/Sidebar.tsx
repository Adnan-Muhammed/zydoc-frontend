// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutUser } from '@/redux/auth/authThunk';

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
    icon: string;
    label: string;
    badge?: Badge;
    disabled?: boolean;
}

interface NavSection {
    label: string;
    links: LinkItem[];
}

const ADMIN_NAV: NavSection[] = [
    {
        label: 'Overview',
        links: [
            { href: '/admin/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
            { href: '/admin/appointments', icon: 'fas fa-calendar-check', label: 'Appointments' },
            { href: '/admin/analytics', icon: 'fas fa-chart-line', label: 'Analytics' },
        ],
    },
    {
        label: 'User Management',
        links: [
            { href: '/admin/doctors', icon: 'fas fa-user-doctor', label: 'Doctors' },
            { href: '/admin/patients', icon: 'fas fa-users', label: 'Patients' },
            { href: '/admin/approvals', icon: 'fas fa-user-check', label: 'Approvals', badge: { text: '7', color: 'badge-yellow' } },
        ],
    },
    {
        label: 'System',
        links: [
            { href: '/admin/support', icon: 'fas fa-headset', label: 'Support', badge: { text: '12', color: 'badge-red' } },
            { href: '/admin/transactions', icon: 'fas fa-credit-card', label: 'Transactions' },
            { href: '/admin/profile', icon: 'fas fa-user-gear', label: 'My Profile' },
            { href: '/admin/settings', icon: 'fas fa-gear', label: 'Settings' },
        ],
    },
];

function getDoctorNav(isDoctorLocked: boolean): NavSection[] {
    return [
        {
            label: 'Consultations',
            links: [
                { href: '/doctor/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
                { href: '/doctor/appointments', icon: 'fas fa-calendar-check', label: 'Appointments', disabled: isDoctorLocked },
                { href: '/doctor/schedule', icon: 'fas fa-clock', label: 'My Schedule', disabled: isDoctorLocked },
            ],
        },
        {
            label: 'Patients',
            links: [
                { href: '/doctor/messages', icon: 'fas fa-comments', label: 'Messages', badge: { text: '3', color: 'badge-red' }, disabled: isDoctorLocked },
                { href: '/doctor/prescriptions', icon: 'fas fa-prescription-bottle', label: 'Prescriptions', disabled: isDoctorLocked },
            ],
        },
        {
            label: 'Account',
            links: [
                { href: '/doctor/earnings', icon: 'fas fa-dollar-sign', label: 'Earnings', disabled: isDoctorLocked },
                { href: '/doctor/profile', icon: 'fas fa-address-card', label: 'Profile', disabled: isDoctorLocked },
            ],
        },
    ];
}

const PATIENT_NAV: NavSection[] = [
    {
        label: 'Healthcare',
        links: [
            { href: '/patient/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
            { href: '/patient/find-doctor', icon: 'fas fa-user-doctor', label: 'Find Doctors' },
            { href: '/patient/appointments', icon: 'fas fa-calendar-alt', label: 'My Appointments' },
        ],
    },
    {
        label: 'Medical',
        links: [
            { href: '/patient/prescriptions', icon: 'fas fa-prescription', label: 'Prescriptions' },
            { href: '/patient/records', icon: 'fas fa-file-medical', label: 'Medical Records' },
        ],
    },
    {
        label: 'Account',
        links: [
            { href: '/patient/profile', icon: 'fas fa-user', label: 'My Profile' },
            { href: '/patient/settings', icon: 'fas fa-gear', label: 'Settings' },
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

    const isDoctorLocked = user?.verificationStatus !== 'approved';
    const navSections: NavSection[] =
        role === 'admin' ? ADMIN_NAV :
        role === 'doctor' ? getDoctorNav(isDoctorLocked) :
        PATIENT_NAV;

    const handleLogout = () => {
        dispatch(logoutUser())
            .unwrap()
            .then(() => {
                router.replace('/');
                router.refresh();
            })
            .catch((err: unknown) => {
                console.error('Logout failed:', err);
                router.replace('/');
                router.refresh();
            });
    };

    return (
        <>
            {/* Overlay for mobile */}
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
                    <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navSections.map((section, idx) => (
                        <div className="nav-section" key={idx}>
                            <div className="nav-label">{section.label}</div>
                            {section.links.map((link, linkIdx) => {
                                const isActive = pathname.startsWith(link.href);
                                if (link.disabled) {
                                    return (
                                        <div
                                            key={linkIdx}
                                            className="nav-item"
                                            style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                            title="Waiting for Admin Approval"
                                        >
                                            <i className={link.icon}></i> {link.label}
                                            <i className="fas fa-lock" style={{ marginLeft: 'auto', fontSize: '0.8em', opacity: 0.7 }}></i>
                                        </div>
                                    );
                                }
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
                    <div className="sidebar-avatar" style={{ overflow: 'hidden' }}>
                        {user?.avatarUrl ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            getInitials(user?.name || role)
                        )}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-role">{user?.email}</div>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout} title="Logout" aria-label="Logout">
                        <i className="fas fa-right-from-bracket"></i>
                    </button>
                </div>
            </aside>
        </>
    );
}
