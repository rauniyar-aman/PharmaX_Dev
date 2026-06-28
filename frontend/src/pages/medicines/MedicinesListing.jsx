import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const ITEMS_PER_PAGE = 8

const categoryColors = {
  Antibiotics: 'text-blue-600',
  'Pain Relief': 'text-red-600',
  Vitamins: 'text-green-600',
  'Diabetes Care': 'text-purple-600',
  'Cold & Flu': 'text-cyan-600',
  Digestive: 'text-orange-600',
  'Cardiac Health': 'text-rose-600',
  'Skin Care': 'text-yellow-600',
}

function MedicineSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden custom-shadow animate-pulse">
      <div className="h-48 bg-surface-container" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-surface-container rounded w-1/3" />
        <div className="h-4 bg-surface-container rounded w-3/4" />
        <div className="h-3 bg-surface-container rounded w-1/2" />
        <div className="h-8 bg-surface-container rounded mt-3" />
      </div>
    </div>
  )
}

export default function MedicinesListing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { refreshCart } = useCart()
  const [searchParams] = useSearchParams()

  const [medicines, setMedicines] = useState([])
  const [categories, setCategories] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartLoading, setCartLoading] = useState({})
  const [wishlist, setWishlist] = useState([])

  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [category, setCategory] = useState(() => searchParams.get('category') || '')
  const [priceRange, setPriceRange] = useState('')
  const [availability, setAvailability] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data.data.categories || []))
      .catch(() => {})
  }, [])

  const fetchMedicines = useCallback(() => {
    setLoading(true)
    setError('')

    const params = { sortBy, page, limit: ITEMS_PER_PAGE }
    if (search) params.search = search
    if (category) params.category = category
    if (priceRange === 'under-100') params.maxPrice = 99
    if (priceRange === '100-300') { params.minPrice = 100; params.maxPrice = 300 }
    if (priceRange === 'over-300') params.minPrice = 301
    if (availability === 'in-stock') params.inStock = 'true'
    if (availability === 'out-of-stock') params.inStock = 'false'

    api.get('/medicines', { params })
      .then(res => {
        const { medicines: list, pagination } = res.data.data
        setMedicines(list || [])
        setTotalResults(pagination?.total || 0)
      })
      .catch(() => setError('Failed to load medicines. Please try again.'))
      .finally(() => setLoading(false))
  }, [search, category, priceRange, availability, sortBy, page])

  useEffect(() => { fetchMedicines() }, [fetchMedicines])

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const addToCart = async (medicineId) => {
    if (!isAuthenticated) { navigate('/signin'); return }
    setCartLoading(prev => ({ ...prev, [medicineId]: true }))
    try {
      await api.post('/cart/items', { medicineId, quantity: 1 })
      refreshCart()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart.')
    } finally {
      setCartLoading(prev => ({ ...prev, [medicineId]: false }))
    }
  }

  const toggleWishlist = async (medicineId) => {
    if (!isAuthenticated) { navigate('/signin'); return }
    const inWishlist = wishlist.includes(medicineId)
    setWishlist(prev => inWishlist ? prev.filter(id => id !== medicineId) : [...prev, medicineId])
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${medicineId}`)
      } else {
        await api.post(`/wishlist/${medicineId}`)
      }
    } catch {
      setWishlist(prev => inWishlist ? [...prev, medicineId] : prev.filter(id => id !== medicineId))
    }
  }

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)

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
      <div className="bg-surface-container-lowest rounded-2xl p-4 custom-shadow space-y-3">
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

        <div className="flex flex-wrap gap-2 items-center">
          <select value={category} onChange={handleFilterChange(setCategory)}
            className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary transition min-w-[140px]">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select value={priceRange} onChange={handleFilterChange(setPriceRange)}
            className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary transition min-w-[130px]">
            <option value="">All Prices</option>
            <option value="under-100">Under NPR 100</option>
            <option value="100-300">NPR 100â€"300</option>
            <option value="over-300">Over NPR 300</option>
          </select>

          <select value={availability} onChange={handleFilterChange(setAvailability)}
            className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary transition min-w-[130px]">
            <option value="">Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <div className="ml-auto flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
            {[
              { val: 'popular', label: 'Popularity' },
              { val: 'price-asc', label: 'Low to High' },
              { val: 'newest', label: 'Newest' },
            ].map(opt => (
              <button key={opt.val} onClick={() => { setSortBy(opt.val); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === opt.val ? 'bg-surface-container-lowest text-on-surface custom-shadow' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {opt.label}
              </button>
            ))}
          </div>

          <span className="text-sm text-on-surface-variant">{totalResults} results</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-surface-container-lowest rounded-2xl custom-shadow text-center py-12">
          <span className="material-symbols-outlined text-error" style={{ fontSize: '48px' }}>error_outline</span>
          <p className="text-base font-medium text-on-surface mt-3">{error}</p>
          <button onClick={fetchMedicines} className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <MedicineSkeleton key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && medicines.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl custom-shadow text-center py-16">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>search_off</span>
          <p className="text-base font-medium text-on-surface mt-3">No medicines found</p>
          <p className="text-sm text-on-surface-variant mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Medicine Grid */}
      {!loading && !error && medicines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {medicines.map(med => {
            const isRx = med.type === 'Rx'
            const typeLabel = isRx ? 'Rx' : 'OTC'
            const catName = med.category?.name || ''
            return (
              <div key={med.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden custom-shadow hover:-translate-y-1 transition-all duration-200 flex flex-col group">
                <Link to={`/dashboard/medicines/${med.id}`} className="relative block overflow-hidden">
                  {med.imageUrl ? (
                    <img
                      src={med.imageUrl}
                      alt={med.name}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-48 w-full bg-surface-container-low flex flex-col items-center justify-center gap-2 text-on-surface-variant group-hover:bg-surface-container transition-colors duration-300">
                      <span className="material-symbols-outlined text-5xl opacity-30">medication</span>
                      <span className="text-xs opacity-40">No image</span>
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${isRx ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                    {typeLabel}
                  </span>
                  <button
                    onClick={e => { e.preventDefault(); toggleWishlist(med.id) }}
                    className="absolute top-3 right-3 w-8 h-8 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    <span className={`material-symbols-outlined ${wishlist.includes(med.id) ? 'ms-filled text-error' : 'text-on-surface-variant'}`} style={{ fontSize: '18px' }}>favorite</span>
                  </button>
                  {!med.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-error text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                    </div>
                  )}
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${categoryColors[catName] || 'text-on-surface-variant'}`}>{catName}</p>
                  <Link to={`/dashboard/medicines/${med.id}`} className="text-sm font-semibold text-on-surface hover:text-primary transition-colors leading-snug">{med.name}</Link>

                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`material-symbols-outlined ${i < Math.floor(med.rating || 0) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '14px' }}>star</span>
                    ))}
                    <span className="text-xs text-on-surface-variant ml-1">({med.totalReviews || 0})</span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-bold text-on-surface">NPR {Number(med.price).toFixed(0)}</span>
                    {med.originalPrice && med.originalPrice > med.price && (
                      <span className="text-xs text-on-surface-variant line-through">NPR {Number(med.originalPrice).toFixed(0)}</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-outline-variant">
                    <Link
                      to={`/dashboard/medicines/${med.id}`}
                      className="flex-1 py-2 border border-outline-variant rounded-xl text-sm font-medium text-on-surface text-center hover:border-primary hover:text-primary transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      disabled={!med.inStock || cartLoading[med.id]}
                      onClick={() => addToCart(med.id)}
                      className={`px-3 py-2 rounded-xl transition-colors flex items-center justify-center ${
                        med.inStock ? 'bg-primary text-white hover:bg-primary/90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                      } disabled:opacity-60`}
                      title={med.inStock ? 'Add to Cart' : 'Out of Stock'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {cartLoading[med.id] ? 'hourglass_empty' : med.inStock ? 'add_shopping_cart' : 'notifications'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
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
