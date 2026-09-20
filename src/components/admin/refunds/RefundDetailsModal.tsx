// src/components/admin/refunds/RefundDetailsModal.tsx
'use client';

import React from 'react';
import { RefundTicket } from '@/redux/features/admin/adminTypes';

interface RefundDetailsModalProps {
  ticket: RefundTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (ticket: RefundTicket) => void;
  onReject: (ticket: RefundTicket) => void;
  actionLoading?: boolean;
}

export default function RefundDetailsModal({
  ticket,
  isOpen,
  onClose,
  onApprove,
  onReject,
  actionLoading = false,
}: RefundDetailsModalProps) {
  if (!isOpen || !ticket) return null;

  const appt = ticket.appointmentId;
  const patientProfile = ticket.patientId?.profileId;
  const patientName = patientProfile?.firstName
    ? `${patientProfile.firstName} ${patientProfile.lastName || ''}`.trim()
    : ticket.patientId?.email || 'Patient';

  const doctor = ticket.doctorId;
  const doctorName = doctor?.firstName
    ? `Dr. ${doctor.firstName} ${doctor.lastName || ''}`.trim()
    : 'Doctor';

  const fee = appt?.fee || ticket.refundAmount || 0;
  const breakdown = appt?.feeBreakdown || {};

  const appliedDate = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'DOCTOR_UNAVAILABLE':
        return 'Doctor Unavailable / Absent';
      case 'SERVICE_NOT_RENDERED':
        return 'Service Not Rendered';
      case 'WRONG_APPOINTMENT':
        return 'Booking / Scheduling Error';
      default:
        return category || 'Other Dispute';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !actionLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Refund Dispute Review #{ticket._id.slice(-6)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Dispute Hero Summary */}
          <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50/30 to-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  {getCategoryLabel(ticket.issueCategory)}
                </span>
                <span className="text-xs text-slate-500">Submitted: {appliedDate}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1.5">
                Refund Claim: ₹{fee}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Current Status</span>
              <span className="inline-block mt-0.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {ticket.status}
              </span>
            </div>
          </div>

          {/* Patient's Reported Issue */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Patient Dispute Statement</span>
              {ticket.proofUrl && (
                <a
                  href={ticket.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <i className="fas fa-paperclip text-[10px]"></i>
                  View Uploaded Proof
                </a>
              )}
            </div>
            <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-wrap">
              "{ticket.issueDescription}"
            </p>
          </div>

          {/* Involved Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i className="fas fa-user text-indigo-500"></i>
                Patient
              </div>
              <div className="font-semibold text-slate-900">{patientName}</div>
              <div className="text-xs text-slate-500 mt-0.5">{ticket.patientId?.email}</div>
              {patientProfile?.phone && (
                <div className="text-xs text-slate-500 mt-0.5">
                  <i className="fas fa-phone text-slate-400 text-[10px] mr-1"></i>
                  {patientProfile.phone}
                </div>
              )}
              {patientProfile?.walletBalance !== undefined && (
                <div className="text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
                  Current Wallet: ₹{patientProfile.walletBalance}
                </div>
              )}
            </div>

            {/* Doctor Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i className="fas fa-user-doctor text-indigo-500"></i>
                Doctor & Clinic
              </div>
              <div className="font-semibold text-slate-900">{doctorName}</div>
              <div className="text-xs text-indigo-600 font-medium mt-0.5">
                {doctor?.specialty || 'Doctor'}
              </div>
              {doctor?.clinicAddress && (
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                  <i className="fas fa-location-dot text-slate-400 text-[10px] mr-1"></i>
                  {typeof doctor.clinicAddress === 'string'
                    ? doctor.clinicAddress
                    : `${doctor.clinicAddress.street || ''} ${doctor.clinicAddress.city || ''}`}
                </div>
              )}
            </div>
          </div>

          {/* Appointment Context & Fee Breakdown */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Appointment & Financial Breakdown
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Date</span>
                <strong className="text-slate-800">
                  {appt?.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : '—'}
                </strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Time Slot</span>
                <strong className="text-slate-800">{appt?.appointmentTime || '—'}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Mode</span>
                <strong className="text-slate-800">{appt?.consultationType || 'OFFLINE'}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Clinic OTP</span>
                <strong className={appt?.offlineOTPVerifiedAt ? 'text-emerald-600' : 'text-amber-600'}>
                  {appt?.offlineOTPVerifiedAt ? 'Verified' : 'Unverified'}
                </strong>
              </div>
            </div>

            {/* Fee Split */}
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-600">Total Consultation Fee: </span>
                <strong className="text-slate-900 text-sm">₹{fee}</strong>
              </div>
              <div className="flex gap-4 text-slate-500 text-[11px]">
                {breakdown.adminCommission !== undefined && (
                  <span>Commission: ₹{breakdown.adminCommission}</span>
                )}
                {breakdown.doctorEarnings !== undefined && (
                  <span>Doctor Earned: ₹{breakdown.doctorEarnings}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Impact Warning */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <i className="fas fa-info-circle text-indigo-600"></i>
              <span>Resolution Consequences</span>
            </div>
            <p>
              • <strong>Approve:</strong> Automatically transfers <strong>₹{fee}</strong> into the patient's wallet in a single ACID transaction.
            </p>
            <p>
              • <strong>Reject:</strong> Requires a minimum 10-character reason and closes the dispute ticket without crediting funds.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onReject(ticket)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <i className="fas fa-xmark"></i>
              <span>Reject Refund</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onApprove(ticket)}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check text-xs"></i>
                  <span>Approve & Credit ₹{fee}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
