'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchPatientAppointments } from '@/redux/features/appointment/appointmentThunk';
import { fetchWalletDetails } from '@/redux/features/wallet/walletThunk';
import { fetchNotifications } from '@/redux/features/notification/notificationThunk';
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import {
  CalendarCheck,
  Search,
  Stethoscope,
  Wallet,
  Pill,
  Bell,
  ArrowRight,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type Props = {
  user: {
    name?: string;
    email?: string;
    role?: string;
    googleName?: string;
  } | null;
};


// Helper to calculate time ago
const timeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export default function DashboardClient({ user }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { appointments } = useSelector((state: RootState) => state.appointment);
  const { transactions } = useSelector((state: RootState) => state.wallet);
  const { notifications } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    dispatch(fetchPatientAppointments());
    dispatch(fetchWalletDetails());
    dispatch(fetchNotifications());
  }, [dispatch]);

  const firstName = user?.name?.split(' ')[0] || user?.googleName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Derived data
  const { upcomingApps, completedApps, totalSpent, uniqueDoctors, latestPrescriptions } = useMemo(() => {
    const getAppTimestamp = (app: any) => {
        if (app?.scheduledStartAt) {
            const t = new Date(app.scheduledStartAt).getTime();
            if (!isNaN(t)) return t;
        }
        const appDate = new Date(app?.appointmentDate);
        if (!app?.appointmentTime) return appDate.getTime();
        const [timePart, modifier] = app.appointmentTime.trim().split(/\s+/);
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate(), hours, minutes, 0).getTime();
    };

    const isUpcoming = (app: any) => {
        if (['cancelled', 'completed', 'no-show', 'cancelled_by_doctor', 'disputed', 'refunded', 'doctor_missed'].includes(app.status)) return false;
        const slotDurationMins = Number(app.doctorId?.slotDuration) || 15;
        const exactAppEndTime = (app.scheduledEndAt 
            ? new Date(app.scheduledEndAt).getTime() 
            : getAppTimestamp(app) + slotDurationMins * 60 * 1000) + 10 * 60 * 1000;
        return Date.now() <= exactAppEndTime;
    };

    const apps = appointments || [];
    const upcoming = apps.filter(isUpcoming).sort((a,b) => getAppTimestamp(a) - getAppTimestamp(b));
    const completed = apps.filter((app: any) => app.status === 'completed').sort((a,b) => getAppTimestamp(b) - getAppTimestamp(a));
    
    // Total spent (sum up all DEBITs)
    const spent = (transactions || []).filter((t: any) => t.type === 'DEBIT').reduce((acc: number, t: any) => acc + t.amount, 0);
    
    const docSet = new Set(apps.map((app: any) => app.doctorId?._id).filter(Boolean));
    
    const prescriptions = apps
      .filter((app: any) => app.prescriptions && app.prescriptions.length > 0)
      .sort((a,b) => getAppTimestamp(b) - getAppTimestamp(a))
      .slice(0, 2);

    return {
      upcomingApps: upcoming,
      completedApps: completed,
      totalSpent: spent,
      uniqueDoctors: docSet.size,
      latestPrescriptions: prescriptions
    };
  }, [appointments, transactions]);

  const upcomingCount = upcomingApps.length;
  const topUpcoming = upcomingApps[0];
  const recentApp = completedApps[0];
  const recentNotifs = (notifications || []).slice(0, 3);

  const handleDownloadPrescription = (app: any) => {
    if (!app) return;
    const doctor = app.doctorId || {};
    const doctorName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Dr. Consultant';
    const patientName = user?.name || user?.googleName || user?.email || 'Patient';

    generatePrescriptionPdf({
        appointmentId: app._id,
        date: new Date(app.appointmentDate).toDateString(),
        time: app.appointmentTime,
        consultationType:
            app.consultationType === 'offline' || app.consultationType === 'physical'
                ? 'In-Person Consultation'
                : 'Online Video Consultation',
        patient: { name: patientName },
        doctor: {
            name: doctorName,
            specialty: doctor.specialty || 'General Practice',
            qualifications: doctor.qualifications,
            clinicName:
                doctor.consultationSettings?.offline?.clinicName ||
                doctor.consultationSettings?.physical?.clinicName,
        },
        prescriptions: app.prescriptions || [],
        clinicalAdvice: 'Take medications strictly as directed. If symptoms persist or adverse reactions occur, contact your doctor immediately.',
    });
  };

  return (
    <div className="pat-page space-y-6">

      {/* Hero Banner */}
      <div className="pat-hero flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-white/70 mb-1 uppercase tracking-widest">{greeting}</p>
          <h2>{firstName} 👋</h2>
          <p className="mt-1">
            You have <strong>{upcomingCount} upcoming appointment{upcomingCount !== 1 ? 's' : ''}</strong> today.
          </p>
          <div className="pat-hero-actions">
            <Link href="/patient/find-doctor" className="pat-btn pat-btn-white pat-btn-sm">
              <Search size={14} /> Find a Doctor
            </Link>
            <Link
              href="/patient/appointments"
              className="pat-btn pat-btn-sm"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)' }}
            >
              <CalendarCheck size={14} /> View Bookings
            </Link>
          </div>
        </div>
        <div className="hidden sm:flex items-center justify-center w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex-shrink-0">
          <Stethoscope size={52} className="text-white/80" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="pat-stats-grid">
        <div className="pat-stat-card indigo">
          <div className="pat-stat-icon-wrap"><CalendarCheck size={20} /></div>
          <div className="pat-stat-value">{upcomingCount}</div>
          <div className="pat-stat-label">Upcoming</div>
        </div>
        <div className="pat-stat-card sky">
          <div className="pat-stat-icon-wrap"><CheckCircle2 size={20} /></div>
          <div className="pat-stat-value">{completedApps.length}</div>
          <div className="pat-stat-label">Total Visits</div>
        </div>
        <div className="pat-stat-card emerald">
          <div className="pat-stat-icon-wrap"><Stethoscope size={20} /></div>
          <div className="pat-stat-value">{uniqueDoctors}</div>
          <div className="pat-stat-label">Doctors</div>
        </div>
        <div className="pat-stat-card amber">
          <div className="pat-stat-icon-wrap"><Wallet size={20} /></div>
          <div className="pat-stat-value">₹{totalSpent}</div>
          <div className="pat-stat-label">Spent</div>
        </div>
      </div>


      {/* Main Content Grid */}
      <div className="pat-content-grid">

        {/* Left: Appointments */}
        <div className="space-y-5">

          {/* Upcoming Appointment */}
          <div className="pat-card">
            <div className="pat-card-header">
              <h2><CalendarCheck size={16} className="text-indigo-500" /> Upcoming Appointment</h2>
              <Link href="/patient/appointments" className="pat-btn pat-btn-ghost pat-btn-sm flex items-center gap-1">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="pat-card-body">
              {topUpcoming ? (
                <div className="pat-list-item">
                  <div className="pat-list-avatar">
                    {topUpcoming.doctorId?.avatarUrl ? (
                        <img 
                            src={topUpcoming.doctorId.avatarUrl.startsWith('http') 
                                ? topUpcoming.doctorId.avatarUrl 
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'}${topUpcoming.doctorId.avatarUrl.startsWith('/') ? '' : '/'}${topUpcoming.doctorId.avatarUrl}`
                            } 
                            alt="Doctor"
                            className="w-full h-full object-cover rounded-full"
                        /> 
                    ) : (
                        <Stethoscope size={22} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-sm text-slate-900">Dr. {topUpcoming.doctorId?.firstName} {topUpcoming.doctorId?.lastName}</p>
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5 capitalize">{topUpcoming.doctorId?.specialty || 'Consultant'}</p>
                      </div>
                      <span className="pat-badge pat-badge-scheduled whitespace-nowrap capitalize">{topUpcoming.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(topUpcoming.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {topUpcoming.appointmentTime}</span>
                      <span className="flex items-center gap-1.5 capitalize"><Video size={12} /> {topUpcoming.consultationType} Call</span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(topUpcoming.consultationType === 'online' || topUpcoming.consultationType === 'video') && (
                          <Link href={`/patient/consultation/${topUpcoming._id}`} className="pat-btn pat-btn-primary pat-btn-sm">
                            <Video size={13} /> {topUpcoming.patientJoinedAt ? 'Rejoin Call' : 'Join Now'}
                          </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No upcoming appointments.
                </div>
              )}
            </div>
          </div>

          {/* Recent Appointment */}
          <div className="pat-card">
            <div className="pat-card-header">
              <h2><Clock size={16} className="text-slate-400" /> Recent Appointment</h2>
              <Link href="/patient/appointments" className="pat-btn pat-btn-ghost pat-btn-sm flex items-center gap-1">
                View All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="pat-card-body">
              {recentApp ? (
                <div className="pat-list-item">
                  <div className="pat-list-avatar">
                    {recentApp.doctorId?.avatarUrl ? (
                        <img 
                            src={recentApp.doctorId.avatarUrl.startsWith('http') 
                                ? recentApp.doctorId.avatarUrl 
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'}${recentApp.doctorId.avatarUrl.startsWith('/') ? '' : '/'}${recentApp.doctorId.avatarUrl}`
                            } 
                            alt="Doctor"
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : ( 
                        <Stethoscope size={22} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-sm text-slate-900">Dr. {recentApp.doctorId?.firstName} {recentApp.doctorId?.lastName}</p>
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5 capitalize">{recentApp.doctorId?.specialty || 'Consultant'}</p>
                      </div>
                      <span className="pat-badge pat-badge-completed whitespace-nowrap capitalize">{recentApp.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(recentApp.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {recentApp.appointmentTime}</span>
                      <span className="flex items-center gap-1.5 capitalize"><Video size={12} /> {recentApp.consultationType} Call</span>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Link href="/patient/appointments" className="pat-btn pat-btn-outline pat-btn-sm">View Details</Link>
                      {recentApp.prescriptions && recentApp.prescriptions.length > 0 && (
                          <button onClick={() => handleDownloadPrescription(recentApp)} className="pat-btn pat-btn-outline pat-btn-sm flex items-center gap-1.5">
                            <Pill size={12} /> Prescription
                          </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No recent appointments.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right: Widgets */}
        <div className="space-y-5">

          {/* Prescriptions Widget */}
          <div className="pat-card">
            <div className="pat-card-header">
              <h2><Pill size={16} className="text-emerald-500" /> Prescriptions</h2>
              <Link href="/patient/prescriptions" className="pat-btn pat-btn-ghost pat-btn-sm flex items-center gap-1">
                All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="pat-card-body space-y-3">
              {latestPrescriptions.length > 0 ? (
                  latestPrescriptions.map((app: any, i) => {
                      const doctor = app.doctorId || {};
                      const doctorName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Dr. Consultant';
                      const date = new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const rxStr = app.prescriptions.slice(0,2).map((r: any) => `${r.medicine} ${r.dosage || ''}`).join(', ') + (app.prescriptions.length > 2 ? '...' : '');

                      return (
                          <div
                            key={app._id || i}
                            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200 transition-all"
                          >
                            <p className="text-xs text-slate-400 font-semibold font-mono mb-1">{date}</p>
                            <p className="text-sm font-bold text-slate-800">{doctorName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{rxStr}</p>
                            <button onClick={() => handleDownloadPrescription(app)} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 mt-2 flex items-center gap-1 transition-colors">
                              Download PDF <ArrowRight size={11} />
                            </button>
                          </div>
                      );
                  })
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No prescriptions found.
                </div>
              )}
            </div>
          </div>

          {/* Notifications Widget */}
          <div className="pat-card">
            <div className="pat-card-header">
              <h2><Bell size={16} className="text-amber-500" /> Notifications</h2>
              <Link href="/patient/notifications" className="pat-btn pat-btn-ghost pat-btn-sm flex items-center gap-1">
                All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="pat-card-body space-y-2">
              {recentNotifs.length > 0 ? (
                  recentNotifs.map((notif: any, i) => {
                      let color = 'indigo';
                      let Icon = Bell;
                      if (notif.type?.includes('appointment')) {
                          Icon = CalendarCheck;
                          color = 'indigo';
                      } else if (notif.type?.includes('prescription')) {
                          Icon = Pill;
                          color = 'emerald';
                      } else if (notif.type?.includes('payment') || notif.type?.includes('wallet')) {
                          Icon = AlertCircle;
                          color = 'amber';
                      }

                      return (
                          <div
                            key={notif._id || i}
                            className={`flex gap-3 p-3 rounded-xl border border-l-4 ${
                              color === 'indigo'  ? 'border-indigo-200 border-l-indigo-500 bg-indigo-50/50' :
                              color === 'emerald' ? 'border-emerald-200 border-l-emerald-500 bg-emerald-50/50' :
                                                          'border-amber-200 border-l-amber-500 bg-amber-50/50'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                color === 'indigo'  ? 'bg-indigo-100 text-indigo-600' :
                                color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                                            'bg-amber-100 text-amber-600'
                              }`}
                            >
                              <Icon size={13} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-semibold font-mono">{timeAgo(notif.createdAt)}</p>
                            </div>
                          </div>
                      );
                  })
              ) : (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No recent notifications.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}