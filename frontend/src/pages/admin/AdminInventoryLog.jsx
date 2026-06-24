import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../lib/api'

const EVENT_STYLES = {
  Restock: 'bg-primary/10 text-primary border border-primary/20',
  Sale: 'bg-secondary-container/10 text-secondary border border-secondary/20',
  Adjustment: 'bg-amber-100 text-amber-700 border border-amber-200',
  Return: 'bg-purple-100 text-purple-700 border border-purple-200',
}

const MOCK_ROWS = [
  { date: 'Oct 24, 2023', time: '09:45 AM', event: 'Restock', ref: 'STK-9902', change: '+500', balance: '3,240', user: 'James Wilson', changeCls: 'text-primary' },
  { date: 'Oct 24, 2023', time: '08:12 AM', event: 'Sale', ref: 'Ord: #88721', change: '-12', balance: '2,740', user: 'Automated System', changeCls: 'text-error' },
  { date: 'Oct 23, 2023', time: '04:30 PM', event: 'Adjustment', ref: 'Manual Correction (Expired)', change: '-5', balance: '2,752', user: 'Sarah Miller', changeCls: 'text-error' },
  { date: 'Oct 23, 2023', time: '11:15 AM', event: 'Return', ref: 'Ord: #88690', change: '+2', balance: '2,757', user: 'Automated System', changeCls: 'text-primary' },
  { date: 'Oct 22, 2023', time: '02:55 PM', event: 'Sale', ref: 'Ord: #88544', change: '-24', balance: '2,755', user: 'Automated System', changeCls: 'text-error' },
]

const BAR_PERCENTS = [25, 50, 33, 75, 100, 66, 83]

