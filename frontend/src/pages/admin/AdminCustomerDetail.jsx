import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_CFG = {
  PLACED:           { label: 'Placed',          color: 'bg-surface-container-highest text-on-surface-variant' },
  CONFIRMED:        { label: 'Confirmed',        color: 'bg-blue-100 text-blue-700' },
  PROCESSING:       { label: 'Processing',       color: 'bg-amber-100 text-amber-700' },
  SHIPPED:          { label: 'Shipped',          color: 'bg-indigo-100 text-indigo-700' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700' },
  DELIVERED:        { label: 'Delivered',        color: 'bg-primary/10 text-primary' },
  CANCELLED:        { label: 'Cancelled',        color: 'bg-error-container text-on-error-container' },
}

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const [blocking, setBlocking]   = useState(false)

  useEffect(() => {
    api.get(`/admin/customers/${id}`)
      .then(res => setCustomer(res.data.data.customer))
      .catch(() => navigate('/admin/customers'))
      .finally(() => setLoading(false))
  }, [id])

  const handleBlock = async () => {
    const msg = customer.isActive ? 'Block this customer?' : 'Unblock this customer?'
    if (!confirm(msg)) return
    setBlocking(true)
    try {
      const res = await api.put(`/admin/customers/${id}/block`)
      setCustomer(prev => ({ ...prev, isActive: res.data.data.customer.isActive }))
    } catch {}
    finally { setBlocking(false) }
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-40 bg-surface-container-lowest rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-container-lowest rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!customer) return null

  const address = customer.addresses?.[0]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to="/admin/customers" className="hover:text-primary transition-colors">Customers</Link>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
        <span className="text-on-surface font-medium">{customer.fullName}</span>
      </div>

      {/* Header card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary-fixed flex items-center justify-center text-secondary text-2xl font-bold border border-outline-variant">
              {customer.avatarUrl
                ? <img src={`${BACKEND}${customer.avatarUrl}`} className="w-full h-full object-cover" alt="" />
                : initials(customer.fullName)}
            </div>
            <span className={`absolute -bottom-2 -right-2 text-[10px] px-2 py-1 rounded-full font-bold uppercase ${customer.isActive ? 'bg-primary text-white' : 'bg-error text-white'}`}>
              {customer.isActive ? 'Active' : 'Blocked'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface">{customer.fullName}</h2>
            <p className="text-on-surface-variant text-sm flex items-center gap-2 mt-1 flex-wrap">
              <span className="bg-surface-container-high px-2 py-0.5 rounded text-[11px] font-bold text-primary">#{customer.id.slice(0, 8).toUpperCase()}</span>
              <span>•</span>
              <span>Joined {fmtDate(customer.createdAt)}</span>
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {customer.email && <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded">{customer.email}</span>}
              {customer.phone && <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded">{customer.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href={`mailto:${customer.email}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-all text-sm">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
            Notify
          </a>
          <button onClick={handleBlock} disabled={blocking}
            className={`flex items-center gap-2 px-5 py-2.5 border font-semibold rounded-xl transition-all text-sm disabled:opacity-50 ${customer.isActive ? 'border-error text-error hover:bg-error/5' : 'border-primary text-primary hover:bg-primary/5'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{customer.isActive ? 'block' : 'check_circle'}</span>
            {blocking ? '…' : customer.isActive ? 'Block' : 'Unblock'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders',         value: customer._count?.orders ?? 0,        icon: 'shopping_bag', color: 'text-primary bg-primary/10' },
          { label: 'Total Spent',          value: `NPR ${(customer.totalSpent||0).toLocaleString()}`, icon: 'payments', color: 'text-secondary bg-secondary/10' },
          { label: 'Prescriptions',        value: customer._count?.prescriptions ?? 0,  icon: 'description', color: 'text-tertiary bg-tertiary/10' },
          { label: 'Wishlist Items',       value: customer._count?.wishlist ?? 0,       icon: 'favorite',    color: 'text-red-500 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-on-surface-variant font-medium">{s.label}</p>
              <span className={`material-symbols-outlined p-1.5 rounded-lg ${s.color}`} style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-on-surface">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Account Info */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface">Account Information</h4>
            </div>
            <div className="p-5 space-y-4">
              {[
                { icon: 'mail',        label: 'Email Address', value: customer.email },
                { icon: 'call',        label: 'Phone Number',  value: customer.phone || '-' },
                { icon: 'person',      label: 'Gender',        value: customer.gender || '-' },
                { icon: 'cake',        label: 'Date of Birth', value: fmtDate(customer.dob) },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary/5 p-2 rounded-lg" style={{ fontSize: '18px' }}>{f.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{f.label}</p>
                    <p className="text-sm font-semibold text-on-surface mt-0.5 truncate">{f.value}</p>
                  </div>
                </div>
              ))}
              {address && (
                <div className="flex items-start gap-3 pt-3 border-t border-outline-variant">
                  <span className="material-symbols-outlined text-primary bg-primary/5 p-2 rounded-lg" style={{ fontSize: '18px' }}>location_on</span>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Address</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed mt-0.5">{address.address}, {address.city}, {address.province}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical observations */}
          {customer.allergies && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low">
                <h4 className="text-sm font-bold text-on-surface">Medical Observations</h4>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {customer.allergies.split(',').map((a, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-[11px] font-bold rounded-lg border border-red-100">
                      {a.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent prescriptions */}
          {customer.prescriptions?.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low">
                <h4 className="text-sm font-bold text-on-surface">Recent Prescriptions</h4>
              </div>
              <div className="divide-y divide-outline-variant">
                {customer.prescriptions.map(rx => (
                  <div key={rx.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{rx.fileName}</p>
                      <p className="text-xs text-on-surface-variant">{fmtDate(rx.uploadedAt)}</p>
                    </div>
                    <span className={`ml-3 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                      rx.status === 'VERIFIED' ? 'bg-primary/10 text-primary'
                      : rx.status === 'REJECTED' ? 'bg-error/10 text-error'
                      : 'bg-amber-100 text-amber-700'}`}>
                      {rx.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Order history */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface">Order History</h4>
              <span className="text-xs text-on-surface-variant">{customer._count?.orders} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {customer.orders?.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-on-surface-variant text-sm">No orders yet</td></tr>
                  ) : customer.orders?.map(order => {
                    const cfg = STATUS_CFG[order.status] || STATUS_CFG.PLACED
                    return (
                      <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-5 py-4 font-mono text-sm font-semibold text-on-surface">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-5 py-4 text-sm text-on-surface-variant">{fmtDate(order.placedAt)}</td>
                        <td className="px-5 py-4 text-sm font-bold">NPR {Number(order.totalAmount).toFixed(0)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link to={`/admin/orders`} className="text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
