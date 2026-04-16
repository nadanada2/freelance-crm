import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, FolderOpen, FileText } from 'lucide-react'
import api from '../api/axios'

export default function GlobalSearch() {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState({ clients:[], projects:[], invoices:[] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Raccourci clavier Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults({ clients:[], projects:[], invoices:[] }); return }
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const search = async (q) => {
    setLoading(true)
    try {
      const [cRes, pRes, iRes] = await Promise.all([
        api.get('/clients/'), api.get('/projects/'), api.get('/invoices/')
      ])
      const lq = q.toLowerCase()
      setResults({
        clients:  cRes.data.filter(c => c.name.toLowerCase().includes(lq) || c.email.toLowerCase().includes(lq) || c.company?.toLowerCase().includes(lq)),
        projects: pRes.data.filter(p => p.title.toLowerCase().includes(lq) || p.client_name?.toLowerCase().includes(lq)),
        invoices: iRes.data.filter(i => i.invoice_number.toLowerCase().includes(lq) || i.client_name?.toLowerCase().includes(lq)),
      })
    } finally { setLoading(false) }
  }

  const go = (path) => { navigate(path); setOpen(false); setQuery('') }

  const total = results.clients.length + results.projects.length + results.invoices.length

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      display:'flex', alignItems:'center', gap:8,
      background:'var(--bg)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', padding:'7px 14px',
      color:'var(--text-muted)', fontSize:13, cursor:'pointer',
      minWidth:200,
    }}>
      <Search size={14}/>
      <span>Rechercher...</span>
      <span style={{ marginLeft:'auto', fontSize:11, background:'var(--border)', padding:'2px 6px', borderRadius:4 }}>Ctrl K</span>
    </button>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:2000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'8vh' }}
      onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div style={{ width:'100%', maxWidth:560, background:'var(--surface)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>

        {/* Input */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
          <Search size={16} color="var(--text-muted)"/>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Chercher un client, projet ou facture..."
            style={{ flex:1, border:'none', background:'none', fontSize:15, color:'var(--text)', outline:'none', padding:0 }}
          />
          {query && <button onClick={() => setQuery('')} style={{ background:'none', color:'var(--text-muted)', display:'flex', padding:2 }}><X size={15}/></button>}
        </div>

        {/* Results */}
        <div style={{ maxHeight:400, overflowY:'auto' }}>
          {!query && (
            <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
              Tape pour rechercher dans tous tes données
            </p>
          )}
          {query && loading && (
            <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>Recherche...</p>
          )}
          {query && !loading && total === 0 && (
            <p style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>Aucun résultat pour "{query}"</p>
          )}

          {results.clients.length > 0 && (
            <div>
              <div style={{ padding:'8px 16px 4px', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--bg)' }}>
                Clients
              </div>
              {results.clients.slice(0,3).map(c => (
                <div key={c.id} onClick={() => go('/clients')} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--primary-dark)', flexShrink:0 }}>
                    {c.name.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500 }}>{c.name}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{c.company || c.email || 'Client'}</p>
                  </div>
                  <Users size={13} color="var(--text-muted)" style={{ marginLeft:'auto' }}/>
                </div>
              ))}
            </div>
          )}

          {results.projects.length > 0 && (
            <div>
              <div style={{ padding:'8px 16px 4px', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--bg)' }}>
                Projets
              </div>
              {results.projects.slice(0,3).map(p => (
                <div key={p.id} onClick={() => go('/projects')} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'var(--info-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FolderOpen size={14} color="var(--info)"/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500 }}>{p.title}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{p.client_name}</p>
                  </div>
                  <FolderOpen size={13} color="var(--text-muted)" style={{ marginLeft:'auto' }}/>
                </div>
              ))}
            </div>
          )}

          {results.invoices.length > 0 && (
            <div>
              <div style={{ padding:'8px 16px 4px', fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--bg)' }}>
                Factures
              </div>
              {results.invoices.slice(0,3).map(i => (
                <div key={i.id} onClick={() => go('/invoices')} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'var(--success-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FileText size={14} color="var(--success)"/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, fontFamily:'monospace' }}>{i.invoice_number}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{i.client_name} · {parseFloat(i.amount).toLocaleString('fr-TN')} TND</p>
                  </div>
                  <FileText size={13} color="var(--text-muted)" style={{ marginLeft:'auto' }}/>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding:'8px 16px', background:'var(--bg)', borderTop:'1px solid var(--border)', display:'flex', gap:12, fontSize:11, color:'var(--text-muted)' }}>
          <span>↵ Ouvrir</span>
          <span>Esc Fermer</span>
          {total > 0 && <span style={{ marginLeft:'auto' }}>{total} résultat{total > 1 ? 's' : ''}</span>}
        </div>
      </div>
    </div>
  )
}