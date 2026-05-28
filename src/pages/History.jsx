import { useState, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { MOCK_HISTORY } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const BRANCHES = ['ทั้งหมด','RY','NK','MP','FR','BK','PD','CK','FC','FC']
const PAGE_SIZE = 20

export default function History() {
  const [search,  setSearch]  = useState('')
  const [branch,  setBranch]  = useState('ทั้งหมด')
  const [page,    setPage]    = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_HISTORY.filter(r => {
      const mQ = !q ||
        r.docNo.includes(q) ||
        r.engineNo.toLowerCase().includes(q) ||
        r.chassis.toLowerCase().includes(q) ||
        r.model.toLowerCase().includes(q) ||
        r.sc.toLowerCase().includes(q)
      const mB = branch === 'ทั้งหมด' || r.branch === branch
      return mQ && mB
    })
  }, [search, branch])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const shown = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  return (
    <div style={styles.page}>
      <PageHeader
        title="ประวัติการขายและตัดสต๊อก"
        subtitle="ข้อมูลตั้งแต่ ต.ค. 2565 — อ้างอิงจาก Sheet: TOTAL STOCK"
        lastSync="27/5/69"
      />

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={14} style={{ color:'#444' }} />
          <input
            style={styles.searchInput}
            placeholder="ค้นหา เลขเอกสาร / เลขเครื่อง / เลขแชสซี / ชื่อ SC / รุ่น..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div style={styles.selectWrap}>
          <select style={styles.select} value={branch} onChange={e => { setBranch(e.target.value); setPage(1) }}>
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>
          <ChevronDown size={12} style={{ color:'#444', pointerEvents:'none' }} />
        </div>
        <span style={styles.count}>{filtered.length} รายการ</span>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['เลขเอกสาร','รุ่น','สี','เลขเครื่อง','เลขแชสซี','สาขา',
                'วันที่รถลง','วันเปิดสัญญา','ชื่อ SC','สถานะ'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={r.id} style={{ background: i%2===0 ? 'transparent' : '#0A0A0A' }}>
                <td style={{ ...styles.td, fontFamily:'var(--mono)', color:'#888', fontSize:11 }}>{r.docNo || '—'}</td>
                <td style={{ ...styles.td, fontWeight:500, color:'#D0D0D0' }}>{r.model}</td>
                <td style={{ ...styles.td, fontFamily:'var(--mono)', color:'#666' }}>{r.color}</td>
                <td style={{ ...styles.td, fontFamily:'var(--mono)', color:'#888' }}>{r.engineNo || '—'}</td>
                <td style={{ ...styles.td, fontFamily:'var(--mono)', color:'#555', fontSize:11 }}>{r.chassis || '—'}</td>
                <td style={{ ...styles.td, fontWeight:600, color:'#CC0000', fontFamily:'var(--mono)' }}>{r.branch}</td>
                <td style={{ ...styles.td, color:'#666' }}>{r.entryDate || '—'}</td>
                <td style={{ ...styles.td, color:'#666' }}>{r.contractDate || '—'}</td>
                <td style={{ ...styles.td, color:'#888', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.sc || '—'}</td>
                <td style={styles.td}><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan={10} style={{ ...styles.td, textAlign:'center', color:'#333', padding:40 }}>
                ไม่พบรายการที่ค้นหา
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i+1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ ...styles.pageBtn, ...(p===page ? styles.pageBtnActive : {}) }}>
              {p}
            </button>
          ))}
          {totalPages > 10 && <span style={{ color:'#444', fontSize:12 }}>… {totalPages}</span>}
        </div>
      )}
    </div>
  )
}

const styles = {
  page:      { padding:'0 0 32px' },
  toolbar:   { display:'flex', alignItems:'center', gap:10, padding:'0 28px 16px', flexWrap:'wrap' },
  searchWrap:{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:220,
    background:'#111', border:'1px solid #222', borderRadius:8, padding:'8px 12px' },
  searchInput:{ background:'transparent', border:'none', outline:'none', color:'#E0E0E0',
    fontSize:13, flex:1, fontFamily:'var(--font)' },
  selectWrap:{ position:'relative', display:'flex', alignItems:'center' },
  select:    { appearance:'none', background:'#111', border:'1px solid #222',
    borderRadius:8, padding:'7px 28px 7px 12px', color:'#888', fontSize:13,
    fontFamily:'var(--font)', cursor:'pointer', outline:'none' },
  count:     { fontSize:11, color:'#444', fontFamily:'var(--mono)', whiteSpace:'nowrap' },
  tableWrap: { overflowX:'auto', padding:'0 28px' },
  table:     { width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:900 },
  th:        { padding:'8px 12px', textAlign:'left', color:'#444', fontSize:11,
    textTransform:'uppercase', letterSpacing:'0.3px', borderBottom:'1px solid #1E1E1E',
    background:'#0D0D0D', whiteSpace:'nowrap' },
  td:        { padding:'8px 12px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  pagination:{ display:'flex', gap:6, padding:'14px 28px', justifyContent:'center' },
  pageBtn:   { width:30, height:30, background:'transparent', border:'1px solid #222',
    borderRadius:6, color:'#555', fontSize:12, cursor:'pointer', fontFamily:'var(--mono)' },
  pageBtnActive:{ background:'#CC000020', border:'1px solid #CC000040', color:'#CC0000' },
}
