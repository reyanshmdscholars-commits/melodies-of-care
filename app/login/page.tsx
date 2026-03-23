'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, Clock } from 'lucide-react'
import { supabase, hashPassword } from '@/lib/supabase'
import { useVolunteerAuth } from '@/lib/volunteer-auth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useVolunteerAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingName, setPendingName] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    setPendingName('')

    try {
      // Look up volunteer by email
      const { data: volunteers, error: dbError } = await supabase
        .from('volunteers')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .limit(1)

      if (dbError) throw dbError

      if (!volunteers || volunteers.length === 0) {
        setError('No account found with that email. Please sign up first.')
        setLoading(false)
        return
      }

      const vol = volunteers[0]

      // Compare password hash
      const hash = await hashPassword(password)
      if (hash !== vol.password_hash) {
        setError('Incorrect password. Please try again.')
        setLoading(false)
        return
      }

      // Check approval status
      if (vol.status === 'pending') {
        setPendingName(vol.name)
        setLoading(false)
        return
      }

      // Approved — log in
      login(vol)
      router.push('/events')
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
            Welcome back
          </h1>
          <p style={{ color: 'rgba(26,54,93,0.55)', fontSize: '0.95rem' }}>
            Log in to view and claim volunteer events.
          </p>
        </div>

        {/* Pending state */}
        {pendingName ? (
          <div className="glass-card p-8 text-center" style={{ background: 'rgba(255,200,100,0.08)', border: '1px solid rgba(255,200,100,0.3)' }}>
            <Clock size={36} color="#8a6200" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>
              Hi {pendingName} — you&apos;re almost in!
            </h3>
            <p style={{ color: 'rgba(26,54,93,0.6)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Your application is still pending admin approval. You&apos;ll receive access to the events calendar once an admin reviews your account.
            </p>
            <button onClick={() => setPendingName('')} className="btn-ghost px-6 py-2.5 text-sm mt-6">
              Try a different account
            </button>
          </div>
        ) : (
          <div className="glass-card p-8">
            <form onSubmit={e => { e.preventDefault(); handleLogin() }} className="flex flex-col gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  className="glass-input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    className="glass-input pr-12"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(26,54,93,0.4)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ color: '#c4622a', fontSize: '0.82rem', background: 'rgba(240,147,91,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(240,147,91,0.2)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-coral w-full py-3 text-base flex items-center justify-center gap-2"
                style={{ opacity: loading ? 0.7 : 1, marginTop: '0.25rem' }}
              >
                {loading ? 'Checking…' : <><LogIn size={16} /> Log In</>}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'rgba(26,54,93,0.5)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>
                Sign up as a volunteer
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
