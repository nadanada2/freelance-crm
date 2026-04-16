import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { FileText, Clock, AlertCircle } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

const PIE_COLORS = {
  paye:      '#3B6D11',
  envoye:    '#854F0B',
  en_retard: '#A32D2D',
  brouillon: '#888799',
}

export default function Dashboard() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [cRes, pRes, iRes] = await Promise.all([
        api.get('/clients/'),
        api.get('/projects/'),
        api.get('/invoices/'),
      ])
      const clients  = cRes.data
      const projects = pRes.data
      const invoices = iRes.data

      const ca      = invoices.filter(i => i.status === 'paye').reduce((s,i) => s + parseFloat(i.amount), 0)
      const pending = invoices.filter(i => i.status === 'envoye').reduce((s,i) => s + parseFloat(i.amount), 0)
      const overdue = invoices.filter(i => i.status === 'en_retard')

      const thirtyAgo = new Date()
      thirtyAgo.setDate(thirtyAgo.getDate() - 30)
      const inactive = clients.filter(c => new Date(c.created_at) < thirtyAgo && c.projects_count === 0)

      // CA mensuel (12 derniers mois)
      const now = new Date()
      const monthly = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        const label = MONTHS[d.getMonth()]
        const total = invoices
          .filter(inv => {
            const id = new Date(inv.issued_date)
            return inv.status === 'paye' &&
              id.getMonth() === d.getMonth() &&
              id.getFullYear() === d.getFullYear()
          })
          .reduce((s, inv) => s + parseFloat(inv.amount), 0)
        return { mois: label, ca: Math.round(total) }
      })

      // Projets par statut (bar chart)
      const statusCounts = [
        { label: 'Lead',     count: projects.filter(p => p.status === 'lead').length,     fill: '#888799' },
        { label: 'En cours', count: projects.filter(p => p.status === 'en_cours').length,  fill: '#185FA5' },
        { label: 'Terminé',  count: projects.filter(p => p.status === 'termine').length,   fill: '#3B6D11' },
        { label: 'Annulé',   count: projects.filter(p => p.status === 'annule').length,    fill: '#A32D2D' },
      ]

      // Factures par statut (pie)
      const pieData = ['paye','envoye','en_retard','brouillon'].map(s => ({
        name: s,
        value: invoices.filter(i => i.status === s).length,
      })).filter(d => d.value > 0)

      setData({ ca, pending, clients, projects, invoices, overdue, inactive, monthly, statusCounts, pieData })
    } finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      Chargement...
    </div>
  )

  const labels = { paye: 'Payé', envoye: 'Envoyé', en_retard: 'En retard', brouillon: 'Brouillon' }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600 }}>Bonjour, {user?.username} 👋</h1>
          <p style={{ color:'var(--text-muted)', marginTop:4, fontSize:13 }}>Voici un résumé de ton activité</p>
        </div>
        <button onClick={() => navigate('/clients')} style={{ background:'var(--primary)', color:'#fff', padding:'9px 18px', borderRadius:'var(--radius)', fontWeight:600, fontSize:13 }}>
          + Nouveau client
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:'1.75rem' }}>
        <StatCard label="CA total (payé)"    value={`${data.ca.toLocaleString('fr-TN')} TND`}   sub="Factures encaissées"  subColor="var(--success)" />
        <StatCard label="En attente"          value={`${data.pending.toLocaleString('fr-TN')} TND`} sub="Factures envoyées"    subColor="var(--warning)" />
        <StatCard label="Clients actifs"      value={data.clients.length}                           sub="Total du carnet"      subColor="var(--info)"    />
        <StatCard label="Projets en cours"    value={data.projects.filter(p=>p.status==='en_cours').length} sub="Missions actives" subColor="var(--primary)" />
      </div>

      {/* Graphiques row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>

        {/* Area chart CA mensuel */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.25rem' }}>
          <h2 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Chiffre d'affaires — 6 derniers mois</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.monthly}>
              <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="mois" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => v > 0 ? `${(v/1000).toFixed(1)}k` : '0'} />
              <Tooltip
                contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                formatter={v => [`${v.toLocaleString('fr-TN')} TND`, 'CA']}
              />
              <Area type="monotone" dataKey="ca" stroke="#6C63FF" strokeWidth={2} fill="url(#caGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart factures */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.25rem' }}>
          <h2 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Répartition factures</h2>
          {data.pieData.length === 0
            ? <p style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:'4rem', fontSize:13 }}>Aucune facture</p>
            : <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data.pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {data.pieData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                    formatter={(v, n) => [v, labels[n]]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 12px', marginTop:8 }}>
                {data.pieData.map(d => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[d.name] }}/>
                    <span style={{ color:'var(--text-muted)' }}>{labels[d.name]}</span>
                    <span style={{ fontWeight:600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          }
        </div>
      </div>

      {/* Graphiques row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Bar chart projets par statut */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.25rem' }}>
          <h2 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Projets par statut</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.statusCounts} barSize={32}>
              <XAxis dataKey="label" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
              <Tooltip
                contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                formatter={v => [v, 'projets']}
              />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {data.statusCounts.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rappels */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontSize:14, fontWeight:600 }}>Rappels</h2>
            {(data.overdue.length + data.inactive.length) > 0 && (
              <span style={{ background:'var(--danger-bg)', color:'var(--danger)', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>
                {data.overdue.length + data.inactive.length} alertes
              </span>
            )}
          </div>
          <div style={{ padding:'0.25rem 0' }}>
            {data.overdue.length === 0 && data.inactive.length === 0
              ? <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>Tout est en ordre ✓</p>
              : <>
                {data.overdue.map(inv => (
                  <div key={inv.id} onClick={() => navigate('/invoices')} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 1.25rem', borderBottom:'1px solid var(--border)', cursor:'pointer' }}>
                    <FileText size={14} color="var(--danger)" style={{ flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:500 }}>{inv.client_name} — en retard</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)' }}>{inv.invoice_number} · {parseFloat(inv.amount).toLocaleString('fr-TN')} TND</p>
                    </div>
                  </div>
                ))}
                {data.inactive.map(c => (
                  <div key={c.id} onClick={() => navigate('/clients')} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 1.25rem', borderBottom:'1px solid var(--border)', cursor:'pointer' }}>
                    <Clock size={14} color="var(--warning)" style={{ flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:500 }}>{c.name} — inactif</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)' }}>+30 jours sans contact</p>
                    </div>
                  </div>
                ))}
              </>
            }
          </div>
        </div>
      </div>

      {/* Dernières factures */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <div style={{ padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:14, fontWeight:600 }}>Dernières factures</h2>
          <button onClick={() => navigate('/invoices')} style={{ background:'none', color:'var(--primary)', fontSize:12, fontWeight:500, padding:'4px 10px', border:'1px solid var(--primary)', borderRadius:6 }}>
            Voir tout
          </button>
        </div>
        <table>
          <thead>
            <tr><th>N°</th><th>Client</th><th>Montant</th><th>Statut</th><th>Échéance</th></tr>
          </thead>
          <tbody>
            {data.invoices.slice(0,5).map(inv => (
              <tr key={inv.id} style={{ cursor:'pointer' }} onClick={() => navigate('/invoices')}>
                <td style={{ fontFamily:'monospace', fontSize:12, fontWeight:600, color:'var(--primary)' }}>{inv.invoice_number}</td>
                <td>{inv.client_name}</td>
                <td style={{ fontWeight:600 }}>{parseFloat(inv.amount).toLocaleString('fr-TN')} TND</td>
                <td><Badge status={inv.status}/></td>
                <td style={{ color:'var(--text-muted)', fontSize:12 }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
            {data.invoices.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>Aucune facture</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}