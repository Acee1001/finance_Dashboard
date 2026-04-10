import { useEffect, useState, useCallback, useRef } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { SkeletonRow } from '../components/Skeleton'

const CATEGORIES = ['salary','freelance','investment','food','transport','utilities','entertainment','healthcare','education','rent','other']
const TYPES = ['income','expense']
const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const EMPTY_FORM = { amount:'', type:'income', category:'salary', date:'', notes:'' }

const TYPE_STYLE = {
  income:  { color:'#047857', bg:'rgba(5,150,105,0.10)', border:'rgba(5,150,105,0.25)' },
  expense: { color:'#be123c', bg:'rgba(225,29,72,0.08)',  border:'rgba(225,29,72,0.20)' },
}

export default function Transactions() {
  const { canWrite } = useAuth()
  const toast = useToast()
  const [txs, setTxs]           = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [sortKey, setSortKey]   = useState('date')
  const [sortDir, setSortDir]   = useState('desc')
  const [search, setSearch]     = useState('')
  const [filters, setFilters]   = useState({ type:'', category:'', date_from:'', date_to:'' })
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const searchRef = useRef(null)
  const PAGE_SIZE = 15

  const fetchTxs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: PAGE_SIZE, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) }
      const { data } = await api.get('/transactions/', { params })
      setTxs(data.data); setTotal(data.total)
    } catch (e) {
      toast.error('Failed to load transactions')
    } finally { setLoading(false) }
  }, [page, filters, toast])

  useEffect(() => { fetchTxs() }, [fetchTxs])

  // Keyboard shortcut: N = new transaction
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'n' && canWrite && !modal && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault(); openCreate()
      }
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault(); searchRef.current?.focus()
      }
      if (e.key === 'Escape') { setModal(null); setDeleteConfirm(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modal, canWrite])

  const modalRef = useRef(null)
  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create'); modalRef.current = 'create' }
  const openEdit = (tx) => {
    const dateStr = (tx.date || '').toString().slice(0, 10)
    setForm({ amount: String(tx.amount), type: tx.type, category: tx.category, date: dateStr, notes: tx.notes ?? '' })
    setFormError('')
    setModal(tx)
    modalRef.current = tx
  }
  const closeModal = () => { setModal(null); modalRef.current = null }

  const handleSave = async () => {
    setFormError('')
    if (!form.amount || !form.date) return setFormError('Amount and date are required.')
    if (parseFloat(form.amount) <= 0) return setFormError('Amount must be greater than 0.')
    setSaving(true)
    const currentModal = modalRef.current
    const payload = {
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      notes: form.notes || null,
    }
    try {
      if (currentModal === 'create') {
        await api.post('/transactions/', payload)
        toast.success('Transaction created!')
      } else {
        const txId = currentModal?.id || currentModal
        await api.patch(`/transactions/${txId}`, payload)
        toast.success('Transaction updated!')
      }
      closeModal(); fetchTxs()
    } catch (e) {
      const detail = e.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg || d.loc?.join('.') || JSON.stringify(d)).join(', ')
        : (detail || 'Failed to save.')
      setFormError(msg); toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`)
      toast.success('Transaction deleted')
      setDeleteConfirm(null); fetchTxs()
    } catch (e) { toast.error('Failed to delete') }
  }

  const handleBulkDelete = async () => {
    if (!selected.size) return
    if (!confirm(`Delete ${selected.size} transaction(s)?`)) return
    try {
      await Promise.all([...selected].map(id => api.delete(`/transactions/${id}`)))
      toast.success(`Deleted ${selected.size} transactions`)
      setSelected(new Set()); fetchTxs()
    } catch { toast.error('Some deletions failed') }
  }

  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll    = () => setSelected(s => s.size === txs.length ? new Set() : new Set(txs.map(t => t.id)))

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  // Client-side search + sort
  const displayed = txs
    .filter(tx => !search || tx.category.includes(search.toLowerCase()) || (tx.notes||'').toLowerCase().includes(search.toLowerCase()) || String(tx.amount).includes(search))
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (sortKey === 'amount') { va = +va; vb = +vb }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const SortIcon = ({ k }) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ·'
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Stats strip
  const totalIncome  = txs.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={s.header} className="fade-up">
        <div>
          <h1 style={s.pageTitle}>Transactions</h1>
          <p style={s.pageSub}>{total} records · press <kbd style={s.kbd}>/</kbd> to search{canWrite && <>, <kbd style={s.kbd}>N</kbd> to create</>}</p>
        </div>
        {canWrite && (
          <button style={s.addBtn} className="btn-press" onClick={openCreate}>
            + New Transaction
          </button>
        )}
      </div>

      {/* Stats strip */}
      <div style={s.statsStrip} className="fade-up-1">
        <div style={s.stat}>
          <span style={{ ...s.statDot, background:'#10b981' }} />
          <span style={s.statLabel}>Page Income</span>
          <span style={{ ...s.statValue, color:'#047857' }}>{fmt(totalIncome)}</span>
        </div>
        <div style={s.statDivider} />
        <div style={s.stat}>
          <span style={{ ...s.statDot, background:'#f43f5e' }} />
          <span style={s.statLabel}>Page Expense</span>
          <span style={{ ...s.statValue, color:'#be123c' }}>{fmt(totalExpense)}</span>
        </div>
        <div style={s.statDivider} />
        <div style={s.stat}>
          <span style={s.statLabel}>Net</span>
          <span style={{ ...s.statValue, color: totalIncome-totalExpense >= 0 ? '#7c3aed' : '#be123c' }}>
            {totalIncome-totalExpense >= 0 ? '+' : ''}{fmt(totalIncome - totalExpense)}
          </span>
        </div>
        <div style={s.statDivider} />
        <div style={s.stat}>
          <span style={s.statLabel}>Showing</span>
          <span style={{ ...s.statValue, color:'var(--c-text)' }}>{displayed.length} / {total}</span>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={s.filterBar} className="fade-up-1">
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>⌕</span>
          <input
            ref={searchRef}
            className="input-styled"
            style={{ ...s.searchInput }}
            placeholder="Search by category or notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={s.clearSearch} onClick={() => setSearch('')}>✕</button>}
        </div>

        <select className="input-styled" style={s.select} value={filters.type} onChange={e => { setFilters(f => ({...f, type:e.target.value})); setPage(1) }}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select className="input-styled" style={s.select} value={filters.category} onChange={e => { setFilters(f => ({...f, category:e.target.value})); setPage(1) }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input className="input-styled" style={s.select} type="date" value={filters.date_from} onChange={e => { setFilters(f => ({...f, date_from:e.target.value})); setPage(1) }} />
        <input className="input-styled" style={s.select} type="date" value={filters.date_to}   onChange={e => { setFilters(f => ({...f, date_to:e.target.value})); setPage(1) }} />

        <button className="btn-press" style={s.clearBtn} onClick={() => { setFilters({type:'',category:'',date_from:'',date_to:''}); setSearch(''); setPage(1) }}>
          ✕ Clear
        </button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && canWrite && (
        <div style={s.bulkBar} className="scale-in">
          <span style={{ fontSize:13, color:'var(--c-text-2)' }}>{selected.size} selected</span>
          <button style={s.bulkDelBtn} className="btn-press" onClick={handleBulkDelete}>
            🗑 Delete {selected.size}
          </button>
          <button style={s.bulkClearBtn} className="btn-press" onClick={() => setSelected(new Set())}>Deselect all</button>
        </div>
      )}

      {/* Table */}
      <div style={s.tableWrap} className="fade-up-2">
        <table style={s.table}>
          <thead>
            <tr>
              {canWrite && (
                <th style={{ ...s.th, width: 40 }}>
                  <input type="checkbox" checked={selected.size === txs.length && txs.length > 0} onChange={toggleAll} style={{ cursor:'pointer', accentColor:'var(--c-violet)' }} />
                </th>
              )}
              {[['date','Date'],['type','Type'],['category','Category'],['amount','Amount']].map(([k,l]) => (
                <th key={k} style={{ ...s.th, cursor:'pointer', userSelect:'none' }} onClick={() => handleSort(k)}>
                  {l}<span style={{ color:'var(--c-violet-light)', fontSize:10 }}><SortIcon k={k} /></span>
                </th>
              ))}
              <th style={s.th}>Notes</th>
              {canWrite && <th style={s.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(6).fill(0).map((_,i) => <SkeletonRow key={i}/>)
              : displayed.length === 0
                ? <tr><td colSpan={99} style={{ textAlign:'center', padding:'48px', color:'var(--c-text-3)', fontSize:14 }}>No transactions found</td></tr>
                : displayed.map((tx, i) => (
                  <tr
                    key={tx.id}
                    style={{ ...s.tr, background: selected.has(tx.id) ? 'rgba(124,58,237,0.07)' : 'transparent', animationDelay: i*0.02+'s' }}
                    className="fade-up"
                    onMouseEnter={e => { if (!selected.has(tx.id)) e.currentTarget.style.background = 'var(--c-surface2)' }}
                    onMouseLeave={e => { if (!selected.has(tx.id)) e.currentTarget.style.background = 'transparent' }}
                  >
                    {canWrite && (
                      <td style={s.td}>
                        <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggleSelect(tx.id)} style={{ cursor:'pointer', accentColor:'var(--c-violet)' }} />
                      </td>
                    )}
                    <td style={{ ...s.td, color:'var(--c-text-2)', fontSize:12 }}>{tx.date}</td>
                    <td style={s.td}>
                      <span style={{ ...s.typeBadge, color:TYPE_STYLE[tx.type].color, background:TYPE_STYLE[tx.type].bg, border:`1px solid ${TYPE_STYLE[tx.type].border}` }}>
                        {tx.type === 'income' ? '↑' : '↓'} {tx.type}
                      </span>
                    </td>
                    <td style={s.td}><span style={s.catLabel}>{tx.category}</span></td>
                    <td style={{ ...s.td, fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:tx.type==='income'?'#047857':'#be123c' }}>
                      {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                    </td>
                    <td style={{ ...s.td, color:'var(--c-text-3)', fontSize:12, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {tx.notes || <span style={{ color:'var(--c-border2)' }}>—</span>}
                    </td>
                    {canWrite && (
                      <td style={s.td}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button style={s.editBtn} className="btn-press" onClick={() => openEdit(tx)}>Edit</button>
                          <button style={s.delBtn}  className="btn-press" onClick={() => setDeleteConfirm(tx)}>Del</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={s.pageBtn} className="btn-press" disabled={page===1} onClick={() => setPage(1)}>«</button>
          <button style={s.pageBtn} className="btn-press" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹ Prev</button>
          <div style={{ display:'flex', gap:4 }}>
            {Array.from({length:Math.min(totalPages,7)},(_,i) => {
              const p = totalPages <= 7 ? i+1 : (page <= 4 ? i+1 : page-3+i)
              if (p < 1 || p > totalPages) return null
              return (
                <button key={p} style={{ ...s.pageBtn, ...(p===page ? { background:'var(--c-violet)', color:'#fff', borderColor:'var(--c-violet)', boxShadow:'0 2px 12px rgba(124,58,237,0.4)' } : {}) }} className="btn-press" onClick={() => setPage(p)}>{p}</button>
              )
            })}
          </div>
          <button style={s.pageBtn} className="btn-press" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next ›</button>
          <button style={s.pageBtn} className="btn-press" disabled={page===totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal !== null && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()} className="scale-in">
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{modal==='create'?'New Transaction':'Edit Transaction'}</h2>
              <button style={s.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div style={s.modalBody}>
              {/* Amount */}
              <label style={s.label}>Amount (₹)</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--c-text-3)', fontSize:14, fontWeight:600 }}>₹</span>
                <input className="input-styled" style={{ ...s.input, paddingLeft:28 }} type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} placeholder="0.00" autoFocus />
              </div>

              {/* Type + Category */}
              <div style={{ display:'flex', gap:12 }}>
                <div style={{ flex:1 }}>
                  <label style={s.label}>Type</label>
                  <div style={{ display:'flex', gap:6 }}>
                    {TYPES.map(t => (
                      <button key={t} className="btn-press" onClick={() => setForm(f => ({...f, type:t}))} style={{ flex:1, padding:'9px 0', borderRadius:8, border:`1px solid ${form.type===t?(t==='income'?'rgba(16,185,129,0.5)':'rgba(244,63,94,0.5)'):'var(--c-border)'}`, background:form.type===t?(t==='income'?'rgba(16,185,129,0.15)':'rgba(244,63,94,0.15)'):'var(--c-surface2)', color:form.type===t?(t==='income'?'#047857':'#be123c'):'var(--c-text-2)', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize', transition:'all 0.2s' }}>
                        {t==='income'?'↑ Income':'↓ Expense'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  <label style={s.label}>Category</label>
                  <select className="input-styled" style={s.input} value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <label style={s.label}>Date</label>
              <input className="input-styled" style={s.input} type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} />

              <label style={s.label}>Notes <span style={{ color:'var(--c-text-3)', fontWeight:400, textTransform:'none', fontSize:11 }}>(optional)</span></label>
              <textarea className="input-styled" style={{ ...s.input, resize:'vertical', minHeight:72 }} value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="Brief description…" />

              {formError && <p style={s.formError}>⚠ {formError}</p>}

              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button style={s.cancelBtn} className="btn-press" onClick={closeModal}>Cancel</button>
                <button style={s.saveBtn}   className="btn-press" onClick={handleSave} disabled={saving}>
                  {saving ? <span style={{ display:'inline-block', animation:'spin 0.7s linear infinite' }}>↻</span> : null}
                  {' '}{saving ? 'Saving…' : modal==='create' ? 'Create Transaction' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={s.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...s.modalCard, maxWidth:400 }} onClick={e => e.stopPropagation()} className="scale-in">
            <div style={s.modalBody}>
              <div style={{ textAlign:'center', marginBottom:8 }}>
                <div style={{ width:52,height:52,borderRadius:14,background:'rgba(244,63,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,margin:'0 auto 16px' }}>🗑</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--c-text)', marginBottom:8 }}>Delete Transaction?</h3>
                <p style={{ fontSize:13, color:'var(--c-text-2)' }}>
                  This will permanently delete <strong style={{ color:'var(--c-text)' }}>{deleteConfirm.category}</strong> — {fmt(deleteConfirm.amount)}
                </p>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button style={s.cancelBtn} className="btn-press" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button style={{ ...s.saveBtn, background:'linear-gradient(135deg,#f43f5e,#be123c)', boxShadow:'0 4px 16px rgba(244,63,94,0.3)' }} className="btn-press" onClick={() => handleDelete(deleteConfirm.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  header:      { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 },
  pageTitle:   { fontFamily:'var(--font-display)', fontWeight:800, fontSize:30, color:'var(--c-text)', letterSpacing:'-0.5px' },
  pageSub:     { color:'var(--c-text-2)', fontSize:13, marginTop:4 },
  kbd:         { display:'inline-block', padding:'1px 6px', borderRadius:4, border:'1px solid var(--c-border)', background:'var(--c-surface2)', fontSize:11, fontFamily:'monospace', color:'var(--c-text-2)', marginLeft:3 },
  addBtn:      { padding:'11px 20px', background:'linear-gradient(135deg,#7c3aed,#7c3aed)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'0 4px 16px rgba(124,58,237,0.4)', whiteSpace:'nowrap' },
  statsStrip:  { display:'flex', alignItems:'center', gap:16, background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:12, padding:'12px 20px', marginBottom:14 },
  stat:        { display:'flex', alignItems:'center', gap:8 },
  statDot:     { width:7,height:7,borderRadius:'50%',flexShrink:0 },
  statLabel:   { fontSize:11, color:'var(--c-text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 },
  statValue:   { fontSize:14, fontWeight:800, fontFamily:'var(--font-display)' },
  statDivider: { width:1, height:24, background:'var(--c-border)', flexShrink:0 },
  filterBar:   { display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems:'center' },
  searchWrap:  { position:'relative', display:'flex', alignItems:'center', flex:'1 1 220px', minWidth:180 },
  searchIcon:  { position:'absolute', left:10, color:'var(--c-text-3)', fontSize:18, pointerEvents:'none', zIndex:1 },
  searchInput: { width:'100%', padding:'9px 32px 9px 32px', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:8, color:'var(--c-text)', fontSize:13, fontFamily:'var(--font-body)' },
  clearSearch: { position:'absolute', right:8, background:'none', border:'none', color:'var(--c-text-3)', cursor:'pointer', fontSize:13, padding:'2px 4px' },
  select:      { padding:'9px 12px', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:8, color:'var(--c-text)', fontSize:13, fontFamily:'var(--font-body)', cursor:'pointer' },
  clearBtn:    { padding:'9px 14px', background:'transparent', border:'1px solid var(--c-border)', borderRadius:8, color:'var(--c-text-2)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600, whiteSpace:'nowrap' },
  bulkBar:     { display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:10, marginBottom:10 },
  bulkDelBtn:  { padding:'6px 14px', background:'rgba(244,63,94,0.15)', border:'1px solid rgba(244,63,94,0.3)', borderRadius:7, color:'var(--c-rose-light)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)' },
  bulkClearBtn:{ marginLeft:'auto', padding:'6px 12px', background:'transparent', border:'1px solid var(--c-border)', borderRadius:7, color:'var(--c-text-3)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)' },
  tableWrap:   { background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', overflow:'hidden', marginBottom:16 },
  table:       { width:'100%', borderCollapse:'collapse' },
  th:          { padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--c-text-3)', textTransform:'uppercase', letterSpacing:0.8, borderBottom:'1px solid var(--c-border)', background:'var(--c-surface)', whiteSpace:'nowrap' },
  tr:          { borderBottom:'1px solid var(--c-border)', transition:'background 0.1s' },
  td:          { padding:'12px 16px', fontSize:13, color:'var(--c-text)' },
  typeBadge:   { display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:700, textTransform:'capitalize', letterSpacing:0.3 },
  catLabel:    { color:'var(--c-text-2)', textTransform:'capitalize', fontSize:13 },
  editBtn:     { padding:'5px 11px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:6, color:'var(--c-violet-light)', fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  delBtn:      { padding:'5px 11px', background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', borderRadius:6, color:'var(--c-rose-light)', fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  pagination:  { display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:24 },
  pageBtn:     { padding:'7px 13px', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:8, color:'var(--c-text-2)', cursor:'pointer', fontSize:12, fontFamily:'var(--font-body)', transition:'all 0.15s' },
  overlay:     { position:'fixed', inset:0, background:'rgba(15,15,40,0.55)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 },
  modalCard:   { background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:20, width:'100%', maxWidth:520, boxShadow:'0 24px 80px rgba(0,0,0,0.18)' },
  modalHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--c-border)' },
  modalTitle:  { fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'var(--c-text)' },
  closeBtn:    { background:'none', border:'none', color:'var(--c-text-3)', fontSize:18, cursor:'pointer', padding:'4px 8px', borderRadius:6 },
  modalBody:   { padding:'22px 24px', display:'flex', flexDirection:'column', gap:12 },
  label:       { fontSize:11, fontWeight:700, color:'var(--c-text-3)', textTransform:'uppercase', letterSpacing:0.8 },
  input:       { padding:'10px 12px', background:'var(--c-surface2)', border:'1px solid var(--c-border)', borderRadius:8, color:'var(--c-text)', fontSize:14, fontFamily:'var(--font-body)', width:'100%' },
  formError:   { color:'var(--c-rose)', fontSize:12, background:'rgba(244,63,94,0.08)', padding:'8px 12px', borderRadius:7, border:'1px solid rgba(244,63,94,0.2)' },
  cancelBtn:   { flex:1, padding:'12px', background:'var(--c-surface2)', border:'1px solid var(--c-border)', borderRadius:10, color:'var(--c-text-2)', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'var(--font-body)' },
  saveBtn:     { flex:2, padding:'12px', background:'linear-gradient(135deg,#7c3aed,#7c3aed)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'0 4px 16px rgba(124,58,237,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:6 },
}
