// src/components/admin/common/DataTable.tsx
'use client';

import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export interface EmptyStateConfig {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: EmptyStateConfig;
  pagination?: PaginationConfig;
  toolbar?: React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRows = 5,
  emptyState = {
    title: 'No records found',
    subtitle: 'There are no items matching your criteria.',
    icon: 'fas fa-folder-open',
  },
  pagination,
  toolbar,
}: DataTableProps<T>) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center justify-center';
      case 'right':
        return 'text-right justify-end';
      default:
        return 'text-left justify-start';
    }
  };

  // Generate pagination page numbers
  const renderPageNumbers = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { currentPage, totalPages, onPageChange } = pagination;
    const pages: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(`ellipsis-${i}`);
      }
    }

    return pages.map((p) => {
      if (typeof p === 'string') {
        return (
          <span
            key={p}
            className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 select-none"
          >
            ...
          </span>
        );
      }
      return (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
            currentPage === p
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  const perPage = pagination?.itemsPerPage || 20;
  const startIdx = pagination
    ? pagination.totalItems === 0
      ? 0
      : (pagination.currentPage - 1) * perPage + 1
    : 1;
  const endIdx = pagination
    ? Math.min(pagination.currentPage * perPage, pagination.totalItems)
    : data.length;

  return (
    <div className="space-y-4">
      {/* Optional Toolbar Slot */}
      {toolbar && <div>{toolbar}</div>}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`py-3.5 px-4 sm:px-6 ${getAlignClass(col.align)} ${
                      col.className || ''
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {/* Skeleton Rows */}
              {isLoading &&
                Array.from({ length: skeletonRows }).map((_, rIdx) => (
                  <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td
                        key={`skeleton-${rIdx}-${cIdx}`}
                        className={`py-4 px-4 sm:px-6 ${getAlignClass(col.align)}`}
                      >
                        <div
                          className={`h-4 bg-slate-200 rounded ${
                            cIdx === 0 ? 'w-36' : 'w-24'
                          } ${col.align === 'right' ? 'ml-auto' : ''}`}
                        ></div>
                      </td>
                    ))}
                  </tr>
                ))}

              {/* Data Rows */}
              {!isLoading &&
                data.length > 0 &&
                data.map((item, index) => {
                  const key = keyExtractor(item, index);
                  return (
                    <tr
                      key={key}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {columns.map((col) => (
                        <td
                          key={`${key}-${col.key}`}
                          className={`py-3.5 px-4 sm:px-6 text-slate-700 ${getAlignClass(
                            col.align
                          )} ${col.className || ''}`}
                        >
                          {col.render
                            ? col.render(item, index)
                            : (item as any)[col.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}

              {/* Empty State */}
              {!isLoading && data.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-3 shadow-inner">
                        <i className={emptyState.icon || 'fas fa-folder-open'}></i>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {emptyState.title}
                      </h4>
                      {emptyState.subtitle && (
                        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                          {emptyState.subtitle}
                        </p>
                      )}
                      {emptyState.action && <div>{emptyState.action}</div>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        {pagination && pagination.totalItems > 0 && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-800">{startIdx}</strong> to{' '}
              <strong className="text-slate-800">{endIdx}</strong> of{' '}
              <strong className="text-slate-800">
                {pagination.totalItems.toLocaleString()}
              </strong>{' '}
              records
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  pagination.onPageChange(Math.max(1, pagination.currentPage - 1))
                }
                disabled={pagination.currentPage <= 1 || isLoading}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Previous page"
              >
                <i className="fas fa-chevron-left text-[10px]"></i>
              </button>

              {renderPageNumbers()}

              <button
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(pagination.totalPages, pagination.currentPage + 1)
                  )
                }
                disabled={
                  pagination.currentPage >= pagination.totalPages || isLoading
                }
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Next page"
              >
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
