'use client';

// src/components/patient/PatientBottomNav/index.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  FileHeart,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/patient/dashboard',     icon: LayoutDashboard, label: 'Home'     },
  { href: '/patient/find-doctor',   icon: Search,          label: 'Find'     },
  { href: '/patient/appointments',  icon: CalendarCheck,   label: 'Bookings' },
  { href: '/patient/records',       icon: FileHeart,       label: 'Records'  },
  { href: '/patient/profile',       icon: User,            label: 'Profile'  },
];

export default function PatientBottomNav() {
  const pathname = usePathname();

  // Hide during consultation
  if (pathname?.includes('/consultation/')) return null;

  return (
    <nav className="pat-bottom-nav" aria-label="Mobile navigation">
      <div className="pat-bottom-nav-inner">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/patient/dashboard' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`pat-bottom-nav-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon />
              <span>{label}</span>
              {isActive && <span className="pat-bottom-nav-dot" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
