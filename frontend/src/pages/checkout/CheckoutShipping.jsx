import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

const savedAddresses = [
  {
    id: 1,
    label: 'Home',
    name: 'Aman Rauniyar',
    phone: '+977-98XXXXXXXX',
    address: '123 Lazimpat, Ward No. 2',
    city: 'Kathmandu',
    province: 'Bagmati Province',
    zip: '44600',
    default: true,
  },
  {
    id: 2,
    label: 'Office',
    name: 'Aman Rauniyar',
    phone: '+977-98XXXXXXXX',
    address: '45 New Baneshwor, Opposite to Baneshwor Chowk',
    city: 'Kathmandu',
    province: 'Bagmati Province',
    zip: '44601',
    default: false,
  },
]

export default function CheckoutShipping() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(1)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', address: '', city: '', province: '', zip: '' })
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)

  useEffect(() => {
    if (!sessionStorage.getItem('checkoutAllowed')) {
      navigate('/dashboard/cart', { replace: true })
      return
    }
    api.get('/cart')
      .then(res => setCartItems(res.data.data.cart.items || []))
      .catch(() => {})
      .finally(() => setCartLoading(false))
  }, [])

  const subtotal = cartItems.reduce((s, i) => s + Number(i.medicine.price) * i.quantity, 0)
  const delivery = subtotal > 0 && subtotal >= 500 ? 0 : 80

  return (
    <div className="space-y-4">
      <CheckoutSteps current={0} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Shipping */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-on-surface">Saved Addresses</h2>
              <button
                onClick={() => setShowNewForm(v => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Add New Address
              </button>
            </div>

            <div className="space-y-3">
              {savedAddresses.map(addr => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    selected === addr.id ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/40'
                  }`}
                >
                  <input type="radio" name="address" value={addr.id} checked={selected === addr.id} onChange={() => setSelected(addr.id)} className="mt-1 accent-[#316bf3]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${addr.default ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                        {addr.label}
                      </span>
                      {addr.default && <span className="text-xs text-primary font-medium">Default</span>}
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{addr.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{addr.address}, {addr.city}</p>
                    <p className="text-xs text-on-surface-variant">{addr.province} — {addr.zip}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{addr.phone}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                    </button>
                    <button className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                </label>
              ))}
            </div>

            {showNewForm && (
              <div className="mt-4 pt-4 border-t border-outline-variant">
                <h3 className="text-sm font-semibold text-on-surface mb-3">New Delivery Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'name', label: 'Full Name', placeholder: 'Your full name' },
                    { key: 'phone', label: 'Phone Number', placeholder: '+977-XXXXXXXXXX' },
                    { key: 'address', label: 'Street Address', placeholder: 'House No., Street, Ward' },
                    { key: 'city', label: 'City', placeholder: 'Kathmandu' },
                    { key: 'province', label: 'Province', placeholder: 'Bagmati Province' },
                    { key: 'zip', label: 'ZIP Code', placeholder: '44600' },
                  ].map(f => (
                    <div key={f.key} className={f.key === 'address' ? 'sm:col-span-2' : ''}>
                      <label className="text-xs font-medium text-on-surface-variant mb-1 block">{f.label}</label>
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={newAddr[f.key]}
                        onChange={e => setNewAddr(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full text-sm border border-outline-variant rounded-xl px-3 py-2.5 bg-surface-container-low focus:outline-none focus:border-secondary transition"
                      />
                    </div>
                  ))}
                </div>
                <button className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Save Address
                </button>
              </div>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Pick Delivery Location on Map</h3>
            <div className="relative h-48 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '48px' }}>map</span>
                <p className="text-sm text-on-surface-variant">Map view coming soon</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors custom-shadow">
                  <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '18px' }}>my_location</span>
                  Pick Current Location
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white rounded-2xl custom-shadow p-5 h-fit">
          <h2 className="text-[15px] font-semibold text-on-surface mb-4">Order Summary</h2>

          {cartLoading ? (
            <div className="space-y-2.5 mb-4">
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-surface-container rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-surface-container rounded w-1/5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{item.medicine.name} × {item.quantity}</span>
                  <span className="font-medium text-on-surface">NPR {(Number(item.medicine.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-outline-variant pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-medium text-on-surface">NPR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Delivery</span>
              <span className={`font-medium ${delivery === 0 ? 'text-primary' : 'text-on-surface'}`}>
                {delivery === 0 ? 'FREE' : `NPR ${delivery}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-outline-variant pt-2">
              <span className="text-on-surface">Total</span>
              <span className="text-on-surface text-base">NPR {(subtotal + delivery).toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/checkout/prescription')}
            disabled={cartLoading || cartItems.length === 0}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Prescription
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </button>
          <button
            onClick={() => { sessionStorage.removeItem('checkoutAllowed'); navigate('/dashboard/cart') }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
