'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Edit3,
  ExternalLink,
  ShieldCheck,
  Languages,
  User,
  GraduationCap,
  Award,
  FileText,
  Stethoscope,
  Video,
  Building2,
  Clock,
  MapPin,
  Hourglass,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Share2,
  BadgeCheck,
  Star,
  Eye
} from 'lucide-react';
import { formatTo12Hour } from '@/utils/timeFormat';
import { resolveFileUrl } from '@/utils/fileUrlHelper';

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
}

interface DoctorProfileClientProps {
  doctor: any;
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

export default function DoctorProfileClient({ doctor: d }: DoctorProfileClientProps) {
  const firstName: string = d.firstName ?? '';
  const lastName: string = d.lastName ?? '';
  const fullName = d.name || [firstName, lastName].filter(Boolean).join(' ');
  const displayName = fullName.toLowerCase().startsWith('dr.') ? fullName : `Dr. ${fullName}`;

  const email: string = d.email ?? '';
  const phone: string = d.phone ?? '';
  const specialty: string = d.specialty ?? 'General Practitioner';
  const licenseNumber: string = d.licenseNumber ?? '';
  const registrationDocUrl: string = resolveFileUrl(d.medicalCertificateUrl);
  const yearsOfExp: number = Number(d.yearsOfExperience ?? 0);
  const bio: string = d.bio ?? '';
  const expertiseTags: string[] = d.expertiseTags ?? [];
  const languages: string[] = d.languages ?? [];
  const qualifications: Qualification[] = d.qualifications ?? [];
  const primaryDegree: string = d.primaryDegree ?? '';
  const systemOfMedicine: string = d.systemOfMedicine ?? 'Modern Medicine';
  const profileStatus: string = d.verificationStatus ?? 'approved';
  const doctorId: string = d._id || d.id || '';

  let avatarUrl =
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=350&h=350';
  if (d.avatarUrl && !d.avatarUrl.includes('Lucid_Origin_I_want_a_professionallooking_passpo')) {
    const resolvedAvatar = resolveFileUrl(d.avatarUrl);
    if (resolvedAvatar) {
      avatarUrl = resolvedAvatar;
    }
  } 

  const videoEnabled: boolean =
    d.consultationSettings?.online?.enabled ?? d.consultationSettings?.video?.enabled ?? false;
  const videoFee: number = Number(
    d.consultationSettings?.online?.fee ?? d.consultationSettings?.video?.fee ?? 0
  );
  const physicalEnabled: boolean =
    d.consultationSettings?.offline?.enabled ?? d.consultationSettings?.physical?.enabled ?? false;
  const physicalFee: number = Number(
    d.consultationSettings?.offline?.fee ?? d.consultationSettings?.physical?.fee ?? 0
  );
  const clinicName: string =
    d.consultationSettings?.offline?.clinicName ?? d.consultationSettings?.physical?.clinicName ?? '';
  const clinicAddress: string =
    d.consultationSettings?.offline?.clinicAddress ?? d.consultationSettings?.physical?.clinicAddress ?? '';

  const workingHours: WorkingHours = d.workingHours ?? {
    mondayToFriday: { start: '09:00', end: '17:00', active: false },
    saturday: { start: '10:00', end: '14:00', active: false },
    sunday: { start: '00:00', end: '00:00', active: false },
  };

  const [activeScheduleTab, setActiveScheduleTab] = useState<'online' | 'offline'>(
    videoEnabled ? 'online' : 'offline'
  );

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const publicUrl = `${window.location.origin}/find_doctor/${doctorId}`;
      navigator.clipboard?.writeText(publicUrl);
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
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/60 text-xs hover:bg-white transition shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                <span className="font-semibold text-slate-700 capitalize">{DAY_LABELS[key] || key}</span>
              </div>
              <span className="font-bold text-[#101044] bg-white border border-slate-200/60 px-2 py-0.5 rounded-lg text-right">
                {timeString}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const currentDisplayedFee =
    activeScheduleTab === 'offline'
      ? physicalFee || d.fee || videoFee || 500
      : videoFee || d.fee || physicalFee || 500;

  return (
    <div className="min-h-screen bg-[#f8faff] pb-12 animate-in fade-in duration-300">
      {/* ── Top Header / Quick Action Bar ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0">
              <User className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-[#101044] tracking-tight truncate">
                  Physician Profile
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  Public Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                How patients view your clinical credentials, fees, and availability.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share public profile link"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition shadow-2xs"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share Profile'}</span>
            </button>

            

            <Link
              href="/doctor/profile/edit2"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#181852] hover:bg-[#252575] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              <Edit3 className="size-3.5 text-emerald-400" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ── Main Doctor Identity Banner Card ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_30px_rgba(29,40,93,0.06)] overflow-hidden">
          {/* Top Blue Banner Header with Doctor Name, Badges & Overlapping Avatar */}
          <div className="bg-gradient-to-r from-[#181852] via-[#242674] to-[#36389a] relative px-5 sm:px-8 pt-6 pb-6 sm:pb-7 overflow-visible">
            {/* Ambient visual background patterns */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
            <div className="absolute right-0 top-0 size-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 size-48 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

            {/* Profile Identity Details inside Blue Banner */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              {/* Doctor Profile Picture overlapping the bottom border */}
              <div className="relative size-24 sm:size-32 rounded-2xl sm:rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-indigo-950/70 shrink-0 -mb-10 sm:-mb-14 z-20">
                <img src={avatarUrl} alt={fullName} className="size-full object-cover object-center" />
                <span className="absolute bottom-1.5 right-1.5 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>

              {/* Doctor Details Relocated inside Banner */}
              <div className="flex-1 min-w-0">
                {/* System of Medicine & Verified Specialist Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {systemOfMedicine && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                      <Sparkles className="size-3 text-indigo-200" />
                      {systemOfMedicine}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 backdrop-blur-md border border-emerald-400/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 shadow-xs">
                    <BadgeCheck className="size-3.5 text-emerald-300" />
                    Verified Specialist
                  </span>
                </div>

                {/* Doctor Name in Pure White & Degree */}
                <div className="flex flex-wrap items-baseline gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white capitalize drop-shadow-xs">
                    {displayName}
                  </h1>
                  {primaryDegree && (
                    <span className="text-xs sm:text-sm font-semibold text-indigo-100 bg-white/15 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-lg">
                      {primaryDegree}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Below Banner (Compact, clean spacing) */}
          <div className="px-5 sm:px-8 pt-10 sm:pt-4 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:pl-[152px]">
              {/* Specialty, Experience, Rating */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Stethoscope className="size-4 text-indigo-600" />
                  {specialty}
                </span>
                {yearsOfExp > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="font-medium text-slate-500">{yearsOfExp} Years Experience</span>
                  </>
                )}

                {/* Rating display */}
                <div className="flex items-center gap-1.5 pl-0 sm:pl-3 sm:border-l sm:border-slate-200">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#101044]">5.0</span>
                  <span className="text-xs text-slate-400">(Verified Doctor)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/doctor/profile/edit2"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="size-3" />
                  <span>Update Info</span>
                </Link>
              </div>
            </div>

            {/* 4-Metric Quick Stat Strip */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-100/70 text-indigo-700 shrink-0">
                  <Award className="size-4.5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Experience</p>
                  <p className="text-xs sm:text-sm font-bold text-[#101044]">{yearsOfExp}+ Years</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 shrink-0">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-700">Verified &amp; Active</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100/70 text-blue-700 shrink-0">
                  <Languages className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Languages</p>
                  <p className="text-xs sm:text-sm font-bold text-[#101044] truncate">
                    {languages.length ? languages.join(', ') : 'English, Hindi'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-100/70 text-purple-700 shrink-0">
                  <FileText className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Medical Reg #</p>
                  <div className="text-xs sm:text-sm font-bold text-[#101044] truncate">
                    {registrationDocUrl ? (
                      <a
                        href={registrationDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        <span>{licenseNumber || 'Verified'}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      licenseNumber || 'Verified'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left / Detail Information Column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultation Options & Fees */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Stethoscope className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#101044]">Consultation Options &amp; Fees</h2>
                    <p className="text-xs text-slate-400">Configured patient channels and fees</p>
                  </div>
                </div>
                <Link
                  href="/doctor/profile/edit2"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Edit Fees
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Video Consultation Card */}
                <div
                  onClick={() => videoEnabled && setActiveScheduleTab('online')}
                  className={`p-5 rounded-2xl border transition-all ${
                    !videoEnabled
                      ? 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
                      : activeScheduleTab === 'online'
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-50/60 to-white shadow-md cursor-pointer'
                      : 'border-slate-200/80 bg-white hover:border-indigo-200 hover:bg-slate-50/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                        <Video className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#101044]">Online Video Consult</h3>
                          {activeScheduleTab === 'online' && videoEnabled && (
                            <span className="size-2 rounded-full bg-indigo-600 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500">HD Video + Digital Rx</p>
                      </div>
                    </div>
                    {videoEnabled && (
                      <span className="text-lg font-black text-indigo-600">₹{videoFee}</span>
                    )}
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100/80 pt-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span>{videoEnabled ? 'Active and accepting video appointments' : 'Disabled'}</span>
                    </li>
                  </ul>
                </div>

                {/* In-Person Clinic Card */}
                <div
                  onClick={() => physicalEnabled && setActiveScheduleTab('offline')}
                  className={`p-5 rounded-2xl border transition-all ${
                    !physicalEnabled
                      ? 'border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed'
                      : activeScheduleTab === 'offline'
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/60 to-white shadow-md cursor-pointer'
                      : 'border-slate-200/80 bg-white hover:border-emerald-200 hover:bg-slate-50/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
                        <Building2 className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#101044]">Clinic Consultation</h3>
                          {activeScheduleTab === 'offline' && physicalEnabled && (
                            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500">In-Person Physical Visit</p>
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
                        <span>{physicalEnabled ? 'Active for clinic consultations' : 'Disabled'}</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Biography */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#101044]">Professional Biography</h2>
                    <p className="text-xs text-slate-400">Overview of clinical experience and approach</p>
                  </div>
                </div>
                <Link
                  href="/doctor/profile/edit2"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Edit Bio
                </Link>
              </div>

              {bio ? (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{bio}</p>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500">
                    No biography added yet. Click &quot;Edit Profile&quot; to write a concise overview of your
                    medical background.
                  </p>
                </div>
              )}
            </div>

            {/* Areas of Clinical Expertise */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Award className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#101044]">Areas of Clinical Expertise</h2>
                    <p className="text-xs text-slate-400">Specialized treatments and medical focus</p>
                  </div>
                </div>
                <Link
                  href="/doctor/profile/edit2"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Edit Tags
                </Link>
              </div>

              {expertiseTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 shadow-2xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No expertise tags added yet.</p>
              )}
            </div>

            {/* Education & Qualifications */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <GraduationCap className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#101044]">Education &amp; Credentials</h2>
                    <p className="text-xs text-slate-400">Medical degrees and certifications</p>
                  </div>
                </div>
                <Link
                  href="/doctor/profile/edit2"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Add Qualification
                </Link>
              </div>

              {qualifications.length > 0 ? (
                <div className="space-y-3">
                  {qualifications.map((q) => (
                    <div
                      key={q.id || q.degree}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white transition shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 mt-0.5">
                          <GraduationCap className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#101044] truncate">{q.degree}</h3>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{q.institution}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {q.certificateUrl && (
                          <a
                            href={resolveFileUrl(q.certificateUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1 rounded-lg transition"
                          >
                            <FileText className="size-3.5" />
                            <span>Certificate</span>
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
                <p className="text-sm text-slate-400 italic">No medical qualification records added.</p>
              )}
            </div>
          </div>

          {/* ── Right / Sticky Schedule & Contact Card ── */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Practice Schedule Card (Dedicated to Availability) */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_10px_30px_rgba(29,40,93,0.06)]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#101044]">Practice Schedule</h3>
                    <p className="text-[11px] text-slate-400">Weekly consultation hours</p>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
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
                      <span>Video Hours</span>
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
                      <span>Clinic Hours</span>
                    </button>
                  )}
                </div>
              )}

              {/* Schedule Display */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {activeScheduleTab === 'online' ? 'Online Working Hours' : 'Clinic Schedule'}
                  </h4>
                </div>

                {activeScheduleTab === 'online'
                  ? renderScheduleSlots(
                      workingHours.online || workingHours,
                      !workingHours.online && !workingHours.offline
                    )
                  : renderScheduleSlots(workingHours.offline, false)}
              </div>

              {/* Action Button */}
              <div className="mt-5">
                <Link
                  href="/doctor/profile/edit2"
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#181852] hover:bg-[#252575] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                >
                  <Clock className="size-3.5" />
                  <span>Update Working Hours</span>
                </Link>
              </div>

              {/* Trust Badge Guarantees */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Real-time patient slot synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
                  <span>Verified credentials on patient directory</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
                Account Contact Information
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Registered Email</p>
                    <p className="font-semibold text-slate-800 truncate">{email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Phone className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Phone Number</p>
                    <p className="font-semibold text-slate-800 truncate">{phone || '—'}</p>
                  </div>
                </div>

                {clinicAddress && (
                  <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                    <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Clinic Location</p>
                      <p className="font-bold text-slate-800">{clinicName || 'Clinic'}</p>
                      <p className="text-slate-500 mt-0.5">{clinicAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
