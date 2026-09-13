'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface HeroProps {
    user?: { role?: string } | null;
}

const Hero = ({ user }: HeroProps) => {
    const dashboardLink = user?.role ? `/${user.role}/dashboard` : '/';

    return (
        <section id="home" className="relative w-full pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
            {/* GRADIENT BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 -z-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 opacity-40" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl -z-10 opacity-40" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* LEFT CONTENT */}
                    <div className="space-y-6 md:space-y-8">
                        {/* TRUST BADGE */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-slate-700">24/7 Online Medical Consultation</span>
                        </div>

                        {/* MAIN HEADLINE */}
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                                Connect with Trusted Healthcare Professionals
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
                                Book appointments, consult verified doctors, get prescriptions, and manage your health—all from your home. Fast, secure, and affordable.
                            </p>
                        </div>

                        {/* CTA BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                            {user ? (
                                <Link
                                    href={dashboardLink}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <span>Book Appointment</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                    <Link
                                        href="/find-doctor"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:bg-slate-50 active:scale-95 transition-all duration-200"
                                    >
                                        <span>Find Doctors</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* TRUST INDICATORS */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-6 md:gap-8 text-sm">
                            <div>
                                <div className="font-bold text-slate-900">1000+</div>
                                <div className="text-slate-600">Verified Doctors</div>
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">50K+</div>
                                <div className="text-slate-600">Happy Patients</div>
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">4.9★</div>
                                <div className="text-slate-600">Average Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="relative h-96 md:h-[450px] lg:h-[500px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 to-blue-50/60 rounded-2xl lg:rounded-3xl" />
                        <img
                            src="https://images.unsplash.com/photo-1576091160399-7f94aa4d9b8a?w=600&h=600&fit=crop"
                            alt="Doctor consultation"
                            className="w-full h-full object-cover rounded-2xl lg:rounded-3xl shadow-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent rounded-2xl lg:rounded-3xl" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;