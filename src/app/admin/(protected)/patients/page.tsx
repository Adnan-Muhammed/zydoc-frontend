'use client';

import React, { useState, useEffect, useMemo } from 'react';
import './patients.css';

const COLORS=['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];
const NAMES=['Priya Sharma','Rahul Mehta','Anjali Singh','Vikram Patel','Sunita Rao','Arjun Kumar','Deepa Nair','Ravi Gupta','Meena Iyer','Suresh Reddy','Kavita Joshi','Amit Verma','Pooja Malhotra','Nikhil Das','Reshma Khan','Dinesh Pillai','Sneha Agarwal','Rohit Bansal','Lakshmi Murti','Sanjay Chopra'];
const STATUSES=['Active','Active','Active','Active','Inactive','Suspended'];
const GENDERS=['Male','Female','Other'];

interface Patient {
    id: number;
    name: string;
    initials: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
    joined: string;
    appts: number;
    last: string;
    status: string;
    color: string;
}

export default function AdminPatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredData, setFilteredData] = useState<Patient[]>([]);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 15;
    
    // Selections
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    
    // Drawer
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{action: string, id: number} | null>(null);
    
    // Notification
    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');

    useEffect(() => {
        const generated: Patient[] = [];
        const randomDate = (s: string, e: string) => {
            const d = new Date(new Date(s).getTime() + Math.random() * (new Date(e).getTime() - new Date(s).getTime()));
            return d.toISOString().split('T')[0];
        };
        for(let i=1; i<=18432; i++){
            const n = NAMES[Math.floor(Math.random()*NAMES.length)];
            const init = n.split(' ').map(x => x[0]).join('');
            generated.push({
                id: i,
                name: n,
                initials: init,
                email: n.toLowerCase().replace(' ','.') + i + '@gmail.com',
                phone: '+91 ' + (Math.floor(Math.random()*9000000000)+1000000000),
                age: Math.floor(Math.random()*60)+18,
                gender: GENDERS[Math.floor(Math.random()*3)],
                joined: randomDate('2020-01-01','2025-06-01'),
                appts: Math.floor(Math.random()*30),
                last: randomDate('2024-01-01','2025-06-01'),
                status: STATUSES[Math.floor(Math.random()*STATUSES.length)],
                color: COLORS[Math.floor(Math.random()*COLORS.length)]
            });
        }
        setPatients(generated);
        setFilteredData(generated);
    }, []);

    useEffect(() => {
        let result = patients;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q));
        }
        if (statusFilter) {
            result = result.filter(p => p.status === statusFilter);
        }
        if (genderFilter) {
            result = result.filter(p => p.gender === genderFilter);
        }
        setFilteredData(result);
        setCurrentPage(1);
    }, [searchQuery, statusFilter, genderFilter, patients]);

    const showNotif = (msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3500);
    };

    const currentPatients = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredData.slice(start, start + perPage);
    }, [currentPage, filteredData]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set(selectedIds);
            currentPatients.forEach(p => newSet.add(p.id));
            setSelectedIds(newSet);
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: number) => {
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
        setPendingAction({ action, id: -1 });
        setIsModalOpen(true);
    };

    const confirmAction = () => {
        setIsModalOpen(false);
        showNotif(pendingAction?.action === 'delete' ? 'Patient(s) deleted successfully' : 'Patient(s) suspended successfully', 'success');
        setPendingAction(null);
        setSelectedIds(new Set());
        setBulkMode(false);
    };

    const viewPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsDrawerOpen(true);
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
                    <div><div className="stat-val">18,432</div><div className="stat-lbl">Total Patients</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-green"><i className="fas fa-user-check"></i></div>
                    <div><div className="stat-val">14,891</div><div className="stat-lbl">Active Patients</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-orange"><i className="fas fa-user-plus"></i></div>
                    <div><div className="stat-val">312</div><div className="stat-lbl">New This Month</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon si-red"><i className="fas fa-user-slash"></i></div>
                    <div><div className="stat-val">89</div><div className="stat-lbl">Suspended</div></div>
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
                    <label>Status</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
                <div className="fg">
                    <label>Gender</label>
                    <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setGenderFilter('');
                }}>
                    <i className="fas fa-rotate"></i> Reset
                </button>
            </div>

            {/* Table Card */}
            <div className="table-card">
                <div className="table-top">
                    <h3>All Patients</h3>
                    <span className="tcount">{filteredData.length.toLocaleString()} patients</span>
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
                                        checked={currentPatients.length > 0 && currentPatients.every(p => selectedIds.has(p.id))}
                                    />
                                </th>
                                <th>Patient ↕</th>
                                <th>Phone</th>
                                <th>Age / Gender</th>
                                <th>Registered</th>
                                <th>Appointments</th>
                                <th>Last Visit</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPatients.map(p => (
                                <tr key={p.id} className={selectedIds.has(p.id) ? 'sel' : ''}>
                                    <td>
                                        {bulkMode ? (
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(p.id)} 
                                                onChange={() => handleSelectRow(p.id)}
                                            />
                                        ) : (
                                            <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>#{p.id}</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="ava" style={{ background: p.color }}>{p.initials}</div>
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
                                    <td>{p.last}</td>
                                    <td>
                                        <span className={`badge ${p.status === 'Active' ? 'bg-green' : p.status === 'Inactive' ? 'bg-gray' : 'bg-red'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="act-btns">
                                            <button className="ab view" title="View" onClick={() => viewPatient(p)}><i className="fas fa-eye"></i></button>
                                            <button className="ab edit" title="Edit" onClick={() => showNotif(`Edit patient #${p.id}`, 'info')}><i className="fas fa-pen"></i></button>
                                            <button className="ab sus" title="Suspend" onClick={() => { setPendingAction({ action: 'suspend', id: p.id }); setIsModalOpen(true); }}><i className="fas fa-ban"></i></button>
                                            <button className="ab msg" title="Message" onClick={() => showNotif(`Opening message for ${p.name}`, 'info')}><i className="fas fa-envelope"></i></button>
                                            <button className="ab del" title="Delete" onClick={() => { setPendingAction({ action: 'delete', id: p.id }); setIsModalOpen(true); }}><i className="fas fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <div className="pg-info">
                        Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredData.length)} of {filteredData.length.toLocaleString()}
                    </div>
                    <div className="pg-btns">
                        <button className="pb" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        {[currentPage - 1, currentPage, currentPage + 1].filter(p => p > 0 && p <= Math.ceil(filteredData.length / perPage)).map(p => (
                            <button key={p} className={`pb ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>
                                {p}
                            </button>
                        ))}
                        <button className="pb">...</button>
                        <button className="pb" onClick={() => setCurrentPage(Math.ceil(filteredData.length / perPage))}>
                            {Math.ceil(filteredData.length / perPage) || 1}
                        </button>
                        <button className="pb" onClick={() => setCurrentPage(Math.min(Math.ceil(filteredData.length / perPage), currentPage + 1))} disabled={currentPage === Math.ceil(filteredData.length / perPage)}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Patient Detail Drawer */}
            <div className={`drawer-ov ${isDrawerOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false); }}>
                <div className="drawer">
                    <div className="drawer-head">
                        <h3>{selectedPatient?.name || 'Patient Details'}</h3>
                        <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}><i className="fas fa-xmark"></i></button>
                    </div>
                    {selectedPatient && (
                        <div className="drawer-body">
                            <div className="profile-top">
                                <div className="profile-ava" style={{ background: selectedPatient.color }}>{selectedPatient.initials}</div>
                                <div>
                                    <div className="profile-name">{selectedPatient.name}</div>
                                    <div className="profile-email">{selectedPatient.email}</div>
                                    <span className={`badge ${selectedPatient.status === 'Active' ? 'bg-green' : selectedPatient.status === 'Inactive' ? 'bg-gray' : 'bg-red'}`} style={{ marginTop: '6px' }}>
                                        {selectedPatient.status}
                                    </span>
                                </div>
                            </div>
                            <div className="info-grid">
                                <div className="info-item"><label>Phone</label><span>{selectedPatient.phone}</span></div>
                                <div className="info-item"><label>Age</label><span>{selectedPatient.age} years</span></div>
                                <div className="info-item"><label>Gender</label><span>{selectedPatient.gender}</span></div>
                                <div className="info-item"><label>Registered</label><span>{selectedPatient.joined}</span></div>
                                <div className="info-item"><label>Patient ID</label><span>#PT{String(selectedPatient.id).padStart(5, '0')}</span></div>
                                <div className="info-item"><label>Last Visit</label><span>{selectedPatient.last}</span></div>
                            </div>
                            <div className="stats-mini">
                                <div className="sm-card"><div className="sm-val">{selectedPatient.appts}</div><div className="sm-lbl">Total Appts</div></div>
                                <div className="sm-card"><div className="sm-val">{Math.floor(selectedPatient.appts * 0.7)}</div><div className="sm-lbl">Completed</div></div>
                                <div className="sm-card"><div className="sm-val">₹{(selectedPatient.appts * 450).toLocaleString()}</div><div className="sm-lbl">Spent</div></div>
                            </div>
                            <div className="drawer-acts">
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
                    <h3>{pendingAction?.action === 'delete' ? 'Delete Patient?' : (pendingAction?.id === -1 ? 'Suspend Selected Patients?' : 'Suspend Patient?')}</h3>
                    <p>
                        {pendingAction?.action === 'delete' 
                            ? 'This will permanently remove the patient and all their data. This cannot be undone.' 
                            : (pendingAction?.id === -1 ? `Suspend ${selectedIds.size} selected patients?` : 'This patient will lose access to the platform until reinstated.')}
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
