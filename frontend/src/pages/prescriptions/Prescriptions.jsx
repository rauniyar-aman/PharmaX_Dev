import React, { useState } from 'react'

const prescriptions = [
  { id: 1, name: 'Dr_Sharma_Metformin.pdf', doctor: 'Dr. Rajesh Sharma', hospital: 'Norvic Hospital', uploadDate: 'Jun 10, 2024', expiryDate: 'Jul 10, 2024', status: 'Verified', medicines: ['Metformin 500mg', 'Lisinopril 10mg'] },
  { id: 2, name: 'Apollo_Rx_June.jpg', doctor: 'Dr. Priya Patel', hospital: 'Apollo Hospital', uploadDate: 'May 15, 2024', expiryDate: 'Jun 15, 2024', status: 'Expired', medicines: ['Amoxicillin 500mg'] },
  { id: 3, name: 'KMC_Prescription.pdf', doctor: 'Dr. Anand Thapa', hospital: 'Kathmandu Medical College', uploadDate: 'Jun 20, 2024', expiryDate: 'Jul 20, 2024', status: 'Pending Review', medicines: ['Cetirizine 10mg', 'Omeprazole 20mg'] },
]

const statusColors = {
  'Verified': 'bg-primary/10 text-primary border-primary/20',
  'Expired': 'bg-error-container text-error border-error/20',
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function Prescriptions() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setUploadedFile(file)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Prescriptions</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage your uploaded prescriptions</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Upload New */}
        <div>
          <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5 sticky top-20">
            <h3 className="text-base font-semibold text-on-surface mb-4">Upload New Prescription</h3>
            <label
              htmlFor="rx-upload"
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) setUploadedFile(f) }}
              className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl py-10 cursor-pointer transition-all ${
                dragActive ? 'border-primary bg-primary/5' : uploadedFile ? 'border-primary bg-primary/5' : 'border-surface-container-high hover:border-primary/40 hover:bg-surface-container-low'
              }`}
            >
              <input type="file" id="rx-upload" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="hidden" />
              {uploadedFile ? (
                <div className="text-center px-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-primary truncate max-w-full">{uploadedFile.name}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Click to change</p>
                </div>
              ) : (
                <div className="text-center px-3">
                  <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-2 border border-surface-container-high">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-on-surface-variant">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-on-surface">Drag & drop or click</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">PDF, JPG, PNG · Max 5MB</p>
                </div>
              )}
            </label>

            <button
              disabled={!uploadedFile}
              className={`mt-4 w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                uploadedFile ? 'bg-primary text-white hover:bg-primary-container' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              }`}
            >
              Upload Prescription
            </button>

            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-[11px] text-amber-700 font-semibold mb-1">Requirements</p>
              <ul className="text-[11px] text-amber-700 space-y-0.5 list-disc pl-3">
                <li>Valid for medicines purchased</li>
                <li>Issued by licensed doctor</li>
                <li>Clear, legible text</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prescription List */}
        <div className="xl:col-span-2 space-y-3">
          {prescriptions.map(rx => (
            <div key={rx.id} className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M9 13h6M9 17h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{rx.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{rx.doctor} · {rx.hospital}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rx.medicines.map(m => (
                        <span key={m} className="text-[11px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusColors[rx.status]}`}>{rx.status}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-container">
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <span>Uploaded: <span className="font-medium text-on-surface">{rx.uploadDate}</span></span>
                  <span>Expires: <span className={`font-medium ${rx.status === 'Expired' ? 'text-error' : 'text-on-surface'}`}>{rx.expiryDate}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs font-medium text-secondary hover:underline">View</button>
                  <span className="text-on-surface-variant">·</span>
                  <button className="text-xs font-medium text-error hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
