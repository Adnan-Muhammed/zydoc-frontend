// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// // usePathname is a client-side hook

// import { useAppSelector } from '@/redux/hooks'; // redux



// const Header: React.FC = () => {
//     const pathname = usePathname();

//     const { isAuthenticated, user, isAuthChecked } = useAppSelector((state) => state.auth);// isLoading is replaced with isAuthChecked
//     const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');


//     const isDashboard =
//         pathname.includes('/admin') ||
//         pathname.includes('/patient') ||
//         pathname.includes('/doctor');
//     pathname.includes('/dashboard');

//     const showPublicNav = !isAuthPage && !isDashboard;
//     // Generate dashboard link based on role
//     const getDashboardLink = () => {
//         if (!user) return '/';
//         return `/${user.role}/dashboard`;
//     };

//     return (
//         <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
//             {/*  <header className="fixed top-0 z-50 w-full bg-white backdrop-blur-md border-b border-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900"> */}
//             <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">
//                 <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
//                         <i className="fas fa-hospital-user text-lg"></i>
//                     </div>
//                     {/* <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"> */}
//                     <span className="text-xl font-bold tracking-tight text-slate-800">

//                         Zydoc
//                     </span>
//                 </Link>

//                 {/* <div className="hidden lg:flex items-center gap-8">


//                     <a href="/#home" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                         Home
//                     </a>
//                     <a href="/#features" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                         Features
//                     </a>
//                     <a href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                         How It Works
//                     </a>
//                     <a href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                         FAQ
//                     </a>
//                     <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                         Find Doctors
//                     </Link>
//                     </div>
//  */}
//                 {showPublicNav && (
//                     <div className="hidden lg:flex items-center gap-8">
//                         <a href="/#home" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                             Home
//                         </a>
//                         <a href="/#features" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                             Features
//                         </a>
//                         <a href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                             How It Works
//                         </a>
//                         <a href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                             FAQ
//                         </a>
//                         <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">
//                             Find Doctors
//                         </Link>
//                     </div>
//                 )}




//                 <div className="flex items-center gap-4">


//                     {/* {!isAuthPage && (
//                         <>
//                             {!isAuthChecked ? (
//                                 <div className="flex gap-4 items-center">
//                                     <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-lg"></div>
//                                     <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-lg"></div>
//                                 </div>
//                             ) : isAuthenticated ? (
//                                 <Link href={getDashboardLink()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all">
//                                     <i className="fas fa-columns mr-2"></i> Dashboard
//                                 </Link>
//                             ) : (
//                                 <>
//                                     <Link href="/signup"
//                                         // className="rounded-lg border-[1.5px] border-slate-900 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-900 hover:text-white dark:border-white dark:text-white"
//                                         className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
//                                     >
//                                         Sign Up
//                                     </Link>
//                                     <Link href="/login"
//                                         // className="rounded-lg bg-[#6366f1] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#4f46e5] shadow-md shadow-indigo-500/20"
//                                         className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all"

//                                     >
//                                         Login
//                                     </Link>
//                                 </>
//                             )}
//                         </>
//                     )} */}



//                     {/* <div className="flex items-center gap-4">
//                         {!isAuthPage && (
//                             <>
//                                 {isAuthChecked && isAuthenticated ? (
//                                     <Link
//                                         href={getDashboardLink()}
//                                         className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
//                                     >
//                                         <i className="fas fa-columns mr-2"></i> Dashboard
//                                     </Link>
//                                 ) : (

//                                     <div className="flex gap-4">
//                                         <Link
//                                             href="/signup"
//                                             className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
//                                         >
//                                             Sign Up
//                                         </Link>
//                                         <Link
//                                             href="/login"
//                                             className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all"
//                                         >
//                                             Login
//                                         </Link>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div> */}


