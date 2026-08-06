'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { useRouter } from 'next/navigation';
import './patients.css';

interface EmergencyContact {
    name?: string;
    relationship?: string;
    phone?: string;
}

interface Address {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

interface MedicalHistory {
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
}

interface Patient {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    bloodGroup?: string;
    avatarUrl?: string;
    joined: string;
    appts: number;
    status: string;
    accountStatus: string;
    isProfileCompleted: boolean;
    emergencyContact?: EmergencyContact;
    address?: Address;
    medicalHistory?: MedicalHistory;
}

export default function AdminPatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredData, setFilteredData] = useState<Patient[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, newThisMonth: 0 });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPatients, setTotalPatients] = useState(0);
    const perPage = 15;
    
    // Selections
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Drawer
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{action: string, id: string | null} | null>(null);
    
    // Notification
    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');

    const fetchPatients = async () => {
        try {
            const params: any = {
                page: currentPage,
                limit: perPage
            };
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;
            if (genderFilter) params.gender = genderFilter;
            if (sortFilter) params.sort = sortFilter;

            const res = await axiosInstance.get('/admin/patients', { params });
            if (res.data?.success && res.data.patients) {
                const mapped = res.data.patients.map((u: any) => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone || 'N/A',
                    age: u.age || 0,
                    gender: u.gender ? (u.gender.charAt(0).toUpperCase() + u.gender.slice(1)) : 'Unknown',
                    bloodGroup: u.bloodGroup || 'N/A',
                    avatarUrl: u.avatarUrl || '',
                    joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                    appts: u.appts || 0,
                    status: u.accountStatus === 'active' ? 'Active' : (u.accountStatus === 'suspended' ? 'Suspended' : 'Inactive'),
                    accountStatus: u.accountStatus || 'active',
                    isProfileCompleted: u.isProfileCompleted,
                }));
                setPatients(mapped);
                setFilteredData(mapped);
                setTotalPatients(res.data.total || mapped.length);
            }
        } catch (error) {
            console.error('Failed to fetch patients', error);
            showNotif('Failed to load patients', 'error');
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axiosInstance.get('/admin/patients/stats');
            if (res.data?.success && res.data.stats) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, genderFilter, sortFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPatients();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, genderFilter, sortFilter, currentPage]);

    useEffect(() => {
        fetchStats();
    }, []);

    const showNotif = (msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3500);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set(selectedIds);
            filteredData.forEach(p => newSet.add(p.id));
            setSelectedIds(newSet);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleBulkMode = () => {
        setBulkMode(!bulkMode);
        setSelectedIds(new Set());
    };

    const handleBulkAction = (action: string) => {
        if (selectedIds.size === 0) return;
        setPendingAction({ action, id: null });
        setIsModalOpen(true);
    };

    const confirmAction = async () => {
        setIsModalOpen(false);
        try {
            if (pendingAction?.action === 'delete') {
                if (pendingAction.id) {
                    await axiosInstance.delete(`/admin/users/${pendingAction.id}`);
                } else {
                    for (const id of Array.from(selectedIds)) {
                        await axiosInstance.delete(`/admin/users/${id}`);
                    }
                }
                showNotif(pendingAction.id ? 'Patient deleted successfully' : 'Patient(s) deleted successfully', 'success');
            } else if (pendingAction?.action === 'suspend') {
                if (pendingAction.id) {
                    // Update user endpoint or specific suspend endpoint if it exists
                    // await axiosInstance.put(`/admin/users/patients/${pendingAction.id}/suspend`);
                    showNotif('Feature not fully implemented for single patient yet', 'info');
                } else {
                    showNotif('Feature not fully implemented for bulk suspend yet', 'info');
                }
            }
            setPendingAction(null);
            setSelectedIds(new Set());
            setBulkMode(false);
            fetchPatients();
        } catch (error) {
            showNotif('Action failed', 'error');
        }
    };

    const viewPatient = async (id: string) => {
        try {
            const res = await axiosInstance.get(`/admin/patients/${id}`);
            if (res.data?.success && res.data.user) {
                const u = res.data.user;
                setSelectedPatient({
                    id: u.id,
                    name: u.name,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    phone: u.phone || 'N/A',
                    age: u.age || 0,
                    gender: u.gender ? (u.gender.charAt(0).toUpperCase() + u.gender.slice(1)) : 'Unknown',
                    bloodGroup: u.bloodGroup || 'N/A',
                    avatarUrl: u.avatarUrl || '',
                    joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                    appts: u.appts || 0,
                    status: u.accountStatus === 'active' ? 'Active' : (u.accountStatus === 'suspended' ? 'Suspended' : 'Inactive'),
                    accountStatus: u.accountStatus || 'active',
                    isProfileCompleted: u.isProfileCompleted,
                    emergencyContact: u.emergencyContact,
                    address: u.address,
                    medicalHistory: u.medicalHistory
                });
                setIsDrawerOpen(true);
            }
        } catch (error) {
            showNotif('Failed to load patient details', 'error');
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Patients Management</h1>
                    <p>View, manage and monitor all registered patients on the platform</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline" onClick={() => showNotif('Exporting patient data as CSV...', 'success')}>
                        <i className="fas fa-download"></i> Export CSV
                    </button>
                    <button className="btn btn-indigo" onClick={() => showNotif('Feature coming soon!', 'warning')}>
                        <i className="fas fa-plus"></i> Add Patient
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon si-indigo"><i className="fas fa-users"></i></div>
                    <div><div className="stat-val">{stats.total.toLocaleString()}</div><div className="stat-lbl">Total Patients</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-green"><i className="fas fa-user-check"></i></div>
                    <div><div className="stat-val">{stats.active.toLocaleString()}</div><div className="stat-lbl">Active Patients</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-orange"><i className="fas fa-user-plus"></i></div>
                    <div><div className="stat-val">{stats.newThisMonth.toLocaleString()}</div><div className="stat-lbl">New This Month</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-red"><i className="fas fa-user-slash"></i></div>
                    <div><div className="stat-val">{stats.suspended.toLocaleString()}</div><div className="stat-lbl">Suspended</div></div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-wrap">
                    <i className="fas fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, email or phone..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="fg">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
                <div className="fg">
                    <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                        <option value="">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="fg">
                    <select value={sortFilter} onChange={(e) => setSortFilter(e.target.value)}>
                        <option value="">Sort By</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setGenderFilter('');
                    setSortFilter('');
                }}>
                    <i className="fas fa-rotate"></i> Reset
                </button>
            </div>

            {/* Table Card */}
            <div className="table-card">
                <div className="table-top">
                    <h3>All Patients</h3>
                    <span className="tcount">{totalPatients.toLocaleString()} patients</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={toggleBulkMode}>
                            <i className="fas fa-list-check"></i> Bulk Select
                        </button>
                    </div>
                </div>
                
                <div className={`bulk-bar ${selectedIds.size > 0 ? 'show' : ''}`}>
                    <span>{selectedIds.size} selected</span>
                    <button className="btn btn-sm" style={{ background: '#fff7ed', color: '#ea580c', border: 'none' }} onClick={() => handleBulkAction('suspend')}>
                        <i className="fas fa-ban"></i> Suspend Selected
                    </button>
                    <button className="btn btn-sm" style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none' }} onClick={() => handleBulkAction('delete')}>
                        <i className="fas fa-trash"></i> Delete Selected
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => showNotif(`Exported ${selectedIds.size} patient records`, 'success')}>
                        <i className="fas fa-download"></i> Export Selected
                    </button>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input 
                                        type="checkbox" 
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        checked={filteredData.length > 0 && filteredData.every(p => selectedIds.has(p.id))}
                                    />
                                </th>
                                <th>Patient ↕</th>
                                <th>Phone</th>
                                <th>Age / Gender</th>
                                <th>Registered</th>
                                <th>Appointments</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(p => {
                                const initials = p.name ? p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PT';
                                const color = p.status === 'Active' ? '#10b981' : p.status === 'Inactive' ? '#6b7280' : '#ef4444';
                                
                                return (
                                <tr key={p.id} className={selectedIds.has(p.id) ? 'sel' : ''}>
                                    <td>
                                        {bulkMode ? (
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(p.id)} 
                                                onChange={() => handleSelectRow(p.id)}
                                            />
                                        ) : (
                                            <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>...{p.id.substring(p.id.length - 4)}</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            {p.avatarUrl ? (
                                                <img src={p.avatarUrl.startsWith('http') ? p.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL}${p.avatarUrl.startsWith('/') ? '' : '/'}${p.avatarUrl}`} alt={p.name} className="ava" />
                                            ) : (
                                                <div className="ava" style={{ background: `${color}20`, color: color }}>{initials}</div>
                                            )}
                                            <div>
                                                <div className="un">{p.name}</div>
                                                <div className="us">{p.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{p.phone}</td>
                                    <td>{p.age} yrs · {p.gender}</td>
                                    <td>{p.joined}</td>
                                    <td><span style={{ fontWeight: 600, color: 'var(--indigo)' }}>{p.appts}</span></td>
                                    <td>
                                        <span className={`badge ${p.status === 'Active' ? 'bg-green' : p.status === 'Inactive' ? 'bg-gray' : 'bg-red'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="act-btns">
                                            <button className="ab view" title="View Details" onClick={() => viewPatient(p.id)}><i className="fas fa-eye"></i></button>
                                            <button className="ab edit" title="Edit" onClick={() => showNotif(`Edit feature coming soon`, 'info')}><i className="fas fa-pen"></i></button>
                                            <button className="ab sus" title="Suspend" onClick={() => { setPendingAction({ action: 'suspend', id: p.id }); setIsModalOpen(true); }}><i className="fas fa-ban"></i></button>
                                            <button className="ab del" title="Delete" onClick={() => { setPendingAction({ action: 'delete', id: p.id }); setIsModalOpen(true); }}><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <div className="pg-info">
                        Showing {totalPatients === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, totalPatients)} of {totalPatients.toLocaleString()}
                    </div>
                    <div className="pg-btns">
                        <button className="pb" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        
                        {(() => {
                            const totalPages = Math.ceil(totalPatients / perPage);
                            if (totalPages === 0) return null;
                            const pages = [];
                            for (let i = 1; i <= totalPages; i++) {
                                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                                    pages.push(
                                        <button key={i} className={`pb ${currentPage === i ? 'active' : ''}`} onClick={() => setCurrentPage(i)}>{i}</button>
                                    );
                                } else if (i === currentPage - 2 || i === currentPage + 2) {
                                    pages.push(<span key={`ellipsis-${i}`} style={{ alignSelf: 'center', color: 'var(--gray-400)' }}>...</span>);
                                }
                            }
                            return pages;
                        })()}
                        
                        <button className="pb" onClick={() => setCurrentPage(Math.min(Math.ceil(totalPatients / perPage), currentPage + 1))} disabled={currentPage >= Math.ceil(totalPatients / perPage)}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Detail Drawer */}
            <div className={`drawer-ov ${isDrawerOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false); }}>
                <div className="drawer" style={{ width: '450px' }}>
                    <div className="drawer-head">
                        <h3>Patient Details</h3>
                        <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}><i className="fas fa-xmark"></i></button>
                    </div>
                    {selectedPatient && (
                        <div className="drawer-body" style={{ padding: '20px', overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
                            <div className="profile-top" style={{ marginBottom: '24px' }}>
                                {selectedPatient.avatarUrl ? (
                                    <img src={selectedPatient.avatarUrl.startsWith('http') ? selectedPatient.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL}${selectedPatient.avatarUrl.startsWith('/') ? '' : '/'}${selectedPatient.avatarUrl}`} alt={selectedPatient.name} className="profile-ava" />
                                ) : (
                                    <div className="profile-ava" style={{ background: 'var(--indigo-light)', color: 'var(--indigo)' }}>
                                        {selectedPatient.name ? selectedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PT'}
                                    </div>
                                )}
                                <div>
                                    <div className="profile-name">{selectedPatient.name}</div>
                                    <div className="profile-email">{selectedPatient.email}</div>
                                    <span className={`badge ${selectedPatient.status === 'Active' ? 'bg-green' : selectedPatient.status === 'Inactive' ? 'bg-gray' : 'bg-red'}`} style={{ marginTop: '8px' }}>
                                        {selectedPatient.status} Account
                                    </span>
                                </div>
                            </div>

                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '8px', marginBottom: '16px' }}>
                                Basic Information
                            </h4>
                            <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
                                <div className="info-item"><label>Patient ID</label><span>...{selectedPatient.id.substring(selectedPatient.id.length - 6)}</span></div>
                                <div className="info-item"><label>Phone</label><span>{selectedPatient.phone}</span></div>
                                <div className="info-item"><label>Age</label><span>{selectedPatient.age} years</span></div>
                                <div className="info-item"><label>Gender</label><span>{selectedPatient.gender}</span></div>
                                <div className="info-item"><label>Blood Group</label><span>{selectedPatient.bloodGroup}</span></div>
                                <div className="info-item"><label>Registered</label><span>{selectedPatient.joined}</span></div>
                            </div>

                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '8px', marginBottom: '16px' }}>
                                Address details
                            </h4>
                            <div className="info-grid" style={{ gridTemplateColumns: '1fr', marginBottom: '24px' }}>
                                <div className="info-item">
                                    <label>Full Address</label>
                                    <span>
                                        {selectedPatient.address && (selectedPatient.address.street || selectedPatient.address.city) ? (
                                            <>
                                                {selectedPatient.address.street && <div>{selectedPatient.address.street}</div>}
                                                <div>
                                                    {[selectedPatient.address.city, selectedPatient.address.state, selectedPatient.address.zipCode].filter(Boolean).join(', ')}
                                                </div>
                                                {selectedPatient.address.country && <div>{selectedPatient.address.country}</div>}
                                            </>
                                        ) : 'Not Provided'}
                                    </span>
                                </div>
                            </div>

                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '8px', marginBottom: '16px' }}>
                                Emergency Contact
                            </h4>
                            <div className="info-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
                                <div className="info-item"><label>Name</label><span>{selectedPatient.emergencyContact?.name || 'Not Provided'}</span></div>
                                <div className="info-item"><label>Relationship</label><span>{selectedPatient.emergencyContact?.relationship || 'N/A'}</span></div>
                                <div className="info-item"><label>Phone</label><span>{selectedPatient.emergencyContact?.phone || 'N/A'}</span></div>
                            </div>

                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '8px', marginBottom: '16px' }}>
                                Medical History
                            </h4>
                            <div style={{ marginBottom: '24px' }}>
                                <div className="mb-3">
                                    <label style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Allergies</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {selectedPatient.medicalHistory?.allergies && selectedPatient.medicalHistory.allergies.length > 0 ? (
                                            selectedPatient.medicalHistory.allergies.map((a, i) => <span key={i} className="badge bg-gray">{a}</span>)
                                        ) : <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>None recorded</span>}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Chronic Conditions</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {selectedPatient.medicalHistory?.chronicConditions && selectedPatient.medicalHistory.chronicConditions.length > 0 ? (
                                            selectedPatient.medicalHistory.chronicConditions.map((c, i) => <span key={i} className="badge bg-gray">{c}</span>)
                                        ) : <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>None recorded</span>}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Current Medications</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {selectedPatient.medicalHistory?.currentMedications && selectedPatient.medicalHistory.currentMedications.length > 0 ? (
                                            selectedPatient.medicalHistory.currentMedications.map((m, i) => <span key={i} className="badge bg-gray">{m}</span>)
                                        ) : <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>None recorded</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="stats-mini">
                                <div className="sm-card"><div className="sm-val">{selectedPatient.appts}</div><div className="sm-lbl">Total Appts</div></div>
                            </div>
                            
                            <div className="drawer-acts" style={{ marginTop: '24px' }}>
                                <button className="btn btn-indigo btn-sm" onClick={() => showNotif(`Messaging ${selectedPatient.name}`, 'info')}><i className="fas fa-envelope"></i> Send Message</button>
                                <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#b45309', border: 'none' }} onClick={() => { setPendingAction({ action: 'suspend', id: selectedPatient.id }); setIsModalOpen(true); }}><i className="fas fa-ban"></i> Suspend</button>
                                <button className="btn btn-sm" style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none' }} onClick={() => { setPendingAction({ action: 'delete', id: selectedPatient.id }); setIsModalOpen(true); }}><i className="fas fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            <div className={`modal-ov ${isModalOpen ? 'open' : ''}`}>
                <div className="modal">
                    <div className={`modal-ic ${pendingAction?.action === 'delete' ? 'mic-danger' : 'mic-warn'}`}>
                        {pendingAction?.action === 'delete' ? <i className="fas fa-trash"></i> : <i className="fas fa-ban"></i>}
                    </div>
                    <h3>{pendingAction?.action === 'delete' ? 'Delete Patient?' : (pendingAction?.id === null ? 'Suspend Selected Patients?' : 'Suspend Patient?')}</h3>
                    <p>
                        {pendingAction?.action === 'delete' 
                            ? 'This will permanently remove the patient and all their data. This cannot be undone.' 
                            : (pendingAction?.id === null ? `Suspend ${selectedIds.size} selected patients?` : 'This patient will lose access to the platform until reinstated.')}
                    </p>
                    <div className="modal-acts">
                        <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button 
                            className={`btn ${pendingAction?.action === 'delete' ? 'btn-danger-sm' : ''}`} 
                            style={pendingAction?.action !== 'delete' ? { background: '#f59e0b', color: 'white' } : {}}
                            onClick={confirmAction}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification */}
            <div className={`notif ${notification.type} ${notification.show ? 'show' : ''}`}>
                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
                <span>{notification.msg}</span>
            </div>
        </div>
    );
}
