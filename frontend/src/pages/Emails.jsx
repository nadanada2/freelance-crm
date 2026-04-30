import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {
  Mail, Plus, Send, Trash2, X, ChevronDown,
  FileText, RefreshCw, DollarSign, Heart, MoreHorizontal,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react'

const CAT_ICONS = {
  devis:   { icon: FileText,       color: '#185FA5', bg: '#E6F1FB', label: 'Devis'          },
  relance: { icon: RefreshCw,      color: '#854F0B', bg: '#FAEEDA', label: 'Relance'        },
  facture: { icon: DollarSign,     color: '#3B6D11', bg: '#EAF3DE', label: 'Facture'        },
  merci:   { icon: Heart,          color: '#534AB7', bg: '#EEEDFE', label: 'Remerciement'   },
  autre:   { icon: MoreHorizontal, color: '#5F5E5A', bg: '#F1EFE8', label: 'Autre'          },
}

const DEFAULT_TEMPLATES = [
  {
    _default: true, category: 'devis', name: 'Envoi de devis',
    subject: 'Devis pour votre projet — {{client_name}}',
    body: `Bonjour {{client_name}},

Suite à notre échange, je vous fais parvenir le devis pour votre projet.

Vous trouverez ci-joint le détail des prestations proposées ainsi que les tarifs correspondants.

N'hésitez pas à me contacter pour toute question ou ajustement.

Cordialement,
{{freelance_name}}`
  },
  {
    _default: true, category: 'relance', name: 'Relance facture impayée',
    subject: 'Relance — Facture en attente de règlement',
    body: `Bonjour {{client_name}},

Je me permets de vous relancer concernant la facture que je vous ai adressée il y a quelques jours et qui n'a pas encore été réglée.

Pourriez-vous me confirmer la bonne réception de cette facture et me préciser la date prévisionnelle de règlement ?

Dans l'attente de votre retour, je reste disponible.

Cordialement,
{{freelance_name}}`
  },
  {
    _default: true, category: 'facture', name: 'Envoi de facture',
    subject: 'Facture {{invoice_number}} — {{client_name}}',
    body: `Bonjour {{client_name}},

Veuillez trouver ci-joint la facture {{invoice_number}} d'un montant de {{amount}} TND, relative aux prestations réalisées.

Le règlement est à effectuer sous 30 jours.

Merci pour votre confiance.

Cordialement,
{{freelance_name}}`
  },
  {
    _default: true, category: 'merci', name: 'Remerciement fin de projet',
    subject: 'Merci pour votre confiance — {{client_name}}',
    body: `Bonjour {{client_name}},

Je souhaitais vous remercier chaleureusement pour la confiance que vous m'avez accordée dans la réalisation de ce projet.

Ce fut un plaisir de travailler ensemble. Je reste disponible pour tout futur besoin.

Très cordialement,
{{freelance_name}}`
  },
]

export default function Emails() {
  const [tab, setTab]               = useState('compose') // compose | history | templates
  const [clients, setClients]       = useState([])
  const [templates, setTemplates]   = useState([])
  const [history, setHistory]       = useState([])
  const [loading, setLoading]       = useState(true)

  // Compose form
  const [form, setForm] = useState({ client_id: '', to_email: '', subject: '', body: '', template_id: '' })
  const [sending, setSending] = useState(false)

  // Template form
  const [tplModal, setTplModal]   = useState(false)
  const [tplForm, setTplForm]     = useState({ name: '', category: 'autre', subject: '', body: '' })
  const [tplSaving, setTplSaving] = useState(false)

  // Selected email for preview
  const [selected, setSelected] = useState(null)

  const location = useLocation()

  useEffect(() => {
    fetchAll()
    // Pre-fill from ClientDetail redirect
    const params = new URLSearchParams(location.search)
    const clientId = params.get('client')
    const email = params.get('email')
    if (clientId || email) {
      setForm(f => ({ ...f, client_id: clientId || '', to_email: email || '' }))
      setTab('compose')
    }
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [cRes, tRes, hRes] = await Promise.all([
        api.get('/clients/'),
        api.get('/email-templates/'),
        api.get('/sent-emails/'),
      ])
      setClients(cRes.data)
      setTemplates(tRes.data)
      setHistory(hRes.data)
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  // Auto-fill email when client is selected
  const handleClientChange = (clientId) => {
    const client = clients.find(c => c.id === parseInt(clientId))
    setForm(f => ({
      ...f,
      client_id: clientId,
      to_email: client?.email || f.to_email,
    }))
  }

  // Apply template
  const applyTemplate = (tpl) => {
    const client = clients.find(c => c.id === parseInt(form.client_id))
    const replace = (str) => str
      .replace(/{{client_name}}/g, client?.name || 'Client')
      .replace(/{{freelance_name}}/g, 'Votre nom')
    setForm(f => ({
      ...f,
      subject:     replace(tpl.subject),
      body:        replace(tpl.body),
      template_id: tpl.id || '',
    }))
    toast.success(`Modèle "${tpl.name}" appliqué`)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!form.to_email || !form.subject || !form.body) {
      toast.error('Remplis tous les champs obligatoires')
      return
    }
    setSending(true)
    try {
      await api.post('/send-email/', {
        to_email:    form.to_email,
        subject:     form.subject,
        body:        form.body,
        client_id:   form.client_id || null,
        template_id: form.template_id || null,
      })
      toast.success('Email envoyé ✓')
      setForm({ client_id: '', to_email: '', subject: '', body: '', template_id: '' })
      fetchAll()
      setTab('history')
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur d\'envoi'
      toast.error(msg)
    } finally { setSending(false) }
  }

  const handleSaveTpl = async (e) => {
    e.preventDefault()
    setTplSaving(true)
    try {
      await api.post('/email-templates/', tplForm)
      toast.success('Modèle enregistré')
      setTplModal(false)
      setTplForm({ name: '', category: 'autre', subject: '', body: '' })
      fetchAll()
    } catch { toast.error('Erreur') }
    finally { setTplSaving(false) }
  }

  const deleteTpl = async (id) => {
    if (!window.confirm('Supprimer ce modèle ?')) return
    try {
      await api.delete(`/email-templates/${id}/`)
      setTemplates(t => t.filter(x => x.id !== id))
      toast.success('Supprimé')
    } catch { toast.error('Erreur') }
  }

  const allTemplates = [...DEFAULT_TEMPLATES, ...templates]

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>Emails</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{history.length} email{history.length !== 1 ? 's' : ''} envoyé{history.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => { setTab('compose') }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', padding: '9px 18px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 13 }}>
          <Plus size={15} /> Nouvel email
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content' }}>
        {[
          { key: 'compose',   label: 'Composer',    icon: Send      },
          { key: 'history',   label: 'Historique',  icon: Clock     },
          { key: 'templates', label: 'Modèles',     icon: FileText  },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 'calc(var(--radius) - 2px)',
            fontSize: 13, fontWeight: 500,
            background: tab === t.key ? 'var(--primary)' : 'none',
            color: tab === t.key ? '#fff' : 'var(--text-muted)',
            border: 'none', cursor: 'pointer',
          }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ── COMPOSE ── */}
      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
          {/* Compose form */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600 }}>Nouveau message</h2>
            </div>
            <form onSubmit={handleSend}>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Client */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Client (optionnel)</label>
                  <select value={form.client_id} onChange={e => handleClientChange(e.target.value)}>
                    <option value="">— Sélectionner un client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</option>)}
                  </select>
                </div>

                {/* To */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Destinataire *</label>
                  <input type="email" required placeholder="email@client.com" value={form.to_email} onChange={e => setForm(f => ({ ...f, to_email: e.target.value }))} />
                </div>

                {/* Subject */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Objet *</label>
                  <input type="text" required placeholder="Objet de l'email" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                </div>

                {/* Body */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Message *</label>
                  <textarea required rows={10} placeholder="Rédigez votre message..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
                </div>
              </div>

              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setForm({ client_id: '', to_email: '', subject: '', body: '', template_id: '' })} style={{ padding: '8px 18px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Effacer
                </button>
                <button type="submit" disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', fontWeight: 600, opacity: sending ? 0.7 : 1 }}>
                  <Send size={14} />{sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>

          {/* Templates sidebar */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 13, fontWeight: 600 }}>Modèles rapides</h2>
            </div>
            <div style={{ padding: '0.5rem' }}>
              {allTemplates.map((tpl, i) => {
                const cat = CAT_ICONS[tpl.category] || CAT_ICONS.autre
                const Icon = cat.icon
                return (
                  <button key={i} type="button" onClick={() => applyTemplate(tpl)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    border: '1px solid transparent', background: 'none',
                    textAlign: 'left', cursor: 'pointer', marginBottom: 2,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color={cat.color} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tpl.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.label}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 16 }}>
          {/* List */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600 }}>Emails envoyés</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{history.length} messages</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Mail size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>Aucun email envoyé</p>
              </div>
            ) : (
              <div>
                {history.map(email => (
                  <div key={email.id} onClick={() => setSelected(selected?.id === email.id ? null : email)} style={{
                    padding: '12px 1.25rem', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', background: selected?.id === email.id ? 'var(--bg)' : 'transparent',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = selected?.id === email.id ? 'var(--bg)' : 'transparent'}
                  >
                    {/* Status icon */}
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {email.status === 'sent'
                        ? <CheckCircle size={15} color="var(--success)" />
                        : <AlertCircle size={15} color="var(--danger)" />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject}</p>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                          {new Date(email.sent_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {email.client_name || email.to_email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {selected && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{selected.subject}</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', color: 'var(--text-muted)', padding: 4, display: 'flex' }}><X size={16} /></button>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.25rem', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 40 }}>À :</span>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{selected.to_email}</span>
                  </div>
                  {selected.client_name && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 40 }}>Client :</span>
                      <span style={{ color: 'var(--text)' }}>{selected.client_name}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 40 }}>Date :</span>
                    <span style={{ color: 'var(--text)' }}>{new Date(selected.sent_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 40 }}>Statut :</span>
                    <span style={{ color: selected.status === 'sent' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {selected.status === 'sent' ? '✓ Envoyé' : '✗ Échec'}
                    </span>
                  </div>
                </div>
                <pre style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{selected.body}</pre>
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                  <button onClick={() => { applyTemplate && setForm({ ...form, to_email: selected.to_email, subject: `Re: ${selected.subject}`, body: '' }); setTab('compose') }}
                    style={{ fontSize: 12, padding: '7px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Répondre
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TEMPLATES ── */}
      {tab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{allTemplates.length} modèles disponibles</p>
            <button onClick={() => setTplModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={14} /> Créer un modèle
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {allTemplates.map((tpl, i) => {
              const cat = CAT_ICONS[tpl.category] || CAT_ICONS.autre
              const Icon = cat.icon
              return (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={15} color={cat.color} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{tpl.name}</p>
                        <p style={{ fontSize: 11, color: cat.color, fontWeight: 500 }}>{cat.label}</p>
                      </div>
                    </div>
                    {!tpl._default && (
                      <button onClick={() => deleteTpl(tpl.id)} style={{ background: 'none', color: 'var(--text-muted)', padding: 4, display: 'flex', opacity: 0.5 }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                    {tpl._default && <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>Intégré</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{tpl.subject}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{tpl.body}</p>
                  <button onClick={() => { applyTemplate(tpl); setTab('compose') }} style={{ fontSize: 12, padding: '7px', borderRadius: 'var(--radius)', background: cat.bg, color: cat.color, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Send size={12} /> Utiliser ce modèle
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal nouveau modèle */}
      {tplModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 500, border: '1px solid var(--border)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Nouveau modèle d'email</h2>
              <button onClick={() => setTplModal(false)} style={{ background: 'none', color: 'var(--text-muted)', padding: 4, display: 'flex' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveTpl}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nom *</label>
                    <input required placeholder="Ex: Proposition commerciale" value={tplForm.name} onChange={e => setTplForm(t => ({ ...t, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Catégorie</label>
                    <select value={tplForm.category} onChange={e => setTplForm(t => ({ ...t, category: e.target.value }))}>
                      <option value="devis">Devis</option>
                      <option value="relance">Relance</option>
                      <option value="facture">Facture</option>
                      <option value="merci">Remerciement</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Objet *</label>
                  <input required placeholder="Objet de l'email" value={tplForm.subject} onChange={e => setTplForm(t => ({ ...t, subject: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Corps du message *</label>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Variables : {'{{client_name}}'}, {'{{freelance_name}}'}, {'{{invoice_number}}'}, {'{{amount}}'}</p>
                  <textarea required rows={7} placeholder="Rédigez le modèle..." value={tplForm.body} onChange={e => setTplForm(t => ({ ...t, body: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setTplModal(false)} style={{ padding: '8px 18px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Annuler</button>
                <button type="submit" disabled={tplSaving} style={{ padding: '8px 18px', borderRadius: 'var(--radius)', background: 'var(--primary)', color: '#fff', fontWeight: 600, opacity: tplSaving ? 0.7 : 1 }}>
                  {tplSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
