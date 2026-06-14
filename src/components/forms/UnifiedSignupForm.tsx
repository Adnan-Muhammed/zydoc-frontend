

// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { signupUser } from '@/redux/auth/authThunk';
// import Button from '../ui/Button';
// import Input from '../ui/Input';

// const UnifiedSignupForm: React.FC = () => {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const { isLoading } = useAppSelector((state) => state.auth || {});

//     const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
//     const [form, setForm] = useState({
//         name: '',
//         email: '',
//         password: '',
//     });
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setForm((prev) => ({ ...prev, [name]: value }));

//         if (validationErrors[name]) {
//             setValidationErrors((prev) => ({ ...prev, [name]: '' }));
//         }
//         if (error) setError(null);
//     };

//     const handleSignup = (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);
//         const newErrors: Record<string, string> = {};

//         if (!role) {
//             setError('Please select a role to continue (Patient or Doctor).');
//             return;
//         }
//         if (!form.email) newErrors.email = 'Enter a valid email address';
//         if (!form.password || form.password.length < 8) {
//             newErrors.password = 'Password must be at least 8 characters';
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setValidationErrors(newErrors);
//             return;
//         }

//         dispatch(
//             signupUser({
//                 name: form.name,
//                 email: form.email,
//                 password: form.password,
//                 role: role!,
//             })
//         )
//             .unwrap()
//             .then(() => {
//                 router.replace(`/${role}/profile-update`);
//             })
//             .catch((err) => {
//                 setError(err || 'Failed to sign up');
//             });
//     };

//     const handleOAuth = (provider: 'google') => {
//         if (!role) {
//             setError('Please select a role before signing in with Google.');
//             return;
//         }
//         alert(`OAuth (${provider}) for ${role} not fully implemented yet.`);
//     };

//     return (
//         <form onSubmit={handleSignup} className="space-y-4 animate-fade-in" noValidate>
//             {error && (
//                 <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
//                     <i className="fas fa-exclamation-triangle"></i>
//                     {error}
//                 </div>
//             )}

//             {/* Role Selection */}
//             <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     I want to sign up as a:
//                 </label>
//                 <div className="flex gap-4">
//                     <button
//                         type="button"
//                         onClick={() => {
//                             setRole('patient');
//                             if (error) setError(null);
//                         }}
//                         className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${role === 'patient'
//                             ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
//                             : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
//                             }`}
//                     >
//                         <i className="fas fa-user mr-2"></i> Patient
//                     </button>
//                     <button
//                         type="button"
//                         onClick={() => {
//                             setRole('doctor');
//                             if (error) setError(null);
//                         }}
//                         className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${role === 'doctor'
//                             ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
//                             : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
//                             }`}
//                     >
//                         <i className="fas fa-user-md mr-2"></i> Doctor
//                     </button>
//                 </div>
//             </div>

//             {/* OAuth Buttons */}
//             <div>
//                 {/* <button
//                     type="button"

//                     onClick={() => handleOAuth('google')}
//                     className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
//                 >
//                     <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
//                     Sign up with Google
//                 </button>

//                 <button
//                     type="button"
//                     disabled={!role}
//                     onClick={() => handleOAuth('google')}
//                     className={`w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border 
//     ${!role
//                             ? 'opacity-50 cursor-not-allowed'
//                             : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
//                         }`}
//                 ></button> */}

//                 <button
//                     type="button"
//                     disabled={!role}
//                     onClick={() => handleOAuth('google')}
//                     className={`w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 
//     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors
//     ${!role
//                             ? 'opacity-50 cursor-not-allowed'
//                             : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
//                         }`}
//                 >
//                     <img
//                         src="https://www.svgrepo.com/show/475656/google-color.svg"
//                         alt="Google"
//                         className="w-5 h-5"
//                     />
//                     Sign up with Google
//                 </button>
//             </div>

//             <div className="flex items-center gap-3">
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                 <span className="text-xs text-slate-500 font-medium uppercase">OR</span>
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             </div>

//             <div className="space-y-4">
//                 <Input
//                     label="Full Name (Optional)"
//                     id="name"
//                     name="name"
//                     placeholder="John Doe"
//                     value={form.name}
//                     onChange={handleChange}
//                     error={validationErrors.name}
//                     icon={<i className="fas fa-user"></i>}
//                 />

//                 <Input
//                     label="Email Address"
//                     type="email"
//                     id="email"
//                     name="email"
//                     placeholder="yours@example.com"
//                     value={form.email}
//                     onChange={handleChange}
//                     error={validationErrors.email}
//                     icon={<i className="fas fa-envelope"></i>}
//                     required
//                 />

//                 <Input
//                     label="Password"
//                     type={showPassword ? 'text' : 'password'}
//                     id="password"
//                     name="password"
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={handleChange}
//                     error={validationErrors.password}
//                     icon={<i className="fas fa-lock"></i>}
//                     required
//                 />
//             </div>

