'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Check, Loader2, AlertCircle } from 'lucide-react'
import { supabase, hashPassword } from '@/lib/supabase'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get('token') ?? ''

  const [validating, setValidating]   = useState(true)
  const [tokenValid, setTokenValid]   = useState(false)
  const [volEmail, setVolEmail]       = useState('')

  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [done, setDone]               = useState(false)

  useEffect(() => {
    if (!token) { setValidating(false); return }
    // Validate token: exists, not used, not expired
    supabase
      .from('password_resets')
      .select('email, expires_at, used')
      .eq('token', token)
      .single()
      .then(({ data }) => {
        if (data && !data.used && new Date(data.expires_at) > new Date()) {
          setTokenValid(true)
          setVolEmail(data.email)
        }
        setValidating(false)
      })
  }, [token])

  const handleReset = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setSaving(true)
    setError('')

    try {
      const hash = await hashPassword(password)

      // Update the volunteer's password
      const { error: updateErr } = await supabase
        .from('volunteers')
        .update({ password_hash: hash })
        .eq('email', volEmail)

      if (updateErr) throw updateErr

      // Mark token as used
      await supabase.from('password_resets').update({ used: true }).eq('token', token)

      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const passwordsMatch    = password && confirm && password === confirm
  const passwordsMismatch = password && confirm && password !== confirm

  // ── Loading ──
  if (validating) {
    return (
      <div className="glass-card p-12 text-center">
        <Loader2 size={28} color="var(--coral)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <p style={{ color: 'rgba(26,54,93,0.5)', marginTop: '1rem', fontSize: '0.9rem' }}>Validating your link…</p>
      </div>
    )
  }

  // ── Invalid / expired token ──
  if (!token || !tokenValid) {
    return (
      <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(220,60,60,0.2)' }}>
        <AlertCircle size={36} color="#c03030" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Link Invalid or Expired</h3>
        <p style={{ color: 'rgba(26,54,93,0.6)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.75rem' }}>
          This reset link has already been used or has expired (links are valid for 1 hour).
          Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn-coral px-7 py-2.5 text-sm" style={{ textDecoration: 'none' }}>
          Request New Link
        </Link>
      </div>
    )
  }

  // ── Success ──
  if (done) {
    return (
      <div className="glass-card p-8 text-center" style={{ background: 'rgba(178,216,216,0.08)', border: '1px solid rgba(178,216,216,0.3)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(178,216,216,0.25)', border: '1px solid rgba(178,216,216,0.5)' }}>
          <Check size={28} color="#2d6a6a" />
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>Password Updated!</h3>
        <p style={{ color: 'rgba(26,54,93,0.6)', fontSize: '0.9rem', lineHeight: 1.75 }}>
          Your password has been changed. Redirecting you to login…
        </p>
      </div>
    )
  }

  // ── Reset form ──
  return (
    <div className="glass-card p-8">
      <div className="flex flex-col gap-4">
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
            New Password
          </label>
          <div className="relative">
            <input
              className="glass-input pr-12"
              type={showPw ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoFocus
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(26,54,93,0.4)' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
            Confirm New Password
          </label>
          <div className="relative">
            <input
              className="glass-input pr-12"
              type={showConfirm ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{ borderColor: passwordsMismatch ? 'rgba(240,147,91,0.6)' : passwordsMatch ? 'rgba(100,200,150,0.6)' : undefined }}
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

        {error && (
          <p style={{ color: '#c4622a', fontSize: '0.82rem', background: 'rgba(240,147,91,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(240,147,91,0.2)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleReset}
          disabled={saving}
          className="btn-coral w-full py-3 text-base flex items-center justify-center gap-2"
          style={{ opacity: saving ? 0.7 : 1, marginTop: '0.25rem' }}
        >
          {saving
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
            : <><Check size={16} /> Set New Password</>
          }
        </button>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="max-w-md mx-auto w-full px-6 py-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(178,216,216,0.12)', border: '1px solid rgba(178,216,216,0.3)', boxShadow: '0 4px 20px rgba(26,54,93,0.08)' }}>
            <Image src="/logo.png" alt="Melodies of Care" width={48} height={48} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Set New Password
          </h1>
          <p style={{ color: 'rgba(26,54,93,0.55)', fontSize: '0.95rem' }}>
            Choose a new password for your account.
          </p>
        </div>

        <Suspense fallback={
          <div className="glass-card p-12 text-center">
            <Loader2 size={28} color="var(--coral)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
