import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

const COLOR_PALETTE = [
  { color: 'bg-blue-50 border-blue-200 text-blue-700', iconBg: 'bg-blue-100' },
  { color: 'bg-red-50 border-red-200 text-red-700', iconBg: 'bg-red-100' },
  { color: 'bg-green-50 border-green-200 text-green-700', iconBg: 'bg-green-100' },
  { color: 'bg-purple-50 border-purple-200 text-purple-700', iconBg: 'bg-purple-100' },
  { color: 'bg-rose-50 border-rose-200 text-rose-700', iconBg: 'bg-rose-100' },
  { color: 'bg-yellow-50 border-yellow-200 text-yellow-700', iconBg: 'bg-yellow-100' },
  { color: 'bg-orange-50 border-orange-200 text-orange-700', iconBg: 'bg-orange-100' },
  { color: 'bg-cyan-50 border-cyan-200 text-cyan-700', iconBg: 'bg-cyan-100' },
  { color: 'bg-indigo-50 border-indigo-200 text-indigo-700', iconBg: 'bg-indigo-100' },
  { color: 'bg-teal-50 border-teal-200 text-teal-700', iconBg: 'bg-teal-100' },
  { color: 'bg-violet-50 border-violet-200 text-violet-700', iconBg: 'bg-violet-100' },
  { color: 'bg-pink-50 border-pink-200 text-pink-700', iconBg: 'bg-pink-100' },
]

export default function Categories() {
  useEffect(() => { document.title = 'Categories — PharmaX' }, [])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories((res.data.data.categories || []).filter(c => c.isActive)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Medicine Categories</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Browse medicines by category</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-surface-variant mb-3" />
            <div className="h-4 bg-surface-variant rounded w-3/4 mb-2" />
            <div className="h-3 bg-surface-variant rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )

  if (categories.length === 0) return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Medicine Categories</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Browse medicines by category</p>
      </div>
      <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant">
        <span className="text-5xl">ðŸ"¦</span>
        <p className="text-sm font-medium">No categories available yet.</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Medicine Categories</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Browse medicines by category</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const palette = COLOR_PALETTE[i % COLOR_PALETTE.length]
          return (
            <Link
              key={cat.id}
              to={`/dashboard/medicines?category=${encodeURIComponent(cat.name)}`}
              className={`group bg-surface-container-lowest rounded-xl border shadow-card hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5 p-5 ${palette.color}`}
            >
              <div className={`w-12 h-12 rounded-xl ${palette.iconBg} flex items-center justify-center mb-3`}>
                {cat.icon && /^[a-z_]+$/.test(cat.icon)
                  ? <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                  : <span className="text-2xl">{cat.icon || '💊'}</span>
                }
              </div>
              <h3 className="text-sm font-semibold group-hover:underline">{cat.name}</h3>
              <p className="text-xs mt-1 opacity-70">{cat._count?.medicines ?? 0} medicines</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
