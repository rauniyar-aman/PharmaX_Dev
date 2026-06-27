import React from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Fast Delivery',
    description: 'Get your medicines delivered within 24 hours of ordering. Track your order in real-time.',
    icon: 'local_shipping'
  },
  {
    title: 'Genuine Medicines',
    description: 'Directly sourced from certified manufacturers to ensure the highest quality standards.',
    icon: 'medication'
  },
  {
    title: 'Secure Payments',
    description: 'Industry-standard encryption for all your financial transactions and medical records.',
    icon: 'lock'
  },
  {
    title: 'Prescription Verification',
    description: 'Our licensed pharmacists verify every prescription before processing your order.',
    icon: 'description'
  },
  {
    title: '24/7 Support',
    description: 'Have questions? Our support team and pharmacists are available around the clock.',
    icon: 'support_agent'
  },
  {
    title: 'Best Prices',
    description: 'We offer competitive pricing and regular discounts on essential healthcare products.',
    icon: 'sell'
  }
]

const processSteps = [
  { label: 'Browse', description: 'Search for medicines or browse categories.' },
  { label: 'Upload', description: 'Securely upload your valid prescription.' },
  { label: 'Add to Cart', description: 'Select quantities and add to your bag.' },
  { label: 'Payment', description: 'Pay securely using multiple options.' },
  { label: 'Delivery', description: 'Relax as we deliver to your doorstep.' }
]

const testimonials = [
  {
    quote: 'PharmaX has made managing my chronic medication so easy. The prescription upload is seamless and delivery is always on time.',
    name: 'Robert Johnson',
    role: 'Regular Patient'
  },
  {
    quote: 'As a busy professional, I appreciate the 24/7 support. The app is intuitive and the medicines are always genuine and well-packaged.',
    name: 'Sarah Williams',
    role: 'Marketing Director'
  },
  {
    quote: 'The best prices Iâ€™ve found online for my familyâ€™s needs. The fast delivery is just the cherry on top. Highly recommended!',
    name: 'Michael Chen',
    role: 'Parent & Caregiver'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-50 text-on-surface">
      <Navbar />

      <main>
        <section className="bg-surface-container-lowest">
          <div className="container grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center py-16">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                Trusted by 10k+ satisfied patients
              </div>
              <div className="max-w-2xl space-y-5">
                <h1 className="text-4xl font-bold tracking-tight text-on-surface sm:text-5xl">
                  Order Medicines <span className="text-primary">Anytime, Anywhere</span>
                </h1>
                <p className="text-base leading-7 text-on-surface-variant">
                  Doorstep delivery and easy prescription upload. Your health is our priority with verified medicines and professional care.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/signin" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                  Shop Medicines
                </Link>
                <Link to="/signup" className="inline-flex items-center justify-center rounded-full border border-surface-container bg-surface-container-lowest px-6 py-3 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-low">
                  Upload Prescription
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[32px] border border-surface-container bg-slate-950/5 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.12)]">
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute -left-8 bottom-8 h-36 w-36 rounded-full bg-green-500/10 blur-3xl"></div>
              <div className="relative rounded-[28px] bg-surface p-6">
                <div className="flex items-center justify-between pb-4">
                  <img src="/PharmaX_Logo.png" alt="PharmaX" className="h-7 w-auto" />
                  <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant">Verified</span>
                </div>
                <div className="h-[260px] rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white shadow-xl">
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-white/10 p-4">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Health dashboard</p>
                        <h2 className="mt-4 text-xl font-semibold">Medicine delivery tracking</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                      <div className="rounded-3xl bg-white/10 p-3">Rx Verified</div>
                      <div className="rounded-3xl bg-white/10 p-3">Fast Delivery</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-primary">Why Choose PharmaX?</p>
            <h2 className="mt-4 text-3xl font-semibold text-on-surface">We combine technology with healthcare expertise to bring you a seamless medical experience.</h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[28px] border border-surface-container bg-surface-container-lowest p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '26px', fontVariationSettings: "'FILL' 1" }}>{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-on-surface">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-50 py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-primary">Our Process</p>
              <h2 className="mt-4 text-3xl font-semibold text-on-surface">How PharmaX Works</h2>
              <p className="mt-4 text-sm leading-6 text-on-surface-variant">A simple, transparent process to get your health essentials delivered.</p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {processSteps.map((step, index) => (
                <div key={step.label} className="rounded-[28px] border border-surface-container bg-surface-container-lowest p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-semibold">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-sm font-semibold text-on-surface">{step.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-on-surface-variant">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="mx-auto max-w-5xl space-y-10 text-center">
            <h2 className="text-3xl font-semibold text-on-surface">Trusted by Patients</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.name} className="rounded-[28px] border border-surface-container bg-surface-container-lowest p-6 text-left shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm text-primary">
                    <span>â˜…â˜…â˜…â˜…â˜…</span>
                    <span className="font-semibold">99</span>
                  </div>
                  <p className="text-sm leading-6 text-on-surface-variant">{item.quote}</p>
                  <div className="mt-6">
                    <p className="font-semibold text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary text-white">
          <div className="container rounded-[32px] border border-primary/20 bg-primary p-12 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.2)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-primary/30">Ready to prioritize your health?</p>
                <h2 className="mt-3 text-3xl font-semibold">Join thousands of users who trust PharmaX for their healthcare needs.</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/signup" className="inline-flex items-center justify-center rounded-full bg-surface-container-lowest px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-slate-100">
                  Create Account
                </Link>
                <button className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">
                  Download App
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
