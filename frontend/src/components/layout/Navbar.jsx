import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="bg-surface shadow-sm">
      <div className="container flex items-center justify-end py-4">
        <nav className="space-x-4">
          <Link to="/signin" className="text-on-surface-variant hover:text-on-surface">Sign in</Link>
          <Link to="/signup" className="ml-2 bg-primary text-white px-4 py-2 rounded-md">Get started</Link>
        </nav>
      </div>
    </header>
  )
}
