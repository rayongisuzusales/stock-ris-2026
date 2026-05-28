// Google Sheets API utility
// ใส่ค่า SHEET_ID และ API_KEY ใน .env หรือ GitHub Secrets

const SHEET_ID = import.meta.env.VITE_SHEET_ID || 'YOUR_SHEET_ID_HERE'
const API_KEY  = import.meta.env.VITE_API_KEY  || 'YOUR_API_KEY_HERE'

const BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`

async function fetchRange(range) {
  const url = `${BASE}/${encodeURIComponent(range)}?key=${API_KEY}`
  const res  = await fetch(url)
  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`)
  const data = await res.json()
  return data.values || []
}

// ---------- parsers ----------

export function parseCurrentStock(rows) {
  if (!rows.length) return []
  const skip = ['รถรุ่น 26', 'Spacecab', 'Cab4', 'HR 2Drs', 'HR 4Drs',
                 'Spark', 'X-Series', 'Mu-X', 'อัพเดต', '']
  return rows
    .filter(r => r[0] && !skip.some(s => r[0].startsWith(s)))
    .map((r, i) => ({
      id: i,
      model:    r[0]?.trim() || '',
      code:     r[1]?.trim() || '',
      qty:      parseInt(r[2]) || 0,
      location: r[3]?.trim() || '',
    }))
    .filter(r => r.qty > 0)
}

export function parseTotalStock(rows) {
  if (!rows.length) return []
  const [header, ...data] = rows
  const cols = {
    docNo:    0,  model:   1,  color:   2,
    engineDate: 3, engineNo: 4, chassis: 5,
    depot:    6,  branch:  7,  status:  8,
    entryDate: 9, remark: 11, sc: 12,
    contractDate: 13, expectedDate: 14,
    requestDate: 15, matchDate: 16,
  }
  return data
    .filter(r => r.length > 2 && (r[cols.model] || r[cols.engineNo]))
    .map((r, i) => ({
      id:           i,
      docNo:        r[cols.docNo]       || '',
      model:        r[cols.model]       || '',
      color:        r[cols.color]       || '',
      engineDate:   r[cols.engineDate]  || '',
      engineNo:     r[cols.engineNo]    || '',
      chassis:      r[cols.chassis]     || '',
      depot:        r[cols.depot]       || '',
      branch:       r[cols.branch]      || '',
      status:       r[cols.status]      || '',
      entryDate:    r[cols.entryDate]   || '',
      remark:       r[cols.remark]      || '',
      sc:           r[cols.sc]          || '',
      contractDate: r[cols.contractDate]|| '',
      expectedDate: r[cols.expectedDate]|| '',
      requestDate:  r[cols.requestDate] || '',
      matchDate:    r[cols.matchDate]   || '',
    }))
}

// ---------- main fetch functions ----------

export async function fetchMyStockSummary() {
  try {
    // Sheet 1 (TOTAL STOCK) contains the MY26 available stock table
    const rows = await fetchRange('TOTAL STOCK!A1:H40')
    return parseCurrentStock(rows)
  } catch (e) {
    console.error('fetchMyStockSummary:', e)
    return MOCK_STOCK
  }
}

export async function fetchTotalStock(limit = 200) {
  try {
    const rows = await fetchRange(`TOTAL STOCK!A1:Q${limit + 1}`)
    return parseTotalStock(rows)
  } catch (e) {
    console.error('fetchTotalStock:', e)
    return MOCK_HISTORY
  }
}

export async function fetchMonthlyStats() {
  try {
    // Each month has a dedicated range
    const months = [
      { name: 'พ.ค. 69', range: 'พฤษภาคม!A1:Y20'  },
      { name: 'เม.ย. 69', range: 'เมษายน!A1:Y20'   },
      { name: 'มี.ค. 69', range: 'มีนาคม!A1:Y20'   },
      { name: 'ก.พ. 69', range: 'กุมภาพันธ์!A1:Y20' },
      { name: 'ม.ค. 69', range: 'มกราคม!A1:Y20'    },
    ]
    const results = []
    for (const m of months) {
      try {
        const rows = await fetchRange(m.range)
        const total = extractMonthTotal(rows)
        results.push({ ...m, ...total })
      } catch {
        results.push({ ...m, pickup: 0, mux: 0, total: 0 })
      }
    }
    return results
  } catch (e) {
    console.error('fetchMonthlyStats:', e)
    return MOCK_MONTHLY
  }
}

