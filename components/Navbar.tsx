'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Lock } from 'lucide-react'
import { useVolunteerAuth } from '@/lib/volunteer-auth'
import AdminGateDialog from './AdminGateDialog'

const links = [
  { href: '/',            label: 'Home' },
  { href: '/about',       label: 'About Us' },
  { href: '/team',        label: 'Meet the Team' },
  { href: '/gallery',     label: 'Gallery' },
  { href: '/events',      label: 'Events' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/partner',     label: 'Partner With Us' },
  { href: '/contact',     label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const { volunteer, logout } = useVolunteerAuth()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => { logout(); router.push('/') }

  return (
    <nav
      className="glass-nav fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{ opacity: scrolled ? 1 : 0.97 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[68px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{ background: 'rgba(178,216,216,0.12)', border: '1px solid rgba(178,216,216,0.3)' }}>
            <Image src="/logo.png" alt="Melodies of Care" width={34} height={34} priority />
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="truncate" style={{ color: 'var(--navy)', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '-0.01em', fontFamily: 'var(--font-heading), Georgia, serif' }}>
              Melodies of Care
            </span>
            <span className="hidden sm:block" style={{ color: 'rgba(26,54,93,0.42)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>
              Music Outreach
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {links.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-2 rounded-full text-sm transition-all duration-200"
                style={{
                  color:      active ? 'var(--coral)'         : 'rgba(26,54,93,0.62)',
                  background: active ? 'rgba(240,147,91,0.1)' : 'transparent',
                  fontWeight: active ? 600                    : 450,
                  fontSize:   '0.875rem',
                }}
              >
                {label}
              </Link>
            )
          })}

          {volunteer ? (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200"
                style={{ background: 'rgba(178,216,216,0.18)', border: '1px solid rgba(178,216,216,0.38)', color: 'var(--navy)', textDecoration: 'none', fontWeight: 600 }}
              >
                <User size={13} color="var(--coral)" />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {volunteer.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(240,147,91,0.1)', color: 'var(--coral)', border: '1px solid rgba(240,147,91,0.22)' }}
              >
                <LogOut size={13} /> Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/login"  className="btn-ghost px-5 py-2 text-sm" style={{ textDecoration: 'none' }}>Log In</Link>
              <Link href="/signup" className="btn-coral px-5 py-2 text-sm" style={{ textDecoration: 'none' }}>Sign Up</Link>
              <button
                onClick={() => setAdminOpen(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{ background: 'rgba(26,54,93,0.07)', color: 'var(--navy)', border: '1px solid rgba(26,54,93,0.15)' }}
              >
                <Lock size={13} /> Admin Login
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-xl"
          style={{ color: 'var(--navy)', background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.5)' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AdminGateDialog open={adminOpen} onClose={() => setAdminOpen(false)} />

      {/* Mobile Menu */}
      {open && (
        <div
          className="lg:hidden px-6 pb-5 pt-2 flex flex-col gap-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.3)', background: 'rgba(248,250,252,0.96)', backdropFilter: 'blur(24px)' }}
        >
          {links.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{ color: active ? 'var(--coral)' : 'rgba(26,54,93,0.8)', background: active ? 'rgba(240,147,91,0.08)' : 'transparent' }}
              >
                {label}
              </Link>
            )
          })}
          {volunteer ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{ color: 'rgba(26,54,93,0.8)' }}
              >
                <User size={14} color="var(--coral)" /> My Profile
              </Link>
              <button
                onClick={() => { handleLogout(); setOpen(false) }}
                className="px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-2"
                style={{ color: 'var(--coral)' }}
              >
                <LogOut size={14} /> Log out ({volunteer.name.split(' ')[0]})
              </button>
            </>
          ) : (
            <>
              <Link href="/login"  onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium" style={{ color: 'rgba(26,54,93,0.8)' }}>Log In</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium" style={{ color: 'var(--coral)', fontWeight: 600 }}>Sign Up</Link>
              <button
                onClick={() => { setAdminOpen(true); setOpen(false) }}
                className="px-4 py-3 rounded-xl text-sm font-medium text-left flex items-center gap-2"
                style={{ color: 'var(--navy)' }}
              >
                <Lock size={14} /> Admin Login
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
