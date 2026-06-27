import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../lib/api'
import checkoutStore from '../../lib/checkoutStore'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

function clearCheckoutSession() {
  ;['checkoutAllowed', 'checkoutAddress', 'checkoutRxDraft', 'checkoutPrescriptions'].forEach(k =>
    sessionStorage.removeItem(k)
  )
}

export default function OrderConfirmation() {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clearCheckoutSession()
    checkoutStore.clear()
    if (!orderId) { setLoading(false); return }
    api.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data.data.order))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const subtotal  = order?.items?.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0) ?? 0
  const delivery  = Number(order?.deliveryCharge ?? 0)
  const total     = Number(order?.totalAmount ?? 0)
  const isPaid    = order?.paymentStatus === 'PAID'
  const isCod     = order?.paymentMethod === 'cod'
  const addr      = order?.address

  const deliveryDate = () => {
    const d = new Date(); d.setDate(d.getDate() + 3)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-4">
      <CheckoutSteps current={4} />

      {/* Success banner */}
      <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          {isCod ? 'Order Placed Successfully!' : 'Payment Confirmed!'}
        </h1>
        <p className="text-on-surface-variant mt-2 text-sm max-w-md mx-auto">
          {isCod
            ? 'Your order has been received. Our team will process it shortly.'
            : "Your payment was successful. We'll start processing your order right away."}
        </p>
        {order && (
          <div className="mt-4 inline-flex items-center gap-2 bg-surface-container-low px-5 py-2.5 rounded-full">
            <span className="text-xs text-on-surface-variant">Order ID:</span>
            <span className="text-sm font-bold text-secondary font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            <h3 className="text-sm font-semibold text-on-surface">Estimated Delivery</h3>
          </div>
          <p className="text-base font-bold text-on-surface">{deliveryDate()}</p>
          <p className="text-xs text-on-surface-variant mt-1">Standard delivery (2–3 business days)</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>payment</span>
            <h3 className="text-sm font-semibold text-on-surface">Payment</h3>
          </div>
          {loading ? (
            <div className="h-4 bg-surface-container rounded w-1/2 animate-pulse" />
          ) : (
            <>
              <p className="text-sm font-semibold text-on-surface capitalize">
                {order?.paymentMethod === 'esewa' ? 'eSewa Wallet' : 'Cash on Delivery'}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                  {isPaid ? 'check_circle' : 'pending'}
                </span>
                <span className={`text-xs font-medium ${isPaid ? 'text-primary' : 'text-amber-600'}`}>
                  {isPaid ? 'Payment Confirmed' : 'Pending on Delivery'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Total: NPR {total.toLocaleString()}</p>
            </>
          )}
        </div>

        {addr && (
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <h3 className="text-sm font-semibold text-on-surface">Delivery Address</h3>
            </div>
            <p className="text-sm font-semibold text-on-surface">{addr.name}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{addr.address}</p>
            <p className="text-xs text-on-surface-variant">{addr.city}, {addr.province} {addr.zip}</p>
            <p className="text-xs text-on-surface-variant">{addr.phone}</p>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>description</span>
            <h3 className="text-sm font-semibold text-on-surface">Order Status</h3>
          </div>
          {loading ? (
            <div className="h-4 bg-surface-container rounded w-1/3 animate-pulse" />
          ) : (
            <>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                order?.status === 'CONFIRMED' ? 'bg-primary/10 text-primary'
                : order?.status === 'PLACED'   ? 'bg-amber-100 text-amber-700'
                : 'bg-surface-container text-on-surface-variant'
              }`}>{order?.status}</span>
              <p className="text-xs text-on-surface-variant mt-2">
                {order?.status === 'CONFIRMED'
                  ? 'Order confirmed and being prepared.'
                  : 'Order received and awaiting confirmation.'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ordered items */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl custom-shadow p-5">
          <h2 className="text-[15px] font-semibold text-on-surface mb-4">Ordered Medicines</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-4 p-3 rounded-xl border border-outline-variant animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-surface-container flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                    <div className="h-3 bg-surface-container rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {order?.items?.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-outline-variant">
                  {item.medicine.imageUrl ? (
                    <img src={item.medicine.imageUrl} alt={item.medicine.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '28px' }}>medication</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{item.medicine.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.medicine.brand}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.medicine.type === 'Rx' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                      {item.medicine.type}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-on-surface-variant">× {item.quantity}</p>
                    <p className="text-sm font-bold text-on-surface">NPR {(Number(item.unitPrice) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary + actions */}
        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5 h-fit space-y-3">
          <h2 className="text-[15px] font-semibold text-on-surface">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-medium">NPR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Delivery</span>
              <span className={`font-medium ${delivery === 0 ? 'text-primary' : 'text-on-surface'}`}>
                {delivery === 0 ? 'FREE' : `NPR ${delivery}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-outline-variant pt-2">
              <span>Total {isPaid ? 'Paid' : ''}</span>
              <span>NPR {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {orderId && (
              <Link to={`/dashboard/orders/${orderId}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
                Track Order
              </Link>
            )}
            <Link to="/dashboard/medicines"
              className="flex items-center justify-center gap-2 w-full py-3 border border-outline-variant rounded-xl font-medium text-sm text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
