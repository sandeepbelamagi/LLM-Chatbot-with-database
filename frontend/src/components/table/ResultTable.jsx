// ── Badge colours ────────────────────────────────────────────────────────────
const BADGES = {
  Active:   { color: '#1d9e75', bg: 'rgba(29,158,117,0.13)' },
  Breached: { color: '#e24b4a', bg: 'rgba(226,75,74,0.13)'  },
  Expired:  { color: '#8b90a0', bg: 'rgba(139,144,160,0.13)'},
  P1:       { color: '#e24b4a', bg: 'rgba(226,75,74,0.13)'  },
  P2:       { color: '#ef9f27', bg: 'rgba(239,159,39,0.13)' },
  P3:       { color: '#378add', bg: 'rgba(55,138,221,0.13)' },
  P4:       { color: '#8b90a0', bg: 'rgba(139,144,160,0.13)'},
  Gold:     { color: '#ef9f27', bg: 'rgba(239,159,39,0.13)' },
  Silver:   { color: '#8b90a0', bg: 'rgba(139,144,160,0.13)'},
  Bronze:   { color: '#cd7f32', bg: 'rgba(205,127,50,0.13)' },
  Incident: { color: '#e24b4a', bg: 'rgba(226,75,74,0.13)'  },
  Change:   { color: '#378add', bg: 'rgba(55,138,221,0.13)' },
  Request:  { color: '#1d9e75', bg: 'rgba(29,158,117,0.13)' },
}

// ── Summary stat cards ────────────────────────────────────────────────────────
function StatCards({ stats }) {
  if (!stats || stats.length === 0) return null
  const hlColor = { good: '#1d9e75', bad: '#e24b4a', neutral: '#8b90a0' }
  const hlBg    = { good: 'rgba(29,158,117,0.1)', bad: 'rgba(226,75,74,0.1)', neutral: 'rgba(139,144,160,0.08)' }

  return (
    <div style={s.statsRow}>
      {stats.map((st, i) => (
        <div key={i} style={{ ...s.statCard, borderColor: hlColor[st.highlight] || hlColor.neutral, background: hlBg[st.highlight] || hlBg.neutral }}>
          <div style={{ ...s.statValue, color: hlColor[st.highlight] || hlColor.neutral }}>{st.value}</div>
          <div style={s.statLabel}>{st.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Individual cell ───────────────────────────────────────────────────────────
function Cell({ col, value }) {
  if (value === null || value === undefined) return <span style={s.null}>—</span>

  const str = String(value)

  // Boolean sla_met
  if (col.toLowerCase() === 'sla_met') {
    const ok = value === true || str === 'true' || str === '1'
    return <span style={{ ...s.badge, ...(ok ? { color:'#1d9e75', background:'rgba(29,158,117,0.13)' } : { color:'#e24b4a', background:'rgba(226,75,74,0.13)' }) }}>{ok ? '✓ Met' : '✗ Breached'}</span>
  }

  // Named badge
  if (BADGES[str]) {
    const b = BADGES[str]
    return <span style={{ ...s.badge, color: b.color, background: b.bg }}>{str}</span>
  }

  // Numbers
  if (typeof value === 'number') {
    return <span style={s.num}>{Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)}</span>
  }

  // Comparison columns — colour code
  if (col.toLowerCase().includes('industry') || col.toLowerCase().includes('avg')) {
    return <span style={{ ...s.num, color: '#ef9f27' }}>{str}</span>
  }

  // Long text truncation
  return <span title={str}>{str.length > 32 ? str.slice(0, 30) + '…' : str}</span>
}

// ── Main table ────────────────────────────────────────────────────────────────
export default function ResultTable({ columns, data, summaryStats, hasComparison }) {
  if (!columns || columns.length === 0) return null

  return (
    <div style={s.wrap}>
      {/* Summary stats */}
      <StatCards stats={summaryStats} />

      {/* Comparison legend */}
      {hasComparison && (
        <div style={s.legend}>
          <span style={{ color: '#ef9f27' }}>■</span> Industry benchmark values
          &nbsp;·&nbsp;
          <span style={{ color: '#1d9e75' }}>■</span> Your data
        </div>
      )}

      {/* Row count */}
      <div style={s.meta}>
        {data.length} row{data.length !== 1 ? 's' : ''} returned
        {data.length > 20 && ' · showing first 20'}
      </div>

      {/* Table */}
      <div style={s.tableScroll}>
        <table style={s.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={s.th}>
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((row, i) => (
              <tr key={i} style={i % 2 === 1 ? s.altRow : {}}>
                {columns.map((col) => (
                  <td key={col} style={s.td}>
                    <Cell col={col} value={row[col]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const s = {
  wrap:       { marginTop: '12px' },
  statsRow:   { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
  statCard:   { flex: '1 1 80px', minWidth: '80px', padding: '8px 12px', borderRadius: '8px', border: '1px solid', textAlign: 'center' },
  statValue:  { fontSize: '18px', fontWeight: 600, lineHeight: 1.2 },
  statLabel:  { fontSize: '10px', color: '#8b90a0', marginTop: '3px', lineHeight: 1.3 },
  legend:     { fontSize: '11px', color: '#8b90a0', marginBottom: '8px', padding: '5px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' },
  meta:       { fontSize: '11px', color: '#565c6e', marginBottom: '6px', paddingLeft: '2px' },
  tableScroll:{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '400px' },
  th:         { padding: '9px 12px', textAlign: 'left', fontWeight: 500, color: '#8b90a0', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap', textTransform: 'capitalize', fontSize: '11px', letterSpacing: '0.03em' },
  td:         { padding: '8px 12px', color: '#e8eaf0', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' },
  altRow:     { background: 'rgba(255,255,255,0.02)' },
  badge:      { padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' },
  num:        { fontFamily: 'DM Mono, monospace', fontSize: '12px' },
  null:       { color: '#565c6e' },
}
