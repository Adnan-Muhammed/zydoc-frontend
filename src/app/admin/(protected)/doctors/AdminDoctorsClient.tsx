// src/app/admin/(protected)/doctors/AdminDoctorsClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMasterDoctors, toggleDoctorStatus } from '@/redux/features/admin/adminThunk';
import { MasterDoctor } from '@/redux/features/admin/adminTypes';
import DataTable, { Column } from '@/components/admin/common/DataTable';
import DoctorDetailDrawer from '@/components/admin/doctors/DoctorDetailDrawer';
import StatusToggleConfirmModal from '@/components/admin/common/StatusToggleConfirmModal';
 
export default function AdminDoctorsClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    doctorsList = [],
    doctorsTotal = 0,
    doctorsLoading = false,
    doctorsPage = 1,
    doctorsLimit = 15,
  } = useAppSelector((state) => state.admin || {});

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [page, setPage] = useState(1);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drawer & Inspection State
  const [selectedDoctor, setSelectedDoctor] = useState<MasterDoctor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status Toggle Modal
  const [statusModalDoctor, setStatusModalDoctor] = useState<MasterDoctor | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // 400ms Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load doctors from Redux
  const loadDoctors = useCallback(() => {
    dispatch(
      fetchMasterDoctors({
        search: debouncedSearch.trim() || undefined,
        accountStatus: accountStatus || undefined,
        verificationStatus: verificationStatus || undefined,
        specialty: specialty || undefined,
        page,
        limit: 15,
      })
    );
  }, [dispatch, debouncedSearch, accountStatus, verificationStatus, specialty, page]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Calculate live summary stats from loaded list or total
  const activeCount = doctorsList.filter((d) => d?.accountStatus === 'active').length;
  const suspendedCount = doctorsList.filter((d) => d?.accountStatus === 'suspended').length;
  const pendingCount = doctorsList.filter(
    (d) => d?.profile?.verificationStatus === 'pending'
  ).length;

  const handleResetFilters = () => {
    setSearchTerm('');
    setAccountStatus('');
    setVerificationStatus('');
    setSpecialty('');
    setPage(1);
  };

  const handleOpenDrawer = (doctor: MasterDoctor) => {
    setSelectedDoctor(doctor);
    setIsDrawerOpen(true);
  };

  const handleOpenStatusModal = (doctor: MasterDoctor) => {
    setStatusModalDoctor(doctor);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusToggle = async (reason: string) => {
    if (!statusModalDoctor) return;
    setIsToggling(true);
    try {
      const targetId = statusModalDoctor.userId || statusModalDoctor.profile?._id || '';
      const res = await dispatch(toggleDoctorStatus({ doctorId: targetId, reason })).unwrap();
      toast.success(res.message || 'Doctor status updated successfully.');
      setIsStatusModalOpen(false);
      setStatusModalDoctor(null);
      loadDoctors();
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to update status');
    } finally {
      setIsToggling(false);
    }
  };

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(doctorsList.map((d) => d.userId));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleRow = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedIds(updated);
  };

  const handleExportCSV = () => {
    if (!doctorsList || doctorsList.length === 0) {
      toast.error('No doctor records available to export.');
      return;
    }

    const exportData = selectedIds.size > 0
      ? doctorsList.filter((d) => selectedIds.has(d.userId))
      : doctorsList;

    const headers = ['Doctor ID', 'Name', 'Email', 'Specialty', 'License Number', 'Account Status', 'Verification Status', 'Joined Date'];
    const rows = exportData.map((d) => [
      d.userId || 'N/A',
      `Dr. ${d.profile?.firstName || ''} ${d.profile?.lastName || ''}`.trim() || 'N/A',
      d.email || 'N/A',
      d.profile?.specialty || 'General Practice',
      d.profile?.licenseNumber || 'Not Provided',
      d.accountStatus || 'active',
      d.profile?.verificationStatus || 'pending',
      d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zydoc_doctors_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${exportData.length} doctor records to CSV.`);
  };

  // Table Columns
  const columns: Column<MasterDoctor>[] = [
    {
      key: 'select',
      header: '',
      width: '40px',
      render: (doc) => (
        <input
          type="checkbox"
          checked={selectedIds.has(doc.userId)}
          onChange={() => handleToggleRow(doc.userId)}
          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
        />
      ),
    },
    {
      key: 'doctor',
      header: 'Doctor Profile',
      render: (doc) => {
        const profile = doc.profile || {};
        const fullName = profile.firstName || profile.lastName
          ? `Dr. ${profile.firstName || ''} ${profile.lastName || ''}`.trim()
          : doc.email.split('@')[0];

        const initial = (profile.firstName || doc.email || 'D').charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            {profile.avatarUrl ? (
              <img
                src={
                  profile.avatarUrl.startsWith('http')
                    ? profile.avatarUrl
                    : `${process.env.NEXT_PUBLIC_API_URL || ''}/${profile.avatarUrl.replace(/^\//, '')}`
                }
                alt={fullName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <Link
                href={`/admin/doctors/${doc.userId}`}
                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate max-w-[200px] block text-sm"
              >
                {fullName}
              </Link>
              <div className="text-xs text-slate-400 truncate max-w-[200px] flex items-center gap-1.5 mt-0.5">
                <i className="fas fa-envelope text-[10px]"></i>
                <span>{doc.email || 'Not Provided'}</span>
              </div>
              {profile.phone && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <i className="fas fa-phone text-[9px]"></i>
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'specialty',
      header: 'Specialty & Credentials',
      render: (doc) => {
        const spec = doc.profile?.specialty || 'General Practice';
        const exp = doc.profile?.yearsOfExperience;
        const lic = doc.profile?.licenseNumber;

        return (
          <div className="space-y-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
              {spec}
            </span>
            <div className="text-[11px] text-slate-500">
              {exp ? `${exp} Yrs Exp` : 'Exp: Not Specified'}
              {lic ? ` • Lic: ${lic}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      key: 'consultation',
      header: 'Consultation Fees',
      render: (doc) => {
        const settings = doc.profile?.consultationSettings;
        const onlineFee = settings?.online?.fee ?? settings?.video?.fee ?? settings?.onlineFee ?? settings?.fee;
        const offlineFee = settings?.offline?.fee ?? settings?.physical?.fee ?? settings?.offlineFee;
        const isOnline = Boolean(settings?.online?.enabled ?? settings?.video?.enabled ?? true);
        const isOffline = Boolean(settings?.offline?.enabled ?? settings?.physical?.enabled);

        return (
          <div className="text-xs space-y-0.5">
            {isOnline && onlineFee !== undefined ? (
              <div className="text-slate-800 font-semibold flex items-center gap-1">
                <i className="fas fa-video text-emerald-500 text-[10px]"></i>
                <span>₹{onlineFee}</span>
                <span className="text-[10px] text-slate-400 font-normal">Online</span>
              </div>
            ) : null}
            {isOffline && offlineFee !== undefined ? (
              <div className="text-slate-700 font-semibold flex items-center gap-1">
                <i className="fas fa-hospital text-indigo-500 text-[10px]"></i>
                <span>₹{offlineFee}</span>
                <span className="text-[10px] text-slate-400 font-normal">Clinic</span>
              </div>
            ) : null}
            {!isOnline && !isOffline && (
              <span className="text-slate-400 text-xs italic">Fee Not Configured</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Account & Audit Status',
      render: (doc) => {
        const isActive = doc.accountStatus === 'active';
        const vStatus = doc.profile?.verificationStatus || 'pending';

        return (
          <div className="flex flex-col gap-1 items-start">
            {/* Account Status Pill */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {doc.accountStatus || 'active'}
            </span>

            {/* Verification Status Pill */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                vStatus === 'approved'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : vStatus === 'rejected'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <i
                className={`fas ${
                  vStatus === 'approved'
                    ? 'fa-check-circle'
                    : vStatus === 'rejected'
                    ? 'fa-times-circle'
                    : 'fa-clock'
                } mr-1 text-[9px]`}
              ></i>
              {vStatus}
            </span>
          </div>
        );
      },
    },
    {
      key: 'joined',
      header: 'Joined Date',
      render: (doc) => (
        <span className="text-xs text-slate-500 font-medium">
          {doc.createdAt
            ? new Date(doc.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Not Provided'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (doc) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenDrawer(doc)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all border border-transparent hover:border-indigo-100 shadow-2xs"
            title="Quick Preview Drawer"
          >
            <i className="fas fa-eye text-xs"></i>
            <span className="hidden sm:inline">Preview</span>
          </button>

          <Link
            href={`/admin/doctors/${doc.userId}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all border border-indigo-200 shadow-2xs"
            title="Full 360° Profile"
          >
            <i className="fas fa-id-card text-xs"></i>
            <span>360° Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => handleOpenStatusModal(doc)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              doc.accountStatus === 'active'
                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
            }`}
            title={doc.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
          >
            <i className={`fas ${doc.accountStatus === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(doctorsTotal / (doctorsLimit || 15)) || 1;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Doctors Master Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              {doctorsTotal} Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, audit credentials, monitor platform activity, and manage doctor account permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <i className="fas fa-file-arrow-down text-slate-400"></i>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={loadDoctors}
            disabled={doctorsLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <i className={`fas fa-arrows-rotate text-xs ${doctorsLoading ? 'fa-spin text-indigo-600' : 'text-slate-400'}`}></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-users-medical"></i>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{doctorsTotal}</div>
            <div className="text-xs font-medium text-slate-500">Total Registered</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-user-check"></i>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-xs font-medium text-slate-500">Active (Current View)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{pendingCount}</div>
            <div className="text-xs font-medium text-slate-500">Pending Review</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-user-slash"></i>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{suspendedCount}</div>
            <div className="text-xs font-medium text-slate-500">Suspended</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by doctor name, email, specialty, or license number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Account Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={accountStatus}
              onChange={(e) => {
                setAccountStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 transition-all"
            >
              <option value="">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 transition-all"
            >
              <option value="">All Audit Statuses</option>
              <option value="approved">Approved & Verified</option>
              <option value="pending">Pending Audit</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Specialty Filter */}
          <div className="w-full md:w-48">
            <select
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 transition-all"
            >
              <option value="">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Psychiatry">Psychiatry</option>
            </select>
          </div>

          {(searchTerm || accountStatus || verificationStatus || specialty) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>

        {/* Bulk Actions Indicator Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <i className="fas fa-check-double"></i>
              <span>{selectedIds.size} Doctor(s) Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors"
              >
                Export Selected CSV
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 font-semibold"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <DataTable<MasterDoctor>
        columns={columns}
        data={doctorsList}
        keyExtractor={(doc) => doc.userId}
        isLoading={doctorsLoading}
        skeletonRows={8}
        emptyState={{
          title: 'No Doctors Found',
          subtitle:
            searchTerm || accountStatus || verificationStatus || specialty
              ? 'No registered doctor matches your current filter criteria.'
              : 'There are currently no doctors registered on the platform.',
          icon: 'fas fa-user-doctor',
          action:
            searchTerm || accountStatus || verificationStatus || specialty ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                Clear all filters
              </button>
            ) : undefined,
        }}
        pagination={{
          currentPage: doctorsPage,
          totalPages,
          totalItems: doctorsTotal,
          itemsPerPage: doctorsLimit || 15,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Quick Inspection Drawer */}
      <DoctorDetailDrawer
        doctor={selectedDoctor}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDoctor(null);
        }}
        onStatusToggled={loadDoctors}
      />

      {/* Account Status Toggle Confirmation Modal */}
      <StatusToggleConfirmModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusModalDoctor(null);
        }}
        onConfirm={handleConfirmStatusToggle}
        currentStatus={statusModalDoctor?.accountStatus || 'active'}
        userName={
          statusModalDoctor?.profile?.firstName
            ? `Dr. ${statusModalDoctor.profile.firstName} ${statusModalDoctor.profile.lastName || ''}`.trim()
            : statusModalDoctor?.email || 'Doctor'
        }
        role="doctor"
        isLoading={isToggling}
      />
    </div>
  );
}
