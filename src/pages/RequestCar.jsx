import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useStock } from '../context/StockContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { Plus, CheckCircle, XCircle, Clock, Search, X, Check } from 'lucide-react'

const MODELS = [
  'Cab4 2.2 Ddi L','Cab4 2.2 Ddi L AT','Cab4 2.2 Ddi S','Cab4 2.2 Ddi S AT',
  'HR 4Drs 2.2 Ddi L','HR 4Drs 2.2 Ddi L AT','HR 4Drs 2.2 Ddi Z','HR 4Drs 2.2 Ddi Z AT',
  'HR 2Drs 2.2 Ddi L','Spacecab 2.2 Ddi S','Spacecab 2.2 Ddi S AT',
  'X-Series Speed 4Drs','X-Series Speed 2Drs',
  'Mu-X 4x2 2.2 Active','Mu-X 4x2 2.2 Elegant','Mu-X 4x4 3.0 Prestige',
]
const COLORS = ['SBW (ขาวมุก)','BOS (น้ำเงินเข้ม)','ELG (เทาบรอนซ์)','DWP (ขาวมุกเข้ม)',
  'BAB (น้ำเงินดำ)','ILG (เทาเข้ม)','FRD (แดง)','GNM (เขียว)']
const BRANCHES = ['PD','RY','MP','NK','BK','CK','FC','FR']

const STATUS_MAP = {
  pending_manager:{ label:'รอผู้จัดการ', color:'#F59E0B', bg:'#F59E0B18' },
  approved:       { label:'อนุมัติแล้ว', color:'#3B82F6', bg:'#3B82F618' },
  rejected:       { label:'ปฏิเสธ',      color:'#EF4444', bg:'#EF444418' },
  matched:        { label:'จับคู่แล้ว',  color:'#A855F7', bg:'#A855F718' },
  sc_assigned:    { label:'ลง SC แล้ว',  color:'#22C55E', bg:'#22C55E18' },
  completed:      { label:'เสร็จสิ้น',   color:'#22C55E', bg:'#22C55E18' },
}

