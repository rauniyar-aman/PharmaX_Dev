import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const orderItems = [
  { name: 'Amoxicillin 500mg', brand: 'GlaxoSmithKline', qty: 2, price: 180, type: 'Rx', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
  { name: 'Paracetamol 500mg', brand: 'Cipla', qty: 3, price: 45, type: 'OTC', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop' },
  { name: 'Vitamin D3 1000 IU', brand: 'Abbott', qty: 1, price: 320, type: 'OTC', img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=200&h=200&fit=crop' },
]

const timeline = [
  { label: 'Order Placed', time: 'Jun 24, 2024, 10:32 AM', done: true },
  { label: 'Prescription Verified', time: 'Jun 24, 2024, 11:15 AM', done: true },
  { label: 'Processing', time: 'Jun 24, 2024, 2:00 PM', done: true },
  { label: 'Shipped', time: 'Jun 25, 2024, 9:00 AM', done: false },
  { label: 'Out for Delivery', time: 'Estimated: Jun 26', done: false },
  { label: 'Delivered', time: 'Estimated: Jun 26-28', done: false },
]

const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0)

export default function OrderDetail() {
  const { orderId } = useParams()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/orders" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Orders
            </Link>
          </div>
          <h1 className="text-xl font-bold text-on-surface">Order #{orderId || 'ORD-2024-007'}</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Placed on Jun 24, 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">Processing</span>
          <Link to={`/dashboard/track-order/${orderId || 'ORD-2024-007'}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>route</span>
            Track Order
          </Link>
        </div>
      </div>

      {/* Rate Your Experience */}
      <div className="bg-white rounded-2xl custom-shadow p-5">
        <h2 className="text-sm font-semibold text-on-surface mb-3">Rate Your Experience</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <span className={`material-symbols-outlined ${(hover || rating) >= star ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '28px' }}>star</span>
              </button>
            ))}
          </div>
          {rating > 0 && <span className="text-sm text-on-surface-variant ml-1">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>}
        </div>
        {rating > 0 && (
          <button className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Submit Review
          </button>
        )}
      </div>

      {/* Delivery + Payment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl custom-shadow p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '20px' }}>location_on</span>
            <h3 className="text-sm font-semibold text-on-surface">Delivery Information</h3>
          </div>
          <p className="text-sm font-semibold text-on-surface">Aman Rauniyar</p>
          <p className="text-xs text-on-surface-variant mt-1">123 Lazimpat, Ward No. 2</p>
          <p className="text-xs text-on-surface-variant">Kathmandu, Bagmati Province — 44600</p>
          <p className="text-xs text-on-surface-variant mt-0.5">+977-98XXXXXXXX</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '14px' }}>local_shipping</span>
            <span className="text-xs text-on-surface-variant">Estimated: Jun 26–28, 2024</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl custom-shadow p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '20px' }}>payment</span>
            <h3 className="text-sm font-semibold text-on-surface">Payment Information</h3>
          </div>
          <p className="text-sm font-semibold text-on-surface">eSewa Wallet</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '14px' }}>check_circle</span>
            <span className="text-xs text-primary font-medium">Payment Confirmed</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="text-on-surface">NPR {subtotal}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Delivery</span>
              <span className="text-primary font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-outline-variant pt-1.5 mt-1.5">
              <span>Total</span>
              <span>NPR {subtotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="bg-white rounded-2xl custom-shadow p-5">
        <h2 className="text-[15px] font-semibold text-on-surface mb-4">Delivery Timeline</h2>
        <div className="space-y-0">
          {timeline.map((step, i) => (
            <div key={i} className="flex gap-4 relative pb-5 last:pb-0">
              {i < timeline.length - 1 && (
                <div className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${step.done ? 'bg-primary' : 'bg-outline-variant'}`} />
              )}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-0.5 border-2 ${
                step.done ? 'bg-primary border-primary' : 'bg-white border-outline-variant'
              }`}>
                {step.done && <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: '14px' }}>check</span>}
              </div>
              <div>
                <p className={`text-sm font-semibold ${step.done ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items in Order */}
      <div className="bg-white rounded-2xl custom-shadow p-5">
        <h2 className="text-[15px] font-semibold text-on-surface mb-4">Items in Order</h2>
        <div className="space-y-3">
          {orderItems.map(item => (
            <div key={item.name} className="flex items-center gap-4 p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
              <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'Rx' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>{item.type}</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                <p className="text-xs text-on-surface-variant">{item.brand}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-on-surface-variant">× {item.qty}</p>
                <p className="text-sm font-bold text-on-surface">NPR {item.price * item.qty}</p>
                <button className="text-xs font-medium text-secondary hover:underline mt-1">Write a Review</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
