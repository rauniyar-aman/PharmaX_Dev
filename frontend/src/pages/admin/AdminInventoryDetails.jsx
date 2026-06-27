import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminInventoryDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [med, setMed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stockInput, setStockInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')

  const fetchMed = () => {
    setLoading(true)
    api.get(`/medicines/${id}`)
      .then(res => {
        setMed(res.data.data.medicine)
        setStockInput(String(res.data.data.medicine.stockQuantity))
      })
      .catch(() => navigate('/admin/inventory', { replace: true }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMed() }, [id])

  const handleStockUpdate = async e => {
    e.preventDefault()
    setSaveMsg(''); setSaveError('')
    const qty = parseInt(stockInput)
    if (isNaN(qty) || qty < 0) { setSaveError('Enter a valid stock quantity.'); return }
    setSaving(true)
    try {
      const res = await api.put(`/medicines/${id}`, { stockQuantity: qty, inStock: qty > 0 })
      setMed(res.data.data.medicine)
      setSaveMsg('Stock updated successfully.')
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update stock.')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!med) return null

  const stockPct = Math.min(100, (med.stockQuantity / 500) * 100)
  const isLow = med.inStock && med.stockQuantity < 50
  const status = !med.inStock
    ? { label: 'Out of Stock', cls: 'bg-error/10 text-error border-error/20' }
    : isLow
      ? { label: 'Low Stock', cls: 'bg-amber-100 text-amber-700 border-amber-200' }
      : { label: 'In Stock', cls: 'bg-primary/10 text-primary border-primary/20' }

  const barColor = !med.inStock ? 'bg-error' : isLow ? 'bg-amber-500' : 'bg-primary'

  const fmt = d => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full h-16 bg-surface sticky top-0 z-40 border-b border-outline-variant flex justify-between items-center px-8 shadow-sm">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full w-72 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search pharmacy database..." type="text" />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb + Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
              <Link to="/admin/inventory" className="hover:text-primary transition-colors">Inventory</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-on-surface font-medium">{med.name}</span>
            </nav>
            <h1 className="text-3xl font-semibold text-on-surface">Inventory Details</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/inventory')}
              className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              Back to Inventory
            </button>
            <button
              onClick={() => navigate(`/admin/medicines/${med.id}/edit`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary-container text-on-secondary-container rounded-xl text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Edit Medicine
            </button>
          </div>
        </div>

        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medicine Profile */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm flex items-start gap-6">
            <div className="w-28 h-28 rounded-2xl bg-surface-container border border-outline-variant shrink-0 flex items-center justify-center overflow-hidden">
              {med.imageUrl
                ? <img src={med.imageUrl} alt={med.name} className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-5xl text-on-surface-variant">medication</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-on-surface">{med.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${med.type === 'Rx' ? 'bg-error-container text-on-error-container border-error-container' : 'bg-secondary-fixed text-on-secondary-fixed-variant border-secondary-fixed'}`}>
                  {med.type}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">{med.brand} Â· {med.category?.name || 'Uncategorized'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Price</p>
                  <p className="text-lg font-bold text-primary">Rs {Number(med.price).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Package</p>
                  <p className="text-lg font-bold text-on-surface">{med.packageSize || 'â€"'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Rating</p>
                  <p className="text-lg font-bold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {med.rating ? Number(med.rating).toFixed(1) : 'â€"'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Stock Status</p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${status.cls}`}>
                <span className={`w-2 h-2 rounded-full ${!med.inStock ? 'bg-error' : isLow ? 'bg-amber-500' : 'bg-primary'}`} />
                {status.label}
              </span>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current Stock</p>
                <p className={`text-xl font-bold ${!med.inStock ? 'text-error' : isLow ? 'text-amber-600' : 'text-on-surface'}`}>{med.stockQuantity.toLocaleString()}</p>
              </div>
              <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${stockPct}%` }} />
              </div>
              <p className="text-xs text-on-surface-variant mt-1 text-right">{stockPct.toFixed(0)}% of 500 units threshold</p>
            </div>
            <div className="border-t border-outline-variant pt-3 space-y-2 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="font-semibold text-on-surface text-right">{fmt(med.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Added On</span>
                <span className="font-semibold text-on-surface">{fmt(med.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Update Form */}
          <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              <h3 className="text-base font-semibold text-on-surface">Update Stock</h3>
            </div>
            <form onSubmit={handleStockUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">New Stock Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStockInput(v => String(Math.max(0, parseInt(v || 0) - 10)))}
                    className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <input
                    type="number"
                    min={0}
                    className="flex-1 text-center py-2.5 border border-outline-variant rounded-lg text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    value={stockInput}
                    onChange={e => setStockInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setStockInput(v => String(parseInt(v || 0) + 10))}
                    className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  {[50, 100, 200, 500].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setStockInput(String(n))}
                      className="flex-1 text-xs py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant font-medium"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {saveError && (
                <p className="text-xs text-error bg-error-container/30 px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">error</span>
                  {saveError}
                </p>
              )}
              {saveMsg && (
                <p className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg font-semibold">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">check_circle</span>
                  {saveMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-base">save</span>
                {saving ? 'Savingâ€¦' : 'Update Stock'}
              </button>
            </form>
          </div>

          {/* Medicine Details */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              <h3 className="text-base font-semibold text-on-surface">Medicine Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {[
                  { label: 'Generic Name', value: med.genericName || 'â€"' },
                  { label: 'Brand', value: med.brand || 'â€"' },
                  { label: 'Manufacturer', value: med.manufacturer || 'â€"' },
                  { label: 'Category', value: med.category?.name || 'â€"' },
                  { label: 'Type', value: med.type },
                  { label: 'Package Size', value: med.packageSize || 'â€"' },
                  { label: 'Price', value: `Rs ${Number(med.price).toFixed(2)}` },
                  { label: 'Requires Prescription', value: med.type === 'Rx' ? 'Yes' : 'No' },
                  { label: 'Expiry Date', value: med.expiryDate ? new Date(med.expiryDate).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not set' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-on-surface font-medium">{value}</p>
                  </div>
                ))}
              </div>

              {med.description && (
                <div className="mt-6 pt-6 border-t border-outline-variant">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{med.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Level Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Critical Level', threshold: '< 20 units', value: med.stockQuantity < 20, color: 'text-error', bg: 'bg-error/5 border-error/20', icon: 'dangerous' },
            { label: 'Low Stock Alert', threshold: '< 50 units', value: isLow, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: 'warning' },
            { label: 'Healthy Stock', threshold: 'â‰¥ 50 units', value: med.inStock && med.stockQuantity >= 50, color: 'text-primary', bg: 'bg-primary/5 border-primary/20', icon: 'check_circle' },
          ].map(item => (
            <div key={item.label} className={`rounded-xl border p-5 flex items-center gap-4 ${item.bg}`}>
              <span className={`material-symbols-outlined text-3xl ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              <div>
                <p className={`text-sm font-bold ${item.color}`}>{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.threshold}</p>
                <p className={`text-xs font-semibold mt-0.5 ${item.value ? item.color : 'text-on-surface-variant'}`}>
                  {item.value ? 'Currently Active' : 'Not applicable'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
