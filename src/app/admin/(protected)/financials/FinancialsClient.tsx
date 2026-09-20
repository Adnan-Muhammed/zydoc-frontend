'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchFinancialLedger, settleAdminPayout } from '@/redux/features/admin/adminThunk';
import { LedgerTransaction } from '@/redux/features/admin/adminTypes';
import DataTable, { Column } from '@/components/admin/common/DataTable';
import { toast } from 'react-hot-toast';
import {
  DollarSign,
  Download,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Search,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export default function FinancialsClient() {
  const dispatch = useAppDispatch();
  const {
    ledgerTransactions,
    ledgerTotal,
    ledgerPage,
    ledgerLimit,
    ledgerTotalPages,
    ledgerSummary,
    ledgerLoading,
    settlePayoutLoading,
  } = useAppSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Doctor Bank Details Modal
  const [selectedBankDoctor, setSelectedBankDoctor] = useState<{
    doctorName: string;
    specialty?: string;
    bankDetails?: {
      accountHolderName?: string;
      accountNumber?: string;
      bankName?: string;
      ifscCode?: string;
      upiId?: string;
    } | null;
  } | null>(null);

  // Settlement Confirmation Modal
  const [settleModalTx, setSettleModalTx] = useState<LedgerTransaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Initial and reactive fetch
  useEffect(() => {
    dispatch(
      fetchFinancialLedger({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      })
    );
  }, [dispatch, page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    dispatch(
      fetchFinancialLedger({
        page: 1,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      })
    );
  };

  const handleRefresh = () => {
    dispatch(
      fetchFinancialLedger({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
      })
    );
    toast.success('Financial ledger updated', { duration: 2000 });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Payment reference copied to clipboard');
  };

  const handleSettlePayout = async () => {
    if (!settleModalTx) return;
    try {
      await dispatch(settleAdminPayout(settleModalTx._id)).unwrap();
      toast.success(`Disbursement of ₹${settleModalTx.doctorAmount.toLocaleString()} settled successfully!`);
      setSettleModalTx(null);
    } catch (err: any) {
      toast.error(err || 'Failed to settle payout');
    }
  };

  // ── CSV Export Functionality ───────────────────────────────────────────────
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      toast.loading('Preparing CSV export...', { id: 'csv-export' });

      // Fetch all records matching filter
      const result = await dispatch(
        fetchFinancialLedger({
          page: 1,
          limit: 1000,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery.trim() ? searchQuery.trim() : undefined,
          exportCsv: true,
        })
      ).unwrap();

      const records: LedgerTransaction[] = result?.transactions || ledgerTransactions;

      if (!records || records.length === 0) {
        toast.dismiss('csv-export');
        toast.error('No records available to export');
        setIsExporting(false);
        return;
      }

      // Format CSV Headers
      const headers = [
        'Transaction / Payment ID',
        'Date',
        'Time',
        'Patient Name',
        'Patient Email',
        'Doctor Name',
        'Doctor Specialty',
        'Consultation Type',
        'Gross Amount (INR)',
        'Admin Commission (INR)',
        'Doctor Payout (INR)',
        'Status',
        'Settled Date',
      ];

      // Format Rows
      const rows = records.map((tx) => {
        const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A';
        const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString() : 'N/A';
        const settledDateStr = tx.settledAt ? new Date(tx.settledAt).toLocaleDateString() : 'N/A';

        return [
          `"${tx.paymentId || tx._id}"`,
          `"${dateStr}"`,
          `"${timeStr}"`,
          `"${(tx.patient?.name || 'N/A').replace(/"/g, '""')}"`,
          `"${(tx.patient?.email || 'N/A').replace(/"/g, '""')}"`,
          `"${(tx.doctor?.name || 'N/A').replace(/"/g, '""')}"`,
          `"${(tx.doctor?.specialty || 'General').replace(/"/g, '""')}"`,
          `"${tx.appointment?.type || 'Online'}"`,
          `"${tx.amount || 0}"`,
          `"${tx.adminCommission || 0}"`,
          `"${tx.doctorAmount || 0}"`,
          `"${tx.status.toUpperCase()}"`,
          `"${settledDateStr}"`,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_ledger_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss('csv-export');
      toast.success(`Exported ${records.length} financial records successfully!`);
    } catch (err: any) {
      toast.dismiss('csv-export');
      toast.error('Failed to export CSV: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  // ── DataTable Columns ──────────────────────────────────────────────────────
  const columns: Column<LedgerTransaction>[] = useMemo(
    () => [
      {
        key: 'reference',
        header: 'Ref / Timestamp',
        render: (tx) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800">
              <span className="truncate max-w-[140px]">{tx.paymentId || tx._id}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(tx.paymentId || tx._id, tx._id);
                }}
                className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                title="Copy reference ID"
              >
                {copiedId === tx._id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              {tx.createdAt ? new Date(tx.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'N/A'}
            </span>
          </div>
        ),
      },
      {
        key: 'patient',
        header: 'Patient',
        render: (tx) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">{tx.patient?.name || 'Anonymous Patient'}</span>
            <span className="text-xs text-slate-400 truncate max-w-[180px]">{tx.patient?.email || 'N/A'}</span>
          </div>
        ),
      },
      {
        key: 'doctor',
        header: 'Doctor / Specialty',
        render: (tx) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">{tx.doctor?.name || 'Assigned Doctor'}</span>
              {tx.doctor?.bankDetails && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedBankDoctor({
                      doctorName: tx.doctor.name,
                      specialty: tx.doctor.specialty,
                      bankDetails: tx.doctor.bankDetails,
                    })
                  }
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                  title="View Bank Settlement Details"
                >
                  <Building2 className="w-2.5 h-2.5" />
                  Bank
                </button>
              )}
            </div>
            <span className="text-xs text-slate-500">{tx.doctor?.specialty || 'General Practitioner'}</span>
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'Gross Fee',
        align: 'right',
        render: (tx) => (
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900">₹{(tx.amount || 0).toLocaleString()}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {tx.appointment?.type || 'Online'}
            </span>
          </div>
        ),
      },
      {
        key: 'adminCommission',
        header: 'Commission',
        align: 'right',
        render: (tx) => (
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-emerald-600">+₹{(tx.adminCommission || 0).toLocaleString()}</span>
            <span className="text-[10px] text-emerald-500 font-medium">Platform</span>
          </div>
        ),
      },
      {
        key: 'doctorAmount',
        header: 'Doctor Payout',
        align: 'right',
        render: (tx) => (
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-indigo-600">₹{(tx.doctorAmount || 0).toLocaleString()}</span>
            <span className="text-[10px] text-indigo-400 font-medium">Net Due</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        render: (tx) => {
          const s = tx.status?.toLowerCase();
          if (s === 'settled') {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Settled
              </span>
            );
          }
          if (s === 'pending' || s === 'completed') {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                <Clock className="w-3 h-3 text-amber-600" />
                Pending Payout
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-full">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              {tx.status}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'Action',
        align: 'right',
        render: (tx) => {
          const isSettled = tx.status?.toLowerCase() === 'settled';
          if (isSettled) {
            return (
              <span className="text-[11px] font-medium text-slate-400">
                {tx.settledAt
                  ? `Settled on ${new Date(tx.settledAt).toLocaleDateString()}`
                  : 'Settled'}
              </span>
            );
          }
          return (
            <button
              type="button"
              onClick={() => setSettleModalTx(tx)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Settle
            </button>
          );
        },
      },
    ],
    [copiedId]
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Financial Ledger & Doctor Settlements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete transaction ledger of consultation revenues, platform commissions, and doctor payout disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={ledgerLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${ledgerLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || ledgerLoading || ledgerTransactions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* ── Metric Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Volume */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Volume</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(ledgerSummary?.totalVolume || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Total consultation revenue</p>
        </div>

        {/* Platform Commission */}
        <div className="p-4 bg-white border border-emerald-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Commission</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-600">
              ₹{(ledgerSummary?.totalAdminCommission || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-emerald-600/80 mt-1">Platform earned revenues</p>
        </div>

        {/* Doctor Payouts */}
        <div className="p-4 bg-white border border-indigo-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Doctor Payouts</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-indigo-600">
              ₹{(ledgerSummary?.totalDoctorPayouts || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-indigo-500 mt-1">Doctor earnings generated</p>
        </div>

        {/* Settled Count */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {ledgerSummary?.settledCount || 0}
            </span>
            <span className="text-xs text-slate-400">records</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Disbursements completed</p>
        </div>

        {/* Pending Payouts */}
        <div className="p-4 bg-white border border-amber-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Payouts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-600">
              {ledgerSummary?.pendingCount || 0}
            </span>
            <span className="text-xs text-amber-500">pending</span>
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Awaiting disbursement</p>
        </div>
      </div>

      {/* ── Toolbar: Filters & Search ──────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'pending', label: 'Pending Payout' },
            { id: 'settled', label: 'Settled' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, doctor, patient..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  dispatch(
                    fetchFinancialLedger({
                      page: 1,
                      limit: 20,
                      status: statusFilter === 'all' ? undefined : statusFilter,
                    })
                  );
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Transaction Ledger Table ───────────────────────────────────────── */}
      <DataTable<LedgerTransaction>
        columns={columns}
        data={ledgerTransactions}
        keyExtractor={(item) => item._id}
        isLoading={ledgerLoading}
        skeletonRows={7}
        emptyState={{
          title: 'No financial records found',
          subtitle:
            statusFilter !== 'all' || searchQuery
              ? 'No transactions match the selected filter or search query.'
              : 'Consultation payments and fee splits will appear here once booked.',
          icon: 'fas fa-receipt',
        }}
        pagination={{
          currentPage: ledgerPage,
          totalPages: ledgerTotalPages,
          totalItems: ledgerTotal,
          itemsPerPage: ledgerLimit,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* ── Doctor Bank Details Modal ──────────────────────────────────────── */}
      {selectedBankDoctor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <Building2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Doctor Bank Account Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBankDoctor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-slate-400 font-medium">Doctor</p>
                <p className="text-sm font-semibold text-slate-900">{selectedBankDoctor.doctorName}</p>
                <p className="text-xs text-slate-500">{selectedBankDoctor.specialty}</p>
              </div>

              {selectedBankDoctor.bankDetails ? (
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Holder:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedBankDoctor.bankDetails.accountHolderName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedBankDoctor.bankDetails.bankName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedBankDoctor.bankDetails.accountNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IFSC Code:</span>
                    <span className="font-mono font-semibold text-indigo-600">
                      {selectedBankDoctor.bankDetails.ifscCode || 'N/A'}
                    </span>
                  </div>
                  {selectedBankDoctor.bankDetails.upiId && (
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">UPI ID:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedBankDoctor.bankDetails.upiId}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                  No bank details configured for this doctor profile.
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBankDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settle Disbursement Modal ──────────────────────────────────────── */}
      {settleModalTx && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Doctor Payout Settlement</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mark this payout as disbursed and finalized.</p>
              </div>
            </div>

            <div className="mt-5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Reference:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {settleModalTx.paymentId || settleModalTx._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor Name:</span>
                <span className="font-semibold text-slate-800">{settleModalTx.doctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Consultation Fee:</span>
                <span className="font-semibold text-slate-800">₹{(settleModalTx.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Platform Commission Retained:</span>
                <span className="font-semibold text-emerald-600">
                  ₹{(settleModalTx.adminCommission || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">Net Due Disbursement:</span>
                <span className="font-bold text-indigo-600">
                  ₹{(settleModalTx.doctorAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={settlePayoutLoading}
                onClick={() => setSettleModalTx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={settlePayoutLoading}
                onClick={handleSettlePayout}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {settlePayoutLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Settling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm & Settle Payout
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
