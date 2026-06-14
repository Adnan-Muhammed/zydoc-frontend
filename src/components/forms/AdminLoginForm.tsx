
// // src/components/forms/AdminLoginForm.tsx

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { Eye, EyeOff, Mail, Lock, LogIn, AlertTriangle, ShieldCheck } from "lucide-react";
// import axiosInstance from "@/api/axiosInstance";

// export default function AdminLoginForm() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [otp, setOtp] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [rememberDevice, setRememberDevice] = useState(false);
//     const [use2FA, setUse2FA] = useState(false);
//     const [step, setStep] = useState<"credentials" | "otp">("credentials");
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // ── Step 1: email + password ──────────────────────────────────────────
//     const handleCredentials = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);

//         if (!email || !password) {
//             setError("Please fill in all fields.");
//             return;
//         }

//         setIsLoading(true);
//         try {

//             console.log('before');




//             const res = await axiosInstance.post(
//                 `admin/auth/login`,
//                 { email, password, rememberDevice, use2FA },
//                 {
//                     headers: { "Content-Type": "application/json" },
//                     withCredentials: true,
//                 }
//             );


//             console.log('after');


//             const data = await res.data;

//             console.log('data', data.requires2FA)



//             if (use2FA && data.requires2FA) {

//                 console.log(data.requires2FA, 'data.requires2FA');

//                 console.log('otp   component render logic');

//                 setStep("otp");
//                 return;
//             }

//             window.location.href = "/admin/dashboard";

//         } catch {
//             setError("Network error. Please check your connection.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // ── Step 2: OTP verification ──────────────────────────────────────────
//     const handleVerifyOtp = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);

//         if (otp.length !== 6) {
//             setError("Enter the 6-digit code.");
//             return;
//         }

//         setIsLoading(true);
//         try {
//             const res = await fetch(
//                 `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/verify-otp`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     credentials: "include",
//                     body: JSON.stringify({ email, otp }),
//                 }
//             );

//             const data = await res.json();

//             if (!res.ok) {
//                 setError(data.message || "Invalid or expired code.");
//                 return;
//             }

//             window.location.href = "/admin/dashboard";

//         } catch {
//             setError("Network error. Please check your connection.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleGoogleSignIn = () => {
//         window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/google`;
//     };

//     // ── OTP screen ────────────────────────────────────────────────────────
//     if (step === "otp") {
//         return (
//             <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5" noValidate>

//                 <div className="flex flex-col items-center gap-2 text-center">
//                     <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
//                         <ShieldCheck className="h-6 w-6 text-blue-400" />
//                     </span>
//                     <h3 className="text-lg font-bold text-white">Two-Factor Verification</h3>
//                     <p className="text-sm text-slate-400">
//                         Enter the 6-digit code sent to{" "}
//                         <span className="font-medium text-slate-300">{email}</span>
//                     </p>
//                 </div>

//                 {error && (
//                     <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
//                         <p className="text-sm text-red-400">{error}</p>
//                     </div>
//                 )}

//                 <div className="flex flex-col gap-1.5">
//                     <label htmlFor="otp-input" className="text-sm font-medium text-slate-200">
//                         Authentication Code
//                     </label>
//                     <input
//                         id="otp-input"
//                         type="text"
//                         inputMode="numeric"
//                         maxLength={6}
//                         autoFocus
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                         placeholder="000000"
//                         className="w-full rounded-lg border border-slate-600/50 bg-slate-800/60 py-4 px-4 text-center text-2xl tracking-[0.6em] text-slate-100 placeholder:text-slate-600 placeholder:tracking-widest transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                     />
//                     <p className="text-xs text-slate-500">Code expires in 5 minutes.</p>
//                 </div>

//                 <button
//                     type="submit"
//                     disabled={isLoading || otp.length !== 6}
//                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                     {isLoading
//                         ? <><Spinner /> Verifying…</>
//                         : <><ShieldCheck className="h-4 w-4" /> Verify & Sign In</>
//                     }
//                 </button>

//                 <button
//                     type="button"
//                     onClick={() => { setStep("credentials"); setOtp(""); setError(null); }}
//                     className="text-center text-sm text-slate-500 transition hover:text-slate-300"
//                 >
//                     ← Back to login
//                 </button>
//             </form>
//         );
//     }

//     // ── Credentials screen ────────────────────────────────────────────────
//     return (
//         <form onSubmit={handleCredentials} className="flex flex-col gap-5" noValidate>

//             {/* Security warning */}
//             <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
//                 <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
//                 <p className="text-sm leading-snug text-amber-300">
//                     Unauthorized access attempts are monitored and logged.
//                 </p>
//             </div>

//             {/* Runtime error */}
//             {error && (
//                 <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
//                     <p className="text-sm text-red-400">{error}</p>
//                 </div>
//             )}

