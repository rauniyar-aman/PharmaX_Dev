import React from 'react'
import { Link } from 'react-router-dom'

const categories = [
  { name: 'Antibiotics', count: 45, icon: '🦠', color: 'bg-blue-50 border-blue-200 text-blue-700', iconBg: 'bg-blue-100' },
  { name: 'Pain Relief', count: 38, icon: '💊', color: 'bg-red-50 border-red-200 text-red-700', iconBg: 'bg-red-100' },
  { name: 'Vitamins & Supplements', count: 62, icon: '🌿', color: 'bg-green-50 border-green-200 text-green-700', iconBg: 'bg-green-100' },
  { name: 'Diabetes Care', count: 29, icon: '💉', color: 'bg-purple-50 border-purple-200 text-purple-700', iconBg: 'bg-purple-100' },
  { name: 'Cardiac Health', count: 34, icon: '❤️', color: 'bg-rose-50 border-rose-200 text-rose-700', iconBg: 'bg-rose-100' },
  { name: 'Skin Care', count: 51, icon: '✨', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', iconBg: 'bg-yellow-100' },
  { name: 'Digestive Health', count: 27, icon: '🫁', color: 'bg-orange-50 border-orange-200 text-orange-700', iconBg: 'bg-orange-100' },
  { name: 'Cold & Flu', count: 32, icon: '🤧', color: 'bg-cyan-50 border-cyan-200 text-cyan-700', iconBg: 'bg-cyan-100' },
  { name: 'Eye Care', count: 18, icon: '👁️', color: 'bg-indigo-50 border-indigo-200 text-indigo-700', iconBg: 'bg-indigo-100' },
  { name: 'Respiratory', count: 23, icon: '🌬️', color: 'bg-teal-50 border-teal-200 text-teal-700', iconBg: 'bg-teal-100' },
  { name: 'Mental Health', count: 15, icon: '🧠', color: 'bg-violet-50 border-violet-200 text-violet-700', iconBg: 'bg-violet-100' },
  { name: 'Baby & Child Care', count: 41, icon: '👶', color: 'bg-pink-50 border-pink-200 text-pink-700', iconBg: 'bg-pink-100' },
]

export default function Categories() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Medicine Categories</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Browse medicines by category</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.name}
            to={`/dashboard/medicines`}
            className={`group bg-white rounded-xl border shadow-card hover:shadow-card-md transition-all duration-200 hover:-translate-y-0.5 p-5 ${cat.color}`}
          >
            <div className={`w-12 h-12 rounded-xl ${cat.iconBg} flex items-center justify-center text-2xl mb-3`}>
              {cat.icon}
            </div>
            <h3 className="text-sm font-semibold group-hover:underline">{cat.name}</h3>
            <p className="text-xs mt-1 opacity-70">{cat.count} medicines</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
