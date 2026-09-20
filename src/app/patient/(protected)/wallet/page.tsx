'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchWalletDetails } from '@/redux/features/wallet/walletThunk';

export default function PatientWalletPage() {
  const dispatch = useAppDispatch();
  const { balance, transactions, total, page, totalPages, loading, error } = useAppSelector(
    (state) => state.wallet
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchWalletDetails({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handleRefresh = () => {
    dispatch(fetchWalletDetails({ page: currentPage, limit: 10 }));
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'DOCTOR_MISSED':
        return {
          label: 'Doctor Missed Session',
          className: 'bg-rose-50 text-rose-700 border border-rose-200',
          icon: 'fas fa-user-xmark',
        };
      case 'OFFLINE_DISPUTE':
        return {
          label: 'Offline Dispute Refund',
          className: 'bg-purple-50 text-purple-700 border border-purple-200',
          icon: 'fas fa-scale-balanced',
        };
      case 'PATIENT_CANCELLATION':
        return {
          label: 'Appointment Cancellation',
          className: 'bg-blue-50 text-blue-700 border border-blue-200',
          icon: 'fas fa-calendar-xmark',
        };
      case 'BOOKING_PAYMENT':
        return {
          label: 'Booking Payment',
          className: 'bg-slate-100 text-slate-700 border border-slate-200',
          icon: 'fas fa-receipt',
        };
      case 'MANUAL_REFUND':
        return {
          label: 'Manual Refund',
          className: 'bg-teal-50 text-teal-700 border border-teal-200',
          icon: 'fas fa-hand-holding-dollar',
        };
      default:
        return {
          label: source.replace(/_/g, ' '),
          className: 'bg-slate-50 text-slate-600 border border-slate-200',
          icon: 'fas fa-circle-info',
        };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base shadow-sm">
              <i className="fas fa-wallet" />
            </span>
            My Wallet & Refunds
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account credits, view automatic refunds, and track booking deductions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            <i className={`fas fa-rotate ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/patient/find-doctor"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm shadow-emerald-200 flex items-center gap-1.5"
          >
            <i className="fas fa-plus" />
            Book with Wallet
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm flex items-center gap-3">
          <i className="fas fa-circle-exclamation text-red-500 text-base" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Banner & Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Balance Card */}
        <div className="md:col-span-1 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 shadow-xl shadow-emerald-900/10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-28 h-28 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-emerald-100/90 text-xs font-semibold tracking-wider uppercase">
              <span>Available Balance</span>
              <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-white">
                <i className="fas fa-coins text-xs" />
              </span>
            </div>
            <div className="mt-3 text-4xl font-extrabold tracking-tight">
              ₹{Number(balance || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-500/40 text-xs text-emerald-100/80 flex items-center gap-2">
            <i className="fas fa-shield-check text-emerald-300" />
            <span>Usable 100% on any doctor booking</span>
          </div>
        </div>

        {/* Informational Banner Card */}
        <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <i className="fas fa-circle-info" />
              <span>How Patient Wallet Works</span>
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Instant Automatic Refunds & Hassle-Free Bookings
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              If a doctor misses a video call session, or if you cancel an appointment with more than 24 hours notice, 100% of your consultation fee is immediately credited to your wallet. You can apply your balance with one click during future checkouts or combine it with online payment.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-[10px]">
                <i className="fas fa-bolt" />
              </span>
              <span>Zero Refund Delay</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">
                <i className="fas fa-code-merge" />
              </span>
              <span>Split Online Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px]">
                <i className="fas fa-infinity" />
              </span>
              <span>Never Expiring Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-list-check text-indigo-600 text-sm" />
              Transaction Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete audit history of credits, refunds, and consultation payments.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
            Total Transactions: {total}
          </span>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Date & Time</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Source / Reason</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <i className="fas fa-spinner fa-spin text-lg text-emerald-600 mr-2" />
                    Loading transaction ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2 text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                        <i className="fas fa-wallet" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No Transactions Yet</p>
                      <p className="text-xs">
                        When you book appointments using wallet or receive refunds, they will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  const sourceMeta = getSourceLabel(tx.source);

                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>

                      <td className="py-3.5 px-5 max-w-xs">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {tx.description || 'Wallet transaction'}
                        </p>
                        {tx.appointmentId && typeof tx.appointmentId === 'object' && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Slot: {tx.appointmentId.appointmentDate ? new Date(tx.appointmentId.appointmentDate).toDateString() : ''}{' '}
                            {tx.appointmentId.appointmentTime || ''}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${sourceMeta.className}`}
                        >
                          <i className={`${sourceMeta.icon} text-[10px]`} />
                          {sourceMeta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {isCredit ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <i className="fas fa-arrow-down text-[9px]" />
                            CREDIT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-800">
                            <i className="fas fa-arrow-up text-[9px]" />
                            DEBIT
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span
                          className={`font-extrabold text-sm ${
                            isCredit ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
            <span className="font-medium text-slate-500">
              Page {page} of {totalPages} ({total} items)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
