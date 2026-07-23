import React, { useState, useEffect } from 'react'
import api from '../../lib/api'

function fmtNPR(val) {
  if (!val) return 'NPR 0'
  if (val >= 1_000_000) return `NPR ${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000)     return `NPR ${(val / 1_000).toFixed(1)}K`
  return `NPR ${Math.round(val)}`
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function monthLabel(key) {
  const [, m] = key.split('-')
  return MONTH_LABELS[parseInt(m) - 1] || key
}

const PAYMENT_LABELS = { esewa: 'eSewa', khalti: 'Khalti', cod: 'Cash on Delivery' }
const PAYMENT_COLORS = { esewa: 'bg-primary', khalti: 'bg-secondary', cod: 'bg-amber-500' }

const STATUS_LABELS = {
  PLACED: 'Placed', CONFIRMED: 'Confirmed', PROCESSING: 'Processing',
  SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
}
const STATUS_COLORS = {
  PLACED: 'bg-on-surface-variant', CONFIRMED: 'bg-blue-500',
  PROCESSING: 'bg-amber-500', SHIPPED: 'bg-indigo-500',
  OUT_FOR_DELIVERY: 'bg-purple-500', DELIVERED: 'bg-primary', CANCELLED: 'bg-error',
}

function ProgressBar({ value, max, colorClass = 'bg-primary' }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-on-surface-variant w-8 text-right tabular-nums">{pct}%</span>
    </div>
  )
}

function TrendChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="h-44 flex items-center justify-center text-on-surface-variant text-sm">No trend data yet</div>
  )
  const revenues = data.map(d => d.revenue)
  const maxRev   = Math.max(...revenues, 1)

  return (
    <div className="mt-4">
      <div className="relative h-44 flex items-end gap-2">
        {data.map((d, i) => {
          const h = Math.max((d.revenue / maxRev) * 100, 2)
          const isLatest = i === data.length - 1
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none
                ${isLatest ? 'bg-primary text-white' : 'bg-inverse-surface text-inverse-on-surface'}`}>
                <div className="font-semibold">{fmtNPR(d.revenue)}</div>
                <div className="opacity-70">{d.orders} order{d.orders !== 1 ? 's' : ''}</div>
              </div>
              <div
                className={`w-full rounded-t-lg transition-all hover:opacity-80 ${isLatest ? 'bg-primary' : 'bg-primary/25'}`}
                style={{ height: `${h}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className={`text-[10px] font-medium ${i === data.length - 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
              {monthLabel(d.month)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminReports() {
  useEffect(() => { document.title = 'Reports — PharmaX Admin' }, [])
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const load = () => {
    setError(false)
    setLoading(true)
    api.get('/admin/reports')
      .then(res => setData(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-7 bg-surface-container rounded-xl w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-surface-container rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="h-72 bg-surface-container rounded-xl lg:col-span-8" />
        <div className="h-72 bg-surface-container rounded-xl lg:col-span-4" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="h-56 bg-surface-container rounded-xl lg:col-span-4" />
        <div className="h-56 bg-surface-container rounded-xl lg:col-span-8" />
      </div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-error" style={{ fontSize: '40px' }}>error_outline</span>
      <p className="text-base font-semibold text-on-surface mt-3">Failed to load reports</p>
      <button onClick={load} className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90">
        Retry
      </button>
    </div>
  )

  const totalOrders    = data?.totalOrders ?? 0
  const cancelledCount = data?.cancelledCount ?? 0
  const allOrderCount  = data?.allOrderCount ?? totalOrders
  const paidCount      = data?.paidOrderCount ?? 0
  const avgOrderValue  = paidCount > 0 ? (data?.totalRevenue || 0) / paidCount : 0
  const deliveredCount = data?.orderStatusCounts?.find(c => c.status === 'DELIVERED')?._count || 0
  const totalPayments  = data?.paymentMethodCounts?.reduce((s, c) => s + c._count, 0) || 1
  const maxMedQty      = Math.max(...(data?.topMedicines?.map(m => m.totalQty) || [1]))

  const kpiCards = [
    { label: 'Total Revenue',    value: fmtNPR(data?.totalRevenue),    sub: `This month: ${fmtNPR(data?.monthlyRevenue)}`, icon: 'currency_rupee', color: 'text-primary bg-primary/10' },
    { label: 'Active Orders',    value: totalOrders,                    sub: `${deliveredCount} delivered`,                 icon: 'shopping_cart',   color: 'text-secondary bg-secondary/10' },
    { label: 'Customers',        value: data?.totalCustomers ?? 0,      sub: 'Registered accounts',                         icon: 'group',           color: 'text-tertiary bg-tertiary/10' },
    { label: 'Avg Order Value',  value: fmtNPR(avgOrderValue),          sub: `From ${paidCount} paid orders`,               icon: 'trending_up',     color: 'text-primary bg-primary/10' },
    { label: 'Pending Rx',       value: data?.pendingPrescriptions ?? 0, sub: 'Need verification',                          icon: 'pending_actions', color: 'text-amber-700 bg-amber-100' },
    { label: 'Cancellation Rate', value: allOrderCount > 0 ? `${((cancelledCount / allOrderCount) * 100).toFixed(1)}%` : '0%', sub: `${cancelledCount} cancelled`, icon: 'cancel', color: 'text-error bg-error/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <p className="text-sm text-on-surface-variant">Insights across orders, customers, and inventory.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map(k => (
          <div key={k.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${k.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wide">{k.label}</p>
            <h3 className="text-xl font-bold text-on-surface mt-0.5">{k.value}</h3>
            <p className="text-[11px] text-on-surface-variant mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-base font-bold text-on-surface">Revenue Trend</h4>
              <p className="text-xs text-on-surface-variant">Monthly revenue — last 6 months (hover for details)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{fmtNPR(data?.totalRevenue)}</p>
              <p className="text-xs text-on-surface-variant">All-time</p>
            </div>
          </div>
          <TrendChart data={data?.monthlyTrend} />
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h4 className="text-base font-bold text-on-surface mb-4">Payment Methods</h4>
          <div className="space-y-4">
            {(data?.paymentMethodCounts || []).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No payment data yet</p>
            ) : (data?.paymentMethodCounts || []).map(p => (
              <div key={p.paymentMethod}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-on-surface">{PAYMENT_LABELS[p.paymentMethod] || p.paymentMethod}</span>
                  <span className="text-on-surface-variant font-semibold">{p._count}</span>
                </div>
                <ProgressBar value={p._count} max={totalPayments} colorClass={PAYMENT_COLORS[p.paymentMethod] || 'bg-secondary'} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h4 className="text-base font-bold text-on-surface mb-4">Order Status Breakdown</h4>
          <div className="space-y-4">
            {(data?.orderStatusCounts || []).length === 0 ? (
              <p className="text-sm text-on-surface-variant">No orders yet</p>
            ) : (data?.orderStatusCounts || []).map(s => (
              <div key={s.status}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-on-surface">{STATUS_LABELS[s.status] || s.status}</span>
                  <span className="text-on-surface-variant font-semibold">{s._count}</span>
                </div>
                <ProgressBar value={s._count} max={totalOrders} colorClass={STATUS_COLORS[s.status] || 'bg-secondary'} />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-base font-bold text-on-surface">Top Selling Medicines</h4>
            <span className="text-xs text-on-surface-variant">By units sold</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Medicine</th>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-right">Units</th>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold text-right">Revenue</th>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold w-32">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {(data?.topMedicines || []).length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-on-surface-variant text-sm">No sales data yet</td></tr>
              ) : (data?.topMedicines || []).map((m, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-on-surface-variant w-4 flex-shrink-0">#{i+1}</span>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{m.medicine?.name}</p>
                        <p className="text-xs text-on-surface-variant">{m.medicine?.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-right tabular-nums">{(m.totalQty ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm font-bold text-primary text-right tabular-nums">{fmtNPR(m.revenue)}</td>
                  <td className="px-5 py-3 w-32">
                    <ProgressBar value={m.totalQty} max={maxMedQty} colorClass="bg-primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
        <h4 className="text-base font-bold text-on-surface mb-5">Delivery Performance</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: totalOrders > 0 ? `${((deliveredCount / totalOrders) * 100).toFixed(0)}%` : '—', label: 'Delivery Rate',      sub: `${deliveredCount} of ${totalOrders} active orders`, color: 'text-primary',    icon: 'local_shipping' },
            { value: paidCount > 0 ? fmtNPR(avgOrderValue) : '—',                                     label: 'Avg Order Value',   sub: `Across ${paidCount} paid orders`,                   color: 'text-secondary',  icon: 'payments' },
            { value: allOrderCount > 0 ? `${((cancelledCount / allOrderCount) * 100).toFixed(1)}%` : '—', label: 'Cancellation Rate', sub: `${cancelledCount} orders cancelled`,              color: cancelledCount > 0 ? 'text-error' : 'text-primary', icon: 'cancel' },
          ].map(k => (
            <div key={k.label} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color}/10 bg-current/10`} style={{ background: 'inherit' }}>
                <span className={`material-symbols-outlined ${k.color}`} style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
              </div>
              <div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs font-semibold text-on-surface uppercase tracking-wide">{k.label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(data?.pendingPrescriptions > 0 || cancelledCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.pendingPrescriptions > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
              <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Pending Prescriptions</p>
                <p className="text-xs text-amber-700 mt-0.5">{data.pendingPrescriptions} prescription{data.pendingPrescriptions !== 1 ? 's' : ''} awaiting verification.</p>
              </div>
            </div>
          )}
          {cancelledCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-error rounded-r-xl">
              <span className="material-symbols-outlined text-error" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
              <div>
                <p className="text-sm font-bold text-error">Cancelled Orders</p>
                <p className="text-xs text-error/80 mt-0.5">{cancelledCount} order{cancelledCount !== 1 ? 's' : ''} cancelled — review payment failure reasons.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
