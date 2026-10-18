'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import { DraftState } from './types';
import { useAppSelector } from '@/redux/hooks';
import CameraCaptureModal from './CameraCaptureModal';

interface StepIdentitySectionProps {
    draft: Pick<DraftState, 'firstName' | 'lastName' | 'phone' | 'bio' | 'avatarUrl'>;
    setDraft: (updater: Partial<DraftState>) => void;
    avatarPreview: string | null;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAvatarFile: (file: File) => void;
    avatarError?: string | null;
    serverErrors: { field?: string; message?: string } | null;
}

export default function StepIdentitySection({
    draft,
    setDraft,
    avatarPreview,
    onAvatarChange,
    onAvatarFile,
    avatarError,
    serverErrors,
}: StepIdentitySectionProps) {
    const { firstName, lastName, phone, bio } = draft;

    const user = useAppSelector((state) => state.auth.user);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

    useEffect(() => {
        if (user?.name && !firstName && !lastName) {
            const nameParts = user.name.trim().split(/\s+/);
            if (nameParts.length === 2) {
                setDraft({ firstName: nameParts[0], lastName: nameParts[1] });
            } else if (nameParts.length === 1) {
                setDraft({ firstName: nameParts[0] });
            }
        }
    }, [user, firstName, lastName, setDraft]);

    const displayAvatar = avatarPreview || draft.avatarUrl || user?.avatarUrl;
    const hasError = Boolean(avatarError || serverErrors?.field === 'avatar');
    const errorMessage = avatarError || (serverErrors?.field === 'avatar' ? serverErrors.message : null);

    const handleCameraClick = () => {
        // Open the dedicated webcam modal (which also supports fallback to native camera)
        setIsCameraModalOpen(true);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in items-stretch py-3">
            {/* Left Panel: Mandatory Avatar Upload & Camera Capture */}
            <div
                className={`lg:col-span-1 p-5 rounded-2xl border transition-all flex flex-col items-center justify-between text-center min-h-[340px] shadow-sm ${
                    hasError
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-300 dark:border-red-900/50 ring-2 ring-red-500/20'
                        : 'bg-slate-50 dark:bg-[#1a1c3d]/20 border-slate-200 dark:border-[#24274d]'
                }`}
            >
                {/* Header with Mandatory Badge */}
                <div className="w-full flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Profile Photo <span className="text-red-500 font-extrabold">*</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800/40">
                        Mandatory
                    </span>
                </div>

                {/* Avatar Preview Circle */}
                <div className="relative my-2">
                    <div
                        onClick={() => document.getElementById('avatarFileInput')?.click()}
                        className={`w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group bg-white dark:bg-[#151732] shadow-md transition-all duration-300 ${
                            displayAvatar
                                ? 'border-2 border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-500/10'
                                : hasError
                                ? 'border-2 border-dashed border-red-500 ring-4 ring-red-500/20 animate-pulse'
                                : 'border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10'
                        }`}
                        title="Click to select image file"
                    >
                        {displayAvatar ? (
                            <img
                                src={displayAvatar}
                                alt="Doctor Avatar Preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-center p-3 flex flex-col items-center justify-center">
                                <i className={`fas fa-user-doctor text-2xl mb-1 ${hasError ? 'text-red-400' : 'text-slate-400'}`}></i>
                                <span className={`text-[10px] font-bold tracking-tight uppercase ${hasError ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                    Add Photo
                                </span>
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/45 items-center justify-center hidden group-hover:flex transition duration-200">
                            <i className="fas fa-camera text-white text-base"></i>
                        </div>
                    </div>

                    {/* Verified Checkmark Badge if Photo is uploaded */}
                    {displayAvatar && (
                        <span
                            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-[#151732] animate-scale-in"
                            title="Avatar uploaded"
                        >
                            <i className="fas fa-check"></i>
                        </span>
                    )}
                </div>

                {/* Action Buttons: Upload File & Live Camera */}
                <div className="w-full flex flex-col gap-2 mt-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                            type="button"
                            onClick={() => document.getElementById('avatarFileInput')?.click()}
                            className="w-full px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#151732] hover:bg-slate-100 dark:hover:bg-[#24274d] rounded-xl border border-slate-200 dark:border-[#24274d] transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                            <i className="fas fa-upload text-blue-500 text-xs"></i>
                            <span>Upload</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCameraClick}
                            className="w-full px-2.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                            <i className="fas fa-camera text-xs"></i>
                            <span>Camera</span>
                        </button>
                    </div>

                    {/* Hidden Inputs */}
                    {/* Standard File Upload */}
                    <input
                        type="file"
                        id="avatarFileInput"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={onAvatarChange}
                        className="hidden"
                    />

                    {/* Direct Native Camera Fallback (HTML5 capture="user") for mobile & tablets */}
                    <input
                        type="file"
                        id="avatarCameraInput"
                        accept="image/*"
                        capture="user"
                        onChange={onAvatarChange}
                        className="hidden"
                    />
                </div>

                {/* Validation Error Message */}
                {hasError && errorMessage && (
                    <div className="w-full mt-2.5 p-2 rounded-xl bg-red-100/80 dark:bg-red-950/50 border border-red-300 dark:border-red-800/60 text-[11px] text-red-700 dark:text-red-300 font-bold flex items-center gap-1.5 justify-center animate-fade-in text-center leading-tight">
                        <i className="fas fa-circle-exclamation text-xs shrink-0 text-red-500"></i>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Information Footnote */}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 leading-relaxed">
                    JPG, PNG or WebP up to 5 MB. A clear headshot is required to activate your medical profile.
                </p>
            </div>

            {/* Right Panel: Personal Details Fields */}
            <div className="lg:col-span-3 flex flex-col justify-between space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="First Name *"
                        value={firstName}
                        onChange={(e) => setDraft({ firstName: e.target.value })}
                        placeholder="John"
                        className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5"
                        required
                    />
                    <Input
                        label="Last Name *"
                        value={lastName}
                        onChange={(e) => setDraft({ lastName: e.target.value })}
                        placeholder="Smith"
                        className="dark:bg-[#151732] dark:border-[#24274d] text-sm py-2.5"
                        required
                    />

                    {/* Contact Phone with Server-Side Error Matching */}
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Professional Profile Biography
                    </label>
                    <textarea
                        rows={7}
                        value={bio}
                        onChange={(e) => setDraft({ bio: e.target.value })}
                        placeholder="Outline clinical strategies, educational focus vectors, specialized treatment alignments, and patient care philosophies..."
                        className="w-full flex-1 rounded-xl border border-slate-300 dark:border-[#24274d] bg-white dark:bg-[#151732] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition placeholder:text-slate-400 resize-none leading-relaxed shadow-sm min-h-[160px]"
                    />
                </div>
            </div>

            {/* Live Camera Capture Modal */}
            <CameraCaptureModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={onAvatarFile}
                onUseFallbackCamera={() => document.getElementById('avatarCameraInput')?.click()}
            />
        </div>
    );
}
