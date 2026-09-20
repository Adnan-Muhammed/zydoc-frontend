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

function getAdminNav(pendingApprovals: number = 0, pendingRefunds: number = 0): NavSection[] {
    return [
        {
            label: 'Core Operations',
            links: [
                { href: '/admin/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
                { 
                    href: '/admin/approvals', 
                    icon: 'fas fa-user-check', 
                    label: 'Approvals', 
                    badge: pendingApprovals > 0 ? { text: String(pendingApprovals), color: 'badge-yellow' } : undefined 
                },
                { href: '/admin/doctors', icon: 'fas fa-user-doctor', label: 'Doctors' },
                { href: '/admin/patients', icon: 'fas fa-users', label: 'Patients' },
                { href: '/admin/appointments', icon: 'fas fa-calendar-check', label: 'Appointments' },
                { 
                    href: '/admin/refunds', 
                    icon: 'fas fa-hand-holding-dollar', 
                    label: 'Refunds',
                    badge: pendingRefunds > 0 ? { text: String(pendingRefunds), color: 'badge-yellow' } : undefined
                },
            ],
        },
        {
            label: 'System & Control',
            links: [
                { href: '/admin/settings', icon: 'fas fa-gear', label: 'Settings' },
                { href: '/admin/analytics', icon: 'fas fa-chart-line', label: 'Analytics' },
                { href: '/admin/financials', icon: 'fas fa-file-invoice-dollar', label: 'Financials' },
                { href: '/admin/transactions', icon: 'fas fa-credit-card', label: 'Transactions' },
                { href: '/admin/notifications', icon: 'fas fa-bell', label: 'Notifications' },
            ],
        },
    ];
}

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
                { href: '/doctor/patients', icon: 'fas fa-users', label: 'My Patients', disabled: isDoctorLocked },
                { href: '/doctor/prescriptions', icon: 'fas fa-prescription-bottle', label: 'Prescriptions', disabled: isDoctorLocked },
            ],
        },
        {
            label: 'Account',
            links: [
                { href: '/doctor/earnings', icon: 'fas fa-dollar-sign', label: 'Earnings & Payouts', disabled: isDoctorLocked },
                { href: '/doctor/reviews', icon: 'fas fa-star', label: 'My Reviews', disabled: isDoctorLocked },
                { href: '/doctor/profile', icon: 'fas fa-address-card', label: 'Profile', disabled: isDoctorLocked },
                { href: '/doctor/security', icon: 'fas fa-shield-alt', label: 'Security', disabled: isDoctorLocked },
            ],
        },
    ];
}

const PATIENT_NAV: NavSection[] = [
    {
        label: 'Healthcare',
        links: [
            { href: '/patient/dashboard', icon: 'fas fa-gauge-high', label: 'Dashboard' },
            { href: '/patient/find-doctor', icon: 'fas fa-magnifying-glass', label: 'Find Doctors' },
            { href: '/patient/my-doctors', icon: 'fas fa-user-doctor', label: 'My Doctors' },
            { href: '/patient/appointments', icon: 'fas fa-calendar-alt', label: 'My Appointments' },
        ],
    },
    {
        label: 'Medical',
        links: [
            { href: '/patient/prescriptions', icon: 'fas fa-prescription', label: 'Prescriptions' },
        
            //  This is for future AI Implementation   
            // { href: '/patient/records', icon: 'fas fa-file-medical', label: 'Medical Records' },
        ],
    },
    {
        label: 'Account',
        links: [
            { href: '/patient/wallet', icon: 'fas fa-wallet', label: 'Wallet' },
            { href: '/patient/reviews', icon: 'fas fa-star', label: 'My Reviews' },
            { href: '/patient/profile', icon: 'fas fa-user', label: 'My Profile' },
            { href: '/patient/security', icon: 'fas fa-shield-alt', label: 'Security' },
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
    const { pendingDoctorsTotal, pendingRefundsTotal } = useAppSelector((state) => state.admin);

    const isDoctorLocked = user?.verificationStatus !== 'approved';
    const navSections: NavSection[] =
        role === 'admin' ? getAdminNav(pendingDoctorsTotal, pendingRefundsTotal) :
        role === 'doctor' ? getDoctorNav(isDoctorLocked) :
        PATIENT_NAV;

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
                                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
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
