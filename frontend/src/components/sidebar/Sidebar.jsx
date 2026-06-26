import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Medicines', path: '/dashboard/medicines', icon: 'pill' },
  { label: 'Categories', path: '/dashboard/categories', icon: 'category' },
  { label: 'Orders', path: '/dashboard/orders', icon: 'package_2' },
  { label: 'Wishlist', path: '/dashboard/wishlist', icon: 'favorite' },
  { label: 'Prescriptions', path: '/dashboard/prescriptions', icon: 'description' },
  { label: 'My Reviews', path: '/dashboard/reviews', icon: 'rate_review' },
]

const bottomItems = [
  { label: 'Profile', path: '/dashboard/profile', icon: 'account_circle' },
  { label: 'Settings', path: '/dashboard/settings', icon: 'settings' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-container-low flex flex-col z-30 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[256px]'
      }`}
      style={{ boxShadow: '2px 0 12px -2px rgba(0,0,0,0.06)' }}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-outline-variant flex-shrink-0 ${collapsed ? 'justify-center px-3' : 'px-4 justify-between'}`}>
        {collapsed ? (
          <>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary flex-shrink-0">
              <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: '20px' }}>medical_services</span>
            </div>
            <button
              onClick={onToggle}
              className="absolute -right-3 top-5 w-6 h-6 bg-white border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            </button>
          </>
        ) : (
          <>
            <img src="/PharmaX_Logo.png" alt="PharmaX" className="h-9 w-auto" />
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
          </>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container active-glow'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined flex-shrink-0 ${isActive ? 'ms-filled' : ''}`}
                      style={{ fontSize: '20px' }}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-outline-variant py-2 px-2">
        <ul className="space-y-0.5">
          {bottomItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container active-glow'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`material-symbols-outlined flex-shrink-0 ${isActive ? 'ms-filled' : ''}`}
                      style={{ fontSize: '20px' }}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}

          {/* Logout */}
          <li>
            <button
              onClick={() => navigate('/signin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error-container transition-all duration-150 ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? 'Logout' : undefined}
            >
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '20px' }}>logout</span>
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>

        {/* User card */}
        {!collapsed && (
          <div className="mt-2 pt-2 border-t border-outline-variant">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface truncate">Aman Rauniyar</p>
                <p className="text-xs text-on-surface-variant truncate">aman@example.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
