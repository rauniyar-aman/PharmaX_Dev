import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

const rxMedicines = [
  { name: 'Amoxicillin 500mg', qty: 2 },
]

export default function CheckoutPrescription() {
  const navigate = useNavigate()
  const [uploaded, setUploaded] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleFile = (file) => {
    if (file) setUploaded(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const previousUploads = [
    { name: 'prescription_june_2024.pdf', date: 'Jun 10, 2024', size: '1.2 MB', verified: true },
    { name: 'rx_amoxicillin.jpg', date: 'May 22, 2024', size: '2.1 MB', verified: true },
  ]

  return (
    <div className="space-y-4">
      <CheckoutSteps current={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Action Required Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined ms-filled text-amber-600 flex-shrink-0" style={{ fontSize: '22px' }}>warning</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Action Required — Prescription Needed</p>
                <p className="text-xs text-amber-700 mt-1 mb-3">The following medicines in your cart require a valid doctor's prescription:</p>
                <ul className="space-y-1.5">
                  {rxMedicines.map(m => (
                    <li key={m.name} className="flex items-center gap-2 text-xs text-amber-800">
                      <span className="material-symbols-outlined ms-filled text-amber-500" style={{ fontSize: '16px' }}>check_circle</span>
                      <span className="font-medium">{m.name}</span>
                      <span className="text-amber-600">× {m.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-4">Upload Prescription</h2>

            {!uploaded ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragging ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/50 hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined ms-filled text-secondary mb-3" style={{ fontSize: '48px' }}>upload_file</span>
                <p className="text-sm font-semibold text-on-surface">Drag & drop your prescription here</p>
                <p className="text-xs text-on-surface-variant mt-1">or click to browse files</p>
                <p className="text-xs text-on-surface-variant mt-3">Supported: JPG, PNG, PDF · Max 10MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '36px' }}>description</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{uploaded.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{(uploaded.size / 1024 / 1024).toFixed(2)} MB · Ready to submit</p>
                </div>
                <button
                  onClick={() => setUploaded(null)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </div>
            )}
          </div>

          {/* Previously Uploaded */}
          <div className="bg-white rounded-2xl custom-shadow p-5">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Previously Uploaded Prescriptions</h3>
            <div className="space-y-2.5">
              {previousUploads.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined ms-filled text-secondary" style={{ fontSize: '24px' }}>description</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{f.name}</p>
                    <p className="text-xs text-on-surface-variant">{f.date} · {f.size}</p>
                  </div>
                  {f.verified && (
                    <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                      <span className="material-symbols-outlined ms-filled text-primary" style={{ fontSize: '14px' }}>verified</span>
                      Verified
                    </span>
                  )}
                  <button className="text-xs font-medium text-secondary hover:underline">Use This</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Buttons */}
        <div className="bg-white rounded-2xl custom-shadow p-5 h-fit space-y-3">
          <h3 className="text-sm font-semibold text-on-surface">Prescription Upload</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">Upload a clear photo or PDF of your prescription. Our pharmacist will verify it before processing your order.</p>

          <button
            onClick={() => navigate('/dashboard/checkout/payment')}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
              uploaded ? 'bg-primary text-white hover:bg-primary/90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
            }`}
            disabled={!uploaded}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payment</span>
            Submit & Continue to Payment
          </button>

          <Link
            to="/dashboard/checkout/shipping"
            className="flex items-center justify-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Shipping
          </Link>
        </div>
      </div>
    </div>
  )
}
