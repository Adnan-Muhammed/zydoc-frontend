// src/app/admin/(protected)/analytics/AnalyticsClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
    fetchClinicalAnalytics,
    fetchAnalyticsSummary,
} from '@/redux/features/admin/adminThunk';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    RadialLinearScale
);

export default function AnalyticsClient() {
    const dispatch = useAppDispatch();
    const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const {
        clinicalAnalytics,
        clinicalAnalyticsLoading,
        analyticsSummary,
    } = useAppSelector((state) => state.admin);

    // Fetch real analytics from backend when range changes
    useEffect(() => {
        dispatch(fetchClinicalAnalytics(range));
        if (!analyticsSummary) {
            dispatch(fetchAnalyticsSummary());
        }
    }, [dispatch, range, analyticsSummary]);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Safe fallbacks for clinical analytics
    const timeSeries = clinicalAnalytics?.timeSeries || [];
    const channelBreakdown = clinicalAnalytics?.channelBreakdown || {
        onlineRevenue: 0,
        clinicRevenue: 0,
        onlinePercentage: 50,
        clinicPercentage: 50,
    };
    const specialtyPerformance = clinicalAnalytics?.specialtyPerformance || [];
    const doctorUtilization = clinicalAnalytics?.doctorUtilization || {
        overallRate: 0,
        topUtilizedDoctors: [],
    };
    const patientRetention = clinicalAnalytics?.patientRetention || {
        newPatients: 0,
        returningPatients: 0,
        repeatConsultationRate: 0,
        retentionRate: 0,
    };
    const cancellationAnalysis = clinicalAnalytics?.cancellationAnalysis || {
        totalCancelled: 0,
        cancellationRate: 0,
        reasonsBreakdown: [],
    };

    // Real aggregates for header summary
    const totalPeriodConsultations = useMemo(() => {
        return timeSeries.reduce((sum, p) => sum + (p.videoConsultations || 0) + (p.clinicVisits || 0), 0);
    }, [timeSeries]);

    const totalPeriodGrossRevenue = useMemo(() => {
        return timeSeries.reduce((sum, p) => sum + (p.grossRevenue || 0), 0);
    }, [timeSeries]);

    const totalPeriodCommission = useMemo(() => {
        return timeSeries.reduce((sum, p) => sum + (p.platformCommission || 0), 0);
    }, [timeSeries]);

    // Export CSV report with real data
    const handleExportCSV = () => {
        if (timeSeries.length === 0) {
            triggerToast('No historical data available to export for this time window.');
            return;
        }

        const headers = [
            'Period',
            'Video Consultations',
            'Clinic Visits',
            'Cancellations',
            'Gross Revenue (INR)',
            'Platform Commission (INR)',
            'Active Users',
        ];
        const rows = timeSeries.map((p) => [
            p.label,
            p.videoConsultations || 0,
            p.clinicVisits || 0,
            p.cancellations || 0,
            p.grossRevenue || 0,
            p.platformCommission || 0,
            p.activeUsers || 0,
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `zydoc-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        triggerToast(`Real analytics report (${range.toUpperCase()}) downloaded as CSV.`);
    };

    // 1. Consultation Trends Chart (Line Chart: Video vs Clinic)
    const consultationTrendData = useMemo(() => {
        const labels = timeSeries.map((p) => p.label);
        const videoData = timeSeries.map((p) => p.videoConsultations || 0);
        const clinicData = timeSeries.map((p) => p.clinicVisits || 0);
        const cancellationData = timeSeries.map((p) => p.cancellations || 0);

        return {
            labels,
            datasets: [
                {
                    label: 'Online Video Consultations',
                    data: videoData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2.5,
                    tension: 0.35,
                    fill: true,
                    pointBackgroundColor: '#8b5cf6',
                    pointRadius: 4,
                },
                {
                    label: 'In-Person Clinic Visits',
                    data: clinicData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    borderWidth: 2.5,
                    tension: 0.35,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 4,
                },
                {
                    label: 'Cancellations',
                    data: cancellationData,
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    tension: 0.2,
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 3,
                },
            ],
        };
    }, [timeSeries]);

    const consultationTrendOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    font: { size: 12, family: 'Inter, sans-serif' },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                padding: 12,
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 12 },
                cornerRadius: 10,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } },
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { font: { size: 11 }, precision: 0 },
                title: { display: true, text: 'Consultations Count', font: { size: 11 } },
                beginAtZero: true,
            },
        },
    };

    // 2. Revenue Channel Breakdown (Doughnut)
    const revenueChannelData = useMemo(() => {
        const onlineRev = channelBreakdown.onlineRevenue || 0;
        const clinicRev = channelBreakdown.clinicRevenue || 0;
        const hasData = onlineRev > 0 || clinicRev > 0;

        return {
            labels: hasData ? ['Video Consultations', 'Clinic Visits'] : ['No Recorded Consultations'],
            datasets: [
                {
                    data: hasData ? [onlineRev, clinicRev] : [1],
                    backgroundColor: hasData ? ['#8b5cf6', '#3b82f6'] : ['#e2e8f0'],
                    hoverOffset: 8,
                    borderWidth: 0,
                },
            ],
        };
    }, [channelBreakdown]);

    const revenueChannelOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    padding: 16,
                    font: { size: 12, family: 'Inter, sans-serif' },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const val = context.raw || 0;
                        return ` ₹${val.toLocaleString('en-IN')}`;
                    },
                },
            },
        },
    };

    // 3. Specialty Performance (Horizontal Bar Chart)
    const specialtyChartData = useMemo(() => {
        return {
            labels: specialtyPerformance.map((s) => s.specialty),
            datasets: [
                {
                    label: 'Total Consultations',
                    data: specialtyPerformance.map((s) => s.consultationsCount),
                    backgroundColor: '#6366f1',
                    borderRadius: 8,
                },
            ],
        };
    }, [specialtyPerformance]);

    const specialtyChartOptions: any = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    afterLabel: (context: any) => {
                        const spec = specialtyPerformance[context.dataIndex];
                        if (!spec) return '';
                        return `Revenue: ₹${(spec.totalRevenue || 0).toLocaleString('en-IN')} | Share: ${spec.utilizationRate || 0}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { font: { size: 11 }, precision: 0 },
                beginAtZero: true,
            },
            y: {
                grid: { display: false },
                ticks: { font: { size: 11, weight: '500' } },
            },
        },
    };

    return (
        <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-slate-900 border-slate-700 text-white text-sm font-medium transition-all">
                    <i className="fas fa-circle-check text-emerald-400"></i>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header with Navigation & Time Window Switcher */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                        <Link href="/admin/dashboard" className="hover:underline flex items-center gap-1 text-slate-500">
                            <i className="fas fa-gauge-high"></i> Dashboard
                        </Link>
                        <span>/</span>
                        <span>Clinical Intelligence</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        Healthcare Analytics
                        <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                            Live Telemetry
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1.5 text-sm sm:text-base">
                        Real-time clinical demand, platform revenue velocity, doctor utilization, and patient cohort retention.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Horizon Filter */}
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        {(['7d', '30d', '90d', '1y'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setRange(t)}
                                disabled={clinicalAnalyticsLoading}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    range === t
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                } disabled:opacity-60`}
                            >
                                {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : t === '90d' ? '3 Months' : '1 Year'}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleExportCSV}
                        disabled={clinicalAnalyticsLoading || timeSeries.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 transition-all shadow-sm text-sm disabled:opacity-50"
                    >
                        <i className="fas fa-file-csv text-emerald-600"></i>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* 1. Total Consultations */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Consultations</span>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <i className="fas fa-stethoscope"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                        {clinicalAnalyticsLoading ? (
                            <span className="inline-block w-24 h-8 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                            totalPeriodConsultations.toLocaleString('en-IN')
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 text-xs">
                        <span className="text-indigo-600 font-semibold">
                            {range.toUpperCase()} Interval
                        </span>
                        <span className="text-slate-400">
                            {channelBreakdown.onlinePercentage}% Video · {channelBreakdown.clinicPercentage}% Clinic
                        </span>
                    </div>
                </div>

                {/* 2. Gross Platform Revenue */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Platform Revenue</span>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <i className="fas fa-indian-rupee-sign"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                        {clinicalAnalyticsLoading ? (
                            <span className="inline-block w-28 h-8 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                            `₹${totalPeriodGrossRevenue.toLocaleString('en-IN')}`
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 text-xs">
                        <span className="text-emerald-600 font-bold">
                            ₹{totalPeriodCommission.toLocaleString('en-IN')} Commission
                        </span>
                        <span className="text-slate-400">Platform Share</span>
                    </div>
                </div>

                {/* 3. Doctor Utilization */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor Utilization</span>
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <i className="fas fa-user-clock"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                        {clinicalAnalyticsLoading ? (
                            <span className="inline-block w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                            `${doctorUtilization.overallRate}%`
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 text-xs">
                        <span className="text-purple-600 font-bold">
                            Active Providers
                        </span>
                        <span className="text-slate-400">
                            {analyticsSummary?.activeDoctors ?? clinicalAnalytics?.overviewStats?.activeDoctors ?? 0} Verified Docs
                        </span>
                    </div>
                </div>

                {/* 4. Patient Retention Rate */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Retention</span>
                        <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
                            <i className="fas fa-heart-pulse"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                        {clinicalAnalyticsLoading ? (
                            <span className="inline-block w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                            `${patientRetention.retentionRate}%`
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 text-xs">
                        <span className="text-emerald-600 font-bold">
                            {patientRetention.repeatConsultationRate}% Repeat Visits
                        </span>
                        <span className="text-slate-400">Active Cohort</span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* 1. Patient Consultation Trends Over Time */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-chart-area text-indigo-600"></i>
                                Consultation Demand Trends
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Comparison of online telemedicine sessions vs in-person clinic appointments
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-purple-700 font-semibold bg-purple-50 px-2.5 py-1 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Video: {channelBreakdown.onlinePercentage}%
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Clinic: {channelBreakdown.clinicPercentage}%
                            </span>
                        </div>
                    </div>

                    <div className="h-[340px] relative">
                        {clinicalAnalyticsLoading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2 text-slate-400 text-xs font-medium">
                                    <i className="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
                                    <span>Aggregating consultation trends...</span>
                                </div>
                            </div>
                        ) : timeSeries.length > 0 ? (
                            <Line data={consultationTrendData} options={consultationTrendOptions} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                No consultation records found for the selected period.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Revenue Breakdown by Modality */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                            <i className="fas fa-pie-chart text-purple-600"></i>
                            Revenue by Modality
                        </h2>
                        <p className="text-xs text-slate-400">Share of consultation fee revenue between Video vs Clinic</p>
                    </div>

                    <div className="h-[250px] my-auto flex items-center justify-center">
                        {clinicalAnalyticsLoading ? (
                            <i className="fas fa-spinner fa-spin text-2xl text-purple-600"></i>
                        ) : (
                            <Doughnut data={revenueChannelData} options={revenueChannelOptions} />
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-purple-50/60 rounded-2xl">
                            <span className="text-purple-600 font-medium block text-[11px]">Video Revenue</span>
                            <span className="font-bold text-slate-800 text-sm">
                                ₹{(channelBreakdown.onlineRevenue || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="p-3 bg-blue-50/60 rounded-2xl">
                            <span className="text-blue-600 font-medium block text-[11px]">Clinic Revenue</span>
                            <span className="font-bold text-slate-800 text-sm">
                                ₹{(channelBreakdown.clinicRevenue || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Deep Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* 3. Top-Performing Medical Specialties */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-brain text-indigo-600"></i>
                                Top Medical Specialties Demand
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Real consultation booking volume aggregated across clinical specialties
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                            {specialtyPerformance.length} Departments
                        </span>
                    </div>

                    <div className="h-[300px] relative">
                        {clinicalAnalyticsLoading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
                            </div>
                        ) : specialtyPerformance.length > 0 ? (
                            <Bar data={specialtyChartData} options={specialtyChartOptions} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                No specialty booking data available in this time frame.
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Doctor Utilization Rate & Leaderboard */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-user-doctor text-emerald-600"></i>
                                Doctor Utilization
                            </h2>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                                Avg {doctorUtilization.overallRate}%
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-5">Completed consultation sessions vs total booked appointments</p>

                        <div className="space-y-4">
                            {doctorUtilization.topUtilizedDoctors.length > 0 ? (
                                doctorUtilization.topUtilizedDoctors.map((doc, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                                            <span>
                                                {doc.name}{' '}
                                                <span className="text-slate-400 font-normal">({doc.specialty})</span>
                                            </span>
                                            <span className="text-indigo-600 font-bold">{doc.rate}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                style={{ width: `${doc.rate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-slate-400 text-center py-6">
                                    No completed doctor appointments recorded yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Benchmark Goal: &gt;80%</span>
                        <Link href="/admin/doctors" className="font-bold text-indigo-600 hover:underline">
                            Doctor Roster →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Retention & Cancellation Root-Cause Analysis Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* 5. Patient Retention & Loyalty Analysis */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-users-viewfinder text-blue-600"></i>
                                Patient Retention & Cohort Loyalty
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Recurring care metrics and patient lifecycle</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
                            {patientRetention.retentionRate}% Retention
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">New Patients</div>
                            <div className="text-2xl font-bold text-slate-800">
                                {patientRetention.newPatients.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">Acquired in this period</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Returning Patients</div>
                            <div className="text-2xl font-bold text-slate-800">
                                {patientRetention.returningPatients.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                                {patientRetention.repeatConsultationRate}% repeat appointment rate
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/70 text-xs text-slate-600 flex items-start gap-3">
                        <i className="fas fa-lightbulb text-indigo-600 text-sm mt-0.5"></i>
                        <div>
                            <strong className="text-indigo-950 font-semibold">Retention Telemetry:</strong>{' '}
                            Derived from real consultation booking histories. Patients with scheduled follow-ups contribute to higher cohort recurrence.
                        </div>
                    </div>
                </div>

                {/* 6. Cancellation Root-Cause Distribution */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-ban text-rose-500"></i>
                                Appointment Cancellation Analysis
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Real cancellation volume and root cause breakdown</p>
                        </div>
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                            {cancellationAnalysis.cancellationRate}% Overall Rate
                        </span>
                    </div>

                    <div className="space-y-4 mb-6">
                        {cancellationAnalysis.reasonsBreakdown.length > 0 ? (
                            cancellationAnalysis.reasonsBreakdown.map((item, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-700">{item.reason}</span>
                                        <span className="text-slate-500 font-mono">
                                            {item.count} cases ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                i === 0
                                                    ? 'bg-rose-500'
                                                    : i === 1
                                                    ? 'bg-amber-500'
                                                    : i === 2
                                                    ? 'bg-blue-500'
                                                    : 'bg-slate-400'
                                            }`}
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-slate-400 text-center py-6">
                                No cancellations recorded in the current window.
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                        <span>
                            Total Dropped Sessions:{' '}
                            <strong className="text-slate-800">{cancellationAnalysis.totalCancelled}</strong>
                        </span>
                        <Link href="/admin/refunds" className="font-bold text-indigo-600 hover:underline">
                            Review Refunds Queue →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
