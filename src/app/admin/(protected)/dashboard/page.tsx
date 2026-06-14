// ✅ Server Component — NO 'use client' here
// Handles metadata, server-side data fetching
// Delegates all interactive/chart UI to AdminDashboardClient






// // src/app/admin/(protected)/dashboard/page.tsx
// import type { Metadata } from 'next';
// import { cookies } from 'next/headers';
// // import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

// export const metadata: Metadata = {
//     title: 'Dashboard – Zydoc Admin',
// };

// export default async function AdminDashboardPage() {
//     // Optional: fetch real stats server-side and pass as props
//     // If you don't have these endpoints yet, remove the fetch
//     // and AdminDashboardClient will use its own static/mock data

//     // let stats = null;

//     const stats = {
//         totalUsers: 12540,
//         totalPatients: 10200,
//         totalDoctors: 2340,
//         appointments: 1450,
//         completedAppts: 1120,
//         upcomingAppts: 330,
//         revenue: "₹12.45L",
//         commission: "₹1.86L",
//         pendingApprovals: 5,
//         uptime: "99.98%",
//         responseTime: "125ms",
//         openTickets: 8
//     };


//     console.log('dashmonbnbjvghvjgv');

//     // try {
//     //     const cookieStore = cookies();
//     //     const cookieHeader = cookieStore
//     //         .getAll()
//     //         .map((c) => `${c.name}=${c.value}`)
//     //         .join('; ');

//     //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
//     //         headers: { Cookie: cookieHeader },
//     //         cache: 'no-store',
//     //     });

//     //     if (res.ok) {
//     //         stats = await res.json();
//     //     }
//     // } catch {
//     //     // Stats fetch failed — client will use fallback data
//     // }

//     // return <AdminDashboardClient  stats={stats} />;

//     return (
//         <>

//             <h1 style={{ backgroundColor: "GrayText" }}>jnjnjnjnn</h1>
//             {/* <AdminDashboardClient stats={stats} /> */}

//         </>
//     )
// }

import AdminDashboardClient from '@/components/admin/AdminDashboardClient';











// // src/app/admin/(protected)/dashboard/page.tsx
// export default async function AdminDashboardPage() {
//     // Dummy data for now
//     const stats = {
//         totalUsers: 12540,
//         totalPatients: 10200,
//         totalDoctors: 2340,
//         appointments: 1450,
//         completedAppts: 1120,
//         upcomingAppts: 330,
//         revenue: "₹12.45L",
//         commission: "₹1.86L",
//         pendingApprovals: 5,
//         uptime: "99.98%",
//         responseTime: "125ms",
//         openTickets: 8
//     };

//     console.log('src/app/admin/(protected)/dashboard/page.tsx is loading');
//     return (
//         <>
//             <h1 style={{
//                 background: "linear-gradient(135deg, #c31432, #240b36)",
//                 color: "#ffffff",
//                 fontSize: "5rem",
//                 fontFamily: "'Segoe UI', 'Poppins', system-ui, sans-serif",
//                 fontWeight: "800",
//                 letterSpacing: "-0.02em",
//                 textAlign: "center",
//                 padding: "1rem 2rem",
//                 borderRadius: "2rem",
//                 display: "inline-block",
//                 boxShadow: "0 25px 40px -12px rgba(0,0,0,0.4)",
//                 textShadow: "0 2px 5px rgba(0,0,0,0.2)",
//                 margin: 0
//             }}>welcome</h1>
//         </>
//     )

// }




// return <AdminDashboardClient stats={stats} />;







// // src/app/admin/(protected)/dashboard/page.tsx
// export default async function AdminDashboardPage() {
//     return (
//         <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
//             <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-900 drop-shadow-2xl">
//                 Welcome
//             </h1>
//             <p className="text-slate-500 mt-4 font-medium">Admin Control Panel Active</p>
//         </div>
//     );
// }


// import React, { useState, useEffect } from 'react';
'use client';
import Link from 'next/link';

// Use dynamic import for Chart.js to avoid SSR issues
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

