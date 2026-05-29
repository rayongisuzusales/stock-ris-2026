import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useStock } from '../context/StockContext.jsx'
import { AlertTriangle, Car, Clock, CheckCircle, FileText, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MOCK_MONTHLY } from '../utils/sheetsApi.js'
import PageHeader from '../components/PageHeader.jsx'

// ── helpers ──────────────────────────────────────
const ROLE_COLORS = { admin:'#CC0000', stock:'#A855F7', manager:'#1D9E75', sc:'#F59E0B' }

function KPI({ label, value, sub, color='#F0F0F0', accent }) {
  return (
    <div style={{ background:'#111', border:`1px solid ${accent||'#1E1E1E'}`, borderRadius:10, padding:'13px 15px' }}>
      {accent && <div style={{ height:2, background:accent, marginBottom:8, borderRadius:1 }} />}
      <div style={{ fontSize:11, color:'#555', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:600, lineHeight:1, color }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#444', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

function AlertBanner({ count, text, color='#FF6666' }) {
  if (!count) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:`${color}12`,
      border:`1px solid ${color}30`, borderRadius:10, padding:'11px 16px', marginBottom:10,
      marginLeft:28, marginRight:28 }}>
      <AlertTriangle size={15} style={{ color, flexShrink:0 }} />
      <span style={{ fontSize:13, color, fontWeight:500 }}>{text}</span>
    </div>
  )
}

