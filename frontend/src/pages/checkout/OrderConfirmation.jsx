import React from 'react'
import { Link } from 'react-router-dom'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

const orderedItems = [
  { name: 'Amoxicillin 500mg', brand: 'GlaxoSmithKline', qty: 2, price: 180, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
  { name: 'Paracetamol 500mg', brand: 'Cipla', qty: 3, price: 45, img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop' },
  { name: 'Vitamin D3 1000 IU', brand: 'Abbott', qty: 1, price: 320, img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=200&h=200&fit=crop' },
]

const subtotal = orderedItems.reduce((s, i) => s + i.price * i.qty, 0)

export default function OrderConfirmation() {
  return (
    <div className="space-y-4">
      <CheckoutSteps current={4} />

      {/* Success Message */}
      <div className="bg-white rounded-2xl custom-shadow p-8 text-center">
        <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '48px' }}>check_circle</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface">Order Placed Successfully!</h1>
        <p className="text-on-surface-variant mt-2 text-sm">Thank you for your order. We've received your order and will begin processing it shortly.</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-surface-container-low px-5 py-2.5 rounded-full">
          <span className="text-xs text-on-surface-variant">Order ID:</span>
          <span className="text-sm font-bold text-secondary">#ORD-2024-007</span>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl custom-shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '20px' }}>local_shipping</span>
            <h3 className="text-sm font-semibold text-on-surface">Estimated Delivery</h3>
          </div>
          <p className="text-base font-bold text-on-surface">Jun 26 – Jun 28, 2024</p>
          <p className="text-xs text-on-surface-variant mt-1">Standard delivery (2–3 business days)</p>
        </div>

        <div className="bg-white rounded-2xl custom-shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '20px' }}>description</span>
            <h3 className="text-sm font-semibold text-on-surface">Prescription Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '16px' }}>verified</span>
            <span className="text-sm font-semibold text-primary">Verified</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Your prescription has been verified by our pharmacist.</p>
        </div>

        <div className="bg-white rounded-2xl custom-shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined ms-filled text-tertiary" style={{ fontSize: '20px' }}>location_on</span>
            <h3 className="text-sm font-semibold text-on-surface">Delivery Address</h3>
          </div>
          <p className="text-sm font-semibold text-on-surface">Aman Rauniyar</p>
          <p className="text-xs text-on-surface-variant mt-0.5">123 Lazimpat, Ward No. 2</p>
          <p className="text-xs text-on-surface-variant">Kathmandu, Bagmati Province 44600</p>
        </div>

        <div className="bg-white rounded-2xl custom-shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '20px' }}>payment</span>
            <h3 className="text-sm font-semibold text-on-surface">Payment Details</h3>
          </div>
          <p className="text-sm font-semibold text-on-surface">eSewa Wallet</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '14px' }}>check_circle</span>
            <span className="text-xs text-primary font-medium">Payment Confirmed</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">Total Paid: NPR {subtotal}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ordered Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl custom-shadow p-5">
          <h2 className="text-[15px] font-semibold text-on-surface mb-4">Ordered Medicines</h2>
          <div className="space-y-3">
            {orderedItems.map(item => (
              <div key={item.name} className="flex items-center gap-4 p-3 rounded-xl border border-outline-variant">
                <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">{item.brand}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-on-surface-variant">× {item.qty}</p>
                  <p className="text-sm font-bold text-on-surface">NPR {item.price * item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl custom-shadow p-5 h-fit">
          <h2 className="text-[15px] font-semibold text-on-surface mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-medium">NPR {subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Delivery</span>
              <span className="font-medium text-primary">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-outline-variant pt-2 mt-2">
              <span>Total Paid</span>
              <span>NPR {subtotal}</span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Link
              to="/dashboard/track-order/ORD-2024-007"
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>route</span>
              Track Order
            </Link>
            <Link
              to="/dashboard/medicines"
              className="flex items-center justify-center gap-2 w-full py-3 border border-outline-variant rounded-xl font-medium text-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
