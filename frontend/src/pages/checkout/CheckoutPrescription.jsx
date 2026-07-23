import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import checkoutStore from '../../lib/checkoutStore'
import CheckoutSteps from '../../components/checkout/CheckoutSteps'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function fileFullUrl(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${BACKEND}${url}`
}

function isPdf(name) {
  return name?.toLowerCase().endsWith('.pdf')
}

function parseFileUrls(fileUrl) {
  if (!fileUrl) return []
  try {
    const parsed = JSON.parse(fileUrl)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return [fileUrl]
}

function parseFileNames(fileName) {
  return fileName ? fileName.split(', ') : []
}

function PreviewModal({ prescription, onClose, localFiles }) {
  const [imgError, setImgError] = useState(false)

  const pages = localFiles
    ? localFiles
        .filter(f => f instanceof File || f instanceof Blob)
        .map(f => ({ url: URL.createObjectURL(f), name: f.name, isLocal: true }))
    : parseFileUrls(prescription?.fileUrl).map((url, i) => ({
        url: fileFullUrl(url),
        name: parseFileNames(prescription?.fileName)[i] || `Page ${i + 1}`,
        isLocal: false,
      }))

  const [page, setPage] = useState(0)
  const current = pages[page] || {}
  const total = pages.length

  const handleKey = useCallback(e => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight' && page < total - 1) setPage(p => p + 1)
    if (e.key === 'ArrowLeft' && page > 0) setPage(p => p - 1)
  }, [onClose, page, total])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      if (localFiles) pages.forEach(p => URL.revokeObjectURL(p.url))
    }
  }, [handleKey])

  useEffect(() => { setImgError(false) }, [page])

  if (total === 0) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}>
        <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant p-8 text-center max-w-sm w-full"
          onClick={e => e.stopPropagation()}>
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>description</span>
          <p className="text-sm text-on-surface-variant mt-3">
            {localFiles
              ? 'Preview is not available. The file may have been lost on page reload — please re-attach.'
              : 'No file URL available for this prescription.'}
          </p>
          <button onClick={onClose}
            className="mt-4 px-5 py-2 rounded-xl border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition-colors">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined text-secondary flex-shrink-0"
              style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
              {isPdf(current.name) ? 'picture_as_pdf' : 'image'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{current.name}</p>
              {prescription && <StatusBadge status={prescription.status} />}
              {localFiles && <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">Not uploaded yet</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!current.isLocal && current.url && (
              <a href={current.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                Open
              </a>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>
        </div>

        {total > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-2.5 border-b border-outline-variant bg-surface-container-low flex-shrink-0">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5">
              {pages.map((_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-primary scale-125' : 'bg-outline-variant hover:bg-outline'}`} />
              ))}
            </div>
            <span className="text-xs text-on-surface-variant font-medium">Page {page + 1} of {total}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === total - 1}
              className="p-1.5 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-surface-container-low min-h-0 flex items-center justify-center">
          {isPdf(current.name) ? (
            <iframe src={current.url} title={current.name}
              className="w-full h-full min-h-[60vh]" style={{ border: 'none' }} />
          ) : imgError ? (
            <div className="flex flex-col items-center gap-2 text-on-surface-variant p-8">
              <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>broken_image</span>
              <p className="text-sm">Could not load image.</p>
              {!current.isLocal && (
                <a href={current.url} target="_blank" rel="noopener noreferrer"
                  className="mt-2 text-xs text-secondary underline">
                  Try opening directly
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 w-full min-h-[60vh]">
              <img src={current.url} alt={current.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                onError={() => setImgError(true)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024

function validateFiles(files) {
  for (const f of files) {
    if (!ALLOWED_TYPES.includes(f.type)) return `"${f.name}" is not a supported type. Use JPG, PNG or PDF.`
    if (f.size > MAX_SIZE) return `"${f.name}" exceeds the 10 MB limit.`
  }
  return null
}

function PrescriptionSlot({ item, assignment, previousRx, onAssign, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('upload')
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])
  const fileRef = useRef()

  const med = item.medicine
  const isRx = med.type === 'Rx'
  const pageCount = assignment
    ? (assignment.isDraft ? (checkoutStore.get(med.id)?.files.length ?? 0) : parseFileUrls(assignment.fileUrl).length)
    : 0

  useEffect(() => {
    if (expanded && assignment?.isDraft) {
      const staged = checkoutStore.get(med.id)
      if (staged) setPendingFiles(staged.files)
    }
  }, [expanded])

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles)
    const err = validateFiles(arr)
    if (err) { setError(err); return }
    setError('')
    setPendingFiles(prev => [...prev, ...arr])
  }

  const removePending = (idx) => setPendingFiles(prev => prev.filter((_, i) => i !== idx))

  const handleAttach = () => {
    if (pendingFiles.length === 0) { setError('Add at least one file.'); return }
    setError('')
    checkoutStore.stage(med.id, [...pendingFiles])
    onAssign({
      id: `staged:${med.id}`,
      isNew: true,
      isDraft: true,
      fileName: pendingFiles.map(f => f.name).join(', '),
      fileUrl: null,
      status: 'PENDING',
      localFiles: [...pendingFiles],
    })
    setPendingFiles([])
    setExpanded(false)
  }

  const iconName = isRx ? 'medical_services' : 'local_pharmacy'

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all ${
      assignment ? 'border-primary bg-primary/5'
        : isRx ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700'
        : 'border-outline-variant'
    }`}>
      <div className="flex items-center gap-3 p-4">
        <div className={`p-2 rounded-lg flex-shrink-0 ${isRx ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 'bg-surface-container text-on-surface-variant'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-on-surface">{med.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isRx ? 'bg-amber-500 text-white' : 'bg-primary/10 text-primary'}`}>{med.type}</span>
            {isRx && !assignment && <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">Required</span>}
            {!isRx && <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Optional</span>}
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">{med.brand} · Qty: {item.quantity}</p>
        </div>

        {assignment ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {pageCount > 1 ? `${pageCount} pages` : assignment.isNew ? 'Uploaded' : 'Selected'}
            </div>
            <button onClick={() => { if (assignment?.isDraft) checkoutStore.remove(med.id); onRemove(); setPendingFiles([]); setExpanded(false) }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
            <button onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{expanded ? 'expand_less' : 'edit'}</span>
            </button>
          </div>
        ) : (
          <button onClick={() => setExpanded(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
              expanded ? 'bg-surface-container text-on-surface'
                : isRx ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
            }`}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{expanded ? 'expand_less' : 'upload_file'}</span>
            {expanded ? 'Collapse' : isRx ? 'Upload' : 'Add (optional)'}
          </button>
        )}
      </div>

      {assignment && !expanded && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>description</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate">{assignment.fileName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {assignment.isDraft
                  ? <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">Attached - not uploaded yet</span>
                  : <StatusBadge status={assignment.status} />
                }
                {pageCount > 1 && <span className="text-[10px] text-on-surface-variant">{pageCount} pages</span>}
              </div>
            </div>
            <button onClick={() => {
                if (assignment.isDraft) {
                  const files = checkoutStore.get(med.id)?.files || []
                  setPreview({ localFiles: files.length > 0 ? files : assignment.localFiles })
                } else {
                  setPreview({ prescription: assignment })
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-secondary hover:bg-secondary/10 transition-colors flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
              {pageCount > 1 ? `Preview (${pageCount})` : 'Preview'}
            </button>
          </div>
        </div>
      )}

      {preview && (
        <PreviewModal
          prescription={preview.prescription || null}
          localFiles={preview.localFiles || null}
          onClose={() => setPreview(null)}
        />
      )}

      {expanded && (
        <div className="border-t border-outline-variant bg-surface-container-lowest">
          <div className="flex border-b border-outline-variant">
            {['upload', 'previous'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {t === 'upload' ? '📤 Upload New' : '📋 Use Previous'}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'upload' ? (
              <div className="space-y-3">
                {pendingFiles.length > 0 && (
                  <div className="space-y-2">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant">
                        <span className="material-symbols-outlined text-secondary flex-shrink-0"
                          style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                          {isPdf(f.name) ? 'picture_as_pdf' : 'image'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{f.name}</p>
                          <p className="text-[10px] text-on-surface-variant">
                            Page {i + 1} · {(f.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button onClick={() => setPreview({ localFiles: [f] })}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-secondary/10 hover:text-secondary transition-colors flex-shrink-0">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
                        </button>
                        <button onClick={() => removePending(i)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors flex-shrink-0">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragging ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/50 hover:bg-surface-container-low'
                    }`}>
                    <span className="material-symbols-outlined text-secondary mb-1.5"
                      style={{ fontSize: '30px', fontVariationSettings: "'FILL' 1" }}>add_photo_alternate</span>
                    <p className="text-sm font-semibold text-on-surface">
                      {pendingFiles.length === 0 ? 'Drop pages here or click to browse' : 'Add more pages'}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">JPG, PNG, PDF · Max 10 MB each · Multiple files allowed</p>
                    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className="hidden"
                      onChange={e => { addFiles(e.target.files); e.target.value = '' }} />
                </div>









                {error && <p className="text-xs text-error">{error}</p>}

                {pendingFiles.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {pendingFiles.length > 1 && (
                      <button onClick={() => setPreview({ localFiles: pendingFiles })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                        Preview all
                      </button>
                    )}
                    <button onClick={handleAttach}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>attach_file</span>
                      Attach {pendingFiles.length} page{pendingFiles.length > 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <PreviousList
                previousRx={previousRx}
                onSelect={rx => { onAssign({ ...rx, isNew: false }); setPendingFiles([]); setExpanded(false) }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PreviousList({ previousRx, onSelect }) {
  const [preview, setPreview] = useState(null)

  if (previousRx.length === 0) {
    return (
      <div className="text-center py-6">
        <span className="material-symbols-outlined text-on-surface-variant/40 mb-2" style={{ fontSize: '36px' }}>folder_open</span>
        <p className="text-sm text-on-surface-variant">No previous prescriptions found.</p>
        <p className="text-xs text-on-surface-variant mt-1">Switch to "Upload New" to add one.</p>
      </div>
    )
  }
  return (
    <>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {previousRx.map(rx => {
          const pages = parseFileUrls(rx.fileUrl).length
          return (
            <div key={rx.id} className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                {pages > 1 ? 'auto_stories' : isPdf(rx.fileName) ? 'picture_as_pdf' : 'image'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-on-surface truncate">{rx.fileName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={rx.status} />
                  {pages > 1 && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{pages} pages</span>}
                  <span className="text-[10px] text-on-surface-variant">
                    {new Date(rx.uploadedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <button onClick={() => setPreview(rx)}
                className="flex-shrink-0 p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
              </button>
              <button onClick={() => onSelect(rx)}
                className="flex-shrink-0 px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-all">
                Use
              </button>
            </div>
          )
        })}
      </div>
      {preview && <PreviewModal prescription={preview} localFiles={null} onClose={() => setPreview(null)} />}
    </>
  )
}

function StatusBadge({ status }) {
  const map = {
    VERIFIED: { label: 'Verified', cls: 'text-primary bg-primary/10' },
    PENDING: { label: 'Pending', cls: 'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400' },
    REJECTED: { label: 'Rejected', cls: 'text-error bg-error/10' },
    EXPIRED: { label: 'Expired', cls: 'text-on-surface-variant bg-surface-container' },
  }
  const { label, cls } = map[status] || map.PENDING
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>
}

function usePersistedAssignments() {
  const [assignments, _setAssignments] = useState(() => {
    try {
      const raw = sessionStorage.getItem('checkoutRxDraft')
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  })

  const setAssignments = useCallback((updater) => {
    _setAssignments(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try { sessionStorage.setItem('checkoutRxDraft', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  return [assignments, setAssignments]
}

export default function CheckoutPrescription() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)
  const [previousRx, setPreviousRx] = useState([])
  const [assignments, setAssignments] = usePersistedAssignments()

  useEffect(() => {
    if (!sessionStorage.getItem('checkoutAllowed')) {
      navigate('/dashboard/cart', { replace: true }); return
    }
    api.get('/cart')
      .then(res => setCartItems(res.data.data.cart.items || []))
      .catch(() => {})
      .finally(() => setCartLoading(false))
    api.get('/prescriptions')
      .then(res => setPreviousRx(res.data.data.prescriptions || []))
      .catch(() => {})
  }, [])

  const rxItems = cartItems.filter(i => i.medicine.type === 'Rx')
  const otcItems = cartItems.filter(i => i.medicine.type === 'OTC')
  const rxFilled = rxItems.filter(i => assignments[i.medicine.id]).length
  const allRxFilled = rxFilled === rxItems.length
  const subtotal = cartItems.reduce((s, i) => s + Number(i.medicine.price) * i.quantity, 0)
  const delivery = subtotal > 0 && subtotal >= 500 ? 0 : 80

  const handleContinue = () => {
    const existing = JSON.parse(sessionStorage.getItem('checkoutPrescriptions') || '{}')
    const map = { ...existing }
    Object.entries(assignments).forEach(([medId, rx]) => {
      const currentId = map[medId]
      const newId = rx.id
      if (!currentId || String(currentId).startsWith('staged:') || !String(newId).startsWith('staged:')) {
        map[medId] = newId
      }
    })
    sessionStorage.setItem('checkoutPrescriptions', JSON.stringify(map))
    navigate('/dashboard/checkout/payment')
  }

  return (
    <div className="space-y-4">
      <CheckoutSteps current={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">

          {cartLoading ? (
            <div className="h-16 bg-surface-container-low rounded-2xl animate-pulse" />
          ) : rxItems.length > 0 ? (
            <div className={`rounded-2xl p-4 border flex items-start gap-3 ${
              allRxFilled
                ? 'bg-primary/5 border-primary/20'
                : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            }`}>
              <span className={`material-symbols-outlined flex-shrink-0 ${allRxFilled ? 'text-primary' : 'text-amber-600 dark:text-amber-400'}`}
                style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                {allRxFilled ? 'check_circle' : 'warning'}
              </span>
              <div>
                <p className={`text-sm font-semibold ${allRxFilled ? 'text-primary' : 'text-amber-800 dark:text-amber-300'}`}>
                  {allRxFilled
                    ? 'All required prescriptions uploaded'
                    : `${rxItems.length - rxFilled} of ${rxItems.length} required prescription${rxItems.length > 1 ? 's' : ''} missing`}
                </p>
                <p className={`text-xs mt-0.5 ${allRxFilled ? 'text-primary/70' : 'text-amber-700 dark:text-amber-400'}`}>
                  {allRxFilled
                    ? 'You can proceed to payment. Our pharmacist will verify before shipping.'
                    : 'Upload a prescription for each Rx medicine below. OTC medicines are optional.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div>
                <p className="text-sm font-semibold text-primary">No prescription required</p>
                <p className="text-xs text-on-surface-variant mt-0.5">All items are OTC - you can skip this step or add prescriptions optionally.</p>
              </div>
            </div>
          )}

          {!cartLoading && rxItems.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>lock</span>
                <h2 className="text-[15px] font-semibold text-on-surface">Prescription Required</h2>
                <span className="ml-auto text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                  {rxFilled}/{rxItems.length} done
                </span>
              </div>
              <div className="space-y-3">
                {rxItems.map(item => (
                  <PrescriptionSlot
                    key={item.id}
                    item={item}
                    assignment={assignments[item.medicine.id]}
                    previousRx={previousRx}
                    onAssign={rx => setAssignments(prev => ({ ...prev, [item.medicine.id]: rx }))}
                    onRemove={() => setAssignments(prev => { const n = { ...prev }; delete n[item.medicine.id]; return n })}
                  />
                ))}
              </div>
            </div>
          )}

          {!cartLoading && otcItems.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>local_pharmacy</span>
                <h2 className="text-[15px] font-semibold text-on-surface">Over-the-Counter Medicines</h2>
                <span className="ml-auto text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  Prescription optional
                </span>
              </div>
              <div className="space-y-3">
                {otcItems.map(item => (
                  <PrescriptionSlot
                    key={item.id}
                    item={item}
                    assignment={assignments[item.medicine.id]}
                    previousRx={previousRx}
                    onAssign={rx => setAssignments(prev => ({ ...prev, [item.medicine.id]: rx }))}
                    onRemove={() => setAssignments(prev => { const n = { ...prev }; delete n[item.medicine.id]; return n })}
                  />
                ))}
              </div>
            </div>
          )}

          {cartLoading && (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-24 bg-surface-container-low rounded-xl animate-pulse" />)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5 h-fit">
            <h3 className="text-sm font-semibold text-on-surface mb-1">Prescription Status</h3>

            {!cartLoading && (
              <div className="space-y-2 mb-4 mt-3">
                {rxItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <span className={`material-symbols-outlined flex-shrink-0 ${assignments[item.medicine.id] ? 'text-primary' : 'text-amber-500'}`}
                      style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                      {assignments[item.medicine.id] ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`truncate font-medium ${assignments[item.medicine.id] ? 'text-on-surface' : 'text-amber-700 dark:text-amber-400'}`}>
                      {item.medicine.name}
                    </span>
                    <span className="ml-auto text-[10px] font-bold text-amber-600 flex-shrink-0">Rx</span>
                  </div>
                ))}
                {otcItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className={`material-symbols-outlined flex-shrink-0 ${assignments[item.medicine.id] ? 'text-primary' : 'text-outline'}`}
                      style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                      {assignments[item.medicine.id] ? 'check_circle' : 'circle'}
                    </span>
                    <span className="truncate">{item.medicine.name}</span>
                    <span className="ml-auto text-[10px] font-medium text-primary flex-shrink-0">OTC</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={rxItems.length > 0 && !allRxFilled}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-on-primary hover:opacity-90">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payment</span>
              {rxItems.length === 0 ? 'Continue to Payment' : 'Submit & Continue'}
            </button>

            {rxItems.length > 0 && !allRxFilled && (
              <p className="text-[11px] text-center text-amber-700 dark:text-amber-400 mt-2">
                {rxItems.length - rxFilled} prescription{rxItems.length - rxFilled > 1 ? 's' : ''} still needed
              </p>
            )}

            <Link to="/dashboard/checkout/shipping"
              className="mt-3 flex items-center justify-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back to Shipping
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5">
            <h2 className="text-[15px] font-semibold text-on-surface mb-3">Order Summary</h2>
            <div className="space-y-2.5 mb-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{item.medicine.name} × {item.quantity}</span>
                  <span className="font-medium text-on-surface">NPR {(Number(item.medicine.price) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-medium">NPR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Delivery</span>
                <span className={`font-medium ${delivery === 0 ? 'text-primary' : 'text-on-surface'}`}>
                  {delivery === 0 ? 'FREE' : `NPR ${delivery}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-outline-variant pt-2">
                <span>Total</span>
                <span>NPR {(subtotal + delivery).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
