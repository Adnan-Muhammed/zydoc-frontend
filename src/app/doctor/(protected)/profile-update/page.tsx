'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function DoctorProfileUpdatePage() {
    const router = useRouter();

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for actual save logic
        router.push('/doctor/dashboard');
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 shadow rounded-2xl p-6 sm:p-10 border border-slate-100 dark:border-slate-700">
                <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-5">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complete Your Doctor Profile</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Please provide your professional credentials and details to start accepting patients.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Specialty</label>
                            <select className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option>Select Specialty</option>
                                <option>Cardiology</option>
                                <option>Dermatology</option>
                                <option>General Practice</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">License Number</label>
                            <input type="text" placeholder="MD-123456" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                            <input type="tel" placeholder="+1 (555) 000-0000" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Years of Experience</label>
                            <input type="number" min="0" placeholder="5" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Professional Bio</label>
                        <textarea rows={4} placeholder="Brief description of your background and expertise..." className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20"></textarea>
                    </div>

                    <div className="pt-5 flex justify-end">
                        <Button type="submit" icon={<i className="fas fa-check"></i>}>
                            Save Profile & Continue
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
