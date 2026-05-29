import { createContext, useContext, useState } from 'react'

export const ROLES = { ADMIN:'admin', STOCK:'stock', MANAGER:'manager', SC:'sc' }

export const ROLE_LABELS = { admin:'Admin', stock:'Stock', manager:'ผู้จัดการสาขา', sc:'SC' }

export const ROLE_COLORS = {
  admin:   { bg:'#CC000018', color:'#FF6666', border:'#CC000030' },
  stock:   { bg:'#A855F718', color:'#C084FC', border:'#A855F730' },
  manager: { bg:'#1D9E7518', color:'#34D399', border:'#1D9E7530' },
  sc:      { bg:'#F59E0B18', color:'#FCD34D', border:'#F59E0B30' },
}

export const CAN = {
  addStock:    r => ['admin','stock'].includes(r),
  editStock:   r => ['admin','stock'].includes(r),
  deleteStock: r => ['admin'].includes(r),
  matchStock:  r => ['admin','stock'].includes(r),
  assignSC:    r => ['admin','manager'].includes(r),
  viewStock:   r => ['admin','stock','manager','sc'].includes(r),
  viewReport:  r => ['admin','stock','manager'].includes(r),
  manageUsers: r => ['admin'].includes(r),
  viewMonitor: r => ['admin','stock','manager'].includes(r),
}

export const MOCK_USERS = [
  { id:'u1', name:'สมชาย รักดี',     username:'admin',  password:'1234', role:'admin',   branch:'HQ' },
  { id:'u2', name:'วิไล สต๊อกเก่ง',  username:'stock1', password:'1234', role:'stock',   branch:'HQ' },
  { id:'u3', name:'ประสิทธิ์ ใจดี',  username:'mgr_pd', password:'1234', role:'manager', branch:'PD' },
  { id:'u4', name:'กมลา ขยัน',       username:'mgr_ry', password:'1234', role:'manager', branch:'RY' },
  { id:'u5', name:'นิรันดร์ ขายดี',  username:'sc_pd1', password:'1234', role:'sc',      branch:'PD' },
  { id:'u6', name:'สุดา พิมพ์ใจ',    username:'sc_mp1', password:'1234', role:'sc',      branch:'MP' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  const login = (username, password) => {
    const found = MOCK_USERS.find(u => u.username===username && u.password===password)
    if (found) { setUser(found); setError(''); return true }
    setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    return false
  }

  const logout = () => setUser(null)
  const can = (action) => user ? (CAN[action]?.(user.role) ?? false) : false

  return (
    <AuthContext.Provider value={{ user, login, logout, can, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
