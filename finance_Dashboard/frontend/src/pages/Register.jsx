import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { useTheme } from '../context/ThemeContext'

export default function Register() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const isDark = theme === 'dark'

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.name.trim().length < 2)   return setError('Name must be at least 2 characters.')
    if (!form.email.includes('@'))      return setError('Enter a valid email address.')
    if (form.password.length < 6)       return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await api.post('/auth/register', { name: form.name.trim(), email: form.email.trim(), password: form.password, role: 'viewer' })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2200)
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join(', ') : (detail || 'Registration failed. Please try again.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.gridBg} />

      {/* Theme toggle */}
      <button
        style={{ ...s.themeToggle, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-text-2)' }}
        onClick={toggle} title="Toggle theme">
        {isDark ? '☀' : '◑'}
      </button>

      <div style={s.card} className="fade-up">
        {/* Logo */}
        <div style={s.header}>
          <div style={s.logoMark}>
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <path d="M11 10 L11 28 L22 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 22 L29 16 L34 20" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="29" cy="16" r="2" fill="#fde68a"/>
            </svg>
          </div>
          <h1 style={{ ...s.title, color: 'var(--c-text)' }}>Ledgrr</h1>
          <p style={{ ...s.subtitle, color: 'var(--c-text-2)' }}>Create your account — it's free</p>
        </div>

        {/* Role notice */}
        <div style={s.notice}>
          <span style={s.noticeDot}>ℹ</span>
          New accounts start as <strong>Viewer</strong>. An Admin can upgrade your role.
        </div>

        {success ? (
          <div style={s.successBox}>
            <div style={s.successIcon}>✓</div>
            <p style={{ ...s.successTitle, color: 'var(--c-text)' }}>Account created!</p>
            <p style={{ ...s.successSub, color: 'var(--c-text-2)' }}>Redirecting you to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            {[
              { name: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'Jane Doe' },
              { name: 'email',    label: 'Email',            type: 'email',    placeholder: 'jane@example.com' },
              { name: 'password', label: 'Password',         type: 'password', placeholder: 'Min 6 characters' },
              { name: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
            ].map(f => (
              <div key={f.name} style={s.field}>
                <label style={{ ...s.label, color: 'var(--c-text-3)' }}>{f.label}</label>
                <input
                  name={f.name} type={f.type} required
                  value={form[f.name]} onChange={handleChange}
                  style={{ ...s.input, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                  placeholder={f.placeholder}
                  className="input-styled"
                />
              </div>
            ))}

            {error && <p style={s.error}>⚠ {error}</p>}

            <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1 }} className="btn-press">
              {loading ? <span style={s.spinner} /> : 'Create Account →'}
            </button>
          </form>
        )}

        {!success && (
          <p style={{ ...s.loginLink, color: 'var(--c-text-2)' }}>
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
  gridBg: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)',
    backgroundSize: '52px 52px', opacity: 0.25,
  },
  blob1: {
    position: 'fixed', width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.11) 0%, transparent 65%)',
    top: '-150px', left: '-100px', pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)',
    bottom: '-100px', right: '-80px', pointerEvents: 'none',
  },
  themeToggle: {
    position: 'fixed', top: 20, right: 20, zIndex: 100,
    width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, transition: 'all 0.2s',
  },
  card: {
    background: 'var(--c-surface)', border: '1px solid var(--c-border)',
    borderRadius: 24, padding: '40px 38px', width: '100%', maxWidth: 420,
    position: 'relative', zIndex: 1, boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
  },
  header:   { textAlign: 'center', marginBottom: 22 },
  logoMark: {
    width: 50, height: 50, borderRadius: 14,
    background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, boxShadow: '0 0 24px rgba(20,184,166,0.35)',
  },
  title:    { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', marginBottom: 5 },
  subtitle: { fontSize: 14 },
  notice:   { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: 'var(--c-sky)', marginBottom: 22, lineHeight: 1.5 },
  noticeDot:{ fontSize: 14, flexShrink: 0 },
  form:     { display: 'flex', flexDirection: 'column', gap: 14 },
  field:    { display: 'flex', flexDirection: 'column', gap: 5 },
  label:    { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 },
  input:    { padding: '11px 13px', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' },
  error:    { color: 'var(--c-rose)', fontSize: 13, background: 'var(--c-rose-glow)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.25)' },
  submitBtn:{ marginTop: 6, padding: '13px', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 4px 18px rgba(20,184,166,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s, transform 0.15s' },
  spinner:  { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
  successBox:  { textAlign: 'center', padding: '24px 0' },
  successIcon: { width: 56, height: 56, borderRadius: '50%', background: 'var(--c-teal-subtle)', border: '2px solid rgba(20,184,166,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--c-teal)', marginBottom: 16 },
  successTitle:{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6 },
  successSub:  { fontSize: 13 },
  loginLink:   { textAlign: 'center', marginTop: 20, fontSize: 13 },
  link:        { color: 'var(--c-teal)', fontWeight: 700, textDecoration: 'none' },
}
