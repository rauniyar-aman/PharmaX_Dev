import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

const STATUS_CFG = {
  PLACED:           { label: 'Placed',            color: 'bg-surface-container-highest text-on-surface-variant' },
  CONFIRMED:        { label: 'Confirmed',          color: 'bg-blue-100 text-blue-700' },
  PROCESSING:       { label: 'Processing',         color: 'bg-secondary-fixed text-on-secondary-fixed' },
  SHIPPED:          { label: 'Shipped',            color: 'bg-indigo-100 text-indigo-700' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   color: 'bg-orange-100 text-orange-700' },
  DELIVERED:        { label: 'Delivered',          color: 'bg-primary/10 text-primary' },
  CANCELLED:        { label: 'Cancelled',          color: 'bg-error-container text-on-error-container' },
}

const PAYMENT_CFG = {
  PENDING:  { label: 'Pending',  dot: 'bg-amber-500',  text: 'text-amber-700' },
  PAID:     { label: 'Paid',     dot: 'bg-primary',    text: 'text-primary' },
  FAILED:   { label: 'Failed',   dot: 'bg-error',      text: 'text-error' },
  REFUNDED: { label: 'Refunded', dot: 'bg-secondary',  text: 'text-secondary' },
}

const NEXT_STATUS = {
  PLACED: 'CONFIRMED', CONFIRMED: 'PROCESSING', PROCESSING: 'SHIPPED',
  SHIPPED: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED',
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Order Detail Side Panel ──────────────────────────────────────────────────
function OrderPanel({ order, onClose, onStatusUpdate }) {
  const [updating, setUpdating]   = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const nextStatus = NEXT_STATUS[order.status]

  const handleStatus = async (status) => {
    setUpdating(true)
    try {
      const res = await api.put(`/admin/orders/${order.id}/status`, { status })
      onStatusUpdate(res.data.data.order)
    } catch {}
    finally { setUpdating(false) }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setRejecting(true)
    try {
      const res = await api.put(`/admin/orders/${order.id}/status`, { status: 'CANCELLED' })
      onStatusUpdate(res.data.data.order)
    } catch {}
    finally { setRejecting(false) }
  }

  const subtotal = (order.items || []).reduce((s, i) => s + parseFloat(i.unitPrice) * i.quantity, 0)
  const delivery = parseFloat(order.deliveryCharge || 0)
  const discount = parseFloat(order.discount || 0)
  const total    = parseFloat(order.totalAmount)
  const user     = order.user || {}
  const cfg      = STATUS_CFG[order.status] || STATUS_CFG.PLACED

  return (
    <div className="fixed inset-y-0 right-0 w-[460px] bg-surface-container-lowest shadow-2xl z-[60] border-l border-outline-variant flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest sticky top-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>receipt_long</span>
          <h2 className="text-base font-bold text-on-surface">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Customer */}
        <section>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Customer Details</p>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-sm flex-shrink-0">
                {user.avatarUrl
                  ? <img src={`${BACKEND}${user.avatarUrl}`} className="w-full h-full rounded-full object-cover" alt={user.fullName} />
                  : initials(user.fullName)}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{user.fullName}</p>
                <p className="text-xs text-on-surface-variant">{user.email}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              {user.phone && <div className="flex justify-between"><span className="text-on-surface-variant">Phone</span><span className="font-medium">{user.phone}</span></div>}
              {order.address && (
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant flex-shrink-0">Address</span>
                  <span className="font-medium text-right">{order.address.address}, {order.address.city}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-on-surface-variant">Placed</span><span className="font-medium">{fmtDate(order.placedAt)}</span></div>
            </div>
          </div>
        </section>

        {/* Items */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Order Items</p>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">{order.items?.length || 0} Items</span>
          </div>
          <div className="space-y-3">
            {(order.items || []).map(item => {
              const med = item.medicine || {}
              const imgSrc = med.imageUrl ? `${BACKEND}${med.imageUrl}` : null
              return (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-outline-variant last:border-0">
                  <div className="w-11 h-11 bg-surface-container rounded-lg flex items-center justify-center border border-outline-variant flex-shrink-0 overflow-hidden">
                    {imgSrc ? <img src={imgSrc} alt={med.name} className="w-full h-full object-cover" />
                      : <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '20px' }}>medication</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface">{med.name || 'Medicine'}</p>
                    <p className="text-xs text-on-surface-variant">{med.brand}</p>
                    {med.type && <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 inline-block ${med.type === 'Rx' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>{med.type === 'Rx' ? 'Rx Required' : 'OTC'}</span>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-on-surface">NPR {(parseFloat(item.unitPrice) * item.quantity).toFixed(0)}</p>
                    <p className="text-xs text-on-surface-variant">Qty: {item.quantity}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-dashed border-outline-variant space-y-1.5">
            <div className="flex justify-between text-xs"><span className="text-on-surface-variant">Subtotal</span><span>NPR {subtotal.toFixed(0)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-on-surface-variant">Delivery</span><span className={delivery === 0 ? 'text-primary font-bold' : ''}>{delivery === 0 ? 'FREE' : `NPR ${delivery.toFixed(0)}`}</span></div>
            {discount > 0 && <div className="flex justify-between text-xs"><span className="text-on-surface-variant">Discount</span><span className="text-primary">- NPR {discount.toFixed(0)}</span></div>}
            <div className="flex justify-between text-sm font-bold mt-1 pt-1.5 border-t border-outline-variant"><span>Total</span><span className="text-primary">NPR {total.toFixed(0)}</span></div>
          </div>
        </section>

        {/* Prescription */}
        {order.prescription && (
          <section>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Prescription Status</p>
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              order.prescription.status === 'VERIFIED' ? 'bg-primary/5 border-primary/20'
              : order.prescription.status === 'REJECTED' ? 'bg-error/5 border-error/20'
              : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1", color: order.prescription.status === 'VERIFIED' ? 'var(--color-primary)' : order.prescription.status === 'REJECTED' ? 'var(--color-error)' : '#d97706' }}>
                {order.prescription.status === 'VERIFIED' ? 'verified' : order.prescription.status === 'REJECTED' ? 'cancel' : 'pending'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">
                  {order.prescription.status === 'VERIFIED' ? 'Verified by Pharmacist'
                   : order.prescription.status === 'REJECTED' ? 'Prescription Rejected'
                   : 'Pending Verification'}
                </p>
                <p className="text-xs text-on-surface-variant truncate">{order.prescription.fileName}</p>
              </div>
              <Link to={`/admin/prescriptions`} className="text-xs font-bold text-secondary hover:underline">View</Link>
            </div>
          </section>
        )}

        {/* Payment */}
        <section>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Payment</p>
          <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>payment</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">
                {order.paymentMethod === 'ESEWA' ? 'eSewa' : order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod || '-'}
              </p>
              <div className={`flex items-center gap-1.5 mt-0.5 ${PAYMENT_CFG[order.paymentStatus]?.text || ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PAYMENT_CFG[order.paymentStatus]?.dot || 'bg-on-surface-variant'}`} />
                <span className="text-xs font-bold">{PAYMENT_CFG[order.paymentStatus]?.label || order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer actions */}
      <div className="p-5 border-t border-outline-variant bg-surface-container-low space-y-3">
        {/* Status update dropdown */}
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1.5">Update Status</label>
          <select
            className="w-full border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-surface-container-lowest"
            defaultValue={order.status}
            onChange={e => handleStatus(e.target.value)}
            disabled={updating || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
          >
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
            <button onClick={handleCancel} disabled={rejecting}
              className="flex-1 border border-error text-error py-3 rounded-xl text-sm font-bold hover:bg-error/5 transition-all disabled:opacity-50">
              {rejecting ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          {nextStatus && (
            <button onClick={() => handleStatus(nextStatus)} disabled={updating}
              className="flex-1 bg-primary text-on-primary py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-sm">
              {updating ? 'Updating…' : `Mark as ${STATUS_CFG[nextStatus]?.label}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders, setOrders]     = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [total, setTotal]       = useState(0)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const searchRef = useRef()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (filterStatus) params.status = filterStatus
      if (filterPayment) params.payment = filterPayment
      if (search) params.search = search

      const [ordersRes, statsRes] = await Promise.all([
        api.get('/admin/orders', { params }),
        api.get('/admin/stats'),
      ])
      const d = ordersRes.data.data
      setOrders(d.orders || [])
      setPages(d.pagination.pages)
      setTotal(d.pagination.total)
      setStats(statsRes.data.data)
    } catch {}
    finally { setLoading(false) }
  }, [page, filterStatus, filterPayment, search])

  useEffect(() => { load() }, [load])

  const handleStatusUpdate = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    setSelectedOrder(updated)
  }

  const pendingCount  = orders.filter(o => o.status === 'PLACED').length
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length

  return (
    <div className="space-y-6 relative">
      {/* Backdrop */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50" onClick={() => setSelectedOrder(null)} />
      )}
      {selectedOrder && (
        <OrderPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdate={handleStatusUpdate} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <p className="text-sm text-on-surface-variant">Review and process customer pharmaceutical orders.</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container flex items-center gap-2 transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
            Export
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(pendingCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingCount > 0 && (
            <div className="flex items-center gap-4 bg-error-container/20 border-l-4 border-error p-4 rounded-r-xl">
              <span className="material-symbols-outlined text-error" style={{ fontSize: '22px' }}>warning</span>
              <div>
                <p className="text-sm font-bold text-on-error-container">{pendingCount} Unprocessed orders</p>
                <p className="text-xs text-on-error-container/80">Awaiting confirmation or assignment.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders',   value: stats?.totalOrders ?? '…', color: 'text-on-surface',          sub: null },
          { label: 'Pending',        value: total && orders.filter(o=>o.status==='PLACED').length,           color: 'text-amber-700', sub: null },
          { label: 'Processing',     value: total && orders.filter(o=>o.status==='PROCESSING').length,       color: 'text-secondary',  sub: null },
          { label: 'Shipped',        value: total && orders.filter(o=>['SHIPPED','OUT_FOR_DELIVERY'].includes(o.status)).length, color: 'text-indigo-700', sub: null },
          { label: 'Delivered',      value: total && orders.filter(o=>o.status==='DELIVERED').length,        color: 'text-primary',    sub: null },
          { label: 'Revenue (Month)',value: stats ? `NPR ${Number(stats.monthlyRevenue).toLocaleString()}` : '…', color: 'text-primary', highlight: true },
        ].map(c => (
          <div key={c.label} className={`p-5 rounded-xl border border-outline-variant shadow-sm ${c.highlight ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-lowest'}`}>
            <p className="text-[11px] text-on-surface-variant mb-1 font-semibold">{c.label}</p>
            <h3 className={`text-2xl font-bold ${c.color}`}>{c.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Order ID / Customer</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
            <input ref={searchRef} type="text" placeholder="Search ID or name…"
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-surface-container-lowest"
              defaultValue={search}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(e.target.value); setPage(1) } }} />
          </div>
        </div>
        <div className="w-44">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Status</label>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="w-full border border-outline-variant rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>)}
          </select>
        </div>
        <div className="w-40">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Payment</label>
          <select value={filterPayment} onChange={e => { setFilterPayment(e.target.value); setPage(1) }}
            className="w-full border border-outline-variant rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
            <option value="">All</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPayment(''); setPage(1); if(searchRef.current) searchRef.current.value = '' }}
          className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors" title="Clear filters">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list_off</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              {['Order ID', 'Customer', 'Date', 'Type', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-4 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container rounded" /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>inbox</span>
                  <p className="text-sm mt-2">No orders found</p>
                </td>
              </tr>
            ) : orders.map(order => {
              const cfg     = STATUS_CFG[order.status] || STATUS_CFG.PLACED
              const payeCfg = PAYMENT_CFG[order.paymentStatus] || PAYMENT_CFG.PENDING
              const user    = order.user || {}
              const hasRx   = (order.items || []).some(i => i.medicine?.type === 'Rx')
              const isActive = selectedOrder?.id === order.id
              return (
                <tr key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer transition-colors hover:bg-surface-container-low ${isActive ? 'bg-surface-container-low border-l-4 border-secondary' : ''}`}>
                  <td className="px-5 py-4 font-mono text-primary font-bold text-sm">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed flex-shrink-0">
                        {user.avatarUrl
                          ? <img src={`${BACKEND}${user.avatarUrl}`} className="w-full h-full rounded-full object-cover" alt="" />
                          : initials(user.fullName)}
                      </div>
                      <span className="text-sm font-medium text-on-surface">{user.fullName || '-'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-on-surface-variant whitespace-nowrap">{fmtDate(order.placedAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${hasRx ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {hasRx ? 'Rx' : 'OTC'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-on-surface">NPR {Number(order.totalAmount).toFixed(0)}</td>
                  <td className="px-5 py-4">
                    <div className={`flex items-center gap-1.5 ${payeCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${payeCfg.dot}`} />
                      <span className="text-[11px] font-bold uppercase">{payeCfg.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold ${cfg.color}`}>{cfg.label}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-lowest flex-wrap gap-3">
          <p className="text-sm text-on-surface-variant">
            Showing {orders.length} of {total} orders
          </p>
          {pages > 1 && (
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              {[...Array(Math.min(pages, 5))].map((_, i) => {
                const p = i + 1
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${page === p ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container'}`}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
