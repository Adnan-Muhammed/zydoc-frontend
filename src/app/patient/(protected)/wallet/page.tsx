'use client';

// src/app/patient/(protected)/wallet/page.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchWalletDetails } from '@/redux/features/wallet/walletThunk';
import {
  Wallet,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  Zap,
  Infinity,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Info,
  Search,
} from 'lucide-react';

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
        return { label: 'Doctor Missed Session',   className: 'pat-badge', style: { background: '#fff1f2', color: '#9f1239' }, icon: <ArrowDownLeft size={10} /> };
      case 'OFFLINE_DISPUTE':
        return { label: 'Offline Dispute Refund',  className: 'pat-badge', style: { background: '#faf5ff', color: '#6b21a8' }, icon: <ShieldCheck size={10} /> };
      case 'PATIENT_CANCELLATION':
        return { label: 'Appointment Cancelled',   className: 'pat-badge', style: { background: '#eff6ff', color: '#1e40af' }, icon: <ArrowDownLeft size={10} /> };
      case 'BOOKING_PAYMENT':
        return { label: 'Booking Payment',         className: 'pat-badge', style: { background: '#f8fafc', color: '#475569' }, icon: <Receipt size={10} /> };
      case 'MANUAL_REFUND':
        return { label: 'Manual Refund',           className: 'pat-badge', style: { background: '#f0fdf4', color: '#166534' }, icon: <ArrowDownLeft size={10} /> };
      default:
        return { label: source.replace(/_/g, ' '),  className: 'pat-badge', style: { background: '#f8fafc', color: '#64748b' }, icon: <Info size={10} /> };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="pat-page space-y-6">

      {/* Header */}
      <div className="pat-page-header">
        <div>
          <h1>My Wallet &amp; Refunds</h1>
          <p>Manage credits, view automatic refunds, and track booking deductions.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="pat-btn pat-btn-outline pat-btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link href="/patient/find-doctor" className="pat-btn pat-btn-emerald pat-btn-sm">
            <Search size={14} /> Book with Wallet
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="pat-info-box error">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Balance + Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Balance Card */}
        <div className="md:col-span-1 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)', color: 'white', boxShadow: '0 8px 32px rgba(5,150,105,0.35)' }}>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/80 text-xs font-bold tracking-wider uppercase">
              <span>Available Balance</span>
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <Coins size={15} className="text-white" />
              </div>
            </div>
            <div className="mt-3 text-4xl font-extrabold tracking-tight">
              ₹{Number(balance || 0).toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-xs text-white/70">Wallet credits available</div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/20 relative z-10">
            <div className="flex items-center gap-5 text-xs text-white/80">
              <span className="flex items-center gap-1.5"><Zap size={11} /> Instant refunds</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={11} /> 100% secure</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="md:col-span-2 pat-card">
          <div className="pat-card-header">
            <h2>
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Info size={12} />
              </span>
              How Your Wallet Works
            </h2>
          </div>
          <div className="pat-card-body">
            <p className="text-sm text-slate-600 leading-relaxed">
              If a doctor misses a session or you cancel with <strong>24+ hours notice</strong>, 100% of your fee is instantly credited here. Use your balance on future bookings or combine with online payment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              {[
                { icon: <Zap size={15} />, label: 'Zero Refund Delay',    color: 'rose'    },
                { icon: <TrendingUp size={15} />, label: 'Split Payments', color: 'indigo'  },
                { icon: <Infinity size={15} />, label: 'Never Expires',    color: 'emerald' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                  item.color === 'rose'    ? 'bg-rose-50 border-rose-200 text-rose-700'       :
                  item.color === 'indigo'  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'  :
                                             'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.color === 'rose'    ? 'bg-rose-100'    :
                    item.color === 'indigo'  ? 'bg-indigo-100'  :
                                               'bg-emerald-100'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Receipt size={14} />
            </span>
            Transaction Ledger
          </h2>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
            {total} Transactions
          </span>
        </div>

        {/* Desktop Table */}
        <div className="pat-table-wrap hidden sm:block">
          <table className="pat-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Description</th>
                <th>Source / Reason</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading && transactions.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j}><div className="pat-skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-0">
                    <div className="pat-empty">
                      <div className="pat-empty-icon"><Wallet size={28} /></div>
                      <h3>No Transactions Yet</h3>
                      <p>When you book appointments or receive refunds, they will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  const src = getSourceLabel(tx.source);
                  return (
                    <tr key={tx._id}>
                      <td className="font-semibold text-slate-500 whitespace-nowrap text-xs">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td>
                        <p className="font-semibold text-slate-800 text-xs line-clamp-1">{tx.description || 'Wallet transaction'}</p>
                        {tx.appointmentId && typeof tx.appointmentId === 'object' && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {tx.appointmentId.appointmentDate ? new Date(tx.appointmentId.appointmentDate).toDateString() : ''}
                            {' '}{tx.appointmentId.appointmentTime || ''}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className={src.className} style={src.style}>
                          {src.icon} {src.label}
                        </span>
                      </td>
                      <td>
                        {isCredit ? (
                          <span className="pat-badge pat-badge-credit flex items-center gap-1 w-fit">
                            <ArrowDownLeft size={10} /> Credit
                          </span>
                        ) : (
                          <span className="pat-badge pat-badge-debit flex items-center gap-1 w-fit">
                            <ArrowUpRight size={10} /> Debit
                          </span>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <span className={`font-extrabold text-sm ${isCredit ? 'text-emerald-600' : 'text-slate-800'}`}>
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

        {/* Mobile Card List */}
        <div className="sm:hidden divide-y divide-slate-100">
          {loading && transactions.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="pat-skeleton h-4 w-3/4 rounded" />
                <div className="pat-skeleton h-3 w-1/2 rounded" />
                <div className="pat-skeleton h-3 w-1/3 rounded" />
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="pat-empty">
              <div className="pat-empty-icon"><Wallet size={28} /></div>
              <h3>No Transactions Yet</h3>
              <p>Bookings and refunds will appear here.</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              const src = getSourceLabel(tx.source);
              return (
                <div key={tx._id} className="p-4 flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{tx.description || 'Wallet transaction'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                    <span className={src.className} style={{ ...src.style, marginTop: 6, display: 'inline-flex' }}>
                      {src.label}
                    </span>
                  </div>
                  <span className={`font-extrabold text-sm whitespace-nowrap ${isCredit ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {isCredit ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pat-pagination">
            <span>Page {page} of {totalPages} · {total} entries</span>
            <div className="pat-pagination-btns">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="pat-btn pat-btn-outline pat-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="pat-btn pat-btn-outline pat-btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
