import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: '◈', roles: ['admin', 'analyst'] },
  { to: '/app/transactions', label: 'Transactions', icon: '⟳', roles: ['admin', 'analyst', 'viewer'] },
  { to: '/app/users', label: 'Users', icon: '◉', roles: ['admin'] },
]

const ROLE_COLOR = { admin: '#7c3aed', analyst: '#059669', viewer: '#0284c7' }
const ROLE_BG    = { admin: 'rgba(124,58,237,0.10)', analyst: 'rgba(5,150,105,0.10)', viewer: 'rgba(2,132,199,0.10)' }

export default function Layout() {
  const { user, logout, canAnalyze } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }
  const visibleNav = NAV.filter(n => n.roles.includes(user?.role))

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoMark}>
            <span style={styles.logoIcon}>₣</span>
          </div>
          <span style={styles.logoText}>Ledgrr</span>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {visibleNav.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}>
              {({ isActive }) => (
                <>
                  <span style={{ ...styles.navIcon, ...(isActive ? styles.navIconActive : {}) }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && <span style={styles.navDot} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.name}</p>
            <span style={{
              ...styles.roleBadge,
              color: ROLE_COLOR[user?.role],
              background: ROLE_BG[user?.role],
            }}>
              {user?.role}
            </span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
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
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--c-bg)',
  },
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: 'var(--c-surface)',
    borderRight: '1px solid var(--c-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
    paddingLeft: 4,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #7c3aed, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(124,58,237,0.4)',
  },
  logoIcon: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 20,
    color: 'var(--c-text)',
    letterSpacing: '-0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--c-text-2)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
    position: 'relative',
  },
  navItemActive: {
    color: 'var(--c-text)',
    background: 'rgba(124,58,237,0.08)',
    fontWeight: 600,
  },
  navIcon: {
    fontSize: 18,
    lineHeight: 1,
    color: 'var(--c-text-3)',
    transition: 'color 0.2s',
  },
  navIconActive: {
    color: 'var(--c-violet)',
  },
  navDot: {
    marginLeft: 'auto',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--c-violet)',
    boxShadow: '0 0 8px var(--c-violet)',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 10px',
    background: 'var(--c-surface2)',
    borderRadius: 'var(--radius-sm)',
    marginTop: 16,
    border: '1px solid var(--c-border)',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #10b981)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 14,
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--c-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    padding: '2px 6px',
    borderRadius: 4,
    display: 'inline-block',
    marginTop: 2,
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--c-text-3)',
    cursor: 'pointer',
    fontSize: 18,
    padding: 4,
    borderRadius: 6,
    transition: 'color 0.2s',
    flexShrink: 0,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 36px',
    maxWidth: 1200,
  },
}
