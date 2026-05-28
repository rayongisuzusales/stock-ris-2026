import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MOCK_MONTHLY, MOCK_MONTHLY_BRANCH } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'

const MONTHS = ['พ.ค. 69','เม.ย. 69','มี.ค. 69','ก.พ. 69','ม.ค. 69']
const BRANCHES = ['RY','NK','MP','FR','BK','PD','CK','FC']

export default function Monthly() {
  const [selMonth, setSelMonth] = useState('พ.ค. 69')
  const monthly = MOCK_MONTHLY
  const branchData = MOCK_MONTHLY_BRANCH[selMonth] || MOCK_MONTHLY_BRANCH['พ.ค. 69'] || []

  const chartData = [...monthly].reverse().map(m => ({
    name: m.name.replace(' 69',''),
    'P-UP': m.pickup,
    'Mu-X': m.mux,
  }))

  return (
    <div style={styles.page}>
      <PageHeader
        title="รายงานรายเดือน"
        subtitle="ยอดตัดสต๊อก P-UP และ Mu-X แยกตามเดือนและสาขา"
        lastSync="27/5/69 · 16:42 น."
      />

      {/* Summary chart */}
      <div style={{ ...styles.card, margin:'0 28px 16px' }}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>ยอดเปิดสัญญา P-UP + Mu-X รายเดือน (ม.ค.–พ.ค. 69)</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={4} barCategoryGap="35%">
            <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
              labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
            <Legend wrapperStyle={{ fontSize:12, color:'#777' }} />
            <Bar dataKey="P-UP" fill="#CC0000" radius={[3,3,0,0]} />
            <Bar dataKey="Mu-X" fill="#3B82F6" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YTD summary */}
      <div style={styles.kpiRow}>
        {monthly.map(m => (
          <button key={m.name}
            onClick={() => setSelMonth(m.name)}
            style={{ ...styles.monthCard, ...(selMonth===m.name ? styles.monthActive : {}) }}>
            <div style={styles.monthName}>{m.name}</div>
            <div style={{ ...styles.monthTotal, color: selMonth===m.name ? '#CC0000' : '#F0F0F0' }}>{m.total}</div>
            <div style={styles.monthSub}>P-UP {m.pickup} · Mu-X {m.mux}</div>
          </button>
        ))}
      </div>

      {/* Branch detail */}
      <div style={{ ...styles.card, margin:'0 28px' }}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>ยอดแยกสาขา — {selMonth}</span>
          <span style={styles.chip}>คลิกเดือนด้านบนเพื่อเปลี่ยน</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['สาขา','P-UP ขอรถ','รอเลขเครื่อง','รถลงแล้ว','รอเปิดสัญญา','เปิดสัญญาแล้ว',
                  'Mu-X ขอรถ','Mu-X รอ','Mu-X เปิดแล้ว','รวมเปิดสัญญา'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branchData.map((r, i) => (
                <tr key={r.branch} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                  <td style={{ ...styles.td, fontWeight:600, color:'#F0F0F0', fontFamily:'var(--mono)' }}>{r.branch}</td>
                  <td style={styles.tdn}>{r.pickup}</td>
                  <td style={{ ...styles.tdn, color:'#F59E0B' }}>0</td>
                  <td style={styles.tdn}>{r.pickup}</td>
                  <td style={{ ...styles.tdn, color:'#F59E0B' }}>{r.waitP}</td>
                  <td style={{ ...styles.tdn, color:'#22C55E' }}>{r.pickup - r.waitP}</td>
                  <td style={styles.tdn}>{r.mux}</td>
                  <td style={{ ...styles.tdn, color:'#F59E0B' }}>{r.waitM}</td>
                  <td style={{ ...styles.tdn, color:'#22C55E' }}>{r.mux - r.waitM}</td>
                  <td style={{ ...styles.tdn, fontWeight:700, color:'#CC0000', fontSize:13 }}>{r.total}</td>
                </tr>
              ))}
              {branchData.length === 0 && (
                <tr><td colSpan={10} style={{ ...styles.td, textAlign:'center', color:'#333', padding:30 }}>
                  ไม่มีข้อมูลสำหรับเดือนนี้
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page:     { padding:'0 0 32px' },
  card:     { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'16px 18px' },
  cardHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  cardTitle:{ fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:     { fontSize:10, color:'#444' },
  kpiRow:   { display:'flex', gap:10, padding:'0 28px', marginBottom:14, overflowX:'auto' },
  monthCard:{ flex:'0 0 auto', background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
    padding:'12px 16px', textAlign:'left', cursor:'pointer', minWidth:120 },
  monthActive:{ border:'1px solid #CC000040', background:'#CC000010' },
  monthName:{ fontSize:11, color:'#555', marginBottom:4 },
  monthTotal:{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)', lineHeight:1 },
  monthSub: { fontSize:10, color:'#444', marginTop:3 },
  table:    { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:       { padding:'8px 12px', textAlign:'left', color:'#444', fontSize:11,
    textTransform:'uppercase', letterSpacing:'0.3px', borderBottom:'1px solid #1E1E1E' },
  td:       { padding:'8px 12px', color:'#888', borderBottom:'1px solid #141414' },
  tdn:      { padding:'8px 12px', textAlign:'right', color:'#888',
    borderBottom:'1px solid #141414', fontFamily:'var(--mono)', fontSize:13 },
}
