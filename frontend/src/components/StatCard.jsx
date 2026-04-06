export default function StatCard({ label, value, sub, subColor = 'var(--text-muted)' }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.1rem 1.25rem',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: subColor }}>{sub}</p>}
    </div>
  )
}