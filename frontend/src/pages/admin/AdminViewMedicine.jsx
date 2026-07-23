import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

const TABS = ['Dosage & Usage', 'Side Effects', 'Contraindications']


export default function AdminViewMedicine() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    api.get(`/medicines/${id}`)
      .then(res => setMedicine(res.data.data.medicine))
      .catch(() => navigate('/admin/medicines', { replace: true }))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${medicine.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/medicines/${id}`)
      navigate('/admin/medicines')
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!medicine) return null

  const tabContent = [
    <>
      <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">medical_information</span>
        Dosage Guidelines
      </h4>
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
          <p className="text-on-surface-variant text-sm">
            <span className="font-bold text-on-surface">Instructions: </span>
            {medicine.dosage || 'No dosage information provided.'}
          </p>
        </li>
        {medicine.usage && (
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <p className="text-on-surface-variant text-sm">
              <span className="font-bold text-on-surface">Usage: </span>
              {medicine.usage}
            </p>
          </li>
        )}
      </ul>
      {medicine.usage && (
        <div className="mt-6 p-4 bg-surface-container-low rounded-lg border-l-4 border-primary">
          <h5 className="text-xs font-bold text-primary mb-1 uppercase">Pro Tip</h5>
          <p className="text-sm text-on-surface-variant">{medicine.usage}</p>
        </div>
      )}
    </>,
    <div className="text-sm text-on-surface-variant leading-relaxed">
      {medicine.sideEffects || 'No side effects information provided.'}
    </div>,
    <div className="text-sm text-on-surface-variant">
      No contraindication data available for this medicine.
    </div>,
  ]

  return (
    <div className="flex flex-col min-h-screen">

      <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
              <Link to="/admin/medicines" className="hover:text-primary transition-colors">Medicines</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-on-surface">Product Detail</span>
            </nav>
            <h2 className="text-3xl font-semibold text-on-surface">Medicine Details</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-error text-on-error rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
              Delete
            </button>
            <button
              onClick={() => navigate(`/admin/medicines/${id}/edit`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Edit Medicine
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
              <div className="relative aspect-square rounded-lg bg-surface-container overflow-hidden">
                {medicine.imageUrl
                  ? <img src={medicine.imageUrl} alt={medicine.name} className="w-full h-full object-contain" />
                  : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-6xl">medication</span>
                      <p className="text-sm mt-2">No image</p>
                    </div>
                  )
                }
                <div className={`absolute top-4 right-4 ${medicine.inStock ? 'bg-primary' : 'bg-error'} text-on-primary px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                  {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-on-surface">Quick Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                  <p className="text-on-surface-variant text-[11px] mb-1 uppercase tracking-wider font-bold">Current Stock</p>
                  <p className="text-xl font-bold text-on-surface">
                    {medicine.stockQuantity.toLocaleString()} <span className="text-sm font-normal text-on-surface-variant">Units</span>
                  </p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-primary text-[11px] mb-1 uppercase tracking-wider font-bold">Requirement</p>
                  <p className="text-lg font-bold text-primary">{medicine.type === 'Rx' ? 'Rx Required' : 'OTC'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-outline-variant">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-on-surface-variant">Sales Velocity</span>
                  <span className="text-xs font-bold text-primary">+12% this month</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-on-surface">{medicine.name}</h1>
                    <span className="bg-surface-container-high px-3 py-1 rounded text-xs font-bold text-on-surface-variant">ID: {medicine.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <p className="text-base text-primary font-medium">Generic: {medicine.brand}</p>
                  {medicine.manufacturer && (
                    <p className="text-sm text-on-surface-variant">
                      Manufacturer: <span className="font-bold text-on-surface">{medicine.manufacturer}</span>
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">Price per Unit</p>
                  <p className="text-3xl font-bold text-on-surface">Rs {Number(medicine.price).toFixed(2)}</p>
                  <div className="flex items-center justify-end gap-1 text-primary text-xs mt-1">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>Stable Price</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-outline-variant">
                <div>
                  <h4 className="text-xs font-bold uppercase text-on-surface-variant mb-2">Category</h4>
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-primary">pill</span>
                    <span className="font-medium text-sm">{medicine.category?.name || '-'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-on-surface-variant mb-2">Stock Qty</h4>
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-primary">inventory</span>
                    <span className="font-medium text-sm">{medicine.stockQuantity.toLocaleString()} units</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-on-surface-variant mb-2">Rating</h4>
                  <div className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-primary">star</span>
                    <span className="font-medium text-sm">{Number(medicine.rating).toFixed(1)} ({medicine.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              {medicine.description && (
                <div className="mt-8 space-y-3">
                  <h3 className="text-lg font-semibold text-on-surface">Full Product Description</h3>
                  <p className="text-on-surface-variant leading-relaxed text-sm">{medicine.description}</p>
                </div>
              )}
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="flex border-b border-outline-variant">
                {TABS.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 py-4 px-6 text-sm font-bold transition-colors ${
                      activeTab === i
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-8">{tabContent[activeTab]}</div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Inventory Log
                </h3>
                <Link
                  to={`/admin/medicines/${id}/inventory`}
                  className="text-primary text-sm font-bold hover:underline"
                >
                  View All Activity
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant gap-3">
                <span className="material-symbols-outlined text-5xl opacity-30">inventory_2</span>
                <p className="text-sm font-medium">No inventory activity recorded yet.</p>
                <p className="text-xs opacity-70">Stock changes will appear here once activity is logged.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 border-t border-outline-variant text-center">
        <p className="text-on-surface-variant text-xs">Â© 2024 PharmaX Admin. Enterprise Pharmacy Management.</p>
      </footer>
    </div>
  )
}
