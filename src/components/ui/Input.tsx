'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    icon,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            ) }
            
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        {icon}
                    </div>
                )}
                
                <input
                    id={inputId}
                    className={`
                        block w-full rounded-lg border bg-white px-4 py-2.5 text-slate-900 shadow-sm transition-all duration-200
                        placeholder:text-slate-400
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                        disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500
                        dark:bg-slate-900 dark:text-white dark:focus:ring-blue-500/40
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 dark:border-slate-700'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            
            {error && (
                <p className="text-xs font-medium text-red-500 animate-fade-in flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </p>
            )}
            
            {helperText && !error && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default Input;
