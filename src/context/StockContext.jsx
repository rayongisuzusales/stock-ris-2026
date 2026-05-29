import { createContext, useContext, useState, useCallback } from 'react'

export function countWorkingDays(fromDate, toDate) {
  let count = 0
  const d = new Date(fromDate)
  const end = new Date(toDate)
  d.setHours(0,0,0,0); end.setHours(0,0,0,0)
  while (d < end) {
    if (d.getDay() !== 0) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

const today = new Date()
const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10) }
const dateStr = d => d.toISOString().slice(0,10)

// ── สต๊อครถ (inventory) ─────────────────────────────────────────
export const INITIAL_STOCK_INVENTORY = [
  { id:1,  model:'Cab4 2.2 Ddi L',              color:'SBW', code:'URD10', engineDate:daysAgo(30), engineNo:'FGT001', chassisNo:'MP1TFR41K001', depot:'RY', qty:3, remark:'' },
  { id:2,  model:'Cab4 2.2 Ddi L',              color:'BOS', code:'URD20', engineDate:daysAgo(20), engineNo:'FGT002', chassisNo:'MP1TFR41K002', depot:'PD', qty:2, remark:'' },
  { id:3,  model:'HR 4Drs 2.2 Ddi Z AT',        color:'DWP', code:'USB30', engineDate:daysAgo(25), engineNo:'FHK001', chassisNo:'MP1TFR41K003', depot:'RY', qty:2, remark:'' },
  { id:4,  model:'HR 4Drs 2.2 Ddi Z',           color:'ELG', code:'USC20', engineDate:daysAgo(18), engineNo:'FHK002', chassisNo:'MP1TFR41K004', depot:'PD', qty:3, remark:'' },
  { id:5,  model:'Mu-X 4x2 2.2 Active',         color:'BOS', code:'UUA20', engineDate:daysAgo(15), engineNo:'FJM001', chassisNo:'MP1TFR41K005', depot:'RY', qty:2, remark:'รอโชว์รูม' },
  { id:6,  model:'Mu-X 4x2 2.2 Elegant',        color:'DWP', code:'UUB30', engineDate:daysAgo(22), engineNo:'FJM002', chassisNo:'MP1TFR41K006', depot:'PD', qty:1, remark:'' },
  { id:7,  model:'HR 4Drs 2.2 Ddi L AT',        color:'ELG', code:'USB20', engineDate:daysAgo(10), engineNo:'FKN001', chassisNo:'MP1TFR41K007', depot:'RY', qty:2, remark:'' },
  { id:8,  model:'Cab4 2.2 Ddi S',              color:'SBW', code:'URA20', engineDate:daysAgo(16), engineNo:'FKN002', chassisNo:'MP1TFR41K008', depot:'PD', qty:4, remark:'' },
  { id:9,  model:'Spacecab 2.2 Ddi S AT',       color:'SBW', code:'UPH10', engineDate:daysAgo(28), engineNo:'FLP001', chassisNo:'MP1TFR41K009', depot:'RY', qty:1, remark:'' },
  { id:10, model:'X-Series Speed 4Drs',         color:'BAB', code:'URE10', engineDate:daysAgo(5),  engineNo:'FLP002', chassisNo:'MP1TFR41K010', depot:'PD', qty:2, remark:'ด่วน' },
]

// ── คำขอรถ (request flow) ────────────────────────────────────────
// status: pending_manager | approved | rejected | matched | sc_assigned | completed
export const INITIAL_REQUESTS = [
  { id:'r1', scId:'u5', scName:'นิรันดร์ ขายดี', branch:'PD',
    customerName:'สมศักดิ์ จันทร์ดี', model:'Cab4 2.2 Ddi L', color:'SBW',
    bookingDate: daysAgo(12), expectedDate: daysAgo(-5),
    requestDate: daysAgo(12), status:'matched',
    approvedBy:'ประสิทธิ์ ใจดี', approvedDate: daysAgo(11),
    matchedStockId:1, engineNo:'FGT001', chassisNo:'MP1TFR41K001', matchDate: daysAgo(10),
    remark:'' },
  { id:'r2', scId:'u5', scName:'นิรันดร์ ขายดี', branch:'PD',
    customerName:'วารี สุขใจ', model:'HR 4Drs 2.2 Ddi Z', color:'ELG',
    bookingDate: daysAgo(3), expectedDate: daysAgo(-10),
    requestDate: daysAgo(3), status:'pending_manager',
    approvedBy:'', approvedDate:'', matchedStockId:null, engineNo:'', chassisNo:'', matchDate:'',
    remark:'' },
  { id:'r3', scId:'u6', scName:'สุดา พิมพ์ใจ', branch:'MP',
    customerName:'พิชัย มีสุข', model:'Mu-X 4x2 2.2 Active', color:'BOS',
    bookingDate: daysAgo(8), expectedDate: daysAgo(-3),
    requestDate: daysAgo(8), status:'approved',
    approvedBy:'มนัส ผู้จัดการ', approvedDate: daysAgo(7),
    matchedStockId:null, engineNo:'', chassisNo:'', matchDate:'',
    remark:'ลูกค้า VIP' },
  { id:'r4', scId:'u5', scName:'นิรันดร์ ขายดี', branch:'PD',
    customerName:'อรุณ แสงทอง', model:'HR 4Drs 2.2 Ddi Z AT', color:'DWP',
    bookingDate: daysAgo(20), expectedDate: daysAgo(-2),
    requestDate: daysAgo(20), status:'sc_assigned',
    approvedBy:'ประสิทธิ์ ใจดี', approvedDate: daysAgo(19),
    matchedStockId:3, engineNo:'FHK001', chassisNo:'MP1TFR41K003', matchDate: daysAgo(18),
    remark:'' },
]

