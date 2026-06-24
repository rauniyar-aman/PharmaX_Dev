import React from 'react'

export default function Input({ label, type = 'text', placeholder, icon, right, ...props }) {
  return (
    <label className="block text-sm text-on-surface-variant">
      <div className="mb-2 font-medium">{label}</div>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">{icon}</div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-surface-container bg-white px-4 py-3 text-sm text-on-surface placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${icon ? 'pl-12' : ''} ${right ? 'pr-14' : ''}`}
          {...props}
        />
        {right && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {right}
          </div>
        )}
      </div>
    </label>
  )
}
