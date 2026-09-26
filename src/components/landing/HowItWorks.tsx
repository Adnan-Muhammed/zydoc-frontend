'use client'

const searchDoctorsImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/card_2_image-nALL898pIn3wN6C0CMBYMPvnx6A0Q1.png'
const bookingImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/card_1_image-ZYmBWpZw4QgxYakr9SCEycDP1CmRMn.png'
const videoConsultationImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/card_3_image-I3ICWoElozMt2umxPEikMC80OgAF6m.jpeg'

const steps = [
  {
    number: '01',
    image: searchDoctorsImage,
    title: 'Search & Choose',
    text: 'Find a specialist that fits your needs, from trusted doctors across every field.',
  },
  {
    number: '02',
    image: bookingImage,
    title: 'Pick Your Slot',
    text: 'Choose a convenient time for a video consult or an in-person visit.',
  },
  {
    number: '03',
    image: videoConsultationImage,
    title: 'Get Expert Care',
    text: 'Meet your doctor, get clear answers, and take the next step with confidence.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
      <h2 className="text-center text-3xl font-bold tracking-[-0.04em] text-[#101044] sm:text-4xl">
        Simple, seamless care in 3 steps
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.number}
            className="relative overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,40,93,0.1)] transition-transform hover:-translate-y-1"
          >
            <div className="absolute left-4 top-[-22px] text-7xl font-bold text-[#b6c6fa] select-none">
              {step.number}
            </div>
            <img
              src={step.image}
              alt={step.title}
              className="h-44 w-full object-cover object-[70%_center]"
            />
            <div className="p-5 pt-4">
              <h3 className="text-lg font-bold text-[#101044]">{step.title}</h3>
              <p className="mt-2 text-sm leading-5 text-[#6f708a]">{step.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
