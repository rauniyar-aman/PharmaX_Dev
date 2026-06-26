import React from 'react'
import { Link } from 'react-router-dom'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background px-4 py-10 sm:px-6 relative">
      <div className="absolute top-5 left-6">
        <Link to="/">
          <img src="/PharmaX_Logo.png" alt="PharmaX" className="h-9 w-auto" />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
