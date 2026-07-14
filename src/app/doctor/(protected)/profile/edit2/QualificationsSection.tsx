'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

export default function QualificationsSection({ initialData }: { initialData: any[] }) {
    const [list, setList] = useState(initialData || []);
    
    useEffect(() => {
        setList(initialData || []);
    }, [initialData]);

    const [loading, setLoading] = useState(false);

    const handleUpdateItem = (id: string, field: string, val: string) => {
        setList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    const handleAddItem = () => {
        setList([...list, { id: Date.now().toString(), degree: '', institution: '', year: new Date().getFullYear().toString() }]);
    };
 
    const handleRemoveItem = (id: string) => {
        setList(prev => prev.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Filter out the raw file objects before stringifying
            const listData = list.map(q => {
                const { file, ...rest } = q;
                return rest;
            });
            formData.append('data', JSON.stringify(listData));
            
            // Append files with keys mapped to their qualification ids
            list.forEach((q) => {
                if (q.file) {
                    formData.append(`certificate_${q.id}`, q.file);
                }
            });

            const res = await axiosInstance.put('/doctor/profile/qualifications', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data?.success) {
                alert('Qualifications database synced.');
                if (res.data.profile && res.data.profile.qualifications) {
                    setList(res.data.profile.qualifications);
                }
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
                    <i className="fas fa-graduation-cap text-indigo-500 text-xs" /> Education Framework
                </h3>
                <div className="flex items-center gap-2">
                    <button 
                        type="button" 
                        onClick={handleAddItem} 
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-all"
                    >
                        <i className="fas fa-plus text-[10px]" /> Add Item
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave} 
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
                    >
                        {loading ? 'Syncing...' : 'Sync Items'}
                    </button>
                </div>
            </div>

            <div className="space-y-3 pt-2">
                {list.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                        No qualifications added yet. Click &apos;Add Item&apos; to begin.
                    </div>
                )}
                {list.map((q) => (
                    <div key={q.id} className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end transition-all hover:shadow-sm hover:border-slate-200">
                        
                        {/* Degree / Certificate Input */}
                        <div className="sm:col-span-4 space-y-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Degree/Certificate</label>
                            <input
                                type="text" 
                                value={q.degree} 
                                onChange={e => handleUpdateItem(q.id, 'degree', e.target.value)} 
                                placeholder="e.g. DM Neurology" 
                                className={`w-full text-xs px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all ${(q.certificateStatus === 'approved' || q.certificateStatus === 'rejected') ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`} 
                                disabled={q.certificateStatus === 'approved' || q.certificateStatus === 'rejected'}
                                required
                            />
                        </div>

                        {/* Institution Input */}
                        <div className="sm:col-span-5 space-y-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Institution / University</label>
                            <input
                                type="text" 
                                value={q.institution} 
                                onChange={e => handleUpdateItem(q.id, 'institution', e.target.value)} 
                                placeholder="e.g. AIIMS" 
                                className={`w-full text-xs px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all ${(q.certificateStatus === 'approved' || q.certificateStatus === 'rejected') ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`} 
                                disabled={q.certificateStatus === 'approved' || q.certificateStatus === 'rejected'}
                                required
                            />
                        </div>

                        {/* Year Input */}
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Year</label>
                            <input
                                type="number" 
                                value={q.year} 
                                onChange={e => handleUpdateItem(q.id, 'year', e.target.value)} 
                                className={`w-full text-xs px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-center transition-all ${(q.certificateStatus === 'approved' || q.certificateStatus === 'rejected') ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`} 
                                disabled={q.certificateStatus === 'approved' || q.certificateStatus === 'rejected'}
                                required
                            />
                        </div>

                        {/* Delete Button Container */}
                        <div className="sm:col-span-1 flex justify-end sm:justify-center">
                            <button
                                type="button" 
                                onClick={() => handleRemoveItem(q.id)} 
                                disabled={q.certificateStatus === 'approved' || q.certificateStatus === 'rejected'}
                                className={`w-9 h-9 rounded-xl border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm ${(q.certificateStatus === 'approved' || q.certificateStatus === 'rejected') ? 'opacity-50 cursor-not-allowed hover:bg-red-50 hover:text-red-500' : ''}`}
                                title="Remove item"
                            >
                                <i className="fas fa-trash-can text-sm" />
                            </button>
                        </div>
                        
                        {/* Certificate File Input / Viewer */}
                        <div className="sm:col-span-12 mt-2 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-3">
                            <label className={`relative inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors shadow-sm ${(q.certificateStatus === 'approved' || q.certificateStatus === 'rejected') ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                                <i className="fas fa-file-upload" />
                                <span>{q.file ? q.file.name : 'Upload Certificate'}</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,image/*"
                                    disabled={q.certificateStatus === 'approved' || q.certificateStatus === 'rejected'}
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleUpdateItem(q.id, 'file', e.target.files[0] as any);
                                        }
                                    }}
                                />
                            </label>
                            
                            {q.file && (
                                <a 
                                    href={URL.createObjectURL(q.file)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                    <i className="fas fa-eye" />
                                    <span>Preview Local File</span>
                                </a>
                            )}
                            
                            {q.certificateUrl && (
                                <a 
                                    href={`${process.env.NEXT_PUBLIC_API_URL}${q.certificateUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <i className="fas fa-external-link-alt" />
                                    <span>View Certificate</span>
                                </a>
                            )}
                            
                            {q.certificateStatus && (
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                                    q.certificateStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                    q.certificateStatus === 'rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                                    'bg-amber-50 text-amber-600 border border-amber-200'
                                }`}>
                                    Status: {q.certificateStatus}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}