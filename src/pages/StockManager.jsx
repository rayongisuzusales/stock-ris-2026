import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useStock } from '../context/StockContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { Plus, Edit2, Trash2, Search, Check, X } from 'lucide-react'

const MODELS = [
  'Cab4 2.2 Ddi L','Cab4 2.2 Ddi L AT','Cab4 2.2 Ddi S','Cab4 2.2 Ddi S AT',
  'HR 4Drs 2.2 Ddi L','HR 4Drs 2.2 Ddi L AT','HR 4Drs 2.2 Ddi Z','HR 4Drs 2.2 Ddi Z AT',
  'HR 2Drs 2.2 Ddi L','Spacecab 2.2 Ddi S','Spacecab 2.2 Ddi S AT',
  'X-Series Speed 4Drs','X-Series Speed 2Drs',
  'Mu-X 4x2 2.2 Active','Mu-X 4x2 2.2 Elegant','Mu-X 4x4 3.0 Prestige',
]
const COLORS = ['SBW','BOS','ELG','DWP','BAB','ILG','FRD','GNM']
const DEPOTS = ['PD','RY','MP','NK','BK','CK','FC','FR','HQ']

const EMPTY_FORM = { model:'', color:'', engineDate:'', engineNo:'', chassisNo:'', depot:'PD', qty:1, remark:'' }

