'use client';

// src/components/doctor/DoctorBottomNav/index.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  Users,
  Wallet,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/doctor/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/doctor/appointments',
    label: 'Appointments',
    icon: CalendarCheck,
  },
  {
    href: '/doctor/schedule',
    label: 'Schedule',
    icon: Clock,
  },
  {
    href: '/doctor/patients',
    label: 'Patients',
    icon: Users,
  },
  {
    href: '/doctor/earnings',
    label: 'Earnings',
    icon: Wallet,
  },
];

export default function DoctorBottomNav() {
  const pathname = usePathname();

  // Hide bottom nav during active video consultation room or complete-profile wizard
  if (pathname?.includes('/consultation') || pathname?.includes('/complete-profile')) {
    return null;
  }

  return (
    <nav className="doc-bottom-nav" aria-label="Mobile Doctor Navigation">
      <div className="doc-bottom-nav-inner">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/doctor/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`doc-bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
              {isActive && <span className="doc-bottom-nav-dot" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
