import { useEffect, useState, useCallback, useRef } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import api from '../utils/api'
import StatCard from '../components/StatCard'
import { SkeletonCard, SkeletonChart } from '../components/Skeleton'
import { useToast } from '../context/ToastContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Vivid palette — works on both light bg (doughnut/bars) and dark tooltips
const PALETTE = ['#7c3aed','#e11d48','#d97706','#059669','#0284c7','#db2777','#0d9488','#7c3aed']

// Light-mode chart grid/tick colors
const TICK_COLOR   = '#6b7280'
const GRID_COLOR   = 'rgba(0,0,0,0.06)'
const TOOLTIP_BG   = '#1e1e2e'
const TOOLTIP_BODY = '#c4c4d4'
const TOOLTIP_BORDER = '#3a3a5c'

const baseScales = {
  x: {
    ticks: { color: TICK_COLOR, font: { family: 'DM Sans', size: 12 } },
    grid: { color: GRID_COLOR },
    border: { color: GRID_COLOR },
  },
  y: {
    ticks: {
      color: TICK_COLOR,
      font: { family: 'DM Sans', size: 12 },
      callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v),
    },
    grid: { color: GRID_COLOR },
    border: { color: GRID_COLOR },
  },
}

function ChartToggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 3, background: '#eef0f8', borderRadius: 8, padding: 3 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} className="btn-press" style={{ padding: '4px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', background: value === o.value ? '#7c3aed' : 'transparent', color: value === o.value ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.2s', boxShadow: value === o.value ? '0 2px 8px rgba(124,58,237,0.35)' : 'none' }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function CategoryBar({ label, value, max, color, count }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(max > 0 ? (value / max) * 100 : 0), 120); return () => clearTimeout(t) }, [value, max])
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a2e', textTransform: 'capitalize' }}>{label}</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 7, background: '#eef0f8', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: color, width: width + '%', transition: 'width 0.9s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: `0 0 8px ${color}55` }} />
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{count} transaction{count !== 1 ? 's' : ''}</p>
    </div>
  )
}

function Sparkline({ data, color }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || !data?.length) return
    const c = ref.current, ctx = c.getContext('2d'), w = c.width, h = c.height
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
    const pts = data.map((v, i) => [i / (data.length - 1) * w, h - ((v - min) / range) * (h - 6) - 3])
    ctx.clearRect(0, 0, w, h)
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, color + '40'); grad.addColorStop(1, 'transparent')
    ctx.beginPath(); ctx.moveTo(pts[0][0], h)
    pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(w, h); ctx.closePath()
    ctx.fillStyle = grad; ctx.fill()
    ctx.beginPath(); pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
  }, [data, color])
  return <canvas ref={ref} width={70} height={28} style={{ display: 'block', marginBottom: 4 }} />
}

