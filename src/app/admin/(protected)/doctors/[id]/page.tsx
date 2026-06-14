'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/api/axiosInstance';
import './doctor-detail.css';

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                // Attempt to fetch doctor if there is an endpoint, otherwise mock it for now.
                // Assuming we can fetch the user details using the ID:
                const res = await axiosInstance.get(`/admin/users/${params.id}`);
                if (res.data?.success && res.data.user) {
                    setDoctor(res.data.user);
                }
            } catch (error) {
                console.error('Failed to fetch doctor details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [params.id]);

    const showNotif = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3500);
    };

    const confirmDelete = async () => {
        if (confirm('Delete this doctor? This cannot be undone.')) {
            try {
                await axiosInstance.delete(`/admin/users/${params.id}`);
                showNotif('Doctor deleted successfully.', 'success');
                setTimeout(() => router.push('/admin/doctors'), 1500);
            } catch (err) {
                showNotif('Failed to delete doctor', 'error');
            }
        }
    };

    const handleAction = async (action: string) => {
        try {
            if (action === 'approve') {
                await axiosInstance.put(`/admin/users/doctors/${params.id}/approve`);
                showNotif('Doctor approved!', 'success');
            } else if (action === 'suspend') {
                await axiosInstance.put(`/admin/users/soft-delete/${params.id}`);
                showNotif('Doctor suspended!', 'success');
            }
            // re-fetch or optimistically update
            const res = await axiosInstance.get(`/admin/users/${params.id}`);
            if (res.data?.success && res.data.user) {
                setDoctor(res.data.user);
            }
        } catch (err) {
            showNotif(`Failed to ${action} doctor.`, 'error');
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading doctor details...</div>;
    }

    // Fallback data if API doesn't return full structure
    const dName = doctor?.name || 'Dr. Unknown';
    const dEmail = doctor?.email || 'N/A';
    const dPhone = doctor?.phone || 'N/A';
    const dSpecialty = doctor?.specialty || 'General Practice';
    const initials = dName.split(' ').slice(1).map((w: string)=>w[0]).join('').slice(0,2).toUpperCase() || dName.substring(0,2).toUpperCase();
    let displayStatus = 'incomplete';
    if (doctor?.verificationStatus === 'approved') displayStatus = 'active';
    else if (doctor?.verificationStatus === 'rejected') displayStatus = 'suspended';
    else if (doctor?.verificationStatus === 'pending') displayStatus = 'pending';
    else if (doctor?.isProfileCompleted) displayStatus = 'pending';

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" style={{ padding: '0 28px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/admin/doctors" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray-500)', padding: '8px 12px', border: '1px solid var(--gray-200)', borderRadius: '8px', background: '#fff', textDecoration: 'none' }}>
                        <i className="fas fa-arrow-left"></i> Back
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Detail</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-outline" onClick={() => showNotif('Message sent!', 'success')}><i className="fas fa-comment"></i> Message</button>
                    <button className="btn btn-indigo" onClick={() => showNotif('Edit mode enabled', 'success')}><i className="fas fa-pencil"></i> Edit Profile</button>
                </div>
            </div>

            <div style={{ padding: '0 28px' }}>
                <div className="detail-layout">
                    {/* Left: Profile Card */}
                    <div>
                        <div className="profile-card">
                            <div className="profile-banner"></div>
                            <div className="profile-body">
                                <div className="profile-avatar-wrap">
                                    <div className="profile-avatar">{initials}</div>
                                </div>
                                <div className="profile-name">{dName}</div>
                                <div className="profile-specialty">{dSpecialty}</div>
                                <span className={`badge ${displayStatus === 'active' ? 'badge-green' : displayStatus === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                                    <i className="fas fa-circle" style={{ fontSize: '7px' }}></i> {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                                </span>
                                <div className="stat-row">
                                    <div className="stat-item"><div className="stat-num">{doctor?.patients || 0}</div><div className="stat-lbl">Patients</div></div>
                                    <div className="stat-item"><div className="stat-num">{doctor?.rating ? doctor.rating + '★' : 'N/A'}</div><div className="stat-lbl">Rating</div></div>
                                    <div className="stat-item"><div className="stat-num">₹0</div><div className="stat-lbl">Earnings</div></div>
                                </div>
                                <div className="action-btns">
                                    {displayStatus === 'pending' && (
                                        <button className="btn btn-success" onClick={() => handleAction('approve')}><i className="fas fa-check-circle"></i> Approve / Verified</button>
                                    )}
                                    <button className="btn btn-warning" onClick={() => handleAction('suspend')}><i className="fas fa-ban"></i> Suspend Account</button>
                                    <button className="btn btn-danger-outline" onClick={confirmDelete} style={{ background: '#fff', border: '2px solid var(--danger)', color: 'var(--danger)' }}><i className="fas fa-trash"></i> Delete Account</button>
                                    <button className="btn btn-outline" onClick={() => showNotif('Email sent!', 'success')}><i className="fas fa-envelope"></i> Send Email</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div>
                        {/* Personal Info */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-id-card" style={{ color: 'var(--indigo)' }}></i> Personal Information</div>
                            <div className="info-grid-2">
                                <div className="info-item"><div className="info-label">Full Name</div><div className="info-value">{dName}</div></div>
                                <div className="info-item"><div className="info-label">Email</div><div className="info-value">{dEmail}</div></div>
                                <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{dPhone}</div></div>
                                <div className="info-item"><div className="info-label">Gender</div><div className="info-value">{doctor?.gender || 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Date of Birth</div><div className="info-value">{doctor?.dob ? new Date(doctor.dob).toLocaleDateString() : 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Location</div><div className="info-value">{doctor?.location || 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Languages</div><div className="info-value">{doctor?.languages?.join(', ') || 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Registered On</div><div className="info-value">{doctor?.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A'}</div></div>
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-graduation-cap" style={{ color: 'var(--indigo)' }}></i> Qualifications & Experience</div>
                            <div className="info-grid-2">
                                <div className="info-item"><div className="info-label">Degree</div><div className="info-value">{doctor?.degree || 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Specialty</div><div className="info-value">{dSpecialty}</div></div>
                                <div className="info-item"><div className="info-label">Medical College</div><div className="info-value">{doctor?.medicalCollege || 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Registration No.</div><div className="info-value">{doctor?.registrationNumber || 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Experience</div><div className="info-value">{doctor?.experience ? doctor.experience + ' Years' : 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Current Hospital</div><div className="info-value">{doctor?.hospital || 'N/A'}</div></div>
                            </div>
                        </div>

                        {/* Document Verification */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-file-shield" style={{ color: 'var(--indigo)' }}></i> Document Verification</div>
                            <div className="doc-list">
                                <div className="doc-item">
                                    <div className="doc-icon"><i className="fas fa-id-badge"></i></div>
                                    <div className="doc-name">Medical Council Registration Certificate</div>
                                    <span className="badge badge-green doc-status">Verified</span>
                                    <div className="doc-actions"><a onClick={() => showNotif('Viewing document...', 'info')}>View</a><a onClick={() => showNotif('Downloading...', 'success')}>Download</a></div>
                                </div>
                                <div className="doc-item">
                                    <div className="doc-icon"><i className="fas fa-graduation-cap"></i></div>
                                    <div className="doc-name">Medical Degree Certificate</div>
                                    <span className="badge badge-green doc-status">Verified</span>
                                    <div className="doc-actions"><a onClick={() => showNotif('Viewing document...', 'info')}>View</a><a onClick={() => showNotif('Downloading...', 'success')}>Download</a></div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-chart-bar" style={{ color: 'var(--indigo)' }}></i> Performance Statistics</div>
                            <div className="info-grid-2">
                                <div className="info-item"><div className="info-label">Total Appointments</div><div className="info-value">{doctor?.patients || 0}</div></div>
                                <div className="info-item"><div className="info-label">Completion Rate</div><div className="info-value">N/A</div></div>
                                <div className="info-item"><div className="info-label">Average Rating</div><div className="info-value">⭐ {doctor?.rating || 0} / 5.0</div></div>
                                <div className="info-item"><div className="info-label">Total Reviews</div><div className="info-value">N/A</div></div>
                                <div className="info-item"><div className="info-label">Avg. Response Time</div><div className="info-value">N/A</div></div>
                                <div className="info-item"><div className="info-label">Total Earnings</div><div className="info-value">₹0</div></div>
                            </div>
                        </div>


                                <div className="info-section">
          <div className="section-title"><i className = "fas fa-star" style={{color:'var(--indigo)' }}></i> Recent Patient Reviews</div>
          <div className="review-list">
            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">Ramesh K.</div>
                <span className="stars">★★★★★</span>
              </div>
              <div className="review-date">January 28, 2025</div>
              <div className="review-text">Excellent doctor! Very thorough diagnosis and took time to explain everything clearly. Highly recommended.</div>
            </div>
            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">Sunita M.</div>
                <span className="stars">★★★★★</span>
              </div>
              <div className="review-date">January 24, 2025</div>
              <div className="review-text">Dr. Priya is amazing. She is patient, knowledgeable and responds quickly. Best cardiologist on the platform.</div>
            </div>
            <div className="review-item">
              <div className="review-header">
                <div className="reviewer-name">Anil T.</div>
                <span className="stars">★★★★☆</span>
              </div>
              <div className="review-date">January 20, 2025</div>
              <div className="review-text">Good consultation experience. Wait time was a bit long but the advice was excellent.</div>
            </div>
          </div>
        </div>

                        {/* Admin Notes */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-sticky-note" style={{ color: 'var(--indigo)' }}></i> Admin Notes</div>
                            <textarea className="notes-area" placeholder="Add internal notes about this doctor..." defaultValue=""></textarea>
                            <div style={{ marginTop: '12px' }}>
                                <button className="btn btn-indigo" onClick={() => showNotif('Notes saved!', 'success')}><i className="fas fa-save"></i> Save Notes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification */}
            <div className={`fixed top-5 right-5 bg-white rounded-xl py-3 px-4 shadow-lg flex items-center gap-2 text-sm z-[2000] transition-transform duration-300 min-w-[280px] ${notification.show ? 'translate-x-0' : 'translate-x-[120%]'} ${notification.type === 'success' ? 'border-l-4 border-green-500' : notification.type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}`}>
                <i className={`fas ${notification.type === 'success' ? 'fa-circle-check text-green-500' : notification.type === 'error' ? 'fa-circle-exclamation text-red-500' : 'fa-circle-info text-blue-500'}`}></i>
                <span>{notification.msg}</span>
            </div>
        </div>
    );
}