//             {/* Email */}
//             <div className="flex flex-col gap-1.5">
//                 <label htmlFor="admin-email" className="text-sm font-medium text-slate-200">
//                     Admin Email
//                 </label>
//                 <div className="relative">
//                     <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                     <input
//                         id="admin-email"
//                         type="email"
//                         autoComplete="email"
//                         required
//                         value={email}
//                         onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
//                         placeholder="admin@example.com"
//                         className="w-full rounded-lg border border-slate-600/50 bg-slate-800/60 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                     />
//                 </div>
//             </div>

//             {/* Password */}
//             <div className="flex flex-col gap-1.5">
//                 <label htmlFor="admin-password" className="text-sm font-medium text-slate-200">
//                     Password
//                 </label>
//                 <div className="relative">
//                     <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                     <input
//                         id="admin-password"
//                         type={showPassword ? "text" : "password"}
//                         autoComplete="current-password"
//                         required
//                         value={password}
//                         onChange={(e) => { setPassword(e.target.value); if (error) setError(null); }}
//                         placeholder="••••••••••"
//                         className="w-full rounded-lg border border-slate-600/50 bg-slate-800/60 py-3 pl-10 pr-11 text-sm text-slate-100 placeholder:text-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                     />
//                     <button
//                         type="button"
//                         onClick={() => setShowPassword((v) => !v)}
//                         aria-label={showPassword ? "Hide password" : "Show password"}
//                         className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
//                     >
//                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                     </button>
//                 </div>
//             </div>

//             {/* Remember + Forgot */}
//             <div className="flex items-center justify-between">
//                 <label className="flex cursor-pointer items-center gap-2 select-none">
//                     <input
//                         type="checkbox"
//                         checked={rememberDevice}
//                         onChange={(e) => setRememberDevice(e.target.checked)}
//                         className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
//                     />
//                     <span className="text-sm text-slate-400">Remember device</span>
//                 </label>
//                 <Link
//                     href="/admin/forgot-password"
//                     className="text-sm text-blue-400 transition hover:text-blue-300 hover:underline"
//                 >
//                     Forgot password?
//                 </Link>
//             </div>

//             {/* Sign In CTA */}
//             <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//                 {isLoading
//                     ? <><Spinner /> Signing in…</>
//                     : <><LogIn className="h-4 w-4" /> Sign In to Admin</>
//                 }
//             </button>

//             {/* Divider */}
//             <div className="flex items-center gap-3">
//                 <span className="h-px flex-1 bg-slate-700" />
//                 <span className="text-xs uppercase tracking-widest text-slate-500">or</span>
//                 <span className="h-px flex-1 bg-slate-700" />
//             </div>

//             {/* Google SSO */}
//             <button
//                 type="button"
//                 onClick={handleGoogleSignIn}
//                 className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-600/50 bg-white py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
//             >
//                 <GoogleIcon />
//                 Continue with Google
//             </button>

//             {/* 2FA toggle */}
//             <label className="flex cursor-pointer items-center gap-2 select-none">
//                 <input
//                     type="checkbox"
//                     checked={use2FA}
//                     onChange={(e) => setUse2FA(e.target.checked)}
//                     className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
//                 />
//                 <span className="text-sm text-slate-400">Use Two-Factor Authentication</span>
//             </label>
//         </form>
//     );
// }

// function Spinner() {
//     return (
//         <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//         </svg>
//     );
// }

// function GoogleIcon() {
//     return (
//         <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
//             <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
//             <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
//             <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
//             <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
//         </svg>
//     );
// }












// // src/components/forms/AdminLoginForm.tsx

// "use client";

// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/redux/store";
// import { loginAdmin, verifyAdminOtp } from "@/redux/features/admin/adminThunk";
// import { resetAdminUI } from "@/redux/features/admin/adminSlice";
// import { Eye, EyeOff, Mail, Lock, LogIn, AlertTriangle, ShieldCheck } from "lucide-react";

// export default function AdminLoginPage() {
//     const dispatch = useDispatch<AppDispatch>();
//     const { isLoading, error, requires2FA, isSuccess, emailForOTP } = useSelector(
//         (state: RootState) => state.admin
//     );

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [otp, setOtp] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [use2FA, setUse2FA] = useState(false);

//     // Redirect on successful login
//     useEffect(() => {
//         if (isSuccess) {
//             window.location.href = "/admin/dashboard";
//         }
//     }, [isSuccess]);

//     const handleCredentialsSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         dispatch(loginAdmin({ email, password, use2FA }));
//     };

//     const handleOtpSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (emailForOTP) {
//             dispatch(verifyAdminOtp({ email: emailForOTP, otp }));
//         }
//     };

