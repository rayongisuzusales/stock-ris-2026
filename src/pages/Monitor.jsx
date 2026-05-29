import { useMemo } from 'react'
import { AlertTriangle, Clock, CheckCircle, MapPin } from 'lucide-react'
import { useStock } from '../context/StockContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'

const BRANCHES = ['ทั้งหมด','PD','RY','MP','NK','BK','CK','FC','FR']

export default function Monitor() {
  const { allocated, getWorkingDays } = useStock()
  const { user } = useAuth()

  // กรองตาม branch ถ้าเป็น manager
  const myAllocated = useMemo(() => {
    if (user?.role === 'manager') return allocated.filter(a => a.branch === user.branch)
    return allocated
  }, [allocated, user])

  const withDays = useMemo(() =>
    myAllocated.map(a => ({ ...a, workDays: getWorkingDays(a.matchDate) }))
  , [myAllocated, getWorkingDays])

  const overdue  = withDays.filter(a => a.workDays > 7)
  const warning  = withDays.filter(a => a.workDays >= 5 && a.workDays <= 7)
  const normal   = withDays.filter(a => a.workDays < 5)

  const getStatusColor = (days) => {
    if (days > 7) return { bg:'#CC000018', color:'#FF6666', border:'#CC000030', label:'เกินกำหนด', icon:'🔴' }
    if (days >= 5) return { bg:'#F59E0B18', color:'#FCD34D', border:'#F59E0B30', label:'ใกล้ครบ', icon:'🟡' }
    return { bg:'#22C55E18', color:'#4ADE80', border:'#22C55E30', label:'ปกติ', icon:'🟢' }
  }

  return (
    <div className="page-wrap">
      <PageHeader
        title="Monitor สต๊อก"
        subtitle={`รถที่สาขาครอบครองอยู่ — นับวันทำงาน ไม่รวมวันอาทิตย์`}
        lastSync={new Date().toLocaleDateString('th-TH')}
      />

      {/* KPI summary */}
      <div className="kpi-grid" style={styles.kpiGrid}>
        <div style={{ ...styles.kpi, borderColor:'#CC000030' }}>
          <div style={styles.kpiLabel}>เกินกำหนด &gt;7 วัน</div>
          <div style={{ ...styles.kpiValue, color:'#FF6666' }}>{overdue.length}</div>
          <div style={styles.kpiSub}>คัน 🔴</div>
        </div>
        <div style={{ ...styles.kpi, borderColor:'#F59E0B30' }}>
          <div style={styles.kpiLabel}>ใกล้ครบ 5–7 วัน</div>
          <div style={{ ...styles.kpiValue, color:'#FCD34D' }}>{warning.length}</div>
          <div style={styles.kpiSub}>คัน 🟡</div>
        </div>
        <div style={{ ...styles.kpi, borderColor:'#22C55E30' }}>
          <div style={styles.kpiLabel}>ปกติ &lt;5 วัน</div>
          <div style={{ ...styles.kpiValue, color:'#4ADE80' }}>{normal.length}</div>
          <div style={styles.kpiSub}>คัน 🟢</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}>ทั้งหมดที่ครอบครอง</div>
          <div style={{ ...styles.kpiValue, color:'#F0F0F0' }}>{withDays.length}</div>
          <div style={styles.kpiSub}>คัน</div>
        </div>
      </div>

      {/* Overdue alert banner */}
      {overdue.length > 0 && (
        <div className="page-section" style={styles.alertBanner}>
          <AlertTriangle size={16} style={{ color:'#FF6666', flexShrink:0 }} />
          <span style={{ fontSize:13, color:'#FF6666', fontWeight:500 }}>
            มีรถ {overdue.length} คัน ที่ครอบครองเกิน 7 วันทำงาน — กรุณาดำเนินการ
          </span>
        </div>
      )}

      {/* Table */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>รายการรถที่สาขาครอบครอง</span>
          <span style={styles.chip}>{withDays.length} คัน</span>
        </div>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['สถานะ','รุ่น','เลขเครื่อง','สาขา','SC','วันที่แมท','วันทำงาน','หมายเหตุ'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...withDays].sort((a,b) => b.workDays - a.workDays).map((a, i) => {
                const s = getStatusColor(a.workDays)
                return (
                  <tr key={a.id} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={styles.td}>
                      <span style={{ ...styles.pill, background:s.bg, color:s.color, borderColor:s.border }}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color:'#D0D0D0', fontWeight:500, maxWidth:180 }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.model}
                      </div>
                      <div style={{ fontSize:10, color:'#555', fontFamily:'var(--mono)' }}>{a.code}</div>
                    </td>
                    <td style={{ ...styles.td, fontFamily:'var(--mono)', fontSize:11 }}>{a.engineNo || '—'}</td>
                    <td style={{ ...styles.td, fontWeight:600, color:'#CC0000', fontFamily:'var(--mono)' }}>{a.branch}</td>
                    <td style={{ ...styles.td, color:'#888' }}>{a.sc || <span style={{ color:'#444' }}>ยังไม่ลง SC</span>}</td>
                    <td style={{ ...styles.td, fontFamily:'var(--mono)', fontSize:11 }}>{a.matchDate}</td>
                    <td style={{ ...styles.td, textAlign:'center' }}>
                      <span style={{ fontSize:14, fontWeight:700, fontFamily:'var(--mono)', color:s.color }}>
                        {a.workDays}
                      </span>
                      <span style={{ fontSize:10, color:'#555', marginLeft:3 }}>วัน</span>
                    </td>
                    <td style={styles.td}>
                      {a.workDays > 7 && (
                        <span style={{ fontSize:11, color:'#FF6666' }}>⚠ เกินกำหนด</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {withDays.length === 0 && (
                <tr><td colSpan={8} style={{ ...styles.td, textAlign:'center', color:'#333', padding:40 }}>
                  ไม่มีรถที่ครอบครองอยู่
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="page-section" style={{ ...styles.card, display:'flex', gap:16, flexWrap:'wrap' }}>
        <div style={styles.legendTitle}>หมายเหตุการนับวัน:</div>
        <span style={styles.legendItem}><Clock size={11}/> นับวันทำงาน ไม่รวมวันอาทิตย์</span>
        <span style={styles.legendItem}>🔴 เกิน 7 วัน = ต้องดำเนินการ</span>
        <span style={styles.legendItem}>🟡 5-7 วัน = ใกล้ครบกำหนด</span>
        <span style={styles.legendItem}>🟢 &lt;5 วัน = ปกติ</span>
      </div>
    </div>
  )
}

const styles = {
  kpiGrid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 28px', marginBottom:16 },
  kpi:        { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'14px 16px' },
  kpiLabel:   { fontSize:11, color:'#555', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' },
  kpiValue:   { fontSize:26, fontWeight:600, letterSpacing:'-0.5px', lineHeight:1 },
  kpiSub:     { fontSize:11, color:'#444', marginTop:5 },
  alertBanner:{ display:'flex', alignItems:'center', gap:10, background:'#CC000012',
                border:'1px solid #CC000030', borderRadius:10, padding:'12px 16px',
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
  pill:       { display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:500,
                padding:'3px 9px', borderRadius:20, border:'1px solid transparent' },
  legendTitle:{ fontSize:11, color:'#555' },
  legendItem: { fontSize:11, color:'#666', display:'flex', alignItems:'center', gap:5 },
}