function RequestCard({ req, color='#555' }) {
  const STATUS_LABEL = {
    pending_manager:'รอผู้จัดการ', approved:'อนุมัติแล้ว',
    matched:'จับคู่แล้ว', sc_assigned:'ลง SC แล้ว',
    rejected:'ปฏิเสธ', completed:'เสร็จสิ้น',
  }
  const STATUS_COLOR = {
    pending_manager:'#F59E0B', approved:'#3B82F6',
    matched:'#A855F7', sc_assigned:'#22C55E',
    rejected:'#EF4444', completed:'#22C55E',
  }
  const sc = STATUS_COLOR[req.status] || '#666'
  return (
    <div style={{ background:'#111', border:'1px solid #1E1E1E', borderRadius:8,
      padding:'10px 12px', display:'flex', alignItems:'flex-start', gap:10 }}>
      <div style={{ width:3, borderRadius:2, alignSelf:'stretch', background:sc, flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:500, color:'#D0D0D0', overflow:'hidden',
          textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {req.customerName} — {req.model}
        </div>
        <div style={{ fontSize:11, color:'#666', marginTop:2 }}>{req.color} · {req.branch} · SC: {req.scName}</div>
      </div>
      <span style={{ fontSize:10, fontWeight:500, padding:'2px 7px', borderRadius:10,
        background:`${sc}18`, color:sc, flexShrink:0 }}>
        {STATUS_LABEL[req.status] || req.status}
      </span>
    </div>
  )
}

// ────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { inventory, requests, getWorkingDays, getAgedStock } = useStock()
  const role = user?.role
  const branch = user?.branch

  // สต๊อคว่าง
  const freeStock = useMemo(() => inventory.filter(s => s.qty > 0), [inventory])

  // คำขอที่ Match แล้ว (มี matchDate) — นับวันทำงาน
  const matchedReqs = useMemo(() =>
    requests.filter(r => r.matchDate)
      .map(r => ({ ...r, workDays: getWorkingDays(r.matchDate) }))
  , [requests, getWorkingDays])

  const overdueMatched = matchedReqs.filter(r => r.workDays > 7)

  // สต๊อคอายุเกิน 15 วัน
  const agedStock = getAgedStock()

  const monthly = MOCK_MONTHLY
  const chartData = [...monthly].reverse().map(m=>({ name:m.name.replace(' 69',''), total:m.total }))

  // ── SC Dashboard ────────────────────────────────
  if (role === 'sc') {
    const myRequests = requests.filter(r => r.scId === user?.id)
    const myMatched  = matchedReqs.filter(r => r.scId === user?.id)
    const myOverdue  = myMatched.filter(r => r.workDays > 7)

    return (
      <div className="page-wrap">
        <PageHeader title={`สวัสดี ${user?.name}`} subtitle={`SC · สาขา ${branch}`} />

        <AlertBanner count={myOverdue.length}
          text={`มีรถ ${myOverdue.length} คัน ที่ Match แล้วเกิน 7 วันทำงาน — กรุณาติดตาม`} />

        <div className="kpi-grid" style={S.kpiGrid}>
          <KPI label="สต๊อคว่างทั้งหมด"   value={freeStock.length}    sub="คันที่พร้อมจับคู่"    accent="#3B82F6" color="#60A5FA" />
          <KPI label="คำขอของฉัน"          value={myRequests.length}  sub="ทุกสถานะ"            accent="#F59E0B" color="#FCD34D" />
          <KPI label="รอผู้จัดการ"          value={myRequests.filter(r=>r.status==='pending_manager').length} sub="รอดำเนินการ" accent="#A855F7" color="#C084FC" />
          <KPI label="เกินกำหนด >7 วัน"    value={myOverdue.length}   sub="ต้องติดตาม"          accent="#CC0000" color="#FF6666" />
        </div>

        {/* สต๊อคว่าง */}
        <Section title="สต๊อคว่าง — พร้อมขอรถ" count={freeStock.length}>
          <div style={S.stockGrid}>
            {freeStock.slice(0,6).map(s => (
              <div key={s.id} style={S.stockCard}>
                <div style={{ fontSize:12, fontWeight:500, color:'#D0D0D0' }}>{s.model}</div>
                <div style={{ fontSize:11, color:'#555', marginTop:2 }}>สี {s.color} · {s.depot}</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#3B82F6', fontFamily:'var(--mono)',
                  marginTop:6 }}>{s.qty} คัน</div>
              </div>
            ))}
          </div>
        </Section>

        {/* คำขอของฉัน */}
        <Section title="คำขอรถของฉัน" count={myRequests.length}>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {myRequests.length===0
              ? <div style={S.empty}>ยังไม่มีคำขอ</div>
              : myRequests.map(r => <RequestCard key={r.id} req={r} />)}
          </div>
        </Section>

        {/* Match แล้วเกิน 7 วัน */}
        {myOverdue.length > 0 && (
          <Section title="⚠ Match แล้วเกิน 7 วันทำงาน" count={myOverdue.length}>
            <OverdueTable rows={myOverdue} />
          </Section>
        )}
      </div>
    )
  }

  // ── Manager Dashboard ────────────────────────────
  if (role === 'manager') {
    const branchRequests = requests.filter(r => r.branch === branch)
    const branchMatched  = matchedReqs.filter(r => r.branch === branch)
    const branchOverdue  = branchMatched.filter(r => r.workDays > 7)
    const pendingApproval = branchRequests.filter(r => r.status === 'pending_manager')

    return (
      <div className="page-wrap">
        <PageHeader title={`สวัสดี ${user?.name}`} subtitle={`ผู้จัดการ · สาขา ${branch}`} />

        <AlertBanner count={pendingApproval.length}
          text={`มีคำขอรถ ${pendingApproval.length} รายการ รอการอนุมัติจากคุณ`} color="#F59E0B" />
        <AlertBanner count={branchOverdue.length}
          text={`มีรถ ${branchOverdue.length} คัน ที่ Match แล้วเกิน 7 วันทำงาน — กรุณาดำเนินการ`} />

        <div className="kpi-grid" style={S.kpiGrid}>
          <KPI label="สต๊อคว่างทั้งหมด"    value={freeStock.length}          sub="คัน"              accent="#3B82F6" color="#60A5FA" />
          <KPI label="อายุเกิน 15 วัน"      value={agedStock.length}          sub="ต้องเร่งขาย"      accent="#F59E0B" color="#FCD34D" />
          <KPI label="Match แล้ว (สาขา)"   value={branchMatched.length}      sub={`สาขา ${branch}`} accent="#A855F7" color="#C084FC" />
          <KPI label="เกินกำหนด >7 วัน"    value={branchOverdue.length}      sub="ต้องติดตาม"       accent="#CC0000" color="#FF6666" />
        </div>

        {/* รอการอนุมัติ */}
        {pendingApproval.length > 0 && (
          <Section title="รอการอนุมัติจากคุณ" count={pendingApproval.length}>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {pendingApproval.map(r => <RequestCard key={r.id} req={r} />)}
            </div>
          </Section>
        )}

        {/* สต๊อคอายุเกิน 15 วัน */}
        {agedStock.length > 0 && (
          <Section title="⚠ สต๊อคอายุเกิน 15 วัน" count={agedStock.length}>
            <AgedStockTable rows={agedStock} getWD={getWorkingDays} />
          </Section>
        )}

        {/* Match แล้วเกิน 7 วัน */}
        {branchOverdue.length > 0 && (
          <Section title="⚠ Match แล้วเกิน 7 วันทำงาน (สาขาตัวเอง)" count={branchOverdue.length}>
            <OverdueTable rows={branchOverdue} />
          </Section>
        )}

        {/* สต๊อคจับคู่กับสาขาตัวเอง */}
        <Section title={`รถที่จับคู่กับสาขา ${branch}`} count={branchMatched.length}>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {branchMatched.length===0
              ? <div style={S.empty}>ยังไม่มีรถที่จับคู่</div>
              : branchMatched.map(r => <RequestCard key={r.id} req={r} />)}
          </div>
        </Section>
      </div>
    )
  }

  // ── Stock / Admin Dashboard ──────────────────────
  const totalMatched  = matchedReqs.length
  const totalOverdue  = overdueMatched.length
  const pendingStock  = requests.filter(r => r.status === 'approved').length

  return (
    <div className="page-wrap">
      <PageHeader title={`สวัสดี ${user?.name}`} subtitle="ภาพรวมระบบสต๊อก" lastSync="อัพเดตล่าสุด" />

      <AlertBanner count={totalOverdue}
        text={`มีรถ ${totalOverdue} คัน Match แล้วเกิน 7 วัน`} />
      <AlertBanner count={pendingStock}
        text={`มีคำขอ ${pendingStock} รายการ รออนุมัติแล้ว — รอ Stock จับคู่`} color="#A855F7" />

      <div className="kpi-grid" style={S.kpiGrid}>
        <KPI label="สต๊อคว่างทั้งหมด"  value={freeStock.length}  sub="คันพร้อมจับคู่"    accent="#3B82F6" color="#60A5FA" />
        <KPI label="อายุสต๊อค >15 วัน" value={agedStock.length}  sub="ต้องเร่งดำเนินการ" accent="#F59E0B" color="#FCD34D" />
        <KPI label="รอ Stock จับคู่"    value={pendingStock}      sub="อนุมัติแล้ว"        accent="#A855F7" color="#C084FC" />
        <KPI label="เกินกำหนด >7 วัน"  value={totalOverdue}      sub="Match ค้าง"         accent="#CC0000" color="#FF6666" />
      </div>

      <div className="two-col-layout" style={S.twoCol}>
        {/* ยอดขายรายเดือน */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>ยอดขายรายเดือน ปี 69</span></div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'#999' }} itemStyle={{ color:'#F0F0F0' }} />
              <Bar dataKey="total" radius={[3,3,0,0]}>
                {chartData.map((_,i,arr)=>(
                  <Cell key={i} fill={i===arr.length-1?'#CC000055':'#CC0000'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* สต๊อคว่าง top */}
        <div style={S.card}>
          <div style={S.cardHead}><span style={S.cardTitle}>สต๊อคว่าง Top 6</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {freeStock.slice(0,6).map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:'#C0C0C0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.model}</div>
                  <div style={{ fontSize:10, color:'#555' }}>สี {s.color} · {s.depot}</div>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:'#3B82F6', fontFamily:'var(--mono)' }}>{s.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* คำขอล่าสุด */}
      <Section title="คำขอรถล่าสุด" count={requests.length}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[...requests].reverse().slice(0,8).map(r => <RequestCard key={r.id} req={r} />)}
        </div>
      </Section>

      {/* Overdue */}
      {overdueMatched.length > 0 && (
        <Section title="⚠ Match แล้วเกิน 7 วันทำงาน" count={overdueMatched.length}>
          <OverdueTable rows={overdueMatched} />
        </Section>
      )}
    </div>
  )
}

