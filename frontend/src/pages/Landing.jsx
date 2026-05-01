import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Users, FolderOpen, FileText, Clock,
  Bell, BarChart2, Kanban, Shield,
  ArrowRight, Check, Menu, X
} from 'lucide-react'

export default function Landing() {
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Composants internes ──────────────────────

  const Navbar = () => (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid #E8E8EC' : 'none',
      transition: 'all 0.25s',
      padding: '0 2rem',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', height: 64, gap: 16 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: '#6C63FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15, color: '#fff',
          }}>FL</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#1A1A2E', letterSpacing: '-0.3px' }}>Flowlance</span>
        </div>

        {/* Nav links desktop */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['Fonctionnalités', 'Tarifs', 'À propos'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace('à ', '')}`} style={{
              fontSize: 14, color: '#6B7280', textDecoration: 'none', fontWeight: 500,
            }}
            onMouseEnter={e => e.target.style.color = '#6C63FF'}
            onMouseLeave={e => e.target.style.color = '#6B7280'}
            >{l}</a>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 16 }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: '1px solid #E8E8EC',
            padding: '8px 18px', borderRadius: 8, fontSize: 14,
            fontWeight: 500, color: '#1A1A2E', cursor: 'pointer',
          }}>
            Connexion
          </button>
          <button onClick={() => navigate('/register')} style={{
            background: '#6C63FF', border: 'none',
            padding: '8px 18px', borderRadius: 8, fontSize: 14,
            fontWeight: 600, color: '#fff', cursor: 'pointer',
          }}>
            Commencer gratuitement
          </button>
        </div>
      </div>
    </nav>
  )

  const Hero = () => (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #F5F5FF 0%, #FFFFFF 50%, #F0F9FF 100%)',
      padding: '100px 2rem 60px', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      {/* Cercles déco */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(108,99,255,0.06)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'rgba(108,99,255,0.04)', pointerEvents: 'none' }}/>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: '#EEEDFE', color: '#534AB7',
        padding: '6px 14px', borderRadius: 99,
        fontSize: 13, fontWeight: 600, marginBottom: 28,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6C63FF', display: 'inline-block' }}/>
        100% gratuit · Aucune carte requise
      </div>

      {/* Titre */}
      <h1 style={{
        fontSize: 'clamp(36px, 6vw, 64px)',
        fontWeight: 700, color: '#1A1A2E',
        lineHeight: 1.12, letterSpacing: '-1.5px',
        maxWidth: 780, marginBottom: 22,
      }}>
        Gérez votre activité freelance{' '}
        <span style={{ color: '#6C63FF' }}>sans effort</span>
      </h1>

      {/* Sous-titre */}
      <p style={{
        fontSize: 18, color: '#6B7280', maxWidth: 560,
        lineHeight: 1.7, marginBottom: 40,
      }}>
        Flowlance centralise vos clients, projets et factures dans un seul outil intelligent.
        Fini les tableurs Excel, les emails perdus et les factures oubliées.
      </p>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
        <button onClick={() => navigate('/register')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#6C63FF', color: '#fff', border: 'none',
          padding: '14px 28px', borderRadius: 10, fontSize: 16,
          fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#534AB7'}
        onMouseLeave={e => e.currentTarget.style.background = '#6C63FF'}
        >
          Créer mon espace gratuit <ArrowRight size={18}/>
        </button>
        <button onClick={() => navigate('/login')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', color: '#1A1A2E',
          border: '1px solid #E8E8EC',
          padding: '14px 28px', borderRadius: 10, fontSize: 16,
          fontWeight: 500, cursor: 'pointer',
        }}>
          Se connecter
        </button>
      </div>

      {/* Social proof */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: '#9CA3AF', fontSize: 13 }}>
        {['Aucune carte bancaire', 'Données sécurisées', 'Accessible partout'].map((t, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Check size={13} color="#6C63FF"/> {t}
          </span>
        ))}
      </div>

      {/* Aperçu dashboard (mockup simplifié) */}
      <div style={{
        marginTop: 60, width: '100%', maxWidth: 860,
        background: '#fff', borderRadius: 16,
        border: '1px solid #E8E8EC',
        boxShadow: '0 24px 80px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}>
        {/* Barre titre fenêtre */}
        <div style={{ background: '#F5F5F7', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #E8E8EC' }}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }}/>
          ))}
          <div style={{ marginLeft: 12, flex: 1, height: 20, background: '#E8E8EC', borderRadius: 4, maxWidth: 200 }}/>
        </div>

        {/* Faux dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', minHeight: 320 }}>
          {/* Sidebar */}
          <div style={{ background: '#1A1A2E', padding: '16px 0' }}>
            <div style={{ padding: '8px 16px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>FL</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Flowlance</span>
            </div>
            {[
              { icon: BarChart2, label: 'Dashboard', active: true },
              { icon: Kanban,    label: 'Pipeline',  active: false },
              { icon: Users,     label: 'Clients',   active: false },
              { icon: FileText,  label: 'Factures',  active: false },
              { icon: Clock,     label: 'Temps',     active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 14px', margin: '1px 6px', borderRadius: 6,
                background: active ? 'rgba(108,99,255,0.25)' : 'transparent',
                borderRight: active ? '2px solid #6C63FF' : '2px solid transparent',
              }}>
                <Icon size={13} color={active ? '#fff' : 'rgba(255,255,255,0.4)'}/>
                <span style={{ fontSize: 11, color: active ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: active ? 600 : 400 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Main */}
          <div style={{ padding: '16px', background: '#F5F5F7' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 12 }}>Bonjour, Med Amine 👋</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'CA total', val: '12 400 TND', color: '#3B6D11' },
                { label: 'En attente', val: '3 200 TND', color: '#854F0B' },
                { label: 'Clients', val: '8', color: '#185FA5' },
                { label: 'Projets', val: '5', color: '#6C63FF' },
              ].map(c => (
                <div key={c.label} style={{ background: '#fff', borderRadius: 8, padding: '10px 10px', border: '1px solid #E8E8EC' }}>
                  <p style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: c.color }}>{c.val}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #E8E8EC' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>Dernières factures</p>
              {[
                { num: 'FAC-2024-005', client: 'StartupTN',  amt: '1 800 TND', status: 'En retard', sc: '#A32D2D', sb: '#FCEBEB' },
                { num: 'FAC-2024-004', client: 'DigitalHub', amt: '950 TND',   status: 'Envoyé',    sc: '#854F0B', sb: '#FAEEDA' },
                { num: 'FAC-2024-003', client: 'AgenceX',    amt: '2 200 TND', status: 'Payé',      sc: '#3B6D11', sb: '#EAF3DE' },
              ].map(r => (
                <div key={r.num} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #F5F5F7' }}>
                  <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#6C63FF', fontWeight: 600, flex: 1 }}>{r.num}</span>
                  <span style={{ fontSize: 9, color: '#6B7280', flex: 1 }}>{r.client}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: '#1A1A2E', flex: 1 }}>{r.amt}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, background: r.sb, color: r.sc, padding: '2px 6px', borderRadius: 99 }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const Features = () => {
    const feats = [
      { icon: Kanban,    color: '#6C63FF', bg: '#EEEDFE', title: 'Pipeline Kanban',          desc: 'Visualisez vos opportunités et faites glisser vos projets d\'une étape à l\'autre en temps réel.' },
      { icon: FileText,  color: '#3B6D11', bg: '#EAF3DE', title: 'Facturation intelligente',  desc: 'Créez des factures numérotées automatiquement, exportez en PDF et suivez les paiements en un clic.' },
      { icon: Users,     color: '#185FA5', bg: '#E6F1FB', title: 'Historique clients',        desc: 'Gardez une trace de chaque appel, email et réunion grâce à une timeline par client.' },
      { icon: Clock,     color: '#854F0B', bg: '#FAEEDA', title: 'Suivi du temps',            desc: 'Démarrez un timer live ou saisissez vos heures manuellement. Visualisez la rentabilité de chaque projet.' },
      { icon: Bell,      color: '#A32D2D', bg: '#FCEBEB', title: 'Rappels automatiques',     desc: 'Flowlance détecte les factures en retard, les clients inactifs et les projets non facturés.' },
      { icon: BarChart2, color: '#534AB7', bg: '#EEEDFE', title: 'Dashboard analytique',     desc: 'CA mensuel, répartition des factures, projets par statut — tout visualisé en graphiques interactifs.' },
    ]
    return (
      <section id="fonctionnalités" style={{ padding: '90px 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fonctionnalités</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginTop: 10, letterSpacing: '-0.5px' }}>
              Tout ce dont un freelance a besoin
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
              Un seul outil pour remplacer Excel, Notion, et vos emails perdus.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {feats.map(f => (
              <div key={f.title} style={{
                background: '#fff', border: '1px solid #E8E8EC',
                borderRadius: 14, padding: '24px',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={20} color={f.color}/>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const HowItWorks = () => (
    <section style={{ padding: '90px 2rem', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Comment ça marche</span>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginTop: 10, letterSpacing: '-0.5px' }}>
            Opérationnel en 2 minutes
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {[
            { n: '01', title: 'Crée ton compte',       desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise.', color: '#6C63FF', bg: '#EEEDFE' },
            { n: '02', title: 'Ajoute tes clients',    desc: 'Importe ou crée tes clients, lie-les à tes projets et factures.', color: '#185FA5', bg: '#E6F1FB' },
            { n: '03', title: 'Gère et encaisse',      desc: 'Suivi en temps réel, rappels automatiques, factures en PDF.', color: '#3B6D11', bg: '#EAF3DE' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center', padding: '28px 20px', background: '#fff', borderRadius: 14, border: '1px solid #E8E8EC' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 18, fontWeight: 700, color: s.color }}>
                {s.n}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const Pricing = () => (
    <section id="tarifs" style={{ padding: '90px 2rem', background: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tarifs</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2E', marginTop: 10, letterSpacing: '-0.5px' }}>Simple et transparent</h2>
        <p style={{ fontSize: 16, color: '#6B7280', marginTop: 12, marginBottom: 48 }}>Flowlance est entièrement gratuit pendant la période de lancement.</p>

        <div style={{ background: '#1A1A2E', borderRadius: 20, padding: '40px', border: '2px solid #6C63FF', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, background: '#6C63FF', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>
            GRATUIT
          </div>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(108,99,255,0.1)' }}/>

          <h3 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            0 TND <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>/ mois</span>
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 14 }}>Toutes les fonctionnalités incluses, pour toujours.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', textAlign: 'left', marginBottom: 36 }}>
            {[
              'Clients illimités', 'Projets illimités', 'Factures illimitées',
              'Export PDF', 'Pipeline Kanban', 'Suivi du temps',
              'Rappels intelligents', 'Dark mode', 'Recherche globale',
              'Dashboard analytique',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
                <Check size={14} color="#6C63FF"/> {f}
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/register')} style={{
            width: '100%', background: '#6C63FF', color: '#fff',
            border: 'none', padding: '14px', borderRadius: 10,
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#534AB7'}
          onMouseLeave={e => e.currentTarget.style.background = '#6C63FF'}
          >
            Commencer gratuitement →
          </button>
        </div>
      </div>
    </section>
  )

  const CTA = () => (
    <section style={{
      padding: '80px 2rem',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2B5A 100%)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '-0.5px' }}>
          Prêt à simplifier ta vie de freelance ?
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginBottom: 36, lineHeight: 1.7 }}>
          Rejoins Flowlance aujourd'hui et prends le contrôle de ton activité.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#6C63FF', color: '#fff', border: 'none',
            padding: '14px 28px', borderRadius: 10, fontSize: 16,
            fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
          }}>
            Créer mon compte gratuit <ArrowRight size={18}/>
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '14px 28px', borderRadius: 10, fontSize: 16,
            fontWeight: 500, cursor: 'pointer',
          }}>
            Se connecter
          </button>
        </div>
      </div>
    </section>
  )

  const Footer = () => (
    <footer style={{ background: '#0F0F18', padding: '32px 2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>FL</div>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Flowlance</span>
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
        © 2025 Flowlance · CRM intelligent pour freelances · Projet académique
      </p>
    </footer>
  )

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}