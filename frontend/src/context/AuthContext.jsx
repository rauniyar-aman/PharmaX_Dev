import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pharmax_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pharmax_token')
    if (!token) { setLoading(false); return }

    api.get('/auth/me')
      .then(res => setUser(res.data.data.user))
      .catch(() => { localStorage.removeItem('pharmax_token'); localStorage.removeItem('pharmax_user') })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data.data
    localStorage.setItem('pharmax_token', token)
    localStorage.setItem('pharmax_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data.data
  }, [])

  const verifyEmail = useCallback(async (email, otp) => {
    const res = await api.post('/auth/verify-email', { email, otp })
    const { token, user } = res.data.data
    localStorage.setItem('pharmax_token', token)
    localStorage.setItem('pharmax_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pharmax_token')
    localStorage.removeItem('pharmax_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
