import type { Event, Volunteer, EventSignup } from '@/lib/supabase'

export async function generateImpactReport(
  events: Event[],
  volunteers: Volunteer[],
  signups: EventSignup[]
): Promise<void> {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // letter portrait
  const { width, height } = page.getSize()

  const font       = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const navy   = rgb(26 / 255, 54 / 255, 93 / 255)
  const coral  = rgb(240 / 255, 147 / 255, 91 / 255)
  const teal   = rgb(45 / 255, 106 / 255, 106 / 255)
  const light  = rgb(178 / 255, 216 / 255, 216 / 255)
  const gray   = rgb(120 / 255, 140 / 255, 160 / 255)
  const white  = rgb(1, 1, 1)

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // ── Stats ────────────────────────────────────────────────
  const totalEvents      = events.length
  const completedEvents  = events.filter(e => {
    const d = new Date(e.date)
    return d < today
  }).length
  const totalVolunteers  = volunteers.length
  const approvedVols     = volunteers.filter(v => v.status === 'approved').length
  const totalHours       = volunteers.reduce((s, v) => s + (v.hours || 0), 0)
  const totalSignups     = signups.length
  const approvedSignups  = signups.filter(s => s.hours_approved).length
  const facilitiesServed = new Set(events.map(e => e.facility_name)).size

  // ── Background blobs ─────────────────────────────────────
  const drawBlob = (cx: number, cy: number, rx: number, ry: number, r: number, g: number, b: number) => {
    page.drawEllipse({ x: cx, y: cy, xScale: rx, yScale: ry, color: rgb(r, g, b), opacity: 0.07 })
  }
  drawBlob(520, 730, 120, 100, light.red, light.green, light.blue)
  drawBlob(80,  650, 90,  80,  coral.red, coral.green, coral.blue)
  drawBlob(560, 200, 100, 80,  teal.red,  teal.green,  teal.blue)
  drawBlob(50,  150, 70,  60,  light.red, light.green, light.blue)

  // ── Header bar ───────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: navy })

  // Logo circle
  page.drawCircle({ x: 50, y: height - 45, size: 22, color: teal })
  page.drawText('M', { x: 41, y: height - 52, size: 16, font: fontBold, color: white, opacity: 0.9 })

  page.drawText('MELODIES OF CARE', {
    x: 80, y: height - 35, size: 13, font: fontBold, color: white
  })
  page.drawText('Impact Report', {
    x: 80, y: height - 55, size: 10, font: fontOblique, color: rgb(1, 1, 1), opacity: 0.7
  })
  page.drawText(dateStr, {
    x: width - font.widthOfTextAtSize(dateStr, 9) - 30,
    y: height - 50,
    size: 9, font, color: white, opacity: 0.75
  })

  // ── Title section ────────────────────────────────────────
  page.drawText('Our Impact', {
    x: 50, y: height - 130, size: 28, font: fontBold, color: navy
  })
  page.drawText("A summary of Melodies of Care's volunteer program performance.",
    { x: 50, y: height - 153, size: 10, font: fontOblique, color: gray }
  )

  // Coral accent line
  page.drawRectangle({ x: 50, y: height - 162, width: 60, height: 3, color: coral, borderRadius: 2 })

  // ── Stats cards (2×2 grid) ───────────────────────────────
  const cards = [
    { value: String(totalEvents),      label: 'Total Events',       sub: `${completedEvents} completed`, col: navy },
    { value: String(facilitiesServed), label: 'Facilities Served',  sub: 'unique partners',              col: teal },
    { value: String(totalVolunteers),  label: 'Total Volunteers',   sub: `${approvedVols} approved`,     col: coral },
    { value: String(totalHours) + 'h', label: 'Volunteer Hours',    sub: `${approvedSignups}/${totalSignups} approved`, col: teal },
  ]

  const cardW = 118, cardH = 78, cardGap = 14
  const gridX = 50, gridY = height - 290

  cards.forEach((c, i) => {
    const col = i % 2 === 0 ? 0 : 1
    const row = Math.floor(i / 2)
    const x = gridX + col * (cardW + cardGap)
    const y = gridY - row * (cardH + cardGap)

    // Card bg
    page.drawRectangle({ x, y, width: cardW, height: cardH, color: rgb(0.97, 0.98, 1), borderRadius: 8 })
    page.drawRectangle({ x, y: y + cardH - 4, width: cardW, height: 4, color: c.col, borderRadius: 4 })

    page.drawText(c.value, { x: x + 12, y: y + cardH - 34, size: 22, font: fontBold, color: c.col })
    page.drawText(c.label, { x: x + 12, y: y + cardH - 50, size: 9, font: fontBold, color: navy })
    page.drawText(c.sub,   { x: x + 12, y: y + cardH - 62, size: 8, font, color: gray })
  })

  // ── Top Volunteers section ───────────────────────────────
  const topVols = [...volunteers]
    .filter(v => v.hours > 0)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 8)

  const secY = gridY - (cardH + cardGap) * 2 - 30

  page.drawText('Top Volunteers', {
    x: 50, y: secY, size: 14, font: fontBold, color: navy
  })
  page.drawRectangle({ x: 50, y: secY - 8, width: 44, height: 2, color: coral, borderRadius: 1 })

  if (topVols.length === 0) {
    page.drawText('No approved hours recorded yet.', {
      x: 50, y: secY - 28, size: 10, font: fontOblique, color: gray
    })
  } else {
    topVols.forEach((v, i) => {
      const y = secY - 28 - i * 22
      const isFirst = i === 0
      const medalColor = i === 0 ? rgb(1, 0.84, 0) : i === 1 ? rgb(0.75, 0.75, 0.75) : i === 2 ? rgb(0.8, 0.5, 0.2) : gray

      // Row bg
      if (i % 2 === 0) {
        page.drawRectangle({ x: 46, y: y - 5, width: width - 92, height: 20, color: rgb(0.97, 0.98, 1), borderRadius: 4 })
      }

      // Rank circle
      page.drawCircle({ x: 62, y: y + 6, size: 8, color: isFirst ? rgb(1, 0.84, 0) : rgb(0.93, 0.95, 0.97) })
      page.drawText(String(i + 1), {
        x: i < 9 ? 59 : 57, y: y + 3, size: 7, font: fontBold,
        color: isFirst ? rgb(0.6, 0.4, 0) : gray
      })

      page.drawText(v.name, { x: 78, y: y + 3, size: 9, font: isFirst ? fontBold : font, color: navy })
      page.drawText(v.instrument, { x: 200, y: y + 3, size: 8, font, color: gray })

      const hoursLabel = `${v.hours}h`
      page.drawText(hoursLabel, {
        x: width - 50 - fontBold.widthOfTextAtSize(hoursLabel, 10),
        y: y + 3, size: 10, font: fontBold, color: medalColor
      })
    })
  }

  // ── Upcoming Events section ──────────────────────────────
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const evSecY = secY - 28 - Math.max(topVols.length, 1) * 22 - 36

  if (evSecY > 120) {
    page.drawText('Upcoming Events', {
      x: 50, y: evSecY, size: 14, font: fontBold, color: navy
    })
    page.drawRectangle({ x: 50, y: evSecY - 8, width: 48, height: 2, color: teal, borderRadius: 1 })

    if (upcomingEvents.length === 0) {
      page.drawText('No upcoming events scheduled.', {
        x: 50, y: evSecY - 28, size: 10, font: fontOblique, color: gray
      })
    } else {
      upcomingEvents.forEach((ev, i) => {
        const y = evSecY - 28 - i * 20
        const d = new Date(ev.date)
        const dStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        if (i % 2 === 0) {
          page.drawRectangle({ x: 46, y: y - 5, width: width - 92, height: 18, color: rgb(0.97, 0.98, 1), borderRadius: 4 })
        }
        page.drawText(dStr, { x: 55, y: y + 2, size: 8.5, font, color: gray })
        page.drawText(ev.facility_name, { x: 140, y: y + 2, size: 8.5, font: fontBold, color: navy })
        page.drawText(ev.status === 'open' ? 'Open' : 'Filled', { x: 340, y: y + 2, size: 8, font, color: ev.status === 'open' ? teal : coral })
      })
    }
  }

  // ── Footer ───────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 44, color: navy })
  page.drawText('Melodies of Care  •  Impact Report  •  ' + dateStr, {
    x: 50, y: 16, size: 8, font, color: white, opacity: 0.6
  })
  page.drawText('melodiesofcare.org', {
    x: width - 120, y: 16, size: 8, font, color: white, opacity: 0.6
  })

  // ── Download ─────────────────────────────────────────────
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `melodies-of-care-impact-report-${today.toISOString().slice(0, 10)}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
