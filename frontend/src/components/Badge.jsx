const colors = {
  lead:      { bg: '#F1EFE8', color: '#5F5E5A' },
  en_cours:  { bg: '#E6F1FB', color: '#185FA5' },
  termine:   { bg: '#EAF3DE', color: '#3B6D11' },
  annule:    { bg: '#FCEBEB', color: '#A32D2D' },
  brouillon: { bg: '#F1EFE8', color: '#5F5E5A' },
  envoye:    { bg: '#FAEEDA', color: '#854F0B' },
  paye:      { bg: '#EAF3DE', color: '#3B6D11' },
  en_retard: { bg: '#FCEBEB', color: '#A32D2D' },
}

const labels = {
  lead: 'Lead', en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé',
  brouillon: 'Brouillon', envoye: 'Envoyé', paye: 'Payé', en_retard: 'En retard',
}

export default function Badge({ status }) {
  const s = colors[status] || { bg: '#eee', color: '#555' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '11px', fontWeight: 600,
      padding: '3px 10px', borderRadius: '99px',
      display: 'inline-block',
    }}>
      {labels[status] || status}
    </span>
  )
}