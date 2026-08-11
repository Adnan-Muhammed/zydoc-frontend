// src/components/forms/UnifiedSignupForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    const [isMounted, setIsMounted] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [roleLoading, setRoleLoading] = useState(false);
    const [showRoleMismatchModal, setShowRoleMismatchModal] = useState(false);
    const [mismatchRedirectData, setMismatchRedirectData] = useState<{ actualRole: string; isProfileCompleted: boolean } | null>(null);

    const startTimer = (duration: number = 60) => {
        if (timerRef.current) clearInterval(timerRef.current);
        const expiryTime = Date.now() + duration * 1000;
        sessionStorage.setItem('otp_expiry', expiryTime.toString());
        setTimer(duration);

        timerRef.current = setInterval(() => {
            const remaining = Math.round((expiryTime - Date.now()) / 1000);
            if (remaining <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                sessionStorage.removeItem('otp_expiry');
                setTimer(0);
            } else {
                setTimer(remaining);
            }
        }, 1000);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Restore state from session storage on mount
    useEffect(() => {
        setIsMounted(true);
        const savedEmail = sessionStorage.getItem('signup_email');
        const savedRole = sessionStorage.getItem('signup_role');
        const isOtpView = sessionStorage.getItem('show_otp_view') === 'true';

        if (isOtpView && savedEmail && savedRole) {
            setForm(prev => ({ ...prev, email: savedEmail }));
            setRole(savedRole as 'patient' | 'doctor');
            setShowOtpView(true);

            // Restore timer
            const expiryStr = sessionStorage.getItem('otp_expiry');
            if (expiryStr) {
                const remaining = Math.round((parseInt(expiryStr, 10) - Date.now()) / 1000);
                if (remaining > 0) {
                    startTimer(remaining);
                } else {
                    sessionStorage.removeItem('otp_expiry');
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync Redux 2FA flag with local OTP view state
    useEffect(() => {
        if (requires2FA) {
            setShowOtpView(true);
            sessionStorage.setItem('show_otp_view', 'true');
        }
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

        const signupToken = sessionStorage.getItem('signupToken') || undefined;

        dispatch(signupUser({ ...form, role, signupToken }))
            .unwrap()
            .then((res: any) => {
                sessionStorage.setItem('signup_email', form.email);
                sessionStorage.setItem('signup_role', role);
                if (res.signupToken) {
                    sessionStorage.setItem('signupToken', res.signupToken);
                }
                sessionStorage.setItem('show_otp_view', 'true');
                setShowOtpView(true);
                startTimer();
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Signup failed'));
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(verifyOtp({ data: { email: form.email, otpCode }, isAdmin: false }))
            .unwrap()
            .then(() => {
                sessionStorage.removeItem('signup_email');
                sessionStorage.removeItem('signup_role');
                sessionStorage.removeItem('show_otp_view');
                sessionStorage.removeItem('signupToken');
                router.replace(`/${role}/profile-update`);
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Invalid OTP code'));
    };

    const executeRedirect = (actualRole: string, isProfileCompleted: boolean) => {
        if (isProfileCompleted) {
            window.location.href = `/${actualRole}/dashboard`;
        } else {
            window.location.href = `/${actualRole}/profile-update`;
        }
    };

    const handleOAuth = () => {
        dispatch(loginWithGoogleUser(role || undefined))
            .unwrap()
            .then((res: any) => {
                const actualRole = res?.user?.role;
                const isProfileCompleted = res?.user?.isProfileCompleted;

                if (!actualRole || actualRole === 'unassigned') {
                    setShowRoleSelector(true);
                } else {
                    if (role && actualRole !== role) {
                        setMismatchRedirectData({ actualRole, isProfileCompleted });
                        setShowRoleMismatchModal(true);
                    } else {
                        executeRedirect(actualRole, isProfileCompleted);
                    }
                }
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Google Login failed'));
    };

    const handleRoleSelection = async (selectedRole: 'doctor' | 'patient') => {
        setRoleLoading(true);
        setError(null);
        try {
            const { setRoleUser } = await import('@/redux/auth/authThunk');
            await dispatch(setRoleUser({ role: selectedRole })).unwrap();
            window.location.href = `/${selectedRole}/profile-update`;
        } catch (err: any) {
            console.error('[DEBUG] setRoleUser failed:', err);
            setError(typeof err === 'string' ? err : 'Failed to set role. Please try again.');
            setRoleLoading(false);
        }
    };

    const handleResendOtp = () => {
        if (timer > 0) return;
        dispatch(resendOtp({ email: form.email }))
            .unwrap()
            .then((res: { code?: string }) => {
                setGeneratedOtpCode(res.code ?? '');
                startTimer();
                setError(null);
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Failed to resend OTP'));
    };

    if (!isMounted) {
        return <div className="min-h-[400px] flex items-center justify-center text-slate-400"><i className="fas fa-spinner fa-spin text-2xl"></i></div>;
    }

    // --- VIEW: OTP VERIFICATION ---
    if (showOtpView) {
        return (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Verify Email</h2>
                    <p className="text-sm text-slate-500">
                        Enter the 6-digit code sent to <span className="font-semibold text-slate-700 dark:text-slate-300">{form.email}</span>
                    </p>
                    <div className="mt-1">
                        <button
                            type="button"
                            onClick={() => {
                                sessionStorage.removeItem('signup_email');
                                sessionStorage.removeItem('signup_role');
                                sessionStorage.removeItem('show_otp_view');
                                setShowOtpView(false);
                            }}
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Change Email
                        </button>
                    </div>
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

    // --- VIEW: ROLE SELECTOR ---
    if (showRoleSelector) {
        return (
            <div className="space-y-6 animate-fade-in text-center p-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Zydoc!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    To complete your account setup, please select how you'll be using the platform.
                </p>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => handleRoleSelection('patient')}
                        disabled={roleLoading}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <i className="fas fa-user-injured text-xl"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">I am a Patient</h3>
                            </div>
                        </div>
                        <i className="fas fa-chevron-right text-slate-400 group-hover:text-blue-500"></i>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleRoleSelection('doctor')}
                        disabled={roleLoading}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <i className="fas fa-user-md text-xl"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">I am a Doctor</h3>
                            </div>
                        </div>
                        <i className="fas fa-chevron-right text-slate-400 group-hover:text-emerald-500"></i>
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW: ROLE MISMATCH MODAL ---
    if (showRoleMismatchModal && mismatchRedirectData) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden animate-slide-up">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mx-auto mb-4">
                        <i className="fas fa-info-circle text-xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                        Account Exists
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                        You originally registered as a <strong className="capitalize">{mismatchRedirectData.actualRole}</strong>. You are being redirected to your <strong className="capitalize">{mismatchRedirectData.actualRole}</strong> account.
                    </p>
                    <Button 
                        type="button" 
                        fullWidth 
                        onClick={() => executeRedirect(mismatchRedirectData.actualRole, mismatchRedirectData.isProfileCompleted)}
                    >
                        OK, Continue
                    </Button>
                </div>
            </div>
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
