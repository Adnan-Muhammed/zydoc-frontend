// src/components/admin/AdminDashboardClient.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchAnalyticsSummary,
  fetchRevenueChart,
  fetchTopDoctors,
  fetchPendingDoctors,
  fetchPendingRefunds,
} from '@/redux/features/admin/adminThunk';

import KPISummaryCards from '@/components/admin/dashboard/KPISummaryCards';
import RevenueChartWidget from '@/components/admin/dashboard/RevenueChartWidget';
import TopDoctorsWidget from '@/components/admin/dashboard/TopDoctorsWidget';
import DashboardQuickActions from '@/components/admin/dashboard/DashboardQuickActions';

export default function AdminDashboardClient() {
  const dispatch = useAppDispatch();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const {
    analyticsSummary,
    analyticsSummaryLoading,
    revenueChart,
    revenueChartLoading,
    topDoctors,
    topDoctorsLoading,
    pendingDoctorsTotal,
    pendingRefundsTotal,
  } = useAppSelector((state) => state.admin);

  // Load all dashboard metrics
  const loadDashboardData = useCallback(() => {
    dispatch(fetchAnalyticsSummary());
    dispatch(fetchRevenueChart({ timeframe }));
    dispatch(fetchTopDoctors(5));
    dispatch(fetchPendingDoctors({ page: 1, limit: 1 }));
    dispatch(fetchPendingRefunds({ page: 1, limit: 1, status: 'PENDING' }));
  }, [dispatch, timeframe]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleTimeframeChange = (newTf: 'daily' | 'weekly' | 'monthly') => {
    setTimeframe(newTf);
    dispatch(fetchRevenueChart({ timeframe: newTf }));
  };

  const isAnyLoading =
    analyticsSummaryLoading || revenueChartLoading || topDoctorsLoading;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Analytics Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Platform Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time platform overview of verified doctors, patients, revenue split, and consultation activities.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={isAnyLoading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          <i
            className={`fas fa-sync-alt text-xs ${
              isAnyLoading ? 'animate-spin text-indigo-600' : 'text-slate-400'
            }`}
          ></i>
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <KPISummaryCards
        summary={analyticsSummary}
        isLoading={analyticsSummaryLoading}
      />

      {/* Main Analytics Grid: Time-Series Revenue Chart & Top Doctors Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChartWidget
            chartData={revenueChart}
            isLoading={revenueChartLoading}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
          />
        </div>

        <div className="lg:col-span-1">
          <TopDoctorsWidget
            doctors={topDoctors}
            isLoading={topDoctorsLoading}
          />
        </div>
      </div>

      {/* Quick Action Queue Shortcuts */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Operational Attention Queues
        </h3>
        <DashboardQuickActions
          pendingApprovalsCount={pendingDoctorsTotal}
          pendingRefundsCount={pendingRefundsTotal}
        />
      </div>
    </div>
  );
}