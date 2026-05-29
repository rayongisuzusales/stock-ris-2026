import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function PageHeader({ title, subtitle, onRefresh, lastSync }) {
  const [spinning, setSpinning] = useState(false)

  const handleRefresh = () => {
    setSpinning(true)
    if (onRefresh) onRefresh()
    setTimeout(() => setSpinning(false), 1200)
  }

  return (
    <div className="page-header" style={styles.header}>
      <div style={{ flex:1, minWidth:0 }}>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.sub}>{subtitle}</p>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        {lastSync && <span style={styles.sync}>{lastSync}</span>}
        <button onClick={handleRefresh} style={styles.btn}>
          <RefreshCw size={13}
            style={{ animation: spinning ? 'spin .7s linear infinite' : 'none' }} />
          <span>ซิงค์</span>
        </button>
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 28px 0',
    marginBottom: 20,
    gap: 12,
  },
  title: { fontSize:20, fontWeight:600, color:'#F0F0F0', letterSpacing:'-0.3px' },
  sub:   { fontSize:12, color:'#555', marginTop:3 },
  sync:  { fontSize:11, color:'#444', fontFamily:'var(--mono)' },
  btn: {
    display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
    background:'transparent', border:'1px solid #2A2A2A', borderRadius:7,
    color:'#888', fontSize:12, cursor:'pointer',
  },
}
