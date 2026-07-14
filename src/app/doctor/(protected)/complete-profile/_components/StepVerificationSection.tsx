'use client';

import React from 'react';

interface StepVerificationSectionProps {
    medicalCertificate: File | null;
    governmentId: File | null;
    onMedicalCertificateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGovernmentIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} 

export default function StepVerificationSection({
    medicalCertificate,
    governmentId,
    onMedicalCertificateChange,
    onGovernmentIdChange,
}: StepVerificationSectionProps) {
    return (
        <div className="space-y-5 animate-fade-in py-2 px-1">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-sm text-sky-800 dark:text-sky-300 shadow-sm leading-relaxed">
                <i className="fas fa-circle-info mt-0.5 shrink-0 text-sky-500 text-lg"></i>
                <span>
                    Files are processed dynamically and never saved to persistent local caching vectors. If you perform an explicit refresh cycle, attach items below.
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Medical Council Registration Certificate */}
                <div className="p-5 border rounded-xl border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10 flex flex-col justify-between gap-5 shadow-md">
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                Medical Council Registration Certificate *
                            </label>
                            <i className="fas fa-file-pdf text-red-500 text-2xl shrink-0"></i>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Attach verification licensing documents distributed via regional state health boards.
                        </p>
                    </div>
                    <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-4">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={onMedicalCertificateChange}
                            className="w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer transition shadow-md"
                        />
                        {medicalCertificate && (
                            <span className="block text-xs sm:text-sm text-green-600 dark:text-green-400 font-bold animate-fade-in">
                                <i className="fas fa-check-circle mr-1"></i> Document payload mapped successfully.
                            </span>
                        )}
                    </div>
                </div>

                {/* Government Issued Photo ID */}
                <div className="p-5 border rounded-xl border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10 flex flex-col justify-between gap-5 shadow-md">
                    <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                Government Issued Photo ID *
                            </label>
                            <i className="fas fa-id-card text-blue-500 text-2xl shrink-0"></i>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            Attach officially authenticated governmental identification cards (Passport, Drivers License).
                        </p>
                    </div>
                    <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-4">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={onGovernmentIdChange}
                            className="w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer transition shadow-md"
                        />
                        {governmentId && (
                            <span className="block text-xs sm:text-sm text-green-600 dark:text-green-400 font-bold animate-fade-in">
                                <i className="fas fa-check-circle mr-1"></i> Government identification attached.
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
