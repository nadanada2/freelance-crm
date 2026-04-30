import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) return toast.error('Les mots de passe ne correspondent pas')
    setLoading(true)
    try {
      await api.post('/auth/register/', form)
      toast.success('Compte créé ! Connecte-toi.')
      navigate('/login')
    } catch (err) {
      console.log('Erreur détail:', err.response?.data)
      const errors = err.response?.data
      if (errors) {
        const msg = Object.entries(errors)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`)
        .join(' | ')
        toast.error(msg)
      } else {
        toast.error("Erreur lors de l'inscription")
  }
} finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
            margin: '0 auto 1rem',
          }}>F</div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Créer un compte</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>FreelanceCRM — gratuit pour toujours</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'username', label: "Nom d'utilisateur", type: 'text', placeholder: 'mon_username' },
            { key: 'email',    label: 'Email',             type: 'email', placeholder: 'moi@email.com' },
            { key: 'password', label: 'Mot de passe',      type: 'password', placeholder: '••••••••' },
            { key: 'password2',label: 'Confirmer',         type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <input
                type={type} required placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            background: 'var(--primary)', color: '#fff',
            padding: '10px', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: 14, marginTop: 4,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--text-muted)' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}