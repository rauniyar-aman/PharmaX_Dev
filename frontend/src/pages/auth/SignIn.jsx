import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/common/AuthLayout'
import AuthHeader from '../../components/layout/AuthHeader'
import Input from '../../components/forms/Input'
import Button from '../../components/buttons/Button'

const MailIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <path d="M4 7l8 5 8-5" />
  </svg>
)

const LockIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="11" width="12" height="8" rx="2" />
    <path d="M8 11V7a4 4 0 118 0v4" />
  </svg>
)

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setUnverified(false)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      if (err.response?.status === 403) {
        setUnverified(true)
        setError('')
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthHeader />

        <div className="rounded-[32px] border border-surface-container bg-surface p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.2)]">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                ‹
              </span>
              Back to homepage
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-on-surface">Sign In</h1>
            <p className="text-sm text-on-surface-variant mt-2">Use your PharmaX credentials to access the secure portal.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@pharmacy.com"
              icon={MailIcon}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={LockIcon}
              value={form.password}
              onChange={handleChange}
              right={
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="text-on-surface-variant text-sm">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            />

            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-surface-container text-primary focus:ring-primary" />
                Remember me for 30 days
              </label>
              <Link to="/forgot-password" className="text-primary font-medium">Forgot Password?</Link>
            </div>

            {unverified && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
                <p className="text-xs text-amber-800 font-medium">Your email address hasn't been verified yet.</p>
                <button
                  type="button"
                  onClick={() => navigate('/verify-otp', { state: { email: form.email, autoResend: true } })}
                  className="w-full py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  Verify Email Now →
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <div className="h-px flex-1 bg-surface-container-high" />
              <span>OR</span>
              <div className="h-px flex-1 bg-surface-container-high" />
            </div>

            <button type="button" className="w-full rounded-xl border border-surface-container bg-surface py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container">
              Continue with SSO
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-on-surface-variant">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-primary font-semibold">Register now</Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
