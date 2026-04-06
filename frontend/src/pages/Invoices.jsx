import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import { Plus, Pencil, Trash2, X, CheckCircle } from 'lucide-react'

const EMPTY = { client: '', project: '', amount: '', status: 'brouillon', issued_date: '', due_date: '', notes: '' }

const STATUS_OPTS = [
  { value: 'brouillon',  label: 'Brouillon'  },
  { value: 'envoye',     label: 'Envoyé'     },
  { value: 'paye',       label: 'Payé'       },
  { value: 'en_retard',  label: 'En retard'  },
]

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients]   = useState([])
  const [projects, setProjects] = useState([])
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [iRes, cRes, pRes] = await Promise.all([api.get('/invoices/'), api.get('/clients/'), api.get('/projects/')])
      setInvoices(iRes.data); setClients(cRes.data); setProjects(pRes.data)
    } finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (inv) => {
    setEditing(inv)
    setForm({ client: inv.client, project: inv.project || '', amount: inv.amount, status: inv.status, issued_date: inv.issued_date || '', due_date: inv.due_date || '', notes: inv.notes })
    setModal(true)
  }
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY) }

  const markAsPaid = async (inv) => {
    try {
      const { data } = await api.patch(`/invoices/${inv.id}/`, { status: 'paye' })
      setInvoices(invoices.map(i => i.id === inv.id ? data : i))
      toast.success('Facture marquée comme payée ✓')
    } catch { toast.error('Erreur') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, project: form.project || null, issued_date: form.issued_date || null, due_date: form.due_date || null }
      if (editing) {
        const { data } = await api.put(`/invoices/${editing.id}/`, payload)
        setInvoices(invoices.map(i => i.id === editing.id ? data : i))
        toast.success('Facture modifiée')
      } else {
        const { data } = await api.post('/invoices/', payload)
        setInvoices([data, ...invoices])
        toast.success('Facture créée')
      }
      closeModal()
    } catch { toast.error('Une erreur est survenue') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette facture ?')) return
    try {
      await api.delete(`/invoices/${id}/`)
      setInvoices(invoices.filter(i => i.id !== id))
      toast.success('Facture supprimée')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)
  const totalFiltered = filtered.reduce((s, i) => s + parseFloat(i.amount), 0)
  const clientProjects = projects.filter(p => p.client === parseInt(form.client))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Factures</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            {invoices.length} facture{invoices.length !== 1 ? 's' : ''} · Total affiché : <strong>{totalFiltered.toLocaleString('fr-TN')} TND</strong>
          </p>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', padding: '9px 18px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 13 }}>
          <Plus size={15} /> Nouvelle facture
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {[{ value: 'all', label: 'Toutes' }, ...STATUS_OPTS].map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, border: filter === opt.value ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: filter === opt.value ? 'var(--primary-light)' : 'var(--surface)', color: filter === opt.value ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Client</th>
              <th>Projet</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Échéance</th>
              <th style={{ width: 110 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chargement...</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Aucune facture {filter !== 'all' ? 'avec ce statut' : '— crée la première !'}
              </td></tr>
            )}
            {filtered.map(inv => (
              <tr key={inv.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--primary-dark)' }}>{inv.invoice_number}</td>
                <td style={{ fontWeight: 500 }}>{inv.client_name}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{inv.project_name || '—'}</td>
                <td style={{ fontWeight: 600 }}>{parseFloat(inv.amount).toLocaleString('fr-TN')} TND</td>
                <td><Badge status={inv.status} /></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {inv.status !== 'paye' && (
                      <button onClick={() => markAsPaid(inv)} title="Marquer payé" style={{ background: 'none', padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: '#3B6D11', display: 'flex' }}>
                        <CheckCircle size={13} />
                      </button>
                    )}
                    <button onClick={() => openEdit(inv)} style={{ background: 'none', padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(inv.id)} style={{ background: 'none', padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: '#E24B4A', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 520, border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>{editing ? 'Modifier la facture' : 'Nouvelle facture'}</h2>
              <button onClick={closeModal} style={{ background: 'none', color: 'var(--text-muted)', padding: 4, display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Client *</label>
                  <select required value={form.client} onChange={e => setForm({ ...form, client: e.target.value, project: '' })}>
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Projet lié (optionnel)</label>
                  <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} disabled={!form.client}>
                    <option value="">Aucun projet</option>
                    {clientProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Montant (TND) *</label>
                    <input type="number" step="0.01" required placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Statut</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Date d'émission</label>
                    <input type="date" value={form.issued_date} onChange={e => setForm({ ...form, issued_date: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Date d'échéance</label>
                    <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Notes</label>
                  <textarea rows={3} placeholder="Notes ou conditions de paiement..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={{ padding: '8px 18px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 18px', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}