export default function AdminDashboardPage() {
    const dateString =
        'Monday, 27 April 2026';

    const chartRange =
        '30d';

    const notification = {
        show: false,
        msg: '',
        type: 'success',
    };

    // Example notification previews
    const successNotification = {
        show: true,
        msg: 'Profile updated successfully!',
        type: 'success',
    };

    const errorNotification = {
        show: true,
        msg: 'Something went wrong!',
        type: 'error',
    };

    // Dummy function example
    function showNotif(msg: string, type: string) {
        return {
            show: true,
            msg,
            type,
        };
    }

    // Usage example:
    const newNotification = showNotif('Appointment booked!', 'success');

    console.log(dateString);
    console.log(chartRange);
    console.log(notification);
    console.log(newNotification);

    // Chart Data Configs
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

    // return (
    //     <div>
    //         {/* Page Header */}
    //         <div className="page-header">
    //             <div className="page-header-left">
    //                 <h1>Welcome back, Super Admin! 👋</h1>
    //                 <p>Here's what's happening on Zydoc today — <span id="dateDisplay">{dateString}</span></p>
    //             </div>
    //             <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    //                 <button className="btn btn-outline" onClick={() => showNotif('Report downloaded!', 'success')}>
    //                     <i className="fas fa-download"></i> Export Report
    //                 </button>
    //                 <Link href="#" className="btn btn-indigo">
    //                     <i className="fas fa-gear"></i> Settings
    //                 </Link>
    //             </div>
    //         </div>

    //         {/* Stat Cards */}
    //         <div className="stat-grid">
    //             <div className="stat-card indigo">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-users"></i></div>
    //                     <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+12.5%</div>
    //                 </div>
    //                 <div className="stat-value">24,891</div>
    //                 <div className="stat-label">Total Users</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> 18,432 patients · 6,459 doctors</div>
    //             </div>
    //             <div className="stat-card pink">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
    //                     <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+8.2%</div>
    //                 </div>
    //                 <div className="stat-value">3,847</div>
    //                 <div className="stat-label">Appointments (This Month)</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> 2,914 completed · 933 upcoming</div>
    //             </div>
    //             <div className="stat-card success">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-indian-rupee-sign"></i></div>
    //                     <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+18.7%</div>
    //                 </div>
    //                 <div className="stat-value">₹9.24L</div>
    //                 <div className="stat-label">Total Revenue (This Month)</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> Platform commission: ₹1.38L</div>
    //             </div>
    //             <div className="stat-card warning">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-user-clock"></i></div>
    //                     <div className="stat-change change-down"><i className="fas fa-arrow-up"></i>+3</div>
    //                 </div>
    //                 <div className="stat-value">7</div>
    //                 <div className="stat-label">Pending Doctor Approvals</div>
    //                 <div className="stat-sub"><i className="fas fa-clock"></i> Oldest pending: 3 days ago</div>
    //             </div>
    //             <div className="stat-card info">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-server"></i></div>
    //                     <span className="status-dot status-online"><i className="fas fa-circle" style={{ fontSize: '7px' }}></i> Healthy</span>
    //                 </div>
    //                 <div className="stat-value">99.8%</div>
    //                 <div className="stat-label">System Uptime</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> Avg response: 142ms</div>
    //             </div>
    //             <div className="stat-card danger">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-headset"></i></div>
    //                     <div className="stat-change change-down"><i className="fas fa-arrow-down"></i>-5</div>
    //                 </div>
    //                 <div className="stat-value">12</div>
    //                 <div className="stat-label">Open Support Tickets</div>
    //                 <div className="stat-sub"><i className="fas fa-triangle-exclamation"></i> 3 high priority</div>
    //             </div>
    //         </div>

    //         {/* Quick Actions */}
    //         <div className="quick-actions">
    //             <div className="section-title">Quick Actions</div>
    //             <div className="qa-grid">
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-user-check"></i></div>
    //                     <span className="qa-label">Review Approvals</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-headset"></i></div>
    //                     <span className="qa-label">Support Tickets</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-flag"></i></div>
    //                     <span className="qa-label">Moderate Reviews</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-file-invoice-dollar"></i></div>
    //                     <span className="qa-label">View Transactions</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-chart-bar"></i></div>
    //                     <span className="qa-label">Analytics</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-server"></i></div>
    //                     <span className="qa-label">System Health</span>
    //                 </Link>
    //             </div>
    //         </div>

    //         {/* Charts */}
    //         <div className="charts-row">
    //             <div className="chart-card">
    //                 <div className="chart-header">
    //                     <div className="chart-title"><i className="fas fa-chart-line" style={{ color: 'var(--indigo)', marginRight: '6px' }}></i>User Growth & Revenue</div>
    //                     {/* <div className="chart-filters">
    //                         <button className={`chart-filter ${chartRange === '7d' ? 'active' : ''}`} onClick={() => setChartRange('7d')}>7D</button>
    //                         <button className={`chart-filter ${chartRange === '30d' ? 'active' : ''}`} onClick={() => setChartRange('30d')}>30D</button>
    //                         <button className={`chart-filter ${chartRange === '90d' ? 'active' : ''}`} onClick={() => setChartRange('90d')}>90D</button>
    //                     </div> */}


    //                     <div className="chart-filters">
    //                         <button className="chart-filter">7D</button>
    //                         <button className="chart-filter active">30D</button>
    //                         <button className="chart-filter">90D</button>
    //                     </div>
    //                 </div>
    //                 <div className="chart-wrap">
    //                     <Line data={lineChartData} options={lineChartOptions} />
    //                 </div>
    //             </div>
    //             <div className="chart-card">
    //                 <div className="chart-header">
    //                     <div className="chart-title"><i className="fas fa-chart-pie" style={{ color: 'var(--pink)', marginRight: '6px' }}></i>Appointments</div>
    //                 </div>
    //                 <div className="chart-wrap">
    //                     <Doughnut data={donutChartData} options={donutChartOptions} />
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Bottom Row */}
    //         <div className="bottom-row">
    //             {/* Recent Activity */}
    //             <div className="panel-card">
    //                 <div className="section-title"><i className="fas fa-clock" style={{ color: 'var(--indigo)' }}></i> Recent Activity</div>
    //                 <ul className="activity-list">
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-success"><i className="fas fa-user-check"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text"><strong>Dr. Ananya Sharma</strong> approved — Cardiologist, 12 yrs exp.</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 5 minutes ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-danger"><i className="fas fa-flag"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">Review flagged — Patient reported inappropriate content from <strong>Dr. Mehta</strong></div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 18 minutes ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-indigo"><i className="fas fa-user-plus"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text"><strong>128 new patients</strong> registered today</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 42 minutes ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-warning"><i className="fas fa-triangle-exclamation"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">High priority ticket #4821 escalated — Payment failure</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 1 hour ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-pink"><i className="fas fa-indian-rupee-sign"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">Revenue milestone: <strong>₹9L+</strong> this month (new record!)</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 2 hours ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-success"><i className="fas fa-server"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">System maintenance completed — All services nominal</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 5 hours ago</div>
    //                         </div>
    //                     </li>
    //                 </ul>
    //             </div>
    //             {/* Key Metrics */}
    //             <div className="panel-card">
    //                 <div className="section-title"><i className="fas fa-gauge-high" style={{ color: 'var(--indigo)' }}></i> Key Metrics</div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: 'var(--indigo-light)', color: 'var(--indigo)' }}><i className="fas fa-star"></i></div>
    //                         <div><div className="metric-name">Avg. Doctor Rating</div><div className="metric-sub">Platform-wide</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">4.7 ★</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '94%', background: 'var(--indigo)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}><i className="fas fa-calendar-check"></i></div>
    //                         <div><div className="metric-name">Appointment Completion</div><div className="metric-sub">This month</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">91.2%</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '91%', background: 'var(--success)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}><i className="fas fa-reply"></i></div>
    //                         <div><div className="metric-name">Avg. Response Time</div><div className="metric-sub">Doctor to patient</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">18 min</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '70%', background: 'var(--warning)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#fce7f3', color: 'var(--pink)' }}><i className="fas fa-heart"></i></div>
    //                         <div><div className="metric-name">Patient Satisfaction</div><div className="metric-sub">Last 30 days</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">96.3%</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '96%', background: 'var(--pink)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#dbeafe', color: 'var(--info)' }}><i className="fas fa-bolt"></i></div>
    //                         <div><div className="metric-name">API Response Time</div><div className="metric-sub">Last 24 hours avg</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">142ms</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '80%', background: 'var(--info)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}><i className="fas fa-ban"></i></div>
    //                         <div><div className="metric-name">Refund Rate</div><div className="metric-sub">This month</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">1.8%</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '18%', background: 'var(--danger)' }}></div></div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Notification */}
    //         <div className={`notification ${notification.type} ${notification.show ? 'show' : ''}`} id="notification">
    //             <i className={`fas ${notification.type === 'success' ? 'fa-circle-check' : 'fa-circle-info'} notif-icon`}></i>
    //             <span id="notifMsg">{notification.msg}</span>
    //         </div>
    //     </div>
    // );




    // return (
    //     <div className="min-h-screen bg-slate-50 p-6">
    //         {/* Page Header */}
    //         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
    //             <div>
    //                 <h1 className="text-3xl font-bold text-slate-800">
    //                     Welcome back, Super Admin! 👋
    //                 </h1>
    //                 <p className="text-slate-500 mt-2">
    //                     Here's what's happening on Zydoc today —
    //                     <span className="font-medium text-slate-700 ml-1">
    //                         Monday, 27 April 2026
    //                     </span>
    //                 </p>
    //             </div>

    //             <div className="flex flex-wrap gap-3">
    //                 <button className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center gap-2 shadow-sm">
    //                     <i className="fas fa-download"></i>
    //                     Export Report
    //                 </button>

    //                 <a
    //                     href="#"
    //                     className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-2 shadow-md"
    //                 >
    //                     <i className="fas fa-gear"></i>
    //                     Settings
    //                 </a>
    //             </div>
    //         </div>

    //         {/* Stat Cards */}
    //         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6 mb-8">
    //             <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-indigo-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
    //                         <i className="fas fa-users"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">+12.5%</span>
    //                 </div>
    //                 <h2 className="text-3xl font-bold text-slate-800">24,891</h2>
    //                 <p className="text-slate-500 mt-1">Total Users</p>
    //                 <p className="text-sm text-slate-400 mt-2">
    //                     18,432 patients · 6,459 doctors
    //                 </p>
    //             </div>

    //             <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-pink-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
    //                         <i className="fas fa-calendar-check"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">+8.2%</span>
    //                 </div>
    //                 <h2 className="text-3xl font-bold text-slate-800">3,847</h2>
    //                 <p className="text-slate-500 mt-1">Appointments (This Month)</p>
    //                 <p className="text-sm text-slate-400 mt-2">
    //                     2,914 completed · 933 upcoming
    //                 </p>
    //             </div>

    //             <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-green-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
    //                         <i className="fas fa-indian-rupee-sign"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">+18.7%</span>
    //                 </div>
    //                 <h2 className="text-3xl font-bold text-slate-800">₹9.24L</h2>
    //                 <p className="text-slate-500 mt-1">Revenue</p>
    //                 <p className="text-sm text-slate-400 mt-2">
    //                     Platform commission: ₹1.38L
    //                 </p>
    //             </div>

    //             <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
    //                         <i className="fas fa-user-clock"></i>
    //                     </div>
    //                     <span className="text-red-500 text-sm font-semibold">+3</span>
    //                 </div>
    //                 <h2 className="text-3xl font-bold text-slate-800">7</h2>
    //                 <p className="text-slate-500 mt-1">Pending Approvals</p>
    //                 <p className="text-sm text-slate-400 mt-2">
    //                     Oldest pending: 3 days ago
    //                 </p>
    //             </div>

    //             <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-blue-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
    //                         <i className="fas fa-server"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">
    //                         Healthy
    //                     </span>
    //                 </div>
    //                 <h2 className="text-3xl font-bold text-slate-800">99.8%</h2>
    //                 <p className="text-slate-500 mt-1">System Uptime</p>
    //                 <p className="text-sm text-slate-400 mt-2">
    //                     Avg response: 142ms
    //                 </p>
    //             </div>

    //             <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-red-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
    //                         <i className="fas fa-headset"></i>
    //                     </div>
    //                     <span className="text-red-500 text-sm font-semibold">-5</span>
    //                 </div>
    //                 <h2 className="text-3xl font-bold text-slate-800">12</h2>
    //                 <p className="text-slate-500 mt-1">Open Support Tickets</p>
    //                 <p className="text-sm text-slate-400 mt-2">
    //                     3 high priority
    //                 </p>
    //             </div>
    //         </div>

    //         {/* Quick Actions */}
    //         <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
    //             <h2 className="text-xl font-semibold text-slate-800 mb-6">
    //                 Quick Actions
    //             </h2>

    //             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
    //                 {[
    //                     "Review Approvals",
    //                     "Support Tickets",
    //                     "Moderate Reviews",
    //                     "View Transactions",
    //                     "Analytics",
    //                     "System Health",
    //                 ].map((item, idx) => (
    //                     <a
    //                         key={idx}
    //                         href="#"
    //                         className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition"
    //                     >
    //                         <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
    //                             <i className="fas fa-bolt"></i>
    //                         </div>
    //                         <span className="text-sm font-medium text-slate-700 text-center">
    //                             {item}
    //                         </span>
    //                     </a>
    //                 ))}
    //             </div>
    //         </div>
    //     </div>
    // );


    // return (
    //     <div className="min-h-screen bg-slate-50 p-6 space-y-8">

    //         {/* Page Header */}
    //         <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
    //             <div>
    //                 <h1 className="text-3xl font-bold text-slate-800">
    //                     Welcome back, Super Admin! 👋
    //                 </h1>
    //                 <p className="text-slate-500 mt-2">
    //                     Here's what's happening on Zydoc today —
    //                     <span className="font-medium text-slate-700 ml-1">{dateString}</span>
    //                 </p>
    //             </div>

    //             <div className="flex flex-wrap gap-3">
    //                 <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm transition">
    //                     <i className="fas fa-download"></i>
    //                     Export Report
    //                 </button>

    //                 <Link
    //                     href="#"
    //                     className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition"
    //                 >
    //                     <i className="fas fa-gear"></i>
    //                     Settings
    //                 </Link>
    //             </div>
    //         </div>

    //         {/* Stat Cards */}
    //         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">

    //             {/* Total Users */}
    //             <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-indigo-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
    //                         <i className="fas fa-users"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">+12.5%</span>
    //                 </div>
    //                 <div className="text-3xl font-bold text-slate-800">24,891</div>
    //                 <div className="text-slate-500 mt-1">Total Users</div>
    //                 <div className="text-sm text-slate-400 mt-2">
    //                     18,432 patients · 6,459 doctors
    //                 </div>
    //             </div>

    //             {/* Appointments */}
    //             <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-pink-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
    //                         <i className="fas fa-calendar-check"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">+8.2%</span>
    //                 </div>
    //                 <div className="text-3xl font-bold text-slate-800">3,847</div>
    //                 <div className="text-slate-500 mt-1">Appointments (This Month)</div>
    //                 <div className="text-sm text-slate-400 mt-2">
    //                     2,914 completed · 933 upcoming
    //                 </div>
    //             </div>

    //             {/* Revenue */}
    //             <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
    //                         <i className="fas fa-indian-rupee-sign"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">+18.7%</span>
    //                 </div>
    //                 <div className="text-3xl font-bold text-slate-800">₹9.24L</div>
    //                 <div className="text-slate-500 mt-1">Total Revenue (This Month)</div>
    //                 <div className="text-sm text-slate-400 mt-2">
    //                     Platform commission: ₹1.38L
    //                 </div>
    //             </div>

    //             {/* Pending Approvals */}
    //             <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-yellow-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600">
    //                         <i className="fas fa-user-clock"></i>
    //                     </div>
    //                     <span className="text-red-500 text-sm font-semibold">+3</span>
    //                 </div>
    //                 <div className="text-3xl font-bold text-slate-800">7</div>
    //                 <div className="text-slate-500 mt-1">Pending Doctor Approvals</div>
    //                 <div className="text-sm text-slate-400 mt-2">
    //                     Oldest pending: 3 days ago
    //                 </div>
    //             </div>

    //             {/* Uptime */}
    //             <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
    //                         <i className="fas fa-server"></i>
    //                     </div>
    //                     <span className="text-green-600 text-sm font-semibold">Healthy</span>
    //                 </div>
    //                 <div className="text-3xl font-bold text-slate-800">99.8%</div>
    //                 <div className="text-slate-500 mt-1">System Uptime</div>
    //                 <div className="text-sm text-slate-400 mt-2">
    //                     Avg response: 142ms
    //                 </div>
    //             </div>

    //             {/* Support Tickets */}
    //             <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
    //                 <div className="flex justify-between items-center mb-4">
    //                     <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
    //                         <i className="fas fa-headset"></i>
    //                     </div>
    //                     <span className="text-red-500 text-sm font-semibold">-5</span>
    //                 </div>
    //                 <div className="text-3xl font-bold text-slate-800">12</div>
    //                 <div className="text-slate-500 mt-1">Open Support Tickets</div>
    //                 <div className="text-sm text-slate-400 mt-2">
    //                     3 high priority
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Quick Actions */}
    //         <div className="bg-white rounded-2xl shadow-sm p-6">
    //             <h2 className="text-xl font-semibold text-slate-800 mb-6">
    //                 Quick Actions
    //             </h2>

    //             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
    //                 {[
    //                     "Review Approvals",
    //                     "Support Tickets",
    //                     "Moderate Reviews",
    //                     "View Transactions",
    //                     "Analytics",
    //                     "System Health",
    //                 ].map((item, idx) => (
    //                     <Link
    //                         href="#"
    //                         key={idx}
    //                         className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition"
    //                     >
    //                         <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
    //                             <i className="fas fa-bolt"></i>
    //                         </div>
    //                         <span className="text-sm font-medium text-slate-700 text-center">
    //                             {item}
    //                         </span>
    //                     </Link>
    //                 ))}
    //             </div>
    //         </div>

    //         {/* Charts */}
    //         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

    //             {/* Line Chart */}
    //             <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6">
    //                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    //                     <div className="flex items-center text-lg font-semibold text-slate-800">
    //                         <i className="fas fa-chart-line text-indigo-600 mr-3"></i>
    //                         User Growth & Revenue
    //                     </div>

    //                     <div className="flex gap-2">
    //                         <button className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition">
    //                             7D
    //                         </button>
    //                         <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-sm">
    //                             30D
    //                         </button>
    //                         <button className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition">
    //                             90D
    //                         </button>
    //                     </div>
    //                 </div>

    //                 <div className="h-[350px]">
    //                     <Line data={lineChartData} options={lineChartOptions} />
    //                 </div>
    //             </div>

    //             {/* Doughnut Chart */}
    //             <div className="bg-white rounded-2xl shadow-sm p-6">
    //                 <div className="flex items-center text-lg font-semibold text-slate-800 mb-6">
    //                     <i className="fas fa-chart-pie text-pink-500 mr-3"></i>
    //                     Appointments
    //                 </div>

    //                 <div className="h-[350px] flex items-center justify-center">
    //                     <Doughnut data={donutChartData} options={donutChartOptions} />
    //                 </div>
    //             </div>
    //         </div>

    //     </div>
    // );



    // return (
    //     <div>
    //         {/* Page Header */}
    //         <div className="page-header">
    //             <div className="page-header-left">
    //                 <h1>Welcome back, Super Admin! 👋</h1>
    //                 <p>Here's what's happening on Zydoc today — <span id="dateDisplay">{dateString}</span></p>
    //             </div>
    //             <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    //                 <button className="btn btn-outline" onClick={() => showNotif('Report downloaded!', 'success')}>
    //                     <i className="fas fa-download"></i> Export Report
    //                 </button>
    //                 <Link href="#" className="btn btn-indigo">
    //                     <i className="fas fa-gear"></i> Settings
    //                 </Link>
    //             </div>
    //         </div>

    //         {/* Stat Cards */}
    //         <div className="stat-grid">
    //             <div className="stat-card indigo">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-users"></i></div>
    //                     <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+12.5%</div>
    //                 </div>
    //                 <div className="stat-value">24,891</div>
    //                 <div className="stat-label">Total Users</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> 18,432 patients · 6,459 doctors</div>
    //             </div>
    //             <div className="stat-card pink">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
    //                     <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+8.2%</div>
    //                 </div>
    //                 <div className="stat-value">3,847</div>
    //                 <div className="stat-label">Appointments (This Month)</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> 2,914 completed · 933 upcoming</div>
    //             </div>
    //             <div className="stat-card success">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-indian-rupee-sign"></i></div>
    //                     <div className="stat-change change-up"><i className="fas fa-arrow-up"></i>+18.7%</div>
    //                 </div>
    //                 <div className="stat-value">₹9.24L</div>
    //                 <div className="stat-label">Total Revenue (This Month)</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> Platform commission: ₹1.38L</div>
    //             </div>
    //             <div className="stat-card warning">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-user-clock"></i></div>
    //                     <div className="stat-change change-down"><i className="fas fa-arrow-up"></i>+3</div>
    //                 </div>
    //                 <div className="stat-value">7</div>
    //                 <div className="stat-label">Pending Doctor Approvals</div>
    //                 <div className="stat-sub"><i className="fas fa-clock"></i> Oldest pending: 3 days ago</div>
    //             </div>
    //             <div className="stat-card info">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-server"></i></div>
    //                     <span className="status-dot status-online"><i className="fas fa-circle" style={{ fontSize: '7px' }}></i> Healthy</span>
    //                 </div>
    //                 <div className="stat-value">99.8%</div>
    //                 <div className="stat-label">System Uptime</div>
    //                 <div className="stat-sub"><i className="fas fa-circle-info"></i> Avg response: 142ms</div>
    //             </div>
    //             <div className="stat-card danger">
    //                 <div className="stat-header">
    //                     <div className="stat-icon"><i className="fas fa-headset"></i></div>
    //                     <div className="stat-change change-down"><i className="fas fa-arrow-down"></i>-5</div>
    //                 </div>
    //                 <div className="stat-value">12</div>
    //                 <div className="stat-label">Open Support Tickets</div>
    //                 <div className="stat-sub"><i className="fas fa-triangle-exclamation"></i> 3 high priority</div>
    //             </div>
    //         </div>

    //         {/* Quick Actions */}
    //         <div className="quick-actions">
    //             <div className="section-title">Quick Actions</div>
    //             <div className="qa-grid">
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-user-check"></i></div>
    //                     <span className="qa-label">Review Approvals</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-headset"></i></div>
    //                     <span className="qa-label">Support Tickets</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-flag"></i></div>
    //                     <span className="qa-label">Moderate Reviews</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-file-invoice-dollar"></i></div>
    //                     <span className="qa-label">View Transactions</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-chart-bar"></i></div>
    //                     <span className="qa-label">Analytics</span>
    //                 </Link>
    //                 <Link href="#" className="qa-btn">
    //                     <div className="qa-icon"><i className="fas fa-server"></i></div>
    //                     <span className="qa-label">System Health</span>
    //                 </Link>
    //             </div>
    //         </div>

    //         {/* Charts */}
    //         <div className="charts-row">
    //             <div className="chart-card">
    //                 <div className="chart-header">
    //                     <div className="chart-title"><i className="fas fa-chart-line" style={{ color: 'var(--indigo)', marginRight: '6px' }}></i>User Growth & Revenue</div>
    //                     <div className="chart-filters">


    //                         <div className="chart-filters">
    //                             <button className="chart-filter">7D</button>
    //                             <button className="chart-filter active">30D</button>
    //                             <button className="chart-filter">90D</button>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className="chart-wrap">
    //                     <Line data={lineChartData} options={lineChartOptions} />
    //                 </div>
    //             </div>
    //             <div className="chart-card">
    //                 <div className="chart-header">
    //                     <div className="chart-title"><i className="fas fa-chart-pie" style={{ color: 'var(--pink)', marginRight: '6px' }}></i>Appointments</div>
    //                 </div>
    //                 <div className="chart-wrap">
    //                     <Doughnut data={donutChartData} options={donutChartOptions} />
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Bottom Row */}
    //         <div className="bottom-row">
    //             {/* Recent Activity */}
    //             <div className="panel-card">
    //                 <div className="section-title"><i className="fas fa-clock" style={{ color: 'var(--indigo)' }}></i> Recent Activity</div>
    //                 <ul className="activity-list">
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-success"><i className="fas fa-user-check"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text"><strong>Dr. Ananya Sharma</strong> approved — Cardiologist, 12 yrs exp.</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 5 minutes ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-danger"><i className="fas fa-flag"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">Review flagged — Patient reported inappropriate content from <strong>Dr. Mehta</strong></div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 18 minutes ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-indigo"><i className="fas fa-user-plus"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text"><strong>128 new patients</strong> registered today</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 42 minutes ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-warning"><i className="fas fa-triangle-exclamation"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">High priority ticket #4821 escalated — Payment failure</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 1 hour ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-pink"><i className="fas fa-indian-rupee-sign"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">Revenue milestone: <strong>₹9L+</strong> this month (new record!)</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 2 hours ago</div>
    //                         </div>
    //                     </li>
    //                     <li className="activity-item">
    //                         <div className="activity-dot dot-success"><i className="fas fa-server"></i></div>
    //                         <div className="activity-info">
    //                             <div className="activity-text">System maintenance completed — All services nominal</div>
    //                             <div className="activity-time"><i className="fas fa-clock"></i> 5 hours ago</div>
    //                         </div>
    //                     </li>
    //                 </ul>
    //             </div>
    //             {/* Key Metrics */}
    //             <div className="panel-card">
    //                 <div className="section-title"><i className="fas fa-gauge-high" style={{ color: 'var(--indigo)' }}></i> Key Metrics</div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: 'var(--indigo-light)', color: 'var(--indigo)' }}><i className="fas fa-star"></i></div>
    //                         <div><div className="metric-name">Avg. Doctor Rating</div><div className="metric-sub">Platform-wide</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">4.7 ★</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '94%', background: 'var(--indigo)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}><i className="fas fa-calendar-check"></i></div>
    //                         <div><div className="metric-name">Appointment Completion</div><div className="metric-sub">This month</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">91.2%</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '91%', background: 'var(--success)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}><i className="fas fa-reply"></i></div>
    //                         <div><div className="metric-name">Avg. Response Time</div><div className="metric-sub">Doctor to patient</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">18 min</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '70%', background: 'var(--warning)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#fce7f3', color: 'var(--pink)' }}><i className="fas fa-heart"></i></div>
    //                         <div><div className="metric-name">Patient Satisfaction</div><div className="metric-sub">Last 30 days</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">96.3%</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '96%', background: 'var(--pink)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#dbeafe', color: 'var(--info)' }}><i className="fas fa-bolt"></i></div>
    //                         <div><div className="metric-name">API Response Time</div><div className="metric-sub">Last 24 hours avg</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">142ms</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '80%', background: 'var(--info)' }}></div></div>
    //                     </div>
    //                 </div>
    //                 <div className="metric-item">
    //                     <div className="metric-left">
    //                         <div className="metric-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}><i className="fas fa-ban"></i></div>
    //                         <div><div className="metric-name">Refund Rate</div><div className="metric-sub">This month</div></div>
    //                     </div>
    //                     <div className="metric-right">
    //                         <div className="metric-val">1.8%</div>
    //                         <div className="metric-bar"><div className="metric-bar-fill" style={{ width: '18%', background: 'var(--danger)' }}></div></div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>

    //         {/* Notification */}
    //         <div className={`notification ${notification.type} ${notification.show ? 'show' : ''}`} id="notification">
    //             <i className={`fas ${notification.type === 'success' ? 'fa-circle-check' : 'fa-circle-info'} notif-icon`}></i>
    //             <span id="notifMsg">{notification.msg}</span>
    //         </div>
    //     </div>
    // );


    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
                        Welcome back, Super Admin! 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm sm:text-base">
                        Here's what's happening on Zydoc today —
                        <span className="font-semibold text-slate-700 ml-2">
                            {dateString}
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => showNotif('Report downloaded!', 'success')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 transition-all shadow-sm"
                    >
                        <i className="fas fa-download"></i>
                        Export Report
                    </button>

                    <Link
                        href="#"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-all"
                    >
                        <i className="fas fa-gear"></i>
                        Settings
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white rounded-3xl shadow-sm border-l-4 border-indigo-500 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                            <i className="fas fa-users"></i>
                        </div>
                        <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i>+12.5%
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">24,891</h2>
                    <p className="text-slate-500 mt-1">Total Users</p>
                    <p className="text-sm text-slate-400 mt-3">
                        18,432 patients · 6,459 doctors
                    </p>
                </div>

                {/* Appointments */}
                <div className="bg-white rounded-3xl shadow-sm border-l-4 border-pink-500 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl">
                            <i className="fas fa-calendar-check"></i>
                        </div>
                        <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i>+8.2%
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">3,847</h2>
                    <p className="text-slate-500 mt-1">Appointments (This Month)</p>
                    <p className="text-sm text-slate-400 mt-3">
                        2,914 completed · 933 upcoming
                    </p>
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-3xl shadow-sm border-l-4 border-green-500 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center text-xl">
                            <i className="fas fa-indian-rupee-sign"></i>
                        </div>
                        <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                            <i className="fas fa-arrow-up"></i>+18.7%
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">₹9.24L</h2>
                    <p className="text-slate-500 mt-1">Total Revenue (This Month)</p>
                    <p className="text-sm text-slate-400 mt-3">
                        Platform commission: ₹1.38L
                    </p>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-3xl shadow-sm border-l-4 border-yellow-500 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl">
                            <i className="fas fa-user-clock"></i>
                        </div>
                        <span className="text-red-500 text-sm font-semibold">+3</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">7</h2>
                    <p className="text-slate-500 mt-1">Pending Doctor Approvals</p>
                    <p className="text-sm text-slate-400 mt-3">
                        Oldest pending: 3 days ago
                    </p>
                </div>

                {/* System Uptime */}
                <div className="bg-white rounded-3xl shadow-sm border-l-4 border-blue-500 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                            <i className="fas fa-server"></i>
                        </div>
                        <span className="text-green-600 text-sm font-semibold">
                            Healthy
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">99.8%</h2>
                    <p className="text-slate-500 mt-1">System Uptime</p>
                    <p className="text-sm text-slate-400 mt-3">
                        Avg response: 142ms
                    </p>
                </div>

                {/* Support Tickets */}
                <div className="bg-white rounded-3xl shadow-sm border-l-4 border-red-500 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl">
                            <i className="fas fa-headset"></i>
                        </div>
                        <span className="text-red-500 text-sm font-semibold flex items-center gap-1">
                            <i className="fas fa-arrow-down"></i>-5
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">12</h2>
                    <p className="text-slate-500 mt-1">Open Support Tickets</p>
                    <p className="text-sm text-slate-400 mt-3">
                        3 high priority
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[
                        { label: 'Review Approvals', icon: 'fa-user-check' },
                        { label: 'Support Tickets', icon: 'fa-headset' },
                        { label: 'Moderate Reviews', icon: 'fa-flag' },
                        { label: 'View Transactions', icon: 'fa-file-invoice-dollar' },
                        { label: 'Analytics', icon: 'fa-chart-bar' },
                        { label: 'System Health', icon: 'fa-server' },
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            href="#"
                            className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 text-lg">
                                <i className={`fas ${item.icon}`}></i>
                            </div>
                            <span className="text-sm font-medium text-slate-700 text-center">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div> */}
            {/* New Dashboard Insights Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

                {/* 1. System Health & Performance */}
                <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col justify-between border border-slate-100">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">System Health</h2>
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-500">Server Load</span>
                                    <span className="font-semibold text-slate-700">24%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full w-[24%] transition-all duration-500"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 rounded-2xl bg-slate-50">
                                    <p className="text-xs text-slate-400 uppercase">Latency</p>
                                    <p className="text-sm font-bold text-slate-700">142ms</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50">
                                    <p className="text-xs text-slate-400 uppercase">Errors</p>
                                    <p className="text-sm font-bold text-slate-700">0.02%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="mt-6 w-full py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all">
                        Open System Logs
                    </button>
                </div>

                {/* 2. Recent Doctor Verifications Table */}
                <div className="bg-white rounded-3xl shadow-sm p-6 xl:col-span-2 border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Pending Verifications</h2>
                            <p className="text-sm text-slate-500">Doctors awaiting profile approval</p>
                        </div>
                        <Link href="/admin/approvals" className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition">
                            View All (7)
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="pb-4 font-semibold">Doctor Name</th>
                                    <th className="pb-4 font-semibold">Specialty</th>
                                    <th className="pb-4 font-semibold text-center">Status</th>
                                    <th className="pb-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { name: 'Dr. Anjali Menon', spec: 'Cardiology', date: '2h ago', color: 'text-amber-600' },
                                    { name: 'Dr. Kevin Joseph', spec: 'Pediatrics', date: '5h ago', color: 'text-amber-600' },
                                    { name: 'Dr. Sarah Ahmed', spec: 'Dermatology', date: '1d ago', color: 'text-amber-600' }
                                ].map((doc, i) => (
                                    <tr key={i} className="border-t border-slate-50 group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 font-bold text-slate-700">{doc.name}</td>
                                        <td className="py-4 text-slate-500">{doc.spec}</td>
                                        <td className="py-4 text-center">
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full">
                                                Pending
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-all">
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Line Chart */}
                <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex items-center text-lg font-bold text-slate-800">
                            <i className="fas fa-chart-line text-indigo-600 mr-3"></i>
                            User Growth & Revenue
                        </div>

                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition">
                                7D
                            </button>
                            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                                30D
                            </button>
                            <button className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition">
                                90D
                            </button>
                        </div>
                    </div>

                    <div className="h-[350px]">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div className="bg-white rounded-3xl shadow-sm p-6">
                    <div className="flex items-center text-lg font-bold text-slate-800 mb-6">
                        <i className="fas fa-chart-pie text-pink-500 mr-3"></i>
                        Appointments
                    </div>

                    <div className="h-[350px] flex items-center justify-center">
                        <Doughnut data={donutChartData} options={donutChartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );


}