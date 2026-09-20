import React from 'react';
import { Metadata } from 'next';
import ChangePasswordForm from '@/components/forms/ChangePasswordForm';

export const metadata: Metadata = {
    title: 'Security Settings | Zydoc',
    description: 'Manage your password and security settings.',
};

export default function SecurityPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security Settings</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Update your password and secure your account.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Account Password</h2>
                <ChangePasswordForm />
            </div>
        </div>
    );
}
