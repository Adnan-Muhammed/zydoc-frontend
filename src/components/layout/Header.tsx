'use client';

import Link from 'next/link';

interface User {
    role?: string;
}

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

                {/* NAV */}
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