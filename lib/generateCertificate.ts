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
  const navy  = rgb(0.10, 0.21, 0.36)
  const gold  = rgb(0.72, 0.55, 0.04)
  const white = rgb(1, 1, 1)

  // ── Volunteer name — centered just above the underline ─────
  // Underline rect in template is at PDF-lib y ≈ 347–362.
  // Baseline at 367 puts letter bottoms 5pt above the line top — correct.
  const nameSize = volunteerName.length > 24 ? 22 : 28
  const nameW    = bold.widthOfTextAtSize(volunteerName, nameSize)
  page.drawText(volunteerName, {
    x: (width - nameW) / 2,
    y: 367,
    size: nameSize,
    font: bold,
    color: navy,
  })

  // ── Hours number — centered in the blank (x 204.8–260.2) ──
  // Blank underline in template sits at PDF-lib y ≈ 317.
  const hoursStr  = String(hours)
  const hoursSize = 18
  const hoursW    = bold.widthOfTextAtSize(hoursStr, hoursSize)
  page.drawText(hoursStr, {
    x: 232.5 - hoursW / 2,
    y: 318,
    size: hoursSize,
    font: bold,
    color: gold,
  })

  // ── Today's date — covers hardcoded "on 3/14/2026" ────────
  // Template "on 3/14/2026" spans x 506–636, PDF-lib y 292–318.
  const today    = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
  const dateStr  = `on ${today}`
  const dateSize = 15
  // White-out the old date first
  page.drawRectangle({ x: 503, y: 292, width: 137, height: 26, color: white })
  page.drawText(dateStr, {
    x: 506.2,
    y: 297,
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
