// src/components/admin/common/StatusToggleConfirmModal.tsx
'use client';

import React, { useState } from 'react';

interface StatusToggleConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  currentStatus: 'active' | 'suspended' | string;
  userName: string;
  role: 'doctor' | 'patient';
  isLoading?: boolean;
}

export default function StatusToggleConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  userName,
  role,
  isLoading = false,
}: StatusToggleConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isSuspending = currentStatus === 'active';
  const roleTitle = role === 'doctor' ? 'Doctor' : 'Patient';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspending && !reason.trim()) {
      setError('Please provide a reason for suspending this account.');
      return;
    }
    setError('');
    await onConfirm(reason.trim());
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-xs ${
              isSuspending
                ? 'bg-rose-100 text-rose-600'
                : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            <i
              className={`fas ${
                isSuspending ? 'fa-user-slash' : 'fa-user-check'
              }`}
            ></i>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900">
              {isSuspending
                ? `Suspend ${roleTitle} Account`
                : `Reactivate ${roleTitle} Account`}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isSuspending
                ? `Are you sure you want to suspend ${userName}? They will be immediately blocked from logging in or conducting consultations.`
                : `Are you sure you want to reactivate ${userName}? Their account access and features will be restored immediately.`}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isSuspending ? 'Reason for Suspension *' : 'Administrative Note (Optional)'}
            </label>
            <textarea
              rows={3}
              placeholder={
                isSuspending
                  ? 'e.g. Violation of medical conduct terms, credential verification issue, or disputed consultation...'
                  : 'e.g. Resolved license verification or reinstated on appeal...'
              }
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            />
            {error && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <i className="fas fa-exclamation-circle text-[10px]"></i>
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60 ${
                isSuspending
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isLoading && (
                <i className="fas fa-spinner fa-spin text-xs"></i>
              )}
              <span>
                {isSuspending
                  ? 'Confirm Suspension'
                  : 'Confirm Reactivation'}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
