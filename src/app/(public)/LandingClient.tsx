// src/components/LandingClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import FAQ from '../../components/landing/FAQ';
import Link from 'next/link';
import './landing.css';
import STATS from '../../components/landing/STATS';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import Testimonials from '../../components/landing/Testimonials';
import Blogs from '../../components/landing/Blogs';

interface User {
    role?: string;
    name?: string;
}

interface Props {
    initialUser: User | null;
    hasRefreshToken: boolean;
}

export default function LandingClient({ initialUser, hasRefreshToken }: Props) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState(!initialUser && hasRefreshToken);

    useEffect(() => {
        // If SSR had no user but there's a refreshToken → try refresh client-side
        if (!initialUser && hasRefreshToken) {
            fetch('/api/auth/refresh')  // hits our Next.js Route Handler
                .then(res => res.json())
                .then(data => {
                    if (data.user) setUser(data.user);
                })
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, []);

    const dashboardLink = user?.role ? `/${user.role}/dashboard` : '/';

    if (loading) {
        // Show neutral state while checking — avoids flash
        return (
            <div>
                <Header user={null} />
                {/* rest of page without auth-dependent buttons */}
            </div>
        );
    }

    return (
        <div>
            {/* <Header user={user} /> */}

            {/* HERO */}
            <section className="hero" id="home">
                <div className="hero-container">
                    <div className="hero-content">
                        <span className="hero-badge">✓ 24/7 Services Available</span>
                        <h1>
                            Your Health, Our Technology.{' '}
                            <span>Trusted Doctors at Your Fingertips.</span>
                        </h1>
                        <p>
                            Connect with certified healthcare professionals instantly.
                            Book appointments, get prescriptions, and manage your health — all in one place.
                        </p>

                        <div className="hero-buttons">
                            {user ? (
                                <Link href={dashboardLink} className="btn-primary">
                                    <i className="fas fa-tachometer-alt"></i> Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="btn-primary">
                                        <i className="fas fa-calendar-check"></i> Book Appointment
                                    </Link>

                                </>
                            )}
                            <Link href="/find-doctor" className="btn-secondary">
                                <i className="fas fa-search"></i> Find Doctors
                            </Link>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=500&fit=crop"
                            alt="Doctor consulting patient online via Zydoc"
                            width={500}
                            height={500}
                        />
                    </div>
                </div>
            </section>

            <STATS />


            {/* Features Section */}

            <Features />

            <HowItWorks />

            <Testimonials />

            <FAQ />

            {/* Blog Section */}
            <Blogs />

            {/* CTA */


            }
            {/* <section className="cta">
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
            </section> */}




        </div>
    );
}