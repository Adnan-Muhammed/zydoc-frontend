// src/app/admin/(protected)/patients/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMasterPatients } from '@/redux/features/admin/adminThunk';
import { MasterPatient } from '@/redux/features/admin/adminTypes';
import DataTable, { Column } from '@/components/admin/common/DataTable';
import PatientDetailDrawer from '@/components/admin/patients/PatientDetailDrawer';

export default function AdminPatientsPage() {
  const dispatch = useAppDispatch();
  const {
    patientsList,
    patientsTotal,
    patientsLoading,
    patientsPage,
    patientsLimit,
  } = useAppSelector((state) => state.admin);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Inspection Drawer State
  const [selectedPatient, setSelectedPatient] = useState<MasterPatient | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Debounce search query by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch patients on parameter changes
  const loadPatients = useCallback(() => {
    dispatch(
      fetchMasterPatients({
        search: debouncedSearch.trim() || undefined,
        status: status || undefined,
        page,
        limit: 15,
      })
    );
  }, [dispatch, debouncedSearch, status, page]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleViewProfile = (patient: MasterPatient) => {
    setSelectedPatient(patient);
    setIsDrawerOpen(true);
  };

  // Table Columns
  const columns: Column<MasterPatient>[] = [
    {
      key: 'name',
      header: 'Patient Name',
      render: (patient) => {
        const profile = patient.profile || {};
        const fullName =
          profile.fullName ||
          (profile.firstName || profile.lastName
            ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
            : patient.email.split('@')[0]);

        return (
          <div className="flex items-center gap-3">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                {fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {profile.gender && (
                  <span className="text-[10px] text-slate-500 font-medium capitalize">
                    {profile.gender}
                  </span>
                )}
                {profile.bloodGroup && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    • {profile.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'contact',
      header: 'Phone / Email',
      render: (patient) => {
        const phone = patient.profile?.phone;
        return (
          <div className="space-y-0.5">
            <div className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
              <i className="fas fa-envelope text-[10px] text-slate-400"></i>
              <span className="truncate max-w-[200px]">{patient.email}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <i className="fas fa-phone-alt text-[10px] text-slate-400"></i>
              <span>{phone || 'Not provided'}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'appointments',
      header: 'Total Appointments',
      render: (patient) => {
        const total = patient.stats?.totalAppointments || 0;
        const completed = patient.stats?.completedAppointments || 0;
        return (
          <div>
            <div className="font-bold text-slate-900 text-sm">
              {total}{' '}
              <span className="text-xs font-normal text-slate-400">
                {total === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              {completed} completed
            </div>
          </div>
        );
      },
    },
    {
      key: 'wallet',
      header: 'Wallet Balance',
      render: (patient) => {
        const balance =
          patient.profile?.walletBalance ??
          patient.stats?.currentWalletBalance ??
          0;
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <i className="fas fa-wallet text-[10px] text-emerald-500"></i>
            ₹{balance.toLocaleString('en-IN')}
          </span>
        );
      },
    },
    {
      key: 'joined',
      header: 'Joined Date',
      render: (patient) => {
        return (
          <span className="text-xs text-slate-500 font-medium">
            {patient.createdAt
              ? new Date(patient.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'N/A'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (patient) => {
        return (
          <button
            onClick={() => handleViewProfile(patient)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-semibold transition-all border border-transparent hover:border-teal-100 shadow-2xs"
          >
            <i className="fas fa-user-circle text-xs"></i>
            <span>View Profile</span>
          </button>
        );
      },
    },
  ];

  const totalPages = Math.ceil(patientsTotal / (patientsLimit || 15)) || 1;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Patients Master Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700 border border-teal-200">
              {patientsTotal} Registered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            View patient accounts, consultation histories, and active wallet balances.
          </p>
        </div>

        <button
          onClick={loadPatients}
          disabled={patientsLoading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          <i
            className={`fas fa-sync-alt text-xs ${
              patientsLoading ? 'animate-spin text-teal-600' : 'text-slate-400'
            }`}
          ></i>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by patient name, phone, or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Account Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reusable Data Table */}
      <DataTable<MasterPatient>
        columns={columns}
        data={patientsList}
        keyExtractor={(patient) => patient.userId}
        isLoading={patientsLoading}
        skeletonRows={8}
        emptyState={{
          title: 'No patients found',
          subtitle:
            searchTerm || status
              ? 'No registered patients match your current search filters.'
              : 'There are currently no patients registered on the platform.',
          icon: 'fas fa-user-injured',
          action:
            searchTerm || status ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatus('');
                  setPage(1);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                Clear all filters
              </button>
            ) : undefined,
        }}
        pagination={{
          currentPage: patientsPage,
          totalPages: totalPages,
          totalItems: patientsTotal,
          itemsPerPage: patientsLimit || 15,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Patient Detail Inspection Drawer */}
      <PatientDetailDrawer
        patient={selectedPatient}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPatient(null);
        }}
        onStatusToggled={loadPatients}
      />
    </div>
  );
}
