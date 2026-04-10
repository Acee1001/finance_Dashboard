export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 11, marginBottom: 14 }} />
      <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: 140, height: 28 }} />
      <div className="skeleton" style={{ width: 100, height: 10, marginTop: 10 }} />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr>
      {[80, 70, 90, 80, 120, 60].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ width: w, height: 14 }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonChart({ height = 200 }) {
  return <div className="skeleton" style={{ width: '100%', height, borderRadius: 8 }} />
}
