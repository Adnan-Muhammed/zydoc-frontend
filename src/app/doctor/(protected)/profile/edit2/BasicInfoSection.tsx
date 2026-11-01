'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { SYSTEMS_LIST, getSystemConfigById } from '@/constants/systemsOfMedicine';
import { validateDoctorName, validateDoctorPhone } from '@/utils/doctorProfileValidator';

export default function BasicInfoSection({ initialData }: { initialData: any }) {
    const extractData = (data: any) => ({
        firstName: data?.firstName || data?.user?.firstName || '',
        lastName: data?.lastName || data?.user?.lastName || '',
        phone: String(data?.phone || data?.user?.phone || '').replace(/\D/g, '').slice(0, 15),
        systemOfMedicine: data?.systemOfMedicine || data?.user?.systemOfMedicine || 'Modern Medicine',
        specialty: data?.specialty || data?.user?.specialty || '',
        licenseNumber: data?.licenseNumber || data?.user?.licenseNumber || '',
        yearsOfExperience: data?.yearsOfExperience || data?.user?.yearsOfExperience || '',
        bio: data?.bio || data?.user?.bio || ''
    });

    const [data, setData] = useState(extractData(initialData));
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setData(extractData(initialData));
    }, [initialData]);
    const [loading, setLoading] = useState(false);
 
    const handleSave = async () => {
        const phoneDigits = data.phone.replace(/\D/g, '');
        const specialty = data.specialty.trim();
        const licenseNumber = data.licenseNumber.trim();
        const experience = Number(data.yearsOfExperience);
        const validationError = validateDoctorName(data.firstName, 'first name') ||
            validateDoctorName(data.lastName, 'last name') ||
            validateDoctorPhone(data.phone) ||
            (!specialty || specialty.length > 100 || !new RegExp(String.raw`[\p{L}\p{M}]`, 'u').test(specialty) ? 'Enter a valid specialty.' : null) ||
            (!licenseNumber || licenseNumber.length < 2 || licenseNumber.length > 50 || !/^[a-z\d/-]+$/i.test(licenseNumber) ? 'Enter a valid license or registration number.' : null) ||
            (!/^\d{1,2}$/.test(String(data.yearsOfExperience)) || !Number.isInteger(experience) || experience > 80 ? 'Years of experience must be a whole number from 0 to 80.' : null) ||
            (data.bio.length > 2000 ? 'Bio must be 2,000 characters or fewer.' : null) ||
            (!SYSTEMS_LIST.some(system => system.id === data.systemOfMedicine) ? 'Select a valid system of medicine.' : null);
        if (validationError) {
            setValidationError(validationError);
            return;
        }
        setValidationError('');
        setLoading(true);
        try {
            const res = await axiosInstance.patch('/doctor/profile/basic-info', { ...data, phone: phoneDigits });
            
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
                        type="tel" inputMode="numeric" maxLength={15} value={data.phone}
                        onChange={e => setData({ ...data, phone: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
                {validationError && <p role="alert" className="sm:col-span-2 text-xs text-rose-600">{validationError}</p>}
                <div className="sm:col-span-2 space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System of Medicine</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SYSTEMS_LIST.map((sys) => {
                            const isSelected = (data.systemOfMedicine || 'Modern Medicine') === sys.id;
                            return (
                                <button
                                    type="button"
                                    key={sys.id}
                                    onClick={() => setData({ ...data, systemOfMedicine: sys.id })}
                                    className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                                        isSelected
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {sys.id}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialty</label>
                    <input
                        type="text" 
                        value={data.specialty}
                        list="specialties-list"
                        placeholder="e.g. Cardiology"
                        onChange={e => setData({ ...data, specialty: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <datalist id="specialties-list">
                        {getSystemConfigById(data.systemOfMedicine).specialties.map(spec => (
                            <option key={spec} value={spec} />
                        ))}
                    </datalist>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {getSystemConfigById(data.systemOfMedicine).licenseLabel}
                    </label>
                    <input
                        type="text" value={data.licenseNumber}
                        placeholder="Registration Number"
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
