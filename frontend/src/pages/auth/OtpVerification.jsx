import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function OtpVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail } = useAuth()
  const email = location.state?.email
  const autoResend = location.state?.autoResend || false
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [devOtp, setDevOtp] = useState(location.state?.otp || null)
  const inputs = useRef([])
  const didResend = useRef(false)

  useEffect(() => {
    if (!email) { navigate('/signup', { replace: true }); return }
    if (autoResend && !didResend.current) {
      didResend.current = true
      handleResend()
    }
  }, [])

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

    setLoading(true)
    try {
      await verifyEmail(email, code.join(''))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setError('')
    setDevOtp(null)
    try {
      const res = await api.post('/auth/resend-otp', { email })
      if (res.data?.data?.otp) setDevOtp(res.data.data.otp)
      setResendSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.')
    }
    setResendLoading(false)
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
                <span className="material-symbols-outlined" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>mark_email_unread</span>
              </div>
              <h1 className="text-3xl font-semibold text-on-surface">Verify Your Email</h1>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                We've sent a 6-digit code to{' '}
                <span className="font-semibold text-on-surface">{email}</span>.
                <br />Enter it below to activate your account.
              </p>
            </div>

            {devOtp && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-amber-700 font-medium mb-1">Email delivery failed â€" dev mode OTP:</p>
                <p className="text-2xl font-bold tracking-[0.3em] text-amber-800">{devOtp}</p>
                <button
                  type="button"
                  onClick={() => setCode(devOtp.split(''))}
                  className="mt-2 text-xs text-amber-700 underline hover:text-amber-900"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
              )}

              {resendSuccess && (
                <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
                  A new code has been sent to your email.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifyingâ€¦' : 'Verify & Continue'}
              </button>
            </form>

            <div className="mt-6 border-t border-surface-container pt-6 text-center text-sm text-on-surface-variant">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="mt-3 text-primary font-semibold hover:text-primary/90 disabled:opacity-60"
              >
                {resendLoading ? 'Sendingâ€¦' : 'Resend code'}
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-on-surface-variant">
              <Link to="/signup" className="text-primary font-semibold">
                â† Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
