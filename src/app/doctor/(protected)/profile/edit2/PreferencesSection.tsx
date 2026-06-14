// 'use client';

// import React, { useState } from 'react';

// export default function PreferencesSection({ initialLanguages, initialTags }: { initialLanguages: string[], initialTags: string[] }) {
//     const [languages, setLanguages] = useState<string[]>(initialLanguages);
//     const [tags, setTags] = useState<string[]>(initialTags);
//     const [tagInput, setTagInput] = useState('');
//     const [loading, setLoading] = useState(false);

//     const availableLangs = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Arabic'];

//     const toggleLanguage = (lang: string) => {
//         setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
//     };

//     const addTag = () => {
//         if (tagInput.trim() && !tags.includes(tagInput.trim())) {
//             setTags([...tags, tagInput.trim()]);
//             setTagInput('');
//         }
//     };

//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             await fetch('/api/doctor/profile/preferences', {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ selectedLanguages: languages, expertiseTags: tags }),
//             });
//             alert('Languages and Metadata tags updated!');
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
//             <div className="flex items-center justify-between border-b border-slate-50 pb-2">
//                 <h3 className="text-sm font-bold text-slate-700">Taxonomy & Communication</h3>
//                 <button type="button" onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">{loading ? 'Saving...' : 'Save Meta'}</button>
//             </div>
            
//             {/* Languages Layout */}
//             <div className="space-y-2">
//                 <label className="text-[10px] font-bold uppercase text-slate-400">Languages Spoken</label>
//                 <div className="flex flex-wrap gap-2">
//                     {availableLangs.map(l => {
//                         const active = languages.includes(l);
//                         return (
//                             <button type="button" key={l} onClick={() => toggleLanguage(l)} className={`px-3 py-1 text-xs rounded-xl border ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-600'}`}>{l}</button>
//                         );
//                     })}
//                 </div>
//             </div>

//             {/* Tags Layout */}
//             <div className="space-y-2">
//                 <label className="text-[10px] font-bold uppercase text-slate-400">Clinical Focus Tags</label>
//                 <div className="flex gap-2">
//                     <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} className="flex-1 text-xs px-3 py-1.5 border rounded-xl" placeholder="Add specialty focus..." />
//                     <button type="button" onClick={addTag} className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-xl font-bold">Add</button>
//                 </div>
//                 <div className="flex flex-wrap gap-1">
//                     {tags.map((t, idx) => (
//                         <span key={t} className="px-2 py-0.5 bg-slate-100 border text-slate-700 rounded text-xs inline-flex items-center gap-1">
//                             {t} <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== idx))} className="text-slate-400 font-bold">×</button>
//                         </span>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }



'use client';

import React, { useState } from 'react';

export default function PreferencesSection({ initialLanguages, initialTags }: { initialLanguages: string[], initialTags: string[] }) {
    const [languages, setLanguages] = useState<string[]>(initialLanguages);
    const [tags, setTags] = useState<string[]>(initialTags);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);

    const availableLangs = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Arabic'];

    const toggleLanguage = (lang: string) => {
        setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch('/api/doctor/profile/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedLanguages: languages, expertiseTags: tags }),
            });
            alert('Languages and Metadata tags updated!');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        //     <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        //         <h3 className="text-sm font-bold text-slate-700">Taxonomy & Communication</h3>
        //         <button type="button" onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">{loading ? 'Saving...' : 'Save Meta'}</button>
        //     </div>
            
        //     {/* Languages Layout */}
        //     <div className="space-y-2">
        //         <label className="text-[10px] font-bold uppercase text-slate-400">Languages Spoken</label>
        //         <div className="flex flex-wrap gap-2">
        //             {availableLangs.map(l => {
        //                 const active = languages.includes(l);
        //                 return (
        //                     <button type="button" key={l} onClick={() => toggleLanguage(l)} className={`px-3 py-1 text-xs rounded-xl border ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-600'}`}>{l}</button>
        //                 );
        //             })}
        //         </div>
        //     </div>

        //     {/* Tags Layout */}
        //     <div className="space-y-2">
        //         <label className="text-[10px] font-bold uppercase text-slate-400">Clinical Focus Tags</label>
        //         <div className="flex gap-2">
        //             <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} className="flex-1 text-xs px-3 py-1.5 border rounded-xl" placeholder="Add specialty focus..." />
        //             <button type="button" onClick={addTag} className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-xl font-bold">Add</button>
        //         </div>
        //         <div className="flex flex-wrap gap-1">
        //             {tags.map((t, idx) => (
        //                 <span key={t} className="px-2 py-0.5 bg-slate-100 border text-slate-700 rounded text-xs inline-flex items-center gap-1">
        //                     {t} <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== idx))} className="text-slate-400 font-bold">×</button>
        //                 </span>
        //             ))}
        //         </div>
        //     </div>
        // </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
    {/* Main Single Card Header */}
    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-tags text-indigo-500 text-xs" /> Taxonomy & Communication
        </h3>
        <button 
            type="button" 
            onClick={handleSave} 
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
            {loading ? 'Saving...' : 'Save Meta'}
        </button>
    </div>
    
    {/* Languages Section Layout */}
    <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-language text-indigo-500 text-xs" /> Languages Spoken (Edit & Toggle)
        </h4>
        <div className="flex flex-wrap gap-2">
            {availableLangs.map((l) => {
                const active = languages.includes(l);
                return (
                    <button
                        type="button" 
                        key={l} 
                        onClick={() => toggleLanguage(l)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                            active 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        {l} {active && <i className="fas fa-check text-[10px] ml-1" />}
                    </button>
                );
            })}
        </div>
    </div>

    {/* Clinical Focus Tags Section Layout */}
    <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <i className="fas fa-microscope text-indigo-500 text-xs" /> Areas of Clinical Expertise
        </h4>
        
        {/* Interactive Dynamic Input Tag row */}
        <div className="flex gap-2 max-w-md">
            <input
                type="text" 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)} 
                placeholder="Add new clinical specialization tag..."
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
            />
            <button
                type="button" 
                onClick={addTag}
                className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 shrink-0 transition-all"
            >
                Append Tag
            </button>
        </div>

        {/* Rendering Loop */}
        <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((t, idx) => (
                <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
                >
                    {t}
                    <button
                        type="button" 
                        onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 font-bold text-[10px] ml-0.5 shrink-0 transition-colors"
                    >
                        <i className="fas fa-xmark" />
                    </button>
                </span>
            ))}
        </div>
    </div>
</div>

    );
}