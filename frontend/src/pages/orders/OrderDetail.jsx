import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const STATUS_STEP = {
  PLACED: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
}

const TIMELINE_STEPS = [
  'Order Placed',
  'Prescription Verified',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
]

const STATUS_CONFIG = {
  PLACED:           { label: 'Placed',           color: 'bg-secondary/10 text-secondary',    icon: 'receipt' },
  CONFIRMED:        { label: 'Confirmed',         color: 'bg-blue-50 text-blue-600',          icon: 'check' },
  PROCESSING:       { label: 'Processing',        color: 'bg-amber-50 text-amber-700',        icon: 'autorenew' },
  SHIPPED:          { label: 'Shipped',           color: 'bg-indigo-50 text-indigo-600',      icon: 'local_shipping' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  color: 'bg-orange-50 text-orange-600',      icon: 'delivery_dining' },
  DELIVERED:        { label: 'Delivered',         color: 'bg-primary/10 text-primary',        icon: 'check_circle' },
  CANCELLED:        { label: 'Cancelled',         color: 'bg-error/10 text-error',            icon: 'cancel' },
}

const PAYMENT_STATUS_CONFIG = {
  PENDING:  { label: 'Payment Pending',   color: 'text-amber-600', icon: 'schedule' },
  PAID:     { label: 'Payment Confirmed', color: 'text-primary',   icon: 'check_circle' },
  FAILED:   { label: 'Payment Failed',    color: 'text-error',     icon: 'cancel' },
  REFUNDED: { label: 'Refunded',          color: 'text-secondary', icon: 'currency_exchange' },
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtDateShort(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${BACKEND}${url}`
}

function downloadInvoice(order) {
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
    const med   = item.medicine || {}
    const amt   = (parseFloat(item.unitPrice) * item.quantity).toFixed(2)
    const price = parseFloat(item.unitPrice).toFixed(2)
    return `
      <tr>
        <td>${med.name || 'Medicine'}</td>
        <td>${med.brand || '-'}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">NPR ${price}</td>
        <td style="text-align:right">NPR ${amt}</td>
      </tr>`
  }).join('')

  const addr = order.address
    ? `${order.address.name}<br>${order.address.address}<br>${order.address.city}, ${order.address.province} ${order.address.zip}<br>${order.address.phone}`
    : 'N/A'

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice #${orderId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #4CAF82; }
    .brand { font-size: 28px; font-weight: 800; color: #4CAF82; letter-spacing: -0.5px; }
    .brand span { color: #1a1a2e; }
    .brand-sub { font-size: 11px; color: #666; margin-top: 2px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 22px; font-weight: 700; color: #1a1a2e; }
    .invoice-title p { font-size: 12px; color: #666; margin-top: 4px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
      background: ${order.paymentStatus === 'PAID' ? '#e8f5ee' : '#fff3e0'};
      color: ${order.paymentStatus === 'PAID' ? '#4CAF82' : '#e65100'}; margin-top: 6px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-box h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
    .info-box p { font-size: 13px; color: #333; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f0f9f4; }
    thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #4CAF82; border-bottom: 2px solid #4CAF82; }
    thead th:last-child, thead th:nth-child(4) { text-align: right; }
    thead th:nth-child(3) { text-align: center; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 10px 12px; color: #333; vertical-align: middle; }
    .totals { margin-left: auto; width: 260px; }
    .totals table { margin-bottom: 0; }
    .totals td { padding: 5px 12px; font-size: 13px; }
    .totals td:last-child { text-align: right; }
    .totals tr.total-row td { font-weight: 800; font-size: 15px; border-top: 2px solid #4CAF82; padding-top: 10px; color: #4CAF82; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #aaa; }
    @media print {
      body { padding: 20px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Pharma<span>X</span></div>
      <div class="brand-sub">Your trusted online pharmacy</div>
    </div>
    <div class="invoice-title">
      <h2>INVOICE</h2>
      <p>Invoice No: <strong>#${orderId}</strong></p>
      <p>Date: ${date}</p>
      <span class="badge">${order.paymentStatus === 'PAID' ? 'PAID' : 'PAYMENT PENDING'}</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h4>Bill To</h4>
      <p><strong>${order.user?.fullName || 'Customer'}</strong><br/>
         ${order.user?.email || ''}<br/>
         ${order.user?.phone || ''}</p>
    </div>
    <div class="info-box">
      <h4>Deliver To</h4>
      <p>${addr}</p>
    </div>
    <div class="info-box">
      <h4>Payment Method</h4>
      <p>${paymentLabel}</p>
    </div>
    <div class="info-box">
      <h4>Order Status</h4>
      <p>${order.status}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Medicine</th>
        <th>Brand</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td>NPR ${subtotal.toFixed(2)}</td></tr>
      <tr><td>Delivery</td><td>${delivery === 0 ? 'FREE' : `NPR ${delivery.toFixed(2)}`}</td></tr>
      ${discount > 0 ? `<tr><td>Discount</td><td>- NPR ${discount.toFixed(2)}</td></tr>` : ''}
      <tr class="total-row"><td>Total</td><td>NPR ${total.toFixed(2)}</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for choosing PharmaX &mdash; Your health is our priority.</p>
    <p style="margin-top:4px">This is a computer-generated invoice and does not require a signature.</p>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [orderRating, setOrderRating]   = useState(0)
  const [orderComment, setOrderComment] = useState('')
  const [orderHover, setOrderHover]     = useState(0)
  const [orderRated, setOrderRated]     = useState(false)
  const [medRatings, setMedRatings]     = useState({})
  const [medHover, setMedHover]         = useState({})
  const [medComments, setMedComments]   = useState({})
  const [submitting, setSubmitting]     = useState({})

  useEffect(() => {
    if (!orderId) return
    api.get(`/orders/${orderId}`)
      .then(res => {
        const o = res.data.data.order
        setOrder(o)
        if (o.orderRating) { setOrderRating(o.orderRating); setOrderComment(o.orderComment || ''); setOrderRated(true) }
        const initRatings = {}, initComments = {}
        ;(o.items || []).forEach(item => {
          const existing = item.medicine?.reviews?.[0]
          if (existing) { initRatings[item.medicine.id] = existing.rating; initComments[item.medicine.id] = existing.comment || '' }
        })
        setMedRatings(initRatings)
        setMedComments(initComments)
      })
      .catch(() => setError('Order not found or you do not have access to it.'))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await api.put(`/orders/${orderId}/cancel`)
      setOrder(prev => ({ ...prev, status: 'CANCELLED' }))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface-container rounded-xl w-56" />
        <div className="h-40 bg-surface-container-lowest rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-surface-container-lowest rounded-2xl" />
          <div className="h-32 bg-surface-container-lowest rounded-2xl" />
        </div>
        <div className="h-48 bg-surface-container-lowest rounded-2xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>error_outline</span>
        <p className="text-base font-bold text-on-surface mt-4">{error || 'Order not found'}</p>
        <Link to="/dashboard/orders" className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">Back to Orders</Link>
      </div>
    )
  }

  const cfg         = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED
  const paymentCfg  = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.PENDING
  const step        = STATUS_STEP[order.status] ?? 0
  const cancelled   = order.status === 'CANCELLED'
  const canCancel   = ['PLACED', 'CONFIRMED'].includes(order.status)
  const subtotal    = (order.items || []).reduce((s, i) => s + parseFloat(i.unitPrice) * i.quantity, 0)
  const delivery    = parseFloat(order.deliveryCharge || 0)
  const discount    = parseFloat(order.discount || 0)
  const total       = parseFloat(order.totalAmount)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/orders" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Orders
            </Link>
          </div>
          <h1 className="text-xl font-bold text-on-surface font-mono">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Placed on {fmtDateShort(order.placedAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color} border-current/20`}>
            {cfg.label}
          </span>
          {!cancelled && (
            <Link to={`/dashboard/track-order/${order.id}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>route</span>
              Track Order
            </Link>
          )}
          <button onClick={() => downloadInvoice(order)}
            className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
            Invoice
          </button>
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling}
              className="flex items-center gap-1.5 px-4 py-2 border border-error text-error rounded-xl text-sm font-semibold hover:bg-error/5 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
        <h2 className="text-[15px] font-semibold text-on-surface mb-4">
          {cancelled ? 'Order Cancelled' : 'Delivery Timeline'}
        </h2>

        {cancelled ? (
          <div className="flex items-center gap-3 p-4 bg-error/5 rounded-xl border border-error/20">
            <span className="material-symbols-outlined text-error" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">This order has been cancelled</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Cancelled on {fmtDateShort(order.updatedAt)}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {TIMELINE_STEPS.map((stepLabel, i) => {
              const isTerminal = order.status === 'DELIVERED'
              const done   = i < step || (isTerminal && i === step)
              const active = i === step && !isTerminal
              return (
                <div key={i} className="flex gap-4 relative pb-5 last:pb-0">
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${done ? 'bg-primary' : 'bg-outline-variant'}`} />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-0.5 border-2 ${
                    done ? 'bg-primary border-primary' : active ? 'bg-surface-container-lowest border-secondary' : 'bg-surface-container-lowest border-outline-variant'
                  }`}>
                    {done
                      ? <span className="material-symbols-outlined text-white" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check</span>
                      : active
                      ? <div className="w-2.5 h-2.5 bg-secondary rounded-full" />
                      : <div className="w-2 h-2 bg-outline-variant rounded-full" />
                    }
                  </div>
                  <div className="pt-0.5">
                    <p className={`text-sm font-semibold ${done || active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{stepLabel}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {i === 0 ? fmtDate(order.placedAt)
                        : done ? fmtDate(order.updatedAt)
                        : active ? 'In progress'
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <h3 className="text-sm font-semibold text-on-surface">Delivery Information</h3>
          </div>
          {order.address ? (
            <>
              <p className="text-sm font-semibold text-on-surface">{order.address.name}</p>
              <p className="text-xs text-on-surface-variant mt-1">{order.address.address}</p>
              <p className="text-xs text-on-surface-variant">{order.address.city}, {order.address.province} - {order.address.zip}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{order.address.phone}</p>
              {order.address.label && (
                <span className="mt-2 inline-block px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full">{order.address.label}</span>
              )}
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">No delivery address recorded</p>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>payment</span>
            <h3 className="text-sm font-semibold text-on-surface">Payment Information</h3>
          </div>
          <p className="text-sm font-semibold text-on-surface capitalize">
            {order.paymentMethod === 'ESEWA' ? 'eSewa Wallet'
              : order.paymentMethod === 'COD' ? 'Cash on Delivery'
              : order.paymentMethod || 'Not specified'}
          </p>
          <div className={`flex items-center gap-1.5 mt-1 ${paymentCfg.color}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>{paymentCfg.icon}</span>
            <span className="text-xs font-medium">{paymentCfg.label}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="text-on-surface">NPR {subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Delivery</span>
              <span className={delivery === 0 ? 'text-primary font-medium' : 'text-on-surface'}>
                {delivery === 0 ? 'FREE' : `NPR ${delivery.toFixed(0)}`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Discount</span>
                <span className="text-primary font-medium">- NPR {discount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-outline-variant pt-1.5 mt-1.5">
              <span>Total</span>
              <span>NPR {total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
        <h2 className="text-[15px] font-semibold text-on-surface mb-4">
          Items in Order <span className="text-on-surface-variant font-normal text-sm">({order.items?.length || 0})</span>
        </h2>
        <div className="space-y-3">
          {(order.items || []).map(item => {
            const med = item.medicine || {}
            const imgSrc = resolveImg(med.imageUrl)
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
                  {imgSrc ? (
                    <img src={imgSrc} alt={med.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '28px' }}>medication</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {med.type && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${med.type === 'Rx' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>{med.type}</span>
                  )}
                  <p className="text-sm font-semibold text-on-surface mt-0.5">{med.name || 'Medicine'}</p>
                  <p className="text-xs text-on-surface-variant">{med.brand || ''}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-on-surface-variant">× {item.quantity}</p>
                  <p className="text-sm font-bold text-on-surface">NPR {(parseFloat(item.unitPrice) * item.quantity).toFixed(0)}</p>
                  <p className="text-[11px] text-on-surface-variant">NPR {parseFloat(item.unitPrice).toFixed(0)} each</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {order.status === 'DELIVERED' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-4">Rate Your Experience</h2>
            <div className="flex items-center gap-3 mb-3">
              {[1,2,3,4,5].map(star => (
                <button key={star}
                  onMouseEnter={() => !orderRated && setOrderHover(star)}
                  onMouseLeave={() => !orderRated && setOrderHover(0)}
                  onClick={() => !orderRated && setOrderRating(star)}
                  className="transition-transform hover:scale-110 disabled:cursor-default">
                  <span className={`material-symbols-outlined ${(orderHover || orderRating) >= star ? 'text-amber-400' : 'text-outline-variant'}`}
                    style={{ fontSize: '32px', fontVariationSettings: (orderHover || orderRating) >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                </button>
              ))}
              {orderRating > 0 && <span className="text-sm text-on-surface-variant">{['','Poor','Fair','Good','Very Good','Excellent'][orderRating]}</span>}
            </div>
            {!orderRated ? (
              <>
                <textarea value={orderComment} onChange={e => setOrderComment(e.target.value)}
                  placeholder="Share your overall experience (optional)…"
                  className="w-full border border-outline-variant rounded-xl px-3 py-2.5 text-sm resize-none bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3} />
                <button
                  disabled={!orderRating || submitting['order']}
                  onClick={async () => {
                    if (!orderRating) return
                    setSubmitting(p => ({ ...p, order: true }))
                    try {
                      await api.put(`/orders/${orderId}/rate`, { orderRating, orderComment })
                      setOrderRated(true)
                    } catch {}
                    setSubmitting(p => ({ ...p, order: false }))
                  }}
                  className="mt-3 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {submitting['order'] ? 'Submitting…' : 'Submit'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-primary font-medium mt-1">
                <span className="material-symbols-outlined ms-filled" style={{ fontSize: '18px' }}>check_circle</span>
                Thank you for your feedback!
                {orderComment && <span className="text-on-surface-variant font-normal ml-1">"{orderComment}"</span>}
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-4">Rate the Medicines</h2>
            <div className="space-y-5">
              {(order.items || []).map(item => {
                const med       = item.medicine || {}
                const medId     = med.id
                const imgSrc    = resolveImg(med.imageUrl)
                const existing  = med.reviews?.[0]
                const isRated   = !!existing && medRatings[medId] === existing.rating && !submitting[medId + '_edit']
                const curRating = medRatings[medId] || 0
                const curHover  = medHover[medId]  || 0
                return (
                  <div key={item.id} className="pb-5 border-b border-outline-variant last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">
                        {imgSrc ? <img src={imgSrc} alt={med.name} className="w-full h-full object-cover" />
                          : <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '20px' }}>medication</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface">{med.name}</p>
                        <p className="text-xs text-on-surface-variant">{med.brand}</p>
                      </div>
                      {existing && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Reviewed</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {[1,2,3,4,5].map(star => (
                        <button key={star}
                          onMouseEnter={() => setMedHover(p => ({ ...p, [medId]: star }))}
                          onMouseLeave={() => setMedHover(p => ({ ...p, [medId]: 0 }))}
                          onClick={() => setMedRatings(p => ({ ...p, [medId]: star }))}
                          className="transition-transform hover:scale-110">
                          <span className={`material-symbols-outlined ${(curHover || curRating) >= star ? 'text-amber-400' : 'text-outline-variant'}`}
                            style={{ fontSize: '24px', fontVariationSettings: (curHover || curRating) >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        </button>
                      ))}
                      {curRating > 0 && <span className="text-xs text-on-surface-variant">{['','Poor','Fair','Good','Very Good','Excellent'][curRating]}</span>}
                    </div>
                    <textarea
                      value={medComments[medId] || ''}
                      onChange={e => setMedComments(p => ({ ...p, [medId]: e.target.value }))}
                      placeholder="Write a review for this medicine (optional)…"
                      className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm resize-none bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={2} />
                    <button
                      disabled={!curRating || submitting[medId]}
                      onClick={async () => {
                        if (!curRating) return
                        setSubmitting(p => ({ ...p, [medId]: true }))
                        try {
                          await api.post(`/medicines/${medId}/reviews`, { rating: curRating, comment: medComments[medId] || '' })
                          setOrder(prev => ({
                            ...prev,
                            items: prev.items.map(i => i.medicine?.id === medId
                              ? { ...i, medicine: { ...i.medicine, reviews: [{ rating: curRating, comment: medComments[medId] || '', createdAt: new Date() }] } }
                              : i)
                          }))
                        } catch {}
                        setSubmitting(p => ({ ...p, [medId]: false }))
                      }}
                      className="mt-2 px-4 py-1.5 bg-secondary text-white rounded-xl text-xs font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50">
                      {submitting[medId] ? 'Saving…' : existing ? 'Update Review' : 'Submit Review'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
