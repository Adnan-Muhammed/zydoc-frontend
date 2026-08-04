// src/components/forms/UnifiedSignupForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signupUser, verifyOtp, resendOtp, loginWithGoogleUser } from '@/redux/auth/authThunk';
import Button from '../ui/Button';
import Input from '../ui/Input';

const UnifiedSignupForm: React.FC = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, requires2FA } = useAppSelector((state) => state.auth);

    const [showOtpView, setShowOtpView] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [generatedOtpCode, setGeneratedOtpCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [timer, setTimer] = useState(0);

    // Countdown timer for OTP resend throttle
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Sync Redux 2FA flag with local OTP view state
    useEffect(() => {
        if (requires2FA) setShowOtpView(true);
    }, [requires2FA]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (error) setError(null);
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const newErrors: Record<string, string> = {};
        if (!role) {
            setError('Please select a role to continue (Patient or Doctor).');
            return;
        }
        if (!form.email) newErrors.email = 'Enter a valid email address';
        if (!form.password || form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        dispatch(signupUser({ ...form, role }))
            .unwrap()
            .then(() => {
                setShowOtpView(true);
                setTimer(60);
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Signup failed'));
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(verifyOtp({ data: { email: form.email, otpCode }, isAdmin: false }))
            .unwrap()
            .then(() => {
                router.replace(`/${role}/profile-update`);
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Invalid OTP code'));
    };

    const handleOAuth = () => {
        if (!role) return;
        dispatch(loginWithGoogleUser(role))
            .unwrap()
            .then((res: any) => {
                // Determine redirect path based on actual role and onboarding status
                const actualRole = res?.user?.role || role;
                const isProfileCompleted = res?.user?.isProfileCompleted;

                if (isProfileCompleted) {
                    router.replace(`/${actualRole}/dashboard`);
                } else {
                    router.replace(`/${actualRole}/profile-update`);
                }
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Google Login failed'));
    };

    const handleResendOtp = () => {
        if (timer > 0) return;
        dispatch(resendOtp({ email: form.email }))
            .unwrap()
            .then((res: { code?: string }) => {
                setGeneratedOtpCode(res.code ?? '');
                setTimer(60);
                setError(null);
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Failed to resend OTP'));
    };

    // --- VIEW: OTP VERIFICATION ---
    if (showOtpView) {
        return (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Verify Email</h2>
                    <p className="text-sm text-slate-500">
                        Enter the 6-digit code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{form.email}</span>
                    </p>
                </div>

                <div className="min-h-[48px] w-full">
                    {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg break-words w-full">{error}</div>}
                </div>

                {/* Dev-only OTP display — remove before production */}
                {generatedOtpCode && (
                    <div className="p-3 rounded bg-yellow-100 text-black text-center font-bold">
                        TEST OTP: {generatedOtpCode}
                    </div>
                )}

                <Input
                    label="OTP Code"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                />

                <Button type="submit" fullWidth isLoading={isLoading}>Verify Code</Button>

                <div className="text-center">
                    <button
                        type="button"
                        disabled={timer > 0}
                        onClick={handleResendOtp}
                        className={`text-sm font-medium ${timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                    >
                        {timer > 0 ? `Resend code in ${timer}s` : 'Resend OTP'}
                    </button>
                </div>
            </form>
        );
    }

    // --- VIEW: SIGNUP FORM ---
    return (
        <form onSubmit={handleSignup} className="space-y-4 animate-fade-in" noValidate>
            <div className="min-h-[48px] w-full">
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2 w-full break-words">
                        <i className="fas fa-exclamation-circle flex-shrink-0"></i>
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Role Selection */}
            <div className="flex gap-3">
                {(['patient', 'doctor'] as const).map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 py-2.5 px-4 rounded-xl border-2 capitalize transition-all ${role === r ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500'
                            }`}
                    >
                        <i className={`fas ${r === 'patient' ? 'fa-user' : 'fa-user-md'} mr-2`}></i> {r}
                    </button>
                ))}
            </div>

            {/* Google OAuth */}
            <button
                type="button"
                disabled={!role}
                onClick={handleOAuth} 
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm font-semibold text-slate-700">Sign up with Google</span>
            </button>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase">Or email</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-3">
                <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" icon={<i className="fas fa-user"></i>} />
                <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" icon={<i className="fas fa-envelope"></i>} required />
                <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" icon={<i className="fas fa-lock"></i>} required />
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} icon={<i className="fas fa-chevron-right"></i>} iconPosition="right">
                Continue to Verification
            </Button>
        </form>
    );
};

export default UnifiedSignupForm;
