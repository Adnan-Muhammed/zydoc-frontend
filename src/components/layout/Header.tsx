// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation'; 
// import {
//     Menu,
//     X,
//     Home,
//     Sparkles,
//     HelpCircle,
//     Stethoscope,
//     Layers,
//     ChevronRight,
//     UserPlus,
//     LogIn,
//     LayoutDashboard
// } from 'lucide-react';

// interface User {
//     role?: string;
// }

// const navLinks = [
//     { name: 'Home', href: '/#home', icon: Home },
//     { name: 'Features', href: '/#features', icon: Sparkles },
//     { name: 'How It Works', href: '/#how-it-works', icon: Layers },
//     { name: 'FAQ', href: '/#faq', icon: HelpCircle },
//     { name: 'Find Doctors', href: '/find-doctor', icon: Stethoscope },
// ];

// const Header = ({ user }: { user: User | null }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const pathname = usePathname();
//     const role = user?.role ?? null;
//     const dashboardLink = role ? `/${role}/dashboard` : '/';

//     // Close mobile menu on route change
//     useEffect(() => {
//         setIsOpen(false);
//     }, [pathname]);

//     // Close on Escape key
//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (e.key === 'Escape') {
//                 setIsOpen(false);
//             }
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, []);

//     // Close mobile menu on resize to desktop
//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth >= 1024) {
//                 setIsOpen(false);
//             }
//         };
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     // Prevent background scrolling when mobile menu is open
//     useEffect(() => {
//         if (isOpen) {
//             document.body.style.overflow = 'hidden';
//         } else {
//             document.body.style.overflow = '';
//         }
//         return () => {
//             document.body.style.overflow = '';
//         };
//     }, [isOpen]);

//     return (
//         <>
//             <header className="fixed top-0 z-50 w-full bg-slate-50/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
//                 <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
//                     {/* LOGO */}
//                     <Link
//                         href="/"
//                         onClick={() => setIsOpen(false)}
//                         className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
//                     >
//                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
//                             <i className="fas fa-hospital-user text-lg"></i>
//                         </div>
//                         <span className="text-xl font-bold tracking-tight text-slate-800">Zydoc</span>
//                     </Link>

//                     {/* DESKTOP NAV LINKS */}
//                     <div className="hidden lg:flex items-center gap-8">
//                         {navLinks.map((link) => (
//                             <Link
//                                 key={link.name}
//                                 href={link.href}
//                                 className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
//                             >
//                                 {link.name}
//                             </Link>
//                         ))}
//                     </div>

//                     {/* RIGHT SIDE ACTIONS */}
//                     <div className="flex items-center gap-2 sm:gap-3">
//                         {user ? (
//                             <Link
//                                 href={dashboardLink}
//                                 className={`rounded-xl bg-blue-600 px-4 h-10 flex items-center justify-center text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all ${
//                                     isOpen ? 'hidden sm:flex' : 'flex'
//                                 }`}
//                             >
//                                 Dashboard
//                             </Link>
//                         ) : (
//                             <>
//                                 <Link
//                                     href="/signup"
//                                     className="hidden sm:inline-flex rounded-xl border border-slate-300 px-4 h-10 items-center justify-center text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition-all"
//                                 >
//                                     Sign Up
//                                 </Link>
//                                 <Link
//                                     href="/login"
//                                     className={`rounded-xl bg-indigo-500 px-4 h-10 items-center justify-center text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 active:scale-[0.98] transition-all ${
//                                         isOpen ? 'hidden sm:inline-flex' : 'inline-flex'
//                                     }`}
//                                 >
//                                     Login
//                                 </Link>
//                             </>
//                         )}

//                         {/* MOBILE HAMBURGER TOGGLE BUTTON */}
//                         <button
//                             type="button"
//                             onClick={() => setIsOpen(!isOpen)}
//                             className="inline-flex lg:hidden items-center justify-center h-10 w-10 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95 transition-all"
//                             aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
//                             aria-expanded={isOpen}
//                             aria-controls="mobile-menu"
//                         >
//                             {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//                         </button>
//                     </div>
//                 </nav>

