import { getDoctorById } from "@/lib/doctors";
import { notFound } from "next/navigation";
import { deduceSystemOfMedicine, extractPrimaryQualifications } from "@/constants/systemsOfMedicine";
import BookingForm from "./BookingForm";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  ChevronRight, 
  Briefcase, 
  MapPin, 
  Stethoscope, 
  ExternalLink, 
  Lock, 
  Star, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Languages as LanguagesIcon,
  Video,
  Building2,
  CalendarCheck
} from "lucide-react";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  if (!doctor) { 
    notFound();
  }
 
  const d = doctor.doctor || doctor;

  const firstName = d.firstName || '';
  const lastName = d.lastName || '';
  const rawName = d.name || [firstName, lastName].filter(Boolean).join(' ');
  const doctorName = rawName.toLowerCase().includes('dr.') ? rawName : `Dr. ${rawName || 'Specialist'}`;

  const specialty = d.specialty || d.profileId?.specialization || d.specialization || 'General Physician';
  const qualifications = d.qualifications || [];
  const primaryDegree = extractPrimaryQualifications(qualifications);
  const system = d.systemOfMedicine || deduceSystemOfMedicine(qualifications);
  const yearsVal = d.yearsOfExperience ?? d.experience;
  const experience = yearsVal ? (typeof yearsVal === 'number' ? `${yearsVal}+ years experience` : String(yearsVal)) : null;
  
  const clinicName = d.consultationSettings?.offline?.clinicName || d.consultationSettings?.physical?.clinicName || '';
  const clinicAddress = d.consultationSettings?.offline?.clinicAddress || d.consultationSettings?.physical?.clinicAddress || d.clinicAddress || null;
  
  const isOnline = d.consultationSettings?.online?.enabled ?? d.consultationSettings?.video?.enabled ?? true;
  const isOffline = d.consultationSettings?.offline?.enabled ?? d.consultationSettings?.physical?.enabled ?? false;
  const onlineFee = d.consultationSettings?.online?.fee ?? d.consultationSettings?.video?.fee ?? 0;
  const offlineFee = d.consultationSettings?.offline?.fee ?? d.consultationSettings?.physical?.fee ?? 0;

  const rating = Number(d.averageRating || d.rating || 5.0);
  const reviewCount = Number(d.reviewCount || d.totalReviews || 0);
  const languages: string[] = Array.isArray(d.languages) && d.languages.length > 0 ? d.languages : [];
  
  const doctorImage = d.avatarUrl || d.profileImage || d.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&fit=crop";

  return (
    <div className="min-h-screen bg-[#f8faff] text-slate-800 pb-16">
      {/* ─── Top Trust Header Bar ─── */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/patient/find-doctor/${id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-[#101044] font-semibold text-xs transition shadow-2xs group"
              title="Return to physician profile"
            >
              <ArrowLeft className="size-3.5 text-slate-400 group-hover:text-[#101044] group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Doctor Profile</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/patient/find-doctor" className="hover:text-slate-600 transition">
                Find Doctors
              </Link>
              <ChevronRight className="size-3 text-slate-300" />
              <Link href={`/patient/find-doctor/${id}`} className="hover:text-slate-600 transition truncate max-w-[140px]">
                {doctorName}
              </Link>
              <ChevronRight className="size-3 text-slate-300" />
              <span className="text-[#101044] font-bold">Book Appointment</span>
            </nav>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
            <Lock className="size-3 text-emerald-600 shrink-0" />
            <span className="truncate">256-Bit Encrypted Booking</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6 sm:space-y-8">
        
        {/* ─── Executive Doctor Summary Hero Card ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101044] via-[#14144e] to-[#1c1c70] p-5 sm:p-7 text-white shadow-xl shadow-[#101044]/15 border border-slate-800/30">
          {/* Ambient Glows */}
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-16 size-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Doctor Avatar with Verified Ring */}
              <div className="relative size-20 sm:size-24 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 shadow-lg shrink-0">
                <img
                  src={doctorImage}
                  alt={doctorName}
                  className="size-full object-cover object-center"
                />
                <span className="absolute bottom-1.5 right-1.5 size-4 rounded-full bg-emerald-500 border-2 border-[#101044] shadow-xs" title="Verified & Active Physician" />
              </div>

              {/* Physician Dossier */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold tracking-wide">
                    <ShieldCheck className="size-3 text-emerald-400" />
                    Verified Physician
                  </span>
                  {system && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold">
                      {system}
                    </span>
                  )}
                  {rating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-[11px] font-bold">
                      <Star className="size-3 fill-amber-300 text-amber-300" />
                      {rating.toFixed(1)} {reviewCount > 0 ? `(${reviewCount})` : ''}
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white truncate">
                    {doctorName}
                    {primaryDegree && (
                      <span className="text-sm sm:text-base font-semibold text-slate-300 ml-2 font-normal">
                        · {primaryDegree}
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-emerald-300 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Stethoscope className="size-3.5 text-emerald-400 shrink-0" />
                    <span>{specialty}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-0.5">
                  {experience && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3.5 text-indigo-300 shrink-0" />
                      <span>{experience}</span>
                    </span>
                  )}
                  {languages.length > 0 && (
                    <span className="flex items-center gap-1">
                      <LanguagesIcon className="size-3.5 text-indigo-300 shrink-0" />
                      <span>{languages.slice(0, 3).join(", ")}</span>
                    </span>
                  )}
                  {(clinicAddress || clinicName) && (
                    <span className="flex items-center gap-1 truncate max-w-xs">
                      <MapPin className="size-3.5 text-indigo-300 shrink-0" />
                      <span className="truncate">{clinicName ? `${clinicName}, ` : ''}{clinicAddress || 'Clinic Visit'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Fee Snapshot & Full Profile Link */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                {isOnline && (
                  <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-right">
                    <span className="text-[10px] text-indigo-200 uppercase font-bold block">Video Call</span>
                    <span className="text-sm font-extrabold text-white">₹{onlineFee}</span>
                  </div>
                )}
                {isOffline && (
                  <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-right">
                    <span className="text-[10px] text-emerald-200 uppercase font-bold block">Clinic Visit</span>
                    <span className="text-sm font-extrabold text-white">₹{offlineFee}</span>
                  </div>
                )}
              </div>

              <Link
                href={`/patient/find-doctor/${id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-200 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/15"
              >
                <span>View Full Profile</span>
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Booking Steps Visual Stepper ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="flex items-center gap-2 sm:gap-3 text-left p-1.5 sm:p-2 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <span className="size-7 sm:size-8 rounded-lg bg-[#101044] text-white flex items-center justify-center text-xs sm:text-sm font-extrabold shrink-0 shadow-2xs">
                1
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#101044] truncate">Consultation & Date</p>
                <p className="text-[10px] sm:text-[11px] text-indigo-600 hidden sm:block">Select visit type</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-left p-1.5 sm:p-2 rounded-xl">
              <span className="size-7 sm:size-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs sm:text-sm font-extrabold shrink-0 border border-slate-200">
                2
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">Time Slot & Notes</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">Choose live time</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-left p-1.5 sm:p-2 rounded-xl">
              <span className="size-7 sm:size-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs sm:text-sm font-extrabold shrink-0 border border-slate-200">
                3
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">Confirm & Pay</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">Instant lock</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Booking Form Container ─── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-8 lg:p-10">
          <div className="mb-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#101044] flex items-center gap-2">
                <CalendarCheck className="size-5 text-indigo-600" />
                <span>Schedule Your Consultation</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose your consultation method, pick a date within the next 14 days, and select an active time slot.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 self-start sm:self-auto">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Slot Availability</span>
            </div>
          </div>
          
          <BookingForm doctor={d} />
        </div>

        {/* ─── Patient Trust & Guarantees Bar ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs flex items-start gap-3">
            <span className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-[#101044]">Verified Practice</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Licensed medical doctors with verified credentials.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs flex items-start gap-3">
            <span className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Clock className="size-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-[#101044]">Instant Reservation</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Slot is reserved in real time to avoid double booking.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs flex items-start gap-3">
            <span className="size-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 border border-violet-100">
              <CreditCard className="size-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-[#101044]">Flexible Payments</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Apply your wallet credits or pay securely via Razorpay.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-2xs flex items-start gap-3">
            <span className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-[#101044]">Easy Reschedule</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Modify your appointment time up to 2 hours in advance.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}