export default function StockManager() {
  const { can } = useAuth()
  const { inventory, addInventory, editInventory, deleteInventory, getWorkingDays } = useStock()

  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [search,   setSearch]   = useState('')
  const [filterDepot, setFilterDepot] = useState('ทั้งหมด')
  const [confirmDel, setConfirmDel]   = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return inventory.filter(s => {
      const mQ = !q || s.model.toLowerCase().includes(q) ||
        s.color.toLowerCase().includes(q) || s.engineNo.toLowerCase().includes(q) ||
        s.chassisNo.toLowerCase().includes(q)
      const mD = filterDepot==='ทั้งหมด' || s.depot===filterDepot
      return mQ && mD
    })
  }, [inventory, search, filterDepot])

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (s) => { setForm({ ...s }); setEditId(s.id); setShowForm(true) }

  const handleSave = () => {
    if (!form.model || !form.color || !form.engineNo) return
    if (editId) editInventory(editId, form)
    else        addInventory(form)
    setShowForm(false); setEditId(null); setForm(EMPTY_FORM)
  }

  const totalQty = filtered.reduce((s,r) => s+Number(r.qty||0), 0)

  return (
    <div className="page-wrap">
      <PageHeader title="จัดการสต๊อครถ" subtitle="เพิ่ม แก้ไข และดูสต๊อครถทั้งหมด" />

      {/* Toolbar */}
      <div className="toolbar-wrap" style={S.toolbar}>
        <div style={S.searchBox}>
          <Search size={13} style={{ color:'#444', flexShrink:0 }} />
          <input style={S.searchInput} placeholder="ค้นหา รุ่น / สี / เลขเครื่อง / แชสซี..."
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {['ทั้งหมด',...DEPOTS].map(d=>(
            <button key={d} onClick={()=>setFilterDepot(d)}
              style={{ ...S.filterBtn, ...(filterDepot===d?S.filterOn:{}) }}>{d}</button>
          ))}
        </div>
        <span style={{ fontSize:11, color:'#555', fontFamily:'var(--mono)', whiteSpace:'nowrap' }}>
          {filtered.length} รุ่น / {totalQty} คัน
        </span>
        {can('addStock') && (
          <button onClick={openAdd} style={S.addBtn}><Plus size={13}/> เพิ่มสต๊อก</button>
        )}
      </div>

      {/* Form เพิ่ม/แก้ไข */}
      {showForm && can('addStock') && (
        <div className="page-section" style={S.formCard}>
          <div style={S.formTitle}>{editId ? 'แก้ไขสต๊อก' : 'เพิ่มสต๊อกใหม่'}</div>
          <div style={S.formGrid}>
            <div><label style={S.lbl}>รุ่นรถ *</label>
              <select style={S.inp} value={form.model} onChange={e=>setForm({...form,model:e.target.value})}>
                <option value="">— เลือกรุ่น —</option>
                {MODELS.map(m=><option key={m}>{m}</option>)}
              </select></div>
            <div><label style={S.lbl}>สีรถ *</label>
              <select style={S.inp} value={form.color} onChange={e=>setForm({...form,color:e.target.value})}>
                <option value="">— เลือกสี —</option>
                {COLORS.map(c=><option key={c}>{c}</option>)}
              </select></div>
            <div><label style={S.lbl}>วันที่เลขเครื่องออก</label>
              <input type="date" style={S.inp} value={form.engineDate}
                onChange={e=>setForm({...form,engineDate:e.target.value})} /></div>
            <div><label style={S.lbl}>เลขเครื่อง *</label>
              <input style={S.inp} placeholder="เลขเครื่อง" value={form.engineNo}
                onChange={e=>setForm({...form,engineNo:e.target.value})} /></div>
            <div><label style={S.lbl}>เลขแชสซี</label>
              <input style={S.inp} placeholder="เลขแชสซี MP1TFR..." value={form.chassisNo}
                onChange={e=>setForm({...form,chassisNo:e.target.value})} /></div>
            <div><label style={S.lbl}>สาขาที่ลง</label>
              <select style={S.inp} value={form.depot} onChange={e=>setForm({...form,depot:e.target.value})}>
                {DEPOTS.map(d=><option key={d}>{d}</option>)}
              </select></div>
            <div><label style={S.lbl}>จำนวน (คัน)</label>
              <input type="number" min="1" style={S.inp} value={form.qty}
                onChange={e=>setForm({...form,qty:Number(e.target.value)})} /></div>
            <div style={{ gridColumn:'span 2' }}><label style={S.lbl}>หมายเหตุ</label>
              <input style={S.inp} placeholder="ระบุหมายเหตุของรถ..." value={form.remark}
                onChange={e=>setForm({...form,remark:e.target.value})} /></div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={handleSave} style={S.saveBtn}><Check size={13}/> บันทึก</button>
            <button onClick={()=>{ setShowForm(false); setEditId(null) }} style={S.cancelBtn}>
              <X size={13}/> ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="page-section" style={S.card}>
        <div style={S.cardHead}>
          <span style={S.cardTitle}>รายการสต๊อกทั้งหมด</span>
          <span style={S.chip}>{totalQty} คัน</span>
        </div>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead><tr>
              {['รุ่น','สี','เลขเครื่อง','เลขแชสซี','สาขาที่ลง','วันที่ออก','อายุ (วัน)','จำนวน','หมายเหตุ',
                ...(can('editStock')?['Action']:[])
              ].map(h=><th key={h} style={S.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.length===0 && (
                <tr><td colSpan={10} style={{ ...S.td, textAlign:'center', color:'#333', padding:40 }}>
                  ไม่พบรายการ
                </td></tr>
              )}
              {filtered.map((s,i) => {
                const age = s.engineDate ? getWorkingDays(s.engineDate) : null
                const ageColor = age === null ? '#888' : age > 15 ? '#FF6666' : age > 10 ? '#FCD34D' : '#4ADE80'
                return (
                  <tr key={s.id} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
                    <td style={{ ...S.td, color:'#D0D0D0', fontWeight:500, maxWidth:180,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.model}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontWeight:600, color:'#C0C0C0' }}>{s.color}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{s.engineNo}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:10, color:'#555' }}>{s.chassisNo||'—'}</td>
                    <td style={{ ...S.td, color:'#CC0000', fontWeight:600, fontFamily:'var(--mono)' }}>{s.depot}</td>
                    <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{s.engineDate||'—'}</td>
                    <td style={{ ...S.td, textAlign:'center' }}>
                      {age !== null ? (
                        <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:ageColor }}>{age}</span>
                      ) : '—'}
                    </td>
                    <td style={{ ...S.td, textAlign:'center' }}>
                      <span style={{ fontSize:14, fontWeight:700, fontFamily:'var(--mono)',
                        color: s.qty>0?'#4ADE80':'#555' }}>{s.qty}</span>
                    </td>
                    <td style={{ ...S.td, color:'#555', maxWidth:120, overflow:'hidden',
                      textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.remark||'—'}</td>
                    {can('editStock') && (
                      <td style={{ ...S.td, whiteSpace:'nowrap' }}>
                        <button onClick={()=>openEdit(s)} style={S.iconBtn} title="แก้ไข">
                          <Edit2 size={13}/>
                        </button>
                        {can('deleteStock') && (
                          <button onClick={()=>setConfirmDel(s)} style={{ ...S.iconBtn, color:'#EF4444' }} title="ลบ">
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDel && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalTitle}>ยืนยันลบสต๊อก</div>
            <div style={{ fontSize:12, color:'#888', marginBottom:16 }}>
              {confirmDel.model} · สี {confirmDel.color} · เลขเครื่อง {confirmDel.engineNo}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ deleteInventory(confirmDel.id); setConfirmDel(null) }}
                style={{ ...S.saveBtn, background:'#EF4444' }}><Trash2 size={13}/> ลบ</button>
              <button onClick={()=>setConfirmDel(null)} style={S.cancelBtn}><X size={13}/> ยกเลิก</button>
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
  filterBtn:  { padding:'5px 10px', background:'transparent', border:'1px solid #222', borderRadius:7,
                color:'#555', fontSize:11, cursor:'pointer', whiteSpace:'nowrap' },
  filterOn:   { background:'#CC000018', border:'1px solid #CC000040', color:'#FF6666' },
  addBtn:     { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#CC0000',
                border:'none', borderRadius:8, color:'#fff', fontSize:12, cursor:'pointer',
                fontFamily:'var(--font)', flexShrink:0 },
  formCard:   { background:'#0D0D0D', border:'1px solid #2A2A2A', borderRadius:10,
                padding:16, marginBottom:12, marginLeft:28, marginRight:28 },
  formTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0', marginBottom:12 },
  formGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 },
  lbl:        { fontSize:11, color:'#666', display:'block', marginBottom:4 },
  inp:        { width:'100%', background:'#111', border:'1px solid #2A2A2A', borderRadius:7,
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
  th:         { padding:'7px 10px', textAlign:'left', color:'#444', fontSize:11,
                textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:         { padding:'7px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  iconBtn:    { background:'transparent', border:'none', cursor:'pointer', color:'#666',
                padding:'3px 5px', borderRadius:5, display:'inline-flex', alignItems:'center', marginRight:2 },
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200,
                display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
  modal:      { background:'#111', border:'1px solid #2A2A2A', borderRadius:12, padding:24, width:'100%', maxWidth:380 },
  modalTitle: { fontSize:14, fontWeight:500, color:'#E0E0E0', marginBottom:6 },
}
