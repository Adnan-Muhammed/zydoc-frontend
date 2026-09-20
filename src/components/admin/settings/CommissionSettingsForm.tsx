// src/components/admin/settings/CommissionSettingsForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CommissionConfig } from '@/redux/features/admin/adminTypes';

interface CommissionSettingsFormProps {
  config: CommissionConfig | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (data: {
    onlineCommissionRate: number;
    offlineCommissionRate: number;
    note?: string;
  }) => Promise<void> | void;
}

export default function CommissionSettingsForm({
  config,
  isLoading,
  isSaving,
  onSave,
}: CommissionSettingsFormProps) {
  const [onlineRate, setOnlineRate] = useState<string>('15');
  const [offlineRate, setOfflineRate] = useState<string>('10');
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<{ online?: string; offline?: string }>({});

  // Sync state when config is fetched
  useEffect(() => {
    if (config) {
      if (config.onlineCommissionRate !== undefined) {
        setOnlineRate(String(config.onlineCommissionRate));
      }
      if (config.offlineCommissionRate !== undefined) {
        setOfflineRate(String(config.offlineCommissionRate));
      }
    }
  }, [config]);

  const validateRate = (val: string, fieldName: string): string | undefined => {
    if (val === '' || isNaN(Number(val))) {
      return `${fieldName} rate is required and must be a valid number.`;
    }
    const num = Number(val);
    if (num < 0 || num > 100) {
      return `${fieldName} rate must be between 0% and 100%.`;
    }
    // Check max 2 decimal places
    const parts = val.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      return `${fieldName} rate can have at most 2 decimal places.`;
    }
    return undefined;
  };

  const handleOnlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOnlineRate(val);
    const err = validateRate(val, 'Online');
    setErrors((prev) => ({ ...prev, online: err }));
  };

  const handleOfflineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOfflineRate(val);
    const err = validateRate(val, 'Offline');
    setErrors((prev) => ({ ...prev, offline: err }));
  };

  const onlineNum = Number(onlineRate) || 0;
  const offlineNum = Number(offlineRate) || 0;
  const hasErrors = Boolean(errors.online || errors.offline);

  // Check if modified compared to current config
  const isDirty =
    config !== null &&
    (onlineNum !== config.onlineCommissionRate ||
      offlineNum !== config.offlineCommissionRate ||
      note.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const onlineErr = validateRate(onlineRate, 'Online');
    const offlineErr = validateRate(offlineRate, 'Offline');

    if (onlineErr || offlineErr) {
      setErrors({ online: onlineErr, offline: offlineErr });
      return;
    }

    await onSave({
      onlineCommissionRate: onlineNum,
      offlineCommissionRate: offlineNum,
      note: note.trim() || undefined,
    });
    setNote('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
            <i className="fas fa-percent"></i>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Consultation Commission Rates</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set the platform commission percentage retained from each completed doctor appointment.
            </p>
          </div>
        </div>

        {config && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">Active Rates:</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Online: {config.onlineCommissionRate}%
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Offline: {config.offlineCommissionRate}%
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <i className="fas fa-spinner fa-spin text-2xl text-indigo-600"></i>
            <span className="text-xs font-medium">Loading commission rates...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Online Commission Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="onlineRate" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fas fa-video text-blue-600 text-xs"></i>
                    <span>Online Consultation Commission (%)</span>
                  </label>
                  <span className="text-xs text-slate-400 font-mono">0.00 – 100.00%</span>
                </div>

                <div className="relative">
                  <input
                    id="onlineRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={onlineRate}
                    onChange={handleOnlineChange}
                    disabled={isSaving}
                    className={`w-full pl-4 pr-10 py-2.5 text-sm font-semibold rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      errors.online
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500 bg-red-50/20'
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-white'
                    }`}
                    placeholder="15.0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    %
                  </span>
                </div>

                {errors.online ? (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <i className="fas fa-circle-exclamation text-[10px]"></i>
                    {errors.online}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Applies automatically to Video Call appointments.
                  </p>
                )}
              </div>

              {/* Offline Commission Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="offlineRate" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <i className="fas fa-building text-emerald-600 text-xs"></i>
                    <span>Offline (Clinic) Commission (%)</span>
                  </label>
                  <span className="text-xs text-slate-400 font-mono">0.00 – 100.00%</span>
                </div>

                <div className="relative">
                  <input
                    id="offlineRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={offlineRate}
                    onChange={handleOfflineChange}
                    disabled={isSaving}
                    className={`w-full pl-4 pr-10 py-2.5 text-sm font-semibold rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      errors.offline
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500 bg-red-50/20'
                        : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-white'
                    }`}
                    placeholder="10.0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    %
                  </span>
                </div>

                {errors.offline ? (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <i className="fas fa-circle-exclamation text-[10px]"></i>
                    {errors.offline}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Applies automatically to verified in-person clinic visits.
                  </p>
                )}
              </div>
            </div>

            {/* Live Financial Breakdown Simulator */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-calculator text-indigo-500"></i>
                  Fee Split Simulator (Example: ₹1,000 Consultation)
                </span>
                <span className="text-slate-400 text-[11px]">Live Preview</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <div className="font-semibold text-blue-800 flex items-center justify-between">
                    <span>Online Consultation</span>
                    <span>{onlineNum}% Platform Cut</span>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-2">
                    <span>Platform Commission:</span>
                    <strong className="text-slate-900">₹{((1000 * onlineNum) / 100).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Doctor Net Payout:</span>
                    <strong className="text-emerald-700">₹{(1000 - (1000 * onlineNum) / 100).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <div className="font-semibold text-emerald-800 flex items-center justify-between">
                    <span>Offline Consultation</span>
                    <span>{offlineNum}% Platform Cut</span>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-2">
                    <span>Platform Commission:</span>
                    <strong className="text-slate-900">₹{((1000 * offlineNum) / 100).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Doctor Net Payout:</span>
                    <strong className="text-emerald-700">₹{(1000 - (1000 * offlineNum) / 100).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Log Note */}
            <div className="space-y-1.5">
              <label htmlFor="auditNote" className="text-xs font-semibold text-slate-700">
                Update Reason / Audit Note <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="auditNote"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isSaving}
                placeholder="e.g., Seasonal promotional rate adjustment approved by Management."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400">
                This note will be preserved in the audit log for compliance records.
              </p>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {isDirty ? (
                  <span className="text-amber-600 font-medium">● Unsaved changes detected</span>
                ) : (
                  'All changes are saved.'
                )}
              </span>

              <button
                type="submit"
                disabled={!isDirty || hasErrors || isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin text-xs"></i>
                    <span>Saving Rates...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-check text-xs"></i>
                    <span>Save Commission Rates</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
