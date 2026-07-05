import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/api'

const FIELD_CLS = 'w-full p-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface-container-lowest outline-none transition-all text-sm'
const LABEL_CLS = 'block text-sm font-semibold text-on-surface-variant mb-1.5'

const ICON_OPTIONS = ['medication', 'local_pharmacy', 'vaccines', 'medical_services', 'favorite', 'healing', 'sick', 'air', 'science', 'stethoscope', 'biotech', 'spa', 'visibility', 'psychology', 'dentistry', 'fitness_center', 'child_care', 'orthopedics']

export default function AdminAddCategory() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ name: '', description: '', icon: 'medication', isActive: 'true' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isEdit) {
      api.get(`/categories/${id}`)
        .then(res => {
          const c = res.data.data.category
          setForm({ name: c.name || '', description: c.description || '', icon: c.icon || 'medication', isActive: c.isActive ? 'true' : 'false' })
        })
        .catch(() => navigate('/admin/categories', { replace: true }))
    }
  }, [id])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name.trim()) { setError('Category name is required.'); return }
    setLoading(true)
    try {
      const payload = { ...form, isActive: form.isActive === 'true' }
      if (isEdit) {
        await api.put(`/categories/${id}`, payload)
        setSuccess('Category updated successfully!')
      } else {
        await api.post('/categories', payload)
        setSuccess('Category created successfully!')
        setTimeout(() => navigate('/admin/categories'), 1200)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-8 w-full h-16 sticky top-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
        <h2 className="text-lg font-bold text-primary">Categories</h2>
        <div className="flex items-center gap-3">
          <button className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">notifications</button>
        </div>
      </header>

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-on-surface">{isEdit ? 'Edit Category' : 'Add New Category'}</h1>
            <p className="text-sm text-on-surface-variant mt-1">Define a medical classification for the inventory system.</p>
          </div>
          <button
            onClick={() => navigate('/admin/categories')}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface font-medium hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-outline-variant">
                <span className="material-symbols-outlined text-primary">info</span>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={LABEL_CLS}>Category Name *</label>
                  <input className={FIELD_CLS} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Antibiotics, Vaccines, Supplements" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Description</label>
                  <textarea className={FIELD_CLS} name="description" value={form.description} onChange={handleChange} placeholder="Provide a brief description of this medicine category..." rows={4} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Category Status</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all select-none ${form.isActive === 'true' ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'}`}>
                      <input type="radio" name="isActive" value="true" checked={form.isActive === 'true'} onChange={handleChange} className="hidden" />
                      <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      <span className="text-sm font-semibold">Active</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all select-none ${form.isActive === 'false' ? 'border-error bg-error/5 text-error' : 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'}`}>
                      <input type="radio" name="isActive" value="false" checked={form.isActive === 'false'} onChange={handleChange} className="hidden" />
                      <span className="material-symbols-outlined text-[20px]">cancel</span>
                      <span className="text-sm font-semibold">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Icon Picker */}
          <div className="space-y-6">
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm sticky top-20">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-outline-variant">
                <span className="material-symbols-outlined text-primary">emoji_symbols</span>
                <h3 className="text-lg font-semibold">Category Icon</h3>
              </div>
              <div>
                <label className={LABEL_CLS}>Selected Icon</label>
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>{form.icon}</span>
                </div>
                <label className={LABEL_CLS}>Choose an Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, icon }))}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${form.icon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-surface-container-low border border-outline-variant'}`}
                    >
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className={LABEL_CLS}>Or type an icon name</label>
                  <input
                    className={FIELD_CLS}
                    name="icon"
                    value={form.icon}
                    onChange={handleChange}
                    placeholder="e.g. medication"
                    maxLength={40}
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm">
                <span className="material-symbols-outlined text-base align-middle mr-1">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                <span className="material-symbols-outlined text-base align-middle mr-1">check_circle</span>
                {success}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="lg:col-span-3 flex flex-col sm:flex-row-reverse items-center gap-4 border-t border-outline-variant pt-6 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined">save</span>
              {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Save Category'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="w-full sm:w-auto px-8 py-3 border border-outline-variant rounded-lg text-on-surface font-medium hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Info Banner */}
        <div className="mt-6 bg-tertiary-fixed rounded-xl p-4 flex gap-4 items-center">
          <div className="bg-tertiary-container text-white p-2 rounded-lg">
            <span className="material-symbols-outlined">notifications_active</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-tertiary-fixed">Category Sync Notice</h4>
            <p className="text-sm text-on-tertiary-fixed-variant">New categories become available immediately in the medicine management form for product classification.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

