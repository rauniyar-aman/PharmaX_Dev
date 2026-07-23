import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminCategories() {
  useEffect(() => { document.title = 'Categories — PharmaX Admin' }, [])
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await api.get('/categories')
      setCategories(res.data.data.categories || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const handleDelete = async (id, name, count) => {
    if (count > 0) {
      alert(`Cannot delete "${name}" — ${count} medicine(s) are assigned to it.`)
      return
    }
    if (!window.confirm(`Delete category "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/categories/${id}`)
      fetchCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const filtered = categories.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || (statusFilter === 'active' ? c.isActive : !c.isActive)
    return matchSearch && matchStatus
  })

  const totalActive = categories.filter(c => c.isActive).length
  const totalInactive = categories.filter(c => !c.isActive).length
  const mostActive = [...categories].sort((a, b) => (b._count?.medicines || 0) - (a._count?.medicines || 0))[0]

  return (
    <div className="flex flex-col min-h-screen">

      <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-on-surface">Manage Medicine Categories</h3>
            <p className="text-sm text-on-surface-variant">Organize and classify the pharmaceutical inventory for better accessibility.</p>
          </div>
          <button
            onClick={() => navigate('/admin/categories/add')}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm font-bold"
          >
            <span className="material-symbols-outlined">add</span>
            Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Categories</p>
            <div className="flex items-end justify-between">
              <h4 className="text-3xl font-bold text-on-surface">{categories.length}</h4>
              <span className="text-primary flex items-center text-xs font-bold">
                <span className="material-symbols-outlined text-base mr-1">category</span>
                {totalActive} Active
              </span>
            </div>
          </div>
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Most Medicines</p>
            <div className="flex flex-col">
              <h4 className="text-lg font-bold text-on-surface">{mostActive?.name || '-'}</h4>
              <span className="text-on-surface-variant text-xs">{mostActive?._count?.medicines || 0} Medicines</span>
            </div>
          </div>
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-error/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Inactive</p>
            <div className="flex items-end justify-between">
              <h4 className="text-3xl font-bold text-on-surface">{totalInactive}</h4>
              {totalInactive > 0 && (
                <span className="text-error flex items-center text-xs font-bold">
                  <span className="material-symbols-outlined text-base mr-1">warning</span>
                  Action Req.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">filter_list</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Filter categories by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant uppercase">Status:</span>
            <select
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-w-[140px]"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high/50 border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-16">Icon</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center">Medicines</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    No categories found.{' '}
                    <button onClick={() => navigate('/admin/categories/add')} className="text-primary font-semibold">Add one?</button>
                  </td></tr>
                ) : filtered.map(cat => (
                  <tr key={cat.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                        {cat.icon || <span className="material-symbols-outlined text-primary">category</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-on-surface">{cat.name}</p>
                      <span className="text-[10px] text-on-surface-variant font-mono">{cat.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-on-surface-variant line-clamp-1">{cat.description || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {cat._count?.medicines || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cat.isActive
                        ? <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Active</span>
                        : <span className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-bold border border-outline-variant">Inactive</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/categories/${cat.id}`)}
                          className="p-1.5 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant"
                          title="View"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button
                          onClick={() => navigate(`/admin/categories/${cat.id}/edit`)}
                          className="p-1.5 hover:bg-surface-container-low rounded-lg transition-colors text-secondary"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name, cat._count?.medicines || 0)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-error"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-surface-container-low/50 flex items-center justify-between border-t border-outline-variant">
            <span className="text-xs text-on-surface-variant">
              Showing <span className="font-bold text-on-surface">{filtered.length}</span> of <span className="font-bold text-on-surface">{categories.length}</span> categories
            </span>
          </div>
        </div>

      </div>

      <button
        onClick={() => navigate('/admin/categories/add')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50 group"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        <span className="absolute right-16 bg-inverse-surface text-inverse-on-surface px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">New Category</span>
      </button>
    </div>
  )
}
