import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { User, Lock, Moon, Sun, Save } from 'lucide-react'

export default function Profile() {
  const { user }              = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [form, setForm]       = useState({ username: user?.username || '', email: user?.email || '' })
  const [pwForm, setPwForm]   = useState({ old_password:'', new_password:'', confirm:'' })
  const [savingInfo, setSavingInfo]   = useState(false)
  const [savingPw, setSavingPw]       = useState(false)

  const handleInfo = async (e) => {
    e.preventDefault()
    setSavingInfo(true)
    try {
      await api.patch('/auth/me/', form)
      toast.success('Profil mis à jour')
    } catch { toast.error('Erreur lors de la mise à jour') }
    finally { setSavingInfo(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) return toast.error('Les mots de passe ne correspondent pas')
    setSavingPw(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      })
      toast.success('Mot de passe changé')
      setPwForm({ old_password:'', new_password:'', confirm:'' })
    } catch { toast.error('Mot de passe actuel incorrect') }
    finally { setSavingPw(false) }
  }

  const Card = ({ icon: Icon, title, children }) => (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={16} color="var(--primary)"/>
        </div>
        <h2 style={{ fontSize:15, fontWeight:600 }}>{title}</h2>
      </div>
      <div style={{ padding:'1.25rem' }}>{children}</div>
    </div>
  )

  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontSize:22, fontWeight:600 }}>Mon profil</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Gérer tes informations et préférences</p>
      </div>

      {/* Avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#fff' }}>
          {user?.username?.slice(0,2).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight:600, fontSize:16 }}>{user?.username}</p>
          <p style={{ color:'var(--text-muted)', fontSize:13 }}>{user?.email || 'Aucun email'}</p>
          <span style={{ fontSize:11, background:'var(--primary-light)', color:'var(--primary-dark)', padding:'2px 10px', borderRadius:99, fontWeight:600 }}>Freelance</span>
        </div>
      </div>

      {/* Infos */}
      <Card icon={User} title="Informations personnelles">
        <form onSubmit={handleInfo} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Nom d'utilisateur</label>
            <input value={form.username} onChange={e => setForm({...form, username:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
          </div>
          <button type="submit" disabled={savingInfo} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--primary)', color:'#fff', padding:'9px 18px', borderRadius:'var(--radius)', fontWeight:600, fontSize:13, width:'fit-content', opacity:savingInfo?0.7:1 }}>
            <Save size={14}/> {savingInfo ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </form>
      </Card>

      {/* Mot de passe */}
      <Card icon={Lock} title="Changer le mot de passe">
        <form onSubmit={handlePassword} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { key:'old_password', label:'Mot de passe actuel' },
            { key:'new_password', label:'Nouveau mot de passe' },
            { key:'confirm',      label:'Confirmer le nouveau' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 }}>{label}</label>
              <input type="password" value={pwForm[key]} onChange={e => setPwForm({...pwForm, [key]:e.target.value})} placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={savingPw} style={{ display:'flex', alignItems:'center', gap:6, background:'var(--primary)', color:'#fff', padding:'9px 18px', borderRadius:'var(--radius)', fontWeight:600, fontSize:13, width:'fit-content', opacity:savingPw?0.7:1 }}>
            <Lock size={14}/> {savingPw ? 'Modification...' : 'Changer le mot de passe'}
          </button>
        </form>
      </Card>

      {/* Thème */}
      <Card icon={theme === 'light' ? Moon : Sun} title="Apparence">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontWeight:500, fontSize:14 }}>Mode {theme === 'light' ? 'sombre' : 'clair'}</p>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
              Actuellement en mode {theme === 'light' ? 'clair' : 'sombre'}
            </p>
          </div>
          <button onClick={toggleTheme} style={{
            display:'flex', alignItems:'center', gap:8,
            background:'var(--primary)', color:'#fff',
            padding:'8px 16px', borderRadius:'var(--radius)',
            fontWeight:500, fontSize:13,
          }}>
            {theme === 'light' ? <Moon size={14}/> : <Sun size={14}/>}
            Activer le mode {theme === 'light' ? 'sombre' : 'clair'}
          </button>
        </div>
      </Card>
    </div>
  )
}