'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, MessageSquare, Check, ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const FORMSPREE_ID = 'xgonzkoe'

export default function PartnerPage() {
  const [form, setForm] = useState({
    facility_name: '',
    contact_name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setError('')
  }

  const validate = () => {
    if (!form.facility_name.trim()) return 'Please enter your facility name.'
    if (!form.contact_name.trim())  return 'Please enter a contact name.'
    if (!form.email.trim())         return 'Please enter your email address.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')

    try {
      // Save to Supabase
      const { error: dbErr } = await supabase.from('facility_inquiries').insert({
        facility_name: form.facility_name.trim(),
        contact_name:  form.contact_name.trim(),
        email:         form.email.toLowerCase().trim(),
        phone:         form.phone.trim(),
        city:          form.city.trim(),
        message:       form.message.trim(),
      })
      if (dbErr) throw dbErr

      // Also send to Formspree (non-blocking)
      await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Facility Interest',
          facility_name: form.facility_name,
          contact_name: form.contact_name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          message: form.message,
        }),
      }).catch(() => {})

      setDone(true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      setError(msg)
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
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>Inquiry Received!</h2>
            <p style={{ color: 'rgba(26,54,93,0.6)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              Thank you, <strong>{form.contact_name.split(' ')[0]}</strong>! We're thrilled that <strong>{form.facility_name}</strong> is interested in hosting our musicians.
              Our team will be in touch within a few business days to discuss next steps.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/" className="btn-coral px-6 py-2.5 text-sm" style={{ textDecoration: 'none', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Back to Home <ArrowRight size={13} />
              </Link>
              <Link href="/about" className="btn-ghost px-6 py-2.5 text-sm" style={{ textDecoration: 'none' }}>
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      {/* Hero strip */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10" style={{ position: 'relative' }}>
        <span aria-hidden="true" style={{ position: 'absolute', top: 0, right: '8%', fontSize: '4rem', color: 'rgba(178,216,216,0.18)', pointerEvents: 'none', userSelect: 'none', animation: 'floatNote1 18s ease-in-out infinite' }}>♬</span>
        <span aria-hidden="true" style={{ position: 'absolute', bottom: '-10px', left: '2%', fontSize: '2rem', color: 'rgba(240,147,91,0.15)', pointerEvents: 'none', userSelect: 'none', animation: 'floatNote2 22s ease-in-out infinite 1s' }}>♪</span>
        <style>{`@keyframes floatNote1{0%,100%{transform:translateY(0) rotate(-8deg) scale(1)}35%{transform:translateY(-18px) rotate(4deg) scale(1.08)}70%{transform:translateY(10px) rotate(-12deg) scale(0.95)}} @keyframes floatNote2{0%,100%{transform:translateY(0) rotate(6deg) scale(1)}40%{transform:translateY(16px) rotate(-5deg) scale(1.05)}75%{transform:translateY(-12px) rotate(10deg) scale(0.93)}}`}</style>
        <div className="max-w-2xl">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '0.75rem' }}>Partner With Us</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            Bring Live Music to<br />Your Residents
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(26,54,93,0.65)', lineHeight: 1.8, maxWidth: '540px' }}>
            We partner with senior living communities, memory care facilities, and hospice environments to deliver live musical performances. If you&apos;d like to host our volunteers, fill out the form below and we&apos;ll reach out to get you scheduled.
          </p>
        </div>
      </section>

      {/* Benefits row */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🎵', title: 'Live Performances', desc: 'Trained volunteer musicians perform in-person for your residents at no cost.' },
            { icon: '🤝', title: 'Flexible Scheduling', desc: 'We work around your calendar and can accommodate recurring visits.' },
            { icon: '💙', title: 'Meaningful Impact', desc: 'Music reduces isolation and brings joy to residents, staff, and families alike.' },
          ].map(b => (
            <div key={b.title} className="glass-card p-6">
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{b.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{b.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(26,54,93,0.6)', lineHeight: 1.65 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="glass-card p-8 md:p-10">
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.4rem' }}>Express Your Interest</h2>
          <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.88rem', marginBottom: '2rem' }}>Fields marked with * are required.</p>

          <div className="flex flex-col gap-4">

            {/* Facility name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                <Building2 size={12} style={{ display: 'inline', marginRight: 5 }} />Facility Name *
              </label>
              <input className="glass-input" placeholder="e.g. Sunrise Manor Senior Living" value={form.facility_name} onChange={set('facility_name')} />
            </div>

            {/* Contact name + city row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>Contact Name *</label>
                <input className="glass-input" placeholder="Jane Smith" value={form.contact_name} onChange={set('contact_name')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: 5 }} />City
                </label>
                <input className="glass-input" placeholder="e.g. Austin, TX" value={form.city} onChange={set('city')} />
              </div>
            </div>

            {/* Email + phone row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  <Mail size={12} style={{ display: 'inline', marginRight: 5 }} />Email Address *
                </label>
                <input className="glass-input" type="email" placeholder="jane@sunrisemanor.com" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                  <Phone size={12} style={{ display: 'inline', marginRight: 5 }} />Phone Number
                </label>
                <input className="glass-input" type="tel" placeholder="(512) 555-0100" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(26,54,93,0.7)', marginBottom: '6px' }}>
                <MessageSquare size={12} style={{ display: 'inline', marginRight: 5 }} />Tell Us About Your Facility
              </label>
              <textarea
                className="glass-input"
                rows={4}
                placeholder="How many residents do you serve? Any special considerations, preferred days, or types of music? We'd love to know!"
                value={form.message}
                onChange={set('message')}
                style={{ resize: 'vertical', minHeight: 100 }}
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
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                : <>Send Inquiry <ArrowRight size={15} /></>
              }
            </button>
          </div>
        </div>
      </section>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
