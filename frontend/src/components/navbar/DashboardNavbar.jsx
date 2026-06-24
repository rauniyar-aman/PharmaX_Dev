import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

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

export default function DashboardNavbar({ sidebarCollapsed }) {
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const { cartCount } = useCart()

  const getTitle = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard/medicines/')) return 'Medicine Details'
    if (path.startsWith('/dashboard/orders/') && !path.includes('track')) return 'Order Details'
    if (path.startsWith('/dashboard/track-order/')) return 'Track Order'
    return pageTitles[path] || 'Dashboard'
  }

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center justify-between h-16 bg-white border-b border-outline-variant px-5 transition-all duration-300"
      style={{ left: sidebarCollapsed ? '72px' : '256px' }}
    >
      {/* Page Title */}
      <h1 className="text-[17px] font-semibold text-on-surface">{getTitle()}</h1>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div className={`relative flex items-center transition-all duration-200 ${searchFocused ? 'w-60' : 'w-48'}`}>
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            type="text"
            placeholder="Search medicines..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container-low rounded-full border border-transparent focus:border-secondary focus:outline-none text-on-surface placeholder:text-on-surface-variant transition-all duration-200"
          />
        </div>

        {/* Cart */}
        <Link
          to="/dashboard/cart"
          className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-on-secondary-container text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-outline-variant custom-shadow z-50">
              <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <p className="text-sm font-semibold text-on-surface">Notifications</p>
                <span className="text-xs text-secondary font-medium cursor-pointer hover:underline">Mark all read</span>
              </div>
              <ul>
                {[
                  { title: 'Order #ORD-2024-001 shipped', time: '2 min ago', icon: 'local_shipping', color: 'text-secondary' },
                  { title: 'Prescription verified successfully', time: '1 hour ago', icon: 'verified', color: 'text-primary' },
                  { title: 'Special offer on Paracetamol', time: '3 hours ago', icon: 'sell', color: 'text-tertiary' },
                ].map((n, i) => (
                  <li key={i} className="px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant last:border-0">
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined flex-shrink-0 ${n.color}`} style={{ fontSize: '18px' }}>{n.icon}</span>
                      <div>
                        <p className="text-sm text-on-surface">{n.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2.5 text-center">
                <button className="text-sm font-medium text-secondary hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-outline-variant mx-1" />

        {/* Avatar */}
        <Link to="/dashboard/profile" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-container transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold ring-2 ring-primary ring-offset-2">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-on-surface leading-tight">Aman Rauniyar</p>
            <p className="text-[11px] text-on-surface-variant leading-tight">Customer</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px' }}>expand_more</span>
        </Link>
      </div>

      {/* Click outside to close notif */}
      {notifOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
      )}
    </header>
  )
}
