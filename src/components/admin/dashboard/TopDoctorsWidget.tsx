// src/components/admin/dashboard/TopDoctorsWidget.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { TopDoctorAnalytics } from '@/redux/features/admin/adminTypes';

interface TopDoctorsWidgetProps {
  doctors: TopDoctorAnalytics[];
  isLoading: boolean;
}

export default function TopDoctorsWidget({
  doctors,
  isLoading,
}: TopDoctorsWidgetProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={`doc-skel-${idx}`} className="py-3.5 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
              </div>
              <div className="h-5 w-16 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Top Performing Doctors
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <i className="fas fa-crown text-[9px] mr-1 text-amber-500"></i>
              Top 5
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by completed consultations and generated platform revenue.
          </p>
        </div>

        <Link
          href="/admin/doctors"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <i className="fas fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      {/* Doctor List */}
      {doctors.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <i className="fas fa-user-md text-2xl mb-2 text-slate-300"></i>
          <p>No doctor performance records available yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {doctors.map((doctor, index) => {
            const rank = index + 1;
            const rankBadge =
              rank === 1
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : rank === 2
                ? 'bg-slate-200 text-slate-800 border-slate-300'
                : rank === 3
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={doctor.doctorId || index}
                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/50 -mx-3 px-3 rounded-xl transition-colors"
              >
                {/* Doctor Avatar & Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    {doctor.avatarUrl ? (
                      <img
                        src={doctor.avatarUrl}
                        alt={doctor.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                        {doctor.name.replace('Dr. ', '').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full text-[9px] font-extrabold flex items-center justify-center border shadow-2xs ${rankBadge}`}
                    >
                      {rank}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs truncate max-w-[140px]">
                        {doctor.name}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                        <i className="fas fa-star text-[8px]"></i>
                        {doctor.rating ? doctor.rating.toFixed(1) : '5.0'}
                      </span>
                    </div>
                    <div className="text-[11px] text-indigo-600 font-medium truncate max-w-[150px]">
                      {doctor.specialty}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="text-right flex-shrink-0">
                  <div className="font-extrabold text-slate-900 text-xs">
                    ₹{doctor.totalRevenueGenerated.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {doctor.completedConsultations}{' '}
                    {doctor.completedConsultations === 1 ? 'session' : 'sessions'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
