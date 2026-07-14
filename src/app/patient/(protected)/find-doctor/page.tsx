import React from 'react';
import { getDoctorsList } from "@/lib/doctors";
import DoctorList from '@/components/find-doctor/DoctorList';
import DoctorFilters from '@/components/find-doctor/DoctorFilters';
import { Metadata } from 'next';
import '../../../(public)/find-doctor/finddoctor.css';

export const metadata: Metadata = {
    title: "Find a Doctor | Dashboard",
};

export default async function PatientFindDoctorPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const doctorsData = await getDoctorsList(searchParams);

    return (
        <div className="dashboard-find-doctor" style={{ padding: '2rem 0' }}>
            <div className="search-container" style={{ margin: '0 auto 2rem auto' }}>
                <div className="search-box" style={{ padding: '1rem' }}>
                    <DoctorFilters />
                </div>
            </div>

            <div className="main-content">
                <DoctorList doctors={doctorsData.doctors} pagination={doctorsData.pagination} basePath="/patient/find-doctor" />
            </div>
        </div>
    );
}