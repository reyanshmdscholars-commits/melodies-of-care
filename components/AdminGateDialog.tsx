'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import { Lock, Eye, EyeOff, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AdminGateDialog({ open, onClose }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, isAdmin, logout } = useAdminAuth()
  const router = useRouter()

  if (!open) return null

  const handleSubmit = () => {
    if (login(password)) {
      onClose()
      setPassword('')
      setError('')
      router.push('/admin')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,54,93,0.4)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass-card w-full max-w-sm p-8"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(32px)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(240,147,91,0.12)', border: '1px solid rgba(240,147,91,0.25)' }}
            >
              <Lock size={18} color="var(--coral)" />
            </div>
            <div>
              <h3 style={{ color: 'var(--navy)', fontWeight: 700, fontSize: '1rem' }}>Admin Access</h3>
              <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.8rem' }}>Authorized personnel only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: 'rgba(26,54,93,0.4)', background: 'rgba(26,54,93,0.06)' }}
          >
            <X size={16} />
          </button>
        </div>

        {isAdmin ? (
          <div>
            <p style={{ color: 'var(--navy)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              You are logged in as admin.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { router.push('/admin'); onClose() }}
                className="btn-coral flex-1 py-2.5 text-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="btn-ghost flex-1 py-2.5 text-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative mb-4">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter admin password"
                className="glass-input pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(26,54,93,0.4)' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p style={{ color: '#c4622a', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="btn-coral w-full py-2.5 text-sm"
            >
              Access Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
