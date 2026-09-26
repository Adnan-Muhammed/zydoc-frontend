'use client'

import Hero from '@/components/landing/Hero'
import DoctorSearchSection from '@/components/landing/DoctorSearchSection'
import HowItWorks from '@/components/landing/HowItWorks'
import Specialists from '@/components/landing/Specialists'
import Features from '@/components/landing/Features'
import Testimonials from '@/components/landing/Testimonials'
import FAQ from '@/components/landing/FAQ'
import CTA from '@/components/landing/CTA'

export default function LandingClient() {
  return (
    <div className="overflow-hidden bg-[#f8faff] text-[#10103d]">
      <Hero />
      <DoctorSearchSection />
      <HowItWorks />
      <Specialists />
      <Features />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  )
}

