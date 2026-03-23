'use client'
import Link from 'next/link'
import { Music, Heart, Users, Star, BookOpen, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react'

const sections = [
  {
    icon: <Heart size={20} color="#2d6a6a" />,
    title: 'What to Expect',
    items: [
      'Performances typically last 30–60 minutes. Keep energy warm and steady — residents may tire easily.',
      'Residents may have hearing aids or cognitive differences — speak clearly, smile often, and make eye contact.',
      'Some residents may be non-verbal or have memory loss; music often reaches them when words cannot.',
      'Staff will be present. Follow their lead if a resident becomes distressed or needs assistance.',
      'Arrive 10–15 minutes early to set up quietly and introduce yourself to the activity coordinator.',
    ],
  },
  {
    icon: <Music size={20} color="#2d6a6a" />,
    title: 'Repertoire Tips',
    items: [
      'Classic standards from the 1930s–1960s resonate most — think Frank Sinatra, Doris Day, Nat King Cole era.',
      'Familiar hymns and folk songs (e.g. "You Are My Sunshine", "Amazing Grace") are universally loved.',
      'Slow, melodic pieces work well. Avoid overly loud or dissonant music.',
      'If you play an instrument, consider a mix of recognizable tunes and one or two original or classical pieces.',
      'Be flexible — if residents start to sing along, let them. That spontaneous joy is the whole point.',
    ],
  },
  {
    icon: <Users size={20} color="#2d6a6a" />,
    title: 'Engaging with Residents',
    items: [
      'Introduce yourself before you start and briefly explain what you\'ll be playing.',
      'Make the performance conversational — pause between songs and ask if anyone has a favorite request.',
      'Get down to eye level when speaking with residents in wheelchairs.',
      'After the performance, take a few minutes to walk around and chat. It means a lot.',
      'Always use residents\' names if you learn them — it builds an immediate sense of connection.',
    ],
  },
  {
    icon: <Star size={20} color="#2d6a6a" />,
    title: 'Professionalism & Etiquette',
    items: [
      'Dress neatly — smart casual is appropriate. Avoid overly casual or distracting clothing.',
      'Silence your phone. No texting or scrolling during downtime.',
      'Respect residents\' privacy — do not photograph or record without explicit consent from staff.',
      'If a resident or staff member asks you to stop or adjust, do so graciously without question.',
      'Report any concerns (e.g. a resident in distress) to facility staff immediately.',
    ],
  },
  {
    icon: <Lightbulb size={20} color="#2d6a6a" />,
    title: 'Logging Your Hours',
    items: [
      'Sign up for events through the Events page before attending.',
      'Select the number of songs you plan to perform (1 song = 2 hrs, 2 songs = 5 hrs).',
      'Hours are credited once an admin approves them after the event.',
      'View your approved hours, milestones, and download your certificate from your Profile page.',
      'Questions about hours? Reach out via the Contact Us page.',
    ],
  },
]

export default function ResourcesPage() {
  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="max-w-2xl">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '0.75rem' }}>Volunteer Handbook</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            Resources for Volunteers
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(26,54,93,0.65)', lineHeight: 1.8, maxWidth: '540px' }}>
            Everything you need to know to have a safe, meaningful, and memorable performance at a senior care facility. Read through before your first event!
          </p>
        </div>
      </section>

      {/* Quick checklist */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="glass-card p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgba(240,147,91,0.06) 0%, rgba(178,216,216,0.08) 100%)', border: '1px solid rgba(240,147,91,0.18)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(240,147,91,0.12)', border: '1px solid rgba(240,147,91,0.25)' }}>
              <CheckCircle size={18} color="var(--coral)" />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>Before Every Event — Quick Checklist</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Signed up on the Events page ✓',
              'Instrument tuned and ready',
              'Setlist of 1–2 songs prepared',
              'Casual-smart outfit chosen',
              'Directions to facility confirmed',
              'Arriving 10–15 min early',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--coral)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', color: 'rgba(26,54,93,0.75)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main sections */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex flex-col gap-6">
          {sections.map(s => (
            <div key={s.title} className="glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(178,216,216,0.2)', border: '1px solid rgba(178,216,216,0.4)' }}>
                  {s.icon}
                </div>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>{s.title}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {s.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(178,216,216,0.25)', border: '1px solid rgba(178,216,216,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#2d6a6a' }}>{i + 1}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(26,54,93,0.72)', lineHeight: 1.65 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
          style={{ background: 'linear-gradient(135deg, rgba(178,216,216,0.08) 0%, rgba(255,255,255,0.45) 100%)' }}>
          <div className="flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <BookOpen size={18} color="var(--coral)" />
              <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--coral)' }}>Still have questions?</p>
            </div>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.6rem' }}>We&apos;re here to help</h2>
            <p style={{ color: 'rgba(26,54,93,0.58)', fontSize: '0.92rem', lineHeight: 1.7 }}>
              If something comes up before or after an event that isn&apos;t covered here, reach out anytime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-end flex-shrink-0">
            <Link href="/contact" className="btn-coral px-6 py-2.5 text-sm" style={{ textDecoration: 'none' }}>
              Contact Us <ArrowRight size={13} />
            </Link>
            <Link href="/events" className="btn-ghost px-6 py-2.5 text-sm" style={{ textDecoration: 'none' }}>
              View Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
