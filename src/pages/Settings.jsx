import { useState } from 'react'
import { Key, Database, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'

export default function Settings() {
  const [sheetId, setSheetId] = useState(import.meta.env.VITE_SHEET_ID || '')
  const [apiKey,  setApiKey]  = useState(import.meta.env.VITE_API_KEY  || '')
  const [testing, setTesting] = useState(false)
  const [result,  setResult]  = useState(null)

  const testConnection = async () => {
    if (!sheetId || !apiKey) { setResult('error'); return }
    setTesting(true); setResult(null)
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`)
      setResult(res.ok ? 'ok' : 'error')
    } catch { setResult('error') }
    finally { setTesting(false) }
  }

  return (
    <div className="page-wrap">
      <PageHeader title="ตั้งค่าระบบ" subtitle="เชื่อมต่อ Google Sheets API" />

      {/* Steps */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardTitle}>วิธีเชื่อมต่อ Google Sheets</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:10 }}>
          {[
            ['1','เปิด Google Cloud Console','console.cloud.google.com แล้วสร้างโปรเจกต์ใหม่'],
            ['2','เปิดใช้ Sheets API','ค้นหา "Google Sheets API" แล้วกด Enable'],
            ['3','สร้าง API Key','APIs & Services → Credentials → Create Credentials → API Key'],
            ['4','ตั้งค่า GitHub Secrets','Settings → Secrets → Actions → เพิ่ม VITE_SHEET_ID และ VITE_API_KEY'],
          ].map(([n,l,d]) => (
            <div key={n} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:'#CC000020',
                border:'1px solid #CC000040', color:'#CC0000', fontSize:11, fontWeight:600,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                {n}
              </div>
              <div>
                <div style={{ fontSize:13, color:'#D0D0D0', fontWeight:500 }}>{l}</div>
                <div style={{ fontSize:11, color:'#555', marginTop:2 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12,
        padding:'0 28px', marginBottom:12 }}
        className="two-col-layout">
        <div style={styles.card}>
          <div style={styles.fieldTitle}>
            <Database size={13} style={{ color:'#CC0000', verticalAlign:'-1px', marginRight:5 }} />
            Google Sheet ID
          </div>
          <div style={styles.fieldDesc}>URL: /spreadsheets/d/<strong style={{ color:'#CC0000' }}>[ID]</strong>/edit</div>
          <input style={styles.input} placeholder="1BxiMVs0XRA5nFMdK..." value={sheetId} onChange={e => setSheetId(e.target.value)} />
          <div style={styles.hint}>VITE_SHEET_ID</div>
        </div>
        <div style={styles.card}>
          <div style={styles.fieldTitle}>
            <Key size={13} style={{ color:'#CC0000', verticalAlign:'-1px', marginRight:5 }} />
            Google API Key
          </div>
          <div style={styles.fieldDesc}>เปิดใช้ Google Sheets API ก่อนสร้าง Key</div>
          <input type="password" style={styles.input} placeholder="AIzaSy..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <div style={styles.hint}>VITE_API_KEY</div>
        </div>
      </div>

      <div style={{ padding:'0 28px 12px' }}>
        <button onClick={testConnection} disabled={testing} style={styles.testBtn}>
          {testing ? 'กำลังทดสอบ…' : 'ทดสอบการเชื่อมต่อ'}
        </button>
        {result==='ok' && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, color:'#22C55E', fontSize:12 }}>
            <CheckCircle size={14} /> เชื่อมต่อสำเร็จ
          </div>
        )}
        {result==='error' && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, color:'#EF4444', fontSize:12 }}>
            <AlertCircle size={14} /> เชื่อมต่อไม่สำเร็จ — ตรวจสอบ Sheet ID และ API Key อีกครั้ง
          </div>
        )}
      </div>

      {/* Deploy guide */}
      <div className="page-section" style={styles.card}>
        <div style={styles.cardTitle}>
          <ExternalLink size={13} style={{ color:'#CC0000', verticalAlign:'-1px', marginRight:5 }} />
          URL เว็บไซต์
        </div>
        <a href="https://rayongisuzusales.github.io/stock-ris-2026/"
          target="_blank" rel="noreferrer"
          style={{ fontSize:12, color:'#3B82F6', marginTop:8, display:'block', wordBreak:'break-all' }}>
          https://rayongisuzusales.github.io/stock-ris-2026/
        </a>
        <div style={{ fontSize:11, color:'#555', marginTop:6 }}>
          อัพเดตโดยอัตโนมัติเมื่อ Push โค้ดใหม่ขึ้น GitHub (GitHub Actions)
        </div>
      </div>
    </div>
  )
}

const styles = {
  card:       { background:'#111', border:'1px solid #1E1E1E', borderRadius:10,
                padding:'14px 16px', marginBottom:12, marginLeft:28, marginRight:28 },
  cardTitle:  { fontSize:13, fontWeight:500, color:'#E0E0E0', marginBottom:2 },
  fieldTitle: { fontSize:13, fontWeight:500, color:'#E0E0E0', marginBottom:6 },
  fieldDesc:  { fontSize:11, color:'#555', marginBottom:8, lineHeight:1.5 },
  input:      { width:'100%', background:'#0D0D0D', border:'1px solid #222', borderRadius:7,
                padding:'8px 11px', color:'#E0E0E0', fontSize:13, fontFamily:'var(--mono)',
                outline:'none' },
  hint:       { fontSize:10, color:'#444', fontFamily:'var(--mono)', marginTop:6 },
  testBtn:    { padding:'9px 20px', background:'#CC0000', border:'none', borderRadius:8,
                color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer',
                fontFamily:'var(--font)' },
}
