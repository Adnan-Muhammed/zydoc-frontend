'use client';

import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

export default function CertificatesSection({ initialData }: { initialData: any[] }) {
    const [retained, setRetained] = useState<string[]>(initialData || []);
    
    useEffect(() => {
        setRetained(initialData || []);
    }, [initialData]);

    const [staged, setStaged] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) { 
            setStaged([...staged, ...Array.from(e.target.files)]);
        }
    };

    const handleUpload = async () => {
        setLoading(true);
        const dataPayload = new FormData();
        dataPayload.append('retainedCertificates', JSON.stringify(retained));
        staged.forEach(f => dataPayload.append('certificates', f));

        try {
            const res = await axiosInstance.post('/doctor/profile/certificates', dataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data?.success) {
                alert('Documents appended successfully!');
                setRetained([...retained, ...staged.map(f => f.name)]);
                setStaged([]);
            } else {
                alert(res.data?.message || 'Error uploading documents.');
            }
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-file-pdf text-indigo-500 text-xs" /> Verification Documents
                </h3>
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <i className="text-indigo-500 text-xs" /> will update later 
                </h3>
                <button 
                    type="button" 
                    onClick={handleUpload} 
                    disabled={staged.length === 0 || loading} 
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all hover:bg-indigo-700 shadow-sm active:scale-95"
                >
                    {loading ? 'Uploading...' : 'Upload New Files'}
                </button>
            </div>
            
            <div className="space-y-3">
                <input 
                    type="file" 
                    ref={fileRef} 
                    multiple 
                    onChange={handleFileSelection} 
                    className="hidden" 
                    accept=".pdf,image/*" 
                />
                
                <div 
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-indigo-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-all group"
                >
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-cloud-arrow-up text-lg" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700">Click to Browse Files</p>
                        <p className="text-[10px] text-slate-400 mt-1">Supports PDF or Image formats. Maximum 5MB per file.</p>
                    </div>
                </div>
            </div>

            {/* File Render Grid Area mapped strictly via your original API states */}
            {(retained.length > 0 || staged.length > 0) && (
                <div className="space-y-2.5 pt-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Documents</h4>
                    
                    {/* 1. Retained Files Loop */}
                    {retained.map((f, idx) => (
                        <div key={`retained-${idx}`} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white text-xs shadow-sm group">
                            <div className="flex items-center gap-3 text-slate-700 font-medium truncate">
                                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                    <i className="fas fa-file-pdf" />
                                </div>
                                <span className="truncate">{f}</span>
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">Active</span>
                            </div>
                            <button
                                type="button" 
                                onClick={() => setRetained(retained.filter((_, i) => i !== idx))} 
                                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                title="Remove active document"
                            >
                                <i className="fas fa-xmark" />
                            </button>
                        </div>
                    ))}

                    {/* 2. Staged Files Loop */}
                    {staged.map((f, idx) => (
                        <div key={`staged-${idx}`} className="flex items-center justify-between p-3 border border-dashed border-indigo-300 rounded-xl bg-indigo-50/50 text-xs shadow-sm">
                            <div className="flex items-center gap-3 text-slate-700 font-medium truncate">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                    <i className="fas fa-file-circle-plus" />
                                </div>
                                <span className="truncate text-indigo-800 font-semibold">{f.name}</span>
                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">Pending Upload</span>
                            </div>
                            <button
                                type="button" 
                                onClick={() => setStaged(staged.filter((_, i) => i !== idx))} 
                                className="w-8 h-8 rounded-lg text-indigo-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all"
                                title="Remove staged document"
                            >
                                <i className="fas fa-xmark" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}