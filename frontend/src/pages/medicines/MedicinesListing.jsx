import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const medicines = [
  { id: 1, name: 'Amoxicillin 500mg', brand: 'GlaxoSmithKline', category: 'Antibiotics', price: 180, originalPrice: 220, type: 'Rx', rating: 4.5, reviews: 124, inStock: true, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop' },
  { id: 2, name: 'Paracetamol 500mg', brand: 'Cipla', category: 'Pain Relief', price: 45, originalPrice: 55, type: 'OTC', rating: 4.8, reviews: 389, inStock: true, img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop' },
  { id: 3, name: 'Vitamin D3 1000 IU', brand: 'Abbott', category: 'Vitamins', price: 320, originalPrice: 380, type: 'OTC', rating: 4.6, reviews: 256, inStock: true, img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop' },
  { id: 4, name: 'Metformin 500mg', brand: 'Sun Pharma', category: 'Diabetes Care', price: 95, originalPrice: 120, type: 'Rx', rating: 4.4, reviews: 178, inStock: true, img: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop' },
  { id: 5, name: 'Cetirizine 10mg', brand: 'Cipla', category: 'Cold & Flu', price: 35, originalPrice: 45, type: 'OTC', rating: 4.7, reviews: 312, inStock: true, img: 'https://images.unsplash.com/photo-1600451490099-e1a77bb3b4e3?w=400&h=300&fit=crop' },
  { id: 6, name: 'Omeprazole 20mg', brand: 'AstraZeneca', category: 'Digestive', price: 140, originalPrice: 175, type: 'Rx', rating: 4.5, reviews: 203, inStock: false, img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop' },
  { id: 7, name: 'Lisinopril 10mg', brand: 'Merck', category: 'Cardiac Health', price: 210, originalPrice: 260, type: 'Rx', rating: 4.3, reviews: 145, inStock: true, img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop' },
  { id: 8, name: 'Clotrimazole Cream 1%', brand: 'Bayer', category: 'Skin Care', price: 85, originalPrice: 100, type: 'OTC', rating: 4.6, reviews: 89, inStock: true, img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop' },
  { id: 9, name: 'Vitamin C 1000mg', brand: 'Himalaya', category: 'Vitamins', price: 275, originalPrice: 320, type: 'OTC', rating: 4.9, reviews: 421, inStock: true, img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop' },
  { id: 10, name: 'Aspirin 75mg', brand: 'Bayer', category: 'Cardiac Health', price: 60, originalPrice: 80, type: 'OTC', rating: 4.5, reviews: 298, inStock: true, img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=300&fit=crop' },
  { id: 11, name: 'Insulin Glargine', brand: 'Sanofi', category: 'Diabetes Care', price: 850, originalPrice: 950, type: 'Rx', rating: 4.7, reviews: 167, inStock: false, img: 'https://images.unsplash.com/photo-1618015359417-89b95d961c6b?w=400&h=300&fit=crop' },
  { id: 12, name: 'Omega-3 Fish Oil', brand: 'Nature Made', category: 'Vitamins', price: 420, originalPrice: 500, type: 'OTC', rating: 4.8, reviews: 534, inStock: true, img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop' },
]

const categoryColors = {
  'Antibiotics': 'text-blue-600',
  'Pain Relief': 'text-red-600',
  'Vitamins': 'text-green-600',
  'Diabetes Care': 'text-purple-600',
  'Cold & Flu': 'text-cyan-600',
  'Digestive': 'text-orange-600',
  'Cardiac Health': 'text-rose-600',
  'Skin Care': 'text-yellow-600',
}

const ITEMS_PER_PAGE = 8

export default function MedicinesListing() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [availability, setAvailability] = useState('')
  const [rating, setRating] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [wishlist, setWishlist] = useState([])
  const [page, setPage] = useState(1)

  const toggleWishlist = (id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const filtered = medicines.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.brand.toLowerCase().includes(search.toLowerCase())) return false
    if (category && m.category !== category) return false
    if (priceRange === 'under-100' && m.price >= 100) return false
    if (priceRange === '100-300' && (m.price < 100 || m.price > 300)) return false
    if (priceRange === 'over-300' && m.price <= 300) return false
    if (availability === 'in-stock' && !m.inStock) return false
    if (availability === 'out-of-stock' && m.inStock) return false
    if (rating && m.rating < parseInt(rating)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'newest') return b.id - a.id
    return b.reviews - a.reviews
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-5">
      {/* Rx / OTC Info Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <span className="material-symbols-outlined ms-filled text-primary mt-0.5" style={{ fontSize: '22px' }}>medical_services</span>
          <div>
            <p className="text-sm font-semibold text-primary">Prescription Required (Rx)</p>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">These medicines require a valid doctor's prescription. Upload your prescription at checkout.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-secondary/5 border border-secondary/20 rounded-2xl p-4">
          <span className="material-symbols-outlined ms-filled text-secondary mt-0.5" style={{ fontSize: '22px' }}>local_pharmacy</span>
          <div>
            <p className="text-sm font-semibold text-secondary">Over the Counter (OTC)</p>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">These medicines can be purchased without a prescription and are available for immediate checkout.</p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl p-4 custom-shadow space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
          <input
            type="text"
            placeholder="Search medicines by name or brand..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
            className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-white text-on-surface focus:outline-none focus:border-secondary transition min-w-[140px]">
            <option value="">All Categories</option>
            {[...new Set(medicines.map(m => m.category))].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={priceRange} onChange={e => { setPriceRange(e.target.value); setPage(1) }}
            className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-white text-on-surface focus:outline-none focus:border-secondary transition min-w-[130px]">
            <option value="">All Prices</option>
            <option value="under-100">Under NPR 100</option>
            <option value="100-300">NPR 100–300</option>
            <option value="over-300">Over NPR 300</option>
          </select>
          <select value={availability} onChange={e => { setAvailability(e.target.value); setPage(1) }}
            className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-white text-on-surface focus:outline-none focus:border-secondary transition min-w-[130px]">
            <option value="">Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
          <select value={rating} onChange={e => { setRating(e.target.value); setPage(1) }}
            className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-white text-on-surface focus:outline-none focus:border-secondary transition min-w-[120px]">
            <option value="">All Ratings</option>
            <option value="4">4★ & above</option>
            <option value="3">3★ & above</option>
          </select>

          <div className="ml-auto flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
            {[
              { val: 'popular', label: 'Popularity' },
              { val: 'price-asc', label: 'Price ↑' },
              { val: 'newest', label: 'Newest' },
            ].map(opt => (
              <button key={opt.val} onClick={() => setSortBy(opt.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === opt.val ? 'bg-white text-on-surface custom-shadow' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {opt.label}
              </button>
            ))}
          </div>

          <span className="text-sm text-on-surface-variant">{sorted.length} results</span>
        </div>
      </div>

      {/* Medicine Grid */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-2xl custom-shadow text-center py-16">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>search_off</span>
          <p className="text-base font-medium text-on-surface mt-3">No medicines found</p>
          <p className="text-sm text-on-surface-variant mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map(med => (
            <div key={med.id} className="bg-white rounded-2xl overflow-hidden custom-shadow hover:-translate-y-1 transition-all duration-200 flex flex-col group">
              {/* Image */}
              <Link to={`/dashboard/medicines/${med.id}`} className="relative block overflow-hidden">
                <img
                  src={med.img}
                  alt={med.name}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Type badge */}
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                  med.type === 'Rx' ? 'bg-primary text-white' : 'bg-secondary text-white'
                }`}>
                  {med.type}
                </span>
                {/* Wishlist btn */}
                <button
                  onClick={(e) => { e.preventDefault(); toggleWishlist(med.id) }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                >
                  <span className={`material-symbols-outlined ${wishlist.includes(med.id) ? 'ms-filled text-error' : 'text-on-surface-variant'}`} style={{ fontSize: '18px' }}>favorite</span>
                </button>
                {/* Out of stock overlay */}
                {!med.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-error text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${categoryColors[med.category] || 'text-on-surface-variant'}`}>{med.category}</p>
                <Link to={`/dashboard/medicines/${med.id}`} className="text-sm font-semibold text-on-surface hover:text-primary transition-colors leading-snug">{med.name}</Link>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined ${i < Math.floor(med.rating) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '14px' }}>star</span>
                  ))}
                  <span className="text-xs text-on-surface-variant ml-1">({med.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-base font-bold text-on-surface">NPR {med.price}</span>
                  <span className="text-xs text-on-surface-variant line-through">NPR {med.originalPrice}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-outline-variant">
                  <Link
                    to={`/dashboard/medicines/${med.id}`}
                    className="flex-1 py-2 border border-outline-variant rounded-xl text-sm font-medium text-on-surface text-center hover:border-primary hover:text-primary transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    disabled={!med.inStock}
                    className={`px-3 py-2 rounded-xl transition-colors flex items-center justify-center ${
                      med.inStock ? 'bg-primary text-white hover:bg-primary/90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                    }`}
                    title={med.inStock ? 'Add to Cart' : 'Notify Me'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{med.inStock ? 'add_shopping_cart' : 'notifications'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
        </div>
      )}
    </div>
  )
}
