import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (form.name.trim().length < 2)      return setError('Name must be at least 2 characters.')
    if (!form.email.includes('@'))         return setError('Enter a valid email address.')
    if (form.password.length < 6)          return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm)    return setError('Passwords do not match.')

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     'viewer',
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2200)
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg || JSON.stringify(d)).join(', ')
        : (detail || 'Registration failed. Please try again.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />

      <div style={s.card} className="fade-up">

        {/* Logo */}
        <div style={s.header}>
          <div style={s.logoMark}>L</div>
          <h1 style={s.title}>Ledgrr</h1>
          <p style={s.subtitle}>Create your account — it's free</p>
        </div>

        {/* Role notice */}
        <div style={s.notice}>
          <span style={s.noticeDot}>ℹ</span>
          New accounts start as <strong>Viewer</strong>. An Admin can upgrade your role.
        </div>

        {/* Success state */}
        {success ? (
          <div style={s.successBox}>
            <div style={s.successIcon}>✓</div>
            <p style={s.successTitle}>Account created!</p>
            <p style={s.successSub}>Redirecting you to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>

            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <input
                name="name" type="text" required
                value={form.name} onChange={handleChange}
                style={s.input} placeholder="Jane Doe"
                className="input-styled"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                name="email" type="email" required
                value={form.email} onChange={handleChange}
                style={s.input} placeholder="jane@example.com"
                className="input-styled"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                name="password" type="password" required
                value={form.password} onChange={handleChange}
                style={s.input} placeholder="Min 6 characters"
                className="input-styled"
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Confirm Password</label>
              <input
                name="confirm" type="password" required
                value={form.confirm} onChange={handleChange}
                style={s.input} placeholder="Repeat password"
                className="input-styled"
              />
            </div>

            {error && <p style={s.error}>⚠ {error}</p>}

            <button type="submit" disabled={loading} style={s.submitBtn} className="btn-press">
              {loading
                ? <span style={s.spinner} />
                : 'Create Account →'
              }
            </button>

          </form>
        )}

        {/* Login link */}
        {!success && (
          <p style={s.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--c-bg)',
    position: 'relative', overflow: 'hidden', padding: 20,
  },
  blob1: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
    top: '-120px', left: '-100px', pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(2,132,199,0.10) 0%, transparent 70%)',
    bottom: '-80px', right: '-80px', pointerEvents: 'none',
  },
  card: {
    background: 'var(--c-surface)', border: '1px solid var(--c-border)',
    borderRadius: 24, padding: '40px 38px', width: '100%', maxWidth: 420,
    position: 'relative', zIndex: 1, boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
  },
  header: { textAlign: 'center', marginBottom: 22 },
  logoMark: {
    width: 50, height: 50, borderRadius: 14,
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800,
    marginBottom: 12, boxShadow: '0 0 24px rgba(124,58,237,0.35)',
  },
  title: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: 26, color: 'var(--c-text)', letterSpacing: '-0.5px', marginBottom: 5,
  },
  subtitle: { color: 'var(--c-text-2)', fontSize: 14 },
  notice: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)',
    borderRadius: 10, padding: '10px 14px', fontSize: 12.5,
    color: '#0284c7', marginBottom: 22, lineHeight: 1.5,
  },
  noticeDot: { fontSize: 14, flexShrink: 0 },
  form:   { display: 'flex', flexDirection: 'column', gap: 14 },
  field:  { display: 'flex', flexDirection: 'column', gap: 5 },
  label:  { fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: 0.8 },
  input:  {
    padding: '11px 13px', background: 'var(--c-surface2)',
    border: '1px solid var(--c-border)', borderRadius: 10,
    color: 'var(--c-text)', fontSize: 14, fontFamily: 'var(--font-body)',
  },
  error: {
    color: '#be123c', fontSize: 13,
    background: 'rgba(190,18,60,0.08)', padding: '10px 14px',
    borderRadius: 8, border: '1px solid rgba(190,18,60,0.2)',
  },
  submitBtn: {
    marginTop: 6, padding: '13px',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    border: 'none', borderRadius: 10, color: '#fff',
    fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
    cursor: 'pointer', letterSpacing: 0.3,
    boxShadow: '0 4px 18px rgba(124,58,237,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s, transform 0.15s',
  },
  spinner: {
    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', display: 'inline-block',
  },
  successBox: { textAlign: 'center', padding: '24px 0' },
  successIcon: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(5,150,105,0.12)', border: '2px solid rgba(5,150,105,0.3)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, color: '#059669', marginBottom: 16,
  },
  successTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--c-text)', marginBottom: 6 },
  successSub:   { fontSize: 13, color: 'var(--c-text-2)' },
  loginLink:  { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--c-text-2)' },
  link:       { color: '#7c3aed', fontWeight: 700, textDecoration: 'none' },
}
