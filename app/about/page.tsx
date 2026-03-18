import { Heart, Music, Star, Shield } from 'lucide-react'

const values = [
  { icon: <Heart size={22} color="var(--coral)" />, title: 'Compassion First', body: 'Every visit, every note, every smile is rooted in genuine love for the people we serve. We show up with full hearts, ready to listen as much as we perform.' },
  { icon: <Music size={22} color="var(--coral)" />, title: 'Musical Excellence', body: 'We believe the residents we visit deserve the very best. Our volunteers are trained musicians who bring real artistry and intentional repertoire to each performance.' },
  { icon: <Star size={22} color="var(--coral)" />, title: 'Dignity & Joy', body: 'We enter every facility as guests in someone\'s home. We honor the wisdom in the room, adapt to individual needs, and leave behind a little more light than we found.' },
  { icon: <Shield size={22} color="var(--coral)" />, title: 'Community Trust', body: 'Facility partners, families, and residents trust us because we are consistent, professional, and deeply committed to doing no harm — only good.' },
]

const timeline = [
  { year: '2026', title: 'A Spark of Purpose', body: 'Melodies of Care was born from a simple question: where does a love of music, a gift for performance, a need in our community, and a desire to give back all intersect? The answer was ikigai — and the answer was here.' },
  { year: '2026', title: 'First Visits', body: 'We made our debut with two live concerts at local senior care facilities. The response was immediate and overwhelming — residents, staff, and families were moved in ways words couldn\'t fully capture.' },
  { year: '2026', title: 'Growing Together', body: 'Word spread quickly. Ten volunteers joined our growing family, each bringing their own instrument, their own story, and their own reason for showing up. We\'re just getting started.' },
]

export default function About() {
  return (
    <div style={{ paddingTop: '5rem' }}>
      {/* Hero */}
      <section className="music-notes-bg max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20" style={{ position: 'relative' }}>
        {/* Decorative scattered notes */}
        <span style={{ position: 'absolute', top: '10%', right: '5%', fontSize: '3.5rem', color: 'rgba(178,216,216,0.2)', pointerEvents: 'none', userSelect: 'none', animation: 'floatNote1 16s ease-in-out infinite' }}>♬</span>
        <span style={{ position: 'absolute', bottom: '5%', right: '20%', fontSize: '2rem', color: 'rgba(240,147,91,0.18)', pointerEvents: 'none', userSelect: 'none', animation: 'floatNote2 20s ease-in-out infinite 1.5s' }}>♪</span>
        <div className="max-w-3xl">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '1rem' }}>About Us</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>
            A bridge built{' '}
            <span className="note-float" style={{ color: 'rgba(178,216,216,0.7)', fontSize: '0.7em', verticalAlign: 'middle' }}>♩</span>
            {' '}note by note.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(26,54,93,0.65)', lineHeight: 1.8, maxWidth: '560px' }}>
            Melodies of Care is a nonprofit music outreach organization dedicated to bringing live, meaningful musical experiences to seniors in care facilities. We believe no one should age in silence.
          </p>
        </div>
      </section>

      {/* Mission Block */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="glass-card p-6 sm:p-10 md:p-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '1.25rem', lineHeight: 1.3 }}>
                Why music? Why now?
              </h2>
              <p style={{ color: 'rgba(26,54,93,0.65)', lineHeight: 1.85, fontSize: '0.95rem', marginBottom: '1.25rem' }}>
                Research consistently shows that music activates regions of the brain associated with memory, emotion, and motor function — regions often preserved even in late-stage dementia. For residents who may no longer recognize faces or recall names, a familiar melody can unlock something profound: recognition, presence, and peace.
              </p>
              <p style={{ color: 'rgba(26,54,93,0.65)', lineHeight: 1.85, fontSize: '0.95rem' }}>
                But our mission isn&apos;t purely clinical. It&apos;s human. We come because connection matters. Because a 90-year-old who once danced to big band music deserves to hear it again — live, in person, performed by someone who cares.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['2', 'Partner Facilities'], ['2', 'Concerts So Far'], ['10', 'Trained Volunteers'], ['2026', 'Year Founded']].map(([n, l]) => (
                <div key={l} className="glass-card p-6 text-center" style={{ background: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--coral)', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.6)', marginTop: '0.4rem', fontWeight: 500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ikigai */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="glass-card p-6 sm:p-10 md:p-14" style={{ background: 'rgba(178,216,216,0.07)', border: '1px solid rgba(178,216,216,0.25)' }}>
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#2d6a6a', marginBottom: '0.75rem' }}>Our Foundation</p>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.015em', marginBottom: '1.1rem' }}>Rooted in <em>Ikigai</em></h2>
            <p style={{ color: 'rgba(26,54,93,0.62)', lineHeight: 1.85, fontSize: '0.95rem' }}>
              <em>Ikigai</em> (生き甲斐) is a Japanese concept that translates roughly to <strong>"reason for being."</strong> It lives at the intersection of four questions: What do you love? What are you good at? What does the world need? And what can sustain you?
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { jp: '好き', label: 'What you love', answer: 'Music — the joy of playing, the rush of a live performance, the way a melody can stop time.' },
              { jp: '得意', label: 'What you\'re good at', answer: 'Our volunteers are trained musicians who have dedicated years of practice to their craft.' },
              { jp: '世界が必要', label: 'What the world needs', answer: 'Seniors in care facilities are among the most isolated people in our communities. That needs to change.' },
              { jp: '使命', label: 'Your mission', answer: 'We exist where all four circles meet — bringing music where it matters most, because it is both our gift and our calling.' },
            ].map(q => (
              <div key={q.label} className="glass-card p-6 text-center" style={{ background: 'rgba(255,255,255,0.35)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d6a6a', marginBottom: '0.4rem', fontFamily: 'serif' }}>{q.jp}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,54,93,0.45)', marginBottom: '0.75rem' }}>{q.label}</div>
                <p style={{ color: 'rgba(26,54,93,0.65)', fontSize: '0.85rem', lineHeight: 1.7 }}>{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '0.75rem' }}>Our Values</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.015em' }}>What guides every visit</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map(v => (
            <div key={v.title} className="glass-card p-8">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(240,147,91,0.1)', border: '1px solid rgba(240,147,91,0.2)' }}>{v.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem' }}>{v.title}</h3>
              <p style={{ color: 'rgba(26,54,93,0.62)', lineHeight: 1.75, fontSize: '0.9rem' }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-24">
        <div className="text-center mb-12">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '0.75rem' }}>Our Story</p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.015em' }}>How we got here</h2>
        </div>
        <div className="relative">
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(178,216,216,0.4)', transform: 'translateX(-50%)' }} className="hidden md:block" />
          <div className="flex flex-col gap-8">
            {timeline.map((t, i) => (
              <div key={i} className={`flex flex-col md:flex-row gap-6 items-start md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="glass-card p-7 inline-block w-full">
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{t.year}</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{t.title}</h3>
                    <p style={{ color: 'rgba(26,54,93,0.62)', fontSize: '0.88rem', lineHeight: 1.7 }}>{t.body}</p>
                  </div>
                </div>
                <div className="hidden md:flex w-10 h-10 rounded-full items-center justify-center flex-shrink-0 z-10" style={{ background: 'var(--coral)', color: 'white', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 0 0 4px rgba(240,147,91,0.2)' }}>{t.year.slice(2)}</div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
