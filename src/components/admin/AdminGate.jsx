import { useState } from 'react'

const SESSION_KEY = 'brumus-admin-auth'
const PASSPHRASE = import.meta.env.VITE_ADMIN_PASSPHRASE

export default function AdminGate({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (input === PASSPHRASE) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthed(true)
    } else {
      setError('Incorrect passphrase. Try again.')
      setInput('')
    }
  }

  if (authed) return children

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--text)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: 16,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🍷</div>
        <h1 className="playfair" style={{ fontSize: 24, marginBottom: 6 }}>Admin Panel</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          Brumus Wine Bible · Haymarket Hotel
        </p>
        <form onSubmit={handleSubmit}>
          <input
            className="form-input"
            type="password"
            placeholder="Enter passphrase…"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            style={{ marginBottom: 12, textAlign: 'center', fontSize: 16 }}
          />
          {error && <div style={{ color: '#d9534f', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}>
            Enter
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: 11, color: 'var(--muted)' }}>
          Public wine guide: <a href="/" style={{ color: 'var(--gold)' }}>← Back to guide</a>
        </p>
      </div>
    </div>
  )
}
