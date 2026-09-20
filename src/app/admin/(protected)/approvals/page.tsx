// src/app/admin/(protected)/approvals/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchPendingDoctors,
  approveDoctor,
  rejectDoctor,
} from '@/redux/features/admin/adminThunk';
import { PendingDoctor } from '@/redux/features/admin/adminTypes';
import PendingDoctorsTable from '@/components/admin/approvals/PendingDoctorsTable';
import DoctorDetailsModal from '@/components/admin/approvals/DoctorDetailsModal';
import DoctorRejectionModal from '@/components/admin/approvals/DoctorRejectionModal';

export default function DoctorApprovalsPage() {
  const dispatch = useAppDispatch();
  const {
    pendingDoctors,
    pendingDoctorsTotal,
    pendingDoctorsLoading,
    actionLoading,
    error,
  } = useAppSelector((state) => state.admin);

  const [selectedDoctorForDetails, setSelectedDoctorForDetails] = useState<PendingDoctor | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedDoctorForRejection, setSelectedDoctorForRejection] = useState<PendingDoctor | null>(null);
  const [rejectionDocumentStatuses, setRejectionDocumentStatuses] = useState<any>(null);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);

  // Load pending doctors on page mount
  useEffect(() => {
    dispatch(fetchPendingDoctors());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPendingDoctors());
  };

  const handleViewDetails = (doctor: PendingDoctor) => {
    setSelectedDoctorForDetails(doctor);
    setIsDetailsOpen(true);
  };

  const handleApprove = async (doctor: PendingDoctor, documentStatuses?: any) => {
    const doctorName = doctor.profile?.firstName
      ? `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName || ''}`.trim()
      : doctor.email;

    try {
      await dispatch(approveDoctor({ doctorId: doctor.userId, documentStatuses })).unwrap();
      toast.success(`${doctorName} has been approved and activated!`);
      if (selectedDoctorForDetails?.userId === doctor.userId) {
        setIsDetailsOpen(false);
      }
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to approve doctor.');
    }
  };

  const handleInitiateReject = (doctor: PendingDoctor, documentStatuses?: any) => {
    setSelectedDoctorForRejection(doctor);
    setRejectionDocumentStatuses(documentStatuses || null);
    setIsRejectionOpen(true);
  };

  const handleConfirmReject = async (doctorId: string, rejectionReason: string, documentStatuses?: any) => {
    const doctor = pendingDoctors.find((d) => d.userId === doctorId) || selectedDoctorForRejection;
    const doctorName = doctor?.profile?.firstName
      ? `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName || ''}`.trim()
      : doctor?.email || 'Doctor';

    try {
      await dispatch(
        rejectDoctor({
          doctorId,
          rejectionReason,
          documentStatuses: documentStatuses || rejectionDocumentStatuses,
        })
      ).unwrap();
      toast.success(`Application for ${doctorName} has been rejected.`);
      setIsRejectionOpen(false);
      setRejectionDocumentStatuses(null);
      if (selectedDoctorForDetails?.userId === doctorId) {
        setIsDetailsOpen(false);
      }
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to reject doctor.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Doctor Approvals Queue
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingDoctorsLoading ? '...' : `${pendingDoctorsTotal} Pending`}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted medical licenses, identity certificates, and credentials before granting doctor portal access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={pendingDoctorsLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <i className={`fas fa-arrows-rotate text-xs ${pendingDoctorsLoading ? 'fa-spin' : ''}`}></i>
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {pendingDoctorsLoading ? '—' : pendingDoctorsTotal}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Awaiting Verification
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">100%</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              License Audit Required
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fas fa-file-circle-check"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">FIFO</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Oldest Applications First
            </div>
          </div>
        </div>
      </div>

      {/* Pending Doctors Data Table */}
      <PendingDoctorsTable
        doctors={pendingDoctors}
        isLoading={pendingDoctorsLoading}
        error={error}
        onViewDetails={handleViewDetails}
        onApprove={handleApprove}
        onReject={handleInitiateReject}
        onRefresh={handleRefresh}
        actionLoading={actionLoading}
      />

      {/* Doctor Detailed Credentials Modal */}
      <DoctorDetailsModal
        doctor={selectedDoctorForDetails}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onApprove={handleApprove}
        onReject={handleInitiateReject}
        actionLoading={actionLoading}
      />

      {/* Rejection Reason Modal */}
      <DoctorRejectionModal
        doctor={selectedDoctorForRejection}
        documentStatuses={rejectionDocumentStatuses}
        isOpen={isRejectionOpen}
        onClose={() => {
          setIsRejectionOpen(false);
          setRejectionDocumentStatuses(null);
        }}
        onConfirmReject={handleConfirmReject}
        isLoading={actionLoading}
      />
    </div>
  );
}
