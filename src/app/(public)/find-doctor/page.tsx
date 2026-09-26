// src/app/find-doctor/page.tsx
// Server Component for SEO & initial HTML hydration

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';  
import DoctorFilters from '@/components/find-doctor/DoctorFilters';
import DoctorList from '@/components/find-doctor/DoctorList';
import { cookies } from 'next/headers';
import './finddoctor.css';
import { getDoctorsList } from '@/lib/doctors';
import { ChevronRight } from 'lucide-react';
 
export const metadata: Metadata = {
  title: 'Find a Doctor Near You | Zydoc Healthcare',
  description: 
    'Search and book appointments with 1000+ verified doctors. Filter by specialty, system of medicine, experience, and fee. Online video consultation & in-person clinic visits available.',
  keywords: [
    'find doctor',
    'book doctor appointment',
    'online doctor consultation',
    'telemedicine',
    'specialist clinic visit',
  ],
  openGraph: {
    title: 'Find a Doctor | Zydoc Healthcare',
    description: 'Browse and book verified medical professionals across modern medicine and holistic care.',
    type: 'website',
  },
};

async function getUser(accessToken: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Cookie: `accessToken=${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export default async function FindDoctorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const doctorsDataPromise = getDoctorsList(searchParams);
  const userPromise = accessToken ? getUser(accessToken) : Promise.resolve(null);

  const [doctorsData, user] = await Promise.all([doctorsDataPromise, userPromise]);

  return (
    <div className="find-doctor-page-root">
      {/* ── Compact Utility Header Bar ── */}
      <header className="find-doctor-top-bar">
        <div className="find-doctor-top-bar-inner">
          <div>
            <nav aria-label="Breadcrumb" className="compact-breadcrumb">
              <Link href="/" className="hover:text-[#181952] transition">
                Home
              </Link>
              <ChevronRight className="size-3 text-slate-300" />
              <span className="text-slate-600 font-semibold">Find Doctors</span>
            </nav>
            <h1 className="compact-page-title">Find Doctors &amp; Specialists</h1>
          </div>

          <div className="compact-search-wrapper">
            <DoctorFilters />
          </div>
        </div>
      </header>

      {/* ── Main Layout: Sidebar Filters + Doctor Cards Grid ── */}
      <main className="main-content-wrapper">
        <DoctorList
          doctors={doctorsData.doctors}
          pagination={doctorsData.pagination}
          basePath="/find-doctor"
        />
      </main>
    </div>
  );
}