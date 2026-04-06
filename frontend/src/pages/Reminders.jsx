import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { AlertCircle, Clock, FileWarning, CheckCircle } from 'lucide-react'

export default function Reminders() {
  const [data, setData]       = useState({ overdue: [], inactive: [], unpaid_projects: [] })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchReminders() }, [])

  const fetchReminders = async () => {
    try {
      const [invRes, clientRes, projRes] = await Promise.all([
        api.get('/invoices/'),
        api.get('/clients/'),
        api.get('/projects/'),
      ])
      const invoices = invRes.data
      const clients  = clientRes.data
      const projects = projRes.data

      const overdue = invoices.filter(i => i.status === 'en_retard')

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const inactive = clients.filter(c => new Date(c.created_at) < thirtyDaysAgo && c.projects_count === 0)

      const unpaid_projects = projects.filter(p =>
        p.status === 'termine' &&
        !invoices.some(i => i.project === p.id && i.status === 'paye')
      )

      setData({ overdue, inactive, unpaid_projects })
    } finally { setLoading(false) }
  }

  const total = data.overdue.length + data.inactive.length + data.unpaid_projects.length

  const Section = ({ icon: Icon, color, bg, title, items, emptyMsg, onClick, renderItem }) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: items.length > 0 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14 }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{items.length} alerte{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <span style={{ marginLeft: 'auto', background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
            {items.length}
          </span>
        )}
      </div>
      {items.length === 0
        ? <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>✓ {emptyMsg}</p>
        : items.map((item, idx) => (
          <div key={idx} onClick={() => onClick(item)} style={{
            padding: '1rem 1.25rem', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {renderItem(item)}
          </div>
        ))
      }
    </div>
  )

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Rappels intelligents</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          {total === 0 ? 'Tout est en ordre — aucune action requise ✓' : `${total} action${total > 1 ? 's' : ''} requise${total > 1 ? 's' : ''}`}
        </p>
      </div>

      <Section
        icon={AlertCircle} color="#A32D2D" bg="#FCEBEB"
        title="Factures en retard"
        items={data.overdue}
        emptyMsg="Aucune facture en retard"
        onClick={() => navigate('/invoices')}
        renderItem={inv => <>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: 13 }}>{inv.client_name} — {inv.invoice_number}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {parseFloat(inv.amount).toLocaleString('fr-TN')} TND
              {inv.due_date && ` · Échéance : ${new Date(inv.due_date).toLocaleDateString('fr-FR')}`}
            </p>
          </div>
          <span style={{ fontSize: 12, color: '#A32D2D', fontWeight: 600 }}>Relancer →</span>
        </>}
      />

      <Section
        icon={Clock} color="#854F0B" bg="#FAEEDA"
        title="Clients inactifs depuis +30 jours"
        items={data.inactive}
        emptyMsg="Tous tes clients sont actifs"
        onClick={() => navigate('/clients')}
        renderItem={client => <>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary-dark)', flexShrink: 0 }}>
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: 13 }}>{client.name}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Aucun projet enregistré</p>
          </div>
          <span style={{ fontSize: 12, color: '#854F0B', fontWeight: 600 }}>Contacter →</span>
        </>}
      />

      <Section
        icon={FileWarning} color="#185FA5" bg="#E6F1FB"
        title="Projets terminés sans facture payée"
        items={data.unpaid_projects}
        emptyMsg="Tous les projets terminés sont facturés"
        onClick={() => navigate('/invoices')}
        renderItem={proj => <>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: 13 }}>{proj.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Client : {proj.client_name}
              {proj.budget && ` · Budget : ${parseFloat(proj.budget).toLocaleString('fr-TN')} TND`}
            </p>
          </div>
          <span style={{ fontSize: 12, color: '#185FA5', fontWeight: 600 }}>Facturer →</span>
        </>}
      />
    </div>
  )
}