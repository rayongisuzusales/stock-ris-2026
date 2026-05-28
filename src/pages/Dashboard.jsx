import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchMyStockSummary, MOCK_MONTHLY, MOCK_MONTHLY_BRANCH, MOCK_STOCK } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'
import KpiCard from '../components/KpiCard.jsx'

const BRANCH_COLS = ['#CC0000','#FF4444','#FF6666','#FF8888','#FFaaaa','#FFcccc','#FF3333','#dd1111']

export default function Dashboard() {
  const [stock,   setStock]   = useState([])
  const [loading, setLoading] = useState(true)
  const monthly = MOCK_MONTHLY
  const branchData = MOCK_MONTHLY_BRANCH['พ.ค. 69'] || []
  const totalStock = stock.reduce((s, r) => s + r.qty, 0)

  useEffect(() => {
    fetchMyStockSummary()
      .then(d => { setStock(d); setLoading(false) })
      .catch(() => { setStock(MOCK_STOCK); setLoading(false) })
  }, [])

  const refresh = () => {
    setLoading(true)
    fetchMyStockSummary()
      .then(d => { setStock(d); setLoading(false) })
      .catch(() => { setStock(MOCK_STOCK); setLoading(false) })
  }

  const top6 = [...stock].sort((a,b) => b.qty - a.qty).slice(0, 6)

  return (
    <div style={styles.page}>
      <PageHeader
        title="ภาพรวมสต๊อค"
        subtitle="ระยองอีซูซุเซลส์ จำกัด — ข้อมูลจาก Google Sheet: Stock RIS 2026"
        onRefresh={refresh}
        lastSync="27/5/69 · 16:42 น."
      />

      {/* KPI Row */}
      <div style={styles.kpiGrid}>
        <KpiCard label="สต๊อก MY26 ทั้งหมด" value={loading ? '…' : totalStock} sub="P-UP + Mu-X" accent="#CC0000" color="#CC0000" />
        <KpiCard label="รอเปิดสัญญา พ.ค." value="31" sub="P-UP 31 คัน" accent="#F59E0B" color="#F59E0B" />
        <KpiCard label="เปิดสัญญาแล้ว พ.ค." value="74" sub="P-UP 61 / Mu-X 13" accent="#22C55E" color="#22C55E" />
        <KpiCard label="ยอดรวม YTD 2569" value="599" sub="ม.ค.–พ.ค. 69" accent="#3B82F6" color="#3B82F6" />
      </div>

      <div style={styles.twoCol}>
        {/* Monthly chart */}
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>ยอดเปิดสัญญา P-UP+Mu-X รายเดือน</span>
            <span style={styles.chip}>ปี 2569</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[...monthly].reverse()} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'#999' }}
                itemStyle={{ color:'#F0F0F0' }}
              />
              <Bar dataKey="total" radius={[4,4,0,0]} name="รวม">
                {[...monthly].reverse().map((entry, i) => (
                  <Cell key={i} fill={i === [...monthly].reverse().length - 1 ? '#CC000060' : '#CC0000'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top stock models */}
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>รุ่นที่มีสต๊อกมากที่สุด</span>
            <span style={styles.chip}>MY26</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {top6.map((item, i) => (
              <div key={item.id} style={styles.stockRow}>
                <span style={styles.rankNum}>{String(i+1).padStart(2,'0')}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={styles.modelName}>{item.model}</div>
                  <div style={{ ...styles.barBg }}>
                    <div style={{ ...styles.barFill, width: `${(item.qty / top6[0].qty) * 100}%` }} />
                  </div>
                </div>
                <span style={styles.qtyBadge}>{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch table */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>ยอดตัดสต๊อกแยกสาขา — พฤษภาคม 2569</span>
          <span style={styles.chip}>P-UP + Mu-X</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['สาขา','P-UP ขอรถ','P-UP รถลง','รอเปิดสัญญา','เปิดสัญญาแล้ว','Mu-X ขอรถ','Mu-X เปิดสัญญา','รวมเปิดสัญญา'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branchData.map((r, i) => (
                <tr key={r.branch} style={{ background: i%2===0 ? 'transparent' : '#0A0A0A' }}>
                  <td style={{ ...styles.td, fontWeight:600, color:'#F0F0F0', fontFamily:'var(--mono)' }}>{r.branch}</td>
                  <td style={styles.tdNum}>{r.pickup}</td>
                  <td style={styles.tdNum}>{r.pickup - (r.waitP > 0 ? r.waitP : 0)}</td>
                  <td style={{ ...styles.tdNum, color:'#F59E0B' }}>{r.waitP}</td>
                  <td style={{ ...styles.tdNum, color:'#22C55E' }}>{r.pickup - r.waitP}</td>
                  <td style={styles.tdNum}>{r.mux}</td>
                  <td style={{ ...styles.tdNum, color:'#22C55E' }}>{r.mux - r.waitM}</td>
                  <td style={{ ...styles.tdNum, fontWeight:600, color:'#CC0000', fontSize:13 }}>{r.total}</td>
                </tr>
              ))}
              <tr style={{ background:'#1A1A1A', borderTop:'1px solid #2A2A2A' }}>
                <td style={{ ...styles.td, fontWeight:700, color:'#F0F0F0' }}>รวม</td>
                {[
                  branchData.reduce((s,r)=>s+r.pickup,0),
                  branchData.reduce((s,r)=>s+(r.pickup - (r.waitP>0?r.waitP:0)),0),
                  branchData.reduce((s,r)=>s+r.waitP,0),
                  branchData.reduce((s,r)=>s+(r.pickup-r.waitP),0),
                  branchData.reduce((s,r)=>s+r.mux,0),
                  branchData.reduce((s,r)=>s+(r.mux-r.waitM),0),
                  branchData.reduce((s,r)=>s+r.total,0),
                ].map((v, i) => (
                  <td key={i} style={{ ...styles.tdNum, fontWeight:700,
                    color: i===6 ? '#CC0000' : i===2 ? '#F59E0B' : i===3||i===5 ? '#22C55E' : '#F0F0F0' }}>
                    {v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page:   { padding:'0 0 32px', minHeight:'100vh' },
  kpiGrid:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 28px', marginBottom:20 },
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'0 28px', marginBottom:14 },
  card:   { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'16px 18px', marginBottom:14, marginLeft:28, marginRight:28 },
  cardHead:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  cardTitle:{ fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:   { fontSize:10, padding:'2px 8px', borderRadius:20, background:'#CC000020', color:'#CC0000', fontFamily:'var(--mono)' },
  table:  { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:     { padding:'8px 12px', textAlign:'left', color:'#444', fontSize:11, letterSpacing:'0.3px', textTransform:'uppercase', borderBottom:'1px solid #1E1E1E' },
  td:     { padding:'8px 12px', color:'#888', borderBottom:'1px solid #141414' },
  tdNum:  { padding:'8px 12px', textAlign:'right', color:'#888', borderBottom:'1px solid #141414', fontFamily:'var(--mono)', fontSize:13 },
  stockRow:{ display:'flex', alignItems:'center', gap:10 },
  rankNum: { fontSize:11, color:'#333', fontFamily:'var(--mono)', width:20, flexShrink:0 },
  modelName:{ fontSize:12, color:'#C0C0C0', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  barBg:  { height:3, background:'#1E1E1E', borderRadius:2 },
  barFill:{ height:'100%', background:'#CC0000', borderRadius:2, transition:'width .5s ease' },
  qtyBadge:{ fontSize:13, fontWeight:600, color:'#CC0000', fontFamily:'var(--mono)', minWidth:20, textAlign:'right' },
}
