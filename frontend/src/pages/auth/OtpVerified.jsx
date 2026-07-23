import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'

export default function OtpVerified() {
  useEffect(() => { document.title = 'Email Verified — PharmaX' }, [])
  return (
    <AuthLayout>
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold mb-4 text-on-surface">OTP Verified</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Your one-time password has been verified successfully. Please proceed to sign in.
        </p>
        <Link to="/signin" className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
          Go to Sign In
        </Link>
      </div>
    </AuthLayout>
  )
}
