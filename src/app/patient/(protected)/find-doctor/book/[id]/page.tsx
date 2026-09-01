import { getDoctorById } from "@/lib/doctors";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import Link from "next/link";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  if (!doctor) {
    notFound();
  }
 
  const d = doctor.doctor || doctor;
  
  return (
    <div className="min-h-screen bg-[#eef0f8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/patient/find-doctor/${id}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
          >
            <i className="fas fa-arrow-left text-xs" />
            Back to Profile
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Book an Appointment</h1>
            <p className="text-slate-500 mb-6">Complete the details below to schedule your consultation with Dr. {d.lastName || d.firstName}.</p>
            
            <BookingForm doctor={d} />
        </div>
      </div>
    </div>
  );
}