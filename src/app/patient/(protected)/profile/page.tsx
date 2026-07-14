'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function PatientProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/profile`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
                setProfile(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 m-8 rounded-xl bg-red-50 text-red-700">
                <p>Error loading profile: {error}</p>
            </div>
        );
    }

    const { user, profile: pData } = profile || {};
    const medicalHistory = pData?.medicalHistory || {};
    const emergencyContact = pData?.emergencyContact || {};
    const address = pData?.address || {};

    const hasMedicalHistory = 
        (medicalHistory.allergies?.length > 0) || 
        (medicalHistory.chronicConditions?.length > 0) || 
        (medicalHistory.currentMedications?.length > 0);

    const hasEmergencyContact = emergencyContact.name || emergencyContact.phone;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
                    <Link href="/patient/profile/edit-profile">
                        <Button className="px-4 py-2" icon={<i className="fas fa-edit"></i>}>Edit Profile</Button>
                    </Link>
                </div>

                {/* Personal Information */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <i className="fas fa-id-card"></i>
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{pData?.firstName || user?.name} {pData?.lastName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Phone Number</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{pData?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Blood Group</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{pData?.bloodGroup || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                {/* Medical History */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <i className="fas fa-notes-medical"></i>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Medical History</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        {!hasMedicalHistory ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                    <i className="fas fa-clipboard-list text-xl"></i>
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-medium mb-1">No medical history added</h3>
                                <p className="text-slate-500 text-sm mb-4">Add your allergies and conditions to help doctors provide better care.</p>
                                <Link href="/patient/profile-update">
                                    <Button variant="secondary" size="sm" icon={<i className="fas fa-plus"></i>}>Add Medical History</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Allergies</p>
                                    <p className="text-slate-900 dark:text-white">{medicalHistory.allergies?.join(', ') || 'None reported'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Chronic Conditions</p>
                                    <p className="text-slate-900 dark:text-white">{medicalHistory.chronicConditions?.join(', ') || 'None reported'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Current Medications</p>
                                    <p className="text-slate-900 dark:text-white">{medicalHistory.currentMedications?.join(', ') || 'None reported'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Residential Details */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <i className="fas fa-home"></i>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Residential Details</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        {!address.street && !address.city ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <h3 className="text-slate-900 dark:text-white font-medium mb-1">No residential details added</h3>
                                <p className="text-slate-500 text-sm mb-4">Please add your current address.</p>
                                <Link href="/patient/profile-update">
                                    <Button variant="secondary" size="sm" icon={<i className="fas fa-plus"></i>}>Add Address</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Street Address</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{address.street || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">City</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{address.city || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">State</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{address.state || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ZIP Code</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{address.zipCode || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Country</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{address.country || 'N/A'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                                <i className="fas fa-heartbeat"></i>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency Contact</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        {!hasEmergencyContact ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <h3 className="text-slate-900 dark:text-white font-medium mb-1">No emergency contact added</h3>
                                <p className="text-slate-500 text-sm mb-4">Please add someone we can contact in case of an emergency.</p>
                                <Link href="/patient/profile-update">
                                    <Button variant="secondary" size="sm" icon={<i className="fas fa-plus"></i>}>Add Contact</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{emergencyContact.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Relationship</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{emergencyContact.relationship || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{emergencyContact.phone || 'N/A'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
