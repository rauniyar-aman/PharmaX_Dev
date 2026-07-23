import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../lib/api'

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) return setError('New passwords do not match.')
    if (form.newPassword.length < 6) return setError('New password must be at least 6 characters.')
    setLoading(true)
    try {
      await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      setSuccess(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm px-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full"><span className="material-symbols-outlined text-primary">lock_open</span></div>
            <div><h2 className="text-lg font-semibold text-on-surface">Change Password</h2><p className="text-xs text-on-surface-variant">Update your security credentials</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined text-on-surface-variant">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[{ label: 'Current Password', key: 'currentPassword', showKey: 'current' }, { label: 'New Password', key: 'newPassword', showKey: 'new' }, { label: 'Confirm New Password', key: 'confirmPassword', showKey: 'confirm' }].map(({ label, key, showKey }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">{label}</label>
              <div className="relative">
                <input type={show[showKey] ? 'text' : 'password'} placeholder="••••••••" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-4 py-3 pr-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface text-sm" />
                <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{show[showKey] ? 'visibility_off' : 'visibility'}</span></button>
              </div>
            </div>
          ))}
          {error && <p className="text-xs text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-2.5">{error}</p>}
          {success && <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5">Password changed successfully!</p>}
        </form>
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || success} className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all">{loading ? 'Updating...' : success ? 'Updated!' : 'Update Password'}</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ title, message, confirmLabel, confirmClass = 'bg-error text-on-error', onConfirm, onClose, children }) {
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => { setLoading(true); await onConfirm(); setLoading(false) }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm px-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex items-center gap-3">
          <div className="bg-error/10 p-2 rounded-full"><span className="material-symbols-outlined text-error">warning</span></div>
          <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
          {children}
        </div>
        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className={`px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition-all ${confirmClass}`}>{loading ? 'Processing...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

const THEMES = [
  { key: 'light', label: 'Light Mode', icon: 'light_mode' },
  { key: 'dark', label: 'Dark Mode', icon: 'dark_mode' },
  { key: 'system', label: 'System Default', icon: 'settings_brightness' },
]

export default function Settings() {
  useEffect(() => { document.title = 'Settings — PharmaX' }, [])
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [notifs, setNotifs] = useState({ notifOrderUpdates: true, notifPrescriptionAlerts: true, notifPromotions: false })
  const [notifsLoading, setNotifsLoading] = useState(true)
  const [notifsSaving, setNotifsSaving] = useState(false)

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const [saveToast, setSaveToast] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/notifications')
      .then(res => setNotifs(res.data.data.notifs))
      .catch(() => {})
      .finally(() => setNotifsLoading(false))
  }, [])

  const handleSaveNotifs = async () => {
    setNotifsSaving(true)
    setError('')
    try {
      await api.put('/auth/notifications', notifs)
      showToast('Notification preferences saved!')
    } catch {
      setError('Failed to save notification settings.')
    }
    setNotifsSaving(false)
  }

  const showToast = msg => {
    setSaveToast(msg)
    setTimeout(() => setSaveToast(''), 3000)
  }

  const handleDeactivate = async () => {
    try {
      await api.post('/auth/deactivate')
      logout()
      navigate('/signin')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate account.')
      setShowDeactivateModal(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE') return
    try {
      await api.delete('/auth/me')
      logout()
      navigate('/signin')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.')
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex text-xs text-on-surface-variant gap-1.5 items-center">
        <span>Dashboard</span>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
        <span className="text-on-surface font-semibold">Settings</span>
      </nav>
      <h1 className="text-2xl font-bold text-on-surface">Settings</h1>

      {error && <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-xl px-4 py-3">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">

          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">palette</span>
              <h2 className="text-lg font-semibold text-on-surface">Appearance</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(({ key, label, icon }) => (
                <button key={key} onClick={() => setTheme(key)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 gap-2 transition-all ${theme === key ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-4xl">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-on-surface-variant">Theme preference is saved locally on this device.</p>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">shield</span>
              <h2 className="text-lg font-semibold text-on-surface">Account Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Email Verification</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{user?.email}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-semibold">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Verified
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock_reset</span>
                Change Password
              </button>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">notifications</span>
              <h2 className="text-lg font-semibold text-on-surface">Notification Settings</h2>
            </div>
            {notifsLoading ? (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant py-4">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                Loading preferences...
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {[
                  { key: 'notifOrderUpdates', label: 'Order Updates', desc: 'Real-time status changes for your orders' },
                  { key: 'notifPrescriptionAlerts', label: 'Prescription Alerts', desc: 'Notifications when prescriptions are verified or expiring' },
                  { key: 'notifPromotions', label: 'Promotional Offers', desc: 'Discounts, new arrivals, and wellness programs' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
                    </div>
                    <Toggle checked={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-outline-variant flex justify-end">
              <button onClick={handleSaveNotifs} disabled={notifsSaving || notifsLoading}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-sm">
                {notifsSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl border-2 border-error/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-error" style={{ fontSize: '96px', fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-error p-2 bg-error-container/20 rounded-lg">warning</span>
              <h2 className="text-lg font-bold text-error">Danger Zone</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-5 max-w-xl">
              These actions are sensitive. Deleting your account preserves your order history and data for admin review, but you will be logged out immediately. You can restore your account later using your email.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowDeactivateModal(true)}
                className="px-5 py-2.5 border-2 border-outline text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container transition-colors">
                Deactivate Account
              </button>
              <button onClick={() => { setDeleteConfirm(''); setShowDeleteModal(true) }}
                className="flex items-center gap-2 px-5 py-2.5 bg-error text-on-error text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                Delete Account
              </button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-surface-container-high p-5 rounded-xl border border-outline-variant">
              <h3 className="text-sm font-bold text-on-surface mb-3">Setting Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>verified_user</span>
                  <span>Email: Verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>visibility</span>
                  <span>Mode: {THEMES.find(t => t.key === theme)?.label}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>notifications_active</span>
                  <span>{Object.values(notifs).filter(Boolean).length} of 3 notifications on</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-secondary">help</span>
                <h4 className="text-sm font-bold text-on-surface">Need assistance?</h4>
              </div>
              <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">Our support team is available for account-related inquiries and security concerns.</p>
              <a href="mailto:theblessingtechnologies@gmail.com" className="text-secondary text-sm font-bold hover:underline flex items-center gap-1">
                Contact Support <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {showDeactivateModal && (
        <ConfirmModal
          title="Deactivate Account"
          message="Your account will be temporarily disabled. You will be logged out and won't be able to sign in until you reactivate it by verifying your email again."
          confirmLabel="Deactivate"
          confirmClass="bg-outline text-on-surface border border-outline hover:bg-surface-container"
          onConfirm={handleDeactivate}
          onClose={() => setShowDeactivateModal(false)}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Account"
          message="Your account will be soft-deleted. Your orders, prescriptions, and data are retained for admin records. You can restore your account later using your email and OTP verification."
          confirmLabel="Delete My Account"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface">Type DELETE to confirm</label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm focus:ring-2 focus:ring-error/30 focus:border-error outline-none"
            />
          </div>
        </ConfirmModal>
      )}

      <div className={`fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 transition-all duration-500 ${saveToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <p className="text-sm font-bold">{saveToast}</p>
      </div>
    </div>
  )
}
