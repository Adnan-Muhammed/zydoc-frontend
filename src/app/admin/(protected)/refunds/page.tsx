// src/app/admin/(protected)/refunds/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchPendingRefunds,
  approveRefund,
  rejectRefund,
} from '@/redux/features/admin/adminThunk';
import { RefundTicket } from '@/redux/features/admin/adminTypes';
import PendingRefundsTable from '@/components/admin/refunds/PendingRefundsTable';
import RefundDetailsModal from '@/components/admin/refunds/RefundDetailsModal';
import RefundRejectionModal from '@/components/admin/refunds/RefundRejectionModal';

export default function AdminRefundRequestsPage() {
  const dispatch = useAppDispatch();
  const {
    pendingRefunds,
    pendingRefundsTotal,
    pendingRefundsLoading,
    refundActionLoading,
    error,
  } = useAppSelector((state) => state.admin);

  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<RefundTicket | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedTicketForRejection, setSelectedTicketForRejection] = useState<RefundTicket | null>(null);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);

  // Load pending refunds on mount
  useEffect(() => {
    dispatch(fetchPendingRefunds());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPendingRefunds());
  };

  const handleViewDetails = (ticket: RefundTicket) => {
    setSelectedTicketForDetails(ticket);
    setIsDetailsOpen(true);
  };

  const handleApprove = async (ticket: RefundTicket) => {
    const fee = ticket.appointmentId?.fee || ticket.refundAmount || 0;
    const patientName = ticket.patientId?.profileId?.firstName || 'Patient';

    try {
      await dispatch(approveRefund({ refundId: ticket._id })).unwrap();
      toast.success(`Refund of ₹${fee} approved! Credited to ${patientName}'s wallet.`);
      if (selectedTicketForDetails?._id === ticket._id) {
        setIsDetailsOpen(false);
      }
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to approve refund.');
    }
  };

  const handleInitiateReject = (ticket: RefundTicket) => {
    setSelectedTicketForRejection(ticket);
    setIsRejectionOpen(true);
  };

  const handleConfirmReject = async (ticketId: string, adminNote: string) => {
    try {
      await dispatch(rejectRefund({ refundId: ticketId, adminNote })).unwrap();
      toast.success('Refund request has been rejected.');
      setIsRejectionOpen(false);
      if (selectedTicketForDetails?._id === ticketId) {
        setIsDetailsOpen(false);
      }
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : 'Failed to reject refund.');
    }
  };

  // Calculate total pending claim amount
  const totalClaimAmount = useMemo(() => {
    return pendingRefunds.reduce((acc, t) => {
      const amt = t.appointmentId?.fee || t.refundAmount || 0;
      return acc + Number(amt);
    }, 0);
  }, [pendingRefunds]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Refund Approval Queue
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingRefundsLoading ? '...' : `${pendingRefundsTotal} Pending`}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review offline appointment patient disputes, verify doctor attendance, and approve atomic wallet refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={pendingRefundsLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <i className={`fas fa-arrows-rotate text-xs ${pendingRefundsLoading ? 'fa-spin' : ''}`}></i>
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fas fa-hand-holding-dollar"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {pendingRefundsLoading ? '—' : pendingRefundsTotal}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Unresolved Dispute Claims
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fas fa-indian-rupee-sign"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{pendingRefundsLoading ? '—' : totalClaimAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Total Disputed Value
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fas fa-wallet"></i>
          </div>
          <div>
            <div className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Instant Wallet Credit
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Atomic MongoDB Transactions
            </div>
          </div>
        </div>
      </div>

      {/* Pending Refunds Table */}
      <PendingRefundsTable
        tickets={pendingRefunds}
        isLoading={pendingRefundsLoading}
        error={error}
        onViewDetails={handleViewDetails}
        onApprove={handleApprove}
        onReject={handleInitiateReject}
        onRefresh={handleRefresh}
        actionLoading={refundActionLoading}
      />

      {/* Refund Details Modal */}
      <RefundDetailsModal
        ticket={selectedTicketForDetails}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onApprove={handleApprove}
        onReject={handleInitiateReject}
        actionLoading={refundActionLoading}
      />

      {/* Refund Rejection Modal */}
      <RefundRejectionModal
        ticket={selectedTicketForRejection}
        isOpen={isRejectionOpen}
        onClose={() => setIsRejectionOpen(false)}
        onConfirmReject={handleConfirmReject}
        isLoading={refundActionLoading}
      />
    </div>
  );
}
