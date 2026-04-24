'use client';

import React from 'react';
import Link from 'next/link';
import './doctor-dashboard.css';
import { useAppSelector } from '../../../../redux/hooks';  // redux
export default function DoctorDashboardPage() {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="doctor-dashboard">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="greeting">Welcome back, Dr. {user?.name || 'Smith'}! 👋</h1>
                <p className="time-greeting">Here's what's happening with your practice today</p>
            </div>

            {/* Quick Actions */}
            <div className="qa-grid-custom">
                <Link href="#" className="action-btn">
                    <div className="action-icon"><i className="fas fa-calendar"></i></div>
                    <div className="action-label">Manage Schedule</div>
                </Link>
                <Link href="#" className="action-btn">
                    <div className="action-icon"><i className="fas fa-clock"></i></div>
                    <div className="action-label">View Appointments</div>
                </Link>
                <Link href="#" className="action-btn">
                    <div className="action-icon"><i className="fas fa-comments"></i></div>
                    <div className="action-label">Messages</div>
                </Link>
                <Link href="#" className="action-btn">
                    <div className="action-icon"><i className="fas fa-prescription-bottle"></i></div>
                    <div className="action-label">Prescriptions</div>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon primary"><i className="fas fa-users"></i></div>
                    <div className="stat-label">Total Patients</div>
                    <div className="stat-value">342</div>
                    <div className="stat-change"><i className="fas fa-arrow-up"></i> +12 this month</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon secondary"><i className="fas fa-calendar-check"></i></div>
                    <div className="stat-label">Appointments (March)</div>
                    <div className="stat-value">28</div>
                    <div className="stat-change"><i className="fas fa-arrow-up"></i> +5 vs last month</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon success"><i className="fas fa-dollar-sign"></i></div>
                    <div className="stat-label">Earnings (March)</div>
                    <div className="stat-value">$2,840</div>
                    <div className="stat-change"><i className="fas fa-arrow-up"></i> +$340 vs last month</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon warning"><i className="fas fa-star"></i></div>
                    <div className="stat-label">Your Rating</div>
                    <div className="stat-value">4.8</div>
                    <div className="stat-change">125 reviews</div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                <div className="card">
                    <div className="card-title">
                        Upcoming Appointments
                        <Link href="#" className="btn btn-secondary">View All</Link>
                    </div>

                    <div className="appointment-item">
                        <div className="appointment-info">
                            <h4>Sarah Johnson</h4>
                            <p className="appointment-time"><i className="fas fa-clock"></i> Today, 2:30 PM</p>
                        </div>
                        <span className="appointment-type">Video</span>
                    </div>

                    <div className="appointment-item">
                        <div className="appointment-info">
                            <h4>Michael Chen</h4>
                            <p className="appointment-time"><i className="fas fa-clock"></i> Today, 3:00 PM</p>
                        </div>
                        <span className="appointment-type">In-person</span>
                    </div>

                    <div className="appointment-item">
                        <div className="appointment-info">
                            <h4>Emily Davis</h4>
                            <p className="appointment-time"><i className="fas fa-clock"></i> Tomorrow, 10:30 AM</p>
                        </div>
                        <span className="appointment-type">Chat</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Recent Reviews</div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#fbbf24' }}>★★★★★</span>
                            <strong>5.0</strong>
                        </div>
                        <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>"Excellent doctor! Very professional and caring."</p>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>- John D., 2 days ago</p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#fbbf24' }}>★★★★★</span>
                            <strong>5.0</strong>
                        </div>
                        <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>"Highly recommend! Great listener."</p>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>- Sarah M., 1 week ago</p>
                    </div>

                    <Link href="#" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        <i className="fas fa-star"></i> View All Reviews
                    </Link>
                </div>
            </div>
        </div>
    );
}
