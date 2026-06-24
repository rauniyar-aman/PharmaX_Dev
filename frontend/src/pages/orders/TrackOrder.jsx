import React from 'react'
import { Link, useParams } from 'react-router-dom'

const timelineSteps = [
  { label: 'Order Placed', desc: 'Your order has been received', time: 'Jun 24 · 10:32 AM', done: true, active: false },
  { label: 'Prescription Verified', desc: 'Prescription verified by pharmacist', time: 'Jun 24 · 11:15 AM', done: true, active: false },
  { label: 'Processing', desc: 'Medicine being prepared for dispatch', time: 'Jun 24 · 2:00 PM', done: true, active: false },
  { label: 'Shipped', desc: 'Package picked up by courier', time: 'Jun 25 · 9:00 AM', done: false, active: true },
  { label: 'Out for Delivery', desc: 'Package is near your location', time: 'Estimated: Jun 26', done: false, active: false },
  { label: 'Delivered', desc: 'Order successfully delivered', time: 'Estimated: Jun 26–28', done: false, active: false },
]

const packageContents = [
  { name: 'Amoxicillin 500mg', qty: 2, price: 180 },
  { name: 'Paracetamol 500mg', qty: 3, price: 45 },
  { name: 'Vitamin D3 1000 IU', qty: 1, price: 320 },
]

const subtotal = packageContents.reduce((s, i) => s + i.price * i.qty, 0)

export default function TrackOrder() {
  const { orderId } = useParams()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard/orders" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Orders
            </Link>
          </div>
          <h1 className="text-xl font-bold text-on-surface">Track Order</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">#{orderId || 'ORD-2024-007'}</p>
        </div>
        <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-sm font-semibold">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          In Transit
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-5">Delivery Progress</h2>
            <div className="space-y-0">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex gap-3 relative pb-5 last:pb-0">
                  {i < timelineSteps.length - 1 && (
                    <div className={`absolute left-[13px] top-7 bottom-0 w-0.5 ${step.done ? 'bg-primary' : 'bg-outline-variant'}`} />
                  )}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-0.5 border-2 transition-all ${
                    step.done
                      ? 'bg-primary border-primary'
                      : step.active
                      ? 'bg-secondary-container border-secondary ring-4 ring-secondary/20'
                      : 'bg-white border-outline-variant'
                  }`}>
                    {step.done ? (
                      <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: '13px' }}>check</span>
                    ) : step.active ? (
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                    ) : null}
                  </div>
                  <div className="pt-0.5">
                    <p className={`text-sm font-semibold leading-tight ${step.done || step.active ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>
                    <p className={`text-xs mt-0.5 font-medium ${step.done ? 'text-primary' : step.active ? 'text-secondary' : 'text-on-surface-variant'}`}>{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Map + Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map */}
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-on-surface">Live Map</h2>
              <div className="text-right">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">ESTIMATED ARRIVAL</p>
                <p className="text-lg font-bold text-on-surface">Jun 26, 2024</p>
                <p className="text-xs text-on-surface-variant">2:00 PM – 5:00 PM</p>
              </div>
            </div>
            <div className="h-48 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 flex flex-col items-center justify-center">
                <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '56px' }}>map</span>
                <p className="text-sm text-on-surface-variant mt-2">Live tracking map coming soon</p>
              </div>
            </div>
          </div>

          {/* Delivery Partner */}
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Delivery Partner</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-lg flex-shrink-0">
                R
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">Rajesh Kumar</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined ms-filled text-amber-400" style={{ fontSize: '14px' }}>star</span>
                  <span className="text-xs text-on-surface-variant">4.8 · 1,234 deliveries</span>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '20px' }}>call</span>
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '18px' }}>location_on</span>
              Delivery Address
            </h3>
            <p className="text-sm font-medium text-on-surface">Aman Rauniyar</p>
            <p className="text-xs text-on-surface-variant mt-0.5">123 Lazimpat, Ward No. 2, Kathmandu</p>
            <p className="text-xs text-on-surface-variant">Bagmati Province — 44600</p>
          </div>
        </div>
      </div>

      {/* Package Contents */}
      <div className="bg-white rounded-2xl custom-shadow p-5">
        <h2 className="text-[15px] font-semibold text-on-surface mb-4">Package Contents</h2>
        <div className="space-y-2.5 mb-4">
          {packageContents.map(item => (
            <div key={item.name} className="flex items-center justify-between text-sm py-2 border-b border-outline-variant last:border-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '18px' }}>medication</span>
                <span className="text-on-surface font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-6 text-on-surface-variant">
                <span>× {item.qty}</span>
                <span className="font-semibold text-on-surface">NPR {item.price * item.qty}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-outline-variant">
          <span>Total</span>
          <span>NPR {subtotal}</span>
        </div>
      </div>
    </div>
  )
}
