import React from 'react'

export default function Logo({ size = 'lg' }) {
  return (
    <div className="inline-flex items-center">
      <img
        src="/PharmaX_Logo.png"
        alt="PharmaX"
        className={size === 'lg' ? 'h-16 w-auto' : 'h-10 w-auto'}
      />
    </div>
  )
}
