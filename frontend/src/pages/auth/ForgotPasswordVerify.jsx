import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'
import api from '../../lib/api'

export default function ForgotPasswordVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, navigate])

  const updateCode = (value, index) => {
    if (!/^[0-9]*$/.test(value)) return
    const nextCode = [...code]
    nextCode[index] = value.slice(-1)
    setCode(nextCode)

    if (value && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (code.some(digit => digit === '')) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        otp: code.join(''),
        newPassword,
      })
      navigate('/reset-success')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-surface-container bg-surface-container-lowest shadow-[0_40px_80px_-40px_rgba(15,23,42,0.2)]">
          <div className="pointer-events-none absolute -left-16 top-1/4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="relative p-10">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
              </div>
              <h1 className="text-3xl font-semibold text-on-surface">Reset Password</h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Enter the 6-digit OTP sent to <span className="font-medium text-on-surface">{email || 'your email'}</span> and choose a new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">Verification Code</label>
                <div className="grid grid-cols-6 gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (inputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={e => updateCode(e.target.value, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                      className="h-14 rounded-3xl border border-surface-container bg-surface px-3 text-center text-xl font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>
              </div>

              {/* New Password Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-2xl border border-surface-container bg-surface px-4 py-3 pr-16 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full rounded-2xl border border-surface-container bg-surface px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 border-t border-surface-container pt-6 text-center text-sm text-on-surface-variant">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={async () => {
                  try { await api.post('/auth/forgot-password', { email }) } catch {}
                }}
                className="mt-3 text-primary font-semibold hover:text-primary/90"
              >
                Resend code
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
