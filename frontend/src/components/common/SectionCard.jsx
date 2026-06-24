import React from 'react'

export default function SectionCard({ title, description, icon }) {
  return (
    <div className="rounded-3xl border border-surface-container bg-surface p-6 shadow-sm">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-high text-primary mb-4">{icon}</div>
      <h4 className="text-base font-semibold text-on-surface mb-2">{title}</h4>
      <p className="text-sm text-on-surface-variant leading-6">{description}</p>
    </div>
  )
}
