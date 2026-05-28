import { useState } from 'react'
import { Key, Database, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'

export default function Settings() {
  const [sheetId,  setSheetId]  = useState(import.meta.env.VITE_SHEET_ID || '')
  const [apiKey,   setApiKey]   = useState(import.meta.env.VITE_API_KEY  || '')
  const [testing,  setTesting]  = useState(false)
  const [result,   setResult]   = useState(null)

  const testConnection = async () => {
    if (!sheetId || !apiKey) { setResult('error'); return }
    setTesting(true); setResult(null)
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`
      const res = await fetch(url)
      setResult(res.ok ? 'ok' : 'error')
    } catch { setResult('error') }
    finally { setTesting(false) }
  }

  return (
    <div style={styles.page}>
      <PageHeader title="ตั้งค่าระบบ" subtitle="เชื่อมต่อ Google Sheets API" />

      {/* Step guide */}
      <div style={{ padding:'0 28px', marginBottom:20 }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>วิธีเชื่อมต่อ Google Sheets</div>
          <div style={styles.steps}>
            {[
              { n:'1', label:'เปิด Google Cloud Console', desc:'ไปที่ console.cloud.google.com แล้วสร้างโปรเจกต์ใหม่' },
              { n:'2', label:'เปิดใช้ Sheets API', desc:'ค้นหา "Google Sheets API" แล้วกด Enable' },
              { n:'3', label:'สร้าง API Key', desc:'ไปที่ APIs & Services > Credentials > Create Credentials > API Key' },
              { n:'4', label:'ตั้งค่า GitHub Secrets', desc:'ไปที่ repo Settings > Secrets > Actions แล้วเพิ่ม VITE_SHEET_ID และ VITE_API_KEY' },
            ].map(s => (
              <div key={s.n} style={styles.step}>
                <div style={styles.stepNum}>{s.n}</div>
                <div>
                  <div style={styles.stepLabel}>{s.label}</div>
                  <div style={styles.stepDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Config form */}
      <div style={{ padding:'0 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Database size={14} style={{ verticalAlign:'-2px', marginRight:6, color:'#CC0000' }} />
            Google Sheet ID
          </div>
          <div style={styles.fieldDesc}>
            คัดลอกจาก URL: docs.google.com/spreadsheets/d/<strong style={{ color:'#CC0000' }}>[ID นี้]</strong>/edit
          </div>
          <input
            style={styles.input}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            value={sheetId}
            onChange={e => setSheetId(e.target.value)}
          />
          <div style={{ marginTop:8, fontFamily:'var(--mono)', fontSize:10, color:'#444' }}>
            VITE_SHEET_ID (GitHub Secret)
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Key size={14} style={{ verticalAlign:'-2px', marginRight:6, color:'#CC0000' }} />
            Google API Key
          </div>
          <div style={styles.fieldDesc}>
            ต้องเปิดใช้ Google Sheets API และจำกัด referrer เป็น GitHub Pages URL
          </div>
          <input
            type="password"
            style={styles.input}
            placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <div style={{ marginTop:8, fontFamily:'var(--mono)', fontSize:10, color:'#444' }}>
            VITE_API_KEY (GitHub Secret)
          </div>
        </div>
      </div>

      <div style={{ padding:'14px 28px 0' }}>
        <button onClick={testConnection} disabled={testing} style={styles.testBtn}>
          {testing ? 'กำลังทดสอบ…' : 'ทดสอบการเชื่อมต่อ'}
        </button>
        {result === 'ok' && (
          <div style={styles.resultOk}>
            <CheckCircle size={14} /> เชื่อมต่อสำเร็จ — อ่านข้อมูลจาก Google Sheet ได้แล้ว
          </div>
        )}
        {result === 'error' && (
          <div style={styles.resultErr}>
            <AlertCircle size={14} /> เชื่อมต่อไม่สำเร็จ — ตรวจสอบ Sheet ID และ API Key อีกครั้ง
          </div>
        )}
      </div>

      {/* GitHub deploy guide */}
      <div style={{ padding:'20px 28px 0' }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <ExternalLink size={14} style={{ verticalAlign:'-2px', marginRight:6, color:'#CC0000' }} />
            วิธี Deploy บน GitHub Pages
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:10 }}>
            {[
              '1. สร้าง Repository ใหม่บน GitHub (public หรือ private ก็ได้)',
              '2. Push โค้ดทั้งหมดขึ้น: git init → git add . → git commit → git push',
              '3. ไปที่ Settings > Secrets and variables > Actions',
              '4. เพิ่ม Secret: VITE_SHEET_ID (ใส่ ID ของ Sheet) และ VITE_API_KEY',
              '5. ไปที่ Settings > Pages > Source เลือก "GitHub Actions"',
              '6. Push code ใหม่เพื่อ trigger deployment หรือกด "Run workflow"',
              '7. เว็บจะอยู่ที่ https://[username].github.io/[repo-name]/',
            ].map(s => (
              <div key={s} style={{ fontSize:12, color:'#666', padding:'3px 0' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page:     { padding:'0 0 32px' },
  card:     { background:'#111', border:'1px solid #1E1E1E', borderRadius:10, padding:'16px 18px' },
  cardTitle:{ fontSize:13, fontWeight:500, color:'#E0E0E0', marginBottom:10 },
  steps:    { display:'flex', flexDirection:'column', gap:10 },
  step:     { display:'flex', gap:12, alignItems:'flex-start' },
  stepNum:  { width:22, height:22, borderRadius:'50%', background:'#CC000020', border:'1px solid #CC000040',
    color:'#CC0000', fontSize:11, fontWeight:600, display:'flex', alignItems:'center',
    justifyContent:'center', flexShrink:0, marginTop:1 },
  stepLabel:{ fontSize:13, color:'#D0D0D0', fontWeight:500 },
  stepDesc: { fontSize:11, color:'#555', marginTop:2 },
  fieldDesc:{ fontSize:11, color:'#555', marginBottom:8, lineHeight:1.5 },
  input:    { width:'100%', background:'#0D0D0D', border:'1px solid #222', borderRadius:7,
    padding:'8px 12px', color:'#E0E0E0', fontSize:13, fontFamily:'var(--mono)', outline:'none' },
  testBtn:  { padding:'9px 20px', background:'#CC0000', border:'none', borderRadius:8,
    color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)' },
  resultOk: { display:'flex', alignItems:'center', gap:6, marginTop:10,
    color:'#22C55E', fontSize:12 },
  resultErr:{ display:'flex', alignItems:'center', gap:6, marginTop:10,
    color:'#EF4444', fontSize:12 },
}
