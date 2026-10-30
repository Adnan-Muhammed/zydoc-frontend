'use client'

import React from 'react'
import Link from 'next/link'
import {
  Video,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react'

const features = [
  {
    icon: Video,
    tag: '< 15 Min Connect',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    title: 'Instant Video Consultations',
    description:
      'Connect with dedicated doctors from your comfort. Secure HD video calls with no travel required and zero crowded waiting rooms.',
    bulletPoints: ['HD Video & Clear Audio', 'No App Download Required', 'End-to-End Encrypted'],
    accentColor: 'from-indigo-500/10 to-blue-500/5',
    iconBg: 'bg-indigo-600 text-white shadow-indigo-200',
  },
  {
    icon: ShieldCheck,
    tag: '100% Verified',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    title: 'Board-Certified Specialists',
    description:
      'Every doctor on Zydocare Health is personally vetted with medical council license verification across Allopathy, Ayurveda, and other key disciplines.',
    bulletPoints: ['Medical Council Verified', '1-on-1 Dedicated Attention', 'Multi-Specialty Expertise'],
    accentColor: 'from-emerald-500/10 to-teal-500/5',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-200',
  },
  {
    icon: FileText,
    tag: '100% Paperless',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200/60',
    title: 'Instant Digital Prescriptions',
    description:
      'Receive legally recognized digital prescriptions and personalized doctor notes right after your session, stored securely in your vault.',
    bulletPoints: ['Legally Valid Digital Rx', 'Permanent Cloud Storage', 'Easy One-Click Download'],
    accentColor: 'from-blue-500/10 to-cyan-500/5',
    iconBg: 'bg-blue-600 text-white shadow-blue-200',
  },
  {
    icon: Clock,
    tag: 'Zero Queue Delay',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200/60',
    title: 'Smart Clinic & Flexible Slots',
    description:
      'Book in-person clinic visits with live queue tokens so you can walk straight into the consultation room without long waiting delays.',
    bulletPoints: ['Live Queue Token Tracking', 'Flexible Rescheduling', 'Dedicated Support'],
    accentColor: 'from-purple-500/10 to-pink-500/5',
    iconBg: 'bg-purple-600 text-white shadow-purple-200',
  },
]

const trustMetrics = [
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Verified Doctors & Credentials',
    color: 'text-emerald-600',
  },
  {
    icon: Clock,
    value: '0 Min',
    label: 'Wasted Waiting Room Time',
    color: 'text-indigo-600',
  },
  {
    icon: Lock,
    value: '256-bit',
    label: 'Encrypted & Confidential',
    color: 'text-blue-600',
  },
  {
    icon: FileText,
    value: 'Instant',
    label: 'Digital Rx & Medical Vault',
    color: 'text-purple-600',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f4ff]/80 via-[#f8faff] to-[#f8faff] py-16 sm:py-20 lg:py-24 border-y border-[#e7eaf5]">
      {/* Decorative background glow elements */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-200/30 to-blue-100/0 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-72 w-72 rounded-full bg-blue-100/30 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-semibold text-indigo-900 shadow-sm backdrop-blur-sm">
            <Sparkles className="size-3.5 text-indigo-600" />
            <span>The Zydocare Health Advantage</span>
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#101044] sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
            Personalized Healthcare, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
              Focused Entirely on You
            </span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-[#505174] sm:text-lg">
            No crowded waiting rooms, no rushed consultations. Connect directly with verified specialists online or schedule clinic visits with live queue tokens.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(24,25,82,0.06)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-100 hover:shadow-[0_20px_40px_rgba(24,25,82,0.12)]"
              >
                {/* Background soft gradient wash */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accentColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className="relative z-10">
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110 ${feature.iconBg}`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${feature.tagColor}`}
                    >
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-5 text-lg font-bold text-[#101044] transition-colors group-hover:text-indigo-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#64748b]">
                    {feature.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {feature.bulletPoints.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="flex items-center gap-2 text-xs font-medium text-[#3b3c61]"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subtle bottom indicator */}
                <div className="relative z-10 mt-6 pt-2">
                  <div className="h-1 w-0 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 group-hover:w-full" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Quality Guarantees / Value Metrics Strip */}
        <div className="mt-12 rounded-2xl border border-indigo-100/80 bg-white/95 p-6 shadow-[0_12px_32px_rgba(24,25,82,0.06)] backdrop-blur-sm sm:p-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-slate-100">
            {trustMetrics.map((stat, sIdx) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={sIdx}
                  className={`flex flex-col items-center text-center ${sIdx !== 0 ? 'sm:pl-6' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <StatIcon className={`size-4 ${stat.color}`} />
                    <span className="text-2xl font-extrabold tracking-tight text-[#101044] sm:text-3xl">
                      {stat.value}
                    </span>
                  </div>
                  <span className="mt-1 text-xs font-medium text-[#64748b] sm:text-sm">
                    {stat.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 text-xs text-[#505174]">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Verified practitioners adhering to medical ethics &amp; data privacy standards.
              </span>
            </div>
            <Link
              href="/find-doctor"
              className="inline-flex items-center gap-1.5 font-bold text-indigo-700 transition hover:text-indigo-900 hover:underline"
            >
              <span>Meet our verified doctors</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
