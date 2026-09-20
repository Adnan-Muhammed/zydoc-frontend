// src/app/admin/(protected)/appointments/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMasterAppointments } from '@/redux/features/admin/adminThunk';
import { MasterAppointment } from '@/redux/features/admin/adminTypes';
import DataTable, { Column } from '@/components/admin/common/DataTable';
import AppointmentDetailModal from '@/components/admin/appointments/AppointmentDetailModal';

export default function AdminAppointmentsPage() {
  const dispatch = useAppDispatch();
  const {
    appointmentsList,
    appointmentsTotal,
    appointmentsLoading,
    appointmentsPage,
    appointmentsLimit,
  } = useAppSelector((state) => state.admin);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [selectedAppointment, setSelectedAppointment] = useState<MasterAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on filter change
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load appointments
  const loadAppointments = useCallback(() => {
    dispatch(
      fetchMasterAppointments({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: 15,
      })
    );
  }, [dispatch, debouncedSearch, statusFilter, typeFilter, page]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleViewDetails = (apt: MasterAppointment) => {
    setSelectedAppointment(apt);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Completed
          </span>
        );
      case 'ongoing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
            Ongoing
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
            Cancelled
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Columns definition
  const columns: Column<MasterAppointment>[] = [
    {
      key: 'date',
      header: 'Date & Time',
      render: (apt) => {
        const dateStr = apt.appointmentDate
          ? new Date(apt.appointmentDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'N/A';

        return (
          <div>
            <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              <i className="far fa-calendar text-slate-400"></i>
              <span>{dateStr}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <i className="far fa-clock text-slate-400"></i>
              <span>{apt.appointmentTime || 'Time not specified'}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'patient',
      header: 'Patient Name',
      render: (apt) => {
        const patientName = apt.patient?.name || 'Unknown Patient';
        return (
          <div className="flex items-center gap-2.5">
            {apt.patient?.avatarUrl ? (
              <img
                src={apt.patient.avatarUrl}
                alt={patientName}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                {patientName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-xs truncate max-w-[150px]">
                {patientName}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                {apt.patient?.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'doctor',
      header: 'Doctor Name',
      render: (apt) => {
        const docName = apt.doctor?.name
          ? apt.doctor.name.startsWith('Dr.')
            ? apt.doctor.name
            : `Dr. ${apt.doctor.name}`
          : 'Unknown Doctor';

        return (
          <div className="flex items-center gap-2.5">
            {apt.doctor?.avatarUrl ? (
              <img
                src={apt.doctor.avatarUrl}
                alt={docName}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                {docName.replace('Dr. ', '').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-xs truncate max-w-[150px]">
                {docName}
              </div>
              <div className="text-[11px] text-indigo-600 font-medium truncate max-w-[150px]">
                {apt.doctor?.specialty || 'General Practitioner'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (apt) => {
        const isOnline = apt.consultationType === 'ONLINE';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              isOnline
                ? 'bg-sky-50 text-sky-700 border border-sky-200/80'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
            }`}
          >
            <i
              className={`fas ${
                isOnline ? 'fa-video text-sky-500' : 'fa-clinic-medical text-emerald-500'
              } text-[10px]`}
            ></i>
            <span>{isOnline ? 'Online' : 'Clinic'}</span>
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (apt) => getStatusBadge(apt.status),
    },
    {
      key: 'fee',
      header: 'Final Fee',
      render: (apt) => {
        return (
          <div>
            <div className="font-bold text-slate-900 text-sm">
              ₹{(apt.fee || 0).toLocaleString('en-IN')}
            </div>
            {apt.adminCommission ? (
              <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
                Admin: ₹{apt.adminCommission.toLocaleString('en-IN')}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (apt) => {
        return (
          <button
            onClick={() => handleViewDetails(apt)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-all border border-transparent hover:border-indigo-100 shadow-2xs"
          >
            <i className="fas fa-eye text-xs"></i>
            <span>View Details</span>
          </button>
        );
      },
    },
  ];

  const totalPages = Math.ceil(appointmentsTotal / (appointmentsLimit || 15)) || 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Appointments Master List
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              {appointmentsTotal} Consultations
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time monitoring of all online video calls and offline clinic consultations across the platform.
          </p>
        </div>

        <button
          onClick={loadAppointments}
          disabled={appointmentsLoading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          <i
            className={`fas fa-sync-alt text-xs ${
              appointmentsLoading ? 'animate-spin text-indigo-600' : 'text-slate-400'
            }`}
          ></i>
          <span>Refresh</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search by Patient or Doctor name */}
          <div className="relative flex-1 w-full">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by Patient or Doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
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

          {/* Consultation Type Filter */}
          <div className="w-full md:w-44">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="">All Types (Online/Offline)</option>
              <option value="ONLINE">Online Video</option>
              <option value="OFFLINE">Offline Clinic</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<MasterAppointment>
        columns={columns}
        data={appointmentsList}
        keyExtractor={(apt) => apt._id}
        isLoading={appointmentsLoading}
        skeletonRows={8}
        emptyState={{
          title: 'No appointments found',
          subtitle:
            searchTerm || statusFilter || typeFilter
              ? 'No appointments matched your search and filter criteria.'
              : 'There are currently no recorded consultations on the platform.',
          icon: 'fas fa-calendar-times',
          action:
            searchTerm || statusFilter || typeFilter ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                  setPage(1);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                Reset filters
              </button>
            ) : undefined,
        }}
        pagination={{
          currentPage: appointmentsPage,
          totalPages: totalPages,
          totalItems: appointmentsTotal,
          itemsPerPage: appointmentsLimit || 15,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
}
