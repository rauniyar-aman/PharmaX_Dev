import React from 'react'

const steps = [
  { label: 'Shipping', icon: 'local_shipping' },
  { label: 'Prescription', icon: 'description' },
  { label: 'Payment', icon: 'payment' },
  { label: 'Review', icon: 'check_circle' },
]

export default function CheckoutSteps({ current }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5 mb-5">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                index < current
                  ? 'bg-primary text-white'
                  : index === current
                  ? 'bg-secondary-container text-on-secondary-container ring-4 ring-secondary/20'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                {index < current ? (
                  <span className="material-symbols-outlined ms-filled text-white" style={{ fontSize: '18px' }}>check</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{step.icon}</span>
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block whitespace-nowrap ${index <= current ? 'text-secondary font-semibold' : 'text-on-surface-variant'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 transition-all ${index < current ? 'bg-primary' : 'bg-outline-variant'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
