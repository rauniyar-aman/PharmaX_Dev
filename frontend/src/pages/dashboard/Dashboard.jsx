import React from 'react'
import { Link } from 'react-router-dom'

const statCards = [
  {
    label: 'Total Orders',
    value: '24',
    sub: '+3 this month',
    icon: 'shopping_bag',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
  },
  {
    label: 'Pending',
    value: '3',
    sub: '2 awaiting dispatch',
    icon: 'pending_actions',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
  },
  {
    label: 'Delivered',
    value: '18',
    sub: 'Last: Jun 20, 2024',
    icon: 'local_shipping',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
  },
  {
    label: 'Wishlist',
    value: '12',
    sub: '+2 items added',
    icon: 'favorite',
    iconBg: 'bg-error-container',
    iconColor: 'text-error',
  },
]

const shortcuts = [
  { label: 'Medicines', path: '/dashboard/medicines', icon: 'pill', color: 'text-secondary' },
  { label: 'View Cart', path: '/dashboard/cart', icon: 'shopping_bag', color: 'text-primary' },
  { label: 'Track Order', path: '/dashboard/track-order/ORD-2024-001', icon: 'route', color: 'text-tertiary' },
  { label: 'Wishlist', path: '/dashboard/wishlist', icon: 'bookmark', color: 'text-error' },
]

const recentActivity = [
  {
    icon: 'local_shipping',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    title: 'Order #ORD-2024-001 Shipped',
    desc: 'Your order is on the way',
    time: '2 hours ago',
  },
  {
    icon: 'verified',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    title: 'Prescription Verified',
    desc: 'Prescription for Amoxicillin approved',
    time: '1 day ago',
  },
  {
    icon: 'check_circle',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    title: 'Order #ORD-2024-003 Delivered',
    desc: 'Successfully delivered to your address',
    time: '3 days ago',
  },
  {
    icon: 'favorite',
    iconBg: 'bg-error-container',
    iconColor: 'text-error',
    title: 'Added to Wishlist',
    desc: 'Vitamin D3 2000IU added to wishlist',
    time: '4 days ago',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Good Morning, Alex!</h2>
        <p className="text-sm text-on-surface-variant mt-1">Here's what's happening with your health orders today.</p>
      </div>

      {/* Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 custom-shadow flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              <span className={`material-symbols-outlined ms-filled ${card.iconColor}`} style={{ fontSize: '26px' }}>{card.icon}</span>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-on-surface leading-tight">{card.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Left col + Right col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Column */}
        <div className="space-y-4">
          {/* Upload Prescription Card */}
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-primary text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors w-full justify-center"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Upload Now
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl p-5 custom-shadow">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {shortcuts.map((s) => (
                <Link
                  key={s.label}
                  to={s.path}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group"
                >
                  <span className={`material-symbols-outlined ms-filled ${s.color}`} style={{ fontSize: '24px' }}>{s.icon}</span>
                  <span className="text-xs font-medium text-on-surface text-center leading-tight">{s.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 custom-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-on-surface">Recent Activity</h3>
            <Link to="/dashboard/orders" className="text-sm font-medium text-secondary hover:underline">View All</Link>
          </div>

          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-4 relative pb-5 last:pb-0">
                {/* Vertical line */}
                {i < recentActivity.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-outline-variant" />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${item.iconBg}`}>
                  <span className={`material-symbols-outlined ms-filled ${item.iconColor}`} style={{ fontSize: '18px' }}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                  <p className="text-xs text-on-surface-variant mt-1 font-medium">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Promo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Health Tip */}
        <div className="bg-surface-container-highest rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '24px' }}>tips_and_updates</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Health Tip</p>
            <p className="text-sm font-semibold text-on-surface">Stay Hydrated!</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Drinking 8 glasses of water daily helps your body absorb medicine more effectively.</p>
          </div>
        </div>

        {/* Refill Alert */}
        <div className="bg-surface-container-highest rounded-2xl p-5 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined ms-filled text-error" style={{ fontSize: '24px' }}>notification_important</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Refill Alert</p>
            <p className="text-sm font-semibold text-on-surface">Metformin Running Low</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">You have approximately 5 days supply left. Time to reorder.</p>
            <Link to="/dashboard/medicines" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline">
              Reorder Now
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
