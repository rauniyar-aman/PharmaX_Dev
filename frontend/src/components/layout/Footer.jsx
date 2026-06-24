import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-surface mt-12">
      <div className="container py-8 text-center text-sm text-on-surface-variant">© {new Date().getFullYear()} PharmaX. All rights reserved.</div>
    </footer>
  )
}
