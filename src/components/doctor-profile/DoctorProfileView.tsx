'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  Video,
  Building2,
  Calendar,
  Clock,
  Award,
  GraduationCap,
  Languages as LanguagesIcon,
  ShieldCheck,
  FileText,
  MapPin,
  ExternalLink,
  Share2,
  Sparkles,
  PhoneCall,
  BadgeCheck,
  CalendarCheck
} from 'lucide-react';
import BookButton from '@/components/patient/BookButton';
import { formatTo12Hour } from '@/utils/timeFormat';
import { DoctorProfileReviewsSection } from '@/modules/reviews-ratings';
import { deduceSystemOfMedicine, extractPrimaryQualifications } from '@/constants/systemsOfMedicine';

interface WorkingHourSlot {
  start: string;
  end: string;
  active: boolean;
}

type WeekSchedule = Record<string, WorkingHourSlot>;

interface WorkingHours {
  online?: WeekSchedule;
  offline?: WeekSchedule;
  [key: string]: any;
}

interface Qualification {
  id: string;
  degree: string;
  institution: string;
  year: string | number;
  certificateUrl?: string;
  certificateStatus?: string;
}

interface DoctorProfileViewProps {
  doctor: any;
  backLink: string;
  isProtected?: boolean;
}

const DAY_LABELS: Record<string, string> = {
  fullWeek: 'Full Week (Mon-Sun)',
  mondayToFriday: 'Mon – Fri',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const DISPLAY_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const OLD_DISPLAY_DAYS = ['mondayToFriday', 'saturday', 'sunday'];

export default function DoctorProfileView({
  doctor,
  backLink,
  isProtected = false,
}: DoctorProfileViewProps) {
  const d = doctor.doctor || doctor;

  const doctorId = d._id || d.id;
  const bookingUrl = `/patient/find-doctor/book/${doctorId}`;

  const renderBookingButton = (variant: 'hero' | 'card') => {
    if (isProtected) {
      if (variant === 'hero') {
        return (
          <Link
            href={bookingUrl}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#181852] hover:bg-[#252575] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <CalendarCheck className="size-4" />
            <span>Book Appointment</span>
          </Link>
        );
      }
      return (
        <Link
          href={bookingUrl}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#181852] hover:bg-[#252575] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <CalendarCheck className="size-4" />
          <span>Book Appointment</span>
        </Link>
      );
    }

    return <BookButton doctorId={doctorId} variant={variant} />;
  };

  const firstName = d.firstName ?? '';
  const lastName = d.lastName ?? '';
  const fullName = d.name || [firstName, lastName].filter(Boolean).join(' ');
  const displayName = fullName.toLowerCase().includes('dr.') ? fullName : `Dr. ${fullName}`;

  const specialty = d.specialty ?? 'General Practitioner';
  const qualifications: Qualification[] = d.qualifications ?? [];
  const primaryDegree = extractPrimaryQualifications(qualifications);
  const systemOfMedicine = d.systemOfMedicine || deduceSystemOfMedicine(qualifications);
  const yearsOfExp = Number(d.yearsOfExperience ?? 0);
  const bio = d.bio ?? '';
  const expertiseTags: string[] = d.expertiseTags ?? [];
  const languages: string[] = d.languages ?? [];

  let avatarUrl =
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=350&h=350';
  if (d.avatarUrl) {
    if (d.avatarUrl.startsWith('http://') || d.avatarUrl.startsWith('https://')) {
      avatarUrl = d.avatarUrl;
    } else { 
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
      const cleanPath = d.avatarUrl.startsWith('/') ? d.avatarUrl : `/${d.avatarUrl}`;
      avatarUrl = `${baseUrl}${cleanPath}`;
    }
  }

  const videoEnabled =
    d.consultationSettings?.online?.enabled ?? d.consultationSettings?.video?.enabled ?? false;
  const videoFee = Number(d.consultationSettings?.online?.fee ?? d.consultationSettings?.video?.fee ?? 0);
  const physicalEnabled =
    d.consultationSettings?.offline?.enabled ?? d.consultationSettings?.physical?.enabled ?? false;
  const physicalFee = Number(
    d.consultationSettings?.offline?.fee ?? d.consultationSettings?.physical?.fee ?? 0
  );
  const clinicName =
    d.consultationSettings?.offline?.clinicName ?? d.consultationSettings?.physical?.clinicName ?? '';
  const clinicAddress =
    d.consultationSettings?.offline?.clinicAddress ?? d.consultationSettings?.physical?.clinicAddress ?? '';

  const workingHours: WorkingHours = d.workingHours ?? {
    mondayToFriday: { start: '09:00', end: '17:00', active: true },
    saturday: { start: '10:00', end: '14:00', active: false },
    sunday: { start: '00:00', end: '00:00', active: false },
  };

  const [activeScheduleTab, setActiveScheduleTab] = useState<'online' | 'offline'>(
    videoEnabled ? 'online' : 'offline'
  );

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderScheduleSlots = (scheduleObj: any, isOldFormat: boolean = false) => {
    if (!scheduleObj) return null;
    const daysToRender = isOldFormat ? OLD_DISPLAY_DAYS : DISPLAY_DAYS;

    const isDayActive = (val: any) => {
      if (Array.isArray(val)) return val.length > 0;
      return !!val?.active;
    };

    const activeDays = daysToRender.filter((day) => isDayActive(scheduleObj[day]));

    if (activeDays.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
          <Clock className="size-6 text-slate-300 mb-1.5" />
          <p className="text-xs text-slate-500 font-medium">No active consultation hours scheduled</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {daysToRender.map((key) => {
          const val = scheduleObj[key];
          if (!isDayActive(val)) return null;

          const timeString = Array.isArray(val)
            ? val.map((b) => `${formatTo12Hour(b.start)} – ${formatTo12Hour(b.end)}`).join(', ')
            : `${formatTo12Hour(val.start)} – ${formatTo12Hour(val.end)}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-100 bg-white text-xs shadow-sm hover:border-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="font-semibold text-slate-700 uppercase tracking-wide text-[11px]">
                  {DAY_LABELS[key] || key}
                </span>
              </div>
              <span className="font-semibold text-[#181852] bg-[#eef2fc] px-2.5 py-1 rounded-lg">
                {timeString}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#101044] pb-20">
      {/* Top Header Navigation Bar */}
      <div className="bg-white border-b border-slate-100/90 sticky top-[69px] z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Link
              href={backLink}
              className="inline-flex items-center gap-1.5 font-semibold text-[#181952] hover:text-indigo-600 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Doctors</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 truncate max-w-[150px] sm:max-w-none">{displayName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share doctor profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <div className="hidden sm:block">{renderBookingButton('hero')}</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ── Main Doctor Identity Banner Card ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_30px_rgba(29,40,93,0.06)] overflow-hidden">
          {/* Cover Header with subtle medical gradient */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-[#181852] via-[#2a2b7a] to-[#3a3da8] relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
            <div className="absolute right-0 top-0 size-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 size-48 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          </div>

          {/* Profile Identity Info */}
          <div className="relative px-5 sm:px-8 pb-6 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Doctor Avatar with verified badge */}
                <div className="relative size-28 sm:size-36 rounded-2xl sm:rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-indigo-50 shrink-0">
                  <img src={avatarUrl} alt={fullName} className="size-full object-cover object-center" />
                  <span className="absolute bottom-1.5 right-1.5 flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-3 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>

                {/* Name, System & Specialty */}
                <div className="pt-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100/80 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                      <Sparkles className="size-3 text-indigo-600" />
                      {systemOfMedicine}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="size-3.5 text-emerald-600" />
                      Verified Specialist
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101044] capitalize">
                    {displayName}
                    {primaryDegree && (
                      <span className="text-base sm:text-xl font-semibold text-slate-500 ml-2 normal-case">
                        · {primaryDegree}
                      </span>
                    )}
                  </h1>

                  <p className="mt-1 text-sm font-medium text-slate-500 flex flex-wrap items-center gap-x-2">
                    <span className="font-semibold text-indigo-900">{specialty}</span>
                    {yearsOfExp > 0 && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span>{yearsOfExp} Years Experience</span>
                      </>
                    )}
                  </p>

                  {/* Rating display */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = d.rating && d.rating > 0 && star <= Math.round(d.rating);
                        return (
                          <Star
                            key={star}
                            className={`size-4 ${
                              isFilled ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm font-bold text-[#101044]">
                      {d.rating && d.rating > 0 ? Number(d.rating).toFixed(1) : '5.0'}
                    </span>
                    <span className="text-xs text-slate-400">({d.reviewCount ?? 0} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Mobile primary booking button */}
              <div className="w-full sm:w-auto sm:hidden">{renderBookingButton('hero')}</div>
            </div>

            {/* 4-Metric Quick Stat Strip */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100/60 text-indigo-700 shrink-0">
                  <Award className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Experience</p>
                  <p className="text-xs sm:text-sm font-bold text-[#101044]">{yearsOfExp}+ Years</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/60 text-emerald-700 shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-700">Verified &amp; Active</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100/60 text-blue-700 shrink-0">
                  <LanguagesIcon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Languages</p>
                  <p className="text-xs sm:text-sm font-bold text-[#101044] truncate">
                    {languages.length ? languages.join(', ') : 'English, Hindi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100/60 text-amber-700 shrink-0">
                  <Star className="size-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rating</p>
                  <p className="text-xs sm:text-sm font-bold text-[#101044]">
                    {d.rating && d.rating > 0 ? Number(d.rating).toFixed(1) : '5.0'} / 5.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left / Detail Information Column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultation Options */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <PhoneCall className="size-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#101044]">Consultation Options &amp; Fees</h2>
                  <p className="text-xs text-slate-400">Choose between secure video or in-clinic visit</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Video Consultation Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    videoEnabled
                      ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white shadow-xs'
                      : 'border-slate-100 bg-slate-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                        <Video className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#101044]">Online Video Consult</h3>
                        <p className="text-xs text-slate-500">HD Call + Digital Rx</p>
                      </div>
                    </div>
                    {videoEnabled && (
                      <span className="text-lg font-black text-indigo-600">₹{videoFee}</span>
                    )}
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100/80 pt-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Private 1-on-1 encrypted video session</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Instant digital prescription generated</span>
                    </li>
                  </ul>
                </div>

                {/* In-Person Clinic Card */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    physicalEnabled
                      ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-white shadow-xs'
                      : 'border-slate-100 bg-slate-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#101044]">Clinic Consultation</h3>
                        <p className="text-xs text-slate-500">In-Person Assessment</p>
                      </div>
                    </div>
                    {physicalEnabled && (
                      <span className="text-lg font-black text-emerald-600">₹{physicalFee}</span>
                    )}
                  </div>

                  {physicalEnabled && clinicName ? (
                    <div className="mt-4 border-t border-slate-100/80 pt-3">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-emerald-600" />
                        {clinicName}
                      </p>
                      {clinicAddress && (
                        <p className="text-xs text-slate-500 mt-1 pl-5 leading-relaxed">{clinicAddress}</p>
                      )}
                    </div>
                  ) : (
                    <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100/80 pt-3">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>Direct face-to-face examination</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="size-4" />
                </div>
                <h2 className="text-base font-bold text-[#101044]">About Doctor</h2>
              </div>
              {bio ? (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{bio}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Experienced healthcare professional dedicated to delivering comprehensive patient care.
                </p>
              )}
            </div>

            {/* Areas of Clinical Expertise */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="size-4" />
                </div>
                <h2 className="text-base font-bold text-[#101044]">Specializations &amp; Clinical Focus</h2>
              </div>
              {expertiseTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-xl bg-[#eef2fc] text-[#181952] text-xs font-semibold border border-indigo-100/60 hover:bg-[#e4ebfb] transition"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-[#eef2fc] text-[#181952] text-xs font-semibold">
                    {specialty}
                  </span>
                  <span className="px-3.5 py-1.5 rounded-xl bg-[#eef2fc] text-[#181952] text-xs font-semibold">
                    {systemOfMedicine}
                  </span>
                </div>
              )}
            </div>

            {/* Education & Qualifications */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <GraduationCap className="size-4" />
                </div>
                <h2 className="text-base font-bold text-[#101044]">Education &amp; Qualifications</h2>
              </div>
              {qualifications.length > 0 ? (
                <div className="space-y-3">
                  {qualifications.map((q) => (
                    <div
                      key={q.id || Math.random().toString()}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-indigo-100 transition"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                          <Award className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{q.degree}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{q.institution}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {q.certificateUrl && (
                          <a
                            href={
                              q.certificateUrl.startsWith('http')
                                ? q.certificateUrl
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'}${
                                    q.certificateUrl.startsWith('/') ? q.certificateUrl : `/${q.certificateUrl}`
                                  }`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-100 shadow-xs transition"
                          >
                            <span>Certificate</span>
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                        <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-xl">
                          {q.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Certified medical qualification.</p>
              )}
            </div>

            {/* Patient Reviews & Ratings */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <DoctorProfileReviewsSection
                doctorId={d._id || d.id}
                doctorName={fullName}
                specialty={specialty}
                avatarUrl={avatarUrl}
              />
            </div>
          </div>

          {/* ── Right / Sticky Booking & Availability Card ── */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_10px_30px_rgba(29,40,93,0.06)]">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md inline-block mb-2">
                  Instant Booking
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#101044]">
                    ₹{videoFee || physicalFee || d.fee || 500}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">per consultation</span>
                </div>
              </div>

              {/* Consultation Mode Tabs in Sticky Card */}
              {(videoEnabled || physicalEnabled) && (
                <div className="mt-4 p-1 bg-slate-100 rounded-xl flex gap-1 text-xs font-semibold">
                  {videoEnabled && (
                    <button
                      type="button"
                      onClick={() => setActiveScheduleTab('online')}
                      className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                        activeScheduleTab === 'online'
                          ? 'bg-white text-indigo-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Video className="size-3.5" />
                      <span>Video</span>
                    </button>
                  )}
                  {physicalEnabled && (
                    <button
                      type="button"
                      onClick={() => setActiveScheduleTab('offline')}
                      className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                        activeScheduleTab === 'offline'
                          ? 'bg-white text-indigo-900 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building2 className="size-3.5" />
                      <span>Clinic</span>
                    </button>
                  )}
                </div>
              )}

              {/* Schedule Display */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {activeScheduleTab === 'online' ? 'Online Working Hours' : 'Clinic Schedule'}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Available Slots
                  </span>
                </div>

                {activeScheduleTab === 'online'
                  ? renderScheduleSlots(
                      workingHours.online || workingHours,
                      !workingHours.online && !workingHours.offline
                    )
                  : renderScheduleSlots(workingHours.offline, false)}
              </div>

              {/* Action Button */}
              <div className="mt-6">{renderBookingButton('card')}</div>

              {/* Trust Badge Guarantees */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Instant slot confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                  <span>100% verified doctor &amp; credentials</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
