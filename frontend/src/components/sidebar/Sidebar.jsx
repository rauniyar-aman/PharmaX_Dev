import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${BACKEND}${url}`
}

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
  { label: 'Settings', path: '/dashboard/settings', icon: 'settings' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const avatarSrc = resolveImg(user?.avatarUrl)

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-container-low flex flex-col z-30 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[256px]'
      }`}
      style={{ boxShadow: '2px 0 12px -2px rgba(0,0,0,0.06)' }}
    >
      <div className={`flex items-center border-b border-outline-variant flex-shrink-0 ${collapsed ? 'flex-col justify-center gap-2 px-3 py-3' : 'h-16 px-4 justify-between'}`}>
        {collapsed ? (
          <>
            <img src="/PharmaX_Logo.png" alt="PharmaX" className="h-9 w-auto object-contain" />
            <button
              onClick={onToggle}
              title="Expand sidebar"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu</span>
            </button>
          </>
        ) : (
          <>
            <img src="/PharmaX_Logo.png" alt="PharmaX" className="h-12 w-auto" />
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu_open</span>
            </button>
          </>
        )}
      </div>

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

      <div className="border-t border-outline-variant py-2 px-2">
        <ul className="space-y-0.5">
          <li>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container active-glow'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? 'Profile' : undefined}
            >
              <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 overflow-hidden">
                {avatarSrc
                  ? <img src={avatarSrc} className="w-full h-full object-cover" alt="" />
                  : user?.fullName?.[0]?.toUpperCase() || 'U'}
              </div>
              {!collapsed && <span>Profile</span>}
            </NavLink>
          </li>
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

          <li>
            <button
              onClick={() => { logout(); navigate('/signin') }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error-container transition-all duration-150 ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? 'Logout' : undefined}
            >
              <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '20px' }}>logout</span>
              {!collapsed && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
