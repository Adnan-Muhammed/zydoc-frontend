// 'use client';

// import React, { useState } from 'react';

// export default function ConsultationSection({ initialData }: { initialData: any }) {
//     const [video, setVideo] = useState({ enabled: initialData.enableVideo ?? false, fee: initialData.videoFee ?? '0' });
//     const [physical, setPhysical] = useState({
//         enabled: initialData.enablePhysical ?? false,
//         fee: initialData.physicalFee ?? '0',
//         clinicName: initialData.clinicName ?? '',
//         clinicAddress: initialData.clinicAddress ?? ''
//     });
//     const [loading, setLoading] = useState(false);

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             const res = await fetch('/api/doctor/profile/consultation', {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ enableVideo: video.enabled, videoFee: video.fee, enablePhysical: physical.enabled, physicalFee: physical.fee, clinicName: physical.clinicName, clinicAddress: physical.clinicAddress }),
//             });
//             if (res.ok) alert('Consultation pathways saved!');
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
//             <div className="flex items-center justify-between border-b border-slate-50 pb-2">
//                 <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
//                     <i className="fas fa-stethoscope text-indigo-500 text-xs" /> Consultation Matrix
//                 </h3>
//                 <button type="button" onClick={handleSave} disabled={loading} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">
//                     {loading ? 'Saving...' : 'Save Channels'}
//                 </button>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 {/* Telehealth */}
//                 <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
//                     <div className="flex items-center justify-between">
//                         <span className="text-xs font-bold text-slate-700">Video Telehealth</span>
//                         <input type="checkbox" checked={video.enabled} onChange={e => setVideo({ ...video, enabled: e.target.checked })} className="accent-indigo-600" />
//                     </div>
//                     {video.enabled && (
//                         <input type="number" value={video.fee} onChange={e => setVideo({ ...video, fee: e.target.value })} className="w-full text-sm px-3 py-1.5 border rounded-lg" placeholder="Fee" />
//                     )}
//                 </div>
//                 {/* Physical Clinic */}
//                 <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
//                     <div className="flex items-center justify-between">
//                         <span className="text-xs font-bold text-slate-700">In-Person Clinic</span>
//                         <input type="checkbox" checked={physical.enabled} onChange={e => setPhysical({ ...physical, enabled: e.target.checked })} className="accent-emerald-600" />
//                     </div>
//                     {physical.enabled && (
//                         <div className="space-y-2">
//                             <input type="number" value={physical.fee} onChange={e => setPhysical({ ...physical, fee: e.target.value })} className="w-full text-sm px-3 py-1.5 border rounded-lg" placeholder="Fee" />
//                             <input type="text" value={physical.clinicName} onChange={e => setPhysical({ ...physical, clinicName: e.target.value })} className="w-full text-sm px-3 py-1.5 border rounded-lg" placeholder="Clinic Name" />
//                             <input type="text" value={physical.clinicAddress} onChange={e => setPhysical({ ...physical, clinicAddress: e.target.value })} className="w-full text-sm px-3 py-1.5 border rounded-lg" placeholder="Clinic Address" />
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }





'use client';

import React, { useState } from 'react';

export default function ConsultationSection({ initialData }: { initialData: any }) {
    const [video, setVideo] = useState({ enabled: initialData.enableVideo ?? false, fee: initialData.videoFee ?? '0' });
    const [physical, setPhysical] = useState({
        enabled: initialData.enablePhysical ?? false,
        fee: initialData.physicalFee ?? '0',
        clinicName: initialData.clinicName ?? '',
        clinicAddress: initialData.clinicAddress ?? ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/doctor/profile/consultation', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enableVideo: video.enabled, videoFee: video.fee, enablePhysical: physical.enabled, physicalFee: physical.fee, clinicName: physical.clinicName, clinicAddress: physical.clinicAddress }),
            });
            if (res.ok) alert('Consultation pathways saved!');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (





        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
    {/* Header Section with Title and Save Button from the first snippet */}
    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-stethoscope text-indigo-500 text-xs" /> Consultation Channel Matrix
        </h3>
        <button 
            type="button" 
            onClick={handleSave} 
            disabled={loading} 
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
            {loading ? 'Saving...' : 'Save Channels'}
        </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Telehealth Switch Box */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <i className="fas fa-video text-indigo-500 text-xs" />
                    <span className="text-xs font-bold text-slate-700">Video Telehealth</span>
                </div>
                <input
                    type="checkbox" 
                    checked={video.enabled} 
                    onChange={e => setVideo({ ...video, enabled: e.target.checked })} 
                    className="w-4 h-4 accent-indigo-600 cursor-pointer" 
                />
            </div>
            {video.enabled && (
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Video Session Fee (₹)</label>
                    <input 
                        type="number" 
                        value={video.fee} 
                        onChange={e => setVideo({ ...video, fee: e.target.value })} 
                        className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 font-semibold" 
                    />
                </div>
            )}
        </div>

        {/* In-Person Switch Box */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <i className="fas fa-building-medical text-emerald-500 text-xs" />
                    <span className="text-xs font-bold text-slate-700">In-Person Clinic Visits</span>
                </div>
                <input 
                    type="checkbox" 
                    checked={physical.enabled} 
                    onChange={e => setPhysical({ ...physical, enabled: e.target.checked })} 
                    className="w-4 h-4 accent-emerald-600 cursor-pointer" 
                />
            </div>
            {physical.enabled && (
                <div className="space-y-3 animation-fade-in">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Physical Session Fee (₹)</label>
                        <input 
                            type="number" 
                            value={physical.fee} 
                            onChange={e => setPhysical({ ...physical, fee: e.target.value })} 
                            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Name</label>
                        <input 
                            type="text" 
                            value={physical.clinicName} 
                            onChange={e => setPhysical({ ...physical, clinicName: e.target.value })} 
                            placeholder="e.g. Neuro Care Hub" 
                            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Address</label>
                        <input 
                            type="text" 
                            value={physical.clinicAddress} 
                            onChange={e => setPhysical({ ...physical, clinicAddress: e.target.value })} 
                            placeholder="Street, City, Pin" 
                            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800" 
                        />
                    </div>
                </div>
            )}
        </div>

    </div>
</div>
    
    );
}