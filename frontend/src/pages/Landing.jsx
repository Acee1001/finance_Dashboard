import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// ── Brand ────────────────────────────────────────────────────────────────────
const BRAND = 'Ledgrr'
const TAGLINE = 'Where money makes sense.'

// ── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '⬡',
    title: 'Role-Based Access Control',
    detail: 'Three-tier RBAC — Admin, Analyst, Viewer — enforced at every layer. JWT tokens carry role claims; middleware rejects underprivileged calls before they touch business logic.',
    tag: 'Security',
    accent: '#7c3aed',
  },
  {
    icon: '◈',
    title: 'Financial Records CRUD',
    detail: 'Full lifecycle management for income and expense transactions. Filter by date range, category, type, or amount. Paginated, sortable, bulk-deletable.',
    tag: 'Core',
    accent: '#059669',
  },
  {
    icon: '⬟',
    title: 'User & Role Management',
    detail: 'Admin panel to create, promote, demote, activate or deactivate any user instantly. Assign Analyst or Viewer roles without touching the database.',
    tag: 'Admin',
    accent: '#0284c7',
  },
  {
    icon: '◉',
    title: 'Dashboard Analytics',
    detail: 'Aggregated totals, monthly trend lines, category breakdowns, and net balance snapshots — powered by MongoDB aggregation pipelines. Auto-refreshes every 60 seconds.',
    tag: 'Analytics',
    accent: '#d97706',
  },
  {
    icon: '▦',
    title: 'Access Middleware',
    detail: 'FastAPI dependency injection gates every route. Role mismatches return clean 403s before any service code runs — no accidental data leaks.',
    tag: 'Backend',
    accent: '#be123c',
  },
  {
    icon: '✦',
    title: 'Validation & Error Handling',
    detail: 'Pydantic v2 schemas validate every field. Duplicate emails, invalid IDs, bad dates — all caught and returned as consistent, human-readable error messages.',
    tag: 'Reliability',
    accent: '#6d28d9',
  },
]

const ROLES = [
  {
    role: 'Viewer', icon: '◯', accent: '#0284c7',
    desc: 'Read-only access to financial records. Ideal for stakeholders who need visibility without write privileges.',
    perms: ['Browse all transactions', 'Filter & search records', 'Export-ready data views', 'Own profile management'],
  },
  {
    role: 'Analyst', icon: '◉', accent: '#059669',
    desc: 'Everything Viewers can do, plus access to the analytics dashboard and aggregated financial intelligence.',
    perms: ['Full dashboard access', 'Monthly trend analysis', 'Category breakdowns', 'Income vs. expense insights'],
  },
  {
    role: 'Admin', icon: '◈', accent: '#7c3aed',
    desc: 'Complete control. Manages users, transactions, and roles. The single source of truth for financial data.',
    perms: ['Create · edit · delete transactions', 'User management (full CRUD)', 'Role assignment & revocation', 'Account activation / deactivation'],
  },
]

const METRICS = [
  { val: '3',   label: 'Permission Tiers',   sub: 'Admin · Analyst · Viewer' },
  { val: '11',  label: 'Finance Categories', sub: 'Salary to entertainment' },
  { val: '100', label: 'Records / Page',     sub: 'Configurable page size' },
  { val: 'JWT', label: 'Auth Standard',      sub: 'Stateless token security' },
]

const STACK = [
  { name: 'FastAPI',     sub: 'Async Python backend',    color: '#059669' },
  { name: 'MongoDB',     sub: 'Motor async driver',       color: '#059669' },
  { name: 'Pydantic v2', sub: 'Schema validation',        color: '#7c3aed' },
  { name: 'JWT / bcrypt',sub: 'Auth & password security', color: '#7c3aed' },
  { name: 'React 18',    sub: 'Vite-powered frontend',    color: '#0284c7' },
  { name: 'Chart.js',    sub: 'Interactive analytics',    color: '#0284c7' },
]

