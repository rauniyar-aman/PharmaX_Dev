import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function parseFileUrls(fileUrl) {
  try { const p = JSON.parse(fileUrl); if (Array.isArray(p)) return p } catch {}
  return fileUrl ? [fileUrl] : []
}

function isPdf(url) { return url?.toLowerCase().endsWith('.pdf') }

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending Review', bg: 'bg-secondary-fixed text-on-secondary-fixed',  icon: 'schedule' },
  VERIFIED: { label: 'Approved',       bg: 'bg-primary-fixed text-on-primary-fixed',      icon: 'verified' },
  REJECTED: { label: 'Rejected',       bg: 'bg-error-container text-on-error-container',  icon: 'cancel' },
  EXPIRED:  { label: 'Expired',        bg: 'bg-surface-container-high text-on-surface-variant', icon: 'event_busy' },
}

function PreviewModal({ prescription, onClose }) {
  const urls  = parseFileUrls(prescription.fileUrl)
  const names = prescription.fileName?.split(', ') || []
  const [page, setPage] = useState(0)
  const url   = urls[page] ? `${BACKEND}${urls[page]}` : null
  const name  = names[page] || prescription.fileName

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') setPage(p => Math.min(p + 1, urls.length - 1)); if (e.key === 'ArrowLeft') setPage(p => Math.max(p - 1, 0)) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [urls.length])

  const linkedOrderId = prescription.orderItems?.[0]?.orderId

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex border border-outline-variant">
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface hover:bg-error-container hover:text-error transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>

        <div className="flex-1 bg-surface-dim/30 flex flex-col items-center p-5 overflow-y-auto">
          <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-4 py-2 bg-surface-container-lowest/80 backdrop-blur rounded-full border border-outline-variant sticky top-0 z-10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                {isPdf(name) ? 'picture_as_pdf' : 'image'}
              </span>
              <span className="text-sm font-medium text-on-surface truncate">{name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {urls.length > 1 && (
                <span className="text-xs text-on-surface-variant">{page + 1}/{urls.length}</span>
              )}
              {url && (
                <a href={url} download className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-full text-xs font-semibold hover:opacity-90 transition">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>download</span>
                  Download
                </a>
              )}
            </div>
          </div>

          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex-1 flex items-center justify-center" style={{ minHeight: '400px' }}>
            {url ? (
              isPdf(name) ? (
                <iframe src={url} className="w-full h-full" style={{ minHeight: '500px' }} title="Prescription" />
              ) : (
                <img src={url} alt="Prescription" className="max-w-full max-h-[65vh] object-contain" />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 text-on-surface-variant p-10">
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>broken_image</span>
                <p className="text-sm">Preview not available</p>
              </div>
            )}
          </div>

          {urls.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded-full hover:bg-surface-container disabled:opacity-30 transition">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              {urls.map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-primary w-4' : 'bg-outline-variant'}`} />
              ))}
              <button onClick={() => setPage(p => Math.min(urls.length - 1, p + 1))} disabled={page === urls.length - 1}
                className="p-1.5 rounded-full hover:bg-surface-container disabled:opacity-30 transition">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          )}
        </div>

        <aside className="w-72 flex-shrink-0 border-l border-outline-variant bg-surface-container flex flex-col p-5 gap-5">
          <div>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-4">Document Details</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>calendar_today</span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Upload Date</p>
                  <p className="text-sm font-semibold text-on-surface">{fmtDate(prescription.uploadedAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                    {STATUS_CONFIG[prescription.status]?.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CONFIG[prescription.status]?.bg}`}>
                    {STATUS_CONFIG[prescription.status]?.label}
                  </span>
                </div>
              </div>

              {linkedOrderId && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>shopping_bag</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Linked Order</p>
                    <Link to={`/dashboard/orders/${linkedOrderId}`}
                      className="text-sm font-semibold text-secondary hover:underline">
                      #{linkedOrderId.slice(0, 8).toUpperCase()}
                    </Link>
                  </div>
                </div>
              )}

              {prescription.doctor && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>label</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Name</p>
                    <p className="text-sm font-semibold text-on-surface">{prescription.doctor}</p>
                    {prescription.hospital && <p className="text-xs text-on-surface-variant">{prescription.hospital}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {prescription.status === 'VERIFIED' && (
            <div className="p-3 bg-surface-container-highest rounded-xl border border-outline-variant">
              <div className="flex items-center gap-2 mb-1 text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>security</span>
                <span className="text-xs font-bold uppercase tracking-wide">Verified Document</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">This prescription has been verified by our pharmacist.</p>
            </div>
          )}

          <div className="mt-auto space-y-2">
            {url && (
              <a href={url} download
                className="w-full py-3 flex items-center justify-center gap-2 bg-secondary text-on-secondary rounded-xl text-sm font-semibold hover:opacity-90 transition">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                Download
              </a>
            )}
            <button onClick={onClose}
              className="w-full py-3 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition">
              Close
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function RejectionModal({ prescription, onClose, onReupload }) {
  const urls = parseFileUrls(prescription.fileUrl)
  const previewUrl = urls[0] ? `${BACKEND}${urls[0]}` : null

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-inverse-surface/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-error flex items-center justify-center">
              <span className="material-symbols-outlined text-on-error" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <h2 className="text-base font-bold text-on-surface">Verification Failed</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <div className="flex items-start gap-3 p-4 bg-error/5 rounded-xl border-l-4 border-error">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Rejection Reason</p>
              <p className="text-sm text-on-surface leading-relaxed">
                {prescription.rejectionReason || 'The prescription could not be verified. Please ensure it is clear, complete, and issued by a licensed doctor.'}
              </p>
            </div>
          </div>

          {previewUrl && (
            <div className="relative rounded-xl border border-outline-variant overflow-hidden aspect-video bg-surface-container-high">
              {isPdf(previewUrl) ? (
                <div className="flex items-center justify-center h-full text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>picture_as_pdf</span>
                </div>
              ) : (
                <img src={previewUrl} alt="Rejected prescription" className="w-full h-full object-cover opacity-60" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-full flex items-center gap-2">
                  <span className="material-symbols-outlined text-error" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>error</span>
                  <span className="text-sm font-semibold text-on-surface">Verification failed</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-secondary mb-3">How to Fix</h3>
            <ul className="space-y-3">
              {[
                { title: 'Ensure good lighting', desc: 'Position your prescription under a direct light source to avoid shadows and graininess.' },
                { title: 'Capture the full document', desc: 'Make sure all four corners of the paper are visible in the camera frame.' },
                { title: 'Check for clarity', desc: "After taking the photo, zoom in to verify that the doctor's name and dates are sharp." },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{step.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-5 border-t border-outline-variant flex gap-3">
          <button onClick={onReupload}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-on-secondary rounded-xl text-sm font-semibold hover:opacity-90 transition">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
            Re-upload Prescription
          </button>
          <button onClick={onClose}
            className="flex-1 py-3 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function PrescriptionCard({ rx, onView, onViewReason, onDelete }) {
  const cfg = STATUS_CONFIG[rx.status] || STATUS_CONFIG.PENDING
  const urls = parseFileUrls(rx.fileUrl)
  const firstUrl = urls[0] ? `${BACKEND}${urls[0]}` : null
  const linkedOrderId = rx.orderItems?.[0]?.orderId

  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:shadow-md transition-shadow group">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-surface-container rounded-xl overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center">
          {firstUrl && !isPdf(firstUrl) ? (
            <img src={firstUrl} alt="Prescription" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>
              {firstUrl ? 'picture_as_pdf' : 'description'}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg}`}>{cfg.label}</span>
            <span className="text-[11px] text-on-surface-variant font-mono flex-shrink-0">#{rx.id.slice(0, 8).toUpperCase()}</span>
          </div>

          {linkedOrderId && (
            <Link to={`/dashboard/orders/${linkedOrderId}`}
              className="flex items-center gap-1 mt-1.5 text-secondary text-xs font-medium hover:underline">
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>shopping_bag</span>
              Linked to Order #{linkedOrderId.slice(0, 8).toUpperCase()}
            </Link>
          )}

          {rx.doctor && (
            <p className="text-sm font-bold text-on-surface mt-1.5 truncate">{rx.doctor}</p>
          )}
          <p className={`truncate ${rx.doctor ? 'text-[11px] text-on-surface-variant mt-0.5' : 'text-sm font-bold text-on-surface mt-1.5'}`}>
            {rx.fileName?.split(', ')[0]}
          </p>
          {urls.length > 1 && (
            <p className="text-[11px] text-on-surface-variant">{urls.length} pages</p>
          )}

          <div className="flex items-center gap-1 mt-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>
            {fmtDate(rx.uploadedAt)}
          </div>

          {rx.status === 'REJECTED' && (
            <p className="flex items-center gap-1 text-[11px] text-error mt-1">
              <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>error</span>
              Verification failed
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-3 border-t border-outline-variant">
        {rx.status === 'REJECTED' ? (
          <>
            <button onClick={() => onViewReason(rx)}
              className="flex-1 py-2 text-primary text-xs font-semibold hover:bg-primary/5 rounded-lg transition">
              View Reason
            </button>
            <button onClick={() => onView(rx)}
              className="flex-1 py-2 bg-secondary text-on-secondary text-xs font-semibold rounded-lg hover:opacity-90 transition">
              Re-upload
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onView(rx)}
              className="flex-1 py-2 text-primary text-xs font-semibold hover:bg-primary/5 rounded-lg transition">
              View
            </button>
            {linkedOrderId && (
              <Link to={`/dashboard/orders/${linkedOrderId}`}
                className="flex-1 py-2 text-secondary text-xs font-semibold hover:bg-secondary/5 rounded-lg transition text-center">
                View Order
              </Link>
            )}
            <button onClick={() => onDelete(rx.id)}
              className="p-2 text-on-surface-variant hover:text-error rounded-lg transition">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Prescriptions() {
  const fileRef = useRef()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading]             = useState(true)
  const [dragActive, setDragActive]       = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading]         = useState(false)
  const [uploadError, setUploadError]     = useState('')
  const [prescriptionName, setPrescriptionName] = useState('')
  const [viewRx, setViewRx]               = useState(null)
  const [rejectedRx, setRejectedRx]       = useState(null)

  const load = useCallback(() => {
    api.get('/prescriptions')
      .then(res => setPrescriptions(res.data.data.prescriptions || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => /\.(jpg|jpeg|png|pdf)$/i.test(f.name))
    setSelectedFiles(valid)
    setUploadError('')
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) return
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      selectedFiles.forEach(f => fd.append('files', f))
      if (prescriptionName.trim()) fd.append('doctor', prescriptionName.trim())
      await api.post('/prescriptions', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSelectedFiles([])
      setPrescriptionName('')
      load()
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this prescription?')) return
    try {
      await api.delete(`/prescriptions/${id}`)
      setPrescriptions(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  const handleReupload = (rx) => {
    setRejectedRx(null)
    setViewRx(null)
    fileRef.current?.click()
  }

  const stats = {
    total:    prescriptions.length,
    approved: prescriptions.filter(r => r.status === 'VERIFIED').length,
    pending:  prescriptions.filter(r => r.status === 'PENDING').length,
    rejected: prescriptions.filter(r => r.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-5">
      {viewRx    && <PreviewModal   prescription={viewRx}    onClose={() => setViewRx(null)} />}
      {rejectedRx && <RejectionModal prescription={rejectedRx} onClose={() => setRejectedRx(null)} onReupload={() => handleReupload(rejectedRx)} />}

      <div>
        <h2 className="text-2xl font-bold text-on-surface">My Prescriptions</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage and track your digital prescription uploads.</p>
      </div>

      {!loading && prescriptions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: stats.total,    icon: 'description',  color: 'text-secondary bg-secondary/10' },
            { label: 'Approved', value: stats.approved, icon: 'verified',     color: 'text-primary bg-primary/10' },
            { label: 'Pending',  value: stats.pending,  icon: 'schedule',     color: 'text-amber-600 bg-amber-50' },
            { label: 'Rejected', value: stats.rejected, icon: 'cancel',       color: 'text-error bg-error/10' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-on-surface leading-none">{s.value}</p>
                <p className="text-xs text-on-surface-variant">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 sticky top-20 flex flex-col gap-4">
            <h3 className="text-base font-bold text-on-surface">Upload New</h3>

            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileRef.current?.click()}
              className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center ${
                dragActive ? 'border-primary bg-primary/5' : selectedFiles.length ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'
              }`}
            >
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className="hidden"
                onChange={e => handleFiles(e.target.files)} />

              {selectedFiles.length ? (
                <>
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</p>
                  <p className="text-xs text-on-surface-variant mt-1">{selectedFiles.map(f => f.name).join(', ')}</p>
                  <p className="text-xs text-primary mt-2 hover:underline">Click to change</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '36px' }}>cloud_upload</span>
                  </div>
                  <p className="text-base font-semibold text-on-surface">Drag & drop here</p>
                  <p className="text-xs text-on-surface-variant mt-1">or</p>
                  <span className="mt-3 px-5 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg">Browse Files</span>
                  <div className="mt-5 pt-4 border-t border-outline-variant w-full flex justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>picture_as_pdf</span>
                      <span className="text-[10px] font-bold text-on-surface-variant">PDF</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px' }}>image</span>
                      <span className="text-[10px] font-bold text-on-surface-variant">JPG / PNG</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Prescription Name <span className="opacity-50">(optional)</span></label>
              <input
                type="text"
                value={prescriptionName}
                onChange={e => setPrescriptionName(e.target.value)}
                placeholder="e.g. Dr. Sharma - Cardiac Checkup"
                className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition"
              />
            </div>

            {uploadError && (
              <p className="text-xs text-error bg-error/5 border border-error/20 rounded-lg px-3 py-2">{uploadError}</p>
            )}

            <button onClick={handleUpload} disabled={!selectedFiles.length || uploading}
              className="w-full py-3 bg-primary text-on-primary text-sm font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition flex items-center justify-center gap-2">
              {uploading
                ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span> Uploading…</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span> Upload Prescription</>}
            </button>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/30">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1.5">Requirements</p>
              <ul className="text-[11px] text-amber-700 dark:text-amber-400 space-y-1 list-disc pl-3 leading-relaxed">
                <li>Issued by a licensed doctor</li>
                <li>Clear, legible text - no blur</li>
                <li>Full document visible in frame</li>
                <li>PDF, JPG, or PNG - max 5 MB</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-on-surface">Recent Uploads</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-surface-container rounded-xl animate-pulse" />
              ))}
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '40px' }}>folder_off</span>
              </div>
              <h3 className="text-base font-bold text-on-surface mb-2">No prescriptions yet</h3>
              <p className="text-sm text-on-surface-variant max-w-xs">Upload your first prescription to start managing your medication orders securely.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map(rx => (
                <PrescriptionCard
                  key={rx.id}
                  rx={rx}
                  onView={setViewRx}
                  onViewReason={setRejectedRx}
                  onDelete={handleDelete}
                />
              ))}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer opacity-50 hover:opacity-80 hover:border-primary/50 transition-all select-none"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>add_circle</span>
                <p className="text-xs font-semibold mt-2">Add more files</p>
              </div>
            </div>
          )}
        </section>
      </div>

    </div>
  )
}
