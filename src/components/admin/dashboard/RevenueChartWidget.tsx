// src/components/admin/dashboard/RevenueChartWidget.tsx
'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RevenueChartData } from '@/redux/features/admin/adminTypes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartWidgetProps {
  chartData: RevenueChartData | null;
  isLoading: boolean;
  timeframe: string;
  onTimeframeChange: (tf: 'daily' | 'weekly' | 'monthly') => void;
}

export default function RevenueChartWidget({
  chartData,
  isLoading,
  timeframe,
  onTimeframeChange,
}: RevenueChartWidgetProps) {
  const points = chartData?.chartData || [];

  // Format labels for X-axis
  const labels = points.map((p) => {
    if (timeframe === 'monthly') {
      const [year, month] = p.date.split('-');
      const d = new Date(Number(year), Number(month) - 1, 1);
      return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    } else if (timeframe === 'weekly') {
      return p.date.replace('-W', ' Wk ');
    } else {
      // Daily
      const d = new Date(p.date);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  });

  const adminCommissions = points.map((p) => p.adminCommission || 0);
  const doctorPayouts = points.map((p) => p.doctorPayout || 0);

  const data = {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Admin Commission (Platform)',
        data: adminCommissions.length > 0 ? adminCommissions : [0],
        borderColor: '#6366F1', // Indigo 500
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: points.length > 20 ? 1.5 : 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
      {
        label: 'Doctor Payouts (Net Share)',
        data: doctorPayouts.length > 0 ? doctorPayouts : [0],
        borderColor: '#10B981', // Emerald 500
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointRadius: points.length > 20 ? 1.5 : 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#64748B',
          font: {
            size: 11,
            weight: '600',
            family: 'Inter, system-ui, sans-serif',
          },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#E2E8F0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || '';
            const val = context.parsed.y || 0;
            return ` ${label}: ₹${val.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        grid: {
          color: '#F1F5F9',
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 10,
          },
          callback: function (val: any) {
            if (val >= 100000) return `₹${val / 100000}L`;
            if (val >= 1000) return `₹${val / 1000}k`;
            return `₹${val}`;
          },
        },
      },
    },
  };

  const summary = chartData?.summary || {
    totalRevenue: 0,
    adminCommission: 0,
    doctorPayout: 0,
    appointmentsCount: 0,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Revenue Stream & Payouts Breakdown
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Time-Series Aggregation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking platform admin commissions versus net doctor earnings over time.
          </p>
        </div>

        {/* Timeframe Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                timeframe === tf
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tf === 'daily' ? 'Daily (30D)' : tf === 'weekly' ? 'Weekly (12W)' : 'Monthly (12M)'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Quick Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Consultation Volume
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1">
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Across {summary.appointmentsCount} paid sessions
          </div>
        </div>

        <div className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100/80">
          <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Admin Commission</span>
          </div>
          <div className="text-lg font-extrabold text-indigo-700 mt-1">
            ₹{summary.adminCommission.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-indigo-600/80 mt-0.5">
            Platform net earnings
          </div>
        </div>

        <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100/80">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Doctor Net Payouts</span>
          </div>
          <div className="text-lg font-extrabold text-emerald-700 mt-1">
            ₹{summary.doctorPayout.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">
            Direct clinical disbursements
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-72 sm:h-80 w-full pt-2">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-2"></div>
            <p className="text-xs text-slate-400">Loading revenue chart aggregation...</p>
          </div>
        ) : points.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-xl text-slate-400 text-xs">
            <i className="fas fa-chart-line text-2xl mb-2 text-slate-300"></i>
            <p>No revenue data recorded for this timeframe yet.</p>
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}
