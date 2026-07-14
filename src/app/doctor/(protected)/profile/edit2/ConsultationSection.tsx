'use client';
 
import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { useRouter } from 'next/navigation';

export default function ConsultationSection({ initialData }: { initialData: any }) {
    const router = useRouter();
    const extractVideo = (data: any) => ({ enabled: data?.enableVideo ?? false, fee: data?.videoFee ?? '0' });
    const extractPhysical = (data: any) => ({ 
        enabled: data?.enablePhysical ?? false,
        fee: data?.physicalFee ?? '0',
        clinicName: data?.clinicName ?? '',
        clinicAddress: data?.clinicAddress ?? ''
    });
 
    const [video, setVideo] = useState(extractVideo(initialData));
    const [physical, setPhysical] = useState(extractPhysical(initialData));

    useEffect(() => {
        setVideo(extractVideo(initialData));
        setPhysical(extractPhysical(initialData));
    }, [initialData]);

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true); 
        try {
            const payload = { 
                enableVideo: video.enabled, 
                videoFee: video.fee, 
                enablePhysical: physical.enabled, 
                physicalFee: physical.fee, 
                clinicName: physical.clinicName, 
                clinicAddress: physical.clinicAddress 
            };
            const res = await axiosInstance.patch('/doctor/profile/consultation', payload);
             
            if (res.data?.success) {
                alert('Consultation pathways saved!');
                if (res.data.profile?.consultationSettings) {
                    setVideo({
                        enabled: res.data.profile.consultationSettings.video?.enabled ?? false,
                        fee: res.data.profile.consultationSettings.video?.fee ?? '0'
                    });
                    setPhysical({
                        enabled: res.data.profile.consultationSettings.physical?.enabled ?? false,
                        fee: res.data.profile.consultationSettings.physical?.fee ?? '0',
                        clinicName: res.data.profile.consultationSettings.physical?.clinicName ?? '',
                        clinicAddress: res.data.profile.consultationSettings.physical?.clinicAddress ?? ''
                    });
                }
                router.refresh();
            } else {
                alert(res.data?.message || 'Error saving details.');
            }
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
                    <i className="fas fa-stethoscope text-indigo-500 text-xs" /> Consultation Channel Matrix
                </h3>
                <button 
                    type="button" 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
                >
                    {loading ? 'Saving...' : 'Save Channels'}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Telehealth Switch Box */}
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 transition-all hover:border-indigo-100 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                                <i className="fas fa-video text-xs" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">Video Telehealth</span>
                        </div>
                        <input
                            type="checkbox" 
                            checked={video.enabled} 
                            onChange={e => setVideo({ ...video, enabled: e.target.checked })} 
                            className="w-5 h-5 accent-indigo-600 cursor-pointer rounded" 
                        />
                    </div>
                    {video.enabled && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Video Session Fee (₹)</label>
                            <input 
                                type="number" 
                                value={video.fee} 
                                onChange={e => setVideo({ ...video, fee: e.target.value })} 
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                            />
                        </div>
                    )}
                </div>

                {/* In-Person Switch Box */}
                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 transition-all hover:border-emerald-100 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                                <i className="fas fa-building-medical text-xs" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">In-Person Clinic Visits</span>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={physical.enabled} 
                            onChange={e => setPhysical({ ...physical, enabled: e.target.checked })} 
                            className="w-5 h-5 accent-emerald-600 cursor-pointer rounded" 
                        />
                    </div>
                    {physical.enabled && (
                        <div className="space-y-4 pt-2 border-t border-slate-100 animation-fade-in">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Physical Session Fee (₹)</label>
                                <input 
                                    type="number" 
                                    value={physical.fee} 
                                    onChange={e => setPhysical({ ...physical, fee: e.target.value })} 
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Name</label>
                                <input 
                                    type="text" 
                                    value={physical.clinicName} 
                                    onChange={e => setPhysical({ ...physical, clinicName: e.target.value })} 
                                    placeholder="e.g. Neuro Care Hub" 
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Address</label>
                                <input 
                                    type="text" 
                                    value={physical.clinicAddress} 
                                    onChange={e => setPhysical({ ...physical, clinicAddress: e.target.value })} 
                                    placeholder="Street, City, Pin" 
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 