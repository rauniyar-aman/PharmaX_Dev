import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const PAGE_TITLES = {
  '/admin/dashboard':    { title: 'Dashboard',          icon: 'dashboard' },
  '/admin/medicines':    { title: 'Medicines',           icon: 'medication' },
  '/admin/categories':   { title: 'Categories',          icon: 'category' },
  '/admin/inventory':    { title: 'Inventory',           icon: 'inventory_2' },
  '/admin/prescriptions':{ title: 'Prescriptions',       icon: 'description' },
  '/admin/orders':       { title: 'Orders',              icon: 'shopping_cart' },
  '/admin/customers':    { title: 'Customers',           icon: 'group' },
  '/admin/delivery':     { title: 'Delivery',            icon: 'local_shipping' },
  '/admin/reports':      { title: 'Reports & Analytics', icon: 'bar_chart' },
  '/admin/settings':     { title: 'Settings',            icon: 'settings' },
  '/admin/profile':      { title: 'Admin Profile',       icon: 'manage_accounts' },
}

function getPageMeta(pathname) {
  // exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // prefix match (e.g. /admin/medicines/add → Medicines)
  const key = Object.keys(PAGE_TITLES).find(k => k !== '/admin/dashboard' && pathname.startsWith(k))
  return key ? PAGE_TITLES[key] : { title: 'Admin', icon: 'admin_panel_settings' }
}

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const [collapsed, setCollapsed]           = useState(false)
  const [pendingRx, setPendingRx]           = useState(0)
  const [notifOpen, setNotifOpen]           = useState(false)
  const location = useLocation()

  const { title, icon } = getPageMeta(location.pathname)

  // Poll pending prescriptions count for badge
  useEffect(() => {
    if (!user) return
    const fetch = () => api.get('/admin/stats').then(r => setPendingRx(r.data.data?.pendingPrescriptions ?? 0)).catch(() => {})
    fetch()
    const id = setInterval(fetch, 60_000)
    return () => clearInterval(id)
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/signin" replace />

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-surface-container-lowest rounded-2xl shadow-card max-w-sm">
          <span className="material-symbols-outlined text-5xl text-error">block</span>
          <h1 className="mt-4 text-xl font-bold text-on-surface">Access Denied</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Your account does not have admin privileges.</p>
          <a href="/dashboard" className="mt-4 inline-block text-primary font-semibold text-sm hover:underline">← Back to Dashboard</a>
        </div>
      </div>
    )
  }

  const sidebarW = collapsed ? 72 : 256

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main area */}
      <div className="min-h-screen flex flex-col transition-all duration-300" style={{ marginLeft: sidebarW }}>

        {/* ── Topbar ── */}
        <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 h-16 flex-shrink-0 shadow-sm">
          {/* Left: page title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface leading-tight">{title}</h2>
              <p className="text-[10px] text-on-surface-variant capitalize leading-tight hidden sm:block">
                {location.pathname.replace('/admin/', '').split('/').join(' › ')}
              </p>
            </div>
          </div>

          {/* Right: badges + admin profile */}
          <div className="flex items-center gap-2">
            {/* Pending prescriptions notification */}
            <div className="relative">
              <Link to="/admin/prescriptions"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative"
                title="Pending Prescriptions">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>description</span>
                {pendingRx > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {pendingRx > 99 ? '99+' : pendingRx}
                  </span>
                )}
              </Link>
            </div>

            {/* Notifications bell */}
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative"
              title="Notifications">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
              {pendingRx > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-outline-variant mx-1" />

            {/* Admin avatar + name */}
            <Link to="/admin/profile" className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-surface-container transition-colors group">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold flex-shrink-0 overflow-hidden">
                {user?.avatarUrl
                  ? <img src={`${BACKEND}${user.avatarUrl}`} className="w-full h-full object-cover" alt="" />
                  : <span>{user?.fullName?.[0]?.toUpperCase() || 'A'}</span>
                }
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-on-surface leading-tight">{user?.fullName || 'Admin'}</p>
                <p className="text-[10px] text-on-surface-variant leading-tight">Administrator</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" style={{ fontSize: '14px' }}>expand_more</span>
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Notification dropdown (simple) */}
      {notifOpen && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={() => setNotifOpen(false)} />
          <div className="fixed z-[46] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-80 overflow-hidden"
            style={{ top: '68px', right: '24px' }}>
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <p className="text-sm font-bold text-on-surface">Notifications</p>
              <span className="text-[10px] text-primary font-bold cursor-pointer hover:underline" onClick={() => setNotifOpen(false)}>Mark all read</span>
            </div>
            <div className="divide-y divide-outline-variant max-h-72 overflow-y-auto">
              {pendingRx > 0 ? (
                <Link to="/admin/prescriptions" onClick={() => setNotifOpen(false)}
                  className="flex items-start gap-3 p-4 hover:bg-surface-container-low transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '18px' }}>description</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{pendingRx} Pending Prescription{pendingRx !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Awaiting pharmacist verification</p>
                  </div>
                </Link>
              ) : (
                <div className="p-6 text-center text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>notifications_none</span>
                  <p className="mt-2">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
