import { useState, useEffect } from 'react'
import { supabase, PROPERTY_ID } from '../../lib/supabase'
import { seedDatabase } from '../../lib/seedData'

const EMPTY_WINE = {
  name: '', producer: '', vintage: '', region: '', country: '', grape: '',
  type: 'white', body: 'medium', bottle_price: '', glass_price: '', carafe_price: '',
  tasting_notes: '', food_pairings: '', upsell_tip: '', fix_tip: '',
  by_the_glass: false, coravin: false, active: true, featured: false,
}

function WineModal({ wine, onClose, onSave }) {
  const [form, setForm] = useState(() => wine ? {
    ...wine,
    food_pairings: Array.isArray(wine.food_pairings) ? wine.food_pairings.join(', ') : '',
    vintage: wine.vintage || '',
  } : { ...EMPTY_WINE })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    setSaving(true)
    const payload = {
      ...form,
      property_id: PROPERTY_ID,
      vintage: form.vintage ? parseInt(form.vintage) : null,
      bottle_price: parseFloat(form.bottle_price) || 0,
      glass_price: form.glass_price ? parseFloat(form.glass_price) : null,
      carafe_price: form.carafe_price ? parseFloat(form.carafe_price) : null,
      food_pairings: form.food_pairings
        ? form.food_pairings.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    }
    if (wine?.id) {
      await supabase.from('wines').update(payload).eq('id', wine.id)
    } else {
      await supabase.from('wines').insert(payload)
    }
    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{wine?.id ? 'Edit Wine' : 'Add Wine'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Wine Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Sancerre 'Le Pierrier'" />
          </div>
          <div className="form-group">
            <label className="form-label">Producer</label>
            <input className="form-input" value={form.producer} onChange={e => set('producer', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Region</label>
            <input className="form-input" value={form.region} onChange={e => set('region', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input className="form-input" value={form.country} onChange={e => set('country', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Grape Variety</label>
            <input className="form-input" value={form.grape} onChange={e => set('grape', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Vintage</label>
            <input className="form-input" type="number" value={form.vintage} onChange={e => set('vintage', e.target.value)} placeholder="e.g. 2022" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
              {['white', 'red', 'rosé', 'sparkling', 'orange'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Body</label>
            <select className="form-select" value={form.body} onChange={e => set('body', e.target.value)}>
              {['light', 'medium', 'full'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Bottle Price (£) *</label>
            <input className="form-input" type="number" step="0.5" value={form.bottle_price} onChange={e => set('bottle_price', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Glass Price (£)</label>
            <input className="form-input" type="number" step="0.25" value={form.glass_price} onChange={e => set('glass_price', e.target.value)} placeholder="Leave blank if N/A" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Carafe Price (£)</label>
            <input className="form-input" type="number" step="0.5" value={form.carafe_price} onChange={e => set('carafe_price', e.target.value)} placeholder="Leave blank if N/A" />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end', paddingBottom: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={form.by_the_glass} onChange={e => set('by_the_glass', e.target.checked)} />
              By the glass
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={form.coravin} onChange={e => set('coravin', e.target.checked)} />
              Coravin
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tasting Notes</label>
          <textarea className="form-textarea" value={form.tasting_notes} onChange={e => set('tasting_notes', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Food Pairings (comma-separated)</label>
          <input className="form-input" value={form.food_pairings} onChange={e => set('food_pairings', e.target.value)} placeholder="Oysters, seafood, salads" />
        </div>

        <div className="form-group">
          <label className="form-label">Upsell Tip</label>
          <textarea className="form-textarea" style={{ minHeight: 60 }} value={form.upsell_tip} onChange={e => set('upsell_tip', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Note / Fix Tip</label>
          <textarea className="form-textarea" style={{ minHeight: 60 }} value={form.fix_tip} onChange={e => set('fix_tip', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
            Active (visible on public guide)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
            Wine of the Week ⭐
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.name || !form.bottle_price}>
            {saving ? 'Saving…' : 'Save Wine'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WinesAdmin() {
  const [wines, setWines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editWine, setEditWine] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [seedConfirm, setSeedConfirm] = useState(false)
  const [seeding, setSeeding] = useState(false)

  async function fetchWines() {
    const { data } = await supabase
      .from('wines')
      .select('*')
      .eq('property_id', PROPERTY_ID)
      .order('region')
      .order('name')
    setWines(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchWines() }, [])

  async function toggleActive(wine) {
    await supabase.from('wines').update({ active: !wine.active }).eq('id', wine.id)
    setWines(ws => ws.map(w => w.id === wine.id ? { ...w, active: !w.active } : w))
  }

  async function toggleFeatured(wine) {
    // Only one featured at a time
    if (!wine.featured) {
      await supabase.from('wines').update({ featured: false }).eq('property_id', PROPERTY_ID)
    }
    await supabase.from('wines').update({ featured: !wine.featured }).eq('id', wine.id)
    fetchWines()
  }

  async function handleSeed() {
    setSeeding(true)
    const { error } = await seedDatabase(supabase, PROPERTY_ID)
    setSeeding(false)
    setSeedConfirm(false)
    if (!error) fetchWines()
    else alert('Seed error: ' + error.message)
  }

  const filtered = wines.filter(w => {
    if (typeFilter !== 'all' && w.type !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return w.name.toLowerCase().includes(s) || w.producer?.toLowerCase().includes(s) || w.region?.toLowerCase().includes(s)
    }
    return true
  })

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">🍷 Wine Catalogue</h2>
        <div className="admin-toolbar">
          <input
            className="form-input"
            style={{ width: 200 }}
            placeholder="Search wines…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="form-select" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            {['white', 'red', 'rosé', 'sparkling', 'orange'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={() => setSeedConfirm(true)}>
            📥 Seed from file
          </button>
          <button className="btn btn-primary" onClick={() => { setEditWine(null); setShowModal(true) }}>
            + Add Wine
          </button>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
        {filtered.length} of {wines.length} wines
        {' · '}
        {wines.filter(w => w.active).length} active
        {' · '}
        {wines.filter(w => w.by_the_glass).length} by the glass
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Wine</th>
                <th>Region</th>
                <th>Type</th>
                <th>Price</th>
                <th>Glass</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.producer}{w.vintage ? ` · ${w.vintage}` : ''}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{w.region}</td>
                  <td>
                    <span className={`tag ${w.type}`}>{w.type}</span>
                  </td>
                  <td style={{ color: 'var(--accent)', fontWeight: 500 }}>£{w.bottle_price}</td>
                  <td>
                    {w.by_the_glass ? (
                      <span className="badge badge-btg">
                        {w.coravin ? 'Coravin' : `£${w.glass_price}`}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {!w.active && <span className="badge badge-inactive">Inactive</span>}
                      {w.featured && <span className="badge badge-featured">⭐ WoW</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" title="Edit" onClick={() => { setEditWine(w); setShowModal(true) }}>✏️</button>
                      <button
                        className="btn-icon"
                        title={w.active ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleActive(w)}
                      >
                        {w.active ? '👁️' : '🚫'}
                      </button>
                      <button
                        className="btn-icon"
                        title={w.featured ? 'Unpin WotW' : 'Pin as WotW'}
                        onClick={() => toggleFeatured(w)}
                      >
                        {w.featured ? '⭐' : '☆'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <WineModal
          wine={editWine}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchWines() }}
        />
      )}

      {seedConfirm && (
        <div className="modal-overlay" onClick={() => setSeedConfirm(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Seed Wine Database</span>
              <button className="modal-close" onClick={() => setSeedConfirm(false)}>✕</button>
            </div>
            <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--muted)' }}>
              This will import all 82 wines from the Brumus wine list into your Supabase database.
              Existing wines will not be removed.
            </p>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setSeedConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
                {seeding ? 'Importing…' : 'Import 82 Wines'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
