import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from "react";
import Link from "next/link";
import { formatTo12Hour } from "@/utils/timeFormat";
import { deduceSystemOfMedicine, extractPrimaryQualifications } from "@/constants/systemsOfMedicine";
import {
  Edit3,
  Phone,
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
  Sparkles
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const cfg: Record<string, { label: string; dot: string; cls: string; icon: any }> = {
    approved: {
      label: "Verified & Approved",
      dot: "bg-emerald-500",
      cls: "bg-emerald-50 border-emerald-200/80 text-emerald-800",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending Review",
      dot: "bg-amber-500",
      cls: "bg-amber-50 border-amber-200/80 text-amber-800",
      icon: Hourglass,
    },
    rejected: {
      label: "Action Required",
      dot: "bg-rose-500",
      cls: "bg-rose-50 border-rose-200/80 text-rose-800",
      icon: AlertCircle,
    },
    incomplete: {
      label: "Incomplete Profile",
      dot: "bg-slate-400",
      cls: "bg-slate-50 border-slate-200 text-slate-600",
      icon: Hourglass,
    },
  };
  const c = cfg[status ?? "incomplete"] ?? cfg.incomplete;
  const IconComponent = c.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.cls} shadow-2xs`}>
      <IconComponent className="w-3.5 h-3.5" />
      <span>{c.label}</span>
    </span>
  );
}

function Card({ title, icon: IconComponent, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/40">
        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center shrink-0 text-indigo-600">
          <IconComponent className="w-4 h-4" />
        </span>
        <h3 className="text-sm font-bold text-[#101044] tracking-tight">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const DAY_LABELS: Record<string, string> = {
  fullWeek: "Full Week (Mon-Sun)",
  mondayToFriday: "Mon – Fri",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday", 
};

const DISPLAY_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const OLD_DISPLAY_DAYS = ['mondayToFriday', 'saturday', 'sunday'];

const renderSchedule = (scheduleObj: any, isOldFormat: boolean = false) => {
  if (!scheduleObj) return null;
  const daysToRender = isOldFormat ? OLD_DISPLAY_DAYS : DISPLAY_DAYS;
  
  const isDayActive = (val: any) => {
    if (Array.isArray(val)) return val.length > 0;
    return !!val?.active;
  };

  const activeDays = daysToRender.filter(day => isDayActive(scheduleObj[day]));
  
  if (activeDays.length === 0) {
    return (
      <div className="flex items-center justify-center p-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
        <span className="text-xs text-slate-400 font-medium">Currently unavailable</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {daysToRender.map((key) => {
        const val = scheduleObj[key];
        if (!isDayActive(val)) return null;

        const timeString = Array.isArray(val)
          ? val.map(b => `${formatTo12Hour(b.start)} – ${formatTo12Hour(b.end)}`).join(', ')
          : `${formatTo12Hour(val.start)} – ${formatTo12Hour(val.end)}`;

        return (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs hover:bg-white transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">{DAY_LABELS[key] || key}</span>
            </div>
            <span className="font-bold text-[#101044] bg-white border border-slate-200/60 px-2.5 py-1 rounded-lg text-right">
              {timeString}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function DoctorProfilePage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
      redirect('/login');
  }

  let d: any = {};
  try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/doctor/profile`, {
          headers: {
              Cookie: `accessToken=${accessToken}`,
              Authorization: `Bearer ${accessToken}`,
          },
          cache: 'no-store',
      });

      if (!res.ok) {
          redirect('/login');
      }
 
      const data = await res.json();
      d = data.profile ?? data.user ?? data;
  } catch (error) {
      console.error('Error fetching user data:', error);
      redirect('/doctor/dashboard');
  }

  const firstName: string = d.firstName ?? "";
  const lastName: string = d.lastName ?? "";
  const email: string = d.email ?? "";
  const phone: string = d.phone ?? "";
  const specialty: string = d.specialty ?? "";
  const licenseNumber: string = d.licenseNumber ?? "";
  const registrationDocUrl: string = d.medicalCertificateUrl ?? "";
  const yearsOfExp: number = Number(d.yearsOfExperience ?? 0);
  const bio: string = d.bio ?? "";
  const expertiseTags: string[] = d.expertiseTags ?? [];
  const languages: string[] = d.languages ?? [];
  const qualifications: Qualification[] = d.qualifications ?? [];
  const primaryDegree: string = extractPrimaryQualifications(qualifications);
  const systemOfMedicine: string = d.systemOfMedicine || deduceSystemOfMedicine(qualifications);
  const profileStatus: string = d.verificationStatus ?? "incomplete";

  const avatarUrl: string = d.avatarUrl 
    && !d.avatarUrl.includes("Lucid_Origin_I_want_a_professionallooking_passpo…") 
    ? d.avatarUrl 
    : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256&h=256";

  const videoEnabled: boolean = d.consultationSettings?.online?.enabled ?? d.consultationSettings?.video?.enabled ?? false;
  const videoFee: number = Number(d.consultationSettings?.online?.fee ?? d.consultationSettings?.video?.fee ?? 0);
  const physicalEnabled: boolean = d.consultationSettings?.offline?.enabled ?? d.consultationSettings?.physical?.enabled ?? false;
  const physicalFee: number = Number(d.consultationSettings?.offline?.fee ?? d.consultationSettings?.physical?.fee ?? 0);
  const clinicName: string = d.consultationSettings?.offline?.clinicName ?? d.consultationSettings?.physical?.clinicName ?? "";
  const clinicAddress: string = d.consultationSettings?.offline?.clinicAddress ?? d.consultationSettings?.physical?.clinicAddress ?? "";

  const workingHours: WorkingHours = d.workingHours ?? {
    mondayToFriday: { start: "09:00", end: "17:00", active: false },
    saturday: { start: "10:00", end: "14:00", active: false },
    sunday: { start: "00:00", end: "00:00", active: false },
  };

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "DR";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Page Title Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/70 flex items-center justify-center shadow-2xs">
                <User className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101044] tracking-tight">
                Physician Profile
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-12">
              Review and manage your credentials, clinical specialties, and patient consultation fees.
            </p>
          </div>

          <Link
            href="/doctor/profile/edit2"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#101044] hover:bg-indigo-950 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-98 shrink-0 self-start sm:self-auto ml-12 sm:ml-0"
          >  
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>Edit Profile</span> 
          </Link>
        </div>

        {/* ── Hero Card ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          {/* Cover banner */}
          <div className="h-32 bg-gradient-to-r from-[#101044] via-[#1a1a6b] to-indigo-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          </div>

          {/* Avatar + name layout section */}
          <div className="relative z-10 px-6 sm:px-8 pb-6 -mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Frame */}
            <div className="w-28 h-28 rounded-3xl border-4 border-white shadow-md overflow-hidden bg-[#101044] flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-extrabold tracking-wide">{initials}</span>
              )}
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 min-w-0 sm:pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 w-full">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    {systemOfMedicine}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#101044] truncate">
                  {fullName ? `Dr. ${fullName}` : "Dr. —"}
                  {primaryDegree && (
                    <span className="text-sm font-semibold text-slate-500 ml-2">
                      · {primaryDegree}
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                  {specialty || "Specialty not set"}
                  {yearsOfExp > 0 && (
                    <span className="text-slate-400 font-normal"> · {yearsOfExp} years clinical experience</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{email}</p>
              </div>
              <div className="shrink-0">
                <StatusBadge status={profileStatus} />
              </div>
            </div>
          </div>

          {/* Quick-stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/40">
            {[
              { label: "Phone", value: phone || "—", icon: Phone },
              { 
                label: "Medical Reg. Number", 
                value: registrationDocUrl ? (
                  <a 
                    href={registrationDocUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <span>{licenseNumber}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : licenseNumber || "—", 
                icon: ShieldCheck 
              },
              { label: "Languages Spoken", value: languages.length ? languages.join(", ") : "—", icon: Languages },
            ].map(({ label, value, icon: IconComp }) => (
              <div key={label} className="flex items-center gap-3.5 px-6 py-4">
                <span className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center shrink-0 text-indigo-600">
                  <IconComp className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ── Left / Main column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card title="Professional Biography" icon={FileText}>
              {bio ? (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-normal">{bio}</p>
              ) : (
                <p className="text-xs text-slate-400 italic">No biography added yet. Click &quot;Edit Profile&quot; to add an overview of your medical career.</p>
              )}  
            </Card> 

            {/* Expertise Tags */}
            <Card title="Areas of Clinical Expertise" icon={Award}>
              {expertiseTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No expertise tags added yet.</p>
              )}
            </Card>

            {/* Qualifications */}
            <Card title="Education & Medical Qualifications" icon={GraduationCap}>
              {qualifications.length > 0 ? (
                <div className="space-y-3">
                  {qualifications.map((q) => (
                    <div
                      key={q.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-white transition-all shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center shrink-0 mt-0.5 text-indigo-600">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#101044] truncate">{q.degree}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{q.institution}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                        {q.certificateUrl && (
                          <a
                            href={q.certificateUrl.startsWith('http') ? q.certificateUrl : `${process.env.NEXT_PUBLIC_API_URL}${q.certificateUrl.startsWith('/') ? '' : '/'}${q.certificateUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Certificate</span>
                          </a>
                        )}
                        <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl">
                          Class of {q.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No qualification records added.</p>
              )}
            </Card>

            {/* Consultation Settings */}
            <Card title="Consultation Channels & Fees" icon={Stethoscope}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Telehealth */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${videoEnabled ? "border-blue-200 bg-blue-50/40" : "border-slate-100 bg-slate-50/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 ${videoEnabled ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      <Video className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#101044]">Online Video</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${videoEnabled ? "text-blue-600" : "text-slate-400"}`}>
                        {videoEnabled ? "Active & Accepting" : "Inactive"}
                      </p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${videoEnabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  </div>
                  {videoEnabled && (
                    <div className="mt-4 pt-3 border-t border-blue-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee</p>
                      <p className="text-2xl font-extrabold text-[#101044] mt-0.5">₹{videoFee.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* In-Person */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${physicalEnabled ? "border-emerald-200 bg-emerald-50/40" : "border-slate-100 bg-slate-50/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 ${physicalEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      <Building2 className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#101044]">In-Person Clinic</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${physicalEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                        {physicalEnabled ? "Active & Accepting" : "Inactive"}
                      </p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${physicalEnabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                  </div>
                  {physicalEnabled ? (
                    <div className="mt-4 pt-3 border-t border-emerald-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee</p>
                        <p className="text-2xl font-extrabold text-[#101044] mt-0.5">₹{physicalFee.toLocaleString()}</p>
                      </div>
                      {clinicName && (
                        <div className="bg-white p-3 rounded-xl border border-emerald-100/70">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Name</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{clinicName}</p>
                          {clinicAddress && <p className="text-xs text-slate-500 mt-0.5">{clinicAddress}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 italic">In-person consultations are disabled.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* ── Right / Side column ── */}
          <div className="space-y-6">
            
            {/* Availability Schedule */}
            <Card title="Practice Availability Schedule" icon={Clock}>
              <div className="space-y-6">
                {/* Online Schedule */}
                {videoEnabled && (workingHours.online || (!workingHours.online && !workingHours.offline)) && (
                  <div>
                    {workingHours.online && (
                      <div className="flex items-center gap-2 mb-3">
                        <Video className="w-3.5 h-3.5 text-blue-500" />
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Video Hours</h4>
                      </div>
                    )}
                    {renderSchedule(workingHours.online || workingHours, !workingHours.online && !workingHours.offline)}
                  </div>
                )}

                {/* Offline Schedule */}
                {physicalEnabled && workingHours.offline && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clinic Hours</h4>
                    </div>
                    {clinicName && ( 
                      <div className="mb-4 p-3.5 bg-slate-50/80 border border-slate-100 rounded-2xl">
                        <p className="text-xs font-bold text-slate-800 flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> 
                            <span>{clinicName}</span>
                        </p>
                        {clinicAddress && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> 
                                <span>{clinicAddress}</span>
                            </p>
                        )}
                      </div>
                    )}
                    {renderSchedule(workingHours.offline, false)}
                  </div>
                )}

                {!videoEnabled && !physicalEnabled && (
                  <div className="flex items-center justify-center p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <span className="text-xs text-slate-400 font-medium">Currently unavailable</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Status Notices */}
            {profileStatus === "pending" && (
              <div className="flex items-start gap-3 p-5 rounded-3xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed shadow-2xs">
                <Hourglass className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <span>Your medical profile is under compliance team review. Your practice will be fully active once approved.</span>
              </div>
            )}
            {profileStatus === "incomplete" && (
              <div className="flex items-start gap-3 p-5 rounded-3xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed shadow-2xs">
                <Hourglass className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <span>Complete your medical licensing details to submit your profile for admin verification.</span>
              </div>
            )}
            {profileStatus === "rejected" && (
              <div className="flex items-start gap-3 p-5 rounded-3xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 leading-relaxed shadow-2xs">
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                <span>Your credentials require revisions. Please click &quot;Edit Profile&quot; to review feedback and resubmit.</span>
              </div>
            )}
            {profileStatus === "approved" && (
              <div className="flex items-start gap-3 p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Your physician profile is verified and active for patient appointments.</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}