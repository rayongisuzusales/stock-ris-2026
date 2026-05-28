import { LayoutDashboard, Car, CalendarDays, History, Settings, ChevronRight } from 'lucide-react'

const NAV = [
  { id:'dashboard', label:'ภาพรวม',         icon: LayoutDashboard },
  { id:'stock',     label:'สต๊อกปัจจุบัน',  icon: Car },
  { id:'monthly',   label:'รายงานรายเดือน', icon: CalendarDays },
  { id:'history',   label:'ประวัติการขาย',  icon: History },
  { id:'settings',  label:'ตั้งค่า',         icon: Settings },
]

export default function Sidebar({ current, onNav }) {
  return (
    <aside style={styles.aside}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoMark}>
          <span style={styles.logoI}>I</span>
        </div>
        <div>
          <div style={styles.logoName}>ระยองอีซูซุ</div>
          <div style={styles.logoSub}>Stock RIS 2026</div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              style={{ ...styles.navBtn, ...(active ? styles.navActive : {}) }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#CC0000' : '#666', flexShrink:0 }} />
              <span style={{ flex:1, textAlign:'left' }}>{label}</span>
              {active && <ChevronRight size={12} style={{ color:'#CC0000', opacity:.6 }} />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerDot} />
        <div>
          <div style={{ fontSize:11, color:'#555' }}>เชื่อมต่อ Google Sheet</div>
          <div style={{ fontSize:10, color:'#444', fontFamily:'var(--mono)' }}>Stock RIS 2026</div>
        </div>
      </div>
    </aside>
  )
}

const styles = {
  aside: {
    width: 200,
    minWidth: 200,
    background: '#0D0D0D',
    borderRight: '1px solid #1E1E1E',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px 16px',
  },
  logoMark: {
    width: 32,
    height: 32,
    background: '#CC0000',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoI: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: '-0.5px',
  },
  logoName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#F0F0F0',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 10,
    color: '#555',
    fontFamily: 'var(--mono)',
    marginTop: 1,
  },
  divider: {
    height: 1,
    background: '#1A1A1A',
    margin: '0 12px 12px',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 8px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 7,
    border: 'none',
    background: 'transparent',
    color: '#777',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all .15s',
    width: '100%',
  },
  navActive: {
    background: '#CC000012',
    color: '#F0F0F0',
    border: '1px solid #CC000025',
  },
  footer: {
    padding: '12px 16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: '1px solid #1A1A1A',
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#22C55E',
    boxShadow: '0 0 6px #22C55E88',
  },
}
