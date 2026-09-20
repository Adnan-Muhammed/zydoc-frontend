// src/components/admin/refunds/PendingRefundsTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { RefundTicket } from '@/redux/features/admin/adminTypes';

interface PendingRefundsTableProps {
  tickets: RefundTicket[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (ticket: RefundTicket) => void;
  onApprove: (ticket: RefundTicket) => void;
  onReject: (ticket: RefundTicket) => void;
  onRefresh: () => void;
  actionLoading?: boolean;
}

export default function PendingRefundsTable({
  tickets,
  isLoading,
  error,
  onViewDetails,
  onApprove,
  onReject,
  onRefresh,
  actionLoading = false,
}: PendingRefundsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.issueCategory) set.add(t.issueCategory);
    });
    return Array.from(set);
  }, [tickets]);

  // Filter tickets by query & category
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const patient = t.patientId?.profileId;
      const patientName = `${patient?.firstName || ''} ${patient?.lastName || ''}`.toLowerCase();
      const patientEmail = (t.patientId?.email || '').toLowerCase();
      const apptId = (t.appointmentId?._id || '').toLowerCase();
      const ticketId = (t._id || '').toLowerCase();
      const desc = (t.issueDescription || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        patientName.includes(q) ||
        patientEmail.includes(q) ||
        apptId.includes(q) ||
        ticketId.includes(q) ||
        desc.includes(q);

      const matchesCategory = !selectedCategory || t.issueCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tickets, searchQuery, selectedCategory]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'DOCTOR_UNAVAILABLE':
        return {
          label: 'Doctor Absent',
          cls: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'SERVICE_NOT_RENDERED':
        return {
          label: 'Service Incomplete',
          cls: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'WRONG_APPOINTMENT':
        return {
          label: 'Booking Error',
          cls: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      default:
        return {
          label: cat || 'Other',
          cls: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by patient, email, appointment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className="fas fa-times-circle text-xs"></i>
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Refresh tickets"
          >
            <i className={`fas fa-rotate text-xs ${isLoading ? 'fa-spin' : ''}`}></i>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-700">
          <div className="flex items-center gap-2">
            <i className="fas fa-circle-exclamation text-red-500"></i>
            <span>{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Patient</th>
                <th className="py-3.5 px-4">Appointment</th>
                <th className="py-3.5 px-4">Reported Issue</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Disputed Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {/* Skeleton Loading Rows */}
              {isLoading && (
                <>
                  {[1, 2, 3, 4].map((n) => (
                    <tr key={n} className="animate-pulse">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200"></div>
                          <div className="space-y-1.5">
                            <div className="w-28 h-4 bg-slate-200 rounded"></div>
                            <div className="w-36 h-3 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-24 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-32 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-16 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="w-28 h-8 bg-slate-200 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Data Rows */}
              {!isLoading && filteredTickets.length > 0 && (
                filteredTickets.map((t) => {
                  const patient = t.patientId?.profileId;
                  const patientName = patient?.firstName
                    ? `${patient.firstName} ${patient.lastName || ''}`.trim()
                    : t.patientId?.email || 'Patient';

                  const badge = getCategoryBadge(t.issueCategory);
                  const fee = t.appointmentId?.fee || t.refundAmount || 0;
                  const apptId = t.appointmentId?._id;

                  return (
                    <tr
                      key={t._id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Patient */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {patientName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {patientName}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{t.patientId?.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Appointment */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-slate-700 font-semibold">
                          #{apptId ? apptId.slice(-6) : t._id.slice(-6)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.appointmentId?.consultationType || 'OFFLINE'}
                        </div>
                      </td>

                      {/* Reported Issue */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <div
                          className="text-xs text-slate-600 truncate max-w-xs mt-1"
                          title={t.issueDescription}
                        >
                          "{t.issueDescription}"
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">₹{fee}</div>
                        <span className="text-[10px] text-slate-400">Full Wallet Credit</span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs text-slate-600 font-medium">
                          {formatDate(t.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => onViewDetails(t)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                            title="View Full Dispute"
                          >
                            <i className="fas fa-eye text-slate-400"></i>
                            <span className="hidden sm:inline">Details</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onApprove(t)}
                            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
                            title="Approve Refund"
                          >
                            <i className="fas fa-check"></i>
                            <span className="hidden sm:inline">Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onReject(t)}
                            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
                            title="Reject Refund"
                          >
                            <i className="fas fa-xmark"></i>
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Empty State */}
              {!isLoading && filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-3 shadow-inner">
                        <i className="fas fa-check-double"></i>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {searchQuery || selectedCategory
                          ? 'No matching refund tickets'
                          : 'No Pending Refund Disputes'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                        {searchQuery || selectedCategory
                          ? 'Try clearing your filters to see all tickets.'
                          : 'All offline dispute tickets have been processed. New patient claims will appear here.'}
                      </p>
                      {(searchQuery || selectedCategory) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('');
                          }}
                          className="px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredTickets.length}</strong> of{' '}
            <strong className="text-slate-800">{tickets.length}</strong> unresolved disputes
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-shield-halved text-[11px] text-slate-400"></i>
            100% ACID MongoDB Transactions upon approval
          </span>
        </div>
      </div>
    </div>
  );
}