const StockContext = createContext(null)

export function StockProvider({ children }) {
  const [inventory, setInventory] = useState(INITIAL_STOCK_INVENTORY)
  const [requests, setRequests]   = useState(INITIAL_REQUESTS)

  // ── Inventory CRUD ──
  const addInventory = useCallback((item) => {
    setInventory(prev => [...prev, { ...item, id: Date.now() }])
  }, [])

  const editInventory = useCallback((id, updates) => {
    setInventory(prev => prev.map(s => s.id===id ? { ...s, ...updates } : s))
  }, [])

  const deleteInventory = useCallback((id) => {
    setInventory(prev => prev.filter(s => s.id !== id))
  }, [])

  // ── Request flow ──
  // SC สร้างคำขอ
  const createRequest = useCallback((data) => {
    const newReq = {
      ...data,
      id: `r${Date.now()}`,
      requestDate: dateStr(new Date()),
      status: 'pending_manager',
      approvedBy:'', approvedDate:'',
      matchedStockId:null, engineNo:'', chassisNo:'', matchDate:'', remark: data.remark || '',
    }
    setRequests(prev => [...prev, newReq])
    return newReq.id
  }, [])

  // ผู้จัดการ อนุมัติ/ปฏิเสธ
  const approveRequest = useCallback((id, managerName) => {
    setRequests(prev => prev.map(r => r.id===id
      ? { ...r, status:'approved', approvedBy:managerName, approvedDate:dateStr(new Date()) }
      : r))
  }, [])

  const rejectRequest = useCallback((id, reason) => {
    setRequests(prev => prev.map(r => r.id===id
      ? { ...r, status:'rejected', rejectReason:reason }
      : r))
  }, [])

  // Stock จับคู่รถ
  const matchRequest = useCallback((id, { stockId, engineNo, chassisNo }) => {
    setRequests(prev => prev.map(r => r.id===id
      ? { ...r, status:'matched', matchedStockId:stockId, engineNo, chassisNo, matchDate:dateStr(new Date()) }
      : r))
  }, [])

  // ผู้จัดการ/SC ยืนยันรับรถ
  const completeRequest = useCallback((id) => {
    setRequests(prev => prev.map(r => r.id===id
      ? { ...r, status:'sc_assigned' }
      : r))
  }, [])

  // ── Working days ──
  const getWorkingDays = useCallback((fromDate) => {
    if (!fromDate) return 0
    return countWorkingDays(new Date(fromDate), new Date())
  }, [])

  const getOverdueRequests = useCallback(() => {
    return requests
      .filter(r => r.matchDate)
      .map(r => ({ ...r, workDays: getWorkingDays(r.matchDate) }))
      .filter(r => r.workDays > 7)
  }, [requests, getWorkingDays])

  // สต๊อคที่อายุเกิน 15 วัน (engineDate เก่า)
  const getAgedStock = useCallback(() => {
    return inventory.filter(s => {
      if (!s.engineDate) return false
      return countWorkingDays(new Date(s.engineDate), new Date()) > 15
    })
  }, [inventory])

  return (
    <StockContext.Provider value={{
      inventory, requests,
      addInventory, editInventory, deleteInventory,
      createRequest, approveRequest, rejectRequest, matchRequest, completeRequest,
      getWorkingDays, getOverdueRequests, getAgedStock,
    }}>
      {children}
    </StockContext.Provider>
  )
}

export const useStock = () => useContext(StockContext)
