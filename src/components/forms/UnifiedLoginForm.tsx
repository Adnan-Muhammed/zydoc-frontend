// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks'; // redux
// import { login } from '@/redux/auth/authThunk'; // redux

// import Button from '../ui/Button';
// import Input from '../ui/Input';

// const LoginForm: React.FC = () => {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const { isLoading } = useAppSelector((state) => state.auth || {});

//     const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
//     const [form, setForm] = useState({
//         email: '',
//         password: '',
//         rememberMe: false
//     });

//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value, type, checked } = e.target;
//         setForm(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//         if (error) setError(null);
//     };

//     const handleLogin = (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);

//         if (!form.email || !form.password) {
//             setError('Please fill in all fields');
//             return;
//         }

//         dispatch(login({
//             email: form.email,
//             password: form.password,
//         }))
//             .unwrap()
//             .then((res: any) => {
//                 router.replace(`/${res.user.role}/dashboard`);
//             })
//             .catch((err) => {
//                 setError(err || 'Invalid email or password');
//             });


//     };

//     const handleOAuth = (provider: 'google') => {

//         alert(`OAuth (${provider}) for ${role} not fully implemented yet.`);
//     };

//     return (
//         <form onSubmit={handleLogin} className="space-y-6 animate-fade-in" noValidate>
//             {error && (
//                 <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
//                     <i className="fas fa-exclamation-triangle"></i>
//                     {error}
//                 </div>
//             )}


//             <button
//                 type="button"
//                 onClick={() => handleOAuth('google')}
//                 className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 
//     bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium 
//     hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
//             >
//                 <img
//                     src="https://www.svgrepo.com/show/475656/google-color.svg"
//                     alt="Google"
//                     className="w-5 h-5"
//                 />
//                 Continue with Google
//             </button>

//             <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             <span className="text-xs text-slate-500 font-medium uppercase">OR</span>
//             <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             <Input
//                 label="Email Address"
//                 type="email"
//                 id="email"
//                 name="email"
//                 placeholder="yours@example.com"
//                 value={form.email}
//                 onChange={handleChange}
//                 icon={<i className="fas fa-envelope"></i>}
//                 required
//             />

//             <div className="space-y-1">
//                 <Input
//                     label="Password"
//                     type={showPassword ? 'text' : 'password'}
//                     id="password"
//                     name="password"
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={handleChange}
//                     icon={<i className="fas fa-lock"></i>}
//                     required
//                 />
//                 <div className="flex justify-end">
//                     <Link href="/forgot-password" summer-text="Forgot password?" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors">
//                         Forgot password?
//                     </Link>
//                 </div>
//             </div>

//             <div className="flex items-center gap-2">
//                 <input
//                     type="checkbox"
//                     id="rememberMe"
//                     name="rememberMe"
//                     checked={form.rememberMe}
//                     onChange={handleChange}
//                     className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                 />
//                 <label htmlFor="rememberMe" className="text-sm text-slate-600 dark:text-slate-400">
//                     Keep me signed in
//                 </label>
//             </div>

//             <Button
//                 type="submit"
//                 fullWidth
//                 isLoading={isLoading}
//                 icon={<i className="fas fa-sign-in-alt"></i>}
//                 iconPosition="right"
//             >
//                 Sign In
//             </Button>
//         </form>
//     );
// };

// export default LoginForm;







// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { login } from '@/redux/auth/authThunk';

// import Button from '../ui/Button';
// import Input from '../ui/Input';

// const UnifiedLoginForm: React.FC = () => {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const { isLoading } = useAppSelector((state) => state.auth || {});

//     const [form, setForm] = useState({
//         email: '',
//         password: '',
//         rememberMe: false,
//     });

//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value, type, checked } = e.target;
//         setForm((prev) => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//         }));
//         if (error) setError(null);
//     };

//     const handleLogin = (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);

//         if (!form.email || !form.password) {
//             setError('Please fill in all fields');
//             return;
//         }

//         dispatch(
//             login({
//                 email: form.email,
//                 password: form.password,
//             })
//         )
//             .unwrap()
//             .then((res: any) => {
//                 router.replace(`/${res.user.role}/dashboard`);
//             })
//             .catch((err) => {
//                 setError(err || 'Invalid email or password');
//             });
//     };

//     // ✅ Google OAuth Redirect
//     const handleOAuth = () => {
//         window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
//     };

