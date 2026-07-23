import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/common/AuthLayout'

export default function ResetPasswordSuccess() {
  useEffect(() => { document.title = 'Password Reset — PharmaX' }, [])
  return (
    <AuthLayout>
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-surface-container bg-surface-container-lowest shadow-[0_40px_80px_-40px_rgba(15,23,42,0.2)]">
        <div className="pointer-events-none absolute -left-16 top-1/4 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold text-on-surface">Password Reset!</h1>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>

          <Link
            to="/signin"
            className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            Sign In to Your Account
          </Link>

          <p className="mt-5 text-xs text-on-surface-variant">
            Didn't make this change?{' '}
            <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary/80">
              Reset again
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