function extractMonthTotal(rows) {
  const totalRow = rows.find(r => r[0] === 'รวม' || r[0]?.includes('รวม'))
  if (!totalRow) return { pickup: 0, mux: 0, total: 0 }
  return {
    pickup: parseInt(totalRow[11]) || 0,
    mux:    parseInt(totalRow[22]) || 0,
    total:  parseInt(totalRow[24]) || 0,
  }
}

// ---------- MOCK DATA (fallback when no API key) ----------

export const MOCK_STOCK = [
  { id:1,  model:'Cab4 2.2 Ddi L',              code:'URD10 SBW', qty:6, location:'ปลวกแดง 3 / ระยอง 3' },
  { id:2,  model:'HR 4Drs 2.2 Ddi Z AT',        code:'USB30 DWP', qty:5, location:'ปลวกแดง 3 / ระยอง 2' },
  { id:3,  model:'HR 4Drs 2.2 Ddi Z',           code:'USC20 ELG', qty:5, location:'ระยอง 3 / ปลวกแดง 2' },
  { id:4,  model:'Mu-X 4x2 2.2 Active',         code:'UUA20 BOS', qty:5, location:'ปลวกแดง 3 / ระยอง 2' },
  { id:5,  model:'Cab4 2.2 Ddi S',              code:'URA20 BOS', qty:5, location:'ระยอง 2 / ปลวกแดง 3' },
  { id:6,  model:'HR 4Drs 2.2 Ddi Z',           code:'USC30 DWP', qty:4, location:'ปลวกแดง 2 / ระยอง 2' },
  { id:7,  model:'Cab4 2.2 Ddi L',              code:'URD20 BOS', qty:4, location:'ระยอง 1 / ปลวกแดง 3' },
  { id:8,  model:'HR 4Drs 2.2 Ddi L AT',        code:'USB20 ELG', qty:4, location:'ระยอง 2 / ปลวกแดง 2' },
  { id:9,  model:'Cab4 2.2 Ddi S AT',           code:'URB10 SBW', qty:4, location:'ระยอง 2 / ปลวกแดง 2' },
  { id:10, model:'Spacecab 2.2 Ddi S AT',       code:'UPH10 SBW', qty:4, location:'ระยอง 1 / ปลวกแดง 3' },
  { id:11, model:'HR 4Drs 2.2 Ddi Z AT',        code:'USE30 DWP', qty:3, location:'ปลวกแดง 1 / ระยอง 2' },
  { id:12, model:'HR 4Drs 2.2 Ddi Z AT',        code:'USE20 ELG', qty:3, location:'ระยอง 2 / ปลวกแดง 1' },
  { id:13, model:'Cab4 2.2 Ddi S AT',           code:'URB20 BOS', qty:3, location:'ระยอง 3' },
  { id:14, model:'HR 4Drs 2.2 Ddi L',           code:'USA20 ELG', qty:3, location:'ปลวกแดง 1 / ระยอง 2' },
  { id:15, model:'HR 4Drs 2.2 Ddi L',           code:'USA30 DWP', qty:3, location:'ระยอง 1 / ปลวกแดง 2' },
  { id:16, model:'Mu-X 4x2 2.2 Elegant',        code:'UUB30 DWP', qty:3, location:'ระยอง 2 / ปลวกแดง 1' },
  { id:17, model:'X-Series Speed 4Drs',         code:'URE10 SBW', qty:2, location:'ปลวกแดง 1 / ระยอง 1' },
  { id:18, model:'X-Series Speed 4Drs',         code:'URE20 BAB', qty:2, location:'ปลวกแดง 1 / ระยอง 1' },
  { id:19, model:'Spacecab 2.2 Ddi S',          code:'UPG20 ELG', qty:2, location:'ปลวกแดง 1 / ระยอง 1' },
  { id:20, model:'Cab4 2.2 Ddi L',              code:'URD20 ELG', qty:2, location:'ปลวกแดง 2' },
  { id:21, model:'X-Series Speed 2Drs',         code:'UPE10 SBW', qty:2, location:'ปลวกแดง 1 / ระยอง 1' },
  { id:22, model:'HR 4Drs 2.2 Ddi L AT',        code:'USB20 BOS', qty:2, location:'ระยอง 1 / ปลวกแดง 1' },
]

export const MOCK_MONTHLY = [
  { name:'พ.ค. 69', pickup:61, mux:13, total:74  },
  { name:'เม.ย. 69', pickup:65, mux:5,  total:70  },
  { name:'มี.ค. 69', pickup:157,mux:17, total:174 },
  { name:'ก.พ. 69', pickup:152,mux:14, total:166 },
  { name:'ม.ค. 69', pickup:96, mux:19, total:115 },
]

