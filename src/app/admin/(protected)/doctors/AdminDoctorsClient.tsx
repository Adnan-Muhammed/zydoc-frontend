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
    status: string;
    rating: number;
    patients: number;
    joined: string;
}

export default function AdminDoctorsClient() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    
    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    
    // Drawer
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Modal & Notifications
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{type: string, id: string, name: string} | null>(null);
    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

    const fetchDoctors = async () => {
        try {
            const res = await axiosInstance.get('/admin/doctors');
            if (res.data?.success && res.data.doctors) {
                const mappedDoctors = res.data.doctors.map((u: any) => {
                    let displayStatus = 'incomplete';
                    if (u.verificationStatus === 'approved') displayStatus = 'active';
                    else if (u.verificationStatus === 'rejected') displayStatus = 'suspended';
                    else if (u.verificationStatus === 'pending') displayStatus = 'pending';
                    else if (u.isProfileCompleted) displayStatus = 'pending';

                    return {
                        id: u._id,
                        name: u.name || 'Unknown',
                        email: u.email,
                        specialty: u.specialty || 'General Practice', 
                        status: displayStatus,
                        rating: u.rating || 0,
                        patients: u.patients || 0,
                        joined: new Date(u.createdAt).toLocaleDateString()
                    };
                });
                setDoctors(mappedDoctors);
                setFilteredDoctors(mappedDoctors);
            }
        } catch (error) {
            console.error('Failed to fetch doctors', error);
            showNotif('Failed to load doctors', 'error');
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        let result = [...doctors];
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(dr => 
                dr.name.toLowerCase().includes(q) || 
                dr.email.toLowerCase().includes(q) || 
                dr.specialty.toLowerCase().includes(q)
            );
        }
        if (statusFilter) {
            result = result.filter(dr => dr.status === statusFilter);
        }
        if (specialtyFilter) {
            result = result.filter(dr => dr.specialty === specialtyFilter);
        }
        
        if (sortFilter) {
            result.sort((a, b) => {
                if (sortFilter === 'name') return a.name.localeCompare(b.name);
                if (sortFilter === 'rating') return b.rating - a.rating;
                if (sortFilter === 'patients') return b.patients - a.patients;
                return 0;
            }); 
        }
        
        setFilteredDoctors(result);
        setCurrentPage(1);
    }, [searchQuery, statusFilter, specialtyFilter, sortFilter, doctors]);

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
        if (action === 'approve') {
            try {
                for (const id of Array.from(selectedRows)) {
                    await axiosInstance.put(`/admin/users/doctors/${id}/approve`);
                }
                showNotif(`Successfully approved ${selectedRows.size} doctor(s).`, 'success');
                setSelectedRows(new Set());
                fetchDoctors();
            } catch (err) {
                showNotif(`Failed to approve doctors.`, 'error');
            }
        } else {
            showNotif(`Bulk ${action} applied to ${selectedRows.size} doctor(s).`, 'success');
            setSelectedRows(new Set());
        }
    };

    const confirmAction = async () => {
        if (!pendingAction) return;
        setIsModalOpen(false);
        try {
            if (pendingAction.type === 'delete') {
                await axiosInstance.delete(`/admin/users/${pendingAction.id}`);
            } else if (pendingAction.type === 'suspend') {
                await axiosInstance.put(`/admin/users/soft-delete/${pendingAction.id}`);
            } else if (pendingAction.type === 'approve') {
                await axiosInstance.put(`/admin/users/doctors/${pendingAction.id}/approve`);
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
                    <div><div className="stat-val">265</div><div className="stat-lbl">Total Doctors</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-green"><i className="fas fa-user-check"></i></div>
                    <div><div className="stat-val">110</div><div className="stat-lbl">Active Doctors</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-orange"><i className="fas fa-user-plus"></i></div>
                    <div><div className="stat-val">20</div><div className="stat-lbl">New This Month</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-red"><i className="fas fa-user-slash"></i></div>
                    <div><div className="stat-val">5</div><div className="stat-lbl">Suspended</div></div>
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
                <select className="filter-sel" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                </select>
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
                <button className="btn btn-outline btn-sm" onClick={() => bulkAction('approve')}><i className="fas fa-check"></i> Approve</button>
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
                                        <td><span className={`badge ${statusBadge}`}>{dr.status.charAt(0).toUpperCase() + dr.status.slice(1)}</span></td>
                                        <td><span className="stars">{stars}</span> {dr.rating > 0 ? dr.rating : ''}</td>
                                        <td>{dr.patients.toLocaleString()}</td>
                                        <td>{dr.joined}</td>
                                        <td>
                                            <div className="actions">
                                                {dr.status === 'pending' && (
                                                    <button className="action-btn" style={{color: '#10b981', backgroundColor: '#d1fae5'}} title="Approve" onClick={() => { setPendingAction({ type: 'approve', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-check"></i></button>
                                                )}
                                                <button className="action-btn action-view" title="View" onClick={() => viewDoctor(dr)}><i className="fas fa-eye"></i></button>
                                                <button className="action-btn action-edit" title="Edit" onClick={() => showNotif('Edit mode opened', 'success')}><i className="fas fa-pencil"></i></button>
                                                <button className="action-btn action-suspend" title="Suspend" onClick={() => { setPendingAction({ type: 'suspend', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-ban"></i></button>
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
                    <div className="pagination-info">Showing 1–{filteredDoctors.length} of 6,459 doctors</div>
                    <div className="page-btns">
                        <button className="page-btn" disabled><i className="fas fa-chevron-left"></i></button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span style={{ alignSelf: 'center', color: 'var(--gray-400)' }}>...</span>
                        <button className="page-btn">646</button>
                        <button className="page-btn"><i className="fas fa-chevron-right"></i></button>
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
                                    <span className={`badge ${selectedDoctor.status === 'active' ? 'badge-green' : selectedDoctor.status === 'pending' ? 'badge-yellow' : 'badge-red'}`} style={{ marginTop: '6px' }}>
                                        {selectedDoctor.status.charAt(0).toUpperCase() + selectedDoctor.status.slice(1)}
                                    </span>
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
                            <div className="drawer-acts">
                                <button className="btn btn-outline btn-sm" onClick={() => router.push(`/admin/doctors/${selectedDoctor.id}`)} style={{ width: '100%', marginBottom: '8px', justifyContent: 'center' }}><i className="fas fa-arrow-up-right-from-square"></i> View Full Profile</button>
                                <button className="btn btn-indigo btn-sm" onClick={() => showNotif(`Messaging ${selectedDoctor.name}`, 'info')}><i className="fas fa-envelope"></i> Send Message</button>
                                {selectedDoctor.status === 'pending' && (
                                    <button className="btn btn-green btn-sm" onClick={() => { setPendingAction({ type: 'approve', id: selectedDoctor.id, name: selectedDoctor.name }); setIsModalOpen(true); }}><i className="fas fa-check"></i> Approve</button>
                                )}
                                <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#b45309', border: 'none' }} onClick={() => { setPendingAction({ type: 'suspend', id: selectedDoctor.id, name: selectedDoctor.name }); setIsModalOpen(true); }}><i className="fas fa-ban"></i> Suspend</button>
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
