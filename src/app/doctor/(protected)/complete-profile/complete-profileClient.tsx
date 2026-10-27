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
import { inspectAndNormalizeFile, compressImageIfLarge } from '@/utils/fileSignatureHelper';

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

// ─── Helper: Reconstruct File from base64 Data URL ─────────────────────────────

function dataURLtoFile(dataurl: string, defaultBase = 'doctor-avatar'): File | null {
    try {
        if (!dataurl || typeof dataurl !== 'string') return null;
        const arr = dataurl.split(',');
        if (arr.length < 2) return null;
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        let ext = '.jpg';
        if (mime === 'image/png') ext = '.png';
        else if (mime === 'image/webp') ext = '.webp';
        else if (mime === 'application/pdf') ext = '.pdf';

        const filename = `${defaultBase}${ext}`;
        const cleanBase64 = arr[1].replace(/[\s\r\n]+/g, '');
        const bstr = atob(cleanBase64);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (e) {
        console.error('Failed to reconstruct File from data URL:', e);
        return null;
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompleteDoctorProfileClient() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isLoading } = useAppSelector((state) => state.auth || {});

    const { draft, setDraft, clearDraft } = useDraft();

    const { currentStep, workingHours } = draft;

    const [avatar, setAvatar] = useState<File | null>(null);
    const avatarRef = useRef<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(() => draft.avatarUrl || null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null);
    const [governmentId, setGovernmentId] = useState<File | null>(null);
    const [qualificationFiles, setQualificationFiles] = useState<Record<string, File>>({});
    const [showRestoredBanner, setShowRestoredBanner] = useState(false);
    const [serverErrors, setServerErrors] = useState<{ field?: string; message?: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 4;

    useEffect(() => { 
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setShowRestoredBanner(true);
        } catch { /* ignore */ }
    }, []);

    // Reconstruct avatar file from draft if saved as Data URL across page reloads
    useEffect(() => {
        if (!avatar && !avatarRef.current && draft.avatarUrl) {
            if (draft.avatarUrl.startsWith('data:')) {
                const restored = dataURLtoFile(draft.avatarUrl, 'doctor-avatar');
                if (restored) {
                    setAvatar(restored);
                    avatarRef.current = restored;
                }
            }
            if (!avatarPreview) {
                setAvatarPreview(draft.avatarUrl);
            }
        }
    }, [draft.avatarUrl, avatar, avatarPreview]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAvatarFile = async (file: File) => {
        // Automatically optimize high-res mobile camera images
        const optimizedFile = await compressImageIfLarge(file);

        // Validation: Max file size (5MB)
        if (optimizedFile.size > 5 * 1024 * 1024) {
            setAvatarError('Profile picture exceeds 5 MB. Please choose a smaller file.');
            return;
        }

        // Validate magic bytes and normalize extension
        const inspected = await inspectAndNormalizeFile(optimizedFile, ['JPEG', 'PNG', 'WEBP']);
        if (inspected.error) {
            setAvatarError(inspected.error);
            return;
        }

        const validFile = inspected.file;
        setAvatar(validFile);
        avatarRef.current = validFile;
        setAvatarError(null);
        setServerErrors(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const previewUrl = event.target?.result as string;
            setAvatarPreview(previewUrl);
            setDraft({ avatarUrl: previewUrl });
        };
        reader.readAsDataURL(validFile);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleAvatarFile(file);
        }
    };

    const handleMedicalCertChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Automatically optimize high-res smartphone camera photos before validation
        const optimizedFile = await compressImageIfLarge(file);

        if (optimizedFile.size > 10 * 1024 * 1024) {
            setServerErrors({ field: 'medicalCertificate', message: 'Medical Certificate exceeds 10 MB.' });
            e.target.value = '';
            return;
        }

        const inspected = await inspectAndNormalizeFile(optimizedFile, ['PDF', 'JPEG', 'PNG', 'WEBP']);
        if (inspected.error) {
            setServerErrors({ field: 'medicalCertificate', message: inspected.error });
            e.target.value = '';
            return;
        }

        setMedicalCertificate(inspected.file);
        setServerErrors(null);
    };

    const handleGovIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Automatically optimize high-res smartphone camera photos before validation
        const optimizedFile = await compressImageIfLarge(file);

        if (optimizedFile.size > 10 * 1024 * 1024) {
            setServerErrors({ field: 'governmentId', message: 'Government ID exceeds 10 MB.' });
            e.target.value = '';
            return;
        }

        const inspected = await inspectAndNormalizeFile(optimizedFile, ['PDF', 'JPEG', 'PNG', 'WEBP']);
        if (inspected.error) {
            setServerErrors({ field: 'governmentId', message: inspected.error });
            e.target.value = '';
            return;
        }

        setGovernmentId(inspected.file);
        setServerErrors(null);
    };

    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        setAvatarError(null);
        setServerErrors(null);

        if (currentStep === 1) {
            const hasAvatar = Boolean(avatar || avatarPreview || draft.avatarUrl || user?.avatarUrl);
            if (!hasAvatar) {
                setAvatarError('Profile picture is mandatory. Please upload or capture an avatar to proceed.');
                return;
            }
            if (!draft.firstName || !draft.lastName || !draft.phone) {
                setServerErrors({ field: 'phone', message: 'Please complete all required personal information (First Name, Last Name, Phone).' });
                return;
            }
        }
        if (currentStep === 2) {
            if (!draft.systemOfMedicine || !draft.specialty || !draft.licenseNumber || !draft.yearsOfExperience) {
                setServerErrors({ field: 'licenseNumber', message: 'Please complete all professional credential details (Specialty, License Number, Years of Experience).' });
                return;
            }
            if (!draft.qualifications || draft.qualifications.length === 0) {
                setServerErrors({ field: 'qualifications', message: 'Please add at least one qualification by filling the details and clicking "Add Qualification".' });
                return;
            }
        }
        if (currentStep === 3) {
            // @ts-ignore
            const existingMedicalCert = user?.medicalCertificateUrl || user?.doctorProfile?.medicalCertificateUrl;
            // @ts-ignore
            const existingGovId = user?.governmentIdUrl || user?.doctorProfile?.governmentIdUrl;
            
            if (!medicalCertificate && !existingMedicalCert) {
                setServerErrors({ field: 'medicalCertificate', message: 'Please upload your Medical Council Registration Certificate.' });
                return;
            }
            if (!governmentId && !existingGovId) {
                setServerErrors({ field: 'governmentId', message: 'Please upload your Government Issued Photo ID.' });
                return;
            }
        }
        setDraft({ currentStep: Math.min(currentStep + 1, totalSteps) });
    };

    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault();
        setServerErrors(null);
        setDraft({ currentStep: Math.max(currentStep - 1, 1) });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerErrors(null);

        console.group('🚀 [Complete Profile Submit Pipeline]');
        console.log('[Step 1] Form submission initiated. Current Step:', currentStep);
        console.log('[Step 1.1] Consultation settings in draft:', {
            enableVideo: draft.enableVideo,
            videoFee: draft.videoFee,
            enablePhysical: draft.enablePhysical,
            physicalFee: draft.physicalFee,
            clinicName: draft.clinicName,
            clinicAddress: draft.clinicAddress,
        });

        // --- STEP 4 VALIDATION ---
        if (!draft.enableVideo && !draft.enablePhysical) {
            const msg = 'You must enable at least one consultation type (Telehealth or In-Person).';
            console.warn('[Validation Stopped]', msg);
            setServerErrors({ field: 'consultationSettings', message: msg });
            console.groupEnd();
            return;
        }

        if (draft.enableVideo) {
            if (!draft.videoFee || Number(draft.videoFee) < 0) {
                const msg = 'Please provide a valid Telehealth fee.';
                console.warn('[Validation Stopped]', msg);
                setServerErrors({ field: 'videoFee', message: msg });
                console.groupEnd();
                return;
            }
            const hasOnlineDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                .some(day => (draft.workingHours?.online?.[day as keyof typeof draft.workingHours.online]?.length || 0) > 0);
            if (!hasOnlineDays) {
                const msg = 'Please configure at least one active availability shift for Telehealth consultation.';
                console.warn('[Validation Stopped]', msg);
                setServerErrors({ field: 'onlineSchedule', message: msg });
                console.groupEnd();
                return;
            }
        }

        if (draft.enablePhysical) {
            if (!draft.physicalFee || Number(draft.physicalFee) < 0) {
                const msg = 'Please provide a valid In-Person fee.';
                console.warn('[Validation Stopped]', msg);
                setServerErrors({ field: 'physicalFee', message: msg });
                console.groupEnd();
                return;
            }
            if (!draft.clinicName?.trim() || !draft.clinicAddress?.trim()) {
                const msg = 'Please provide your Clinic Title and Clinic Address for In-Person visits.';
                console.warn('[Validation Stopped]', msg);
                setServerErrors({ field: 'clinicDetails', message: msg });
                console.groupEnd();
                return;
            }
            const hasOfflineDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                .some(day => (draft.workingHours?.offline?.[day as keyof typeof draft.workingHours.offline]?.length || 0) > 0);
            if (!hasOfflineDays) {
                const msg = 'Please configure at least one active availability shift for In-Person consultation.';
                console.warn('[Validation Stopped]', msg);
                setServerErrors({ field: 'offlineSchedule', message: msg });
                console.groupEnd();
                return;
            }
        }

        console.log('[Step 2] Validating weekly operational schedule...');
        const scheduleError = validateFullSchedule(draft.workingHours, Number(draft.slotDuration) || 15);
        if (scheduleError) {
            const msg = `Schedule Validation: ${scheduleError}`;
            console.warn('[Validation Stopped]', msg);
            setServerErrors({ field: 'schedule', message: msg });
            console.groupEnd();
            return;
        }
        
        // --- FILE INTEGRITY VALIDATION ---
        console.log('[Step 3] Checking file availability & restored avatar...');
        let fileToUpload = avatar || avatarRef.current;
        if (!fileToUpload) {
            const dataUrl = (draft.avatarUrl?.startsWith('data:') ? draft.avatarUrl : null) || 
                            (avatarPreview?.startsWith('data:') ? avatarPreview : null);
            if (dataUrl) {
                fileToUpload = dataURLtoFile(dataUrl, 'doctor-avatar');
                if (fileToUpload) {
                    setAvatar(fileToUpload);
                    avatarRef.current = fileToUpload;
                    console.log('[Step 3.1] Reconstructed avatar file from Data URL:', fileToUpload.name, fileToUpload.type);
                }
            }
        }

        // @ts-ignore
        const remoteAvatarUrl = draft.avatarUrl && !draft.avatarUrl.startsWith('data:')
            ? draft.avatarUrl
            // @ts-ignore
            : (user?.avatarUrl || user?.doctorProfile?.avatarUrl || undefined);

        const hasAvatar = Boolean(fileToUpload || remoteAvatarUrl);
        if (!hasAvatar) {
            const msg = 'Your profile picture is missing. Please upload or capture an avatar in Step 1.';
            console.warn('[Validation Stopped]', msg);
            setAvatarError('Profile picture is mandatory. Please upload or capture an avatar.');
            setServerErrors({ field: 'avatar', message: msg });
            setDraft({ currentStep: 1 });
            console.groupEnd();
            return;
        }

        // @ts-ignore
        const existingMedicalCert = user?.medicalCertificateUrl || user?.doctorProfile?.medicalCertificateUrl;
        // @ts-ignore
        const existingGovId = user?.governmentIdUrl || user?.doctorProfile?.governmentIdUrl;

        if (!medicalCertificate && !existingMedicalCert) {
            const msg = 'Medical Council Registration Certificate file is missing (files are not kept across browser refreshes). Please re-upload it in Step 3.';
            console.warn('[Validation Stopped]', msg);
            setServerErrors({ field: 'medicalCertificate', message: msg });
            setDraft({ currentStep: 3 });
            console.groupEnd();
            return;
        }

        if (!governmentId && !existingGovId) {
            const msg = 'Government Issued Photo ID file is missing (files are not kept across browser refreshes). Please re-upload it in Step 3.';
            console.warn('[Validation Stopped]', msg);
            setServerErrors({ field: 'governmentId', message: msg });
            setDraft({ currentStep: 3 });
            console.groupEnd();
            return;
        }

        const missingQualFiles = draft.qualifications.some((q: any) => !q.certificateUrl && !qualificationFiles[q.id]);
        if (missingQualFiles) {
            const msg = 'Some qualifications are missing their certificate files (files are not kept across browser refreshes). Please re-upload them in Step 2 or remove incomplete entries.';
            console.warn('[Validation Stopped]', msg);
            setServerErrors({ field: 'qualifications', message: msg });
            setDraft({ currentStep: 2 });
            console.groupEnd();
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('[Step 4] Assembling FormData multipart payload...');
            const formData = new FormData();

            // Attach Binary Media Files with safety compression for high-res mobile devices
            if (fileToUpload) {
                const finalAvatar = await compressImageIfLarge(fileToUpload);
                formData.append('avatar', finalAvatar, finalAvatar.name || 'doctor-avatar.jpg');
                console.log('[FormData] Attached avatar file:', finalAvatar.name, `${(finalAvatar.size / 1024).toFixed(1)} KB`);
            }
            if (remoteAvatarUrl) {
                formData.append('avatarUrl', remoteAvatarUrl);
            }
            if (medicalCertificate) {
                const finalMedCert = await compressImageIfLarge(medicalCertificate);
                formData.append('medicalCertificate', finalMedCert, finalMedCert.name);
                console.log('[FormData] Attached medicalCertificate:', finalMedCert.name, `${(finalMedCert.size / 1024).toFixed(1)} KB`);
            }
            if (governmentId) {
                const finalGovId = await compressImageIfLarge(governmentId);
                formData.append('governmentId', finalGovId, finalGovId.name);
                console.log('[FormData] Attached governmentId:', finalGovId.name, `${(finalGovId.size / 1024).toFixed(1)} KB`);
            }
            for (const [id, file] of Object.entries(qualificationFiles)) {
                const finalQualCert = await compressImageIfLarge(file);
                formData.append('qualificationCertificates', finalQualCert, `${id}___${finalQualCert.name}`);
                console.log(`[FormData] Attached qualificationCertificate for ID ${id}:`, finalQualCert.name, `${(finalQualCert.size / 1024).toFixed(1)} KB`);
            }

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
                avatarUrl: remoteAvatarUrl,
                systemOfMedicine: draft.systemOfMedicine || 'Modern Medicine',
                specialty: draft.specialty,
                licenseNumber: draft.licenseNumber,
                yearsOfExperience: Number(draft.yearsOfExperience) || 0,
                slotDuration: Number(draft.slotDuration) || 15,
                timezone: draft.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata') || 'Asia/Kolkata',
                bio: draft.bio || '',
                expertiseTags: draft.expertiseTags || [],
                languages: draft.selectedLanguages || [],
                qualifications: draft.qualifications || [],
                consultationSettings: {
                    online: { enabled: draft.enableVideo, fee: Number(draft.videoFee) || 0 },
                    offline: {
                        enabled: draft.enablePhysical,
                        fee: Number(draft.physicalFee) || 0,
                        clinicName: draft.clinicName || '',
                        clinicAddress: draft.clinicAddress || '',
                    },
                    // Legacy backwards compatibility aliases
                    video: { enabled: draft.enableVideo, fee: Number(draft.videoFee) || 0 },
                    physical: {
                        enabled: draft.enablePhysical,
                        fee: Number(draft.physicalFee) || 0,
                        clinicName: draft.clinicName || '',
                        clinicAddress: draft.clinicAddress || '',
                    },
                },
                workingHours: {
                    online: {
                        monday: sanitizeBlocks(draft.workingHours?.online?.monday),
                        tuesday: sanitizeBlocks(draft.workingHours?.online?.tuesday),
                        wednesday: sanitizeBlocks(draft.workingHours?.online?.wednesday),
                        thursday: sanitizeBlocks(draft.workingHours?.online?.thursday),
                        friday: sanitizeBlocks(draft.workingHours?.online?.friday),
                        saturday: sanitizeBlocks(draft.workingHours?.online?.saturday),
                        sunday: sanitizeBlocks(draft.workingHours?.online?.sunday),
                    },
                    offline: {
                        monday: sanitizeBlocks(draft.workingHours?.offline?.monday),
                        tuesday: sanitizeBlocks(draft.workingHours?.offline?.tuesday),
                        wednesday: sanitizeBlocks(draft.workingHours?.offline?.wednesday),
                        thursday: sanitizeBlocks(draft.workingHours?.offline?.thursday),
                        friday: sanitizeBlocks(draft.workingHours?.offline?.friday),
                        saturday: sanitizeBlocks(draft.workingHours?.offline?.saturday),
                        sunday: sanitizeBlocks(draft.workingHours?.offline?.sunday),
                    }
                },
            };

            formData.append('data', JSON.stringify(profileData));

            console.log('[Step 5] Dispatching updateDoctorProfile thunk...');
            const resultAction = await dispatch(updateDoctorProfile(formData));
            console.log('[Step 6] Thunk returned resultAction:', resultAction);

            if (updateDoctorProfile.fulfilled.match(resultAction)) {
                console.log('✅ [Success] Profile updated successfully!');
                const payload = resultAction.payload as any;
                const updatedUser = payload?.user || payload;
                const newAccessToken = payload?.accessToken;

                // Sync the new token with isProfileCompleted: true to the frontend cookie so middleware allows dashboard access
                if (newAccessToken) {
                    await fetch('/api/auth/sync-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accessToken: newAccessToken }),
                    }).catch((syncErr) => {
                        console.error('[DoctorCompleteProfile] Failed to sync token cookie:', syncErr);
                    });
                }

                if (updatedUser) {
                    dispatch(setCredentials({
                        user: { ...updatedUser, isProfileCompleted: true },
                        accessToken: newAccessToken || user?.accessToken || null
                    }));
                }
                clearDraft();
                window.location.href = '/doctor/dashboard';
            } else if (updateDoctorProfile.rejected.match(resultAction)) {
                const errorPayload = resultAction.payload as { message?: string; field?: string | null } | undefined;
                const errorMessage = errorPayload?.message || 'Something went wrong while submitting your profile. Please try again.';
                const errorField = errorPayload?.field ?? null;
                console.error('❌ [Rejected] Backend rejection:', errorPayload);

                setServerErrors({
                    field: errorField ?? undefined,
                    message: errorMessage,
                });

                const getStepForField = (field?: string): number | null => {
                    if (!field) return null;
                    if (['avatar', 'firstName', 'lastName', 'phone', 'bio'].includes(field)) return 1;
                    if (['systemOfMedicine', 'specialty', 'licenseNumber', 'yearsOfExperience', 'qualifications', 'qualificationCertificates'].includes(field)) return 2;
                    if (['medicalCertificate', 'governmentId'].includes(field)) return 3;
                    if (['videoFee', 'physicalFee', 'clinicName', 'clinicAddress', 'clinicDetails', 'onlineSchedule', 'offlineSchedule', 'consultationSettings', 'schedule', 'workingHours'].includes(field)) return 4;
                    return null;
                };

                const targetStep = getStepForField(errorField || undefined);
                if (targetStep) {
                    setDraft({ currentStep: targetStep });
                } else {
                    const lower = errorMessage.toLowerCase();
                    if (lower.includes('avatar') || lower.includes('profile picture') || lower.includes('photo')) {
                        setDraft({ currentStep: 1 });
                    } else if (lower.includes('qualification') || lower.includes('degree') || lower.includes('license')) {
                        setDraft({ currentStep: 2 });
                    } else if (lower.includes('medical') || lower.includes('government') || lower.includes('certificate') || lower.includes('id')) {
                        setDraft({ currentStep: 3 });
                    }
                }
            }
        } catch (error: any) {
            console.error('💥 [Fatal] Unexpected layout execution error:', error);
            setServerErrors({ message: error?.message || 'An unexpected application runtime failure occurred.' });
        } finally {
            setIsSubmitting(false);
            console.groupEnd();
        }
    };

    const getStepLabel = (field?: string): string => {
        if (!field) return 'System Error';
        if (['avatar', 'firstName', 'lastName', 'phone', 'bio'].includes(field)) return 'Step 1: Personal Identity';
        if (['systemOfMedicine', 'specialty', 'licenseNumber', 'yearsOfExperience', 'qualifications', 'qualificationCertificates'].includes(field)) return 'Step 2: Medical Credentials';
        if (['medicalCertificate', 'governmentId'].includes(field)) return 'Step 3: Verification Documents';
        if (['videoFee', 'physicalFee', 'clinicName', 'clinicAddress', 'clinicDetails', 'onlineSchedule', 'offlineSchedule', 'consultationSettings', 'schedule', 'workingHours'].includes(field)) return 'Step 4: Availability & Fees';
        return 'Notice';
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

                {/* Visible Server / Validation Error Banner */}
                {serverErrors && (
                    <div className="mx-4 sm:mx-5 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm font-medium flex items-start justify-between gap-3 animate-fade-in shadow-sm">
                        <div className="flex items-start gap-3">
                            <i className="fas fa-exclamation-circle text-red-500 mt-0.5 text-base flex-shrink-0"></i>
                            <div>
                                <p className="font-bold text-red-800 dark:text-red-200">
                                    {getStepLabel(serverErrors.field)}
                                </p>
                                <p className="text-xs sm:text-sm mt-0.5 text-red-600 dark:text-red-300">
                                    {serverErrors.message || 'Please check your information and try again.'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setServerErrors(null)}
                            className="text-red-400 hover:text-red-600 dark:hover:text-red-200 text-xs font-bold px-2 py-1 transition"
                            title="Dismiss error"
                        >
                            <i className="fas fa-times text-sm"></i>
                        </button>
                    </div>
                )}

                <form noValidate onSubmit={handleSave} className="p-4 sm:p-5 flex flex-col justify-between gap-5">

                    {/* ─── STEP 1: IDENTITY CONFIGURATION ─── */}
                    {currentStep === 1 && (
                        <StepIdentitySection
                            draft={draft}
                            setDraft={setDraft}
                            avatarPreview={avatarPreview}
                            onAvatarChange={handleAvatarChange}
                            onAvatarFile={handleAvatarFile}
                            avatarError={avatarError}
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
                            onMedicalCertificateChange={handleMedicalCertChange}
                            onGovernmentIdChange={handleGovIdChange}
                            serverErrors={serverErrors}
                        />
                    )}

                    {/* ─── STEP 4: FEES & OPERATIONAL HOURS ─── */}
                    {currentStep === 4 && (
                        <StepScheduleSection
                            draft={draft}
                            setDraft={setDraft}
                            serverErrors={serverErrors}
                        />
                    )}

                    {/* Navigational Footer Controls */}
                    <FormNavFooter
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        isLoading={isSubmitting || isLoading}
                        onPrev={prevStep}
                        onNext={nextStep}
                    />

                </form>
            </div>
        </div>
    );
}
