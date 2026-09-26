import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDoctorsList } from "@/lib/doctors";
import DoctorList from '@/components/find-doctor/DoctorList';
import DoctorFilters from '@/components/find-doctor/DoctorFilters';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import '../../../(public)/find-doctor/finddoctor.css';

export const metadata: Metadata = {
    title: "Find a Doctor | Patient Dashboard",
    description: "Search and book online or in-clinic appointments with verified medical specialists.",
}; 

export default async function PatientFindDoctorPage({
    searchParams
}: { 
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const doctorsData = await getDoctorsList(searchParams);

    const quickTags = [
        { label: 'General Medicine', query: 'General Medicine' },
        { label: 'Cardiology', query: 'Cardiology' },
        { label: 'Dermatology', query: 'Dermatology' },
        { label: 'Pediatrics', query: 'Pediatrics' },
        { label: 'Ayurveda', query: 'Ayurveda' },
    ];

    return (
        <div className="flex flex-col flex-1 bg-[#f8faff] min-h-full p-4 sm:p-6 lg:p-8 space-y-6">
            {/* ── Patient Find Doctor Header Banner ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101044] via-[#16165a] to-[#1c1c70] p-6 sm:p-8 text-white shadow-xl shadow-[#101044]/10 border border-slate-800/20">
                <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-4">
                    {/* Breadcrumbs & Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Link href="/patient/dashboard" className="hover:text-white transition">
                                Dashboard
                            </Link>
                            <ChevronRight className="size-3 text-slate-400" />
                            <span className="text-emerald-300 font-semibold">Find Doctors</span>
                        </nav>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                            <ShieldCheck className="size-3.5 text-emerald-400" />
                            <span>100% Verified Specialists</span>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                            Find & Consult Specialists
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Search top specialists across Modern Medicine, Ayurveda, Homeopathy, and Mental Health. Book instant video consultations or clinic visits.
                        </p>
                    </div>

                    {/* Integrated Top Search Bar */}
                    <div className="mt-2 max-w-2xl">
                        <DoctorFilters />
                    </div>

                    {/* Quick Specialty Suggestion Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-slate-400">Popular:</span>
                        {quickTags.map((tag) => (
                            <Link
                                key={tag.label}
                                href={`/patient/find-doctor?specialty=${encodeURIComponent(tag.query)}`}
                                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition text-xs font-medium border border-white/10"
                            >
                                {tag.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Doctor Results Section (Full Width, Conflict-Free Toggle Drawer) ── */}
            <div className="w-full">
                <DoctorList
                    doctors={doctorsData.doctors}
                    pagination={doctorsData.pagination}
                    basePath="/patient/find-doctor"
                    isDashboard={true}
                />
            </div>
        </div>
    );
}