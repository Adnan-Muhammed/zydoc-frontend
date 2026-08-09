// src/app/(auth)/signup/page.tsx
// ✅ NO 'use client' — page shell is a Server Component
import { Metadata } from 'next';
import Link from 'next/link';
import UnifiedSignupForm from '@/components/forms/UnifiedSignupForm';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
    title: "Create Account | Zydoc",
    description: "Join Zydoc and connect with 1000+ verified doctors. Free to sign up. Book appointments, get prescriptions, and manage your healthcare online.",
};

export default function SignupPage() {
    console.log('unified signup page');

    return (


        <main className="flex-1 flex items-center justify-center w-full mt-[70px] px-6">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-center">

                {/* Left: static copy */}
                <div className="text-left space-y-4">
                    <Badge variant="primary" pill>
                        <i className="fas fa-user-plus mr-1"></i> Free to Join
                    </Badge>
                    <h1 className="text-4xl font-bold">Create your account</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Join thousands of patients using Zydoc to take control of their healthcare.
                    </p>
                    <ul className="space-y-2 text-slate-500 text-sm">
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Free account, no credit card required</li>
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Access 1000+ verified doctors</li>
                        <li><i className="fas fa-check text-green-500 mr-2"></i>Secure & private health records</li>
                    </ul>
                </div>

                {/* Right: form — already a Client Component */}
                <div className="bg-white dark:bg-slate-900 py-12 px-12 shadow-xl rounded-2xl">
                    <UnifiedSignupForm />
                    <div className="mt-6 text-center text-sm">
                        <p className="mb-2 text-slate-600 dark:text-slate-400">Already have an account?</p>
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>

            </div>
        </main>
        // </div>
    );
}