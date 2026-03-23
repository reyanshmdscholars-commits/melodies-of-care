import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yeghjkhcsstpbkmrblgu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZ2hqa2hjc3N0cGJrbXJibGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzUxODgsImV4cCI6MjA4OTExMTE4OH0.E-5EnEr5qiri3Vkk0ZUX_-BiO6de03Xbq5McSRTQtZg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Event = {
  id: string
  facility_name: string
  date: string
  time: string
  status: 'open' | 'filled'
  volunteer_id: string | null
  notes: string
}

export type Volunteer = {
  id: string
  name: string
  email: string
  password_hash: string
  instrument: string
  status: 'pending' | 'approved' | 'rejected'
  hours: number
  media_consent: boolean
}

export type SongDetail = {
  title: string
  composer: string
}

export type EventSignup = {
  id: string
  event_id: string
  volunteer_id: string
  volunteer_name: string
  claimed_at: string
  songs: number
  hours_approved: boolean
  song_details: SongDetail[] | null
}

export type Announcement = {
  id: string
  message: string
  is_active: boolean
  created_at: string
}

export type WaitlistEntry = {
  id: string
  event_id: string
  volunteer_id: string
  volunteer_name: string
  position: number
  joined_at: string
}

export type GalleryItem = {
  id: string
  title: string
  date: string
  category: string
  image_url: string
  color: string
  sort_order: number
  created_at: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  instrument: string
  bio: string
  initials: string
  hue: string
  sort_order: number
  created_at: string
}

export type FacilityInquiry = {
  id: string
  facility_name: string
  contact_name: string
  email: string
  phone: string
  city: string
  message: string
  created_at: string
}

// SHA-256 via built-in Web Crypto API — no extra packages needed
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
