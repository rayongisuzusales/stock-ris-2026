import { LayoutDashboard, Car, FileText, Monitor, Package, BarChart3,
  CalendarDays, History, Users, Settings } from 'lucide-react'

const PAGE_ICONS = {
  dashboard:LayoutDashboard, request:FileText,    stockmgr:Package,
  stock:Car,                 monitor:Monitor,     monthly:CalendarDays,
  report:BarChart3,          history:History,     users:Users, settings:Settings,
}

export default function BottomNav({ current, onNav, navItems = [] }) {
  const items = navItems.slice(0, 5)
  return (
    <nav className="bottom-nav">
      {items.map(({ id, label }) => {
        const active = current === id
        const Icon   = PAGE_ICONS[id] || Car
        return (
          <button key={id} className={`bottom-nav-btn${active?' active':''}`} onClick={()=>onNav(id)}>
            <Icon size={20} strokeWidth={active?2.5:1.8} style={{ color:active?'#CC0000':'#555' }}/>
            <span style={{ fontSize:9 }}>{label.slice(0,6)}</span>
          </button>
        )
      })}
    </nav>
  )
}
