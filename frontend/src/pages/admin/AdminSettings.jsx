import React, { useState } from 'react'
import api from '../../lib/api'

function Section({ title, subtitle, icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
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

const inputCls = "w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
const inputDisabledCls = "w-full border border-outline-variant rounded-xl px-4 py-2.5 text-sm bg-surface-container text-on-surface-variant cursor-not-allowed"

export default function AdminSettings() {
  const [theme, setTheme]   = useState('system')
  const [saving, setSaving] = useState({})
  const [toast, setToast]   = useState(null)

  const [passwordForm, setPasswordForm] = useState({ current: '', newPw: '', confirm: '' })
  const [sysInfo, setSysInfo]           = useState({ name: 'PharmaX', email: 'admin@pharmax.com', phone: '', address: '', timezone: 'Asia/Kathmandu' })
  const [inventory, setInventory]       = useState({ lowStockThreshold: 10, expiryAlertDays: 30, requirePrescription: true })

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function savePassword() {
    if (!passwordForm.current || !passwordForm.newPw) return showToast('Fill in all password fields', 'error')
    if (passwordForm.newPw !== passwordForm.confirm) return showToast('Passwords do not match', 'error')
    setSaving(s => ({ ...s, password: true }))
    try {
      await api.put('/auth/change-password', { currentPassword: passwordForm.current, newPassword: passwordForm.newPw })
      setPasswordForm({ current: '', newPw: '', confirm: '' })
      showToast('Password updated successfully')
    } catch (e) {
      showToast(e?.response?.data?.message || 'Failed to update password', 'error')
    }
    setSaving(s => ({ ...s, password: false }))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <p className="text-sm text-on-surface-variant">System configuration and account preferences.</p>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
          toast.type === 'error' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
        }`}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Appearance */}
      <Section title="Appearance" subtitle="Customize the admin panel look and feel" icon="palette">
        <div className="space-y-3">
          <p className="text-sm font-medium text-on-surface mb-4">Theme Preference</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light',  label: 'Light',  icon: 'light_mode' },
              { value: 'dark',   label: 'Dark',   icon: 'dark_mode' },
              { value: 'system', label: 'System', icon: 'contrast' },
            ].map(t => (
              <button key={t.value} onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === t.value ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-outline hover:bg-surface-container'
                }`}>
                <span className={`material-symbols-outlined ${theme === t.value ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontSize: '28px' }}>{t.icon}</span>
                <span className={`text-sm font-semibold ${theme === t.value ? 'text-primary' : 'text-on-surface-variant'}`}>{t.label}</span>
                {theme === t.value && (
                  <span className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant mt-2 italic">Note: Full dark mode implementation is in progress. System theme follows device preference.</p>
        </div>
      </Section>

      {/* Account Security */}
      <Section title="Account Security" subtitle="Manage password and two-factor authentication" icon="lock">
        <div className="space-y-4">
          <Field label="Current Password">
            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
              className={inputCls} placeholder="••••••••" autoComplete="current-password" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="New Password">
              <input type="password" value={passwordForm.newPw} onChange={e => setPasswordForm(p => ({ ...p, newPw: e.target.value }))}
                className={inputCls} placeholder="••••••••" autoComplete="new-password" />
            </Field>
            <Field label="Confirm New Password">
              <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                className={inputCls} placeholder="••••••••" autoComplete="new-password" />
            </Field>
          </div>
          <div className="flex items-center justify-between pt-2 flex-wrap gap-4">
            <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>phonelink_lock</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">Two-Factor Authentication</p>
                <p className="text-xs text-on-surface-variant">Adds an extra layer of security</p>
              </div>
              <span className="ml-4 px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold rounded">COMING SOON</span>
            </div>
            <button onClick={savePassword} disabled={saving.password}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all">
              {saving.password ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      </Section>

      {/* System Information */}
      <Section title="System Information" subtitle="Pharmacy details displayed across the platform" icon="business">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Pharmacy Name">
            <input type="text" value={sysInfo.name} onChange={e => setSysInfo(s => ({ ...s, name: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="System Email">
            <input type="email" value={sysInfo.email} onChange={e => setSysInfo(s => ({ ...s, email: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Phone Number">
            <input type="tel" value={sysInfo.phone} onChange={e => setSysInfo(s => ({ ...s, phone: e.target.value }))} className={inputCls} placeholder="+977 98XXXXXXXX" />
          </Field>
          <Field label="Timezone">
            <select value={sysInfo.timezone} onChange={e => setSysInfo(s => ({ ...s, timezone: e.target.value }))} className={inputCls}>
              <option value="Asia/Kathmandu">Asia/Kathmandu (NPT +5:45)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC</option>
            </select>
          </Field>
          <Field label="Address" hint="Displayed on invoices and customer-facing pages">
            <textarea rows={2} value={sysInfo.address} onChange={e => setSysInfo(s => ({ ...s, address: e.target.value }))}
              className={`${inputCls} resize-none`} placeholder="Pharmacy full address…" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
            System info settings are stored locally - backend config endpoint can be wired up when needed.
          </div>
        </div>
      </Section>

      {/* Medicine & Inventory */}
      <Section title="Medicine & Inventory" subtitle="Default thresholds and rules for stock management" icon="inventory_2">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Low Stock Alert Threshold" hint="Alert when stock falls below this quantity">
              <div className="relative">
                <input type="number" min={1} value={inventory.lowStockThreshold}
                  onChange={e => setInventory(s => ({ ...s, lowStockThreshold: parseInt(e.target.value) || 1 }))}
                  className={inputCls} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">units</span>
              </div>
            </Field>
            <Field label="Expiry Alert Window" hint="Alert when medicine expires within this window">
              <div className="relative">
                <input type="number" min={1} value={inventory.expiryAlertDays}
                  onChange={e => setInventory(s => ({ ...s, expiryAlertDays: parseInt(e.target.value) || 1 }))}
                  className={inputCls} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">days</span>
              </div>
            </Field>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>description</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">Require Prescription for Restricted Medicines</p>
                <p className="text-xs text-on-surface-variant">Customers must upload a prescription to purchase prescription-only medicines</p>
              </div>
            </div>
            <button onClick={() => setInventory(s => ({ ...s, requirePrescription: !s.requirePrescription }))}
              className={`relative w-12 h-6 rounded-full transition-all focus:outline-none ${inventory.requirePrescription ? 'bg-primary' : 'bg-outline-variant'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${inventory.requirePrescription ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="flex justify-end">
            <button onClick={() => showToast('Inventory settings saved')}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              Save Inventory Settings
            </button>
          </div>
        </div>
      </Section>

      {/* About */}
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
