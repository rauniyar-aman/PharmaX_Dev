import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

const KpiCard = ({ icon, iconBg, iconColor, label, value, badge, badgeColor }) => (
  <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 ${iconBg} rounded-lg ${iconColor}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <span className={`text-[10px] font-bold ${badgeColor}`}>{badge}</span>
    </div>
    <div>
      <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">{label}</p>
      <h3 className="text-xl font-bold text-on-surface mt-0.5">{value}</h3>
    </div>
  </div>
)

const BAR_HEIGHTS = [60, 45, 75, 90, 100, 55, 65, 40, 80, 60]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data.data)).catch(() => {})
  }, [])

  const fmt = n => {
    if (n >= 1000000) return `Rs ${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `Rs ${(n / 1000).toFixed(0)}k`
    return `Rs ${n}`
  }

  return (
    <>
      {/* Right Quick-Actions Sidebar */}
      <aside className="fixed right-0 top-0 h-screen w-72 bg-surface-container border-l border-outline-variant/30 py-6 px-4 z-40 overflow-y-auto">
        <div className="mb-6">
          <h5 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Quick Actions</h5>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/medicines/add')}
              className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Add Medicine
            </button>
            <button className="w-full bg-secondary-container text-on-secondary-container py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-xl">category</span>
              Add Category
            </button>
            <button className="w-full border-2 border-primary text-primary py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-xl">verified</span>
              Verify Prescription
            </button>
            <button className="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all">
              <span className="material-symbols-outlined text-xl">assessment</span>
              Generate Report
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h5 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Storage Metrics</h5>
          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-on-surface">Cold Storage</span>
              <span className="text-xs text-primary">Normal</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[65%]" />
              </div>
              <span className="text-xs font-bold text-on-surface">4Â°C</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2">Sensors active in all 12 modules.</p>
          </div>
        </div>

        <div>
          <h5 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Activity Stream</h5>
          <div className="space-y-4">
            {[
              { icon: 'check', bg: 'bg-primary/20', color: 'text-primary', text: 'System verified 12 orders', time: '2 mins ago' },
              { icon: 'person_add', bg: 'bg-secondary-container/20', color: 'text-secondary', text: 'New customer registered', time: '15 mins ago' },
              { icon: 'warning', bg: 'bg-error/10', color: 'text-error', text: 'Low stock alert: Metformin', time: '1 hour ago' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface">{item.text}</p>
                  <p className="text-[9px] text-on-surface-variant font-bold">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content (offset left sidebar via AdminLayout ml-64, offset right sidebar here) */}
      <div className="mr-72">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full h-16 bg-surface-container-lowest shadow-sm flex justify-between items-center px-8">
          <div className="flex items-center flex-1 max-w-2xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full bg-surface-container-low rounded-lg py-2 pl-10 pr-4 border-none text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search orders, customers, medicines..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <div className="relative cursor-pointer hover:bg-surface-container-low p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error border-2 border-white rounded-full" />
            </div>
            <div className="h-8 w-px bg-outline-variant opacity-30" />
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-bold text-on-surface">{user?.fullName || 'Admin'}</p>
                <p className="text-[10px] text-on-surface-variant">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
                {user?.fullName?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard
              icon="pill" iconBg="bg-primary/10" iconColor="text-primary"
              label="Total Medicines" value={stats ? stats.totalMedicines.toLocaleString() : 'â€"'}
              badge="+4.2%" badgeColor="text-primary"
            />
            <KpiCard
              icon="shopping_bag" iconBg="bg-secondary-container/20" iconColor="text-secondary"
              label="Total Orders" value={stats ? stats.totalOrders.toLocaleString() : 'â€"'}
              badge="+12%" badgeColor="text-secondary"
            />
            <KpiCard
              icon="group" iconBg="bg-surface-container-highest" iconColor="text-tertiary"
              label="Active Customers" value={stats ? stats.totalCustomers.toLocaleString() : 'â€"'}
              badge="~21 today" badgeColor="text-on-surface-variant"
            />
            <KpiCard
              icon="clinical_notes" iconBg="bg-error-container/20" iconColor="text-error"
              label="Pending Prescriptions" value={stats ? stats.pendingPrescriptions : 0}
              badge={stats?.pendingPrescriptions > 0 ? 'Action Required' : ''} badgeColor="text-error"
            />
            <KpiCard
              icon="warning" iconBg="bg-outline-variant/20" iconColor="text-outline"
              label="Low Stock Items" value={stats ? stats.outOfStock : 'â€"'}
              badge="Attention" badgeColor="text-error"
            />
            <KpiCard
              icon="payments" iconBg="bg-primary/10" iconColor="text-primary"
              label="Total Revenue" value={stats ? fmt(Number(stats.totalRevenue)) : 'â€"'}
              badge="Rs 120k avg." badgeColor="text-primary"
            />
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-on-surface">Sales Trend</h4>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 rounded bg-surface-container text-on-surface font-bold">Week</button>
                  <button className="text-xs px-3 py-1 rounded hover:bg-surface-container transition-colors text-on-surface-variant">Month</button>
                </div>
              </div>
              <div className="h-52 relative flex items-end gap-2 overflow-hidden px-4">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-lg transition-all ${i === 4 ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary/20 hover:bg-primary/40'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 px-4 text-[10px] text-on-surface-variant font-bold uppercase">
                {DAYS.map(d => <span key={d}>{d}</span>)}
              </div>
            </div>

            {/* Order Distribution */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <h4 className="text-lg font-semibold text-on-surface mb-6">Order Distribution</h4>
              <div className="flex justify-center mb-6">
                <div className="relative w-44 h-44 rounded-full border-[12px] border-surface-container flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[12px] border-secondary border-t-transparent border-r-transparent rotate-45" />
                  <div className="text-center">
                    <span className="text-xl font-bold text-on-surface">{stats?.totalOrders || 0}</span>
                    <p className="text-[10px] text-on-surface-variant font-bold">Total Orders</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { dot: 'bg-secondary', label: 'Prescription Drugs', pct: '65%' },
                  { dot: 'bg-primary', label: 'OTC Medicines', pct: '25%' },
                  { dot: 'bg-tertiary', label: 'Healthcare', pct: '10%' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.dot}`} />
                      <span className="text-on-surface">{item.label}</span>
                    </div>
                    <span className="font-bold text-on-surface">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
                <h4 className="text-lg font-semibold text-on-surface">Recent Orders</h4>
                <button className="text-primary text-sm font-bold hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container/30 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {[
                      { id: '#PH-9401', name: 'Aarav Sharma', status: 'Shipped', statusCls: 'bg-primary/10 text-primary', paid: 'Paid' },
                      { id: '#PH-9402', name: 'Priya Patel', status: 'Pending', statusCls: 'bg-secondary-container/10 text-secondary', paid: 'Paid' },
                      { id: '#PH-9403', name: 'Ishaan Gupta', status: 'Shipped', statusCls: 'bg-primary/10 text-primary', paid: 'Paid' },
                    ].map(row => (
                      <tr key={row.id} className="hover:bg-surface-container/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-on-surface text-sm">{row.id}</td>
                        <td className="px-6 py-4 text-on-surface-variant text-sm">{row.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 ${row.statusCls} rounded-full text-[10px] font-bold`}>{row.status}</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant text-sm">{row.paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Prescriptions */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-on-surface">Pending Prescriptions</h4>
                <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {stats?.pendingPrescriptions || 0} Action Required
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Rohan Varma', time: '12 mins ago' },
                  { name: 'Ananya Das', time: '45 mins ago' },
                  { name: 'Vikram Malhotra', time: '1 hour ago' },
                ].map(p => (
                  <div key={p.name} className="flex items-center gap-4 p-3 rounded-lg border border-outline-variant hover:border-primary transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-error font-bold uppercase">Pending Verification</span>
                        <span className="text-[10px] text-on-surface-variant">â€¢ {p.time}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="p-1.5 hover:bg-primary/10 text-primary transition-colors rounded-lg" title="Approve">
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                      <button className="p-1.5 hover:bg-error-container/20 text-error transition-colors rounded-lg" title="Reject">
                        <span className="material-symbols-outlined">cancel</span>
                      </button>
                      <button className="p-1.5 hover:bg-surface-container-high text-on-surface-variant transition-colors rounded-lg" title="View">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inventory Alert */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <h4 className="text-lg font-semibold text-on-surface mb-4">Inventory Alert</h4>
              <div className="space-y-4">
                {[
                  { name: 'Metformin 500mg', pct: 15, color: 'bg-error', labelColor: 'text-error' },
                  { name: 'Atorvastatin 20mg', pct: 8, color: 'bg-error', labelColor: 'text-error' },
                  { name: 'Amoxicillin 250mg', pct: 32, color: 'bg-tertiary', labelColor: 'text-tertiary' },
                ].map(item => (
                  <div key={item.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-on-surface">{item.name}</span>
                      <span className={`font-bold ${item.labelColor}`}>{item.pct}% Left</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <h4 className="text-lg font-semibold text-on-surface mb-6">Delivery Timeline</h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                <div className="relative">
                  <div className="absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                  <p className="text-sm font-bold text-on-surface">Order #PH-9380 Delivered</p>
                  <p className="text-[10px] text-on-surface-variant">Agent: S. K. Khan â€¢ 2 mins ago</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-secondary/10" />
                  <p className="text-sm font-bold text-on-surface">Out for Delivery (12)</p>
                  <p className="text-[10px] text-on-surface-variant">Scheduled for Sector 4, Bangalore</p>
                </div>
                <div className="relative opacity-60">
                  <div className="absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full bg-outline-variant" />
                  <p className="text-sm font-bold text-on-surface">Processing Shipments (4)</p>
                  <p className="text-[10px] text-on-surface-variant">Warehouse: Central Hub</p>
                </div>
              </div>
            </div>

            {/* User Growth */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
              <h4 className="text-lg font-semibold text-on-surface mb-2">User Growth</h4>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-primary">+{stats ? Math.floor(stats.totalCustomers * 0.08) : 242}</span>
                <span className="text-[11px] text-on-surface-variant font-bold uppercase">New this week</span>
              </div>
              <div className="h-24 w-full">
                <svg className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" viewBox="0 0 400 100">
                  <path d="M0,80 L40,75 L80,85 L120,60 L160,70 L200,40 L240,45 L280,20 L320,30 L360,5 L400,15" />
                </svg>
              </div>
              <div className="flex justify-between mt-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Conversion</p>
                  <p className="text-sm font-bold text-on-surface">12.4%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Retention</p>
                  <p className="text-sm font-bold text-on-surface">94.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
