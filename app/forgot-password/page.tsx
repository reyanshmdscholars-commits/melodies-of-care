'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, Check, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })
      if (!res.ok) throw new Error('Request failed')
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

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
            Forgot Password?
          </h1>
          <p style={{ color: 'rgba(26,54,93,0.55)', fontSize: '0.95rem', maxWidth: 320, margin: '0 auto' }}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {done ? (
          <div className="glass-card p-8 text-center" style={{ background: 'rgba(178,216,216,0.08)', border: '1px solid rgba(178,216,216,0.3)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(178,216,216,0.25)', border: '1px solid rgba(178,216,216,0.5)' }}>
              <Check size={28} color="#2d6a6a" />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>Check your inbox!</h3>
            <p style={{ color: 'rgba(26,54,93,0.6)', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '1.75rem' }}>
              If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly. The link expires in 1 hour.
            </p>
            <Link href="/login" className="btn-coral px-7 py-2.5 text-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="glass-card p-8">
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  <Mail size={12} style={{ display: 'inline', marginRight: 5 }} />Email Address
                </label>
                <input
                  className="glass-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
              </div>

              {error && (
                <p style={{ color: '#c4622a', fontSize: '0.82rem', background: 'rgba(240,147,91,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(240,147,91,0.2)' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-coral w-full py-3 text-base flex items-center justify-center gap-2"
                style={{ opacity: loading ? 0.7 : 1, marginTop: '0.25rem' }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                  : 'Send Reset Link'
                }
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem' }}>
              <Link href="/login" style={{ color: 'rgba(26,54,93,0.45)', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={12} /> Back to Login
              </Link>
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
