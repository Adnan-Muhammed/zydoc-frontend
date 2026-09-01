// src/components/forms/AdminLoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser } from "@/redux/auth/authThunk";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertTriangle } from "lucide-react";
 
export default function AdminLoginForm() {
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(false);

    useEffect(() => {
        if (isAuthenticated) window.location.href = "/admin/dashboard";
    }, [isAuthenticated]);

    const onLogin = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginUser({ credentials: { email, password, rememberDevice }, isAdmin: true }));
    };

    const handleGoogleSignIn = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/google`;
    };

    return (
        <form onSubmit={onLogin} className="flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-xs leading-snug text-amber-300">
                    Admin access restricted. All login attempts are logged for security audit.
                </p>
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-400/10 p-2 rounded border border-red-500/20">
                    {error}
                </p>
            )}

            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 pl-10 p-3 rounded-lg border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"
                    required
                />
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 pl-10 pr-10 p-3 rounded-lg border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="h-4 w-4 rounded bg-slate-800 border-slate-700 accent-blue-600"
                    />
                    Keep me signed in
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-60"
            >
                {isLoading ? "Authenticating..." : <><LogIn size={18} /> Sign In to Admin</>}
            </button>

            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-800" />
                <span className="text-xs uppercase tracking-widest text-slate-600">OR</span>
                <span className="h-px flex-1 bg-slate-800" />
            </div>

            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-700 bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
                <GoogleIcon />
                Continue with Google
            </button>
        </form>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
        </svg>
    );
}