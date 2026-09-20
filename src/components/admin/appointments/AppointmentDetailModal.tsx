// src/components/admin/appointments/AppointmentDetailModal.tsx
'use client';

import React, { useState } from 'react';
import { MasterAppointment } from '@/redux/features/admin/adminTypes';

interface AppointmentDetailModalProps {
  appointment: MasterAppointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentDetailModal({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !appointment) return null;

  const isOnline = appointment.consultationType === 'ONLINE';

  const copyId = () => {
    navigator.clipboard.writeText(appointment._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ongoing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'refunded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const dateFormatted = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Date not set';

  const fee = appointment.fee || 0;
  const adminCommission = appointment.adminCommission || 0;
  const doctorAmount = appointment.doctorAmount ?? Math.max(0, fee - adminCommission);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 z-10 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                  appointment.status
                )}`}
              >
                {appointment.status}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOnline
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <i
                  className={`fas ${
                    isOnline ? 'fa-video' : 'fa-clinic-medical'
                  } text-[10px]`}
                ></i>
                {isOnline ? 'Online Video' : 'Clinic Visit'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <h3 className="text-base font-bold text-slate-900">
                Appointment Details
              </h3>
              <button
                onClick={copyId}
                className="text-[11px] font-mono text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                title="Copy Appointment ID"
              >
                <span>#{appointment._id.slice(-8)}</span>
                <i
                  className={`fas ${
                    copied ? 'fa-check text-emerald-500' : 'fa-copy'
                  }`}
                ></i>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Schedule & Timing Card */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base border border-indigo-100">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Scheduled Time</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {dateFormatted}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Slot Time</div>
            <div className="text-sm font-bold text-indigo-600 mt-0.5">
              {appointment.appointmentTime || 'N/A'}
            </div>
          </div>
        </div>

        {/* Doctor & Patient Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Patient Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-user text-slate-400"></i>
              <span>Patient</span>
            </div>

            <div className="flex items-center gap-3">
              {appointment.patient?.avatarUrl ? (
                <img
                  src={appointment.patient.avatarUrl}
                  alt={appointment.patient.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center">
                  {(appointment.patient?.name || 'P').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-xs truncate">
                  {appointment.patient?.name || 'Unknown Patient'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {appointment.patient?.email}
                </div>
                {appointment.patient?.phone && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {appointment.patient.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-user-md text-indigo-500"></i>
              <span>Doctor</span>
            </div>

            <div className="flex items-center gap-3">
              {appointment.doctor?.avatarUrl ? (
                <img
                  src={appointment.doctor.avatarUrl}
                  alt={appointment.doctor.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center">
                  {(appointment.doctor?.name || 'D').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-slate-800 text-xs truncate">
                  {appointment.doctor?.name.startsWith('Dr.')
                    ? appointment.doctor.name
                    : `Dr. ${appointment.doctor?.name || 'Doctor'}`}
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold truncate">
                  {appointment.doctor?.specialty || 'General Practitioner'}
                </div>
                {appointment.doctor?.phone && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {appointment.doctor.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Financial & Fee Split Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fas fa-file-invoice-dollar text-emerald-600"></i>
              <span>Payment & Fee Breakdown</span>
            </h5>
            <span className="text-xs font-semibold text-slate-500 capitalize">
              Paid via {appointment.paymentMethod || 'Razorpay / Wallet'}
            </span>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-200/50">
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Total Consultation Fee</span>
              <span className="font-bold text-slate-900 text-sm">
                ₹{fee.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 text-indigo-700">
              <span className="font-medium flex items-center gap-1">
                <i className="fas fa-percentage text-[10px]"></i>
                Admin Commission
                {appointment.commissionRate && (
                  <span className="text-[10px] text-indigo-500">
                    ({appointment.commissionRate}%)
                  </span>
                )}
              </span>
              <span className="font-bold">
                + ₹{adminCommission.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 text-emerald-700">
              <span className="font-medium flex items-center gap-1">
                <i className="fas fa-hand-holding-usd text-[10px]"></i>
                Doctor Net Payout
              </span>
              <span className="font-bold">
                ₹{doctorAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {appointment.feeBreakdown && (
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Wallet Deducted: ₹
                  {appointment.feeBreakdown.walletDeducted || 0}
                </span>
                <span>
                  Online Paid: ₹
                  {appointment.feeBreakdown.onlinePaid || fee}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
