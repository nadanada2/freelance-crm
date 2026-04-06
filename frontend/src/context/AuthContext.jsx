import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) fetchMe()
    else setLoading(false)
  }, [])

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me/')
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    await fetchMe()
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)