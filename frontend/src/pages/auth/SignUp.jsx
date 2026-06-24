import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/common/Logo'
import Input from '../../components/forms/Input'
import Button from '../../components/buttons/Button'

const UserIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-8 0v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const MailIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M4 7l8 5 8-5" />
  </svg>
)

const PhoneIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.2 1.6.7 3.16 1.48 4.6a2 2 0 01-.45 2.11L9.91 10.09a16 16 0 006 6l1.66-1.66a2 2 0 012.11-.45c1.44.77 3 .6 4.6 1.48a2 2 0 011.72 2.01z" />
  </svg>
)

const LockIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="11" width="12" height="8" rx="2" />
    <path d="M8 11V7a4 4 0 118 0v4" />
  </svg>
)

const featureItems = [
  {
    label: 'HIPAA Compliant',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    )
  },
  {
    label: 'Real-time Sync',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v6h6" />
        <path d="M20 20v-6h-6" />
        <path d="M20 10a8 8 0 10-8 8" />
      </svg>
    )
  },
  {
    label: '24/7 Support',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10a6 6 0 10-12 0 6 6 0 0012 0z" />
        <path d="M2 20h20" />
      </svg>
    )
  }
]

export default function SignUp() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (!form.fullName || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (!form.acceptedTerms) {
      setError('Please accept the Terms & Conditions to continue.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const email = await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      navigate('/verify-otp', { state: { email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[44%] flex-col bg-surface-container-low border-r border-surface-container p-10">
        <Logo size="lg" />

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Why PharmaX</p>
          <h2 className="mt-3 text-3xl font-bold text-on-surface leading-tight">
            Healthcare tools built for modern pharmacies
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
            Manage prescriptions, inventory, and patient engagement with a clean, secure platform trusted by health professionals.
          </p>

          <div className="mt-8 space-y-3">
            {featureItems.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-on-surface">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-on-surface-variant">Trusted by healthcare professionals worldwide</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 mb-5"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-lg leading-none">
              ‹
            </span>
            Back to homepage
          </Link>

          <div className="lg:hidden mb-5">
            <Logo size="lg" />
          </div>

          <div className="rounded-[28px] border border-surface-container bg-white p-8 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.16)]">
            <h1 className="text-2xl font-semibold text-on-surface">Create Account</h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">Start your clinical journey with PharmaX today.</p>

            <form className="mt-6 space-y-3.5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  icon={UserIcon}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 0000"
                  icon={PhoneIcon}
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john.doe@hospital.com"
                icon={MailIcon}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={LockIcon}
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="text-on-surface-variant text-xs"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  }
                />
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={LockIcon}
                />
              </div>

              <label className="flex items-start gap-2.5 text-sm text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  checked={form.acceptedTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-surface-container text-primary focus:ring-primary"
                />
                <span>
                  I agree to the{' '}
                  <span className="text-primary font-medium">Terms & Conditions</span>
                </span>
              </label>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Register'}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/signin" className="text-primary font-semibold">Log in here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