const HOW = [
  { step: '01', title: 'Admin seeds the system', body: 'Create users and assign roles via the Admin panel. Each user gets a JWT on login that encodes their role.' },
  { step: '02', title: 'Transactions flow in',   body: 'Admins log income and expenses with category, date, and notes. Records are immediately visible to all roles.' },
  { step: '03', title: 'Analysts read the data', body: 'Analysts access the live dashboard — monthly trends, category totals, and net balance — to understand cash flow.' },
  { step: '04', title: 'Viewers stay informed',  body: 'Viewers browse and filter the transaction log. They see everything but can change nothing — perfect for oversight.' },
]

// ── Logo SVG ─────────────────────────────────────────────────────────────────
function LedgrrLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="11" fill="url(#grad)"/>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>
      </defs>
      {/* Stylised L + upward tick */}
      <path d="M11 10 L11 28 L22 28" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 22 L29 16 L34 20" stroke="#a5f3fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="29" cy="16" r="2" fill="#a5f3fc"/>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  const [activeRole, setActiveRole] = useState(1)

  useEffect(() => {
    const t = setInterval(() => setActiveRole(r => (r + 1) % ROLES.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={s.root}>

      {/* ── Subtle grid background ── */}
      <div style={s.gridBg} />

      {/* ── Gradient orbs ── */}
      <div style={{ ...s.orb, top: -120, left: '10%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', width: 600, height: 600 }} />
      <div style={{ ...s.orb, top: 200, right: '-5%', background: 'radial-gradient(circle, rgba(2,132,199,0.09) 0%, transparent 70%)', width: 500, height: 500 }} />

      {/* ── Nav ── */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <LedgrrLogo size={34} />
          <span style={s.navBrand}>{BRAND}</span>
        </div>
        <div style={s.navRight}>
          <span style={s.navSubtle}>Finance · Intelligence · Control</span>
          <button style={s.navCta} onClick={() => navigate('/login')}>
            Sign in →
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section style={s.hero}>
        <div style={s.heroPill} className="fade-up">
          <span style={s.pillDot} />
          Full-stack finance platform · FastAPI + MongoDB + React
        </div>

        <h1 style={s.heroH1} className="fade-up-1">
          Financial clarity,<br />
          <span style={s.heroGrad}>built in.</span>
        </h1>

        <p style={s.heroP} className="fade-up-2">
          A production-grade finance dashboard with role-based access control,
          real-time analytics, and airtight data integrity — from a single
          FastAPI backend and React frontend.
        </p>

        <div style={s.heroBtns} className="fade-up-3">
          <button style={s.btnPrimary} onClick={() => navigate('/login')}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            Open Dashboard
          </button>
          <a style={s.btnGhost} href="#features">
            See features ↓
          </a>
        </div>

        {/* Metrics row */}
        <div style={s.metrics} className="fade-up-4">
          {METRICS.map((m, i) => (
            <div key={m.label} style={{ ...s.metric, borderLeft: i > 0 ? '1px solid #e5e7eb' : 'none' }}>
              <span style={s.metricVal}>{m.val}</span>
              <span style={s.metricLabel}>{m.label}</span>
              <span style={s.metricSub}>{m.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section id="features" style={s.section}>
        <div style={s.sectionLabel}>Capabilities</div>
        <h2 style={s.sectionH2}>Everything a finance platform needs</h2>
        <p style={s.sectionP}>Designed for teams where finance data has real consequences — not a toy demo.</p>

        <div style={s.featsGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="fade-up card-lift" style={{ ...s.featCard, animationDelay: i * 0.07 + 's' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ ...s.featIconWrap, color: f.accent, background: f.accent + '12', border: `1.5px solid ${f.accent}22` }}>
                  {f.icon}
                </div>
                <span style={{ ...s.featTag, color: f.accent, background: f.accent + '10', border: `1px solid ${f.accent}28` }}>
                  {f.tag}
                </span>
              </div>
              <h3 style={s.featTitle}>{f.title}</h3>
              <p style={s.featDetail}>{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <div style={s.fullBand}>
        <div style={{ ...s.section, paddingTop: 72, paddingBottom: 72 }}>
          <div style={s.sectionLabel}>Workflow</div>
          <h2 style={s.sectionH2}>How it works</h2>
          <p style={s.sectionP}>Four interactions that cover the full data lifecycle.</p>

          <div style={s.howGrid}>
            {HOW.map((h, i) => (
              <div key={h.step} className="fade-up" style={{ ...s.howCard, animationDelay: i * 0.1 + 's' }}>
                <span style={s.howStep}>{h.step}</span>
                <h3 style={s.howTitle}>{h.title}</h3>
                <p style={s.howBody}>{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ROLES
      ══════════════════════════════════════════════════ */}
      <section style={s.section}>
        <div style={s.sectionLabel}>Access Control</div>
        <h2 style={s.sectionH2}>The right access for every person</h2>
        <p style={s.sectionP}>Three distinct roles, each with clearly bounded permissions. No ambiguity, no over-permissioning.</p>

        <div style={s.rolesLayout}>
          {/* Left — role selector tabs */}
          <div style={s.roleTabs}>
            {ROLES.map((r, i) => (
              <button key={r.role} onClick={() => setActiveRole(i)} className="btn-press" style={{
                ...s.roleTab,
                borderLeft: `3px solid ${activeRole === i ? r.accent : 'transparent'}`,
                background: activeRole === i ? r.accent + '08' : 'transparent',
                color: activeRole === i ? r.accent : '#6b7280',
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

          {/* Right — role detail */}
          {(() => {
            const r = ROLES[activeRole]
            return (
              <div style={{ ...s.roleDetail, borderColor: r.accent + '30' }} key={r.role}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ ...s.roleIconLarge, color: r.accent, background: r.accent + '10', border: `2px solid ${r.accent}30` }}>
                    {r.icon}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: '#1a1a2e' }}>{r.role}</h3>
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{r.desc}</p>
                  </div>
                </div>
                <div style={s.permGrid}>
                  {r.perms.map(p => (
                    <div key={p} style={s.permRow}>
                      <span style={{ ...s.permCheck, color: r.accent }}>✓</span>
                      <span style={s.permText}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════════════ */}
      <div style={s.fullBand}>
        <div style={{ ...s.section, paddingTop: 72, paddingBottom: 72 }}>
          <div style={s.sectionLabel}>Technology</div>
          <h2 style={s.sectionH2}>Modern stack, zero compromises</h2>

          <div style={s.stackGrid}>
            {STACK.map((t, i) => (
              <div key={t.name} className="fade-up card-lift" style={{ ...s.stackCard, animationDelay: i * 0.06 + 's' }}>
                <div style={{ ...s.stackDot, background: t.color }} />
                <div>
                  <p style={s.stackName}>{t.name}</p>
                  <p style={s.stackSub}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════ */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <div style={s.ctaLogoWrap}>
            <LedgrrLogo size={52} />
          </div>
          <h2 style={s.ctaH2}>{TAGLINE}</h2>
          <p style={s.ctaP}>
            Sign in as Admin, Analyst, or Viewer to explore the full platform.
            Every role, every feature — ready now.
          </p>
          <button style={s.ctaBtn} onClick={() => navigate('/login')}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 12px 32px rgba(124,58,237,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='0 8px 24px rgba(124,58,237,0.35)'}
          >
            Open Dashboard →
          </button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 18 }}>
            No setup required · Admin, Analyst & Viewer accounts ready
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LedgrrLogo size={22} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#374151', fontSize: 15 }}>{BRAND}</span>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af' }}>
          FastAPI · MongoDB · React · JWT · Pydantic v2
        </p>
      </footer>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  root:       { minHeight: '100vh', background: '#f8f9ff', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflowX: 'hidden' },
  gridBg: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
  },
  orb:        { position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 },

  // Nav
  nav:        { position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 56px', background: 'rgba(248,249,255,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(200,205,230,0.7)' },
  navLeft:    { display: 'flex', alignItems: 'center', gap: 10 },
  navBrand:   { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.4px' },
  navRight:   { display: 'flex', alignItems: 'center', gap: 20 },
  navSubtle:  { fontSize: 12, color: '#9ca3af', letterSpacing: 0.5, fontWeight: 500 },
  navCta:     { padding: '9px 22px', background: '#1a1a2e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' },

  // Hero
  hero:       { position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', padding: '104px 48px 88px', textAlign: 'center' },
  heroPill:   { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', padding: '6px 16px', borderRadius: 100, marginBottom: 32 },
  pillDot:    { width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 6px #7c3aed', display: 'inline-block', animation: 'pulse 2s infinite' },
  heroH1:     { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(42px, 7vw, 76px)', lineHeight: 1.06, letterSpacing: '-2.5px', color: '#0f0f1a', marginBottom: 24 },
  heroGrad:   { background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0284c7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroP:      { fontSize: 18, lineHeight: 1.75, color: '#4b5563', maxWidth: 600, margin: '0 auto 44px' },
  heroBtns:   { display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 60, flexWrap: 'wrap' },
  btnPrimary: { padding: '14px 36px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: "'Syne', sans-serif", boxShadow: '0 6px 20px rgba(124,58,237,0.32)', transition: 'transform 0.2s, box-shadow 0.2s' },
  btnGhost:   { padding: '14px 30px', background: 'transparent', border: '2px solid #d1d5db', borderRadius: 12, color: '#4b5563', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'border-color 0.2s' },

  // Metrics
  metrics:    { display: 'inline-flex', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  metric:     { padding: '20px 36px', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' },
  metricVal:  { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: '#7c3aed', lineHeight: 1 },
  metricLabel:{ fontSize: 12, color: '#374151', fontWeight: 700, letterSpacing: 0.3 },
  metricSub:  { fontSize: 11, color: '#9ca3af' },

  // Sections
  section:    { padding: '88px 56px', maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 },
  fullBand:   { background: '#f1f3fd', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', position: 'relative', zIndex: 1 },
  sectionLabel:{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#7c3aed', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', padding: '5px 14px', borderRadius: 100, marginBottom: 18 },
  sectionH2:  { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 40px)', color: '#0f0f1a', letterSpacing: '-0.8px', marginBottom: 14 },
  sectionP:   { fontSize: 16, color: '#4b5563', lineHeight: 1.7, maxWidth: 560, marginBottom: 52 },

  // Features grid
  featsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 22 },
  featCard:   { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '30px', cursor: 'default', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  featIconWrap:{ width: 44, height: 44, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 700 },
  featTag:    { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 11px', borderRadius: 100 },
  featTitle:  { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f0f1a', marginBottom: 10, letterSpacing: '-0.2px' },
  featDetail: { fontSize: 14, color: '#4b5563', lineHeight: 1.7 },

  // How it works
  howGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 },
  howCard:    { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 18, padding: '28px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  howStep:    { display: 'block', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: '#e5e7eb', marginBottom: 16, letterSpacing: '-1px' },
  howTitle:   { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#0f0f1a', marginBottom: 10 },
  howBody:    { fontSize: 13.5, color: '#4b5563', lineHeight: 1.65 },

  // Roles
  rolesLayout:{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' },
  roleTabs:   { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200, flex: '0 0 220px' },
  roleTab:    { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.22s', textAlign: 'left', marginLeft: 0 },
  roleDetail: { flex: 1, background: '#ffffff', border: '2px solid', borderRadius: 20, padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', minHeight: 220, transition: 'border-color 0.3s' },
  roleIconLarge:{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0 },
  permGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' },
  permRow:    { display: 'flex', alignItems: 'center', gap: 10 },
  permCheck:  { fontSize: 15, fontWeight: 700, flexShrink: 0 },
  permText:   { fontSize: 14, color: '#374151' },

  // Stack
  stackGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 },
  stackCard:  { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  stackDot:   { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  stackName:  { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f0f1a' },
  stackSub:   { fontSize: 12, color: '#6b7280', marginTop: 3 },

  // CTA banner
  cta:        { background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #1e40af 100%)', padding: '100px 48px', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' },
  ctaInner:   { position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' },
  ctaLogoWrap:{ marginBottom: 28 },
  ctaH2:      { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 44, color: '#ffffff', letterSpacing: '-1.5px', marginBottom: 18 },
  ctaP:       { fontSize: 17, color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, marginBottom: 40 },
  ctaBtn:     { padding: '18px 48px', background: '#ffffff', border: 'none', borderRadius: 14, color: '#4f46e5', fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: "'Syne', sans-serif", boxShadow: '0 8px 24px rgba(124,58,237,0.35)', transition: 'box-shadow 0.2s, transform 0.2s' },

  // Footer
  footer:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 56px', borderTop: '1px solid #e5e7eb', background: '#f8f9ff' },
}
