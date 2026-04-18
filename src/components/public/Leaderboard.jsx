import { useState, useEffect } from 'react'
import { supabase, PROPERTY_ID } from '../../lib/supabase'

export default function Leaderboard() {
  const [quizzes, setQuizzes] = useState([])
  const [results, setResults] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState('all')
  const [view, setView] = useState('quiz') // 'quiz' | 'lifetime'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: qData }, { data: rData }] = await Promise.all([
        supabase.from('quizzes').select('id, title').eq('property_id', PROPERTY_ID).eq('active', true),
        supabase.from('quiz_results').select('*').eq('property_id', PROPERTY_ID).order('completed_at', { ascending: false }).limit(500),
      ])
      setQuizzes(qData || [])
      setResults(rData || [])
      setLoading(false)
    }
    load()
  }, [])

  const quizFiltered = results
    .filter(r => selectedQuiz === 'all' || r.quiz_id === selectedQuiz)
    .map(r => ({
      ...r,
      pct: Math.round((r.score / r.total_questions) * 100),
      quizTitle: quizzes.find(q => q.id === r.quiz_id)?.title || 'Unknown Quiz',
    }))
    .sort((a, b) => b.pct - a.pct || b.score - a.score)
    .slice(0, 10)

  // Lifetime: aggregate all results per staff member
  const lifetimeMap = {}
  results.forEach(r => {
    const key = r.staff_name.trim().toLowerCase()
    if (!lifetimeMap[key]) {
      lifetimeMap[key] = { name: r.staff_name, totalScore: 0, totalQuestions: 0, attempts: 0 }
    }
    lifetimeMap[key].totalScore += r.score
    lifetimeMap[key].totalQuestions += r.total_questions
    lifetimeMap[key].attempts += 1
  })
  const lifetime = Object.values(lifetimeMap)
    .map(e => ({ ...e, pct: Math.round((e.totalScore / e.totalQuestions) * 100) }))
    .sort((a, b) => b.pct - a.pct || b.totalScore - a.totalScore)
    .slice(0, 10)

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  return (
    <div className="leaderboard-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 className="playfair" style={{ fontSize: 22 }}>🏆 Leaderboard</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${view === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('quiz')}
          >
            Per Quiz
          </button>
          <button
            className={`btn btn-sm ${view === 'lifetime' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('lifetime')}
          >
            🏅 Lifetime
          </button>
        </div>
      </div>

      {view === 'quiz' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 200 }}
              value={selectedQuiz}
              onChange={e => setSelectedQuiz(e.target.value)}
            >
              <option value="all">All Quizzes</option>
              {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
            </select>
          </div>

          {quizFiltered.length === 0 ? (
            <div className="no-results">No results yet. Be the first to take a quiz!</div>
          ) : (
            <div className="leaderboard-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Staff Name</th>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>%</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quizFiltered.map((r, i) => (
                    <tr key={r.id}>
                      <td>
                        <span className={`leaderboard-rank${i < 3 ? ` top-${i + 1}` : ''}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{r.staff_name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.quizTitle}</td>
                      <td><span className="leaderboard-score">{r.score}/{r.total_questions}</span></td>
                      <td>
                        <span style={{
                          background: r.pct >= 80 ? '#e8f8e8' : r.pct >= 60 ? '#fff8e8' : '#fce8e8',
                          color: r.pct >= 80 ? '#1a4a20' : r.pct >= 60 ? '#5a3c00' : '#5a1a1a',
                          padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        }}>{r.pct}%</span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {new Date(r.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'lifetime' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            All-time average across every quiz attempt per staff member.
          </p>
          {lifetime.length === 0 ? (
            <div className="no-results">No results yet. Be the first to take a quiz!</div>
          ) : (
            <div className="leaderboard-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Staff Name</th>
                    <th>Attempts</th>
                    <th>Total Score</th>
                    <th>Avg %</th>
                  </tr>
                </thead>
                <tbody>
                  {lifetime.map((e, i) => (
                    <tr key={e.name}>
                      <td>
                        <span className={`leaderboard-rank${i < 3 ? ` top-${i + 1}` : ''}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{e.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{e.attempts}</td>
                      <td><span className="leaderboard-score">{e.totalScore}/{e.totalQuestions}</span></td>
                      <td>
                        <span style={{
                          background: e.pct >= 80 ? '#e8f8e8' : e.pct >= 60 ? '#fff8e8' : '#fce8e8',
                          color: e.pct >= 80 ? '#1a4a20' : e.pct >= 60 ? '#5a3c00' : '#5a1a1a',
                          padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        }}>{e.pct}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
