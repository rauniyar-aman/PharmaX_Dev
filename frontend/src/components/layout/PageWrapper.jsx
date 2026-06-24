import React from 'react'

export default function PageWrapper({ children }) {
  return <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">{children}</div>
}
