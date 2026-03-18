'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Music, Heart, Users, ArrowRight, UserPlus, LogIn } from 'lucide-react'

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

function StatCard({ icon, value, label, delay }: {
  icon: React.ReactNode; value: number; label: string; delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const count = useCountUp(value, 1600, visible)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="glass-card p-8 text-center"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `all 0.75s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms` }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(178,216,216,0.2)', border: '1px solid rgba(178,216,216,0.4)' }}>
        {icon}
      </div>
      <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-heading), Georgia, serif' }}>{count}</div>
      <p style={{ color: 'rgba(26,54,93,0.55)', marginTop: '0.6rem', fontSize: '0.9rem', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="diamond-grid music-notes-bg relative min-h-screen flex items-center" style={{ paddingTop: '5rem' }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '5%', right: '5%', width: '42%', height: '60%', background: 'radial-gradient(ellipse at top right, rgba(240,147,91,0.13) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '0', width: '38%', height: '50%', background: 'radial-gradient(ellipse at bottom left, rgba(178,216,216,0.22) 0%, transparent 68%)', pointerEvents: 'none' }} />
        {/* Scattered decorative notes */}
        <div style={{ position: 'absolute', top: '18%', left: '8%', fontSize: '2rem', color: 'rgba(178,216,216,0.35)', pointerEvents: 'none', animation: 'floatNote1 14s ease-in-out infinite', userSelect: 'none' }}>♩</div>
        <div style={{ position: 'absolute', top: '60%', left: '18%', fontSize: '1.4rem', color: 'rgba(240,147,91,0.25)', pointerEvents: 'none', animation: 'floatNote2 19s ease-in-out infinite', userSelect: 'none' }}>♫</div>
        <div style={{ position: 'absolute', top: '25%', right: '8%', fontSize: '1.8rem', color: 'rgba(26,54,93,0.07)', pointerEvents: 'none', animation: 'floatNote1 16s ease-in-out infinite 2s', userSelect: 'none' }}>♬</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: '1.2rem', color: 'rgba(178,216,216,0.3)', pointerEvents: 'none', animation: 'floatNote2 12s ease-in-out infinite 1s', userSelect: 'none' }}>♪</div>

        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
                style={{ background: 'rgba(240,147,91,0.1)', border: '1px solid rgba(240,147,91,0.22)', color: 'var(--coral)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                <Heart size={11} fill="currentColor" /> Intergenerational Outreach
              </div>
              <h1 style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.06, color: 'var(--navy)', letterSpacing: '-0.025em', marginBottom: '1.5rem' }}>
                Music That<br />
                Bridges{' '}
                <span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>Generations.</span>
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'rgba(26,54,93,0.62)', lineHeight: 1.8, maxWidth: '480px', marginBottom: '2.5rem' }}>
                We bring live musical performances to senior living communities — creating moments of connection, joy, and healing through the timeless power of music.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/events" className="btn-coral px-7 py-3.5 text-base" style={{ textDecoration: 'none' }}>
                  View Upcoming Events <ArrowRight size={16} />
                </Link>
                <Link href="/about" className="btn-ghost px-7 py-3.5 text-base" style={{ textDecoration: 'none' }}>
                  Our Story
                </Link>
              </div>
              {/* Trust bar */}
              <div className="flex items-center gap-6 mt-10 pt-8" style={{ borderTop: '1px solid rgba(26,54,93,0.07)' }}>
                {[['2', 'Concerts'], ['10', 'Volunteers'], ['2', 'Partner Homes']].map(([n, l]) => (
                  <div key={l} className="text-center">
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(26,54,93,0.45)', fontWeight: 500, marginTop: '2px' }}>{l}</div>
                  </div>
                ))}
                <div style={{ width: 1, height: 32, background: 'rgba(26,54,93,0.1)' }} />
                <p style={{ fontSize: '0.78rem', color: 'rgba(26,54,93,0.45)', fontStyle: 'italic', maxWidth: 160 }}>
                  Founded on the Japanese concept of <em>ikigai</em>
                </p>
              </div>
            </div>

            {/* Right: logo feature card */}
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Outer glow ring */}
                <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(178,216,216,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
                {/* Main card */}
                <div className="glass-card p-10 flex flex-col items-center text-center"
                  style={{ width: 320, background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.45)' }}>
                  <div className="w-36 h-36 rounded-3xl overflow-hidden flex items-center justify-center mb-5"
                    style={{ background: 'rgba(138,187,205,0.18)', border: '1.5px solid rgba(178,216,216,0.4)', boxShadow: '0 8px 32px rgba(26,54,93,0.1)' }}>
                    <Image src="/logo.png" alt="Melodies of Care" width={110} height={110} />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.5rem' }}>Melodies of Care</h3>
                  <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    Where music meets compassion — bringing joy to those who need it most.
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <span className="badge-open">Est. 2026</span>
                    <span className="badge-approved">Active</span>
                  </div>
                </div>
                {/* Floating notes */}
                <div className="glass-card px-4 py-3 absolute -top-4 -right-8 flex items-center gap-2"
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', borderRadius: '14px', boxShadow: '0 8px 24px rgba(26,54,93,0.1)' }}>
                  <Music size={14} color="var(--coral)" /> Live Performances
                </div>
                <div className="glass-card px-4 py-3 absolute -bottom-4 -left-8 flex items-center gap-2"
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', borderRadius: '14px', boxShadow: '0 8px 24px rgba(26,54,93,0.1)' }}>
                  <Heart size={14} color="var(--coral)" fill="currentColor" /> Meaningful Impact
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="section-label">Our Impact</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            <span className="note-float" style={{ color: 'rgba(178,216,216,0.6)', marginRight: '0.4rem', fontSize: '0.8em' }}>♪</span>
            Numbers That Tell Our Story
            <span className="note-float" style={{ color: 'rgba(240,147,91,0.45)', marginLeft: '0.4rem', fontSize: '0.65em', animationDelay: '0.5s' }}>♫</span>
          </h2>
          <div className="wave-divider mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Music size={24} color="#2d6a6a" />}  value={2}  label="Concerts Performed"      delay={0} />
          <StatCard icon={<Users size={24} color="#2d6a6a" />}  value={10} label="Active Volunteers"       delay={130} />
          <StatCard icon={<Heart size={24} color="#2d6a6a" />}  value={2}  label="Senior Homes Partnered"  delay={260} />
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10 pb-20">
        <div className="glass-card p-10 md:p-14 flex flex-col md:flex-row gap-14 items-center"
          style={{ background: 'linear-gradient(135deg, rgba(178,216,216,0.08) 0%, rgba(255,255,255,0.45) 100%)' }}>
          <div className="flex-1">
            <p className="section-label">Our Mission</p>
            <div className="wave-divider" />
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: '1.25rem', letterSpacing: '-0.015em' }}>
              Where music becomes medicine for the soul.
            </h2>
            <p style={{ color: 'rgba(26,54,93,0.62)', lineHeight: 1.85, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Melodies of Care was founded on the belief that music transcends age, memory, and circumstance. We train and deploy passionate musicians to visit senior living centers, memory care facilities, and hospice environments — bringing live performance that sparks joy, reduces isolation, and honors the richness of every life.
            </p>
            <Link href="/about" className="btn-coral px-6 py-2.5 text-sm" style={{ textDecoration: 'none' }}>
              Read Our Full Story <ArrowRight size={14} />
            </Link>
          </div>
          <div className="w-full md:w-60 h-60 rounded-3xl flex-shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(178,216,216,0.28) 0%, rgba(240,147,91,0.14) 100%)', border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 8px 32px rgba(26,54,93,0.08)' }}>
            <Image src="/logo.png" alt="" width={130} height={130} style={{ opacity: 0.85 }} />
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ──────────────────────────────────────────── */}
      <section id="volunteer" className="max-w-6xl mx-auto px-6 pb-28">
        <div className="glass-card p-10 md:p-16 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(26,54,93,0.03) 0%, rgba(240,147,91,0.07) 100%)', border: '1px solid rgba(240,147,91,0.15)' }}>
          <div className="w-20 h-20 rounded-3xl overflow-hidden flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(240,147,91,0.1)', border: '1.5px solid rgba(240,147,91,0.22)', boxShadow: '0 4px 20px rgba(240,147,91,0.2)' }}>
            <Image src="/logo.png" alt="" width={56} height={56} />
          </div>
          <p className="section-label">Join Us</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Become a Volunteer
          </h2>
          <p style={{ color: 'rgba(26,54,93,0.58)', fontSize: '0.98rem', maxWidth: '460px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            Create your free account, get approved by our team, and start signing up for performances at senior care facilities near you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="btn-coral px-8 py-3.5 text-base" style={{ textDecoration: 'none' }}>
              <UserPlus size={16} /> Create an Account
            </Link>
            <Link href="/login" className="btn-ghost px-8 py-3.5 text-base" style={{ textDecoration: 'none' }}>
              <LogIn size={16} /> Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
