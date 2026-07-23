import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${BACKEND}${url}`
}

function Stars({ value, hover, onHover, onLeave, onClick, size = 18, readOnly = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onMouseEnter={() => !readOnly && onHover?.(star)}
          onMouseLeave={() => !readOnly && onLeave?.()}
          onClick={() => !readOnly && onClick?.(star)}
          className={readOnly ? 'cursor-default' : 'transition-transform hover:scale-110'}>
          <span className={`material-symbols-outlined ${(hover || value) >= star ? 'text-amber-400' : 'text-outline-variant'}`}
            style={{ fontSize: `${size}px`, fontVariationSettings: (hover || value) >= star ? "'FILL' 1" : "'FILL' 0" }}>star</span>
        </button>
      ))}
    </div>
  )
}

export default function MyReviews() {
  const [reviews, setReviews]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [editId, setEditId]         = useState(null)
  const [editRating, setEditRating] = useState(0)
  const [editHover, setEditHover]   = useState(0)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(null)

  useEffect(() => {
    api.get('/medicines/my-reviews')
      .then(res => setReviews(res.data.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])

  const openEdit = (review) => {
    setEditId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment || '')
    setEditHover(0)
  }

  const cancelEdit = () => { setEditId(null); setEditRating(0); setEditHover(0); setEditComment('') }

  const submitEdit = async (review) => {
    if (!editRating) return
    setSaving(true)
    try {
      await api.put(`/medicines/${review.medicine.id}/reviews`, { rating: editRating, comment: editComment })
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, rating: editRating, comment: editComment } : r))
      cancelEdit()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (review) => {
    if (!confirm(`Delete your review for ${review.medicine?.name}?`)) return
    setDeleting(review.id)
    try {
      await api.delete(`/medicines/${review.medicine.id}/reviews`)
      setReviews(prev => prev.filter(r => r.id !== review.id))
    } catch {}
    setDeleting(null)
  }

  const filtered = reviews.filter(r => {
    if (search && !r.medicine?.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (ratingFilter && r.rating !== parseInt(ratingFilter)) return false
    return true
  })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const dist = [5,4,3,2,1].map(star => {
    const count = reviews.filter(r => r.rating === star).length
    return { star, count, pct: reviews.length ? Math.round(count / reviews.length * 100) : 0 }
  })

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface-container rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-4"><div className="h-32 bg-surface-container-lowest rounded-2xl" /><div className="h-32 bg-surface-container-lowest rounded-2xl" /></div>
        {[1,2,3].map(i => <div key={i} className="h-28 bg-surface-container-lowest rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">My Reviews</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Reviews you've written for medicines you purchased</p>
      </div>

      {reviews.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-6 flex flex-col items-center justify-center text-center">
              <p className="text-5xl font-black text-on-surface">{avgRating}</p>
              <Stars value={Math.floor(parseFloat(avgRating))} readOnly size={22} />
              <p className="text-sm font-semibold text-on-surface mt-2">Your Average Rating</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
              <h3 className="text-sm font-semibold text-on-surface mb-3">Rating Breakdown</h3>
              <div className="space-y-2.5">
                {dist.map(d => (
                  <div key={d.star} className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 w-14 flex-shrink-0">
                      <span className="text-xs font-medium text-on-surface">{d.star}</span>
                      <span className="material-symbols-outlined ms-filled text-amber-400" style={{ fontSize: '13px' }}>star</span>
                    </div>
                    <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${d.pct}%` }} />
                    </div>
                    <span className="text-xs text-on-surface-variant w-8 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
              <input type="text" placeholder="Search by medicine name…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:border-secondary" />
            </div>
            <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
              className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-surface-container-lowest focus:outline-none min-w-[130px]">
              <option value="">All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
            </select>
            <span className="text-sm text-on-surface-variant ml-auto">{filtered.length} review{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl custom-shadow text-center py-16">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>rate_review</span>
          <p className="text-base font-semibold text-on-surface mt-3">{reviews.length === 0 ? 'No reviews yet' : 'No reviews match'}</p>
          <p className="text-sm text-on-surface-variant mt-1">
            {reviews.length === 0
              ? 'After your order is delivered, you can rate medicines from the order detail page.'
              : 'Try adjusting your search or filter.'}
          </p>
          {reviews.length === 0 && (
            <Link to="/dashboard/orders" className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
              View Orders
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => {
            const med    = review.medicine || {}
            const imgSrc = resolveImg(med.imageUrl)
            const isEditing = editId === review.id
            return (
              <div key={review.id} className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center border border-outline-variant">
                    {imgSrc
                      ? <img src={imgSrc} alt={med.name} className="w-full h-full object-cover" />
                      : <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '26px' }}>medication</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <Link to={`/dashboard/medicines/${med.id}`} className="text-sm font-semibold text-on-surface hover:text-primary transition-colors">{med.name}</Link>
                        <p className="text-xs text-on-surface-variant mt-0.5">{med.brand}</p>
                      </div>
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Stars value={review.rating} readOnly size={16} />
                          <span className="text-xs text-on-surface-variant">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <Stars value={editRating} hover={editHover}
                            onHover={setEditHover} onLeave={() => setEditHover(0)} onClick={setEditRating} size={24} />
                          {editRating > 0 && <span className="text-xs text-on-surface-variant">{['','Poor','Fair','Good','Very Good','Excellent'][editRating]}</span>}
                        </div>
                        <textarea value={editComment} onChange={e => setEditComment(e.target.value)}
                          placeholder="Update your review (optional)…"
                          className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm resize-none bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-secondary"
                          rows={3} />
                        <div className="flex gap-2">
                          <button onClick={() => submitEdit(review)} disabled={!editRating || saving}
                            className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50">
                            {saving ? 'Saving…' : 'Save Changes'}
                          </button>
                          <button onClick={cancelEdit}
                            className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {review.comment && (
                          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{review.comment}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Link to={`/dashboard/medicines/${med.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>open_in_new</span>
                            View Medicine
                          </Link>
                          <button onClick={() => openEdit(review)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-secondary/30 rounded-lg text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>edit</span>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(review)} disabled={deleting === review.id}
                            className="flex items-center gap-1 px-3 py-1.5 border border-error/30 rounded-lg text-xs font-medium text-error hover:bg-error/5 transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>delete</span>
                            {deleting === review.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </>
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
