import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Connexion réussie !')
      navigate('/dashboard')
    } catch {
      toast.error('Identifiants incorrects')
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
        width: '100%', maxWidth: 400,
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
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Connexion</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Bienvenue sur FreelanceCRM
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Nom d'utilisateur
            </label>
            <input
              type="text" required
              placeholder="votre_username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Mot de passe
            </label>
            <input
              type="password" required
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            background: 'var(--primary)', color: '#fff',
            padding: '10px', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: 14, marginTop: 4,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--text-muted)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}