import ResultTable from '../table/ResultTable.jsx'

const TYPE_ICONS = {
  greeting: '👋',
  general:  'ℹ️',
  data:     '📊',
}

export default function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'

  // System messages (role switch etc.)
  if (msg.type === 'system') {
    return <div style={s.system}>{msg.content}</div>
  }

  return (
    <div style={{ ...s.row, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>

      {/* Bot avatar */}
      {!isUser && (
        <div style={s.botAvatar}>
          {msg.message_type === 'greeting' ? '👋' : msg.message_type === 'general' ? 'ℹ' : 'AI'}
        </div>
      )}

      <div style={{ maxWidth: '80%', minWidth: '120px' }}>
        <div style={{ ...s.bubble, ...(isUser ? s.userBubble : s.botBubble) }}>

          {/* Answer text */}
          <p style={{ ...s.text, color: isUser ? '#fff' : 'var(--text)' }}>
            {msg.content}
          </p>

          {/* Data table with stats — only for bot data messages */}
          {!isUser && msg.message_type === 'data' && msg.data && msg.data.length > 0 && (
            <ResultTable
              columns={msg.columns}
              data={msg.data}
              summaryStats={msg.summary_stats}
              hasComparison={msg.has_comparison}
            />
          )}

          {/* No results notice */}
          {!isUser && msg.message_type === 'data' && msg.data && msg.data.length === 0 && msg.sql && (
            <div style={s.noData}>No records found for this query.</div>
          )}

          {/* SQL toggle — only for data messages */}
          {!isUser && msg.sql && (
            <details style={s.sqlWrap}>
              <summary style={s.sqlToggle}>View generated SQL</summary>
              <pre style={s.sql}>{msg.sql}</pre>
            </details>
          )}
        </div>

        {/* Timestamp */}
        <div style={{ ...s.time, textAlign: isUser ? 'right' : 'left' }}>
          {msg.time}
        </div>
      </div>

      {/* User avatar */}
      {isUser && <div style={s.userAvatar}>U</div>}
    </div>
  )
}

const s = {
  row:       { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  system:    { textAlign: 'center', fontSize: '11px', color: 'var(--text3)', padding: '4px 0' },
  botAvatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-bg)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, flexShrink: 0, marginTop: '2px' },
  userAvatar:{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg3)', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, flexShrink: 0, marginTop: '2px' },
  bubble:    { padding: '12px 16px', borderRadius: '12px', lineHeight: 1.6 },
  botBubble: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px' },
  userBubble:{ background: 'var(--green)', borderRadius: '12px 4px 12px 12px' },
  text:      { fontSize: '14px', lineHeight: 1.65, whiteSpace: 'pre-line' },
  time:      { fontSize: '10px', color: 'var(--text3)', marginTop: '5px', paddingLeft: '2px', paddingRight: '2px' },
  noData:    { marginTop: '10px', padding: '8px 12px', background: 'rgba(239,159,39,0.08)', borderRadius: '6px', fontSize: '12px', color: '#ef9f27', borderLeft: '3px solid #ef9f27' },
  sqlWrap:   { marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px' },
  sqlToggle: { fontSize: '11px', color: 'var(--text3)', cursor: 'pointer', userSelect: 'none', listStyle: 'none' },
  sql:       { marginTop: '6px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text2)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' },
}
