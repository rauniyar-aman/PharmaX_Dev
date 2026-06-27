import React, { useState, useEffect } from 'react'
import api from '../../lib/api'

function fmtNPR(val) {
  if (!val) return 'NPR 0'
  if (val >= 1_000_000) return `NPR ${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000)     return `NPR ${(val / 1_000).toFixed(1)}K`
  return `NPR ${Math.round(val)}`
}

function MiniBar({ value, max, color = 'bg-primary' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-on-surface-variant w-8 text-right">{pct}%</span>
    </div>
  )
}

function TrendChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="h-36 flex items-center justify-center text-on-surface-variant text-sm">No trend data</div>
  )
  const revenues = data.map(d => d.revenue)
  const maxRev   = Math.max(...revenues, 1)
  const w        = 100 / data.length

  return (
    <div className="relative h-36 flex items-end gap-1 mt-2">
      {data.map((d, i) => {
        const h = Math.max((d.revenue / maxRev) * 100, 2)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {fmtNPR(d.revenue)}
            </div>
            <div className="w-full bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }} />
            <span className="text-[9px] text-on-surface-variant truncate w-full text-center">{d.month.slice(5)}</span>
          </div>
        )
      })}
    </div>
  )
}

const STATUS_LABELS = {
  PLACED: 'Placed', CONFIRMED: 'Confirmed', PROCESSING: 'Processing',
  SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
}

export default function AdminReports() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/reports')
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 bg-surface-container rounded-xl w-48" />
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-surface-container-lowest rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-surface-container-lowest rounded-xl" />)}
        </div>
      </div>
    )
  }

  const totalOrders     = data?.orderStatusCounts?.reduce((s, c) => s + c._count, 0) || 1
  const deliveredCount  = data?.orderStatusCounts?.find(c => c.status === 'DELIVERED')?._count || 0
  const cancelledCount  = data?.orderStatusCounts?.find(c => c.status === 'CANCELLED')?._count || 0
  const avgOrderValue   = totalOrders > 0 ? (data?.totalRevenue || 0) / totalOrders : 0
  const totalPayments   = data?.paymentMethodCounts?.reduce((s, c) => s + c._count, 0) || 1
  const maxMedQty       = Math.max(...(data?.topMedicines?.map(m => m.totalQty) || [1]))

  const kpiCards = [
    { label: 'Total Revenue',    value: fmtNPR(data?.totalRevenue),    sub: `Month: ${fmtNPR(data?.monthlyRevenue)}`, icon: 'currency_rupee', color: 'text-primary bg-primary/10' },
    { label: 'Total Orders',     value: data?.totalOrders ?? 0,          sub: `${deliveredCount} delivered`,            icon: 'shopping_cart',   color: 'text-secondary bg-secondary/10' },
    { label: 'Total Customers',  value: data?.totalCustomers ?? 0,       sub: 'Registered users',                       icon: 'group',           color: 'text-tertiary bg-tertiary/10' },
    { label: 'Avg Order Value',  value: fmtNPR(avgOrderValue),           sub: 'Per paid order',                         icon: 'trending_up',     color: 'text-primary bg-primary/10' },
    { label: 'Pending Rx',       value: data?.pendingPrescriptions ?? 0, sub: 'Need verification',                      icon: 'pending_actions', color: 'text-amber-700 bg-amber-100' },
    { label: 'Cancellation Rate',value: `${totalOrders > 0 ? ((cancelledCount / totalOrders) * 100).toFixed(1) : 0}%`, sub: `${cancelledCount} cancelled`, icon: 'cancel', color: 'text-error bg-error/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <p className="text-sm text-on-surface-variant">Comprehensive insights across orders, customers, and inventory.</p>
        <button className="px-4 py-2 border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container flex items-center gap-2 transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map(k => (
          <div key={k.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${k.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold">{k.label}</p>
            <h3 className="text-xl font-bold text-on-surface mt-0.5">{k.value}</h3>
            <p className="text-[11px] text-on-surface-variant mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Trend */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h4 className="text-base font-bold text-on-surface">Revenue Analytics</h4>
              <p className="text-xs text-on-surface-variant">Monthly revenue for the last 6 months</p>
            </div>
            <span className="text-2xl font-bold text-primary">{fmtNPR(data?.totalRevenue)}</span>
          </div>
          <TrendChart data={data?.monthlyTrend} />
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h4 className="text-base font-bold text-on-surface mb-4">Payment Methods</h4>
          <div className="space-y-3">
            {(data?.paymentMethodCounts || []).map(p => (
              <div key={p.paymentMethod}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-on-surface">{p.paymentMethod || 'Unknown'}</span>
                  <span className="text-on-surface-variant">{p._count}</span>
                </div>
                <MiniBar value={p._count} max={totalPayments} color={p.paymentMethod === 'ESEWA' ? 'bg-primary' : 'bg-secondary'} />
              </div>
            ))}
            {(!data?.paymentMethodCounts || data.paymentMethodCounts.length === 0) && (
              <p className="text-sm text-on-surface-variant">No payment data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Order Status Breakdown */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <h4 className="text-base font-bold text-on-surface mb-4">Order Lifecycle Status</h4>
          <div className="space-y-3">
            {(data?.orderStatusCounts || []).map(s => (
              <div key={s.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-on-surface">{STATUS_LABELS[s.status] || s.status}</span>
                  <span className="text-on-surface-variant">{s._count}</span>
                </div>
                <MiniBar value={s._count} max={totalOrders}
                  color={s.status === 'DELIVERED' ? 'bg-primary' : s.status === 'CANCELLED' ? 'bg-error' : 'bg-secondary'} />
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant">
            <h4 className="text-base font-bold text-on-surface">Top Selling Medicines</h4>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Medicine</th>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Units Sold</th>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Revenue</th>
                <th className="px-5 py-3 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {(data?.topMedicines || []).length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-on-surface-variant text-sm">No order data yet</td></tr>
              ) : (data?.topMedicines || []).map((m, i) => (
                <tr key={i} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-on-surface">{m.medicine?.name}</p>
                    <p className="text-xs text-on-surface-variant">{m.medicine?.brand}</p>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">{m.totalQty?.toLocaleString()} units</td>
                  <td className="px-5 py-3 text-sm font-bold text-primary">{fmtNPR(m.revenue)}</td>
                  <td className="px-5 py-3 w-28">
                    <MiniBar value={m.totalQty} max={maxMedQty} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery KPIs */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
        <h4 className="text-base font-bold text-on-surface mb-5">Delivery Performance KPIs</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { value: `${totalOrders > 0 ? ((deliveredCount / totalOrders) * 100).toFixed(0) : 0}%`, label: 'On-Time Delivery Rate', sub: `${deliveredCount} orders delivered`, color: 'text-primary' },
            { value: '-',  label: 'Avg Processing Time', sub: 'Live tracking not yet active', color: 'text-secondary' },
            { value: `${totalOrders > 0 ? ((cancelledCount / totalOrders) * 100).toFixed(1) : 0}%`, label: 'Cancellation Rate', sub: 'Main reason: Payment failed', color: 'text-error' },
          ].map(k => (
            <div key={k.label} className="text-center p-5 bg-surface-container-low rounded-xl border border-outline-variant">
              <p className={`text-4xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-sm font-bold text-on-surface uppercase tracking-wide mt-2">{k.label}</p>
              <p className="text-xs text-on-surface-variant mt-1">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.pendingPrescriptions > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
            <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '20px' }}>pending_actions</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Pending Prescriptions</p>
              <p className="text-xs text-amber-700 mt-0.5">{data.pendingPrescriptions} prescription{data.pendingPrescriptions !== 1 ? 's' : ''} awaiting pharmacist verification.</p>
            </div>
          </div>
        )}
        {cancelledCount > 0 && (
          <div className="flex items-start gap-3 p-4 bg-error-container/20 border-l-4 border-error rounded-r-xl">
            <span className="material-symbols-outlined text-error" style={{ fontSize: '20px' }}>cancel</span>
            <div>
              <p className="text-sm font-bold text-on-error-container">Cancellations This Period</p>
              <p className="text-xs text-on-error-container/80 mt-0.5">{cancelledCount} orders cancelled - review payment failure reasons.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
