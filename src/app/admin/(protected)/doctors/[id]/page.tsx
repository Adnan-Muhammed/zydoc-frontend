// src/app/admin/(protected)/doctors/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axiosInstance';
import StatusToggleConfirmModal from '@/components/admin/common/StatusToggleConfirmModal';

interface DoctorDetailPageProps {
  params: { id: string };
} 
 
const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

export default function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const router = useRouter();
  const doctorId = params?.id;

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Status toggle modal state (for Reactivation)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
 
  // Suspension modal state
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('');
  const [isSuspending, setIsSuspending] = useState(false);

  // Rejection modal prompt
  interface RejectModalState {
    isOpen: boolean;
    type: 'doctor' | 'medicalCertificate' | 'governmentId' | 'qualification';
    qualId?: string;
    title: string;
    subtitle: string;
  }
  const [rejectModal, setRejectModal] = useState<RejectModalState>({
    isOpen: false,
    type: 'doctor',
    title: 'Reject Doctor Application',
    subtitle: 'Provide a reason for rejecting this application.',
  });
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch complete doctor record
  const fetchDoctor = useCallback(async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/admin/doctors/${doctorId}`);
      if (res.data?.success && (res.data.doctor || res.data.user)) {
        setDoctor(res.data.doctor || res.data.user);
      } else {
        toast.error('Doctor record not found.');
      }
    } catch (error: any) {
      console.error('Failed to fetch doctor details:', error);
      toast.error(error.response?.data?.message || 'Failed to load doctor profile.');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  const handleCopy = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label || text);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getFullDocUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Actions
  const handleApproveDoctor = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.post(`/admin/doctors/${doctorId}/approve`);
      toast.success('Doctor application approved successfully!');
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve doctor.');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (
    type: 'doctor' | 'medicalCertificate' | 'governmentId' | 'qualification',
    title: string,
    subtitle: string,
    qualId?: string
  ) => {
    setRejectModal({
      isOpen: true,
      type,
      title,
      subtitle,
      qualId,
    });
    setRejectionReasonInput('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionReasonInput.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    if (rejectModal.type === 'doctor' && rejectionReasonInput.trim().length < 10) {
      toast.error('Application rejection reason must be at least 10 characters.');
      return;
    }

    try {
      setIsRejecting(true);
      const reason = rejectionReasonInput.trim();

      if (rejectModal.type === 'doctor') {
        await axiosInstance.post(`/admin/doctors/${doctorId}/reject`, {
          rejectionReason: reason,
        });
        toast.success('Doctor application rejected.');
      } else if (rejectModal.type === 'medicalCertificate' || rejectModal.type === 'governmentId') {
        await axiosInstance.put(`/admin/doctors/${doctorId}/documents/${rejectModal.type}/status`, {
          status: 'rejected',
          reason,
        });
        toast.success('Document marked as rejected.');
      } else if (rejectModal.type === 'qualification' && rejectModal.qualId) {
        await axiosInstance.put(`/admin/doctors/${doctorId}/qualifications/${rejectModal.qualId}/status`, {
          status: 'rejected',
          reason,
        });
        toast.success('Qualification certificate marked as rejected.');
      }

      setRejectModal((prev) => ({ ...prev, isOpen: false }));
      setRejectionReasonInput('');
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Suspension confirmation
  const handleConfirmSuspend = async () => {
    if (!suspensionReasonInput.trim() || suspensionReasonInput.trim().length < 5) {
      toast.error('Please enter a descriptive suspension reason (at least 5 characters).');
      return;
    }

    try {
      setIsSuspending(true);
      await axiosInstance.put(`/admin/doctors/${doctorId}/suspend`, {
        reason: suspensionReasonInput.trim(),
      });
      toast.success('Doctor account has been suspended.');
      setIsSuspendModalOpen(false);
      setSuspensionReasonInput('');
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to suspend doctor.');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleConfirmStatusToggle = async (reason: string) => {
    try {
      setIsTogglingStatus(true);
      await axiosInstance.post(`/admin/users/doctors/${doctorId}/toggle-status`, { reason });
      toast.success('Doctor account status updated successfully.');
      setIsStatusModalOpen(false);
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle account status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (window.confirm('Are you sure you want to permanently delete this doctor account? This action cannot be undone.')) {
      try {
        setActionLoading(true);
        await axiosInstance.delete(`/admin/users/${doctorId}`);
        toast.success('Doctor deleted successfully.');
        router.push('/admin/doctors');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete doctor account.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Document status updates
  const handleApproveDoc = async (docType: 'medicalCertificate' | 'governmentId') => {
    try {
      setActionLoading(true);
      await axiosInstance.put(`/admin/doctors/${doctorId}/documents/${docType}/status`, {
        status: 'approved',
      });
      toast.success('Document marked as approved!');
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve document.');
    } finally {
      setActionLoading(false);
    }
  };

  // Qualification status updates
  const handleApproveQual = async (qualId: string) => {
    try {
      setActionLoading(true);
      await axiosInstance.put(`/admin/doctors/${doctorId}/qualifications/${qualId}/status`, {
        status: 'approved',
      });
      toast.success('Certificate marked as approved!');
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve certificate.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk approve all documents at once
  const handleApproveAllDocs = async () => {
    try {
      setActionLoading(true);
      const promises: Promise<any>[] = [
        axiosInstance.put(`/admin/doctors/${doctorId}/documents/medicalCertificate/status`, { status: 'approved' }),
        axiosInstance.put(`/admin/doctors/${doctorId}/documents/governmentId/status`, { status: 'approved' }),
      ];
      if (Array.isArray(doctor?.qualifications)) {
        doctor.qualifications.forEach((q: any, idx: number) => {
          const qualId = q.id || String(idx);
          promises.push(
            axiosInstance.put(`/admin/doctors/${doctorId}/qualifications/${qualId}/status`, { status: 'approved' })
          );
        });
      }
      await Promise.all(promises);
      toast.success('All documents marked as approved!');
      fetchDoctor();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve all documents.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <i className="fas fa-spinner fa-spin text-3xl text-indigo-600"></i>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading 360° Doctor Intelligence Profile...
        </p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto">
          <i className="fas fa-user-xmark"></i>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested doctor ID may have been deleted or does not exist in the database.
        </p>
        <Link
          href="/admin/doctors"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Return to Doctors Directory</span>
        </Link>
      </div>
    );
  }

  const dName = doctor?.name || `${doctor?.firstName || ''} ${doctor?.lastName || ''}`.trim() || 'Dr. Medical Practitioner';
  const dEmail = doctor?.email || 'Not Provided';
  const dPhone = doctor?.phone || 'Not Provided';
  const dSpecialty = doctor?.specialty || 'General Practice';
  const vStatus = doctor?.verificationStatus || 'pending';
  const aStatus = doctor?.accountStatus || (doctor as any)?.status || 'active';
  const isActive = aStatus === 'active';
  const isPostApproval = vStatus === 'approved' || aStatus === 'suspended';

  // Safe consultation values
  const consultation = doctor?.consultationSettings || {};
  const onlineConsult = consultation?.online || consultation?.video;
  const offlineConsult = consultation?.offline || consultation?.physical;
  const isOnlineEnabled = Boolean(onlineConsult?.enabled);
  const onlineFee = onlineConsult?.fee ?? 'Not Set';
  const isOfflineEnabled = Boolean(offlineConsult?.enabled);
  const offlineFee = offlineConsult?.fee ?? 'Not Set';
  const clinicName = offlineConsult?.clinicName || doctor?.hospital || 'Not Provided';
  const clinicAddress = offlineConsult?.clinicAddress || 'Not Provided';

  // Safe schedule values
  const workingHours = doctor?.workingHours || {};
  const onlineSchedule = workingHours?.online || {};
  const offlineSchedule = workingHours?.offline || {};

  // Safe bank details (unmasked with copy)
  const bankDetails = doctor?.bankDetails || {};
  const accNumber = bankDetails?.accountNumber?.trim() || '';
  const ifsc = bankDetails?.ifscCode?.trim() || '';
  const bankName = bankDetails?.bankName?.trim() || '';
  const holderName = bankDetails?.accountHolderName?.trim() || '';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/doctors"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <i className="fas fa-arrow-left text-[11px]"></i>
            <span>Doctors</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{dName}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  vStatus === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : vStatus === 'rejected'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {vStatus}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctor ID: <span className="font-mono">{doctorId}</span> • {dSpecialty}
            </p>
          </div>
        </div>

        {/* Global Action Header Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {vStatus === 'pending' && (
            <>
              <button
                type="button"
                onClick={handleApproveDoctor}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <i className="fas fa-check"></i>
                <span>Approve Doctor</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  openRejectModal(
                    'doctor',
                    'Reject Doctor Application',
                    'Please provide a clear reason for rejecting this doctor application.'
                  )
                }
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <i className="fas fa-xmark"></i>
                <span>Reject Application</span>
              </button>
            </>
          )}

          {vStatus === 'approved' && isActive && (
            <button
              type="button"
              onClick={() => {
                setSuspensionReasonInput('');
                setIsSuspendModalOpen(true);
              }}
              disabled={actionLoading || isSuspending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs border bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 cursor-pointer"
            >
              <i className="fas fa-ban"></i>
              <span>Suspend Doctor</span>
            </button>
          )}

          {vStatus === 'approved' && !isActive && (
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs border bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer"
            >
              <i className="fas fa-check-circle"></i>
              <span>Reactivate Doctor</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDeleteDoctor}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Permanently remove doctor account"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: IDENTITY, STATUS & PAYOUT CARD */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs text-center relative overflow-hidden">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white font-bold text-3xl flex items-center justify-center mx-auto shadow-md overflow-hidden ring-4 ring-slate-100">
              {doctor?.avatarUrl ? (
                <img
                  src={getFullDocUrl(doctor.avatarUrl)}
                  alt={dName}
                  className="w-full h-full object-cover"
                />
              ) : (
                dName.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase()
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-4">{dName}</h3>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{dSpecialty}</p>

            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {aStatus} Account
              </span>
            </div>

            {doctor?.suspensionReason && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs text-left">
                <strong className="block font-semibold">Suspension Reason:</strong>
                <span>{doctor.suspensionReason}</span>
              </div>
            )}
            {doctor?.rejectionReason && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs text-left">
                <strong className="block font-semibold">Rejection Reason:</strong>
                <span>{doctor.rejectionReason}</span>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-slate-100 text-center">
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="text-xs font-bold text-slate-800">
                  {doctor?.rating ? `${doctor.rating}★` : '5.0★'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Rating</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="text-xs font-bold text-slate-800">
                  {doctor?.reviewCount ?? doctor?.patients ?? 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Reviews</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="text-xs font-bold text-slate-800">
                  {doctor?.slotDuration ? `${doctor.slotDuration}m` : '15m'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Slot</div>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-address-book text-indigo-600"></i>
              Contact & Platform Info
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Email Address</span>
                <span className="font-semibold text-slate-800 truncate max-w-[170px]">{dEmail}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-semibold text-slate-800">{dPhone}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">License Number</span>
                <span className="font-mono font-bold text-slate-800">
                  {doctor?.licenseNumber || doctor?.registrationNumber || 'Not Provided'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Timezone</span>
                <span className="font-medium text-slate-800">{doctor?.timezone || 'Asia/Kolkata'}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Joined Platform</span>
                <span className="font-medium text-slate-800">
                  {doctor?.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'Not Provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank & Payout Information (Adjustment 1: Full Unmasked Number with Copy) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-building-columns text-emerald-600"></i>
                Payout & Bank Settlement
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Direct NEFT/RTGS
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[11px]">Account Holder Name</span>
                <span className="font-bold text-slate-800">{holderName || dName}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[11px]">Bank Name</span>
                <span className="font-bold text-slate-800">{bankName || 'Not Provided'}</span>
              </div>

              {/* Full Bank Account Number (UNMASKED with Copy Button) */}
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Bank Account Number (Full)</span>
                  {accNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopy(accNumber, 'pageAcc')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <i className={`fas ${copiedField === 'pageAcc' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                      <span>{copiedField === 'pageAcc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm tracking-wider block">
                  {accNumber || 'Not Provided'}
                </span>
              </div>

              {/* IFSC Code (with Copy Button) */}
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Bank IFSC Code</span>
                  {ifsc && (
                    <button
                      type="button"
                      onClick={() => handleCopy(ifsc, 'pageIfsc')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <i className={`fas ${copiedField === 'pageIfsc' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                      <span>{copiedField === 'pageIfsc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {ifsc || 'Not Provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED CREDENTIALS, DOCUMENTS & CLINIC SCHEDULE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Credentials & Bio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-stethoscope text-indigo-600"></i>
              Professional Statement & Clinical Specialization
            </h4>

            {/* Bio */}
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-1">About Doctor / Bio</span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                {doctor?.bio || 'No biography statement submitted on file.'}
              </p>
            </div>

            {/* Sub-specialties & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">Expertise Tags</span>
                {Array.isArray(doctor?.expertiseTags) && doctor.expertiseTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.expertiseTags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">None Provided</span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">Languages Spoken</span>
                {Array.isArray(doctor?.languages) && doctor.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.languages.map((lang: string, i: number) => (
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
            </div>
          </div>

          {/* Document Verification Section with Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <i className="fas fa-file-shield text-indigo-600"></i>
                Official Verification Documents
              </span>
              <div className="flex items-center gap-2">
                {!isPostApproval && (
                  <button
                    type="button"
                    onClick={handleApproveAllDocs}
                    disabled={actionLoading}
                    className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fas fa-check-double text-[10px]"></i>
                    <span>Approve All</span>
                  </button>
                )}
                <span className="text-[11px] font-normal text-slate-400">
                  {isPostApproval ? 'Verified & Locked' : 'Audit & Verify'}
                </span>
              </div>
            </h4>

            <div className="space-y-3">
              {/* Medical Council Registration Certificate */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0">
                    <i className="fas fa-file-medical"></i>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Medical Council Registration Certificate</div>
                    <div className="text-xs text-slate-500">
                      Status:{' '}
                      <span
                        className={`font-bold uppercase ${
                          doctor?.medicalCertificateStatus === 'approved'
                            ? 'text-emerald-600'
                            : doctor?.medicalCertificateStatus === 'rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {doctor?.medicalCertificateStatus || 'Pending'}
                      </span>
                      {doctor?.medicalCertificateRejectionReason && (
                        <span className="block text-rose-600 mt-0.5">
                          Reason: {doctor.medicalCertificateRejectionReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {doctor?.medicalCertificateUrl && (
                    <a
                      href={getFullDocUrl(doctor.medicalCertificateUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                      <span>View</span>
                    </a>
                  )}
                  {!isPostApproval && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApproveDoc('medicalCertificate')}
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 text-xs transition-colors cursor-pointer"
                        title="Approve Medical Certificate"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openRejectModal(
                            'medicalCertificate',
                            'Reject Medical Certificate',
                            'Please specify why the medical registration certificate was rejected.'
                          )
                        }
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs transition-colors cursor-pointer"
                        title="Reject Medical Certificate"
                      >
                        <i className="fas fa-xmark"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Government Issued Photo ID */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg shrink-0">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Government Photo ID</div>
                    <div className="text-xs text-slate-500">
                      Status:{' '}
                      <span
                        className={`font-bold uppercase ${
                          doctor?.governmentIdStatus === 'approved'
                            ? 'text-emerald-600'
                            : doctor?.governmentIdStatus === 'rejected'
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {doctor?.governmentIdStatus || 'Pending'}
                      </span>
                      {doctor?.governmentIdRejectionReason && (
                        <span className="block text-rose-600 mt-0.5">
                          Reason: {doctor.governmentIdRejectionReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {doctor?.governmentIdUrl && (
                    <a
                      href={getFullDocUrl(doctor.governmentIdUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                      <span>View</span>
                    </a>
                  )}
                  {!isPostApproval && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApproveDoc('governmentId')}
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 text-xs transition-colors cursor-pointer"
                        title="Approve Government ID"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openRejectModal(
                            'governmentId',
                            'Reject Government Photo ID',
                            'Please specify why the government photo ID was rejected.'
                          )
                        }
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs transition-colors cursor-pointer"
                        title="Reject Government ID"
                      >
                        <i className="fas fa-xmark"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Qualifications & Degrees Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-graduation-cap text-indigo-600"></i>
              Qualifications & Educational Degrees
            </h4>

            {Array.isArray(doctor?.qualifications) && doctor.qualifications.length > 0 ? (
              <div className="space-y-2.5">
                {doctor.qualifications.map((q: any, idx: number) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{q.degree}</div>
                      <div className="text-slate-500 mt-0.5">
                        {q.institution} {q.year ? `• Class of ${q.year}` : ''}
                      </div>
                      {q.certificateStatus && (
                        <div className="mt-1">
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
                          {q.rejectionReason && (
                            <span className="text-rose-600 ml-2">Reason: {q.rejectionReason}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {q.certificateUrl && (
                        <a
                          href={getFullDocUrl(q.certificateUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 text-xs"
                        >
                          <i className="fas fa-file-lines text-slate-400"></i>
                          <span>Certificate</span>
                        </a>
                      )}
                      {!isPostApproval && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveQual(q.id)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 text-xs transition-colors cursor-pointer"
                            title="Approve Certificate"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openRejectModal(
                                'qualification',
                                `Reject Qualification (${q.degree})`,
                                'Please specify why this degree certificate was rejected.',
                                q.id
                              )
                            }
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs transition-colors cursor-pointer"
                            title="Reject Certificate"
                          >
                            <i className="fas fa-xmark"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No academic degrees submitted on file.</p>
            )}
          </div>

          {/* Clinic & Consultation Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-hospital-user text-indigo-600"></i>
              Consultation Settings & Practice Locations
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Telehealth Video Calls</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${isOnlineEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {isOnlineEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="text-slate-600">
                  Fee: <strong className="text-slate-900">{onlineFee !== 'Not Set' ? `₹${onlineFee}` : 'Not Configured'}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">In-Person Clinic Visits</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${isOfflineEnabled ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                    {isOfflineEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="text-slate-600">
                  Fee: <strong className="text-slate-900">{offlineFee !== 'Not Set' ? `₹${offlineFee}` : 'Not Configured'}</strong>
                </div>
              </div>
            </div>

            {isOfflineEnabled && (
              <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1">
                <div>Clinic Name: <strong className="text-slate-800">{clinicName}</strong></div>
                <div>Address: <span className="text-slate-700">{clinicAddress}</span></div>
              </div>
            )}
          </div>

          {/* 7-Day Visual Availability Schedule Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-calendar-alt text-indigo-600"></i>
                Weekly Availability Schedule
              </h4>
              <span className="text-xs text-slate-500">
                Operating Timezone: <strong className="text-slate-700">{doctor?.timezone || 'Asia/Kolkata'}</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="grid grid-cols-3 bg-slate-100 p-2.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                <div>Day</div>
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

                      {/* Online Shifts */}
                      <div>
                        {onlineSlots && onlineSlots.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {onlineSlots.map((slot: any, i: number) => (
                              <span
                                key={i}
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

                      {/* Offline Shifts */}
                      <div>
                        {offlineSlots && offlineSlots.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {offlineSlots.map((slot: any, i: number) => (
                              <span
                                key={i}
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
      </div>

      {/* Account Status Toggle Modal (for Reactivation) */}
      <StatusToggleConfirmModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        currentStatus={aStatus}
        userName={dName}
        role="doctor"
        isLoading={isTogglingStatus}
      />

      {/* Rejection Prompt Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <i className="fas fa-triangle-exclamation text-rose-600"></i>
              {rejectModal.title}
            </h3>
            <p className="text-xs text-slate-500">
              {rejectModal.subtitle}
            </p>
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. The document is unreadable, expired, or details mismatch..."
              rows={4}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
                disabled={isRejecting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Modal */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <i className="fas fa-ban text-amber-600"></i>
              Suspend Doctor Account
            </h3>
            <p className="text-xs text-slate-500">
              Please state the reason for suspending Dr. {dName}. While suspended, the doctor will not be able to accept appointments or log in normally.
            </p>
            <textarea
              value={suspensionReasonInput}
              onChange={(e) => setSuspensionReasonInput(e.target.value)}
              placeholder="e.g. Under investigation for patient dispute or compliance breach..."
              rows={4}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                disabled={isSuspending}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={isSuspending}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSuspending ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
