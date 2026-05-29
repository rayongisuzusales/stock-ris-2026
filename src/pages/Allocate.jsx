import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, UserCheck, X, Check } from 'lucide-react'
import { useStock } from '../context/StockContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'

const BRANCHES = ['PD','RY','MP','NK','BK','CK','FC','FR']
const SC_LIST   = ['นิรันดร์ ขายดี','สุดา พิมพ์ใจ','เฉลิม พิมศร','ธัญญาภรณ์ กาสังข์','วิทยา สมบูรณ์']

export default function Allocate() {
  const { allocated, stockList, addMatch, updateMatch, removeMatch, getWorkingDays } = useStock()
  const { user, can } = useAuth()
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [editId, setEditId]   = useState(null)
  const [scModal, setScModal] = useState(null)
  const [filterBranch, setFilterBranch] = useState('ทั้งหมด')

  // Form state
  const [form, setForm] = useState({ stockId:'', engineNo:'', chassisNo:'', branch:'', matchDate:'' })
  const [scName, setScName] = useState('')

  const filtered = useMemo(() => {
    const list = user?.role==='manager' ? allocated.filter(a=>a.branch===user.branch) : allocated
    return filterBranch==='ทั้งหมด' ? list : list.filter(a=>a.branch===filterBranch)
  }, [allocated, filterBranch, user])

  const handleAddMatch = () => {
    if (!form.stockId || !form.branch) return
    const stock = stockList.find(s => s.id===Number(form.stockId))
    addMatch({ ...form, stockId:Number(form.stockId), model:stock?.model||'', code:stock?.code||'' })
    setForm({ stockId:'', engineNo:'', chassisNo:'', branch:'', matchDate:'' })
    setShowMatchForm(false)
  }

  const handleAssignSC = () => {
    if (!scName) return
    updateMatch(scModal.id, { sc: scName, status:'sc_assigned' })
    setScModal(null); setScName('')
  }

  return (
    <div className="page-wrap">
      <PageHeader title="จับคู่สต๊อก" subtitle="Allocate รถไปยังสาขา — ลง SC" />

      {/* Toolbar */}
      <div className="toolbar-wrap" style={styles.toolbar}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['ทั้งหมด',...BRANCHES].map(b => (
            <button key={b} onClick={()=>setFilterBranch(b)}
              style={{ ...styles.filterBtn, ...(filterBranch===b ? styles.filterOn : {}) }}>{b}</button>
          ))}
        </div>
        {can('matchStock') && (
          <button onClick={()=>setShowMatchForm(true)} style={styles.addBtn}>
            <Plus size={13}/> จับคู่รถใหม่
          </button>
        )}
      </div>

      {/* Add Match Form */}
      {showMatchForm && can('matchStock') && (
        <div className="page-section" style={styles.formCard}>
          <div style={styles.formTitle}>จับคู่รถ → สาขา</div>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.lbl}>รุ่นรถ (สต๊อก)</label>
              <select style={styles.input} value={form.stockId} onChange={e=>setForm({...form,stockId:e.target.value})}>
                <option value="">— เลือกรุ่น —</option>
                {stockList.map(s=>(
                  <option key={s.id} value={s.id}>{s.model} · {s.code} ({s.qty} คัน)</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.lbl}>สาขา</label>
              <select style={styles.input} value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}>
                <option value="">— เลือกสาขา —</option>
                {BRANCHES.map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.lbl}>เลขเครื่อง</label>
              <input style={styles.input} value={form.engineNo}
                onChange={e=>setForm({...form,engineNo:e.target.value})} placeholder="FXX0000" />
            </div>
            <div>
              <label style={styles.lbl}>เลขแชสซี</label>
              <input style={styles.input} value={form.chassisNo}
                onChange={e=>setForm({...form,chassisNo:e.target.value})} placeholder="MP1TFR..." />
            </div>
            <div>
              <label style={styles.lbl}>วันที่แมท</label>
              <input type="date" style={styles.input} value={form.matchDate}
                onChange={e=>setForm({...form,matchDate:e.target.value})} />
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={handleAddMatch} style={styles.saveBtn}><Check size={13}/> บันทึก</button>
            <button onClick={()=>setShowMatchForm(false)} style={styles.cancelBtn}><X size={13}/> ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardHead}>
          <span style={styles.cardTitle}>รายการที่แมทแล้ว</span>
          <span style={styles.chip}>{filtered.length} รายการ</span>
        </div>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['รุ่น','เลขเครื่อง','สาขา','SC','วันแมท','วันทำงาน','สถานะ','Action'].map(h=>(
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const days = getWorkingDays(a.matchDate)
                const overdue = days > 7
                return (
                  <tr key={a.id} style={{ background: i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={styles.td}>
                      <div style={{ fontSize:12, fontWeight:500, color:'#D0D0D0' }}>{a.model}</div>
                      <div style={{ fontSize:10, color:'#555', fontFamily:'var(--mono)' }}>{a.code}</div>
                    </td>
                    <td style={{ ...styles.td, fontFamily:'var(--mono)', fontSize:11 }}>{a.engineNo||'—'}</td>
                    <td style={{ ...styles.td, fontWeight:600, color:'#CC0000', fontFamily:'var(--mono)' }}>{a.branch}</td>
                    <td style={{ ...styles.td, color: a.sc?'#888':'#444' }}>
                      {a.sc || <span style={{ color:'#444', fontSize:11 }}>ยังไม่ลง SC</span>}
                    </td>
                    <td style={{ ...styles.td, fontFamily:'var(--mono)', fontSize:11 }}>{a.matchDate}</td>
                    <td style={{ ...styles.td, textAlign:'center' }}>
                      <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)',
                        color: overdue?'#FF6666':days>=5?'#FCD34D':'#4ADE80' }}>
                        {days}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusPill,
                        ...(a.status==='sc_assigned' ? styles.pillGreen : overdue ? styles.pillRed : styles.pillAmber) }}>
                        {a.status==='sc_assigned' ? 'ลง SC แล้ว' : overdue ? '⚠ เกินกำหนด' : 'รอลง SC'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, whiteSpace:'nowrap' }}>
                      {can('assignSC') && !a.sc && (
                        <button onClick={()=>setScModal(a)} style={styles.iconBtn} title="ลง SC">
                          <UserCheck size={13}/>
                        </button>
                      )}
                      {can('matchStock') && (
                        <button onClick={()=>removeMatch(a.id)} style={{ ...styles.iconBtn, color:'#FF6666' }} title="ลบ">
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SC Modal */}
      {scModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalTitle}>ลง SC สำหรับรถที่แมทกับ <strong style={{color:'#CC0000'}}>{scModal.branch}</strong></div>
            <div style={{ fontSize:12, color:'#888', marginBottom:14 }}>{scModal.model} · {scModal.code}</div>
            <label style={styles.lbl}>ชื่อ SC</label>
            <select style={styles.input} value={scName} onChange={e=>setScName(e.target.value)}>
              <option value="">— เลือก SC —</option>
              {SC_LIST.map(s=><option key={s}>{s}</option>)}
            </select>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button onClick={handleAssignSC} style={styles.saveBtn}><Check size={13}/> ยืนยัน</button>
              <button onClick={()=>setScModal(null)} style={styles.cancelBtn}><X size={13}/> ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  toolbar:    { display:'flex', alignItems:'center', gap:10, padding:'0 28px 14px', flexWrap:'wrap', justifyContent:'space-between' },
  filterBtn:  { padding:'5px 12px', background:'transparent', border:'1px solid #222', borderRadius:7, color:'#555', fontSize:12, cursor:'pointer' },
  filterOn:   { background:'#CC000018', border:'1px solid #CC000040', color:'#FF6666' },
  addBtn:     { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#CC0000',
                border:'none', borderRadius:8, color:'#fff', fontSize:12, cursor:'pointer',
                fontFamily:'var(--font)', flexShrink:0 },
  formCard:   { background:'#0D0D0D', border:'1px solid #2A2A2A', borderRadius:10,
                padding:'16px', marginBottom:12, marginLeft:28, marginRight:28 },
  formTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0', marginBottom:12 },
  formGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 },
  lbl:        { fontSize:11, color:'#666', display:'block', marginBottom:5 },
  input:      { width:'100%', background:'#111', border:'1px solid #2A2A2A', borderRadius:7,
                padding:'7px 10px', color:'#E0E0E0', fontSize:13, fontFamily:'var(--font)',
                outline:'none', boxSizing:'border-box' },
  saveBtn:    { display:'flex', alignItems:'center', gap:5, padding:'7px 16px', background:'#CC0000',
                border:'none', borderRadius:7, color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' },
  cancelBtn:  { display:'flex', alignItems:'center', gap:5, padding:'7px 14px', background:'transparent',
                border:'1px solid #2A2A2A', borderRadius:7, color:'#888', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' },
  card:       { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
                padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:       { fontSize:10, padding:'2px 8px', borderRadius:20, background:'#CC000020', color:'#CC0000', fontFamily:'var(--mono)' },
  table:      { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:         { padding:'8px 10px', textAlign:'left', color:'#444', fontSize:11,
                textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:         { padding:'8px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  statusPill: { display:'inline-block', fontSize:11, fontWeight:500, padding:'2px 9px', borderRadius:20 },
  pillGreen:  { background:'#22C55E18', color:'#4ADE80' },
  pillRed:    { background:'#CC000018', color:'#FF6666' },
  pillAmber:  { background:'#F59E0B18', color:'#FCD34D' },
  iconBtn:    { background:'transparent', border:'none', cursor:'pointer', color:'#666',
                padding:'4px 6px', borderRadius:5, display:'inline-flex', alignItems:'center', marginRight:3 },
  modalOverlay:{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200,
                 display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  modalBox:   { background:'#111', border:'1px solid #2A2A2A', borderRadius:12, padding:24,
                width:'100%', maxWidth:380 },
  modalTitle: { fontSize:14, fontWeight:500, color:'#E0E0E0', marginBottom:6 },
}
