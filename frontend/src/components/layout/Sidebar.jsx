import { useAuth } from '../../hooks/useAuth.jsx'

const ROLE_META = {
  Subscriber:      { color: '#378add', bg: 'rgba(55,138,221,0.12)',  initials: (n) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(), scope: 'Your SLAs only' },
  Advisor:         { color: '#1d9e75', bg: 'rgba(29,158,117,0.12)', initials: (n) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(), scope: 'Assigned clients' },
  Admin:           { color: '#ef9f27', bg: 'rgba(239,159,39,0.12)', initials: (n) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(), scope: 'Full org view' },
  'Platform Admin':{ color: '#e24b4a', bg: 'rgba(226,75,74,0.12)',  initials: (n) => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(), scope: 'All tenants' },
}

const SUGGESTIONS = [
  'Show my active contracts',
  'How many SLA breaches this month?',
  'Compare my response time vs industry',
  'Show all P1 tickets',
  'Which contracts are expiring soon?',
  'Uptime % across all tiers',
]

export default function Sidebar({ onSuggestion }) {
  const { user, logout } = useAuth()
  if (!user) return null

  const meta = ROLE_META[user.role] || ROLE_META['Subscriber']
  const initials = meta.initials(user.name || 'U')

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>SLA<span style={{ color: 'var(--green)' }}>Insight</span></div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Your role</div>
        <div style={{ ...styles.roleBadge, background: meta.bg, borderColor: meta.color, color: meta.color }}>
          <span style={{ ...styles.dot, background: meta.color }} />
          {user.role}
        </div>
        <div style={styles.scopeNote}>{meta.scope}</div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Quick questions</div>
        <div style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <button key={s} style={styles.suggestion} onClick={() => onSuggestion(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.userRow}>
          <div style={{ ...styles.avatar, background: meta.bg, color: meta.color }}>{initials}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.role}</div>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: { width: '240px', minWidth: '240px', height: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '1.25rem 1rem', gap: '1.5rem', overflow: 'auto' },
  logo: { fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.3px', paddingBottom: '0.5rem' },
  section: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionLabel: { fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 },
  roleBadge: { display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid', fontSize: '13px', fontWeight: 500 },
  dot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  scopeNote: { fontSize: '12px', color: 'var(--text3)', paddingLeft: '2px' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: '4px' },
  suggestion: { textAlign: 'left', padding: '8px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text2)', fontSize: '12px', lineHeight: 1.4, transition: 'all 0.15s', cursor: 'pointer' },
  footer: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '1rem' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: { fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '11px', color: 'var(--text3)' },
  logoutBtn: { padding: '7px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text2)', fontSize: '12px', fontWeight: 500, transition: 'all 0.15s' },
}
