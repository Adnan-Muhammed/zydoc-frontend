'use client';

import React, { useEffect } from 'react';
import Input from '@/components/ui/Input';
import { DraftState } from './types';
import { useAppSelector } from '@/redux/hooks';

interface StepIdentitySectionProps {
    draft: Pick<DraftState, 'firstName' | 'lastName' | 'phone' | 'bio'>;
    setDraft: (updater: Partial<DraftState>) => void;
    avatarPreview: string | null;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    serverErrors: { field?: string; message?: string } | null;
}

export default function StepIdentitySection({
    draft,
    setDraft, 
    avatarPreview,
    onAvatarChange,
    serverErrors,
}: StepIdentitySectionProps) {
    const { firstName, lastName, phone, bio } = draft; 
    
    const user = useAppSelector((state) => state.auth.user);

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

    const displayAvatar = avatarPreview || user?.avatarUrl;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in items-stretch py-3">
            {/* Left Panel: Avatar */}
            <div className="lg:col-span-1 p-5 bg-slate-50 dark:bg-[#1a1c3d]/20 rounded-xl border border-slate-200 dark:border-[#24274d] flex flex-col items-center justify-center text-center h-full min-h-[290px] shadow-sm">
                <div
                    onClick={() => document.getElementById('avatarInput')?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group bg-white dark:bg-[#151732] shadow-md mb-4 transition hover:border-blue-500"
                >
                    {displayAvatar ? (
                        <img src={displayAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-2">
                            <i className="fas fa-camera text-slate-400 text-lg"></i>
                            <span className="block text-[10px] text-slate-400 mt-1 font-semibold">Upload Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
                        <i className="fas fa-pencil text-white text-sm"></i>
                    </div>
                    <input type="file" id="avatarInput" accept="image/*" onChange={onAvatarChange} className="hidden" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Professional Display Photo</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1.5 leading-relaxed">
                    Upload clear headshot graphics. Format restrictions apply up to 5 MB (PNG, JPG).
                </p>
            </div>

            {/* Right Panel: Fields */}
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
        </div>
    );
}
