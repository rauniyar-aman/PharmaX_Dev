import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useNotificationsCtx } from '../../context/NotificationsContext'
import api from '../../lib/api'

const STATUS_CFG = {
  PLACED:           { label: 'Placed',           cls: 'bg-surface-container text-on-surface-variant' },
  CONFIRMED:        { label: 'Confirmed',         cls: 'bg-primary/10 text-primary' },
  PROCESSING:       { label: 'Processing',        cls: 'bg-secondary-container/30 text-secondary' },
  SHIPPED:          { label: 'Shipped',           cls: 'bg-tertiary-fixed text-tertiary' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  cls: 'bg-amber-100 text-amber-700' },
  DELIVERED:        { label: 'Delivered',         cls: 'bg-primary/10 text-primary' },
  CANCELLED:        { label: 'Cancelled',         cls: 'bg-error-container text-error' },
}

function fmt(n) {
  n = Number(n)
  if (n >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000)    return `Rs ${(n / 1_000).toFixed(0)}k`
  return `Rs ${Math.round(n).toLocaleString()}`
}

function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const NOTIF_ICON = {
  ORDER_PLACED:           { icon: 'shopping_bag',  bg: 'bg-secondary/10', color: 'text-secondary' },
  ORDER_UPDATE:           { icon: 'local_shipping', bg: 'bg-primary/10',   color: 'text-primary' },
  PAYMENT_UPDATE:         { icon: 'payments',       bg: 'bg-primary/10',   color: 'text-primary' },
  NEW_ORDER:              { icon: 'receipt_long',   bg: 'bg-secondary/10', color: 'text-secondary' },
  NEW_PRESCRIPTION:       { icon: 'description',    bg: 'bg-amber-100',    color: 'text-amber-600' },
  PRESCRIPTION_VERIFIED:  { icon: 'verified_user',  bg: 'bg-primary/10',   color: 'text-primary' },
  PRESCRIPTION_REJECTED:  { icon: 'cancel',         bg: 'bg-error-container', color: 'text-error' },
}

