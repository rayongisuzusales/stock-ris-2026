import { ChevronRight, LogOut } from 'lucide-react'
import { useAuth, ROLE_LABELS, ROLE_COLORS } from '../context/AuthContext.jsx'
import * as Icons from 'lucide-react'

const PAGE_ICONS = {
  dashboard: 'LayoutDashboard',
  monitor:   'Monitor',
  stock:     'Car',
  allocate:  'ArrowLeftRight',
  monthly:   'CalendarDays',
  report:    'BarChart3',
  history:   'History',
  users:     'Users',
  settings:  'Settings',
}

export default function Sidebar({ current, onNav, navItems = [] }) {
  const { user, logout } = useAuth()
  const rc = ROLE_COLORS[user?.role] || {}

  return (
    <aside className="sidebar" style={styles.aside}>
      <div style={styles.logo}>
        <div style={styles.logoMark}><span style={{ color:'#fff', fontWeight:700, fontSize:17 }}>I</span></div>
        <div>
          <div style={styles.logoName}>ระยองอีซูซุ</div>
          <div style={styles.logoSub}>Stock RIS 2026</div>
        </div>
      </div>

      {/* User badge */}
      {user && (
        <div style={styles.userBadge}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:rc.bg,
            border:`1px solid ${rc.border}`, display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:13, fontWeight:600, color:rc.color, flexShrink:0 }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, color:'#D0D0D0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
            <span style={{ fontSize:10, padding:'1px 6px', borderRadius:10,
              background:rc.bg, color:rc.color, border:`1px solid ${rc.border}` }}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      )}

      <div style={styles.divider} />

      <nav style={styles.nav}>
        {navItems.map(({ id, label }) => {
          const active = current === id
          const iconName = PAGE_ICONS[id] || 'Circle'
          const Icon = Icons[iconName] || Icons.Circle
          return (
            <button key={id} onClick={() => onNav(id)}
              style={{ ...styles.navBtn, ...(active ? styles.navActive : {}) }}>
              <Icon size={15} strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#CC0000' : '#666', flexShrink:0 }} />
              <span style={{ flex:1, textAlign:'left', fontSize:13 }}>{label}</span>
              {active && <ChevronRight size={11} style={{ color:'#CC0000', opacity:.5 }} />}
            </button>
          )
        })}
      </nav>

      <div style={styles.footer}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E',
            boxShadow:'0 0 6px #22C55E88', flexShrink:0 }} />
          <div style={{ fontSize:10, color:'#444', fontFamily:'var(--mono)', overflow:'hidden', textOverflow:'ellipsis' }}>Stock RIS 2026</div>
        </div>
        <button onClick={logout} style={styles.logoutBtn} title="ออกจากระบบ">
          <LogOut size={13}/>
        </button>
      </div>
    </aside>
  )
}

const styles = {
  aside:     { width:200, minWidth:200, background:'#0D0D0D', borderRight:'1px solid #1E1E1E',
               display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', overflow:'hidden' },
  logo:      { display:'flex', alignItems:'center', gap:10, padding:'16px 14px 12px' },
  logoMark:  { width:30, height:30, background:'#CC0000', borderRadius:6, display:'flex',
               alignItems:'center', justifyContent:'center', flexShrink:0 },
  logoName:  { fontSize:13, fontWeight:600, color:'#F0F0F0', lineHeight:1.2 },
  logoSub:   { fontSize:10, color:'#555', fontFamily:'var(--mono)', marginTop:1 },
  userBadge: { display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
               background:'#111', borderTop:'1px solid #1A1A1A', borderBottom:'1px solid #1A1A1A', margin:'0' },
  divider:   { height:1, background:'#1A1A1A', margin:'8px 10px' },
  nav:       { flex:1, display:'flex', flexDirection:'column', gap:1, padding:'0 6px', overflowY:'auto' },
  navBtn:    { display:'flex', alignItems:'center', gap:9, padding:'7px 8px', borderRadius:7,
               border:'none', background:'transparent', color:'#777', cursor:'pointer',
               transition:'all .15s', width:'100%' },
  navActive: { background:'#CC000012', color:'#F0F0F0', border:'1px solid #CC000025' },
  footer:    { padding:'10px 12px 14px', display:'flex', alignItems:'center', gap:8,
               borderTop:'1px solid #1A1A1A' },
  logoutBtn: { background:'transparent', border:'none', cursor:'pointer', color:'#555',
               padding:4, borderRadius:5, display:'flex', alignItems:'center' },
}
