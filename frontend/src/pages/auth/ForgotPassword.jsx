import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    navigate('/forgot-password-verify', { state: { email } })
  }

  return (
    <AuthLayout>
      <div className="max-w-md w-full bg-white p-8 rounded-[32px] shadow-[0_30px_60px_-30px_rgba(15,23,42,0.2)]">
        <div className="mb-6">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 mb-4"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-lg leading-none">
              ‹
            </span>
            Back to Sign In
          </Link>
          <h2 className="text-2xl font-semibold text-on-surface text-center">Forgot Password</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Enter your email address and we will send a verification code to reset access.
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
            Send OTP
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
