import React from 'react'
import { Link } from 'react-router-dom'

function Logo() {
  return (
    <div className="inline-flex items-center">
      <img src="/PharmaX_Logo.png" alt="PharmaX" className="h-10 w-auto" />
    </div>
  )
}

export default function Navbar() {
  return (
    <header className="bg-surface shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <Logo />
        <nav className="space-x-4">
          <Link to="/signin" className="text-on-surface-variant hover:text-on-surface">Sign in</Link>
          <Link to="/signup" className="ml-2 bg-primary text-white px-4 py-2 rounded-md">Get started</Link>
        </nav>
      </div>
    </header>
  )
}
