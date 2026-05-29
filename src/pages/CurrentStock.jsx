import { useEffect, useState, useMemo } from 'react'
import { Search, MapPin } from 'lucide-react'
import { fetchMyStockSummary, MOCK_STOCK } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'

export default function CurrentStock() {
  const [all,     setAll]     = useState([])
  const [search,  setSearch]  = useState('')
  const [selType, setSelType] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyStockSummary()
      .then(d => { setAll(d); setLoading(false) })
      .catch(() => { setAll(MOCK_STOCK); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return all.filter(r => {
      const mQ = !q || r.model.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
      const mT = selType==='all' || (selType==='pickup' && !r.model.toLowerCase().includes('mu-x')) || (selType==='mux' && r.model.toLowerCase().includes('mu-x'))
      return mQ && mT
    })
  }, [all, search, selType])

  const total = filtered.reduce((s,r) => s+r.qty, 0)

  return (
    <div className="page-wrap">
      <PageHeader title="สต๊อกรถปัจจุบัน" subtitle="รถ MY26 ที่ว่างอยู่" lastSync="27/5/69" />

      {/* Toolbar */}
      <div className="toolbar-wrap" style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={13} style={{ color:'#444', flexShrink:0 }} />
          <input style={styles.searchInput} placeholder="ค้นหา รุ่น / รหัส / ที่จอด..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {[['all','ทั้งหมด'],['pickup','P-UP'],['mux','Mu-X']].map(([v,l]) => (
            <button key={v} onClick={() => setSelType(v)}
              style={{ ...styles.filterBtn, ...(selType===v ? styles.filterOn : {}) }}>
              {l}
            </button>
          ))}
        </div>
        <span style={{ fontSize:11, color:'#555', fontFamily:'var(--mono)', whiteSpace:'nowrap' }}>{total} คัน</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="stock-grid" style={styles.grid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ ...styles.skeleton, animationDelay:`${i*.1}s` }} />
          ))}
        </div>
      ) : (
        <div className="stock-grid" style={styles.grid}>
          {filtered.map(item => <StockCard key={item.id} item={item} />)}
          {filtered.length===0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:50, color:'#444' }}>
              ไม่พบรายการที่ค้นหา
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StockCard({ item }) {
  const isMux = item.model.toLowerCase().includes('mu-x')
  return (
    <div style={styles.card}>
      <div style={{ ...styles.typeBar, background: isMux ? '#3B82F6' : '#CC0000' }} />
      <div style={{ flex:1, padding:'10px 10px 10px 12px', minWidth:0 }}>
        <span style={{ ...styles.pill, background: isMux?'#3B82F618':'#CC000018',
          color: isMux?'#60A5FA':'#FF6666' }}>{isMux?'Mu-X':'P-UP'}</span>
        <div style={styles.modelName}>{item.model}</div>
        <div style={{ fontSize:10, color:'#555', fontFamily:'var(--mono)',
          background:'#1A1A1A', display:'inline-block', padding:'1px 6px',
          borderRadius:4, marginBottom:6 }}>{item.code}</div>
        <div style={{ display:'flex', alignItems:'flex-start', gap:4 }}>
          <MapPin size={10} style={{ color:'#444', marginTop:2, flexShrink:0 }} />
          <span style={{ fontSize:10, color:'#555', lineHeight:1.4 }}>{item.location}</span>
        </div>
      </div>
      <div style={styles.qtyBlock}>
        <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)',
          color: isMux?'#60A5FA':'#CC0000', lineHeight:1 }}>{item.qty}</div>
        <div style={{ fontSize:10, color:'#444', marginTop:2 }}>คัน</div>
      </div>
    </div>
  )
}

const styles = {
  toolbar:     { display:'flex', alignItems:'center', gap:10, padding:'0 28px 14px', flexWrap:'wrap' },
  searchBox:   { display:'flex', alignItems:'center', gap:7, flex:1, minWidth:180,
                 background:'#111', border:'1px solid #222', borderRadius:8, padding:'7px 11px' },
  searchInput: { background:'transparent', border:'none', outline:'none', color:'#E0E0E0',
                 fontSize:13, flex:1, fontFamily:'var(--font)' },
  filterBtn:   { padding:'5px 12px', background:'transparent', border:'1px solid #222',
                 borderRadius:7, color:'#555', fontSize:12, cursor:'pointer' },
  filterOn:    { background:'#CC000018', border:'1px solid #CC000040', color:'#FF6666' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',
                 gap:10, padding:'0 28px' },
  skeleton:    { background:'#111', border:'1px solid #1A1A1A', borderRadius:10,
                 height:110, animation:'pulse 1.5s ease infinite' },
  card:        { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
                 overflow:'hidden', display:'flex' },
  typeBar:     { width:3, flexShrink:0 },
  modelName:   { fontSize:12, fontWeight:500, color:'#E0E0E0', lineHeight:1.3,
                 margin:'5px 0 4px' },
  pill:        { fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:20,
                 display:'inline-block', marginBottom:2 },
  qtyBlock:    { display:'flex', flexDirection:'column', alignItems:'center',
                 justifyContent:'center', padding:'0 14px', background:'#0D0D0D',
                 borderLeft:'1px solid #1A1A1A', flexShrink:0 },
}
