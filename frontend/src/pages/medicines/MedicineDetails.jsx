import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'

export default function MedicineDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [med, setMed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [cartLoading, setCartLoading] = useState(false)
  const [cartMsg, setCartMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/medicines/${id}`)
      .then(res => setMed(res.data.data.medicine))
      .catch(() => navigate('/dashboard/medicines', { replace: true }))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    setCartLoading(true)
    setCartMsg('')
    try {
      await api.post('/cart', { medicineId: med.id, quantity: qty })
      setCartMsg('Added to cart!')
      setTimeout(() => setCartMsg(''), 2500)
    } catch (err) {
      setCartMsg(err.response?.data?.message || 'Failed to add to cart.')
      setTimeout(() => setCartMsg(''), 2500)
    }
    setCartLoading(false)
  }

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'usage', label: 'Usage' },
    { key: 'sideEffects', label: 'Side Effects' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!med) return null

  const discount = med.originalPrice && Number(med.originalPrice) > Number(med.price)
    ? Math.round((1 - Number(med.price) / Number(med.originalPrice)) * 100)
    : 0

  const tabContent = {
    description: med.description || 'No description available.',
    dosage: med.dosage || 'No dosage information provided.',
    usage: med.usage || 'No usage instructions provided.',
    sideEffects: med.sideEffects || 'No side effects information provided.',
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to="/dashboard" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
        <Link to="/dashboard/medicines" className="hover:text-primary transition-colors">Medicines</Link>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
        <span className="text-on-surface font-medium">{med.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image */}
        <div className="bg-white rounded-2xl overflow-hidden custom-shadow flex items-center justify-center min-h-[280px]">
          {med.imageUrl ? (
            <img src={med.imageUrl} alt={med.name} className="w-full h-80 object-contain p-4" />
          ) : (
            <div className="flex flex-col items-center justify-center text-on-surface-variant gap-3 py-12">
              <span className="material-symbols-outlined text-7xl opacity-30">medication</span>
              <p className="text-sm">No image available</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{med.category?.name}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${med.type === 'Rx' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
              {med.type}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-on-surface">{med.name}</h1>
          <p className="text-sm text-on-surface-variant">
            {med.brand}
            {med.packageSize ? ` · ${med.packageSize}` : ''}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined ${i < Math.floor(Number(med.rating)) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`}
                  style={{ fontSize: '18px' }}
                >star</span>
              ))}
            </div>
            <span className="text-sm font-semibold text-on-surface">{Number(med.rating).toFixed(1)}</span>
            <span className="text-sm text-on-surface-variant">({med.totalReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface">NPR {Number(med.price).toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-base text-on-surface-variant line-through">NPR {Number(med.originalPrice).toLocaleString()}</span>
                <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined ms-filled ${med.inStock ? 'text-primary' : 'text-error'}`}
              style={{ fontSize: '18px' }}
            >{med.inStock ? 'check_circle' : 'cancel'}</span>
            <span className={`text-sm font-semibold ${med.inStock ? 'text-primary' : 'text-error'}`}>
              {med.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Rx Warning */}
          {med.type === 'Rx' && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <span className="material-symbols-outlined ms-filled text-amber-600 flex-shrink-0" style={{ fontSize: '20px' }}>warning</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Prescription Required:</strong> This medicine requires a valid doctor's prescription. Upload your prescription at checkout.
              </p>
            </div>
          )}

          {/* Qty Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-on-surface">Quantity:</span>
            <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-surface-container transition-colors text-on-surface">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
              </button>
              <span className="w-12 text-center text-sm font-semibold text-on-surface">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 hover:bg-surface-container transition-colors text-on-surface">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              </button>
            </div>
          </div>

          {/* Cart message */}
          {cartMsg && (
            <p className={`text-xs font-semibold px-3 py-2 rounded-lg ${cartMsg.includes('Added') ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
              {cartMsg}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!med.inStock || cartLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                med.inStock ? 'bg-primary text-white hover:bg-primary/90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_shopping_cart</span>
              {cartLoading ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              disabled={!med.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-colors ${
                med.inStock ? 'border-primary text-primary hover:bg-primary/5' : 'border-outline-variant text-on-surface-variant cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>flash_on</span>
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant">
            {med.manufacturer && (
              <div>
                <p className="text-xs text-on-surface-variant">Manufacturer</p>
                <p className="text-xs font-medium text-on-surface mt-0.5">{med.manufacturer}</p>
              </div>
            )}
            {med.packageSize && (
              <div>
                <p className="text-xs text-on-surface-variant">Package Size</p>
                <p className="text-xs font-medium text-on-surface mt-0.5">{med.packageSize}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Tabs */}
      <div className="bg-white rounded-2xl custom-shadow overflow-hidden">
        <div className="flex border-b border-outline-variant">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-secondary border-b-2 border-secondary bg-secondary/5'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          <p className="text-sm text-on-surface leading-relaxed">{tabContent[activeTab]}</p>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="bg-white rounded-2xl custom-shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-on-surface">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined ${i < Math.floor(Number(med.rating)) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '16px' }}>star</span>
              ))}
            </div>
            <span className="text-sm font-semibold text-on-surface">{Number(med.rating).toFixed(1)}/5</span>
          </div>
        </div>

        {med.reviews && med.reviews.length > 0 ? (
          <div className="space-y-4">
            {med.reviews.map((review, i) => (
              <div key={i} className="border-b border-outline-variant last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center text-sm font-bold">
                      {review.user?.fullName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{review.user?.fullName || 'Anonymous'}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className={`material-symbols-outlined ${j < review.rating ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '14px' }}>star</span>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-on-surface-variant mt-2.5 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl opacity-30">rate_review</span>
            <p className="text-sm">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>
    </div>
  )
}
