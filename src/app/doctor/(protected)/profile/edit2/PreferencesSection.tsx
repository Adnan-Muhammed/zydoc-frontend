'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';

export default function PreferencesSection({ initialLanguages, initialTags }: { initialLanguages: string[], initialTags: string[] }) {
    const [languages, setLanguages] = useState<string[]>(initialLanguages || []);
    const [tags, setTags] = useState<string[]>(initialTags || []);
    
    useEffect(() => {
        setLanguages(initialLanguages || []);
        setTags(initialTags || []);
    }, [initialLanguages, initialTags]);

    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);

    const availableLangs = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Arabic', 'Kannada', 'Telugu'];

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
            const res = await axiosInstance.patch('/doctor/profile/preferences', { selectedLanguages: languages, expertiseTags: tags });
            
            if (res.data?.success) {
                alert('Languages and Metadata tags updated!');
                if (res.data.profile) {
                    if (res.data.profile.languages) setLanguages(res.data.profile.languages);
                    if (res.data.profile.expertiseTags) setTags(res.data.profile.expertiseTags);
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            {/* Main Single Card Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-tags text-indigo-500 text-xs" /> Taxonomy & Communication
                </h3>
                <button 
                    type="button" 
                    onClick={handleSave} 
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
                >
                    {loading ? 'Saving...' : 'Save Meta'}
                </button>
            </div>
            
            {/* Languages Section Layout */}
            <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-language text-indigo-500 text-xs" /> Languages Spoken (Edit & Toggle)
                </h4>
                <div className="flex flex-wrap gap-2.5">
                    {availableLangs.map((l) => {
                        const active = languages.includes(l);
                        return (
                            <button
                                type="button" 
                                key={l} 
                                onClick={() => toggleLanguage(l)}
                                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                                    active 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                                }`}
                            >
                                {l} {active && <i className="fas fa-check text-[10px] ml-1.5" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-50 my-2"></div>

            {/* Clinical Focus Tags Section Layout */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <i className="fas fa-microscope text-indigo-500 text-xs" /> Areas of Clinical Expertise
                </h4>
                
                {/* Interactive Dynamic Input Tag row */}
                <div className="flex gap-2 max-w-md">
                    <input
                        type="text" 
                        value={tagInput} 
                        onChange={e => setTagInput(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add new clinical specialization tag..."
                        className="flex-1 text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all"
                    />
                    <button
                        type="button" 
                        onClick={addTag}
                        className="px-4 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 shrink-0 transition-all shadow-sm active:scale-95"
                    >
                        Append Tag
                    </button>
                </div>

                {/* Rendering Loop */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {tags.length === 0 && <span className="text-xs text-slate-400 italic">No expertise tags added yet.</span>}
                    {tags.map((t, idx) => (
                        <span
                            key={t}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/80 text-indigo-800 border border-indigo-100 text-xs font-semibold shadow-sm"
                        >
                            {t}
                            <button
                                type="button" 
                                onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                                className="text-indigo-400 hover:text-red-500 hover:bg-red-50 rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px] ml-0.5 shrink-0 transition-all"
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