//                 {/* MOBILE MENU DROPDOWN */}
//                 <div
//                     id="mobile-menu"
//                     className={`lg:hidden transition-all duration-300 ease-in-out border-b border-slate-200/80 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-2xl overflow-hidden ${
//                         isOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0 border-b-0 pointer-events-none'
//                     }`}
//                 >
//                     <div className="px-4 py-4 sm:px-6 space-y-1">
//                         {navLinks.map((link) => {
//                             const Icon = link.icon;
//                             return (
//                                 <Link
//                                     key={link.name}
//                                     href={link.href}
//                                     onClick={() => setIsOpen(false)}
//                                     className="group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 active:bg-blue-100/70 transition-all"
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
//                                             <Icon className="h-4 w-4" />
//                                         </div>
//                                         <span className="font-semibold">{link.name}</span>
//                                     </div>
//                                     <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
//                                 </Link>
//                             );
//                         })}

//                         {/* Mobile auth buttons inside menu for easy access */}
//                         <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
//                             {user ? (
//                                 <Link
//                                     href={dashboardLink}
//                                     onClick={() => setIsOpen(false)}
//                                     className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 h-11 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] transition-all"
//                                 >
//                                     <LayoutDashboard className="h-4 w-4" />
//                                     <span>Go to Dashboard</span>
//                                 </Link>
//                             ) : (
//                                 <div className="grid grid-cols-2 gap-3 pt-1">
//                                     <Link
//                                         href="/signup"
//                                         onClick={() => setIsOpen(false)}
//                                         className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white h-11 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition-all"
//                                     >
//                                         <UserPlus className="h-4 w-4 text-slate-500" />
//                                         <span>Sign Up</span>
//                                     </Link>
//                                     <Link
//                                         href="/login"
//                                         onClick={() => setIsOpen(false)}
//                                         className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-500 h-11 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 active:scale-[0.99] transition-all"
//                                     >
//                                         <LogIn className="h-4 w-4" />
//                                         <span>Login</span>
//                                     </Link>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {/* BACKDROP OVERLAY */}
//             {isOpen && (
//                 <div
//                     className="fixed inset-0 top-[70px] z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity"
//                     onClick={() => setIsOpen(false)}
//                     aria-hidden="true"
//                 />
//             )}
//         </>
//     );
// };

// export default Header;


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Menu,
    X,
    Home,
    Sparkles,
    HelpCircle,
    Stethoscope,
    Layers,
    ChevronRight,
    UserPlus,
    LogIn,
    LayoutDashboard
} from 'lucide-react';

interface User {
    role?: string;
}

const navLinks = [
    { name: 'Home', href: '/#home', icon: Home },
    { name: 'Features', href: '/#features', icon: Sparkles },
    { name: 'How It Works', href: '/#how-it-works', icon: Layers },
    { name: 'FAQ', href: '/#faq', icon: HelpCircle },
    { name: 'Find Doctors', href: '/find-doctor', icon: Stethoscope },
];

const Header = ({ user }: { user: User | null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const role = user?.role ?? null;
    const dashboardLink = role ? `/${role}/dashboard` : '/';

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <nav className="mx-auto flex h-16 md:h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* LOGO */}
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900">Zydoc</span>
                    </Link>

                    {/* DESKTOP NAV LINKS */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors duration-200"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT SIDE ACTIONS */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <Link
                                href={dashboardLink}
                                className="hidden sm:inline-flex rounded-lg bg-blue-600 px-4 h-10 items-center justify-center text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/signup"
                                    className="hidden sm:inline-flex rounded-lg border border-slate-300 px-4 h-10 items-center justify-center text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-200"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-flex rounded-lg bg-blue-600 px-4 h-10 items-center justify-center text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
                                >
                                    Login
                                </Link>
                            </>
                        )}

                        {/* MOBILE HAMBURGER TOGGLE BUTTON */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex lg:hidden items-center justify-center h-10 w-10 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95 transition-all duration-200"
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={isOpen}
                            aria-controls="mobile-menu"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </nav>

                {/* MOBILE MENU DROPDOWN */}
                <div
                    id="mobile-menu"
                    className={`lg:hidden transition-all duration-300 ease-out border-t border-slate-200/60 bg-white/98 backdrop-blur-md overflow-hidden ${
                        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                >
                    <div className="px-4 py-4 sm:px-6 space-y-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="group flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors duration-200">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">{link.name}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                                </Link>
                            );
                        })}

                        <div className="pt-4 mt-3 border-t border-slate-200 space-y-2">
                            {user ? (
                                <Link
                                    href={dashboardLink}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 h-11 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Go to Dashboard</span>
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white h-11 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-200"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        <span>Sign Up</span>
                                    </Link>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 h-11 text-sm font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        <span>Login</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* BACKDROP OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 top-16 md:top-[70px] z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

export default Header;