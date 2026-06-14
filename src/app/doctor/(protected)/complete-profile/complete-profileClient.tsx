'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';


import { updateDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import { setCredentials } from '@/redux/auth/authSlice';
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

// ─── Storage Key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'doctor_profile_draft_v1';

// ─── Serialisable form state ──────────────────────────────────────────────────

interface DraftState {
    currentStep: number;
    firstName: string;
    lastName: string;
    phone: string;
    specialty: string;
    licenseNumber: string;
    yearsOfExperience: string;
    bio: string;
    expertiseTags: string[];
    selectedLanguages: string[];
    qualifications: Qualification[];
    enableVideo: boolean;
    videoFee: string;
    enablePhysical: boolean;
    physicalFee: string;
    clinicName: string;
    clinicAddress: string;
    workingHours: WorkingHours;
}

const DEFAULT_DRAFT: DraftState = {
    currentStep: 1,
    firstName: '',
    lastName: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
    bio: '',
    expertiseTags: [],
    selectedLanguages: ['English'],
    qualifications: [],
    enableVideo: true,
    videoFee: '100',
    enablePhysical: false,
    physicalFee: '150',
    clinicName: '',
    clinicAddress: '',
    workingHours: {
        mondayToFriday: { start: '09:00', end: '17:00', active: true },
        saturday: { start: '10:00', end: '14:00', active: true },
        sunday: { start: '00:00', end: '00:00', active: false },
    },
};

// ─── Hook: Draft Management ───────────────────────────────────────────────────

function useDraft() {
    const loadDraft = (): DraftState => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return DEFAULT_DRAFT;
            return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
        } catch {
            return DEFAULT_DRAFT;
        }
    };

    const [draft, setDraftState] = useState<DraftState>(loadDraft);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setDraft = useCallback((updater: Partial<DraftState> | ((prev: DraftState) => DraftState)) => {
        setDraftState((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                } catch {
                    // Fail silently on quota limit
                }
            }, 400);
            return next;
        });
    }, []);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setDraftState(DEFAULT_DRAFT);
    }, []);

    return { draft, setDraft, clearDraft };

}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompleteDoctorProfileClient() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector((state) => state.auth || {});

    const { draft, setDraft, clearDraft } = useDraft();

    const {
        currentStep,
        firstName, lastName, phone,
        specialty, licenseNumber, yearsOfExperience, bio,
        expertiseTags, selectedLanguages, qualifications,
        enableVideo, videoFee,
        enablePhysical, physicalFee, clinicName, clinicAddress,
        workingHours,
    } = draft;

    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null);
    const [governmentId, setGovernmentId] = useState<File | null>(null);
    const [showRestoredBanner, setShowRestoredBanner] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setShowRestoredBanner(true);
        } catch { /* ignore */ }
    }, []);

    const [currentTag, setCurrentTag] = useState('');
    const [newDegree, setNewDegree] = useState('');
    const [newInstitution, setNewInstitution] = useState('');
    const [newYear, setNewYear] = useState('');

    const [serverErrors, setServerErrors] = useState<{ field?: string; message?: string } | null>(null);

    const availableLanguages = ['English', 'Malayalam', 'Hindi', 'Tamil', 'Spanish', 'French'];
    const totalSteps = 4;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onload = (event) => setAvatarPreview(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

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
        setDraft({
            qualifications: [
                ...qualifications,
                { id: Date.now().toString(), degree: newDegree, institution: newInstitution, year: newYear },
            ],
        });
        setNewDegree('');
        setNewInstitution('');
        setNewYear('');
    };

    const removeQualification = (id: string) =>
        setDraft({ qualifications: qualifications.filter((q) => q.id !== id) });

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentStep === 1 && (!firstName || !lastName || !phone)) {
            alert('Please fill out all required personal information fields.');
            return;
        }
        if (currentStep === 2 && (!specialty || !licenseNumber || !yearsOfExperience)) {
            alert('Please complete all professional credential details.');
            return;
        }
        setDraft({ currentStep: Math.min(currentStep + 1, totalSteps) });
    };

    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault();
        setDraft({ currentStep: Math.max(currentStep - 1, 1) });
    };



    // const handleSave = async (e: React.FormEvent) => {
    //     e.preventDefault();
 
    //     try {

    //         const formData = new FormData();

    //         // Files
    //         if (avatar) {
    //             formData.append('avatar', avatar);
    //         }

    //         if (medicalCertificate) {
    //             formData.append('medicalCertificate', medicalCertificate);
    //         }

    //         if (governmentId) {
    //             formData.append('governmentId', governmentId);
    //         }

    //         // JSON Data
    //         const profileData = {
    //             firstName,
    //             lastName,
    //             phone,

    //             specialty,
    //             licenseNumber,
    //             yearsOfExperience: Number(yearsOfExperience),

    //             bio,

    //             expertiseTags,

    //             languages: selectedLanguages,

    //             qualifications,

    //             consultationSettings: {
    //                 video: {
    //                     enabled: enableVideo,
    //                     fee: Number(videoFee),
    //                 },

    //                 physical: {
    //                     enabled: enablePhysical,
    //                     fee: Number(physicalFee),
    //                     clinicName,
    //                     clinicAddress,
    //                 },
    //             },

    //             workingHours,
    //         };

    //         formData.append(
    //             'data',
    //             JSON.stringify(profileData)
    //         );



    //         // Redux Thunk
    //         const resultAction = await dispatch(
    //             updateDoctorProfile(formData)
    //         );

    //         //     if (updateDoctorProfile.fulfilled.match(resultAction)) {


    //         //             console.log('Full payload:', resultAction.payload);        // ← add this
    //         // console.log('User in payload:', resultAction.payload.user); // ← and this



    //         // // update auth user manually
    //         // // dispatch(setCredentials(resultAction.payload.user));
    //         // const updatedUser = resultAction.payload.user;

    //         // // Dispatch and WAIT for state to settle before navigating
    //         // dispatch(setCredentials(updatedUser));

    //         // // Give Redux one tick to commit the state update before navigation
    //         // await new Promise((resolve) => setTimeout(resolve, 0));

    //         // clearDraft();
    //         // router.replace('/doctor/dashboard');


    //         //         // router.push('/doctor/dashboard');
    //         //         router.replace('/doctor/dashboard');

    //         //             // 3. Refresh the Next.js router cache to update layout states
    //         //             // router.refresh()

    //         //             // 4. Push the navigation change into the next event loop tick
    //         // // setTimeout(() => {
    //         // //     router.push('/doctor/dashboard');
    //         // // }, 0);

    //         // // // Force a clean window-level layout refresh directly to the dashboard
    //         // // window.location.href = '/doctor/dashboard';


    //         //     }

    //         if (updateDoctorProfile.fulfilled.match(resultAction)) {
    //             dispatch(setCredentials(resultAction.payload.user));
    //             clearDraft();

    //             // Full navigation so browser sends the new cookie to middleware
    //             window.location.href = '/doctor/dashboard';
    //             // router.push('/doctor/dashboard');
    //             // router.replace('/doctor/dashboard');
    //             // router.refresh();
    //         }

    //         else {

    //             console.log(resultAction.payload);

    //         }

    //     } catch (error) {

    //         console.log(error);

    //     }
    // };



    const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors(null); // Clear previous errors

    try {
        const formData = new FormData();

        // Attach Binary Media Files
        if (avatar) formData.append('avatar', avatar);
        if (medicalCertificate) formData.append('medicalCertificate', medicalCertificate);
        if (governmentId) formData.append('governmentId', governmentId);

        // Standardize Nested Profile Payload
        const profileData = {
            firstName,
            lastName,
            phone,
            specialty,
            licenseNumber,
            yearsOfExperience: Number(yearsOfExperience),
            bio,
            expertiseTags,
            languages: selectedLanguages,
            qualifications,
            consultationSettings: {
                video: { enabled: enableVideo, fee: Number(videoFee) },
                physical: { enabled: enablePhysical, fee: Number(physicalFee), clinicName, clinicAddress },
            },
            workingHours,
        };

        formData.append('data', JSON.stringify(profileData));

        // Dispatch Redux action thunk
        const resultAction = await dispatch(updateDoctorProfile(formData));

        if (updateDoctorProfile.fulfilled.match(resultAction)) {
            dispatch(setCredentials(resultAction.payload.user));
            clearDraft();
            // Perform full reload so the secure cookie is processed by Next.js middleware
            window.location.href = '/doctor/dashboard';
        } else  if (updateDoctorProfile.rejected.match(resultAction)) {
            // ✅ Full typed error object { message, field } from thunk rejectWithValue
            const errorPayload = resultAction.payload as { message: string; field: string | null } | undefined;

            const errorMessage = errorPayload?.message || 'Something went wrong. Please try again.';
            const errorField = errorPayload?.field ?? null;

            setServerErrors({
                field: errorField ?? undefined,
                message: errorMessage,
            });

            // ✅ Auto-navigate to the step containing the duplicate field
            if (errorField === 'phone') {
                setDraft({ currentStep: 1 });
            } else if (errorField === 'licenseNumber') {
                setDraft({ currentStep: 2 });
            }
        }

    } catch (error) {
        console.error('Unexpected layout execution error:', error);
        setServerErrors({ message: 'An unexpected application runtime failure occurred.' });
    }
};

    return (
        <div className="w-full space-y-3 animate-fade-in">

            {/* Draft Status Banner */}
            {showRestoredBanner && (
                <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs shadow-sm">
                    <span className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                        <i className="fas fa-rotate-left text-amber-500"></i>
                        <span>
                            <strong>Progress restored automatically.</strong> Continuing from cached values.
                            {currentStep === 3 && <span className="ml-1 font-medium opacity-90">(Re-select security validation files.)</span>}
                        </span>
                    </span>
                    <button
                        type="button"
                        onClick={() => { clearDraft(); setShowRestoredBanner(false); }}
                        className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded transition"
                    >
                        Start Fresh
                    </button>
                </div>
            )}

            {/* Main Form Box Container */}
            <div className="bg-white dark:bg-[#151732] shadow-sm rounded-2xl border border-slate-200 dark:border-[#24274d] overflow-hidden flex flex-col justify-between">

                {/* Section Header */}
                <div className="px-5 py-4 border-b border-slate-200 dark:border-[#24274d] bg-slate-50/50 dark:bg-[#1a1c3d]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Complete Your Medical Profile</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-5xl">
                            Configure structural practice parameters, specialty clinical focuses, licensing credentials, and calendar scheduling rules.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="text-[10px] font-bold px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20 uppercase tracking-wide">
                            Step {currentStep} of {totalSteps}
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className={`w-6 h-1.5 rounded-full transition-all ${currentStep >= s ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#24274d]'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-4 sm:p-5 flex flex-col justify-between gap-5">

                    {/* ─── STEP 1: IDENTITY CONFIGURATION ─── */}
                    {currentStep === 1 && (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in items-stretch py-3">
        {/* Left Panel: Avatar */}
        <div className="lg:col-span-1 p-5 bg-slate-50 dark:bg-[#1a1c3d]/20 rounded-xl border border-slate-200 dark:border-[#24274d] flex flex-col items-center justify-center text-center h-full min-h-[290px] shadow-sm">
            <div
                onClick={() => document.getElementById('avatarInput')?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group bg-white dark:bg-[#151732] shadow-md mb-4 transition hover:border-blue-500"
            >
                {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center p-2">
                        <i className="fas fa-camera text-slate-400 text-lg"></i>
                        <span className="block text-[10px] text-slate-400 mt-1 font-semibold">Upload Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                    <i className="fas fa-pencil text-white text-sm"></i>
                </div>
                <input type="file" id="avatarInput" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Professional Display Photo</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                Upload clear headshot graphics. Format restrictions apply up to 5 MB (PNG, JPG).
            </p>
        </div>

        {/* Right Panel: Fields */}
        <div className="lg:col-span-3 flex flex-col justify-between space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="First Name *" value={firstName} onChange={(e) => setDraft({ firstName: e.target.value })} placeholder="John" className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5" required />
                <Input label="Last Name *" value={lastName} onChange={(e) => setDraft({ lastName: e.target.value })} placeholder="Smith" className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5" required />
                
                {/* Contact Phone Wrapper with Server-Side Exception Matching */}
                <div className="space-y-1 w-full">
                    <Input 
                        label="Contact Phone *" 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setDraft({ phone: e.target.value })} 
                        placeholder="+91 98765 43210" 
                        className={`dark:bg-[#151732] text-sm py-2.5 transition ${
                            serverErrors?.field === 'phone' 
                                ? 'border-red-500 dark:border-red-500 ring-2 ring-red-500/10' 
                                : 'dark:border-[#24274d]'
                        }`} 
                        required 
                    />
                    {serverErrors?.field === 'phone' && (
                        <span className="text-[11px] text-red-500 font-bold flex items-center gap-1.5 mt-1 animate-fade-in">
                            <i className="fas fa-circle-xmark text-xs" /> {serverErrors.message}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="space-y-2 flex-1 flex flex-col">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Professional Profile Biography</label>
                <textarea
                    rows={7}
                    value={bio}
                    onChange={(e) => setDraft({ bio: e.target.value })}
                    placeholder="Outline clinical strategies, educational focus vectors, specialized treatment alignments, and patient care philosophies..."
                    className="w-full flex-1 rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition placeholder:text-slate-400 resize-none leading-relaxed shadow-sm min-h-[160px]"
                />
            </div>
        </div>
    </div>
)}
                    {/* ─── STEP 1: IDENTITY CONFIGURATION ─── */}
                    {/* ─── STEP 2: CLINICAL CREDENTIALS ─── */}
                    {currentStep === 2 && (
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
                <Input label="Practice Years *" type="number" min="0" value={yearsOfExperience} onChange={(e) => setDraft({ yearsOfExperience: e.target.value })} placeholder="8" className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-3 font-medium placeholder:font-normal" required />
            </div>

            {/* Medical Registration Number with server validation feedback wrapper */}
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

            <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Areas of Clinical Expertise (Press Enter to add)</label>
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
                            <span key={tag} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm animate-fade-in">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                                    <i className="fas fa-times-circle text-xs"></i>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>

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
                                    <th className="px-4 py-2.5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#24274d] text-slate-800 dark:text-slate-200 font-medium">
                                {qualifications.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1a1c3d]/20 transition text-sm">
                                        <td className="px-4 py-2.5 font-bold text-blue-600 dark:text-blue-400">{q.degree}</td>
                                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{q.institution}</td>
                                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{q.year}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <button type="button" onClick={() => removeQualification(q.id)} className="font-bold text-red-500 hover:text-red-700 transition">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#1a1c3d]/30 border border-slate-200 dark:border-[#24274d] rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end shadow-sm animate-fade-in">
                    <Input label="Qualification / Fellowship" value={newDegree} onChange={(e) => setNewDegree(e.target.value)} placeholder="e.g. MD Cardiology" className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5 font-medium placeholder:font-normal" />
                    <Input label="Institution Name" value={newInstitution} onChange={(e) => setNewInstitution(e.target.value)} placeholder="e.g. GMC Trivandrum" className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5 font-medium placeholder:font-normal" />
                    <div className="flex gap-3 items-end w-full">
                        <div className="flex-1">
                            <Input label="Graduation Year" type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} placeholder="2016" className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5 font-medium placeholder:font-normal" />
                        </div>
                        <button type="button" onClick={addQualification} className="h-[44px] px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-md shrink-0">Add</button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Languages Spoken *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {availableLanguages.map((lang) => {
                        const isChecked = selectedLanguages.includes(lang);
                        return (
                            <label key={lang} className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer text-xs sm:text-sm transition select-none shadow-sm ${isChecked ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'border-slate-200 dark:border-[#24274d] text-slate-600 dark:text-slate-400 bg-white dark:bg-[#151732] hover:bg-slate-50 dark:hover:bg-[#1a1c3d]/40'}`}>
                                <input type="checkbox" checked={isChecked} onChange={() => handleLanguageToggle(lang)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 w-4 h-4 transition" />
                                <span className="truncate">{lang}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
)}


                    {/* ─── STEP 3: REGISTRATION VERIFICATION RECORDS ─── */}
                    {currentStep === 3 && (
                        <div className="space-y-5 animate-fade-in py-2 px-1">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-sm text-sky-800 dark:text-sky-300 shadow-sm leading-relaxed">
                                <i className="fas fa-circle-info mt-0.5 shrink-0 text-sky-500 text-lg"></i>
                                <span>Files are processed dynamically and never saved to persistent local caching vectors. If you perform an explicit refresh cycle, attach items below.</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-5 border rounded-xl border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10 flex flex-col justify-between gap-5 shadow-md">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">Medical Council Registration Certificate *</label>
                                            <i className="fas fa-file-pdf text-red-500 text-2xl shrink-0"></i>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Attach verification licensing documents distributed via regional state health boards.</p>
                                    </div>
                                    <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-4">
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setMedicalCertificate(e.target.files?.[0] || null)}
                                            className="w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer transition shadow-md"
                                        />
                                        {medicalCertificate && <span className="block text-xs sm:text-sm text-green-600 dark:text-green-400 font-bold animate-fade-in"><i className="fas fa-check-circle mr-1"></i> Document payload mapped successfully.</span>}
                                    </div>
                                </div>

                                <div className="p-5 border rounded-xl border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#1a1c3d]/10 flex flex-col justify-between gap-5 shadow-md">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">Government Issued Photo ID *</label>
                                            <i className="fas fa-id-card text-blue-500 text-2xl shrink-0"></i>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Attach officially authenticated governmental identification cards (Passport, Drivers License).</p>
                                    </div>
                                    <div className="space-y-2 border-t border-slate-100 dark:border-[#24274d]/40 pt-4">
                                        <input
                                            type="file"
                                            accept=".pdf,image/*"
                                            onChange={(e) => setGovernmentId(e.target.files?.[0] || null)}
                                            className="w-full text-xs sm:text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white file:hover:bg-blue-700 file:cursor-pointer transition shadow-md"
                                        />
                                        {governmentId && <span className="block text-xs sm:text-sm text-green-600 dark:text-green-400 font-bold animate-fade-in"><i className="fas fa-check-circle mr-1"></i> Government identification attached.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 4: FEES & OPERATIONAL HOURS ─── */}
                    {currentStep === 4 && (
                        <div className="space-y-8 animate-fade-in py-2 px-1">

                            {/* Consultation Setup */}
                            <div className="space-y-4">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#24274d] pb-2">Consultation Setup</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* ── Telehealth Card ── */}
                                    <div className={`p-6 rounded-xl border transition-all shadow-md flex flex-col justify-between min-h-[220px] ${enableVideo ? 'border-blue-500/40 bg-blue-500/[0.02]' : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732]'}`}>
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <i className="fas fa-video text-blue-500 text-lg"></i>
                                                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Telehealth</h4>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={enableVideo}
                                                    onChange={(e) => setDraft({ enableVideo: e.target.checked })}
                                                    className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none relative checked:bg-blue-600 before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform cursor-pointer shadow-inner"
                                                />
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-4">Enable virtual consultation visits.</p>
                                        </div>
                                        {enableVideo && (
                                            <Input
                                                label="Fee (INR) *"
                                                type="number"
                                                min="0"
                                                value={videoFee}
                                                onChange={(e) => setDraft({ videoFee: e.target.value })}
                                                className="dark:bg-[#151732] dark:border-[#24274d] text-sm sm:text-base py-3 font-bold"
                                                required
                                            />
                                        )}
                                    </div>

                                    {/* ── In-Person Card ── */}
                                    <div className={`p-6 rounded-xl border transition-all shadow-md flex flex-col justify-between min-h-[220px] ${enablePhysical ? 'border-green-500/40 bg-green-500/[0.01]' : 'border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732]'}`}>
                                        {/* Header & description always visible */}
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <i className="fas fa-building-medical text-green-500 text-lg"></i>
                                                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">In-Person</h4>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={enablePhysical}
                                                    onChange={(e) => setDraft({ enablePhysical: e.target.checked })}
                                                    className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none relative checked:bg-green-600 before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform cursor-pointer shadow-inner"
                                                />
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-4">Enable physical in-clinic visits.</p>
                                        </div>
                                        {/* Expandable fields when enabled */}
                                        {enablePhysical && (
                                            <div className="space-y-4 animate-fade-in border-t border-slate-100 dark:border-[#24274d] pt-4 w-full">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Input
                                                        label="Fee (INR) *"
                                                        type="number"
                                                        min="0"
                                                        value={physicalFee}
                                                        onChange={(e) => setDraft({ physicalFee: e.target.value })}
                                                        className="dark:bg-[#151732] dark:border-[#24274d] text-sm sm:text-base py-3 font-bold"
                                                        required
                                                    />
                                                    <Input
                                                        label="Clinic Title *"
                                                        value={clinicName}
                                                        onChange={(e) => setDraft({ clinicName: e.target.value })}
                                                        placeholder="Metro Health"
                                                        className="dark:bg-[#151732] dark:border-[#24274d] text-sm sm:text-base py-3 font-bold placeholder:font-normal"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Clinic Address *</label>
                                                    <textarea
                                                        rows={2}
                                                        value={clinicAddress}
                                                        onChange={(e) => setDraft({ clinicAddress: e.target.value })}
                                                        placeholder="City, State PIN Code"
                                                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white transition placeholder:text-slate-400 shadow-sm font-bold placeholder:font-normal resize-none"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* Standard Availability Hours */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#24274d] pb-1.5">Standard Availability Hours</h3>
                                <div className="border border-slate-200 dark:border-[#24274d] rounded-xl divide-y divide-slate-200 dark:divide-[#24274d] bg-white dark:bg-[#151732] shadow-md overflow-hidden">
                                    {(Object.entries(workingHours) as [keyof WorkingHours, WorkingHourSlot][]).map(([key, dayData]) => (
                                        <div key={key} className="p-4 sm:p-5 flex items-center justify-between gap-6 text-sm sm:text-base hover:bg-slate-50/40 dark:hover:bg-[#1a1c3d]/10 transition">
                                            <div className="flex items-center gap-4 w-56 shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={dayData.active}
                                                    onChange={(e) => setDraft({ workingHours: { ...workingHours, [key]: { ...dayData, active: e.target.checked } } })}
                                                    className="rounded border-slate-300 text-blue-600 w-5 h-5 shadow-sm focus:ring-blue-500/20 transition"
                                                />
                                                <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </div>

                                            {dayData.active ? (
                                                <div className="flex items-center gap-3 animate-fade-in">
                                                    <input
                                                        type="time"
                                                        value={dayData.start}
                                                        onChange={(e) => setDraft({ workingHours: { ...workingHours, [key]: { ...dayData, start: e.target.value } } })}
                                                        className="p-2.5 border border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732] rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm sm:text-base font-bold focus:ring-2 focus:ring-blue-500/20 transition shadow-sm"
                                                    />
                                                    <span className="text-slate-400 font-bold text-xs uppercase">to</span>
                                                    <input
                                                        type="time"
                                                        value={dayData.end}
                                                        onChange={(e) => setDraft({ workingHours: { ...workingHours, [key]: { ...dayData, end: e.target.value } } })}
                                                        className="p-2.5 border border-slate-200 dark:border-[#24274d] bg-white dark:bg-[#151732] rounded-xl outline-none text-slate-800 dark:text-slate-200 text-sm sm:text-base font-bold focus:ring-2 focus:ring-blue-500/20 transition shadow-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500 italic text-sm bg-slate-100 dark:bg-[#1a1c3d]/60 px-4 py-1.5 rounded-md font-bold">Closed</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Navigational Footer Controls */}
                    <div className="pt-4 border-t border-slate-200 dark:border-[#24274d] flex items-center justify-between gap-4">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-5 py-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#151732] hover:bg-slate-50 dark:hover:bg-[#24274d] rounded-xl border border-slate-200 dark:border-[#24274d] shadow-sm transition"
                                >
                                    Previous Step
                                </button>
                            )}
                        </div>
                        <div>
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
                                >
                                    Continue to Next Step
                                </button>
                            ) : (
                                <Button type="submit" isLoading={isLoading} icon={<i className="fas fa-paper-plane mr-1"></i>} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl px-6 py-2 shadow-md">
                                    Submit Profile for Verification
                                </Button>
                            )}
                        </div>
                    </div>






                </form>
            </div>
        </div>
    );

}