//                     <div className="flex items-center gap-4">
//                         {!isAuthPage && (
//                             <>
//                                 {/* 1. If we haven't checked auth yet, show a placeholder or nothing */}
//                                 {!isAuthChecked ? (
//                                     <div className="flex gap-4">
//                                         {/* Optional: Add a loading skeleton here so the layout doesn't jump */}
//                                         <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200"></div>
//                                     </div>
//                                 ) : (
//                                     /* 2. Once checked, decide between Dashboard or Login */
//                                     <>
//                                         {isAuthenticated ? (
//                                             <Link
//                                                 href={getDashboardLink()}
//                                                 className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
//                                             >
//                                                 <i className="fas fa-columns mr-2"></i> Dashboard
//                                             </Link>
//                                         ) : (
//                                             <div className="flex gap-4">
//                                                 <Link
//                                                     href="/signup"
//                                                     className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
//                                                 >
//                                                     Sign Up
//                                                 </Link>
//                                                 <Link
//                                                     href="/login"
//                                                     className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all"
//                                                 >
//                                                     Login
//                                                 </Link>
//                                             </div>
//                                         )}
//                                     </>
//                                 )}
//                             </>
//                         )}
//                     </div>




//                     {isAuthPage && (
//                         <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
//                             <i className="fas fa-arrow-left"></i> Back to Home
//                         </Link>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };






// export default Header;



//////////////////////////////////////////////////
///////////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////////////






// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAppSelector } from '@/redux/hooks';

// const Header: React.FC = () => {
//     const pathname = usePathname();
//     const { isAuthenticated, user, isAuthChecked } = useAppSelector((state) => state.auth);

//     // Checks if the user is in any dashboard route
//     const isDashboard = ['/admin', '/patient', '/doctor', '/dashboard'].some(path =>
//         pathname.startsWith(path)
//     );

//     const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');

//     // Only show the middle nav links on the landing page/public pages
//     const showPublicNav = !isAuthPage && !isDashboard;

//     const getDashboardLink = () => {
//         if (!user) return '/';
//         return `/${user.role}/dashboard`;
//     };

//     return (
//         <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
//             <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">

//                 {/* 1. LOGO SECTION */}
//                 <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
//                         <i className="fas fa-hospital-user text-lg"></i>
//                     </div>
//                     <span className="text-xl font-bold tracking-tight text-slate-800">
//                         Zydoc
//                     </span>
//                 </Link>

//                 {/* 2. CENTER NAVIGATION (Public Links) */}
//                 {showPublicNav && (
//                     <div className="hidden lg:flex items-center gap-8">
//                         <a href="/#home" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all">
//                             Home
//                         </a>
//                         <a href="/#features" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all">
//                             Features
//                         </a>
//                         <a href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all">
//                             How It Works
//                         </a>
//                         <a href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all">
//                             FAQ
//                         </a>
//                         <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all">
//                             Find Doctors
//                         </Link>
//                     </div>
//                 )}

//                 {/* 3. RIGHT SIDE ACTIONS (Auth) */}
//                 <div className="flex items-center gap-4">
//                     {!isAuthChecked ? (
//                         /* Prevent "Login/Signup" from flashing during auth check */
//                         <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-lg" />
//                     ) : (
//                         <>
//                             {!isAuthPage && (
//                                 <>
//                                     {isAuthenticated ? (
//                                         <Link
//                                             href={getDashboardLink()}
//                                             className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
//                                         >
//                                             <i className="fas fa-columns mr-2"></i> Dashboard
//                                         </Link>
//                                     ) : (
//                                         <div className="flex items-center gap-4">
//                                             <Link
//                                                 href="/signup"
//                                                 className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
//                                             >
//                                                 Sign Up
//                                             </Link>
//                                             <Link
//                                                 href="/login"
//                                                 className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all"
//                                             >
//                                                 Login
//                                             </Link>
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </>
//                     )}

//                     {/* Show "Back to Home" ONLY on Login/Signup pages */}
//                     {isAuthPage && (
//                         <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
//                             <i className="fas fa-arrow-left"></i> Back to Home
//                         </Link>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };

// export default Header;



