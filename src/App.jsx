import { useState } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import BottomNav from './components/BottomNav.jsx'
import MobileHeader from './components/MobileHeader.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CurrentStock from './pages/CurrentStock.jsx'
import Monthly from './pages/Monthly.jsx'
import History from './pages/History.jsx'
import Monitor from './pages/Monitor.jsx'
import Allocate from './pages/Allocate.jsx'
import Report from './pages/Report.jsx'
import UserManagement from './pages/UserManagement.jsx'
import Settings from './pages/Settings.jsx'

const ALL_PAGES = {
  dashboard: { component:Dashboard,     label:'ภาพรวม',         roles:['admin','stock','manager','sc'] },
  monitor:   { component:Monitor,        label:'Monitor สต๊อก',  roles:['admin','stock','manager'] },
  stock:     { component:CurrentStock,   label:'สต๊อกปัจจุบัน', roles:['admin','stock','manager','sc'] },
  allocate:  { component:Allocate,       label:'จับคู่สต๊อก',    roles:['admin','stock','manager'] },
  monthly:   { component:Monthly,        label:'รายงานรายเดือน', roles:['admin','stock','manager'] },
  report:    { component:Report,         label:'สรุปรายงาน',     roles:['admin','stock','manager'] },
  history:   { component:History,        label:'ประวัติการขาย',  roles:['admin','stock','manager'] },
  users:     { component:UserManagement, label:'จัดการผู้ใช้',   roles:['admin'] },
  settings:  { component:Settings,       label:'ตั้งค่า',         roles:['admin','stock'] },
}

export default function App() {
  const { user } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (!user) return <LoginPage />

  const role = user.role
  const navItems = Object.entries(ALL_PAGES)
    .filter(([, p]) => p.roles.includes(role))
    .map(([id, p]) => ({ id, label: p.label }))

  const activePage = ALL_PAGES[page]?.roles?.includes(role) ? page : 'dashboard'
  const PageComp   = ALL_PAGES[activePage]?.component || Dashboard
  const pageLabel  = ALL_PAGES[activePage]?.label || 'ภาพรวม'

  const navigate = (id) => {
    if (ALL_PAGES[id]?.roles?.includes(role)) setPage(id)
  }

  return (
    <div className="app-layout">
      <Sidebar current={activePage} onNav={navigate} navItems={navItems} />
      <MobileHeader title={pageLabel} />
      <main className="main-content" key={activePage}>
        <PageComp />
      </main>
      <BottomNav current={activePage} onNav={navigate} navItems={navItems} />
    </div>
  )
}
