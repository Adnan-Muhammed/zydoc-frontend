'use client'

import Link from 'next/link'
import { Stethoscope, HeartPulse, ShieldCheck, MessageCircle } from 'lucide-react'

const specialists = [
  {
    title: 'Allopathy',
    sub: 'General Physicians, Pediatrics',
    icon: Stethoscope,
    color: 'bg-[#ebeaff] text-[#3b36a1]',
    query: 'Allopathy',
  },
  {
    title: 'Ayurveda',
    sub: 'Natural healing',
    icon: HeartPulse,
    color: 'bg-[#dcf7e9] text-[#2a9964]',
    query: 'Ayurveda',
  },
  {
    title: 'Homeopathy',
    sub: 'Gentle care',
    icon: ShieldCheck,
    color: 'bg-[#e4f7ef] text-[#2a9964]',
    query: 'Homeopathy',
  },
  {
    title: 'Dentistry',
    sub: 'Oral health',
    icon: HeartPulse,
    color: 'bg-[#e3f3ff] text-[#287bb7]',
    query: 'Dentistry',
  },
  {
    title: 'Psychology',
    sub: 'Mental wellness · Therapy',
    icon: MessageCircle,
    color: 'bg-[#eeeafe] text-[#5045a5]',
    query: 'Psychology',
  },
]

export default function Specialists() {
  return (
    <section id="specialists" className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
      <div className="absolute left-1/2 top-16 size-64 -translate-x-1/2 rounded-full bg-[#b8d4ff]/40 blur-[75px]" />
      <h2 className="relative text-center text-3xl font-bold tracking-[-0.04em] text-[#101044] sm:text-4xl">
        Consult with our diverse specialists
      </h2>

      <div className="relative mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-4">
        {specialists.map(({ title, sub, icon: Icon, color, query }) => (
          <Link
            key={title}
            href={`/find-doctor?specialty=${encodeURIComponent(query)}`}
            className="group w-full rounded-2xl border border-white bg-white/75 p-5 shadow-[0_12px_25px_rgba(29,40,93,0.1)] transition hover:-translate-y-1 hover:shadow-lg sm:w-[calc(33.333%-12px)]"
          >
            <div className={`mb-5 flex size-10 items-center justify-center rounded-full ${color}`}>
              <Icon className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-[#101044] transition group-hover:text-[#33338c]">{title}</h3>
            <p className="mt-1 text-sm text-[#73738e]">{sub}</p>
            <div className="mt-5 border-t border-[#e7e7ef] pt-3 text-xs font-semibold text-[#292957]">
              Online &amp; In-clinic Available
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
