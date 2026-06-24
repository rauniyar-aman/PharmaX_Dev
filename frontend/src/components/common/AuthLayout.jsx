import React from 'react'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 sm:px-6">
      {children}
    </div>
  )
}
