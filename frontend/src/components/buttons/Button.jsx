import React from 'react'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-3xl px-5 py-4 font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-container focus:ring-primary/40',
    secondary: 'bg-surface text-on-surface border border-surface-container hover:bg-surface-container focus:ring-secondary/20',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary/20'
  }

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}
