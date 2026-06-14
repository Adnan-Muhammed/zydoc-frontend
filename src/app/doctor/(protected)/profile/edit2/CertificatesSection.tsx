// 'use client';

// import React, { useState, useRef } from 'react';

// export default function CertificatesSection() {
//     const [retained, setRetained] = useState<string[]>(['TCMC_Registration_Certificate.pdf']);
//     const [staged, setStaged] = useState<File[]>([]);
//     const [loading, setLoading] = useState(false);
//     const fileRef = useRef<HTMLInputElement>(null);

//     const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files) {
//             setStaged([...staged, ...Array.from(e.target.files)]);
//         }
//     };

//     const handleUpload = async () => {
//         setLoading(true);
//         const dataPayload = new FormData();
//         dataPayload.append('retainedCertificates', JSON.stringify(retained));
//         staged.forEach(f => dataPayload.append('certificates', f));

//         try {
//             const res = await fetch('/api/doctor/profile/certificates', {
//                 method: 'POST',
//                 body: dataPayload // Handled as multi-part binary stream
//             });
//             if (res.ok) {
//                 alert('Documents appended successfully!');
//                 setStaged([]);
//             }
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
//             <div className="flex items-center justify-between border-b border-slate-50 pb-2">
//                 <h3 className="text-sm font-bold text-slate-700">Verification Documents</h3>
//                 <button type="button" onClick={handleUpload} disabled={staged.length === 0 || loading} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg disabled:opacity-50">
//                     {loading ? 'Uploading...' : 'Upload New'}
//                 </button>
//             </div>
//             <input type="file" ref={fileRef} multiple onChange={handleFileSelection} className="hidden" accept=".pdf,image/*" />
//             <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 font-bold text-xs">
//                 + Append New Document
//             </button>
//             <div className="space-y-2">
//                 {retained.map((f, idx) => (
//                     <div key={idx} className="flex items-center justify-between p-2 border rounded-xl text-xs bg-white text-slate-700">
//                         <span>{f} (Active)</span>
//                         <button type="button" onClick={() => setRetained(retained.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">×</button>
//                     </div>
//                 ))}
//                 {staged.map((f, idx) => (
//                     <div key={idx} className="flex items-center justify-between p-2 border border-dashed border-indigo-200 rounded-xl text-xs bg-indigo-50/20 text-indigo-700">
//                         <span>{f.name} (Staged to Add)</span>
//                         <button type="button" onClick={() => setStaged(staged.filter((_, i) => i !== idx))} className="text-slate-400">×</button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }




'use client';

import React, { useState, useRef } from 'react';

export default function CertificatesSection() {
    const [retained, setRetained] = useState<string[]>(['TCMC_Registration_Certificate.pdf']);
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
            const res = await fetch('/api/doctor/profile/certificates', {
                method: 'POST',
                body: dataPayload // Handled as multi-part binary stream
            });
            if (res.ok) {
                alert('Documents appended successfully!');
                setStaged([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        //     <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        //         <h3 className="text-sm font-bold text-slate-700">Verification Documents</h3>
        //         <button type="button" onClick={handleUpload} disabled={staged.length === 0 || loading} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg disabled:opacity-50">
        //             {loading ? 'Uploading...' : 'Upload New'}
        //         </button>
        //     </div>
        //     <input type="file" ref={fileRef} multiple onChange={handleFileSelection} className="hidden" accept=".pdf,image/*" />
        //     <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 font-bold text-xs">
        //         + Append New Document
        //     </button>
        //     <div className="space-y-2">
        //         {retained.map((f, idx) => (
        //             <div key={idx} className="flex items-center justify-between p-2 border rounded-xl text-xs bg-white text-slate-700">
        //                 <span>{f} (Active)</span>
        //                 <button type="button" onClick={() => setRetained(retained.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">×</button>
        //             </div>
        //         ))}
        //         {staged.map((f, idx) => (
        //             <div key={idx} className="flex items-center justify-between p-2 border border-dashed border-indigo-200 rounded-xl text-xs bg-indigo-50/20 text-indigo-700">
        //                 <span>{f.name} (Staged to Add)</span>
        //                 <button type="button" onClick={() => setStaged(staged.filter((_, i) => i !== idx))} className="text-slate-400">×</button>
        //             </div>
        //         ))}
        //     </div>
        // </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
    {/* Combined Card Header Action Section using first snippet APIs */}
    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-file-pdf text-indigo-500 text-xs" /> Verification Documents
        </h3>
        <button 
            type="button" 
            onClick={handleUpload} 
            disabled={staged.length === 0 || loading} 
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors hover:bg-indigo-700"
        >
            {loading ? 'Uploading...' : 'Upload New'}
        </button>
    </div>
    
    {/* Hidden input trigger block and info text mapping */}
    <div className="space-y-2">
        <input 
            type="file" 
            ref={fileRef} 
            multiple 
            onChange={handleFileSelection} 
            className="hidden" 
            accept=".pdf,image/*" 
        />
        <button
            type="button" 
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-xl transition-all"
        >
            <i className="fas fa-cloud-arrow-up" /> Upload Dynamic Certificates (Add, Not Replace)
        </button>
        <p className="text-[10px] text-slate-400">Supports PDF or Image formats. Newly uploaded files accumulate continuously.</p>
    </div>

    {/* File Render Grid Area mapped strictly via your original API states */}
    <div className="space-y-2 pt-2">
        
        {/* 1. Retained Files Loop */}
        {retained.map((f, idx) => (
            <div key={`retained-${idx}`} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl bg-white text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                    <i className="fas fa-file-pdf text-red-500 text-sm" />
                    <span className="truncate">{f}</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Active</span>
                </div>
                <button
                    type="button" 
                    onClick={() => setRetained(retained.filter((_, i) => i !== idx))} 
                    className="w-6 h-6 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                >
                    <i className="fas fa-xmark text-xs" />
                </button>
            </div>
        ))}

        {/* 2. Staged Files Loop */}
        {staged.map((f, idx) => (
            <div key={`staged-${idx}`} className="flex items-center justify-between p-2.5 border border-dashed border-indigo-200 rounded-xl bg-indigo-50/20 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                    <i className="fas fa-file-circle-plus text-indigo-500 text-sm" />
                    <span className="truncate text-indigo-700 font-semibold">{f.name}</span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Staged</span>
                </div>
                <button
                    type="button" 
                    onClick={() => setStaged(staged.filter((_, i) => i !== idx))} 
                    className="w-6 h-6 text-indigo-400 hover:text-red-500 flex items-center justify-center transition-colors"
                >
                    <i className="fas fa-xmark text-xs" />
                </button>
            </div>
        ))}

    </div>
        </div>
        

    );
}