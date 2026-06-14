
// src/app/admin/(auth)/login/page.tsx

import type { Metadata } from "next";
import { Shield, Users, CalendarCheck, Lock } from "lucide-react";
import AdminLoginForm from "@/components/forms/AdminLoginForm";


// In your /admin/login/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
    title: "Admin Login – Zydoc",
    description: "Secure administrator sign-in for the Zydoc healthcare platform.",
};

const features = [
    { icon: Users, label: "Role-based administrator authentication" },
    { icon: CalendarCheck, label: "Manage healthcare operations efficiently" },
    { icon: Lock, label: "Advanced security monitoring & 2FA protection" },
];

export default function AdminLoginPage() {

    console.log('/src/app/admin/(auth)/login/page.tsx is loading');

    return (
        <main className="relative flex min-h-screen bg-[#0d1117]">

            {/* ── Left hero panel ─────────────────────────────────────────── */}
            <section className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[55%]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -left-32 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]"
                />

                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-sm">
                        <Shield className="h-4 w-4 text-blue-400" />
                        Secure Admin Portal
                    </span>
                </div>

                <div className="relative z-10 space-y-8">
                    <h1 className="text-[clamp(3rem,5vw,4.5rem)] font-black leading-none tracking-tight text-white">
                        Zydoc <span className="text-blue-400">Admin</span>
                    </h1>
                    <p className="max-w-md text-base leading-relaxed text-slate-400">
                        Securely manage doctors, patients, appointments, compliance, and
                        healthcare operations through your enterprise control center.
                    </p>
                    <ul className="space-y-4">
                        {features.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="text-sm text-slate-300">{label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div />
            </section>

            {/* ── Right login panel ────────────────────────────────────────── */}
            <section className="flex flex-1 items-start justify-center overflow-y-auto bg-slate-900/80 px-6 py-12 lg:items-center lg:px-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-1 text-center lg:text-left">
                        <div className="mb-4 flex justify-center lg:hidden">
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm font-medium text-slate-300">
                                <Shield className="h-4 w-4 text-blue-400" />
                                Secure Admin Portal
                            </span>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-white">
                            Admin Control Center
                        </h2>
                        <p className="text-sm text-slate-400">
                            Authorized personnel only. Secure sign in required.
                        </p>
                    </div>
                    <AdminLoginForm />
                </div>
            </section>
        </main>
    );
}