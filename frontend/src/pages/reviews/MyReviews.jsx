import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const reviewsData = [
  {
    id: 1,
    medicineName: 'Paracetamol 500mg',
    brand: 'Cipla',
    orderId: 'ORD-2024-003',
    expiryDate: 'Dec 2025',
    rating: 5,
    date: 'Jun 16, 2024',
    text: 'Excellent quality and fast delivery. The packaging was secure and the medicines were within expiry. Highly recommend PharmaX for genuine medicines.',
    helpful: 14,
    verified: true,
    img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop',
  },
  {
    id: 2,
    medicineName: 'Vitamin D3 1000 IU',
    brand: 'Abbott',
    orderId: 'ORD-2024-005',
    expiryDate: 'Mar 2026',
    rating: 4,
    date: 'Jun 10, 2024',
    text: 'Good product, delivered on time. The capsules are easy to swallow. Will definitely order again.',
    helpful: 8,
    verified: true,
    img: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=200&h=200&fit=crop',
  },
  {
    id: 3,
    medicineName: 'Omega-3 Fish Oil',
    brand: 'Nature Made',
    orderId: 'ORD-2024-004',
    expiryDate: 'Sep 2025',
    rating: 5,
    date: 'May 28, 2024',
    text: 'Great quality fish oil supplement. No fishy aftertaste which is a plus. Packaging was very professional.',
    helpful: 22,
    verified: true,
    img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=200&h=200&fit=crop',
  },
]

const ratingDist = [
  { stars: 5, pct: 85, count: 20 },
  { stars: 4, pct: 10, count: 3 },
  { stars: 3, pct: 3, count: 1 },
  { stars: 2, pct: 2, count: 0 },
  { stars: 1, pct: 0, count: 0 },
]

export default function MyReviews() {
  const [reviews, setReviews] = useState(reviewsData)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')

  const deleteReview = (id) => setReviews(prev => prev.filter(r => r.id !== id))

  const filtered = reviews.filter(r => {
    if (search && !r.medicineName.toLowerCase().includes(search.toLowerCase())) return false
    if (ratingFilter && r.rating !== parseInt(ratingFilter)) return false
    return true
  })

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">My Reviews</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Manage your product reviews</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
          Write a New Review
        </button>
      </div>

      {/* Overall Satisfaction + Rating Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Overall Score */}
        <div className="bg-white rounded-2xl custom-shadow p-6 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-black text-on-surface">{avgRating}</p>
          <div className="flex items-center gap-1 mt-2 justify-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`material-symbols-outlined ${i < Math.floor(avgRating) ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '22px' }}>star</span>
            ))}
          </div>
          <p className="text-sm font-semibold text-on-surface mt-2">Overall Patient Satisfaction</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Based on {reviews.length} reviews</p>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl custom-shadow p-5">
          <h3 className="text-sm font-semibold text-on-surface mb-3">Rating Distribution</h3>
          <div className="space-y-2.5">
            {ratingDist.map(r => (
              <div key={r.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 w-16 flex-shrink-0">
                  <span className="text-xs font-medium text-on-surface">{r.stars}</span>
                  <span className="material-symbols-outlined ms-filled text-amber-400" style={{ fontSize: '14px' }}>star</span>
                </div>
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <span className="text-xs text-on-surface-variant w-8 text-right flex-shrink-0">{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl custom-shadow p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-low focus:outline-none focus:border-secondary transition"
          />
        </div>
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
          className="text-sm border border-outline-variant rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-secondary transition min-w-[120px]">
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}★</option>)}
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-xl text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
          Filters
        </button>
        <span className="text-sm text-on-surface-variant ml-auto">{filtered.length} review{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {filtered.map(review => (
          <div key={review.id} className="bg-white rounded-2xl custom-shadow p-5">
            <div className="flex items-start gap-4">
              {/* Medicine Image */}
              <Link to={`/dashboard/medicines/${review.id}`} className="flex-shrink-0">
                <img src={review.img} alt={review.medicineName} className="w-16 h-16 rounded-xl object-cover" />
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <Link to={`/dashboard/medicines/${review.id}`} className="text-sm font-semibold text-on-surface hover:text-primary transition-colors">{review.medicineName}</Link>
                    <p className="text-xs text-on-surface-variant mt-0.5">{review.brand}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-on-surface-variant">Order: <span className="font-medium text-secondary">{review.orderId}</span></span>
                      <span className="text-xs text-on-surface-variant">Expires: {review.expiryDate}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                          <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '12px' }}>verified</span>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined ${i < review.rating ? 'ms-filled text-amber-400' : 'text-outline-variant'}`} style={{ fontSize: '16px' }}>star</span>
                      ))}
                    </div>
                    <span className="text-xs text-on-surface-variant">{review.date}</span>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mt-2.5 leading-relaxed">{review.text}</p>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <p className="text-xs text-on-surface-variant">{review.helpful} people found this helpful</p>
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/medicines/${review.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                      View Details
                    </Link>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-secondary/30 rounded-lg text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-error/30 rounded-lg text-xs font-medium text-error hover:bg-error/5 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl custom-shadow text-center py-14">
          <span className="material-symbols-outlined ms-filled text-on-surface-variant" style={{ fontSize: '48px' }}>rate_review</span>
          <p className="text-base font-semibold text-on-surface mt-3">No reviews found</p>
          <p className="text-sm text-on-surface-variant mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
