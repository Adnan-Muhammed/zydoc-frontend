

// src/app/(auth)/login/page.tsx
// ✅ NO 'use client' — page shell is a Server Component
import { Metadata } from 'next';
import Link from 'next/link';
import UnifiedLoginForm from '@/components/forms/UnifiedLoginForm';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
    title: "Login | Zydoc",
    description: "Sign in to your Zydoc account to manage appointments, prescriptions, and your health profile.",
};

export default function LoginPage() {

    console.log('unified login page ');

    return (
        // <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">

        <main className="flex-1 flex items-center justify-center w-full mt-[70px] px-6">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-center">

                {/* Left: static marketing copy — great for SEO */}
                <div className="text-left space-y-4">
                    <Badge variant="primary" pill>
                        <i className="fas fa-lock mr-1"></i> Secure Portal Access
                    </Badge>
                    <h1 className="text-4xl font-bold">Welcome back</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Sign in to manage your appointments, view prescriptions, and connect with your doctors.
                    </p>
                    <ul className="space-y-2 text-slate-500 text-sm">
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Access your health records</li>
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Book and manage appointments</li>
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Video consultations with verified doctors</li>
                    </ul>
                </div>

                {/* Right: form is already a Client Component */}
                <div className="bg-white dark:bg-slate-900 py-12 px-12 shadow-xl rounded-2xl">
                    <UnifiedLoginForm />
                    <div className="mt-6 text-center text-sm">
                        <p className="mb-2 text-slate-600 dark:text-slate-400">New to Zydoc?</p>
                        <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
                            Create a free account
                        </Link>
                    </div>
                </div>

            </div>
        </main>
        // </div>
    );
}
