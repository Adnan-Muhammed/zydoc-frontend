// src/app/patient/(protected)/security/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Lock, KeyRound } from 'lucide-react';
import ChangePasswordForm from '@/components/forms/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'Security Settings | Zydoc',
  description: 'Manage your password and security settings.',
};

export default function SecurityPage() {
  return (
    <div className="pat-page space-y-6">

      {/* Page Header */}
      <div className="pat-page-header">
        <div>
          <h1>Security Settings</h1>
          <p>Keep your account safe with a strong, unique password.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          <ShieldCheck size={16} />
          Account Secured
        </div>
      </div>

      {/* Security Tips Banner */}
      <div className="pat-hero" style={{ padding: '22px 28px', marginBottom: 0, background: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #1d4ed8 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
            <Lock size={26} className="text-white" />
          </div>
          <div className="relative z-10">
            <h2 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Keep your account secure</h2>
            <p style={{ fontSize: '0.84rem' }}>
              Use a minimum 8-character password with a mix of uppercase, lowercase, numbers, and symbols. Never share your password.
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <KeyRound size={14} />
            </span>
            Change Password
          </h2>
        </div>
        <div className="pat-card-body">
          <ChangePasswordForm />
        </div>
      </div>

      {/* Security Checklist */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={14} />
            </span>
            Security Checklist
          </h2>
        </div>
        <div className="pat-card-body space-y-3">
          {[
            { label: 'Password set',                done: true  },
            { label: 'Email address verified',      done: true  },
            { label: 'Profile information complete', done: false },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border ${item.done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50/60'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>
                {item.done && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-semibold ${item.done ? 'text-emerald-800' : 'text-slate-600'}`}>
                {item.label}
              </span>
              {!item.done && (
                <span className="ml-auto text-xs text-slate-400 font-medium">Pending</span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
