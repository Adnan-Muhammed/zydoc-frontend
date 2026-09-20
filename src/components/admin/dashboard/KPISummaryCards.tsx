// src/components/admin/dashboard/KPISummaryCards.tsx
'use client';

import React from 'react';
import { AnalyticsSummary } from '@/redux/features/admin/adminTypes';

interface KPISummaryCardsProps {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
}

export default function KPISummaryCards({
  summary,
  isLoading,
}: KPISummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`kpi-skeleton-${idx}`}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
            </div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
            <div className="h-3 w-40 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const activeDoctors = summary.activeDoctors || 0;
  const totalDoctors = summary.totalDoctors || 0;
  const registeredPatients = summary.registeredPatients || 0;
  const activePatients = summary.activePatients || 0;
  const platformRevenue = summary.totalPlatformRevenue || 0;
  const grossVolume = summary.totalGrossVolume || 0;
  const todayAppts = summary.todayAppointments || {
    total: 0,
    completed: 0,
    ongoing: 0,
    scheduled: 0,
    cancelled: 0,
  };

  const cards = [
    {
      title: 'Active Doctors',
      value: activeDoctors.toLocaleString(),
      subtitle: `${totalDoctors} total registered on platform`,
      pill: totalDoctors > 0 ? `${Math.round((activeDoctors / totalDoctors) * 100)}% Active` : '100% Active',
      pillColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: 'fas fa-user-md',
      iconBg: 'bg-indigo-500 text-white',
      gradient: 'hover:border-indigo-200',
    },
    {
      title: 'Registered Patients',
      value: registeredPatients.toLocaleString(),
      subtitle: `${activePatients} actively booking accounts`,
      pill: `${activePatients} Active`,
      pillColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: 'fas fa-users',
      iconBg: 'bg-teal-500 text-white',
      gradient: 'hover:border-teal-200',
    },
    {
      title: 'Total Platform Revenue',
      value: `₹${platformRevenue.toLocaleString('en-IN')}`,
      subtitle: `From ₹${grossVolume.toLocaleString('en-IN')} total booking volume`,
      pill: 'Net Commission',
      pillColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'fas fa-coins',
      iconBg: 'bg-emerald-500 text-white',
      gradient: 'hover:border-emerald-200',
    },
    {
      title: "Today's Appointments",
      value: todayAppts.total.toLocaleString(),
      subtitle: `${todayAppts.completed} completed • ${todayAppts.scheduled} upcoming`,
      pill: todayAppts.ongoing > 0 ? `${todayAppts.ongoing} In Progress` : 'Live Schedule',
      pillColor: todayAppts.ongoing > 0 ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200',
      icon: 'fas fa-calendar-check',
      iconBg: 'bg-violet-500 text-white',
      gradient: 'hover:border-violet-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-md ${card.gradient}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {card.title}
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-xs ${card.iconBg}`}
            >
              <i className={card.icon}></i>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {card.value}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium truncate max-w-[150px]">
              {card.subtitle}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${card.pillColor}`}
            >
              {card.pill}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
