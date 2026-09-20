// src/components/admin/approvals/PendingDoctorsTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { PendingDoctor } from '@/redux/features/admin/adminTypes';

interface PendingDoctorsTableProps {
  doctors: PendingDoctor[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (doctor: PendingDoctor) => void;
  onApprove: (doctor: PendingDoctor) => void;
  onReject: (doctor: PendingDoctor) => void;
  onRefresh: () => void;
  actionLoading?: boolean;
}

export default function PendingDoctorsTable({
  doctors,
  isLoading,
  error,
  onViewDetails,
  onApprove,
  onReject,
  onRefresh,
  actionLoading = false,
}: PendingDoctorsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Extract unique specialties from doctors
  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.profile?.specialty) set.add(d.profile.specialty);
    });
    return Array.from(set).sort();
  }, [doctors]);

  // Filter doctors by search & specialty
  const filteredDoctors = useMemo(() => {
    return doctors.filter((dr) => {
      const p = dr.profile || {};
      const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
      const email = (dr.email || '').toLowerCase();
      const spec = (p.specialty || '').toLowerCase();
      const license = (p.licenseNumber || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q || name.includes(q) || email.includes(q) || spec.includes(q) || license.includes(q);
      const matchesSpecialty = !selectedSpecialty || p.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const getInitials = (name: string) => {
    if (!name) return 'DR';
    const parts = name.replace(/^Dr\.\s*/i, '').trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by name, email, specialty, or license..."
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
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
          >
            <option value="">All Specialties ({specialties.length})</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(searchQuery || selectedSpecialty) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('');
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
            title="Refresh list"
          >
            <i className={`fas fa-rotate text-xs ${isLoading ? 'fa-spin' : ''}`}></i>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <i className="fas fa-circle-exclamation text-red-500"></i>
            <span>{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold transition-colors"
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
                <th className="py-3.5 px-4 sm:px-6">Doctor</th>
                <th className="py-3.5 px-4">Specialty & Exp.</th>
                <th className="py-3.5 px-4">License / Registration</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Documents</th>
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
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
                          <div className="space-y-1.5">
                            <div className="w-32 h-4 bg-slate-200 rounded"></div>
                            <div className="w-44 h-3 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-24 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-28 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-16 h-4 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="w-28 h-8 bg-slate-200 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {/* Data Rows */}
              {!isLoading && filteredDoctors.length > 0 && (
                filteredDoctors.map((dr) => {
                  const p = dr.profile || {};
                  const fullName = p.firstName
                    ? `Dr. ${p.firstName} ${p.lastName || ''}`.trim()
                    : dr.email;
                  const initial = getInitials(fullName);
                  const hasMedCert = Boolean(p.medicalCertificateUrl);
                  const hasGovId = Boolean(p.governmentIdUrl);
                  const qualCount = p.qualifications?.length || 0;

                  return (
                    <tr
                      key={dr.userId}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Doctor Info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden shadow-xs">
                            {p.avatarUrl ? (
                              <img
                                src={
                                  p.avatarUrl.startsWith('http')
                                    ? p.avatarUrl
                                    : `${process.env.NEXT_PUBLIC_API_URL}${
                                        p.avatarUrl.startsWith('/') ? '' : '/'
                                      }${p.avatarUrl}`
                                }
                                alt={fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initial
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {fullName}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{dr.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {p.specialty || 'General'}
                        </span>
                        {p.yearsOfExperience !== undefined && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {p.yearsOfExperience} yrs exp.
                          </div>
                        )}
                      </td>

                      {/* License */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-700">
                          {p.licenseNumber || <span className="text-slate-400 italic">Not set</span>}
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-600 font-medium">
                          {formatDate(dr.createdAt)}
                        </div>
                      </td>

                      {/* Documents Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              hasMedCert
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title={hasMedCert ? 'Medical Certificate attached' : 'No medical certificate'}
                          >
                            <i className="fas fa-file-medical text-[9px]"></i>
                            Cert
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              hasGovId
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title={hasGovId ? 'Government ID attached' : 'No Government ID'}
                          >
                            <i className="fas fa-id-card text-[9px]"></i>
                            ID
                          </span>
                          {qualCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <i className="fas fa-graduation-cap text-[9px]"></i>
                              {qualCount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => onViewDetails(dr)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                            title="Inspect Profile & Certificates"
                          >
                            <i className="fas fa-eye text-slate-400"></i>
                            <span className="hidden sm:inline">Details</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => {
                              const p = dr.profile || {};
                              const medApproved = p.medicalCertificateStatus === 'approved';
                              const govApproved = p.governmentIdStatus === 'approved';
                              const qualsApproved =
                                Array.isArray(p.qualifications) && p.qualifications.length > 0
                                  ? p.qualifications.every((q: any) => q.certificateStatus === 'approved')
                                  : true;

                              if (!medApproved || !govApproved || !qualsApproved) {
                                onViewDetails(dr);
                              } else {
                                onApprove(dr);
                              }
                            }}
                            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50 cursor-pointer"
                            title="Review & Approve Doctor"
                          >
                            <i className="fas fa-check"></i>
                            <span className="hidden sm:inline">Approve</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onReject(dr)}
                            className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
                            title="Reject Doctor"
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
              {!isLoading && filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-3 shadow-inner">
                        <i className="fas fa-clipboard-check"></i>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {searchQuery || selectedSpecialty
                          ? 'No matching doctor applications'
                          : 'No Pending Approvals'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                        {searchQuery || selectedSpecialty
                          ? 'Try clearing your search filters to view other applicants.'
                          : 'All doctor onboarding applications have been reviewed. New applications will appear here in real-time.'}
                      </p>
                      {(searchQuery || selectedSpecialty) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedSpecialty('');
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
            Showing <strong className="text-slate-800">{filteredDoctors.length}</strong> of{' '}
            <strong className="text-slate-800">{doctors.length}</strong> pending applicants
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-clock-rotate-left text-[11px] text-slate-400"></i>
            Applications ordered by submission time (FIFO review)
          </span>
        </div>
      </div>
    </div>
  );
}