export default function AdminDashboard() {
  useEffect(() => { document.title = 'Dashboard — PharmaX Admin' }, [])
  const navigate = useNavigate()
  const { notifs } = useNotificationsCtx()

  const [stats,         setStats]         = useState(null)
  const [recentOrders,  setRecentOrders]  = useState([])
  const [pendingRx,     setPendingRx]     = useState([])
  const [lowStockMeds,  setLowStockMeds]  = useState([])
  const [loading,       setLoading]       = useState(true)

  const [searchQuery,   setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders', { params: { limit: 5 } }),
      api.get('/admin/prescriptions', { params: { status: 'PENDING', limit: 3 } }),
      api.get('/medicines', { params: { lowStock: 'true', limit: 4, sortBy: 'newest' } }),
    ]).then(([s, o, p, m]) => {
      setStats(s.data.data)
      setRecentOrders(o.data.data.orders || [])
      setPendingRx(p.data.data.prescriptions || [])
      setLowStockMeds(m.data.data.medicines || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults(null); setSearchOpen(false); return }
    setSearchLoading(true)
    setSearchOpen(true)
    try {
      const [mRes, oRes, cRes] = await Promise.all([
        api.get('/medicines',        { params: { search: q, limit: 4 } }),
        api.get('/admin/orders',     { params: { search: q, limit: 4 } }),
        api.get('/admin/customers',  { params: { search: q, limit: 4 } }),
      ])
      setSearchResults({
        medicines:  mRes.data.data.medicines  || [],
        orders:     oRes.data.data.orders     || [],
        customers:  cRes.data.data.customers  || [],
      })
    } catch {}
    setSearchLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(searchQuery), 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery, runSearch])

  useEffect(() => {
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activityStream = notifs.slice(0, 5)

  const kpiCards = stats ? [
    {
      icon: 'pill', iconBg: 'bg-primary/10', iconColor: 'text-primary',
      label: 'Total Medicines', value: stats.totalMedicines.toLocaleString(),
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} low stock` : 'All stocked',
      badgeColor: stats.lowStockCount > 0 ? 'text-error' : 'text-primary',
    },
    {
      icon: 'shopping_bag', iconBg: 'bg-secondary-container/20', iconColor: 'text-secondary',
      label: 'Total Orders', value: stats.totalOrders.toLocaleString(),
      badge: `${stats.monthlyOrders} this month`,
      badgeColor: 'text-secondary',
    },
    {
      icon: 'group', iconBg: 'bg-surface-container-highest', iconColor: 'text-tertiary',
      label: 'Active Customers', value: stats.totalCustomers.toLocaleString(),
      badge: `+${stats.newCustomers} this month`,
      badgeColor: 'text-on-surface-variant',
    },
    {
      icon: 'clinical_notes', iconBg: 'bg-error-container/20', iconColor: 'text-error',
      label: 'Pending Prescriptions', value: stats.pendingPrescriptions,
      badge: stats.pendingPrescriptions > 0 ? 'Action Required' : 'All Reviewed',
      badgeColor: stats.pendingPrescriptions > 0 ? 'text-error' : 'text-primary',
    },
    {
      icon: 'warning', iconBg: 'bg-outline-variant/20', iconColor: 'text-outline',
      label: 'Low Stock Items', value: stats.lowStockCount,
      badge: stats.lowStockCount > 0 ? 'Attention' : 'All Good',
      badgeColor: stats.lowStockCount > 0 ? 'text-error' : 'text-primary',
    },
    {
      icon: 'payments', iconBg: 'bg-primary/10', iconColor: 'text-primary',
      label: 'Total Revenue', value: fmt(stats.totalRevenue),
      badge: `${fmt(stats.monthlyRevenue)} this month`,
      badgeColor: 'text-primary',
    },
  ] : Array(6).fill(null)

  const statusDist = stats?.ordersByStatus || {}
  const distItems = [
    { dot: 'bg-primary',   label: 'Delivered',   count: statusDist.DELIVERED || 0 },
    { dot: 'bg-secondary', label: 'In Progress',  count: (statusDist.PLACED || 0) + (statusDist.CONFIRMED || 0) + (statusDist.PROCESSING || 0) + (statusDist.SHIPPED || 0) + (statusDist.OUT_FOR_DELIVERY || 0) },
    { dot: 'bg-error',     label: 'Cancelled',    count: statusDist.CANCELLED || 0 },
  ]

  return (
    <>
      <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-72 bg-surface-container border-l border-outline-variant/30 py-6 px-4 z-30 overflow-y-auto">
        <div className="mb-6">
          <h5 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Quick Actions</h5>
          <div className="space-y-3">
            <button onClick={() => navigate('/admin/medicines/add')}
              className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Add Medicine
            </button>
            <button onClick={() => navigate('/admin/categories')}
              className="w-full bg-secondary-container text-on-secondary-container py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-xl">category</span>
              Manage Categories
            </button>
            <button onClick={() => navigate('/admin/prescriptions')}
              className="w-full border-2 border-primary text-primary py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-xl">verified</span>
              Verify Prescriptions
              {stats?.pendingPrescriptions > 0 && (
                <span className="ml-auto bg-error text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">{stats.pendingPrescriptions}</span>
              )}
            </button>
            <button onClick={() => navigate('/admin/reports')}
              className="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all">
              <span className="material-symbols-outlined text-xl">assessment</span>
              View Reports
            </button>
          </div>
        </div>

        <div>
          <h5 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Activity Stream</h5>
          {activityStream.length === 0 ? (
            <p className="text-[11px] text-on-surface-variant text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {activityStream.map(n => {
                const cfg = NOTIF_ICON[n.type] || { icon: 'info', bg: 'bg-surface-container', color: 'text-on-surface-variant' }
                const dest = n.link || '#'
                return (
                  <button key={n.id} onClick={() => navigate(dest)}
                    className="w-full flex gap-3 p-2 rounded-xl hover:bg-surface-container-lowest transition-colors text-left group">
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.color} shrink-0 group-hover:scale-105 transition-transform`}>
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-on-surface font-semibold leading-tight line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-on-surface-variant leading-tight line-clamp-1 mt-0.5">{n.message}</p>
                      <p className="text-[9px] text-on-surface-variant/60 font-bold mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors self-center flex-shrink-0" style={{ fontSize: '14px' }}>chevron_right</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      <div className="mr-72">
        <div className="w-full px-6 py-3 bg-surface-container-lowest border-b border-outline-variant" ref={searchRef}>
          <div className="relative max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
            {searchLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            <input
              className="w-full bg-surface-container-low rounded-xl py-2.5 pl-10 pr-8 border border-transparent focus:border-primary text-sm outline-none transition-colors"
              placeholder="Search orders, customers, medicines..."
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setSearchOpen(true)}
            />

            {searchOpen && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
                {searchResults.medicines.length === 0 && searchResults.orders.length === 0 && searchResults.customers.length === 0 ? (
                  <div className="py-6 text-center text-sm text-on-surface-variant">No results for "{searchQuery}"</div>
                ) : (
                  <>
                    {searchResults.medicines.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container/50">Medicines</p>
                        {searchResults.medicines.map(m => (
                          <button key={m.id} onClick={() => { navigate(`/admin/medicines/${m.id}`); setSearchOpen(false); setSearchQuery('') }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-left">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>medication</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-on-surface truncate">{m.name}</p>
                              <p className="text-xs text-on-surface-variant">{m.brand} · {m.type} · Rs {Number(m.price).toLocaleString()}</p>
                            </div>
                            <span className={`ml-auto text-[10px] font-bold flex-shrink-0 ${m.inStock ? 'text-primary' : 'text-error'}`}>{m.inStock ? 'In Stock' : 'Out'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.orders.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container/50">Orders</p>
                        {searchResults.orders.map(o => (
                          <button key={o.id} onClick={() => { navigate('/admin/orders'); setSearchOpen(false); setSearchQuery('') }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-left">
                            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>receipt_long</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-on-surface">#{o.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-on-surface-variant">{o.user?.fullName} · Rs {Number(o.totalAmount).toLocaleString()}</p>
                            </div>
                            <span className="ml-auto text-[10px] font-bold text-secondary flex-shrink-0">{o.status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.customers.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container/50">Customers</p>
                        {searchResults.customers.map(c => (
                          <button key={c.id} onClick={() => { navigate(`/admin/customers/${c.id}`); setSearchOpen(false); setSearchQuery('') }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-left">
                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold flex-shrink-0">
                              {c.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-on-surface truncate">{c.fullName}</p>
                              <p className="text-xs text-on-surface-variant truncate">{c.email}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpiCards.map((card, i) => (
              <div key={i} className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between min-h-[100px]">
                {card ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 ${card.iconBg} rounded-lg ${card.iconColor}`}>
                        <span className="material-symbols-outlined text-xl">{card.icon}</span>
                      </div>
                      <span className={`text-[10px] font-bold text-right leading-tight ${card.badgeColor}`}>{card.badge}</span>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">{card.label}</p>
                      <h3 className="text-xl font-bold text-on-surface mt-0.5">{card.value}</h3>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse space-y-2 pt-2">
                    <div className="w-8 h-8 bg-surface-container rounded-lg" />
                    <div className="h-3 bg-surface-container rounded w-3/4 mt-3" />
                    <div className="h-5 bg-surface-container rounded w-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="p-5 border-b border-outline-variant flex justify-between items-center">
                <h4 className="text-base font-semibold text-on-surface">Recent Orders</h4>
                <Link to="/admin/orders" className="text-primary text-sm font-bold hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-surface-container animate-pulse rounded-lg" />)}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="py-10 text-center text-sm text-on-surface-variant">No orders yet</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container/30 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">Order ID</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {recentOrders.map(o => {
                        const sc = STATUS_CFG[o.status] || { label: o.status, cls: 'bg-surface-container text-on-surface-variant' }
                        return (
                          <tr key={o.id} className="hover:bg-surface-container/20 transition-colors cursor-pointer"
                            onClick={() => navigate('/admin/orders')}>
                            <td className="px-5 py-3 font-bold text-on-surface text-sm font-mono">
                              #{o.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="px-5 py-3 text-on-surface-variant text-sm">{o.user?.fullName || '—'}</td>
                            <td className="px-5 py-3 text-on-surface text-sm font-semibold">Rs {Number(o.totalAmount).toLocaleString()}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 ${sc.cls} rounded-full text-[10px] font-bold whitespace-nowrap`}>{sc.label}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-[10px] font-bold ${o.paymentStatus === 'PAID' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                {o.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <h4 className="text-base font-semibold text-on-surface mb-6">Order Breakdown</h4>
              <div className="flex justify-center mb-6">
                <div className="relative w-44 h-44 rounded-full border-[12px] border-surface-container flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[12px] border-secondary border-t-transparent border-r-transparent rotate-45" />
                  <div className="text-center">
                    <span className="text-xl font-bold text-on-surface">{stats?.totalOrders ?? '…'}</span>
                    <p className="text-[10px] text-on-surface-variant font-bold">Total Orders</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {distItems.map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.dot}`} />
                      <span className="text-on-surface">{item.label}</span>
                    </div>
                    <span className="font-bold text-on-surface">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-base font-semibold text-on-surface">Pending Prescriptions</h4>
                <div className="flex items-center gap-2">
                  {stats?.pendingPrescriptions > 0 && (
                    <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {stats.pendingPrescriptions} pending
                    </span>
                  )}
                  <Link to="/admin/prescriptions" className="text-xs text-primary font-bold hover:underline">View All</Link>
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-container animate-pulse rounded-xl" />)}
                </div>
              ) : pendingRx.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-primary/40" style={{ fontSize: '40px' }}>verified_user</span>
                  <p className="text-sm text-on-surface-variant mt-2">No pending prescriptions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRx.map(p => (
                    <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant hover:border-primary transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm flex-shrink-0">
                        {p.user?.fullName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{p.user?.fullName || 'Unknown'}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-error font-bold uppercase">Pending Verification</span>
                          <span className="text-[10px] text-on-surface-variant">• {timeAgo(p.uploadedAt)}</span>
                        </div>
                      </div>
                      <Link to="/admin/prescriptions"
                        className="p-1.5 hover:bg-surface-container-high text-on-surface-variant transition-colors rounded-lg flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                      </Link>
                    </div>
                  ))}
                  {stats?.pendingPrescriptions > 3 && (
                    <Link to="/admin/prescriptions" className="block text-center text-xs text-primary font-semibold hover:underline pt-1">
                      +{stats.pendingPrescriptions - 3} more pending →
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-base font-semibold text-on-surface">Inventory Alert</h4>
                <Link to="/admin/inventory" className="text-xs text-primary font-bold hover:underline">View All</Link>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-surface-container animate-pulse rounded-lg" />)}
                </div>
              ) : lowStockMeds.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-primary/40" style={{ fontSize: '40px' }}>inventory_2</span>
                  <p className="text-sm text-on-surface-variant mt-2">All medicines are well stocked</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockMeds.map(m => {
                    const pct = m.stockQuantity === 0 ? 0 : Math.min(100, Math.round((m.stockQuantity / 50) * 100))
                    const isOut = !m.inStock || m.stockQuantity === 0
                    return (
                      <div key={m.id}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-on-surface font-medium truncate mr-2">{m.name} {m.dosage || ''}</span>
                          <span className={`font-bold flex-shrink-0 ${isOut ? 'text-error' : 'text-amber-600'}`}>
                            {isOut ? 'Out of Stock' : `${m.stockQuantity} left`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className={`${isOut ? 'bg-error' : 'bg-amber-500'} h-full rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Monthly Revenue',   value: stats ? fmt(stats.monthlyRevenue) : '…',       icon: 'trending_up',  color: 'text-primary',   bg: 'bg-primary/10' },
              { label: 'Total Revenue',     value: stats ? fmt(stats.totalRevenue) : '…',          icon: 'payments',     color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Orders This Month', value: stats ? stats.monthlyOrders.toString() : '…',   icon: 'shopping_bag', color: 'text-tertiary',  bg: 'bg-tertiary-fixed' },
            ].map(card => (
              <div key={card.label} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined ${card.color}`} style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">{card.label}</p>
                  <p className="text-xl font-bold text-on-surface">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
