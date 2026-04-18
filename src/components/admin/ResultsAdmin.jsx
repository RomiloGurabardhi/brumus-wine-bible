import { useState, useEffect } from 'react'
import { supabase, PROPERTY_ID } from '../../lib/supabase'

export default function ResultsAdmin() {
  const [results, setResults] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [quizFilter, setQuizFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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

  const filtered = results.filter(r => {
    if (quizFilter !== 'all' && r.quiz_id !== quizFilter) return false
    if (dateFrom && r.completed_at < dateFrom) return false
    if (dateTo && r.completed_at > dateTo + 'T23:59:59') return false
    return true
  })

  function exportCSV() {
    const rows = [
      ['Staff Name', 'Quiz', 'Score', 'Total', 'Percentage', 'Date'],
      ...filtered.map(r => [
        r.staff_name,
        quizMap[r.quiz_id] || 'Unknown',
        r.score,
        r.total_questions,
        Math.round((r.score / r.total_questions) * 100) + '%',
        new Date(r.completed_at).toLocaleString('en-GB'),
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `brumus-quiz-results-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">📊 Quiz Results</h2>
        <div className="admin-toolbar">
          <button className="btn btn-secondary" onClick={exportCSV} disabled={filtered.length === 0}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <select className="form-select" style={{ width: 200 }} value={quizFilter} onChange={e => setQuizFilter(e.target.value)}>
          <option value="all">All Quizzes</option>
          {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
        <input
          className="form-input"
          type="date"
          style={{ width: 160 }}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          placeholder="From date"
        />
        <input
          className="form-input"
          type="date"
          style={{ width: 160 }}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          placeholder="To date"
        />
        {(quizFilter !== 'all' || dateFrom || dateTo) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setQuizFilter('all'); setDateFrom(''); setDateTo('') }}>
            Clear filters
          </button>
        )}
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        {filtered.length > 0 && ` · Average: ${Math.round(filtered.reduce((a, r) => a + (r.score / r.total_questions) * 100, 0) / filtered.length)}%`}
      </div>

      {filtered.length === 0 ? (
        <div className="no-results">No results found for the selected filters.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>%</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const pct = Math.round((r.score / r.total_questions) * 100)
                return (
                  <tr key={r.id}>
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