//             <Button
//                 type="submit"
//                 fullWidth
//                 isLoading={isLoading}
//                 icon={<i className="fas fa-arrow-right"></i>}
//                 iconPosition="right"
//             >
//                 Create Account
//             </Button>
//         </form>
//     );
// };































































// // export default UnifiedSignupForm;

// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { signupUser } from '@/redux/auth/authThunk';
// import Button from '../ui/Button';
// import Input from '../ui/Input';

// const UnifiedSignupForm: React.FC = () => {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const { isLoading } = useAppSelector((state) => state.auth || {});

//     const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
//     const [form, setForm] = useState({
//         name: '',
//         email: '',
//         password: '',
//     });

//     const [error, setError] = useState<string | null>(null);
//     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;

//         setForm((prev) => ({ ...prev, [name]: value }));

//         if (validationErrors[name]) {
//             setValidationErrors((prev) => ({ ...prev, [name]: '' }));
//         }

//         if (error) setError(null);
//     };

//     const handleSignup = (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);

//         const newErrors: Record<string, string> = {};

//         if (!role) {
//             setError('Please select a role to continue (Patient or Doctor).');
//             return;
//         }

//         if (form.name && form.name.length < 2) {
//             newErrors.name = 'Name must be at least 2 characters';
//         }

//         if (!form.email) {
//             newErrors.email = 'Enter a valid email address';
//         }

//         if (!form.password || form.password.length < 8) {
//             newErrors.password = 'Password must be at least 8 characters';
//         }

//         if (Object.keys(newErrors).length > 0) {
//             setValidationErrors(newErrors);
//             return;
//         }

//         dispatch(
//             signupUser({
//                 name: form.name,
//                 email: form.email,
//                 password: form.password,
//                 role: role!,
//             })
//         )
//             .unwrap()
//             .then(() => {
//                 router.replace(`/${role}/profile-update`);
//             })
//             .catch((err) => {
//                 setError(err || 'Failed to sign up');
//             });
//     };

//     // ✅ Real Google OAuth (role passed to backend)
//     const handleOAuth = () => {
//         if (!role) return;
//         window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?role=${role}`;
//     };

//     return (
//         <form onSubmit={handleSignup} className="space-y-4 animate-fade-in" noValidate>
//             {error && (
//                 <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
//                     <i className="fas fa-exclamation-triangle"></i>
//                     {error}
//                 </div>
//             )}

//             {/* Role Selection */}
//             <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     I want to sign up as a:
//                 </label>

