import { useState } from 'react'
import { useAuth, MOCK_USERS, ROLE_LABELS, ROLE_COLORS } from '../context/AuthContext.jsx'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    login(username, password)
    setLoading(false)
  }

  const quickLogin = (u) => { setUsername(u.username); setPassword(u.password) }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>I</div>
          <div>
            <div style={styles.logoTitle}>ระยองอีซูซุเซลส์</div>
            <div style={styles.logoSub}>Stock Management System 2026</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={styles.label}>ชื่อผู้ใช้</label>
            <input style={styles.input} value={username} onChange={e=>setUsername(e.target.value)}
              placeholder="username" autoComplete="username" />
          </div>
          <div>
            <label style={styles.label}>รหัสผ่าน</label>
            <div style={{ position:'relative' }}>
              <input style={{ ...styles.input, paddingRight:40 }} type={show?'text':'password'}
                value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="password" autoComplete="current-password" />
              <button type="button" onClick={()=>setShow(!show)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#555', cursor:'pointer', padding:2 }}>
                {show ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {error && <div style={styles.errBox}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.loginBtn}>
            {loading ? 'กำลังเข้าสู่ระบบ…' : <><LogIn size={14} style={{marginRight:6}}/> เข้าสู่ระบบ</>}
          </button>
        </form>

        {/* Quick login */}
        <div style={{ marginTop:20 }}>
          <div style={styles.quickLabel}>ทดสอบเข้าสู่ระบบด้วยบทบาทต่างๆ</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:8 }}>
            {MOCK_USERS.map(u => {
              const rc = ROLE_COLORS[u.role]
              return (
                <button key={u.id} onClick={() => quickLogin(u)} style={{
                  padding:'8px 10px', borderRadius:8, border:`1px solid ${rc.border}`,
                  background: rc.bg, cursor:'pointer', textAlign:'left',
                }}>
                  <div style={{ fontSize:11, fontWeight:500, color: rc.color }}>{ROLE_LABELS[u.role]}</div>
                  <div style={{ fontSize:12, color:'#C0C0C0', marginTop:1 }}>{u.name}</div>
                  <div style={{ fontSize:10, color:'#555', fontFamily:'var(--mono)', marginTop:1 }}>{u.username} / {u.password}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrap:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
                background:'#0A0A0A', padding:16 },
  card:       { width:'100%', maxWidth:420, background:'#111', border:'1px solid #1E1E1E',
                borderRadius:14, padding:28 },
  logoRow:    { display:'flex', alignItems:'center', gap:12, marginBottom:24 },
  logoMark:   { width:40, height:40, background:'#CC0000', borderRadius:8, display:'flex',
                alignItems:'center', justifyContent:'center', color:'#fff',
                fontWeight:700, fontSize:20, flexShrink:0 },
  logoTitle:  { fontSize:15, fontWeight:600, color:'#F0F0F0' },
  logoSub:    { fontSize:11, color:'#555', fontFamily:'var(--mono)', marginTop:2 },
  label:      { fontSize:12, color:'#777', display:'block', marginBottom:5 },
  input:      { width:'100%', background:'#0D0D0D', border:'1px solid #2A2A2A', borderRadius:8,
                padding:'9px 12px', color:'#E0E0E0', fontSize:14, fontFamily:'var(--font)',
                outline:'none', boxSizing:'border-box' },
  errBox:     { background:'#CC000018', border:'1px solid #CC000040', borderRadius:8,
                padding:'8px 12px', fontSize:12, color:'#FF6666' },
  loginBtn:   { display:'flex', alignItems:'center', justifyContent:'center',
                padding:'10px', background:'#CC0000', border:'none', borderRadius:8,
                color:'#fff', fontSize:14, fontWeight:500, cursor:'pointer',
                fontFamily:'var(--font)', marginTop:4 },
  quickLabel: { fontSize:11, color:'#444', textAlign:'center' },
}
