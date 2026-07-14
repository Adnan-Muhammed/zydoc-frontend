'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface FormNavFooterProps {
    currentStep: number;
    totalSteps: number;
    isLoading: boolean;
    onPrev: (e: React.MouseEvent) => void;
    onNext: (e: React.MouseEvent) => void;
}

export default function FormNavFooter({
    currentStep,
    totalSteps,
    isLoading,
    onPrev,
    onNext,
}: FormNavFooterProps) {
    return (
        <div className="pt-4 sm:pt-5 border-t border-slate-200 dark:border-[#24274d] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-2">
            <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={onPrev}
                        className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#151732] hover:bg-slate-50 dark:hover:bg-[#24274d] rounded-xl border border-slate-200 dark:border-[#24274d] shadow-sm transition"
                    >
                        Previous Step
                    </button>
                )}
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                {currentStep < totalSteps ? (
                    <button
                        type="button"
                        onClick={onNext}
                        className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
                    >
                        Continue to Next Step
                    </button>
                ) : (
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        icon={<i className="fas fa-paper-plane mr-1"></i>}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl px-6 py-2.5 sm:py-2 shadow-md"
                    >
                        Submit Profile for Verification
                    </Button>
                )}
            </div>
        </div>
    );
}