// ── Sub components ───────────────────────────────
function Section({ title, count, children }) {
  return (
    <div className="page-section" style={S.card}>
      <div style={S.cardHead}>
        <span style={S.cardTitle}>{title}</span>
        {count !== undefined && (
          <span style={S.chip}>{count} รายการ</span>
        )}
      </div>
      {children}
    </div>
  )
}

function OverdueTable({ rows }) {
  if (!rows.length) return <div style={S.empty}>ไม่มีรายการ</div>
  return (
    <div className="table-scroll" style={{ overflowX:'auto' }}>
      <table style={S.table}>
        <thead><tr>
          {['ลูกค้า','รุ่น','สี','สาขา','SC','วันแมท','วันทำงาน'].map(h=>(
            <th key={h} style={S.th}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={r.id} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
              <td style={S.td}>{r.customerName}</td>
              <td style={{ ...S.td, color:'#D0D0D0' }}>{r.model}</td>
              <td style={{ ...S.td, fontFamily:'var(--mono)' }}>{r.color}</td>
              <td style={{ ...S.td, color:'#CC0000', fontWeight:600, fontFamily:'var(--mono)' }}>{r.branch}</td>
              <td style={S.td}>{r.scName}</td>
              <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{r.matchDate}</td>
              <td style={{ ...S.td, textAlign:'center' }}>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:'#FF6666' }}>{r.workDays}</span>
                <span style={{ fontSize:10, color:'#555', marginLeft:3 }}>วัน</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AgedStockTable({ rows, getWD }) {
  return (
    <div className="table-scroll" style={{ overflowX:'auto' }}>
      <table style={S.table}>
        <thead><tr>
          {['รุ่น','สี','เลขเครื่อง','ที่จอด','วันที่ออก','อายุ (วัน)'].map(h=>(
            <th key={h} style={S.th}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((s,i) => {
            const age = getWD(s.engineDate)
            return (
              <tr key={s.id} style={{ background:i%2===0?'transparent':'#0A0A0A' }}>
                <td style={{ ...S.td, color:'#D0D0D0' }}>{s.model}</td>
                <td style={{ ...S.td, fontFamily:'var(--mono)' }}>{s.color}</td>
                <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{s.engineNo}</td>
                <td style={{ ...S.td, color:'#CC0000', fontFamily:'var(--mono)', fontWeight:600 }}>{s.depot}</td>
                <td style={{ ...S.td, fontFamily:'var(--mono)', fontSize:11 }}>{s.engineDate}</td>
                <td style={{ ...S.td, textAlign:'center' }}>
                  <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)',
                    color: age>15?'#FF6666':'#FCD34D' }}>{age}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const S = {
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, padding:'0 28px', marginBottom:14 },
  twoCol:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, padding:'0 28px', marginBottom:12 },
  card:    { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'14px 16px',
             marginBottom:12, marginLeft:28, marginRight:28 },
  cardHead:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  cardTitle:{ fontSize:13, fontWeight:500, color:'#E0E0E0' },
  chip:    { fontSize:10, padding:'2px 8px', borderRadius:20, background:'#CC000020', color:'#CC0000', fontFamily:'var(--mono)' },
  stockGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:8 },
  stockCard:{ background:'#0D0D0D', border:'1px solid #1E1E1E', borderRadius:8, padding:'10px 12px' },
  table:   { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th:      { padding:'7px 10px', textAlign:'left', color:'#444', fontSize:11,
             textTransform:'uppercase', borderBottom:'1px solid #1E1E1E', whiteSpace:'nowrap' },
  td:      { padding:'7px 10px', color:'#888', borderBottom:'1px solid #0F0F0F', whiteSpace:'nowrap' },
  empty:   { textAlign:'center', color:'#333', padding:'20px 0', fontSize:13 },
}
