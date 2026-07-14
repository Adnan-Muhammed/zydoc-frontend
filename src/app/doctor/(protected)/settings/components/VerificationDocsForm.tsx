// src/app/doctor/(protected)/settings/components/VerificationDocsForm.tsx
'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import Button from '@/components/ui/Button';

export default function VerificationDocsForm() {
  const dispatch = useAppDispatch();
  const { isLoading, user } = useAppSelector((state) => state.auth);

  const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null);
  const [governmentId, setGovernmentId] = useState<File | null>(null);

  // Status and rejection reasons from Redux user state
  const medicalStatus = user?.medicalCertificateStatus || 'pending';
  const medicalReason = user?.medicalCertificateRejectionReason;
  const govStatus = user?.governmentIdStatus || 'pending';
  const govReason = user?.governmentIdRejectionReason;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalCertificate && !governmentId) {
      alert('Please select a new documentation payload package before saving changes.');
      return;
    }

    const formData = new FormData();
    if (medicalCertificate) formData.append('medicalCertificate', medicalCertificate);
    if (governmentId) formData.append('governmentId', governmentId);

    // Sending an empty object string inside data to adhere to expected structural parsing patterns
    formData.append('data', JSON.stringify({}));

    const resultAction = await dispatch(updateDoctorProfile(formData));
    if (updateDoctorProfile.fulfilled.match(resultAction)) {
      alert('Verification documents uploaded and are currently under compliance audit review.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Verification Records</h3>
        <p className="text-xs text-slate-400">Upload replacement files if your state licensing registration has been updated or rejected.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Medical Board Upload Card */}
        <div className="p-4 border rounded-xl border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10 flex flex-col justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">Council Certificate</label>
              <i className="fas fa-file-pdf text-red-500 text-xl"></i>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">Attach licensing confirmation distributions verified via state health boards.</p>
          </div>
          <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-3">
            {medicalStatus === 'approved' ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg flex items-center gap-3">
                <i className="fas fa-shield-check text-green-500 text-lg"></i>
                <div>
                  <div className="text-xs font-bold text-green-700 dark:text-green-400">Verified & Approved</div>
                  <div className="text-[10px] text-green-600 dark:text-green-500">Document locked from changes</div>
                </div>
              </div>
            ) : (
              <>
                {medicalStatus === 'rejected' && medicalReason && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg flex items-start gap-2">
                    <i className="fas fa-circle-exclamation text-red-500 mt-0.5 text-sm"></i>
                    <div>
                      <div className="text-xs font-bold text-red-700 dark:text-red-400">Rejected</div>
                      <div className="text-[11px] text-red-600 dark:text-red-300">{medicalReason}</div>
                    </div>
                  </div>
                )}
                <input type="file" accept=".pdf,image/*" onChange={(e) => setMedicalCertificate(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 transition file:cursor-pointer" />
                {medicalCertificate && <span className="block text-[11px] text-green-600 font-bold"><i className="fas fa-check-circle mr-1"></i> File mapped successfully.</span>}
              </>
            )}
          </div>
        </div>

        {/* Identity Upload Card */}
        <div className="p-4 border rounded-xl border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10 flex flex-col justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">Government Photo ID</label>
              <i className="fas fa-id-card text-blue-500 text-xl"></i>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">Attach officially authenticated governmental identification cards (Passport, Driver's License).</p>
          </div>
          <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-3">
            {govStatus === 'approved' ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg flex items-center gap-3">
                <i className="fas fa-shield-check text-green-500 text-lg"></i>
                <div>
                  <div className="text-xs font-bold text-green-700 dark:text-green-400">Verified & Approved</div>
                  <div className="text-[10px] text-green-600 dark:text-green-500">Document locked from changes</div>
                </div>
              </div>
            ) : (
              <>
                {govStatus === 'rejected' && govReason && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg flex items-start gap-2">
                    <i className="fas fa-circle-exclamation text-red-500 mt-0.5 text-sm"></i>
                    <div>
                      <div className="text-xs font-bold text-red-700 dark:text-red-400">Rejected</div>
                      <div className="text-[11px] text-red-600 dark:text-red-300">{govReason}</div>
                    </div>
                  </div>
                )}
                <input type="file" accept=".pdf,image/*" onChange={(e) => setGovernmentId(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 transition file:cursor-pointer" />
                {governmentId && <span className="block text-[11px] text-green-600 font-bold"><i className="fas fa-check-circle mr-1"></i> Identity file mapped successfully.</span>}
              </>
            )}
          </div>
        </div>
      </div>

      {!(medicalStatus === 'approved' && govStatus === 'approved') && (
        <div className="flex justify-end border-t border-slate-100 dark:border-[#24274d]/50 pt-4">
          <Button type="submit" isLoading={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl px-6 py-2.5 shadow-md">
            Re-submit Validation Records
          </Button>
        </div>
      )}
    </form>
  );
}