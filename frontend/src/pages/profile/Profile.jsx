import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import AddressModal from '../../components/address/AddressModal'

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
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
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
            <div className="bg-primary/10 p-2 rounded-full">
              <span className="material-symbols-outlined text-primary">lock_open</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Change Password</h2>
              <p className="text-xs text-on-surface-variant">Update your account security credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword', showKey: 'current' },
            { label: 'New Password', key: 'newPassword', showKey: 'new' },
            { label: 'Confirm New Password', key: 'confirmPassword', showKey: 'confirm' },
          ].map(({ label, key, showKey }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {show[showKey] ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          ))}

          <div className="bg-surface-container px-4 py-3 rounded-lg flex gap-3 border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0">info</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">Password must be at least 6 characters long.</p>
          </div>

          {error && <p className="text-xs text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-2.5">{error}</p>}
          {success && <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5">Password changed successfully!</p>}
        </form>

        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {loading ? 'Updating…' : success ? 'Updated!' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const { refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarInputRef = React.useRef(null)

  const [addresses, setAddresses] = useState([])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const updated = res.data.data.user
      setProfile(updated)
      refreshUser()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload picture.')
    }
    setAvatarUploading(false)
    e.target.value = ''
  }

  const handleAvatarRemove = async () => {
    if (!confirm('Remove your profile picture?')) return
    setAvatarUploading(true)
    try {
      await api.delete('/user/avatar')
      setProfile(prev => ({ ...prev, avatarUrl: null }))
      refreshUser()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove picture.')
    }
    setAvatarUploading(false)
  }

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const u = res.data.data.user
      setProfile(u)
      setForm({
        fullName: u.fullName || '',
        phone: u.phone || '',
        dob: u.dob ? u.dob.split('T')[0] : '',
        gender: u.gender || '',
        bloodGroup: u.bloodGroup || '',
        allergies: u.allergies || '',
      })
    })
    api.get('/user/addresses').then(res => setAddresses(res.data.data.addresses)).catch(() => {})
  }, [])

  const handleAddressSaved = (saved, mode) => {
    if (mode === 'add') {
      setAddresses(prev => saved.isDefault
        ? [saved, ...prev.map(a => ({ ...a, isDefault: false }))]
        : [...prev, saved])
    } else {
      setAddresses(prev => prev.map(a => a.id === saved.id ? saved : saved.isDefault ? { ...a, isDefault: false } : a))
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return
    await api.delete(`/user/addresses/${id}`)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handleSetDefault = async (id) => {
    await api.put(`/user/addresses/${id}/default`)
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
  }

  const handleCancel = () => {
    setEditing(false)
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        dob: profile.dob ? profile.dob.split('T')[0] : '',
        gender: profile.gender || '',
        bloodGroup: profile.bloodGroup || '',
        allergies: profile.allergies || '',
      })
    }
    setSaveMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await api.put('/auth/me', form)
      const updated = res.data.data.user
      setProfile(updated)
      refreshUser()
      setEditing(false)
      setSaveMsg('Profile saved successfully.')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Failed to save profile.')
    }
    setSaving(false)
  }

  const inputCls = editing
    ? 'w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all'
    : 'w-full px-4 py-3 rounded-lg border border-transparent bg-surface-container-low text-sm text-on-surface cursor-default'

  const avatarLetter = profile?.fullName?.[0]?.toUpperCase() || '?'
  const avatarSrc = profile?.avatarUrl ? `http://localhost:5000${profile.avatarUrl}` : null

  return (
    <div className="space-y-6">
      <nav className="flex text-xs text-on-surface-variant gap-1.5 items-center">
        <span>Dashboard</span>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
        <span className="text-on-surface font-semibold">Profile</span>
      </nav>
      <h1 className="text-2xl font-semibold text-on-surface">Profile</h1>

      {!profile ? (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          Loading profile…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <section className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-full border-4 border-surface-container-high shadow-md overflow-hidden bg-primary text-on-primary flex items-center justify-center text-4xl font-bold">
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                    : avatarLetter}
                </div>
                <button
                  onClick={() => setAvatarMenuOpen(o => !o)}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-60"
                  title="Edit profile picture"
                >
                  {avatarUploading
                    ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                    : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>}
                </button>

                {avatarMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAvatarMenuOpen(false)} />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-20 overflow-hidden">
                      <button
                        onClick={() => { setAvatarMenuOpen(false); avatarInputRef.current?.click() }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors text-left"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                        Upload new photo
                      </button>
                      {avatarSrc && (
                        <button
                          onClick={() => { setAvatarMenuOpen(false); handleAvatarRemove() }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors text-left border-t border-outline-variant"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          Remove photo
                        </button>
                      )}
                    </div>
                  </>
                )}
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-on-surface">{profile.fullName}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 self-center md:self-auto">
                    Active
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span>
                    <span>{profile.email}</span>
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>call</span>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={handleCancel} className="px-5 py-2.5 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-sm">
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-on-surface">Personal Information</h3>
              <span className="material-symbols-outlined text-on-surface-variant">person_edit</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant px-1">Full Name</label>
                <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} readOnly={!editing} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant px-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} readOnly={!editing} placeholder={editing ? '+977-98XXXXXXXX' : '-'} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant px-1">Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} readOnly={!editing} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant px-1">Gender</label>
                {editing ? (
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={inputCls}>
                    <option value="">Select gender</option>
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.gender || '-'} readOnly className={inputCls} />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant px-1">Blood Group</label>
                {editing ? (
                  <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className={inputCls}>
                    <option value="">Select blood group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.bloodGroup || '-'} readOnly className={inputCls} />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant px-1">Known Allergies</label>
                <input type="text" value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} readOnly={!editing} placeholder={editing ? 'e.g. Penicillin, Aspirin' : '-'} className={inputCls} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-on-surface-variant px-1">Email Address</label>
                <input type="email" value={profile.email} readOnly className="w-full px-4 py-3 rounded-lg border border-transparent bg-surface-container-low text-sm text-on-surface-variant cursor-not-allowed" />
              </div>
            </div>

            {saveMsg && (
              <p className={`mt-4 text-xs px-4 py-2.5 rounded-lg border ${saveMsg.includes('success') ? 'text-primary bg-primary/5 border-primary/20' : 'text-error bg-error-container/30 border-error/20'}`}>
                {saveMsg}
              </p>
            )}
          </section>

          <aside className="lg:col-span-4 space-y-4">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-on-surface mb-4">Account Security</h3>
              <div className="space-y-3">
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Password</p>
                      <p className="text-xs text-on-surface-variant">Keep your account secure</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="text-secondary text-sm font-semibold hover:underline transition-all">
                    Change
                  </button>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Email Verified</p>
                      <p className="text-xs text-on-surface-variant truncate max-w-[120px]">{profile.email}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
            </section>

            <div className="bg-secondary-container text-on-secondary-container rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined flex-shrink-0">info</span>
                <div>
                  <h4 className="text-sm font-bold mb-1">Keep Info Up To Date</h4>
                  <p className="text-sm opacity-90 leading-relaxed">Ensure your phone number is current to receive prescription alerts and order status updates.</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">location_on</span>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">Saved Addresses</h3>
                  <p className="text-xs text-on-surface-variant">{addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved</p>
                </div>
              </div>
              <button onClick={() => { setEditingAddress(null); setShowAddressModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-on-surface-variant/40 mb-3" style={{ fontSize: '48px' }}>location_off</span>
                <p className="text-sm font-semibold text-on-surface">No saved addresses yet</p>
                <p className="text-xs text-on-surface-variant mt-1 mb-4">Add your delivery address to speed up checkout</p>
                <button onClick={() => { setEditingAddress(null); setShowAddressModal(true) }}
                  className="px-5 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors">
                  + Add First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className={`relative p-4 rounded-xl border-2 transition-all ${addr.isDefault ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low hover:border-outline'}`}>
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 bg-primary text-on-primary rounded-full">DEFAULT</span>
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${addr.isDefault ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                          {addr.label === 'Home' ? 'home' : addr.label === 'Work' ? 'business' : 'location_on'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface">{addr.label}</p>
                        <p className="text-sm text-on-surface">{addr.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                          {addr.address}, {addr.city}, {addr.province} {addr.zip}
                        </p>
                        <p className="text-xs text-on-surface-variant">{addr.phone}</p>
                      </div>
                    </div>

                    {addr.lat && (
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>pin_drop</span>
                        <span>Pinned: {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/50">
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefault(addr.id)}
                          className="flex-1 text-xs py-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-medium">
                          Set Default
                        </button>
                      )}
                      <button onClick={() => { setEditingAddress(addr); setShowAddressModal(true) }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:bg-secondary/10 transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteAddress(addr.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-error hover:bg-error/10 transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {editing && (
            <footer className="lg:col-span-12 flex items-center justify-end gap-3 py-4 border-t border-outline-variant">
              <button onClick={handleCancel} className="px-8 py-3 rounded-lg border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-3 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 shadow-md transition-all">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </footer>
          )}
        </div>
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {showAddressModal && (
        <AddressModal
          initial={editingAddress}
          onClose={() => { setShowAddressModal(false); setEditingAddress(null) }}
          onSaved={handleAddressSaved}
        />
      )}
    </div>
  )
}
