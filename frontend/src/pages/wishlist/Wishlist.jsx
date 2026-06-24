import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const initialWishlist = [
  { id: 1, name: 'Amoxicillin 500mg', brand: 'GlaxoSmithKline', category: 'ANTIBIOTICS', price: 180, originalPrice: 220, type: 'Rx', inStock: true, rating: 4.5, reviews: 124, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop' },
  { id: 2, name: 'Vitamin D3 1000 IU', brand: 'Abbott', category: 'VITAMINS', price: 320, originalPrice: 380, type: 'OTC', inStock: true, rating: 4.6, reviews: 256, img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop' },
  { id: 3, name: 'Insulin Glargine', brand: 'Sanofi', category: 'DIABETES CARE', price: 850, originalPrice: 950, type: 'Rx', inStock: false, rating: 4.7, reviews: 167, img: 'https://images.unsplash.com/photo-1618015359417-89b95d961c6b?w=400&h=300&fit=crop' },
  { id: 4, name: 'Omega-3 Fish Oil', brand: 'Nature Made', category: 'VITAMINS', price: 420, originalPrice: 500, type: 'OTC', inStock: true, rating: 4.8, reviews: 534, img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop' },
  { id: 5, name: 'Lisinopril 10mg', brand: 'Merck', category: 'CARDIAC HEALTH', price: 210, originalPrice: 260, type: 'Rx', inStock: true, rating: 4.3, reviews: 145, img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop' },
  { id: 6, name: 'Vitamin C 1000mg', brand: 'Himalaya', category: 'VITAMINS', price: 275, originalPrice: 320, type: 'OTC', inStock: true, rating: 4.9, reviews: 421, img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop' },
]

const categoryColors = {
  'ANTIBIOTICS': 'text-blue-600',
  'VITAMINS': 'text-green-600',
  'DIABETES CARE': 'text-purple-600',
  'CARDIAC HEALTH': 'text-rose-600',
}

export default function Wishlist() {
  const [items, setItems] = useState(initialWishlist)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [availFilter, setAvailFilter] = useState('')
  const [view, setView] = useState('grid')

  const removeFromWishlist = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const filtered = items.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter && i.category !== catFilter) return false
    if (availFilter === 'in-stock' && !i.inStock) return false
    if (availFilter === 'out-of-stock' && i.inStock) return false
    return true
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">My Wishlist</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{items.length} items saved</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
            Share List
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_shopping_cart</span>
            Add All to Cart
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl custom-shadow p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            type="text"
            placeholder="Search your wishlist..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:border-secondary transition"
          />
        </div>

        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-secondary transition min-w-[140px]">
          <option value="">All Categories</option>
          {[...new Set(items.map(i => i.category))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={availFilter} onChange={e => setAvailFilter(e.target.value)}
          className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-secondary transition min-w-[120px]">
          <option value="">Availability</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 ml-auto">
          <button onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white custom-shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
          </button>
          <button onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white custom-shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl custom-shadow text-center py-16">
          <span className="material-symbols-outlined ms-filled text-on-surface-variant" style={{ fontSize: '56px' }}>favorite_border</span>
          <p className="text-base font-semibold text-on-surface mt-3">Your wishlist is empty</p>
          <p className="text-sm text-on-surface-variant mt-1">Save medicines you love for later</p>
          <Link to="/dashboard/medicines" className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
            Browse Medicines
          </Link>
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filtered.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl custom-shadow overflow-hidden flex ${view === 'list' ? 'flex-row items-center' : 'flex-col'} group hover:-translate-y-0.5 transition-all duration-200`}>
              {/* Image */}
              <Link to={`/dashboard/medicines/${item.id}`} className={`relative block overflow-hidden flex-shrink-0 ${view === 'list' ? 'w-24 h-24' : 'w-full'}`}>
                <img src={item.img} alt={item.name} className={`object-cover group-hover:scale-105 transition-transform duration-300 ${view === 'list' ? 'w-24 h-24' : 'h-48 w-full'}`} />
                {/* Heart button */}
                <button
                  onClick={(e) => { e.preventDefault(); removeFromWishlist(item.id) }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                >
                  <span className="material-symbols-outlined ms-filled text-error" style={{ fontSize: '18px' }}>favorite</span>
                </button>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded-full">Out of Stock</span>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="p-4 flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${categoryColors[item.category] || 'text-on-surface-variant'}`}>{item.category}</p>
                <Link to={`/dashboard/medicines/${item.id}`} className="text-sm font-semibold text-on-surface hover:text-primary transition-colors leading-snug block">{item.name}</Link>

                <div className="flex items-center gap-1 mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`material-symbols-outlined ${i < Math.floor(item.rating) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '12px' }}>star</span>
                  ))}
                  <span className="text-xs text-on-surface-variant ml-1">({item.reviews})</span>
                </div>

                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-sm font-bold text-on-surface">NPR {item.price}</span>
                  <span className="text-xs text-on-surface-variant line-through">NPR {item.originalPrice}</span>
                </div>

                <div className={`flex gap-2 mt-3 ${view === 'list' ? 'flex-row' : ''}`}>
                  {item.inStock ? (
                    <button className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors">
                      Add to Cart
                    </button>
                  ) : (
                    <button className="flex-1 py-2 border border-outline-variant text-on-surface-variant rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors">
                      Notify Me
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
