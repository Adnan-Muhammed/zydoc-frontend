'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/api/axiosInstance';
import '../doctors.css';
  
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
                const res = await axiosInstance.get(`/admin/doctors/${params.id}`);
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
    }, [params.id, router]);

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
            } else if (action === 'reject') {
                await axiosInstance.put(`/admin/users/doctors/${params.id}/reject`);
                showNotif('Doctor rejected!', 'success');  
            } else if (action === 'suspend') {
                await axiosInstance.put(`/admin/users/doctors/${params.id}/suspend`);
                showNotif('Doctor suspended!', 'success');
            } else if (action === 'unsuspend') {
                await axiosInstance.put(`/admin/users/doctors/${params.id}/unsuspend`);
                showNotif('Doctor unsuspended!', 'success');
            }
            // re-fetch or optimistically update
            const res = await axiosInstance.get(`/admin/doctors/${params.id}`);
            if (res.data?.success && res.data.user) {
                setDoctor(res.data.user);
            }
        } catch (err) {
            showNotif(`Failed to ${action} doctor.`, 'error');
        }
    };

    const handleQualStatus = async (qualId: string, status: string) => {
        try {
            let reason = '';
            if (status === 'rejected') {
                const promptReason = window.prompt('Please enter a reason for rejecting this certificate:');
                if (promptReason === null) return; // User cancelled
                reason = promptReason;
            }
            const res = await axiosInstance.put(`/admin/users/doctors/${params.id}/qualifications/${qualId}/status`, { status, reason });
            showNotif(`Certificate marked as ${status}!`, 'success');
            setDoctor((prev: any) => {
                if (!prev) return prev;
                const newQuals = prev.qualifications.map((q: any) => 
                    q.id === qualId ? { ...q, certificateStatus: status, rejectionReason: status === 'approved' ? '' : reason } : q
                );
                return { ...prev, qualifications: newQuals, verificationStatus: res.data.verificationStatus || prev.verificationStatus };
            });
        } catch (err) {
            showNotif(`Failed to update certificate status.`, 'error');
        }
    };

    const handleDocStatus = async (docType: string, status: string) => {
        try {
            let reason = '';
            if (status === 'rejected') {
                const promptReason = window.prompt(`Please enter a reason for rejecting this document:`);
                if (promptReason === null) return; // User cancelled
                reason = promptReason;
            }
            const res = await axiosInstance.put(`/admin/users/doctors/${params.id}/documents/${docType}/status`, { status, reason });
            showNotif(`${docType === 'medicalCertificate' ? 'Medical Certificate' : 'Government ID'} marked as ${status}!`, 'success');
            setDoctor((prev: any) => {
                if (!prev) return prev;
                const reasonKey = `${docType}RejectionReason`;
                return { ...prev, [`${docType}Status`]: status, [reasonKey]: status === 'approved' ? '' : reason, verificationStatus: res.data.verificationStatus || prev.verificationStatus };
            });
        } catch (err) {
            showNotif(`Failed to update document status.`, 'error');
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
    const vStatus = doctor?.verificationStatus || 'pending';
    const aStatus = doctor?.accountStatus || 'active';

    const isMedCertApproved = doctor?.medicalCertificateStatus === 'approved';
    const isGovIdApproved = doctor?.governmentIdStatus === 'approved';
    const areQualsApproved = doctor?.qualifications?.length > 0 
        ? doctor.qualifications.every((q: any) => q.certificateStatus === 'approved')
        : true; // If no qualifications, consider them approved

    const isFullyApproved = isMedCertApproved && isGovIdApproved && areQualsApproved;

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
                                <div className="profile-avatar-wrap" style={{ overflow: 'hidden' }}>
                                    {doctor?.avatarUrl ? (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${doctor.avatarUrl}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dName)}&background=c7d2fe&color=3730a3&size=128`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                </div>
                                <div className="profile-name">{dName}</div>
                                <div className="profile-specialty">{dSpecialty}</div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
                                    <span className={`badge ${vStatus === 'approved' ? 'badge-green' : vStatus === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                                        <i className="fas fa-circle" style={{ fontSize: '7px' }}></i> Verification: {vStatus.charAt(0).toUpperCase() + vStatus.slice(1)}
                                    </span>
                                    {vStatus === 'approved' && (
                                        <span className={`badge ${aStatus === 'active' ? 'badge-blue' : 'badge-red'}`}>
                                            <i className="fas fa-circle" style={{ fontSize: '7px' }}></i> Account: {aStatus.charAt(0).toUpperCase() + aStatus.slice(1)}
                                        </span>
                                    )}
                                </div>
                                <div className="stat-row">
                                    <div className="stat-item"><div className="stat-num">{doctor?.patients || 0}</div><div className="stat-lbl">Patients</div></div>
                                    <div className="stat-item"><div className="stat-num">{doctor?.rating ? doctor.rating + '★' : 'N/A'}</div><div className="stat-lbl">Rating</div></div>
                                    <div className="stat-item"><div className="stat-num">₹0</div><div className="stat-lbl">Earnings</div></div>
                                </div>
                                <div className="action-btns">
                                    {vStatus === 'approved' && aStatus === 'active' && (
                                        <button className="btn btn-warning" onClick={() => handleAction('suspend')}><i className="fas fa-ban"></i> Suspend Account</button>
                                    )}
                                    {vStatus === 'approved' && aStatus === 'suspended' && (
                                        <button className="btn btn-warning" style={{ background: '#fef3c7', color: '#b45309' }} onClick={() => handleAction('unsuspend')}><i className="fas fa-rotate-left"></i> Unsuspend Account</button>
                                    )}
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
                                <div className="info-item" style={{ gridColumn: '1 / -1' }}><div className="info-label">Bio / About</div><div className="info-value">{doctor?.bio || 'N/A'}</div></div>
                                <div className="info-item" style={{ gridColumn: '1 / -1' }}><div className="info-label">Expertise Tags</div>
                                    <div className="info-value" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                        {doctor?.expertiseTags?.length > 0 ? doctor.expertiseTags.map((tag: string, i: number) => (
                                            <span key={i} className="badge badge-blue">{tag}</span>
                                        )) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-graduation-cap" style={{ color: 'var(--indigo)' }}></i> Qualifications & Experience</div>
                            <div className="info-grid-2">
                                {!(doctor?.qualifications && doctor.qualifications.length > 0) && (
                                    <>
                                        <div className="info-item"><div className="info-label">Degree</div><div className="info-value">{doctor?.degree || 'N/A'}</div></div>
                                        <div className="info-item"><div className="info-label">Medical College</div><div className="info-value">{doctor?.medicalCollege || 'N/A'}</div></div>
                                    </>
                                )}
                                <div className="info-item"><div className="info-label">Specialty</div><div className="info-value">{dSpecialty}</div></div>
                                <div className="info-item"><div className="info-label">Registration No.</div><div className="info-value">{doctor?.registrationNumber || doctor?.licenseNumber || 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Experience</div><div className="info-value">{doctor?.experience || doctor?.yearsOfExperience ? (doctor.experience || doctor.yearsOfExperience) + ' Years' : 'N/A'}</div></div>
                                <div className="info-item"><div className="info-label">Current Hospital</div><div className="info-value">{doctor?.hospital || 'N/A'}</div></div>
                            </div>
                            
                            {doctor?.qualifications && doctor.qualifications.length > 0 && (
                                <div style={{ marginTop: '16px' }}>
                                    <div className="info-label" style={{ marginBottom: '8px' }}>Degrees & Certifications</div>
                                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14px', color: 'var(--gray-700)' }}>
                                        {doctor.qualifications.map((qual: any, idx: number) => (
                                            <li key={idx} style={{ marginBottom: '6px' }}>
                                                <strong>{qual.degree}</strong> from {qual.institution} {qual.year ? `(${qual.year})` : ''}
                                                {qual.certificateUrl && (
                                                    <span style={{ marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                        <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${qual.certificateUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium text-[13px] inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded">
                                                            <i className="fas fa-file-pdf text-red-500"></i> View Certificate
                                                        </a>
                                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${qual.certificateStatus === 'approved' ? 'bg-green-100 text-green-700' : qual.certificateStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {qual.certificateStatus || 'pending'}
                                                        </span>
                                                        {(qual.certificateStatus === 'pending' || !qual.certificateStatus || qual.certificateStatus === 'rejected') && (
                                                            <button type="button" onClick={() => handleQualStatus(qual.id, 'approved')} className="text-green-600 hover:text-green-800" title="Approve"><i className="fas fa-check-circle"></i></button>
                                                        )}
                                                        {(qual.certificateStatus === 'pending' || !qual.certificateStatus) && (
                                                            <button type="button" onClick={() => handleQualStatus(qual.id, 'rejected')} className="text-red-500 hover:text-red-700" title="Reject"><i className="fas fa-times-circle"></i></button>
                                                        )}
                                                    </span>
                                                )}
                                                {qual.certificateStatus === 'rejected' && qual.rejectionReason && (
                                                    <div className="text-xs text-red-600 mt-1 ml-4 bg-red-50 p-2 rounded inline-block">
                                                        <strong>Rejection Reason:</strong> {qual.rejectionReason}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Document Verification */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-file-shield" style={{ color: 'var(--indigo)' }}></i> Document Verification</div>
                            <div className="doc-list">
                                {doctor?.medicalCertificateUrl ? (
                                    <>
                                    <div className="doc-item">
                                        <div className="doc-icon"><i className="fas fa-id-badge"></i></div>
                                        <div className="doc-name">Medical Council Registration Certificate</div>
                                        <span className={`badge ${doctor?.medicalCertificateStatus === 'approved' ? 'badge-green' : doctor?.medicalCertificateStatus === 'rejected' ? 'badge-red' : 'badge-yellow'} doc-status`}>{doctor?.medicalCertificateStatus || 'Pending'}</span>
                                        <div className="doc-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', marginRight: '8px' }}>
                                                {(doctor?.medicalCertificateStatus === 'pending' || !doctor?.medicalCertificateStatus || doctor?.medicalCertificateStatus === 'rejected') && (
                                                    <button type="button" onClick={() => handleDocStatus('medicalCertificate', 'approved')} className="text-green-600 hover:text-green-800" title="Approve"><i className="fas fa-check-circle text-lg"></i></button>
                                                )}
                                                {(doctor?.medicalCertificateStatus === 'pending' || !doctor?.medicalCertificateStatus) && (
                                                    <button type="button" onClick={() => handleDocStatus('medicalCertificate', 'rejected')} className="text-red-500 hover:text-red-700" title="Reject"><i className="fas fa-times-circle text-lg"></i></button>
                                                )}
                                            </div>
                                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${doctor.medicalCertificateUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => showNotif('Viewing document...', 'info')}><i className="fas fa-eye"></i> View</a>
                                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${doctor.medicalCertificateUrl}`} download className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => showNotif('Downloading...', 'success')}><i className="fas fa-download"></i> Download</a>
                                        </div>
                                    </div>
                                    {doctor?.medicalCertificateStatus === 'rejected' && doctor?.medicalCertificateRejectionReason && (
                                        <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded mx-4 mb-4">
                                            <strong>Rejection Reason:</strong> {doctor.medicalCertificateRejectionReason}
                                        </div>
                                    )}
                                    </>
                                ) : (
                                    <div className="doc-item text-gray-400">No Medical Certificate Uploaded</div>
                                )}
                                {doctor?.governmentIdUrl ? (
                                    <>
                                    <div className="doc-item">
                                        <div className="doc-icon"><i className="fas fa-passport"></i></div>
                                        <div className="doc-name">Government ID / Resume</div>
                                        <span className={`badge ${doctor?.governmentIdStatus === 'approved' ? 'badge-green' : doctor?.governmentIdStatus === 'rejected' ? 'badge-red' : 'badge-yellow'} doc-status`}>{doctor?.governmentIdStatus || 'Pending'}</span>
                                        <div className="doc-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', marginRight: '8px' }}>
                                                {(doctor?.governmentIdStatus === 'pending' || !doctor?.governmentIdStatus || doctor?.governmentIdStatus === 'rejected') && (
                                                    <button type="button" onClick={() => handleDocStatus('governmentId', 'approved')} className="text-green-600 hover:text-green-800" title="Approve"><i className="fas fa-check-circle text-lg"></i></button>
                                                )}
                                                {(doctor?.governmentIdStatus === 'pending' || !doctor?.governmentIdStatus) && (
                                                    <button type="button" onClick={() => handleDocStatus('governmentId', 'rejected')} className="text-red-500 hover:text-red-700" title="Reject"><i className="fas fa-times-circle text-lg"></i></button>
                                                )}
                                            </div>
                                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${doctor.governmentIdUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => showNotif('Viewing document...', 'info')}><i className="fas fa-eye"></i> View</a>
                                            <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${doctor.governmentIdUrl}`} download className="text-blue-600 hover:text-blue-800 font-medium" onClick={() => showNotif('Downloading...', 'success')}><i className="fas fa-download"></i> Download</a>
                                        </div>
                                    </div>
                                    {doctor?.governmentIdStatus === 'rejected' && doctor?.governmentIdRejectionReason && (
                                        <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded mx-4 mb-4">
                                            <strong>Rejection Reason:</strong> {doctor.governmentIdRejectionReason}
                                        </div>
                                    )}
                                    </>
                                ) : (
                                    <div className="doc-item text-gray-400">No Government ID Uploaded</div>
                                )}
                            </div>
                            {doctor?.verificationStatus === 'pending' && (
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                    {!isFullyApproved && (
                                        <div className="text-sm text-yellow-600 font-medium flex items-center mr-auto">
                                            <i className="fas fa-triangle-exclamation mr-2"></i> All documents must be approved before final approval.
                                        </div>
                                    )}
                                    <button className="btn btn-success" onClick={() => handleAction('approve')} disabled={!isFullyApproved} style={{ opacity: !isFullyApproved ? 0.5 : 1 }}>
                                        <i className="fas fa-check-circle"></i> Approve Doctor
                                    </button>
                                    <button className="btn btn-danger-outline" style={{ background: '#fff', border: '2px solid var(--danger)', color: 'var(--danger)' }} onClick={() => handleAction('reject')}>
                                        <i className="fas fa-xmark-circle"></i> Reject Doctor
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Consultation & Schedule */}
                        <div className="info-section">
                            <div className="section-title"><i className="fas fa-calendar-alt" style={{ color: 'var(--indigo)' }}></i> Schedule & Consultation</div>
                            <div className="info-grid-2">
                                <div className="info-item">
                                    <div className="info-label">Video Consultation</div>
                                    <div className="info-value">
                                        {doctor?.consultationSettings?.video?.enabled ? (
                                            <span className="text-green-600 font-medium">Enabled (₹{doctor?.consultationSettings?.video?.fee || 0})</span>
                                        ) : 'Disabled'}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Physical Consultation</div>
                                    <div className="info-value">
                                        {doctor?.consultationSettings?.physical?.enabled ? (
                                            <span className="text-green-600 font-medium">Enabled (₹{doctor?.consultationSettings?.physical?.fee || 0})</span>
                                        ) : 'Disabled'}
                                    </div>
                                </div>
                                {doctor?.consultationSettings?.physical?.enabled && (
                                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                        <div className="info-label">Clinic Details</div>
                                        <div className="info-value">{doctor?.consultationSettings?.physical?.clinicName} - {doctor?.consultationSettings?.physical?.clinicAddress}</div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ marginTop: '16px' }}>
                                <div className="info-label" style={{ marginBottom: '12px' }}>Working Hours</div>
                                
                                <div className="mb-4">
                                    <h4 className="font-bold text-gray-700 mb-2 text-sm">Online (Video)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                                            const slot = doctor?.workingHours?.online?.[day];
                                            const labelMap: Record<string, string> = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
                                            return (
                                                <div key={'online-'+day} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                                                    <div className="font-semibold text-gray-700 mb-1">{labelMap[day]}</div>
                                                    {slot?.active ? (
                                                        <div className="text-gray-600">{slot.start} - {slot.end}</div>
                                                    ) : (
                                                        <div className="text-red-400">Not Available</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-700 mb-2 text-sm">Offline (In-Person)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                                            const slot = doctor?.workingHours?.offline?.[day];
                                            const labelMap: Record<string, string> = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
                                            return (
                                                <div key={'offline-'+day} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                                                    <div className="font-semibold text-gray-700 mb-1">{labelMap[day]}</div>
                                                    {slot?.active ? (
                                                        <div className="text-gray-600">{slot.start} - {slot.end}</div>
                                                    ) : (
                                                        <div className="text-red-400">Not Available</div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
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


            <div className={`fixed top-5 right-5 bg-white rounded-xl py-3 px-4 shadow-lg flex items-center gap-2 text-sm z-[2000] transition-transform duration-300 min-w-[280px] ${notification.show ? 'translate-x-0' : 'translate-x-[120%]'} ${notification.type === 'success' ? 'border-l-4 border-green-500' : notification.type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'}`}>
                <i className={`fas ${notification.type === 'success' ? 'fa-circle-check text-green-500' : notification.type === 'error' ? 'fa-circle-exclamation text-red-500' : 'fa-circle-info text-blue-500'}`}></i>
                <span>{notification.msg}</span>
            </div>
        </div>
    );
}
