// // src/app/find-doctor/page.tsx
// 'use client';
// import React, { useState } from 'react';
// import Link from 'next/link';
// import './finddoctor.css';
// import '../landing.css'; // Reuse header/footer styles
// import Header from '@/components/layout/Header';




// src/app/find-doctor/page.tsx
// ✅ NO 'use client' — This is a Server Component for SEO


import axiosInstance from "@/api/axiosInstance";


import { Metadata } from 'next';
import DoctorFilters from '@/components/find-doctor/DoctorFilters';
import DoctorList from '@/components/find-doctor/DoctorList';
import { cookies } from 'next/headers';
import './finddoctor.css';
import { getDoctors, getDoctorsList } from "@/lib/doctors";
// import '../../(public)/landing.css';

export const metadata: Metadata = {
    title: "Find a Doctor Near You | Zydoc",
    description: "Search and book appointments with 1000+ verified doctors. Filter by specialty, location, experience, and consultation fee. Online & in-person available.",
    keywords: ["find doctor", "book doctor appointment", "online consultation", "specialist near me"],
    openGraph: {
        title: "Find a Doctor | Zydoc",
        description: "Browse and book with 1000+ verified medical professionals.",
        type: "website",
    },
};





// const getDoctors = async () => {
//   const response = await axiosInstance.get("/doctors");
//   console.log(response.data)

//   return response.data;
// };

// Extracted to src/lib/doctors.ts

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
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Fetch doctors based on URL search params (limit is handled by backend default or overridden by searchParams)
    // We pass searchParams directly so backend handles specialty, minRating, page, limit, etc.
    const doctorsDataPromise = getDoctorsList(searchParams);
    const userPromise = accessToken ? getUser(accessToken) : Promise.resolve(null);                             

    const [doctorsData, user] = await Promise.all([doctorsDataPromise, userPromise]);

    



    return (


        <div>
            {/* <Header user={user} /> */}

            {/* SEO-friendly static page header — rendered in HTML, crawlable */}
            <section className="page-header" style={{ marginTop: '70px' }}>
                <h1>Find Your Doctor</h1>
                <p>Search and book appointments with verified medical professionals</p>
            </section>

            {/* Static search bar shell — interactivity handled in DoctorFilters client component */}
            <div className="desktop-search-only">
                <div className="search-container">
                    <div className="search-box">
                        <DoctorFilters />
                    </div>
                </div>
            </div>

            {/* Main layout: sidebar + doctor grid */}
            <div className="main-content">
                {/* 
          Doctor list is pre-rendered on the server with real data.
          DoctorList is a Client Component only for sort/filter interactivity.
          All doctor cards are in the initial HTML for SEO.
        */}
                <DoctorList doctors={doctorsData.doctors} pagination={doctorsData.pagination} basePath="/find-doctor" />
            </div>


        </div>
    );
} 