// src/components/admin/refunds/RefundRejectionModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { RefundTicket } from '@/redux/features/admin/adminTypes';

interface RefundRejectionModalProps {
  ticket: RefundTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (ticketId: string, adminNote: string) => Promise<void> | void;
  isLoading?: boolean;
}

const MIN_NOTE_LENGTH = 10;

export default function RefundRejectionModal({
  ticket,
  isOpen,
  onClose,
  onConfirmReject,
  isLoading = false,
}: RefundRejectionModalProps) {
  const [adminNote, setAdminNote] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAdminNote('');
      setTouched(false);
    }
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const trimmedLength = adminNote.trim().length;
  const isValid = trimmedLength >= MIN_NOTE_LENGTH;

  const patient = ticket.patientId?.profileId;
  const patientName = patient?.firstName
    ? `${patient.firstName} ${patient.lastName || ''}`.trim()
    : ticket.patientId?.email || 'Patient';

  const appointmentFee = ticket.appointmentId?.fee || ticket.refundAmount || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || isLoading) return;
    await onConfirmReject(ticket._id, adminNote.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-hand-holding-dollar text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject Refund Request</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Explain the rationale for denying this offline refund ticket.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Ticket Context Warning */}
        <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
          <div>
            <span>Ticket: </span>
            <strong className="font-mono">#{ticket._id.slice(-6)}</strong>
            <span className="mx-1.5">•</span>
            <span>Patient: </span>
            <strong>{patientName}</strong>
          </div>
          <span className="font-bold text-slate-800">₹{appointmentFee}</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="adminNote" className="block text-xs font-semibold text-slate-700">
                Reason / Admin Note <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isValid ? 'text-emerald-600 font-semibold' : touched ? 'text-red-500' : 'text-slate-400'
                }`}
              >
                {trimmedLength} / {MIN_NOTE_LENGTH} min characters
                {isValid && ' ✓'}
              </span>
            </div>

            <textarea
              id="adminNote"
              rows={4}
              value={adminNote}
              onChange={(e) => {
                setAdminNote(e.target.value);
                if (!touched) setTouched(true);
              }}
              disabled={isLoading}
              placeholder="e.g., Clinic attendance verification log confirms consultation OTP was entered. Doctor fulfilled offline consultation."
              className={`w-full rounded-xl border p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                touched && !isValid
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/20'
                  : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
              }`}
            />

            {touched && !isValid && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <i className="fas fa-circle-exclamation text-[10px]"></i>
                Rejection reason must be at least {MIN_NOTE_LENGTH} characters long.
              </p>
            )}
          </div>

          {/* Quick Preset Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Common Rejection Reasons
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Offline consultation OTP was entered and verified at the clinic.',
                'Patient did not report to clinic at scheduled slot per clinic logs.',
                'Dispute raised exceeds the eligible offline dispute reporting window.',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAdminNote(suggestion);
                    setTouched(true);
                  }}
                  disabled={isLoading}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all shadow-sm shadow-red-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-xmark text-xs"></i>
                  <span>Confirm Denial</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
