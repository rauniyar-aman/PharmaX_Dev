import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const medicineData = {
  1: {
    id: 1,
    name: 'Amoxicillin 500mg',
    brand: 'GlaxoSmithKline',
    category: 'ANTIBIOTICS',
    price: 180,
    originalPrice: 220,
    type: 'Rx',
    rating: 4.5,
    reviews: 124,
    inStock: true,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=450&fit=crop',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&h=450&fit=crop',
      'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&h=450&fit=crop',
    ],
    description: 'Amoxicillin 500mg is a broad-spectrum penicillin antibiotic used to treat a number of bacterial infections. It is effective against both gram-positive and some gram-negative bacteria. Commonly prescribed for throat, ear, urinary tract, and respiratory infections.',
    dosage: 'Adults: 250–500mg every 8 hours or 500–875mg every 12 hours. Children: 25–45mg/kg/day in divided doses. Always complete the full prescribed course. Do not stop early even if symptoms improve.',
    usage: 'Take orally with or without food. Complete the full prescribed course even if symptoms improve. Do not crush or chew capsules. Store at room temperature away from moisture and heat. Take at evenly spaced intervals.',
    sideEffects: 'Common: Diarrhea, nausea, vomiting, skin rash. Serious (seek medical attention immediately): Severe allergic reactions (anaphylaxis), severe diarrhea (C. difficile), liver problems, blood disorders. Inform your doctor of all allergies.',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd.',
    packageSize: '10 Capsules/Strip',
  }
}

const defaultMed = medicineData[1]

const reviews = [
  { name: 'Priya S.', rating: 5, date: 'Jun 15, 2024', text: 'Very effective. Cleared up my throat infection within 3 days. No side effects at all.', helpful: 12 },
  { name: 'Raj K.', rating: 4, date: 'May 28, 2024', text: 'Good medicine, fast delivery. Packaging was intact. Works as expected.', helpful: 8 },
  { name: 'Anita M.', rating: 5, date: 'May 10, 2024', text: 'Prescribed by my doctor and it worked great. Will order again if needed.', helpful: 6 },
]

export default function MedicineDetails() {
  const { id } = useParams()
  const med = medicineData[id] || defaultMed

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [wishlist, setWishlist] = useState(false)

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'usage', label: 'Usage' },
    { key: 'sideEffects', label: 'Side Effects' },
  ]

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
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl overflow-hidden custom-shadow">
            <img src={med.images[activeImg]} alt={med.name} className="w-full h-80 object-cover" />
          </div>
          <div className="flex gap-2">
            {med.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-secondary' : 'border-outline-variant hover:border-secondary/40'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{med.category}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${med.type === 'Rx' ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>{med.type}</span>
          </div>

          <h1 className="text-2xl font-bold text-on-surface">{med.name}</h1>
          <p className="text-sm text-on-surface-variant">{med.brand} · {med.packageSize}</p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined ${i < Math.floor(med.rating) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '18px' }}>star</span>
              ))}
            </div>
            <span className="text-sm font-semibold text-on-surface">{med.rating}</span>
            <span className="text-sm text-on-surface-variant">({med.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface">NPR {med.price}</span>
            <span className="text-base text-on-surface-variant line-through">NPR {med.originalPrice}</span>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {Math.round((1 - med.price / med.originalPrice) * 100)}% OFF
            </span>
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined ms-filled ${med.inStock ? 'text-primary' : 'text-error'}`} style={{ fontSize: '18px' }}>{med.inStock ? 'check_circle' : 'cancel'}</span>
            <span className={`text-sm font-semibold ${med.inStock ? 'text-primary' : 'text-error'}`}>{med.inStock ? 'In Stock' : 'Out of Stock'}</span>
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              disabled={!med.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                med.inStock ? 'bg-primary text-white hover:bg-primary/90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_shopping_cart</span>
              Add to Cart
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

          <button
            onClick={() => setWishlist(w => !w)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm border transition-colors ${
              wishlist ? 'border-error/30 bg-error/5 text-error' : 'border-outline-variant text-on-surface-variant hover:border-error/30 hover:text-error'
            }`}
          >
            <span className={`material-symbols-outlined ${wishlist ? 'ms-filled text-error' : ''}`} style={{ fontSize: '18px' }}>favorite</span>
            {wishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </button>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant">
            <div>
              <p className="text-xs text-on-surface-variant">Manufacturer</p>
              <p className="text-xs font-medium text-on-surface mt-0.5">{med.manufacturer}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Package Size</p>
              <p className="text-xs font-medium text-on-surface mt-0.5">{med.packageSize}</p>
            </div>
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
          <p className="text-sm text-on-surface leading-relaxed">{med[activeTab]}</p>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="bg-white rounded-2xl custom-shadow p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-on-surface">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined ${i < Math.floor(med.rating) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '16px' }}>star</span>
              ))}
            </div>
            <span className="text-sm font-semibold text-on-surface">{med.rating}/5</span>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="border-b border-outline-variant last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center text-sm font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{review.name}</p>
                    <p className="text-xs text-on-surface-variant">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className={`material-symbols-outlined ${j < review.rating ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '14px' }}>star</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mt-2.5 leading-relaxed">{review.text}</p>
              <p className="text-xs text-on-surface-variant mt-2">{review.helpful} people found this helpful</p>
            </div>
          ))}
        </div>

        <button className="mt-4 w-full py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
          Load More Reviews
        </button>
      </div>
    </div>
  )
}
