'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react'

export interface User {
  role?: string
  name?: string
}

interface NavbarProps {
  user?: User | null
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.04em] text-[#181952]">
      <span className="relative inline-flex size-6 items-center justify-center">
        <span className="absolute h-2.5 w-5 -rotate-45 rounded-full bg-[#32b899]" />
        <span className="absolute h-2.5 w-5 translate-y-2 rotate-45 rounded-full bg-[#313a9d]" />
      </span>
      Zydoc
    </Link>
  )
}

export default function Navbar({ user: initialUser = null }: NavbarProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  useEffect(() => {
    // If no initial user, try to silently refresh session
    if (!initialUser) {
      fetch('/api/auth/refresh')
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            setUser(data.user)
          }
        })
        .catch(() => {})
    }
  }, [initialUser])

  // Close mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const dashboardLink = user?.role ? `/${user.role}/dashboard` : '/patient/dashboard'
  const isFindDoctor = pathname?.startsWith('/find-doctor')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7eaf5]/80 bg-[#f8faff]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#595979] md:flex">
          <Link
            href="/"
            className={`transition ${
              pathname === '/'
                ? 'font-bold text-[#181952]'
                : 'hover:text-[#181952]'
            }`}
          >
            Home
          </Link>
          <Link
            href="/find-doctor"
            className={`transition ${
              isFindDoctor
                ? 'rounded-full bg-[#e8edfc] px-3.5 py-1.5 font-bold text-[#1f267a]'
                : 'font-semibold text-[#2f3590] hover:text-[#181952]'
            }`}
          >
            Find Doctors
          </Link>
          <Link href="/#how" className="transition hover:text-[#181952]">
            How it works
          </Link>
          <Link href="/#features" className="transition hover:text-[#181952]">
            Features
          </Link>
          <Link href="/#faq" className="transition hover:text-[#181952]">
            FAQ
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <Link
              href={dashboardLink}
              className="inline-flex items-center gap-2 rounded-lg bg-[#14144e] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#252575]"
            >
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-xs font-semibold text-[#181952] transition hover:bg-[#eef2fc]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#14144e] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#252575]"
              >
                Join Now
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-[#181952] hover:bg-[#f0f3fa] md:hidden"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {menuOpen && (
          <nav className="absolute right-5 top-16 z-30 flex w-56 flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-sm shadow-xl md:hidden">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`py-1 ${
                pathname === '/'
                  ? 'font-bold text-[#181952]'
                  : 'font-medium text-[#595979] hover:text-[#181952]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/find-doctor"
              onClick={() => setMenuOpen(false)}
              className={`py-1 ${
                isFindDoctor
                  ? 'font-bold text-[#1f267a]'
                  : 'font-semibold text-[#2f3590] hover:text-[#181952]'
              }`}
            >
              Find Doctors
            </Link>
            <Link
              href="/#how"
              onClick={() => setMenuOpen(false)}
              className="py-1 font-medium text-[#595979] hover:text-[#181952]"
            >
              How it works
            </Link>
            <Link
              href="/#features"
              onClick={() => setMenuOpen(false)}
              className="py-1 font-medium text-[#595979] hover:text-[#181952]"
            >
              Features
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMenuOpen(false)}
              className="py-1 font-medium text-[#595979] hover:text-[#181952]"
            >
              FAQ
            </Link>
            <div className="mt-2 border-t border-gray-100 pt-3 flex flex-col gap-2">
              {user ? (
                <Link
                  href={dashboardLink}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#14144e] py-2.5 text-center text-xs font-semibold text-white"
                >
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-gray-200 py-2 text-center text-xs font-semibold text-[#181952]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-[#14144e] py-2 text-center text-xs font-semibold text-white"
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
