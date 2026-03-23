'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, MessageSquare, User, Check, ArrowRight, Loader2 } from 'lucide-react'

const FORMSPREE_ID = 'xgonzkoe'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.name.trim())    return 'Please enter your name.'
    if (!form.email.trim())   return 'Please enter your email address.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.'
    if (!form.message.trim()) return 'Please enter a message.'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type:    'Contact Us Message',
          _replyto: form.email,
          name:    form.name,
          email:   form.email,
          subject: form.subject || '(No subject)',
          message: form.message,
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ paddingTop: '5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="max-w-lg mx-auto w-full px-6 py-16 text-center">
          <div className="glass-card p-12" style={{ background: 'rgba(178,216,216,0.1)', border: '1px solid rgba(178,216,216,0.3)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(178,216,216,0.25)', border: '1px solid rgba(178,216,216,0.5)' }}>
              <Check size={36} color="#2d6a6a" />
            </div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>Message Sent!</h2>
            <p style={{ color: 'rgba(26,54,93,0.6)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              Thanks for reaching out, <strong>{form.name.split(' ')[0]}</strong>! We&apos;ll get back to you at <strong>{form.email}</strong> as soon as we can.
            </p>
            <Link href="/" className="btn-coral px-6 py-2.5 text-sm" style={{ textDecoration: 'none', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Back to Home <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="max-w-2xl">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '0.75rem' }}>Get in Touch</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            Contact Us
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(26,54,93,0.65)', lineHeight: 1.8, maxWidth: '500px' }}>
            Have a question, idea, or just want to say hello? We&apos;d love to hear from you.
            Fill out the form below or email us directly.
          </p>
        </div>
      </section>

      {/* Direct email callout */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <a
          href="mailto:reyansh.melodiesofcare@gmail.com"
          className="glass-card p-5 flex items-center gap-4"
          style={{ textDecoration: 'none', maxWidth: 480, border: '1px solid rgba(178,216,216,0.3)', transition: 'box-shadow 0.2s' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(178,216,216,0.2)', border: '1px solid rgba(178,216,216,0.4)' }}>
            <Mail size={18} color="#2d6a6a" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(26,54,93,0.45)', marginBottom: 2 }}>Email Us Directly</div>
            <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.92rem' }}>reyansh.melodiesofcare@gmail.com</div>
          </div>
        </a>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="glass-card p-8 md:p-10">
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem' }}>Send a Message</h2>
          <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.88rem', marginBottom: '2rem' }}>We typically respond within 1–2 business days.</p>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  <User size={11} style={{ display: 'inline', marginRight: 5 }} />Your Name *
                </label>
                <input className="glass-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  <Mail size={11} style={{ display: 'inline', marginRight: 5 }} />Your Email *
                </label>
                <input className="glass-input" type="email" placeholder="jane@example.com" value={form.email} onChange={set('email')} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>Subject</label>
              <input className="glass-input" placeholder="What's this about?" value={form.subject} onChange={set('subject')} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                <MessageSquare size={11} style={{ display: 'inline', marginRight: 5 }} />Message *
              </label>
              <textarea
                className="glass-input"
                rows={5}
                placeholder="Tell us what's on your mind…"
                value={form.message}
                onChange={set('message')}
                style={{ resize: 'vertical', minHeight: 120 }}
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
              className="btn-coral w-full py-3.5 text-base flex items-center justify-center gap-2"
              style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                : <>Send Message <ArrowRight size={15} /></>
              }
            </button>
          </div>
        </div>
      </section>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
