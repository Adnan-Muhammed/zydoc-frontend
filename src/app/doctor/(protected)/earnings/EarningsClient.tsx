'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDoctorEarnings, fetchDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  RefreshCw,
  Video, 
  Building2, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Transaction, TransactionStatus } from '@/types';

export default function EarningsClient() {
  const dispatch = useAppDispatch();
  const { 
    earningsSummary, 
    earningsTransactions, 
    earningsPagination, 
    bankDetails, 
    profile, 
    isLoadingEarnings 
  } = useAppSelector((state) => state.doctor);

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchDoctorEarnings({ page, limit }));
    dispatch(fetchDoctorProfile());
  }, [dispatch, page]);

  const handleRefresh = () => {
    dispatch(fetchDoctorEarnings({ page, limit }));
    dispatch(fetchDoctorProfile());
  };

  // Check if bank details are configured
  const currentBank = bankDetails || profile?.bankDetails;
  const isBankConfigured = Boolean(
    currentBank && 
    currentBank.accountNumber && 
    currentBank.ifscCode && 
    currentBank.bankName
  );

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Settled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Payout
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Booked (Pending Call)
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Earnings & Payouts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your consultation earnings, completed appointments, and manual payout settlements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoadingEarnings}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEarnings ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/doctor/profile/edit2?section=bank"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bank Settings</span>
            </Link>
          </div>
        </div>

        {/* Warning Banner: Missing Bank Details */}
        {!isBankConfigured && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-5 rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-950">Payout Account Setup Required</h2>
                <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl">
                  You haven&apos;t added your bank account details yet. Please configure your bank account in Profile Settings so the admin team can transfer your consultation earnings.
                </p>
              </div>
            </div>
            <Link
              href="/doctor/profile/edit2?section=bank"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <span>Add Bank Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Pending Payouts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payouts</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(earningsSummary?.pendingEarnings || 0)}
              </div>
              <p className="text-xs text-amber-700 font-medium mt-1.5 flex items-center gap-1">
                <span>{earningsSummary?.pendingCount || 0} completed consultation(s) ready for payout</span>
              </p>
            </div>
          </div>

          {/* Card 2: Settled Earnings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Settled</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(earningsSummary?.settledEarnings || 0)}
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                <span>{earningsSummary?.settledCount || 0} payout(s) transferred to your bank</span>
              </p>
            </div>
          </div>

          {/* Card 3: Total Lifetime Earnings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Earnings</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(earningsSummary?.totalEarnings || 0)}
              </div>
              <p className="text-xs text-blue-700 font-medium mt-1.5 flex items-center gap-1">
                <span>Lifetime net consultation income</span>
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-800">Consultation Earnings History</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of patient fees, platform commission, and payout settlement status.
              </p>
            </div>
            {isBankConfigured && currentBank && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Payout Account: <strong className="text-slate-800 font-medium">{currentBank.bankName}</strong> (••••{currentBank.accountNumber.slice(-4)})</span>
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Date & Slot</th>
                  <th className="py-3 px-5">Patient</th>
                  <th className="py-3 px-5">Consultation Type</th>
                  <th className="py-3 px-5 text-right">Patient Fee</th>
                  <th className="py-3 px-5 text-right">Commission</th>
                  <th className="py-3 px-5 text-right font-bold text-slate-800">Your Share</th>
                  <th className="py-3 px-5 text-center">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingEarnings ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-xs font-medium">Loading earnings records...</span>
                      </div>
                    </td>
                  </tr>
                ) : earningsTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">No Transactions Found</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Your earnings from completed video and physical consultations will be recorded here automatically.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  earningsTransactions.map((tx: Transaction) => {
                    const patientObj = tx.patientId;
                    const patientProfile = typeof patientObj === 'object' ? patientObj?.profileId : null;
                    const patientName = patientProfile?.firstName 
                      ? `${patientProfile.firstName} ${patientProfile.lastName || ''}`.trim()
                      : (typeof patientObj === 'object' ? patientObj?.googleName || patientObj?.email : 'Patient');

                    const apptObj = tx.appointmentId;
                    const apptDate = typeof apptObj === 'object' ? apptObj?.appointmentDate : tx.createdAt;
                    const apptTime = typeof apptObj === 'object' ? apptObj?.appointmentTime : '';
                    const visitType = typeof apptObj === 'object' ? apptObj?.consultationType : 'video';

                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Date */}
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-800 text-xs">{formatDate(apptDate)}</div>
                          {apptTime && <div className="text-[11px] text-slate-400 mt-0.5">{apptTime}</div>}
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {patientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-xs">{patientName}</div>
                              {typeof patientObj === 'object' && patientObj?.email && (
                                <div className="text-[11px] text-slate-400">{patientObj.email}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-5">
                          {['video', 'online'].includes(visitType?.toLowerCase()) ? (
                            <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium border border-indigo-100">
                              <Video className="w-3 h-3" />
                              Video Call
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-medium border border-teal-100">
                              <Building2 className="w-3 h-3" />
                              In-Person
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-5 text-right font-medium text-slate-600 text-xs">
                          {formatCurrency(tx.amount)}
                        </td>

                        {/* Commission */}
                        <td className="py-3.5 px-5 text-right font-medium text-slate-400 text-xs">
                          -{formatCurrency(tx.adminCommission)}
                        </td>

                        {/* Doctor Share */}
                        <td className="py-3.5 px-5 text-right font-bold text-slate-900 text-xs">
                          {formatCurrency(tx.doctorAmount)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5 text-center">
                          {getStatusBadge(tx.status)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {earningsPagination && earningsPagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
              <div>
                Showing Page <span className="font-bold text-slate-700">{earningsPagination.page}</span> of{' '}
                <span className="font-bold text-slate-700">{earningsPagination.totalPages}</span> ({earningsPagination.total} total)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={earningsPagination.page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(earningsPagination.totalPages, p + 1))}
                  disabled={earningsPagination.page >= earningsPagination.totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
