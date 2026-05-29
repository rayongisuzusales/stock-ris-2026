import { useMemo } from 'react'
import { AlertTriangle, Clock } from 'lucide-react'
import { useStock } from '../context/StockContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'

export default function Monitor() {
  const { requests, getWorkingDays } = useStock()
  const { user } = useAuth()

  // เฉพาะ requests ที่ matchDate แล้ว = "ครอบครองอยู่"
  const matched = useMemo(() => {
    const base = requests.filter(r => r.matchDate && r.status !== 'completed')
    if (user?.role === 'manager') return base.filter(r => r.branch === user.branch)
    return base
  }, [requests, user])

  const withDays = useMemo(() =>
    matched.map(r => ({ ...r, workDays: getWorkingDays(r.matchDate) }))
  , [matched, getWorkingDays])

  const overdue = withDays.filter(r => r.workDays > 7)
  const warning = withDays.filter(r => r.workDays >= 5 && r.workDays <= 7)
  const normal  = withDays.filter(r => r.workDays < 5)

  const statusStyle = (days) => {
    if (days > 7)  return { bg:'#CC000018', color:'#FF6666', border:'#CC000030', label:'เกินกำหนด', icon:'🔴' }
    if (days >= 5) return { bg:'#F59E0B18', color:'#FCD34D', border:'#F59E0B30', label:'ใกล้ครบ',    icon:'🟡' }
    return              { bg:'#22C55E18', color:'#4ADE80', border:'#22C55E30', label:'ปกติ',        icon:'🟢' }
  }

  return (
    <div className="page-wrap">
      <PageHeader
        title="Monitor สต๊อก"
        subtitle="รถที่สาขาครอบครองอยู่ — นับวันทำงาน ไม่รวมวันอาทิตย์"
        lastSync={new Date().toLocaleDateString('th-TH')}
      />

      {/* KPI */}
      <div className="kpi-grid" style={S.kpiGrid}>
        <div style={{ ...S.kpi, borderColor:'#CC000030' }}>
          <div style={S.kpiLabel}>เกินกำหนด &gt;7 วัน</div>
          <div style={{ ...S.kpiVal, color:'#FF6666' }}>{overdue.length}</div>
          <div style={S.kpiSub}>คัน 🔴</div>
        </div>
        <div style={{ ...S.kpi, borderColor:'#F59E0B30' }}>
          <div style={S.kpiLabel}>ใกล้ครบ 5–7 วัน</div>
          <div style={{ ...S.kpiVal, color:'#FCD34D' }}>{warning.length}</div>
          <div style={S.kpiSub}>คัน 🟡</div>
        </div>
        <div style={{ ...S.kpi, borderColor:'#22C55E30' }}>
          <div style={S.kpiLabel}>ปกติ &lt;5 วัน</div>
          <div style={{ ...S.kpiVal, color:'#4ADE80' }}>{normal.length}</div>
          <div style={S.kpiSub}>คัน 🟢</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>ครอบครองทั้งหมด</div>
          <div style={{ ...S.kpiVal, color:'#F0F0F0' }}>{withDays.length}</div>
          <div style={S.kpiSub}>คัน</div>
        </div>
      </div>

      {/* Alert banner */}
      {overdue.length > 0 && (
        <div style={S.alertBanner}>
          <AlertTriangle size={15} style={{ color:'#FF6666', flexShrink:0 }} />
          <span style={{ fontSize:13, color:'#FF6666', fontWeight:500 }}>
            มีรถ {overdue.length} คัน ครอบครองเกิน 7 วันทำงาน — กรุณาดำเนินการ
          </span>
        </div>
      )}

      {/* Table */}
      <div style={S.card}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>รายการรถที่ครอบครองอยู่</span>
          <span style={S.chip}>{withDays.length} คัน</span>
        </div>

        {withDays.length === 0 ? (
          <div style={{ textAlign:'center', color:'#333', padding:'32px 0', fontSize:13 }}>
            ไม่มีรถที่ครอบครองอยู่
          </div>
        ) : (
          <div className="table-scroll" style={{ overflowX:'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['สถานะ','ลูกค้า','รุ่น','สี','เลขเครื่อง','สาขา','SC','วันที่แมท','วันทำงาน'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...withDays].sort((a, b) => b.workDays - a.workDays).map((r, i) => {
                  const st = statusStyle(r.workDays)
                  return (
                    <tr key={r.id} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                      <td style={S.td}>
                        <span style={{ ...S.pill, background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td style={{ ...S.td, color:'#D0D0D0', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>
                        {r.customerName}
                      </td>
                      <td style={{ ...S.td, color:'#C0C0C0', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis' }}>
                        {r.model}
                      </td>
                      <td style={{ ...S.td, fontFamily:'var(--mono)' }}>{r.color?.split(' ')[0]}</td>
                      <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.engineNo || '—'}</td>
                      <td style={{ ...S.td, color:'#CC0000', fontWeight:600, fontFamily:'var(--mono)' }}>{r.branch}</td>
                      <td style={{ ...S.td, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis' }}>
                        {r.scName || '—'}
                      </td>
                      <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.matchDate}</td>
                      <td style={{ ...S.td, textAlign:'center' }}>
                        <span style={{ fontSize:15, fontWeight:700, fontFamily:'var(--mono)', color:st.color }}>
                          {r.workDays}
                        </span>
                        <span style={{ fontSize:10, color:'#555', marginLeft:3 }}>วัน</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ ...S.card, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:11, color:'#444', display:'flex', alignItems:'center', gap:5 }}>
          <Clock size={11}/> นับวันทำงาน — ไม่รวมวันอาทิตย์
        </span>
        <span style={{ fontSize:11, color:'#FF6666' }}>🔴 เกิน 7 วัน = ต้องดำเนินการ</span>
        <span style={{ fontSize:11, color:'#FCD34D' }}>🟡 5-7 วัน = ใกล้ครบ</span>
        <span style={{ fontSize:11, color:'#4ADE80' }}>🟢 น้อยกว่า 5 วัน = ปกติ</span>
      </div>
    </div>
  )
}

const S = {
  kpiGrid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 28px', marginBottom:14 },
  kpi:        { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'14px 16px' },
  kpiLabel:   { fontSize:11, color:'#555', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' },
  kpiVal:     { fontSize:26, fontWeight:600, letterSpacing:'-0.5px', lineHeight:1 },
  kpiSub:     { fontSize:11, color:'#444', marginTop:5 },
  alertBanner:{ display:'flex', alignItems:'center', gap:10, background:'#CC000012',
                border:'1px solid #CC000030', borderRadius:10, padding:'11px 16px',
                marginBottom:12, marginLeft:28, marginRight:28 },
  card:       { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
                padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:       { fontSize:10, padding:'2px 8px', borderRadius:20, background:'#CC000020',
                color:'#CC0000', fontFamily:'var(--mono)' },
  table:      { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:         { padding:'8px 10px', textAlign:'left', color:'#444', fontSize:11,
                textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:         { padding:'8px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  pill:       { display:'inline-block', fontSize:11, fontWeight:500, padding:'2px 9px', borderRadius:20 },
}
