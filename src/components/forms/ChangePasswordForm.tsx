'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import authService from '@/redux/auth/authService';
import { useAppSelector } from '@/redux/hooks';
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ChangePasswordForm() {
    const { user } = useAppSelector((state) => state.auth);
    const hasPassword = user?.hasPassword ?? true; // fallback to true if unknown

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if ((hasPassword && !currentPassword) || !newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.changePassword({ 
                currentPassword: hasPassword ? currentPassword : '', 
                newPassword 
            });
            setSuccess('Password successfully updated.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md animate-fade-in" noValidate>
            
            {!hasPassword && (
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 border border-blue-100 mb-4">
                    <h3 className="font-semibold text-lg mb-1">Set Account Password</h3>
                    <p>You signed in with Google. Set a password to also allow logging in with your email and password.</p>
                </div>
            )}

            {error && (
                <div className="rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {hasPassword && (
                <div className="relative">
                    <Input
                        label="Current Password"
                        type={showCurrent ? 'text' : 'password'}
                        name="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrent(p => !p)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 text-sm"
                        aria-label={showCurrent ? 'Hide password' : 'Show password'}
                    >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            )}

            <div className="relative">
                <Input
                    label="New Password"
                    type={showNew ? 'text' : 'password'}
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowNew(p => !p)}
                    className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 text-sm"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />

            <Button type="submit" isLoading={isSubmitting}>
                {hasPassword ? 'Update Password' : 'Set Password'}
            </Button>
        </form>
    );
}
