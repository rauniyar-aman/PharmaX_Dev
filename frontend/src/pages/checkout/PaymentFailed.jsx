import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const REASONS = {
  incomplete:     'The payment was not completed.',
  verify_error:   'Could not verify the payment with eSewa.',
  not_verified:   'eSewa could not confirm the transaction.',
  order_not_found:'The order linked to this payment was not found.',
  missing_data:   'Payment response was missing required data.',
  server_error:   'An unexpected server error occurred.',
}

export default function PaymentFailed() {
  useEffect(() => { document.title = 'Payment Failed — PharmaX' }, [])
  const [params] = useSearchParams()
  const reason = REASONS[params.get('reason')] || 'Your payment was not completed.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-error" style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Payment Failed</h1>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">{reason}</p>

        <div className="flex flex-col gap-3">
          <Link to="/dashboard/checkout/payment"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
            Try Again
          </Link>
          <Link to="/dashboard/cart"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shopping_cart</span>
            Back to Cart
          </Link>
        </div>

        <p className="text-xs text-on-surface-variant mt-5">
          No money was deducted. If you see a charge, contact{' '}
          <a href="mailto:support@pharmax.com" className="text-primary hover:underline">support@pharmax.com</a>
        </p>
      </div>
    </div>
  )
}
