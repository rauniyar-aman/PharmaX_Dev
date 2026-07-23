import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

export default function RestoreAccount() {
  useEffect(() => { document.title = 'Restore Account — PharmaX' }, [])
  const navigate = useNavigate()
  const location = useLocation()
  const { restoreAccount } = useAuth()
  const email = location.state?.email || ''
  const fromRegister = location.state?.fromRegister || false

  const [step, setStep] = useState(email ? 'otp' : 'email') // 'email' | 'otp'
  const [emailInput, setEmailInput] = useState(email)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [devOtp, setDevOtp] = useState(null)
  const inputs = useRef([])
  const didSend = useRef(false)

  useEffect(() => {
    if (email && !didSend.current) {
      didSend.current = true
      sendOtp(email)
    }
  }, [])

  const sendOtp = async (target) => {
    setSending(true)
    setError('')
    setDevOtp(null)
    try {
      const res = await api.post('/auth/restore-request', { email: target })
      if (res.data?.data?.otp) setDevOtp(res.data.data.otp)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code.')
    }
    setSending(false)
  }

  const handleEmailSubmit = async e => {
    e.preventDefault()
    if (!emailInput) return setError('Please enter your email.')
    await sendOtp(emailInput)
  }

  const updateCode = (value, index) => {
    if (!/^[0-9]*$/.test(value)) return
    const next = [...code]
    next[index] = value.slice(-1)
    setCode(next)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus()
  }

  const handleVerify = async e => {
    e.preventDefault()
    if (code.some(d => d === '')) return setError('Please enter the full 6-digit code.')
    setLoading(true)
    setError('')
    try {
      await restoreAccount(emailInput || email, code.join(''))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-surface-container bg-surface p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.2)]">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
              <span className="material-symbols-outlined text-4xl">manage_accounts</span>
            </div>
            <h1 className="text-2xl font-semibold text-on-surface">
              {fromRegister ? 'Previous Account Found' : 'Restore Account'}
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">
              {step === 'email'
                ? 'Enter your email to receive a verification code and restore your account.'
                : fromRegister
                  ? `An account with ${emailInput || email} was previously deleted. Verify to restore it.`
                  : `We've sent a code to ${emailInput || email}. Enter it below to restore your account.`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-surface-container-high bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {error && <p className="text-xs text-error bg-error-container/30 border border-error/20 rounded-xl px-4 py-2.5">{error}</p>}
              <button type="submit" disabled={sending}
                className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all">
                {sending ? 'Sending Code…' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-amber-700 font-medium mb-1">Email delivery failed - dev mode OTP:</p>
                  <p className="text-2xl font-bold tracking-[0.3em] text-amber-800">{devOtp}</p>
                  <button type="button" onClick={() => setCode(devOtp.split(''))} className="mt-2 text-xs text-amber-700 underline hover:text-amber-900">Auto-fill</button>
                </div>
              )}

              <div className="grid grid-cols-6 gap-3">
                {code.map((digit, i) => (
                  <input key={i} ref={el => (inputs.current[i] = el)}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => updateCode(e.target.value, i)}
                    onKeyDown={e => handleKeyDown(e, i)}
                    className="h-12 rounded-2xl border border-surface-container bg-surface text-center text-lg font-semibold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ))}
              </div>

              {error && <p className="text-xs text-error bg-error-container/30 border border-error/20 rounded-xl px-4 py-2.5">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all">
                {loading ? 'Restoring Account…' : 'Verify & Restore Account'}
              </button>

              <button type="button" onClick={() => sendOtp(emailInput || email)} disabled={sending}
                className="w-full py-2 text-sm text-primary font-medium hover:underline disabled:opacity-50">
                {sending ? 'Resending…' : 'Resend code'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-on-surface-variant">
            <Link to="/signin" className="text-primary font-semibold">← Back to Sign In</Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
