import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token  = localStorage.getItem('token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const data = res.data
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      name: data.name,
      role: data.role,
      org_id: data.org_id,
    }))
    setUser({ user_id: data.user_id, name: data.name, role: data.role, org_id: data.org_id })
    return data
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    const data = res.data
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({
      user_id: data.user_id,
      name: data.name,
      role: data.role,
      org_id: data.org_id,
    }))
    setUser({ user_id: data.user_id, name: data.name, role: data.role, org_id: data.org_id })
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
