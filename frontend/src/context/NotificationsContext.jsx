import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../lib/api'
import { useAuth } from './AuthContext'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [notifs, setNotifs]   = useState([])
  const [unread, setUnread]   = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  const fetchNotifs = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('/notifications', { params: { limit: 30 } })
      setNotifs(res.data.data.notifications || [])
      setUnread(res.data.data.unreadCount || 0)
    } catch {}
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { setNotifs([]); setUnread(0); setLoading(false); return }
    fetchNotifs()
    intervalRef.current = setInterval(fetchNotifs, 30000)
    return () => clearInterval(intervalRef.current)
  }, [user, fetchNotifs])

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {})
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all').catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  const deleteOne = async (id) => {
    const wasUnread = notifs.find(n => n.id === id)?.isRead === false
    await api.delete(`/notifications/${id}`).catch(() => {})
    setNotifs(prev => prev.filter(n => n.id !== id))
    if (wasUnread) setUnread(prev => Math.max(0, prev - 1))
  }

  const clearAll = async () => {
    await api.delete('/notifications/clear-all').catch(() => {})
    setNotifs([])
    setUnread(0)
  }

  return (
    <NotificationsContext.Provider value={{ notifs, unread, loading, fetchNotifs, markRead, markAllRead, deleteOne, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsCtx() {
  return useContext(NotificationsContext)
}