//     return (
//         <form onSubmit={handleLogin} className="space-y-5 animate-fade-in" noValidate>
//             {error && (
//                 <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
//                     <i className="fas fa-exclamation-triangle"></i>
//                     {error}
//                 </div>
//             )}

//             {/* Google Login */}
//             <button
//                 type="button"
//                 onClick={handleOAuth}
//                 className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 
//                 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium 
//                 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
//             >
//                 <img
//                     src="https://www.svgrepo.com/show/475656/google-color.svg"
//                     alt="Google"
//                     className="w-5 h-5"
//                 />
//                 Continue with Google
//             </button>

//             {/* Divider */}
//             <div className="flex items-center gap-3 my-2">
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                 <span className="text-xs text-slate-500 font-medium uppercase whitespace-nowrap">
//                     OR
//                 </span>
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             </div>

//             {/* Email */}
//             <Input
//                 label="Email Address"
//                 type="email"
//                 id="email"
//                 name="email"
//                 placeholder="yours@example.com"
//                 value={form.email}
//                 onChange={handleChange}
//                 icon={<i className="fas fa-envelope"></i>}
//                 required
//             />

//             {/* Password */}
//             <div className="space-y-1">
//                 <Input
//                     label="Password"
//                     type={showPassword ? 'text' : 'password'}
//                     id="password"
//                     name="password"
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={handleChange}
//                     icon={<i className="fas fa-lock"></i>}
//                     required
//                 />

//                 <div className="flex justify-between items-center">
//                     <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
//                         <input
//                             type="checkbox"
//                             id="rememberMe"
//                             name="rememberMe"
//                             checked={form.rememberMe}
//                             onChange={handleChange}
//                             className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                         />
//                         Keep me signed in
//                     </label>

//                     <Link
//                         href="/forgot-password"
//                         className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
//                     >
//                         Forgot password?
//                     </Link>
//                 </div>
//             </div>

//             {/* Submit */}
//             <Button
//                 type="submit"
//                 fullWidth
//                 isLoading={isLoading}
//                 icon={<i className="fas fa-sign-in-alt"></i>}
//                 iconPosition="right"
//             >
//                 Sign In
//             </Button>
//         </form>
//     );
// };

// export default UnifiedLoginForm;



// // src/components/forms/UnifiedLoginForm.tsx
// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { login } from '@/redux/auth/authThunk';

// import Button from '../ui/Button';
// import Input from '../ui/Input';

// const UnifiedLoginForm: React.FC = () => {
//     const dispatch = useAppDispatch();
//     const { isLoading } = useAppSelector((state) => state.auth || {});

//     const [form, setForm] = useState({
//         email: '',
//         password: '',
//         rememberMe: false,
//     });

//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value, type, checked } = e.target;

//         setForm((prev) => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//         }));

//         if (error) setError(null);
//     };

//     const handleLogin = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);

//         if (!form.email || !form.password) {
//             setError('Please fill in all fields');
//             return;
//         }

//         try {
//             const res: any = await dispatch(
//                 login({
//                     email: form.email,
//                     password: form.password,
//                 })
//             ).unwrap();

//             // ✅ CRITICAL FIX: FULL PAGE RELOAD
//             window.location.href = `/${res.user.role}/dashboard`;

//         } catch (err: any) {
//             setError(err || 'Invalid email or password');
//         }
//     };

//     const handleOAuth = () => {
//         window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
//     };

//     return (
//         <form onSubmit={handleLogin} className="space-y-5 animate-fade-in" noValidate>
//             {error && (
//                 <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
//                     <i className="fas fa-exclamation-triangle"></i>
//                     {error}
//                 </div>
//             )}

//             {/* Google */}
//             <button
//                 type="button"
//                 onClick={handleOAuth}
//                 className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 
//                 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium 
//                 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
//             >
//                 <img
//                     src="https://www.svgrepo.com/show/475656/google-color.svg"
//                     alt="Google"
//                     className="w-5 h-5"
//                 />
//                 Continue with Google
//             </button>

//             {/* Divider */}
//             <div className="flex items-center gap-3 my-2">
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                 <span className="text-xs text-slate-500 font-medium uppercase">
//                     OR
//                 </span>
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             </div>

//             {/* Email */}
//             <Input
//                 label="Email Address"
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//             />

//             {/* Password */}
//             <Input
//                 label="Password"
//                 type={showPassword ? 'text' : 'password'}
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//             />

//             {/* Submit */}
//             <Button
//                 type="submit"
//                 fullWidth
//                 isLoading={isLoading}
//             >
//                 Sign In
//             </Button>
//         </form>
//     );
// };

