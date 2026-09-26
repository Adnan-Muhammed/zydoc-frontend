import React from 'react';
import { Metadata } from 'next';
import ChangePasswordForm from '@/components/forms/ChangePasswordForm';
import { ShieldCheck, KeyRound, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Security Settings | Doctor Dashboard | Zydoc',
    description: 'Manage your password and security settings.',
};

export default function DoctorSecurityPage() {
    return (
        <div className="doc-page" style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/70 flex items-center justify-center shadow-2xs">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">
                            Security Settings
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12">
                        Manage your account credentials, login protections, and portal password.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200/60 shadow-2xs self-start md:self-auto ml-12 md:ml-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>256-Bit Encrypted</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Form Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-2.5 pb-5 mb-6 border-b border-slate-100">
                        <KeyRound className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-[#101044]">Account Password</h2>
                    </div>
                    <ChangePasswordForm />
                </div>

                {/* Right Security Advice Card */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs h-fit space-y-5">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                        <Lock className="w-5 h-5 text-[#101044]" />
                        <h3 className="text-base font-bold text-[#101044]">Security Guidelines</h3>
                    </div>

                    <ul className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                        <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <span>Use at least 8 characters with a mix of letters, numbers, and symbols.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <span>Never share your physician login credentials or OTP with anyone.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                            <span>Always log out when accessing Zydoc from shared clinic workstations.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