//////////////////////////////////////////////////
///////////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////////////


// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAppSelector } from '@/redux/hooks';

// const Header: React.FC = () => {
//     const pathname = usePathname();
//     const { isAuthenticated, user, isAuthChecked } = useAppSelector((state) => state.auth);

//     // 🚫 Prevent render until auth is ready (removes flicker)
//     if (!isAuthChecked) return null;

//     // Checks if the user is in any dashboard route
//     const isDashboard = ['/admin', '/patient', '/doctor', '/dashboard'].some(path =>
//         pathname.startsWith(path)
//     );

//     const isAuthPage =
//         pathname.includes('/login') || pathname.includes('/signup');

//     // Only show the middle nav links on public pages
//     const showPublicNav = !isAuthPage && !isDashboard;

//     const getDashboardLink = () => {
//         if (!user) return '/';
//         return `/${user.role}/dashboard`;
//     };

//     return (
//         <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
//             <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">

//                 {/* LOGO */}
//                 <Link
//                     href="/"
//                     className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
//                 >
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
//                         <i className="fas fa-hospital-user text-lg"></i>
//                     </div>
//                     <span className="text-xl font-bold tracking-tight text-slate-800">
//                         Zydoc
//                     </span>
//                 </Link>

//                 {/* PUBLIC NAV */}
//                 {showPublicNav && (
//                     <div className="hidden lg:flex items-center gap-8">
//                         <a href="/#home" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Home
//                         </a>
//                         <a href="/#features" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Features
//                         </a>
//                         <a href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             How It Works
//                         </a>
//                         <a href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             FAQ
//                         </a>
//                         <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Find Doctors
//                         </Link>
//                     </div>
//                 )}

//                 {/* RIGHT SIDE */}
//                 <div className="flex items-center gap-4">

//                     {/* AUTH BUTTONS */}
//                     {!isAuthPage && (
//                         <>
//                             {isAuthenticated ? (
//                                 <Link
//                                     href={getDashboardLink()}
//                                     className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
//                                 >
//                                     <i className="fas fa-columns mr-2"></i> Dashboard
//                                 </Link>
//                             ) : (
//                                 <div className="flex items-center gap-4">
//                                     <Link
//                                         href="/signup"
//                                         className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
//                                     >
//                                         Sign Up
//                                     </Link>
//                                     <Link
//                                         href="/login"
//                                         className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all"
//                                     >
//                                         Login
//                                     </Link>
//                                 </div>
//                             )}
//                         </>
//                     )}

//                     {/* BACK BUTTON (Auth pages only) */}
//                     {isAuthPage && (
//                         <Link
//                             href="/"
//                             className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
//                         >
//                             <i className="fas fa-arrow-left"></i> Back to Home
//                         </Link>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };

// export default Header;
//   its   handle  but entire   logo, navlink ,authbuttons  are load slowly
// ''''''''''''''''''''''''''''''''''''''''''''''''''''
//
//////////////////////////////////////////////////
///////////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////////////



// 'use client';


// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAppSelector } from '@/redux/hooks';

// const Header: React.FC = () => {
//     const pathname = usePathname();
//     const { isAuthenticated, user, isAuthChecked } = useAppSelector((state) => state.auth);

//     // Route checks
//     const isDashboard = ['/admin', '/patient', '/doctor', '/dashboard'].some(path =>
//         pathname.startsWith(path)
//     );

//     const isAuthPage =
//         pathname.includes('/login') || pathname.includes('/signup');

//     const showPublicNav = !isAuthPage && !isDashboard;

//     const getDashboardLink = () => {
//         if (!user) return '/';
//         return `/${user.role}/dashboard`;
//     };

//     return (
//         <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
//             <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">

//                 {/* LOGO */}
//                 <Link
//                     href="/"
//                     className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
//                 >
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
//                         <i className="fas fa-hospital-user text-lg"></i>
//                     </div>
//                     <span className="text-xl font-bold tracking-tight text-slate-800">
//                         Zydoc
//                     </span>
//                 </Link>

