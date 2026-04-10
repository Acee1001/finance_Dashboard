import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }
const COLORS = {
  success: { border: 'rgba(5,150,105,0.4)',  icon: '#059669', bar: '#059669' },
  error:   { border: 'rgba(225,29,72,0.4)',   icon: '#e11d48', bar: '#e11d48' },
  info:    { border: 'rgba(124,58,237,0.4)',  icon: '#7c3aed', bar: '#7c3aed' },
  warning: { border: 'rgba(180,83,9,0.4)',    icon: '#b45309', bar: '#b45309' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, exiting: true } : x))
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 260)
  }, [])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type, exiting: false }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  toast.success = (m, d) => toast(m, 'success', d)
  toast.error   = (m, d) => toast(m, 'error', d)
  toast.info    = (m, d) => toast(m, 'info', d)
  toast.warning = (m, d) => toast(m, 'warning', d)

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = COLORS[t.type]
          return (
            <div
              key={t.id}
              className={t.exiting ? 'toast-exit' : 'toast-enter'}
              style={{
                pointerEvents: 'all',
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--c-surface)',
                border: `1px solid ${c.border}`,
                borderRadius: 12,
                padding: '13px 16px',
                minWidth: 280, maxWidth: 380,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => dismiss(t.id)}
            >
              {/* Progress bar */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0,
                height: 2, background: c.bar,
                animation: `shrink 3.5s linear forwards`,
                width: '100%',
              }} />
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${c.bar}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.icon, fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>
                {ICONS[t.type]}
              </span>
              <span style={{ fontSize: 13, color: 'var(--c-text)', flex: 1, lineHeight: 1.4 }}>
                {t.message}
              </span>
              <span style={{ fontSize: 16, color: 'var(--c-text-3)', marginLeft: 4 }}>×</span>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
