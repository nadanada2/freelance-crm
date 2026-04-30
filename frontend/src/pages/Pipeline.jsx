import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Plus, X, Building2, Calendar, DollarSign } from 'lucide-react'

const COLUMNS = [
  { id: 'lead',     label: 'Lead',      color: '#888799', bg: '#F1EFE8' },
  { id: 'en_cours', label: 'En cours',  color: '#185FA5', bg: '#E6F1FB' },
  { id: 'termine',  label: 'Terminé',   color: '#3B6D11', bg: '#EAF3DE' },
  { id: 'annule',   label: 'Annulé',    color: '#A32D2D', bg: '#FCEBEB' },
]

export default function Pipeline() {
  const [columns, setColumns] = useState({ lead: [], en_cours: [], termine: [], annule: [] })
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ title: '', client: '', budget: '', end_date: '' })
  const [saving, setSaving]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get('/projects/'), api.get('/clients/')])
      const cols = { lead: [], en_cours: [], termine: [], annule: [] }
      pRes.data.forEach(p => { if (cols[p.status]) cols[p.status].push(p) })
      setColumns(cols)
      setClients(cRes.data)
    } finally { setLoading(false) }
  }

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const srcCol  = [...columns[source.droppableId]]
    const dstCol  = source.droppableId === destination.droppableId
      ? srcCol : [...columns[destination.droppableId]]

    const [moved] = srcCol.splice(source.index, 1)
    const updated = { ...moved, status: destination.droppableId }
    dstCol.splice(destination.index, 0, updated)

    setColumns(prev => ({
      ...prev,
      [source.droppableId]:      srcCol,
      [destination.droppableId]: dstCol,
    }))

    try {
      await api.patch(`/projects/${draggableId}/`, { status: destination.droppableId })
      toast.success(`Déplacé vers "${COLUMNS.find(c => c.id === destination.droppableId)?.label}"`)
    } catch {
      toast.error('Erreur lors du déplacement')
      fetchAll()
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/projects/', {
        ...form,
        status: 'lead',
        budget: form.budget || null,
        end_date: form.end_date || null,
      })
      setColumns(prev => ({ ...prev, lead: [data, ...prev.lead] }))
      toast.success('Projet ajouté au pipeline')
      setModal(false)
      setForm({ title: '', client: '', budget: '', end_date: '' })
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const totalByCol = (id) =>
    columns[id].reduce((s, p) => s + (parseFloat(p.budget) || 0), 0)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      Chargement du pipeline...
    </div>
  )

  return (
    <div style={{ height:'calc(100vh - 120px)', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexShrink:0 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600 }}>Pipeline commercial</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>
            {Object.values(columns).flat().length} opportunité{Object.values(columns).flat().length !== 1 ? 's' : ''} · Glisser-déposer pour changer le statut
          </p>
        </div>
        <button onClick={() => setModal(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--primary)', color:'#fff', padding:'9px 18px', borderRadius:'var(--radius)', fontWeight:600, fontSize:13 }}>
          <Plus size={15}/> Nouvelle opportunité
        </button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, flex:1, minHeight:0 }}>
          {COLUMNS.map(col => (
            <div key={col.id} style={{ display:'flex', flexDirection:'column', minHeight:0 }}>

              {/* Column header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, padding:'0 2px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:col.color }}/>
                  <span style={{ fontWeight:600, fontSize:13 }}>{col.label}</span>
                  <span style={{ background:'var(--border)', color:'var(--text-muted)', fontSize:11, fontWeight:600, padding:'1px 7px', borderRadius:99 }}>
                    {columns[col.id].length}
                  </span>
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>
                  {totalByCol(col.id) > 0 ? `${totalByCol(col.id).toLocaleString('fr-TN')} TND` : '—'}
                </span>
              </div>

              {/* Droppable zone */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex:1, overflowY:'auto',
                      background: snapshot.isDraggingOver ? col.bg : 'transparent',
                      borderRadius:'var(--radius-lg)',
                      border: snapshot.isDraggingOver ? `1.5px dashed ${col.color}` : '1.5px dashed transparent',
                      padding:'6px 4px',
                      transition:'all 0.15s',
                      minHeight:80,
                    }}
                  >
                    {columns[col.id].length === 0 && !snapshot.isDraggingOver && (
                      <div style={{ textAlign:'center', padding:'2rem 1rem', color:'var(--text-muted)', fontSize:12, borderRadius:'var(--radius)', border:'1px dashed var(--border)' }}>
                        Glisser ici
                      </div>
                    )}

                    {columns[col.id].map((project, index) => (
                      <Draggable key={String(project.id)} draggableId={String(project.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => navigate('/projects')}
                            style={{
                              background:'var(--surface)',
                              border:`1px solid ${snapshot.isDragging ? col.color : 'var(--border)'}`,
                              borderRadius:'var(--radius)',
                              padding:'12px',
                              marginBottom:8,
                              cursor:'grab',
                              boxShadow: snapshot.isDragging ? `0 8px 24px rgba(0,0,0,0.12)` : '0 1px 3px rgba(0,0,0,0.04)',
                              transform: snapshot.isDragging ? 'rotate(1.5deg)' : 'none',
                              transition:'box-shadow 0.15s',
                              ...provided.draggableProps.style,
                            }}
                          >
                            <p style={{ fontWeight:600, fontSize:13, marginBottom:6, lineHeight:1.3 }}>{project.title}</p>

                            {project.client_name && (
                              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>
                                <Building2 size={11}/>{project.client_name}
                              </div>
                            )}
                            {project.budget && (
                              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>
                                <DollarSign size={11}/>{parseFloat(project.budget).toLocaleString('fr-TN')} TND
                              </div>
                            )}
                            {project.end_date && (
                              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text-muted)' }}>
                                <Calendar size={11}/>{new Date(project.end_date).toLocaleDateString('fr-FR')}
                              </div>
                            )}

                            <div style={{ marginTop:8, height:3, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
                              <div style={{ height:'100%', borderRadius:99, background:col.color, width: project.status === 'lead' ? '25%' : project.status === 'en_cours' ? '60%' : project.status === 'termine' ? '100%' : '0%' }}/>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal création */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:460, border:'1px solid var(--border)' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:16, fontWeight:600 }}>Nouvelle opportunité</h2>
              <button onClick={() => setModal(false)} style={{ background:'none', color:'var(--text-muted)', padding:4, display:'flex' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Titre du projet *</label>
                  <input required placeholder="Refonte site web..." value={form.title} onChange={e => setForm({...form, title:e.target.value})}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Client *</label>
                  <select required value={form.client} onChange={e => setForm({...form, client:e.target.value})}>
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Budget (TND)</label>
                    <input type="number" placeholder="0" value={form.budget} onChange={e => setForm({...form, budget:e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Date de clôture</label>
                    <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding:'8px 18px', borderRadius:'var(--radius)', border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', fontWeight:500 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ padding:'8px 18px', borderRadius:'var(--radius)', background:'var(--primary)', color:'#fff', fontWeight:600, opacity:saving?0.7:1 }}>
                  {saving ? 'Création...' : 'Ajouter au pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}