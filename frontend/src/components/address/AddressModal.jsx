import React, { useState } from 'react'
import MapPicker from '../map/MapPicker'
import api from '../../lib/api'

const LABELS = ['Home', 'Work', 'Other']
const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']

export default function AddressModal({ onClose, onSaved, initial }) {
  const isEdit = !!initial

  const [form, setForm] = useState({
    label: initial?.label || 'Home',
    name: initial?.name || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
    city: initial?.city || '',
    province: initial?.province || '',
    zip: initial?.zip || '',
    isDefault: initial?.isDefault || false,
    lat: initial?.lat || null,
    lng: initial?.lng || null,
  })
  const [mapOpen, setMapOpen] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleMapChange = ({ lat, lng, address, city, province, zip }) => {
    setForm(f => ({
      ...f, lat, lng,
      address: address || f.address,
      city: city || f.city,
      province: province || f.province,
      zip: zip || f.zip,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone || !form.address || !form.city || !form.province || !form.zip) {
      return setError('Please fill in all required fields.')
    }
    if (!form.lat || !form.lng) {
      return setError('Please drop a pin on the map to set your location.')
    }
    setSaving(true)
    try {
      if (isEdit) {
        const res = await api.put(`/user/addresses/${initial.id}`, form)
        onSaved(res.data.data.address, 'edit')
      } else {
        const res = await api.post('/user/addresses', form)
        onSaved(res.data.data.address, 'add')
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">{isEdit ? 'Edit Address' : 'Add New Address'}</h2>
              <p className="text-xs text-on-surface-variant">Drop a pin and fill in the details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            <div>
              <label className="text-xs font-semibold text-on-surface mb-2 block">Address Label</label>
              <div className="flex gap-2 flex-wrap">
                {LABELS.map(l => (
                  <button key={l} type="button"
                    onClick={() => set('label', l === 'Other' && form.label !== 'Other' ? 'Other' : l)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      l === 'Other'
                        ? !['Home', 'Work'].includes(form.label)
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        : form.label === l
                          ? 'bg-primary text-on-primary border-primary'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
              {!['Home', 'Work'].includes(form.label) && (
                <input
                  type="text"
                  autoFocus
                  value={form.label === 'Other' ? '' : form.label}
                  onChange={e => set('label', e.target.value || 'Other')}
                  placeholder="e.g. Gym, Parents, Clinic…"
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-primary bg-surface text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-on-surface">Pin Location <span className="text-error">*</span></label>
                {form.lat && <span className="text-xs text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                </span>}
              </div>

              {mapOpen ? (
                <div className="h-64 rounded-xl overflow-hidden border border-outline-variant">
                  <MapPicker value={{ lat: form.lat, lng: form.lng }} onChange={handleMapChange} />
                </div>
              ) : (
                <button type="button" onClick={() => setMapOpen(true)}
                  className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${form.lat ? 'border-primary/30 bg-primary/5' : 'border-outline-variant hover:border-primary/40 hover:bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px', fontVariationSettings: form.lat ? "'FILL' 1" : "'FILL' 0" }}>location_on</span>
                  {form.lat ? (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-primary">Location pinned</p>
                      <p className="text-xs text-on-surface-variant">Click to view or change on map</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-on-surface">Open Map to Pin Location</p>
                      <p className="text-xs text-on-surface-variant">Click to drop your pin on the map</p>
                    </div>
                  )}
                </button>
              )}

              {mapOpen && form.lat && (
                <button type="button" onClick={() => setMapOpen(false)} className="mt-2 text-xs text-primary hover:underline">
                  ↑ Collapse map
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', placeholder: 'Recipient name', col: 1 },
                { label: 'Phone Number', key: 'phone', placeholder: '+977 98XXXXXXXX', col: 1 },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-on-surface mb-1.5 block">{label} <span className="text-error">*</span></label>
                  <input type="text" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface mb-1.5 block">Street Address <span className="text-error">*</span></label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Street, area, landmark"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface mb-1.5 block">City <span className="text-error">*</span></label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Kathmandu"
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface mb-1.5 block">Province <span className="text-error">*</span></label>
                <select value={form.province} onChange={e => set('province', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="">Select</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface mb-1.5 block">ZIP / Postal</label>
                <input type="text" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="44600"
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.isDefault ? 'bg-primary border-primary' : 'border-outline-variant'}`}
                onClick={() => set('isDefault', !form.isDefault)}>
                {form.isDefault && <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check</span>}
              </div>
              <span className="text-sm text-on-surface">Set as default delivery address</span>
            </label>

            {error && <p className="text-xs text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-2.5">{error}</p>}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3 flex-shrink-0 bg-surface-container-lowest">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-sm flex items-center gap-2">
            {saving && <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>}
            {saving ? 'Saving…' : isEdit ? 'Update Address' : 'Save Address'}
          </button>
        </div>
      </div>
    </div>
  )
}
