import { useState, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { MOCK_HISTORY } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const BRANCHES = ['ทั้งหมด','RY','NK','MP','FR','BK','PD','CK','FC']
const PAGE_SIZE = 20

export default function History() {
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('ทั้งหมด')
  const [page,   setPage]   = useState(1)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return MOCK_HISTORY.filter(r => {
      const mQ = !q || r.docNo.includes(q) || r.engineNo.toLowerCase().includes(q) ||
        r.chassis.toLowerCase().includes(q) || r.model.toLowerCase().includes(q) || r.sc.toLowerCase().includes(q)
      const mB = branch==='ทั้งหมด' || r.branch===branch
      return mQ && mB
    })
  }, [search, branch])

  const shown = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div className="page-wrap">
      <PageHeader title="ประวัติการขาย" subtitle="ข้อมูลตั้งแต่ ต.ค. 2565" lastSync="27/5/69" />

      {/* Toolbar */}
      <div className="toolbar-wrap" style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={13} style={{ color:'#444', flexShrink:0 }} />
          <input style={styles.searchInput}
            placeholder="เลขเอกสาร / เลขเครื่อง / ชื่อ SC..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div style={{ position:'relative' }}>
          <select style={styles.select} value={branch} onChange={e => { setBranch(e.target.value); setPage(1) }}>
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <span style={{ fontSize:11, color:'#555', fontFamily:'var(--mono)', whiteSpace:'nowrap' }}>
          {filtered.length} รายการ
        </span>
      </div>

      {/* Table */}
      <div style={{ padding:'0 28px' }} className="toolbar-wrap">
        <div className="table-scroll" style={{ overflowX:'auto', borderRadius:10,
          border:'1px solid #1E1E1E', background:'#111' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['เลขเอกสาร','รุ่น','สี','เลขเครื่อง','แชสซี','สาขา','วันรถลง','วันเปิดสัญญา','SC','สถานะ'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={r.id} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                  <td style={{ ...styles.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.docNo||'—'}</td>
                  <td style={{ ...styles.td, fontWeight:500, color:'#D0D0D0' }}>{r.model}</td>
                  <td style={{ ...styles.td, fontFamily:'var(--mono)', color:'#666' }}>{r.color}</td>
                  <td style={{ ...styles.td, fontFamily:'var(--mono)' }}>{r.engineNo||'—'}</td>
                  <td style={{ ...styles.td, fontFamily:'var(--mono)', fontSize:11, color:'#555' }}>{r.chassis||'—'}</td>
                  <td style={{ ...styles.td, fontWeight:600, color:'#CC0000', fontFamily:'var(--mono)' }}>{r.branch}</td>
                  <td style={{ ...styles.td, color:'#666' }}>{r.entryDate||'—'}</td>
                  <td style={{ ...styles.td, color:'#666' }}>{r.contractDate||'—'}</td>
                  <td style={{ ...styles.td, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.sc||'—'}</td>
                  <td style={styles.td}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {shown.length===0 && (
                <tr><td colSpan={10} style={{ ...styles.td, textAlign:'center', color:'#333', padding:40 }}>
                  ไม่พบรายการที่ค้นหา
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', gap:6, padding:'12px 28px', justifyContent:'center', flexWrap:'wrap' }}>
          {Array.from({ length: Math.min(totalPages,8) }, (_,i) => i+1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width:32, height:32, background: p===page?'#CC000020':'transparent',
                border:`1px solid ${p===page?'#CC000040':'#222'}`,
                borderRadius:6, color: p===page?'#CC0000':'#555',
                fontSize:12, cursor:'pointer', fontFamily:'var(--mono)' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  toolbar:     { display:'flex', alignItems:'center', gap:10, padding:'0 28px 14px', flexWrap:'wrap' },
  searchBox:   { display:'flex', alignItems:'center', gap:7, flex:1, minWidth:180,
                 background:'#111', border:'1px solid #222', borderRadius:8, padding:'7px 11px' },
  searchInput: { background:'transparent', border:'none', outline:'none', color:'#E0E0E0',
                 fontSize:13, flex:1, fontFamily:'var(--font)' },
  select:      { appearance:'none', background:'#111', border:'1px solid #222', borderRadius:8,
                 padding:'7px 28px 7px 12px', color:'#888', fontSize:13,
                 fontFamily:'var(--font)', cursor:'pointer', outline:'none' },
  table:       { width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:800 },
  th:          { padding:'8px 10px', textAlign:'left', color:'#444', fontSize:11,
                 textTransform:'uppercase', borderBottom:'1px solid #1E1E1E',
                 background:'#0D0D0D', whiteSpace:'nowrap' },
  td:          { padding:'8px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
}
