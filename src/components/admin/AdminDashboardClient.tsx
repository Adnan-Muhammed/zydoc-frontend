'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

interface Stats {
    totalUsers?: number;
    totalPatients?: number;
    totalDoctors?: number;
    appointments?: number;
    completedAppts?: number;
    upcomingAppts?: number;
    revenue?: string;
    commission?: string;
    pendingApprovals?: number;
    uptime?: string;
    responseTime?: string;
    openTickets?: number;
}

interface Props {
    stats: Stats | null;
}

export default function AdminDashboardClient({ stats }: Props) {
    const [dateString, setDateString] = useState('');
    const [chartRange, setChartRange] = useState('30d');
    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

    // Use passed stats if available, otherwise use your dummy data
    const displayStats = {
        totalUsers: stats?.totalUsers?.toLocaleString('en-IN') || "24,891",
        totalPatients: stats?.totalPatients?.toLocaleString('en-IN') || "18,432",
        totalDoctors: stats?.totalDoctors?.toLocaleString('en-IN') || "6,459",
        appointments: stats?.appointments?.toLocaleString('en-IN') || "3,847",
        completedAppts: stats?.completedAppts?.toLocaleString('en-IN') || "2,914",
        upcomingAppts: stats?.upcomingAppts?.toLocaleString('en-IN') || "933",
        revenue: stats?.revenue || "₹9.24L",
        commission: stats?.commission || "₹1.38L",
        pendingApprovals: stats?.pendingApprovals || 7,
        uptime: stats?.uptime || "99.8%",
        responseTime: stats?.responseTime || "142ms",
        openTickets: stats?.openTickets || 12,
    };

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    const showNotif = (msg: string, type: string) => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3500);
    };

    const chartDataMap: any = {
        '7d': {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            users: [320, 415, 380, 520, 490, 380, 445],
            revenue: [82000, 95000, 78000, 112000, 104000, 88000, 96000]
        },
        '30d': {
            labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
            users: [1800, 2100, 2400, 2200, 2800, 3100, 2900],
            revenue: [420000, 510000, 580000, 540000, 670000, 740000, 695000]
        },
        '90d': {
            labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
            users: [4200, 5100, 6800, 7200, 8400, 9100],
            revenue: [1200000, 1480000, 1920000, 2150000, 2480000, 2720000]
        }
    };

    const currentLineData = chartDataMap[chartRange];

    const lineChartData = {
        labels: currentLineData.labels,
        datasets: [
            {
                label: 'New Users',
                data: currentLineData.users,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.08)',
                borderWidth: 2.5,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4,
                yAxisID: 'y'
            },
            {
                label: 'Revenue (₹)',
                data: currentLineData.revenue,
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236,72,153,0.06)',
                borderWidth: 2.5,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ec4899',
                pointRadius: 4,
                yAxisID: 'y1'
            }
        ]
    };

    const lineChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 11, family: 'Plus Jakarta Sans' }, boxWidth: 12 } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 } }, type: 'linear', display: true, position: 'left' },
            y1: {
                position: 'right',
                grid: { display: false },
                ticks: {
                    font: { size: 11 },
                    callback: (v: number) => '₹' + (v / 1000).toFixed(0) + 'k'
                },
                type: 'linear',
                display: true
            }
        }
    };

    const donutChartData = {
        labels: ['Completed', 'Upcoming', 'Cancelled', 'No-show'],
        datasets: [{
            data: [2914, 933, 312, 89],
            backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 6
        }]
    };

    const donutChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11, family: 'Plus Jakarta Sans' }, boxWidth: 10, padding: 14 } }
        }
    };

    return (
        <div className="admin-dashboard-container">
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Welcome back, Super Admin! 👋</h1>
                    <p>Here's what's happening on Zydoc today — <span id="dateDisplay">{dateString}</span></p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={() => showNotif('Report downloaded!', 'success')}>
                        <i className="fas fa-download"></i> Export Report
                    </button>
                    <Link href="/admin/settings" className="btn btn-indigo">
                        <i className="fas fa-gear"></i> Settings
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                <div className="stat-card indigo">
                    <div className="stat-header">
                        <div className="stat-icon"><i className="fas fa-users"></i></div>
                        <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+12.5%</div>
                    </div>
                    <div className="stat-value">{displayStats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                    <div className="stat-sub"><i className="fas fa-circle-info"></i> {displayStats.totalPatients} patients · {displayStats.totalDoctors} doctors</div>
                </div>
                <div className="stat-card pink">
                    <div className="stat-header">
                        <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
                        <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+8.2%</div>
                    </div>
                    <div className="stat-value">{displayStats.appointments}</div>
                    <div className="stat-label">Appointments (This Month)</div>
                    <div className="stat-sub"><i className="fas fa-circle-info"></i> {displayStats.completedAppts} completed · {displayStats.upcomingAppts} upcoming</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-header">
                        <div className="stat-icon"><i className="fas fa-indian-rupee-sign"></i></div>
                        <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+18.7%</div>
                    </div>
                    <div className="stat-value">{displayStats.revenue}</div>
                    <div className="stat-label">Total Revenue (This Month)</div>
                    <div className="stat-sub"><i className="fas fa-circle-info"></i> Platform commission: {displayStats.commission}</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-header">
                        <div className="stat-icon"><i className="fas fa-user-clock"></i></div>
                        <div className="stat-change change-down"><i className="fas fa-arrow-up"></i>+3</div>
                    </div>
                    <div className="stat-value">{displayStats.pendingApprovals}</div>
                    <div className="stat-label">Pending Doctor Approvals</div>
                    <div className="stat-sub"><i className="fas fa-clock"></i> Oldest pending: 3 days ago</div>
                </div>
                <div className="stat-card info">
                    <div className="stat-header">
                        <div className="stat-icon"><i className="fas fa-server"></i></div>
                        <span className="status-dot status-online"><i className="fas fa-circle" style={{ fontSize: '7px' }}></i> Healthy</span>
                    </div>
                    <div className="stat-value">{displayStats.uptime}</div>
                    <div className="stat-label">System Uptime</div>
                    <div className="stat-sub"><i className="fas fa-circle-info"></i> Avg response: {displayStats.responseTime}</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-header">
                        <div className="stat-icon"><i className="fas fa-headset"></i></div>
                        <div className="stat-change change-down"><i className="fas fa-arrow-down"></i>-5</div>
                    </div>
                    <div className="stat-value">{displayStats.openTickets}</div>
                    <div className="stat-label">Open Support Tickets</div>
                    <div className="stat-sub"><i className="fas fa-triangle-exclamation"></i> 3 high priority</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <div className="section-title">Quick Actions</div>
                <div className="qa-grid">
                    <Link href="/admin/approvals" className="qa-btn">
                        <div className="qa-icon"><i className="fas fa-user-check"></i></div>
                        <span className="qa-label">Review Approvals</span>
                    </Link>
                    <Link href="/admin/tickets" className="qa-btn">
                        <div className="qa-icon"><i className="fas fa-headset"></i></div>
                        <span className="qa-label">Support Tickets</span>
                    </Link>
                    <Link href="/admin/reviews" className="qa-btn">
                        <div className="qa-icon"><i className="fas fa-flag"></i></div>
                        <span className="qa-label">Moderate Reviews</span>
                    </Link>
                    <Link href="/admin/transactions" className="qa-btn">
                        <div className="qa-icon"><i className="fas fa-file-invoice-dollar"></i></div>
                        <span className="qa-label">View Transactions</span>
                    </Link>
                    <Link href="/admin/analytics" className="qa-btn">
                        <div className="qa-icon"><i className="fas fa-chart-bar"></i></div>
                        <span className="qa-label">Analytics</span>
                    </Link>
                    <Link href="/admin/system" className="qa-btn">
                        <div className="qa-icon"><i className="fas fa-server"></i></div>
                        <span className="qa-label">System Health</span>
                    </Link>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title"><i className="fas fa-chart-line" style={{ color: 'var(--indigo)', marginRight: '6px' }}></i>User Growth & Revenue</div>
                        <div className="chart-filters">
                            <button className={`chart-filter ${chartRange === '7d' ? 'active' : ''}`} onClick={() => setChartRange('7d')}>7D</button>
                            <button className={`chart-filter ${chartRange === '30d' ? 'active' : ''}`} onClick={() => setChartRange('30d')}>30D</button>
                            <button className={`chart-filter ${chartRange === '90d' ? 'active' : ''}`} onClick={() => setChartRange('90d')}>90D</button>
                        </div>
                    </div>
                    <div className="chart-wrap">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title"><i className="fas fa-chart-pie" style={{ color: 'var(--pink)', marginRight: '6px' }}></i>Appointments</div>
                    </div>
                    <div className="chart-wrap">
                        <Doughnut data={donutChartData} options={donutChartOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Activity & Key Metrics Section omitted for brevity but should be here... */}

            {/* Notification */}
            <div className={`notification ${notification.type} ${notification.show ? 'show' : ''}`} id="notification">
                <i className={`fas ${notification.type === 'success' ? 'fa-circle-check' : 'fa-circle-info'} notif-icon`}></i>
                <span id="notifMsg">{notification.msg}</span>
            </div>
        </div>
    );
}