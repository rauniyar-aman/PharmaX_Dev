import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminMedicines() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [monthlyRevenue, setMonthlyRevenue] = useState(null)
  const LIMIT = 10

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      if (typeFilter) params.type = typeFilter
      if (stockFilter) params.inStock = stockFilter === 'in'
      const res = await api.get('/medicines', { params })
      setMedicines(res.data.data.medicines)
      setPagination(res.data.data.pagination)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data.categories || [])).catch(() => {})
    api.get('/admin/stats').then(res => setMonthlyRevenue(res.data.data.monthlyRevenue)).catch(() => {})
  }, [])

  useEffect(() => { fetchMedicines() }, [page, categoryFilter, typeFilter, stockFilter])

  const handleSearch = e => { e.preventDefault(); setPage(1); fetchMedicines() }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/medicines/${id}`)
      fetchMedicines()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  const statusEl = med => med.inStock
    ? <div className="flex items-center gap-1.5 text-primary"><span className="w-2 h-2 rounded-full bg-primary inline-block" /><span className="text-xs font-bold uppercase">In Stock</span></div>
    : <div className="flex items-center gap-1.5 text-error"><span className="w-2 h-2 rounded-full bg-error inline-block" /><span className="text-xs font-bold uppercase">Out of Stock</span></div>

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center px-8 w-full h-16 sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <form onSubmit={handleSearch}>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search medicines, orders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
              />
            </form>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-6">
          <button className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface" />
          </button>
        </div>
      </header>

      <section className="flex-1 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-on-surface">Medicines</h2>
            <p className="text-sm text-on-surface-variant">Manage your pharmacy inventory and product listings.</p>
          </div>
          <button
            onClick={() => navigate('/admin/medicines/add')}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Add Medicine
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: 'inventory', bg: 'bg-primary-fixed', color: 'text-on-primary-fixed-variant', label: 'Total Medicines', value: pagination.total, badge: '+12%', badgeCls: 'text-primary bg-primary/10' },
            { icon: 'warning', bg: 'bg-error-container', color: 'text-on-error-container', label: 'Out of Stock', value: medicines.filter(m => !m.inStock).length, badge: 'Alert', badgeCls: 'text-error bg-error/10' },
            { icon: 'receipt_long', bg: 'bg-secondary-fixed', color: 'text-on-secondary-fixed-variant', label: 'Showing', value: medicines.length, badge: '+5%', badgeCls: 'text-secondary bg-secondary/10' },
            { icon: 'payments', bg: 'bg-tertiary-fixed', color: 'text-on-tertiary-fixed-variant', label: 'Monthly Revenue', value: monthlyRevenue !== null ? `Rs ${Number(monthlyRevenue).toLocaleString()}` : '-', badge: 'This month', badgeCls: 'text-tertiary bg-tertiary/10' },
          ].map(c => (
            <div key={c.label} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className={`p-2 ${c.bg} rounded-xl ${c.color}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                </div>
                <span className={`text-xs font-bold ${c.badgeCls} px-2 py-1 rounded-full`}>{c.badge}</span>
              </div>
              <p className="text-sm text-on-surface-variant">{c.label}</p>
              <p className="text-xl font-bold text-on-surface">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
            <form onSubmit={handleSearch}>
              <input
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none"
                placeholder="Search medicines by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
              />
            </form>
          </div>
          <select
            className="min-w-[140px] px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-surface-container-lowest"
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select
            className="min-w-[140px] px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-surface-container-lowest"
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          >
            <option value="">Medicine Type</option>
            <option value="Rx">Rx Required</option>
            <option value="OTC">OTC Product</option>
          </select>
          <select
            className="min-w-[140px] px-3 py-2 border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-surface-container-lowest"
            value={stockFilter}
            onChange={e => { setStockFilter(e.target.value); setPage(1) }}
          >
            <option value="">Stock Status</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Medicine Info</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Category</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant text-right">Price</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant text-right">Stock</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-on-surface-variant text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {medicines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant text-sm">
                        No medicines found. <button onClick={() => navigate('/admin/medicines/add')} className="text-primary font-semibold">Add one?</button>
                      </td>
                    </tr>
                  ) : medicines.map(med => (
                    <tr key={med.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden border border-outline-variant shrink-0 flex items-center justify-center">
                            {med.imageUrl
                              ? <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                              : <span className="material-symbols-outlined text-on-surface-variant">medication</span>
                            }
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-sm">{med.name}</p>
                            <p className="text-xs text-on-surface-variant">{med.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface">{med.category?.name || '-'}</td>
                      <td className="px-6 py-4">
                        {med.type === 'Rx'
                          ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-error-container text-on-error-container border border-error/20">Rx Required</span>
                          : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-fixed text-on-secondary-fixed-variant border border-secondary/20">OTC Product</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-on-surface text-right">Rs {Number(med.price).toFixed(0)}</td>
                      <td className="px-6 py-4 text-sm text-on-surface text-right">{med.stockQuantity.toLocaleString()} units</td>
                      <td className="px-6 py-4">{statusEl(med)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/medicines/${med.id}`)}
                            className="p-1.5 text-on-surface-variant hover:text-secondary hover:bg-secondary-fixed rounded-lg transition-all"
                            title="View"
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                          <button
                            onClick={() => navigate(`/admin/medicines/${med.id}/edit`)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg transition-all"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(med.id, med.name)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-all"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-lowest border-t border-outline-variant">
            <p className="text-sm text-on-surface-variant">
              {pagination.total === 0
                ? 'No medicines found'
                : `Showing ${((page - 1) * LIMIT) + 1}-${Math.min(page * LIMIT, pagination.total)} of ${pagination.total} medicines`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page ? 'bg-primary text-white' : 'border border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-8 py-4 border-t border-outline-variant bg-surface-container-low text-on-surface-variant flex justify-between items-center">
        <p className="text-sm">Â© 2024 PharmaX Admin Panel. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Help Center</a>
        </div>
      </footer>
    </div>
  )
}
