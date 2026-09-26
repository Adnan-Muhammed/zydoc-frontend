'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import DoctorFilters from '@/components/find-doctor/DoctorFilters';

export default function DoctorSearchSection() {
  const quickTags = [
    { label: 'General Medicine', query: 'General Medicine' },
    { label: 'Cardiology', query: 'Cardiology' },
    { label: 'Dermatology', query: 'Dermatology' },
    { label: 'Pediatrics', query: 'Pediatrics' },
    { label: 'Ayurveda', query: 'Ayurveda' },
  ];

  return (
    <section className="landing-search-section">
      <div className="landing-search-glow" />

      <div className="landing-search-content">
        <div className="landing-verified-tag">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          <span>100% Verified Medical Professionals</span>
        </div>

        <h2 className="landing-search-heading">
          Find the Right Doctor <br className="hidden sm:inline" />
          <span className="text-indigo-900">for Your Healthcare Needs</span>
        </h2>

        <p className="landing-search-subtitle">
          Search top specialists across Modern Medicine, Ayurveda, Homeopathy, Dentistry, and Mental
          Health. Book instant video calls or clinic visits.
        </p>

        {/* Floating Search Shell */}
        <div className="search-bar-outer-shell">
          <DoctorFilters targetPath="/find-doctor" />
        </div>

        {/* Quick Filter Search Suggestion Pills */}
        <div className="quick-tags-container">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Popular:</span>
          <div className="quick-tags-scroll flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            {quickTags.map((tag) => (
              <Link
                key={tag.label}
                href={`/find-doctor?specialty=${encodeURIComponent(tag.query)}`}
                className="quick-search-pill shrink-0"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
