import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const { login, loading } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const isDark = theme === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    }
  }

  const fillDemo = (role) => {
    const creds = {
      admin:   { email: 'admin@example.com',   password: '' },
      analyst: { email: 'analyst@finance.dev', password: '' },
      viewer:  { email: 'viewer@finance.dev',  password: '' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
  }

  return (
    <div style={s.page}>
      {/* Ambient bg */}
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
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoMark}>
            <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
              <path d="M11 10 L11 28 L22 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 22 L29 16 L34 20" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="29" cy="16" r="2" fill="#fde68a"/>
            </svg>
          </div>
          <h1 style={{ ...s.title, color: 'var(--c-text)' }}>Ledgrr</h1>
          <p style={{ ...s.subtitle, color: 'var(--c-text-2)' }}>Sign in to your finance dashboard</p>
        </div>

        {/* Demo shortcuts */}
        <div style={s.demoRow}>
          {['admin', 'analyst', 'viewer'].map(role => (
            <button key={role} style={{ ...s.demoBtn, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-text-2)' }}
              onClick={() => fillDemo(role)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-teal)'; e.currentTarget.style.color = 'var(--c-teal)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.color = 'var(--c-text-2)' }}>
              {role}
            </button>
          ))}
        </div>
        <p style={{ ...s.demoHint, color: 'var(--c-text-3)' }}>↑ click to auto-fill demo credentials</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={{ ...s.label, color: 'var(--c-text-3)' }}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ ...s.input, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
              placeholder="you@example.com"
              className="input-styled"
            />
          </div>
          <div style={s.field}>
            <label style={{ ...s.label, color: 'var(--c-text-3)' }}>Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...s.input, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
              placeholder="••••••••"
              className="input-styled"
            />
          </div>

          {error && <p style={s.error}>⚠ {error}</p>}

          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1 }}>
            {loading ? <span style={s.spinner} /> : 'Sign In →'}
          </button>
        </form>

        <p style={{ ...s.registerLink, color: 'var(--c-text-2)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Create one free →</Link>
        </p>
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
    background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 65%)',
    top: '-150px', left: '-100px', pointerEvents: 'none',
  },
  blob2: {
    position: 'fixed', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)',
    bottom: '-100px', right: '-80px', pointerEvents: 'none',
  },
  themeToggle: {
    position: 'fixed', top: 20, right: 20, zIndex: 100,
    width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, transition: 'all 0.2s',
  },
  card: {
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    borderRadius: 24, padding: '44px 40px',
    width: '100%', maxWidth: 420,
    position: 'relative', zIndex: 1,
    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  logoMark: {
    width: 52, height: 52, borderRadius: 14,
    background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, boxShadow: '0 0 28px rgba(20,184,166,0.4)',
  },
  title: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: 28, letterSpacing: '-0.5px', marginBottom: 6,
  },
  subtitle:    { fontSize: 14 },
  demoRow:     { display: 'flex', gap: 8, marginBottom: 6 },
  demoBtn:     { flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)' },
  demoHint:    { fontSize: 11, textAlign: 'center', marginBottom: 20 },
  form:        { display: 'flex', flexDirection: 'column', gap: 16 },
  field:       { display: 'flex', flexDirection: 'column', gap: 6 },
  label:       { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 },
  input:       { padding: '12px 14px', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' },
  error:       { color: 'var(--c-rose)', fontSize: 13, background: 'var(--c-rose-glow)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.25)' },
  submitBtn:   { marginTop: 4, padding: '14px', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', letterSpacing: 0.3, boxShadow: '0 4px 20px rgba(20,184,166,0.35)', transition: 'opacity 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  registerLink:{ textAlign: 'center', marginTop: 20, fontSize: 13 },
  link:        { color: 'var(--c-teal)', fontWeight: 700, textDecoration: 'none' },
  spinner:     { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
}
