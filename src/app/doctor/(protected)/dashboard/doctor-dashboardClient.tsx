

// src/app/doctor/(protected)/dashboard/doctor-dasboardClient.tsx

'use client';

import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import './doctor-dashboard.css';

export default function DoctorDashboardPage() {
const router = useRouter();
const { user , isLoading} = useAppSelector((state) => state.auth);
// const isPending = user?.isProfileCompleted && user?.verificationStatus === 'pending';
// const isPending = false // testing
// const isRejected = user?.isProfileCompleted && user?.verificationStatus === 'rejected';
// const isApproved = user?.isProfileCompleted && user?.verificationStatus === 'approved';
const isPending =
  user?.isProfileCompleted &&
  user?.verificationStatus === 'pending';

const isRejected =
  user?.isProfileCompleted &&
  user?.verificationStatus === 'rejected';

const isApproved =
  user?.isProfileCompleted &&
  user?.verificationStatus === 'approved';



// const isApproved = true; // testing

    useEffect(() => {
        if (user && !user.isProfileCompleted) {
            router.replace('/doctor/profile-update');
        }
    }, [user, router]);


    


    if (user && !user.isProfileCompleted) return null; // Prevent flash of dashboard






return (
  <div className="flex flex-col flex-1 bg-slate-50 p-6 overflow-y-auto">

    {/* Pending Banner */}
    {isPending && (
      <div className="mb-8 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-3xl text-amber-600">
            <i className="fas fa-shield-check"></i>
          </div>

          <div className="flex-1">

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-amber-900">
                Credentials Under Review
              </h2>

              <span className="rounded-full bg-amber-200 px-4 py-1 text-xs font-bold uppercase text-amber-800">
                Pending Approval
              </span>
            </div>

            <p className="mt-4 max-w-4xl leading-relaxed text-amber-800">
              Your medical council registration, identity proof,
              and verification documents are currently being
              reviewed by our compliance team.
            </p>

            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm text-amber-700">
                <span>Verification Progress</span>
                <span>Review In Progress</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-amber-200">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
              </div>

            </div>

            <div className="mt-5 flex items-center gap-2 text-sm text-amber-700">
              <i className="fas fa-clock"></i>
              <span>Estimated review time: 24–48 hours</span>
            </div>

          </div>
        </div>
      </div>
    )}

    {/* Rejected Banner */}
    {isRejected && (
      <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">

        <div className="flex gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
            <i className="fas fa-ban"></i>
          </div>

          <div>
            <h3 className="text-xl font-bold text-red-800">
              Application Rejected
            </h3>

            <p className="mt-2 text-red-700">
              Your application has been rejected by administration.
              Please contact support for more details.
            </p>
          </div>

        </div>
      </div>
    )}

    {isApproved ? (
      <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, Dr. {user?.name || 'Smith'}! 👋
          </h1>

          <p className="mt-1 text-slate-500">
            Here's what's happening with your practice today
          </p>
        </div>

        {/* Top Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Next Patient */}
          <div className="xl:col-span-2 rounded-3xl bg-gradient-to-r from-indigo-500 to-indigo-700 p-6 text-white shadow-lg">

            <div className="mb-5 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Up Next
            </div>

            <div className="flex items-center gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-indigo-600">
                SJ
              </div>

              <div>

                <h3 className="text-2xl font-semibold">
                  Sarah Johnson
                </h3>

                <p className="mt-1 text-indigo-100">
                  <i className="fas fa-clock mr-2"></i>
                  10:30 AM (In 15 mins)
                </p>

                <span className="mt-3 inline-block rounded-lg bg-white/20 px-3 py-1 text-sm">
                  Follow-up: Hypertension
                </span>

              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">

              <button className="rounded-xl bg-white px-5 py-2.5 font-semibold text-indigo-700 transition hover:bg-slate-100">
                Start Consultation
              </button>

              <button className="rounded-xl border border-white/40 px-5 py-2.5 transition hover:bg-white/10">
                View History
              </button>

            </div>
          </div>

          {/* Attention Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="text-lg font-bold text-slate-800">
              Needs Your Attention
            </h3>

            <div className="mt-5 space-y-4">

              <div className="flex items-center gap-3 rounded-2xl border-l-4 border-red-500 bg-slate-50 p-4">
                <i className="fas fa-file-medical-alt text-indigo-600"></i>
                <span className="text-slate-700">
                  3 Lab results to review
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <i className="fas fa-prescription text-indigo-600"></i>
                <span className="text-slate-700">
                  2 Refill requests
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <i className="fas fa-comment-dots text-indigo-600"></i>
                <span className="text-slate-700">
                  5 Unread messages
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl text-indigo-600">
              <i className="fas fa-users"></i>
            </div>

            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Total Patients
            </p>

            <h2 className="mt-2 text-4xl font-bold text-slate-800">
              342
            </h2>

            <p className="mt-2 text-sm text-emerald-600">
              <i className="fas fa-arrow-up mr-1"></i>
              +12 this month
            </p>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-2xl text-pink-600">
              <i className="fas fa-calendar-check"></i>
            </div>

            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Appointments
            </p>

            <h2 className="mt-2 text-4xl font-bold text-slate-800">
              28
            </h2>

            <p className="mt-2 text-sm text-emerald-600">
              <i className="fas fa-arrow-up mr-1"></i>
              +5 vs last month
            </p>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600">
              <i className="fas fa-dollar-sign"></i>
            </div>

            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Earnings
            </p>

            <h2 className="mt-2 text-4xl font-bold text-slate-800">
              $2,840
            </h2>

            <p className="mt-2 text-sm text-emerald-600">
              <i className="fas fa-arrow-up mr-1"></i>
              +$340 vs last month
            </p>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-2xl text-yellow-600">
              <i className="fas fa-star"></i>
            </div>

            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Your Rating
            </p>

            <h2 className="mt-2 text-4xl font-bold text-slate-800">
              4.8
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              125 reviews
            </p>

          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Appointments */}
          <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <h3 className="text-xl font-bold text-slate-800">
                Upcoming Appointments
              </h3>

              <Link
                href="#"
                className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-indigo-600 hover:bg-slate-100"
              >
                View All
              </Link>

            </div>

          </div>

          {/* Reviews */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="mb-6 text-xl font-bold text-slate-800">
              Recent Reviews
            </h3>

          </div>

        </div>
      </>
    ) : (

      <>
 <div className="flex-1 max-h-[220px] rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center">
 <div className="  mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl text-slate-400">
          <i className={isRejected ? "fas fa-ban" : "fas fa-hourglass-half"}></i>
        </div>

        <h2 className="text-2xl font-bold text-slate-800">
          {isRejected ? "Access Denied" : "Waiting Room"}
        </h2>

        <p className="mt-3 max-w-md leading-relaxed text-slate-500">
          {isRejected
            ? "Your profile has been rejected. You cannot access dashboard features."
            : "Your dashboard will unlock automatically once your verification is approved."}
        </p></div>


      
      </>
      
    )}

  </div>
);
}




