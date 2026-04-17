import { useState, useRef } from 'react'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const ref = useRef(null)

  const send = () => {
    const q = value.trim()
    if (!q || disabled) return
    onSend(q)
    setValue('')
    if (ref.current) { ref.current.style.height = 'auto' }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const onInput = (e) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div style={styles.wrap}>
      <div style={{ ...styles.box, borderColor: disabled ? 'var(--border)' : 'var(--border2)' }}>
        <textarea
          ref={ref}
          value={value}
          onChange={onInput}
          onKeyDown={onKey}
          disabled={disabled}
          placeholder="Ask anything about your SLA data..."
          rows={1}
          style={styles.input}
        />
        <button onClick={send} disabled={disabled || !value.trim()} style={{ ...styles.sendBtn, opacity: (!value.trim() || disabled) ? 0.4 : 1 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <p style={styles.hint}>Press Enter to send · Shift+Enter for new line</p>
    </div>
  )
}

const styles = {
  wrap: { padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' },
  box: { display: 'flex', alignItems: 'flex-end', gap: '8px', border: '1px solid', borderRadius: 'var(--radius-lg)', background: 'var(--bg2)', padding: '6px 6px 6px 14px', transition: 'border-color 0.15s' },
  input: { flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '14px', lineHeight: 1.6, resize: 'none', maxHeight: '120px', padding: '4px 0' },
  sendBtn: { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--green)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' },
  hint: { fontSize: '11px', color: 'var(--text3)', paddingLeft: '2px' },
}
