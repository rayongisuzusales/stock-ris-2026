import * as Icons from 'lucide-react'

const PAGE_ICONS = {
  dashboard:'LayoutDashboard', monitor:'Monitor', stock:'Car',
  allocate:'ArrowLeftRight', monthly:'CalendarDays', report:'BarChart3',
  history:'History', users:'Users', settings:'Settings',
}

export default function BottomNav({ current, onNav, navItems = [] }) {
  // Mobile bottom nav: max 5 items
  const items = navItems.slice(0, 5)
  return (
    <nav className="bottom-nav">
      {items.map(({ id, label }) => {
        const active = current === id
        const iconName = PAGE_ICONS[id] || 'Circle'
        const Icon = Icons[iconName] || Icons.Circle
        return (
          <button key={id} className={`bottom-nav-btn${active?' active':''}`} onClick={()=>onNav(id)}>
            <Icon size={20} strokeWidth={active?2.5:1.8} style={{ color:active?'#CC0000':'#555' }}/>
            <span style={{ fontSize:9 }}>{label.slice(0,5)}</span>
          </button>
        )
      })}
    </nav>
  )
}
