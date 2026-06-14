// 'use client';

// import React, { useState } from 'react';

// export default function BasicInfoSection({ initialData }: { initialData: any }) {
//     const [data, setData] = useState({
//         firstName: initialData.firstName ?? '',
//         lastName: initialData.lastName ?? '',
//         phone: initialData.phone ?? '',
//         yearsOfExperience: initialData.yearsOfExperience ?? '',
//         bio: initialData.bio ?? ''
//     });
//     const [loading, setLoading] = useState(false);

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             const res = await fetch('/api/doctor/profile/basic-info', {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(data),
//             });
//             if (res.ok) alert('Basic details updated successfully!');
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
//                     <i className="fas fa-user text-indigo-500 text-xs" /> Basic Information
//                 </h3>
//                 <button
//                     type="button" onClick={handleSave} disabled={loading}
//                     className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
//                 >
//                     {loading ? 'Saving...' : 'Save Section'}
//                 </button>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                     <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
//                     <input
//                         type="text" value={data.firstName}
//                         onChange={e => setData({ ...data, firstName: e.target.value })}
//                         className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
//                     />
//                 </div>
//                 <div className="space-y-1">
//                     <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
//                     <input
//                         type="text" value={data.lastName}
//                         onChange={e => setData({ ...data, lastName: e.target.value })}
//                         className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
//                     />
//                 </div>
//                 <div className="space-y-1">
//                     <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
//                     <input
//                         type="text" value={data.phone}
//                         onChange={e => setData({ ...data, phone: e.target.value })}
//                         className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
//                     />
//                 </div>
//                 <div className="space-y-1">
//                     <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Years of Experience</label>
//                     <input
//                         type="number" value={data.yearsOfExperience}
//                         onChange={e => setData({ ...data, yearsOfExperience: e.target.value })}
//                         className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
//                     />
//                 </div>
//             </div>
//             <div className="space-y-1">
//                 <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bio</label>
//                 <textarea
//                     value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} rows={3}
//                     className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
//                 />
//             </div>
//         </div>
//     );
// }


'use client';

import React, { useState } from 'react';

export default function BasicInfoSection({ initialData }: { initialData: any }) {
    const [data, setData] = useState({
        firstName: initialData.firstName ?? '',
        lastName: initialData.lastName ?? '',
        phone: initialData.phone ?? '',
        yearsOfExperience: initialData.yearsOfExperience ?? '',
        bio: initialData.bio ?? ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/doctor/profile/basic-info', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) alert('Basic details updated successfully!');
        } catch (err) {
            console.error(err);
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
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
                >
                    {loading ? 'Saving...' : 'Save Section'}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
                    <input
                        type="text" value={data.firstName}
                        onChange={e => setData({ ...data, firstName: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                    <input
                        type="text" value={data.lastName}
                        onChange={e => setData({ ...data, lastName: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                    <input
                        type="text" value={data.phone}
                        onChange={e => setData({ ...data, phone: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Years of Experience</label>
                    <input
                        type="number" value={data.yearsOfExperience}
                        onChange={e => setData({ ...data, yearsOfExperience: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bio</label>
                <textarea
                    value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} rows={3}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
                />
            </div>
        </div>
    );
}