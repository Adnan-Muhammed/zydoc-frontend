'use client';

import Link from 'next/link';

const AuthHeader = () => {
    return (
        <header className="fixed top-0 z-50 w-full bg-slate-50 border-b border-slate-200 shadow-sm">
            <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-8">

                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <i className="fas fa-hospital-user"></i>
                    </div>
                    <span className="text-xl font-bold text-slate-800">Zydoc</span>
                </Link>
 
                <Link
                    href="/"
                    className="text-sm font-medium text-slate-600 hover:text-blue-600"
                >
                    ← Back to Home
                </Link>
            </nav>
        </header>
    );
};

export default AuthHeader;