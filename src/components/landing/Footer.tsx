'use client'

import Link from 'next/link'
import { Logo } from './Navbar'

export default function Footer() {
  return (
    <footer className="mx-auto mt-10 flex max-w-6xl flex-col gap-10 border-t border-[#e2e5ef] px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-start md:justify-between">
      <div>
        <Logo />
        <p className="mt-4 text-sm text-[#6c6d84]">Online &amp; Offline healthcare</p>
        <p className="mt-6 text-xs text-[#9a9bb5]">
          © {new Date().getFullYear()} Zydoc Inc. All rights reserved.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-12 text-sm sm:gap-20">
        <div>
          <strong className="text-[#101044]">Contact</strong>
          <p className="mt-4 leading-7 text-[#6c6d84]">
            +123 455 7780
            <br />
            support@zydoc.com
            <br />
            info@zydoc.com
          </p>
        </div>

        <div>
          <strong className="text-[#101044]">Explore</strong>
          <ul className="mt-4 space-y-2 text-[#6c6d84]">
            <li>
              <Link href="/find-doctor" className="transition hover:text-[#101044]">
                Find Doctors
              </Link>
            </li>
            <li>
              <a href="#how" className="transition hover:text-[#101044]">
                How it Works
              </a>
            </li>
            <li>
              <a href="#specialists" className="transition hover:text-[#101044]">
                Specialists
              </a>
            </li>
            <li>
              <a href="#faq" className="transition hover:text-[#101044]">
                FAQ
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
