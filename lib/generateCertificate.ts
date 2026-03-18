export async function generateCertificate(volunteerName: string, hours: number) {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')

  // Load the certificate template
  const templateBytes = await fetch('/certificate-template.pdf').then(r => r.arrayBuffer())
  const pdfDoc = await PDFDocument.load(templateBytes)
  const page   = pdfDoc.getPages()[0]
  const { width, height } = page.getSize()
  // width = 792, height = 612  (letter landscape)

  // Fonts
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const normal = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Colors
  const navy = rgb(0.10, 0.21, 0.36)
  const gold = rgb(0.72, 0.55, 0.04)

  // ── Volunteer name — centered on the line ─────────────────
  const nameSize = volunteerName.length > 24 ? 22 : 28
  const nameW    = bold.widthOfTextAtSize(volunteerName, nameSize)
  page.drawText(volunteerName, {
    x: (width - nameW) / 2,
    y: height * 0.50,   // sits just above the line
    size: nameSize,
    font: bold,
    color: navy,
  })

  // ── Hours number — fills the blank in "Has earned ___ Hours" ─
  const hoursStr  = String(hours)
  const hoursSize = 18
  const hoursW    = bold.widthOfTextAtSize(hoursStr, hoursSize)
  // The blank is slightly left of center; nudge it to match
  page.drawText(hoursStr, {
    x: (width / 2) - 118 - hoursW / 2,
    y: height * 0.385,
    size: hoursSize,
    font: bold,
    color: gold,
  })

  // ── Today's date — replaces the hardcoded date at end of line ─
  const today   = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  const dateStr = `on ${today}`
  const dateSize = 11
  const dateW    = normal.widthOfTextAtSize(dateStr, dateSize)
  page.drawText(dateStr, {
    x: (width - dateW) / 2 + 155,
    y: height * 0.352,
    size: dateSize,
    font: normal,
    color: navy,
  })

  // Save + download
  const bytes = await pdfDoc.save()
  const blob  = new Blob([bytes], { type: 'application/pdf' })
  const url   = URL.createObjectURL(blob)
  const a     = document.createElement('a')
  const safe  = volunteerName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')
  a.href      = url
  a.download  = `${safe}_Volunteer_Certificate.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
