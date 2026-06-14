'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorNotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1025] px-4">
      <div className="max-w-md w-full bg-white dark:bg-[#151732] rounded-2xl shadow-xl border border-slate-200 dark:border-[#24274d] p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          Page Not Found
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Let's get you back to your dashboard.
        </p>

        <button
          onClick={() => router.push('/doctor/dashboard')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
