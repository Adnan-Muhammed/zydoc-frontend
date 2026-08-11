// src/components/forms/UnifiedLoginForm.tsx — for doctor and patient login

'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUser, loginWithGoogleUser } from '@/redux/auth/authThunk';
import Button from '../ui/Button'; 
import Input from '../ui/Input';

const UnifiedLoginForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector((state) => state.auth);

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [roleLoading, setRoleLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.email || !form.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const res = await dispatch(
                loginUser({ credentials: { email: form.email, password: form.password } })
            ).unwrap() as { user: { role: string } };

            const role = res?.user?.role;
            if (!role) {
                setError('Login failed: user role not found. Please try again.');
                return;
            }

            // Full page navigation — forces server components to re-run so cookies are picked up
            window.location.href = `/${role}/dashboard`;
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && (err as any).requiresVerification) {
                const payload = err as any;
                sessionStorage.setItem('signup_email', payload.email || form.email);
                sessionStorage.setItem('signup_role', 'patient'); // default role for view, we only need to show OTP UI
                if (payload.signupToken) {
                    sessionStorage.setItem('signupToken', payload.signupToken);
                }
                sessionStorage.setItem('show_otp_view', 'true');
                window.location.href = '/signup';
                return;
            }
            setError(typeof err === 'string' ? err : 'Invalid email or password');
        }
    };

    const handleOAuth = () => {
        // Dispatch the Google login thunk. We don't have a role here, so pass undefined.
        // authService.ts will handle the actual Firebase popup.
        dispatch(loginWithGoogleUser(undefined))
            .unwrap()
            .then((res: any) => {

                const userRole = res?.user?.role || 'patient';
                if (userRole === 'unassigned') {
                    setShowRoleSelector(true);
                } else {
                    // Full page navigation — forces server components to re-run so cookies are picked up
                    window.location.href = `/${userRole}/dashboard`;
                }
            })
            .catch((err: unknown) => setError(typeof err === 'string' ? err : 'Google Login failed'));
    };

    const handleRoleSelection = async (role: 'doctor' | 'patient') => {

        setRoleLoading(true);
        setError(null);
        try {
            const { setRoleUser } = await import('@/redux/auth/authThunk');

            await dispatch(setRoleUser({ role })).unwrap();
            window.location.href = `/${role}/profile-update`;
        } catch (err: any) {
            console.error('[DEBUG] setRoleUser failed:', err);
            setError(typeof err === 'string' ? err : 'Failed to set role. Please try again.');
            setRoleLoading(false);
        }
    };

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

    return (
        <form onSubmit={handleLogin} className="space-y-5 animate-fade-in" noValidate>
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                </div>
            )}
 
            {/* Google OAuth */}
            <button
                type="button"
                onClick={handleOAuth}
                className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-5 h-5"
                />
                Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                <span className="text-xs text-slate-500 font-medium uppercase">OR</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            </div>

            {/* Email */}
            <Input
                label="Email Address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
            />

            {/* Password */}
            <div className="relative">
                <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 text-sm"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
            </div>

            {/* Submit */}
            <Button type="submit" fullWidth isLoading={isLoading}>
                Sign In
            </Button>
        </form>
    );
};

export default UnifiedLoginForm;