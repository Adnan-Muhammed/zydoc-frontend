'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { updateDoctorProfile } from '@/redux/features/doctor/doctorThunk';
import { setCredentials } from '@/redux/auth/authSlice';
 
import { DraftState, DEFAULT_DRAFT } from './_components/types';
import DraftBanner from './_components/DraftBanner';
import StepProgressHeader from './_components/StepProgressHeader';
import FormNavFooter from './_components/FormNavFooter';
import StepIdentitySection from './_components/StepIdentitySection';
import StepCredentialsSection from './_components/StepCredentialsSection';
import StepVerificationSection from './_components/StepVerificationSection';
import StepScheduleSection from './_components/StepScheduleSection';
import { validateFullSchedule } from '@/utils/scheduleValidator';

// ─── Storage Key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'doctor_profile_draft_v1';

// ─── Hook: Draft Management ───────────────────────────────────────────────────

function useDraft() {
    const loadDraft = (): DraftState => {
        if (typeof window === 'undefined') return DEFAULT_DRAFT;
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
    const { user, isLoading } = useAppSelector((state) => state.auth || {});

    const { draft, setDraft, clearDraft } = useDraft();

    const { currentStep, workingHours } = draft;

    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null);
    const [governmentId, setGovernmentId] = useState<File | null>(null);
    const [qualificationFiles, setQualificationFiles] = useState<Record<string, File>>({});
    const [showRestoredBanner, setShowRestoredBanner] = useState(false);
    const [serverErrors, setServerErrors] = useState<{ field?: string; message?: string } | null>(null);

    const totalSteps = 4;

    useEffect(() => { 
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setShowRestoredBanner(true);
        } catch { /* ignore */ }
    }, []);

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

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        if (currentStep === 1 && (!draft.firstName || !draft.lastName || !draft.phone)) {
            alert('Please fill out all required personal information fields.');
            return;
        }
        if (currentStep === 2) {
            if (!draft.systemOfMedicine || !draft.specialty || !draft.licenseNumber || !draft.yearsOfExperience) {
                alert('Please complete all professional credential details.');
                return;
            }
            if (!draft.qualifications || draft.qualifications.length === 0) {
                alert('Please add at least one qualification by filling the details and clicking "Add Qualification".');
                return;
            }
        }
        if (currentStep === 3) {
            // @ts-ignore
            const existingMedicalCert = user?.medicalCertificateUrl || user?.doctorProfile?.medicalCertificateUrl;
            // @ts-ignore
            const existingGovId = user?.governmentIdUrl || user?.doctorProfile?.governmentIdUrl;
            
            if (!medicalCertificate && !existingMedicalCert) {
                alert('Please upload your Medical Council Registration Certificate.');
                return;
            }
            if (!governmentId && !existingGovId) {
                alert('Please upload your Government Issued Photo ID.');
                return;
            }
        }
        setDraft({ currentStep: Math.min(currentStep + 1, totalSteps) });
    };

    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault();
        setDraft({ currentStep: Math.max(currentStep - 1, 1) });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- STEP 4 VALIDATION ---
        if (!draft.enableVideo && !draft.enablePhysical) {
            alert('You must enable at least one consultation type (Telehealth or In-Person).');
            return;
        }

        if (draft.enableVideo) {
            if (!draft.videoFee) {
                alert('Please provide a Telehealth fee.');
                return;
            }
            const hasOnlineDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].some(day => (draft.workingHours.online[day as keyof typeof draft.workingHours.online]?.length || 0) > 0);
            if (!hasOnlineDays) {
                alert('Please configure at least one active availability shift for Telehealth consultation.');
                return;
            }
        }

        if (draft.enablePhysical) {
            if (!draft.physicalFee) {
                alert('Please provide an In-Person fee.');
                return;
            }
            if (!draft.clinicName || !draft.clinicAddress) {
                alert('Please provide your Clinic Title and Address for In-Person visits.');
                return;
            }
            const hasOfflineDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].some(day => (draft.workingHours.offline[day as keyof typeof draft.workingHours.offline]?.length || 0) > 0);
            if (!hasOfflineDays) {
                alert('Please configure at least one active availability shift for In-Person consultation.');
                return;
            }
        }

        const scheduleError = validateFullSchedule(draft.workingHours, Number(draft.slotDuration) || 15);
        if (scheduleError) {
            alert(`Schedule Validation Error:\n${scheduleError}`);
            return;
        }
        
        // --- FILE INTEGRITY VALIDATION (In case of page reload restoring draft but losing files) ---
        // @ts-ignore
        const existingMedicalCert = user?.medicalCertificateUrl || user?.doctorProfile?.medicalCertificateUrl;
        // @ts-ignore
        const existingGovId = user?.governmentIdUrl || user?.doctorProfile?.governmentIdUrl;

        if (!medicalCertificate && !existingMedicalCert) {
            alert('Your Medical Council Registration Certificate file is missing (perhaps due to a page reload). Please re-upload it in Step 3.');
            setDraft({ currentStep: 3 });
            return;
        }

        if (!governmentId && !existingGovId) {
            alert('Your Government Issued Photo ID file is missing (perhaps due to a page reload). Please re-upload it in Step 3.');
            setDraft({ currentStep: 3 });
            return;
        }

        const missingQualFiles = draft.qualifications.some((q: any) => !q.certificateUrl && !qualificationFiles[q.id]);
        if (missingQualFiles) {
            alert('Some qualifications are missing their certificate files (perhaps due to a page reload). Please re-upload them in Step 2 or remove the incomplete entries.');
            setDraft({ currentStep: 2 });
            return;
        }
        
        setServerErrors(null);

        try {
            const formData = new FormData();

            // Attach Binary Media Files
            if (avatar) formData.append('avatar', avatar);
            if (medicalCertificate) formData.append('medicalCertificate', medicalCertificate);
            if (governmentId) formData.append('governmentId', governmentId);
            Object.entries(qualificationFiles).forEach(([id, file]) => {
                formData.append('qualificationCertificates', file, `${id}___${file.name}`);
            });

            // Helper to strip internal UI client IDs from time block items
            const sanitizeBlocks = (blocks: any[] = []) =>
                (blocks || [])
                    .filter(b => b && b.start && b.end)
                    .map(b => ({ start: b.start, end: b.end }));

            // Standardize Nested Profile Payload
            const profileData = {
                firstName: draft.firstName,
                lastName: draft.lastName,
                phone: draft.phone,
                systemOfMedicine: draft.systemOfMedicine || 'Modern Medicine',
                specialty: draft.specialty,
                licenseNumber: draft.licenseNumber,
                yearsOfExperience: Number(draft.yearsOfExperience),
                slotDuration: Number(draft.slotDuration) || 15,
                timezone: draft.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata') || 'Asia/Kolkata',
                bio: draft.bio,
                expertiseTags: draft.expertiseTags,
                languages: draft.selectedLanguages,
                qualifications: draft.qualifications,
                consultationSettings: {
                    online: { enabled: draft.enableVideo, fee: Number(draft.videoFee) },
                    offline: {
                        enabled: draft.enablePhysical,
                        fee: Number(draft.physicalFee),
                        clinicName: draft.clinicName,
                        clinicAddress: draft.clinicAddress,
                    },
                    // Legacy backwards compatibility aliases
                    video: { enabled: draft.enableVideo, fee: Number(draft.videoFee) },
                    physical: {
                        enabled: draft.enablePhysical,
                        fee: Number(draft.physicalFee),
                        clinicName: draft.clinicName,
                        clinicAddress: draft.clinicAddress,
                    },
                },
                workingHours: {
                    online: {
                        monday: sanitizeBlocks(draft.workingHours.online.monday),
                        tuesday: sanitizeBlocks(draft.workingHours.online.tuesday),
                        wednesday: sanitizeBlocks(draft.workingHours.online.wednesday),
                        thursday: sanitizeBlocks(draft.workingHours.online.thursday),
                        friday: sanitizeBlocks(draft.workingHours.online.friday),
                        saturday: sanitizeBlocks(draft.workingHours.online.saturday),
                        sunday: sanitizeBlocks(draft.workingHours.online.sunday),
                    },
                    offline: {
                        monday: sanitizeBlocks(draft.workingHours.offline.monday),
                        tuesday: sanitizeBlocks(draft.workingHours.offline.tuesday),
                        wednesday: sanitizeBlocks(draft.workingHours.offline.wednesday),
                        thursday: sanitizeBlocks(draft.workingHours.offline.thursday),
                        friday: sanitizeBlocks(draft.workingHours.offline.friday),
                        saturday: sanitizeBlocks(draft.workingHours.offline.saturday),
                        sunday: sanitizeBlocks(draft.workingHours.offline.sunday),
                    }
                },
            };

            formData.append('data', JSON.stringify(profileData));

            // Dispatch Redux action thunk
            const resultAction = await dispatch(updateDoctorProfile(formData));

            if (updateDoctorProfile.fulfilled.match(resultAction)) {
                // Safely extract the user payload to prevent undefined errors
                const updatedUser = resultAction.payload?.user || resultAction.payload;
                if (updatedUser) {
                    // Rehydrate credentials safely. If accessToken is missing, authSlice shouldn't break.
                    dispatch(setCredentials({ user: updatedUser, accessToken: user?.accessToken }));
                }
                clearDraft();
                // Perform full reload so the secure cookie is processed by Next.js middleware
                window.location.href = '/doctor/dashboard';
            } else if (updateDoctorProfile.rejected.match(resultAction)) {
                const errorPayload = resultAction.payload as { message: string; field: string | null } | undefined;
                const errorMessage = errorPayload?.message || 'Something went wrong. Please try again.';
                const errorField = errorPayload?.field ?? null;

                setServerErrors({
                    field: errorField ?? undefined,
                    message: errorMessage,
                });

                // Auto-navigate to the step containing the duplicate field
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
                <DraftBanner
                    currentStep={currentStep}
                    onStartFresh={() => { clearDraft(); setShowRestoredBanner(false); }}
                />
            )}

            {/* Main Form Box Container */}
            <div className="bg-white dark:bg-[#151732] shadow-sm rounded-2xl border border-slate-200 dark:border-[#24274d] overflow-hidden flex flex-col justify-between">

                {/* Section Header */}
                <StepProgressHeader currentStep={currentStep} totalSteps={totalSteps} />

                <form onSubmit={handleSave} className="p-4 sm:p-5 flex flex-col justify-between gap-5">

                    {/* ─── STEP 1: IDENTITY CONFIGURATION ─── */}
                    {currentStep === 1 && (
                        <StepIdentitySection
                            draft={draft}
                            setDraft={setDraft}
                            avatarPreview={avatarPreview}
                            onAvatarChange={handleAvatarChange}
                            serverErrors={serverErrors}
                        />
                    )}

                    {/* ─── STEP 2: CLINICAL CREDENTIALS ─── */}
                    {currentStep === 2 && (
                        <StepCredentialsSection
                            draft={draft}
                            setDraft={setDraft}
                            serverErrors={serverErrors}
                            qualificationFiles={qualificationFiles}
                            setQualificationFiles={setQualificationFiles}
                        />
                    )}

                    {/* ─── STEP 3: REGISTRATION VERIFICATION RECORDS ─── */}
                    {currentStep === 3 && (
                        <StepVerificationSection
                            medicalCertificate={medicalCertificate}
                            governmentId={governmentId}
                            onMedicalCertificateChange={(e) => setMedicalCertificate(e.target.files?.[0] || null)}
                            onGovernmentIdChange={(e) => setGovernmentId(e.target.files?.[0] || null)}
                        />
                    )}

                    {/* ─── STEP 4: FEES & OPERATIONAL HOURS ─── */}
                    {currentStep === 4 && (
                        <StepScheduleSection
                            draft={draft}
                            setDraft={setDraft}
                        />
                    )}

                    {/* Navigational Footer Controls */}
                    <FormNavFooter
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        isLoading={isLoading}
                        onPrev={prevStep}
                        onNext={nextStep}
                    />

                </form>
            </div>
        </div>
    );
}
