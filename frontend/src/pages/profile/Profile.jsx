import React, { useState } from 'react'

export default function Profile() {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: 'Aman',
    lastName: 'Rauniyar',
    email: 'aman@example.com',
    phone: '+977-9800000001',
    dob: '1995-06-24',
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: 'Penicillin',
    address: 'Kathmandu-10, Baneshwor, Kathmandu',
  })

  const Field = ({ label, name, type = 'text', readOnly, options }) => (
    <div>
      <label className="block text-xs font-medium text-on-surface-variant mb-1.5">{label}</label>
      {options ? (
        <select
          name={name}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          disabled={!editing || readOnly}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
            editing && !readOnly ? 'border-surface-container-high bg-white' : 'border-transparent bg-surface-container-low text-on-surface'
          }`}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          readOnly={!editing || readOnly}
          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
            editing && !readOnly ? 'border-surface-container-high bg-white' : 'border-transparent bg-surface-container-low text-on-surface'
          }`}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">My Profile</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">Manage your personal information</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors">Save Changes</button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 border border-surface-container-high text-on-surface-variant text-sm rounded-lg hover:bg-surface-container transition-colors">Cancel</button>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
              {form.firstName[0]}
            </div>
            {editing && (
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-primary-container transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-on-surface">{form.firstName} {form.lastName}</p>
            <p className="text-sm text-on-surface-variant">{form.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Account
            </span>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
        <h3 className="text-sm font-semibold text-on-surface mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" name="firstName" />
          <Field label="Last Name" name="lastName" />
          <Field label="Email Address" name="email" type="email" readOnly />
          <Field label="Phone Number" name="phone" type="tel" />
          <Field label="Date of Birth" name="dob" type="date" />
          <Field label="Gender" name="gender" options={['Male', 'Female', 'Other', 'Prefer not to say']} />
        </div>
      </div>

      {/* Medical Info */}
      <div className="bg-white rounded-xl border border-surface-container-high shadow-card p-5">
        <h3 className="text-sm font-semibold text-on-surface mb-4">Medical Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Blood Group" name="bloodGroup" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']} />
          <Field label="Known Allergies" name="allergies" />
          <div className="sm:col-span-2">
            <Field label="Address" name="address" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-error/20 shadow-card p-5">
        <h3 className="text-sm font-semibold text-error mb-3">Danger Zone</h3>
        <p className="text-sm text-on-surface-variant mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 border border-error text-error text-sm font-semibold rounded-lg hover:bg-error-container/30 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  )
}
