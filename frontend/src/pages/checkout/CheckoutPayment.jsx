import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../lib/api'
import checkoutStore from '../../lib/checkoutStore'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

function clearCheckoutSession() {
  ;['checkoutAllowed', 'checkoutAddress', 'checkoutRxDraft', 'checkoutPrescriptions'].forEach(k =>
    sessionStorage.removeItem(k)
  )
}

async function uploadStagedPrescriptions(prescriptionMap) {
  const result = { ...prescriptionMap }
  const rxDraftUpdates = {}

  for (const [medId, pId] of Object.entries(prescriptionMap)) {
    if (String(pId).startsWith('staged:')) {
      const staged = checkoutStore.get(medId)
      if (!staged) { delete result[medId]; continue }
      const fd = new FormData()
      staged.files.forEach(f => fd.append('files', f))
      fd.append('checkoutDraft', 'true')
      const res = await api.post('/prescriptions', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const prescription = res.data.data.prescription
      result[medId] = prescription.id
      rxDraftUpdates[medId] = prescription
    }
  }

  if (Object.keys(rxDraftUpdates).length > 0) {
    try {
      const rxDraft = JSON.parse(sessionStorage.getItem('checkoutRxDraft') || '{}')
      for (const [medId, prescription] of Object.entries(rxDraftUpdates)) {
        rxDraft[medId] = { ...prescription, isNew: true, isDraft: false }
      }
      sessionStorage.setItem('checkoutRxDraft', JSON.stringify(rxDraft))
    } catch {}
  }

  return result
}

export default function CheckoutPayment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const esewaCancelled  = searchParams.get('esewa_cancelled')  === '1'
  const khaltiCancelled = searchParams.get('khalti_cancelled') === '1'
  const [method, setMethod] = useState('esewa')
  const [promo, setPromo] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('checkoutAllowed')) {
      navigate('/dashboard/cart', { replace: true }); return
    }
    api.get('/cart')
      .then(res => setCartItems(res.data.data.cart.items || []))
      .catch(() => {})
      .finally(() => setCartLoading(false))
  }, [])

  const subtotal  = cartItems.reduce((s, i) => s + Number(i.medicine.price) * i.quantity, 0)
  const delivery  = subtotal > 0 && subtotal >= 500 ? 0 : 80
  const discount  = promoApplied ? Math.round(subtotal * 0.1) : 0
  const total     = subtotal + delivery - discount

  const getPayload = () => {
    const addr = JSON.parse(sessionStorage.getItem('checkoutAddress') || '{}')
    const prescriptionMap = JSON.parse(sessionStorage.getItem('checkoutPrescriptions') || '{}')
    return { addressId: addr.id, prescriptionMap }
  }

  const updateQty = async (medicineId, newQty) => {
    if (newQty < 1) return
    setUpdating(u => ({ ...u, [medicineId]: true }))
    try {
      await api.put(`/cart/items/${medicineId}`, { quantity: newQty })
      setCartItems(items => items.map(i => i.medicine.id === medicineId ? { ...i, quantity: newQty } : i))
    } catch {}
    setUpdating(u => ({ ...u, [medicineId]: false }))
  }

  const handleEsewa = async () => {
    setError('')
    setPlacing(true)
    try {
      const { addressId, prescriptionMap } = getPayload()
      if (!addressId) { setError('Delivery address not found. Go back to shipping.'); setPlacing(false); return }

      const finalMap = await uploadStagedPrescriptions(prescriptionMap)

      sessionStorage.setItem('checkoutPrescriptions', JSON.stringify(finalMap))

      const res = await api.post('/payment/esewa/initiate', { addressId, prescriptionMap: finalMap })
      const { formUrl, params } = res.data.data

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = formUrl
      Object.entries(params).forEach(([key, val]) => {
        const input = document.createElement('input')
        input.type  = 'hidden'
        input.name  = key
        input.value = val
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate eSewa payment.')
      setPlacing(false)
    }
  }

  const handleCod = async () => {
    setError('')
    setPlacing(true)
    try {
      const { addressId, prescriptionMap } = getPayload()
      if (!addressId) { setError('Delivery address not found. Go back to shipping.'); setPlacing(false); return }

      const finalMap = await uploadStagedPrescriptions(prescriptionMap)
      const res = await api.post('/payment/cod/place', { addressId, prescriptionMap: finalMap })
      const { order } = res.data.data
      clearCheckoutSession()
      checkoutStore.clear()
      navigate(`/dashboard/checkout/confirmation?orderId=${order.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.')
      setPlacing(false)
    }
  }

  const handleKhalti = async () => {
    setError('')
    setPlacing(true)
    try {
      const { addressId, prescriptionMap } = getPayload()
      if (!addressId) { setError('Delivery address not found. Go back to shipping.'); setPlacing(false); return }

      const finalMap = await uploadStagedPrescriptions(prescriptionMap)
      sessionStorage.setItem('checkoutPrescriptions', JSON.stringify(finalMap))

      const res = await api.post('/payment/khalti/initiate', { addressId, prescriptionMap: finalMap })
      window.location.href = res.data.data.payment_url
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate Khalti payment.')
      setPlacing(false)
    }
  }

  const handlePay = () => {
    if (method === 'esewa')  return handleEsewa()
    if (method === 'khalti') return handleKhalti()
    return handleCod()
  }

  const trustBadges = [
    { icon: 'verified',        label: 'Certified Pharmacy' },
    { icon: 'lock',            label: 'SSL Secure' },
    { icon: 'local_shipping',  label: 'Fast Delivery' },
    { icon: 'support_agent',   label: '24/7 Support' },
  ]

  return (
    <div className="space-y-4">
      <CheckoutSteps current={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {esewaCancelled && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/30">
              <span className="material-symbols-outlined text-amber-600 flex-shrink-0 mt-0.5" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>info</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">eSewa payment was not completed</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Your cart and prescription are saved. Select a payment method and try again.</p>
              </div>
            </div>
          )}
          {khaltiCancelled && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/30">
              <span className="material-symbols-outlined text-purple-600 flex-shrink-0 mt-0.5" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>info</span>
              <div>
                <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Khalti payment was not completed</p>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">Your cart and prescription are saved. Select a payment method and try again.</p>
              </div>
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-4">Choose Payment Method</h2>

            <div className="space-y-3">
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                method === 'esewa' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-outline-variant hover:border-green-400/60'
              }`}>
                <input type="radio" name="payment" value="esewa" checked={method === 'esewa'}
                  onChange={() => setMethod('esewa')} className="mt-1 accent-green-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-xl bg-green-600 flex items-center justify-center px-2">
                        <span className="text-white font-extrabold text-sm tracking-tight">eSewa</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">eSewa Wallet</p>
                        <p className="text-xs text-on-surface-variant">Redirect to eSewa to complete payment</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2.5 py-1 rounded-full">
                      <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                      PCI-DSS Secure
                    </span>
                  </div>
                  {method === 'esewa' && (
                    <div className="mt-3 pt-3 border-t border-outline-variant">
                      <div className="flex items-start gap-2 text-xs text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2.5">
                        <span className="material-symbols-outlined text-green-600 flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>info</span>
                        <p>You will be redirected to the eSewa payment portal. After completing the payment, you will be automatically brought back here.</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-green-600" style={{ fontSize: '14px' }}>check</span> Instant confirmation</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-green-600" style={{ fontSize: '14px' }}>check</span> eSewa cashback eligible</span>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                method === 'khalti' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-outline-variant hover:border-purple-400/60'
              }`}>
                <input type="radio" name="payment" value="khalti" checked={method === 'khalti'}
                  onChange={() => setMethod('khalti')} className="mt-1 accent-purple-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-xl bg-purple-600 flex items-center justify-center px-2">
                        <span className="text-white font-extrabold text-sm tracking-tight">Khalti</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Khalti Wallet</p>
                        <p className="text-xs text-on-surface-variant">Redirect to Khalti to complete payment</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2.5 py-1 rounded-full">
                      <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                      PCI-DSS Secure
                    </span>
                  </div>
                  {method === 'khalti' && (
                    <div className="mt-3 pt-3 border-t border-outline-variant">
                      <div className="flex items-start gap-2 text-xs text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2.5">
                        <span className="material-symbols-outlined text-purple-600 flex-shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>info</span>
                        <p>You will be redirected to the Khalti payment portal. After completing the payment, you will be automatically brought back here.</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2.5 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-purple-600" style={{ fontSize: '14px' }}>check</span> Instant confirmation</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-purple-600" style={{ fontSize: '14px' }}>check</span> Khalti cashback eligible</span>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                method === 'cod' ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-outline-variant hover:border-amber-400/60'
              }`}>
                <input type="radio" name="payment" value="cod" checked={method === 'cod'}
                  onChange={() => setMethod('cod')} className="mt-1 accent-amber-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-700 dark:text-amber-400" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>payments</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Cash on Delivery</p>
                      <p className="text-xs text-on-surface-variant">Pay when your order arrives</p>
                    </div>
                  </div>
                  {method === 'cod' && (
                    <div className="mt-3 pt-3 border-t border-outline-variant text-xs text-on-surface-variant leading-relaxed">
                      Please keep the exact amount ready. Our delivery agent will collect payment on arrival. COD is available for orders up to NPR 5,000.
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="mt-5 pt-4 border-t border-outline-variant grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trustBadges.map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                  <span className="text-xs font-medium text-on-surface text-center leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5 h-fit space-y-4">
          <h2 className="text-[15px] font-semibold text-on-surface">Order Summary</h2>

          {cartLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-surface-container rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-surface-container rounded w-1/5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-on-surface-variant truncate flex-1">{item.medicine.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => updateQty(item.medicine.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating[item.medicine.id] || placing}
                      className="w-6 h-6 rounded-md bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high disabled:opacity-40 transition">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
                    </button>
                    <span className="text-sm font-semibold text-on-surface w-6 text-center">
                      {updating[item.medicine.id] ? '…' : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.medicine.id, item.quantity + 1)}
                      disabled={updating[item.medicine.id] || placing}
                      className="w-6 h-6 rounded-md bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high disabled:opacity-40 transition">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                    </button>
                    <span className="text-sm font-medium text-on-surface w-20 text-right">
                      NPR {(Number(item.medicine.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-on-surface mb-1.5">Promo Code</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter code" value={promo}
                onChange={e => setPromo(e.target.value)} disabled={promoApplied}
                className="flex-1 text-sm border border-outline-variant rounded-xl px-3 py-2 focus:outline-none focus:border-secondary transition disabled:opacity-50" />
              <button onClick={() => { if (promo.toUpperCase() === 'PHARMA10') setPromoApplied(true) }}
                disabled={promoApplied || !promo}
                className="px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold disabled:opacity-50 hover:opacity-90 transition">
                {promoApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            {promoApplied && <p className="text-xs text-primary mt-1 font-medium">PHARMA10 applied - 10% off!</p>}
          </div>

          <div className="border-t border-outline-variant pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="font-medium">NPR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Delivery</span>
              <span className={`font-medium ${delivery === 0 ? 'text-primary' : 'text-on-surface'}`}>
                {delivery === 0 ? 'FREE' : `NPR ${delivery}`}
              </span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Discount</span>
                <span className="font-medium text-primary">− NPR {discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-outline-variant pt-2">
              <span>Total</span>
              <span>NPR {total.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button onClick={handlePay}
            disabled={placing || cartLoading || cartItems.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              method === 'esewa'  ? 'bg-green-600 text-white hover:bg-green-700'   :
              method === 'khalti' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                                    'bg-amber-500 text-white hover:bg-amber-600'
            }`}>
            {placing ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                {method === 'esewa' ? 'Redirecting to eSewa…' : method === 'khalti' ? 'Redirecting to Khalti…' : 'Placing order…'}
              </>
            ) : method === 'esewa' ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                Pay with eSewa · NPR {total.toLocaleString()}
              </>
            ) : method === 'khalti' ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                Pay with Khalti · NPR {total.toLocaleString()}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Place Order · NPR {total.toLocaleString()}
              </>
            )}
          </button>

          <Link to="/dashboard/checkout/prescription"
            className="flex items-center justify-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Prescription
          </Link>
        </div>
      </div>
    </div>
  )
}
