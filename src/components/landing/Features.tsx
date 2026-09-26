'use client'

import { Video, FileText, ShieldCheck, CalendarDays } from 'lucide-react'

const mobileVideoImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile_screen-videocall-FlJDu94r0mhBJ2sixXu5lIMKeHzSz4.png'

const features = [
  {
    icon: Video,
    title: 'Secure Video Calls',
    text: 'Private video calls with prescriptions and consulting summaries.',
  },
  {
    icon: FileText,
    title: 'Instant Digital Prescriptions',
    text: 'Get digital prescriptions and useful follow-up notes.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Doctors',
    text: 'Connect with trusted doctors, verified for quality care.',
  },
  {
    icon: CalendarDays,
    title: 'Easy Hospital/Clinic Slot Booking',
    text: 'Book a hospital or clinic appointment in just a few taps.',
  },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
      <h2 className="text-center text-3xl font-bold tracking-[-0.04em] text-[#101044] sm:text-4xl">
        Healthcare designed for your life
      </h2>

      <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.7fr_1fr]">
        <div className="mx-auto w-56">
          <img
            src={mobileVideoImage}
            alt="Mobile video consultation interface with a verified doctor"
            className="h-[430px] w-full object-contain drop-shadow-[0_20px_40px_rgba(31,45,101,0.24)]"
          />
        </div>

        <div className="flex flex-col gap-7">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e9e9ff] text-[#2d2d82]">
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#101044]">{title}</h3>
                <p className="mt-1 max-w-md text-sm leading-5 text-[#70708a]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
