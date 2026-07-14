'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

export default function BasicInfoSection({ initialData }: { initialData: any }) {
    const extractData = (data: any) => ({
        firstName: data?.firstName || data?.user?.firstName || '',
        lastName: data?.lastName || data?.user?.lastName || '',
        phone: data?.phone || data?.user?.phone || '',
        specialty: data?.specialty || data?.user?.specialty || '',
        licenseNumber: data?.licenseNumber || data?.user?.licenseNumber || '',
        yearsOfExperience: data?.yearsOfExperience || data?.user?.yearsOfExperience || '',
        bio: data?.bio || data?.user?.bio || ''
    });

    const [data, setData] = useState(extractData(initialData));

    useEffect(() => {
        setData(extractData(initialData));
    }, [initialData]);
    const [loading, setLoading] = useState(false);
 
    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.patch('/doctor/profile/basic-info', data);
            
            if (res.data?.success) alert('Basic details updated successfully!');
            else alert(res.data?.message || 'Error saving details.');
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-user text-indigo-500 text-xs" /> Basic Information
                </h3>
                <button
                    type="button" onClick={handleSave} disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
                >
                    {loading ? 'Saving...' : 'Save Section'}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
                    <input
                        type="text" value={data.firstName}
                        onChange={e => setData({ ...data, firstName: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                    <input
                        type="text" value={data.lastName}
                        onChange={e => setData({ ...data, lastName: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                    <input
                        type="text" value={data.phone}
                        onChange={e => setData({ ...data, phone: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialty</label>
                    <input
                        type="text" value={data.specialty}
                        onChange={e => setData({ ...data, specialty: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">License Number</label>
                    <input
                        type="text" value={data.licenseNumber}
                        onChange={e => setData({ ...data, licenseNumber: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Years of Experience</label>
                    <input
                        type="number" value={data.yearsOfExperience}
                        onChange={e => setData({ ...data, yearsOfExperience: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bio</label>
                <textarea
                    value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} rows={4}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
            </div>
        </div>
    );
}