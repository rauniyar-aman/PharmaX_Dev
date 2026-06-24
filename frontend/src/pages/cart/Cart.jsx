import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/signin'); return }
    api.get('/cart')
      .then(res => setItems(res.data.data.cart.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [isAuthenticated, navigate])

  const updateQty = async (medicineId, newQty) => {
    if (newQty < 1) return
    setUpdating(prev => ({ ...prev, [medicineId]: true }))
    try {
      const res = await api.put(`/cart/items/${medicineId}`, { quantity: newQty })
      setItems(res.data.data.cart.items || [])
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update quantity.')
    } finally {
      setUpdating(prev => ({ ...prev, [medicineId]: false }))
    }
  }

  const removeItem = async (medicineId) => {
    setUpdating(prev => ({ ...prev, [medicineId]: true }))
    try {
      const res = await api.delete(`/cart/items/${medicineId}`)
      setItems(res.data.data.cart.items || [])
    } catch {
      alert('Could not remove item.')
    } finally {
      setUpdating(prev => ({ ...prev, [medicineId]: false }))
    }
  }

  const subtotal = items.reduce((s, i) => s + Number(i.medicine.price) * i.quantity, 0)
  const delivery = subtotal >= 500 ? 0 : 80
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0
  const total = subtotal + delivery - discount

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 bg-surface-container rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl custom-shadow p-4 flex gap-4 animate-pulse">
                <div className="w-24 h-24 rounded-xl bg-surface-container flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-2/3" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                  <div className="h-8 bg-surface-container rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-white rounded-2xl custom-shadow animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Shopping Cart</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
        <Link to="/dashboard/medicines" className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl custom-shadow text-center py-20">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '64px' }}>shopping_cart</span>
          <p className="text-lg font-semibold text-on-surface mt-4">Your cart is empty</p>
          <p className="text-sm text-on-surface-variant mt-1">Browse our medicines and add items to your cart</p>
          <Link to="/dashboard/medicines" className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pill</span>
            Browse Medicines
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => {
              const med = item.medicine
              const isRx = med.type === 'Rx'
              return (
                <div key={item.id} className="bg-white rounded-2xl custom-shadow p-4 flex gap-4">
                  <Link to={`/dashboard/medicines/${med.id}`} className="flex-shrink-0">
                    <img
                      src={med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop'}
                      alt={med.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isRx ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                            {isRx ? 'Rx' : 'OTC'}
                          </span>
                          <span className="text-xs text-on-surface-variant">{med.brand}</span>
                        </div>
                        <Link to={`/dashboard/medicines/${med.id}`} className="text-sm font-semibold text-on-surface hover:text-primary transition-colors">{med.name}</Link>
                        {med.category?.name && (
                          <p className="text-xs text-on-surface-variant mt-0.5">{med.category.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(med.id)}
                        disabled={updating[med.id]}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors flex-shrink-0 disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(med.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating[med.id]}
                          className="px-2.5 py-1.5 hover:bg-surface-container transition-colors text-on-surface disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>remove</span>
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-on-surface">
                          {updating[med.id] ? '…' : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(med.id, item.quantity + 1)}
                          disabled={updating[med.id]}
                          className="px-2.5 py-1.5 hover:bg-surface-container transition-colors text-on-surface disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">NPR {Number(med.price).toFixed(0)} × {item.quantity}</p>
                        <p className="text-base font-bold text-on-surface">NPR {(Number(med.price) * item.quantity).toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Free Delivery Banner */}
            {subtotal < 500 ? (
              <div className="bg-primary-fixed border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '24px' }}>local_shipping</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">Add NPR {500 - subtotal} more for FREE delivery!</p>
                  <div className="mt-1.5 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-primary-fixed border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '24px' }}>check_circle</span>
                <p className="text-sm font-semibold text-primary">You've unlocked FREE delivery!</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl custom-shadow p-5">
              <h2 className="text-[15px] font-semibold text-on-surface mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-on-surface">NPR {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Delivery Charge</span>
                  <span className={`font-medium ${delivery === 0 ? 'text-primary' : 'text-on-surface'}`}>{delivery === 0 ? 'FREE' : `NPR ${delivery}`}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Discount (PHARMA10)</span>
                    <span className="font-medium text-primary">– NPR {discount}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant pt-3 flex justify-between">
                  <span className="font-semibold text-on-surface">Total</span>
                  <span className="font-bold text-lg text-on-surface">NPR {total.toFixed(0)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-4">
                <p className="text-xs font-medium text-on-surface mb-2">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    disabled={couponApplied}
                    className="flex-1 text-sm border border-outline-variant rounded-xl px-3 py-2.5 bg-surface-container-low focus:outline-none focus:border-secondary transition disabled:opacity-50"
                  />
                  <button
                    onClick={() => { if (coupon.toUpperCase() === 'PHARMA10') setCouponApplied(true) }}
                    disabled={couponApplied || !coupon}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {couponApplied && <p className="text-xs text-primary mt-1.5 font-medium">PHARMA10 applied — 10% off!</p>}
              </div>

              <Link
                to="/dashboard/checkout/shipping"
                className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>shopping_bag</span>
                Proceed to Checkout
              </Link>

              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-outline-variant">
                <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '16px' }}>lock</span>
                  Secure
                </div>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '16px' }}>verified</span>
                  Certified
                </div>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '16px' }}>local_shipping</span>
                  Fast Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
