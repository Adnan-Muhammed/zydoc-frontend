'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Qualification {
    id: string;
    degree: string;
    institution: string;
    year: string;
}

interface WorkingHourSlot {
    start: string;
    end: string;
    active: boolean;
}

interface WorkingHours {
    mondayToFriday: WorkingHourSlot;
    saturday: WorkingHourSlot;
    sunday: WorkingHourSlot;
}

interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    bio: string;
    specialty: string;
    licenseNumber: string;
    yearsOfExperience: string;
    enablePhysical: boolean;
    enableVideo: boolean;
    clinicName: string;
    clinicAddress: string;
    physicalFee: string;
    videoFee: string;
    expertiseTags: string[];
    selectedLanguages: string[];
    qualifications: Qualification[];
    workingHours: WorkingHours;
}

const AVAILABLE_LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Kannada', 'Arabic'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DoctorProfileEditPage() {
    // 1. Initial State Pre-loaded with your exact initial dummy data payload
    const [formData, setFormData] = useState<FormData>({
        firstName: "arif",
        lastName: "ali",
        phone: "+911234567821",
        bio: "",
        specialty: "Neurology",
        licenseNumber: "TCMC/64219/2123",
        yearsOfExperience: "10",
        clinicAddress: "",
        clinicName: "",
        enablePhysical: false,
        enableVideo: true,
        expertiseTags: [
            "Stroke Management",
            "Epilepsy Treatment",
            "Headache & Migraine Care",
            "Parkinson’s Disease Management",
            "Neuromuscular Disorders",
        ],
        physicalFee: "150",
        videoFee: "800",
        selectedLanguages: ["English", "Malayalam", "Hindi"],
        qualifications: [
            {
                id: "1779444167761",
                degree: "MD General Medicine",
                institution: "Government Medical College Thiruvananthapuram",
                year: "2015",
            },
            {
                id: "1779444204504",
                degree: "DM Neurology",
                institution: "All India Institute of Medical Sciences",
                year: "2018",
            },
            {
                id: "1779444224026",
                degree: "Fellowship in Stroke & Neurocritical Care",
                institution: "Sree Chitra Tirunal Institute for Medical Sciences and Technology",
                year: "2020",
            },
        ],
        workingHours: {
            mondayToFriday: { start: "09:00", end: "17:00", active: true },
            saturday: { start: "10:00", end: "14:00", active: true },
            sunday: { start: "00:00", end: "00:00", active: false },
        },
    });

    // File handling states (accumulating instead of replacing)
    const [existingCertificates, setExistingCertificates] = useState<string[]>([
        'TCMC_Registration_Certificate.pdf',
    ]);
    const [newCertificates, setNewCertificates] = useState<File[]>([]);
    const [newTagInput, setNewTagInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Input Handlers ──────────────────────────────────────────────────────────
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: keyof FormData) => {
        setFormData(prev => ({ ...prev, [name]: !prev[name] as any }));
    };

    // ─── Expertise Tags Handlers ─────────────────────────────────────────────────
    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTagInput.trim() && !formData.expertiseTags.includes(newTagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                expertiseTags: [...prev.expertiseTags, newTagInput.trim()]
            }));
            setNewTagInput('');
        }
    };

    const handleRemoveTag = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            expertiseTags: prev.expertiseTags.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    // ─── Languages Handlers ──────────────────────────────────────────────────────
    const handleToggleLanguage = (lang: string) => {
        setFormData(prev => {
            const current = prev.selectedLanguages;
            const updated = current.includes(lang)
                ? current.filter(l => l !== lang)
                : [...current, lang];
            return { ...prev, selectedLanguages: updated };
        });
    };

    // ─── Qualifications Dynamic Handlers ──────────────────────────────────────────
    const handleQualificationChange = (id: string, key: keyof Qualification, value: string) => {
        setFormData(prev => ({
            ...prev,
            qualifications: prev.qualifications.map(q => q.id === id ? { ...q, [key]: value } : q)
        }));
    };

    const handleAddQualification = () => {
        const newQual: Qualification = {
            id: Date.now().toString(),
            degree: '',
            institution: '',
            year: new Date().getFullYear().toString()
        };
        setFormData(prev => ({ ...prev, qualifications: [...prev.qualifications, newQual] }));
    };

    const handleRemoveQualification = (id: string) => {
        setFormData(prev => ({
            ...prev,
            qualifications: prev.qualifications.filter(q => q.id !== id)
        }));
    };

    // ─── Working Hours Handlers ──────────────────────────────────────────────────
    const handleWorkingHoursChange = (dayKey: keyof WorkingHours, key: keyof WorkingHourSlot, value: any) => {
        setFormData(prev => ({
            ...prev,
            workingHours: {
                ...prev.workingHours,
                [dayKey]: {
                    ...prev.workingHours[dayKey],
                    [key]: value
                }
            }
        }));
    };

    // ─── Certificate Accumulation Handlers ───────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Append incoming files to current queue instead of overwriting
            setNewCertificates(prev => [...prev, ...filesArray]);
        }
    };

    const handleRemoveNewFile = (indexToRemove: number) => {
        setNewCertificates(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleRemoveExistingFile = (indexToRemove: number) => {
        setExistingCertificates(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // ─── Form Submission Logic ───────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Building complete payload for dynamic backend updates/multipart forms
        const submissionPayload = new FormData();
        submissionPayload.append('doctorData', JSON.stringify(formData));
        submissionPayload.append('retainedCertificates', JSON.stringify(existingCertificates));
        
        newCertificates.forEach((file) => {
            submissionPayload.append('certificates', file);
        });

        console.log("Submitting dynamic updates payload:", formData);
        console.log("Accumulated new binary files:", newCertificates);
        alert('Profile change saved successfully!');
    };

    return (
        <div className="min-h-screen bg-[#eef0f8] p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Edit Professional Profile</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Update configuration metrics, clinical settings, and verification documents.</p>
                    </div>
                    <Link
                        href="/doctor/profile"
                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
                    >
                        Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SECTION 1: Personal Coordinates */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <i className="fas fa-user text-indigo-500 text-xs" /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
                                <input
                                    type="text" name="firstName" value={formData.firstName} onChange={handleTextChange}
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800" required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                                <input
                                    type="text" name="lastName" value={formData.lastName} onChange={handleTextChange}
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800" required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Vector</label>
                                <input
                                    type="text" name="phone" value={formData.phone} onChange={handleTextChange}
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800" required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Years of Experience</label>
                                <input
                                    type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleTextChange}
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800" required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Summary / Bio</label>
                            <textarea
                                name="bio" value={formData.bio} onChange={handleTextChange} rows={3} placeholder="Provide descriptive clinical summary info..."
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
                            />
                        </div>
                    </div>

                    {/* SECTION 2: Channels & Channel Fees */}


                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <i className="fas fa-stethoscope text-indigo-500 text-xs" /> Consultation Channel Matrix
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Telehealth Switch Box */}
                            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-video text-indigo-500 text-xs" />
                                        <span className="text-xs font-bold text-slate-700">Video Telehealth</span>
                                    </div>
                                    <input
                                        type="checkbox" checked={formData.enableVideo} onChange={() => handleCheckboxChange('enableVideo')}
                                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                    />
                                </div>
                                {formData.enableVideo && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Video Session Fee (₹)</label>
                                        <input
                                            type="number" name="videoFee" value={formData.videoFee} onChange={handleTextChange}
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
                                        type="checkbox" checked={formData.enablePhysical} onChange={() => handleCheckboxChange('enablePhysical')}
                                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                                    />
                                </div>
                                {formData.enablePhysical && (
                                    <div className="space-y-3 animation-fade-in">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Physical Session Fee (₹)</label>
                                            <input
                                                type="number" name="physicalFee" value={formData.physicalFee} onChange={handleTextChange}
                                                className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Name</label>
                                            <input
                                                type="text" name="clinicName" value={formData.clinicName} onChange={handleTextChange} placeholder="e.g. Neuro Care Hub"
                                                className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Address</label>
                                            <input
                                                type="text" name="clinicAddress" value={formData.clinicAddress} onChange={handleTextChange} placeholder="Street, City, Pin"
                                                className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>







                    {/* SECTION 3: Dynamic Qualifications Framework */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <i className="fas fa-graduation-cap text-indigo-500 text-xs" /> Education & Qualifications
                            </h3>
                            <button
                                type="button" onClick={handleAddQualification}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-all"
                            >
                                <i className="fas fa-plus text-[10px]" /> Add Qualification
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.qualifications.map((q, idx) => (
                                <div key={q.id} className="group relative p-4 rounded-xl border border-slate-100 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                    <div className="sm:col-span-4 space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Degree/Certificate</label>
                                        <input
                                            type="text" value={q.degree} onChange={(e) => handleQualificationChange(q.id, 'degree', e.target.value)} placeholder="e.g. DM Neurology"
                                            className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none bg-white" required
                                        />
                                    </div>
                                    <div className="sm:col-span-5 space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Institution / University</label>
                                        <input
                                            type="text" value={q.institution} onChange={(e) => handleQualificationChange(q.id, 'institution', e.target.value)} placeholder="e.g. AIIMS"
                                            className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none bg-white" required
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Year</label>
                                        <input
                                            type="number" value={q.year} onChange={(e) => handleQualificationChange(q.id, 'year', e.target.value)}
                                            className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none bg-white" required
                                        />
                                    </div>
                                    <div className="sm:col-span-1 flex justify-center pb-1">
                                        <button
                                            type="button" onClick={() => handleRemoveQualification(q.id)}
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





                    {/* SECTION 4: Languages Selection Matrix */}{/* SECTION 5: Expertise Tags Module */}

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <i className="fas fa-language text-indigo-500 text-xs" /> Languages Spoken (Edit & Toggle)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_LANGUAGES.map((lang) => {
                                const isSelected = formData.selectedLanguages.includes(lang);
                                return (
                                    <button
                                        type="button" key={lang} onClick={() => handleToggleLanguage(lang)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                                            isSelected 
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {lang} {isSelected && <i className="fas fa-check text-[10px] ml-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <i className="fas fa-microscope text-indigo-500 text-xs" /> Areas of Clinical Expertise
                        </h3>
                        
                        {/* Interactive Dynamic Input Tag row */}
                        <div className="flex gap-2 max-w-md">
                            <input
                                type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} placeholder="Add new clinical specialization tag..."
                                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
                            />
                            <button
                                type="button" onClick={handleAddTag}
                                className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 shrink-0 transition-all"
                            >
                                Append Tag
                            </button>
                        </div>

                        {/* Rendering Loop */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {formData.expertiseTags.map((tag, idx) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
                                >
                                    {tag}
                                    <button
                                        type="button" onClick={() => handleRemoveTag(idx)}
                                        className="text-slate-400 hover:text-red-500 font-bold text-[10px] ml-0.5 shrink-0"
                                    >
                                        <i className="fas fa-xmark" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* SECTION 5: Expertise Tags Module */}


                    {/* SECTION 6: Availability Hours Settings */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <i className="fas fa-clock text-indigo-500 text-xs" /> Operational Hours Configuration
                        </h3>
                        <div className="space-y-3">
                            {(Object.keys(formData.workingHours) as Array<keyof WorkingHours>).map((dayKey) => {
                                const slot = formData.workingHours[dayKey];
                                const labelMap: Record<string, string> = {
                                    mondayToFriday: 'Mon – Fri Schedule',
                                    saturday: 'Saturday Hours',
                                    sunday: 'Sunday Hours'
                                };
                                return (
                                    <div key={dayKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-slate-100 rounded-xl bg-slate-50/40 text-xs">
                                        <div className="flex items-center gap-3 sm:w-1/4">
                                            <input
                                                type="checkbox" checked={slot.active} onChange={(e) => handleWorkingHoursChange(dayKey, 'active', e.target.checked)}
                                                className="w-4 h-4 accent-indigo-600 cursor-pointer"
                                            />
                                            <span className="font-bold text-slate-700">{labelMap[dayKey]}</span>
                                        </div>
                                        {slot.active ? (
                                            <div className="flex items-center gap-2 sm:w-3/4 justify-start sm:justify-end">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Start:</span>
                                                    <input
                                                        type="text" value={slot.start} onChange={(e) => handleWorkingHoursChange(dayKey, 'start', e.target.value)}
                                                        className="px-2 py-1 border border-slate-200 rounded-lg text-slate-800 font-bold text-center w-16 focus:outline-none"
                                                    />
                                                </div>
                                                <span className="text-slate-300 mx-1">—</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">End:</span>
                                                    <input
                                                        type="text" value={slot.end} onChange={(e) => handleWorkingHoursChange(dayKey, 'end', e.target.value)}
                                                        className="px-2 py-1 border border-slate-200 rounded-lg text-slate-800 font-bold text-center w-16 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic font-medium sm:w-3/4 text-start sm:text-end">Practice Channel Closed</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 7: Document File Management (Incremental Append) */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-700 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <i className="fas fa-file-pdf text-indigo-500 text-xs" /> Medical Certificates & Licenses
                        </h3>
                        
                        {/* Hidden input trigger wrapper */}
                        <div className="space-y-2">
                            <input
                                type="file" ref={fileInputRef} multiple onChange={handleFileChange} accept=".pdf,image/*"
                                className="hidden"
                            />
                            <button
                                type="button" onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-xl transition-all"
                            >
                                <i className="fas fa-cloud-arrow-up" /> Upload Dynamic Certificates (Add, Not Replace)
                            </button>
                            <p className="text-[10px] text-slate-400">Supports PDF or Image formats. Newly uploaded files accumulate continuously.</p>
                        </div>

                        {/* Combined Retained and Staged File Display Grid */}
                        <div className="space-y-2 pt-2">
                            {/* 1. Retained Files */}
                            {existingCertificates.map((fileName, idx) => (
                                <div key={`existing-${idx}`} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl bg-white text-xs">
                                    <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                                        <i className="fas fa-file-pdf text-red-500 text-sm" />
                                        <span className="truncate">{fileName}</span>
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Active</span>
                                    </div>
                                    <button
                                        type="button" onClick={() => handleRemoveExistingFile(idx)}
                                        className="w-6 h-6 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <i className="fas fa-xmark text-xs" />
                                    </button>
                                </div>
                            ))}

                            {/* 2. Staged/Newly Appended Binary Files */}
                            {newCertificates.map((file, idx) => (
                                <div key={`new-${idx}`} className="flex items-center justify-between p-2.5 border border-dashed border-indigo-200 rounded-xl bg-indigo-50/20 text-xs">
                                    <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                                        <i className="fas fa-file-circle-plus text-indigo-500 text-sm" />
                                        <span className="truncate text-indigo-700 font-semibold">{file.name}</span>
                                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Staged</span>
                                    </div>
                                    <button
                                        type="button" onClick={() => handleRemoveNewFile(idx)}
                                        className="w-6 h-6 text-indigo-400 hover:text-red-500 transition-colors"
                                    >
                                        <i className="fas fa-xmark text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href="/doctor/profile"
                            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-all"
                        >
                            Cancel Changes
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}




