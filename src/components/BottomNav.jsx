import { LayoutDashboard, Car, CalendarDays, History, Settings } from 'lucide-react'

const NAV = [
  { id:'dashboard', label:'ภาพรวม',   icon: LayoutDashboard },
  { id:'stock',     label:'สต๊อก',     icon: Car },
  { id:'monthly',   label:'รายเดือน',  icon: CalendarDays },
  { id:'history',   label:'ประวัติ',   icon: History },
  { id:'settings',  label:'ตั้งค่า',   icon: Settings },
]

export default function BottomNav({ current, onNav }) {
  return (
    <nav className="bottom-nav">
      {NAV.map(({ id, label, icon: Icon }) => {
        const active = current === id
        return (
          <button
            key={id}
            className={`bottom-nav-btn${active ? ' active' : ''}`}
            onClick={() => onNav(id)}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8}
              style={{ color: active ? '#CC0000' : '#555' }} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
