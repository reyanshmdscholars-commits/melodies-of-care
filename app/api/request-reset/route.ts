import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const RESEND_API_KEY = process.env.RESEND_API_KEY
// Once your domain is verified in Resend, change this to e.g. noreply@melodiesofcare.com
const FROM_EMAIL    = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://melodiesofcare.com'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })

    // Check volunteer exists
    const { data: volunteers } = await supabase
      .from('volunteers')
      .select('name, email')
      .eq('email', email.toLowerCase().trim())
      .limit(1)

    // Always return success to prevent email enumeration
    if (!volunteers || volunteers.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const vol = volunteers[0]

    // Generate a secure random token
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')

    // Store token (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    await supabase.from('password_resets').insert({ email: vol.email, token, expires_at: expiresAt })

    const resetLink = `${SITE_URL}/reset-password?token=${token}`

    // Send email via Resend
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: vol.email,
          subject: 'Reset your Melodies of Care password',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
              <img src="${SITE_URL}/logo.png" alt="Melodies of Care" style="height:48px;margin-bottom:24px" />
              <h2 style="color:#1a365d;margin:0 0 12px">Password Reset</h2>
              <p style="color:#4a5568;line-height:1.7;margin:0 0 24px">
                Hi ${vol.name.split(' ')[0]},<br/><br/>
                We received a request to reset the password for your Melodies of Care volunteer account.
                Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <a href="${resetLink}"
                style="display:inline-block;background:#f0935b;color:#fff;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:100px;font-size:0.95rem">
                Reset My Password
              </a>
              <p style="color:#a0aec0;font-size:0.8rem;margin-top:28px;line-height:1.6">
                If you didn't request this, you can safely ignore this email — your password won't change.<br/>
                Or copy this link: ${resetLink}
              </p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('request-reset error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