//                 {/* PUBLIC NAV */}
//                 {showPublicNav && (
//                     <div className="hidden lg:flex items-center gap-8">
//                         <a href="/#home" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Home
//                         </a>
//                         <a href="/#features" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Features
//                         </a>
//                         <a href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             How It Works
//                         </a>
//                         <a href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             FAQ
//                         </a>
//                         <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Find Doctors
//                         </Link>
//                     </div>
//                 )}

//                 {/* RIGHT SIDE (AUTH) */}
//                 <div className="flex items-center gap-4 min-w-[170px] justify-end">

//                     {!isAuthChecked ? (
//                         // ✅ Invisible placeholder (NO flicker, NO animation)
//                         <div className="h-10 w-[160px]" />
//                     ) : (
//                         <>
//                             {/* Hide auth buttons on login/signup page */}
//                             {!isAuthPage && (
//                                 <>
//                                     {isAuthenticated ? (
//                                         <Link
//                                             href={getDashboardLink()}
//                                             className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
//                                         >
//                                             <i className="fas fa-columns mr-2"></i> Dashboard
//                                         </Link>
//                                     ) : (
//                                         <div className="flex items-center gap-4">
//                                             <Link
//                                                 href="/signup"
//                                                 className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
//                                             >
//                                                 Sign Up
//                                             </Link>
//                                             <Link
//                                                 href="/login"
//                                                 className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all"
//                                             >
//                                                 Login
//                                             </Link>
//                                         </div>
//                                     )}
//                                 </>
//                             )}

//                             {/* Back button for auth pages */}
//                             {isAuthPage && (
//                                 <Link
//                                     href="/"
//                                     className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
//                                 >
//                                     <i className="fas fa-arrow-left"></i> Back to Home
//                                 </Link>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };

// export default Header;


//////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////
///////////////////////////////////////////////////


// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useAppSelector } from '@/redux/hooks';

// const Header: React.FC = () => {
//     const pathname = usePathname();
//     const { isAuthenticated, user, isAuthChecked } = useAppSelector((state) => state.auth);

//     // Route checks (keep yours)
//     const isDashboard = ['/admin', '/patient', '/doctor', '/dashboard'].some(path =>
//         pathname.startsWith(path)
//     );

//     const isAuthPage =
//         pathname.includes('/login') || pathname.includes('/signup');

//     const showPublicNav = !isAuthPage && !isDashboard;

//     const getDashboardLink = () => {
//         if (!user?.role) return '/';
//         return `/${user.role}/dashboard`;
//     };

//     return (
//         <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
//             <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">

//                 {/* LOGO */}
//                 <Link
//                     href="/"
//                     className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
//                 >
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
//                         <i className="fas fa-hospital-user text-lg"></i>
//                     </div>
//                     <span className="text-xl font-bold tracking-tight text-slate-800">
//                         Zydoc
//                     </span>
//                 </Link>

//                 {/* PUBLIC NAV */}
//                 {showPublicNav && (
//                     <div className="hidden lg:flex items-center gap-8">
//                         <a href="/#home" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Home
//                         </a>
//                         <a href="/#features" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Features
//                         </a>
//                         <a href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             How It Works
//                         </a>
//                         <a href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             FAQ
//                         </a>
//                         <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                             Find Doctors
//                         </Link>
//                     </div>
//                 )}

//                 {/* RIGHT SIDE (AUTH) */}
//                 {/* ✅ FIX: stable width to prevent nav shift */}
//                 <div className="flex items-center gap-4 justify-end w-[190px]">

