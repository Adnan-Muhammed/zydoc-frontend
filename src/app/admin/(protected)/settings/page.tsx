// src/app/admin/(protected)/settings/page.tsx
'use client';

import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchCommissionConfig,
  updateCommissionConfig,
} from '@/redux/features/admin/adminThunk';
import CommissionSettingsForm from '@/components/admin/settings/CommissionSettingsForm';
import CommissionChangeHistory from '@/components/admin/settings/CommissionChangeHistory';

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const {
    commissionConfig,
    commissionLoading,
    commissionSaving,
    error,
  } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchCommissionConfig());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCommissionConfig());
  };

  const handleSaveCommission = async (data: {
    onlineCommissionRate: number;
    offlineCommissionRate: number;
    note?: string;
  }) => {
    try {
      await dispatch(updateCommissionConfig(data)).unwrap();
      toast.success('Commission rates updated successfully!');
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to save commission rates.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System & Commission Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure platform commission splits for Online and Offline consultations, and review the audit trail.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={commissionLoading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors disabled:opacity-50"
        >
          <i className={`fas fa-arrows-rotate text-xs ${commissionLoading ? 'fa-spin' : ''}`}></i>
          <span>Refresh Settings</span>
        </button>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-sm text-red-700">
          <div className="flex items-center gap-2">
            <i className="fas fa-circle-exclamation text-red-500"></i>
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Commission Form */}
      <CommissionSettingsForm
        config={commissionConfig}
        isLoading={commissionLoading}
        isSaving={commissionSaving}
        onSave={handleSaveCommission}
      />

      {/* Commission Audit Trail / Change History */}
      <CommissionChangeHistory
        history={commissionConfig?.changeHistory || []}
        isLoading={commissionLoading}
      />
    </div>
  );
}
