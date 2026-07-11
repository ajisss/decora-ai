function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function loadImage(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Composes the one-page A4 vendor brief: image, wedding details, checklist (ux-spec §9.3).
export async function buildBriefPdf({ project, generation, versionNumber }) {
  // M9: jsPDF (~350 kB) dimuat saat ekspor pertama saja, bukan di bundle utama.
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(project.name, margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(new Date().toLocaleDateString('id-ID'), pageWidth - margin, y - 12, { align: 'right' })
  doc.text('Dibuat dengan Decora AI', pageWidth - margin, y, { align: 'right' })
  y += 20

  const imageDataUrl = await loadImage(generation.imageId)
  const imgWidth = pageWidth - margin * 2
  const imgHeight = imgWidth * (2 / 3)
  doc.addImage(imageDataUrl, 'PNG', margin, y, imgWidth, imgHeight)
  y += imgHeight + 20

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Detail Pernikahan', margin, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const details = [
    ['Tema', project.setup.theme],
    ['Gaya', project.setup.style || '—'],
    ['Venue', project.setup.venueType],
    ['Ukuran', project.setup.venueSize],
    ['Tamu', String(project.setup.guestCapacity)],
    ['Kelas budget', project.setup.budgetTier],
  ]
  details.forEach(([label, value], i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    doc.text(`${label}: ${value}`, margin + col * (imgWidth / 2), y + row * 14)
  })
  y += Math.ceil(details.length / 2) * 14 + 16

  const items = (generation.analysis?.items ?? []).filter((it) => it.included)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Checklist Dekorasi', margin, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  if (items.length === 0) {
    doc.text('Tidak ada item terpilih.', margin, y)
  } else {
    const { content } = await import('../../content.js')
    const categoryLabels = content.app.analyze.categoryLabels
    for (const item of items) {
      if (y > 780) {
        doc.addPage()
        y = margin
      }
      const qty = item.estimatedQuantity ? ` (${item.estimatedQuantity})` : ''
      const cost = item.estimatedCost ? `  —  Rp ${Number(item.estimatedCost).toLocaleString('id-ID')}` : ''
      doc.text(`[x] ${categoryLabels[item.category] ?? item.category}: ${item.name}${qty}${cost}`, margin, y)
      y += 12
      if (item.note) {
        doc.setFont('helvetica', 'italic')
        doc.text(`  ${item.note}`, margin, y)
        doc.setFont('helvetica', 'normal')
        y += 12
      }
    }

    const totalCost = items.reduce((sum, i) => sum + (Number(i.estimatedCost) || 0), 0)
    if (totalCost > 0) {
      y += 6
      doc.setFont('helvetica', 'bold')
      doc.text(`Estimasi total: Rp ${totalCost.toLocaleString('id-ID')}`, margin, y)
      doc.setFont('helvetica', 'normal')
    }
  }

  doc.save(`${slugify(project.name)}-brief-design-${versionNumber}.pdf`)
}

// The `download` attribute is ignored by browsers for cross-origin URLs (the
// image now lives on Vercel Blob's CDN, not same-origin) — fetch it and
// download via a same-origin blob: URL instead.
export async function downloadPng(generation, project, versionNumber) {
  const res = await fetch(generation.imageId)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = `${slugify(project.name)}-design-${versionNumber}.png`
  a.click()
  URL.revokeObjectURL(objectUrl)
}
