import { createContext, useContext, useState, useCallback } from 'react'
import { MOCK_STOCK } from '../utils/sheetsApi.js'

// ── วิธีนับวันทำงาน (ไม่นับวันอาทิตย์) ──────────────────────
export function countWorkingDays(fromDate, toDate) {
  let count = 0
  const d = new Date(fromDate)
  const end = new Date(toDate)
  d.setHours(0,0,0,0); end.setHours(0,0,0,0)
  while (d < end) {
    if (d.getDay() !== 0) count++ // 0 = อาทิตย์
    d.setDate(d.getDate() + 1)
  }
  return count
}

// ── Mock allocated stock data ─────────────────────────────────
const today = new Date()
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10) }

export const INITIAL_ALLOCATED = [
  { id:'a1', stockId:1, model:'Cab4 2.2 Ddi L',       code:'URD10 SBW', engineNo:'FGT1234', chassisNo:'MP1TFR41K001',  branch:'PD', sc:'นิรันดร์ ขายดี',  matchDate: daysAgo(10), status:'matched' },
  { id:'a2', stockId:2, model:'HR 4Drs 2.2 Ddi Z AT', code:'USB30 DWP', engineNo:'FHK5678', chassisNo:'MP1TFR41K002',  branch:'RY', sc:'',                 matchDate: daysAgo(3),  status:'matched' },
  { id:'a3', stockId:4, model:'Mu-X 4x2 2.2 Active',  code:'UUA20 BOS', engineNo:'FJM9012', chassisNo:'MP1TFR41K003',  branch:'MP', sc:'สุดา พิมพ์ใจ',    matchDate: daysAgo(8),  status:'matched' },
  { id:'a4', stockId:5, model:'Cab4 2.2 Ddi S',       code:'URA20 BOS', engineNo:'FKN3456', chassisNo:'MP1TFR41K004',  branch:'NK', sc:'เฉลิม พิมศร',     matchDate: daysAgo(2),  status:'sc_assigned' },
  { id:'a5', stockId:6, model:'HR 4Drs 2.2 Ddi Z',    code:'USC30 DWP', engineNo:'FLP7890', chassisNo:'MP1TFR41K005',  branch:'BK', sc:'',                 matchDate: daysAgo(12), status:'matched' },
  { id:'a6', stockId:7, model:'Cab4 2.2 Ddi L',       code:'URD20 BOS', engineNo:'FMR1234', chassisNo:'MP1TFR41K006',  branch:'CK', sc:'ธัญญาภรณ์ กาสังข์', matchDate: daysAgo(5), status:'sc_assigned' },
  { id:'a7', stockId:9, model:'Cab4 2.2 Ddi S AT',    code:'URB10 SBW', engineNo:'FNS5678', chassisNo:'MP1TFR41K007',  branch:'FC', sc:'',                 matchDate: daysAgo(9),  status:'matched' },
  { id:'a8', stockId:11,model:'HR 4Drs 2.2 Ddi Z AT', code:'USE30 DWP', engineNo:'FPT9012', chassisNo:'MP1TFR41K008',  branch:'PD', sc:'นิรันดร์ ขายดี',  matchDate: daysAgo(1),  status:'sc_assigned' },
]

const StockContext = createContext(null)

export function StockProvider({ children }) {
  const [allocated, setAllocated] = useState(INITIAL_ALLOCATED)
  const [stockList, setStockList] = useState(MOCK_STOCK)

  const addMatch = useCallback((data) => {
    const newItem = { ...data, id:`a${Date.now()}`, matchDate: new Date().toISOString().slice(0,10), status:'matched' }
    setAllocated(prev => [...prev, newItem])
  }, [])

  const updateMatch = useCallback((id, updates) => {
    setAllocated(prev => prev.map(a => a.id===id ? { ...a, ...updates } : a))
  }, [])

  const removeMatch = useCallback((id) => {
    setAllocated(prev => prev.filter(a => a.id !== id))
  }, [])

  const addStock = useCallback((item) => {
    setStockList(prev => [...prev, { ...item, id: Date.now() }])
  }, [])

  const editStock = useCallback((id, updates) => {
    setStockList(prev => prev.map(s => s.id===id ? { ...s, ...updates } : s))
  }, [])

  const deleteStock = useCallback((id) => {
    setStockList(prev => prev.filter(s => s.id !== id))
  }, [])

  // คำนวณวันทำงานที่ครอบครองอยู่
  const getWorkingDays = useCallback((matchDate) => {
    return countWorkingDays(new Date(matchDate), new Date())
  }, [])

  const getOverdueAllocated = useCallback(() => {
    return allocated.filter(a => getWorkingDays(a.matchDate) > 7)
  }, [allocated, getWorkingDays])

  return (
    <StockContext.Provider value={{
      allocated, stockList,
      addMatch, updateMatch, removeMatch,
      addStock, editStock, deleteStock,
      getWorkingDays, getOverdueAllocated,
    }}>
      {children}
    </StockContext.Provider>
  )
}

export const useStock = () => useContext(StockContext)
