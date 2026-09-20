// src/components/admin/approvals/DoctorDetailsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { PendingDoctor } from '@/redux/features/admin/adminTypes';

interface DoctorDetailsModalProps {
  doctor: PendingDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (doctor: PendingDoctor, documentStatuses?: any) => void;
  onReject: (doctor: PendingDoctor, documentStatuses?: any) => void;
  actionLoading?: boolean;
}

type TabType = 'credentials' | 'documents' | 'consultation' | 'payout';

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

export default function DoctorDetailsModal({
  doctor,
  isOpen,
  onClose,
  onApprove,
  onReject,
  actionLoading = false,
}: DoctorDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('credentials');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fetchedDetails, setFetchedDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // Granular document approval statuses
  const [medCertStatus, setMedCertStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [govIdStatus, setGovIdStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [qualStatuses, setQualStatuses] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({});

  // Fetch full details from /api/admin/doctors/:id on open if needed
  useEffect(() => {
    if (isOpen && doctor?.userId) {
      let isMounted = true;
      const loadFullDetails = async () => {
        try {
          setIsLoadingDetails(true);
          const res = await axiosInstance.get(`/admin/doctors/${doctor.userId}`);
          if (isMounted && res.data?.success && (res.data.doctor || res.data.user)) {
            setFetchedDetails(res.data.doctor || res.data.user);
          }
        } catch (err) {
          // Fallback to doctor prop payload silently
        } finally {
          if (isMounted) setIsLoadingDetails(false);
        }
      };
      loadFullDetails();
      return () => {
        isMounted = false;
      };
    } else {
      setFetchedDetails(null);
      setActiveTab('credentials');
      setPreviewDocUrl(null);
    }
  }, [isOpen, doctor?.userId]);

  // Merge prop profile with any fetched extended profile
  const baseProfile = doctor?.profile || {};
  const merged = { ...baseProfile, ...(fetchedDetails || {}) };

  // Synchronize document approval state from merged profile
  useEffect(() => {
    if (isOpen && doctor && merged) {
      setMedCertStatus((merged.medicalCertificateStatus as any) || 'pending');
      setGovIdStatus((merged.governmentIdStatus as any) || 'pending');
      const initialQuals: Record<string, 'pending' | 'approved' | 'rejected'> = {};
      if (Array.isArray(merged.qualifications)) {
        merged.qualifications.forEach((q: any, idx: number) => {
          const key = q.id || String(idx);
          initialQuals[key] = (q.certificateStatus as any) || 'pending';
        });
      }
      setQualStatuses(initialQuals);
    }
  }, [merged?.medicalCertificateStatus, merged?.governmentIdStatus, merged?.qualifications, isOpen, doctor]);

  if (!isOpen || !doctor) return null;

  // Document counting and gatekeeper logic
  const qualList = Array.isArray(merged?.qualifications) ? merged.qualifications : [];
  const totalDocs = 2 + qualList.length;
  const approvedQualsCount = qualList.filter(
    (q: any, idx: number) => qualStatuses[q.id || String(idx)] === 'approved'
  ).length;
  const approvedDocsCount =
    (medCertStatus === 'approved' ? 1 : 0) +
    (govIdStatus === 'approved' ? 1 : 0) +
    approvedQualsCount;
  const allDocsApproved = approvedDocsCount === totalDocs && totalDocs > 0;

  const getCurrentDocumentStatuses = () => ({
    medicalCertificateStatus: medCertStatus,
    governmentIdStatus: govIdStatus,
    qualifications: qualList.map((q: any, idx: number) => ({
      id: q.id || String(idx),
      certificateStatus: qualStatuses[q.id || String(idx)] || 'pending',
    })),
  });

  const handleApproveAllDocs = () => {
    setMedCertStatus('approved');
    setGovIdStatus('approved');
    const allQ: Record<string, 'pending' | 'approved' | 'rejected'> = {};
    qualList.forEach((q: any, idx: number) => {
      allQ[q.id || String(idx)] = 'approved';
    });
    setQualStatuses(allQ);
  };

  const fullName = merged?.firstName || merged?.lastName
    ? `Dr. ${merged?.firstName || ''} ${merged?.lastName || ''}`.trim()
    : doctor?.email?.split('@')?.[0] || 'Doctor';

  const appliedDate = doctor?.createdAt
    ? new Date(doctor.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not Provided';

  const getFullDocUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getInitials = (name: string) => {
    if (!name) return 'DR';
    const parts = name.replace(/^Dr\.\s*/i, '').trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleCopy = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label || text);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Safe consultation settings resolution
  const onlineConsult = merged?.consultationSettings?.online || merged?.consultationSettings?.video;
  const offlineConsult = merged?.consultationSettings?.offline || merged?.consultationSettings?.physical;
  const isOnlineEnabled = Boolean(onlineConsult?.enabled);
  const onlineFee = onlineConsult?.fee ?? 'Not Provided';
  const isOfflineEnabled = Boolean(offlineConsult?.enabled);
  const offlineFee = offlineConsult?.fee ?? 'Not Provided';
  const clinicName = offlineConsult?.clinicName || merged?.hospital || 'Not Provided';
  const clinicAddress = offlineConsult?.clinicAddress || 'Not Provided';

  // Safe working hours schedule resolution
  const workingHours = merged?.workingHours || {};
  const onlineSchedule = workingHours?.online || {};
  const offlineSchedule = workingHours?.offline || {};

  // Safe bank details resolution
  const bankDetails = merged?.bankDetails || {};
  const accNumber = bankDetails?.accountNumber?.trim() || '';
  const ifsc = bankDetails?.ifscCode?.trim() || '';
  const bankName = bankDetails?.bankName?.trim() || '';
  const holderName = bankDetails?.accountHolderName?.trim() || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !actionLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Doctor Onboarding Audit
              </span>
              <span className="text-sm font-semibold text-slate-800">
                Application Review & Credential Verification
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200/60 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-base"></i>
          </button>
        </div>

        {/* Doctor Summary Banner */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                {merged?.avatarUrl ? (
                  <img
                    src={getFullDocUrl(merged.avatarUrl)}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(fullName)
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 truncate">{fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <i className="fas fa-clock mr-1 text-[10px]"></i>
                    {merged?.verificationStatus ? merged.verificationStatus.toUpperCase() : 'PENDING'}
                  </span>
                  {merged?.timezone && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      <i className="fas fa-globe mr-1 text-[10px] text-slate-400"></i>
                      {merged.timezone}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-indigo-600 mt-0.5">
                  {merged?.specialty || 'General Practitioner'}
                  {merged?.yearsOfExperience ? ` • ${merged.yearsOfExperience} Years Experience` : ''}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-envelope text-slate-400"></i>
                    {doctor?.email || 'Not Provided'}
                  </span>
                  {merged?.phone && (
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-phone text-slate-400"></i>
                      {merged.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-calendar-day text-slate-400"></i>
                    Applied: {appliedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Pill & Slot Duration */}
            <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Slot Duration
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {merged?.slotDuration ? `${merged.slotDuration} Mins` : '15 Mins'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-200/80 -mb-6 overflow-x-auto pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('credentials')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'credentials'
                  ? 'border-indigo-600 text-indigo-600 bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-t-xl'
              }`}
            >
              <i className="fas fa-user-doctor text-xs"></i>
              <span>Credentials & Bio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'border-indigo-600 text-indigo-600 bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-t-xl'
              }`}
            >
              <i className="fas fa-file-shield text-xs"></i>
              <span>Qualifications & Verification Docs</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  allDocsApproved
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {approvedDocsCount}/{totalDocs}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('consultation')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'consultation'
                  ? 'border-indigo-600 text-indigo-600 bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-t-xl'
              }`}
            >
              <i className="fas fa-calendar-check text-xs"></i>
              <span>Clinic & Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payout')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'payout'
                  ? 'border-indigo-600 text-indigo-600 bg-white/70 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-t-xl'
              }`}
            >
              <i className="fas fa-building-columns text-xs"></i>
              <span>Payout & Bank Details</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {isLoadingDetails && (
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs flex items-center gap-2 animate-pulse">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Synchronizing latest complete-profile details from server...</span>
            </div>
          )}

          {/* TAB 1: CREDENTIALS & BIO */}
          {activeTab === 'credentials' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Core Credentials Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Medical License Number
                  </span>
                  <div className="mt-1.5 text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                    <span>{merged?.licenseNumber || merged?.registrationNumber || 'Not Provided'}</span>
                    {(merged?.licenseNumber || merged?.registrationNumber) && (
                      <button
                        type="button"
                        onClick={() => handleCopy(merged?.licenseNumber || merged?.registrationNumber, 'license')}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                        title="Copy License Number"
                      >
                        <i className={`fas ${copiedField === 'license' ? 'fa-check text-emerald-600' : 'fa-copy'} text-xs`}></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Clinical Experience
                  </span>
                  <div className="mt-1.5 text-sm font-bold text-slate-900">
                    {merged?.yearsOfExperience ?? merged?.experience
                      ? `${merged?.yearsOfExperience ?? merged?.experience} Years of Practice`
                      : 'Not Provided'}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Operating Timezone
                  </span>
                  <div className="mt-1.5 text-sm font-bold text-slate-900">
                    {merged?.timezone || 'Asia/Kolkata (Default)'}
                  </div>
                </div>
              </div>

              {/* Spoken Languages */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Spoken Languages
                </span>
                {Array.isArray(merged?.languages) && merged.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {merged.languages.map((lang: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5"
                      >
                        <i className="fas fa-language text-[11px] text-indigo-500"></i>
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific languages registered (Defaults to English).</p>
                )}
              </div>

              {/* Clinical Expertise & Specialization Tags */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Clinical Sub-specialties & Expertise Tags
                </span>
                {Array.isArray(merged?.expertiseTags) && merged.expertiseTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {merged.expertiseTags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                      >
                        <i className="fas fa-certificate text-[10px] text-emerald-600"></i>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific sub-specialty tags added.</p>
                )}
              </div>

              {/* Bio & Statement */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Professional Biography & Statement
                </span>
                {merged?.bio ? (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {merged.bio}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No biographical statement provided by the applicant.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: QUALIFICATIONS & DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Document Gatekeeper Progress Banner */}
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  allDocsApproved
                    ? 'bg-emerald-50/90 border-emerald-300'
                    : 'bg-amber-50/90 border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          allDocsApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                        }`}
                      ></span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Document Gatekeeper Status
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          allDocsApproved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {approvedDocsCount} of {totalDocs} Approved
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {allDocsApproved
                        ? '✅ All documents have been reviewed and approved. Doctor activation is fully unlocked in the footer.'
                        : '⚠️ Gatekeeper Enforced: Every single document must be explicitly approved before this doctor can be activated.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    <button
                      type="button"
                      onClick={handleApproveAllDocs}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100/80 border border-emerald-300 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fas fa-check-double text-xs text-emerald-600"></i>
                      <span>Approve All Documents</span>
                    </button>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-3 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      allDocsApproved ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.round((approvedDocsCount / (totalDocs || 1)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Mandatory Identification & Medical Registration Certificates */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Mandatory Verification Documents</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Uploaded during profile registration
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Medical Registration Certificate */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0">
                          <i className="fas fa-file-medical"></i>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            Medical Registration Certificate
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            State Medical Council Verification
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          medCertStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : medCertStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {medCertStatus === 'approved' && <i className="fas fa-check text-[9px]"></i>}
                        {medCertStatus === 'rejected' && <i className="fas fa-xmark text-[9px]"></i>}
                        {medCertStatus === 'pending' && <i className="fas fa-clock text-[9px]"></i>}
                        {medCertStatus}
                      </span>
                    </div>

                    {merged?.medicalCertificateRejectionReason && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                        <strong>Rejection Reason:</strong> {merged.medicalCertificateRejectionReason}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      {merged?.medicalCertificateUrl ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={getFullDocUrl(merged.medicalCertificateUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                          >
                            <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                            <span>Inspect</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setPreviewDocUrl(getFullDocUrl(merged.medicalCertificateUrl))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          >
                            <i className="fas fa-eye text-[10px]"></i>
                            <span>Preview</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                      )}

                      {/* Approval Controls */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setMedCertStatus('approved')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            medCertStatus === 'approved'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300'
                          }`}
                        >
                          <i className="fas fa-check text-[10px]"></i>
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMedCertStatus('rejected')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            medCertStatus === 'rejected'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-300'
                          }`}
                        >
                          <i className="fas fa-xmark text-[10px]"></i>
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Government Photo ID */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg shrink-0">
                          <i className="fas fa-id-card"></i>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            Government Photo ID
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            National ID / Passport / Driving License
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          govIdStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : govIdStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {govIdStatus === 'approved' && <i className="fas fa-check text-[9px]"></i>}
                        {govIdStatus === 'rejected' && <i className="fas fa-xmark text-[9px]"></i>}
                        {govIdStatus === 'pending' && <i className="fas fa-clock text-[9px]"></i>}
                        {govIdStatus}
                      </span>
                    </div>

                    {merged?.governmentIdRejectionReason && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                        <strong>Rejection Reason:</strong> {merged.governmentIdRejectionReason}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      {merged?.governmentIdUrl ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={getFullDocUrl(merged.governmentIdUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                          >
                            <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                            <span>Inspect</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setPreviewDocUrl(getFullDocUrl(merged.governmentIdUrl))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          >
                            <i className="fas fa-eye text-[10px]"></i>
                            <span>Preview</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not Uploaded</span>
                      )}

                      {/* Approval Controls */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setGovIdStatus('approved')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            govIdStatus === 'approved'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300'
                          }`}
                        >
                          <i className="fas fa-check text-[10px]"></i>
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGovIdStatus('rejected')}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            govIdStatus === 'rejected'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-300'
                          }`}
                        >
                          <i className="fas fa-xmark text-[10px]"></i>
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Degrees & Qualifications */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Academic Degrees & Qualification Certificates
                </h4>

                {Array.isArray(merged?.qualifications) && merged.qualifications.length > 0 ? (
                  <div className="space-y-3">
                    {merged.qualifications.map((q: any, idx: number) => {
                      const qualKey = q.id || String(idx);
                      const currentStatus = qualStatuses[qualKey] || 'pending';

                      return (
                        <div
                          key={qualKey}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shrink-0">
                              <i className="fas fa-graduation-cap text-base"></i>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{q.degree || 'Degree'}</div>
                              <div className="text-xs text-slate-500">
                                {q.institution || 'Institution Not Provided'} •{' '}
                                {q.year ? `Graduated ${q.year}` : 'Year Not Provided'}
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  currentStatus === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : currentStatus === 'rejected'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {currentStatus === 'approved' && <i className="fas fa-check text-[8px]"></i>}
                                {currentStatus === 'rejected' && <i className="fas fa-xmark text-[8px]"></i>}
                                {currentStatus === 'pending' && <i className="fas fa-clock text-[8px]"></i>}
                                {currentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-end">
                            {q.certificateUrl ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={getFullDocUrl(q.certificateUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  <i className="fas fa-file-lines text-slate-500"></i>
                                  <span>View Certificate</span>
                                  <i className="fas fa-arrow-up-right-from-square text-[9px] text-slate-400"></i>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDocUrl(getFullDocUrl(q.certificateUrl))}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                                  title="Quick Preview"
                                >
                                  <i className="fas fa-eye text-xs"></i>
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No Certificate Attached</span>
                            )}

                            {/* Qualification Approval Controls */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setQualStatuses((prev) => ({ ...prev, [qualKey]: 'approved' }))
                                }
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                  currentStatus === 'approved'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300'
                                }`}
                              >
                                <i className="fas fa-check text-[10px]"></i>
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setQualStatuses((prev) => ({ ...prev, [qualKey]: 'rejected' }))
                                }
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                  currentStatus === 'rejected'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-300'
                                }`}
                              >
                                <i className="fas fa-xmark text-[10px]"></i>
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No academic qualifications submitted.
                  </div>
                )}
              </div>

              {/* Inline Document Preview Box */}
              {previewDocUrl && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <i className="fas fa-eye text-indigo-600"></i>
                      Document Inline Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewDocUrl(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="w-full h-80 rounded-lg border border-slate-200 overflow-hidden bg-white">
                    {previewDocUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                      <img src={previewDocUrl} alt="Document Preview" className="w-full h-full object-contain" />
                    ) : (
                      <iframe src={previewDocUrl} title="Document Preview" className="w-full h-full" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLINIC & CONSULTATION SCHEDULE */}
          {activeTab === 'consultation' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Consultation Settings Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Online / Telehealth */}
                <div className={`p-4 rounded-xl border ${isOnlineEnabled ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/40'} shadow-2xs space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${isOnlineEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-sm`}>
                        <i className="fas fa-video"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-800">Telehealth Consultation</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isOnlineEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {isOnlineEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Consultation Session Fee</span>
                    <span className="text-base font-bold text-slate-900">
                      {onlineFee !== 'Not Provided' ? `₹${onlineFee}` : 'Not Set'}
                    </span>
                  </div>
                </div>

                {/* Offline / In-Person Clinic */}
                <div className={`p-4 rounded-xl border ${isOfflineEnabled ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-slate-50/40'} shadow-2xs space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${isOfflineEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-sm`}>
                        <i className="fas fa-hospital-user"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-800">In-Person Clinic Visit</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isOfflineEnabled ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                      {isOfflineEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500">In-Person Consultation Fee</span>
                    <span className="text-base font-bold text-slate-900">
                      {offlineFee !== 'Not Provided' ? `₹${offlineFee}` : 'Not Set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Clinic Location Details */}
              {isOfflineEnabled && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Physical Practice & Clinic Facility
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Clinic Name:</span>
                      <span className="font-semibold text-slate-800 text-sm">{clinicName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Clinic Full Address:</span>
                      <span className="font-semibold text-slate-800">{clinicAddress}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Availability Schedule Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Weekly Working Hours & Availability Shifts
                  </h4>
                  <span className="text-xs text-slate-500">
                    Timezone: <strong className="text-slate-700">{merged?.timezone || 'Asia/Kolkata'}</strong>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="grid grid-cols-3 bg-slate-100 p-2.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                    <div>Day of Week</div>
                    <div>Telehealth (Online)</div>
                    <div>In-Person (Offline)</div>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {DAYS.map((day) => {
                      const onlineSlots = onlineSchedule?.[day.key] || [];
                      const offlineSlots = offlineSchedule?.[day.key] || [];

                      return (
                        <div key={day.key} className="grid grid-cols-3 p-2.5 items-center hover:bg-slate-50/50">
                          <div className="font-semibold text-slate-800">{day.label}</div>

                          {/* Online Shift */}
                          <div>
                            {onlineSlots && onlineSlots.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {onlineSlots.map((slot: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold border border-emerald-200"
                                  >
                                    {slot.start} - {slot.end}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Off</span>
                            )}
                          </div>

                          {/* Offline Shift */}
                          <div>
                            {offlineSlots && offlineSlots.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {offlineSlots.map((slot: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-semibold border border-indigo-200"
                                  >
                                    {slot.start} - {slot.end}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Off</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYOUT & BANK DETAILS */}
          {activeTab === 'payout' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <i className="fas fa-shield-halved text-base text-amber-600 mt-0.5 shrink-0"></i>
                <div className="leading-relaxed">
                  <strong>Admin Settlement Information:</strong> Bank details are provided for manual or automated platform payout settlements. Bank Account Number is displayed in full to facilitate admin wire/NEFT processing. Use the Copy buttons for quick transaction execution.
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-money-check-dollar text-indigo-600"></i>
                  Doctor Settlement Account Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Account Holder Name */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 block font-medium">Beneficiary / Account Holder</span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {holderName || fullName || 'Not Provided'}
                    </span>
                  </div>

                  {/* Bank Name */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 block font-medium">Bank Institution Name</span>
                    <span className="text-sm font-bold text-slate-900 mt-1 block">
                      {bankName || 'Not Provided'}
                    </span>
                  </div>

                  {/* Bank Account Number (UNMASKED with Copy Button) */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Bank Account Number (Full)</span>
                      {accNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopy(accNumber, 'accNumber')}
                          className="px-2 py-0.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1 border border-indigo-100"
                        >
                          <i className={`fas ${copiedField === 'accNumber' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                          <span>{copiedField === 'accNumber' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <span className="text-base font-mono font-bold text-slate-900 mt-1 block tracking-wider">
                      {accNumber || 'Not Provided'}
                    </span>
                  </div>

                  {/* IFSC Code (with Copy Button) */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Bank IFSC Code</span>
                      {ifsc && (
                        <button
                          type="button"
                          onClick={() => handleCopy(ifsc, 'ifsc')}
                          className="px-2 py-0.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1 border border-indigo-100"
                        >
                          <i className={`fas ${copiedField === 'ifsc' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                          <span>{copiedField === 'ifsc' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <span className="text-base font-mono font-bold text-slate-900 mt-1 block">
                      {ifsc || 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                allDocsApproved ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            <span className={allDocsApproved ? 'text-emerald-700 font-semibold' : 'text-slate-600'}>
              {allDocsApproved
                ? 'All documents approved. Doctor activation ready.'
                : `Gatekeeper: ${approvedDocsCount} of ${totalDocs} documents approved.`}
            </span>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onReject(doctor, getCurrentDocumentStatuses())}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <i className="fas fa-xmark"></i>
              <span>Reject Application</span>
            </button>

            <button
              type="button"
              disabled={!allDocsApproved || actionLoading}
              onClick={() => onApprove(doctor, getCurrentDocumentStatuses())}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                allDocsApproved && !actionLoading
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-200 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
              }`}
              title={
                !allDocsApproved
                  ? `Cannot approve doctor: All ${totalDocs} documents must be marked as Approved first (${approvedDocsCount}/${totalDocs} approved).`
                  : 'Approve and activate doctor account'
              }
            >
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check text-xs"></i>
                  <span>Approve & Activate Doctor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
