import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStock } from '../context/StockContext.jsx'
import { MOCK_MONTHLY } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'
import { Download } from 'lucide-react'

const BRANCHES  = ['PD','RY','MP','NK','BK','CK','FC','FR']
const QUARTERS  = [
  { label:'Q1 (ม.ค.–มี.ค.)', months:[1,2,3]   },
  { label:'Q2 (เม.ย.–มิ.ย.)',months:[4,5,6]   },
  { label:'Q3 (ก.ค.–ก.ย.)',  months:[7,8,9]   },
  { label:'Q4 (ต.ค.–ธ.ค.)',  months:[10,11,12] },
]

export default function Report() {
  const { requests, inventory, getWorkingDays } = useStock()

  const [mode,     setMode]     = useState('monthly')
  const [selMonth, setSelMonth] = useState('5')
  const [selQ,     setSelQ]     = useState('0')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [viewBy,   setViewBy]   = useState('branch')

  // รถที่ match แล้ว (ยังไม่ completed) = "ค้าง"
  const pending = useMemo(() =>
    requests
      .filter(r => r.matchDate && r.status !== 'completed')
      .map(r => ({ ...r, workDays: getWorkingDays(r.matchDate) }))
  , [requests, getWorkingDays])

  // สรุปรายสาขา
  const byBranch = useMemo(() =>
    BRANCHES.map(b => ({
      branch:  b,
      total:   pending.filter(r => r.branch === b).length,
      overdue: pending.filter(r => r.branch === b && r.workDays > 7).length,
      noSC:    pending.filter(r => r.branch === b && !r.sc).length,
    }))
  , [pending])

  // สรุปราย SC
  const bySC = useMemo(() => {
    const map = {}
    pending.filter(r => r.scName).forEach(r => {
      if (!map[r.scName]) map[r.scName] = { sc:r.scName, total:0, overdue:0 }
      map[r.scName].total++
      if (r.workDays > 7) map[r.scName].overdue++
    })
    return Object.values(map).sort((a,b) => b.total - a.total)
  }, [pending])

  const monthly   = MOCK_MONTHLY
  const chartData = [...monthly].reverse().map(m => ({ name:m.name.replace(' 69',''), total:m.total }))
  const branchChart = byBranch.filter(b => b.total > 0).map(b => ({
    name: b.branch, 'ทั้งหมด': b.total, 'เกินกำหนด': b.overdue,
  }))

  const exportCSV = () => {
    const rows = [
      ['สาขา','รถค้างทั้งหมด','เกินกำหนด >7 วัน','ยังไม่ลง SC'],
      ...byBranch.map(b => [b.branch, b.total, b.overdue, b.noSC])
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type:'text/csv;charset=utf-8;' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `stock_report_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div className="page-wrap">
      <PageHeader title="สรุปรายงาน" subtitle="สถานะรถค้าง ภาพรวม รายสาขา และรายผู้ขาย" />

      {/* Filter bar */}
      <div className="toolbar-wrap" style={S.toolbar}>
        <div style={S.fgroup}>
          <span style={S.flabel}>ช่วงเวลา:</span>
          {[['monthly','รายเดือน'],['quarterly','รายไตรมาส'],['custom','กำหนดเอง']].map(([v,l]) => (
            <button key={v} onClick={() => setMode(v)}
              style={{ ...S.filterBtn, ...(mode===v ? S.filterOn : {}) }}>{l}</button>
          ))}
        </div>

        {mode === 'monthly' && (
          <select style={S.select} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
            {[['1','ม.ค.'],['2','ก.พ.'],['3','มี.ค.'],['4','เม.ย.'],['5','พ.ค.'],
              ['6','มิ.ย.'],['7','ก.ค.'],['8','ส.ค.'],['9','ก.ย.'],['10','ต.ค.'],
              ['11','พ.ย.'],['12','ธ.ค.']].map(([v,l]) => (
              <option key={v} value={v}>{l} 69</option>
            ))}
          </select>
        )}
        {mode === 'quarterly' && (
          <select style={S.select} value={selQ} onChange={e => setSelQ(e.target.value)}>
            {QUARTERS.map((q,i) => <option key={i} value={i}>{q.label}</option>)}
          </select>
        )}
        {mode === 'custom' && (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type="date" style={S.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <span style={{ color:'#555', fontSize:12 }}>ถึง</span>
            <input type="date" style={S.dateInput} value={dateTo}   onChange={e => setDateTo(e.target.value)} />
          </div>
        )}

        <div style={S.fgroup}>
          <span style={S.flabel}>ดูตาม:</span>
          {[['overview','ภาพรวม'],['branch','สาขา'],['sc','SC']].map(([v,l]) => (
            <button key={v} onClick={() => setViewBy(v)}
              style={{ ...S.filterBtn, ...(viewBy===v ? S.filterOn : {}) }}>{l}</button>
          ))}
        </div>

        <button onClick={exportCSV} style={S.exportBtn}>
          <Download size={13}/> Export CSV
        </button>
      </div>

      {/* KPI */}
      <div className="kpi-grid" style={S.kpiGrid}>
        <div style={{ ...S.kpi, borderColor:'#CC000030' }}>
          <div style={S.kpiLabel}>รถค้างทั้งหมด</div>
          <div style={{ ...S.kpiVal, color:'#FF6666' }}>{pending.length}</div>
          <div style={S.kpiSub}>คัน</div>
        </div>
        <div style={{ ...S.kpi, borderColor:'#F59E0B30' }}>
          <div style={S.kpiLabel}>เกินกำหนด &gt;7 วัน</div>
          <div style={{ ...S.kpiVal, color:'#FCD34D' }}>{pending.filter(r=>r.workDays>7).length}</div>
          <div style={S.kpiSub}>คัน</div>
        </div>
        <div style={{ ...S.kpi, borderColor:'#A855F730' }}>
          <div style={S.kpiLabel}>ยังไม่ลง SC</div>
          <div style={{ ...S.kpiVal, color:'#C084FC' }}>{pending.filter(r=>!r.scName).length}</div>
          <div style={S.kpiSub}>คัน</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>ยอดขาย YTD 69</div>
          <div style={{ ...S.kpiVal, color:'#F0F0F0' }}>599</div>
          <div style={S.kpiSub}>คัน</div>
        </div>
      </div>

      {/* Charts */}
      <div className="two-col-layout" style={S.twoCol}>
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>ยอดขายรายเดือน ปี 69</span></div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
              <Bar dataKey="total" radius={[3,3,0,0]}>
                {chartData.map((_,i,arr) => (
                  <Cell key={i} fill={i===arr.length-1 ? '#CC000055' : '#CC0000'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>รถค้างแยกสาขา</span></div>
          {branchChart.length === 0 ? (
            <div style={{ textAlign:'center', color:'#333', padding:'40px 0', fontSize:13 }}>ไม่มีรถค้าง</div>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={branchChart} barCategoryGap="20%">
                <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={20} />
                <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
                  labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
                <Bar dataKey="ทั้งหมด"   fill="#3B82F6" radius={[3,3,0,0]} />
                <Bar dataKey="เกินกำหนด" fill="#CC0000" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detail tables */}
      {viewBy === 'branch' && (
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>รายละเอียดแยกสาขา</span></div>
          <div className="table-scroll" style={{ overflowX:'auto' }}>
            <table style={S.table}>
              <thead><tr>
                {['สาขา','รถค้างทั้งหมด','เกินกำหนด >7 วัน','ยังไม่ลง SC','% เกินกำหนด'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {byBranch.map((b, i) => (
                  <tr key={b.branch} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={{ ...S.td, fontWeight:600, color:'#F0F0F0', fontFamily:'var(--mono)' }}>{b.branch}</td>
                    <td style={S.tdn}>{b.total}</td>
                    <td style={{ ...S.tdn, color: b.overdue>0?'#FF6666':'#888' }}>{b.overdue}</td>
                    <td style={{ ...S.tdn, color: b.noSC>0?'#FCD34D':'#888' }}>{b.noSC}</td>
                    <td style={S.tdn}>
                      {b.total > 0 ? `${Math.round(b.overdue/b.total*100)}%` : '—'}
                    </td>
                  </tr>
                ))}
                <tr style={{ background:'#1A1A1A', borderTop:'1px solid #2A2A2A' }}>
                  <td style={{ ...S.td, fontWeight:700 }}>รวม</td>
                  <td style={{ ...S.tdn, fontWeight:700 }}>{byBranch.reduce((s,b)=>s+b.total,0)}</td>
                  <td style={{ ...S.tdn, fontWeight:700, color:'#FF6666' }}>{byBranch.reduce((s,b)=>s+b.overdue,0)}</td>
                  <td style={{ ...S.tdn, fontWeight:700, color:'#FCD34D' }}>{byBranch.reduce((s,b)=>s+b.noSC,0)}</td>
                  <td style={S.tdn}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewBy === 'sc' && (
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>รายละเอียดแยก SC</span></div>
          <div className="table-scroll" style={{ overflowX:'auto' }}>
            <table style={S.table}>
              <thead><tr>
                {['ชื่อ SC','รถค้างทั้งหมด','เกินกำหนด >7 วัน'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {bySC.length === 0 ? (
                  <tr><td colSpan={3} style={{ ...S.td, textAlign:'center', color:'#333', padding:32 }}>
                    ยังไม่มีข้อมูล SC
                  </td></tr>
                ) : bySC.map((s, i) => (
                  <tr key={s.sc} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={{ ...S.td, color:'#D0D0D0', fontWeight:500 }}>{s.sc}</td>
                    <td style={S.tdn}>{s.total}</td>
                    <td style={{ ...S.tdn, color: s.overdue>0?'#FF6666':'#888' }}>{s.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewBy === 'overview' && (
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>รายการรถค้างทั้งหมด</span>
            <span style={S.chip}>{pending.length} รายการ</span>
          </div>
          {pending.length === 0 ? (
            <div style={{ textAlign:'center', color:'#333', padding:'32px 0', fontSize:13 }}>
              ไม่มีรถค้าง
            </div>
          ) : (
            <div className="table-scroll" style={{ overflowX:'auto' }}>
              <table style={S.table}>
                <thead><tr>
                  {['ลูกค้า','รุ่น','สี','สาขา','SC','วันแมท','วันทำงาน','สถานะ'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[...pending].sort((a,b) => b.workDays-a.workDays).map((r, i) => (
                    <tr key={r.id} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                      <td style={{ ...S.td, color:'#D0D0D0' }}>{r.customerName}</td>
                      <td style={{ ...S.td, color:'#C0C0C0', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis' }}>{r.model}</td>
                      <td style={{ ...S.td, fontFamily:'var(--mono)' }}>{r.color?.split(' ')[0]}</td>
                      <td style={{ ...S.td, color:'#CC0000', fontFamily:'var(--mono)', fontWeight:600 }}>{r.branch}</td>
                      <td style={{ ...S.td, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis' }}>{r.scName||'—'}</td>
                      <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.matchDate}</td>
                      <td style={{ ...S.tdn,
                        color: r.workDays>7?'#FF6666':r.workDays>=5?'#FCD34D':'#4ADE80',
                        fontWeight:700 }}>{r.workDays}</td>
                      <td style={S.td}>
                        <span style={{ fontSize:11,
                          color: r.workDays>7?'#FF6666':r.status==='sc_assigned'?'#22C55E':'#888' }}>
                          {r.workDays>7 ? '⚠ เกินกำหนด' : r.status==='sc_assigned' ? 'ลง SC แล้ว' : 'รอ SC'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const S = {
  toolbar:   { display:'flex', alignItems:'center', gap:10, padding:'0 28px 14px', flexWrap:'wrap' },
  fgroup:    { display:'flex', alignItems:'center', gap:4 },
  flabel:    { fontSize:11, color:'#555', marginRight:4, whiteSpace:'nowrap' },
  filterBtn: { padding:'5px 11px', background:'transparent', border:'1px solid #222',
               borderRadius:7, color:'#555', fontSize:12, cursor:'pointer', whiteSpace:'nowrap' },
  filterOn:  { background:'#CC000018', border:'1px solid #CC000040', color:'#FF6666' },
  select:    { appearance:'none', background:'#111', border:'1px solid #222', borderRadius:8,
               padding:'6px 12px', color:'#888', fontSize:13, fontFamily:'var(--font)',
               cursor:'pointer', outline:'none' },
  dateInput: { background:'#111', border:'1px solid #222', borderRadius:7, padding:'6px 10px',
               color:'#888', fontSize:12, fontFamily:'var(--font)', outline:'none' },
  exportBtn: { display:'flex', alignItems:'center', gap:5, padding:'6px 13px',
               background:'transparent', border:'1px solid #2A2A2A', borderRadius:7,
               color:'#888', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' },
  kpiGrid:   { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 28px', marginBottom:14 },
  kpi:       { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'14px 16px' },
  kpiLabel:  { fontSize:11, color:'#555', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' },
  kpiVal:    { fontSize:26, fontWeight:600, letterSpacing:'-0.5px', lineHeight:1 },
  kpiSub:    { fontSize:11, color:'#444', marginTop:5 },
  twoCol:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'0 28px', marginBottom:12 },
  card:      { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
               padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:  { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle: { fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:      { fontSize:10, padding:'2px 8px', borderRadius:20, background:'#CC000020',
               color:'#CC0000', fontFamily:'var(--mono)' },
  table:     { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:        { padding:'8px 10px', textAlign:'left', color:'#444', fontSize:11,
               textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:        { padding:'8px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  tdn:       { padding:'8px 10px', textAlign:'right', color:'#888',
               borderBottom:'1px solid #0F0F0F', fontFamily:'var(--mono)', fontSize:12, whiteSpace:'nowrap' },
}
