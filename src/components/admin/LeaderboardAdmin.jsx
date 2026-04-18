import { useState, useEffect } from 'react'
import { supabase, PROPERTY_ID } from '../../lib/supabase'

export default function LeaderboardAdmin() {
  const [results, setResults] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [quizFilter, setQuizFilter] = useState('all')
  const [resetting, setResetting] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)

  async function load() {
    const [{ data: rData }, { data: qData }] = await Promise.all([
      supabase.from('quiz_results').select('*').eq('property_id', PROPERTY_ID).order('completed_at', { ascending: false }),
      supabase.from('quizzes').select('id, title').eq('property_id', PROPERTY_ID),
    ])
    setResults(rData || [])
    setQuizzes(qData || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const quizMap = Object.fromEntries(quizzes.map(q => [q.id, q.title]))

  const filtered = quizFilter === 'all' ? results : results.filter(r => r.quiz_id === quizFilter)

  const leaderboard = [...filtered]
    .sort((a, b) => (b.score / b.total_questions) - (a.score / a.total_questions))
    .slice(0, 20)

  async function deleteResult(id) {
    if (!window.confirm('Delete this result?')) return
    await supabase.from('quiz_results').delete().eq('id', id)
    setResults(rs => rs.filter(r => r.id !== id))
  }

  async function handleReset() {
    setResetting(true)
    if (resetTarget === 'all') {
      await supabase.from('quiz_results').delete().eq('property_id', PROPERTY_ID)
    } else {
      await supabase.from('quiz_results').delete().eq('property_id', PROPERTY_ID).eq('quiz_id', resetTarget)
    }
    setResetting(false)
    setResetTarget(null)
    load()
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">🏆 Leaderboard</h2>
        <div className="admin-toolbar">
          <select className="form-select" style={{ width: 200 }} value={quizFilter} onChange={e => setQuizFilter(e.target.value)}>
            <option value="all">All Quizzes</option>
            {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          <button
            className="btn btn-danger"
            onClick={() => setResetTarget(quizFilter)}
          >
            🗑️ Reset {quizFilter === 'all' ? 'All' : 'This Quiz'}
          </button>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''} · Showing top 20 by score
      </div>

      {leaderboard.length === 0 ? (
        <div className="no-results">No results yet for this filter.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Staff Name</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>%</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, i) => {
                const pct = Math.round((r.score / r.total_questions) * 100)
                const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, fontSize: 16, textAlign: 'center' }}>{rankEmoji}</td>
                    <td style={{ fontWeight: 500 }}>{r.staff_name}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{quizMap[r.quiz_id] || 'Unknown'}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.score}/{r.total_questions}</td>
                    <td>
                      <span style={{
                        background: pct >= 80 ? '#e8f8e8' : pct >= 60 ? '#fff8e8' : '#fce8e8',
                        color: pct >= 80 ? '#1a4a20' : pct >= 60 ? '#5a3c00' : '#5a1a1a',
                        padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                      }}>{pct}%</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(r.completed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <button className="btn-icon" title="Delete result" onClick={() => deleteResult(r.id)} style={{ color: '#d9534f' }}>🗑️</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {resetTarget !== null && (
        <div className="modal-overlay" onClick={() => setResetTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Reset Leaderboard</span>
              <button className="modal-close" onClick={() => setResetTarget(null)}>✕</button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
              {resetTarget === 'all'
                ? 'This will permanently delete ALL quiz results across every quiz. This cannot be undone.'
                : `This will permanently delete all results for "${quizMap[resetTarget] || 'this quiz'}". This cannot be undone.`}
            </p>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setResetTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Deleting…' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
