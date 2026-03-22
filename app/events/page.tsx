'use client'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Music, MapPin, Clock, Check, Loader2, Lock, Users, X, Bell, ListOrdered, CalendarDays } from 'lucide-react'
import { supabase, type Event, type EventSignup, type Announcement, type WaitlistEntry, type SongDetail } from '@/lib/supabase'
import { useVolunteerAuth } from '@/lib/volunteer-auth'
import Link from 'next/link'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MAX_SLOTS = 10

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }

export default function Events() {
  const { volunteer } = useVolunteerAuth()
  const today = new Date()
  const [year, setYear]           = useState(today.getFullYear())
  const [month, setMonth]         = useState(today.getMonth())
  const [events, setEvents]       = useState<Event[]>([])
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({})
  const [mySignups, setMySignups] = useState<string[]>([])
  const [myWaitlist, setMyWaitlist] = useState<string[]>([])
  const [waitlistPositions, setWaitlistPositions] = useState<Record<string, number>>({})
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [loading, setLoading]     = useState(true)
  const [actionId, setActionId]   = useState<string | null>(null)

  // Song picker modal
  const [pickingEvent, setPickingEvent] = useState<Event | null>(null)
  const [selectedSongs, setSelectedSongs] = useState<1|2>(1)
  const [songDetails, setSongDetails] = useState<SongDetail[]>([{ title: '', composer: '' }])

  useEffect(() => {
    if (volunteer?.status === 'approved') {
      fetchAll()
      fetchAnnouncements()
    } else {
      setLoading(false)
    }
  }, [year, month, volunteer])

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false })
    setAnnouncements(data || [])
  }

  const fetchAll = async () => {
    setLoading(true)
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const end   = `${year}-${String(month + 1).padStart(2, '0')}-${getDaysInMonth(year, month)}`

    const [{ data: evData }, { data: allSignups }, { data: myData }, { data: myWL }] = await Promise.all([
      supabase.from('events').select('*').gte('date', start).lte('date', end).order('date'),
      supabase.from('event_signups').select('event_id'),
      volunteer ? supabase.from('event_signups').select('event_id').eq('volunteer_id', volunteer.id) : Promise.resolve({ data: [] as {event_id:string}[] }),
      volunteer ? supabase.from('event_waitlist').select('event_id, position').eq('volunteer_id', volunteer.id) : Promise.resolve({ data: [] as {event_id:string,position:number}[] }),
    ])

    setEvents(evData || [])
    const counts: Record<string, number> = {}
    for (const r of (allSignups || [])) counts[r.event_id] = (counts[r.event_id] || 0) + 1
    setSignupCounts(counts)
    setMySignups(((myData as {event_id:string}[] | null) || []).map(r => r.event_id))
    const wlData = ((myWL as {event_id:string,position:number}[] | null) || [])
    setMyWaitlist(wlData.map(r => r.event_id))
    const positions: Record<string, number> = {}
    for (const r of wlData) positions[r.event_id] = r.position
    setWaitlistPositions(positions)
    setLoading(false)
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1); setSelectedDay(null) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1); setSelectedDay(null) }
  const eventsOnDay = (day: number) => {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.date === d)
  }

  // Opens the song picker modal
  const openSongPicker = (event: Event) => {
    setPickingEvent(event)
    setSelectedSongs(1)
    setSongDetails([{ title: '', composer: '' }])
  }

  // Change song count and resize songDetails array
  const handleSongCountChange = (n: 1 | 2) => {
    setSelectedSongs(n)
    setSongDetails(prev => Array.from({ length: n }, (_, i) => prev[i] ?? { title: '', composer: '' }))
  }

  // Update one field in one song row
  const updateSongDetail = (idx: number, field: 'title' | 'composer', value: string) => {
    setSongDetails(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  // Called when volunteer confirms their song count
  const confirmClaim = async () => {
    if (!volunteer || !pickingEvent) return
    const eventId = pickingEvent.id
    setPickingEvent(null)
    setActionId(eventId)
    try {
      const { error } = await supabase.rpc('claim_event', { event_id: eventId, v_id: volunteer.id })
      if (!error) {
        // Set the songs count + details on the just-created signup row
        await supabase
          .from('event_signups')
          .update({ songs: selectedSongs, song_details: songDetails })
          .eq('event_id', eventId)
          .eq('volunteer_id', volunteer.id)
        const newCount = (signupCounts[eventId] || 0) + 1
        setMySignups(prev => [...prev, eventId])
        setSignupCounts(prev => ({ ...prev, [eventId]: newCount }))
        if (newCount >= MAX_SLOTS) setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'filled' } : e))
      }
    } finally { setActionId(null) }
  }

  const unclaimEvent = async (eventId: string) => {
    if (!volunteer) return
    setActionId(eventId)
    try {
      const { error } = await supabase.rpc('unclaim_event', { event_id: eventId, v_id: volunteer.id })
      if (!error) {
        const newCount = Math.max((signupCounts[eventId] || 1) - 1, 0)
        setMySignups(prev => prev.filter(id => id !== eventId))
        setSignupCounts(prev => ({ ...prev, [eventId]: newCount }))
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'open' } : e))
      }
    } finally { setActionId(null) }
  }

  const joinWaitlist = async (eventId: string) => {
    if (!volunteer) return
    setActionId(eventId + '-wl')
    try {
      // Get current waitlist length for this event
      const { count } = await supabase.from('event_waitlist').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
      const position = (count || 0) + 1
      const { error } = await supabase.from('event_waitlist').insert({ event_id: eventId, volunteer_id: volunteer.id, volunteer_name: volunteer.name, position })
      if (!error) {
        setMyWaitlist(prev => [...prev, eventId])
        setWaitlistPositions(prev => ({ ...prev, [eventId]: position }))
      }
    } finally { setActionId(null) }
  }

  // ── iCal export ────────────────────────────────────────────
  const exportToiCal = () => {
    const claimedEvents = events.filter(e => mySignups.includes(e.id))
    if (claimedEvents.length === 0) return

    const pad = (n: number) => String(n).padStart(2, '0')
    const toDateStr = (dateStr: string, timeStr: string) => {
      const [y, mo, d] = dateStr.split('-').map(Number)
      const [h, mi] = timeStr.split(':').map(Number)
      return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(mi)}00`
    }
    const toEndStr = (dateStr: string, timeStr: string) => {
      // Assume 2-hour performance
      const [y, mo, d] = dateStr.split('-').map(Number)
      const [h, mi] = timeStr.split(':').map(Number)
      const endH = h + 2
      return `${y}${pad(mo)}${pad(d)}T${pad(endH)}${pad(mi)}00`
    }

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Melodies of Care//Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ]

    claimedEvents.forEach(ev => {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${ev.id}@melodiesofcare.org`,
        `DTSTAMP:${toDateStr(new Date().toISOString().slice(0,10), new Date().toTimeString().slice(0,5))}`,
        `DTSTART:${toDateStr(ev.date, ev.time)}`,
        `DTEND:${toEndStr(ev.date, ev.time)}`,
        `SUMMARY:Melodies of Care – ${ev.facility_name}`,
        `DESCRIPTION:Volunteer music performance at ${ev.facility_name}.`,
        `LOCATION:${ev.facility_name}`,
        'END:VEVENT'
      )
    })

    lines.push('END:VCALENDAR')

    const ics = lines.join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-melodies-events.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  const leaveWaitlist = async (eventId: string) => {
    if (!volunteer) return
    setActionId(eventId + '-wl')
    try {
      await supabase.from('event_waitlist').delete().eq('event_id', eventId).eq('volunteer_id', volunteer.id)
      setMyWaitlist(prev => prev.filter(id => id !== eventId))
      const newPositions = { ...waitlistPositions }; delete newPositions[eventId]; setWaitlistPositions(newPositions)
    } finally { setActionId(null) }
  }

  // ── Not logged in ──────────────────────────────────────────
  if (!volunteer) return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="max-w-md mx-auto w-full px-6 py-16 text-center">
        <div className="glass-card p-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(26,54,93,0.06)', border: '1px solid rgba(26,54,93,0.1)' }}>
            <Lock size={28} color="rgba(26,54,93,0.35)" />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>Events are members-only</h2>
          <p style={{ color: 'rgba(26,54,93,0.55)', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: '2rem' }}>You need an approved volunteer account to view and claim event slots.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn-coral px-7 py-2.5 text-sm" style={{ textDecoration: 'none', borderRadius: '100px' }}>Log In</Link>
            <Link href="/signup" className="btn-ghost px-7 py-2.5 text-sm" style={{ textDecoration: 'none' }}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Pending ────────────────────────────────────────────────
  if (volunteer.status === 'pending') return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="max-w-md mx-auto w-full px-6 py-16 text-center">
        <div className="glass-card p-10" style={{ background: 'rgba(255,200,100,0.06)', border: '1px solid rgba(255,200,100,0.3)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(255,200,100,0.15)', border: '1px solid rgba(255,200,100,0.4)' }}>
            <Clock size={28} color="#8a6200" />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>Pending Approval</h2>
          <p style={{ color: 'rgba(26,54,93,0.6)', lineHeight: 1.75, fontSize: '0.95rem' }}>
            Hi <strong>{volunteer.name.split(' ')[0]}</strong>! Your application is being reviewed. You&apos;ll get full access once an admin approves your account.
          </p>
        </div>
      </div>
    </div>
  )

  // ── Approved ───────────────────────────────────────────────
  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : events
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)
  const visibleAnnouncements = announcements.filter(a => !dismissedAnnouncements.includes(a.id))

  return (
    <div style={{ paddingTop: '5rem' }}>

      {/* ── ANNOUNCEMENTS BANNER ── */}
      {visibleAnnouncements.length > 0 && (
        <div style={{ background: 'rgba(26,54,93,0.97)', backdropFilter: 'blur(16px)' }}>
          {visibleAnnouncements.map(a => (
            <div key={a.id} className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell size={15} color="var(--coral)" style={{ flexShrink: 0 }} />
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', lineHeight: 1.5 }}>{a.message}</p>
              </div>
              <button onClick={() => setDismissedAnnouncements(prev => [...prev, a.id])} style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-24">
        <div className="flex items-start justify-between gap-4 mb-10 sm:mb-12 flex-wrap">
          <div className="max-w-2xl">
            <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '1rem' }}>Schedule</p>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>Upcoming Events</h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(26,54,93,0.65)', lineHeight: 1.8 }}>
              Welcome back, <strong>{volunteer.name.split(' ')[0]}</strong>! Each event holds up to {MAX_SLOTS} volunteers. Claim your slot, or join the waitlist if it&apos;s full.
            </p>
          </div>
          {mySignups.length > 0 && (
            <button
              onClick={exportToiCal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold flex-shrink-0"
              style={{ background: 'rgba(45,106,106,0.1)', color: '#2d6a6a', border: '1px solid rgba(45,106,106,0.25)', whiteSpace: 'nowrap', marginTop: '2.5rem' }}
              title="Export your claimed events to calendar"
            >
              <CalendarDays size={15} /> Export to Calendar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'var(--navy)' }}><ChevronLeft size={16} /></button>
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{MONTHS[month]} {year}</h3>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'var(--navy)' }}><ChevronRight size={16} /></button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(26,54,93,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />
                  const de = eventsOnDay(day)
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                  const isSel = selectedDay === day
                  return (
                    <button key={day} onClick={() => setSelectedDay(isSel ? null : day)}
                      className="calendar-day flex flex-col items-center justify-center py-2 gap-0.5"
                      style={{ background: isSel ? 'var(--coral)' : isToday ? 'rgba(240,147,91,0.12)' : de.length > 0 ? 'rgba(178,216,216,0.25)' : 'transparent', border: isToday && !isSel ? '1px solid rgba(240,147,91,0.4)' : '1px solid transparent', color: isSel ? 'white' : 'var(--navy)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: isToday ? 700 : 500 }}>{day}</span>
                      {de.length > 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.7)' : 'var(--coral)' }} />}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                <div className="flex items-center gap-1.5"><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--coral)' }} /><span style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.5)' }}>Has events</span></div>
                <div className="flex items-center gap-1.5"><div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(240,147,91,0.12)', border: '1px solid rgba(240,147,91,0.4)' }} /><span style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.5)' }}>Today</span></div>
              </div>
            </div>

            {/* My Upcoming Events quick list */}
            {mySignups.length > 0 && (
              <div className="glass-card p-5 mt-4">
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--coral)', marginBottom: '0.75rem' }}>Your Claimed Events</p>
                <div className="flex flex-col gap-2">
                  {events.filter(e => mySignups.includes(e.id)).slice(0, 4).map(e => (
                    <div key={e.id} className="flex items-center justify-between gap-2">
                      <div>
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)' }}>{e.facility_name}</p>
                        <p style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.45)' }}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {e.time}</p>
                      </div>
                      <span className="badge-approved" style={{ fontSize: '0.65rem' }}>Claimed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Event list */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)' }}>
                {selectedDay ? `${MONTHS[month]} ${selectedDay}` : `All of ${MONTHS[month]}`}
                <span style={{ color: 'rgba(26,54,93,0.4)', fontWeight: 400, marginLeft: '0.5rem', fontSize: '0.85rem' }}>({selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''})</span>
              </h3>
              {selectedDay && <button onClick={() => setSelectedDay(null)} style={{ fontSize: '0.8rem', color: 'var(--coral)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Show all</button>}
            </div>

            {loading ? (
              <div className="glass-card p-10 flex items-center justify-center gap-3" style={{ color: 'rgba(26,54,93,0.4)' }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /><span style={{ fontSize: '0.9rem' }}>Loading events…</span>
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <Music size={36} color="rgba(26,54,93,0.15)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'rgba(26,54,93,0.45)', fontSize: '0.9rem' }}>No events scheduled for this period.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {selectedEvents.map(event => {
                  const count      = signupCounts[event.id] || 0
                  const isFull     = count >= MAX_SLOTS
                  const hasClaimed = mySignups.includes(event.id)
                  const onWaitlist = myWaitlist.includes(event.id)
                  const myPos      = waitlistPositions[event.id]
                  const pct        = Math.min((count / MAX_SLOTS) * 100, 100)
                  const isActing   = actionId === event.id || actionId === event.id + '-wl'

                  return (
                    <div key={event.id} className="glass-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={isFull ? 'badge-filled' : 'badge-open'}>{isFull ? 'Full' : 'Open'}</span>
                            {hasClaimed && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a6a40', background: 'rgba(100,200,150,0.2)', borderRadius: '100px', padding: '2px 10px', border: '1px solid rgba(100,200,150,0.4)' }}>You&apos;re in!</span>}
                            {onWaitlist && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8a6200', background: 'rgba(255,200,100,0.2)', borderRadius: '100px', padding: '2px 10px', border: '1px solid rgba(255,200,100,0.4)' }}>Waitlist #{myPos}</span>}
                            <span style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.4)' }}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem' }}>{event.facility_name}</h4>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-1.5" style={{ color: 'rgba(26,54,93,0.55)', fontSize: '0.82rem' }}><Clock size={13} /><span>{event.time}</span></div>
                            <div className="flex items-center gap-1.5" style={{ color: 'rgba(26,54,93,0.55)', fontSize: '0.82rem' }}><MapPin size={13} /><span>DFW Area</span></div>
                          </div>
                          {/* Slot bar */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5" style={{ color: 'rgba(26,54,93,0.55)', fontSize: '0.78rem' }}><Users size={12} /><span>{count} / {MAX_SLOTS} volunteers</span></div>
                              {!isFull && <span style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.4)' }}>{MAX_SLOTS - count} slot{MAX_SLOTS - count !== 1 ? 's' : ''} left</span>}
                            </div>
                            <div style={{ height: 6, background: 'rgba(26,54,93,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: isFull ? 'var(--coral)' : 'rgba(178,216,216,0.8)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                        </div>

                        {/* Action button */}
                        <div className="flex-shrink-0 pt-1 flex flex-col gap-2">
                          {hasClaimed ? (
                            <>
                              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(100,200,150,0.15)', color: '#1a6a40', border: '1px solid rgba(100,200,150,0.3)' }}><Check size={13} /> Claimed</div>
                              <button onClick={() => unclaimEvent(event.id)} disabled={isActing}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                                style={{ background: 'rgba(220,80,80,0.08)', color: '#c4622a', border: '1px solid rgba(220,80,80,0.2)' }}>
                                {isActing ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={11} />} Cancel
                              </button>
                            </>
                          ) : onWaitlist ? (
                            <>
                              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(255,200,100,0.15)', color: '#8a6200', border: '1px solid rgba(255,200,100,0.35)' }}><ListOrdered size={13} /> #{myPos} on waitlist</div>
                              <button onClick={() => leaveWaitlist(event.id)} disabled={isActing}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
                                style={{ background: 'rgba(220,80,80,0.08)', color: '#c4622a', border: '1px solid rgba(220,80,80,0.2)' }}>
                                {isActing ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <X size={11} />} Leave
                              </button>
                            </>
                          ) : isFull ? (
                            <button onClick={() => joinWaitlist(event.id)} disabled={isActing}
                              className="btn-ghost px-4 py-2 text-sm flex items-center gap-1.5"
                              style={{ borderRadius: '100px' }}>
                              {isActing ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <ListOrdered size={13} />} Join Waitlist
                            </button>
                          ) : (
                            <button onClick={() => openSongPicker(event)} disabled={isActing}
                              className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5"
                              style={{ borderRadius: '100px', opacity: isActing ? 0.7 : 1 }}>
                              {isActing ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Claiming…</> : 'Claim Slot'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* ── SONG PICKER MODAL ── */}
      {pickingEvent && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(16,38,70,0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setPickingEvent(null)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: 440, padding: '2rem', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setPickingEvent(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(26,54,93,0.07)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(26,54,93,0.5)' }}
            >
              <X size={15} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(240,147,91,0.12)', border: '1px solid rgba(240,147,91,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music size={16} color="var(--coral)" />
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--coral)' }}>Claim Slot</p>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{pickingEvent.facility_name}</h3>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.5)', marginBottom: '1.75rem', marginLeft: '3rem' }}>
              {new Date(pickingEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {pickingEvent.time}
            </p>

            {/* Song count picker */}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(26,54,93,0.6)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Number of songs <span style={{ color: 'var(--coral)' }}>*</span>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {([1, 2] as const).map(n => {
                const hrs = n === 1 ? 2 : 5
                const isSelected = selectedSongs === n
                return (
                  <button
                    key={n}
                    onClick={() => handleSongCountChange(n)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      borderRadius: 12,
                      border: isSelected ? '2px solid var(--coral)' : '1.5px solid rgba(26,54,93,0.12)',
                      background: isSelected ? 'rgba(240,147,91,0.09)' : 'rgba(255,255,255,0.45)',
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isSelected ? 'var(--coral)' : 'var(--navy)', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--coral)' : 'rgba(26,54,93,0.4)', marginTop: 2, fontWeight: 600 }}>
                      song{n > 1 ? 's' : ''}
                    </div>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, marginTop: 4,
                      color: isSelected ? '#1a6a40' : 'rgba(26,54,93,0.35)',
                      background: isSelected ? 'rgba(100,200,150,0.15)' : 'transparent',
                      borderRadius: 6, padding: '1px 6px',
                      transition: 'all 0.16s ease',
                    }}>
                      {hrs}h
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Per-song details */}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(26,54,93,0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Song Details
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {songDetails.map((song, idx) => (
                <div key={idx} style={{ background: 'rgba(26,54,93,0.03)', border: '1px solid rgba(26,54,93,0.08)', borderRadius: 12, padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(240,147,91,0.12)', border: '1px solid rgba(240,147,91,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--coral)' }}>{idx + 1}</span>
                    </div>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'rgba(26,54,93,0.5)' }}>Song {idx + 1}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(26,54,93,0.45)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Song Title</label>
                      <input
                        className="glass-input"
                        placeholder="e.g. Clair de Lune"
                        value={song.title}
                        onChange={e => updateSongDetail(idx, 'title', e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(26,54,93,0.45)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Composer</label>
                      <input
                        className="glass-input"
                        placeholder="e.g. Debussy"
                        value={song.composer}
                        onChange={e => updateSongDetail(idx, 'composer', e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.73rem', color: 'rgba(26,54,93,0.38)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              ℹ️ Song details are optional but help coordinators plan. Hours are logged once an admin approves them after the event.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={confirmClaim}
                className="btn-coral"
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.95rem', borderRadius: 12 }}
              >
                <Check size={15} /> Confirm ({selectedSongs === 1 ? 2 : 5} hrs)
              </button>
              <button
                onClick={() => setPickingEvent(null)}
                className="btn-ghost"
                style={{ padding: '0.75rem 1.25rem', borderRadius: 12 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
