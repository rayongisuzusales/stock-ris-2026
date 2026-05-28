import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
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

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page] || Dashboard

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar current={page} onNav={setPage} />
      <main style={{ flex:1, overflow:'auto', animation:'fadeIn .25s ease' }}>
        <Page />
      </main>
    </div>
  )
}
