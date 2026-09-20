// src/components/admin/approvals/DoctorRejectionModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PendingDoctor } from '@/redux/features/admin/adminTypes';

interface DoctorRejectionModalProps {
  doctor: PendingDoctor | null;
  documentStatuses?: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (doctorId: string, reason: string, documentStatuses?: any) => Promise<void> | void;
  isLoading?: boolean;
}

const MIN_REASON_LENGTH = 10;

export default function DoctorRejectionModal({
  doctor,
  documentStatuses,
  isOpen,
  onClose,
  onConfirmReject,
  isLoading = false,
}: DoctorRejectionModalProps) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setTouched(false);
    }
  }, [isOpen]);

  if (!isOpen || !doctor) return null;

  const trimmedLength = reason.trim().length;
  const isValid = trimmedLength >= MIN_REASON_LENGTH;
  const doctorName = doctor.profile?.firstName
    ? `Dr. ${doctor.profile.firstName} ${doctor.profile.lastName || ''}`.trim()
    : doctor.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || isLoading) return;
    await onConfirmReject(doctor.userId, reason.trim(), documentStatuses);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-user-xmark text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reject Application</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide an official explanation for the applicant.
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

        {/* Doctor Summary Context */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-100 flex items-center gap-3">
          <i className="fas fa-triangle-exclamation text-amber-600 text-sm"></i>
          <div className="text-xs text-amber-800">
            Rejecting <span className="font-semibold">{doctorName}</span> ({doctor.email}). This reason will be logged and dispatched to the doctor.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="rejectionReason" className="block text-xs font-semibold text-slate-700">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isValid ? 'text-emerald-600 font-semibold' : touched ? 'text-red-500' : 'text-slate-400'
                }`}
              >
                {trimmedLength} / {MIN_REASON_LENGTH} min characters
                {isValid && ' ✓'}
              </span>
            </div>

            <textarea
              id="rejectionReason"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (!touched) setTouched(true);
              }}
              disabled={isLoading}
              placeholder="e.g., The medical registration certificate uploaded is unreadable or has expired. Please submit a valid state medical council certificate."
              className={`w-full rounded-xl border p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                touched && !isValid
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/20'
                  : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
              }`}
            />

            {touched && !isValid && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <i className="fas fa-circle-exclamation text-[10px]"></i>
                Rejection reason must be at least {MIN_REASON_LENGTH} characters long.
              </p>
            )}
          </div>

          {/* Quick preset suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Medical license certificate is expired or unreadable.',
                'Qualifications do not match state medical registration records.',
                'Missing valid government-issued photo identity proof.',
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setReason(suggestion);
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

          {/* Modal Actions */}
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
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
