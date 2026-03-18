'use client'
import { useEffect, useState } from 'react'
import { supabase, type Volunteer } from '@/lib/supabase'
import { Trophy, Music, Clock, Award } from 'lucide-react'

export default function LeaderboardPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('volunteers')
      .select('id, name, instrument, hours, status')
      .eq('status', 'approved')
      .order('hours', { ascending: false })
      .then(({ data }) => {
        setVolunteers(data || [])
        setLoading(false)
      })
  }, [])

  const top3 = volunteers.slice(0, 3)
  const rest  = volunteers.slice(3)

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
  const medalBg     = ['rgba(255,215,0,0.12)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.12)']
  const rankLabel   = ['1st', '2nd', '3rd']

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', boxShadow: '0 4px 20px rgba(255,215,0,0.15)' }}>
            <Trophy size={28} color="#c8960c" />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--coral)', marginBottom: '0.5rem' }}>
            Volunteer Spotlight
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--navy)', marginBottom: '0.75rem' }}>
            Leaderboard
          </h1>
          <p style={{ color: 'rgba(26,54,93,0.55)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Celebrating the volunteers who&apos;ve brought the most music and joy to our partner facilities.
          </p>
        </div>

        {loading ? (
          <div className="glass-card p-16 text-center">
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(26,54,93,0.1)', borderTopColor: 'var(--coral)', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ color: 'rgba(26,54,93,0.4)', fontSize: '0.9rem' }}>Loading leaderboard…</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Music size={40} color="rgba(26,54,93,0.12)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'rgba(26,54,93,0.45)', fontSize: '1rem', fontWeight: 600 }}>No approved hours yet</p>
            <p style={{ color: 'rgba(26,54,93,0.3)', fontSize: '0.88rem', marginTop: '0.5rem' }}>Check back after events are completed and hours are approved!</p>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-4 mb-10" style={{ minHeight: 200 }}>
                {/* 2nd place */}
                {top3[1] && (
                  <div className="flex flex-col items-center" style={{ order: 1 }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🥈</div>
                    <div className="glass-card p-5 text-center" style={{ minWidth: 130, border: `1.5px solid rgba(192,192,192,0.4)`, background: medalBg[1] }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.3rem' }}>2nd</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy)', marginBottom: '0.2rem', lineHeight: 1.2 }}>{top3[1].name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.5)', marginBottom: '0.6rem' }}>{top3[1].instrument}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#888' }}>{top3[1].hours}h</div>
                    </div>
                    <div style={{ width: 4, height: 60, background: 'linear-gradient(to bottom, #C0C0C0, transparent)', borderRadius: 2 }} />
                  </div>
                )}

                {/* 1st place */}
                {top3[0] && (
                  <div className="flex flex-col items-center" style={{ order: 0 }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 2px 4px rgba(200,150,0,0.5))' }}>👑</div>
                    <div className="glass-card p-6 text-center" style={{ minWidth: 150, border: `2px solid rgba(255,215,0,0.5)`, background: medalBg[0], boxShadow: '0 8px 32px rgba(255,215,0,0.18)' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c8960c', marginBottom: '0.3rem' }}>1st Place</div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '0.2rem', lineHeight: 1.2 }}>{top3[0].name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(26,54,93,0.5)', marginBottom: '0.75rem' }}>{top3[0].instrument}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#c8960c' }}>{top3[0].hours}h</div>
                    </div>
                    <div style={{ width: 4, height: 80, background: 'linear-gradient(to bottom, #FFD700, transparent)', borderRadius: 2 }} />
                  </div>
                )}

                {/* 3rd place */}
                {top3[2] && (
                  <div className="flex flex-col items-center" style={{ order: 2 }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🥉</div>
                    <div className="glass-card p-5 text-center" style={{ minWidth: 130, border: `1.5px solid rgba(205,127,50,0.4)`, background: medalBg[2] }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a6030', marginBottom: '0.3rem' }}>3rd</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy)', marginBottom: '0.2rem', lineHeight: 1.2 }}>{top3[2].name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.5)', marginBottom: '0.6rem' }}>{top3[2].instrument}</div>
                      <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#9a6030' }}>{top3[2].hours}h</div>
                    </div>
                    <div style={{ width: 4, height: 44, background: 'linear-gradient(to bottom, #CD7F32, transparent)', borderRadius: 2 }} />
                  </div>
                )}
              </div>
            )}

            {/* Rest of leaderboard */}
            {rest.length > 0 && (
              <div className="glass-card overflow-hidden">
                {rest.map((v, i) => {
                  const rank = i + 4
                  return (
                    <div
                      key={v.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '1rem 1.5rem',
                        borderBottom: i < rest.length - 1 ? '1px solid rgba(26,54,93,0.06)' : 'none',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(26,54,93,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'rgba(26,54,93,0.45)'
                      }}>
                        {rank}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--navy)' }}>{v.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <Music size={11} color="rgba(26,54,93,0.35)" />
                          <span style={{ fontSize: '0.78rem', color: 'rgba(26,54,93,0.45)' }}>{v.instrument}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} color="rgba(45,106,106,0.6)" />
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#2d6a6a' }}>{v.hours}h</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Total stats bar */}
            <div className="glass-card p-6 mt-6 flex items-center justify-around" style={{ background: 'rgba(178,216,216,0.08)', border: '1px solid rgba(178,216,216,0.3)' }}>
              <div className="text-center">
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>{volunteers.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.5)', fontWeight: 600 }}>Active Volunteers</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(26,54,93,0.1)' }} />
              <div className="text-center">
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2d6a6a' }}>
                  {volunteers.reduce((s, v) => s + v.hours, 0)}h
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.5)', fontWeight: 600 }}>Total Hours</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'rgba(26,54,93,0.1)' }} />
              <div className="text-center">
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--coral)' }}>
                  {volunteers.filter(v => v.hours > 0).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.5)', fontWeight: 600 }}>With Logged Hours</div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <p style={{ color: 'rgba(26,54,93,0.45)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                Want your name on the leaderboard?{' '}
                <a href="/events" style={{ color: 'var(--coral)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign up for an event →
                </a>
              </p>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
