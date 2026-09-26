'use client'

import Link from 'next/link'

const hospitalImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_1wa7c11wa7c11wa7-I4nhiMepm1H7cYFZG24uNbGhLlI114.png'

export default function Hero() {
  return (
    <section id="search" className="relative isolate overflow-hidden bg-[#f8faff] md:min-h-[680px] lg:min-h-[720px]">
      <img
        src={hospitalImage}
        alt="Doctor consulting with a young patient in a bright hospital"
        className="absolute inset-0 -z-20 hidden size-full object-cover object-[64%_center] md:block"
      />
      <div className="absolute inset-y-0 left-0 -z-10 hidden w-full bg-gradient-to-r from-[#f4f8ff]/[.98] via-[#f4f8ff]/[.88] to-transparent lg:w-[63%] md:block" />
      <div className="absolute inset-y-0 left-0 -z-10 hidden w-[58%] backdrop-blur-[10px] [mask-image:linear-gradient(to_right,black_0%,black_72%,transparent_100%)] md:block" />

      <div className="relative mx-auto flex max-w-7xl flex-col px-5 pb-10 pt-10 sm:px-8 md:min-h-[680px] md:justify-center md:pb-28 md:pt-10 lg:min-h-[720px] lg:px-10 lg:pb-36">
        <div className="max-w-xl text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-2 text-[11px] font-medium text-[#34345d] shadow-sm backdrop-blur-md">
            <span className="size-2 rounded-full bg-[#36bb76]" /> Live <strong>42 Doctors</strong> Online Now
          </div>
          <h1 className="text-[clamp(2.7rem,5vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.06em] text-[#101044]">
            Quality healthcare
            <br />
            online or at the clinic,
            <br />
            <span className="text-[#33338c]">whenever you need it.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-6 text-[#505174]">
            Consult with top-tier specialists via video call or book an in-person clinic visit. Get prescriptions, expert
            care, and more.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/find-doctor"
              className="rounded-full bg-[#191954] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#302f87]"
            >
              Find a Doctor
            </Link>
            <a
              href="#how"
              className="rounded-full border border-white/80 bg-white/55 px-6 py-3 text-sm font-semibold text-[#191954] backdrop-blur-md transition hover:bg-white/80"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[20px] md:hidden">
          <img
            src={hospitalImage}
            alt="Doctor consulting with a young patient in a bright hospital"
            className="h-[360px] w-full object-cover object-right"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-3 text-xs font-semibold text-[#17174e] shadow-lg backdrop-blur-sm">
            <span className="text-amber-500">★</span> 4.9/5{' '}
            <span className="font-normal text-[#686880]">Verified Patient Reviews (12,000+)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
