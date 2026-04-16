import Sidebar from './Sidebar'
import GlobalSearch from './GlobalSearch'

export default function Layout({ children }) {
  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:220, flex:1, minHeight:'100vh', background:'var(--bg)' }}>
        {/* Topbar */}
        <div style={{
          position:'sticky', top:0, zIndex:100,
          background:'var(--surface)',
          borderBottom:'1px solid var(--border)',
          padding:'10px 2rem',
          display:'flex', alignItems:'center', justifyContent:'flex-end',
        }}>
          <GlobalSearch />
        </div>
        <div style={{ padding:'2rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}