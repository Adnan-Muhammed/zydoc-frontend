'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setRoleUser } from '@/redux/auth/authThunk';

export default function OnboardingPage() {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRoleSelection = async (role: 'doctor' | 'patient') => {
        setIsLoading(true);
        setError(null);
        try {
            await dispatch(setRoleUser({ role })).unwrap();
            window.location.href = `/${role}/profile-update`;
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'Failed to set role. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
                        Welcome to Zydoc!
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        To get started, please tell us how you'll be using the platform.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
                                <i className="fas fa-exclamation-triangle"></i>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={() => handleRoleSelection('patient')}
                                disabled={isLoading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <i className="fas fa-user-injured text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">I am a Patient</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Book appointments and manage your health.</p>
                                    </div>
                                </div>
                                <i className="fas fa-chevron-right text-slate-400 group-hover:text-blue-500"></i>
                            </button>

                            <button
                                onClick={() => handleRoleSelection('doctor')}
                                disabled={isLoading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <i className="fas fa-user-md text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">I am a Doctor</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage patients and your practice.</p>
                                    </div>
                                </div>
                                <i className="fas fa-chevron-right text-slate-400 group-hover:text-emerald-500"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
