import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { to: '/app/dashboard',    label: 'Dashboard',    icon: '◈', roles: ['admin', 'analyst'] },
  { to: '/app/transactions', label: 'Transactions', icon: '⟳', roles: ['admin', 'analyst', 'viewer'] },
  { to: '/app/users',        label: 'Users',        icon: '◉', roles: ['admin'] },
]

const ROLE_COLOR = { admin: '#14b8a6', analyst: '#10b981', viewer: '#38bdf8' }
const ROLE_BG    = { admin: 'rgba(20,184,166,0.12)', analyst: 'rgba(16,185,129,0.12)', viewer: 'rgba(56,189,248,0.12)' }

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const handleLogout = () => { logout(); navigate('/') }
  const visibleNav = NAV.filter(n => n.roles.includes(user?.role))

  return (
    <div style={{ ...styles.shell, background: 'var(--c-bg)' }}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, background: 'var(--c-surface)', borderRightColor: 'var(--c-border)' }}>

        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoMark}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <path d="M11 10 L11 28 L22 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 22 L29 16 L34 20" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="29" cy="16" r="2" fill="#fde68a"/>
            </svg>
          </div>
          <span style={{ ...styles.logoText, color: 'var(--c-text)' }}>Ledgrr</span>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {visibleNav.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              ...styles.navItem,
              color: isActive ? 'var(--c-teal)' : 'var(--c-text-2)',
              background: isActive ? 'var(--c-teal-subtle)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              borderLeft: isActive ? '2px solid var(--c-teal)' : '2px solid transparent',
            })}>
              {({ isActive }) => (
                <>
                  <span style={{ fontSize: 18, lineHeight: 1, transition: 'color 0.2s', color: isActive ? 'var(--c-teal)' : 'var(--c-text-3)' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && <span style={styles.navDot} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          style={{ ...styles.themeBtn, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-text-2)' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <span style={{ fontSize: 16 }}>{isDark ? '☀' : '◑'}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* User card */}
        <div style={{ ...styles.userCard, background: 'var(--c-surface2)', border: '1px solid var(--c-border)' }}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <p style={{ ...styles.userName, color: 'var(--c-text)' }}>{user?.name}</p>
            <span style={{ ...styles.roleBadge, color: ROLE_COLOR[user?.role], background: ROLE_BG[user?.role] }}>
              {user?.role}
            </span>
          </div>
          <button style={{ ...styles.logoutBtn, color: 'var(--c-text-3)' }} onClick={handleLogout} title="Logout">
            ⎋
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: 240, minHeight: '100vh',
    borderRight: '1px solid',
    display: 'flex', flexDirection: 'column',
    padding: '28px 16px',
    position: 'sticky', top: 0, height: '100vh',
    transition: 'background 0.3s, border-color 0.3s',
  },
  logo:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, paddingLeft: 4 },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(20,184,166,0.35)' },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' },
  nav:      { display: 'flex', flexDirection: 'column', gap: 3 },
  navItem:  { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginLeft: '-16px', paddingLeft: '18px', textDecoration: 'none', fontSize: 14, transition: 'all 0.2s', position: 'relative' },
  navDot:   { marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--c-teal)', boxShadow: '0 0 8px var(--c-teal)', animation: 'glow 2s ease-in-out infinite' },
  themeBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s', marginBottom: 10, width: '100%' },
  userCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', borderRadius: 'var(--radius-sm)' },
  avatar:   { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roleBadge:{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 2 },
  logoutBtn:{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4, borderRadius: 6, transition: 'color 0.2s', flexShrink: 0 },
  main:     { flex: 1, overflowY: 'auto', padding: '32px 36px', maxWidth: 1200 },
}
