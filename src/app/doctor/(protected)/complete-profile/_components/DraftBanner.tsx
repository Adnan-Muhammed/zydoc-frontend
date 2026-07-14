'use client';

import React from 'react';

interface DraftBannerProps {
    currentStep: number;
    onStartFresh: () => void;
}

export default function DraftBanner({ currentStep, onStartFresh }: DraftBannerProps) {
    return (
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs shadow-sm">
            <span className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <i className="fas fa-rotate-left text-amber-500"></i>
                <span>
                    <strong>Progress restored automatically.</strong> Continuing from cached values.
                    {currentStep === 3 && <span className="ml-1 font-medium opacity-90">(Re-select security validation files.)</span>}
                </span>
            </span>
            <button
                type="button"
                onClick={onStartFresh}
                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded transition"
            >
                Start Fresh
            </button>
        </div>
    );
}
