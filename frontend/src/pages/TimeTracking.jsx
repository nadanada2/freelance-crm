import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Play, Square, Plus, Trash2, X, Clock, TrendingUp } from 'lucide-react'

const fmt = (min) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m} min`
}

const fmtTimer = (sec) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function TimeTracking() {
  const [entries, setEntries]   = useState([])
  const [projects, setProjects] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState({ project:'', description:'', duration:'', date:'' })
  const [saving, setSaving]     = useState(false)
  const [filterProject, setFilterProject] = useState('all')

  // Timer live
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerProject, setTimerProject] = useState('')
  const [timerDesc, setTimerDesc]       = useState('')
  const intervalRef = useRef(null)

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerRunning])

  const fetchAll = async () => {
    try {
      const [eRes, pRes, sRes] = await Promise.all([
        api.get('/time-entries/'),
        api.get('/projects/'),
        api.get('/time-entries/stats/'),
      ])
      setEntries(eRes.data)
      setProjects(pRes.data)
      setStats(sRes.data)
    } finally { setLoading(false) }
  }

  const startTimer = () => {
    if (!timerProject) return toast.error('Sélectionne un projet d\'abord')
    setTimerRunning(true)
    setTimerSeconds(0)
    toast.success('Timer démarré !')
  }

  const stopTimer = async () => {
    setTimerRunning(false)
    const minutes = Math.ceil(timerSeconds / 60)
    if (minutes < 1) return toast.error('Durée trop courte')
    try {
      const { data } = await api.post('/time-entries/', {
        project:     timerProject,
        description: timerDesc || 'Session de travail',
        duration:    minutes,
        date:        new Date().toISOString().split('T')[0],
      })
      setEntries(prev => [data, ...prev])
      setTimerSeconds(0)
      setTimerProject('')
      setTimerDesc('')
      toast.success(`${fmt(minutes)} enregistré !`)
      fetchAll()
    } catch { toast.error('Erreur') }
  }

  const handleManual = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/time-entries/', {
        ...form,
        duration: parseInt(form.duration),
        date: form.date || new Date().toISOString().split('T')[0],
      })
      setEntries(prev => [data, ...prev])
      toast.success('Entrée ajoutée')
      setModal(false)
      setForm({ project:'', description:'', duration:'', date:'' })
      fetchAll()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette entrée ?')) return
    try {
      await api.delete(`/time-entries/${id}/`)
      setEntries(entries.filter(e => e.id !== id))
      fetchAll()
      toast.success('Supprimé')
    } catch { toast.error('Erreur') }
  }

  const filtered = filterProject === 'all' ? entries : entries.filter(e => e.project === parseInt(filterProject))

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--text-muted)' }}>Chargement...</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600 }}>Suivi du temps</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>
            Total : <strong>{stats ? fmt(stats.total_minutes) : '—'}</strong> enregistrées
          </p>
        </div>
        <button onClick={() => setModal(true)} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--primary)', color:'#fff', padding:'9px 18px', borderRadius:'var(--radius)', fontWeight:600, fontSize:13 }}>
          <Plus size={15}/> Saisie manuelle
        </button>
      </div>

      {/* Timer live */}
      <div style={{ background:'var(--surface)', border:`2px solid ${timerRunning ? 'var(--primary)' : 'var(--border)'}`, borderRadius:'var(--radius-lg)', padding:'1.5rem', marginBottom:'1.5rem', transition:'border-color 0.2s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
          <Clock size={16} color={timerRunning ? 'var(--primary)' : 'var(--text-muted)'}/>
          <h2 style={{ fontSize:14, fontWeight:600 }}>Timer en temps réel</h2>
          {timerRunning && (
            <span style={{ marginLeft:'auto', fontSize:11, background:'var(--primary-light)', color:'var(--primary-dark)', padding:'2px 10px', borderRadius:99, fontWeight:600, animation:'pulse 1.5s infinite' }}>
              ● En cours
            </span>
          )}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:12, alignItems:'end' }}>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Projet</label>
            <select value={timerProject} onChange={e => setTimerProject(e.target.value)} disabled={timerRunning}>
              <option value="">Sélectionner...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Description</label>
            <input placeholder="Sur quoi tu travailles ?" value={timerDesc} onChange={e => setTimerDesc(e.target.value)} disabled={timerRunning}/>
          </div>

          {/* Chrono */}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'monospace', fontSize:28, fontWeight:700, color: timerRunning ? 'var(--primary)' : 'var(--text-muted)', letterSpacing:2, lineHeight:1 }}>
              {fmtTimer(timerSeconds)}
            </div>
          </div>

          {/* Bouton start/stop */}
          {!timerRunning ? (
            <button onClick={startTimer} style={{ display:'flex', alignItems:'center', gap:7, background:'var(--primary)', color:'#fff', padding:'10px 20px', borderRadius:'var(--radius)', fontWeight:600, fontSize:14, whiteSpace:'nowrap' }}>
              <Play size={16} fill="white"/> Démarrer
            </button>
          ) : (
            <button onClick={stopTimer} style={{ display:'flex', alignItems:'center', gap:7, background:'#A32D2D', color:'#fff', padding:'10px 20px', borderRadius:'var(--radius)', fontWeight:600, fontSize:14, whiteSpace:'nowrap' }}>
              <Square size={16} fill="white"/> Arrêter
            </button>
          )}
        </div>
      </div>

      {/* Stats par projet */}
      {stats && stats.by_project.length > 0 && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
            <TrendingUp size={15} color="var(--primary)"/>
            <h2 style={{ fontSize:14, fontWeight:600 }}>Répartition par projet</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {stats.by_project.map(p => {
              const pct = stats.total_minutes > 0 ? Math.round((p.total_minutes / stats.total_minutes) * 100) : 0
              return (
                <div key={p.project_id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:500 }}>{p.project_name}</span>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{fmt(p.total_minutes)} · {pct}%</span>
                  </div>
                  <div style={{ height:6, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:99, background:'var(--primary)', width:`${pct}%`, transition:'width 0.4s' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filtre + liste */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', alignItems:'center' }}>
        <span style={{ fontSize:13, fontWeight:500 }}>Filtrer :</span>
        <button onClick={() => setFilterProject('all')} style={{ padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:500, border: filterProject === 'all' ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: filterProject === 'all' ? 'var(--primary-light)' : 'var(--surface)', color: filterProject === 'all' ? 'var(--primary-dark)' : 'var(--text-muted)' }}>Tous</button>
        {projects.map(p => (
          <button key={p.id} onClick={() => setFilterProject(p.id)} style={{ padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:500, border: filterProject === p.id ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: filterProject === p.id ? 'var(--primary-light)' : 'var(--surface)', color: filterProject === p.id ? 'var(--primary-dark)' : 'var(--text-muted)' }}>
            {p.title}
          </button>
        ))}
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Projet</th>
              <th>Description</th>
              <th>Date</th>
              <th>Durée</th>
              <th style={{ width:50 }}>—</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
                Aucune entrée — démarre le timer ou ajoute manuellement
              </td></tr>
            )}
            {filtered.map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight:500 }}>{e.project_name}</td>
                <td style={{ color:'var(--text-muted)' }}>{e.description || '—'}</td>
                <td style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(e.date).toLocaleDateString('fr-FR')}</td>
                <td>
                  <span style={{ background:'var(--primary-light)', color:'var(--primary-dark)', fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:99 }}>
                    {fmt(e.duration)}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleDelete(e.id)} style={{ background:'none', padding:6, borderRadius:6, border:'1px solid var(--border)', color:'#E24B4A', display:'flex' }}>
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal saisie manuelle */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:440, border:'1px solid var(--border)' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:16, fontWeight:600 }}>Saisie manuelle</h2>
              <button onClick={() => setModal(false)} style={{ background:'none', color:'var(--text-muted)', padding:4, display:'flex' }}><X size={18}/></button>
            </div>
            <form onSubmit={handleManual}>
              <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Projet *</label>
                  <select required value={form.project} onChange={e => setForm({...form, project:e.target.value})}>
                    <option value="">Sélectionner un projet</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Description</label>
                  <input placeholder="Développement, réunion client..." value={form.description} onChange={e => setForm({...form, description:e.target.value})}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Durée (minutes) *</label>
                    <input type="number" required min="1" placeholder="90" value={form.duration} onChange={e => setForm({...form, duration:e.target.value})}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Date</label>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding:'8px 18px', borderRadius:'var(--radius)', border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', fontWeight:500 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ padding:'8px 18px', borderRadius:'var(--radius)', background:'var(--primary)', color:'#fff', fontWeight:600, opacity:saving?0.7:1 }}>
                  {saving ? 'Enregistrement...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}