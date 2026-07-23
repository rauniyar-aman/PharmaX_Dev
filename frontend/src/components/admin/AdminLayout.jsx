import { useState } from 'react'
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import NotificationPanel from '../notifications/NotificationPanel'
import { useNotificationsCtx } from '../../context/NotificationsContext'

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
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const key = Object.keys(PAGE_TITLES).find(k => k !== '/admin/dashboard' && pathname.startsWith(k))
  return key ? PAGE_TITLES[key] : { title: 'Admin', icon: 'admin_panel_settings' }
}

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()
  const { unread } = useNotificationsCtx()

  const { title, icon } = getPageMeta(location.pathname)

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

  const avatarSrc = user?.avatarUrl
    ? (user.avatarUrl.startsWith('data:') || user.avatarUrl.startsWith('http') ? user.avatarUrl : `${BACKEND}${user.avatarUrl}`)
    : null

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className="min-h-screen flex flex-col transition-all duration-300" style={{ marginLeft: sidebarW }}>

        <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 h-16 flex-shrink-0 shadow-sm">
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

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative"
                title="Notifications">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-[45]" onClick={() => setNotifOpen(false)} />
                  <div className="fixed z-[46] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-80 overflow-hidden"
                    style={{ top: '68px', right: '24px' }}>
                    <NotificationPanel isAdmin onClose={() => setNotifOpen(false)} />
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-outline-variant mx-1" />

            <Link to="/admin/profile" className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-surface-container transition-colors group">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold flex-shrink-0 overflow-hidden">
                {avatarSrc
                  ? <img src={avatarSrc} className="w-full h-full object-cover" alt="" />
                  : <span>{user?.fullName?.[0]?.toUpperCase() || 'A'}</span>
                }
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-on-surface leading-tight">{user?.fullName || 'Admin'}</p>
                <p className="text-[10px] text-on-surface-variant leading-tight">Administrator</p>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
