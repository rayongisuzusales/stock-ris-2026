export default function MobileHeader({ title }) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-logo">I</div>
      <div style={{ flex:1 }}>
        <div className="mobile-header-title">{title}</div>
        <div className="mobile-header-sub">ระยองอีซูซุเซลส์</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E',
          boxShadow:'0 0 5px #22C55E88' }} />
        <span style={{ fontSize:9, color:'#444', fontFamily:'var(--mono)' }}>LIVE</span>
      </div>
    </header>
  )
}
