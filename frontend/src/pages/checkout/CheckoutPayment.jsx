import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

const orderItems = [
  { name: 'Amoxicillin 500mg', qty: 2, price: 180 },
  { name: 'Paracetamol 500mg', qty: 3, price: 45 },
  { name: 'Vitamin D3 1000 IU', qty: 1, price: 320 },
]

export default function CheckoutPayment() {
  const navigate = useNavigate()
  const [method, setMethod] = useState('esewa')
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0)
  const delivery = 0
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0
  const total = subtotal + delivery - discount

  const trustBadges = [
    { icon: 'verified', label: 'Certified Pharmacy' },
    { icon: 'lock', label: 'SSL Secure' },
    { icon: 'local_shipping', label: 'Fast Tracking' },
    { icon: 'support_agent', label: '24/7 Support' },
  ]

  return (
    <div className="space-y-4">
      <CheckoutSteps current={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-4">Choose Payment Method</h2>

            <div className="space-y-3">
              {/* eSewa */}
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                method === 'esewa' ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/40'
              }`}>
                <input type="radio" name="payment" value="esewa" checked={method === 'esewa'} onChange={() => setMethod('esewa')} className="mt-1 accent-[#316bf3]" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <span className="text-green-700 font-bold text-xs">eSewa</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">eSewa Wallet</p>
                        <p className="text-xs text-on-surface-variant">Pay via eSewa digital wallet</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '12px' }}>lock</span>
                      Secure Gateway
                    </span>
                  </div>
                  {method === 'esewa' && (
                    <div className="mt-3 pt-3 border-t border-outline-variant">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">eSewa ID / Phone</label>
                          <input type="text" placeholder="98XXXXXXXX" className="w-full text-sm border border-outline-variant rounded-xl px-3 py-2.5 bg-surface-container-low focus:outline-none focus:border-secondary transition" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-on-surface-variant mb-1 block">MPIN</label>
                          <input type="password" placeholder="••••" className="w-full text-sm border border-outline-variant rounded-xl px-3 py-2.5 bg-surface-container-low focus:outline-none focus:border-secondary transition" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Cash on Delivery */}
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                method === 'cod' ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/40'
              }`}>
                <input type="radio" name="payment" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} className="mt-1 accent-[#316bf3]" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <span className="material-symbols-outlined ms-filled text-amber-700" style={{ fontSize: '22px' }}>payments</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Cash on Delivery</p>
                      <p className="text-xs text-on-surface-variant">Pay when your order arrives</p>
                    </div>
                  </div>
                  {method === 'cod' && (
                    <div className="mt-3 pt-3 border-t border-outline-variant">
                      <p className="text-xs text-on-surface-variant leading-relaxed">Please keep exact change ready. Our delivery agent will collect the payment upon delivery. COD is available for orders up to NPR 5000.</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Trust Badges */}
            <div className="mt-5 pt-4 border-t border-outline-variant">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {trustBadges.map(badge => (
                  <div key={badge.label} className="flex flex-col items-center gap-1.5 p-3 bg-surface-container-low rounded-xl">
                    <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '24px' }}>{badge.icon}</span>
                    <span className="text-xs font-medium text-on-surface text-center leading-tight">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl custom-shadow p-5 h-fit space-y-4">
          <h2 className="text-[15px] font-semibold text-on-surface">Order Summary</h2>

          <div className="space-y-2.5">
            {orderItems.map(item => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{item.name} × {item.qty}</span>
                <span className="font-medium text-on-surface">NPR {item.price * item.qty}</span>
              </div>
            ))}
          </div>

          {/* Promo */}
          <div>
            <p className="text-xs font-medium text-on-surface mb-1.5">Promo Code</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code"
                value={promo}
                onChange={e => setPromo(e.target.value)}
                disabled={promoApplied}
                className="flex-1 text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-low focus:outline-none focus:border-secondary transition disabled:opacity-50"
              />
              <button
                onClick={() => { if (promo.toUpperCase() === 'PHARMA10') setPromoApplied(true) }}
                disabled={promoApplied || !promo}
                className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {promoApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>

          <div className="border-t border-outline-variant pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-medium">NPR {subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Delivery</span>
              <span className="font-medium text-primary">FREE</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Discount</span>
                <span className="font-medium text-primary">– NPR {discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-outline-variant pt-2">
              <span>Total</span>
              <span>NPR {total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/checkout/confirmation')}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
            Place Order · NPR {total}
          </button>

          <Link to="/dashboard/checkout/prescription" className="flex items-center justify-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Prescription
          </Link>
        </div>
      </div>
    </div>
  )
}
