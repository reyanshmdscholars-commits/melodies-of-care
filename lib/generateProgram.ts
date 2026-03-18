import type { Event } from './supabase'

export type ProgramEntry = {
  volunteer_name: string
  instrument: string
  songs: number
  song_details: { title: string; composer: string }[] | null
}

export async function generateEventProgram(event: Event, entries: ProgramEntry[]) {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  // Load the template
  const templateBytes = await fetch('/program-template.pdf').then(r => r.arrayBuffer())
  const pdfDoc = await PDFDocument.load(templateBytes)
  const page = pdfDoc.getPages()[0]
  const { width, height } = page.getSize()
  // width ≈ 297.8, height ≈ 419.2

  // Fonts
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const normal = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  // Colors
  const teal  = rgb(0.18, 0.55, 0.55)
  const navy  = rgb(0.10, 0.21, 0.36)
  const gray  = rgb(0.47, 0.56, 0.64)

  // ── Title: facility + RECITAL ─────────────────────────────
  const titleText = `${event.facility_name.toUpperCase()} RECITAL`
  const titleSize = titleText.length > 22 ? 9 : 11
  const titleW    = bold.widthOfTextAtSize(titleText, titleSize)
  page.drawText(titleText, {
    x: (width - titleW) / 2,
    y: height - 68,
    size: titleSize,
    font: bold,
    color: teal,
  })

  // "program" italic below
  const progText = 'program'
  const progSize = 13
  const progW    = italic.widthOfTextAtSize(progText, progSize)
  page.drawText(progText, {
    x: (width - progW) / 2,
    y: height - 83,
    size: progSize,
    font: italic,
    color: teal,
  })

  // Date + time
  const dateStr = new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  })
  const subText = `${dateStr}  ·  ${event.time}`
  const subW    = normal.widthOfTextAtSize(subText, 6)
  page.drawText(subText, {
    x: (width - subW) / 2,
    y: height - 95,
    size: 6,
    font: normal,
    color: gray,
  })

  // ── Entries ───────────────────────────────────────────────
  const LEFT  = 22
  const RIGHT = width / 2 + 8
  let y = height - 113

  for (const entry of entries) {
    const songs = (entry.song_details ?? []).filter(s => s.title || s.composer)
    const rows  = Math.max(songs.length, 1)
    const entryH = rows * 14 + 8

    // Stop before footer area
    if (y - entryH < 38) break

    // Performer name
    page.drawText(entry.volunteer_name.toUpperCase(), {
      x: LEFT, y,
      size: 7, font: bold, color: navy,
    })
    // Instrument
    page.drawText(entry.instrument.toUpperCase(), {
      x: LEFT, y: y - 8,
      size: 5.5, font: normal, color: gray,
    })

    // Songs
    if (songs.length > 0) {
      songs.forEach((song, i) => {
        const sy = y - i * 14
        if (song.title) {
          page.drawText(song.title.toUpperCase(), {
            x: RIGHT, y: sy,
            size: 7, font: bold, color: teal,
          })
        }
        if (song.composer) {
          page.drawText(song.composer.toUpperCase(), {
            x: RIGHT, y: sy - 8,
            size: 5.5, font: normal, color: gray,
          })
        }
      })
    } else {
      page.drawText(`${entry.songs} SONG${entry.songs !== 1 ? 'S' : ''}`, {
        x: RIGHT, y,
        size: 7, font: normal, color: teal,
      })
    }

    // Dotted divider line
    const divY = y - (rows - 1) * 14 - 12
    const dotSpacing = 3
    for (let dx = LEFT; dx < width - LEFT; dx += dotSpacing) {
      page.drawCircle({ x: dx, y: divY, size: 0.4, color: teal })
    }

    y = divY - 6
  }

  // Save + download
  const bytes = await pdfDoc.save()
  const blob  = new Blob([bytes], { type: 'application/pdf' })
  const url   = URL.createObjectURL(blob)
  const a     = document.createElement('a')
  const safe  = event.facility_name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')
  a.href      = url
  a.download  = `${safe}_Program_${event.date}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
