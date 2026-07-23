import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotificationsCtx } from '../../context/NotificationsContext'
import api from '../../lib/api'

const ACTIVE_STATUSES = new Set(['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'])

const NOTIF_CFG = {
  ORDER_PLACED:           { icon: 'shopping_bag',  iconBg: 'bg-secondary-fixed', iconColor: 'text-secondary' },
  ORDER_UPDATE:           { icon: 'local_shipping', iconBg: 'bg-secondary-fixed', iconColor: 'text-secondary' },
  PAYMENT_UPDATE:         { icon: 'payments',       iconBg: 'bg-primary-fixed',   iconColor: 'text-primary' },
  PRESCRIPTION_SUBMITTED: { icon: 'upload_file',    iconBg: 'bg-amber-100',       iconColor: 'text-amber-600' },
  PRESCRIPTION_VERIFIED:  { icon: 'verified',       iconBg: 'bg-primary-fixed',   iconColor: 'text-primary' },
  PRESCRIPTION_REJECTED:  { icon: 'cancel',         iconBg: 'bg-error-container', iconColor: 'text-error' },
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m} minute${m !== 1 ? 's' : ''} ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`
  const d = Math.floor(h / 24)
  return `${d} day${d !== 1 ? 's' : ''} ago`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const shortcuts = [
  { label: 'Medicines',   path: '/dashboard/medicines', icon: 'pill',          color: 'text-secondary' },
  { label: 'View Cart',   path: '/dashboard/cart',      icon: 'shopping_bag',  color: 'text-primary' },
  { label: 'My Orders',   path: '/dashboard/orders',    icon: 'route',         color: 'text-tertiary' },
  { label: 'Wishlist',    path: '/dashboard/wishlist',  icon: 'bookmark',      color: 'text-error' },
]

const HEALTH_TIPS = [
  'Drinking 8 glasses of water daily helps your body absorb medicine more effectively.',
  'Take medications at the same time each day to build a consistent routine.',
  'Store medicines in a cool, dry place away from direct sunlight.',
  'Never skip a dose — set a reminder on your phone to stay on track.',
  'Always complete your full antibiotic course, even if you feel better.',
]

export default function Dashboard() {
  useEffect(() => { document.title = 'Dashboard — PharmaX' }, [])
  const { user } = useAuth()
  const { notifs } = useNotificationsCtx()
  const firstName = user?.fullName?.split(' ')[0] || 'there'

  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [refill, setRefill]     = useState(null)

  const tip = HEALTH_TIPS[new Date().getDate() % HEALTH_TIPS.length]

  useEffect(() => {
    const load = async () => {
      try {
        const [ordRes, wishRes] = await Promise.all([
          api.get('/orders', { params: { limit: 100 } }),
          api.get('/wishlist'),
        ])

        const orders    = ordRes.data.data.orders || []
        const total     = ordRes.data.data.pagination?.total ?? orders.length
        const pending   = orders.filter(o => ACTIVE_STATUSES.has(o.status)).length
        const delivered = orders.filter(o => o.status === 'DELIVERED').length

        setStats({
          total,
          pending,
          delivered,
          wishlist: (wishRes.data.data.items || []).length,
        })

        const delivered14 = orders
          .filter(o => o.status === 'DELIVERED' && (Date.now() - new Date(o.placedAt).getTime()) > 14 * 86400000)
          .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))[0]

        if (delivered14 && delivered14.items?.length > 0) {
          const med = delivered14.items[0].medicine
          const daysAgo = Math.floor((Date.now() - new Date(delivered14.placedAt).getTime()) / 86400000)
          setRefill({ name: med.name, orderId: delivered14.id, daysAgo })
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    {
      label: 'Total Orders',
      value: loading ? '…' : stats?.total ?? 0,
      sub: loading ? '' : `${stats?.delivered ?? 0} delivered`,
      icon: 'shopping_bag',
      iconBg: 'bg-secondary-fixed',
      iconColor: 'text-secondary',
      to: '/dashboard/orders',
    },
    {
      label: 'Active Orders',
      value: loading ? '…' : stats?.pending ?? 0,
      sub: loading ? '' : stats?.pending === 0 ? 'None in progress' : 'In progress',
      icon: 'pending_actions',
      iconBg: 'bg-primary-fixed',
      iconColor: 'text-primary',
      to: '/dashboard/orders',
    },
    {
      label: 'Delivered',
      value: loading ? '…' : stats?.delivered ?? 0,
      sub: loading ? '' : 'Successfully delivered',
      icon: 'local_shipping',
      iconBg: 'bg-tertiary-fixed',
      iconColor: 'text-tertiary',
      to: '/dashboard/orders',
    },
    {
      label: 'Wishlist',
      value: loading ? '…' : stats?.wishlist ?? 0,
      sub: loading ? '' : `${stats?.wishlist ?? 0} saved item${stats?.wishlist !== 1 ? 's' : ''}`,
      icon: 'favorite',
      iconBg: 'bg-error-container',
      iconColor: 'text-error',
      to: '/dashboard/wishlist',
    },
  ]

  const recentActivity = notifs.slice(0, 4)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">{getGreeting()}, {firstName}!</h2>
        <p className="text-sm text-on-surface-variant mt-1">Here's what's happening with your health orders today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.to} className="bg-surface-container-lowest rounded-2xl p-5 custom-shadow flex items-center gap-4 hover:bg-surface-container transition-colors">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              <span className={`material-symbols-outlined ms-filled ${card.iconColor}`} style={{ fontSize: '26px' }}>{card.icon}</span>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-on-surface leading-tight">{card.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-4">
          <div className="bg-primary rounded-2xl p-5 text-on-primary">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: '22px' }}>upload_file</span>
              </div>
              <div>
                <p className="font-semibold text-white text-[15px]">Upload Prescription</p>
                <p className="text-xs text-white/80 mt-0.5">Upload your doctor's prescription for Rx medicines</p>
              </div>
            </div>
            <Link
              to="/dashboard/prescriptions"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest text-primary text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors w-full justify-center"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Upload Now
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 custom-shadow">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {shortcuts.map((s) => (
                <Link
                  key={s.label}
                  to={s.path}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <span className={`material-symbols-outlined ms-filled ${s.color}`} style={{ fontSize: '24px' }}>{s.icon}</span>
                  <span className="text-xs font-medium text-on-surface text-center leading-tight">{s.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-5 custom-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-on-surface">Recent Activity</h3>
            <Link to="/dashboard/orders" className="text-sm font-medium text-secondary hover:underline">View All</Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '40px' }}>history</span>
              <p className="text-sm font-semibold text-on-surface mt-3">No recent activity</p>
              <p className="text-xs text-on-surface-variant mt-1">Your orders and updates will appear here</p>
            </div>
          ) : (
            <div className="space-y-0">
              {recentActivity.map((n, i) => {
                const cfg = NOTIF_CFG[n.type] || { icon: 'info', iconBg: 'bg-surface-container', iconColor: 'text-on-surface-variant' }
                return (
                  <div key={n.id} className="flex gap-4 relative pb-5 last:pb-0">
                    {i < recentActivity.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-px bg-outline-variant" />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${cfg.iconBg}`}>
                      <span className={`material-symbols-outlined ms-filled ${cfg.iconColor}`} style={{ fontSize: '18px' }}>{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold text-on-surface ${!n.isRead ? '' : 'opacity-80'}`}>{n.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{n.message}</p>
                      <p className="text-xs text-on-surface-variant mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                    </div>
                    {n.link && (
                      <Link to={n.link} className="text-xs text-secondary font-medium hover:underline flex-shrink-0 mt-1">View</Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-container-highest rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '24px' }}>tips_and_updates</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Health Tip</p>
            <p className="text-sm font-semibold text-on-surface">Stay on Track!</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{tip}</p>
          </div>
        </div>

        {refill ? (
          <div className="bg-surface-container-highest rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined ms-filled text-error" style={{ fontSize: '24px' }}>notification_important</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Refill Reminder</p>
              <p className="text-sm font-semibold text-on-surface">{refill.name}</p>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                You ordered this {refill.daysAgo} days ago — consider reordering if you're running low.
              </p>
              <Link to="/dashboard/medicines" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline">
                Reorder Now
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-highest rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '24px' }}>medication</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Explore</p>
              <p className="text-sm font-semibold text-on-surface">Browse Medicines</p>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Discover our wide range of medicines and health products.</p>
              <Link to="/dashboard/medicines" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline">
                Shop Now
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
