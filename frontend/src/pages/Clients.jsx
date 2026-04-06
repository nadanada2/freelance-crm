import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, X, Building2, Mail, Phone } from 'lucide-react'

const EMPTY = { name: '', email: '', phone: '', company: '', address: '', notes: '' }

export default function Clients() {
  const [clients, setClients]   = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/clients/')
      setClients(data)
    } finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (c)  => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, address: c.address, notes: c.notes }); setModal(true) }
  const closeModal = ()   => { setModal(false); setEditing(null); setForm(EMPTY) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const { data } = await api.put(`/clients/${editing.id}/`, form)
        setClients(clients.map(c => c.id === editing.id ? data : c))
        toast.success('Client modifié')
      } else {
        const { data } = await api.post('/clients/', form)
        setClients([data, ...clients])
        toast.success('Client créé')
      }
      closeModal()
    } catch { toast.error('Une erreur est survenue') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return
    try {
      await api.delete(`/clients/${id}/`)
      setClients(clients.filter(c => c.id !== id))
      toast.success('Client supprimé')
    } catch { toast.error('Erreur lors de la suppression') }
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Clients</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <button onClick={openCreate} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--primary)', color: '#fff',
          padding: '9px 18px', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: 13,
        }}>
          <Plus size={15} /> Nouveau client
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: 360 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Société</th>
              <th>Projets</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chargement...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {search ? 'Aucun résultat' : 'Aucun client encore — crée le premier !'}
              </td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'var(--primary-light)', color: 'var(--primary-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{c.email || '—'}</td>
                <td style={{ color: 'var(--text-muted)' }}>{c.phone || '—'}</td>
                <td>
                  {c.company
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Building2 size={13} color="var(--text-muted)" />{c.company}
                      </span>
                    : '—'}
                </td>
                <td>
                  <span style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99 }}>
                    {c.projects_count} projet{c.projects_count !== 1 ? 's' : ''}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(c)} style={{
                      background: 'none', padding: 6, borderRadius: 6,
                      border: '1px solid var(--border)', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center',
                    }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} style={{
                      background: 'none', padding: 6, borderRadius: 6,
                      border: '1px solid var(--border)', color: '#E24B4A',
                      display: 'flex', alignItems: 'center',
                    }}>
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
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 500,
            border: '1px solid var(--border)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>
                {editing ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'name',    label: 'Nom complet *', type: 'text',  placeholder: 'Ahmed Ben Salem',      required: true  },
                  { key: 'email',   label: 'Email',          type: 'email', placeholder: 'ahmed@example.com',    required: false },
                  { key: 'phone',   label: 'Téléphone',      type: 'text',  placeholder: '+216 55 123 456',      required: false },
                  { key: 'company', label: 'Société',         type: 'text',  placeholder: 'Nom de la société',    required: false },
                  { key: 'address', label: 'Adresse',         type: 'text',  placeholder: 'Tunis, Tunisie',       required: false },
                ].map(({ key, label, type, placeholder, required }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input type={type} placeholder={placeholder} required={required} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Notes</label>
                  <textarea rows={3} placeholder="Informations complémentaires..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={{
                  padding: '8px 18px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', background: 'none',
                  color: 'var(--text-muted)', fontWeight: 500,
                }}>
                  Annuler
                </button>
                <button type="submit" disabled={saving} style={{
                  padding: '8px 18px', borderRadius: 'var(--radius)',
                  background: 'var(--primary)', color: '#fff', fontWeight: 600,
                  opacity: saving ? 0.7 : 1,
                }}>
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