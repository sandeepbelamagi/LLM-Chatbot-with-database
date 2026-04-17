import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import ChatMessage from '../components/chat/ChatMessage.jsx'
import ChatInput from '../components/chat/ChatInput.jsx'
import TypingIndicator from '../components/chat/TypingIndicator.jsx'
import api from '../services/api.js'

const ROLE_SCOPE = {
  Subscriber:      'Viewing your SLA data only',
  Advisor:         'Viewing your assigned clients',
  Admin:           'Viewing full organization data',
  'Platform Admin':'Viewing all tenants — full access',
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function WelcomeState({ role }) {
  return (
    <div style={styles.welcome}>
      <div style={styles.welcomeIcon}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <h2 style={styles.welcomeTitle}>Ask your SLA data anything</h2>
      <p style={styles.welcomeSub}>
        Logged in as <strong>{role}</strong> — {ROLE_SCOPE[role]}.
        <br />Use the quick questions in the sidebar or type your own.
      </p>
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (question) => {
    const userMsg = { id: Date.now(), role: 'user', content: question, time: getTime() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await api.post('/chat', { question })
      const { answer, sql, data, columns } = res.data
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: answer,
        sql,
        data,
        columns,
        time: getTime(),
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: err.response?.data?.detail || 'Something went wrong. Please try again.',
        time: getTime(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <Sidebar onSuggestion={sendMessage} />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <div style={styles.headerTitle}>
              <span style={styles.statusDot} />
              SLA Assistant
            </div>
            <div style={styles.headerSub}>{ROLE_SCOPE[user?.role]}</div>
          </div>
          <div style={styles.rolePill}>{user?.role}</div>
        </div>

        <div style={styles.messages}>
          {messages.length === 0 && !loading && <WelcomeState role={user?.role} />}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={sendMessage} disabled={loading} />
      </main>
    </div>
  )
}

const styles = {
  page: { display: 'flex', height: '100vh', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)', flexShrink: 0 },
  headerTitle: { fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
  headerSub: { fontSize: '12px', color: 'var(--text3)', marginTop: '2px' },
  statusDot: { display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 },
  rolePill: { padding: '5px 14px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: '1px solid var(--green-bg2)' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  welcome: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem', gap: '1rem', margin: 'auto' },
  welcomeIcon: { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' },
  welcomeTitle: { fontSize: '1.3rem', fontWeight: 600, color: 'var(--text)' },
  welcomeSub: { fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, maxWidth: '380px' },
}
