'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import { DraftState, Qualification } from './types';

const AVAILABLE_LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Spanish', 'French'];

interface StepCredentialsSectionProps {
    draft: Pick<
        DraftState,
        'specialty' | 'licenseNumber' | 'yearsOfExperience' | 'expertiseTags' | 'qualifications' | 'selectedLanguages'
    >;
    setDraft: (updater: Partial<DraftState>) => void;
    serverErrors: { field?: string; message?: string } | null;
    qualificationFiles: Record<string, File>;
    setQualificationFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
}

export default function StepCredentialsSection({
    draft,
    setDraft,
    serverErrors,
    qualificationFiles,
    setQualificationFiles,
}: StepCredentialsSectionProps) {
    const { specialty, licenseNumber, yearsOfExperience, expertiseTags, qualifications, selectedLanguages } = draft;

    const [currentTag, setCurrentTag] = useState('');
    const [newDegree, setNewDegree] = useState('');
    const [newInstitution, setNewInstitution] = useState('');
    const [newYear, setNewYear] = useState('');
    const [newCertificate, setNewCertificate] = useState<File | null>(null);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            const tag = currentTag.trim();
            if (!expertiseTags.includes(tag)) {
                setDraft({ expertiseTags: [...expertiseTags, tag] });
            }
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) =>
        setDraft({ expertiseTags: expertiseTags.filter((t) => t !== tagToRemove) });

    const handleLanguageToggle = (lang: string) =>
        setDraft({
            selectedLanguages: selectedLanguages.includes(lang)
                ? selectedLanguages.filter((l) => l !== lang)
                : [...selectedLanguages, lang],
        });

    const addQualification = () => {
        if (!newDegree || !newInstitution || !newYear) return;
        if (!newCertificate) {
            alert('Please upload a certificate for this qualification.');
            return;
        }
        const id = Date.now().toString();
        setDraft({
            qualifications: [
                ...qualifications,
                { id, degree: newDegree, institution: newInstitution, year: newYear, certificateName: newCertificate?.name },
            ],
        });
        if (newCertificate) {
            setQualificationFiles((prev) => ({ ...prev, [id]: newCertificate! }));
        }
        setNewDegree('');
        setNewInstitution('');
        setNewYear('');
        setNewCertificate(null);
        const fileInput = document.getElementById('qualificationCertInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const removeQualification = (id: string) => {
        setDraft({ qualifications: qualifications.filter((q: Qualification) => q.id !== id) });
        setQualificationFiles((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    return (
        <div className="grid grid-cols-1 gap-6 animate-fade-in items-start py-4 px-2">
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-2 sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Primary Specialty Area *</label>
                        <select
                            value={specialty}
                            onChange={(e) => setDraft({ specialty: e.target.value })}
                            required
                            className="w-full rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition h-[46px] font-medium"
                        >
                            <option value="">Choose Department</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="General Medicine">General Medicine</option>
                        </select>
                    </div>
                    <Input
                        label="Practice Years *"
                        type="number"
                        min="0"
                        value={yearsOfExperience}
                        onChange={(e) => setDraft({ yearsOfExperience: e.target.value })}
                        placeholder="8"
                        className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-3 font-medium placeholder:font-normal"
                        required
                    />
                </div>

                {/* Medical Registration Number */}
                <div className="space-y-1 w-full">
                    <Input
                        label="Medical Registration Number *"
                        value={licenseNumber}
                        onChange={(e) => setDraft({ licenseNumber: e.target.value })}
                        placeholder="KMC-REG-2026X"
                        className={`dark:bg-[#151732] text-sm py-3 font-medium placeholder:font-normal transition ${
                            serverErrors?.field === 'licenseNumber'
                                ? 'border-red-500 dark:border-red-500 ring-2 ring-red-500/10'
                                : 'dark:border-[#24274d]'
                        }`}
                        required
                    />
                    {serverErrors?.field === 'licenseNumber' && (
                        <span className="text-[11px] text-red-500 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                            <i className="fas fa-circle-xmark text-xs" /> {serverErrors.message}
                        </span>
                    )}
                </div>

                {/* Expertise Tags */}
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Areas of Clinical Expertise (Press Enter to add)
                    </label>
                    <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="e.g. Echocardiography, Preventative Care, Hypertension Management"
                        className="w-full rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition placeholder:text-slate-400 font-medium placeholder:font-normal shadow-sm"
                    />
                    {expertiseTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {expertiseTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm animate-fade-in"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        <i className="fas fa-times-circle text-xs"></i>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Qualifications */}
            <div className="space-y-5 border-t border-slate-100 dark:border-[#24274d]/50 pt-5">
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Education &amp; Academic Degrees Matrix</label>
                    {qualifications.length > 0 && ( 
                        <div className="overflow-x-auto border border-slate-200 dark:border-[#24274d] rounded-xl shadow-md max-h-[160px] overflow-y-auto bg-white dark:bg-[#151732]">
                            <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-[#24274d]">
                                <thead className="bg-slate-50 dark:bg-[#1a1c3d]/60 text-slate-500 dark:text-slate-400 text-left font-bold sticky top-0 z-10 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2.5">Degree</th>
                                        <th className="px-4 py-2.5">Institution</th>
                                        <th className="px-4 py-2.5">Year</th>
                                        <th className="px-4 py-2.5">Certificate</th>
                                        <th className="px-4 py-2.5 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#24274d] text-slate-800 dark:text-slate-200 font-medium">
                                    {qualifications.map((q: Qualification) => (
                                        <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a1c3d]/20 transition text-sm">
                                            <td className="px-4 py-2.5 font-bold text-blue-600 dark:text-blue-400">{q.degree}</td>
                                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{q.institution}</td>
                                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{q.year}</td>
                                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                                                {q.certificateName ? (
                                                    <span
                                                        className="flex items-center gap-1.5 text-[11px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded w-max max-w-[120px] truncate"
                                                        title={q.certificateName}
                                                    >
                                                        <i className="fas fa-file-pdf shrink-0"></i>{' '}
                                                        <span className="truncate">{q.certificateName}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeQualification(q.id)}
                                                    className="font-bold text-red-500 hover:text-red-700 transition"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Add Qualification Form */}
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#1a1c3d]/30 border border-slate-200 dark:border-[#24274d] rounded-xl flex flex-col gap-4 shadow-sm animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <Input
                                label="Qualification / Fellowship"
                                value={newDegree}
                                onChange={(e) => setNewDegree(e.target.value)}
                                placeholder="e.g. MD Cardiology"
                                className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5 font-medium placeholder:font-normal"
                            />
                            <Input
                                label="Institution Name"
                                value={newInstitution}
                                onChange={(e) => setNewInstitution(e.target.value)}
                                placeholder="e.g. GMC Trivandrum"
                                className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5 font-medium placeholder:font-normal"
                            />
                            <Input
                                label="Graduation Year"
                                type="number"
                                value={newYear}
                                onChange={(e) => setNewYear(e.target.value)}
                                placeholder="2016"
                                className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5 font-medium placeholder:font-normal"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-slate-200 dark:border-[#24274d] pt-4">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Upload Certificate *</label>
                                <input
                                    id="qualificationCertInput"
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={(e) => setNewCertificate(e.target.files?.[0] || null)}
                                    className="w-full max-w-sm text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-blue-900/30 dark:file:text-blue-400 file:cursor-pointer transition"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addQualification}
                                className="h-[40px] px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-md shrink-0 w-full sm:w-auto"
                            >
                                Add Qualification
                            </button>
                        </div>
                    </div>
                </div>

                {/* Languages */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Languages Spoken *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {AVAILABLE_LANGUAGES.map((lang) => {
                            const isChecked = selectedLanguages.includes(lang);
                            return (
                                <label
                                    key={lang}
                                    className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer text-xs sm:text-sm transition select-none shadow-sm ${
                                        isChecked
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-slate-200 dark:border-[#24274d] text-slate-600 dark:text-slate-400 bg-white dark:bg-[#151732] hover:bg-slate-50 dark:hover:bg-[#1a1c3d]/40'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleLanguageToggle(lang)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 w-4 h-4 transition"
                                    />
                                    <span className="truncate">{lang}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