// export default UnifiedLoginForm;






// // src/components/forms/UnifiedLoginForm.tsx
// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useAppDispatch, useAppSelector } from '@/redux/hooks';
// import { login } from '@/redux/auth/authThunk';
// import Button from '../ui/Button';
// import Input from '../ui/Input';

// const UnifiedLoginForm: React.FC = () => {
//     const dispatch = useAppDispatch();
//     const { isLoading } = useAppSelector((state) => state.auth || {});

//     const [form, setForm] = useState({ email: '', password: '' });
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setForm(prev => ({ ...prev, [name]: value }));
//         if (error) setError(null);
//     };

//     const handleLogin = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError(null);

//         if (!form.email || !form.password) {
//             setError('Please fill in all fields');
//             return;
//         }

//         try {
//             const res: any = await dispatch(
//                 login({ email: form.email, password: form.password })
//             ).unwrap();

//             // 🔍 Log this in browser console so you can see the exact shape
//             console.log('✅ Login response:', res);

//             // ✅ Handle BOTH response shapes safely:
//             // Shape 1: { user: { role: 'patient' } }
//             // Shape 2: { role: 'patient' }
//             const role = res?.user?.role ?? res?.role;

//             if (!role) {
//                 console.error('❌ Could not find role in response:', res);
//                 setError('Login succeeded but role is missing. Check console.');
//                 return;
//             }

//             // ✅ Full page reload so server components re-run and pick up the new cookie
//             window.location.href = `/${role}/dashboard`;

//         } catch (err: any) {
//             console.error('❌ Login error:', err);
//             setError(typeof err === 'string' ? err : 'Invalid email or password');
//         }
//     };

//     const handleOAuth = () => {
//         window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
//     };

//     return (
//         <form onSubmit={handleLogin} className="space-y-5" noValidate>
//             {error && (
//                 <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
//                     <i className="fas fa-exclamation-triangle"></i>
//                     {error}
//                 </div>
//             )}

//             {/* Google OAuth */}
//             <button
//                 type="button"
//                 onClick={handleOAuth}
//                 className="w-full flex items-center justify-center gap-3 py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
//             >
//                 <img
//                     src="https://www.svgrepo.com/show/475656/google-color.svg"
//                     alt="Google"
//                     className="w-5 h-5"
//                 />
//                 Continue with Google
//             </button>

//             <div className="flex items-center gap-3 my-2">
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//                 <span className="text-xs text-slate-500 font-medium uppercase">OR</span>
//                 <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
//             </div>

//             <Input
//                 label="Email Address"
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//             />

//             <div className="relative">
//                 <Input
//                     label="Password"
//                     type={showPassword ? 'text' : 'password'}
//                     name="password"
//                     value={form.password}
//                     onChange={handleChange}
//                     required
//                 />
//                 <button
//                     type="button"
//                     onClick={() => setShowPassword(p => !p)}
//                     className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 text-sm"
//                     aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 >
//                     <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
//                 </button>
//             </div>

//             <div className="text-right">
//                 <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
//                     Forgot password?
//                 </Link>
//             </div>

//             <Button type="submit" fullWidth isLoading={isLoading}>
//                 Sign In
//             </Button>
//         </form>
//     );
// };

// export default UnifiedLoginForm;



// src/components/forms/UnifiedLoginForm.tsx  //  for doctor and patient

'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUser } from '@/redux/auth/authThunk';
import Button from '../ui/Button';
import Input from '../ui/Input';

const UnifiedLoginForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isLoading } = useAppSelector((state) => state.auth || {});

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            // unwrap() gives back exactly what authService.login() returned:
            // { user: { role: 'patient' | 'doctor' | 'admin', ... }, accessToken: '...' }
            const res: any = await dispatch(
                loginUser({ credentials: { email: form.email, password: form.password } })
            ).unwrap();

            // 🔍 Remove this console.log once confirmed working
            console.log('✅ Login res:', res);

            const role = res?.user?.role;

            if (!role) {
                setError('Login failed: user role not found. Please try again.');
                return;
            }

            // ✅ Full page navigation — forces server components to re-run
            // so cookies are picked up and landing page shows Dashboard button
            window.location.href = `/${role}/dashboard`;

        } catch (err: any) {
            // unwrap() throws if the thunk returned rejectWithValue(...)
            // err will be the string message from: error.response?.data?.message
            setError(typeof err === 'string' ? err : 'Invalid email or password');
        }
    };

    const handleOAuth = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

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