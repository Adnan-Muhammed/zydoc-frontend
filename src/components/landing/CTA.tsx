// src/app/(public)/components/CTA.tsx

import React from 'react';
import Link from 'next/link';

interface Props {
    user?: {
        role?: string;
    } | null;
}

export default function CTA({ user }: Props) {
    const dashboardLink = user?.role ? `/${user.role}/dashboard` : '/';

    return (
        <section className="cta">
            <div className="cta-content">
                <h2>Ready to Take Control of Your Health?</h2>
                <p>Join 50,000+ patients using Zydoc.</p>
                <div className="cta-buttons">
                    {user ? (
                        <Link href={dashboardLink} className="btn-cta">Go to Dashboard</Link>
                    ) : (
                        <Link href="/signup" className="btn-cta">Book Your First Appointment</Link>
                    )}
                    <Link href="/find-doctor" className="btn-cta" >
                        Find Doctors
                    </Link>
                </div>
            </div>
        </section>
    );
}