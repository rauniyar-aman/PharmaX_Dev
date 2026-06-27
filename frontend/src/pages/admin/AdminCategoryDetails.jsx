import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminCategoryDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/categories/${id}`)
      .then(res => setCategory(res.data.data.category))
      .catch(() => navigate('/admin/categories', { replace: true }))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if ((category._count?.medicines || 0) > 0) {
      alert(`Cannot delete "${category.name}" â€" ${category._count.medicines} medicine(s) are assigned to it.`)
      return
    }
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/categories/${id}`)
      navigate('/admin/categories')
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }
  if (!category) return null

  const inStockCount = category.medicines?.filter(m => m.inStock).length || 0
  const lowStockCount = category.medicines?.filter(m => m.inStock && m.stockQuantity < 50).length || 0

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full h-16 bg-surface flex justify-between items-center px-8 sticky top-0 z-40 border-b border-outline-variant shadow-sm">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full w-72 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Search pharmacy database..." type="text" />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumb + Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
              <Link to="/admin/categories" className="hover:text-primary transition-colors">Categories</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-on-surface font-medium">{category.name}</span>
            </nav>
            <h1 className="text-3xl font-semibold text-on-surface">{category.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
              Delete
            </button>
            <button
              onClick={() => navigate(`/admin/categories/${id}/edit`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary-container text-on-secondary-container rounded-xl text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Edit Category
            </button>
          </div>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Profile */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm flex items-start gap-8">
            <div className="w-32 h-32 rounded-2xl bg-surface-container flex items-center justify-center text-7xl shrink-0">
              {category.icon || <span className="material-symbols-outlined text-primary text-6xl">category</span>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-semibold text-on-surface">{category.name}</h2>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-tight ${category.isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                {category.description || 'No description provided for this category.'}
              </p>
              <div className="flex items-center gap-12 flex-wrap">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Medicines</p>
                  <p className="text-xl font-bold text-on-surface">{category._count?.medicines || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">In Stock</p>
                  <p className="text-xl font-bold text-primary">{inStockCount}</p>
                </div>
                {lowStockCount > 0 && (
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Low Stock</p>
                    <p className="text-xl font-bold text-error">{lowStockCount} Alert{lowStockCount > 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accent Card */}
          <div className="bg-primary-container rounded-xl p-8 text-on-primary-container relative overflow-hidden flex flex-col justify-between border border-primary-container shadow-sm">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <span className="material-symbols-outlined text-4xl mb-4">insights</span>
              <h3 className="text-lg font-semibold mb-2">Category Overview</h3>
              <p className="text-sm opacity-90">
                {category._count?.medicines || 0} medicines are classified under this category.
                {lowStockCount > 0 ? ` ${lowStockCount} item(s) are running low on stock.` : ' All items are well stocked.'}
              </p>
            </div>
            <div className="mt-8 relative z-10">
              <button
                onClick={() => navigate('/admin/inventory')}
                className="bg-surface-container-lowest text-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-surface-variant transition-colors"
              >
                View Inventory
              </button>
            </div>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-outline-variant flex items-center justify-between">
            <h3 className="text-lg font-semibold text-on-surface">Medicines in this Category</h3>
            <button
              onClick={() => navigate('/admin/medicines/add')}
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Medicine
            </button>
          </div>
          {category.medicines?.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-30">medication</span>
              <p className="text-sm font-medium">No medicines in this category yet.</p>
              <button onClick={() => navigate('/admin/medicines/add')} className="text-primary text-sm font-semibold hover:underline">Add the first one</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-8 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                    <th className="px-8 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {category.medicines.map(med => {
                    const isLow = med.inStock && med.stockQuantity < 50
                    return (
                      <tr key={med.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
                              {med.imageUrl
                                ? <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                                : <span className="material-symbols-outlined text-primary">pill</span>}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-on-surface">{med.name}</p>
                              <p className="text-xs text-on-surface-variant">{med.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${med.type === 'Rx' ? 'bg-error-container text-on-error-container' : 'bg-secondary-fixed text-on-secondary-fixed-variant'}`}>
                            {med.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-on-surface">Rs {Number(med.price).toFixed(0)}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-on-surface">{med.stockQuantity.toLocaleString()} units</div>
                          <div className="w-20 h-1.5 bg-surface-variant rounded-full mt-1 overflow-hidden">
                            <div className={`h-full rounded-full ${isLow ? 'bg-error' : 'bg-primary'}`} style={{ width: `${Math.min(100, (med.stockQuantity / 500) * 100)}%` }} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!med.inStock
                            ? <span className="px-3 py-1 bg-error/10 text-error text-xs font-bold rounded-full">Out of Stock</span>
                            : isLow
                              ? <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Low Stock</span>
                              : <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">In Stock</span>
                          }
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/medicines/${med.id}`)}
                            className="text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
