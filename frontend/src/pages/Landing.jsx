import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const BRAND   = 'Ledgrr'
const TAGLINE = 'Where money makes sense.'

const FEATURES = [
  { icon: '⬡', title: 'Role-Based Access Control',   detail: 'Three-tier RBAC — Admin, Analyst, Viewer — enforced at every layer. JWT tokens carry role claims; middleware rejects underprivileged calls before they touch business logic.', tag: 'Security',    accent: '#14b8a6' },
  { icon: '◈', title: 'Financial Records CRUD',       detail: 'Full lifecycle management for income and expense transactions. Filter by date range, category, type, or amount. Paginated, sortable, bulk-deletable.',                          tag: 'Core',        accent: '#10b981' },
  { icon: '⬟', title: 'User & Role Management',       detail: 'Admin panel to create, promote, demote, activate or deactivate any user instantly. Assign Analyst or Viewer roles without touching the database.',                             tag: 'Admin',       accent: '#38bdf8' },
  { icon: '◉', title: 'Dashboard Analytics',          detail: 'Aggregated totals, monthly trend lines, category breakdowns, and net balance snapshots — powered by MongoDB aggregation pipelines. Auto-refreshes every 60 seconds.',           tag: 'Analytics',   accent: '#f59e0b' },
  { icon: '▦', title: 'Access Middleware',             detail: 'FastAPI dependency injection gates every route. Role mismatches return clean 403s before any service code runs — no accidental data leaks.',                                   tag: 'Backend',     accent: '#f43f5e' },
  { icon: '✦', title: 'Validation & Error Handling',  detail: 'Pydantic v2 schemas validate every field. Duplicate emails, invalid IDs, bad dates — all caught and returned as consistent, human-readable error messages.',                   tag: 'Reliability', accent: '#a78bfa' },
]

const ROLES = [
  { role: 'Viewer',  icon: '◯', accent: '#38bdf8', desc: 'Read-only access to financial records. Ideal for stakeholders who need visibility without write privileges.', perms: ['Browse all transactions','Filter & search records','Export-ready data views','Own profile management'] },
  { role: 'Analyst', icon: '◉', accent: '#10b981', desc: 'Everything Viewers can do, plus access to the analytics dashboard and aggregated financial intelligence.',    perms: ['Full dashboard access','Monthly trend analysis','Category breakdowns','Income vs. expense insights'] },
  { role: 'Admin',   icon: '◈', accent: '#14b8a6', desc: 'Complete control. Manages users, transactions, and roles. The single source of truth for financial data.',     perms: ['Create · edit · delete transactions','User management (full CRUD)','Role assignment & revocation','Account activation / deactivation'] },
]

const METRICS = [
  { val: '3',   label: 'Permission Tiers',   sub: 'Admin · Analyst · Viewer' },
  { val: '11',  label: 'Finance Categories', sub: 'Salary to entertainment'  },
  { val: '100', label: 'Records / Page',     sub: 'Configurable page size'   },
  { val: 'JWT', label: 'Auth Standard',      sub: 'Stateless token security' },
]

const STACK = [
  { name: 'FastAPI',      sub: 'Async Python backend',    color: '#10b981' },
  { name: 'MongoDB',      sub: 'Motor async driver',       color: '#10b981' },
  { name: 'Pydantic v2',  sub: 'Schema validation',        color: '#14b8a6' },
  { name: 'JWT / bcrypt', sub: 'Auth & password security', color: '#14b8a6' },
  { name: 'React 18',     sub: 'Vite-powered frontend',    color: '#38bdf8' },
  { name: 'Chart.js',     sub: 'Interactive analytics',    color: '#38bdf8' },
]

const HOW = [
  { step: '01', title: 'Admin seeds the system', body: 'Create users and assign roles via the Admin panel. Each user gets a JWT on login that encodes their role.' },
  { step: '02', title: 'Transactions flow in',   body: 'Admins log income and expenses with category, date, and notes. Records are immediately visible to all roles.' },
  { step: '03', title: 'Analysts read the data', body: 'Analysts access the live dashboard — monthly trends, category totals, and net balance — to understand cash flow.' },
  { step: '04', title: 'Viewers stay informed',  body: 'Viewers browse and filter the transaction log. They see everything but can change nothing — perfect for oversight.' },
]

function LedgrrLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="11" fill="url(#teal-grad)"/>
      <defs>
        <linearGradient id="teal-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6"/>
          <stop offset="100%" stopColor="#0d9488"/>
        </linearGradient>
      </defs>
      <path d="M11 10 L11 28 L22 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 22 L29 16 L34 20" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="29" cy="16" r="2" fill="#fde68a"/>
    </svg>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [activeRole, setActiveRole] = useState(1)
  const isDark = theme === 'dark'

  useEffect(() => {
    const t = setInterval(() => setActiveRole(r => (r + 1) % ROLES.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ ...s.root, background: 'var(--c-bg)' }}>
      {/* Noise texture overlay */}
      <div style={s.noise} />

      {/* Grid background */}
      <div style={s.gridBg} />

      {/* Ambient orbs */}
      <div style={{ ...s.orb, top: -160, left: '5%',  background: 'radial-gradient(circle, rgba(20,184,166,0.13) 0%, transparent 65%)', width: 700, height: 700 }} />
      <div style={{ ...s.orb, top: 300,  right: '-8%', background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)', width: 500, height: 500 }} />
      <div style={{ ...s.orb, bottom: 200, left: '30%', background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 65%)', width: 400, height: 400 }} />

      {/* ── Nav ── */}
      <nav style={{ ...s.nav, background: isDark ? 'rgba(13,17,23,0.85)' : 'rgba(240,247,246,0.88)', borderBottomColor: 'var(--c-border)' }}>
        <div style={s.navLeft}>
          <LedgrrLogo size={34} />
          <span style={{ ...s.navBrand, color: 'var(--c-text)' }}>{BRAND}</span>
        </div>
        <div style={s.navRight}>
          <span style={{ ...s.navSubtle, color: 'var(--c-text-3)' }}>Finance · Intelligence · Control</span>
          {/* Theme toggle */}
          <button style={{ ...s.themeBtn, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', color: 'var(--c-text-2)' }} onClick={toggle} title="Toggle theme">
            {isDark ? '☀' : '◑'}
          </button>
          <button style={s.navCta} onClick={() => navigate('/login')}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-teal-light)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-teal)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Sign in →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroPill} className="fade-up">
          <span style={s.pillDot} />
          Full-stack finance platform · FastAPI + MongoDB + React
        </div>

        <h1 style={{ ...s.heroH1, color: 'var(--c-text)' }} className="fade-up-1">
          Financial clarity,<br />
          <span style={s.heroGrad}>built in.</span>
        </h1>

        <p style={{ ...s.heroP, color: 'var(--c-text-2)' }} className="fade-up-2">
          A production-grade finance dashboard with role-based access control,
          real-time analytics, and airtight data integrity — from a single
          FastAPI backend and React frontend.
        </p>

        <div style={s.heroBtns} className="fade-up-3">
          <button style={s.btnPrimary} onClick={() => navigate('/login')}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Open Dashboard
          </button>
          <a style={{ ...s.btnGhost, borderColor: 'var(--c-border2)', color: 'var(--c-text-2)' }} href="#features">
            See features ↓
          </a>
        </div>

        {/* Metrics row */}
        <div style={{ ...s.metrics, background: 'var(--c-surface)', border: '1px solid var(--c-border)' }} className="fade-up-4">
          {METRICS.map((m, i) => (
            <div key={m.label} style={{ ...s.metric, borderLeft: i > 0 ? '1px solid var(--c-border)' : 'none' }}>
              <span style={s.metricVal}>{m.val}</span>
              <span style={{ ...s.metricLabel, color: 'var(--c-text)' }}>{m.label}</span>
              <span style={{ ...s.metricSub, color: 'var(--c-text-3)' }}>{m.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={s.section}>
        <div style={s.sectionLabel}>Capabilities</div>
        <h2 style={{ ...s.sectionH2, color: 'var(--c-text)' }}>Everything a finance platform needs</h2>
        <p style={{ ...s.sectionP, color: 'var(--c-text-2)' }}>Designed for teams where finance data has real consequences — not a toy demo.</p>

        <div style={s.featsGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="fade-up card-lift"
              style={{ ...s.featCard, background: 'var(--c-surface)', border: '1px solid var(--c-border)', animationDelay: i * 0.07 + 's' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ ...s.featIconWrap, color: f.accent, background: f.accent + '18', border: `1.5px solid ${f.accent}28` }}>
                  {f.icon}
                </div>
                <span style={{ ...s.featTag, color: f.accent, background: f.accent + '12', border: `1px solid ${f.accent}28` }}>
                  {f.tag}
                </span>
              </div>
              <h3 style={{ ...s.featTitle, color: 'var(--c-text)' }}>{f.title}</h3>
              <p style={{ ...s.featDetail, color: 'var(--c-text-2)' }}>{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <div style={{ ...s.fullBand, background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
        <div style={{ ...s.section, paddingTop: 72, paddingBottom: 72 }}>
          <div style={s.sectionLabel}>Workflow</div>
          <h2 style={{ ...s.sectionH2, color: 'var(--c-text)' }}>How it works</h2>
          <p style={{ ...s.sectionP, color: 'var(--c-text-2)' }}>Four interactions that cover the full data lifecycle.</p>

          <div style={s.howGrid}>
            {HOW.map((h, i) => (
              <div key={h.step} className="fade-up"
                style={{ ...s.howCard, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', animationDelay: i * 0.1 + 's' }}>
                <span style={s.howStep}>{h.step}</span>
                <h3 style={{ ...s.howTitle, color: 'var(--c-text)' }}>{h.title}</h3>
                <p style={{ ...s.howBody, color: 'var(--c-text-2)' }}>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Roles ── */}
      <section style={s.section}>
        <div style={s.sectionLabel}>Access Control</div>
        <h2 style={{ ...s.sectionH2, color: 'var(--c-text)' }}>The right access for every person</h2>
        <p style={{ ...s.sectionP, color: 'var(--c-text-2)' }}>Three distinct roles, each with clearly bounded permissions. No ambiguity, no over-permissioning.</p>

        <div style={s.rolesLayout}>
          <div style={s.roleTabs}>
            {ROLES.map((r, i) => (
              <button key={r.role} onClick={() => setActiveRole(i)} className="btn-press" style={{
                ...s.roleTab,
                borderLeft: `3px solid ${activeRole === i ? r.accent : 'transparent'}`,
                background: activeRole === i ? r.accent + '12' : 'transparent',
                color: activeRole === i ? r.accent : 'var(--c-text-3)',
              }}>
                <span style={{ fontSize: 18, marginRight: 10 }}>{r.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif" }}>{r.role}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                    {i === 0 ? 'Read-only' : i === 1 ? 'Analytics access' : 'Full access'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {(() => {
            const r = ROLES[activeRole]
            return (
              <div style={{ ...s.roleDetail, background: 'var(--c-surface)', borderColor: r.accent + '35' }} key={r.role}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ ...s.roleIconLarge, color: r.accent, background: r.accent + '12', border: `2px solid ${r.accent}30` }}>
                    {r.icon}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--c-text)' }}>{r.role}</h3>
                    <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>{r.desc}</p>
                  </div>
                </div>
                <div style={s.permGrid}>
                  {r.perms.map(p => (
                    <div key={p} style={s.permRow}>
                      <span style={{ ...s.permCheck, color: r.accent }}>✓</span>
                      <span style={{ ...s.permText, color: 'var(--c-text-2)' }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ── Stack ── */}
      <div style={{ ...s.fullBand, background: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
        <div style={{ ...s.section, paddingTop: 72, paddingBottom: 72 }}>
          <div style={s.sectionLabel}>Technology</div>
          <h2 style={{ ...s.sectionH2, color: 'var(--c-text)' }}>Modern stack, zero compromises</h2>
          <div style={s.stackGrid}>
            {STACK.map((t, i) => (
              <div key={t.name} className="fade-up card-lift"
                style={{ ...s.stackCard, background: 'var(--c-surface2)', border: '1px solid var(--c-border)', animationDelay: i * 0.06 + 's' }}>
                <div style={{ ...s.stackDot, background: t.color, boxShadow: `0 0 8px ${t.color}80` }} />
                <div>
                  <p style={{ ...s.stackName, color: 'var(--c-text)' }}>{t.name}</p>
                  <p style={{ ...s.stackSub, color: 'var(--c-text-3)' }}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <div style={{ marginBottom: 28, animation: 'float 3s ease-in-out infinite' }}>
            <LedgrrLogo size={56} />
          </div>
          <h2 style={s.ctaH2}>{TAGLINE}</h2>
          <p style={s.ctaP}>
            Sign in as Admin, Analyst, or Viewer to explore the full platform.
            Every role, every feature — ready now.
          </p>
          <button style={s.ctaBtn} onClick={() => navigate('/login')}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0d9488'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Open Dashboard →
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 18 }}>
            No setup required · Admin, Analyst & Viewer accounts ready
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ ...s.footer, borderTopColor: 'var(--c-border)', background: 'var(--c-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LedgrrLogo size={22} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'var(--c-text)', fontSize: 15 }}>{BRAND}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--c-text-3)' }}>
          FastAPI · MongoDB · React · JWT · Pydantic v2
        </p>
      </footer>
    </div>
  )
}

const s = {
  root:       { minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflowX: 'hidden' },
  noise:      { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.018, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: 'repeat', backgroundSize: '200px 200px' },
  gridBg:     { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(var(--c-border) 1px, transparent 1px), linear-gradient(90deg, var(--c-border) 1px, transparent 1px)', backgroundSize: '52px 52px', opacity: 0.3 },
  orb:        { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },

  nav:        { position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 56px', backdropFilter: 'blur(20px)', borderBottom: '1px solid' },
  navLeft:    { display: 'flex', alignItems: 'center', gap: 10 },
  navBrand:   { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.4px' },
  navRight:   { display: 'flex', alignItems: 'center', gap: 14 },
  navSubtle:  { fontSize: 12, letterSpacing: 0.5, fontWeight: 500 },
  themeBtn:   { width: 34, height: 34, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: 'all 0.2s' },
  navCta:     { padding: '9px 22px', background: 'var(--c-teal)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s, transform 0.2s', boxShadow: '0 4px 14px var(--c-teal-glow)' },

  hero:       { position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', padding: '104px 48px 88px', textAlign: 'center' },
  heroPill:   { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--c-teal)', background: 'var(--c-teal-subtle)', border: '1px solid rgba(20,184,166,0.22)', padding: '6px 16px', borderRadius: 100, marginBottom: 32 },
  pillDot:    { width: 6, height: 6, borderRadius: '50%', background: 'var(--c-teal)', boxShadow: '0 0 6px var(--c-teal)', display: 'inline-block', animation: 'pulse 2s infinite' },
  heroH1:     { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(42px, 7vw, 76px)', lineHeight: 1.06, letterSpacing: '-2.5px', marginBottom: 24 },
  heroGrad:   { background: 'linear-gradient(135deg, #14b8a6 0%, #f59e0b 60%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroP:      { fontSize: 18, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 44px' },
  heroBtns:   { display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 60, flexWrap: 'wrap' },
  btnPrimary: { padding: '14px 36px', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: "'Syne', sans-serif", boxShadow: '0 6px 20px rgba(20,184,166,0.35)', transition: 'transform 0.2s, box-shadow 0.2s' },
  btnGhost:   { padding: '14px 30px', background: 'transparent', border: '2px solid', borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'border-color 0.2s' },

  metrics:    { display: 'inline-flex', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' },
  metric:     { padding: '20px 36px', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' },
  metricVal:  { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--c-teal)', lineHeight: 1 },
  metricLabel:{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 },
  metricSub:  { fontSize: 11 },

  section:      { padding: '88px 56px', maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 },
  fullBand:     { borderTop: '1px solid', borderBottom: '1px solid', position: 'relative', zIndex: 1 },
  sectionLabel: { display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--c-teal)', background: 'var(--c-teal-subtle)', border: '1px solid rgba(20,184,166,0.22)', padding: '5px 14px', borderRadius: 100, marginBottom: 18 },
  sectionH2:    { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 40px)', letterSpacing: '-0.8px', marginBottom: 14 },
  sectionP:     { fontSize: 16, lineHeight: 1.7, maxWidth: 560, marginBottom: 52 },

  featsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 22 },
  featCard:     { borderRadius: 20, padding: '30px', cursor: 'default', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s' },
  featIconWrap: { width: 44, height: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 700 },
  featTag:      { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 11px', borderRadius: 100 },
  featTitle:    { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 10, letterSpacing: '-0.2px' },
  featDetail:   { fontSize: 14, lineHeight: 1.7 },

  howGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 },
  howCard:  { borderRadius: 18, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' },
  howStep:  { display: 'block', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: 'var(--c-border2)', marginBottom: 16, letterSpacing: '-1px' },
  howTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10 },
  howBody:  { fontSize: 13.5, lineHeight: 1.65 },

  rolesLayout:  { display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' },
  roleTabs:     { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200, flex: '0 0 220px' },
  roleTab:      { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.22s', textAlign: 'left' },
  roleDetail:   { flex: 1, border: '2px solid', borderRadius: 20, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', minHeight: 220, transition: 'border-color 0.3s' },
  roleIconLarge:{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0 },
  permGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' },
  permRow:      { display: 'flex', alignItems: 'center', gap: 10 },
  permCheck:    { fontSize: 15, fontWeight: 700, flexShrink: 0 },
  permText:     { fontSize: 14 },

  stackGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 },
  stackCard: { borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', transition: 'transform 0.2s, box-shadow 0.2s' },
  stackDot:  { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  stackName: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 },
  stackSub:  { fontSize: 12, marginTop: 3 },

  cta:      { background: 'linear-gradient(145deg, #0d1117 0%, #0f2e2a 40%, #1a3a2e 70%, #0d2233 100%)', padding: '100px 48px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden', borderTop: '1px solid rgba(20,184,166,0.15)' },
  ctaInner: { position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' },
  ctaH2:    { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 44, color: '#ffffff', letterSpacing: '-1.5px', marginBottom: 18 },
  ctaP:     { fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 40 },
  ctaBtn:   { padding: '18px 52px', background: 'transparent', border: '2px solid rgba(20,184,166,0.7)', borderRadius: 14, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: "'Syne', sans-serif", transition: 'all 0.2s', boxShadow: '0 0 24px rgba(20,184,166,0.2)' },

  footer:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 56px', borderTop: '1px solid' },
}
