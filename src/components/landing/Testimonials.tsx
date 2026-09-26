'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Doudа Garaa',
    text: 'Loved the care and the simple experience. I found exactly the right doctor for my family.',
    color: 'bg-[#d9eddc] text-[#215732]',
  },
  {
    name: 'Arann Kanba',
    text: 'The video consult was smooth and my prescription was ready right away. So convenient.',
    color: 'bg-[#f1e6c9] text-[#6d531a]',
  },
  {
    name: 'Anatar Zasarw',
    text: 'A welcoming, thoughtful service that made getting expert advice feel effortless.',
    color: 'bg-[#f4deda] text-[#712d22]',
  },
]

export default function Testimonials() {
  return (
    <section id="stories" className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
      <div className="absolute right-0 top-0 size-52 rounded-full bg-[#c3d3ff]/40 blur-[70px]" />
      <h2 className="relative text-center text-3xl font-bold tracking-[-0.04em] text-[#101044] sm:text-4xl">
        Loved by our patients
      </h2>

      <div className="relative mt-12 grid gap-4 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl bg-white p-5 shadow-[0_10px_25px_rgba(29,40,93,0.1)] transition hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${item.color}`}>
                {item.name.charAt(0)}
              </div>
              <strong className="text-sm text-[#101044]">{item.name}</strong>
            </div>
            <p className="mt-4 text-sm leading-5 text-[#666780]">{item.text}</p>
            <div className="mt-4 flex gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="size-3 fill-current" />
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 flex justify-center gap-2">
        <span className="size-2 rounded-full bg-[#232361]" />
        <span className="size-2 rounded-full bg-[#bcc2d7]" />
        <span className="size-2 rounded-full bg-[#bcc2d7]" />
      </div>
    </section>
  )
}
