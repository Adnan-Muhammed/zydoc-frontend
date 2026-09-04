'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAdminTransactions, settleTransaction } from '@/redux/features/admin/adminThunk';
import { clearAdminError } from '@/redux/features/admin/adminSlice';
import { 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  X, 
  DollarSign, 
  ShieldAlert, 
  ExternalLink,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Transaction, TransactionStatus, BankDetails } from '@/types';
import { toast } from 'react-hot-toast';

export default function TransactionsClient() {
  const dispatch = useAppDispatch();
  const { 
    transactions, 
    transactionsPagination, 
    isLoading, 
    isSettlingPayout, 
    error 
  } = useAppSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [selectedBankDoctor, setSelectedBankDoctor] = useState<{
    doctorName: string;
    specialty?: string;
    bankDetails?: BankDetails;
  } | null>(null);

  const [settleTargetTx, setSettleTargetTx] = useState<Transaction | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdminTransactions({ page, limit }));
  }, [dispatch, page]);

  const handleRefresh = () => {
    dispatch(fetchAdminTransactions({ page, limit }));
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmSettle = async () => {
    if (!settleTargetTx) return;
    try {
      await dispatch(settleTransaction(settleTargetTx._id)).unwrap();
      toast.success(`Payout of ₹${settleTargetTx.doctorAmount.toLocaleString()} marked as settled!`);
      setSettleTargetTx(null);
      // Refresh to ensure updated state
      dispatch(fetchAdminTransactions({ page, limit }));
    } catch (err: any) {
      toast.error(err || 'Failed to settle payout');
    }
  };

  // Compute stats across current dataset / pagination
  const stats = useMemo(() => {
    let grossVolume = 0;
    let totalCommission = 0;
    let pendingPayouts = 0;
    let settledPayouts = 0;
    let pendingCount = 0;
    let settledCount = 0;

    transactions.forEach((tx) => {
      grossVolume += tx.amount || 0;
      totalCommission += tx.adminCommission || 0;
      if (tx.status === 'completed') {
        pendingPayouts += tx.doctorAmount || 0;
        pendingCount += 1;
      } else if (tx.status === 'settled') {
        settledPayouts += tx.doctorAmount || 0;
        settledCount += 1;
      }
    });

    return {
      grossVolume,
      totalCommission,
      pendingPayouts,
      settledPayouts,
      pendingCount,
      settledCount,
    };
  }, [transactions]);

  // Filtered transactions for search & status tabs
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Status filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const doc = typeof tx.doctorId === 'object' ? tx.doctorId : null;
        const docName = doc ? `${doc.firstName || ''} ${doc.lastName || ''}`.toLowerCase() : '';
        const pat = typeof tx.patientId === 'object' ? tx.patientId : null;
        const patProfile = pat?.profileId;
        const patName = patProfile 
          ? `${patProfile.firstName || ''} ${patProfile.lastName || ''}`.toLowerCase() 
          : (pat?.googleName || pat?.email || '').toLowerCase();
        const txId = (tx._id || '').toLowerCase();
        const paymentId = (tx.paymentId || '').toLowerCase();

        return (
          docName.includes(query) ||
          patName.includes(query) ||
          txId.includes(query) ||
          paymentId.includes(query)
        );
      }

      return true;
    });
  }, [transactions, statusFilter, searchQuery]);

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
            Pending Settlement
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Booking Paid
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
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Transactions & Doctor Payouts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage platform commissions, view consultation payments, and execute doctor payout settlements.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Transactions</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => dispatch(clearAdminError())}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Platform Commission */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Revenue</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(stats.totalCommission)}
              </div>
              <p className="text-xs text-indigo-600 font-medium mt-1">
                Accumulated commission fees
              </p>
            </div>
          </div>

          {/* Card 2: Pending Doctor Payouts */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden bg-gradient-to-b from-amber-50/20 to-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Payouts</span>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl border border-amber-200">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-amber-950 tracking-tight">
                {formatCurrency(stats.pendingPayouts)}
              </div>
              <p className="text-xs text-amber-700 font-medium mt-1">
                {stats.pendingCount} completed call(s) to settle
              </p>
            </div>
          </div>

          {/* Card 3: Settled Payouts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Settled Payouts</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(stats.settledPayouts)}
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                {stats.settledCount} payout(s) paid to doctors
              </p>
            </div>
          </div>

          {/* Card 4: Gross Transaction Volume */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Volume</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(stats.grossVolume)}
              </div>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Total patient fees collected
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor, patient, ID..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'completed', label: 'Pending Payout' },
              { id: 'settled', label: 'Settled' },
              { id: 'pending', label: 'Booking' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Date & Ref</th>
                  <th className="py-3.5 px-5">Doctor & Bank Details</th>
                  <th className="py-3.5 px-5">Patient</th>
                  <th className="py-3.5 px-5 text-right">Total Fee</th>
                  <th className="py-3.5 px-5 text-right">Commission</th>
                  <th className="py-3.5 px-5 text-right font-bold text-slate-800">Doctor Share</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
                        <span className="text-xs font-medium">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">No Transactions Found</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {searchQuery || statusFilter !== 'all' 
                              ? 'No transactions matched your search or filter criteria.' 
                              : 'Appointment transactions will appear here once booked by patients.'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx: Transaction) => {
                    const docObj = tx.doctorId;
                    const isDocPopulated = typeof docObj === 'object' && docObj !== null;
                    const docName = isDocPopulated 
                      ? `Dr. ${docObj.firstName || ''} ${docObj.lastName || ''}`.trim()
                      : 'Doctor';
                    const docSpecialty = isDocPopulated ? docObj.specialty : '';
                    const docBank = isDocPopulated ? docObj.bankDetails : null;

                    const patObj = tx.patientId;
                    const patProfile = typeof patObj === 'object' ? patObj?.profileId : null;
                    const patName = patProfile?.firstName 
                      ? `${patProfile.firstName} ${patProfile.lastName || ''}`.trim()
                      : (typeof patObj === 'object' ? patObj?.googleName || patObj?.email : 'Patient');
                    const patEmail = typeof patObj === 'object' ? patObj?.email : '';

                    const isSettled = tx.status === 'settled';
                    const isReadyToSettle = tx.status === 'completed';

                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Date & Ref */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-800 text-xs">{formatDate(tx.createdAt)}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5" title={`Payment ID: ${tx.paymentId}`}>
                            {tx.paymentId ? `ID: ${tx.paymentId.slice(-10)}` : `Tx: ${tx._id.slice(-6)}`}
                          </div>
                        </td>

                        {/* Doctor & Bank Details */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                              {docName.replace('Dr. ', '').charAt(0) || 'D'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                                <span>{docName}</span>
                              </div>
                              {docSpecialty && (
                                <div className="text-[11px] text-slate-400">{docSpecialty}</div>
                              )}
                              
                              {/* Bank Details Trigger */}
                              <button
                                onClick={() => setSelectedBankDoctor({
                                  doctorName: docName,
                                  specialty: docSpecialty,
                                  bankDetails: docBank,
                                })}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline mt-0.5 cursor-pointer"
                              >
                                <Building2 className="w-3 h-3" />
                                <span>{docBank?.accountNumber ? 'View Bank Details' : 'Bank Info'}</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-800 text-xs">{patName}</div>
                          {patEmail && <div className="text-[11px] text-slate-400">{patEmail}</div>}
                        </td>

                        {/* Total Fee */}
                        <td className="py-4 px-5 text-right font-medium text-slate-700 text-xs">
                          {formatCurrency(tx.amount)}
                        </td>

                        {/* Commission */}
                        <td className="py-4 px-5 text-right font-semibold text-indigo-600 text-xs">
                          +{formatCurrency(tx.adminCommission)}
                        </td>

                        {/* Doctor Share */}
                        <td className="py-4 px-5 text-right font-bold text-slate-900 text-xs">
                          {formatCurrency(tx.doctorAmount)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5 text-center">
                          {getStatusBadge(tx.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          {isReadyToSettle ? (
                            <button
                              onClick={() => setSettleTargetTx(tx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark as Settled</span>
                            </button>
                          ) : isSettled ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              Payout Complete
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Awaiting Call
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {transactionsPagination && transactionsPagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
              <div>
                Showing Page <span className="font-bold text-slate-700">{transactionsPagination.page}</span> of{' '}
                <span className="font-bold text-slate-700">{transactionsPagination.totalPages}</span> ({transactionsPagination.total} total transactions)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={transactionsPagination.page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(transactionsPagination.totalPages, p + 1))}
                  disabled={transactionsPagination.page >= transactionsPagination.totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Doctor Bank Details Modal */}
      {selectedBankDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Doctor Bank Details</h3>
                  <p className="text-xs text-slate-500">{selectedBankDoctor.doctorName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBankDoctor(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {selectedBankDoctor.bankDetails && selectedBankDoctor.bankDetails.accountNumber ? (
                <div className="space-y-3">
                  {/* Account Holder */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Holder</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedBankDoctor.bankDetails.accountHolderName || selectedBankDoctor.doctorName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedBankDoctor.bankDetails?.accountHolderName || selectedBankDoctor.doctorName, 'Account Holder')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer"
                      title="Copy"
                    >
                      {copiedField === 'Account Holder' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Bank Name */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bank Name</span>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBankDoctor.bankDetails.bankName}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedBankDoctor.bankDetails?.bankName || '', 'Bank Name')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer"
                      title="Copy"
                    >
                      {copiedField === 'Bank Name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Number</span>
                      <p className="text-base font-mono font-bold text-slate-900 mt-0.5 tracking-wider">
                        {selectedBankDoctor.bankDetails.accountNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedBankDoctor.bankDetails?.accountNumber || '', 'Account Number')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer"
                      title="Copy"
                    >
                      {copiedField === 'Account Number' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* IFSC Code */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IFSC Code</span>
                      <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                        {selectedBankDoctor.bankDetails.ifscCode}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedBankDoctor.bankDetails?.ifscCode || '', 'IFSC Code')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer"
                      title="Copy"
                    >
                      {copiedField === 'IFSC Code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 italic mt-2">
                    Use these credentials in your corporate banking system to initiate the NEFT/IMPS payout transfer.
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">No Bank Details Provided</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      This doctor has not yet configured their bank details in their Settings dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBankDoctor(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Confirm Payout Settlement */}
      {settleTargetTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Confirm Payout Settlement</h3>
                  <p className="text-xs text-emerald-700 font-medium">Mark consultation payment as settled</p>
                </div>
              </div>
              <button
                onClick={() => setSettleTargetTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor Name:</span>
                  <span className="font-bold text-slate-800">
                    {typeof settleTargetTx.doctorId === 'object' && settleTargetTx.doctorId
                      ? `Dr. ${settleTargetTx.doctorId.firstName || ''} ${settleTargetTx.doctorId.lastName || ''}`.trim()
                      : 'Doctor'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Patient Fee:</span>
                  <span className="font-medium text-slate-700">{formatCurrency(settleTargetTx.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform Commission (15%):</span>
                  <span className="font-medium text-indigo-600">+{formatCurrency(settleTargetTx.adminCommission)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                  <span className="font-bold text-slate-800">Doctor Payout Amount:</span>
                  <span className="font-extrabold text-emerald-600">{formatCurrency(settleTargetTx.doctorAmount)}</span>
                </div>
              </div>

              {/* Target Bank Snapshot */}
              {typeof settleTargetTx.doctorId === 'object' && settleTargetTx.doctorId?.bankDetails?.accountNumber ? (
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Target Account: {settleTargetTx.doctorId.bankDetails.bankName}</span>
                  </div>
                  <div className="text-emerald-800 font-mono">
                    Acc: {settleTargetTx.doctorId.bankDetails.accountNumber} | IFSC: {settleTargetTx.doctorId.bankDetails.ifscCode}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs text-amber-800">
                  ⚠️ Note: The doctor has not registered bank details yet. Confirming will mark this record as settled in the system.
                </div>
              )}

              <p className="text-xs text-slate-500">
                Please confirm that you have initiated or completed the fund transfer of{' '}
                <strong className="text-slate-800">{formatCurrency(settleTargetTx.doctorAmount)}</strong> to the doctor.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSettleTargetTx(null)}
                disabled={isSettlingPayout}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={isSettlingPayout}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSettlingPayout ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Settling Payout...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Settlement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
