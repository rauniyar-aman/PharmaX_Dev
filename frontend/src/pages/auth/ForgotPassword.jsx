import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'
import api from '../../lib/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      navigate('/forgot-password-verify', { state: { email: email.trim() } })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-[32px] shadow-[0_30px_60px_-30px_rgba(15,23,42,0.2)]">
        <div className="mb-6">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 mb-4"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-lg leading-none">
              â€¹
            </span>
            Back to Sign In
          </Link>
          <h2 className="text-2xl font-semibold text-on-surface text-center">Forgot Password</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Enter your email address and we'll send a verification code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@pharmacy.com"
              className="w-full rounded-2xl border border-surface-container bg-surface p-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Sending OTPâ€¦' : 'Send OTP'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
