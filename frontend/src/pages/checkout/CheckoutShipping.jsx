import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'
import AddressModal from '../../components/address/AddressModal'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const LIBRARIES = ['places']
const MAP_STYLE = { width: '100%', height: '100%' }
const MAP_OPTIONS = { disableDefaultUI: true, zoomControl: true, streetViewControl: false }

function MiniMap({ lat, lng }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  })
  if (!isLoaded) return (
    <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
      <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
    </div>
  )
  return (
    <GoogleMap mapContainerStyle={MAP_STYLE} center={{ lat, lng }} zoom={15} options={MAP_OPTIONS}>
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  )
}

export default function CheckoutShipping() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)

  useEffect(() => {
    if (!sessionStorage.getItem('checkoutAllowed')) {
      navigate('/dashboard/cart', { replace: true }); return
    }
    api.get('/cart')
      .then(res => setCartItems(res.data.data.cart.items || []))
      .catch(() => {})
      .finally(() => setCartLoading(false))

    api.get('/user/addresses')
      .then(res => {
        const addrs = res.data.data.addresses
        setAddresses(addrs)
        const def = addrs.find(a => a.isDefault) || addrs[0]
        if (def) setSelected(def.id)
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false))
  }, [])

  const handleAddressSaved = (saved) => {
    setAddresses(prev => {
      const updated = prev.some(a => a.id === saved.id)
        ? prev.map(a => a.id === saved.id ? saved : saved.isDefault ? { ...a, isDefault: false } : a)
        : [...prev.map(a => saved.isDefault ? { ...a, isDefault: false } : a), saved]
      return updated
    })
    setSelected(saved.id)
  }

  const handleContinue = () => {
    if (!selected) return
    const addr = addresses.find(a => a.id === selected)
    sessionStorage.setItem('checkoutAddress', JSON.stringify(addr))
    navigate('/dashboard/checkout/prescription')
  }

  const selectedAddr = addresses.find(a => a.id === selected)
  const subtotal = cartItems.reduce((s, i) => s + Number(i.medicine.price) * i.quantity, 0)
  const delivery = subtotal > 0 && subtotal >= 500 ? 0 : 80

  return (
    <div className="space-y-4">
      <CheckoutSteps current={0} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-on-surface">Delivery Address</h2>
              <button onClick={() => setShowAddressModal(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Add New
              </button>
            </div>

            {addrLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-surface-container-low rounded-xl animate-pulse" />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-on-surface-variant/40 mb-2" style={{ fontSize: '40px' }}>location_off</span>
                <p className="text-sm text-on-surface-variant mb-3">No saved addresses</p>
                <button onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
                  + Add Delivery Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected === addr.id ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/40'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selected === addr.id}
                      onChange={() => setSelected(addr.id)} className="mt-1 accent-[#316bf3]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${addr.isDefault ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                          {addr.label}
                        </span>
                        {addr.isDefault && <span className="text-xs text-primary font-medium">Default</span>}
                        {addr.lat && (
                          <span className="flex items-center gap-0.5 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            <span className="material-symbols-outlined" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>pin_drop</span>
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{addr.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{addr.address}, {addr.city}</p>
                      <p className="text-xs text-on-surface-variant">{addr.province} - {addr.zip}</p>
                      <p className="text-xs text-on-surface-variant">{addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedAddr?.lat && (
            <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>pin_drop</span>
                <h3 className="text-sm font-semibold text-on-surface">Delivery Location</h3>
                <span className="text-xs text-on-surface-variant ml-auto">{selectedAddr.lat.toFixed(5)}, {selectedAddr.lng.toFixed(5)}</span>
              </div>
              <div className="h-48 rounded-xl overflow-hidden border border-outline-variant">
                <MiniMap lat={selectedAddr.lat} lng={selectedAddr.lng} />
              </div>
              <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                {selectedAddr.address}, {selectedAddr.city}
              </p>
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5 h-fit">
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

          {!selected && addresses.length > 0 && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Please select a delivery address to continue.
            </p>
          )}

          <button
            onClick={handleContinue}
            disabled={cartLoading || cartItems.length === 0 || !selected}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Continue to Prescription
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </button>
          <button
            onClick={() => { ['checkoutAllowed','checkoutAddress','checkoutRxDraft','checkoutPrescriptions'].forEach(k => sessionStorage.removeItem(k)); navigate('/dashboard/cart') }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Cart
          </button>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onSaved={handleAddressSaved}
        />
      )}
    </div>
  )
}
