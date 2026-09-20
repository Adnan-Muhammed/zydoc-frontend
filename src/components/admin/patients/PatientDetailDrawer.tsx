// src/components/admin/patients/PatientDetailDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppDispatch } from '@/redux/hooks';
import { togglePatientStatus } from '@/redux/features/admin/adminThunk';
import { MasterPatient } from '@/redux/features/admin/adminTypes';
import StatusToggleConfirmModal from '@/components/admin/common/StatusToggleConfirmModal';

interface PatientDetailDrawerProps {
  patient: MasterPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusToggled?: () => void;
}

export default function PatientDetailDrawer({
  patient,
  isOpen,
  onClose,
  onStatusToggled,
}: PatientDetailDrawerProps) {
  const dispatch = useAppDispatch();

  const [currentStatus, setCurrentStatus] = useState<'active' | 'suspended' | string>('active');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (patient) {
      setCurrentStatus(patient.accountStatus || 'active');
    } 
  }, [patient]);

  if (!isOpen || !patient) return null;

  const profile = patient.profile || {};
  const stats = patient.stats || {
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    currentWalletBalance: 0,
  };

  const fullName =
    profile.fullName ||
    (profile.firstName || profile.lastName
      ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
      : patient.email.split('@')[0]);

  const joinedDate = patient.createdAt
    ? new Date(patient.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  const walletBalance = profile.walletBalance ?? stats.currentWalletBalance ?? 0;
  const isActive = currentStatus === 'active';

  // Calculate age if dateOfBirth exists
  const age = profile.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(profile.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const handleToggleConfirm = async (reason: string) => {
    setIsToggling(true);
    try {
      const targetId = patient.userId || (profile as any)._id || '';
      const res = await dispatch(
        togglePatientStatus({ patientId: targetId, reason })
      ).unwrap();

      const newStatus = res.newStatus || (isActive ? 'suspended' : 'active');
      setCurrentStatus(newStatus);
      setIsConfirmModalOpen(false);
      toast.success(
        res.message ||
          `Patient account has been ${newStatus === 'active' ? 'reactivated' : 'suspended'}.`
      );
      onStatusToggled?.();
    } catch (err: any) {
      toast.error(err || 'Failed to update patient account status.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition ease-in-out duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {currentStatus}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {patient.userId.slice(-6)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Patient Profile & Stats
                </h3>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Identity Card */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={fullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl ring-2 ring-white shadow-sm">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {fullName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.gender && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 capitalize">
                        {profile.gender}
                      </span>
                    )}
                    {age !== null && (
                      <span className="text-xs text-slate-500 font-medium">
                        {age} yrs
                      </span>
                    )}
                    {profile.bloodGroup && (
                      <span className="inline-flex items-center text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {profile.bloodGroup}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 truncate">
                    <i className="fas fa-envelope mr-1.5 text-slate-400"></i>
                    {patient.email}
                  </p>
                </div>
              </div>

              {/* Account Status Control Card (Phase 2 Step 2) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Account Access Control
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isActive
                        ? 'Account is active. Suspending blocks app access.'
                        : 'Account is suspended. Reactivating restores account privileges.'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <i
                      className={`fas ${
                        isActive ? 'fa-ban' : 'fa-check-circle'
                      } text-xs`}
                    ></i>
                    <span>{isActive ? 'Suspend' : 'Reactivate'}</span>
                  </button>
                </div>
              </div>

              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xs pointer-events-none" />
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-100">
                  <span>Current Wallet Balance</span>
                  <i className="fas fa-wallet text-base"></i>
                </div>
                <div className="text-3xl font-extrabold mt-2 tracking-tight">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-100/90 mt-2 flex items-center gap-1.5">
                  <i className="fas fa-shield-alt text-[10px]"></i>
                  <span>Secured In-App Patient Wallet</span>
                </div>
              </div>

              {/* Consultation Activity Quick Stats */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Appointment Metrics
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
                    <div className="text-[11px] text-slate-500 font-medium">Total</div>
                    <div className="text-lg font-bold text-slate-800 mt-1">
                      {stats.totalAppointments}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Booked</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
                    <div className="text-[11px] text-emerald-600 font-medium">Completed</div>
                    <div className="text-lg font-bold text-emerald-700 mt-1">
                      {stats.completedAppointments}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Finished</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
                    <div className="text-[11px] text-rose-500 font-medium">Cancelled</div>
                    <div className="text-lg font-bold text-rose-600 mt-1">
                      {stats.cancelledAppointments}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Cancelled</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Contact & Personal Info
                </h5>
                
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-semibold text-slate-800">
                      {profile.phone || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Primary Email</span>
                    <span className="font-semibold text-slate-800">{patient.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="font-semibold text-slate-800">
                      {profile.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Joined Platform</span>
                    <span className="font-semibold text-slate-800">{joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact (if available) */}
              {profile.emergencyContact && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Emergency Contact
                  </h5>
                  <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Contact Name</span>
                      <span className="font-semibold text-slate-800">
                        {profile.emergencyContact.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Relationship</span>
                      <span className="font-semibold text-slate-800">
                        {profile.emergencyContact.relationship || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Emergency Phone</span>
                      <span className="font-semibold text-slate-800">
                        {profile.emergencyContact.phone || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Address (if available) */}
              {profile.address && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Location / Address
                  </h5>
                  <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <p>
                      {[
                        profile.address.street,
                        profile.address.city,
                        profile.address.state,
                        profile.address.zipCode,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'No detailed address saved.'}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Status Toggle Modal */}
      <StatusToggleConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleToggleConfirm}
        currentStatus={currentStatus}
        userName={fullName}
        role="patient"
        isLoading={isToggling}
      />
    </>
  );
}