export default function Dashboard() {
  const toast = useToast()
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [trendType, setTrendType]   = useState('line')
  const [catTab, setCatTab]         = useState('expense')
  const [showNet, setShowNet]       = useState(false)
  const [txFilter, setTxFilter]     = useState('all')

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const r = await api.get('/dashboard/summary')
      setData(r.data)
      if (isRefresh) toast.success('Dashboard refreshed!')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to load')
    } finally { setLoading(false); setRefreshing(false) }
  }, [toast])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { const id = setInterval(() => fetchData(true), 60000); return () => clearInterval(id) }, [fetchData])

  if (loading) return <LoadingSkeleton />

  const trends = [...(data?.monthly_trends || [])].reverse()
  const trendLabels = trends.map(t => `${MONTHS[t.month-1]} '${String(t.year).slice(2)}`)

  // Line datasets — keep line colors vivid
  const lineDatasets = [
    { label: 'Income',  data: trends.map(t => t.income),  borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 8, pointBackgroundColor: '#059669', pointBorderColor: '#fff', pointBorderWidth: 2 },
    { label: 'Expense', data: trends.map(t => t.expense), borderColor: '#e11d48', backgroundColor: 'rgba(225,29,72,0.06)', fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 8, pointBackgroundColor: '#e11d48', pointBorderColor: '#fff', pointBorderWidth: 2 },
    ...(showNet ? [{ label: 'Net', data: trends.map(t => t.net), borderColor: '#7c3aed', backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 4, pointHoverRadius: 7, pointBackgroundColor: '#7c3aed', borderDash: [5,4] }] : []),
  ]

  // Bar datasets — fully opaque, vivid solid colors
  const barDatasets = [
    { label: 'Income',  data: trends.map(t => t.income),  backgroundColor: '#059669', hoverBackgroundColor: '#047857', borderRadius: 6, borderSkipped: false },
    { label: 'Expense', data: trends.map(t => t.expense), backgroundColor: '#e11d48', hoverBackgroundColor: '#be123c', borderRadius: 6, borderSkipped: false },
    ...(showNet ? [{ label: 'Net', data: trends.map(t => t.net), backgroundColor: '#7c3aed', hoverBackgroundColor: '#6d28d9', borderRadius: 6, borderSkipped: false }] : []),
  ]

  const trendOptions = {
    responsive: true, maintainAspectRatio: true,
    animation: { duration: 700, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: '#374151', font: { family: 'DM Sans', size: 13 }, padding: 18, usePointStyle: true, pointStyleWidth: 10 } },
      tooltip: { backgroundColor: TOOLTIP_BG, titleColor: '#f0f0f8', bodyColor: TOOLTIP_BODY, borderColor: TOOLTIP_BORDER, borderWidth: 1, padding: 12, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } },
    },
    scales: baseScales,
  }

  const catData = catTab === 'expense' ? data.expense_by_category : data.income_by_category
  const catMax  = Math.max(...catData.map(c => c.total), 1)

  const doughnutData = {
    labels: catData.slice(0,6).map(c => c.category.charAt(0).toUpperCase() + c.category.slice(1)),
    datasets: [{
      data: catData.slice(0,6).map(c => c.total),
      backgroundColor: PALETTE,
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 12,
      hoverBorderColor: '#ffffff',
    }],
  }
  const doughnutOptions = {
    responsive: true, cutout: '68%',
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#374151',
          font: { family: 'DM Sans', size: 13 },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 10,
          generateLabels: (chart) => {
            const data = chart.data
            return data.labels.map((label, i) => ({
              text: label,
              fillStyle: PALETTE[i],
              strokeStyle: '#fff',
              lineWidth: 2,
              hidden: false,
              index: i,
            }))
          },
        },
      },
      tooltip: { backgroundColor: TOOLTIP_BG, titleColor: '#f0f0f8', bodyColor: TOOLTIP_BODY, borderColor: TOOLTIP_BORDER, borderWidth: 1, padding: 12, callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${Math.round(ctx.raw / catData.slice(0,6).reduce((s,c)=>s+c.total,0)*100)}%)` } },
    },
  }

  const recentTxs = (data.recent_transactions || []).filter(tx => txFilter === 'all' || tx.type === txFilter)

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* Header */}
      <div style={s.pageHeader} className="fade-up">
        <div>
          <h1 style={s.pageTitle}>Dashboard</h1>
          <p style={s.pageSub}>Live financial overview · auto-refreshes every 60s</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={s.liveBadge}><span style={{ ...s.liveDot, animation: 'pulse 2s ease infinite' }} />Live</div>
          <button className="btn-press" onClick={() => fetchData(true)} disabled={refreshing} style={s.refreshBtn}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none', fontSize: 16 }}>↻</span>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiGrid}>
        <StatCard delay={1} label="Total Income"   value={data.total_income}          isNumber prefix="₹" icon="↑" color="#059669" glow="rgba(5,150,105,0.2)"  sub={<><Sparkline data={(data.monthly_trends||[]).map(t=>t.income)} color="#059669"/><span style={{fontSize:12,color:'#6b7280'}}>{data.income_by_category.length} categories</span></>} />
        <StatCard delay={2} label="Total Expenses" value={data.total_expense}         isNumber prefix="₹" icon="↓" color="#e11d48" glow="rgba(225,29,72,0.18)" sub={<><Sparkline data={(data.monthly_trends||[]).map(t=>t.expense)} color="#e11d48"/><span style={{fontSize:12,color:'#6b7280'}}>{data.expense_by_category.length} categories</span></>} />
        <StatCard delay={3} label="Net Balance"    value={Math.abs(data.net_balance)} isNumber prefix={data.net_balance>=0?'+₹':'-₹'} icon={data.net_balance>=0?'◎':'⊗'} color={data.net_balance>=0?'#7c3aed':'#e11d48'} glow={data.net_balance>=0?'rgba(124,58,237,0.18)':'rgba(225,29,72,0.18)'} sub={data.net_balance>=0?'✓ Positive cash flow':'↓ Negative cash flow'} />
        <StatCard delay={4} label="Transactions"   value={data.total_transactions}    isNumber icon="⊞" color="#0284c7" glow="rgba(2,132,199,0.18)" sub="All time records" />
      </div>

      {/* Trend chart + Doughnut */}
      <div style={s.chartRow} className="fade-up-2">
        <div style={{ ...s.chartBox, flex: 2.2 }}>
          <div style={s.chartHeader}>
            <h2 style={s.chartTitle}>Monthly Trends</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowNet(n => !n)} className="btn-press" style={{ ...s.chip, ...(showNet ? s.chipActive : {}) }}>
                {showNet ? '✓ ' : ''}Net line
              </button>
              <ChartToggle options={[{label:'〜 Line',value:'line'},{label:'▬ Bar',value:'bar'}]} value={trendType} onChange={setTrendType} />
            </div>
          </div>
          {trendType === 'line'
            ? <Line data={{ labels: trendLabels, datasets: lineDatasets }} options={trendOptions} />
            : <Bar  data={{ labels: trendLabels, datasets: barDatasets }} options={trendOptions} />
          }
        </div>

        <div style={{ ...s.chartBox, flex: 1 }}>
          <div style={s.chartHeader}>
            <h2 style={s.chartTitle}>By Category</h2>
            <ChartToggle options={[{label:'Expense',value:'expense'},{label:'Income',value:'income'}]} value={catTab} onChange={setCatTab} />
          </div>
          <div style={{ maxWidth: 200, margin: '0 auto 8px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Progress bars + Recent */}
      <div style={s.chartRow} className="fade-up-3">
        <div style={{ ...s.chartBox, flex: 1 }}>
          <div style={s.chartHeader}>
            <h2 style={s.chartTitle}>{catTab === 'expense' ? 'Top Expenses' : 'Top Income'}</h2>
            <span style={{ fontSize:12, color:'#6b7280', background:'#eef0f8', padding:'4px 10px', borderRadius:6, fontWeight:600 }}>{catData.length} categories</span>
          </div>
          {catData.slice(0,7).map((c,i) => <CategoryBar key={c.category} label={c.category} value={c.total} max={catMax} color={PALETTE[i%PALETTE.length]} count={c.count} />)}
          {catData.length === 0 && <p style={{ color:'#9ca3af', fontSize:14, textAlign:'center', padding:'20px 0' }}>No data yet</p>}
        </div>

        <div style={{ ...s.chartBox, flex: 1.3 }}>
          <div style={s.chartHeader}>
            <h2 style={s.chartTitle}>Recent Activity</h2>
            <div style={{ display:'flex', gap:3 }}>
              {['all','income','expense'].map(f => (
                <button key={f} onClick={() => setTxFilter(f)} className="btn-press" style={{ padding:'5px 11px', borderRadius:6, border:'none', cursor:'pointer', background: txFilter===f ? (f==='income'?'rgba(5,150,105,0.15)':f==='expense'?'rgba(225,29,72,0.12)':'rgba(124,58,237,0.12)') : 'transparent', color: txFilter===f ? (f==='income'?'#059669':f==='expense'?'#e11d48':'#7c3aed') : '#6b7280', fontSize:12, fontWeight:700, fontFamily:'var(--font-body)', textTransform:'capitalize', transition:'all 0.2s' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {recentTxs.slice(0,8).map((tx,i) => (
              <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#f8f9ff', borderRadius:10, border:'1px solid #e8eaf6', transition:'border-color 0.2s, transform 0.15s', cursor:'default', animationDelay: i*0.04+'s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = tx.type==='income'?'rgba(5,150,105,0.4)':'rgba(225,29,72,0.35)'; e.currentTarget.style.transform='translateX(3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8eaf6'; e.currentTarget.style.transform='translateX(0)' }}
              >
                <div style={{ width:32, height:32, borderRadius:9, background:tx.type==='income'?'rgba(5,150,105,0.12)':'rgba(225,29,72,0.10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, color:tx.type==='income'?'#059669':'#e11d48', fontWeight:700 }}>
                  {tx.type==='income'?'↑':'↓'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13.5, fontWeight:600, color:'#1a1a2e', textTransform:'capitalize', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{tx.category}</p>
                  <p style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{tx.date}{tx.notes ? ' · '+tx.notes : ''}</p>
                </div>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:tx.type==='income'?'#059669':'#e11d48', whiteSpace:'nowrap' }}>
                  {tx.type==='income'?'+':'-'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
            {recentTxs.length===0 && <div style={{ textAlign:'center', padding:'28px 0', color:'#9ca3af', fontSize:14 }}>No {txFilter==='all'?'':txFilter} transactions</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div>
      <div style={{ marginBottom:28 }}><div className="skeleton" style={{ width:220,height:32,marginBottom:8 }}/><div className="skeleton" style={{ width:300,height:13 }}/></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>{[1,2,3,4].map(i=><SkeletonCard key={i}/>)}</div>
      <div style={{ display:'flex', gap:20, marginBottom:24 }}>
        <div style={{ flex:2.2, background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', padding:24 }}><SkeletonChart height={220}/></div>
        <div style={{ flex:1,   background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', padding:24 }}><SkeletonChart height={220}/></div>
      </div>
    </div>
  )
}

const s = {
  pageHeader: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 },
  pageTitle:  { fontFamily:'var(--font-display)', fontWeight:800, fontSize:30, color:'#1a1a2e', letterSpacing:'-0.5px' },
  pageSub:    { color:'#6b7280', fontSize:13, marginTop:4 },
  liveBadge:  { display:'flex', alignItems:'center', gap:6, background:'rgba(5,150,105,0.1)', border:'1px solid rgba(5,150,105,0.25)', color:'#059669', padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600 },
  liveDot:    { width:7, height:7, borderRadius:'50%', background:'#059669', display:'inline-block' },
  refreshBtn: { display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#ffffff', border:'1px solid #dde0f0', borderRadius:10, color:'#4a4a6a', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.2s' },
  kpiGrid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  chartRow:   { display:'flex', gap:20, marginBottom:24 },
  chartBox:   { background:'#ffffff', border:'1px solid #dde0f0', borderRadius:'var(--radius)', padding:'22px 24px' },
  chartHeader:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, gap:8 },
  chartTitle: { fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'#1a1a2e' },
  chip:       { padding:'4px 11px', borderRadius:6, border:'1px solid #dde0f0', background:'transparent', color:'#6b7280', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 0.2s' },
  chipActive: { background:'rgba(124,58,237,0.12)', borderColor:'rgba(124,58,237,0.35)', color:'#7c3aed' },
}
