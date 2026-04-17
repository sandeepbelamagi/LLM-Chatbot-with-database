import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

const ROLE_COLORS = {
  Subscriber: '#378add',
  Advisor: '#1d9e75',
  Admin: '#ef9f27',
  'Platform Admin': '#e24b4a',
}

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>SLA<span style={{ color: 'var(--green)' }}>Insight</span></div>
          <p style={styles.tagline}>Role-aware SLA intelligence.<br />Chat with your data.</p>
        </div>
        <div style={styles.roles}>
          {Object.entries(ROLE_COLORS).map(([role, color]) => (
            <div key={role} style={{ ...styles.roleChip, borderColor: color, color }}>
              {role}
            </div>
          ))}
        </div>
        <p style={styles.hint}>Each role sees only what they're allowed to.</p>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.tabs}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}>
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={styles.form}>
            {mode === 'register' && (
              <div style={styles.field}>
                <label style={styles.label}>Full name</label>
                <input name="name" value={form.name} onChange={handle} required style={styles.input} placeholder="Jane Smith" />
              </div>
            )}
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required style={styles.input} placeholder="you@company.com" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} required style={styles.input} placeholder="••••••••" />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {mode === 'login' && (
            <p style={styles.sub}>
              New here?{' '}
              <span style={styles.link} onClick={() => setMode('register')}>Create an account</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'flex', height: '100vh', background: 'var(--bg)' },
  left: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', borderRight: '1px solid var(--border)' },
  brand: { marginBottom: '2.5rem' },
  logo: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.5px', marginBottom: '1rem' },
  tagline: { fontSize: '1.1rem', color: 'var(--text2)', lineHeight: 1.7 },
  roles: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' },
  roleChip: { padding: '5px 14px', borderRadius: '20px', border: '1px solid', fontSize: '13px', fontWeight: 500 },
  hint: { color: 'var(--text3)', fontSize: '13px' },
  right: { width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '1.5rem', background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: '4px' },
  tab: { flex: 1, padding: '8px', background: 'transparent', border: 'none', color: 'var(--text2)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, transition: 'all 0.15s' },
  tabActive: { background: 'var(--bg)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: 'var(--text2)', fontWeight: 500 },
  input: { padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '14px', outline: 'none', transition: 'border-color 0.15s' },
  error: { background: 'var(--red-bg)', color: 'var(--red)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '13px' },
  btn: { padding: '11px', background: 'var(--green)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '4px', transition: 'background 0.15s' },
  sub: { marginTop: '1.25rem', textAlign: 'center', color: 'var(--text2)', fontSize: '13px' },
  link: { color: 'var(--green)', cursor: 'pointer', fontWeight: 500 },
}
