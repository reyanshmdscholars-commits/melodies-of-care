'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAdminAuth } from '@/lib/admin-auth'
import AdminGateDialog from './AdminGateDialog'

export default function Footer() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { isAdmin } = useAdminAuth()

  return (
    <footer
      className="relative mt-24"
      style={{
        background: 'linear-gradient(180deg, rgba(26,54,93,0.97) 0%, rgba(16,38,70,1) 100%)',
        backdropFilter: 'blur(32px)',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(240,147,91,0.5), rgba(178,216,216,0.4), transparent)' }} />

      {/* Floating decorative notes */}
      <span aria-hidden="true" style={{ position: 'absolute', top: '15%', left: '3%', fontSize: '4rem', color: 'rgba(255,255,255,0.03)', pointerEvents: 'none', userSelect: 'none', animation: 'floatNote1 20s ease-in-out infinite' }}>♬</span>
      <span aria-hidden="true" style={{ position: 'absolute', top: '40%', right: '4%', fontSize: '2.5rem', color: 'rgba(240,147,91,0.06)', pointerEvents: 'none', userSelect: 'none', animation: 'floatNote2 17s ease-in-out infinite 2s' }}>♪</span>
      <span aria-hidden="true" style={{ position: 'absolute', bottom: '20%', left: '45%', fontSize: '2rem', color: 'rgba(178,216,216,0.05)', pointerEvents: 'none', userSelect: 'none', animation: 'floatNote1 25s ease-in-out infinite 4s' }}>♫</span>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Image src="/logo.png" alt="Melodies of Care" width={36} height={36} />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-heading), Georgia, serif', lineHeight: 1.2 }}>
                  Melodies of Care
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Music Outreach
                </div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.75, maxWidth: 260 }}>
              Connecting generations through the universal language of music since 2026. Rooted in the Japanese concept of <em>ikigai</em>.
            </p>
            <div className="mt-5 flex gap-2 flex-wrap">
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                style={{ background: 'rgba(240,147,91,0.18)', color: 'var(--coral)', border: '1px solid rgba(240,147,91,0.28)', textDecoration: 'none', letterSpacing: '0.02em' }}
              >
                Volunteer
              </Link>
              <Link
                href="/partner"
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.14)', textDecoration: 'none', letterSpacing: '0.02em' }}
              >
                Partner With Us
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginBottom: '1.1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Navigation
            </h4>
            <div className="flex flex-col gap-2.5">
              {[['/', 'Home'], ['/about', 'About Us'], ['/team', 'Meet the Team'], ['/gallery', 'Gallery'], ['/events', 'Events'], ['/partner', 'Partner With Us']].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.88rem', textDecoration: 'none', transition: 'color 0.2s', display: 'block' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.88)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.48)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginBottom: '1.1rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Connect
            </h4>
            <div className="flex flex-col gap-2" style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.88rem', lineHeight: 1.8 }}>
              <span>hello@melodiesofcare.org</span>
              <span>(555) 123-4567</span>
            </div>
            <div className="mt-5 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.65 }}>
                Are you a senior care facility? We&apos;d love to bring live music to your residents.
              </p>
              <Link href="/partner" style={{ color: 'var(--coral)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}>
                Get in touch →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem' }}>
            © 2026 Melodies of Care. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1rem', color: 'rgba(240,147,91,0.4)' }}>♪</span>
            生き甲斐 — Bridging generations through music.
            <span style={{ fontSize: '0.85rem', color: 'rgba(178,216,216,0.35)' }}>♫</span>
          </p>
        </div>
      </div>

      {/* Hidden Admin Gate */}
      <div
        onClick={() => setDialogOpen(true)}
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: isAdmin ? 'rgba(240,147,91,0.6)' : 'transparent',
          cursor: 'pointer',
        }}
        title=""
      />

      <AdminGateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </footer>
  )
}