//                 <div className="flex gap-4">
//                     <button
//                         type="button"
//                         onClick={() => {
//                             setRole('patient');
//                             if (error) setError(null);
//                         }}
//                         className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${role === 'patient'
//                             ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
//                             : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
//                             }`}
//                     >
//                         <i className="fas fa-user mr-2"></i> Patient
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() => {
//                             setRole('doctor');
//                             if (error) setError(null);
//                         }}
//                         className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${role === 'doctor'
//                             ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
//                             : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
//                             }`}
//                     >
//                         <i className="fas fa-user-md mr-2"></i> Doctor
//                     </button>
//                 </div>
//             </div>

//             {/* Google OAuth */}
//             <div>
//                 <button
//                     type="button"
//                     disabled={!role}
//                     onClick={handleOAuth}
//                     className={`w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 
//                     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors ${!role
//                             ? 'opacity-50 cursor-not-allowed'
//                             : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
//                         }`}
//                 >
//                     <img
//                         src="https://www.svgrepo.com/show/475656/google-color.svg"
//                         alt="Google"
//                         className="w-5 h-5"
//                     />
//                     Sign up with Google
//                 </button>

//                 {!role && (
//                     <p className="text-xs text-red-500 mt-1">
//                         Please select a role to continue with Google
//                     </p>
//                 )}
//             </div>

//             {/* Divider */}
//             <div className="flex items-center gap-3 my-2">
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                 <span className="text-xs text-slate-500 font-medium uppercase whitespace-nowrap">
//                     OR
//                 </span>
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             </div>

//             {/* Inputs */}
//             <div className="space-y-4">
//                 <Input
//                     label="Full Name (Optional)"
//                     id="name"
//                     name="name"
//                     placeholder="John Doe"
//                     value={form.name}
//                     onChange={handleChange}
//                     error={validationErrors.name}
//                     icon={<i className="fas fa-user"></i>}
//                 />

//                 <Input
//                     label="Email Address"
//                     type="email"
//                     id="email"
//                     name="email"
//                     placeholder="yours@example.com"
//                     value={form.email}
//                     onChange={handleChange}
//                     error={validationErrors.email}
//                     icon={<i className="fas fa-envelope"></i>}
//                     required
//                 />

//                 <Input
//                     label="Password"
//                     type="password"
//                     id="password"
//                     name="password"
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={handleChange}
//                     error={validationErrors.password}
//                     icon={<i className="fas fa-lock"></i>}
//                     required
//                 />
//             </div>

//             {/* Submit */}
//             <Button
//                 type="submit"
//                 fullWidth
//                 isLoading={isLoading}
//                 icon={<i className="fas fa-arrow-right"></i>}
//                 iconPosition="right"
//             >
//                 Create Account
//             </Button>
//         </form>
//     );
// };

// export default UnifiedSignupForm;











// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { signupUser } from '@/redux/auth/authThunk';
// // Import your VerifyOtp thunk (you'll need to create this)
// import { verifyOtp } from '@/redux/auth/authThunk';
// import Button from '../ui/Button';
// import Input from '../ui/Input';

// const UnifiedSignupForm: React.FC = () => {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const { isLoading } = useAppSelector((state) => state.auth || {});

//     // State to toggle between Signup and OTP view
//     const [showOtpView, setShowOtpView] = useState(false);
//     const [otpCode, setOtpCode] = useState('');

//     const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
//     const [form, setForm] = useState({
//         name: '',
//         email: '',
//         password: '',
//     });

//     const [error, setError] = useState<string | null>(null);
//     const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//     const handleSignup = (e: React.FormEvent) => {
//         e.preventDefault();
//         // ... (keep your existing validation logic)

//         dispatch(signupUser({
//             name: form.name,
//             email: form.email,
//             password: form.password,
//             role: role!,
//         }))
//             .unwrap()
//             .then(() => {
//                 // Backend returned success, now show OTP view
//                 setShowOtpView(true);
//                 setError(null);
//             })
//             .catch((err) => setError(err || 'Failed to sign up'));
//     };

//     const handleVerifyOtp = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (otpCode.length < 6) {
//             setError("Please enter a valid 6-digit code");
//             return;
//         }

//         dispatch(verifyOtp({ email: form.email, otpCode }))
//             .unwrap()
//             .then(() => {
//                 // Now that tokens are set in cookies by backend, redirect
//                 router.replace(`/${role}/profile-update`);
//             })
//             .catch((err) => setError(err || 'Invalid OTP code'));
//     };

//     // --- OTP VIEW ---
//     if (showOtpView) {
//         return (
//             <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
//                 <div className="text-center space-y-2">
//                     <h2 className="text-xl font-semibold">Verify your email</h2>
//                     <p className="text-sm text-slate-500">
//                         We sent a code to <span className="font-medium text-slate-900">{form.email}</span>
//                     </p>
//                 </div>

//                 {error && (
//                     <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
//                         {error}
//                     </div>
//                 )}

//                 <Input
//                     label="Enter 6-digit OTP"
//                     placeholder="000000"
//                     value={otpCode}
//                     onChange={(e) => setOtpCode(e.target.value)}
//                     maxLength={6}
//                     className="text-center text-2xl tracking-[1em] font-mono"
//                     required
//                 />

//                 <Button type="submit" fullWidth isLoading={isLoading}>
//                     Verify & Create Account
//                 </Button>

//                 <button
//                     type="button"
//                     onClick={() => setShowOtpView(false)}
//                     className="w-full text-xs text-blue-600 hover:underline"
//                 >
//                     Back to signup
//                 </button>
//             </form>
//         );
//     }

//     // --- SIGNUP VIEW (Your existing return logic) ---
//     return (
//         <form onSubmit={handleSignup} className="space-y-4 animate-fade-in" noValidate>
//             {error && (
//                 <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
//                     <i className="fas fa-exclamation-triangle"></i>
//                     {error}
//                 </div>
//             )}

//             {/* Role Selection */}
//             <div>
//                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//                     I want to sign up as a:
//                 </label>

//                 <div className="flex gap-4">
//                     <button
//                         type="button"
//                         onClick={() => {
//                             setRole('patient');
//                             if (error) setError(null);
//                         }}
//                         className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${role === 'patient'
//                             ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
//                             : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
//                             }`}
//                     >
//                         <i className="fas fa-user mr-2"></i> Patient
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() => {
//                             setRole('doctor');
//                             if (error) setError(null);
//                         }}
//                         className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all duration-200 font-medium ${role === 'doctor'
//                             ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
//                             : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
//                             }`}
//                     >
//                         <i className="fas fa-user-md mr-2"></i> Doctor
//                     </button>
//                 </div>
//             </div>

//             {/* Google OAuth */}
//             <div>
//                 <button
//                     type="button"
//                     disabled={!role}
//                     onClick={handleOAuth}
//                     className={`w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 
//                     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors ${!role
//                             ? 'opacity-50 cursor-not-allowed'
//                             : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
//                         }`}
//                 >
//                     <img
//                         src="https://www.svgrepo.com/show/475656/google-color.svg"
//                         alt="Google"
//                         className="w-5 h-5"
//                     />
//                     Sign up with Google
//                 </button>

//                 {!role && (
//                     <p className="text-xs text-red-500 mt-1">
//                         Please select a role to continue with Google
//                     </p>
//                 )}
//             </div>

//             {/* Divider */}
//             <div className="flex items-center gap-3 my-2">
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                 <span className="text-xs text-slate-500 font-medium uppercase whitespace-nowrap">
//                     OR
//                 </span>
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             </div>

//             {/* Inputs */}
//             <div className="space-y-4">
//                 <Input
//                     label="Full Name (Optional)"
//                     id="name"
//                     name="name"
//                     placeholder="John Doe"
//                     value={form.name}
//                     onChange={handleChange}
//                     error={validationErrors.name}
//                     icon={<i className="fas fa-user"></i>}
//                 />

//                 <Input
//                     label="Email Address"
//                     type="email"
//                     id="email"
//                     name="email"
//                     placeholder="yours@example.com"
//                     value={form.email}
//                     onChange={handleChange}
//                     error={validationErrors.email}
//                     icon={<i className="fas fa-envelope"></i>}
//                     required
//                 />

//                 <Input
//                     label="Password"
//                     type="password"
//                     id="password"
//                     name="password"
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={handleChange}
//                     error={validationErrors.password}
//                     icon={<i className="fas fa-lock"></i>}
//                     required
//                 />
//             </div>

//             {/* Submit */}
//             <Button
//                 type="submit"
//                 fullWidth
//                 isLoading={isLoading}
//                 icon={<i className="fas fa-arrow-right"></i>}
//                 iconPosition="right"
//             >
//                 Create Account
//             </Button>
//         </form>
//     );
// };









// src/components/forms/UnifiedSignupForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signupUser, verifyOtp, resendOtp } from '@/redux/auth/authThunk'; // Ensure verifyOtp is exported here
import Button from '../ui/Button';
import Input from '../ui/Input';

const UnifiedSignupForm: React.FC = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isLoading, requires2FA, emailForOTP } = useAppSelector((state) => state.auth || {});

    // State Management
    const [showOtpView, setShowOtpView] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '' });



    const [generatedOtpCode, setGeneratedOtpCode] = useState('');



    // UI State
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [timer, setTimer] = useState(0);

    // Timer Effect for Resend OTP
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: '' }));
        if (error) setError(null);
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!role) {
            setError('Please select a role (Patient or Doctor).');
            return;
        }

        console.log('form', form);//


        dispatch(signupUser({ ...form, role }))
            .unwrap()
            .then((res) => {
                const generatedOtpCodeResult = res.code
                console.log('generatedOtpCodeResult', generatedOtpCodeResult)

                setGeneratedOtpCode(generatedOtpCodeResult)

                setShowOtpView(true);
                setTimer(60); // Start 60s cooldown
            })
            .catch((err) => setError(err || 'Failed to sign up'));
    };




    // --- Inside handleVerifyOtp ---
    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // Use 'otpCode' as the key to match backend expectation
        dispatch(verifyOtp({
            // data: { email: form.email, otpCode: generatedOtpCode },
            data: { email: form.email, otpCode: otpCode },
            isAdmin: false
        }))
            .unwrap()
            .then(() => {
                // router.replace(`/${role}/profile-update`);
                router.replace(`/${role}/profile-update`);
            })
            .catch((err) => setError(err || 'Invalid OTP code'));
    };

    // --- Update your useEffect to sync Redux state with Local UI state ---

    useEffect(() => {
        // If Redux says we need 2FA, show the OTP view
        if (requires2FA) {
            setShowOtpView(true);
        }
    }, [requires2FA]);



    const handleOAuth = () => {
        if (!role) return;
        // Redirecting to backend Google Auth route with role as query param
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?role=${role}`;
    };

    const handleResendOtp = () => {
        if (timer > 0) return;
        // dispatch(resendOtp({ data: { email: form.email }, isAdmin: false }))
        dispatch(resendOtp({ email: form.email }))
            .unwrap()
            .then((res) => {
                const generatedOtpCodeResult = res.code
                console.log('generatedOtpCodeResult', generatedOtpCodeResult)

                setGeneratedOtpCode(generatedOtpCodeResult)
                setTimer(60);
                setError(null);
            })
            .catch((err) => setError(err));
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

                {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}


                {
                    // process.env.NODE_ENV === 'development' && 
                    generatedOtpCode && (
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
            {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

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

            {/* Google Login */}
            <button
                type="button"
                disabled={!role}
                onClick={handleOAuth}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-5 h-5" />
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


