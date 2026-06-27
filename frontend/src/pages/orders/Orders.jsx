import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const STATUS_STEP = {
  PLACED: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
  CANCELLED: -1,
}

const progressSteps = [
  'Order Placed',
  'Rx Verified',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
]

const statusConfig = {
  PLACED: { label: 'Placed', color: 'bg-secondary/10 text-secondary', icon: 'receipt' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-50 text-blue-600', icon: 'check' },
  PROCESSING: { label: 'Processing', color: 'bg-amber-50 text-amber-600', icon: 'autorenew' },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-50 text-indigo-600', icon: 'local_shipping' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-50 text-orange-600', icon: 'delivery_dining' },
  DELIVERED: { label: 'Delivered', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  CANCELLED: { label: 'Cancelled', color: 'bg-error/10 text-error', icon: 'cancel' },
}

const ACTIVE_STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY']
const HISTORY_STATUSES = ['DELIVERED', 'CANCELLED']

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Orders() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyPage, setHistoryPage] = useState(1)
  const perPage = 4

  useEffect(() => {
    if (!isAuthenticated) { navigate('/signin'); return }
    api.get('/orders', { params: { limit: 50 } })
      .then(res => setOrders(res.data.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status))
  const historyOrders = orders.filter(o => HISTORY_STATUSES.includes(o.status))
  const totalPages = Math.ceil(historyOrders.length / perPage)
  const pagedHistory = historyOrders.slice((historyPage - 1) * perPage, historyPage * perPage)

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-container rounded-xl w-48" />
        {[1, 2].map(i => <div key={i} className="h-40 bg-surface-container-lowest rounded-2xl custom-shadow" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">My Orders</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Track and manage all your orders</p>
        </div>
        <Link
          to="/dashboard/medicines"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Order
        </Link>
      </div>

      {/* Active Orders */}
      <div>
        <h2 className="text-[15px] font-semibold text-on-surface mb-3 flex items-center gap-2">
          Active Orders
          <span className="w-6 h-6 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold flex items-center justify-center">{activeOrders.length}</span>
        </h2>

        {activeOrders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow text-center py-10">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '40px' }}>inbox</span>
            <p className="text-sm font-medium text-on-surface mt-2">No active orders</p>
            <p className="text-xs text-on-surface-variant mt-1">Orders you place will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => {
              const step = STATUS_STEP[order.status] ?? 0
              const itemNames = (order.items || []).map(i => i.medicine?.name).filter(Boolean)
              return (
                <div key={order.id} className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-on-surface font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(order.placedAt)} Â· {order.items?.length || 0} items</p>
                      {itemNames.length > 0 && (
                        <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-xs">{itemNames.slice(0, 3).join(', ')}{itemNames.length > 3 ? 'â€¦' : ''}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">NPR {Number(order.totalAmount).toFixed(0)}</p>
                      <Link to={`/dashboard/orders/${order.id}`} className="text-xs font-medium text-secondary hover:underline mt-0.5 block">View Details</Link>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="overflow-x-auto pb-1">
                    <div className="flex items-center min-w-[520px]">
                      {progressSteps.map((stepLabel, i) => {
                        const done = i < step
                        const active = i === step
                        return (
                          <React.Fragment key={stepLabel}>
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                done ? 'bg-primary border-primary' : active ? 'bg-surface-container-lowest border-secondary' : 'bg-surface-container-lowest border-outline-variant'
                              }`}>
                                {done ? (
                                  <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: '14px' }}>check</span>
                                ) : active ? (
                                  <div className="w-2.5 h-2.5 bg-secondary rounded-full" />
                                ) : (
                                  <div className="w-2 h-2 bg-outline-variant rounded-full" />
                                )}
                              </div>
                              <span className={`text-[10px] text-center leading-tight max-w-[60px] ${done || active ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>{stepLabel}</span>
                            </div>
                            {i < progressSteps.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 mb-3.5 transition-all ${i < step ? 'bg-primary' : 'bg-outline-variant'}`} />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/dashboard/track-order/${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>route</span>
                      Track
                    </Link>
                    <Link
                      to={`/dashboard/orders/${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>receipt</span>
                      Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-[15px] font-semibold text-on-surface mb-3">Order History</h2>
        {historyOrders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow text-center py-10">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '40px' }}>history</span>
            <p className="text-sm font-medium text-on-surface mt-2">No past orders yet</p>
          </div>
        ) : (
          <>
            <div className="bg-surface-container-lowest rounded-2xl custom-shadow overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                <span className="col-span-3">Order ID</span>
                <span className="col-span-2">Date</span>
                <span className="col-span-2">Items</span>
                <span className="col-span-2">Total</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-1 text-right">Actions</span>
              </div>

              {pagedHistory.map((order, i) => {
                const cfg = statusConfig[order.status] || statusConfig.DELIVERED
                return (
                  <div key={order.id} className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-3.5 items-center border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors ${i % 2 === 0 ? '' : 'bg-surface-container-low/30'}`}>
                    <div className="sm:col-span-3">
                      <p className="text-sm font-semibold text-on-surface font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-on-surface-variant">{formatDate(order.placedAt)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-on-surface-variant">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-on-surface">NPR {Number(order.totalAmount).toFixed(0)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <span className="material-symbols-outlined ms-filled" style={{ fontSize: '12px' }}>{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="sm:col-span-1 flex items-center justify-end gap-1.5">
                      <button title="Download Invoice" className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                      </button>
                      <Link to={`/dashboard/orders/${order.id}`} title="View Details"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-4">
                <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setHistoryPage(i + 1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${historyPage === i + 1 ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))} disabled={historyPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