export default function RequestCar() {
  const { user, can } = useAuth()
  const { requests, inventory, createRequest, approveRequest, rejectRequest, matchRequest, completeRequest, getWorkingDays } = useStock()

  const role   = user?.role
  const branch = user?.branch

  const [showForm,    setShowForm]    = useState(false)
  const [matchModal,  setMatchModal]  = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason,setRejectReason]= useState('')
  const [filterStatus,setFilterStatus]= useState('all')
  const [search,      setSearch]      = useState('')

  // Form สำหรับ SC ขอรถ
  const [form, setForm] = useState({
    customerName:'', model:'', color:'', bookingDate:'', expectedDate:'', remark:''
  })

  // Form สำหรับ Stock จับคู่
  const [matchForm, setMatchForm] = useState({ stockId:'', engineNo:'', chassisNo:'' })

  // กรองคำขอตาม role
  const visibleRequests = useMemo(() => {
    let list = requests
    if (role === 'sc')      list = requests.filter(r => r.scId === user?.id)
    if (role === 'manager') list = requests.filter(r => r.branch === branch)

    if (filterStatus !== 'all') list = list.filter(r => r.status === filterStatus)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.customerName?.toLowerCase().includes(q) ||
        r.model?.toLowerCase().includes(q) ||
        r.scName?.toLowerCase().includes(q) ||
        r.branch?.toLowerCase().includes(q)
      )
    }
    return [...list].reverse()
  }, [requests, role, user, branch, filterStatus, search])

  const handleCreateRequest = () => {
    if (!form.customerName || !form.model || !form.color) return
    createRequest({
      scId: user.id, scName: user.name, branch: user.branch,
      ...form,
    })
    setForm({ customerName:'', model:'', color:'', bookingDate:'', expectedDate:'', remark:'' })
    setShowForm(false)
  }

  const handleMatch = () => {
    if (!matchForm.stockId || !matchForm.engineNo) return
    const stock = inventory.find(s => s.id === Number(matchForm.stockId))
    matchRequest(matchModal.id, {
      stockId:   Number(matchForm.stockId),
      engineNo:  matchForm.engineNo,
      chassisNo: matchForm.chassisNo || stock?.chassisNo || '',
    })
    setMatchModal(null)
    setMatchForm({ stockId:'', engineNo:'', chassisNo:'' })
  }

  const handleReject = () => {
    rejectRequest(rejectModal.id, rejectReason)
    setRejectModal(null); setRejectReason('')
  }

  // สต๊อกที่ match กับรุ่นและสีของคำขอ
  const matchingStock = useMemo(() => {
    if (!matchModal) return inventory
    const colorCode = matchModal.color.split(' ')[0]
    return inventory.filter(s =>
      s.model === matchModal.model && s.qty > 0 &&
      (s.color === matchModal.color || s.color === colorCode || matchModal.color.includes(s.color))
    )
  }, [matchModal, inventory])

  const counts = useMemo(() => {
    const all = role==='sc' ? requests.filter(r=>r.scId===user?.id)
              : role==='manager' ? requests.filter(r=>r.branch===branch)
              : requests
    return {
      all: all.length,
      pending_manager: all.filter(r=>r.status==='pending_manager').length,
      approved:        all.filter(r=>r.status==='approved').length,
      matched:         all.filter(r=>r.status==='matched').length,
    }
  }, [requests, role, user, branch])

  return (
    <div className="page-wrap">
      <PageHeader
        title="คำขอรถ"
        subtitle={role==='sc' ? 'ขอรถ → ผู้จัดการอนุมัติ → Stock จับคู่'
          : role==='manager' ? 'ตรวจสอบคำขอจาก SC → อนุมัติส่ง Stock'
          : 'จับคู่รถกับคำขอที่ผ่านการอนุมัติ'}
      />

      {/* Toolbar */}
      <div className="toolbar-wrap" style={S.toolbar}>
        <div style={S.searchBox}>
          <Search size={13} style={{ color:'#444', flexShrink:0 }} />
          <input style={S.searchInput} placeholder="ค้นหา ลูกค้า / รุ่น / สาขา..."
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {[['all','ทั้งหมด',counts.all],
            ['pending_manager','รอผู้จัดการ',counts.pending_manager],
            ['approved','รออนุมัติ',counts.approved],
            ['matched','จับคู่แล้ว',counts.matched]
          ].map(([v,l,c])=>(
            <button key={v} onClick={()=>setFilterStatus(v)}
              style={{ ...S.filterBtn, ...(filterStatus===v?S.filterOn:{}) }}>
              {l}{c>0 && <span style={{ marginLeft:4, fontSize:10 }}>({c})</span>}
            </button>
          ))}
        </div>
        {can('viewStock') && role==='sc' && (
          <button onClick={()=>setShowForm(true)} style={S.addBtn}>
            <Plus size={13}/> ขอรถใหม่
          </button>
        )}
      </div>

      {/* Form SC ขอรถ */}
      {showForm && role==='sc' && (
        <div className="page-section" style={S.formCard}>
          <div style={S.formTitle}>ขอรถใหม่ — {user.name} · สาขา {user.branch}</div>
          <div style={S.formGrid}>
            <div><label style={S.lbl}>ชื่อลูกค้า *</label>
              <input style={S.inp} placeholder="ชื่อ-นามสกุลลูกค้า" value={form.customerName}
                onChange={e=>setForm({...form,customerName:e.target.value})} /></div>
            <div><label style={S.lbl}>รุ่นรถที่ต้องการ *</label>
              <select style={S.inp} value={form.model} onChange={e=>setForm({...form,model:e.target.value})}>
                <option value="">— เลือกรุ่น —</option>
                {MODELS.map(m=><option key={m}>{m}</option>)}
              </select></div>
            <div><label style={S.lbl}>สีรถที่ต้องการ *</label>
              <select style={S.inp} value={form.color} onChange={e=>setForm({...form,color:e.target.value})}>
                <option value="">— เลือกสี —</option>
                {COLORS.map(c=><option key={c}>{c}</option>)}
              </select></div>
            <div><label style={S.lbl}>วันที่จอง</label>
              <input type="date" style={S.inp} value={form.bookingDate}
                onChange={e=>setForm({...form,bookingDate:e.target.value})} /></div>
            <div><label style={S.lbl}>วันคาดการณ์รับรถ</label>
              <input type="date" style={S.inp} value={form.expectedDate}
                onChange={e=>setForm({...form,expectedDate:e.target.value})} /></div>
            <div><label style={S.lbl}>หมายเหตุ</label>
              <input style={S.inp} placeholder="ระบุรายละเอียดเพิ่มเติม" value={form.remark}
                onChange={e=>setForm({...form,remark:e.target.value})} /></div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={handleCreateRequest} style={S.saveBtn}><Check size={13}/> ส่งคำขอ</button>
            <button onClick={()=>setShowForm(false)} style={S.cancelBtn}><X size={13}/> ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Request list */}
      <div className="page-section" style={S.card}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>รายการคำขอ</span>
          <span style={S.chip}>{visibleRequests.length} รายการ</span>
        </div>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead><tr>
              {['สถานะ','ลูกค้า','รุ่น / สี','สาขา','SC','วันจอง','วันรับรถ','เลขเครื่อง','วันแมท','วันทำงาน','Action'].map(h=>(
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {visibleRequests.length === 0 && (
                <tr><td colSpan={11} style={{ ...S.td, textAlign:'center', color:'#333', padding:40 }}>
                  ไม่มีรายการ
                </td></tr>
              )}
              {visibleRequests.map((r, i) => {
                const st = STATUS_MAP[r.status] || { label:r.status, color:'#666', bg:'#66666618' }
                const days = r.matchDate ? getWorkingDays(r.matchDate) : null
                return (
                  <tr key={r.id} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={S.td}>
                      <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:20,
                        background:st.bg, color:st.color }}>{st.label}</span>
                    </td>
                    <td style={{ ...S.td, color:'#D0D0D0', fontWeight:500, maxWidth:130,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {r.customerName}
                    </td>
                    <td style={S.td}>
                      <div style={{ fontSize:12, color:'#D0D0D0' }}>{r.model}</div>
                      <div style={{ fontSize:10, color:'#555', fontFamily:'var(--mono)' }}>{r.color.split(' ')[0]}</div>
                    </td>
                    <td style={{ ...S.td, fontWeight:600, color:'#CC0000', fontFamily:'var(--mono)' }}>{r.branch}</td>
                    <td style={{ ...S.td, color:'#888', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.scName}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.bookingDate||'—'}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.expectedDate||'—'}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.engineNo||'—'}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.matchDate||'—'}</td>
                    <td style={{ ...S.td, textAlign:'center' }}>
                      {days !== null ? (
                        <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)',
                          color: days>7?'#FF6666':days>=5?'#FCD34D':'#4ADE80' }}>{days}</span>
                      ) : '—'}
                    </td>
                    <td style={{ ...S.td, whiteSpace:'nowrap' }}>
                      {/* ผู้จัดการ: อนุมัติ/ปฏิเสธ */}
                      {role==='manager' && r.status==='pending_manager' && r.branch===branch && (
                        <>
                          <button onClick={()=>approveRequest(r.id, user.name)} style={S.iconBtnGreen} title="อนุมัติ">
                            <CheckCircle size={14}/>
                          </button>
                          <button onClick={()=>setRejectModal(r)} style={S.iconBtnRed} title="ปฏิเสธ">
                            <XCircle size={14}/>
                          </button>
                        </>
                      )}
                      {/* Admin อนุมัติ/ปฏิเสธได้ทุกคำขอ */}
                      {role==='admin' && r.status==='pending_manager' && (
                        <>
                          <button onClick={()=>approveRequest(r.id, user.name)} style={S.iconBtnGreen} title="อนุมัติ">
                            <CheckCircle size={14}/>
                          </button>
                          <button onClick={()=>setRejectModal(r)} style={S.iconBtnRed} title="ปฏิเสธ">
                            <XCircle size={14}/>
                          </button>
                        </>
                      )}
                      {/* Stock/Admin: จับคู่รถ */}
                      {(role==='stock'||role==='admin') && r.status==='approved' && (
                        <button onClick={()=>{ setMatchModal(r); setMatchForm({ stockId:'', engineNo:'', chassisNo:'' }) }}
                          style={S.iconBtnPurple} title="จับคู่รถ">
                          จับคู่
                        </button>
                      )}
                      {/* ผู้จัดการ/SC: ยืนยันรับรถ */}
                      {(role==='manager'||role==='sc') && r.status==='matched' &&
                       (role==='sc' ? r.scId===user.id : r.branch===branch) && (
                        <button onClick={()=>completeRequest(r.id)} style={S.iconBtnGreen} title="ยืนยันรับรถ">
                          รับรถ
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

      {/* Match Modal */}
      {matchModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalTitle}>จับคู่รถกับคำขอ</div>
            <div style={{ fontSize:12, color:'#888', marginBottom:14 }}>
              ลูกค้า: <strong style={{ color:'#D0D0D0' }}>{matchModal.customerName}</strong><br/>
              ขอ: <strong style={{ color:'#D0D0D0' }}>{matchModal.model}</strong> สี {matchModal.color}<br/>
              สาขา: <strong style={{ color:'#CC0000' }}>{matchModal.branch}</strong>
            </div>

            {/* สต๊อคที่ตรงกัน */}
            {matchingStock.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <label style={S.lbl}>เลือกจากสต๊อคที่ตรงกับที่ขอ</label>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:4 }}>
                  {matchingStock.map(s => (
                    <button key={s.id} onClick={()=>setMatchForm({ stockId:String(s.id), engineNo:s.engineNo, chassisNo:s.chassisNo })}
                      style={{ ...S.stockSelectBtn, ...(matchForm.stockId===String(s.id)?S.stockSelectBtnOn:{}) }}>
                      <div style={{ flex:1, textAlign:'left' }}>
                        <div style={{ fontSize:12, fontWeight:500, color:'#D0D0D0' }}>{s.model}</div>
                        <div style={{ fontSize:10, color:'#555' }}>สี {s.color} · {s.depot} · {s.qty} คัน</div>
                      </div>
                      <div style={{ textAlign:'right', fontSize:11, color:'#666', fontFamily:'var(--mono)' }}>
                        <div>{s.engineNo}</div>
                        <div style={{ fontSize:10 }}>{s.chassisNo}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label style={S.lbl}>รุ่นรถ</label>
            <select style={{ ...S.inp, marginBottom:8 }} value={matchForm.stockId}
              onChange={e=>{
                const s = inventory.find(x=>x.id===Number(e.target.value))
                setMatchForm({ stockId:e.target.value, engineNo:s?.engineNo||'', chassisNo:s?.chassisNo||'' })
              }}>
              <option value="">— เลือกสต๊อค —</option>
              {inventory.filter(s=>s.qty>0).map(s=>(
                <option key={s.id} value={s.id}>{s.model} · สี {s.color} · {s.qty} คัน</option>
              ))}
            </select>

            <label style={S.lbl}>เลขเครื่อง *</label>
            <input style={{ ...S.inp, marginBottom:8 }} placeholder="เลขเครื่อง" value={matchForm.engineNo}
              onChange={e=>setMatchForm({...matchForm,engineNo:e.target.value})} />

            <label style={S.lbl}>เลขแชสซี</label>
            <input style={{ ...S.inp, marginBottom:14 }} placeholder="เลขแชสซี" value={matchForm.chassisNo}
              onChange={e=>setMatchForm({...matchForm,chassisNo:e.target.value})} />

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleMatch} style={S.saveBtn}><Check size={13}/> ยืนยันจับคู่</button>
              <button onClick={()=>setMatchModal(null)} style={S.cancelBtn}><X size={13}/> ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalTitle}>ปฏิเสธคำขอ</div>
            <div style={{ fontSize:12, color:'#888', marginBottom:12 }}>
              {rejectModal.customerName} · {rejectModal.model}
            </div>
            <label style={S.lbl}>เหตุผล</label>
            <input style={{ ...S.inp, marginBottom:14 }} placeholder="ระบุเหตุผล..."
              value={rejectReason} onChange={e=>setRejectReason(e.target.value)} />
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleReject} style={{ ...S.saveBtn, background:'#EF4444' }}>
                <XCircle size={13}/> ยืนยันปฏิเสธ
              </button>
              <button onClick={()=>setRejectModal(null)} style={S.cancelBtn}><X size={13}/> ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const S = {
  toolbar:    { display:'flex', alignItems:'center', gap:10, padding:'0 28px 14px', flexWrap:'wrap' },
  searchBox:  { display:'flex', alignItems:'center', gap:7, flex:1, minWidth:180,
                background:'#111', border:'1px solid #222', borderRadius:8, padding:'7px 11px' },
  searchInput:{ background:'transparent', border:'none', outline:'none', color:'#E0E0E0',
                fontSize:13, flex:1, fontFamily:'var(--font)' },
  filterBtn:  { padding:'5px 11px', background:'transparent', border:'1px solid #222', borderRadius:7,
                color:'#555', fontSize:12, cursor:'pointer', whiteSpace:'nowrap' },
  filterOn:   { background:'#CC000018', border:'1px solid #CC000040', color:'#FF6666' },
  addBtn:     { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#CC0000',
                border:'none', borderRadius:8, color:'#fff', fontSize:12, cursor:'pointer',
                fontFamily:'var(--font)', flexShrink:0 },
  formCard:   { background:'#0D0D0D', border:'1px solid #2A2A2A', borderRadius:10,
                padding:16, marginBottom:12, marginLeft:28, marginRight:28 },
  formTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0', marginBottom:12 },
  formGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 },
  lbl:        { fontSize:11, color:'#666', display:'block', marginBottom:4 },
  inp:        { width:'100%', background:'#111', border:'1px solid #2A2A2A', borderRadius:7,
                padding:'7px 10px', color:'#E0E0E0', fontSize:13, fontFamily:'var(--font)',
                outline:'none', boxSizing:'border-box' },
  saveBtn:    { display:'flex', alignItems:'center', gap:5, padding:'7px 16px', background:'#CC0000',
                border:'none', borderRadius:7, color:'#fff', fontSize:13, cursor:'pointer',
                fontFamily:'var(--font)' },
  cancelBtn:  { display:'flex', alignItems:'center', gap:5, padding:'7px 14px',
                background:'transparent', border:'1px solid #2A2A2A', borderRadius:7,
                color:'#888', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' },
  card:       { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
                padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:       { fontSize:10, padding:'2px 8px', borderRadius:20, background:'#CC000020',
                color:'#CC0000', fontFamily:'var(--mono)' },
  table:      { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:         { padding:'7px 10px', textAlign:'left', color:'#444', fontSize:11,
                textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:         { padding:'7px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  iconBtnGreen:{ background:'transparent', border:'none', cursor:'pointer', color:'#22C55E',
                 padding:'3px 5px', borderRadius:5, display:'inline-flex', alignItems:'center', marginRight:2 },
  iconBtnRed:  { background:'transparent', border:'none', cursor:'pointer', color:'#EF4444',
                 padding:'3px 5px', borderRadius:5, display:'inline-flex', alignItems:'center', marginRight:2 },
  iconBtnPurple:{ padding:'4px 10px', background:'#A855F720', border:'1px solid #A855F740',
                  borderRadius:6, color:'#C084FC', fontSize:12, cursor:'pointer',
                  fontFamily:'var(--font)' },
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200,
                display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  modal:      { background:'#111', border:'1px solid #2A2A2A', borderRadius:12, padding:24,
                width:'100%', maxWidth:440, maxHeight:'90vh', overflowY:'auto' },
  modalTitle: { fontSize:14, fontWeight:500, color:'#E0E0E0', marginBottom:8 },
  stockSelectBtn:{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
                   background:'#0D0D0D', border:'1px solid #1E1E1E', borderRadius:7,
                   cursor:'pointer', width:'100%' },
  stockSelectBtnOn:{ border:'1px solid #A855F740', background:'#A855F718' },
}
