import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminCustomers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage]                 = useState(1)
  const [pages, setPages]               = useState(1)
  const [total, setTotal]               = useState(0)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebounced(search); setPage(1) }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (debouncedSearch) params.search = debouncedSearch
      if (filterStatus) params.status = filterStatus

      const [custRes, statsRes] = await Promise.all([
        api.get('/admin/customers', { params }),
        api.get('/admin/stats'),
      ])
      const d = custRes.data.data
      setCustomers(d.customers || [])
      setPages(d.pagination.pages)
      setTotal(d.pagination.total)
      setStats(statsRes.data.data)
    } catch {}
    finally { setLoading(false) }
  }, [page, debouncedSearch, filterStatus])

  useEffect(() => { load() }, [load])

  const handleBlock = async (id, isActive) => {
    if (!confirm(isActive ? 'Block this customer?' : 'Unblock this customer?')) return
    try {
      await api.put(`/admin/customers/${id}/block`)
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c))
    } catch {}
  }

  const activeCount  = customers.filter(c => c.isActive).length
  const blockedCount = customers.filter(c => !c.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <p className="text-sm text-on-surface-variant">Manage registered customers and their account status.</p>
        <button className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
          Export Customers
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: stats?.totalCustomers ?? '…', icon: 'group',        color: 'text-primary bg-primary/10',     badge: null },
          { label: 'Active',          value: activeCount,                  icon: 'person_check', color: 'text-secondary bg-secondary/10', badge: null },
          { label: 'Blocked',         value: blockedCount,                 icon: 'block',        color: 'text-error bg-error/10',         badge: null },
          { label: 'New This Month',  value: stats?.newCustomers ?? '…',   icon: 'person_add',   color: 'text-tertiary bg-tertiary/10',   badge: null },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${s.color}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant font-medium">{s.label}</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-wrap items-center gap-5">
        <div className="flex-1 min-w-[260px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
          <input
            type="text"
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-surface-container-lowest"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-on-surface-variant uppercase font-bold">Status:</span>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="bg-surface-container-low border border-outline-variant rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-primary focus:outline-none">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <button onClick={() => { setSearch(''); setFilterStatus(''); setPage(1) }}
          className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors" title="Clear">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list_off</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Customer ID', 'Profile', 'Contact Info', 'Orders', 'Total Spent', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-surface-container rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>group_off</span>
                    <p className="text-sm mt-2">No customers found</p>
                  </td>
                </tr>
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">#{c.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-sm">
                        {c.avatarUrl
                          ? <img src={`${BACKEND}${c.avatarUrl}`} className="w-full h-full object-cover" alt="" />
                          : initials(c.fullName)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{c.fullName}</p>
                        <p className="text-[11px] text-on-surface-variant">Joined {fmtDate(c.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-on-surface">{c.email}</p>
                    <p className="text-xs text-on-surface-variant">{c.phone || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-on-surface">{c._count?.orders ?? 0}</span>
                    <span className="text-xs text-on-surface-variant ml-1">orders</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">
                    NPR {(c.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                      c.isActive ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                    }`}>
                      {c.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/customers/${c.id}`}
                        className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all" title="View Profile">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                      </Link>
                      <button onClick={() => handleBlock(c.id, c.isActive)}
                        className={`p-2 rounded-lg transition-all ${c.isActive ? 'hover:bg-error/10 text-on-surface-variant hover:text-error' : 'hover:bg-primary/10 text-on-surface-variant hover:text-primary'}`}
                        title={c.isActive ? 'Block' : 'Unblock'}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{c.isActive ? 'block' : 'check_circle'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center flex-wrap gap-3">
          <p className="text-sm text-on-surface-variant">Showing {customers.length} of {total} customers</p>
          {pages > 1 && (
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              {[...Array(Math.min(pages, 5))].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-on-primary' : 'border border-outline-variant hover:bg-surface-container'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container disabled:opacity-40 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
