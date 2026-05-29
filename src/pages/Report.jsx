import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStock, countWorkingDays } from '../context/StockContext.jsx'
import { MOCK_MONTHLY, MOCK_MONTHLY_BRANCH } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'
import { Download } from 'lucide-react'

const BRANCHES = ['PD','RY','MP','NK','BK','CK','FC','FR']

const QUARTERS = [
  { label:'Q1 (ม.ค.–มี.ค.)',  months:[1,2,3] },
  { label:'Q2 (เม.ย.–มิ.ย.)', months:[4,5,6] },
  { label:'Q3 (ก.ค.–ก.ย.)',   months:[7,8,9] },
  { label:'Q4 (ต.ค.–ธ.ค.)',   months:[10,11,12] },
]

export default function Report() {
  const { allocated, getWorkingDays } = useStock()

  const [mode,      setMode]      = useState('monthly')   // monthly | quarterly | custom
  const [selMonth,  setSelMonth]  = useState('5')
  const [selQ,      setSelQ]      = useState('1')
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [viewBy,    setViewBy]    = useState('branch')     // branch | sc | overview

  // ── คำนวณรถค้าง (ครอบครอง > 0 วัน ณ ปัจจุบัน) ──
  const pendingAll = useMemo(() =>
    allocated.map(a => ({ ...a, workDays: getWorkingDays(a.matchDate) }))
  , [allocated, getWorkingDays])

  // ค้าง by branch
  const pendingByBranch = useMemo(() => {
    return BRANCHES.map(b => ({
      branch: b,
      total:  pendingAll.filter(a => a.branch===b).length,
      overdue:pendingAll.filter(a => a.branch===b && a.workDays>7).length,
      noSC:   pendingAll.filter(a => a.branch===b && !a.sc).length,
    }))
  }, [pendingAll])

  // ค้าง by SC
  const pendingBySC = useMemo(() => {
    const map = {}
    pendingAll.filter(a=>a.sc).forEach(a => {
      if (!map[a.sc]) map[a.sc] = { sc:a.sc, total:0, overdue:0 }
      map[a.sc].total++
      if (a.workDays > 7) map[a.sc].overdue++
    })
    return Object.values(map).sort((a,b)=>b.total-a.total)
  }, [pendingAll])

  // ยอดขายรายเดือน (Mock)
  const monthlyData = MOCK_MONTHLY.map(m=>({ ...m, name:m.name.replace(' 69','') }))

  const branchChartData = pendingByBranch.filter(b=>b.total>0).map(b=>({
    name: b.branch,
    'ทั้งหมด': b.total,
    'เกินกำหนด': b.overdue,
  }))

  const exportCSV = () => {
    const rows = [
      ['สาขา','รถทั้งหมด','เกินกำหนด','ยังไม่ลง SC'],
      ...pendingByBranch.map(b => [b.branch, b.total, b.overdue, b.noSC])
    ]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `stock_report_${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  return (
    <div className="page-wrap">
      <PageHeader title="รายงานสรุปผล" subtitle="สถานะรถค้าง ภาพรวม รายสาขา และรายผู้ขาย" />

      {/* Filter bar */}
      <div className="toolbar-wrap" style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <span style={{ fontSize:11, color:'#555', marginRight:6 }}>ช่วงเวลา:</span>
          {[['monthly','รายเดือน'],['quarterly','รายไตรมาส'],['custom','กำหนดเอง']].map(([v,l])=>(
            <button key={v} onClick={()=>setMode(v)}
              style={{ ...styles.filterBtn, ...(mode===v?styles.filterOn:{}) }}>{l}</button>
          ))}
        </div>

        {mode==='monthly' && (
          <select style={styles.select} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
            {['1','2','3','4','5','6','7','8','9','10','11','12'].map(m=>(
              <option key={m} value={m}>เดือน {m}</option>
            ))}
          </select>
        )}
        {mode==='quarterly' && (
          <select style={styles.select} value={selQ} onChange={e=>setSelQ(e.target.value)}>
            {QUARTERS.map((q,i)=><option key={i} value={i+1}>{q.label}</option>)}
          </select>
        )}
        {mode==='custom' && (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type="date" style={styles.dateInput} value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
            <span style={{ color:'#555', fontSize:12 }}>ถึง</span>
            <input type="date" style={styles.dateInput} value={dateTo} onChange={e=>setDateTo(e.target.value)} />
          </div>
        )}

        <div style={styles.filterGroup}>
          <span style={{ fontSize:11, color:'#555', marginRight:6 }}>ดูตาม:</span>
          {[['overview','ภาพรวม'],['branch','สาขา'],['sc','SC']].map(([v,l])=>(
            <button key={v} onClick={()=>setViewBy(v)}
              style={{ ...styles.filterBtn, ...(viewBy===v?styles.filterOn:{}) }}>{l}</button>
          ))}
        </div>

        <button onClick={exportCSV} style={styles.exportBtn}>
          <Download size={13}/> Export CSV
        </button>
      </div>

      {/* KPI overview */}
      <div className="kpi-grid" style={styles.kpiGrid}>
        <div style={{ ...styles.kpi, borderColor:'#CC000030' }}>
          <div style={styles.kpiLabel}>รถค้างทั้งหมด</div>
          <div style={{ ...styles.kpiVal, color:'#FF6666' }}>{pendingAll.length}</div>
          <div style={styles.kpiSub}>คัน</div>
        </div>
        <div style={{ ...styles.kpi, borderColor:'#F59E0B30' }}>
          <div style={styles.kpiLabel}>เกินกำหนด 7 วัน</div>
          <div style={{ ...styles.kpiVal, color:'#FCD34D' }}>{pendingAll.filter(a=>a.workDays>7).length}</div>
          <div style={styles.kpiSub}>คัน</div>
        </div>
        <div style={{ ...styles.kpi, borderColor:'#A855F730' }}>
          <div style={styles.kpiLabel}>ยังไม่ลง SC</div>
          <div style={{ ...styles.kpiVal, color:'#C084FC' }}>{pendingAll.filter(a=>!a.sc).length}</div>
          <div style={styles.kpiSub}>คัน</div>
        </div>
        <div style={styles.kpi}>
          <div style={styles.kpiLabel}>ยอดขาย YTD 69</div>
          <div style={{ ...styles.kpiVal, color:'#F0F0F0' }}>599</div>
          <div style={styles.kpiSub}>คัน (Mock)</div>
        </div>
      </div>

      {/* Charts */}
      <div className="two-col-layout" style={styles.twoCol}>
        {/* Monthly trend */}
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>ยอดขายรายเดือน ปี 69</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={[...monthlyData].reverse()} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
              <Bar dataKey="total" radius={[3,3,0,0]} name="รวม">
                {[...monthlyData].reverse().map((_,i,arr)=>(
                  <Cell key={i} fill={i===arr.length-1?'#CC000055':'#CC0000'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending by branch */}
        <div style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>รถค้างแยกสาขา</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={branchChartData} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
              <Bar dataKey="ทั้งหมด" fill="#3B82F6" radius={[3,3,0,0]} />
              <Bar dataKey="เกินกำหนด" fill="#CC0000" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail table by branch */}
      {viewBy === 'branch' && (
        <div className="page-section" style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>รายละเอียดแยกสาขา</span>
          </div>
          <div className="table-scroll" style={{ overflowX:'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['สาขา','รถค้างทั้งหมด','เกินกำหนด >7 วัน','ยังไม่ลง SC','% เกินกำหนด'].map(h=>(
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingByBranch.map((b,i) => (
                  <tr key={b.branch} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={{ ...styles.td, fontWeight:600, color:'#F0F0F0', fontFamily:'var(--mono)' }}>{b.branch}</td>
                    <td style={{ ...styles.tdn }}>{b.total}</td>
                    <td style={{ ...styles.tdn, color: b.overdue>0?'#FF6666':'#888' }}>{b.overdue}</td>
                    <td style={{ ...styles.tdn, color: b.noSC>0?'#FCD34D':'#888' }}>{b.noSC}</td>
                    <td style={{ ...styles.tdn, color:'#888' }}>
                      {b.total>0 ? `${Math.round(b.overdue/b.total*100)}%` : '—'}
                    </td>
                  </tr>
                ))}
                <tr style={{ background:'#1A1A1A', borderTop:'1px solid #2A2A2A' }}>
                  <td style={{ ...styles.td, fontWeight:700 }}>รวม</td>
                  <td style={{ ...styles.tdn, fontWeight:700 }}>{pendingByBranch.reduce((s,b)=>s+b.total,0)}</td>
                  <td style={{ ...styles.tdn, fontWeight:700, color:'#FF6666' }}>{pendingByBranch.reduce((s,b)=>s+b.overdue,0)}</td>
                  <td style={{ ...styles.tdn, fontWeight:700, color:'#FCD34D' }}>{pendingByBranch.reduce((s,b)=>s+b.noSC,0)}</td>
                  <td style={styles.tdn}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail table by SC */}
      {viewBy === 'sc' && (
        <div className="page-section" style={styles.card}>
          <div style={styles.cardHead}>
            <span style={styles.cardTitle}>รายละเอียดแยก SC</span>
          </div>
          <div className="table-scroll" style={{ overflowX:'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['ชื่อ SC','รถค้างทั้งหมด','เกินกำหนด >7 วัน'].map(h=>(
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingBySC.length > 0 ? pendingBySC.map((s,i)=>(
                  <tr key={s.sc} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={{ ...styles.td, color:'#D0D0D0', fontWeight:500 }}>{s.sc}</td>
                    <td style={styles.tdn}>{s.total}</td>
                    <td style={{ ...styles.tdn, color: s.overdue>0?'#FF6666':'#888' }}>{s.overdue}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} style={{ ...styles.td, textAlign:'center', color:'#333', padding:30 }}>
                    ยังไม่มีข้อมูล SC
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview */}
      {viewBy === 'overview' && (
        <div className="page-section" style={styles.card}>
          <div style={styles.cardHead}><span style={styles.cardTitle}>รายการรถค้างทั้งหมด</span></div>
          <div className="table-scroll" style={{ overflowX:'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>{['รุ่น','สาขา','SC','วันแมท','วันทำงาน','สถานะ'].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[...pendingAll].sort((a,b)=>b.workDays-a.workDays).map((a,i)=>(
                  <tr key={a.id} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={{ ...styles.td, color:'#D0D0D0', fontWeight:500 }}>{a.model}</td>
                    <td style={{ ...styles.td, color:'#CC0000', fontFamily:'var(--mono)', fontWeight:600 }}>{a.branch}</td>
                    <td style={{ ...styles.td, color:'#888' }}>{a.sc||'—'}</td>
                    <td style={{ ...styles.td, fontFamily:'var(--mono)', fontSize:11 }}>{a.matchDate}</td>
                    <td style={{ ...styles.tdn, color:a.workDays>7?'#FF6666':a.workDays>=5?'#FCD34D':'#4ADE80',
                      fontWeight:700 }}>{a.workDays}</td>
                    <td style={styles.td}>
                      <span style={{ fontSize:11, color:a.workDays>7?'#FF6666':'#888' }}>
                        {a.workDays>7?'⚠ เกินกำหนด':a.status==='sc_assigned'?'ลง SC แล้ว':'รอ SC'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  toolbar:    { display:'flex', alignItems:'center', gap:10, padding:'0 28px 14px', flexWrap:'wrap' },
  filterGroup:{ display:'flex', alignItems:'center', gap:4 },
  filterBtn:  { padding:'5px 11px', background:'transparent', border:'1px solid #222', borderRadius:7, color:'#555', fontSize:12, cursor:'pointer' },
  filterOn:   { background:'#CC000018', border:'1px solid #CC000040', color:'#FF6666' },
  select:     { appearance:'none', background:'#111', border:'1px solid #222', borderRadius:8,
                padding:'6px 12px', color:'#888', fontSize:13, fontFamily:'var(--font)', cursor:'pointer', outline:'none' },
  dateInput:  { background:'#111', border:'1px solid #222', borderRadius:7, padding:'6px 10px',
                color:'#888', fontSize:12, fontFamily:'var(--font)', outline:'none' },
  exportBtn:  { display:'flex', alignItems:'center', gap:5, padding:'6px 13px',
                background:'transparent', border:'1px solid #2A2A2A', borderRadius:7,
                color:'#888', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' },
  kpiGrid:    { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 28px', marginBottom:16 },
  kpi:        { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'14px 16px' },
  kpiLabel:   { fontSize:11, color:'#555', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' },
  kpiVal:     { fontSize:26, fontWeight:600, letterSpacing:'-0.5px', lineHeight:1 },
  kpiSub:     { fontSize:11, color:'#444', marginTop:5 },
  twoCol:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'0 28px', marginBottom:12 },
  card:       { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
                padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0' },
  table:      { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:         { padding:'8px 10px', textAlign:'left', color:'#444', fontSize:11,
                textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:         { padding:'8px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  tdn:        { padding:'8px 10px', textAlign:'right', color:'#888',
                borderBottom:'1px solid #0F0F0F', fontFamily:'var(--mono)', fontSize:12, whiteSpace:'nowrap' },
}
