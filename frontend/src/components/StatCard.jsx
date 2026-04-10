import { useRef } from 'react'
import { useCountUp } from '../hooks/useCountUp'

function addRipple(e, ref) {
  const btn = ref.current
  if (!btn) return
  const circle = document.createElement('span')
  const rect = btn.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  circle.className = 'ripple'
  circle.style.width = circle.style.height = size + 'px'
  circle.style.left = (e.clientX - rect.left - size / 2) + 'px'
  circle.style.top  = (e.clientY - rect.top  - size / 2) + 'px'
  btn.appendChild(circle)
  setTimeout(() => circle.remove(), 700)
}

export default function StatCard({ label, value, sub, color = '#7c3aed', glow, icon, delay = 0, isNumber = false, prefix = '', suffix = '' }) {
  const glowColor = glow || color + '33'
  const ref = useRef(null)
  const numVal = isNumber ? Number(String(value).replace(/[^0-9.-]/g, '')) : null
  const animated = useCountUp(numVal, 1100)
  const displayValue = isNumber
    ? prefix + animated.toLocaleString('en-IN', { maximumFractionDigits: 0 }) + suffix
    : value

  return (
    <div
      ref={ref}
      className={'fade-up-' + delay + ' card-lift ripple-container'}
      onClick={(e) => addRipple(e, ref)}
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', padding: '22px 24px', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px ' + glowColor; e.currentTarget.style.borderColor = color + '55' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--c-border)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, ' + color + ', ' + color + '66)', boxShadow: '0 0 12px ' + glowColor }} />
      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, ' + glowColor + ' 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: 40, height: 40, borderRadius: 11, background: color + '22', border: '1px solid ' + color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14, color }}>
        {icon}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--c-text)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{displayValue}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--c-text-2)', marginTop: 6 }}>{sub}</p>}
    </div>
  )
}
