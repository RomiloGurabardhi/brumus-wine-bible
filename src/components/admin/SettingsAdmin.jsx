import { useState, useEffect } from 'react'
import { supabase, PROPERTY_ID } from '../../lib/supabase'

export default function SettingsAdmin() {
  const [featured, setFeatured] = useState(null)
  const [wines, setWines] = useState([])
  const [loading, setLoading] = useState(true)
  const [darkDefault, setDarkDefault] = useState(() => localStorage.getItem('brumus-default-theme') === 'dark')
  const [wowSaving, setWowSaving] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('wines')
      .select('id, name, producer, vintage, featured')
      .eq('property_id', PROPERTY_ID)
      .eq('active', true)
      .order('region')
      .order('name')
    setWines(data || [])
    setFeatured(data?.find(w => w.featured)?.id || '')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSetWow(wineId) {
    setWowSaving(true)
    await supabase.from('wines').update({ featured: false }).eq('property_id', PROPERTY_ID)
    if (wineId) {
      await supabase.from('wines').update({ featured: true }).eq('id', wineId)
    }
    setFeatured(wineId || '')
    setWowSaving(false)
  }

  function handleDarkDefault(val) {
    setDarkDefault(val)
    localStorage.setItem('brumus-default-theme', val ? 'dark' : 'light')
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  const currentFeatured = wines.find(w => w.id === featured)

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">⚙️ Settings</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 640 }}>

        {/* Wine of the Week */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>⭐ Wine of the Week</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
            Pinned wine shown in the banner at the top of the public guide.
          </p>
          {currentFeatured && (
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, marginBottom: 10 }}>
              Current: {currentFeatured.name}{currentFeatured.producer ? ` — ${currentFeatured.producer}` : ''}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ flex: 1, minWidth: 220 }}
              value={featured}
              onChange={e => setFeatured(e.target.value)}
            >
              <option value="">— None —</option>
              {wines.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}{w.vintage ? ` ${w.vintage}` : ''}{w.producer ? ` — ${w.producer}` : ''}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => handleSetWow(featured)} disabled={wowSaving}>
              {wowSaving ? 'Saving…' : 'Set Wine of the Week'}
            </button>
          </div>
        </div>

        {/* Dark Mode Default */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>🌙 Public Guide Default Theme</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
            Sets the initial theme for first-time visitors (before they toggle). Stored in this browser only.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={`btn ${!darkDefault ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleDarkDefault(false)}
            >
              ☀️ Light (default)
            </button>
            <button
              className={`btn ${darkDefault ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleDarkDefault(true)}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        {/* Property Info */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>🏨 Property Info</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>Read-only. Configured via environment variables.</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { label: 'Venue', value: 'Brumus Bar & Restaurant' },
              { label: 'Hotel', value: 'Haymarket Hotel' },
              { label: 'Group', value: 'Firmdale Hotels' },
              { label: 'Property ID', value: PROPERTY_ID || '(not set)' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--muted)', minWidth: 110 }}>{label}</span>
                <span style={{ fontWeight: 500, fontFamily: label === 'Property ID' ? 'monospace' : undefined, fontSize: label === 'Property ID' ? 12 : 13 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Env Var Instructions */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>🔧 Updating Configuration</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
            To change the admin passphrase or Supabase credentials, update the Netlify environment variables and redeploy:
          </p>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8, color: 'var(--text)' }}>
            <div style={{ color: 'var(--muted)' }}># Netlify → Site settings → Environment variables</div>
            <div>VITE_SUPABASE_URL=https://&lt;project&gt;.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=eyJ...</div>
            <div>VITE_ADMIN_PASSPHRASE=your-secure-passphrase</div>
            <div>VITE_PROPERTY_ID=&lt;uuid from properties table&gt;</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            After updating, trigger a new deploy from the Netlify dashboard or push a commit.
          </p>
        </div>

      </div>
    </div>
  )
}
