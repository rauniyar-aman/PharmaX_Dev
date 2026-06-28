import React, { useState, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${BACKEND}${url}`
}

function Section({ title, subtitle, icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${checked ? 'bg-primary' : 'bg-outline-variant'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  )
}

const inputCls   = "w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
const inputROCls = "w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container text-on-surface-variant cursor-not-allowed"

export default function AdminSettings() {
  const { user, refreshUser } = useAuth()
  const { theme, setTheme: applyTheme } = useTheme()

  /* ── toast ── */
  const [toast, setToast] = useState(null)
  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── profile ── */
  const [profile, setProfile]     = useState({ fullName: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarRef = useRef()

  /* ── password (two-step OTP flow) ── */
  const [pwStep, setPwStep]   = useState(1)          // 1 = enter passwords, 2 = enter OTP
  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' })
  const [otp, setOtp]         = useState('')
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [savingPw, setSavingPw] = useState(false)
  const [showPw, setShowPw]   = useState({ current: false, new: false, confirm: false })

  /* ── notifications ── */
  const [notifs, setNotifs] = useState({ notifOrderUpdates: true, notifPrescriptionAlerts: true, notifPromotions: false })
  const [savingNotifs, setSavingNotifs] = useState(false)

  /* ── pharmacy settings ── */
  const [pharmacy, setPharmacy] = useState({ pharmacyName: 'PharmaX', pharmacyEmail: '', pharmacyPhone: '', pharmacyAddress: '', timezone: 'Asia/Kathmandu' })
  const [savingPharmacy, setSavingPharmacy] = useState(false)

  /* ── inventory ── */
  const [inv, setInv] = useState({ lowStockThreshold: '10', expiryAlertDays: '30', requirePrescription: 'true' })
  const [savingInv, setSavingInv] = useState(false)

  /* ── appearance (from ThemeContext — single source of truth) ── */

  /* ── deactivate modal ── */
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivateConfirm, setDeactivateConfirm] = useState('')

  /* ── load on mount ── */
  useEffect(() => {
    if (user) setProfile({ fullName: user.fullName || '', phone: user.phone || '' })

    api.get('/auth/notifications')
      .then(r => setNotifs(r.data.data.notifs))
      .catch(() => {})

    api.get('/admin/settings')
      .then(r => {
        const s = r.data.data.settings || {}
        setPharmacy(p => ({
          pharmacyName:    s.pharmacyName    ?? p.pharmacyName,
          pharmacyEmail:   s.pharmacyEmail   ?? p.pharmacyEmail,
          pharmacyPhone:   s.pharmacyPhone   ?? p.pharmacyPhone,
          pharmacyAddress: s.pharmacyAddress ?? p.pharmacyAddress,
          timezone:        s.timezone        ?? p.timezone,
        }))
        setInv({
          lowStockThreshold:  s.lowStockThreshold  ?? '10',
          expiryAlertDays:    s.expiryAlertDays    ?? '30',
          requirePrescription: s.requirePrescription ?? 'true',
        })
      })
      .catch(() => {})
  }, [user])

  /* ── handlers ── */
  const saveProfile = async () => {
    if (!profile.fullName.trim()) return showToast('Full name is required', 'error')
    setSavingProfile(true)
    try {
      await api.put('/auth/me', { fullName: profile.fullName, phone: profile.phone || null })
      await refreshUser()
      showToast('Profile updated')
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to update profile', 'error')
    }
    setSavingProfile(false)
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return showToast('Please select an image file', 'error')
    if (file.size > 2 * 1024 * 1024) return showToast('Image must be under 2MB', 'error')
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await refreshUser()
      showToast('Profile picture updated')
    } catch (e) {
      showToast(e?.response?.data?.message || 'Upload failed', 'error')
    }
    setUploadingAvatar(false)
    e.target.value = ''
  }

  // Step 1: verify current password + send OTP
  const requestOtp = async () => {
    if (!pwForm.current || !pwForm.newPw) return showToast('Fill in all password fields', 'error')
    if (pwForm.newPw.length < 6) return showToast('New password must be at least 6 characters', 'error')
    if (pwForm.newPw !== pwForm.confirm) return showToast('Passwords do not match', 'error')
    setSavingPw(true)
    try {
      await api.post('/auth/request-password-change', { currentPassword: pwForm.current })
      setPwStep(2)
      setOtp('')
      setOtpCountdown(120)
      showToast(`OTP sent to ${user?.email}`)
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to send OTP', 'error')
    }
    setSavingPw(false)
  }

  // Countdown timer for OTP
  useEffect(() => {
    if (otpCountdown <= 0) return
    const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [otpCountdown])

  // Step 2: verify OTP + change password
  const confirmPasswordChange = async () => {
    if (otp.length !== 6) return showToast('Enter the 6-digit OTP', 'error')
    setSavingPw(true)
    try {
      await api.post('/auth/change-password', { otp, newPassword: pwForm.newPw })
      setPwForm({ current: '', newPw: '', confirm: '' })
      setOtp('')
      setPwStep(1)
      showToast('Password updated successfully')
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to update password', 'error')
    }
    setSavingPw(false)
  }

  const cancelPwChange = () => { setPwStep(1); setOtp(''); setOtpCountdown(0) }

  const saveNotifs = async () => {
    setSavingNotifs(true)
    try {
      await api.put('/auth/notifications', notifs)
      showToast('Notification preferences saved')
    } catch {
      showToast('Failed to save preferences', 'error')
    }
    setSavingNotifs(false)
  }

  const savePharmacy = async () => {
    setSavingPharmacy(true)
    try {
      await api.put('/admin/settings', pharmacy)
      showToast('Pharmacy settings saved')
    } catch {
      showToast('Failed to save settings', 'error')
    }
    setSavingPharmacy(false)
  }

  const saveInventory = async () => {
    setSavingInv(true)
    try {
      await api.put('/admin/settings', inv)
      showToast('Inventory settings saved')
    } catch {
      showToast('Failed to save settings', 'error')
    }
    setSavingInv(false)
  }

  const saveTheme = (val) => {
    applyTheme(val)
    showToast('Theme preference saved')
  }

  const avatarSrc = resolveImg(user?.avatarUrl)

  return (
    <div className="space-y-6 max-w-4xl">
      <p className="text-sm text-on-surface-variant">System configuration and account preferences.</p>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-fade-in ${
          toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
        }`}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── Admin Profile ── */}
      <Section title="Admin Profile" subtitle="Update your name, phone, and profile picture" icon="manage_accounts">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-outline-variant bg-surface-container flex items-center justify-center">
              {avatarSrc
                ? <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>person</span>}
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            <button onClick={() => avatarRef.current?.click()} disabled={uploadingAvatar}
              className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>upload</span>
              {uploadingAvatar ? 'Uploading…' : 'Change Photo'}
            </button>
            <p className="text-[10px] text-on-surface-variant text-center">JPG, PNG · Max 2MB</p>
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name">
              <input type="text" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className={inputCls} placeholder="Your full name" />
            </Field>
            <Field label="Email Address" hint="Email cannot be changed">
              <input type="email" value={user?.email || ''} className={inputROCls} readOnly />
            </Field>
            <Field label="Phone Number">
              <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+977 98XXXXXXXX" />
            </Field>
            <Field label="Role">
              <input value="Administrator" className={inputROCls} readOnly />
            </Field>
            <div className="sm:col-span-2 flex justify-end">
              <button onClick={saveProfile} disabled={savingProfile}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                {savingProfile && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>}
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Account Security ── */}
      <Section title="Account Security" subtitle="Change your admin password with OTP verification" icon="lock">
        {pwStep === 1 ? (
          <div className="space-y-4">
            <Field label="Current Password">
              <div className="relative">
                <input type={showPw.current ? 'text' : 'password'} value={pwForm.current}
                  onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  className={inputCls} placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPw.current ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New Password">
                <div className="relative">
                  <input type={showPw.new ? 'text' : 'password'} value={pwForm.newPw}
                    onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                    className={inputCls} placeholder="Min. 6 characters" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPw.new ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </Field>
              <Field label="Confirm New Password">
                <div className="relative">
                  <input type={showPw.confirm ? 'text' : 'password'} value={pwForm.confirm}
                    onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                    className={`${inputCls} ${pwForm.confirm && pwForm.confirm !== pwForm.newPw ? 'border-error focus:ring-error' : ''}`}
                    placeholder="••••••••" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPw.confirm ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {pwForm.confirm && pwForm.confirm !== pwForm.newPw && (
                  <p className="text-xs text-error mt-1">Passwords do not match</p>
                )}
              </Field>
            </div>
            {pwForm.newPw && (
              <div className="flex items-center gap-2">
                {[1,2,3,4].map(i => {
                  const strength = pwForm.newPw.length >= 12 ? 4 : pwForm.newPw.length >= 8 ? 3 : pwForm.newPw.length >= 6 ? 2 : 1
                  return <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? (strength >= 4 ? 'bg-primary' : strength >= 3 ? 'bg-amber-400' : 'bg-error') : 'bg-surface-container'}`} />
                })}
                <span className="text-xs text-on-surface-variant ml-1">
                  {pwForm.newPw.length >= 12 ? 'Strong' : pwForm.newPw.length >= 8 ? 'Good' : pwForm.newPw.length >= 6 ? 'Weak' : 'Too short'}
                </span>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={requestOtp} disabled={savingPw}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                {savingPw
                  ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> Sending OTP…</>
                  : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span> Send OTP to Email</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* OTP sent banner */}
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">OTP sent to your email</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  A 6-digit code was sent to <span className="font-medium text-primary">{user?.email}</span>. Valid for 10 minutes.
                </p>
              </div>
            </div>

            {/* OTP input */}
            <Field label="Enter OTP Code">
              <div className="relative">
                <input
                  type="text" inputMode="numeric" pattern="\d*" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`${inputCls} text-center text-2xl font-bold tracking-[0.5em] pr-4`}
                  placeholder="______"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-on-surface-variant">
                  {otpCountdown > 0
                    ? `Resend available in ${Math.floor(otpCountdown/60)}:${String(otpCountdown%60).padStart(2,'0')}`
                    : 'OTP expired?'}
                </p>
                {otpCountdown === 0 && (
                  <button onClick={requestOtp} disabled={savingPw}
                    className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                    Resend OTP
                  </button>
                )}
              </div>
            </Field>

            <div className="flex items-center justify-between pt-2 gap-3">
              <button onClick={cancelPwChange}
                className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                Back
              </button>
              <button onClick={confirmPasswordChange} disabled={savingPw || otp.length !== 6}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
                {savingPw
                  ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> Updating…</>
                  : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_reset</span> Update Password</>}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* ── Notification Preferences ── */}
      <Section title="Notification Preferences" subtitle="Control which notifications you receive" icon="notifications">
        <div className="space-y-4">
          {[
            { key: 'notifOrderUpdates',       icon: 'shopping_cart',  label: 'Order Updates',           sub: 'New orders, status changes, and cancellations' },
            { key: 'notifPrescriptionAlerts', icon: 'description',    label: 'Prescription Alerts',     sub: 'New prescriptions submitted for verification' },
            { key: 'notifPromotions',          icon: 'campaign',       label: 'System Announcements',    sub: 'Platform updates and feature announcements' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{n.label}</p>
                  <p className="text-xs text-on-surface-variant">{n.sub}</p>
                </div>
              </div>
              <Toggle checked={!!notifs[n.key]} onChange={v => setNotifs(s => ({ ...s, [n.key]: v }))} />
            </div>
          ))}
          <div className="flex justify-end">
            <button onClick={saveNotifs} disabled={savingNotifs}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
              {savingNotifs && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>}
              {savingNotifs ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance" subtitle="Customize the admin panel look and feel" icon="palette">
        <div className="space-y-4">
          <p className="text-sm font-medium text-on-surface">Theme Preference</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light',  label: 'Light',  icon: 'light_mode' },
              { value: 'dark',   label: 'Dark',   icon: 'dark_mode' },
              { value: 'system', label: 'System', icon: 'contrast' },
            ].map(t => (
              <button key={t.value} onClick={() => saveTheme(t.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === t.value ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-outline hover:bg-surface-container'
                }`}>
                <span className={`material-symbols-outlined ${theme === t.value ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontSize: '28px' }}>{t.icon}</span>
                <span className={`text-sm font-semibold ${theme === t.value ? 'text-primary' : 'text-on-surface-variant'}`}>{t.label}</span>
                {theme === t.value && <span className="w-2 h-2 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant italic">System follows your device's color scheme preference automatically.</p>
        </div>
      </Section>

      {/* ── Pharmacy Settings ── */}
      <Section title="Pharmacy Settings" subtitle="Business details shown on invoices and customer pages" icon="business">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Pharmacy Name">
            <input type="text" value={pharmacy.pharmacyName}
              onChange={e => setPharmacy(p => ({ ...p, pharmacyName: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Contact Email">
            <input type="email" value={pharmacy.pharmacyEmail}
              onChange={e => setPharmacy(p => ({ ...p, pharmacyEmail: e.target.value }))} className={inputCls} placeholder="pharmacy@example.com" />
          </Field>
          <Field label="Contact Phone">
            <input type="tel" value={pharmacy.pharmacyPhone}
              onChange={e => setPharmacy(p => ({ ...p, pharmacyPhone: e.target.value }))} className={inputCls} placeholder="+977 01-XXXXXXX" />
          </Field>
          <Field label="Timezone">
            <select value={pharmacy.timezone} onChange={e => setPharmacy(p => ({ ...p, timezone: e.target.value }))} className={inputCls}>
              <option value="Asia/Kathmandu">Asia/Kathmandu (NPT +5:45)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC +0:00</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Pharmacy Address" hint="Printed on customer invoices">
              <textarea rows={2} value={pharmacy.pharmacyAddress}
                onChange={e => setPharmacy(p => ({ ...p, pharmacyAddress: e.target.value }))}
                className={`${inputCls} resize-none`} placeholder="Full address including street, city, province…" />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={savePharmacy} disabled={savingPharmacy}
            className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
            {savingPharmacy && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>}
            {savingPharmacy ? 'Saving…' : 'Save Pharmacy Settings'}
          </button>
        </div>
      </Section>

      {/* ── Inventory Defaults ── */}
      <Section title="Inventory Rules" subtitle="Default thresholds and rules for stock management" icon="inventory_2">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Low Stock Alert Threshold" hint="Alert when quantity falls below this number">
              <div className="relative">
                <input type="number" min={1} value={inv.lowStockThreshold}
                  onChange={e => setInv(s => ({ ...s, lowStockThreshold: e.target.value }))}
                  className={inputCls} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">units</span>
              </div>
            </Field>
            <Field label="Expiry Alert Window" hint="Warn when medicine expires within this window">
              <div className="relative">
                <input type="number" min={1} value={inv.expiryAlertDays}
                  onChange={e => setInv(s => ({ ...s, expiryAlertDays: e.target.value }))}
                  className={inputCls} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">days</span>
              </div>
            </Field>
          </div>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Require Prescription for Rx Medicines</p>
                <p className="text-xs text-on-surface-variant">Customers must upload a valid prescription for prescription-only items</p>
              </div>
            </div>
            <Toggle
              checked={inv.requirePrescription === 'true'}
              onChange={v => setInv(s => ({ ...s, requirePrescription: String(v) }))}
            />
          </div>
          <div className="flex justify-end">
            <button onClick={saveInventory} disabled={savingInv}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
              {savingInv && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>}
              {savingInv ? 'Saving…' : 'Save Inventory Rules'}
            </button>
          </div>
        </div>
      </Section>

      {/* ── About ── */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px', fontVariationSettings: "'FILL' 1" }}>medication</span>
          </div>
          <div>
            <p className="font-bold text-on-surface">PharmaX Admin v1.0</p>
            <p className="text-xs text-on-surface-variant">Online Pharmacy Management System</p>
          </div>
        </div>
        <div className="text-xs text-on-surface-variant space-y-0.5 text-right">
          <p>Node.js + Express · PostgreSQL + Prisma</p>
          <p>React 19 + Vite · Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
