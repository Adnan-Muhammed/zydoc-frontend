'use client';

import React from 'react';
import Link from 'next/link';
import './patient-dashboard.css';
import { useAppSelector } from '../../../../redux/hooks'; // redux

export default function PatientDashboardPage() {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="patient-dashboard">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-text">
                    <h2>Welcome back, {user?.name || 'John'}! 👋</h2>
                    <p>You have 1 upcoming appointment</p>
                </div>
                <div className="quick-actions">
                    <Link href="#" className="btn btn-primary">
                        <i className="fas fa-calendar-plus"></i> Book Appointment
                    </Link>
                    <Link href="#" className="btn btn-secondary-white">
                        <i className="fas fa-search"></i> Find Doctor
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-label">Upcoming Appointments</div>
                    <div className="stat-value">1</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div className="stat-label">Total Appointments</div>
                    <div className="stat-value">8</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👨‍⚕️</div>
                    <div className="stat-label">Doctors Consulted</div>
                    <div className="stat-value">5</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-label">Total Spending</div>
                    <div className="stat-value">$290</div>
                    <div className="stat-change">↓ 12% from last month</div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="content-grid">
                {/* Main Content */}
                <div>
                    {/* Upcoming Appointments */}
                    <div className="appointments-section">
                        <div className="section-title">
                            Upcoming Appointments
                            <Link href="#">View All →</Link>
                        </div>
                        <div className="appointment-item">
                            <div className="doctor-image">
                                <i className="fas fa-user-doctor" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
                            </div>
                            <div className="appointment-info">
                                <div className="doctor-name">Dr. Sarah Johnson</div>
                                <div className="doctor-specialty">General Practitioner</div>
                                <div className="appointment-details">
                                    <span><i className="fas fa-calendar"></i> Mar 15, 2025</span>
                                    <span><i className="fas fa-clock"></i> 2:00 PM</span>
                                    <span><i className="fas fa-video"></i> Video Call</span>
                                </div>
                                <div className="appointment-actions">
                                    <button className="action-btn"><i className="fas fa-video"></i> Join</button>
                                    <button className="action-btn"><i className="fas fa-edit"></i> Reschedule</button>
                                    <button className="action-btn"><i className="fas fa-trash"></i> Cancel</button>
                                </div>
                            </div>
                            <div className="appointment-status">
                                <span className="status-badge status-scheduled">Scheduled</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Appointments */}
                    <div className="appointments-section" style={{ marginTop: '2rem' }}>
                        <div className="section-title">
                            Recent Appointments
                            <Link href="#">View All →</Link>
                        </div>
                        <div className="appointment-item">
                            <div className="doctor-image">
                                <i className="fas fa-user-doctor" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
                            </div>
                            <div className="appointment-info">
                                <div className="doctor-name">Dr. Michael Chen</div>
                                <div className="doctor-specialty">Pediatrician</div>
                                <div className="appointment-details">
                                    <span><i className="fas fa-calendar"></i> Mar 5, 2025</span>
                                    <span><i className="fas fa-clock"></i> 10:30 AM</span>
                                    <span><i className="fas fa-video"></i> Video Call</span>
                                </div>
                                <div className="appointment-actions">
                                    <button className="action-btn"><i className="fas fa-file"></i> View Notes</button>
                                    <button className="action-btn"><i className="fas fa-pills"></i> Prescription</button>
                                </div>
                            </div>
                            <div className="appointment-status">
                                <span className="status-badge status-completed">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="sidebar-widgets">
                    {/* Prescriptions */}
                    <div className="prescription-card">
                        <div className="section-title">
                            My Prescriptions
                            <Link href="#">View All →</Link>
                        </div>
                        <div className="prescription-item">
                            <div className="prescription-date">Mar 5, 2025</div>
                            <div className="prescription-doctor">Dr. Michael Chen</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-medium)', marginBottom: '0.5rem' }}>
                                Amoxicillin 500mg - 2 times daily
                            </div>
                            <Link href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                                Download PDF →
                            </Link>
                        </div>
                        <div className="prescription-item">
                            <div className="prescription-date">Feb 28, 2025</div>
                            <div className="prescription-doctor">Dr. Sarah Johnson</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-medium)', marginBottom: '0.5rem' }}>
                                Vitamin D3 1000IU - Daily
                            </div>
                            <Link href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                                Download PDF →
                            </Link>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="notification-card">
                        <div className="section-title">
                            Notifications
                            <Link href="#">Mark all read →</Link>
                        </div>
                        <div className="notification-item">
                            <div className="notification-title">Appointment Reminder</div>
                            <div className="notification-message">Your appointment with Dr. Sarah Johnson is in 2 hours</div>
                            <div className="notification-time">2 minutes ago</div>
                        </div>
                        <div className="notification-item">
                            <div className="notification-title">Prescription Ready</div>
                            <div className="notification-message">Your prescription from Dr. Chen has been sent to your registered pharmacy</div>
                            <div className="notification-time">1 hour ago</div>
                        </div>
                        <div className="notification-item">
                            <div className="notification-title">Payment Confirmed</div>
                            <div className="notification-message">Payment of $50 received for appointment consultation</div>
                            <div className="notification-time">5 hours ago</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
