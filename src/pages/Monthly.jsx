import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { MOCK_MONTHLY, MOCK_MONTHLY_BRANCH } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'

const MONTHS = ['พ.ค. 69','เม.ย. 69','มี.ค. 69','ก.พ. 69','ม.ค. 69']

export default function Monthly() {
  const [selMonth, setSelMonth] = useState('พ.ค. 69')
  const monthly    = MOCK_MONTHLY
  const branchData = MOCK_MONTHLY_BRANCH[selMonth] || MOCK_MONTHLY_BRANCH['พ.ค. 69'] || []

  const chartData = [...monthly].reverse().map(m => ({
    name: m.name.replace(' 69',''),
    'P-UP': m.pickup,
    'Mu-X': m.mux,
  }))

  return (
    <div className="page-wrap">
      <PageHeader title="รายงานรายเดือน" subtitle="ยอดตัดสต๊อก P-UP + Mu-X" lastSync="27/5/69" />

      {/* Chart */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>ยอดเปิดสัญญา ม.ค.–พ.ค. 69</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={3} barCategoryGap="32%">
            <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
              labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
            <Legend wrapperStyle={{ fontSize:12, color:'#777' }} />
            <Bar dataKey="P-UP" fill="#CC0000" radius={[3,3,0,0]} />
            <Bar dataKey="Mu-X" fill="#3B82F6" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Month pills */}
      <div className="month-pills" style={styles.pills}>
        {monthly.map(m => (
          <button key={m.name} className="month-card"
            onClick={() => setSelMonth(m.name)}
            style={{ ...styles.monthCard, ...(selMonth===m.name ? styles.monthOn : {}) }}>
            <div style={{ fontSize:10, color:'#555', marginBottom:3 }}>{m.name}</div>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:'var(--mono)',
              color: selMonth===m.name ? '#CC0000' : '#F0F0F0', lineHeight:1 }}>{m.total}</div>
            <div style={{ fontSize:10, color:'#444', marginTop:2 }}>P-UP {m.pickup}</div>
          </button>
        ))}
      </div>

      {/* Branch detail */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>แยกสาขา — {selMonth}</span>
          <span style={styles.chip}>กดเดือนด้านบน</span>
        </div>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['สาขา','P-UP ขอ','รอ','เปิดแล้ว','Mu-X ขอ','Mu-X เปิด','รวม'].map(h => (
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
                  <td style={{ ...styles.tdn, color:'#22C55E' }}>{r.mux - r.waitM}</td>
                  <td style={{ ...styles.tdn, fontWeight:700, color:'#CC0000' }}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card:      { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
               padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:  { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle: { fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:      { fontSize:10, color:'#444' },
  pills:     { display:'flex', gap:8, padding:'0 28px', marginBottom:12, overflowX:'auto',
               paddingBottom:4 },
  monthCard: { flex:'0 0 auto', background:'#111', border:'1px solid #1E1E1E',
               borderRadius:10, padding:'10px 14px', textAlign:'left', cursor:'pointer',
               minWidth:100 },
  monthOn:   { border:'1px solid #CC000040', background:'#CC000010' },
  table:     { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:        { padding:'7px 10px', textAlign:'left', color:'#444', fontSize:11,
               textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:        { padding:'7px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  tdn:       { padding:'7px 10px', textAlign:'right', color:'#888',
               borderBottom:'1px solid #0F0F0F', fontFamily:'var(--mono)', fontSize:12, whiteSpace:'nowrap' },
}
