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
  CreditCard,
  Sparkles
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
    <div className="doc-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/70 flex items-center justify-center shadow-2xs">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">
                Earnings & Payouts
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12">
              Track your consultation earnings, completed appointments, and bank settlement distributions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto ml-12 md:ml-0">
            <button
              onClick={handleRefresh}
              disabled={isLoadingEarnings}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingEarnings ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/doctor/profile/edit2?section=bank"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#101044] hover:bg-indigo-950 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-98"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Bank Settings</span>
            </Link>
          </div>
        </div>

        {/* Warning Banner: Missing Bank Details */}
        {!isBankConfigured && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-6 rounded-3xl bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200/60 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-amber-950">Payout Account Setup Required</h2>
                <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
                  You haven&apos;t linked your verified bank account yet. Please add your account details so clinical earnings can be settled directly to your bank account.
                </p>
              </div>
            </div>
            <Link
              href="/doctor/profile/edit2?section=bank"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0 active:scale-98"
            >
              <span>Add Bank Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Pending Payouts */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payouts</span>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#101044] tracking-tight">
                {formatCurrency(earningsSummary?.pendingEarnings || 0)}
              </div>
              <p className="text-xs text-amber-700 font-semibold mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>{earningsSummary?.pendingCount || 0} completed consultation(s) ready for payout</span>
              </p>
            </div>
          </div>

          {/* Card 2: Settled Earnings */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Settled</span>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#101044] tracking-tight">
                {formatCurrency(earningsSummary?.settledEarnings || 0)}
              </div>
              <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{earningsSummary?.settledCount || 0} payout(s) transferred to your bank</span>
              </p>
            </div>
          </div>

          {/* Card 3: Total Lifetime Earnings */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#101044] tracking-tight">
                {formatCurrency(earningsSummary?.totalEarnings || 0)}
              </div>
              <p className="text-xs text-blue-700 font-semibold mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Lifetime net consultation earnings</span>
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
            <div>
              <h2 className="text-lg font-bold text-[#101044] tracking-tight">Consultation Settlement History</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of patient fees, platform commission, and disbursement status.
              </p>
            </div>
            {isBankConfigured && currentBank && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl shadow-2xs">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Payout Account: <strong className="text-[#101044] font-semibold">{currentBank.bankName}</strong> (••••{currentBank.accountNumber.slice(-4)})</span>
              </div>
            )}
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6">Date & Slot</th>
                  <th className="py-3.5 px-6">Patient</th>
                  <th className="py-3.5 px-6">Consultation Mode</th>
                  <th className="py-3.5 px-6 text-right">Patient Fee</th>
                  <th className="py-3.5 px-6 text-right">Commission</th>
                  <th className="py-3.5 px-6 text-right font-bold text-[#101044]">Your Share</th>
                  <th className="py-3.5 px-6 text-center">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoadingEarnings ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
                        <span className="text-xs font-medium">Loading settlement transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : earningsTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400">
                          <Wallet className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#101044]">No Transactions Recorded</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Your earnings from completed video and in-person consultations will be tracked here automatically.
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
                    const visitType = typeof apptObj === 'object' ? apptObj?.consultationType : 'online';

                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Date */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#101044] text-xs">{formatDate(apptDate)}</div>
                          {apptTime && <div className="text-[11px] text-slate-400 mt-0.5">{apptTime}</div>}
                        </td>

                        {/* Patient */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                              {patientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#101044] text-xs">{patientName}</div>
                              {typeof patientObj === 'object' && patientObj?.email && (
                                <div className="text-[11px] text-slate-400">{patientObj.email}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-4 px-6">
                          {['video', 'online'].includes(visitType?.toLowerCase()) ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-semibold border border-blue-100">
                              <Video className="w-3.5 h-3.5" />
                              Video Call
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold border border-emerald-100">
                              <Building2 className="w-3.5 h-3.5" />
                              In-Person
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 text-right font-medium text-slate-600 text-xs">
                          {formatCurrency(tx.amount)}
                        </td>

                        {/* Commission */}
                        <td className="py-4 px-6 text-right font-medium text-slate-400 text-xs">
                          -{formatCurrency(tx.adminCommission)}
                        </td>

                        {/* Doctor Share */}
                        <td className="py-4 px-6 text-right font-extrabold text-[#101044] text-xs sm:text-sm">
                          {formatCurrency(tx.doctorAmount)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
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
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
              <div>
                Showing Page <span className="font-bold text-[#101044]">{earningsPagination.page}</span> of{' '}
                <span className="font-bold text-[#101044]">{earningsPagination.totalPages}</span> ({earningsPagination.total} records)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={earningsPagination.page <= 1}
                  className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(earningsPagination.totalPages, p + 1))}
                  disabled={earningsPagination.page >= earningsPagination.totalPages}
                  className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
