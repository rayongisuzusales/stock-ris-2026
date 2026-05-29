import { useState } from 'react'
import { useAuth, MOCK_USERS, ROLE_LABELS, ROLE_COLORS } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { Plus } from 'lucide-react'

const BRANCHES = ['HQ','PD','RY','MP','NK','BK','CK','FC','FR']

const PERM_MATRIX = {
  addStock:    ['admin','stock'],
  editStock:   ['admin','stock'],
  deleteStock: ['admin'],
  matchStock:  ['admin','stock'],
  assignSC:    ['admin','manager'],
  viewStock:   ['admin','stock','manager','sc'],
  viewReport:  ['admin','stock','manager'],
  viewMonitor: ['admin','stock','manager'],
  manageUsers: ['admin'],
}

const ACTION_ROWS = [
  { label:'เพิ่ม/แก้ไข/ลบสต๊อก', actions:['addStock','editStock','deleteStock'] },
  { label:'จับคู่รถ → สาขา',      actions:['matchStock'] },
  { label:'ลง SC (สาขารับรถ)',     actions:['assignSC'] },
  { label:'ดูสต๊อก สี ที่จอด',    actions:['viewStock'] },
  { label:'ดูรายงาน/สรุป',        actions:['viewReport'] },
  { label:'Monitor ครอบครอง',      actions:['viewMonitor'] },
  { label:'จัดการผู้ใช้/สิทธิ์',  actions:['manageUsers'] },
]

export default function UserManagement() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', username:'', password:'1234', role:'sc', branch:'PD' })

  const addUser = () => {
    if (!form.name || !form.username) return
    setUsers(prev => [...prev, { ...form, id:`u${Date.now()}` }])
    setForm({ name:'', username:'', password:'1234', role:'sc', branch:'PD' })
    setShowForm(false)
  }

  return (
    <div className="page-wrap">
      <PageHeader title="จัดการผู้ใช้" subtitle="กำหนดสิทธิ์และบทบาทผู้ใช้งานระบบ" />

      <div className="toolbar-wrap" style={styles.toolbar}>
        <div style={{ fontSize:12, color:'#555' }}>ผู้ใช้ทั้งหมด {users.length} คน</div>
        <button onClick={()=>setShowForm(true)} style={styles.addBtn}><Plus size={13}/> เพิ่มผู้ใช้</button>
      </div>

      {showForm && (
        <div className="page-section" style={styles.formCard}>
          <div style={styles.formTitle}>เพิ่มผู้ใช้ใหม่</div>
          <div style={styles.formGrid}>
            <div><label style={styles.lbl}>ชื่อ-นามสกุล</label>
              <input style={styles.input} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="ชื่อเต็ม"/></div>
            <div><label style={styles.lbl}>Username</label>
              <input style={styles.input} value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="username"/></div>
            <div><label style={styles.lbl}>รหัสผ่าน</label>
              <input type="password" style={styles.input} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
            <div><label style={styles.lbl}>บทบาท</label>
              <select style={styles.input} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                {Object.entries(ROLE_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select></div>
            <div><label style={styles.lbl}>สาขา</label>
              <select style={styles.input} value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}>
                {BRANCHES.map(b=><option key={b}>{b}</option>)}
              </select></div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={addUser} style={styles.saveBtn}>บันทึก</button>
            <button onClick={()=>setShowForm(false)} style={styles.cancelBtn}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* User cards */}
      <div className="page-section" style={styles.userGrid}>
        {users.map(u => {
          const rc = ROLE_COLORS[u.role]
          return (
            <div key={u.id} style={styles.userCard}>
              <div style={styles.avatar}>{u.name.charAt(0)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#E0E0E0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                <div style={{ fontSize:11, color:'#555', fontFamily:'var(--mono)', marginTop:1 }}>{u.username}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                  <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:20,
                    background:rc.bg, color:rc.color, border:`1px solid ${rc.border}` }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  <span style={{ fontSize:11, color:'#555' }}>{u.branch}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Permission matrix */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardTitle}>ตารางสิทธิ์การเข้าถึง</div>
        <div className="table-scroll" style={{ overflowX:'auto', marginTop:12 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>การกระทำ</th>
                {Object.entries(ROLE_LABELS).map(([r,l]) => {
                  const rc = ROLE_COLORS[r]
                  return <th key={r} style={{ ...styles.th, textAlign:'center' }}>
                    <span style={{ fontSize:11, padding:'2px 7px', borderRadius:20, background:rc.bg, color:rc.color }}>{l}</span>
                  </th>
                })}
              </tr>
            </thead>
            <tbody>
              {ACTION_ROWS.map(({ label, actions }, i) => (
                <tr key={label} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
                  <td style={{ ...styles.td, color:'#C0C0C0' }}>{label}</td>
                  {['admin','stock','manager','sc'].map(role => {
                    const allowed = actions.some(a => PERM_MATRIX[a]?.includes(role))
                    return (
                      <td key={role} style={{ ...styles.td, textAlign:'center' }}>
                        <span style={{ fontSize:14, color: allowed?'#22C55E':'#2A2A2A' }}>
                          {allowed ? '✓' : '—'}
                        </span>
                      </td>
                    )
                  })}
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
  toolbar:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px 14px' },
  addBtn:   { display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#CC0000',
              border:'none', borderRadius:8, color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' },
  formCard: { background:'#0D0D0D', border:'1px solid #2A2A2A', borderRadius:10, padding:16, marginBottom:12, marginLeft:28, marginRight:28 },
  formTitle:{ fontSize:13, fontWeight:500, color:'#E0E0E0', marginBottom:12 },
  formGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 },
  lbl:      { fontSize:11, color:'#666', display:'block', marginBottom:5 },
  input:    { width:'100%', background:'#111', border:'1px solid #2A2A2A', borderRadius:7,
              padding:'7px 10px', color:'#E0E0E0', fontSize:13, fontFamily:'var(--font)', outline:'none', boxSizing:'border-box' },
  saveBtn:  { padding:'7px 16px', background:'#CC0000', border:'none', borderRadius:7, color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' },
  cancelBtn:{ padding:'7px 14px', background:'transparent', border:'1px solid #2A2A2A', borderRadius:7, color:'#888', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' },
  userGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10, padding:'0 28px', marginBottom:14 },
  userCard: { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'12px 14px', display:'flex', alignItems:'flex-start', gap:12 },
  avatar:   { width:36, height:36, borderRadius:'50%', background:'#CC000020', border:'1px solid #CC000040',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:600, color:'#CC0000', flexShrink:0 },
  card:     { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardTitle:{ fontSize:13, fontWeight:500, color:'#E0E0E0' },
  table:    { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:       { padding:'8px 10px', textAlign:'left', color:'#444', fontSize:11, textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:       { padding:'8px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
}
