import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  const { user, loading } = useAuth()

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
        <div className="text-center p-8 bg-white rounded-2xl shadow-card max-w-sm">
          <span className="material-symbols-outlined text-5xl text-error">block</span>
          <h1 className="mt-4 text-xl font-bold text-on-surface">Access Denied</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Your account does not have admin privileges.
          </p>
          <a href="/dashboard" className="mt-4 inline-block text-primary font-semibold text-sm hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
