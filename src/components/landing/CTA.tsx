'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-[#181852] px-7 py-10 text-white sm:px-12">
        <div className="absolute right-0 top-0 size-72 rounded-full bg-[#4a4ba5]/40 blur-[80px]" />
        <div className="relative max-w-lg">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Your health journey
            <br />
            starts here.
          </h2>
          <p className="mt-4 text-sm leading-5 text-[#cbcbeb]">
            Take the first step towards better health. Book your video consultation or clinic appointment today.
          </p>
          <Link
            href="/find-doctor"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#181852] transition hover:bg-[#eef2fc]"
          >
            Book an Appointment <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
