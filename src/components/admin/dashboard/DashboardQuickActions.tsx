// src/components/admin/dashboard/DashboardQuickActions.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface DashboardQuickActionsProps {
  pendingApprovalsCount: number;
  pendingRefundsCount: number;
}

export default function DashboardQuickActions({
  pendingApprovalsCount,
  pendingRefundsCount,
}: DashboardQuickActionsProps) {
  const actions = [
    {
      title: 'Doctor Approvals Queue',
      desc: 'Review doctor credential submissions and licensing',
      count: pendingApprovalsCount,
      badgeColor: pendingApprovalsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500',
      href: '/admin/approvals',
      icon: 'fas fa-user-check',
      iconColor: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Offline Refund Requests',
      desc: 'Investigate missed visits and approve wallet refunds',
      count: pendingRefundsCount,
      badgeColor: pendingRefundsCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500',
      href: '/admin/refunds',
      icon: 'fas fa-hand-holding-dollar',
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Commission Rate Config',
      desc: 'Manage online & clinic consultation platform cuts',
      count: null,
      badgeColor: '',
      href: '/admin/settings',
      icon: 'fas fa-sliders',
      iconColor: 'text-violet-600 bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((act, i) => (
        <Link
          key={i}
          href={act.href}
          className="group bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-2xs ${act.iconColor}`}
            >
              <i className={act.icon}></i>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {act.title}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {act.desc}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2">
            {act.count !== null && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${act.badgeColor}`}
              >
                {act.count} pending
              </span>
            )}
            <i className="fas fa-chevron-right text-slate-300 text-xs group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all"></i>
          </div>
        </Link>
      ))}
    </div>
  );
}
