'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import authService from '@/redux/auth/authService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    // Step 1 State
    const [email, setEmail] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);
    
    // Step 2 State
    const [userId, setUserId] = useState('');
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Step 3 State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [showPassword, setShowPassword] = useState(false);
    
    // For specific error matching
    const isAccountNotFoundError = error === 'Account not found. Please sign up.';

    const handleRequestOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsRequesting(true);
        try {
            const res = await authService.forgotPassword({ email });
            setUserId(res.userId);
            setStep(2);
            setSuccess('An OTP has been sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to request OTP');
        } finally {
            setIsRequesting(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }

        setIsVerifying(true);
        try {
            await authService.verifyResetOtp({ userId, otp });
            setStep(3);
            setSuccess('OTP verified. Please enter your new password.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if (!newPassword || !confirmPassword) {
            setError('Please enter and confirm your new password');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsResetting(true);
        try {
            await authService.resetPassword({ userId, otp, newPassword });
            setSuccess('Password updated successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                    {isAccountNotFoundError && (
                        <Link href="/signup" className="font-semibold underline mt-1 ml-6">
                            Go to Sign Up
                        </Link>
                    )}
                </div>
            )}
            {success && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-100 flex items-center gap-2">
                    <i className="fas fa-check-circle"></i>
                    {success}
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-5" noValidate>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enter the email address associated with your account and we'll send you a code to reset your password.
                    </p>
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" fullWidth isLoading={isRequesting}>
                        Send OTP
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enter the 6-digit OTP sent to <strong>{email}</strong>.
                    </p>
                    <Input
                        label="6-Digit OTP"
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                    />
                    
                    <Button type="submit" fullWidth isLoading={isVerifying}>
                        Verify OTP
                    </Button>

                    <div className="text-center mt-4">
                        <button 
                            type="button" 
                            onClick={() => handleRequestOtp()} 
                            disabled={isRequesting}
                            className="text-sm text-blue-600 font-semibold hover:underline disabled:opacity-50"
                        >
                            Resend OTP
                        </button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Please enter your new password.
                    </p>
                    
                    <div className="relative">
                        <Input
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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

                    <Input
                        label="Confirm New Password"
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth isLoading={isResetting}>
                        Reset Password
                    </Button>
                </form>
            )}

            <div className="mt-6 text-center text-sm">
                <Link href="/login" className="text-slate-600 font-semibold hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
