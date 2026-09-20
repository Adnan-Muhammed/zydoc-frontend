// src/components/admin/settings/CommissionChangeHistory.tsx
'use client';

import React from 'react';
import { RateChangeHistory } from '@/redux/features/admin/adminTypes';

interface CommissionChangeHistoryProps {
  history: RateChangeHistory[];
  isLoading?: boolean;
}

export default function CommissionChangeHistory({
  history = [],
  isLoading = false,
}: CommissionChangeHistoryProps) {
  const sortedHistory = [...history].reverse(); // newest first

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm">
            <i className="fas fa-clock-rotate-left"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Commission Audit Trail</h3>
            <p className="text-[11px] text-slate-500">
              Immutable historical record of rate revisions and compliance modifications.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {history.length} Revisions
        </span>
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Loading audit trail...
        </div>
      ) : sortedHistory.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-lg">
            <i className="fas fa-inbox"></i>
          </div>
          <p className="text-xs font-semibold text-slate-700">No revisions recorded yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rate updates made via the form above will be logged here automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-4">Online Rate Change</th>
                <th className="py-3 px-4">Offline Rate Change</th>
                <th className="py-3 px-6">Audit Rationale / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedHistory.map((entry, idx) => {
                const onlineChanged = entry.previousOnlineRate !== entry.newOnlineRate;
                const offlineChanged = entry.previousOfflineRate !== entry.newOfflineRate;

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-6 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <i className="far fa-calendar text-slate-400 text-[10px]"></i>
                        <span>{formatDate(entry.changedAt)}</span>
                      </div>
                    </td>

                    {/* Online Change */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {onlineChanged ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          <span>{entry.previousOnlineRate}%</span>
                          <i className="fas fa-arrow-right text-[9px] text-blue-400"></i>
                          <span>{entry.newOnlineRate}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unchanged ({entry.newOnlineRate}%)</span>
                      )}
                    </td>

                    {/* Offline Change */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {offlineChanged ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          <span>{entry.previousOfflineRate}%</span>
                          <i className="fas fa-arrow-right text-[9px] text-emerald-400"></i>
                          <span>{entry.newOfflineRate}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unchanged ({entry.newOfflineRate}%)</span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-3.5 px-6">
                      {entry.note ? (
                        <span className="text-slate-700 font-medium">"{entry.note}"</span>
                      ) : (
                        <span className="text-slate-400 italic">No note provided</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
