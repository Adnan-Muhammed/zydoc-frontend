'use client';

import React from 'react';

interface StepVerificationSectionProps {
    medicalCertificate: File | null;
    governmentId: File | null;
    onMedicalCertificateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGovernmentIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    serverErrors?: { field?: string; message?: string } | null;
} 

export default function StepVerificationSection({
    medicalCertificate,
    governmentId,
    onMedicalCertificateChange,
    onGovernmentIdChange,
    serverErrors,
}: StepVerificationSectionProps) {
    const isMedCertError = Boolean(serverErrors?.field === 'medicalCertificate');
    const isGovIdError = Boolean(serverErrors?.field === 'governmentId');

    return (
        <div className="space-y-5 animate-fade-in py-2 px-1">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-sm text-sky-800 dark:text-sky-300 shadow-sm leading-relaxed">
                <i className="fas fa-circle-info mt-0.5 shrink-0 text-sky-500 text-lg"></i>
                <span>
                    Attach authentic documents below in PDF, JPG, or PNG formats. Files are verified for validity before upload.
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Medical Council Registration Certificate */}
                <div className={`p-5 border rounded-xl flex flex-col justify-between gap-5 shadow-md transition-all ${
                    isMedCertError
                        ? 'border-red-400 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 ring-2 ring-red-500/20'
                        : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10'
                }`}>
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                Medical Council Registration Certificate <span className="text-red-500">*</span>
                            </label>
                            <i className="fas fa-file-medical text-red-500 text-2xl shrink-0"></i>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Official registration certificate issued by your Medical Council (State/National).
                        </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-4">
                        <input
                            type="file"
                            id="medCertInput"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                            onChange={onMedicalCertificateChange}
                            className="w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer transition shadow-md"
                        />
                        {medicalCertificate && (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                                <span className="truncate max-w-[200px]" title={medicalCertificate.name}>
                                    <i className="fas fa-check-circle mr-1 text-emerald-500"></i> {medicalCertificate.name}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                    {(medicalCertificate.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                            </div>
                        )}
                        {isMedCertError && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5 animate-fade-in">
                                <i className="fas fa-exclamation-triangle"></i>
                                {serverErrors?.message || 'Please upload a valid Medical Certificate file.'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Government Issued Photo ID */}
                <div className={`p-5 border rounded-xl flex flex-col justify-between gap-5 shadow-md transition-all ${
                    isGovIdError
                        ? 'border-red-400 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 ring-2 ring-red-500/20'
                        : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10'
                }`}>
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                Government Issued Photo ID <span className="text-red-500">*</span>
                            </label>
                            <i className="fas fa-id-card text-blue-500 text-2xl shrink-0"></i>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Official government identity proof (Aadhaar, Passport, or Driving License).
                        </p>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-4">
                        <input
                            type="file"
                            id="govIdInput"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                            onChange={onGovernmentIdChange}
                            className="w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer transition shadow-md"
                        />
                        {governmentId && (
                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                                <span className="truncate max-w-[200px]" title={governmentId.name}>
                                    <i className="fas fa-check-circle mr-1 text-emerald-500"></i> {governmentId.name}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                    {(governmentId.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                            </div>
                        )}
                        {isGovIdError && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5 animate-fade-in">
                                <i className="fas fa-exclamation-triangle"></i>
                                {serverErrors?.message || 'Please upload a valid Government ID file.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
