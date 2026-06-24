import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/medicines', icon: 'medication', label: 'Medicines' },
  { to: '/admin/categories', icon: 'category', label: 'Categories' },
  { to: '/admin/inventory', icon: 'inventory_2', label: 'Inventory' },
  { to: '/admin/prescriptions', icon: 'description', label: 'Prescriptions', badge: '42' },
  { to: '/admin/orders', icon: 'shopping_cart', label: 'Orders' },
  { to: '/admin/customers', icon: 'group', label: 'Customers' },
  { to: '/admin/delivery', icon: 'local_shipping', label: 'Delivery' },
  { to: '/admin/reports', icon: 'bar_chart', label: 'Reports' },
  { to: '/admin/settings', icon: 'settings', label: 'Settings' },
]

export default function AdminSidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-6 px-4 z-50 overflow-y-auto">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary shrink-0">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
        </div>
        <div>
          <p className="font-bold text-base text-on-surface leading-tight">PharmaX</p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Admin Control</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-error text-on-error text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-outline-variant space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold shrink-0">
            {user?.fullName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg flex items-center px-3 py-2.5 transition-all"
        >
          <span className="material-symbols-outlined mr-3 text-xl">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
