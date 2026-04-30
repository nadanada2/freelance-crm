import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useSort } from '../hooks/useSort.jsx'

const EMPTY = { title: '', description: '', client: '', status: 'lead', budget: '', start_date: '', end_date: '' }

const STATUS_OPTS = [
  { value: 'lead',     label: 'Lead'     },
  { value: 'en_cours', label: 'En cours' },
  { value: 'termine',  label: 'Terminé'  },
  { value: 'annule',   label: 'Annulé'   },
]

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [clients, setClients]   = useState([])
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get('/projects/'), api.get('/clients/')])
      setProjects(pRes.data)
      setClients(cRes.data)
    } finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (p)  => {
    setEditing(p)
    setForm({ title: p.title, description: p.description, client: p.client, status: p.status, budget: p.budget || '', start_date: p.start_date || '', end_date: p.end_date || '' })
    setModal(true)
  }
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, budget: form.budget || null, start_date: form.start_date || null, end_date: form.end_date || null }
      if (editing) {
        const { data } = await api.put(`/projects/${editing.id}/`, payload)
        setProjects(projects.map(p => p.id === editing.id ? data : p))
        toast.success('Projet modifié')
      } else {
        const { data } = await api.post('/projects/', payload)
        setProjects([data, ...projects])
        toast.success('Projet créé')
      }
      closeModal()
    } catch { toast.error('Une erreur est survenue') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce projet ?')) return
    try {
      await api.delete(`/projects/${id}/`)
      setProjects(projects.filter(p => p.id !== id))
      toast.success('Projet supprimé')
    } catch { toast.error('Erreur lors de la suppression') }
  }


  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

    const { sorted: sortedClients, toggleSort, SortIcon } = useSort(filtered, 'name')


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Projets</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            {projects.length} projet{projects.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <button onClick={openCreate} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--primary)', color: '#fff',
          padding: '9px 18px', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: 13,
        }}>
          <Plus size={15} /> Nouveau projet
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {[{ value: 'all', label: 'Tous' }, ...STATUS_OPTS].map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
            padding: '6px 14px', borderRadius: 99,
            fontSize: 12, fontWeight: 500,
            border: filter === opt.value ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            background: filter === opt.value ? 'var(--primary-light)' : 'var(--surface)',
            color: filter === opt.value ? 'var(--primary-dark)' : 'var(--text-muted)',
          }}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')}    style={{ cursor:'pointer', userSelect:'none' }}>PROJET <SortIcon col="name"/></th>
              <th onClick={() => toggleSort('email')}   style={{ cursor:'pointer', userSelect:'none' }}>CLIENT <SortIcon col="email"/></th>
              <th onClick={() => toggleSort('phone')}   style={{ cursor:'pointer', userSelect:'none' }}>ETAT <SortIcon col="phone"/></th>
              <th onClick={() => toggleSort('company')} style={{ cursor:'pointer', userSelect:'none' }}>MONTANT <SortIcon col="company"/></th>
              <th>DEBUT</th>
              <th>FIN</th>
              <th style={{ width:80 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chargement...</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Aucun projet {filter !== 'all' ? 'avec ce statut' : '— crée le premier !'}
              </td></tr>
            )}
            {sortedClients.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.title}</td>
                <td style={{ color: 'var(--text-muted)' }}>{p.client_name}</td>
                <td><Badge status={p.status} /></td>
                <td style={{ fontWeight: 500 }}>
                  {p.budget ? `${parseFloat(p.budget).toLocaleString('fr-TN')} TND` : '—'}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {p.start_date ? new Date(p.start_date).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {p.end_date ? new Date(p.end_date).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(p)} style={{ background: 'none', padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: '#E24B4A', display: 'flex' }}>
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
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>{editing ? 'Modifier le projet' : 'Nouveau projet'}</h2>
              <button onClick={closeModal} style={{ background: 'none', color: 'var(--text-muted)', padding: 4, display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Titre *</label>
                  <input type="text" required placeholder="Nom du projet" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Client *</label>
                  <select required value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}>
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Statut</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Budget (TND)</label>
                    <input type="number" placeholder="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Date début</label>
                    <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Date fin</label>
                    <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Description</label>
                  <textarea rows={3} placeholder="Description du projet..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
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