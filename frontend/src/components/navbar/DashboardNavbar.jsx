import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import NotificationPanel from '../notifications/NotificationPanel'
import { useNotificationsCtx } from '../../context/NotificationsContext'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/medicines': 'Medicines',
  '/dashboard/categories': 'Categories',
  '/dashboard/orders': 'Orders',
  '/dashboard/wishlist': 'Wishlist',
  '/dashboard/prescriptions': 'Prescriptions',
  '/dashboard/reviews': 'My Reviews',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
  '/dashboard/cart': 'Shopping Cart',
  '/dashboard/track-order': 'Track Order',
}

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${BACKEND}${url}`
}

export default function DashboardNavbar({ sidebarCollapsed }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { cartCount } = useCart()
  const { user }  = useAuth()
  const { unread } = useNotificationsCtx()

  const [notifOpen,     setNotifOpen]     = useState(false)
  const [query,         setQuery]         = useState('')
  const [results,       setResults]       = useState([])
  const [searching,     setSearching]     = useState(false)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const searchWrapRef = useRef(null)
  const debounceRef   = useRef(null)

  const getTitle = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard/medicines/')) return 'Medicine Details'
    if (path.startsWith('/dashboard/orders/') && !path.includes('track')) return 'Order Details'
    if (path.startsWith('/dashboard/track-order/')) return 'Track Order'
    return pageTitles[path] || 'Dashboard'
  }

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setDropdownOpen(false); return }
    setSearching(true)
    try {
      const res = await api.get('/medicines', { params: { search: q, limit: 6 } })
      setResults(res.data.data.medicines || [])
      setDropdownOpen(true)
    } catch {}
    setSearching(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, doSearch])

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (id) => {
    navigate(`/dashboard/medicines/${id}`)
    setQuery('')
    setDropdownOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/dashboard/medicines?search=${encodeURIComponent(query.trim())}`)
      setDropdownOpen(false)
    }
    if (e.key === 'Escape') { setDropdownOpen(false); setQuery('') }
  }

  const avatarSrc = resolveImg(user?.avatarUrl)

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center justify-between h-16 bg-surface-container-lowest border-b border-outline-variant px-5 transition-all duration-300"
      style={{ left: sidebarCollapsed ? '72px' : '256px' }}
    >
      {/* Page Title */}
      <h1 className="text-[17px] font-semibold text-on-surface">{getTitle()}</h1>

      {/* Right Section */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div ref={searchWrapRef} className="relative">
          <div className={`relative flex items-center transition-all duration-200 ${query || dropdownOpen ? 'w-64' : 'w-48'}`}>
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant pointer-events-none" style={{ fontSize: '18px' }}>search</span>
            {searching && (
              <span className="absolute right-3 w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
            )}
            <input
              type="text"
              placeholder="Search medicines..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => query.trim() && setDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-8 py-2 text-sm bg-surface-container-low rounded-full border border-transparent focus:border-secondary focus:outline-none text-on-surface placeholder:text-on-surface-variant transition-all duration-200"
            />
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl z-50 overflow-hidden">
              {results.length === 0 ? (
                <div className="px-4 py-5 text-center text-sm text-on-surface-variant">
                  No medicines found for "{query}"
                </div>
              ) : (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </p>
                  <div className="divide-y divide-outline-variant max-h-72 overflow-y-auto">
                    {results.map(m => (
                      <button key={m.id} onClick={() => handleSelect(m.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-left">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex-shrink-0 overflow-hidden">
                          {m.imageUrl
                            ? <img src={resolveImg(m.imageUrl)} className="w-full h-full object-cover" alt="" />
                            : <span className="w-full h-full flex items-center justify-center material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>medication</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">{m.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{m.brand} · Rs {Number(m.price).toLocaleString()}</p>
                        </div>
                        <span className={`text-[10px] font-bold flex-shrink-0 ${m.inStock ? 'text-primary' : 'text-error'}`}>
                          {m.inStock ? 'In Stock' : 'Out'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { navigate(`/dashboard/medicines?search=${encodeURIComponent(query)}`); setDropdownOpen(false) }}
                    className="w-full px-4 py-2.5 text-xs font-semibold text-secondary hover:bg-surface-container-low transition-colors border-t border-outline-variant text-center">
                    See all results for "{query}"
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <Link to="/dashboard/cart" className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-on-secondary-container text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none border-2 border-surface-container-lowest">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl z-50 overflow-hidden">
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant mx-1" />

        {/* Avatar */}
        <Link to="/dashboard/profile" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-container transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold ring-2 ring-primary ring-offset-2 overflow-hidden flex-shrink-0">
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              : user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-on-surface leading-tight">{user?.fullName || 'User'}</p>
            <p className="text-[11px] text-on-surface-variant leading-tight">Customer</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
