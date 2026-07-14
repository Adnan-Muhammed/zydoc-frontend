'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axiosInstance';
import './doctors.css';

interface Doctor {
    id: string;
    name: string;
    email: string;
    specialty: string;
    status: string; // Keep for legacy if needed, or remove, but we'll use below
    verificationStatus: string;
    accountStatus: string;
    rating: number;
    patients: number;
    joined: string;
    qualifications: any[];
}

export default function AdminDoctorsClient({ mode = 'all' }: { mode?: 'all' | 'approvals' }) {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0, suspended: 0 });
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    
    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const itemsPerPage = 10;
    
    // Drawer
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Modal & Notifications
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{type: string, id: string, name: string} | null>(null);
    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

    const fetchDoctors = async () => {
        try {
            const params: any = {
                page: currentPage,
                limit: itemsPerPage
            };
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;
            if (specialtyFilter) params.specialty = specialtyFilter;
            if (sortFilter) params.sort = sortFilter;

            const res = await axiosInstance.get('/admin/doctors', { params });
            if (res.data?.success && res.data.doctors) {
                let mappedDoctors = res.data.doctors.map((u: any) => {
                    return {
                        id: u._id,
                        name: u.name,
                        email: u.email,
                        specialty: u.specialty,
                        status: u.accountStatus === 'suspended' ? 'suspended' : u.verificationStatus === 'approved' ? 'active' : u.verificationStatus === 'rejected' ? 'rejected' : 'pending',
                        verificationStatus: u.verificationStatus || 'pending',
                        accountStatus: u.accountStatus || 'active',
                        rating: u.rating,
                        patients: u.patients,
                        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                        qualifications: u.qualifications || []
                    };
                });
                
                if (mode === 'approvals') {
                    mappedDoctors = mappedDoctors.filter((dr: Doctor) => dr.verificationStatus === 'pending');
                }

                setDoctors(mappedDoctors);
                setFilteredDoctors(mappedDoctors);
                setTotalDoctors(res.data.total || mappedDoctors.length);
            }
        } catch (error) {
            console.error('Failed to fetch doctors', error);
            showNotif('Failed to load doctors', 'error');
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axiosInstance.get('/admin/doctors/stats');
            if (res.data?.success && res.data.stats) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    // Reset page to 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, specialtyFilter, sortFilter]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDoctors();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, specialtyFilter, sortFilter, currentPage]);

    useEffect(() => {
        fetchStats();
    }, []);

    const showNotif = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3500);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setSpecialtyFilter('');
        setSortFilter('');
    }; 

    const viewDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsDrawerOpen(true);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set<string>();
            filteredDoctors.forEach(dr => newSet.add(dr.id));
            setSelectedRows(newSet);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        const newSet = new Set(selectedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedRows(newSet);
    };

    const bulkAction = async (action: string) => {
        try {
            if (action === 'approve') {
                for (const id of Array.from(selectedRows)) {
                    await axiosInstance.put(`/admin/users/doctors/${id}/approve`);
                }
                showNotif(`Successfully approved ${selectedRows.size} doctor(s).`, 'success');
            } else if (action === 'suspend') {
                for (const id of Array.from(selectedRows)) {
                    await axiosInstance.put(`/admin/users/doctors/${id}/suspend`);
                }
                showNotif(`Successfully suspended ${selectedRows.size} doctor(s).`, 'success');
            } else if (action === 'delete') {
                for (const id of Array.from(selectedRows)) {
                    await axiosInstance.delete(`/admin/users/${id}`);
                }
                showNotif(`Successfully deleted ${selectedRows.size} doctor(s).`, 'success');
            }
            setSelectedRows(new Set());
            fetchDoctors();
        } catch (err) {
            showNotif(`Failed to ${action} doctors.`, 'error');
        }
    };

    const confirmAction = async () => {
        if (!pendingAction) return;
        setIsModalOpen(false);
        try {
            if (pendingAction.type === 'delete') {
                await axiosInstance.delete(`/admin/users/${pendingAction.id}`);
            } else if (pendingAction.type === 'suspend') {
                await axiosInstance.put(`/admin/users/doctors/${pendingAction.id}/suspend`);
            } else if (pendingAction.type === 'unsuspend') {
                await axiosInstance.put(`/admin/users/doctors/${pendingAction.id}/unsuspend`);
            } else if (pendingAction.type === 'approve') {
                await axiosInstance.put(`/admin/users/doctors/${pendingAction.id}/approve`);
            } else if (pendingAction.type === 'reject') {
                await axiosInstance.put(`/admin/users/doctors/${pendingAction.id}/reject`);
            }
            showNotif(`Doctor ${pendingAction.type}d successfully.`, 'success');
            setPendingAction(null);
            fetchDoctors();
        } catch (err) {
            showNotif(`Action failed.`, 'error');
        }
    };

    const sortBy = (field: string) => {
        setSortFilter(field);
    };

    return (
        <div className="admin-doctors-page">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctors Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all registered doctors — view, edit, approve, suspend or remove.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors" onClick={() => showNotif('CSV exported!', 'success')}>
                        <i className="fas fa-download"></i> Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors" onClick={() => showNotif('Add Doctor feature coming soon', 'success')}>
                        <i className="fas fa-user-plus"></i> Add Doctor
                    </button>
                </div>
            </div>



             {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon si-indigo"><i className="fas fa-users"></i></div>
                    <div><div className="stat-val">{stats.total}</div><div className="stat-lbl">Total Doctors</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-green"><i className="fas fa-user-check"></i></div>
                    <div><div className="stat-val">{stats.active}</div><div className="stat-lbl">Active Doctors</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-orange"><i className="fas fa-user-plus"></i></div>
                    <div><div className="stat-val">{stats.newThisMonth}</div><div className="stat-lbl">New This Month</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-red"><i className="fas fa-user-slash"></i></div>
                    <div><div className="stat-val">{stats.suspended}</div><div className="stat-lbl">Suspended</div></div>
                </div>
            </div>


            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-wrap">
                    <i className="fas fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, email, specialty..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {mode !== 'approvals' && (
                    <select className="filter-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                    </select>
                )}
                <select className="filter-sel" value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                    <option value="">All Specialties</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                </select>
                <select className="filter-sel" value={sortFilter} onChange={(e) => setSortFilter(e.target.value)}>
                    <option value="">Sort By</option>
                    <option value="name">Name (A–Z)</option>
                    <option value="rating">Rating (High)</option>
                    <option value="patients">Patients (High)</option>
                    <option value="newest">Newest</option>
                </select>
                <button className="btn btn-outline" onClick={resetFilters}>
                    <i className="fas fa-rotate"></i> Reset
                </button>
            </div>

            {/* Bulk Actions Bar */}
            <div className={`bulk-bar ${selectedRows.size > 0 ? 'show' : ''}`}>
                <span className="bulk-info">{selectedRows.size} selected</span>
                <button className="btn btn-outline btn-sm" disabled title="Action only through full profile view"><i className="fas fa-check"></i> Approve</button>
                <button className="btn btn-outline btn-sm" onClick={() => bulkAction('suspend')}><i className="fas fa-ban"></i> Suspend</button>
                <button className="btn btn-danger btn-sm" onClick={() => bulkAction('delete')}><i className="fas fa-trash"></i> Delete</button>
                <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setSelectedRows(new Set())}><i className="fas fa-xmark"></i> Clear</button>
            </div>

            {/* Table */}
            <div className="table-card">
                <div className="table-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="table-title">All Doctors</div>
                        <div className="table-count">Showing {filteredDoctors.length} of 6,459</div>
                    </div>
                </div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '36px' }}>
                                    <input 
                                        type="checkbox" 
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        checked={filteredDoctors.length > 0 && selectedRows.size === filteredDoctors.length}
                                    />
                                </th>
                                <th onClick={() => sortBy('name')}>Doctor <i className="fas fa-sort sort-icon"></i></th>
                                <th onClick={() => sortBy('specialty')}>Specialty <i className="fas fa-sort sort-icon"></i></th>
                                <th onClick={() => sortBy('status')}>Status <i className="fas fa-sort sort-icon"></i></th>
                                <th onClick={() => sortBy('rating')}>Rating <i className="fas fa-sort sort-icon"></i></th>
                                <th onClick={() => sortBy('patients')}>Patients <i className="fas fa-sort sort-icon"></i></th>
                                <th onClick={() => sortBy('joined')}>Joined <i className="fas fa-sort sort-icon"></i></th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.map(dr => {
                                const initials = dr.name.split(' ').slice(1).map(w=>w[0]).join('').slice(0,2).toUpperCase();
                                const statusBadge = { active: 'badge-green', pending: 'badge-yellow', suspended: 'badge-red' }[dr.status] || 'badge-gray';
                                const stars = dr.rating > 0 ? '★'.repeat(Math.round(dr.rating)) : '—';
                                
                                return (
                                    <tr key={dr.id}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedRows.has(dr.id)}
                                                onChange={() => handleSelectRow(dr.id)}
                                            />
                                        </td>
                                        <td>
                                            <div className="dr-cell">
                                                <div className="dr-avatar">{initials}</div>
                                                <div>
                                                    <div className="dr-name">{dr.name}</div>
                                                    <div className="dr-email">{dr.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{dr.specialty}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {dr.verificationStatus === 'pending' ? (
                                                    <span className="badge badge-yellow"><i className="fas fa-info-circle mr-1"></i> Approval Pending</span>
                                                ) : dr.verificationStatus === 'rejected' ? (
                                                    <span className="badge badge-red">Verification Rejected</span>
                                                ) : (
                                                    <>
                                                        <span className="badge badge-green">Verified</span>
                                                        <span className={`badge ${dr.accountStatus === 'active' ? 'badge-blue' : 'badge-red'}`}>
                                                            {dr.accountStatus === 'active' ? 'Active Account' : 'Suspended Account'}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td><span className="stars">{stars}</span> {dr.rating > 0 ? dr.rating : ''}</td>
                                        <td>{dr.patients.toLocaleString()}</td>
                                        <td>{dr.joined}</td>
                                        <td>
                                            <div className="actions">
                                                {dr.verificationStatus === 'pending' && (
                                                    <>
                                                        <button className="action-btn" style={{color: '#10b981', backgroundColor: '#d1fae5'}} title="Approve" onClick={() => { setPendingAction({ type: 'approve', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-check"></i></button>
                                                        <button className="action-btn" style={{color: '#ef4444', backgroundColor: '#fee2e2'}} title="Reject" onClick={() => { setPendingAction({ type: 'reject', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-xmark"></i></button>
                                                    </>
                                                )}
                                                <button className="action-btn action-view" title="View" onClick={() => viewDoctor(dr)}><i className="fas fa-eye"></i></button>
                                                <button className="action-btn action-edit" title="Edit" onClick={() => showNotif('Edit mode opened', 'success')}><i className="fas fa-pencil"></i></button>
                                                {dr.verificationStatus === 'approved' && dr.accountStatus === 'active' && (
                                                    <button className="action-btn action-suspend" title="Suspend" onClick={() => { setPendingAction({ type: 'suspend', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-ban"></i></button>
                                                )}
                                                {dr.verificationStatus === 'approved' && dr.accountStatus === 'suspended' && (
                                                    <button className="action-btn" style={{color: '#f59e0b', backgroundColor: '#fef3c7'}} title="Unsuspend" onClick={() => { setPendingAction({ type: 'unsuspend', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-rotate-left"></i></button>
                                                )}
                                                <button className="action-btn action-delete" title="Delete" onClick={() => { setPendingAction({ type: 'delete', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                    <div className="pagination-info">
                        Showing {totalDoctors === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalDoctors)} of {totalDoctors.toLocaleString()} doctors
                    </div>
                    <div className="page-btns">
                        <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><i className="fas fa-chevron-left"></i></button>
                        
                        {(() => {
                            const totalPages = Math.ceil(totalDoctors / itemsPerPage);
                            if (totalPages === 0) return null;
                            const pages = [];
                            for (let i = 1; i <= totalPages; i++) {
                                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                                    pages.push(
                                        <button key={i} className={`page-btn ${currentPage === i ? 'active' : ''}`} onClick={() => setCurrentPage(i)}>{i}</button>
                                    );
                                } else if (i === currentPage - 2 || i === currentPage + 2) {
                                    pages.push(<span key={`ellipsis-${i}`} style={{ alignSelf: 'center', color: 'var(--gray-400)' }}>...</span>);
                                }
                            }
                            return pages;
                        })()}

                        <button className="page-btn" disabled={currentPage >= Math.ceil(totalDoctors / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)}><i className="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>

            {/* Doctor Detail Drawer */}
            <div className={`drawer-ov ${isDrawerOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false); }}>
                <div className="drawer">
                    <div className="drawer-head">
                        <h3>{selectedDoctor?.name || 'Doctor Details'}</h3>
                        <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}><i className="fas fa-xmark"></i></button>
                    </div>
                    {selectedDoctor && (
                        <div className="drawer-body">
                            <div className="profile-top">
                                <div className="profile-ava" style={{ background: 'var(--indigo-light)', color: 'var(--indigo)' }}>
                                    {selectedDoctor.name.split(' ').slice(1).map(w=>w[0]).join('').slice(0,2).toUpperCase() || selectedDoctor.name.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="profile-name">{selectedDoctor.name}</div>
                                    <div className="profile-email">{selectedDoctor.email}</div>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                        <span className={`badge ${selectedDoctor.verificationStatus === 'approved' ? 'badge-green' : selectedDoctor.verificationStatus === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                                            Verification: {selectedDoctor.verificationStatus.charAt(0).toUpperCase() + selectedDoctor.verificationStatus.slice(1)}
                                        </span>
                                        {selectedDoctor.verificationStatus === 'approved' && (
                                            <span className={`badge ${selectedDoctor.accountStatus === 'active' ? 'badge-blue' : 'badge-red'}`}>
                                                Account: {selectedDoctor.accountStatus.charAt(0).toUpperCase() + selectedDoctor.accountStatus.slice(1)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="info-grid">
                                <div className="info-item"><label>Specialty</label><span>{selectedDoctor.specialty}</span></div>
                                <div className="info-item"><label>Rating</label><span>{selectedDoctor.rating > 0 ? selectedDoctor.rating : 'N/A'}</span></div>
                                <div className="info-item"><label>Joined</label><span>{selectedDoctor.joined}</span></div>
                                <div className="info-item"><label>Doctor ID</label><span>#{selectedDoctor.id ? String(selectedDoctor.id).substring(0,6) : 'N/A'}</span></div>
                            </div>
                            <div className="stats-mini">
                                <div className="sm-card"><div className="sm-val">{selectedDoctor.patients.toLocaleString()}</div><div className="sm-lbl">Total Patients</div></div>
                                <div className="sm-card"><div className="sm-val">{Math.floor(selectedDoctor.patients * 2.5).toLocaleString()}</div><div className="sm-lbl">Consultations</div></div>
                                <div className="sm-card"><div className="sm-val">₹{(selectedDoctor.patients * 800).toLocaleString()}</div><div className="sm-lbl">Earnings</div></div>
                            </div>
                            
                            {selectedDoctor.qualifications && selectedDoctor.qualifications.length > 0 && (
                                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '10px' }}>Qualifications</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedDoctor.qualifications.map((q: any) => (
                                            <div key={q.id || Math.random()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)' }}>{q.degree}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{q.institution} • {q.year}</div>
                                                </div>
                                                {q.certificateUrl && (
                                                    <a
                                                        href={q.certificateUrl.startsWith('http') ? q.certificateUrl : `${process.env.NEXT_PUBLIC_API_URL}${q.certificateUrl.startsWith('/') ? '' : '/'}${q.certificateUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline btn-sm"
                                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                                    >
                                                        <i className="fas fa-file-pdf" style={{ marginRight: '4px' }}></i> View
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="drawer-acts">
                                <button className="btn btn-outline btn-sm" onClick={() => router.push(`/admin/doctors/${selectedDoctor.id}`)} style={{ width: '100%', marginBottom: '8px', justifyContent: 'center' }}><i className="fas fa-arrow-up-right-from-square"></i> View Full Profile</button>
                                <button className="btn btn-indigo btn-sm" onClick={() => showNotif(`Messaging ${selectedDoctor.name}`, 'info')}><i className="fas fa-envelope"></i> Send Message</button>
                                {selectedDoctor.verificationStatus === 'pending' && (
                                    <>
                                        <button className="btn btn-green btn-sm" onClick={() => { setPendingAction({ type: 'approve', id: selectedDoctor.id, name: selectedDoctor.name }); setIsModalOpen(true); }}><i className="fas fa-check"></i> Approve</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => { setPendingAction({ type: 'reject', id: selectedDoctor.id, name: selectedDoctor.name }); setIsModalOpen(true); }}><i className="fas fa-xmark"></i> Reject</button>
                                    </>
                                )}
                                {selectedDoctor.verificationStatus === 'approved' && selectedDoctor.accountStatus === 'active' && (
                                    <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#b45309', border: 'none' }} onClick={() => { setPendingAction({ type: 'suspend', id: selectedDoctor.id, name: selectedDoctor.name }); setIsModalOpen(true); }}><i className="fas fa-ban"></i> Suspend</button>
                                )}
                                {selectedDoctor.verificationStatus === 'approved' && selectedDoctor.accountStatus === 'suspended' && (
                                    <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#b45309', border: 'none' }} onClick={() => { setPendingAction({ type: 'unsuspend', id: selectedDoctor.id, name: selectedDoctor.name }); setIsModalOpen(true); }}><i className="fas fa-rotate-left"></i> Unsuspend</button>
                                )}
                                <button className="btn btn-sm" style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none' }} onClick={() => { setPendingAction({ type: 'delete', id: selectedDoctor.id, name: selectedDoctor.name }); setIsModalOpen(true); }}><i className="fas fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
 
            {/* Confirm Modal */}
            <div className={`modal-overlay ${isModalOpen ? 'show' : ''}`}>
                <div className="modal">
                    <div className="modal-icon" style={{ 
                        background: pendingAction?.type === 'delete' ? '#fee2e2' : (pendingAction?.type === 'approve' ? '#d1fae5' : '#fef3c7'), 
                        color: pendingAction?.type === 'delete' ? '#ef4444' : (pendingAction?.type === 'approve' ? '#10b981' : '#f59e0b') 
                    }}>
                        <i className={`fas fa-${pendingAction?.type === 'delete' ? 'trash' : (pendingAction?.type === 'approve' ? 'check' : 'ban')}`}></i>
                    </div>
                    <h3 style={{ textTransform: 'capitalize' }}>{pendingAction?.type} Doctor</h3>
                    <p>Are you sure you want to {pendingAction?.type} {pendingAction?.name}?</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className={`btn ${pendingAction?.type === 'delete' ? 'btn-danger' : (pendingAction?.type === 'approve' ? 'btn-green' : 'btn-indigo')}`} 
                            style={pendingAction?.type === 'suspend' ? { background: '#f59e0b', color: 'white' } : (pendingAction?.type === 'approve' ? { background: '#10b981', color: 'white' } : {})} 
                            onClick={confirmAction}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification */}
            <div className={`notification ${notification.type} ${notification.show ? 'show' : ''}`}>
                <i className={`fas ${notification.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} style={{ color: notification.type === 'success' ? '#10b981' : '#ef4444' }}></i>
                <span>{notification.msg}</span>
            </div>
        </div>
    );
}
