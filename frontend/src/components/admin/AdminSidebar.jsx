import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/medicines', icon: 'medication', label: 'Medicines' },
  { to: '/admin/categories', icon: 'category', label: 'Categories' },
  { to: '/admin/inventory', icon: 'inventory_2', label: 'Inventory' },
  { to: '/admin/prescriptions', icon: 'description', label: 'Prescriptions' },
  { to: '/admin/orders', icon: 'shopping_cart', label: 'Orders' },
  { to: '/admin/customers', icon: 'group', label: 'Customers' },
  { to: '/admin/delivery', icon: 'local_shipping', label: 'Delivery' },
  { to: '/admin/reports', icon: 'bar_chart', label: 'Reports' },
  { to: '/admin/settings', icon: 'settings', label: 'Settings' },
]

export default function AdminSidebar({ collapsed, onToggle }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <aside
      className="h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-6 z-50 overflow-y-auto overflow-x-hidden transition-all duration-300"
      style={{ width: collapsed ? '72px' : '256px' }}
    >
      {/* Logo + Toggle */}
      <div className={`flex items-center mb-6 px-4 ${collapsed ? 'flex-col justify-center gap-2' : 'justify-between'}`}>
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
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu_open</span>
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin/dashboard'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl shrink-0">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-error text-on-error text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute ml-5 -mt-5 w-2 h-2 bg-error rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-outline-variant px-2 space-y-1">
        {!collapsed ? (
          <Link to="/admin/profile" className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg hover:bg-surface-container-high transition-colors group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold shrink-0">
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface truncate">{user?.fullName || 'Admin'}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '16px' }}>open_in_new</span>
          </Link>
        ) : (
          <div className="flex justify-center py-2 mb-1">
            <Link to="/admin/profile"
              title={user?.fullName || 'Admin'}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </Link>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg flex items-center px-3 py-2.5 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="material-symbols-outlined text-xl shrink-0">logout</span>
          {!collapsed && <span className="text-sm font-medium ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
