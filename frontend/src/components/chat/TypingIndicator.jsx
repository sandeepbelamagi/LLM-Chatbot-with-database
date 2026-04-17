export default function TypingIndicator() {
  return (
    <div style={styles.row}>
      <div style={styles.avatar}>AI</div>
      <div style={styles.bubble}>
        <div style={styles.dots}>
          <span style={{ ...styles.dot, animationDelay: '0s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  row: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-bg)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, flexShrink: 0 },
  bubble: { padding: '14px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px' },
  dots: { display: 'flex', gap: '5px', alignItems: 'center' },
  dot: { display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text3)', animation: 'bounce 1.2s infinite' },
}
