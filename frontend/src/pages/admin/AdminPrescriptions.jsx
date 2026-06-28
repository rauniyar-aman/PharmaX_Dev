import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const STATUS_CFG = {
  PENDING:  { label: 'Pending',  bg: 'bg-amber-100 text-amber-700',           dot: 'bg-amber-500' },
  VERIFIED: { label: 'Approved', bg: 'bg-primary/10 text-primary',             dot: 'bg-primary' },
  REJECTED: { label: 'Rejected', bg: 'bg-error-container text-on-error-container', dot: 'bg-error' },
  EXPIRED:  { label: 'Expired',  bg: 'bg-surface-container-highest text-on-surface-variant', dot: 'bg-outline' },
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function parseUrls(fileUrl) {
  try { const p = JSON.parse(fileUrl); if (Array.isArray(p)) return p } catch {}
  return fileUrl ? [fileUrl] : []
}

// ─── Verification Side Panel ──────────────────────────────────────────────────
function VerificationPanel({ rx, onClose, onUpdate, orderId }) {
  const navigate = useNavigate()
  const [rejectionReason, setRejectionReason] = useState(rx.rejectionReason || '')
  const [loading, setLoading]   = useState(false)
  const [actionDone, setActionDone] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [revokeMode, setRevokeMode] = useState(false)

  const urls     = parseUrls(rx.fileUrl)
  const activeUrl = urls[previewIndex] ? `${BACKEND}${urls[previewIndex]}` : null
  const firstUrl  = urls[0] ? `${BACKEND}${urls[0]}` : null
  const isPdf     = activeUrl?.toLowerCase().endsWith('.pdf')
  const user      = rx.user || {}
  const cfg       = STATUS_CFG[rx.status] || STATUS_CFG.PENDING
  const linkedOrderId = rx.orderItems?.[0]?.orderId

  const submitAction = async (status) => {
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please enter a reason for rejection before submitting.')
      return
    }
    setLoading(true)
    try {
      const res = await api.put(`/admin/prescriptions/${rx.id}`, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason.trim() : undefined,
      })
      onUpdate(res.data.data.prescription)
      if (orderId) { setActionDone(true) } else { onClose() }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Full-screen image / PDF preview */}
      {previewOpen && activeUrl && (
        <div className="fixed inset-0 z-[80] bg-black/90 flex flex-col" onClick={() => setPreviewOpen(false)}>
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <p className="text-white text-sm font-semibold">{rx.fileName} {urls.length > 1 && `(${previewIndex + 1}/${urls.length})`}</p>
            <div className="flex items-center gap-2">
              <a href={activeUrl} download onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded-lg text-xs hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>Download
              </a>
              <button className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors" onClick={() => setPreviewOpen(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 pb-4" onClick={e => e.stopPropagation()}>
            {isPdf
              ? <iframe src={activeUrl} className="w-full h-full max-w-4xl rounded-xl" title="Prescription" />
              : <img src={activeUrl} alt="Prescription" className="max-w-full max-h-full rounded-xl object-contain" />}
          </div>
          {/* Multi-page dots */}
          {urls.length > 1 && (
            <div className="flex items-center justify-center gap-3 pb-6" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewIndex(i => Math.max(0, i - 1))} disabled={previewIndex === 0}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              {urls.map((_, i) => (
                <button key={i} onClick={() => setPreviewIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === previewIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
              ))}
              <button onClick={() => setPreviewIndex(i => Math.min(urls.length - 1, i + 1))} disabled={previewIndex === urls.length - 1}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="fixed inset-y-0 right-0 w-full max-w-[480px] bg-surface-container-lowest shadow-2xl z-[60] border-l border-outline-variant flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
            <div>
              <h2 className="text-base font-bold text-on-surface">Verification Review</h2>
              <p className="text-[11px] text-on-surface-variant font-mono">#{rx.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${cfg.bg}`}>{cfg.label}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Customer info */}
          <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-lg">
              {user.avatarUrl
                ? <img src={`${BACKEND}${user.avatarUrl}`} className="w-full h-full object-cover" alt={user.fullName} />
                : initials(user.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-on-surface">{user.fullName || '-'}</p>
              <p className="text-sm text-on-surface-variant">{user.email}</p>
              {user.phone && <p className="text-sm text-on-surface-variant">{user.phone}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {linkedOrderId && (
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded uppercase">
                    Order #{linkedOrderId.slice(0, 8).toUpperCase()}
                  </span>
                )}
                {user.createdAt && (
                  <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Prescription document viewer */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Prescription Document</p>
            <div className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-outline-variant bg-surface-container"
              onClick={() => firstUrl && setPreviewOpen(true)}>
              <div className="aspect-[3/4]">
                {firstUrl ? (
                  isPdf ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '56px' }}>picture_as_pdf</span>
                      <p className="text-sm font-medium">PDF Document</p>
                      <p className="text-xs opacity-60">{rx.fileName}</p>
                    </div>
                  ) : (
                    <img src={firstUrl} alt="Prescription" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>description</span>
                    <p className="text-sm">No document attached</p>
                  </div>
                )}
              </div>
              {firstUrl && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white text-on-surface px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>zoom_in</span>
                    View Full Screen
                  </div>
                </div>
              )}
            </div>
            {urls.length > 1 && (
              <p className="text-xs text-on-surface-variant text-center">{urls.length} pages - click to open viewer</p>
            )}
            {firstUrl && (
              <a href={firstUrl} download
                className="flex items-center justify-center gap-2 py-2 border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                Download Document
              </a>
            )}
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Uploaded</p>
              <p className="text-sm font-semibold text-on-surface">{fmtDate(rx.uploadedAt)}</p>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">File</p>
              <p className="text-sm font-semibold text-on-surface truncate">{rx.fileName}</p>
            </div>
            {rx.doctor && (
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant col-span-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Prescribing Doctor</p>
                <p className="text-sm font-semibold text-on-surface">{rx.doctor}{rx.hospital ? ` - ${rx.hospital}` : ''}</p>
              </div>
            )}
          </div>

          {/* ── Status-specific sections ── */}

          {/* PENDING: rejection reason input */}
          {rx.status === 'PENDING' && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Rejection Reason <span className="normal-case font-normal">(required only when rejecting)</span>
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Prescription expired, medicine not listed, unclear handwriting, wrong dosage…"
                rows={3}
                className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
              />
            </div>
          )}

          {/* VERIFIED: approved banner + optional revoke section */}
          {rx.status === 'VERIFIED' && !revokeMode && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <div>
                <p className="text-sm font-bold text-primary">Prescription Approved</p>
                <p className="text-xs text-on-surface-variant mt-0.5">This prescription has been verified and cleared for order processing.</p>
              </div>
            </div>
          )}

          {/* VERIFIED: revoke mode - show reason textarea */}
          {rx.status === 'VERIFIED' && revokeMode && (
            <div className="p-4 bg-error/5 border border-error/20 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
                <p className="text-sm font-bold">Revoking Approval</p>
              </div>
              <p className="text-xs text-on-surface-variant">Explain why you are revoking this approval. The customer will see this reason.</p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Found discrepancy in prescription details, requires re-verification…"
                rows={3}
                className="w-full p-3 rounded-xl border border-error/30 bg-surface-container-lowest focus:ring-2 focus:ring-error outline-none text-sm resize-none"
                autoFocus
              />
            </div>
          )}

          {/* REJECTED: read-only rejection reason */}
          {rx.status === 'REJECTED' && (
            <div className="p-4 bg-error/5 border border-error/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>cancel</span>
                <p className="text-sm font-bold">Rejection Reason</p>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">
                {rx.rejectionReason || <span className="text-on-surface-variant italic">No reason recorded.</span>}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-outline-variant bg-surface-container-low space-y-2">
          {actionDone && orderId && (
            <button
              onClick={() => navigate(`/admin/orders?orderId=${orderId}`)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-sm mb-1">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              Back to Order #{orderId.slice(0, 8).toUpperCase()}
            </button>
          )}
          {rx.status === 'PENDING' && (
            <div className="flex gap-3">
              <button onClick={() => submitAction('REJECTED')} disabled={loading}
                className="flex-1 py-3 bg-error/10 text-error border border-error/20 rounded-xl text-sm font-bold hover:bg-error hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                {loading ? '…' : 'Reject'}
              </button>
              <button onClick={() => submitAction('VERIFIED')} disabled={loading}
                className="flex-1 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                {loading ? 'Approving…' : 'Approve'}
              </button>
            </div>
          )}

          {rx.status === 'VERIFIED' && !revokeMode && (
            <div className="flex gap-3">
              <button onClick={() => { setPreviewOpen(true) }}
                className="flex-1 py-3 bg-surface-container-high text-on-surface border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>zoom_in</span>
                View Document
              </button>
              <button onClick={() => setRevokeMode(true)}
                className="flex-1 py-3 bg-error/10 text-error border border-error/20 rounded-xl text-sm font-bold hover:bg-error/20 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>undo</span>
                Revoke Approval
              </button>
            </div>
          )}

          {rx.status === 'VERIFIED' && revokeMode && (
            <div className="flex gap-3">
              <button onClick={() => { setRevokeMode(false); setRejectionReason('') }}
                className="flex-1 py-3 border border-outline-variant text-on-surface rounded-xl text-sm font-bold hover:bg-surface-container transition-all">
                Cancel
              </button>
              <button onClick={() => submitAction('REJECTED')} disabled={loading}
                className="flex-1 py-3 bg-error text-on-error rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>undo</span>
                {loading ? 'Revoking…' : 'Confirm Revoke'}
              </button>
            </div>
          )}

          {rx.status === 'REJECTED' && (
            <button onClick={onClose}
              className="w-full py-3 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPrescriptions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [prescriptions, setPrescriptions] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab]       = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const [pages, setPages]   = useState(1)
  const [total, setTotal]   = useState(0)
  const [selectedRx, setSelectedRx] = useState(null)
  const [linkedOrderId, setLinkedOrderId] = useState(null)
  const [exporting, setExporting] = useState(false)
  const searchRef = useRef()
  const autoPrescriptionId = searchParams.get('prescriptionId')
  const autoOrderId        = searchParams.get('orderId')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (tab)    params.status = tab
      if (search) params.search = search
      if (autoPrescriptionId && !search) params.search = autoPrescriptionId

      const rxRes = await api.get('/admin/prescriptions', { params })
      const d = rxRes.data.data
      const loaded = d.prescriptions || []
      setPrescriptions(loaded)
      setPages(d.pagination.pages)
      setTotal(d.pagination.total)
      setStatusCounts(d.statusCounts || {})

      if (autoPrescriptionId) {
        const match = loaded.find(r => r.id === autoPrescriptionId)
        if (match) {
          setSelectedRx(match)
          if (autoOrderId) setLinkedOrderId(autoOrderId)
        }
        setSearchParams({}, { replace: true })
      }
    } catch {}
    finally { setLoading(false) }
  }, [page, tab, search, autoPrescriptionId])

  useEffect(() => { load() }, [load])

  const handleUpdate = (updated) => {
    setPrescriptions(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
    if (selectedRx?.id === updated.id) setSelectedRx(prev => ({ ...prev, ...updated }))
  }

  const totalAll     = (statusCounts.PENDING || 0) + (statusCounts.VERIFIED || 0) + (statusCounts.REJECTED || 0) + (statusCounts.EXPIRED || 0)
  const pendingCount = statusCounts.PENDING || 0

  const statCards = [
    { label: 'Total',    value: totalAll,                    icon: 'history_edu',     color: 'text-secondary bg-secondary/10' },
    { label: 'Pending',  value: pendingCount,                icon: 'pending_actions', color: 'text-amber-700 bg-amber-100' },
    { label: 'Approved', value: statusCounts.VERIFIED || 0,  icon: 'check_circle',    color: 'text-primary bg-primary/10' },
    { label: 'Rejected', value: statusCounts.REJECTED || 0,  icon: 'cancel',          color: 'text-error bg-error/10' },
  ]

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/admin/prescriptions', { params: { limit: 1000 } })
      const rows = res.data.data.prescriptions || []
      const header = ['ID', 'Customer', 'Email', 'Phone', 'Status', 'File', 'Uploaded', 'Order ID']
      const csv = [
        header.join(','),
        ...rows.map(r => [
          r.id,
          `"${r.user?.fullName || ''}"`,
          r.user?.email || '',
          r.user?.phone || '',
          r.status,
          `"${r.fileName || ''}"`,
          r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : '',
          r.orderItems?.[0]?.orderId || '',
        ].join(',')),
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `prescriptions_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
    setExporting(false)
  }

  return (
    <div className="space-y-6 relative">
      {/* Backdrop */}
      {selectedRx && (
        <div className="fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50" onClick={() => setSelectedRx(null)} />
      )}
      {selectedRx && (
        <VerificationPanel rx={selectedRx} onClose={() => { setSelectedRx(null); setLinkedOrderId(null) }} onUpdate={handleUpdate} orderId={linkedOrderId} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-on-surface-variant">Verify and approve medicine requests from registered customers.</p>
        </div>
        <button onClick={handleExport} disabled={exporting}
          className="self-start px-4 py-2 border border-outline-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container flex items-center gap-2 transition-all disabled:opacity-50">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{exporting ? 'hourglass_top' : 'file_download'}</span>
          {exporting ? 'Exporting…' : 'Export Data'}
        </button>
      </div>

      {/* Priority alert */}
      {pendingCount > 0 && (
        <div className="bg-error-container border-l-4 border-error p-4 rounded-r-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center text-error flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>priority_high</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-error-container">Critical Priority Queue</p>
              <p className="text-xs text-on-error-container/80">{pendingCount} prescription{pendingCount !== 1 ? 's' : ''} pending verification. Review and action required.</p>
            </div>
          </div>
          <button onClick={() => { setTab('PENDING'); setPage(1) }}
            className="text-error text-sm font-bold hover:underline flex-shrink-0 ml-4">
            View Pending
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">{s.label} Prescriptions</p>
            <h3 className="text-3xl font-bold text-on-surface mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filter row */}
        <div className="p-4 border-b border-outline-variant flex flex-wrap items-center gap-4">
          {/* Tab filter */}
          <div className="flex border border-outline-variant rounded-xl overflow-hidden flex-shrink-0">
            {[['', 'All'], ['PENDING', 'Pending'], ['VERIFIED', 'Approved'], ['REJECTED', 'Rejected']].map(([val, lbl]) => (
              <button key={val}
                onClick={() => { setTab(val); setPage(1) }}
                className={`px-4 py-2 text-sm font-semibold border-r border-outline-variant last:border-0 transition-colors ${tab === val ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                {lbl}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="flex-1 min-w-[220px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
            <input ref={searchRef} type="text" placeholder="Search by patient name or ID…"
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-surface-container-lowest"
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(e.target.value); setPage(1) } }} />
          </div>
          {(search || tab) && (
            <button onClick={() => { setSearch(''); setTab(''); setPage(1); if (searchRef.current) searchRef.current.value = '' }}
              className="p-2 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors text-on-surface-variant" title="Clear filters">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list_off</span>
            </button>
          )}
          <p className="text-sm text-on-surface-variant ml-auto">Showing {prescriptions.length} of {total}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['ID', 'Customer', 'Date', 'Order Link', 'Preview', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>folder_off</span>
                    <p className="text-sm mt-2">No prescriptions found</p>
                  </td>
                </tr>
              ) : prescriptions.map(rx => {
                const cfg        = STATUS_CFG[rx.status] || STATUS_CFG.PENDING
                const user       = rx.user || {}
                const urls       = parseUrls(rx.fileUrl)
                const thumbUrl   = urls[0] ? `${BACKEND}${urls[0]}` : null
                const isPdfThumb = thumbUrl?.toLowerCase().endsWith('.pdf')
                const linkedOrderId = rx.orderItems?.[0]?.orderId
                const isActive   = selectedRx?.id === rx.id

                return (
                  <tr key={rx.id}
                    onClick={() => setSelectedRx(rx)}
                    className={`hover:bg-surface-container-low cursor-pointer transition-colors ${isActive ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                    <td className="px-5 py-4 text-sm font-semibold text-on-surface font-mono">#{rx.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed flex-shrink-0 overflow-hidden">
                          {user.avatarUrl
                            ? <img src={`${BACKEND}${user.avatarUrl}`} className="w-full h-full object-cover" alt="" />
                            : initials(user.fullName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface leading-tight">{user.fullName || '-'}</p>
                          <p className="text-xs text-on-surface-variant">{user.phone || user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant whitespace-nowrap">{fmtDate(rx.uploadedAt)}</td>
                    <td className="px-5 py-4">
                      {linkedOrderId
                        ? <span className="text-secondary text-sm font-semibold">#{linkedOrderId.slice(0, 8).toUpperCase()}</span>
                        : <span className="text-on-surface-variant text-xs">-</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-12 h-12 rounded-lg border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center">
                        {thumbUrl && !isPdfThumb
                          ? <img src={thumbUrl} alt="rx" className="w-full h-full object-cover" />
                          : <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>
                              {thumbUrl ? 'picture_as_pdf' : 'description'}
                            </span>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${cfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-4 border-t border-outline-variant flex justify-between items-center">
            <p className="text-sm text-on-surface-variant">{total} total records</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              {[...Array(Math.min(pages, 5))].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
