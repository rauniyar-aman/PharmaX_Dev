import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${BACKEND}${url}`
}

const STATUS_STEP = {
  PLACED: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
}

const TIMELINE_STEPS = [
  { label: 'Order Placed',          desc: 'Your order has been received' },
  { label: 'Prescription Verified', desc: 'Prescription verified by pharmacist' },
  { label: 'Processing',            desc: 'Medicine being prepared for dispatch' },
  { label: 'Shipped',               desc: 'Package picked up by courier' },
  { label: 'Out for Delivery',      desc: 'Package is near your location' },
  { label: 'Delivered',             desc: 'Order successfully delivered' },
]

const STATUS_BADGE = {
  PLACED:           { label: 'Order Placed',      color: 'bg-secondary/10 text-secondary border-secondary/20' },
  CONFIRMED:        { label: 'Confirmed',          color: 'bg-blue-50 text-blue-600 border-blue-200' },
  PROCESSING:       { label: 'Processing',         color: 'bg-amber-50 text-amber-700 border-amber-200' },
  SHIPPED:          { label: 'In Transit',         color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
  DELIVERED:        { label: 'Delivered',          color: 'bg-primary/10 text-primary border-primary/20' },
  CANCELLED:        { label: 'Cancelled',          color: 'bg-error/10 text-error border-error/20' },
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtDateShort(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TrackOrder() {
  useEffect(() => { document.title = 'Track Order — PharmaX' }, [])
  const { orderId } = useParams()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!orderId) return
    api.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data.data.order))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface-container rounded-xl w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="h-80 bg-surface-container-lowest rounded-2xl" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-52 bg-surface-container-lowest rounded-2xl" />
            <div className="h-20 bg-surface-container-lowest rounded-2xl" />
          </div>
        </div>
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

  const step      = STATUS_STEP[order.status] ?? 0
  const cancelled = order.status === 'CANCELLED'
  const badge     = STATUS_BADGE[order.status] || STATUS_BADGE.PLACED
  const subtotal  = (order.items || []).reduce((s, i) => s + parseFloat(i.unitPrice) * i.quantity, 0)
  const total     = parseFloat(order.totalAmount)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/orders" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Orders
            </Link>
          </div>
          <h1 className="text-xl font-bold text-on-surface">Track Order</h1>
          <p className="text-sm text-on-surface-variant mt-0.5 font-mono">#{order.id.slice(0, 8).toUpperCase()} · Placed {fmtDateShort(order.placedAt)}</p>
        </div>
        <span className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold ${badge.color}`}>
          {!cancelled && order.status !== 'DELIVERED' && (
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          )}
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-5">Delivery Progress</h2>

            {cancelled ? (
              <div className="flex items-center gap-3 p-4 bg-error/5 rounded-xl border border-error/20">
                <span className="material-symbols-outlined text-error" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Order Cancelled</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{fmtDate(order.updatedAt)}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {TIMELINE_STEPS.map((ts, i) => {
                  const isTerminal = order.status === 'DELIVERED'
                  const done   = i < step || (isTerminal && i === step)
                  const active = i === step && !isTerminal
                  return (
                    <div key={i} className="flex gap-3 relative pb-5 last:pb-0">
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${done ? 'bg-primary' : 'bg-outline-variant'}`} />
                      )}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-0.5 border-2 transition-all ${
                        done   ? 'bg-primary border-primary'
                        : active ? 'bg-secondary-container border-secondary ring-4 ring-secondary/20'
                        : 'bg-surface-container-lowest border-outline-variant'
                      }`}>
                        {done   ? <span className="material-symbols-outlined text-white" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>check</span>
                        : active ? <div className="w-2 h-2 bg-secondary rounded-full" />
                        : null}
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-sm font-semibold leading-tight ${done || active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{ts.label}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{ts.desc}</p>
                        <p className={`text-xs mt-0.5 font-medium ${done ? 'text-primary' : active ? 'text-secondary' : 'text-on-surface-variant'}`}>
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
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-on-surface">Live Map</h2>
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Est. Arrival</p>
                  <p className="text-sm font-bold text-on-surface">1–3 business days</p>
                </div>
              )}
            </div>
            <div className="h-48 rounded-xl overflow-hidden">
              {order.address?.lat && order.address?.lng ? (
                <iframe
                  title="Delivery location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.address.lng - 0.005},${order.address.lat - 0.005},${order.address.lng + 0.005},${order.address.lat + 0.005}&layer=mapnik&marker=${order.address.lat},${order.address.lng}`}
                />
              ) : (
                <div className="h-full bg-surface-container-low flex flex-col items-center justify-center bg-gradient-to-br from-secondary/5 to-primary/5">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '56px' }}>map</span>
                  <p className="text-sm text-on-surface-variant mt-2">Map unavailable</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>location_on</span>
              Delivery Address
            </h3>
            {order.address ? (
              <>
                <p className="text-sm font-medium text-on-surface">{order.address.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{order.address.address}, {order.address.city}</p>
                <p className="text-xs text-on-surface-variant">{order.address.province} - {order.address.zip}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{order.address.phone}</p>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">No address on record</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
        <h2 className="text-[15px] font-semibold text-on-surface mb-4">
          Package Contents <span className="text-on-surface-variant font-normal text-sm">({order.items?.length || 0} items)</span>
        </h2>
        <div className="space-y-2.5 mb-4">
          {(order.items || []).map(item => {
            const med    = item.medicine || {}
            const imgSrc = resolveImg(med.imageUrl)
            return (
              <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-outline-variant last:border-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
                    {imgSrc ? (
                      <img src={imgSrc} alt={med.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>medication</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{med.name || 'Medicine'}</p>
                    {med.brand && <p className="text-xs text-on-surface-variant">{med.brand}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-on-surface-variant flex-shrink-0">
                  <span className="text-sm">× {item.quantity}</span>
                  <span className="text-sm font-semibold text-on-surface">NPR {(parseFloat(item.unitPrice) * item.quantity).toFixed(0)}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between font-bold text-base pt-2.5 border-t border-outline-variant">
          <span>Total</span>
          <span>NPR {total.toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
}
