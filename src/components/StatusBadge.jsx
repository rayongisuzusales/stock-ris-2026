const MAP = {
  'ขายแล้ว':      { bg:'#22C55E18', color:'#22C55E', label:'ขายแล้ว' },
  'รอเปิดสัญญา': { bg:'#F59E0B18', color:'#F59E0B', label:'รอเปิดสัญญา' },
  'รอเลขเครื่อง': { bg:'#3B82F618', color:'#3B82F6', label:'รอเลขเครื่อง' },
  'แมทแล้ว':     { bg:'#A855F718', color:'#A855F7', label:'แมทแล้ว' },
  'ว่าง':        { bg:'#CC000018', color:'#CC0000', label:'ว่าง' },
}

export default function StatusBadge({ status }) {
  const cfg = MAP[status] || { bg:'#22222280', color:'#666', label: status || '—' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      background: cfg.bg,
      color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}
