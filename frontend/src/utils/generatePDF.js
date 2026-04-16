import jsPDF from 'jspdf'

export function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, margin = 20

  // Header violet
  doc.setFillColor(108, 99, 255)
  doc.rect(0, 0, W, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('FreelanceCRM', margin, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Facture professionnelle', margin, 28)

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.invoice_number, W - margin, 22, { align: 'right' })

  // Reset couleur
  doc.setTextColor(26, 26, 46)

  // Infos client
  let y = 55
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(107, 114, 128)
  doc.text('FACTURÉ À', margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 26, 46)
  doc.setFontSize(12)
  doc.text(invoice.client_name || '—', margin, y)
  y += 6

  if (invoice.project_name) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(`Projet : ${invoice.project_name}`, margin, y)
    y += 5
  }

  // Dates à droite
  const dateY = 55
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('Date d\'émission', W - margin - 60, dateY)
  doc.setTextColor(26, 26, 46)
  doc.text(
    invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString('fr-FR') : '—',
    W - margin, dateY, { align: 'right' }
  )
  doc.setTextColor(107, 114, 128)
  doc.text('Date d\'échéance', W - margin - 60, dateY + 8)
  doc.setTextColor(26, 26, 46)
  doc.text(
    invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—',
    W - margin, dateY + 8, { align: 'right' }
  )

  // Séparateur
  y = Math.max(y + 10, 90)
  doc.setDrawColor(232, 232, 236)
  doc.setLineWidth(0.5)
  doc.line(margin, y, W - margin, y)
  y += 10

  // Tableau
  const colW = [90, 30, 30, 30]
  const headers = ['Description', 'Qté', 'Prix unit.', 'Total']
  doc.setFillColor(245, 245, 247)
  doc.rect(margin, y, W - 2 * margin, 10, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  let x = margin + 4
  headers.forEach((h, i) => {
    doc.text(h, x, y + 7)
    x += colW[i]
  })
  y += 14

  // Ligne facture
  const amount = parseFloat(invoice.amount)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(26, 26, 46)
  x = margin + 4
  doc.text(invoice.project_name || 'Prestation freelance', x, y); x += colW[0]
  doc.text('1', x, y); x += colW[1]
  doc.text(`${amount.toFixed(2)} TND`, x, y); x += colW[2]
  doc.text(`${amount.toFixed(2)} TND`, x, y)
  y += 5

  doc.setDrawColor(232, 232, 236)
  doc.line(margin, y, W - margin, y)
  y += 10

  // Total
  doc.setFillColor(108, 99, 255)
  doc.rect(W - margin - 70, y, 70, 14, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL', W - margin - 65, y + 9)
  doc.text(`${amount.toFixed(2)} TND`, W - margin - 4, y + 9, { align: 'right' })
  y += 24

  // Statut
  const statusLabels = { paye: 'PAYÉ', envoye: 'EN ATTENTE', en_retard: 'EN RETARD', brouillon: 'BROUILLON' }
  const statusColors = { paye: [59,109,17], envoye: [133,79,11], en_retard: [163,45,45], brouillon: [136,135,153] }
  const [r, g, b] = statusColors[invoice.status] || [136, 135, 153]
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(r, g, b)
  doc.text(`Statut : ${statusLabels[invoice.status] || invoice.status}`, margin, y)

  // Notes
  if (invoice.notes) {
    y += 10
    doc.setDrawColor(232, 232, 236)
    doc.line(margin, y, W - margin, y)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('NOTES', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 46)
    const lines = doc.splitTextToSize(invoice.notes, W - 2 * margin)
    doc.text(lines, margin, y)
  }

  // Footer
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('Généré avec FreelanceCRM', W / 2, 285, { align: 'center' })

  doc.save(`${invoice.invoice_number}.pdf`)
}