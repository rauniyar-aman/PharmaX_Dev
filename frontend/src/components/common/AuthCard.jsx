import React from 'react'

export default function AuthCard({ children }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-[32px] border border-surface-container bg-surface p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.2)]">
      {children}
    </div>
  )
}
