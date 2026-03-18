'use client'
import { useEffect, useState } from 'react'
import { Music, Loader2 } from 'lucide-react'
import { supabase, type TeamMember } from '@/lib/supabase'

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="glass-card p-7 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
          style={{ background: `hsl(${member.hue}, 60%, 65%)`, boxShadow: `0 4px 16px hsla(${member.hue}, 60%, 65%, 0.35)` }}>
          {member.initials}
        </div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', lineHeight: 1.2 }}>{member.name}</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 600, marginTop: '2px' }}>{member.role}</p>
        </div>
      </div>

      {member.instrument && (
        <div className="flex items-center gap-1.5 w-fit" style={{ background: 'rgba(178,216,216,0.2)', border: '1px solid rgba(178,216,216,0.4)', borderRadius: '100px', padding: '3px 10px' }}>
          <Music size={11} color="#2d6a6a" />
          <span style={{ fontSize: '0.75rem', color: '#2d6a6a', fontWeight: 600 }}>{member.instrument}</span>
        </div>
      )}

      <p style={{ color: 'rgba(26,54,93,0.62)', fontSize: '0.875rem', lineHeight: 1.75, flexGrow: 1 }}>{member.bio}</p>
    </div>
  )
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('team_members')
      .select('*')
      .order('sort_order')
      .then(({ data }) => { setMembers(data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ paddingTop: '5rem' }}>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-14">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '1rem' }}>The People</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>Meet the Team</h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(26,54,93,0.65)', lineHeight: 1.8 }}>
            Behind every concert, every smile, and every heartfelt moment is a dedicated team of musicians, organizers, and community builders. We are united by a single belief: music is a human right.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: 'rgba(26,54,93,0.4)' }}>
            <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading team…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {members.map(m => <TeamCard key={m.id} member={m} />)}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="glass-card p-10 md:p-14 text-center" style={{ background: 'linear-gradient(135deg, rgba(26,54,93,0.04) 0%, rgba(240,147,91,0.06) 100%)' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1rem' }}>Want to join this team?</h2>
          <p style={{ color: 'rgba(26,54,93,0.62)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            We&apos;re always looking for passionate musicians and community builders. Check our volunteer program or reach out directly.
          </p>
          <a href="/#volunteer" className="btn-coral px-8 py-3 text-base" style={{ textDecoration: 'none' }}>Become a Volunteer</a>
        </div>
      </section>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
