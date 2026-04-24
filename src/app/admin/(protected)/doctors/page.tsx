'use client';

import React, { useState, useEffect } from 'react';
import './doctors.css';

interface Doctor {
    id: number;
    name: string;
    email: string;
    specialty: string;
    status: string;
    rating: number;
    patients: number;
    joined: string;
}

const initialDoctors: Doctor[] = [
    {id:1,name:'Dr. Priya Sharma',email:'priya.sharma@email.com',specialty:'Cardiologist',status:'active',rating:4.9,patients:287,joined:'Jan 12, 2024'},
    {id:2,name:'Dr. Rajesh Mehta',email:'rajesh.mehta@email.com',specialty:'Neurologist',status:'active',rating:4.8,patients:241,joined:'Feb 3, 2024'},
    {id:3,name:'Dr. Ananya Singh',email:'ananya.singh@email.com',specialty:'Dermatologist',status:'active',rating:4.9,patients:218,joined:'Jan 28, 2024'},
    {id:4,name:'Dr. Vikram Patel',email:'vikram.patel@email.com',specialty:'Orthopedic',status:'active',rating:4.7,patients:196,joined:'Mar 5, 2024'},
    {id:5,name:'Dr. Sneha Iyer',email:'sneha.iyer@email.com',specialty:'Pediatrician',status:'active',rating:4.8,patients:312,joined:'Dec 18, 2023'},
    {id:6,name:'Dr. Arjun Nair',email:'arjun.nair@email.com',specialty:'Psychiatrist',status:'pending',rating:0,patients:0,joined:'Jan 28, 2025'},
    {id:7,name:'Dr. Kavitha Reddy',email:'kavitha.reddy@email.com',specialty:'Cardiologist',status:'suspended',rating:3.2,patients:42,joined:'Aug 14, 2023'},
    {id:8,name:'Dr. Mohit Gupta',email:'mohit.gupta@email.com',specialty:'Neurologist',status:'active',rating:4.6,patients:178,joined:'Apr 20, 2024'},
    {id:9,name:'Dr. Deepa Krishnan',email:'deepa.k@email.com',specialty:'Dermatologist',status:'active',rating:4.7,patients:165,joined:'May 8, 2024'},
    {id:10,name:'Dr. Ramesh Babu',email:'ramesh.babu@email.com',specialty:'Orthopedic',status:'pending',rating:0,patients:0,joined:'Jan 30, 2025'},
];

export default function AdminDoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(initialDoctors);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    
    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal & Notifications
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{type: string, id: number, name: string} | null>(null);
    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

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
                // newest would require parsing dates, skipping for simplicity in dummy data
                return 0;
            });
        }
        
        setFilteredDoctors(result);
        setCurrentPage(1); // Reset to page 1 on filter
    }, [searchQuery, statusFilter, specialtyFilter, sortFilter, doctors]);

    const showNotif = (msg: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3500);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setSpecialtyFilter('');
        setSortFilter('');
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set<number>();
            filteredDoctors.forEach(dr => newSet.add(dr.id));
            setSelectedRows(newSet);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id: number) => {
        const newSet = new Set(selectedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedRows(newSet);
    };

    const bulkAction = (action: string) => {
        showNotif(`Bulk ${action} applied to ${selectedRows.size} doctor(s).`, 'success');
        setSelectedRows(new Set());
    };

    const confirmAction = () => {
        if (!pendingAction) return;
        setIsModalOpen(false);
        showNotif(`Doctor ${pendingAction.type}d successfully.`, 'success');
        setPendingAction(null);
    };

    const sortBy = (field: string) => {
        setSortFilter(field); // Re-use the existing sort filter
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Doctors Management</h1>
                    <p>Manage all registered doctors — view, edit, approve, suspend or remove.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                    <button className="btn btn-outline" onClick={() => showNotif('CSV exported!', 'success')}>
                        <i className="fas fa-download"></i> Export
                    </button>
                    <button className="btn btn-indigo" onClick={() => showNotif('Add Doctor feature coming soon', 'success')}>
                        <i className="fas fa-user-plus"></i> Add Doctor
                    </button>
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
                                                <button className="action-btn action-view" title="View" onClick={() => showNotif(`View profile for ${dr.name}`, 'success')}><i className="fas fa-eye"></i></button>
                                                <button className="action-btn action-edit" title="Edit" onClick={() => showNotif('Edit mode opened', 'success')}><i className="fas fa-pencil"></i></button>
                                                <button className="action-btn action-suspend" title="Suspend" onClick={() => { setPendingAction({ type: 'suspend', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-ban"></i></button>
                                                <button className="action-btn action-delete" title="Delete" onClick={() => { setPendingAction({ type: 'delete', id: dr.id, name: dr.name }); setIsModalOpen(true); }}><i className="fas fa-trash"></i></button>
                                                <button className="action-btn action-msg" title="Message" onClick={() => showNotif('Message window opened', 'success')}><i className="fas fa-comment"></i></button>
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

            {/* Confirm Modal */}
            <div className={`modal-overlay ${isModalOpen ? 'show' : ''}`}>
                <div className="modal">
                    <div className="modal-icon" style={{ background: pendingAction?.type === 'delete' ? '#fee2e2' : '#fef3c7', color: pendingAction?.type === 'delete' ? '#ef4444' : '#f59e0b' }}>
                        <i className={`fas fa-${pendingAction?.type === 'delete' ? 'trash' : 'ban'}`}></i>
                    </div>
                    <h3>{pendingAction?.type === 'delete' ? 'Delete Doctor' : 'Suspend Doctor'}</h3>
                    <p>Are you sure you want to {pendingAction?.type} {pendingAction?.name}? This action {pendingAction?.type === 'delete' ? 'cannot be undone.' : 'can be reversed later.'}</p>
                    <div className="modal-actions">
                        <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className={`btn ${pendingAction?.type === 'delete' ? 'btn-danger' : 'btn-indigo'}`} style={pendingAction?.type !== 'delete' ? { background: '#f59e0b', color: 'white' } : {}} onClick={confirmAction}>
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
