'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Music, Calendar, Clock, Check, Eye, EyeOff, Save, LogOut, X, Loader2, Award } from 'lucide-react'
import { supabase, hashPassword, type Event } from '@/lib/supabase'
import { useVolunteerAuth } from '@/lib/volunteer-auth'

export default function ProfilePage() {
  const router = useRouter()
  const { volunteer, login, logout } = useVolunteerAuth()

  const [claimedEvents, setClaimedEvents] = useState<Event[]>([])
  const [signupDetails, setSignupDetails] = useState<Record<string, { songs: number; hours_approved: boolean }>>({})
  const [loadingEvents, setLoadingEvents] = useState(true)

  // Edit instrument
  const [instrument, setInstrument] = useState('')
  const [savingInstrument, setSavingInstrument] = useState(false)
  const [instrumentSaved, setInstrumentSaved] = useState(false)

  // Certificate
  const [generatingCert, setGeneratingCert] = useState(false)

  const handleDownloadCertificate = async () => {
    if (!volunteer) return
    setGeneratingCert(true)
    try {
      const { generateCertificate } = await import('@/lib/generateCertificate')
      await generateCertificate(volunteer.name, volunteer.hours)
    } finally {
      setGeneratingCert(false)
    }
  }

  // Change password
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [pwError, setPwError]         = useState('')
  const [pwSuccess, setPwSuccess]     = useState(false)
  const [savingPw, setSavingPw]       = useState(false)

  useEffect(() => {
    if (!volunteer) { router.push('/login'); return }
    setInstrument(volunteer.instrument)
    fetchClaimedEvents()
    // Refresh volunteer data from DB so hours are always current (admin may have approved hours)
    supabase.from('volunteers').select('*').eq('id', volunteer.id).single().then(({ data }) => {
      if (data) login(data)
    })
  }, [])

  const fetchClaimedEvents = async () => {
    if (!volunteer) return
    setLoadingEvents(true)
    const { data: signups } = await supabase
      .from('event_signups')
      .select('event_id, songs, hours_approved')
      .eq('volunteer_id', volunteer.id)
    if (!signups || signups.length === 0) { setLoadingEvents(false); return }
    const ids = signups.map(s => s.event_id)
    const details: Record<string, { songs: number; hours_approved: boolean }> = {}
    for (const s of signups) details[s.event_id] = { songs: s.songs ?? 1, hours_approved: s.hours_approved ?? false }
    setSignupDetails(details)
    const { data: evs } = await supabase
      .from('events')
      .select('*')
      .in('id', ids)
      .order('date')
    setClaimedEvents(evs || [])
    setLoadingEvents(false)
  }

  const saveInstrument = async () => {
    if (!volunteer || !instrument.trim()) return
    setSavingInstrument(true)
    await supabase.from('volunteers').update({ instrument: instrument.trim() }).eq('id', volunteer.id)
    login({ ...volunteer, instrument: instrument.trim() })
    setInstrumentSaved(true)
    setTimeout(() => setInstrumentSaved(false), 2500)
    setSavingInstrument(false)
  }

  const changePassword = async () => {
    setPwError(''); setPwSuccess(false)
    if (!currentPw || !newPw || !confirmPw) { setPwError('Please fill in all password fields.'); return }
    if (newPw.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return }
    if (!volunteer) return
    setSavingPw(true)
    const currentHash = await hashPassword(currentPw)
    if (currentHash !== volunteer.password_hash) { setPwError('Current password is incorrect.'); setSavingPw(false); return }
    const newHash = await hashPassword(newPw)
    const { error } = await supabase.from('volunteers').update({ password_hash: newHash }).eq('id', volunteer.id)
    if (error) { setPwError('Something went wrong. Please try again.'); setSavingPw(false); return }
    login({ ...volunteer, password_hash: newHash })
    setPwSuccess(true)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setSavingPw(false)
  }

  const handleLogout = () => { logout(); router.push('/') }

  if (!volunteer) return null

  const upcoming = claimedEvents.filter(e => new Date(e.date) >= new Date())
  const past     = claimedEvents.filter(e => new Date(e.date) < new Date())

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-16 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '0.5rem' }}>Volunteer Portal</p>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>My Profile</h1>
          </div>
          <button onClick={handleLogout} className="btn-ghost px-5 py-2.5 text-sm flex items-center gap-2" style={{ color: '#c4622a' }}>
            <LogOut size={14} /> Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Identity card */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="glass-card p-7">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, var(--coral), #e8844a)', boxShadow: '0 4px 16px rgba(240,147,91,0.35)' }}>
                {volunteer.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '2px' }}>{volunteer.name}</h2>
              <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>{volunteer.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className={volunteer.status === 'approved' ? 'badge-approved' : 'badge-pending'}>{volunteer.status}</span>
                <span style={{ background: 'rgba(178,216,216,0.2)', border: '1px solid rgba(178,216,216,0.4)', borderRadius: '100px', padding: '2px 10px', fontSize: '0.75rem', color: '#2d6a6a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Music size={11} /> {volunteer.instrument || 'No instrument set'}
                </span>
              </div>
              <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                <div className="text-center">
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--coral)' }}>{claimedEvents.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.5)', fontWeight: 500 }}>Events claimed</div>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>{volunteer.hours}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.5)', fontWeight: 500 }}>Hours logged</div>
                </div>
              </div>
            </div>

            {/* Certificate */}
            <div className="glass-card p-6" style={{ background: 'linear-gradient(135deg, rgba(240,147,91,0.06) 0%, rgba(26,54,93,0.04) 100%)', border: '1px solid rgba(240,147,91,0.2)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={15} color="var(--coral)" /> Volunteer Certificate
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(26,54,93,0.5)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Download your official certificate reflecting your <strong style={{ color: 'var(--navy)' }}>{volunteer.hours} approved hours</strong>.
              </p>
              <button
                onClick={handleDownloadCertificate}
                disabled={generatingCert || volunteer.hours === 0}
                className="btn-coral w-full py-2 text-sm flex items-center justify-center gap-1.5"
                style={{ opacity: volunteer.hours === 0 ? 0.5 : 1 }}
              >
                {generatingCert
                  ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                  : <><Award size={13} /> Download Certificate</>
                }
              </button>
              {volunteer.hours === 0 && (
                <p style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.4)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Complete approved events to unlock your certificate.
                </p>
              )}
            </div>

            {/* Update instrument */}
            <div className="glass-card p-6">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Music size={15} color="var(--coral)" /> Primary Instrument
              </h3>
              <input className="glass-input mb-3" placeholder="e.g. Piano, Violin" value={instrument} onChange={e => { setInstrument(e.target.value); setInstrumentSaved(false) }} />
              <button onClick={saveInstrument} disabled={savingInstrument || instrument === volunteer.instrument}
                className="btn-coral w-full py-2 text-sm flex items-center justify-center gap-1.5"
                style={{ opacity: instrument === volunteer.instrument ? 0.5 : 1 }}>
                {savingInstrument ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : instrumentSaved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Instrument</>}
              </button>
            </div>
          </div>

          {/* Right: Events + password */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Upcoming claimed events */}
            <div className="glass-card p-6">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} color="var(--coral)" /> Upcoming Events
              </h3>
              {loadingEvents ? (
                <div className="flex items-center justify-center gap-2 py-6" style={{ color: 'rgba(26,54,93,0.4)' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /></div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar size={28} color="rgba(26,54,93,0.12)" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ color: 'rgba(26,54,93,0.4)', fontSize: '0.88rem' }}>No upcoming events claimed yet.</p>
                  <Link href="/events" style={{ color: 'var(--coral)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Browse events →</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcoming.map(e => (
                    <div key={e.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgba(178,216,216,0.1)', border: '1px solid rgba(178,216,216,0.25)' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{e.facility_name}</p>
                        <p style={{ fontSize: '0.76rem', color: 'rgba(26,54,93,0.5)' }}>{new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {e.time}</p>
                      </div>
                      <span className="badge-open" style={{ fontSize: '0.68rem', flexShrink: 0 }}>Upcoming</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past events */}
            {past.length > 0 && (
              <div className="glass-card p-6">
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="rgba(26,54,93,0.4)" /> Past Events
                </h3>
                <div className="flex flex-col gap-2">
                  {past.map(e => {
                    const detail = signupDetails[e.id]
                    const hrs = (detail?.songs ?? 1) + 2
                    const approved = detail?.hours_approved ?? false
                    return (
                      <div key={e.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgba(26,54,93,0.03)', border: '1px solid rgba(26,54,93,0.06)' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'rgba(26,54,93,0.6)' }}>{e.facility_name}</p>
                          <p style={{ fontSize: '0.74rem', color: 'rgba(26,54,93,0.4)' }}>
                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {detail && <> · {detail.songs} song{detail.songs !== 1 ? 's' : ''} · {hrs}h</>}
                          </p>
                        </div>
                        {approved
                          ? <span className="badge-approved" style={{ fontSize: '0.68rem' }}>✓ {hrs}h logged</span>
                          : <span className="badge-pending" style={{ fontSize: '0.68rem' }}>Hours pending</span>
                        }
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Change password */}
            <div className="glass-card p-6">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={15} color="var(--coral)" /> Change Password
              </h3>
              <div className="flex flex-col gap-3">
                {(['Current Password', 'New Password', 'Confirm New Password'] as const).map((label, i) => {
                  const val     = [currentPw, newPw, confirmPw][i]
                  const setter  = [setCurrentPw, setNewPw, setConfirmPw][i]
                  const show    = [showCurrent, showNew, showNew][i]
                  const toggleShow = i === 0 ? () => setShowCurrent(p => !p) : () => setShowNew(p => !p)
                  return (
                    <div key={label}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(26,54,93,0.6)', marginBottom: '5px' }}>{label}</label>
                      <div className="relative">
                        <input className="glass-input pr-10" type={show ? 'text' : 'password'} value={val}
                          onChange={e => { setter(e.target.value); setPwError(''); setPwSuccess(false) }}
                          onKeyDown={e => e.key === 'Enter' && changePassword()} />
                        <button type="button" onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(26,54,93,0.4)' }}>
                          {show ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )
                })}

                {pwError && <p style={{ color: '#c4622a', fontSize: '0.82rem', background: 'rgba(240,147,91,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(240,147,91,0.2)' }}>{pwError}</p>}
                {pwSuccess && <p style={{ color: '#1a6a40', fontSize: '0.82rem', background: 'rgba(100,200,150,0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(100,200,150,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={13} /> Password updated successfully!</p>}

                <button onClick={changePassword} disabled={savingPw} className="btn-coral w-full py-2.5 text-sm flex items-center justify-center gap-1.5" style={{ marginTop: '0.25rem' }}>
                  {savingPw ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</> : <><Save size={13} /> Update Password</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
