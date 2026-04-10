import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(email, password)
      if (user.role === 'viewer') navigate('/app')
      else navigate('/app')
    } catch (err) {
      setError(err.message)
    }
  }

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@example.com', password: '' },
      analyst: { email: 'analyst@finance.dev', password: '' },
      viewer: { email: 'viewer@finance.dev', password: '' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
  }

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.card} className="fade-up">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoMark}>₣</div>
          <h1 style={styles.title}>Ledgrr</h1>
          <p style={styles.subtitle}>Sign in to your finance dashboard</p>
        </div>

        {/* Demo shortcuts */}
        <div style={styles.demoRow}>
          {['admin', 'analyst', 'viewer'].map(role => (
            <button key={role} style={styles.demoBtn} onClick={() => fillDemo(role)}>
              {role}
            </button>
          ))}
        </div>
        <p style={styles.demoHint}>↑ click to auto-fill demo credentials</p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input} placeholder="you@example.com"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input} placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.error}>⚠ {error}</p>}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <span style={styles.spinner} /> : 'Sign In →'}
          </button>
        </form>

        <p style={styles.registerLink}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one free →</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--c-bg)',
    position: 'relative',
    overflow: 'hidden',
    padding: 20,
  },
  blob1: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
    top: '-100px', left: '-100px', pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
    bottom: '-80px', right: '-80px', pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)',
    top: '50%', right: '20%', pointerEvents: 'none',
  },
  card: {
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    borderRadius: 24,
    padding: '44px 40px',
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 28,
  },
  logoMark: {
    width: 52, height: 52, borderRadius: 14,
    background: 'linear-gradient(135deg, #7c3aed, #7c3aed)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, color: '#fff',
    fontFamily: 'var(--font-display)', fontWeight: 800,
    marginBottom: 14,
    boxShadow: '0 0 30px rgba(124,58,237,0.5)',
  },
  title: {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: 28, color: 'var(--c-text)', letterSpacing: '-0.5px',
    marginBottom: 6,
  },
  subtitle: {
    color: 'var(--c-text-2)', fontSize: 14,
  },
  demoRow: {
    display: 'flex', gap: 8, marginBottom: 6,
  },
  demoBtn: {
    flex: 1, padding: '7px 0',
    background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
    borderRadius: 8, color: 'var(--c-text-2)',
    fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 0.8, cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },
  demoHint: {
    fontSize: 11, color: 'var(--c-text-3)', textAlign: 'center', marginBottom: 20,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--c-text-2)', textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    padding: '12px 14px',
    background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
    borderRadius: 10, color: 'var(--c-text)', fontSize: 14,
    outline: 'none', fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s',
  },
  error: {
    color: 'var(--c-rose)', fontSize: 13,
    background: 'rgba(244,63,94,0.1)', padding: '10px 14px',
    borderRadius: 8, border: '1px solid rgba(244,63,94,0.2)',
  },
  submitBtn: {
    marginTop: 4,
    padding: '14px',
    background: 'linear-gradient(135deg, #7c3aed, #7c3aed)',
    border: 'none', borderRadius: 10,
    color: '#fff', fontSize: 15, fontWeight: 700,
    fontFamily: 'var(--font-display)',
    cursor: 'pointer', letterSpacing: 0.3,
    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
    transition: 'opacity 0.2s, transform 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  registerLink: {
    textAlign: 'center', marginTop: 20,
    fontSize: 13, color: 'var(--c-text-2)',
  },
  link: {
    color: '#7c3aed', fontWeight: 700, textDecoration: 'none',
  },
  spinner: {
    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', display: 'inline-block',
  },
}
