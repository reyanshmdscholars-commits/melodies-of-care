'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { supabase, hashPassword } from '@/lib/supabase'

const FORMSPREE_ID = 'xgonzkoe'

export default function SignupPage() {
  const router = useRouter()

  const [form, setForm] = useState({ name: '', email: '', instrument: '', password: '', confirm: '' })
  const [mediaConsent, setMediaConsent] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.name.trim())       return 'Please enter your full name.'
    if (!form.email.trim())      return 'Please enter your email address.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.'
    if (!form.instrument.trim()) return 'Please enter your primary instrument.'
    if (form.password.length < 6)         return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm)   return 'Passwords do not match.'
    return ''
  }

  const handleSignup = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('volunteers')
        .select('id')
        .eq('email', form.email.toLowerCase().trim())
        .limit(1)

      if (existing && existing.length > 0) {
        setError('That email was already used... try another one!')
        setLoading(false)
        return
      }

      const hash = await hashPassword(form.password)

      // Save to Supabase
      const { error: insertError } = await supabase.from('volunteers').insert({
        name:          form.name.trim(),
        email:         form.email.toLowerCase().trim(),
        password_hash: hash,
        instrument:    form.instrument.trim(),
        status:        'pending',
        hours:         0,
        media_consent: mediaConsent,
      })

      if (insertError) throw insertError

      // Also send to Formspree
      await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, instrument: form.instrument }),
      }).catch(() => {}) // non-blocking

      setDone(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ paddingTop: '5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="max-w-md mx-auto w-full px-6 py-16 text-center">
          <div className="glass-card p-10" style={{ background: 'rgba(178,216,216,0.1)', border: '1px solid rgba(178,216,216,0.3)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(178,216,216,0.3)', border: '1px solid rgba(178,216,216,0.5)' }}>
              <Check size={28} color="#2d6a6a" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>Application Submitted!</h2>
            <p style={{ color: 'rgba(26,54,93,0.6)', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '2rem' }}>
              Thanks for applying, <strong>{form.name.split(' ')[0]}</strong>! Your account is pending admin approval.
              Once approved, you can log in and start claiming volunteer events.
            </p>
            <Link href="/login" className="btn-coral px-8 py-3 text-sm" style={{ textDecoration: 'none' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const passwordsMatch = form.password && form.confirm && form.password === form.confirm
  const passwordsMismatch = form.password && form.confirm && form.password !== form.confirm

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="max-w-md mx-auto w-full px-6 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(178,216,216,0.12)', border: '1px solid rgba(178,216,216,0.3)', boxShadow: '0 4px 20px rgba(26,54,93,0.08)' }}>
            <Image src="/logo.png" alt="Melodies of Care" width={48} height={48} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Become a Volunteer
          </h1>
          <p style={{ color: 'rgba(26,54,93,0.55)', fontSize: '0.95rem' }}>
            Create your account to start signing up for events.
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="flex flex-col gap-4">

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>Full Name</label>
              <input className="glass-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} autoFocus />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>Email Address</label>
              <input className="glass-input" type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} />
            </div>

            {/* Instrument */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>Primary Instrument</label>
              <input className="glass-input" placeholder="e.g. Piano, Violin, Guitar" value={form.instrument} onChange={set('instrument')} />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>Password</label>
              <div className="relative">
                <input
                  className="glass-input pr-12"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(26,54,93,0.4)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>Confirm Password</label>
              <div className="relative">
                <input
                  className="glass-input pr-12"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()}
                  style={{
                    borderColor: passwordsMismatch ? 'rgba(240,147,91,0.6)' : passwordsMatch ? 'rgba(100,200,150,0.6)' : undefined,
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(26,54,93,0.4)' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordsMismatch && (
                <p style={{ color: '#c4622a', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p style={{ color: '#1a6a40', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> Passwords match
                </p>
              )}
            </div>

            {/* Media Consent */}
            <div
              onClick={() => setMediaConsent(p => !p)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.85rem 1rem', borderRadius: 12, cursor: 'pointer',
                background: mediaConsent ? 'rgba(100,200,150,0.08)' : 'rgba(26,54,93,0.03)',
                border: `1.5px solid ${mediaConsent ? 'rgba(100,200,150,0.4)' : 'rgba(26,54,93,0.1)'}`,
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                background: mediaConsent ? '#1a6a40' : 'white',
                border: `2px solid ${mediaConsent ? '#1a6a40' : 'rgba(26,54,93,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
              }}>
                {mediaConsent && <Check size={11} color="white" strokeWidth={3} />}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(26,54,93,0.7)', lineHeight: 1.55, userSelect: 'none' }}>
                I consent to having my photo and video likeness used in Melodies of Care&apos;s
                promotional materials, social media, and event documentation. <span style={{ color: 'rgba(26,54,93,0.4)', fontSize: '0.75rem' }}>(Optional)</span>
              </p>
            </div>

            {error && (
              <p style={{ color: '#c4622a', fontSize: '0.82rem', background: 'rgba(240,147,91,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(240,147,91,0.2)' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="btn-coral w-full py-3 text-base"
              style={{ opacity: loading ? 0.7 : 1, marginTop: '0.25rem' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'rgba(26,54,93,0.5)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
