import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const activeOrders = [
  {
    id: 'ORD-2024-007',
    date: 'Jun 24, 2024',
    items: ['Amoxicillin 500mg', 'Paracetamol 500mg', 'Vitamin D3'],
    total: 834,
    step: 2,
  },
  {
    id: 'ORD-2024-006',
    date: 'Jun 22, 2024',
    items: ['Metformin 500mg', 'Lisinopril 10mg'],
    total: 305,
    step: 3,
  },
]

const historyOrders = [
  { id: 'ORD-2024-005', date: 'Jun 15, 2024', items: 2, total: 390, status: 'Delivered', statusColor: 'bg-primary/10 text-primary' },
  { id: 'ORD-2024-004', date: 'Jun 10, 2024', items: 1, total: 320, status: 'Delivered', statusColor: 'bg-primary/10 text-primary' },
  { id: 'ORD-2024-003', date: 'May 28, 2024', items: 3, total: 615, status: 'Delivered', statusColor: 'bg-primary/10 text-primary' },
  { id: 'ORD-2024-002', date: 'May 14, 2024', items: 2, total: 225, status: 'Cancelled', statusColor: 'bg-error/10 text-error' },
  { id: 'ORD-2024-001', date: 'Apr 30, 2024', items: 4, total: 1180, status: 'Delivered', statusColor: 'bg-primary/10 text-primary' },
]

const progressSteps = [
  'Order Placed',
  'Rx Verified',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
]

export default function Orders() {
  const [historyPage, setHistoryPage] = useState(1)
  const perPage = 4
  const totalPages = Math.ceil(historyOrders.length / perPage)
  const pagedHistory = historyOrders.slice((historyPage - 1) * perPage, historyPage * perPage)

  return (
    <div className="space-y-6">
      {/* Header */}
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

        <div className="space-y-4">
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl custom-shadow p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-on-surface">{order.id}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{order.date} · {order.items.length} items</p>
                  <p className="text-xs text-on-surface-variant">{order.items.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface">NPR {order.total}</p>
                  <Link to={`/dashboard/orders/${order.id}`} className="text-xs font-medium text-secondary hover:underline mt-0.5 block">View Details</Link>
                </div>
              </div>

              {/* Horizontal Mini Timeline */}
              <div className="overflow-x-auto pb-1">
                <div className="flex items-center min-w-[520px]">
                  {progressSteps.map((step, i) => {
                    const done = i < order.step
                    const active = i === order.step
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? 'bg-primary border-primary'
                              : active
                              ? 'bg-white border-secondary'
                              : 'bg-white border-outline-variant'
                          }`}>
                            {done ? (
                              <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: '14px' }}>check</span>
                            ) : active ? (
                              <div className="w-2.5 h-2.5 bg-secondary rounded-full" />
                            ) : (
                              <div className="w-2 h-2 bg-outline-variant rounded-full" />
                            )}
                          </div>
                          <span className={`text-[10px] text-center leading-tight max-w-[60px] ${done || active ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>{step}</span>
                        </div>
                        {i < progressSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-3.5 transition-all ${i < order.step ? 'bg-primary' : 'bg-outline-variant'}`} />
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
          ))}
        </div>
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-[15px] font-semibold text-on-surface mb-3">Order History</h2>
        <div className="bg-white rounded-2xl custom-shadow overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            <span className="col-span-3">Order ID</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2">Items</span>
            <span className="col-span-2">Total</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          {pagedHistory.map((order, i) => (
            <div key={order.id} className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-3.5 items-center border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors ${i % 2 === 0 ? '' : 'bg-surface-container-low/30'}`}>
              <div className="sm:col-span-3">
                <p className="text-sm font-semibold text-on-surface">{order.id}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-on-surface-variant">{order.date}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-on-surface-variant">{order.items} item{order.items > 1 ? 's' : ''}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-on-surface">NPR {order.total}</p>
              </div>
              <div className="sm:col-span-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${order.statusColor}`}>
                  <span className="material-symbols-outlined ms-filled" style={{ fontSize: '12px' }}>{order.status === 'Delivered' ? 'check_circle' : 'cancel'}</span>
                  {order.status}
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
          ))}
        </div>

        {/* Pagination */}
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
      </div>
    </div>
  )
}
