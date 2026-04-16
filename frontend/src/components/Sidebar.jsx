import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, FolderOpen,
  FileText, Bell, LogOut
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

import { Settings } from 'lucide-react'


const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients',   icon: Users,           label: 'Clients'   },
  { to: '/projects',  icon: FolderOpen,      label: 'Projets'   },
  { to: '/invoices',  icon: FileText,         label: 'Factures'  },
  { to: '/reminders', icon: Bell,             label: 'Rappels'   },
  { to: '/profile', icon: Settings, label: 'Profil' },

]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'ME'
  const { theme, toggleTheme } = useTheme()

  return (
    <aside style={{
      width: 220, background: '#1A1A2E',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
        }}>F</div>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>FreelanceCRM</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 14px', borderRadius: 8,
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
            background: isActive ? 'rgba(108,99,255,0.25)' : 'transparent',
            borderRight: isActive ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.15s',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

     {/* Footer */}
<div style={{
  borderTop: '1px solid rgba(255,255,255,0.08)',
  padding: '1rem 1rem',
}}>

  {/* Dark mode (AU-DESSUS) */}
  <button onClick={toggleTheme} style={{
    width: '100%',
    marginBottom: 12,
    padding: '8px 10px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer'
  }}>
    {theme === 'light'
      ? <Moon size={14} />
      : <Sun size={14} />
    }
    {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
  </button>

  {/* User row */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--primary)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 600, color: '#fff',
      flexShrink: 0,
    }}>{initials}</div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: 12, color: '#fff', fontWeight: 500,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {user?.username}
      </p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
        Freelance
      </p>
    </div>

    <button onClick={handleLogout} style={{
      background: 'none',
      padding: 6,
      color: 'rgba(255,255,255,0.35)',
      borderRadius: 6,
      display: 'flex',
      cursor: 'pointer'
    }} title="Déconnexion">
      <LogOut size={15} />
    </button>
  </div>

</div>
    </aside>
  )
}