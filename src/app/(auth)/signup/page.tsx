

// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import GuestGuard from '@/components/auth/GuestGuard';
// import UnifiedSignupForm from '@/components/forms/UnifiedSignupForm';
// import Header from '@/components/layout/Header';
// import Badge from '@/components/ui/Badge';

// export default function UnifiedSignupPage() {
//     return (
//         <GuestGuard>
//             <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
//                 <Header />

//                 {/* mt-[70px] offsets the fixed header height */}
//                 <main className="flex-1 flex w-full mt-[70px]">
//                     {/* Left Side: Form Area */}
//                     <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
//                         <div className="mx-auto w-full max-w-sm lg:w-96 py-8">
//                             <div className="text-left mb-6">
//                                 <Badge variant="primary" pill className="mb-3">
//                                     <i className="fas fa-user-plus mr-1"></i> Create an Account
//                                 </Badge>
//                                 <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
//                                     Join Zydoc
//                                 </h1>
//                                 <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
//                                     Sign up as a patient or a healthcare professional
//                                 </p>
//                             </div>

//                             <div className="bg-white p-6 shadow-xl shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none border border-slate-100 dark:border-slate-800 rounded-2xl">
//                                 <UnifiedSignupForm />

//                                 <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
//                                     <p className="mb-2">Already have an account?</p>
//                                     <div className="flex justify-center gap-4">
//                                         <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
//                                             Sign in here
//                                         </Link>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Side: Visuals/Branding (Hidden on mobile) */}
//                     <div className="hidden lg:flex flex-1 relative items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-12 overflow-hidden">
//                         {/* Decorative background glows */}
//                         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
//                         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl pointer-events-none"></div>

//                         <div className="relative z-10 max-w-lg text-center text-white">
//                             <div className="mb-8 flex justify-center">
//                                 <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
//                                     <i className="fas fa-hospital-user text-4xl text-white"></i>
//                                 </div>
//                             </div>
//                             <h2 className="text-4xl font-extrabold tracking-tight mb-4">
//                                 The future of healthcare.
//                             </h2>
//                             <p className="text-lg text-blue-100 mb-10 leading-relaxed">
//                                 Connect with top medical professionals, manage your health records seamlessly, and experience premium telemedicine.
//                             </p>

//                             <div className="grid grid-cols-2 gap-6 text-left">
//                                 <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
//                                     <i className="fas fa-video text-blue-300 text-2xl mb-3"></i>
//                                     <h3 className="font-semibold text-white">Virtual Consults</h3>
//                                     <p className="text-sm text-blue-100 mt-1">High-quality video calls</p>
//                                 </div>
//                                 <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
//                                     <i className="fas fa-file-medical text-blue-300 text-2xl mb-3"></i>
//                                     <h3 className="font-semibold text-white">Secure Records</h3>
//                                     <p className="text-sm text-blue-100 mt-1">HIPAA compliant storage</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         </GuestGuard>
//     );
// }





















'use client';

import React from 'react';
import Link from 'next/link';
import GuestGuard from '@/components/auth/GuestGuard';
import UnifiedSignupForm from '@/components/forms/UnifiedSignupForm';
import Header from '@/components/layout/Header';
import Badge from '@/components/ui/Badge';

export default function UnifiedSignupPage() {
    return (
        <GuestGuard>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <Header />

                {/* mt-[70px] offsets the fixed header height */}
                <main className="flex-1 flex items-center justify-center w-full mt-[70px] px-6">
                    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                        {/* LEFT SIDE (Text Only) */}
                        <div className="text-left">
                            <Badge variant="primary" pill className="mb-3">
                                <i className="fas fa-user-plus mr-1"></i> Create an Account
                            </Badge>

                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Join Zydoc
                            </h1>

                            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-md">
                                Sign up as a patient or a healthcare professional and start managing your healthcare seamlessly.
                            </p>
                        </div>

                        {/* RIGHT SIDE (Form) */}
                        <div className="bg-white py-6 px-12  shadow-xl shadow-slate-200/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                            <UnifiedSignupForm />

                            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                                <p className="mb-2">Already have an account?</p>

                                <Link
                                    href="/login"
                                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Sign in here
                                </Link>
                            </div>
                        </div>

                    </div>
                </main>




            </div>
        </GuestGuard>
    );
}

















