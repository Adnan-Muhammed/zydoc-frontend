// src/app/patient/(protected)/dashboard/DashBoardClient.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Search,
  Stethoscope,
  Wallet,
  Pill,
  FileHeart,
  Bell,
  ArrowRight,
  Clock,
  Video,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type Props = {
  user: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
};

const QUICK_ACTIONS = [
  { href: '/patient/find-doctor',   icon: Search,         label: 'Find Doctor',    color: 'indigo'  },
  { href: '/patient/appointments',  icon: CalendarCheck,  label: 'Appointments',   color: 'sky'     },
  { href: '/patient/prescriptions', icon: Pill,           label: 'Prescriptions',  color: 'emerald' },
  { href: '/patient/records',       icon: FileHeart,      label: 'Records',        color: 'rose'    },
  { href: '/patient/wallet',        icon: Wallet,         label: 'My Wallet',      color: 'amber'   },
  { href: '/patient/notifications', icon: Bell,           label: 'Notifications',  color: 'indigo'  },
];

const QA_COLORS: Record<string, string> = {
  indigo:  'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  sky:     'bg-sky-50 text-sky-600 hover:bg-sky-100',
  emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  rose:    'bg-rose-50 text-rose-600 hover:bg-rose-100',
  amber:   'bg-amber-50 text-amber-600 hover:bg-amber-100',
};

export default function DashboardClient({ user }: Props) {
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="pat-page space-y-6">

      {/* Hero Banner */}
      <div className="pat-hero flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-white/70 mb-1 uppercase tracking-widest">{greeting}</p>
          <h2>{firstName} 👋</h2>
          <p className="mt-1">You have <strong>1 upcoming appointment</strong> today.</p>
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
          <div className="pat-stat-value">1</div>
          <div className="pat-stat-label">Upcoming</div>
          <div className="pat-stat-change up"><TrendingDown size={12} /> Today</div>
        </div>
        <div className="pat-stat-card sky">
          <div className="pat-stat-icon-wrap"><CheckCircle2 size={20} /></div>
          <div className="pat-stat-value">8</div>
          <div className="pat-stat-label">Total Visits</div>
        </div>
        <div className="pat-stat-card emerald">
          <div className="pat-stat-icon-wrap"><Stethoscope size={20} /></div>
          <div className="pat-stat-value">5</div>
          <div className="pat-stat-label">Doctors</div>
        </div>
        <div className="pat-stat-card amber">
          <div className="pat-stat-icon-wrap"><Wallet size={20} /></div>
          <div className="pat-stat-value">₹290</div>
          <div className="pat-stat-label">Spent</div>
          <div className="pat-stat-change down">↓ 12% this month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pat-card">
        <div className="pat-card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="pat-card-body">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl transition-all duration-150 text-center group ${QA_COLORS[color]}`}
              >
                <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-150">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </Link>
            ))}
          </div>
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
              <div className="pat-list-item">
                <div className="pat-list-avatar">
                  <Stethoscope size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-bold text-sm text-slate-900">Dr. Sarah Johnson</p>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">General Practitioner</p>
                    </div>
                    <span className="pat-badge pat-badge-scheduled whitespace-nowrap">Scheduled</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> Mar 15, 2025 · 2:00 PM</span>
                    <span className="flex items-center gap-1.5"><Video size={12} /> Video Call</span>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button className="pat-btn pat-btn-primary pat-btn-sm"><Video size={13} /> Join Now</button>
                    <button className="pat-btn pat-btn-outline pat-btn-sm">Reschedule</button>
                    <button
                      className="pat-btn pat-btn-sm"
                      style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
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
              <div className="pat-list-item">
                <div className="pat-list-avatar">
                  <Stethoscope size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-bold text-sm text-slate-900">Dr. Michael Chen</p>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">Pediatrician</p>
                    </div>
                    <span className="pat-badge pat-badge-completed whitespace-nowrap">Completed</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> Mar 5, 2025 · 10:30 AM</span>
                    <span className="flex items-center gap-1.5"><Video size={12} /> Video Call</span>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button className="pat-btn pat-btn-outline pat-btn-sm">View Notes</button>
                    <Link href="/patient/prescriptions" className="pat-btn pat-btn-outline pat-btn-sm flex items-center gap-1.5">
                      <Pill size={12} /> Prescription
                    </Link>
                  </div>
                </div>
              </div>
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
              {[
                { date: 'Mar 5, 2025', doctor: 'Dr. Michael Chen',   med: 'Amoxicillin 500mg · 2× daily' },
                { date: 'Feb 28, 2025', doctor: 'Dr. Sarah Johnson', med: 'Vitamin D3 1000IU · Daily'     },
              ].map((rx, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200 transition-all"
                >
                  <p className="text-xs text-slate-400 font-semibold font-mono mb-1">{rx.date}</p>
                  <p className="text-sm font-bold text-slate-800">{rx.doctor}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rx.med}</p>
                  <button className="text-xs font-bold text-emerald-600 hover:text-emerald-800 mt-2 flex items-center gap-1 transition-colors">
                    Download PDF <ArrowRight size={11} />
                  </button>
                </div>
              ))}
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
              {[
                { title: 'Appointment Reminder', msg: 'Dr. Sarah Johnson in 2 hours', time: '2 min ago',  color: 'indigo',  icon: CalendarCheck },
                { title: 'Prescription Ready',   msg: 'Sent to your pharmacy',        time: '1 hr ago',   color: 'emerald', icon: Pill           },
                { title: 'Payment Confirmed',    msg: '₹50 received for consult',     time: '5 hrs ago',  color: 'amber',   icon: AlertCircle    },
              ].map((notif, i) => {
                const Icon = notif.icon;
                return (
                  <div
                    key={i}
                    className={`flex gap-3 p-3 rounded-xl border border-l-4 ${
                      notif.color === 'indigo'  ? 'border-indigo-200 border-l-indigo-500 bg-indigo-50/50' :
                      notif.color === 'emerald' ? 'border-emerald-200 border-l-emerald-500 bg-emerald-50/50' :
                                                  'border-amber-200 border-l-amber-500 bg-amber-50/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notif.color === 'indigo'  ? 'bg-indigo-100 text-indigo-600' :
                        notif.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-amber-100 text-amber-600'
                      }`}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.msg}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold font-mono">{notif.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}