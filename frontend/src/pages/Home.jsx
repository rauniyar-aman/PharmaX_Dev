import React, { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'

const customerFeatures = [
  { icon: 'search',          label: 'Browse Medicines',         desc: 'Search by name, category, or brand' },
  { icon: 'upload_file',     label: 'Upload Prescription',      desc: 'Secure Rx upload with name tagging' },
  { icon: 'shopping_cart',   label: 'Add to Cart & Order',      desc: 'Order with COD, eSewa, or Khalti' },
  { icon: 'local_shipping',  label: 'Real-Time Tracking',       desc: 'Track your order from confirmed to delivered' },
  { icon: 'receipt_long',    label: 'Order History',            desc: 'View past orders and reorder easily' },
  { icon: 'account_circle',  label: 'Profile & Settings',       desc: 'Manage account, password, and preferences' },
]

const adminFeatures = [
  { icon: 'medication',      label: 'Medicine Management',      desc: 'Add, edit, and manage stock levels' },
  { icon: 'category',        label: 'Categories',               desc: 'Organize medicines by type' },
  { icon: 'description',     label: 'Prescription Review',      desc: 'Verify or reject uploaded prescriptions' },
  { icon: 'package_2',       label: 'Order Management',         desc: 'Update order status and track deliveries' },
  { icon: 'inventory_2',     label: 'Inventory Logs',           desc: 'Monitor stock changes over time' },
  { icon: 'settings',        label: 'Admin Settings',           desc: 'Profile, password, theme & notifications' },
]

const stack = [
  { label: 'React + Vite',     icon: 'web',              sub: 'Frontend' },
  { label: 'Node.js + Express',icon: 'dns',              sub: 'Backend API' },
  { label: 'PostgreSQL + Prisma', icon: 'storage',       sub: 'Database' },
  { label: 'JWT + OTP Email',  icon: 'lock',             sub: 'Auth' },
  { label: 'eSewa & Khalti',   icon: 'payments',         sub: 'Payments' },
  { label: 'Tailwind CSS',     icon: 'palette',          sub: 'Styling' },
]

const steps = [
  { n: '01', label: 'Sign Up',         desc: 'Create your account in seconds' },
  { n: '02', label: 'Browse & Search', desc: 'Find medicines by name or category' },
  { n: '03', label: 'Upload Rx',       desc: 'Attach a prescription if required' },
  { n: '04', label: 'Pay Securely',    desc: 'COD, eSewa, or Khalti' },
  { n: '05', label: 'Get Delivered',   desc: 'Track your order to your doorstep' },
]

export default function Home() {
  useEffect(() => { document.title = 'PharmaX — Online Pharmacy' }, [])
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="container max-w-5xl mx-auto px-4 py-12 space-y-20">

        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center gap-6 pt-4">
          <img src="/PharmaX_Logo.png" alt="PharmaX" className="h-28 w-auto" />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-on-surface">PharmaX</h1>
            <p className="text-base text-on-surface-variant max-w-xl mx-auto">
              A full-stack online pharmacy platform — order medicines, upload prescriptions, and manage your pharmacy all in one place.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Link to="/signin" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_bag</span>
              Shop Medicines
            </Link>
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-6 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
              Create Account
            </Link>
            <a href="https://github.com/rauniyar-aman/PharmaX_Dev" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-6 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>code</span>
              View on GitHub
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {[
              { icon: 'verified', label: 'Prescription Verified' },
              { icon: 'security', label: 'Secure Payments' },
              { icon: 'local_shipping', label: 'Fast Delivery' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container-low border border-outline-variant rounded-full px-3 py-1.5">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="space-y-10">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Customer */}
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-on-surface">Customer Features</h2>
                  <p className="text-xs text-on-surface-variant">What patients can do</p>
                </div>
              </div>
              <ul className="space-y-3">
                {customerFeatures.map(f => (
                  <li key={f.label} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-on-surface leading-tight">{f.label}</p>
                      <p className="text-xs text-on-surface-variant">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin */}
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-on-surface">Admin Features</h2>
                  <p className="text-xs text-on-surface-variant">What pharmacists & admins can do</p>
                </div>
              </div>
              <ul className="space-y-3">
                {adminFeatures.map(f => (
                  <li key={f.label} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-on-surface leading-tight">{f.label}</p>
                      <p className="text-xs text-on-surface-variant">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-on-surface">How It Works</h2>
            <p className="text-sm text-on-surface-variant mt-1">Five steps from sign-up to delivery</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{s.n}</div>
                <p className="text-sm font-semibold text-on-surface">{s.label}</p>
                <p className="text-xs text-on-surface-variant">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-on-surface">Tech Stack</h2>
            <p className="text-sm text-on-surface-variant mt-1">Built with modern, production-ready technologies</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stack.map(t => (
              <div key={t.label} className="flex items-center gap-3 p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{t.label}</p>
                  <p className="text-xs text-on-surface-variant">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Repos ── */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-on-surface">Open Source</h2>
            <p className="text-sm text-on-surface-variant mt-1">Both the web and Android versions are publicly available</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <a href="https://github.com/rauniyar-aman/PharmaX_Dev" target="_blank" rel="noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>computer</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">PharmaX Web</p>
                <p className="text-xs text-on-surface-variant">React + Node.js · Full-stack web platform</p>
                <p className="text-xs text-primary mt-0.5 font-medium">github.com/rauniyar-aman/PharmaX_Dev</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>open_in_new</span>
            </a>
            <a href="https://github.com/rauniyar-aman/PharmaX" target="_blank" rel="noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>smartphone</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">PharmaX Android</p>
                <p className="text-xs text-on-surface-variant">Android · Native mobile app</p>
                <p className="text-xs text-primary mt-0.5 font-medium">github.com/rauniyar-aman/PharmaX</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>open_in_new</span>
            </a>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl bg-primary/5 border border-primary/20 p-8 flex flex-col items-center text-center gap-4">
          <h2 className="text-xl font-bold text-on-surface">Get Started with PharmaX</h2>
          <p className="text-sm text-on-surface-variant max-w-md">
            Create a free account to start ordering medicines, or explore the GitHub repository to learn how it's built.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
              Get Started
            </Link>
            <a href="https://github.com/rauniyar-aman/PharmaX_Dev" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-6 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
              GitHub Repo
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
