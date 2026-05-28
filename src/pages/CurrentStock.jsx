import { useEffect, useState, useMemo } from 'react'
import { Search, MapPin } from 'lucide-react'
import { fetchMyStockSummary, MOCK_STOCK } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'

const COLOR_MAP = {
  SBW:'#9CA3AF', BOS:'#1E3A5F', ELG:'#6B7280', DWP:'#374151',
  BAB:'#78716C', ILG:'#4B5563', EGB:'#374151', EGG:'#4B5563',
}

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
      const matchQ = !q ||
        r.model.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      const matchT = selType === 'all' ||
        (selType === 'pickup' && !r.model.toLowerCase().includes('mu-x')) ||
        (selType === 'mux'    &&  r.model.toLowerCase().includes('mu-x'))
      return matchQ && matchT
    })
  }, [all, search, selType])

  const total = filtered.reduce((s, r) => s + r.qty, 0)

  const refresh = () => {
    setLoading(true)
    fetchMyStockSummary()
      .then(d => { setAll(d); setLoading(false) })
      .catch(() => { setAll(MOCK_STOCK); setLoading(false) })
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title="สต๊อกรถปัจจุบัน"
        subtitle="รถ MY26 ที่ว่างอยู่ พร้อมจับคู่กับสาขา"
        onRefresh={refresh}
        lastSync="27/5/69 · 16:42 น."
      />

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={14} style={{ color:'#444', flexShrink:0 }} />
          <input
            style={styles.searchInput}
            placeholder="ค้นหา รุ่น / รหัส / สถานที่จอด..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.filterGroup}>
          {[['all','ทั้งหมด'],['pickup','P-UP'],['mux','Mu-X']].map(([v,l]) => (
            <button key={v} onClick={() => setSelType(v)}
              style={{ ...styles.filterBtn, ...(selType===v ? styles.filterActive : {}) }}>
              {l}
            </button>
          ))}
        </div>
        <span style={styles.countBadge}>{total} คัน</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={styles.loadWrap}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ ...styles.cardSkeleton, animationDelay: `${i*0.1}s` }} />
          ))}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(item => <StockCard key={item.id} item={item} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:'#444' }}>
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
  const colorCode = item.code.split(' ').pop() || ''

  return (
    <div style={styles.card}>
      <div style={{ ...styles.typeBar, background: isMux ? '#3B82F6' : '#CC0000' }} />
      <div style={styles.cardBody}>
        <div style={styles.modelLine}>
          <span style={{ ...styles.typePill, background: isMux ? '#3B82F618' : '#CC000018',
            color: isMux ? '#60A5FA' : '#FF6666' }}>
            {isMux ? 'Mu-X' : 'P-UP'}
          </span>
        </div>
        <div style={styles.modelName}>{item.model}</div>
        <div style={styles.codeRow}>
          <span style={styles.codeTag}>{item.code}</span>
        </div>
        <div style={styles.locationRow}>
          <MapPin size={11} style={{ color:'#444', flexShrink:0 }} />
          <span style={styles.location}>{item.location}</span>
        </div>
      </div>
      <div style={styles.qtyBlock}>
        <div style={{ ...styles.qtyNum, color: isMux ? '#60A5FA' : '#CC0000' }}>{item.qty}</div>
        <div style={styles.qtyLabel}>คัน</div>
      </div>
    </div>
  )
}

const styles = {
  page:    { padding:'0 0 32px' },
  toolbar: { display:'flex', alignItems:'center', gap:10, padding:'0 28px 16px', flexWrap:'wrap' },
  searchWrap:{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:200,
    background:'#111', border:'1px solid #222', borderRadius:8, padding:'8px 12px' },
  searchInput:{ background:'transparent', border:'none', outline:'none', color:'#E0E0E0',
    fontSize:13, flex:1, fontFamily:'var(--font)' },
  filterGroup:{ display:'flex', gap:4 },
  filterBtn: { padding:'6px 14px', background:'transparent', border:'1px solid #222',
    borderRadius:7, color:'#555', fontSize:12, cursor:'pointer' },
  filterActive:{ background:'#CC000018', border:'1px solid #CC000040', color:'#FF6666' },
  countBadge: { fontSize:11, color:'#555', fontFamily:'var(--mono)', whiteSpace:'nowrap' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
    gap:12, padding:'0 28px' },
  loadWrap: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
    gap:12, padding:'0 28px' },
  cardSkeleton: { background:'#111', border:'1px solid #1A1A1A', borderRadius:10,
    height:120, animation:'pulse 1.5s ease infinite' },
  card: { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
    overflow:'hidden', display:'flex', transition:'border-color .15s',
    position:'relative', cursor:'default' },
  typeBar: { width:3, flexShrink:0 },
  cardBody:{ flex:1, padding:'12px 12px 12px 14px', minWidth:0 },
  modelLine:{ display:'flex', alignItems:'center', gap:6, marginBottom:6 },
  typePill: { fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:20 },
  modelName:{ fontSize:13, fontWeight:500, color:'#E0E0E0', lineHeight:1.3, marginBottom:5 },
  codeRow:  { marginBottom:6 },
  codeTag:  { fontSize:11, color:'#555', fontFamily:'var(--mono)',
    background:'#1A1A1A', padding:'1px 6px', borderRadius:4 },
  locationRow:{ display:'flex', alignItems:'flex-start', gap:5 },
  location: { fontSize:11, color:'#555', lineHeight:1.4 },
  qtyBlock: { display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', padding:'0 16px', background:'#0D0D0D',
    borderLeft:'1px solid #1A1A1A' },
  qtyNum:   { fontSize:24, fontWeight:700, fontFamily:'var(--mono)', lineHeight:1 },
  qtyLabel: { fontSize:10, color:'#444', marginTop:2 },
}
