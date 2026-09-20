// src/components/admin/doctors/DoctorDetailDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import { useAppDispatch } from '@/redux/hooks';
import { toggleDoctorStatus } from '@/redux/features/admin/adminThunk';
import { MasterDoctor } from '@/redux/features/admin/adminTypes';
import StatusToggleConfirmModal from '@/components/admin/common/StatusToggleConfirmModal';

interface DoctorDetailDrawerProps {
  doctor: MasterDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusToggled?: () => void;
}

type TabType = 'overview' | 'documents' | 'schedule' | 'payout';

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

export default function DoctorDetailDrawer({
  doctor,
  isOpen,
  onClose,
  onStatusToggled,
}: DoctorDetailDrawerProps) {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentStatus, setCurrentStatus] = useState<'active' | 'suspended' | string>('active');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [fetchedDetails, setFetchedDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Application approval & rejection actions for pending doctors
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setCurrentStatus(doctor.accountStatus || 'active');
    }
  }, [doctor]);

  // Fetch full and latest profile details from /api/admin/doctors/:id on drawer open
  useEffect(() => {
    const targetId = doctor?.userId || (doctor?.profile as any)?._id;
    if (isOpen && targetId) {
      let isMounted = true;
      const loadDetails = async () => {
        try {
          setIsLoadingDetails(true);
          const res = await axiosInstance.get(`/admin/doctors/${targetId}`);
          if (isMounted && res.data?.success && (res.data.doctor || res.data.user)) {
            setFetchedDetails(res.data.doctor || res.data.user);
          }
        } catch (err) {
          // Gracefully fallback to prop data
        } finally {
          if (isMounted) setIsLoadingDetails(false);
        }
      };
      loadDetails();
      return () => {
        isMounted = false;
      };
    } else {
      setFetchedDetails(null);
      setActiveTab('overview');
    }
  }, [isOpen, doctor?.userId]);

  if (!isOpen || !doctor) return null;

  const baseProfile = doctor.profile || {};
  const profile = { ...baseProfile, ...(fetchedDetails || {}) };
  const targetId = doctor.userId || (profile as any)._id || (profile as any).id || '';

  const getFullDocUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleCopy = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label || text);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fullName =
    profile.name ||
    (profile.firstName || profile.lastName
      ? `Dr. ${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      : doctor.email ? doctor.email.split('@')[0] : 'Doctor');

  const dEmail = profile.email || doctor.email || 'Not Provided';
  const dPhone = profile.phone || 'Not Provided';
  const dSpecialty = profile.specialty || 'General Practice';
  const vStatus = profile.verificationStatus || 'pending';
  const aStatus = currentStatus || doctor.accountStatus || 'active';
  const isActive = aStatus === 'active';
  const isApproved = vStatus === 'approved';

  const joinedDate = (fetchedDetails?.createdAt || doctor.createdAt)
    ? new Date(fetchedDetails?.createdAt || doctor.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not Provided';

  const verifiedDate = profile.verifiedAt
    ? new Date(profile.verifiedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Actual consultation settings from database
  const consultation = profile.consultationSettings || {};
  const onlineConsult = consultation.online || consultation.video;
  const offlineConsult = consultation.offline || consultation.physical;

  const isOnlineEnabled = Boolean(onlineConsult?.enabled ?? consultation.enableVideo);
  const onlineFee = onlineConsult?.fee ?? consultation.onlineFee ?? consultation.fee;

  const isOfflineEnabled = Boolean(offlineConsult?.enabled ?? consultation.enablePhysical);
  const offlineFee = offlineConsult?.fee ?? consultation.offlineFee;
  const clinicName = offlineConsult?.clinicName || (profile as any).hospital || (profile as any).clinicName || 'Not Provided';
  const clinicAddress = offlineConsult?.clinicAddress || (profile as any).clinicAddress || 'Not Provided';

  const slotDuration = profile.slotDuration ?? consultation.slotDuration ?? consultation.durationMinutes ?? 15;

  // Weekly availability schedule
  const workingHours = profile.workingHours || {};
  const onlineSchedule = workingHours.online || {};
  const offlineSchedule = workingHours.offline || {};

  // Bank details
  const bankDetails = profile.bankDetails || {};
  const accNumber = bankDetails.accountNumber?.trim() || '';
  const ifsc = bankDetails.ifscCode?.trim() || '';
  const bankName = bankDetails.bankName?.trim() || '';
  const holderName = bankDetails.accountHolderName?.trim() || '';

  // Qualifications list
  const qualificationsList = Array.isArray(profile.qualifications) ? profile.qualifications : [];
  const docCount = 2 + qualificationsList.length;

  // Actions
  const handleToggleConfirm = async (reason: string) => {
    if (!targetId) return;
    setIsToggling(true);
    try {
      const res = await dispatch(
        toggleDoctorStatus({ doctorId: targetId, reason })
      ).unwrap();

      const newStatus = res.newStatus || (isActive ? 'suspended' : 'active');
      setCurrentStatus(newStatus);
      setIsConfirmModalOpen(false);
      toast.success(
        res.message ||
          `Doctor account has been ${newStatus === 'active' ? 'reactivated' : 'suspended'}.`
      );
      onStatusToggled?.();
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to update doctor account status.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleApproveDoctor = async () => {
    if (!targetId) return;
    try {
      setActionLoading(true);
      await axiosInstance.post(`/admin/doctors/${targetId}/approve`);
      toast.success('Doctor application approved successfully!');
      const res = await axiosInstance.get(`/admin/doctors/${targetId}`);
      if (res.data?.success && (res.data.doctor || res.data.user)) {
        setFetchedDetails(res.data.doctor || res.data.user);
      }
      onStatusToggled?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve doctor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDoctor = async () => {
    if (!targetId) return;
    if (!rejectionReasonInput.trim() || rejectionReasonInput.trim().length < 10) {
      toast.error('Please enter a descriptive rejection reason (at least 10 characters).');
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.post(`/admin/doctors/${targetId}/reject`, {
        rejectionReason: rejectionReasonInput.trim(),
      });
      toast.success('Doctor application rejected.');
      setIsRejectModalOpen(false);
      setRejectionReasonInput('');
      const res = await axiosInstance.get(`/admin/doctors/${targetId}`);
      if (res.data?.success && (res.data.doctor || res.data.user)) {
        setFetchedDetails(res.data.doctor || res.data.user);
      }
      onStatusToggled?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject doctor.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <div className="w-screen max-w-md sm:max-w-lg lg:max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition ease-in-out duration-300">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
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
                    {aStatus} Account
                  </span>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      vStatus === 'approved'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : vStatus === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
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
                    />
                    {vStatus}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">
                  Doctor Profile Inspection
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                title="Close drawer"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Identity & Top Actions Banner */}
            <div className="p-5 border-b border-slate-100 bg-white space-y-4">
              <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                  <img
                    src={getFullDocUrl(profile.avatarUrl)}
                    alt={fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl ring-2 ring-slate-100 shadow-sm shrink-0">
                    {fullName.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {fullName}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {dSpecialty}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 truncate">
                    <span className="truncate">
                      <i className="fas fa-envelope mr-1 text-slate-400"></i>
                      {dEmail}
                    </span>
                    {profile.phone && (
                      <span className="shrink-0">
                        <i className="fas fa-phone mr-1 text-slate-400"></i>
                        {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Key Metrics (Actual Database Values - NO DUMMY DATA) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-medium">Rating</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                    {profile.rating ? (
                      <>
                        <i className="fas fa-star text-amber-400 text-xs"></i>
                        <span>{Number(profile.rating).toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">N/A</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {profile.reviewCount ?? (profile as any).patients ?? 0} reviews
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-medium">Experience</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {profile.yearsOfExperience !== undefined && profile.yearsOfExperience !== null
                      ? `${profile.yearsOfExperience} Yrs`
                      : 'Not Set'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Practice</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-medium">Slot Time</div>
                  <div className="text-sm font-bold text-indigo-600 mt-0.5">
                    {slotDuration}m
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Per session</div>
                </div>
              </div>

              {/* Action Controls: Pending Approval & Status Toggle */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {vStatus === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={handleApproveDoctor}
                      disabled={actionLoading}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-check text-xs"></i>
                      <span>Approve Application</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      disabled={actionLoading}
                      className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-xmark text-xs"></i>
                      <span>Reject</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={actionLoading}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <i className={`fas ${isActive ? 'fa-ban' : 'fa-check-circle'} text-xs`}></i>
                  <span>{isActive ? 'Suspend Account' : 'Reactivate'}</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 -mb-5 pt-1 overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fas fa-id-card text-[11px]"></i>
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 py-2 font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'documents'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fas fa-file-shield text-[11px]"></i>
                  <span>Documents</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                    {docCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-2 font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'schedule'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fas fa-calendar-alt text-[11px]"></i>
                  <span>Schedule & Fees</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('payout')}
                  className={`px-3 py-2 font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'payout'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fas fa-building-columns text-[11px]"></i>
                  <span>Payout & Bank</span>
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
              {isLoadingDetails && (
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Synchronizing real-time profile details from server...</span>
                </div>
              )}

              {/* Rejection Note (if previously rejected) */}
              {profile.rejectionReason && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <i className="fas fa-exclamation-circle text-rose-600"></i>
                    <span>Previous Application Rejection Reason</span>
                  </div>
                  <p className="text-rose-700 leading-relaxed pl-4">
                    {profile.rejectionReason}
                  </p>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Bio & Statement */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Professional Statement / Bio
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                      {profile.bio || 'No biography statement submitted on file.'}
                    </p>
                  </div>

                  {/* Expertise Tags */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Clinical Expertise Tags
                    </span>
                    {Array.isArray(profile.expertiseTags) && profile.expertiseTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.expertiseTags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No expertise tags provided</p>
                    )}
                  </div>

                  {/* Languages Spoken */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Spoken Languages
                    </span>
                    {Array.isArray(profile.languages) && profile.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.languages.map((lang: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">English (Default)</span>
                    )}
                  </div>

                  {/* Contact & Platform Details */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Contact & Platform Info
                    </span>
                    <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Email Address</span>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="truncate max-w-[190px]">{dEmail}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(dEmail, 'email')}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy email"
                          >
                            <i className={`fas ${copiedField === 'email' ? 'fa-check text-emerald-600' : 'fa-copy'} text-[10px]`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Contact Phone</span>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{dPhone}</span>
                          {profile.phone && (
                            <button
                              type="button"
                              onClick={() => handleCopy(profile.phone, 'phone')}
                              className="text-slate-400 hover:text-indigo-600"
                              title="Copy phone"
                            >
                              <i className={`fas ${copiedField === 'phone' ? 'fa-check text-emerald-600' : 'fa-copy'} text-[10px]`}></i>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">License / Reg. Number</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                          <span>{profile.licenseNumber || (profile as any).registrationNumber || 'Not specified'}</span>
                          {(profile.licenseNumber || (profile as any).registrationNumber) && (
                            <button
                              type="button"
                              onClick={() => handleCopy(profile.licenseNumber || (profile as any).registrationNumber, 'lic')}
                              className="text-slate-400 hover:text-indigo-600"
                              title="Copy license"
                            >
                              <i className={`fas ${copiedField === 'lic' ? 'fa-check text-emerald-600' : 'fa-copy'} text-[10px]`}></i>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Timezone</span>
                        <span className="font-medium text-slate-800">{profile.timezone || 'Asia/Kolkata'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Joined Platform</span>
                        <span className="font-semibold text-slate-800">{joinedDate}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Verified Date</span>
                        <span className="font-semibold text-slate-800">{verifiedDate || 'Pending review'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DOCUMENTS & QUALIFICATIONS */}
              {activeTab === 'documents' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Official Verification Documents
                  </span>

                  {/* Medical Certificate */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <i className="fas fa-file-medical text-sm"></i>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Medical Registration Certificate</div>
                          <div className="text-[11px] text-slate-500">State Medical Council Verification</div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          profile.medicalCertificateStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : profile.medicalCertificateStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {profile.medicalCertificateStatus || 'Pending'}
                      </span>
                    </div>

                    {profile.medicalCertificateRejectionReason && (
                      <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px]">
                        <strong>Reason:</strong> {profile.medicalCertificateRejectionReason}
                      </div>
                    )}

                    {profile.medicalCertificateUrl ? (
                      <div className="pt-1 flex items-center justify-between">
                        <a
                          href={getFullDocUrl(profile.medicalCertificateUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg font-semibold transition-colors text-xs"
                        >
                          <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                          <span>View Certificate</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No document file uploaded</span>
                    )}
                  </div>

                  {/* Government Photo ID */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                          <i className="fas fa-id-card text-sm"></i>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Government Photo ID</div>
                          <div className="text-[11px] text-slate-500">National ID / Passport / Driver License</div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          profile.governmentIdStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : profile.governmentIdStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {profile.governmentIdStatus || 'Pending'}
                      </span>
                    </div>

                    {profile.governmentIdRejectionReason && (
                      <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px]">
                        <strong>Reason:</strong> {profile.governmentIdRejectionReason}
                      </div>
                    )}

                    {profile.governmentIdUrl ? (
                      <div className="pt-1 flex items-center justify-between">
                        <a
                          href={getFullDocUrl(profile.governmentIdUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg font-semibold transition-colors text-xs"
                        >
                          <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                          <span>View Photo ID</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No document file uploaded</span>
                    )}
                  </div>

                  {/* Academic Degrees & Qualifications */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Qualifications & Degrees ({qualificationsList.length})
                    </span>

                    {qualificationsList.length > 0 ? (
                      <div className="space-y-2.5">
                        {qualificationsList.map((q: any, idx: number) => (
                          <div
                            key={q.id || idx}
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-slate-900">{q.degree}</div>
                                <div className="text-slate-500 mt-0.5">
                                  {q.institution} {q.year ? `• Class of ${q.year}` : ''}
                                </div>
                              </div>
                              {q.certificateStatus && (
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                                    q.certificateStatus === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : q.certificateStatus === 'rejected'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {q.certificateStatus}
                                </span>
                              )}
                            </div>

                            {q.certificateUrl && (
                              <div className="pt-1">
                                <a
                                  href={getFullDocUrl(q.certificateUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-[11px]"
                                >
                                  <i className="fas fa-file-lines text-slate-400"></i>
                                  <span>View Certificate Document</span>
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        No academic qualifications on file.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULE & FEES */}
              {activeTab === 'schedule' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Consultation Settings & Fees
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Online / Telehealth */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <i className="fas fa-video text-emerald-600"></i>
                          Telehealth Video
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isOnlineEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isOnlineEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Fee:{' '}
                        <strong className="text-slate-900 font-semibold">
                          {isOnlineEnabled && onlineFee !== undefined && onlineFee !== null
                            ? `₹${onlineFee}`
                            : 'Not Configured'}
                        </strong>
                      </div>
                    </div>

                    {/* Offline / Clinic Visits */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <i className="fas fa-hospital text-indigo-600"></i>
                          In-Person Clinic
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isOfflineEnabled ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isOfflineEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Fee:{' '}
                        <strong className="text-slate-900 font-semibold">
                          {isOfflineEnabled && offlineFee !== undefined && offlineFee !== null
                            ? `₹${offlineFee}`
                            : 'Not Configured'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Address if configured */}
                  {isOfflineEnabled && (
                    <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-1">
                      <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
                        <i className="fas fa-location-dot text-indigo-500 text-[11px]"></i>
                        <span>Clinic Name: {clinicName}</span>
                      </div>
                      <div className="text-slate-600 pl-4">
                        Address: {clinicAddress}
                      </div>
                    </div>
                  )}

                  {/* Weekly Availability Schedule (Monday - Sunday) */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Weekly Availability Schedule
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        TZ: {profile.timezone || 'Asia/Kolkata'}
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="grid grid-cols-3 bg-slate-100 p-2.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                        <div>Day</div>
                        <div>Telehealth</div>
                        <div>In-Person</div>
                      </div>

                      <div className="divide-y divide-slate-100 text-xs bg-white">
                        {DAYS.map((day) => {
                          const onlineSlots = onlineSchedule?.[day.key] || [];
                          const offlineSlots = offlineSchedule?.[day.key] || [];

                          return (
                            <div key={day.key} className="grid grid-cols-3 p-2.5 items-center hover:bg-slate-50/50">
                              <div className="font-semibold text-slate-800">{day.label}</div>

                              {/* Online Shifts */}
                              <div>
                                {onlineSlots && onlineSlots.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {onlineSlots.map((slot: any, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-semibold text-[11px] border border-emerald-200"
                                      >
                                        {slot.start}-{slot.end}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Off</span>
                                )}
                              </div>

                              {/* Offline Shifts */}
                              <div>
                                {offlineSlots && offlineSlots.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {offlineSlots.map((slot: any, i: number) => (
                                      <span
                                        key={i}
                                        className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-semibold text-[11px] border border-indigo-200"
                                      >
                                        {slot.start}-{slot.end}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Off</span>
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

              {/* TAB 4: PAYOUT & BANK */}
              {activeTab === 'payout' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Settlement & Payout Details
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Direct NEFT/RTGS
                    </span>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[11px]">Account Holder Name</span>
                      <span className="font-bold text-slate-800 text-sm">{holderName || fullName}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[11px]">Bank Name</span>
                      <span className="font-bold text-slate-800 text-sm">{bankName || 'Not Provided'}</span>
                    </div>

                    {/* Unmasked Full Bank Account Number with Copy */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Bank Account Number (Full)</span>
                        {accNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopy(accNumber, 'bankAcc')}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <i className={`fas ${copiedField === 'bankAcc' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                            <span>{copiedField === 'bankAcc' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm tracking-wider block bg-white p-2.5 rounded-lg border border-slate-200">
                        {accNumber || 'Not Provided'}
                      </span>
                    </div>

                    {/* IFSC Code with Copy */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Bank IFSC Code</span>
                        {ifsc && (
                          <button
                            type="button"
                            onClick={() => handleCopy(ifsc, 'bankIfsc')}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <i className={`fas ${copiedField === 'bankIfsc' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                            <span>{copiedField === 'bankIfsc' ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm block bg-white p-2.5 rounded-lg border border-slate-200">
                        {ifsc || 'Not Provided'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    Note: Payout transfers are settled automatically following appointment completion and commission deductions.
                  </p>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Close Drawer
              </button>
              <Link
                href={`/admin/doctors/${targetId}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold text-center transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Full 360° Profile</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Account Status Toggle Modal */}
      <StatusToggleConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleToggleConfirm}
        currentStatus={currentStatus}
        userName={fullName}
        role="doctor"
        isLoading={isToggling}
      />

      {/* Rejection Prompt Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <i className="fas fa-triangle-exclamation text-rose-600"></i>
              Reject Doctor Application
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a clear rejection reason for {fullName}. This will be communicated to the doctor.
            </p>
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Medical Council Registration Certificate is expired or illegible..."
              rows={4}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectDoctor}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

