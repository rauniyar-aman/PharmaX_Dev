import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function resolveImg(url) {
  if (!url) return null
  if (url.startsWith('data:') || url.startsWith('http')) return url
  return `${BACKEND}${url}`
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function initials(name) {
  if (!name) return 'A'
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function SectionCard({ title, icon, children, action }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl custom-shadow">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, value, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-on-surface-variant mb-1">{label}</p>
      {children || <p className="text-sm font-medium text-on-surface">{value || '-'}</p>}
    </div>
  )
}

function ReadonlyField({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl">
      {icon && (
        <span className="material-symbols-outlined text-secondary flex-shrink-0 mt-0.5" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-on-surface mt-0.5 break-all">{value || '-'}</p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <span className="material-symbols-outlined text-white" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-on-surface leading-none">{value ?? '-'}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function Toast({ msg, type }) {
  if (!msg) return null
  const isErr = type === 'error'
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all ${
      isErr ? 'bg-error/10 border-error/30 text-error' : 'bg-primary/10 border-primary/20 text-primary'
    }`}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
        {isErr ? 'error' : 'check_circle'}
      </span>
      {msg}
    </div>
  )
}

export default function AdminProfile() {
  const { user: authUser, refreshUser } = useAuth()
  const fileRef = useRef()

  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState({ orders: 0, prescriptions: 0, customers: 0 })
  const [toast, setToast]       = useState({ msg: '', type: 'success' })

  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingAddress,  setEditingAddress]  = useState(false)
  const [savingPersonal,  setSavingPersonal]  = useState(false)
  const [savingAddress,   setSavingAddress]   = useState(false)
  const [uploadingPic,    setUploadingPic]    = useState(false)

  const [personalForm, setPersonalForm] = useState({
    fullName: '', email: '', phone: '', dob: '', gender: '',
  })
  const [addressForm, setAddressForm] = useState({
    country: 'Nepal', state: '', city: '', address: '', zip: '',
  })

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500)
  }

  useEffect(() => {
    Promise.all([
      api.get('/user/profile'),
      api.get('/admin/stats').catch(() => ({ data: { data: {} } })),
    ]).then(([profileRes, statsRes]) => {
      const u = profileRes.data.data.user
      setProfile(u)
      setPersonalForm({
        fullName: u.fullName || '',
        email:    u.email    || '',
        phone:    u.phone    || '',
        dob:      u.dob ? u.dob.slice(0, 10) : '',
        gender:   u.gender   || '',
      })
      const s = statsRes.data.data
      setStats({
        orders:        s.totalOrders        ?? 0,
        prescriptions: s.pendingPrescriptions ?? 0,
        customers:     s.totalCustomers      ?? 0,
      })
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function savePersonal() {
    setSavingPersonal(true)
    try {
      const res = await api.put('/user/profile', {
        fullName: personalForm.fullName,
        phone:    personalForm.phone,
        dob:      personalForm.dob || null,
        gender:   personalForm.gender || null,
      })
      const updated = res.data.data.user
      setProfile(prev => ({ ...prev, ...updated }))
      refreshUser()
      setEditingPersonal(false)
      showToast('Personal information updated successfully.')
    } catch {
      showToast('Failed to save changes. Please try again.', 'error')
    } finally {
      setSavingPersonal(false)
    }
  }

  function cancelPersonal() {
    setPersonalForm({
      fullName: profile.fullName || '',
      email:    profile.email    || '',
      phone:    profile.phone    || '',
      dob:      profile.dob ? profile.dob.slice(0, 10) : '',
      gender:   profile.gender   || '',
    })
    setEditingPersonal(false)
  }

  async function saveAddress() {
    setSavingAddress(true)
    try {
      await api.post('/user/addresses', {
        name:     profile.fullName,
        phone:    profile.phone || '',
        label:    'Work',
        address:  addressForm.address,
        city:     addressForm.city,
        province: addressForm.state,
        zip:      addressForm.zip,
        country:  addressForm.country,
        isDefault: true,
      })
      setEditingAddress(false)
      showToast('Address updated successfully.')
    } catch {
      showToast('Failed to save address.', 'error')
    } finally {
      setSavingAddress(false)
    }
  }

  async function handlePicUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    setUploadingPic(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await api.post('/user/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile(prev => ({ ...prev, avatarUrl: res.data.data.avatarUrl }))
      showToast('Profile picture updated successfully.')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload image.', 'error')
    } finally {
      setUploadingPic(false)
    }
  }

  async function handleRemoveAvatar() {
    try {
      await api.delete('/user/avatar')
      setProfile(prev => ({ ...prev, avatarUrl: null }))
      showToast('Profile picture removed.')
    } catch {
      showToast('Failed to remove picture.', 'error')
    }
  }

  const avatarUrl = resolveImg(profile?.avatarUrl)
  const [firstName, lastName] = (profile?.fullName || '').split(' ')

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-10 bg-surface-container rounded-2xl w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-surface-container rounded-2xl" />)}
          </div>
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-surface-container rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Toast msg={toast.msg} type={toast.type} />

      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-1">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1">
            <Link to="/admin/dashboard" className="hover:text-on-surface transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            <span className="text-on-surface font-medium">Admin Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Admin Profile</h1>
        </div>
        <button
          onClick={() => setEditingPersonal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="space-y-5">

          <div className="bg-surface-container-lowest rounded-2xl custom-shadow overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-secondary/30 to-primary/20 relative" />

            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4 inline-block">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile?.fullName}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-surface-container-lowest shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center border-4 border-surface-container-lowest shadow-md">
                    <span className="text-2xl font-bold text-on-primary">{initials(profile?.fullName)}</span>
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPic}
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-all"
                  title="Change photo"
                >
                  {uploadingPic
                    ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>progress_activity</span>
                    : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>photo_camera</span>
                  }
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload} />
              </div>

              <div className="space-y-1 mb-4">
                <h2 className="text-lg font-bold text-on-surface">{profile?.fullName}</h2>
                <p className="text-sm text-secondary font-medium">System Administrator</p>
                <p className="text-xs text-on-surface-variant font-mono">{profile?.id?.slice(0, 8).toUpperCase()}</p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>mail</span>
                  <span className="truncate text-xs">{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>phone</span>
                    <span className="text-xs">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Active</span>
                </div>
              </div>
            </div>
          </div>

          <SectionCard title="Activity Summary" icon="bar_chart">
            <div className="space-y-3">
              <StatCard icon="shopping_cart" label="Orders Managed"          value={stats.orders}        color="bg-secondary" />
              <StatCard icon="description"   label="Prescriptions Reviewed"  value={stats.prescriptions} color="bg-tertiary" />
              <StatCard icon="group"         label="Customers Managed"       value={stats.customers}     color="bg-primary" />
              <StatCard icon="summarize"     label="Reports Generated"       value="-"                  color="bg-error" />
            </div>
          </SectionCard>

          <SectionCard title="Account Information" icon="manage_accounts">
            <div className="space-y-3">
              <ReadonlyField label="Username"         value={profile?.fullName?.toLowerCase().replace(' ', '.')} icon="person" />
              <ReadonlyField label="Registered Email" value={profile?.email}      icon="mail" />
              <ReadonlyField label="Account Role"     value={profile?.role}       icon="badge" />
              <ReadonlyField label="Member Since"     value={fmtDate(profile?.createdAt)} icon="calendar_today" />
              <ReadonlyField label="Account Status"   value="Active"              icon="verified_user" />
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-5">

          <SectionCard
            title="Personal Information"
            icon="person"
            action={
              !editingPersonal ? (
                <button onClick={() => setEditingPersonal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                  Edit
                </button>
              ) : null
            }
          >
            {editingPersonal ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">First Name</label>
                    <input
                      value={personalForm.fullName.split(' ')[0] || ''}
                      onChange={e => setPersonalForm(f => ({ ...f, fullName: `${e.target.value} ${f.fullName.split(' ').slice(1).join(' ')}`.trim() }))}
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Last Name</label>
                    <input
                      value={personalForm.fullName.split(' ').slice(1).join(' ') || ''}
                      onChange={e => setPersonalForm(f => ({ ...f, fullName: `${f.fullName.split(' ')[0]} ${e.target.value}`.trim() }))}
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Email Address</label>
                    <input value={personalForm.email} disabled
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 bg-surface-container text-on-surface-variant cursor-not-allowed" />
                    <p className="text-[10px] text-on-surface-variant mt-1">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Phone Number</label>
                    <input
                      value={personalForm.phone}
                      onChange={e => setPersonalForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Date of Birth <span className="opacity-50">(optional)</span></label>
                    <input type="date"
                      value={personalForm.dob}
                      onChange={e => setPersonalForm(f => ({ ...f, dob: e.target.value }))}
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Gender <span className="opacity-50">(optional)</span></label>
                    <select
                      value={personalForm.gender}
                      onChange={e => setPersonalForm(f => ({ ...f, gender: e.target.value }))}
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={savePersonal} disabled={savingPersonal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
                    {savingPersonal
                      ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> Saving…</>
                      : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span> Save Changes</>}
                  </button>
                  <button onClick={cancelPersonal}
                    className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <Field label="First Name"    value={profile?.fullName?.split(' ')[0]} />
                <Field label="Last Name"     value={profile?.fullName?.split(' ').slice(1).join(' ')} />
                <Field label="Email Address" value={profile?.email} />
                <Field label="Phone Number"  value={profile?.phone} />
                <Field label="Date of Birth" value={profile?.dob ? fmtDate(profile.dob) : undefined} />
                <Field label="Gender"        value={profile?.gender} />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Work Information" icon="work">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>badge</span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wide">Role</p>
                  <p className="text-sm font-semibold text-on-surface capitalize">{profile?.role?.toLowerCase() || 'Administrator'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wide">Department</p>
                  <p className="text-sm font-semibold text-on-surface">Pharmacy Management</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant">
                <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wide">Joined Date</p>
                  <p className="text-sm font-semibold text-on-surface">{fmtDate(profile?.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>tag</span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wide">Employee ID</p>
                  <p className="text-sm font-semibold text-on-surface font-mono">{profile?.id?.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
              Work information is managed by the system. Contact IT to make changes.
            </p>
          </SectionCard>

          <SectionCard
            title="Address Information"
            icon="location_on"
            action={
              !editingAddress ? (
                <button onClick={() => setEditingAddress(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                  Edit Address
                </button>
              ) : null
            }
          >
            {editingAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Country</label>
                    <input value={addressForm.country}
                      onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">State / Province</label>
                    <input value={addressForm.state}
                      onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))}
                      placeholder="e.g. Bagmati"
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">City</label>
                    <input value={addressForm.city}
                      onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="e.g. Kathmandu"
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Postal Code</label>
                    <input value={addressForm.zip}
                      onChange={e => setAddressForm(f => ({ ...f, zip: e.target.value }))}
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-on-surface-variant mb-1 block">Address Line</label>
                    <textarea value={addressForm.address} rows={2}
                      onChange={e => setAddressForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Street address, area, ward no."
                      className="w-full text-sm border border-outline-variant rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary bg-surface transition resize-none" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={saveAddress} disabled={savingAddress}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
                    {savingAddress
                      ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span> Saving…</>
                      : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span> Save Changes</>}
                  </button>
                  <button onClick={() => setEditingAddress(false)}
                    className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Country"       value={addressForm.country} />
                <Field label="State / Province" value={addressForm.state} />
                <Field label="City"          value={addressForm.city} />
                <Field label="Postal Code"   value={addressForm.zip} />
                <div className="sm:col-span-2">
                  <Field label="Address Line" value={addressForm.address} />
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Profile Picture" icon="photo_camera">
            <div className="flex items-start gap-6 flex-wrap">
              <div className="flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover border border-outline-variant" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border border-outline-variant">
                    <span className="text-3xl font-bold text-primary">{initials(profile?.fullName)}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[200px] space-y-3">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Profile Photo</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Upload a professional photo. JPG, PNG or WEBP. Max 5 MB.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => fileRef.current?.click()} disabled={uploadingPic}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 transition disabled:opacity-60">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>upload</span>
                    {uploadingPic ? 'Uploading…' : avatarUrl ? 'Change Picture' : 'Upload Picture'}
                  </button>
                  {avatarUrl && (
                    <button onClick={handleRemoveAvatar}
                      className="flex items-center gap-2 px-4 py-2 border border-error/30 rounded-xl text-xs font-medium text-error hover:bg-error/5 transition">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="bg-surface-container-lowest rounded-2xl custom-shadow p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-on-surface">Save all changes</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Make sure all your information is up to date before saving.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setEditingPersonal(false); setEditingAddress(false) }}
                className="px-5 py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition">
                Cancel
              </button>
              <button
                onClick={savePersonal}
                disabled={savingPersonal}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                Save Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
