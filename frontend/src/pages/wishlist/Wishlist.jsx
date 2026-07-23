import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

export default function Wishlist() {
  useEffect(() => { document.title = 'Wishlist — PharmaX' }, [])
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [removing, setRemoving] = useState({})
  const [addingToCart, setAddingToCart] = useState({})
  const [toast, setToast]       = useState(null)
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [availFilter, setAvailFilter] = useState('')
  const [view, setView] = useState('grid')

  useEffect(() => {
    api.get('/wishlist')
      .then(res => setItems(res.data.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleRemove = async (e, medicineId) => {
    e.preventDefault()
    setRemoving(r => ({ ...r, [medicineId]: true }))
    try {
      await api.delete(`/wishlist/${medicineId}`)
      setItems(prev => prev.filter(i => i.medicineId !== medicineId))
    } catch {}
    finally { setRemoving(r => ({ ...r, [medicineId]: false })) }
  }

  const handleAddToCart = async (medicineId, medicineName) => {
    setAddingToCart(a => ({ ...a, [medicineId]: true }))
    try {
      await api.post('/cart/items', { medicineId, quantity: 1 })
      showToast(`${medicineName} added to cart`)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not add to cart', 'error')
    }
    finally { setAddingToCart(a => ({ ...a, [medicineId]: false })) }
  }

  const categories = [...new Set(items.map(i => i.medicine?.category?.name).filter(Boolean))]

  const filtered = items.filter(i => {
    const med = i.medicine
    if (!med) return false
    if (search && !med.name.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter && med.category?.name !== catFilter) return false
    if (availFilter === 'in-stock'     && !med.inStock) return false
    if (availFilter === 'out-of-stock' &&  med.inStock) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 bg-surface-container rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl custom-shadow overflow-hidden animate-pulse">
              <div className="h-48 bg-surface-container" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-surface-container rounded w-2/3" />
                <div className="h-4 bg-surface-container rounded" />
                <div className="h-8 bg-surface-container rounded-xl mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
          toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
        }`}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">My Wishlist</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
            Share List
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input type="text" placeholder="Search your wishlist..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:border-secondary transition" />
        </div>

        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-secondary transition min-w-[140px]">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={availFilter} onChange={e => setAvailFilter(e.target.value)}
          className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest focus:outline-none focus:border-secondary transition min-w-[120px]">
          <option value="">Availability</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>

        <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 ml-auto">
          <button onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-surface-container-lowest custom-shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
          </button>
          <button onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-surface-container-lowest custom-shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl custom-shadow text-center py-16">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '56px' }}>favorite_border</span>
          <p className="text-base font-semibold text-on-surface mt-3">
            {items.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            {items.length === 0 ? 'Save medicines you love for later' : 'Try clearing your search or filters'}
          </p>
          {items.length === 0 && (
            <Link to="/dashboard/medicines" className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Browse Medicines
            </Link>
          )}
        </div>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
          {filtered.map(item => {
            const med = item.medicine
            const isRemoving = removing[item.medicineId]
            return (
              <div key={item.id}
                className={`bg-surface-container-lowest rounded-2xl custom-shadow overflow-hidden flex ${view === 'list' ? 'flex-row items-center' : 'flex-col'} group hover:-translate-y-0.5 transition-all duration-200`}>

                <Link to={`/dashboard/medicines/${med.id}`}
                  className={`relative block overflow-hidden flex-shrink-0 ${view === 'list' ? 'w-24 h-24' : 'w-full'}`}>
                  {med.imageUrl
                    ? <img src={med.imageUrl} alt={med.name}
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${view === 'list' ? 'w-24 h-24' : 'h-48 w-full'}`} />
                    : <div className={`bg-surface-container flex items-center justify-center ${view === 'list' ? 'w-24 h-24' : 'h-48 w-full'}`}>
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '40px' }}>medication</span>
                      </div>
                  }

                  <button
                    onClick={e => handleRemove(e, item.medicineId)}
                    disabled={isRemoving}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm hover:scale-110 disabled:opacity-60 transition-transform"
                  >
                    {isRemoving
                      ? <span className="material-symbols-outlined text-on-surface-variant animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                      : <span className="material-symbols-outlined text-error" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    }
                  </button>

                  {!med.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded-full">Out of Stock</span>
                    </div>
                  )}
                </Link>

                <div className="p-4 flex-1 min-w-0">
                  {med.category?.name && (
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{med.category.name}</p>
                  )}
                  <Link to={`/dashboard/medicines/${med.id}`}
                    className="text-sm font-semibold text-on-surface hover:text-primary transition-colors leading-snug block line-clamp-2">
                    {med.name}
                  </Link>
                  {med.brand && <p className="text-xs text-on-surface-variant mt-0.5">{med.brand}</p>}

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-on-surface">NPR {Number(med.price).toFixed(0)}</span>
                    {med.originalPrice && med.originalPrice > med.price && (
                      <span className="text-xs text-on-surface-variant line-through">NPR {Number(med.originalPrice).toFixed(0)}</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    {med.inStock ? (
                      <button
                        onClick={() => handleAddToCart(med.id, med.name)}
                        disabled={addingToCart[med.id]}
                        className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {addingToCart[med.id]
                          ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>progress_activity</span> Adding…</>
                          : <><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_shopping_cart</span> Add to Cart</>
                        }
                      </button>
                    ) : (
                      <button className="flex-1 py-2 border border-outline-variant text-on-surface-variant rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors">
                        Notify Me
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
