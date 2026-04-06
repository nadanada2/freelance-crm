import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { AlertCircle, Clock, FileText } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats]       = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
        api.get('/clients/'),
        api.get('/projects/'),
        api.get('/invoices/'),
      ])

      const clients  = clientsRes.data
      const projects = projectsRes.data
      const allInvoices = invoicesRes.data

      const ca       = allInvoices.filter(i => i.status === 'paye').reduce((s, i) => s + parseFloat(i.amount), 0)
      const pending  = allInvoices.filter(i => i.status === 'envoye').reduce((s, i) => s + parseFloat(i.amount), 0)
      const overdue  = allInvoices.filter(i => i.status === 'en_retard')
      const active   = clients.length
      const inProgress = projects.filter(p => p.status === 'en_cours').length

      // Clients sans contact depuis 30 jours
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const inactiveClients = clients.filter(c => new Date(c.created_at) < thirtyDaysAgo && c.projects_count === 0)

      setStats({ ca, pending, active, inProgress, overdue, inactiveClients })
      setInvoices(allInvoices.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      Chargement...
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>
            Bonjour, {user?.username} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 13 }}>
            Voici un résumé de ton activité
          </p>
        </div>
        <button
          onClick={() => navigate('/clients')}
          style={{
            background: 'var(--primary)', color: '#fff',
            padding: '9px 18px', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: 13,
          }}
        >
          + Nouveau client
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '2rem' }}>
        <StatCard
          label="CA total (payé)"
          value={`${stats.ca.toLocaleString('fr-TN')} TND`}
          sub="Factures encaissées"
          subColor="var(--success)"
        />
        <StatCard
          label="En attente"
          value={`${stats.pending.toLocaleString('fr-TN')} TND`}
          sub="Factures envoyées"
          subColor="var(--warning)"
        />
        <StatCard
          label="Clients actifs"
          value={stats.active}
          sub="Total du carnet"
          subColor="var(--info)"
        />
        <StatCard
          label="Projets en cours"
          value={stats.inProgress}
          sub="Missions actives"
          subColor="var(--primary)"
        />
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* Dernières factures */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Dernières factures</h2>
            <button onClick={() => navigate('/invoices')} style={{
              background: 'none', color: 'var(--primary)',
              fontSize: 12, fontWeight: 500, padding: '4px 10px',
              border: '1px solid var(--primary)', borderRadius: 6,
            }}>
              Voir tout
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Échéance</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Aucune facture pour l'instant
                </td></tr>
              )}
              {invoices.map(inv => (
                <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/invoices')}>
                  <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12 }}>{inv.invoice_number}</td>
                  <td>{inv.client_name}</td>
                  <td style={{ fontWeight: 500 }}>{parseFloat(inv.amount).toLocaleString('fr-TN')} TND</td>
                  <td><Badge status={inv.status} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rappels */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Rappels</h2>
            {(stats.overdue.length + stats.inactiveClients.length) > 0 && (
              <span style={{ background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>
                {stats.overdue.length + stats.inactiveClients.length} alertes
              </span>
            )}
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            {stats.overdue.length === 0 && stats.inactiveClients.length === 0 && (
              <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Tout est en ordre ✓
              </p>
            )}

            {stats.overdue.map(inv => (
              <div key={inv.id}
                onClick={() => navigate('/invoices')}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <FileText size={15} color="#A32D2D" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{inv.client_name} — facture en retard</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {inv.invoice_number} · {parseFloat(inv.amount).toLocaleString('fr-TN')} TND
                  </p>
                </div>
              </div>
            ))}

            {stats.inactiveClients.map(client => (
              <div key={client.id}
                onClick={() => navigate('/clients')}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <Clock size={15} color="#854F0B" style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{client.name} — client inactif</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Aucun projet depuis +30 jours</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}