//     if (requires2FA) {
//         return (
//             <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
//                 <div className="flex flex-col items-center gap-2 text-center">
//                     <ShieldCheck className="h-10 w-10 text-blue-400" />
//                     <h3 className="text-xl font-bold text-white">2FA Verification</h3>
//                     <p className="text-sm text-slate-400">Code sent to {emailForOTP}</p>
//                 </div>

//                 {error && <p className="text-red-400 text-sm text-center">{error}</p>}

//                 <input
//                     type="text"
//                     maxLength={6}
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                     placeholder="000000"
//                     className="w-full bg-slate-800 text-white text-center text-2xl py-3 rounded-lg border border-slate-700"
//                 />

//                 <button
//                     disabled={isLoading}
//                     className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold"
//                 >
//                     {isLoading ? "Verifying..." : "Verify Code"}
//                 </button>
//             </form>
//         );
//     }

//     return (
//         <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-5">
//             <h2 className="text-2xl font-bold text-white text-center">Admin Portal</h2>

//             {error && (
//                 <div className="bg-red-500/10 border border-red-500/50 p-3 rounded text-red-400 text-sm">
//                     {error}
//                 </div>
//             )}

//             <div className="space-y-4">
//                 <input
//                     type="email"
//                     placeholder="Admin Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full bg-slate-800 p-3 rounded border border-slate-700 text-white"
//                     required
//                 />
//                 <input
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full bg-slate-800 p-3 rounded border border-slate-700 text-white"
//                     required
//                 />
//             </div>

//             <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer">
//                 <input
//                     type="checkbox"
//                     checked={use2FA}
//                     onChange={(e) => setUse2FA(e.target.checked)}
//                 />
//                 Enable Two-Factor Authentication
//             </label>

//             <button
//                 disabled={isLoading}
//                 className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition"
//             >
//                 {isLoading ? "Signing in..." : "Login to Dashboard"}
//             </button>
//         </form>
//     );
// }




// src/components/forms/AdminLoginForm.tsx

// "use client";

// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/redux/store";
// import { loginAdmin, verifyAdminOtp } from "@/redux/features/admin/adminThunk";
// import { resetAdminAuth } from "@/redux/features/admin/adminSlice";
// import Link from "next/link";
// import { Eye, EyeOff, Mail, Lock, LogIn, AlertTriangle, ShieldCheck } from "lucide-react";

// export default function AdminLoginForm() {
//     const dispatch = useDispatch<AppDispatch>();
//     const { isLoading, error, requires2FA, isSuccess, emailForOTP } = useSelector(
//         (state: RootState) => state.admin
//     );

//     // Local form state
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [otp, setOtp] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [rememberDevice, setRememberDevice] = useState(false);
//     const [use2FA, setUse2FA] = useState(false);

//     // Redirect on Success
//     useEffect(() => {
//         if (isSuccess) {
//             window.location.href = "/admin/dashboard";
//         }
//     }, [isSuccess]);

//     const handleCredentials = (e: React.FormEvent) => {
//         e.preventDefault();
//         dispatch(loginAdmin({ email, password, rememberDevice, use2FA }));
//     };

//     const handleVerifyOtp = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (emailForOTP) {
//             dispatch(verifyAdminOtp({ email: emailForOTP, otp }));
//         }
//     };

//     const handleGoogleSignIn = () => {
//         window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/google`;
//     };

//     // ── OTP Screen UI ──────────────────────────────────────────────────────
//     if (requires2FA) {
//         return (
//             <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5" noValidate>
//                 <div className="flex flex-col items-center gap-2 text-center">
//                     <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
//                         <ShieldCheck className="h-6 w-6 text-blue-400" />
//                     </span>
//                     <h3 className="text-lg font-bold text-white">Two-Factor Verification</h3>
//                     <p className="text-sm text-slate-400">
//                         Enter the 6-digit code sent to{" "}
//                         <span className="font-medium text-slate-300">{emailForOTP}</span>
//                     </p>
//                 </div>

//                 {error && (
//                     <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center">
//                         <p className="text-sm text-red-400">{error}</p>
//                     </div>
//                 )}

//                 <div className="flex flex-col gap-1.5">
//                     <label htmlFor="otp-input" className="text-sm font-medium text-slate-200">
//                         Authentication Code
//                     </label>
//                     <input
//                         id="otp-input"
//                         type="text"
//                         inputMode="numeric"
//                         maxLength={6}
//                         autoFocus
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                         placeholder="000000"
//                         className="w-full rounded-lg border border-slate-600/50 bg-slate-800/60 py-4 px-4 text-center text-2xl tracking-[0.6em] text-slate-100 placeholder:text-slate-600 placeholder:tracking-widest transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//                     />
//                 </div>

//                 <button
//                     type="submit"
//                     disabled={isLoading || otp.length !== 6}
//                     className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
//                 >
//                     {isLoading ? <Spinner /> : <ShieldCheck className="h-4 w-4" />}
//                     {isLoading ? "Verifying…" : "Verify & Sign In"}
//                 </button>

