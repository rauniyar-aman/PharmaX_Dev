import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminInventoryLog() {
  const { id } = useParams()
  const [medicine, setMedicine] = useState(null)

  useEffect(() => {
    if (id) {
      api.get(`/medicines/${id}`).then(res => setMedicine(res.data.data.medicine)).catch(() => {})
    }
  }, [id])

  return (
    <main className="flex-1 flex flex-col min-h-screen">

      <div className="p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
        <nav className="flex items-center gap-2 text-on-surface-variant text-xs">
          <Link to="/admin/medicines" className="hover:text-primary transition-colors text-sm">Medicines</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          {id && (
            <>
              <Link to={`/admin/medicines/${id}`} className="hover:text-primary transition-colors text-sm">Medicine Details</Link>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </>
          )}
          <span className="text-on-surface font-semibold text-sm">Inventory Activity Log</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-on-surface">Inventory Activity Log</h1>
            <p className="text-sm text-on-surface-variant">
              {medicine ? `${medicine.name} · ` : ''}
              {medicine && <span className="font-semibold text-primary">SKU: {medicine.id.slice(0, 8).toUpperCase()}</span>}
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-xl">download</span>
            Export Log
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Stock In (30d)', value: '-', icon: 'trending_up', iconBg: 'bg-primary-fixed text-on-primary-fixed', barCls: 'bg-primary' },
            { label: 'Stock Out (30d)', value: '-', icon: 'trending_down', iconBg: 'bg-secondary-fixed text-on-secondary-fixed', barCls: 'bg-secondary' },
            { label: 'Net Change', value: '-', icon: 'swap_vert', iconBg: 'bg-tertiary-fixed text-on-tertiary-fixed', barCls: 'bg-tertiary' },
            { label: 'Current Inventory', value: medicine ? medicine.stockQuantity.toLocaleString() : '-', sub: 'units', icon: 'inventory', iconBg: 'bg-white/20', highlight: true },
          ].map(c => (
            <div key={c.label} className={`${c.highlight ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-lowest border border-outline-variant'} p-4 rounded-xl shadow-sm flex flex-col gap-2 relative overflow-hidden group`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${c.highlight ? 'opacity-80' : 'text-on-surface-variant'}`}>{c.label}</span>
                <div className={`${c.iconBg} p-1.5 rounded-lg`}>
                  <span className="material-symbols-outlined text-xl">{c.icon}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{c.value}</span>
                {c.sub && <span className="text-xs opacity-70">{c.sub}</span>}
              </div>
              {!c.highlight && (
                <div className={`absolute bottom-0 left-0 w-full h-1 ${c.barCls} scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
              )}
              {c.highlight && (
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="material-symbols-outlined text-9xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  {['Date & Time', 'Event Type', 'Reference', 'Change', 'Balance', 'Performed By'].map(h => (
                    <th key={h} className={`px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider ${['Change', 'Balance'].includes(h) ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl opacity-30">history</span>
                      <p className="text-sm font-medium">No inventory events recorded yet.</p>
                      <p className="text-xs opacity-70">Stock changes will appear here automatically.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
