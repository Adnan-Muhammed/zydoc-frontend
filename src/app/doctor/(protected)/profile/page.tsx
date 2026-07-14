import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from "react";
import Link from "next/link";

// ─── Dummy Data Matching Your Exact Payload (With Certificates Added) ────────
const DUMMY_BACKEND_USER = {
  user: {
    _id: "6a4272fc82a9596ad2128adb",
    firstName: "Doc",
    lastName: "Cert",
    specialty: "Neurology",
    avatarUrl: "uploads/1782741643072-Lucid_Origin_I_want_a_professionallooking_passpo…",
    medicalCertificateUrl: "uploads/1782741643113-Shahina AS CV.pdf",
    governmentIdUrl: "uploads/1782741643131-Shahina CV1.pdf",
    verificationStatus: "approved",
    expertiseTags: ["nervos system"],
    languages: ["English"],
    consultationSettings: {
      video: { enabled: true, fee: 349 },
      physical: { enabled: true, fee: 500, clinicName: "al arif", clinicAddress: "tvm" }
    },
    workingHours: {
      mondayToFriday: { start: "09:00", end: "17:00", active: true },
      saturday: { start: "10:00", end: "14:00", active: false },
      sunday: { start: "00:00", end: "00:00", active: true }
    },
    rating: 5,
    reviewCount: 0,
    qualifications: [
      {
        id: "1782741500337",
        degree: "MD Neurology",
        institution: "GMC Tvm",
        year: 2011,
        certificateUrl: "uploads/1782741643135-1782741500337___Adnan-Muhammed-CV.pdf",
        certificateStatus: "approved",
        rejectionReason: ""
      },
      {
        id: "1782741538798",
        degree: "MD Neuro surgeon",
        institution: "KIMS ",
        year: 2020,
        certificateUrl: "uploads/1782741643152-1782741538798___Invoice_2420289813.pdf",
        certificateStatus: "approved",
        rejectionReason: ""
      }
    ],
    createdAt: "2026-06-29T13:28:28.620+00:00",
    updatedAt: "2026-06-29T17:29:00.670+00:00",
    __v: 0,
    bio: "dfv efvr erfv erfv efrv erfv efv",
    licenseNumber: "TCMC/64219/2007",
    phone: "+919633743099",
    yearsOfExperience: 6,
    governmentIdStatus: "approved",
    medicalCertificateStatus: "approved",
    governmentIdRejectionReason: "",
    medicalCertificateRejectionReason: "",
    email: "doccert@gmail.com" // Example email
  },
};

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
  certificateUrl?: string; // Optional document attachment
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const cfg: Record<string, { label: string; dot: string; cls: string }> = {
    approved: {
      label: "Approved",
      dot: "bg-emerald-400",
      cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    pending: {
      label: "Pending Review",
      dot: "bg-amber-400",
      cls: "bg-amber-50 border-amber-200 text-amber-700",
    },
    rejected: {
      label: "Rejected",
      dot: "bg-red-400",
      cls: "bg-red-50    border-red-200    text-red-700",
    },
    incomplete: {
      label: "Incomplete",
      dot: "bg-slate-300",
      cls: "bg-slate-50  border-slate-200  text-slate-500",
    },
  };
  const c = cfg[status ?? "incomplete"] ?? cfg.incomplete;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
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
  const profileStatus: string = d.verificationStatus ?? "incomplete";

  const avatarUrl: string = d.avatarUrl 
    && !d.avatarUrl.includes("Lucid_Origin_I_want_a_professionallooking_passpo…") 
    ? d.avatarUrl 
    : "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256&h=256";

  const videoEnabled: boolean = d.consultationSettings?.video?.enabled ?? false;
  const videoFee: number = Number(d.consultationSettings?.video?.fee ?? 0);
  const physicalEnabled: boolean = d.consultationSettings?.physical?.enabled ?? false;
  const physicalFee: number = Number(d.consultationSettings?.physical?.fee ?? 0);
  const clinicName: string = d.consultationSettings?.physical?.clinicName ?? "";
  const clinicAddress: string = d.consultationSettings?.physical?.clinicAddress ?? "";

  const workingHours: WorkingHours = d.workingHours ?? {
    mondayToFriday: { start: "09:00", end: "17:00", active: false },
    saturday: { start: "10:00", end: "14:00", active: false },
    sunday: { start: "00:00", end: "00:00", active: false },
  };

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "DR";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-[#eef0f8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Page Title Row ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              View your professional information and practice details.
            </p>
          </div>
          <Link
            // href="/doctor/profile/edit2"
            href="/doctor/profile/edit2"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >  
            <i className="fas fa-pencil text-xs" />
            Edit Profile 
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
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold tracking-wide">{initials}</span>
              )}
            </div>

            {/* Profile Info Details (Perfect alignment shift away from header baseline) */}
            <div className="flex-1 min-w-0 sm:pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-800 truncate capitalize">
                  {fullName ? `Dr. ${fullName}` : "Dr. —"}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {specialty || "Specialty not set"}
                  {yearsOfExp > 0 && (
                    <span className="text-slate-400"> · {yearsOfExp} yrs experience</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{email}</p>
              </div>
              <div className="sm:mb-0.5 shrink-0">
                <StatusBadge status={profileStatus} />
              </div>
            </div>
          </div>

          {/* Quick-stats strip display wrapper layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/40">
            {[
              { label: "Phone", value: phone || "—", icon: "fa-phone" },
              { 
                label: "Reg. Number", 
                value: registrationDocUrl ? (
                  <a 
                    href={registrationDocUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    {licenseNumber} <i className="fas fa-arrow-up-right-from-square text-[10px]" />
                  </a>
                ) : licenseNumber || "—", 
                icon: "fa-id-card" 
              },
              { label: "Languages", value: languages.length ? languages.join(", ") : "—", icon: "fa-language" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <i className={`fas ${icon} text-indigo-500 text-xs`} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <div className="text-xs font-semibold text-slate-700 truncate">{value}</div>
                </div>
              </div>
            ))}
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
                <p className="text-sm text-slate-300 italic">No expertise tags added.</p>
              )}
            </Card>

            {/* Qualifications + Document Certificates Download Badges */}
            <Card title="Education & Qualifications" icon="fa-graduation-cap">
              {qualifications.length > 0 ? (
                <div className="space-y-3">
                  {qualifications.map((q) => (
                    <div
                      key={q.id}
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

                      {/* Certificate link attachments stack */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {q.certificateUrl && (
                          <a
                            href={q.certificateUrl.startsWith('http') ? q.certificateUrl : `${process.env.NEXT_PUBLIC_API_URL}${q.certificateUrl.startsWith('/') ? '' : '/'}${q.certificateUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <i className="fas fa-file-pdf" />
                            View Certificate
                          </a>
                        )}
                        <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                          {q.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300 italic">No qualifications added.</p>
              )}
            </Card>

            {/* Consultation Settings */}
            <Card title="Consultation Settings" icon="fa-stethoscope">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Telehealth */}
                <div
                  className={`p-4 rounded-xl border transition-all ${videoEnabled ? "border-indigo-200 bg-indigo-50/50" : "border-slate-100 bg-slate-50/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${videoEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      <i className="fas fa-video" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">Telehealth</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${videoEnabled ? "text-indigo-400" : "text-slate-400"}`}>
                        {videoEnabled ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${videoEnabled ? "bg-emerald-400" : "bg-slate-300"}`} />
                  </div>
                  {videoEnabled && (
                    <div className="mt-4 pt-3 border-t border-indigo-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consultation Fee</p>
                      <p className="text-2xl font-bold text-indigo-600 mt-0.5">₹{videoFee.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* In-Person */}
                <div
                  className={`p-4 rounded-xl border transition-all ${physicalEnabled ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100 bg-slate-50/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${physicalEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                    >
                      <i className="fas fa-building-medical" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">In-Person</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${physicalEnabled ? "text-emerald-500" : "text-slate-400"}`}>
                        {physicalEnabled ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${physicalEnabled ? "bg-emerald-400" : "bg-slate-300"}`} />
                  </div>
                  {physicalEnabled ? (
                    <div className="mt-4 pt-3 border-t border-emerald-100 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consultation Fee</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-0.5">₹{physicalFee.toLocaleString()}</p>
                      </div>
                      {clinicName && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Clinic</p>
                          <p className="text-sm font-semibold text-slate-700 mt-0.5">{clinicName}</p>
                          {clinicAddress && <p className="text-xs text-slate-400 mt-0.5">{clinicAddress}</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 italic">In-person consultations are turned off.</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* ── Right / Side column ── */}
          <div className="space-y-5">
            
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

            {/* Status Notices */}
            {profileStatus === "pending" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 leading-relaxed">
                <i className="fas fa-hourglass-half text-amber-400 mt-0.5 shrink-0" />
                <span>Your profile is under admin review. You'll get full access once approved.</span>
              </div>
            )}
            {profileStatus === "incomplete" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 leading-relaxed">
                <i className="fas fa-hourglass-half text-amber-400 mt-0.5 shrink-0" />
                <span>Complete your profile to submit it for admin approval.</span>
              </div>
            )}
            {profileStatus === "rejected" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
                <i className="fas fa-circle-xmark text-red-400 mt-0.5 shrink-0" />
                <span>Your profile was not approved. Edit your details and resubmit.</span>
              </div>
            )}
            {profileStatus === "approved" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 leading-relaxed">
                <i className="fas fa-circle-check text-emerald-400 mt-0.5 shrink-0" />
                <span>Your profile is verified and visible to patients.</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}