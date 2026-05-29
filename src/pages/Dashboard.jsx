import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { fetchMyStockSummary, MOCK_MONTHLY, MOCK_MONTHLY_BRANCH, MOCK_STOCK } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'
import KpiCard from '../components/KpiCard.jsx'

export default function Dashboard() {
  const [stock,   setStock]   = useState([])
  const [loading, setLoading] = useState(true)
  const monthly     = MOCK_MONTHLY
  const branchData  = MOCK_MONTHLY_BRANCH['พ.ค. 69'] || []
  const totalStock  = stock.reduce((s, r) => s + r.qty, 0)

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
  const chartData = [...monthly].reverse().map(m => ({
    name: m.name.replace(' 69',''),
    รวม: m.total,
  }))

  return (
    <div className="page-wrap">
      <PageHeader
        title="ภาพรวมสต๊อค"
        subtitle="ระยองอีซูซุเซลส์ จำกัด"
        onRefresh={refresh}
        lastSync="27/5/69"
      />

      {/* KPI */}
      <div className="kpi-grid" style={styles.kpiGrid}>
        <KpiCard label="สต๊อก MY26 ทั้งหมด" value={loading ? '…' : totalStock} sub="P-UP + Mu-X" accent="#CC0000" color="#CC0000" />
        <KpiCard label="รอเปิดสัญญา พ.ค." value="31" sub="P-UP 31 คัน" accent="#F59E0B" color="#F59E0B" />
        <KpiCard label="เปิดสัญญาแล้ว พ.ค." value="74" sub="P-UP 61 / Mu-X 13" accent="#22C55E" color="#22C55E" />
        <KpiCard label="ยอดรวม YTD 2569" value="599" sub="ม.ค.–พ.ค. 69" accent="#3B82F6" color="#3B82F6" />
      </div>

      {/* Charts 2-col → 1-col on mobile */}
      <div className="two-col-layout" style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>ยอดเปิดสัญญารายเดือน</span>
            <span style={styles.chip}>ปี 2569</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
              <Bar dataKey="รวม" radius={[4,4,0,0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length-1 ? '#CC000055' : '#CC0000'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>รุ่นที่มีสต๊อกมากที่สุด</span>
            <span style={styles.chip}>MY26</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {top6.map((item, i) => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:10, color:'#333', fontFamily:'var(--mono)', width:18, flexShrink:0 }}>
                  {String(i+1).padStart(2,'0')}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:'#C0C0C0', marginBottom:3, overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.model}</div>
                  <div style={{ height:3, background:'#1E1E1E', borderRadius:2 }}>
                    <div style={{ height:'100%', borderRadius:2, background:'#CC0000',
                      width:`${(item.qty/(top6[0]?.qty||1))*100}%` }} />
                  </div>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:'#CC0000',
                  fontFamily:'var(--mono)', minWidth:18, textAlign:'right' }}>{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Branch table */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>ยอดแยกสาขา — พ.ค. 69</span>
          <span style={styles.chip}>P-UP + Mu-X</span>
        </div>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['สาขา','ขอรถ','รอ','เปิดสัญญา','Mu-X','รวม'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branchData.map((r, i) => (
                <tr key={r.branch} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                  <td style={{ ...styles.td, fontWeight:600, color:'#F0F0F0', fontFamily:'var(--mono)' }}>{r.branch}</td>
                  <td style={styles.tdn}>{r.pickup}</td>
                  <td style={{ ...styles.tdn, color:'#F59E0B' }}>{r.waitP}</td>
                  <td style={{ ...styles.tdn, color:'#22C55E' }}>{r.pickup - r.waitP}</td>
                  <td style={styles.tdn}>{r.mux}</td>
                  <td style={{ ...styles.tdn, fontWeight:700, color:'#CC0000' }}>{r.total}</td>
                </tr>
              ))}
              <tr style={{ background:'#1A1A1A', borderTop:'1px solid #2A2A2A' }}>
                <td style={{ ...styles.td, fontWeight:700 }}>รวม</td>
                {[
                  branchData.reduce((s,r)=>s+r.pickup,0),
                  branchData.reduce((s,r)=>s+r.waitP,0),
                  branchData.reduce((s,r)=>s+(r.pickup-r.waitP),0),
                  branchData.reduce((s,r)=>s+r.mux,0),
                  branchData.reduce((s,r)=>s+r.total,0),
                ].map((v,i) => (
                  <td key={i} style={{ ...styles.tdn, fontWeight:700,
                    color: i===4?'#CC0000':i===1?'#F59E0B':i===2?'#22C55E':'#F0F0F0' }}>{v}</td>
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
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 28px', marginBottom:16 },
  twoCol:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'0 28px', marginBottom:12 },
  card:    { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'14px 16px',
             marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle:{ fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:    { fontSize:10, padding:'2px 8px', borderRadius:20, background:'#CC000020', color:'#CC0000', fontFamily:'var(--mono)' },
  table:   { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:      { padding:'7px 10px', textAlign:'left', color:'#444', fontSize:11,
             textTransform:'uppercase', letterSpacing:'0.3px', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:      { padding:'7px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  tdn:     { padding:'7px 10px', textAlign:'right', color:'#888',
             borderBottom:'1px solid #0F0F0F', fontFamily:'var(--mono)', fontSize:12, whiteSpace:'nowrap' },
}