export default function AdminInventoryLog() {
  const { id } = useParams()
  const [medicine, setMedicine] = useState(null)
  const [eventFilter, setEventFilter] = useState('')

  useEffect(() => {
    if (id) {
      api.get(`/medicines/${id}`).then(res => setMedicine(res.data.data.medicine)).catch(() => {})
    }
  }, [id])

  const filtered = eventFilter ? MOCK_ROWS.filter(r => r.event === eventFilter) : MOCK_ROWS

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-8 w-full">
        <div className="flex items-center gap-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="bg-surface-container border-none rounded-full py-2 pl-10 pr-4 w-64 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Search across PharmaX..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hover:bg-surface-container rounded-full p-2 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <button className="hover:bg-surface-container rounded-full p-2 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-on-surface-variant">help</span>
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 flex flex-col gap-6 overflow-y-auto">
        {/* Breadcrumb */}
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

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-on-surface">Inventory Activity Log</h1>
            <p className="text-sm text-on-surface-variant">
              {medicine ? `${medicine.name} • ` : ''}
              <span className="font-semibold text-primary">SKU: {medicine?.id?.slice(0, 8).toUpperCase() || 'AMX-500-CP'}</span>
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-md">
            <span className="material-symbols-outlined text-xl">download</span>
            Export Log
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Stock In (30d)', value: '1,500', badge: '+12% vs last mo.', badgeCls: 'text-primary', icon: 'trending_up', iconBg: 'bg-primary-fixed text-on-primary-fixed', barCls: 'bg-primary' },
            { label: 'Stock Out (30d)', value: '842', badge: '-5% vs last mo.', badgeCls: 'text-secondary', icon: 'trending_down', iconBg: 'bg-secondary-fixed text-on-secondary-fixed', barCls: 'bg-secondary' },
            { label: 'Net Change', value: '+658', badge: 'Units', badgeCls: 'text-on-surface-variant', icon: 'swap_vert', iconBg: 'bg-tertiary-fixed text-on-tertiary-fixed', barCls: 'bg-tertiary' },
            { label: 'Current Inventory', value: medicine ? medicine.stockQuantity.toLocaleString() : '3,240', badge: 'Healthy Stock', badgeCls: 'opacity-90', icon: 'inventory', iconBg: 'bg-white/20', barCls: null, highlight: true },
          ].map(c => (
            <div key={c.label} className={`${c.highlight ? 'bg-primary-container text-on-primary-container' : 'bg-white border border-outline-variant'} p-4 rounded-xl shadow-sm flex flex-col gap-2 relative overflow-hidden group`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${c.highlight ? 'opacity-80' : 'text-on-surface-variant'}`}>{c.label}</span>
                <div className={`${c.iconBg} p-1.5 rounded-lg`}>
                  <span className="material-symbols-outlined text-xl">{c.icon}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{c.value}</span>
                <span className={`text-xs font-bold ${c.badgeCls}`}>{c.badge}</span>
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

        {/* Filters */}
        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
            <input className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Filter by event, reference or user..." type="text" />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container">
              <div className="px-3 py-2 border-r border-outline-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-on-surface-variant">calendar_today</span>
                <input className="bg-transparent border-none p-0 text-sm w-32 focus:outline-none" type="date" />
              </div>
              <div className="px-3 py-2 flex items-center gap-2">
                <input className="bg-transparent border-none p-0 text-sm w-32 focus:outline-none" type="date" />
              </div>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-surface-container border border-outline-variant rounded-lg py-2 px-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                value={eventFilter}
                onChange={e => setEventFilter(e.target.value)}
              >
                <option value="">All Events</option>
                <option value="Sale">Sale</option>
                <option value="Restock">Restock</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Return">Return</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  {['Date & Time', 'Event Type', 'Reference', 'Change', 'Balance', 'Performed By'].map(h => (
                    <th key={h} className={`px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider ${['Change', 'Balance'].includes(h) ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-on-surface font-medium">{row.date}</span>
                        <span className="text-xs text-on-surface-variant">{row.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${EVENT_STYLES[row.event] || ''}`}>
                        {row.event}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface-variant">
                        <span className="font-mono text-on-surface">{row.ref}</span>
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right whitespace-nowrap font-bold ${row.changeCls}`}>{row.change}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap font-semibold text-on-surface">{row.balance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-secondary shrink-0">
                          {row.user[0]}
                        </div>
                        <span className="text-sm text-on-surface">{row.user}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-on-surface-variant">
              Showing <span className="font-semibold text-on-surface">1 – {filtered.length}</span> of <span className="font-semibold text-on-surface">{filtered.length}</span> events
            </span>
            <div className="flex items-center gap-2">
              <button disabled className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-30">
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-sm">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors font-semibold text-sm">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-outline-variant p-6 rounded-2xl shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-on-surface">Trend Analysis</h3>
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <span className="material-symbols-outlined text-lg">show_chart</span>
                Real-time sync
              </div>
            </div>
            <div className="h-48 w-full bg-surface-container/30 rounded-xl relative overflow-hidden border border-dashed border-outline-variant flex items-center justify-center">
              <div className="absolute inset-0 flex items-end px-4 pb-4 gap-2">
                {BAR_PERCENTS.map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, backgroundColor: `rgba(0,107,44,${0.2 + h / 200})` }} />
                ))}
              </div>
              <span className="text-on-surface-variant text-sm z-10 bg-white/80 px-4 py-2 rounded-full border border-outline-variant backdrop-blur-sm">Inventory Velocity Visualization</span>
            </div>
          </div>
          <div className="bg-primary-fixed-dim border border-primary/20 p-6 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="z-10 relative">
              <h3 className="text-lg font-semibold text-on-primary-fixed">Optimization Tip</h3>
              <p className="text-sm text-on-primary-fixed-variant mt-2">
                Based on current outflow velocity, we recommend increasing your reorder trigger by{' '}
                <span className="font-bold text-primary">150 units</span> to avoid potential stockouts during peak seasons.
              </p>
              <button className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                Update Reorder Point
              </button>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 text-on-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          </div>
        </div>
      </div>
    </main>
  )
}
