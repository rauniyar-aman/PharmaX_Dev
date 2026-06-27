import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminInventory() {
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
  const LIMIT = 12

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      if (typeFilter) params.type = typeFilter
      if (stockFilter === 'in') params.inStock = true
      if (stockFilter === 'out') params.inStock = false
      const res = await api.get('/medicines', { params })
      setMedicines(res.data.data.medicines || [])
      setPagination(res.data.data.pagination)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data.categories || [])).catch(() => {})
  }, [])

  useEffect(() => { fetchMedicines() }, [page, categoryFilter, typeFilter, stockFilter])

  const handleSearch = e => { e.preventDefault(); setPage(1); fetchMedicines() }

  const totalInStock = medicines.filter(m => m.inStock).length
  const lowStock = medicines.filter(m => m.inStock && m.stockQuantity < 50).length
  const outOfStock = medicines.filter(m => !m.inStock).length

  const getStockStatus = m => {
    if (!m.inStock) return { label: 'Out of Stock', cls: 'bg-error/10 text-error' }
    if (m.stockQuantity < 50) return { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700' }
    return { label: 'In Stock', cls: 'bg-primary/10 text-primary' }
  }

  const timeAgo = date => {
    const diff = Date.now() - new Date(date).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full top-0 sticky bg-surface border-b border-outline-variant flex justify-between items-center px-8 h-16 z-40 shadow-sm">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-bold text-primary">Inventory</h2>
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <form onSubmit={handleSearch}>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-transparent outline-none w-72 transition-all"
                placeholder="Search by medicine name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </form>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            Export
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Medicines', value: pagination.total, icon: 'pill', bg: 'bg-surface-container', color: 'text-primary', fill: true },
            { label: 'In Stock', value: totalInStock, icon: 'check_circle', bg: 'bg-primary/10', color: 'text-primary' },
            { label: 'Low Stock', value: lowStock, icon: 'warning', bg: 'bg-amber-50', color: 'text-amber-600', fill: true },
            { label: 'Out of Stock', value: outOfStock, icon: 'error', bg: 'bg-error-container/40', color: 'text-error', fill: true },
          ].map(c => (
            <div key={c.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 ${c.bg} rounded-lg flex items-center justify-center ${c.color}`}>
                <span className="material-symbols-outlined text-[28px]" style={c.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>{c.icon}</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider">{c.label}</p>
                <h3 className={`text-2xl font-bold ${c.label !== 'Total Medicines' && c.label !== 'In Stock' ? c.color : 'text-on-surface'}`}>{c.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[180px]">
            <select
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-secondary outline-none"
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <select
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-secondary outline-none"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            >
              <option value="">Rx / OTC</option>
              <option value="Rx">Prescription (Rx)</option>
              <option value="OTC">Over-the-Counter (OTC)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <select
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-secondary outline-none"
              value={stockFilter}
              onChange={e => { setStockFilter(e.target.value); setPage(1) }}
            >
              <option value="">Stock Status</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <button
            onClick={() => { setSearch(''); setCategoryFilter(''); setTypeFilter(''); setStockFilter(''); setPage(1) }}
            className="p-2 bg-outline-variant/20 rounded-lg hover:bg-outline-variant/40 transition-colors"
            title="Clear filters"
          >
            <span className="material-symbols-outlined text-on-surface-variant">filter_list_off</span>
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-fixed/30 text-on-surface font-semibold text-sm border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4">Medicine</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {medicines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                        No medicines found.{' '}
                        <button onClick={() => navigate('/admin/medicines/add')} className="text-primary font-semibold">Add one?</button>
                      </td>
                    </tr>
                  ) : medicines.map(med => {
                    const status = getStockStatus(med)
                    return (
                      <tr key={med.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/50 flex items-center justify-center">
                              {med.imageUrl
                                ? <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                                : <span className="material-symbols-outlined text-on-surface-variant">medication</span>}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{med.name}</p>
                              <p className="text-xs text-on-surface-variant">{med.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface">{med.category?.name || 'â€"'}</td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${med.stockQuantity < 50 ? 'text-error' : 'text-on-surface'}`}>
                            {med.stockQuantity.toLocaleString()} Units
                          </div>
                          <div className="w-24 h-1.5 bg-surface-variant rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${med.stockQuantity < 50 ? 'bg-error' : 'bg-primary'}`}
                              style={{ width: `${Math.min(100, (med.stockQuantity / 500) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${med.type === 'Rx' ? 'bg-error-container text-on-error-container' : 'bg-secondary-fixed text-on-secondary-fixed-variant'}`}>
                            {med.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {med.expiryDate
                            ? (() => {
                                const exp = new Date(med.expiryDate)
                                const isExpired = exp < new Date()
                                const isSoon = !isExpired && exp < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                return (
                                  <span className={isExpired ? 'text-error font-semibold' : isSoon ? 'text-amber-600 font-semibold' : 'text-on-surface'}>
                                    {exp.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    {isExpired && <span className="ml-1 text-xs">(Expired)</span>}
                                    {isSoon && <span className="ml-1 text-xs">(Soon)</span>}
                                  </span>
                                )
                              })()
                            : <span className="text-on-surface-variant">â€"</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => navigate(`/admin/inventory/${med.id}`)}
                              className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                              title="View"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                            <button
                              onClick={() => navigate(`/admin/medicines/${med.id}/edit`)}
                              className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-secondary transition-colors"
                              title="Edit Stock"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 bg-surface-container-low/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant">
            <span className="text-xs text-on-surface-variant">
              {pagination.total === 0 ? 'No medicines found' : `Showing ${((page - 1) * LIMIT) + 1}â€"${Math.min(page * LIMIT, pagination.total)} of ${pagination.total} items`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