//                 <button
//                     type="button"
//                     onClick={() => dispatch(resetAdminAuth())}
//                     className="text-center text-sm text-slate-500 transition hover:text-slate-300"
//                 >
//                     ← Back to login
//                 </button>
//             </form>
//         );
//     }

//     // ── Credentials Screen UI ──────────────────────────────────────────────
//     return (
//         <form onSubmit={handleCredentials} className="flex flex-col gap-5" noValidate>
//             <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
//                 <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
//                 <p className="text-sm leading-snug text-amber-300">
//                     Unauthorized access attempts are monitored and logged.
//                 </p>
//             </div>

//             {error && (
//                 <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
//                     <p className="text-sm text-red-400 text-center">{error}</p>
//                 </div>
//             )}

//             <div className="flex flex-col gap-1.5">
//                 <label htmlFor="admin-email" className="text-sm font-medium text-slate-200">
//                     Admin Email
//                 </label>
//                 <div className="relative">
//                     <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                     <input
//                         id="admin-email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="admin@example.com"
//                         className="w-full rounded-lg border border-slate-600/50 bg-slate-800/60 py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-blue-500 outline-none"
//                     />
//                 </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//                 <label htmlFor="admin-password" className="text-sm font-medium text-slate-200">
//                     Password
//                 </label>
//                 <div className="relative">
//                     <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                     <input
//                         id="admin-password"
//                         type={showPassword ? "text" : "password"}
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="••••••••••"
//                         className="w-full rounded-lg border border-slate-600/50 bg-slate-800/60 py-3 pl-10 pr-11 text-sm text-slate-100 placeholder:text-slate-400 transition focus:border-blue-500 outline-none"
//                     />
//                     <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
//                     >
//                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                     </button>
//                 </div>
//             </div>

//             <div className="flex items-center justify-between">
//                 <label className="flex cursor-pointer items-center gap-2 select-none">
//                     <input
//                         type="checkbox"
//                         checked={rememberDevice}
//                         onChange={(e) => setRememberDevice(e.target.checked)}
//                         className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
//                     />
//                     <span className="text-sm text-slate-400">Remember device</span>
//                 </label>
//                 <Link href="/admin/forgot-password" title="Reset your password" className="text-sm text-blue-400 hover:text-blue-300">
//                     Forgot password?
//                 </Link>
//             </div>

//             <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-60"
//             >
//                 {isLoading ? <Spinner /> : <LogIn className="h-4 w-4" />}
//                 {isLoading ? "Signing in…" : "Sign In to Admin"}
//             </button>

//             <div className="flex items-center gap-3">
//                 <span className="h-px flex-1 bg-slate-700" />
//                 <span className="text-xs uppercase text-slate-500">or</span>
//                 <span className="h-px flex-1 bg-slate-700" />
//             </div>

//             <button
//                 type="button"
//                 onClick={handleGoogleSignIn}
//                 className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-600/50 bg-white py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
//             >
//                 <GoogleIcon />
//                 Continue with Google
//             </button>

//             <label className="flex cursor-pointer items-center gap-2 select-none">
//                 <input
//                     type="checkbox"
//                     checked={use2FA}
//                     onChange={(e) => setUse2FA(e.target.checked)}
//                     className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-blue-500"
//                 />
//                 <span className="text-sm text-slate-400">Use Two-Factor Authentication</span>
//             </label>
//         </form>
//     );
// }

// // --- Helpers ---

// function Spinner() {
//     return (
//         <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//         </svg>
//     );
// }

// function GoogleIcon() {
//     return (
//         <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
//             <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
//             <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
//             <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
//             <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
//         </svg>
//     );
// }



// src/components/forms/AdminLoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { loginUser } from "@/redux/auth/authThunk";
import { resetAuth } from "@/redux/auth/authSlice";
import { Mail, Lock, LogIn, ShieldCheck, ArrowLeft, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function AdminLoginForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

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
        // Redirects to your backend Passport.js / Google OAuth route
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/google`;
    };

    // --- STEP 1: Credentials UI ---
    return (
        <form onSubmit={onLogin} className="flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-xs leading-snug text-amber-300">
                    Admin access restricted. All login attempts are logged for security audit.
                </p>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-400/10 p-2 rounded border border-red-500/20">{error}</p>}

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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
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


            <button disabled={isLoading} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
                {isLoading ? "Authenticating..." : <><LogIn size={18} /> Sign In to Admin</>}
            </button>

            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-800" />
                <span className="text-xs uppercase tracking-widest text-slate-600">OR</span>
                <span className="h-px flex-1 bg-slate-800" />
            </div>

            {/* Restored Google SSO Button */}
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

// --- Icons / Helpers ---

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
        </svg>
    );
}