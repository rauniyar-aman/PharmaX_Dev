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

function buildInvoice(order) {
  const subtotal = (order.items || []).reduce((s, i) => s + parseFloat(i.unitPrice) * i.quantity, 0)
  const delivery = parseFloat(order.deliveryCharge || 0)
  const discount = parseFloat(order.discount || 0)
  const total    = parseFloat(order.totalAmount)
  const orderId  = order.id.slice(0, 8).toUpperCase()
  const date     = new Date(order.placedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const paymentLabel =
    order.paymentMethod === 'esewa'  ? 'eSewa Wallet' :
    order.paymentMethod === 'khalti' ? 'Khalti Wallet' :
    order.paymentMethod === 'cod'    ? 'Cash on Delivery' :
    order.paymentMethod || 'N/A'
  const rows = (order.items || []).map(item => {
    const med = item.medicine || {}
    return `<tr>
      <td>${med.name || 'Medicine'}</td>
      <td>${med.brand || '-'}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">NPR ${parseFloat(item.unitPrice).toFixed(2)}</td>
      <td style="text-align:right">NPR ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</td>
    </tr>`
  }).join('')
  const addr = order.address
    ? `${order.address.name}<br>${order.address.address}<br>${order.address.city}, ${order.address.province} ${order.address.zip}<br>${order.address.phone}`
    : 'N/A'

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Invoice #${orderId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a2e;background:#fff;padding:40px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:24px;border-bottom:2px solid #4CAF82}
    .brand{font-size:28px;font-weight:800;color:#4CAF82}.brand span{color:#1a1a2e}.brand-sub{font-size:11px;color:#666;margin-top:2px}
    .invoice-title{text-align:right}.invoice-title h2{font-size:22px;font-weight:700}.invoice-title p{font-size:12px;color:#666;margin-top:4px}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${order.paymentStatus==='PAID'?'#e8f5ee':'#fff3e0'};color:${order.paymentStatus==='PAID'?'#4CAF82':'#e65100'};margin-top:6px}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
    .info-box h4{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:8px}
    .info-box p{font-size:13px;color:#333;line-height:1.6}
    table{width:100%;border-collapse:collapse;margin-bottom:24px}
    thead tr{background:#f0f9f4}thead th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#4CAF82;border-bottom:2px solid #4CAF82}
    thead th:last-child,thead th:nth-child(4){text-align:right}thead th:nth-child(3){text-align:center}
    tbody tr{border-bottom:1px solid #f0f0f0}tbody tr:last-child{border-bottom:none}tbody td{padding:10px 12px;color:#333;vertical-align:middle}
    .totals{margin-left:auto;width:260px}.totals table{margin-bottom:0}.totals td{padding:5px 12px;font-size:13px}.totals td:last-child{text-align:right}
    .totals tr.total-row td{font-weight:800;font-size:15px;border-top:2px solid #4CAF82;padding-top:10px;color:#4CAF82}
    .footer{margin-top:48px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#aaa}
    @media print{body{padding:20px}@page{margin:15mm}}
  </style></head><body>
  <div class="header">
    <div><div class="brand">Pharma<span>X</span></div><div class="brand-sub">Your trusted online pharmacy</div></div>
    <div class="invoice-title"><h2>INVOICE</h2><p>Invoice No: <strong>#${orderId}</strong></p><p>Date: ${date}</p>
    <span class="badge">${order.paymentStatus==='PAID'?'PAID':'PAYMENT PENDING'}</span></div>
  </div>
  <div class="info-grid">
    <div class="info-box"><h4>Bill To</h4><p><strong>${order.user?.fullName||'Customer'}</strong><br/>${order.user?.email||''}<br/>${order.user?.phone||''}</p></div>
    <div class="info-box"><h4>Deliver To</h4><p>${addr}</p></div>
    <div class="info-box"><h4>Payment Method</h4><p>${paymentLabel}</p></div>
    <div class="info-box"><h4>Order Status</h4><p>${order.status}</p></div>
  </div>
  <table><thead><tr><th>Medicine</th><th>Brand</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="totals"><table>
    <tr><td>Subtotal</td><td>NPR ${subtotal.toFixed(2)}</td></tr>
    <tr><td>Delivery</td><td>${delivery===0?'FREE':'NPR '+delivery.toFixed(2)}</td></tr>
    ${discount>0?`<tr><td>Discount</td><td>- NPR ${discount.toFixed(2)}</td></tr>`:''}
    <tr class="total-row"><td>Total</td><td>NPR ${total.toFixed(2)}</td></tr>
  </table></div>
  <div class="footer"><p>Thank you for choosing PharmaX &mdash; Your health is our priority.</p>
  <p style="margin-top:4px">This is a computer-generated invoice and does not require a signature.</p></div>
  <script>window.onload=()=>{window.print()}<\/script>
</body></html>`
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

export default function Orders() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyPage, setHistoryPage] = useState(1)
  const [downloadingId, setDownloadingId] = useState(null)

  const handleDownload = async (orderId) => {
    setDownloadingId(orderId)
    try {
      const res = await api.get(`/orders/${orderId}`)
      buildInvoice(res.data.data.order)
    } catch {
      alert('Could not load order details.')
    } finally {
      setDownloadingId(null)
    }
  }
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
                      <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(order.placedAt)} · {order.items?.length || 0} items</p>
                      {itemNames.length > 0 && (
                        <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-xs">{itemNames.slice(0, 3).join(', ')}{itemNames.length > 3 ? '...' : ''}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">NPR {Number(order.totalAmount).toFixed(0)}</p>
                      <Link to={`/dashboard/orders/${order.id}`} className="text-xs font-medium text-secondary hover:underline mt-0.5 block">View Details</Link>
                    </div>
                  </div>

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
                      <button title="Download Invoice" onClick={() => handleDownload(order.id)} disabled={downloadingId === order.id}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {downloadingId === order.id ? 'hourglass_empty' : 'download'}
                        </span>
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
