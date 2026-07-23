import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/api'

const FIELD_CLS = 'w-full rounded-lg border border-outline-variant px-3 py-2 text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all'
const LABEL_CLS = 'block text-xs font-semibold text-on-surface-variant mb-1'

export default function AdminAddMedicine() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '', brand: '', description: '',
    categoryId: '', type: 'OTC',
    price: '', stockQuantity: '', inStock: 'true',
    expiryDate: '',
    manufacturer: '', dosage: '', usage: '', sideEffects: '',
    imageUrl: '',
  })

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data.categories || [])).catch(() => {})
    if (isEdit) {
      api.get(`/medicines/${id}`).then(res => {
        const m = res.data.data.medicine
        setForm({
          name: m.name || '', brand: m.brand || '', description: m.description || '',
          categoryId: m.categoryId || '', type: m.type || 'OTC',
          price: m.price || '', stockQuantity: m.stockQuantity || 0,
          inStock: m.inStock ? 'true' : 'false',
          expiryDate: m.expiryDate ? m.expiryDate.split('T')[0] : '',
          manufacturer: m.manufacturer || '', dosage: m.dosage || '',
          usage: m.usage || '', sideEffects: m.sideEffects || '',
          imageUrl: m.imageUrl || '',
        })
      }).catch(() => {})
    }
  }, [id])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!form.name || !form.brand || !form.price || !form.categoryId) {
      setError('Name, generic name, price, and category are required.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity || 0),
        inStock: form.inStock === 'true',
      }
      if (isEdit) {
        await api.put(`/medicines/${id}`, payload)
        setSuccess('Medicine updated successfully!')
      } else {
        await api.post('/medicines', payload)
        setSuccess('Medicine added successfully!')
        setTimeout(() => navigate('/admin/medicines'), 1200)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine.')
    }
    setLoading(false)
  }

  const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-outline-variant">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-8 py-6 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-on-surface">{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
            <p className="text-sm text-on-surface-variant">Populate the pharmaceutical database with inventory details.</p>
          </div>
          <button
            onClick={() => navigate('/admin/medicines')}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <SectionHeader icon="info" title="Basic Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Medicine Name *</label>
                  <input className={FIELD_CLS} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Paracetamol 500mg" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Generic Name *</label>
                  <input className={FIELD_CLS} name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Acetaminophen" />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL_CLS}>Description</label>
                  <textarea className={FIELD_CLS} name="description" value={form.description} onChange={handleChange} placeholder="Brief overview of the medicine's primary use..." rows={3} />
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <SectionHeader icon="grid_view" title="Classification" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Category *</label>
                  <select className={FIELD_CLS} name="categoryId" value={form.categoryId} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Medicine Type</label>
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" value="Rx" checked={form.type === 'Rx'} onChange={handleChange} className="text-primary focus:ring-primary w-4 h-4" />
                      <span className="text-sm text-on-surface">Rx Required</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" value="OTC" checked={form.type === 'OTC'} onChange={handleChange} className="text-primary focus:ring-primary w-4 h-4" />
                      <span className="text-sm text-on-surface">OTC (Over the Counter)</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <SectionHeader icon="payments" title="Pricing & Inventory" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Price (Rs) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-sm">Rs</span>
                    <input className={`${FIELD_CLS} pl-8`} name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Stock Quantity</label>
                  <input className={FIELD_CLS} name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="Units in stock" min="0" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Availability Status</label>
                  <select className={FIELD_CLS} name="inStock" value={form.inStock} onChange={handleChange}>
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Expiry Date <span className="text-on-surface-variant font-normal">(optional)</span></label>
                  <input className={FIELD_CLS} name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <SectionHeader icon="clinical_notes" title="Additional Info" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLS}>Manufacturer</label>
                    <input className={FIELD_CLS} name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="e.g. GlaxoSmithKline" />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Dosage Information</label>
                    <input className={FIELD_CLS} name="dosage" value={form.dosage} onChange={handleChange} placeholder="e.g. One tablet twice daily" />
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Usage Instructions</label>
                  <textarea className={FIELD_CLS} name="usage" value={form.usage} onChange={handleChange} placeholder="Should be taken after meals with water..." rows={2} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Side Effects</label>
                  <textarea className={FIELD_CLS} name="sideEffects" value={form.sideEffects} onChange={handleChange} placeholder="Drowsiness, nausea, mild headache..." rows={2} />
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <SectionHeader icon="image" title="Media" />
              <label className={LABEL_CLS}>Medicine Image URL</label>
              <input className={FIELD_CLS} name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" type="url" />
              {form.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-outline-variant">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover" onError={e => { e.target.style.display = 'none' }} />
                </div>
              )}
              {!form.imageUrl && (
                <div className="mt-3 border-2 border-dashed border-outline-variant rounded-xl p-8 text-center bg-surface hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-5xl text-outline opacity-40">cloud_upload</span>
                  <p className="text-sm font-medium mt-2 text-on-surface">Enter image URL above</p>
                  <p className="text-xs text-on-surface-variant mt-1">PNG, JPG or WEBP</p>
                </div>
              )}
            </section>

            <section className="bg-primary p-6 rounded-xl text-on-primary shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-lg font-semibold mb-4">Inventory Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm opacity-90">
                    <span>Type:</span>
                    <span className="font-bold">{form.type === 'Rx' ? 'Rx Required' : 'OTC'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm opacity-90">
                    <span>Stock:</span>
                    <span className="font-bold">{form.stockQuantity || 0} units</span>
                  </div>
                  <div className="flex justify-between items-center text-sm opacity-90">
                    <span>Status:</span>
                    <span className="font-bold">{form.inStock === 'true' ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  {form.expiryDate && (
                    <div className="flex justify-between items-center text-sm opacity-90">
                      <span>Expires:</span>
                      <span className="font-bold">{new Date(form.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-8 top-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
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

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-semibold text-lg rounded-xl hover:opacity-90 shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Medicine' : 'Save Medicine'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/medicines')}
                className="w-full py-4 bg-surface-container-high text-on-surface-variant font-medium rounded-xl hover:bg-surface-container-highest transition-colors border border-outline-variant"
              >
                Cancel & Discard
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
