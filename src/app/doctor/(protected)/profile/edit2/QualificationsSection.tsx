// 'use client';

// import React, { useState } from 'react';

// export default function QualificationsSection({ initialData }: { initialData: any[] }) {
//     const [list, setList] = useState(initialData);
//     const [loading, setLoading] = useState(false);

//     const handleUpdateItem = (id: string, field: string, val: string) => {
//         setList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
//     };

//     const handleAddItem = () => {
//         setList([...list, { id: Date.now().toString(), degree: '', institution: '', year: '2026' }]);
//     };

//     const handleRemoveItem = (id: string) => {
//         setList(prev => prev.filter(item => item.id !== id));
//     };

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             await fetch('/api/doctor/profile/qualifications', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ qualifications: list }),
//             });
//             alert('Qualifications database synced.');
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
//                     <i className="fas fa-graduation-cap text-indigo-500 text-xs" /> Education Framework
//                 </h3>
//                 <div className="flex gap-2">
//                     <button type="button" onClick={handleAddItem} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">+ Add</button>
//                     <button type="button" onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">{loading ? 'Syncing...' : 'Sync Items'}</button>
//                 </div>
//             </div>
//             <div className="space-y-3">
//                 {list.map((q) => (
//                     <div key={q.id} className="p-3 border rounded-xl bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-end">
//                         <input type="text" value={q.degree} onChange={e => handleUpdateItem(q.id, 'degree', e.target.value)} placeholder="Degree" className="text-xs p-2 border rounded-lg bg-white flex-1" />
//                         <input type="text" value={q.institution} onChange={e => handleUpdateItem(q.id, 'institution', e.target.value)} placeholder="Institution" className="text-xs p-2 border rounded-lg bg-white flex-1" />
//                         <input type="number" value={q.year} onChange={e => handleUpdateItem(q.id, 'year', e.target.value)} className="text-xs p-2 border rounded-lg bg-white w-20 text-center" />
//                         <button type="button" onClick={() => handleRemoveItem(q.id)} className="p-2 bg-red-50 text-red-500 rounded-lg border border-red-100"><i className="fas fa-trash-can" /></button>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }





'use client';

import React, { useState } from 'react';

export default function QualificationsSection({ initialData }: { initialData: any[] }) {
    const [list, setList] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const handleUpdateItem = (id: string, field: string, val: string) => {
        setList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    const handleAddItem = () => {
        setList([...list, { id: Date.now().toString(), degree: '', institution: '', year: '2026' }]);
    };

    const handleRemoveItem = (id: string) => {
        setList(prev => prev.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch('/api/doctor/profile/qualifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qualifications: list }),
            });
            alert('Qualifications database synced.');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        //     <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        //         <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
        //             <i className="fas fa-graduation-cap text-indigo-500 text-xs" /> Education Framework
        //         </h3>
        //         <div className="flex gap-2">
        //             <button type="button" onClick={handleAddItem} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">+ Add</button>
        //             <button type="button" onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">{loading ? 'Syncing...' : 'Sync Items'}</button>
        //         </div>
        //     </div>
        //     <div className="space-y-3">
        //         {list.map((q) => (
        //             <div key={q.id} className="p-3 border rounded-xl bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-end">
        //                 <input type="text" value={q.degree} onChange={e => handleUpdateItem(q.id, 'degree', e.target.value)} placeholder="Degree" className="text-xs p-2 border rounded-lg bg-white flex-1" />
        //                 <input type="text" value={q.institution} onChange={e => handleUpdateItem(q.id, 'institution', e.target.value)} placeholder="Institution" className="text-xs p-2 border rounded-lg bg-white flex-1" />
        //                 <input type="number" value={q.year} onChange={e => handleUpdateItem(q.id, 'year', e.target.value)} className="text-xs p-2 border rounded-lg bg-white w-20 text-center" />
        //                 <button type="button" onClick={() => handleRemoveItem(q.id)} className="p-2 bg-red-50 text-red-500 rounded-lg border border-red-100"><i className="fas fa-trash-can" /></button>
        //             </div>
        //         ))}
        //     </div>
        // </div>
    
    
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
    {/* Header Actions matching the first snippet's dual-button functionality */}
    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-graduation-cap text-indigo-500 text-xs" /> Education Framework
        </h3>
        <div className="flex items-center gap-2">
            <button 
                type="button" 
                onClick={handleAddItem} 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-all"
            >
                <i className="fas fa-plus text-[10px]" /> Add Item
            </button>
            <button 
                type="button" 
                onClick={handleSave} 
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
                {loading ? 'Syncing...' : 'Sync Items'}
            </button>
        </div>
    </div>

    {/* Map List Block styling pulled completely from the second snippet */}
    <div className="space-y-3">
        {list.map((q) => (
            <div key={q.id} className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                
                {/* Degree / Certificate Input */}
                <div className="sm:col-span-4 space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Degree/Certificate</label>
                    <input
                        type="text" 
                        value={q.degree} 
                        onChange={e => handleUpdateItem(q.id, 'degree', e.target.value)} 
                        placeholder="e.g. DM Neurology" 
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none bg-white" 
                        required
                    />
                </div>

                {/* Institution Input */}
                <div className="sm:col-span-5 space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Institution / University</label>
                    <input
                        type="text" 
                        value={q.institution} 
                        onChange={e => handleUpdateItem(q.id, 'institution', e.target.value)} 
                        placeholder="e.g. AIIMS" 
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none bg-white" 
                        required
                    />
                </div>

                {/* Year Input */}
                <div className="sm:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Year</label>
                    <input
                        type="number" 
                        value={q.year} 
                        onChange={e => handleUpdateItem(q.id, 'year', e.target.value)} 
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none bg-white text-center" 
                        required
                    />
                </div>

                {/* Delete Button Container */}
                <div className="sm:col-span-1 flex justify-center pb-1">
                    <button
                        type="button" 
                        onClick={() => handleRemoveItem(q.id)} 
                        className="w-8 h-8 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"
                        title="Remove item"
                    >
                        <i className="fas fa-trash-can text-xs" />
                    </button>
                </div>

            </div>
        ))}
    </div>
</div>
    
    );
}