export const MOCK_MONTHLY_BRANCH = {
  'พ.ค. 69': [
    { branch:'RY', pickup:6,  waitP:3,  mux:13, waitM:0,  total:3  },
    { branch:'NK', pickup:2,  waitP:0,  mux:5,  waitM:0,  total:7  },
    { branch:'MP', pickup:26, waitP:11, mux:2,  waitM:0,  total:16 },
    { branch:'FR', pickup:4,  waitP:1,  mux:1,  waitM:0,  total:4  },
    { branch:'BK', pickup:14, waitP:5,  mux:2,  waitM:1,  total:9  },
    { branch:'PD', pickup:26, waitP:7,  mux:5,  waitM:2,  total:22 },
    { branch:'CK', pickup:6,  waitP:2,  mux:1,  waitM:0,  total:4  },
    { branch:'FC', pickup:12, waitP:2,  mux:0,  waitM:0,  total:9  },
  ],
  'เม.ย. 69': [
    { branch:'RY', pickup:5,  waitP:0,  mux:1, waitM:0, total:6  },
    { branch:'NK', pickup:4,  waitP:0,  mux:2, waitM:1, total:5  },
    { branch:'MP', pickup:15, waitP:0,  mux:0, waitM:0, total:15 },
    { branch:'FR', pickup:9,  waitP:2,  mux:2, waitM:0, total:9  },
    { branch:'BK', pickup:4,  waitP:0,  mux:1, waitM:0, total:5  },
    { branch:'PD', pickup:15, waitP:1,  mux:0, waitM:0, total:14 },
    { branch:'CK', pickup:3,  waitP:1,  mux:0, waitM:0, total:2  },
    { branch:'FC', pickup:15, waitP:1,  mux:0, waitM:0, total:14 },
  ],
}

export const MOCK_HISTORY = [
  { id:1,  docNo:'2002386779', model:'TSA20', color:'ELG', engineNo:'FHR598',  chassis:'MP1TFR41JSG025986', branch:'FC', entryDate:'8/10/25',  contractDate:'11/10/25', sc:'เฉลิม พิมศร',      status:'ขายแล้ว' },
  { id:2,  docNo:'2002365286', model:'TSC20', color:'ELG', engineNo:'FFA298',  chassis:'MP1TFR41JSG019963', branch:'PD', entryDate:'23/6/25',   contractDate:'10/7/2025',sc:'ธันญาภรณ์ กาสังข์', status:'ขายแล้ว' },
  { id:3,  docNo:'2002017275', model:'QRH20', color:'BAB', engineNo:'YM2354',  chassis:'NG092825',          branch:'FC', entryDate:'',          contractDate:'',         sc:'',                 status:'ขายแล้ว' },
  { id:4,  docNo:'2002011149', model:'QPA10', color:'SBW', engineNo:'YK1900',  chassis:'NG086804',          branch:'FC', entryDate:'',          contractDate:'',         sc:'',                 status:'ขายแล้ว' },
  { id:5,  docNo:'2002017071', model:'QRA20', color:'BOS', engineNo:'YM1224',  chassis:'NG092120',          branch:'NK', entryDate:'',          contractDate:'3/12/2022',sc:'',                 status:'ขายแล้ว' },
  { id:6,  docNo:'2002024455', model:'QPH20', color:'BOS', engineNo:'YM1922',  chassis:'NG091966',          branch:'MP', entryDate:'',          contractDate:'10/12/2022',sc:'',                status:'ขายแล้ว' },
  { id:7,  docNo:'2001999941', model:'QPM10', color:'SBW', engineNo:'YF4536',  chassis:'NG077313',          branch:'PD', entryDate:'',          contractDate:'25/2/2023',sc:'',                 status:'ขายแล้ว' },
  { id:8,  docNo:'2002032763', model:'RPM10', color:'SBW', engineNo:'YN4322',  chassis:'PG002341',          branch:'CK', entryDate:'',          contractDate:'9/1/2023', sc:'',                 status:'ขายแล้ว' },
  { id:9,  docNo:'2002021375', model:'RRG20', color:'BOS', engineNo:'YN0569',  chassis:'PG001305',          branch:'NK', entryDate:'',          contractDate:'',         sc:'',                 status:'ขายแล้ว' },
  { id:10, docNo:'2002025365', model:'QUF20', color:'BAB', engineNo:'YM4636',  chassis:'NT005453',          branch:'PD', entryDate:'',          contractDate:'',         sc:'',                 status:'ขายแล้ว' },
]
