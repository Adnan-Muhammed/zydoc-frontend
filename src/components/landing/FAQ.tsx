'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How do I find a doctor on Zydoc?',
    answer:
      'You can search doctors by specialty, experience, ratings, and availability. Use filters to narrow down your options and find the perfect specialist for your needs.',
  },
  {
    question: 'Is my medical information secure and private?',
    answer:
      'Yes, all your medical data is encrypted and stored securely. We comply with healthcare privacy standards to ensure your information remains confidential.',
  },
  {
    question: 'Can I switch between video consultations and in-person visits?',
    answer:
      'Absolutely. You can choose to start with a video consultation and later book an in-person clinic visit with the same doctor or switch anytime based on your preference.',
  },
  {
    question: 'How are prescriptions handled?',
    answer:
      'After your consultation, doctors provide digital prescriptions instantly. You can download, print, or share them directly with pharmacies.',
  },
  {
    question: 'What if I need follow-up consultations?',
    answer:
      'You can easily book follow-up appointments with your doctor. Many doctors offer continuity of care to track your progress and adjust treatment as needed.',
  },
  {
    question: 'What are the consultation fees?',
    answer:
      'Consultation fees vary by doctor and specialty. You can see the fees upfront before booking. We also offer transparent pricing with no hidden charges.',
  },
]

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section id="faq" className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="absolute left-1/2 top-12 size-72 -translate-x-1/2 rounded-full bg-[#cbdcff]/50 blur-[90px]" />
      <div className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4d54a4]">Need to know more?</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#101044] sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#70708a]">
            Everything you need to know about getting trusted care through Zydoc.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-[#e7e8f1] overflow-hidden rounded-3xl border border-white/80 bg-white/75 px-6 shadow-[0_16px_35px_rgba(29,40,93,0.08)] backdrop-blur-sm sm:px-8">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="py-1">
              <button
                type="button"
                aria-expanded={openFaq === index}
                onClick={() => toggleFaq(index)}
                className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-bold text-[#181852] sm:text-base"
              >
                <span>{faq.question}</span>
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full transition ${
                    openFaq === index ? 'bg-[#191954] text-white' : 'bg-[#eef0ff] text-[#3b3b8d]'
                  }`}
                >
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
              {openFaq === index && (
                <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-[#70708a]">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