//                     {!isAuthChecked ? (
//                         // small placeholder (same width area, no flicker)
//                         <div className="h-10 w-full" />
//                     ) : (
//                         <>
//                             {!isAuthPage && (
//                                 <>
//                                     {isAuthenticated ? (
//                                         <Link
//                                             href={getDashboardLink()}
//                                             className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
//                                         >
//                                             <i className="fas fa-columns mr-2"></i> Dashboard
//                                         </Link>
//                                     ) : (
//                                         <div className="flex items-center gap-4">
//                                             <Link
//                                                 href="/signup"
//                                                 // className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
//                                                 className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all whitespace-nowrap"
//                                             >
//                                                 Sign Up
//                                             </Link>
//                                             <Link
//                                                 href="/login"
//                                                 // className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all"
//                                                 // login ui safe
//                                                 className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-sm transition-all whitespace-nowrap"
//                                             >
//                                                 Login
//                                             </Link>
//                                         </div>
//                                     )}
//                                 </>
//                             )}

//                             {isAuthPage && (
//                                 <Link
//                                     href="/"
//                                     className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
//                                 >
//                                     <i className="fas fa-arrow-left"></i> Back to Home
//                                 </Link>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };

// export default Header;
















////////////////////////////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////


// // components/layout/Header.tsx
// import Link from 'next/link';

// interface User {
//     role?: string;
// }

// const Header = ({ user }: { user: User | null }) => {
//     console.log(1234);
//     const role = user?.role ?? null;

//     const dashboardLink = role
//         ? `/${role}/dashboard`
//         : '/';

//     return (
//         <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
//             <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">

//                 {/* LOGO */}
//                 <Link href="/" className="flex items-center gap-2">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
//                         <i className="fas fa-hospital-user"></i>
//                     </div>
//                     <span className="text-xl font-bold text-slate-800">Zydoc</span>
//                 </Link>

//                 {/* NAV */}
//                 <div className="hidden lg:flex items-center gap-8">
//                     <a href="/#home" className="text-sm font-semibold text-slate-700 hover:text-blue-600">Home</a>
//                     <a href="/#features" className="text-sm font-semibold text-slate-700 hover:text-blue-600">Features</a>
//                     <a href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-blue-600">How It Works</a>
//                     <a href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-blue-600">FAQ</a>

//                     <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
//                         Find Doctors
//                     </Link>
//                 </div>

//                 {/* RIGHT SIDE */}
//                 <div className="flex items-center gap-4">

//                     {user ? (
//                         <Link
//                             href={dashboardLink}
//                             className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
//                         >
//                             Dashboard
//                         </Link>
//                     ) : (
//                         <>
//                             <Link
//                                 href="/signup"
//                                 className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
//                             >
//                                 Sign Up
//                             </Link>

//                             <Link
//                                 href="/login"
//                                 className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
//                             >
//                                 Login
//                             </Link>
//                         </>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// };

// export default Header;

/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////
/////////////////////best//////////////////////////





'use client'; // Important for client-side navigation and state

import Link from 'next/link';

interface User {
    role?: string;
}

// Rename the prop to user (or initialUser) to match what you pass from layout
const Header = ({ user }: { user: User | null }) => {
    const role = user?.role ?? null;
    const dashboardLink = role ? `/${role}/dashboard` : '/';

    return (
        <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
            <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">
                {/* LOGO */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <i className="fas fa-hospital-user"></i>
                    </div>
                    <span className="text-xl font-bold text-slate-800">Zydoc</span>
                </Link>

                {/* NAV - Use Link instead of <a> for internal fragments to keep Next.js speed */}
                <div className="hidden lg:flex items-center gap-8">
                    <Link href="/#home" className="text-sm font-semibold text-slate-700 hover:text-blue-600">Home</Link>
                    <Link href="/#features" className="text-sm font-semibold text-slate-700 hover:text-blue-600">Features</Link>
                    <Link href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-blue-600">How It Works</Link>
                    <Link href="/#faq" className="text-sm font-semibold text-slate-700 hover:text-blue-600">FAQ</Link>
                    <Link href="/find-doctor" className="text-sm font-semibold text-slate-700 hover:text-blue-600">Find Doctors</Link>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <Link
                            href={dashboardLink}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/signup"
                                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Sign Up
                            </Link>
                            <Link
                                href="/login"
                                className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
                            >
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;