'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import { DraftState, Qualification } from './types';
import { SYSTEMS_LIST, getSystemConfigById } from '@/constants/systemsOfMedicine';

const AVAILABLE_LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Spanish', 'French'];

interface StepCredentialsSectionProps {
    draft: Pick<
        DraftState, 
        'systemOfMedicine' | 'specialty' | 'licenseNumber' | 'yearsOfExperience' | 'expertiseTags' | 'qualifications' | 'selectedLanguages'
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
    const {
        systemOfMedicine = 'Modern Medicine',
        specialty,
        licenseNumber,
        yearsOfExperience,
        expertiseTags,
        qualifications,
        selectedLanguages,
    } = draft;

    const currentSystemConfig = getSystemConfigById(systemOfMedicine);

    const handleSystemChange = (newSystemId: string) => {
        if (newSystemId !== systemOfMedicine) {
            setDraft({
                systemOfMedicine: newSystemId,
                specialty: '', // Automatically reset to avoid mismatched data
            });
        }
    };

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
                {/* System of Medicine Selection */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                System of Medicine *
                            </label>
                            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                                Select your clinical discipline to adapt specialty focuses and licensing details
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                            {currentSystemConfig.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
                        {SYSTEMS_LIST.map((sys) => {
                            const isSelected = (systemOfMedicine || 'Modern Medicine') === sys.id;
                            return (
                                <button
                                    type="button"
                                    key={sys.id}
                                    onClick={() => handleSystemChange(sys.id)}
                                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition select-none shadow-xs flex flex-col justify-between gap-1.5 focus:outline-hidden ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold ring-2 ring-blue-500/20'
                                            : 'border-slate-200 dark:border-[#24274d] text-slate-600 dark:text-slate-400 bg-white dark:bg-[#151732] hover:bg-slate-50 dark:hover:bg-[#1a1c3d]/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full gap-1">
                                        <span className="text-xs sm:text-sm font-bold truncate">
                                            {sys.id}
                                        </span>
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-500 text-white'
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}
                                        >
                                            {isSelected && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 font-normal">
                                        {sys.id === 'Modern Medicine' ? 'Allopathy' : `${sys.specialties.length} Specialties`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-2 sm:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Primary Specialty Area *
                        </label>
                        <select
                            value={specialty}
                            onChange={(e) => setDraft({ specialty: e.target.value })}
                            required
                            className="w-full rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition h-[46px] font-medium"
                        >
                            <option value="">Choose {currentSystemConfig.id} Specialty</option>
                            {currentSystemConfig.specialties.map((spec) => (
                                <option key={spec} value={spec}>
                                    {spec}
                                </option>
                            ))}
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
                        label={`${currentSystemConfig.licenseLabel} *`}
                        value={licenseNumber}
                        onChange={(e) => setDraft({ licenseNumber: e.target.value })}
                        placeholder={
                            currentSystemConfig.id === 'Modern Medicine'
                                ? 'e.g. KMC-REG-2026X'
                                : currentSystemConfig.id === 'Dentistry'
                                ? 'e.g. DCI-REG-4581A'
                                : currentSystemConfig.id === 'Ayurveda'
                                ? 'e.g. NCISM-AYUR-12049'
                                : currentSystemConfig.id === 'Homeopathy'
                                ? 'e.g. NCH-HOM-88321'
                                : 'e.g. RCI-PSY-09923'
                        }
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
                            <div className="space-y-1.5">
                                <Input
                                    label="Qualification / Fellowship *"
                                    value={newDegree}
                                    onChange={(e) => setNewDegree(e.target.value)}
                                    placeholder={`e.g. ${currentSystemConfig.degreePresets.slice(0, 2).join(' or ')}`}
                                    className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5 font-medium placeholder:font-normal"
                                />
                                {currentSystemConfig.degreePresets.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                        <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Suggestions:</span>
                                        {currentSystemConfig.degreePresets.map((deg) => (
                                            <button
                                                type="button"
                                                key={deg}
                                                onClick={() => setNewDegree(deg)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                                                    newDegree === deg
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'bg-white dark:bg-[#151732] text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-[#24274d]'
                                                }`}
                                            >
                                                {deg}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
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
