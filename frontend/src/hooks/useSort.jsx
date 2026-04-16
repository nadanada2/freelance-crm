import { useState, useMemo } from 'react'

export function useSort(data, defaultKey = null) {
  const [sortKey, setSortKey] = useState(defaultKey)
  const [sortDir, setSortDir] = useState('asc')

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDir])

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ color:'var(--border)', marginLeft:4 }}>↕</span>
    return <span style={{ color:'var(--primary)', marginLeft:4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return { sorted, toggleSort, SortIcon }
}