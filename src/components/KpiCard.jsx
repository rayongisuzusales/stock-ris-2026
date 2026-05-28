export default function KpiCard({ label, value, sub, color = '#F0F0F0', accent }) {
  return (
    <div style={{ ...styles.card, ...(accent ? { borderColor: accent + '30' } : {}) }}>
      {accent && <div style={{ ...styles.bar, background: accent }} />}
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, color }}>{value}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  )
}

const styles = {
  card: {
    background: '#111',
    border: '1px solid #1E1E1E',
    borderRadius: 10,
    padding: '14px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: 2,
  },
  label: {
    fontSize: 11,
    color: '#555',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: '-0.5px',
    lineHeight: 1,
  },
  sub: {
    fontSize: 11,
    color: '#444',
    marginTop: 5,
  },
}
