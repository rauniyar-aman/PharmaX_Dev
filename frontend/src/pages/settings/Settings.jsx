import React, { useState } from 'react'

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
)

export default function Settings() {
  const [notifs, setNotifs] = useState({
    orderUpdates: true,
    promotions: false,
    prescriptionAlerts: true,
    deliveryUpdates: true,
    emailNotifs: true,
    smsNotifs: false,
  })

  const [privacy, setPrivacy] = useState({
    shareData: false,
    analyticsConsent: true,
  })

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const notifSettings = [
    { key: 'orderUpdates', label: 'Order Updates', desc: 'Get notified when your order status changes' },
    { key: 'promotions', label: 'Promotions & Offers', desc: 'Receive discount codes and special offers' },
    { key: 'prescriptionAlerts', label: 'Prescription Alerts', desc: 'Reminders for prescription expiry and refills' },
    { key: 'deliveryUpdates', label: 'Delivery Updates', desc: 'Real-time updates on your delivery status' },
  ]

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-on-surface">Settings</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage your account settings and preferences</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
        <h3 className="text-base font-semibold text-on-surface mb-1">Notifications</h3>
        <p className="text-sm text-on-surface-variant mb-4">Choose how you receive notifications</p>

        <div className="space-y-4">
          {notifSettings.map(setting => (
            <div key={setting.key} className="flex items-center justify-between py-3 border-b border-surface-container last:border-0">
              <div>
                <p className="text-sm font-medium text-on-surface">{setting.label}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{setting.desc}</p>
              </div>
              <Toggle checked={notifs[setting.key]} onChange={v => setNotifs(n => ({ ...n, [setting.key]: v }))} />
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-surface-container-high">
          <p className="text-sm font-medium text-on-surface mb-3">Notification Channels</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-on-surface-variant">
                  <path d="M4 4h16v16H4z" /><path d="M4 7l8 5 8-5" />
                </svg>
                <span className="text-sm text-on-surface">Email Notifications</span>
              </div>
              <Toggle checked={notifs.emailNotifs} onChange={v => setNotifs(n => ({ ...n, emailNotifs: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-on-surface-variant">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.46 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.38 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.4a16 16 0 006.72 6.72l1.76-1.76a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <span className="text-sm text-on-surface">SMS Notifications</span>
              </div>
              <Toggle checked={notifs.smsNotifs} onChange={v => setNotifs(n => ({ ...n, smsNotifs: v }))} />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
        <h3 className="text-base font-semibold text-on-surface mb-1">Change Password</h3>
        <p className="text-sm text-on-surface-variant mb-4">Update your account password</p>
        <div className="space-y-3">
          {[
            { label: 'Current Password', value: currentPassword, onChange: setCurrentPassword },
            { label: 'New Password', value: newPassword, onChange: setNewPassword },
            { label: 'Confirm New Password', value: confirmPassword, onChange: setConfirmPassword },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">{label}</label>
              <input
                type="password"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-surface-container-high rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
          <button className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors mt-1">
            Update Password
          </button>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
        <h3 className="text-base font-semibold text-on-surface mb-1">Privacy</h3>
        <p className="text-sm text-on-surface-variant mb-4">Control your data and privacy settings</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-surface-container">
            <div>
              <p className="text-sm font-medium text-on-surface">Share Data with Partners</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Allow sharing anonymized data with healthcare partners</p>
            </div>
            <Toggle checked={privacy.shareData} onChange={v => setPrivacy(p => ({ ...p, shareData: v }))} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-on-surface">Analytics & Improvements</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Help us improve by sharing usage analytics</p>
            </div>
            <Toggle checked={privacy.analyticsConsent} onChange={v => setPrivacy(p => ({ ...p, analyticsConsent: v }))} />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
        <h3 className="text-base font-semibold text-on-surface mb-4">Account Actions</h3>
        <div className="flex flex-col gap-3">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-surface-container-high text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            <span>Download My Data</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-on-surface-variant">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-error/20 text-sm font-medium text-error hover:bg-error-container/30 transition-colors">
            <span>Delete Account</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
