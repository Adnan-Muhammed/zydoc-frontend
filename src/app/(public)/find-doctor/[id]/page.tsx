import React from "react";
import Link from "next/link";
import { getDoctorById } from "@/lib/doctors";
import { notFound } from "next/navigation";

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
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <i className={`fas ${icon} text-indigo-500 text-xs`} />
        </span>
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
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
  const activeDays = daysToRender.filter(day => scheduleObj[day]?.active);
  
  if (activeDays.length === 0) {
    return (
      <div className="flex items-center justify-center p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <span className="text-xs text-slate-400 font-medium">Currently unavailable</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {daysToRender.map((key) => {
        const slot = scheduleObj[key];
        if (!slot?.active) return null;

        return (
          <div
            key={key}
            className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-slate-100 bg-white text-xs shadow-sm shadow-slate-100/50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="font-bold text-slate-600 text-[11px] uppercase tracking-wide">{DAY_LABELS[key] || key}</span>
            </div>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0">
              {slot.start} – {slot.end}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default async function PublicDoctorProfilePage({ params }: { params: { id: string } }) {
  const doctor = await getDoctorById(params.id);

  if (!doctor) {
    notFound();
  }

  // The backend might return { doctor: {...} } or just the doctor object
  const d = doctor.doctor || doctor;

  const firstName = d.firstName ?? "";
  const lastName = d.lastName ?? "";
  const fullName = d.name || [firstName, lastName].filter(Boolean).join(" ");
  const initials = fullName.substring(0, 2).toUpperCase() || "DR";

  const specialty = d.specialty ?? "General Practitioner";
  const yearsOfExp = Number(d.yearsOfExperience ?? 0);
  const bio = d.bio ?? "";
  const expertiseTags: string[] = d.expertiseTags ?? [];
  const languages: string[] = d.languages ?? [];
  const qualifications: Qualification[] = d.qualifications ?? [];

  let avatarUrl = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256&h=256";
  if (d.avatarUrl) {
    if (d.avatarUrl.startsWith('http://') || d.avatarUrl.startsWith('https://')) {
        avatarUrl = d.avatarUrl;
    } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
        const cleanPath = d.avatarUrl.startsWith('/') ? d.avatarUrl : `/${d.avatarUrl}`;
        avatarUrl = `${baseUrl}${cleanPath}`;
    }
  }

  const videoEnabled = d.consultationSettings?.video?.enabled ?? false;
  const videoFee = Number(d.consultationSettings?.video?.fee ?? 0);
  const physicalEnabled = d.consultationSettings?.physical?.enabled ?? false;
  const physicalFee = Number(d.consultationSettings?.physical?.fee ?? 0);
  const clinicName = d.consultationSettings?.physical?.clinicName ?? "";
  const clinicAddress = d.consultationSettings?.physical?.clinicAddress ?? "";

  const workingHours: WorkingHours = d.workingHours ?? {
    mondayToFriday: { start: "09:00", end: "17:00", active: true },
    saturday: { start: "10:00", end: "14:00", active: false },
    sunday: { start: "00:00", end: "00:00", active: false },
  };

  return (
    <div className="min-h-screen bg-[#eef0f8] p-4 sm:p-6 lg:p-8 pt-[90px] lg:pt-[110px]">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Page Title Row ── */}
        <div className="flex items-start justify-between gap-4">
          <Link
            href="/find-doctor"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
          >
            <i className="fas fa-arrow-left text-xs" />
            Back to Search
          </Link>
          <Link
            href={`/find-doctor/book/${d._id || d.id}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            <i className="fas fa-calendar-check text-xs" />
            Book Appointment
          </Link>
        </div>

        {/* ── Hero Card Component ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Cover banner */}
          <div className="h-28 bg-gradient-to-r from-[#3535a8] via-[#4b4ecf] to-[#6366f1] relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dp" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.8" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dp)" />
            </svg>
          </div>

          {/* Avatar + name layout section */}
          <div className="relative z-10 px-5 sm:px-6 pb-5 -mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            
            {/* Main Avatar Frame */}
            <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-indigo-600 flex items-center justify-center shrink-0">
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 min-w-0 sm:pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-800 truncate capitalize">
                  {fullName.toLowerCase().includes('dr.') ? fullName : `Dr. ${fullName}`}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {specialty}
                  {yearsOfExp > 0 && (
                    <span className="text-slate-400"> · {yearsOfExp} yrs experience</span>
                  )}
                </p>
                {/* Rating */}
                <div className="flex items-center gap-1 mt-1 text-sm">
                    <span className="text-amber-400">★</span>
                    <span className="font-semibold text-slate-700">{d.rating ?? 5.0}</span>
                    <span className="text-slate-400">({d.reviewCount ?? 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-stats strip display wrapper layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/40">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <i className="fas fa-language text-indigo-500 text-xs" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Languages</p>
                <div className="text-xs font-semibold text-slate-700 truncate">{languages.length ? languages.join(", ") : "English"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <i className="fas fa-certificate text-emerald-500 text-xs" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verification</p>
                <div className="text-xs font-semibold text-emerald-700 truncate">Verified Doctor</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* ── Left / Main column ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio */}
            <Card title="Professional Biography" icon="fa-user-doctor">
              {bio ? (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{bio}</p>
              ) : (
                <p className="text-sm text-slate-300 italic">No biography added yet.</p>
              )}  
            </Card> 

            {/* Expertise Tags */}
            <Card title="Areas of Clinical Expertise" icon="fa-microscope">
              {expertiseTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {expertiseTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300 italic">General practice.</p>
              )}
            </Card>

            {/* Qualifications */}
            <Card title="Education & Qualifications" icon="fa-graduation-cap">
              {qualifications.length > 0 ? (
                <div className="space-y-3">
                  {qualifications.map((q) => (
                    <div
                      key={q.id || Math.random().toString()}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                          <i className="fas fa-certificate text-indigo-400 text-sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{q.degree}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{q.institution}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                          {q.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300 italic">Standard medical qualifications.</p>
              )}
            </Card>
          </div>

          {/* ── Right / Side column ── */}
          <div className="space-y-5">
            
            {/* Consultation Settings */}
            <Card title="Consultation Options" icon="fa-stethoscope">
              <div className="space-y-4">
                {/* Telehealth */}
                <div className={`p-4 rounded-xl border transition-all ${videoEnabled ? "border-indigo-200 bg-indigo-50/50" : "border-slate-100 bg-slate-50/60"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${videoEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                      <i className="fas fa-video" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">Online Consultation</p>
                    </div>
                    {videoEnabled && <p className="text-lg font-bold text-indigo-600">₹{videoFee}</p>}
                  </div>
                </div>

                {/* In-Person */}
                <div className={`p-4 rounded-xl border transition-all ${physicalEnabled ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100 bg-slate-50/60"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${physicalEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      <i className="fas fa-building-medical" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">Clinic Visit</p>
                    </div>
                    {physicalEnabled && <p className="text-lg font-bold text-emerald-600">₹{physicalFee}</p>}
                  </div>
                  {physicalEnabled && clinicName && (
                    <div className="mt-4 pt-3 border-t border-emerald-100 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinic</p>
                          <p className="text-sm font-semibold text-slate-700 mt-0.5">{clinicName}</p>
                          {clinicAddress && <p className="text-xs text-slate-400 mt-0.5">{clinicAddress}</p>}
                        </div>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/find-doctor/book/${d._id || d.id}`}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                <i className="fas fa-calendar-check text-xs" />
                Book Now
              </Link>
            </Card>

            {/* Availability Schedule */}
            <Card title="Availability Schedule" icon="fa-clock">
              <div className="space-y-6">
                {/* Online Schedule */}
                {(workingHours.online || (!workingHours.online && !workingHours.offline)) && (
                  <div>
                    {workingHours.online && (
                      <div className="flex items-center gap-2 mb-3">
                        <i className="fas fa-video text-indigo-400 text-xs" />
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Online (Video)</h4>
                      </div>
                    )}
                    {renderSchedule(workingHours.online || workingHours, !workingHours.online && !workingHours.offline)}
                  </div>
                )}

                {/* Offline Schedule */}
                {workingHours.offline && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <i className="fas fa-user-doctor text-indigo-400 text-xs" />
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offline (In-Person)</h4>
                    </div>
                    {clinicName && ( 
                      <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-xs font-bold text-slate-700 flex items-start gap-2">
                            <i className="fas fa-hospital text-indigo-400 mt-0.5"></i> 
                            <span>{clinicName}</span>
                        </p>
                        {clinicAddress && (
                            <p className="text-[10px] text-slate-500 mt-1.5 flex items-start gap-2 ml-0.5">
                                <i className="fas fa-location-dot text-indigo-400"></i> 
                                <span>{clinicAddress}</span>
                            </p>
                        )}
                      </div>
                    )}
                    {renderSchedule(workingHours.offline, false)}
                  </div>
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
