import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import { ArrowLeft, Plus, Phone, Mail, Users, FileText, StickyNote, X } from 'lucide-react'

const TYPE_ICONS = {
  appel:   { icon: Phone,     color: '#185FA5', bg: '#E6F1FB' },
  email:   { icon: Mail,      color: '#854F0B', bg: '#FAEEDA' },
  reunion: { icon: Users,     color: '#3B6D11', bg: '#EAF3DE' },
  note:    { icon: StickyNote,color: '#534AB7', bg: '#EEEDFE' },
  autre:   { icon: FileText,  color: '#5F5E5A', bg: '#F1EFE8' },
}

const TYPE_OPTS = [
  { value:'appel',   label:'Appel téléphonique' },
  { value:'email',   label:'Email'              },
  { value:'reunion', label:'Réunion'            },
  { value:'note',    label:'Note'               },
  { value:'autre',   label:'Autre'              },
]

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient]           = useState(null)
  const [projects, setProjects]       = useState([])
  const [invoices, setInvoices]       = useState([])
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(false)
  const [form, setForm]               = useState({ type:'note', content:'', date:'' })
  const [saving, setSaving]           = useState(false)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      const [cRes, pRes, iRes, intRes] = await Promise.all([
        api.get(`/clients/${id}/`),
        api.get(`/projects/?client=${id}`),
        api.get(`/invoices/?client=${id}`),
        api.get(`/interactions/?client=${id}`),
      ])
      setClient(cRes.data)
      setProjects(pRes.data)
      setInvoices(iRes.data)
      setInteractions(intRes.data)
    } catch { navigate('/clients') }
    finally { setLoading(false) }
  }

  const handleAddInteraction = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/interactions/', {
        client: id,
        type:    form.type,
        content: form.content,
        date:    form.date || new Date().toISOString(),
      })
      setInteractions([data, ...interactions])
      toast.success('Échange enregistré')
      setModal(false)
      setForm({ type:'note', content:'', date:'' })
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const deleteInteraction = async (intId) => {
    if (!window.confirm('Supprimer cet échange ?')) return
    try {
      await api.delete(`/interactions/${intId}/`)
      setInteractions(interactions.filter(i => i.id !== intId))
      toast.success('Supprimé')
    } catch { toast.error('Erreur') }
  }

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)' }}>Chargement...</div>
  if (!client)  return null

  const caTotal = invoices.filter(i => i.status === 'paye').reduce((s,i) => s + parseFloat(i.amount), 0)

  return (
    <div>
      {/* Back + Header */}
      <button onClick={() => navigate('/clients')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', color:'var(--text-muted)', fontSize:13, marginBottom:'1.25rem', padding:0 }}>
        <ArrowLeft size={15}/> Retour aux clients
      </button>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
            {client.name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:600 }}>{client.name}</h1>
            <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:2 }}>
              {client.company && `${client.company} · `}{client.email || client.phone || 'Aucun contact renseigné'}
            </p>
          </div>
        </div>
        <button onClick={() => setModal(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--primary)', color:'#fff', padding:'9px 18px', borderRadius:'var(--radius)', fontWeight:600, fontSize:13 }}>
          <Plus size={15}/> Ajouter un échange
        </button>
      </div>

      {/* KPIs client */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.75rem' }}>
        {[
          { label:'CA généré',       value:`${caTotal.toLocaleString('fr-TN')} TND`, color:'var(--success)' },
          { label:'Projets',         value:projects.length,                           color:'var(--primary)' },
          { label:'Factures',        value:invoices.length,                           color:'var(--info)'    },
          { label:'Échanges',        value:interactions.length,                       color:'var(--warning)' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1rem 1.25rem' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>{kpi.label}</p>
            <p style={{ fontSize:22, fontWeight:600, color:kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:16 }}>

        {/* Historique des échanges */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontSize:14, fontWeight:600 }}>Historique des échanges</h2>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{interactions.length} échange{interactions.length !== 1 ? 's' : ''}</span>
          </div>

          {interactions.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)' }}>
              <p style={{ fontSize:13 }}>Aucun échange enregistré</p>
              <p style={{ fontSize:12, marginTop:4 }}>Ajoute un appel, email ou réunion pour commencer</p>
            </div>
          ) : (
            <div style={{ padding:'0.75rem 1.25rem' }}>
              {interactions.map((inter, idx) => {
                const t = TYPE_ICONS[inter.type] || TYPE_ICONS.autre
                const Icon = t.icon
                return (
                  <div key={inter.id} style={{ display:'flex', gap:12, paddingBottom:16, position:'relative' }}>
                    {/* Timeline line */}
                    {idx < interactions.length - 1 && (
                      <div style={{ position:'absolute', left:18, top:36, bottom:0, width:1, background:'var(--border)' }}/>
                    )}
                    {/* Icon */}
                    <div style={{ width:36, height:36, borderRadius:'50%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
                      <Icon size={15} color={t.color}/>
                    </div>
                    {/* Content */}
                    <div style={{ flex:1, paddingTop:4 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                        <div>
                          <span style={{ fontSize:12, fontWeight:600, color:t.color }}>{inter.type_label}</span>
                          <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:8 }}>
                            {new Date(inter.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                        <button onClick={() => deleteInteraction(inter.id)} style={{ background:'none', color:'var(--text-muted)', padding:2, display:'flex', opacity:0.5 }}>
                          <X size={12}/>
                        </button>
                      </div>
                      <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.5, background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px 12px', border:'1px solid var(--border)' }}>
                        {inter.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar droite */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Projets */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ padding:'0.85rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontSize:14, fontWeight:600 }}>Projets</h2>
            </div>
            <div style={{ padding:'0.5rem 0' }}>
              {projects.length === 0
                ? <p style={{ padding:'1rem 1.25rem', color:'var(--text-muted)', fontSize:13 }}>Aucun projet</p>
                : projects.map(p => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:500 }}>{p.title}</p>
                      {p.budget && <p style={{ fontSize:11, color:'var(--text-muted)' }}>{parseFloat(p.budget).toLocaleString('fr-TN')} TND</p>}
                    </div>
                    <Badge status={p.status}/>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Factures */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ padding:'0.85rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontSize:14, fontWeight:600 }}>Factures</h2>
            </div>
            <div style={{ padding:'0.5rem 0' }}>
              {invoices.length === 0
                ? <p style={{ padding:'1rem 1.25rem', color:'var(--text-muted)', fontSize:13 }}>Aucune facture</p>
                : invoices.map(inv => (
                  <div key={inv.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 1.25rem', borderBottom:'1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize:12, fontFamily:'monospace', fontWeight:600, color:'var(--primary)' }}>{inv.invoice_number}</p>
                      <p style={{ fontSize:11, color:'var(--text-muted)' }}>{parseFloat(inv.amount).toLocaleString('fr-TN')} TND</p>
                    </div>
                    <Badge status={inv.status}/>
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>

      {/* Modal ajout échange */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:460, border:'1px solid var(--border)' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:16, fontWeight:600 }}>Nouvel échange — {client.name}</h2>
              <button onClick={() => setModal(false)} style={{ background:'none', color:'var(--text-muted)', padding:4, display:'flex' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleAddInteraction}>
              <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Type d'échange</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {TYPE_OPTS.map(opt => {
                      const t = TYPE_ICONS[opt.value]
                      const Icon = t.icon
                      return (
                        <button key={opt.value} type="button" onClick={() => setForm({...form, type:opt.value})} style={{
                          display:'flex', alignItems:'center', gap:6,
                          padding:'7px 12px', borderRadius:'var(--radius)',
                          border: form.type === opt.value ? `1.5px solid ${t.color}` : '1px solid var(--border)',
                          background: form.type === opt.value ? t.bg : 'var(--surface)',
                          color: form.type === opt.value ? t.color : 'var(--text-muted)',
                          fontSize:12, fontWeight:500,
                        }}>
                          <Icon size={13}/>{opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Date et heure</label>
                  <input type="datetime-local" value={form.date} onChange={e => setForm({...form, date:e.target.value})}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Contenu *</label>
                  <textarea required rows={4} placeholder="Décris l'échange : sujet abordé, décisions prises, prochaine étape..." value={form.content} onChange={e => setForm({...form, content:e.target.value})} style={{ resize:'vertical' }}/>
                </div>
              </div>
              <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding:'8px 18px', borderRadius:'var(--radius)', border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', fontWeight:500 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ padding:'8px 18px', borderRadius:'var(--radius)', background:'var(--primary)', color:'#fff', fontWeight:600, opacity:saving?0.7:1 }}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}