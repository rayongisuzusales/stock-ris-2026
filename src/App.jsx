import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import BottomNav from './components/BottomNav.jsx'
import MobileHeader from './components/MobileHeader.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CurrentStock from './pages/CurrentStock.jsx'
import Monthly from './pages/Monthly.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'

const PAGES = {
  dashboard: Dashboard,
  stock:     CurrentStock,
  monthly:   Monthly,
  history:   History,
  settings:  Settings,
}

const PAGE_TITLES = {
  dashboard: 'ภาพรวม',
  stock:     'สต๊อกปัจจุบัน',
  monthly:   'รายงานรายเดือน',
  history:   'ประวัติการขาย',
  settings:  'ตั้งค่า',
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page] || Dashboard

  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <Sidebar current={page} onNav={setPage} />

      {/* Mobile top header */}
      <MobileHeader title={PAGE_TITLES[page]} />

      {/* Main content */}
      <main className="main-content" key={page}>
        <Page />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav current={page} onNav={setPage} />
    </div>
  )
}
