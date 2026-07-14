'use client';

import React from 'react';

interface StepProgressHeaderProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepProgressHeader({ currentStep, totalSteps }: StepProgressHeaderProps) {
    return (
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#24274d] bg-slate-50/50 dark:bg-[#1a1c3d]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Complete Your Medical Profile</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-5xl">
                    Configure structural practice parameters, specialty clinical focuses, licensing credentials, and calendar scheduling rules.
                </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-[10px] font-bold px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-wide">
                    Step {currentStep} of {totalSteps}
                </div>
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                        <div
                            key={s}
                            className={`w-6 h-1.5 rounded-full transition-all ${currentStep >= s ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#24274d]'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
