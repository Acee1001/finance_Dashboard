import { useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const ROLES = ['admin','analyst','viewer']
const ROLE_COLOR = { admin:'#7c3aed', analyst:'#059669', viewer:'#0284c7' }
const ROLE_BG    = { admin:'rgba(124,58,237,0.10)', analyst:'rgba(5,150,105,0.10)', viewer:'rgba(2,132,199,0.10)' }
const ROLE_ICON  = { admin:'◈', analyst:'◉', viewer:'◯' }
const EMPTY_FORM = { name:'', email:'', password:'', role:'viewer' }

export default function Users() {
  const toast = useToast()
  const { user: me } = useAuth()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [formError, setFormError] = useState('')
  const [toggling, setToggling]   = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/users/'); setUsers(data) }
    catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create') }
  const openEdit   = (u) => { setForm({ name:u.name, email:u.email, password:'', role:u.role, status:u.status }); setFormError(''); setModal(u) }
  const closeModal = () => setModal(null)

  const handleSave = async () => {
    setFormError('')
    if (!form.name.trim()) return setFormError('Name is required.')
    if (!form.email.trim()) return setFormError('Email is required.')
    if (modal === 'create' && form.password.length < 6) return setFormError('Password must be at least 6 characters.')
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.post('/users/', { ...form, status: 'active' })
        toast.success(`User ${form.name} created!`)
      } else {
        await api.patch(`/users/${modal.id}`, { name:form.name, email:form.email, role:form.role, status:form.status })
        toast.success(`User ${form.name} updated!`)
      }
      closeModal(); fetchUsers()
    } catch (e) {
      const detail = e.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg || (d.loc ? d.loc.join('.') : '') || JSON.stringify(d)).join(', ')
        : (detail || 'Failed to save.')
      setFormError(msg); toast.error(msg)
    } finally { setSaving(false) }
  }

  const toggleStatus = async (u) => {
    if (u.id === me?.id) return toast.warning("You can't deactivate yourself!")
    setToggling(u.id)
    const newStatus = u.status === 'active' ? 'inactive' : 'active'
    try {
      await api.patch(`/users/${u.id}`, { status: newStatus })
      toast.success(`${u.name} is now ${newStatus}`)
      fetchUsers()
    } catch { toast.error('Failed to update status') }
    finally { setToggling(null) }
  }

  const handleDelete = async (u) => {
    if (u.id === me?.id) return toast.warning("You can't delete yourself!")
    if (!confirm(`Delete ${u.name} permanently? This cannot be undone.`)) return
    try {
      await api.delete(`/users/${u.id}`)
      toast.success(`${u.name} deleted`)
      fetchUsers()
    } catch { toast.error('Failed to delete user') }
  }

  const changeRole = async (u, role) => {
    if (u.id === me?.id && role !== 'admin') return toast.warning("Can't demote yourself!")
    try {
      await api.patch(`/users/${u.id}`, { role })
      toast.success(`${u.name} is now ${role}`)
      fetchUsers()
    } catch { toast.error('Failed to update role') }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const stats = {
    total:    users.length,
    active:   users.filter(u => u.status === 'active').length,
    admins:   users.filter(u => u.role === 'admin').length,
    analysts: users.filter(u => u.role === 'analyst').length,
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={s.header} className="fade-up">
        <div>
          <h1 style={s.pageTitle}>User Management</h1>
          <p style={s.pageSub}>{users.length} users in system</p>
        </div>
        <button style={s.addBtn} className="btn-press" onClick={openCreate}>+ New User</button>
      </div>

      {/* Stats row */}
      <div style={s.statsRow} className="fade-up-1">
        {[
          { label:'Total Users',    value: stats.total,    color:'#7c3aed' },
          { label:'Active',         value: stats.active,   color:'#10b981' },
          { label:'Admins',         value: stats.admins,   color:'#f43f5e' },
          { label:'Analysts',       value: stats.analysts, color:'#0ea5e9' },
        ].map(item => (
          <div key={item.label} style={{ ...s.statChip }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:item.color }}>{item.value}</span>
            <span style={{ fontSize:11, color:'var(--c-text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Search + role filter */}
      <div style={s.filterRow} className="fade-up-1">
        <div style={{ position:'relative', flex:1, maxWidth:300 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--c-text-3)', fontSize:16 }}>⌕</span>
          <input
            className="input-styled"
            style={s.searchInput}
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={s.clearX} onClick={() => setSearch('')}>✕</button>}
        </div>

        <div style={{ display:'flex', gap:4 }}>
          {['all', ...ROLES].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className="btn-press" style={{ padding:'7px 14px', borderRadius:8, border:'1px solid', borderColor: roleFilter===r ? (ROLE_COLOR[r]||'var(--c-violet)') + '66' : 'var(--c-border)', background: roleFilter===r ? (ROLE_BG[r]||'rgba(124,58,237,0.12)') : 'var(--c-surface)', color: roleFilter===r ? (ROLE_COLOR[r]||'var(--c-violet-light)') : 'var(--c-text-3)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize', transition:'all 0.2s' }}>
              {r === 'all' ? 'All' : `${ROLE_ICON[r]} ${r}`}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div style={s.grid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', padding:20, height:180 }}>
              <div className="skeleton" style={{ width:44,height:44,borderRadius:'50%',marginBottom:12 }} />
              <div className="skeleton" style={{ width:'70%',height:14,marginBottom:8 }} />
              <div className="skeleton" style={{ width:'90%',height:11,marginBottom:16 }} />
              <div className="skeleton" style={{ width:'50%',height:22 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--c-text-3)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>◎</div>
          <p>No users found{search ? ` matching "${search}"` : ''}</p>
        </div>
      ) : (
        <div style={s.grid} className="fade-up-2">
          {filtered.map((u, i) => (
            <UserCard
              key={u.id}
              user={u}
              isMe={u.id === me?.id}
              toggling={toggling === u.id}
              onEdit={() => openEdit(u)}
              onDelete={() => handleDelete(u)}
              onToggle={() => toggleStatus(u)}
              onRoleChange={(role) => changeRole(u, role)}
              delay={i}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()} className="scale-in">
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{modal==='create'?'Create User':'Edit User'}</h2>
              <button style={s.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div style={s.modalBody}>
              <label style={s.label}>Full Name</label>
              <input className="input-styled" style={s.input} value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Jane Doe" autoFocus />

              <label style={s.label}>Email</label>
              <input className="input-styled" style={s.input} type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="jane@example.com" />

              {modal === 'create' && <>
                <label style={s.label}>Password</label>
                <input className="input-styled" style={s.input} type="password" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder="Min 6 characters" />
              </>}

              <label style={s.label}>Role</label>
              <div style={{ display:'flex', gap:8 }}>
                {ROLES.map(r => (
                  <button key={r} className="btn-press" onClick={() => setForm(f=>({...f,role:r}))} style={{ flex:1, padding:'9px 0', borderRadius:8, border:`1px solid ${form.role===r?(ROLE_COLOR[r]+'66'):'var(--c-border)'}`, background:form.role===r?ROLE_BG[r]:'var(--c-surface2)', color:form.role===r?ROLE_COLOR[r]:'var(--c-text-3)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize', transition:'all 0.2s' }}>
                    {ROLE_ICON[r]} {r}
                  </button>
                ))}
              </div>

              {modal !== 'create' && <>
                <label style={s.label}>Status</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['active','inactive'].map(st => (
                    <button key={st} className="btn-press" onClick={() => setForm(f=>({...f,status:st}))} style={{ flex:1, padding:'9px 0', borderRadius:8, border:`1px solid ${form.status===st?(st==='active'?'rgba(16,185,129,0.5)':'rgba(244,63,94,0.5)'):'var(--c-border)'}`, background:form.status===st?(st==='active'?'rgba(16,185,129,0.12)':'rgba(244,63,94,0.12)'):'var(--c-surface2)', color:form.status===st?(st==='active'?'#047857':'#be123c'):'var(--c-text-3)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize', transition:'all 0.2s' }}>
                      {st==='active'?'● Active':'○ Inactive'}
                    </button>
                  ))}
                </div>
              </>}

              {formError && <p style={s.formError}>⚠ {formError}</p>}

              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button style={s.cancelBtn} className="btn-press" onClick={closeModal}>Cancel</button>
                <button style={s.saveBtn}   className="btn-press" onClick={handleSave} disabled={saving}>
                  {saving ? <span style={{ display:'inline-block', animation:'spin 0.7s linear infinite' }}>↻</span> : null}
                  {' '}{saving ? 'Saving…' : modal==='create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserCard({ user, isMe, toggling, onEdit, onDelete, onToggle, onRoleChange, delay }) {
  const [roleOpen, setRoleOpen] = useState(false)
  const roleColor = ROLE_COLOR[user.role]
  const roleBg    = ROLE_BG[user.role]

  return (
    <div
      className={'fade-up card-lift'}
      style={{ background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', padding:20, display:'flex', flexDirection:'column', gap:14, position:'relative', animationDelay: delay*0.05+'s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = roleColor + '44'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border)'}
    >
      {/* Me badge */}
      {isMe && <span style={{ position:'absolute', top:12, right:12, fontSize:9, fontWeight:700, background:'rgba(124,58,237,0.2)', color:'var(--c-violet-light)', padding:'2px 7px', borderRadius:4, textTransform:'uppercase', letterSpacing:0.5 }}>You</span>}

      {/* Avatar + name */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:`linear-gradient(135deg, ${roleColor}88, ${roleColor}44)`, border:`2px solid ${roleColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, fontSize:17, color:'#fff', flexShrink:0, boxShadow:`0 0 16px ${roleColor}33` }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontWeight:700, fontSize:14, color:'var(--c-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</p>
          <p style={{ fontSize:11, color:'var(--c-text-3)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</p>
        </div>
      </div>

      {/* Role selector (inline dropdown) */}
      <div style={{ position:'relative' }}>
        <button onClick={() => setRoleOpen(o => !o)} className="btn-press" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 12px', borderRadius:8, border:`1px solid ${roleColor}44`, background:roleBg, color:roleColor, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize' }}>
          <span>{ROLE_ICON[user.role]} {user.role}</span>
          <span style={{ fontSize:10, opacity:0.7 }}>▾</span>
        </button>
        {roleOpen && (
          <div className="scale-in" style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--c-surface2)', border:'1px solid var(--c-border)', borderRadius:8, overflow:'hidden', zIndex:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}>
            {ROLES.filter(r => r !== user.role).map(r => (
              <button key={r} className="btn-press" onClick={() => { onRoleChange(r); setRoleOpen(false) }} style={{ width:'100%', padding:'9px 12px', border:'none', background:'transparent', color:ROLE_COLOR[r], fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize', textAlign:'left', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = ROLE_BG[r]}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {ROLE_ICON[r]} {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status + joined */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:user.status==='active'?'#047857':'#be123c', fontWeight:600 }}>
          <span style={{ width:6,height:6,borderRadius:'50%', background:user.status==='active'?'#10b981':'#f43f5e', boxShadow:user.status==='active'?'0 0 6px #10b981':'0 0 6px #f43f5e', animation:user.status==='active'?'pulse 2s infinite':'none', display:'inline-block' }} />
          {user.status}
        </span>
        <span style={{ fontSize:10, color:'var(--c-text-3)' }}>
          {new Date(user.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:6 }}>
        <button style={s.editBtn} className="btn-press" onClick={onEdit}>✎ Edit</button>
        <button
          style={{ ...s.toggleBtn, opacity:toggling?0.6:1 }}
          className="btn-press"
          onClick={onToggle}
          disabled={toggling}
        >
          {toggling ? <span style={{ display:'inline-block', animation:'spin 0.7s linear infinite', fontSize:12 }}>↻</span> : (user.status==='active'?'Deactivate':'Activate')}
        </button>
        {!isMe && <button style={s.delBtn} className="btn-press" onClick={onDelete}>✕</button>}
      </div>
    </div>
  )
}

const s = {
  header:      { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 },
  pageTitle:   { fontFamily:'var(--font-display)', fontWeight:800, fontSize:30, color:'var(--c-text)', letterSpacing:'-0.5px' },
  pageSub:     { color:'var(--c-text-2)', fontSize:13, marginTop:4 },
  addBtn:      { padding:'11px 20px', background:'linear-gradient(135deg,#7c3aed,#7c3aed)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font-display)', boxShadow:'0 4px 16px rgba(124,58,237,0.4)', whiteSpace:'nowrap' },
  statsRow:    { display:'flex', gap:12, marginBottom:18 },
  statChip:    { flex:1, background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:12, padding:'14px 18px', display:'flex', flexDirection:'column', gap:4 },
  filterRow:   { display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' },
  searchInput: { width:'100%', padding:'9px 30px 9px 32px', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:8, color:'var(--c-text)', fontSize:13, fontFamily:'var(--font-body)' },
  clearX:      { position:'absolute', right:8, background:'none', border:'none', color:'var(--c-text-3)', cursor:'pointer', fontSize:13, top:'50%', transform:'translateY(-50%)' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 },
  editBtn:     { flex:1, padding:'8px 0', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:7, color:'var(--c-violet-light)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600 },
  toggleBtn:   { flex:1.5, padding:'8px 0', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:7, color:'var(--c-amber-light)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:4 },
  delBtn:      { padding:'8px 12px', background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:7, color:'var(--c-rose-light)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)' },
  overlay:     { position:'fixed', inset:0, background:'rgba(15,15,40,0.55)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 },
  modalCard:   { background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:20, width:'100%', maxWidth:460, boxShadow:'0 24px 80px rgba(0,0,0,0.18)' },
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
