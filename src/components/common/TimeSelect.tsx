// src/components/common/TimeSelect.tsx
'use client';

import React from 'react';

// Generates time options in 5-minute intervals across 24 hours
export const TIME_OPTIONS_5MIN = (() => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 5) {
            const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const period = h >= 12 ? 'PM' : 'AM';
            let displayH = h % 12;
            if (displayH === 0) displayH = 12;
            const label = `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
            options.push({ value: val, label });
        }
    }
    return options;
})();

interface TimeSelectProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    disabled?: boolean;
}

export default function TimeSelect({ value, onChange, className = '', disabled = false }: TimeSelectProps) {
    // If value has odd minutes (e.g. "09:06"), normalize to nearest 5 mins
    let normalizedValue = value;
    if (value && value.includes(':')) {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
            const roundedM = Math.round(m / 5) * 5;
            let finalH = h;
            let finalM = roundedM;
            if (roundedM >= 60) {
                finalH = (finalH + 1) % 24;
                finalM = 0;
            }
            normalizedValue = `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
        }
    }

    return (
        <div className="relative w-full">
            <select
                value={normalizedValue || '09:00'}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full appearance-none pl-6 pr-5 py-1.5 border border-slate-200 dark:border-[#24274d] rounded-lg text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs bg-slate-50/50 sm:bg-white dark:bg-[#151732] cursor-pointer transition ${className}`}
            >
                {TIME_OPTIONS_5MIN.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#151732] text-slate-800 dark:text-slate-200 py-1">
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none text-slate-400">
                <i className="fas fa-clock text-[10px]" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none text-slate-400">
                <i className="fas fa-chevron-down text-[8px]" />
            </div>
        </div>
    );
}
