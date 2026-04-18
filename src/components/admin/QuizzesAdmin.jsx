import { useState, useEffect } from 'react'
import { supabase, PROPERTY_ID } from '../../lib/supabase'

function generateQuestions(wines) {
  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
  const qs = []
  const shuffled = shuffle(wines)

  shuffled.forEach(wine => {
    if (qs.length >= 10) return
    const allRegions = [...new Set(wines.map(w => w.region))].filter(r => r !== wine.region)
    const regionDistr = shuffle(allRegions).slice(0, 3)
    qs.push({
      id: `q-${Date.now()}-${Math.random()}`,
      question_text: `Which region is "${wine.name}" from?`,
      type: 'multiple_choice',
      options: shuffle([wine.region, ...regionDistr]),
      correct_answer: wine.region,
      wine_id: wine.id,
    })
  })

  shuffle(wines).forEach(wine => {
    if (qs.length >= 10) return
    const primary = wine.grape?.split('/')[0].trim()
    if (!primary) return
    const allGrapes = [...new Set(wines.map(w => w.grape?.split('/')[0].trim()).filter(Boolean))].filter(g => g !== primary)
    const distr = shuffle(allGrapes).slice(0, 3)
    qs.push({
      id: `q-${Date.now()}-${Math.random()}`,
      question_text: `What is the main grape in "${wine.name}"?`,
      type: 'multiple_choice',
      options: shuffle([primary, ...distr]),
      correct_answer: primary,
      wine_id: wine.id,
    })
  })

  shuffle(wines).forEach(wine => {
    if (qs.length >= 10) return
    const isRed = wine.type === 'red'
    const flip = Math.random() > 0.5
    const stmt = flip ? !isRed : isRed
    qs.push({
      id: `q-${Date.now()}-${Math.random()}`,
      question_text: `True or false: "${wine.name}" is a ${flip ? 'white' : 'red'} wine.`,
      type: 'true_false',
      options: ['True', 'False'],
      correct_answer: stmt ? 'True' : 'False',
      wine_id: wine.id,
    })
  })

  return qs.slice(0, 10)
}

function QuestionEditor({ question, onChange, onRemove }) {
  const set = (k, v) => onChange({ ...question, [k]: v })
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
        <select className="form-select" style={{ width: 160 }} value={question.type} onChange={e => set('type', e.target.value)}>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True / False</option>
        </select>
        <button className="btn-icon" onClick={onRemove} title="Remove" style={{ marginLeft: 'auto', color: '#d9534f' }}>🗑️</button>
      </div>
      <div className="form-group">
        <label className="form-label">Question</label>
        <input className="form-input" value={question.question_text} onChange={e => set('question_text', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Options (one per line)</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: 80 }}
          value={question.options?.join('\n') || ''}
          onChange={e => set('options', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Correct Answer</label>
        <input className="form-input" value={question.correct_answer} onChange={e => set('correct_answer', e.target.value)} />
      </div>
    </div>
  )
}

export default function QuizzesAdmin() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [wines, setWines] = useState([])
  const [phase, setPhase] = useState('list') // list | create
  const [form, setForm] = useState({ title: '', description: '', questions: [] })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function load() {
    const [{ data: qData }, { data: wData }] = await Promise.all([
      supabase.from('quizzes').select('*').eq('property_id', PROPERTY_ID).order('created_at', { ascending: false }),
      supabase.from('wines').select('*').eq('property_id', PROPERTY_ID).eq('active', true),
    ])
    setQuizzes(qData || [])
    setWines(wData || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(quiz) {
    await supabase.from('quizzes').update({ active: !quiz.active }).eq('id', quiz.id)
    setQuizzes(qs => qs.map(q => q.id === quiz.id ? { ...q, active: !q.active } : q))
  }

  async function deleteQuiz(id) {
    if (!window.confirm('Delete this quiz? All results will remain.')) return
    await supabase.from('quizzes').delete().eq('id', id)
    setQuizzes(qs => qs.filter(q => q.id !== id))
  }

  function handleGenerate() {
    if (wines.length === 0) return
    setGenerating(true)
    setTimeout(() => {
      const qs = generateQuestions(wines)
      setForm(f => ({ ...f, questions: qs }))
      setGenerating(false)
    }, 100)
  }

  function updateQuestion(i, q) {
    setForm(f => ({ ...f, questions: f.questions.map((old, idx) => idx === i ? q : old) }))
  }

  function removeQuestion(i) {
    setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))
  }

  function addEmptyQuestion() {
    setForm(f => ({
      ...f,
      questions: [...f.questions, {
        id: `q-${Date.now()}`,
        question_text: '',
        type: 'multiple_choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        wine_id: null,
      }]
    }))
  }

  async function handleSave() {
    if (!form.title.trim() || form.questions.length === 0) return
    setSaving(true)
    await supabase.from('quizzes').insert({
      property_id: PROPERTY_ID,
      title: form.title.trim(),
      description: form.description.trim() || null,
      questions: form.questions,
      active: true,
    })
    setSaving(false)
    setPhase('list')
    setForm({ title: '', description: '', questions: [] })
    load()
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  if (phase === 'create') return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">📝 Create Quiz</h2>
        <div className="admin-toolbar">
          <button className="btn btn-secondary" onClick={() => setPhase('list')}>← Back</button>
          <button className="btn btn-secondary" onClick={handleGenerate} disabled={generating || wines.length === 0}>
            {generating ? 'Generating…' : '🔄 Auto-generate 10 Questions'}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.title.trim() || form.questions.length === 0}>
            {saving ? 'Saving…' : 'Save Quiz'}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Quiz Title *</label>
        <input className="form-input" style={{ maxWidth: 480 }} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Burgundy Deep Dive" />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" style={{ maxWidth: 480 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional intro for staff" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 12px' }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>
          Questions ({form.questions.length})
        </div>
        <button className="btn btn-secondary btn-sm" onClick={addEmptyQuestion}>+ Add Question</button>
      </div>

      {form.questions.length === 0 && (
        <div className="no-results" style={{ padding: 30 }}>
          No questions yet. Auto-generate from wine data or add manually.
        </div>
      )}

      {form.questions.map((q, i) => (
        <QuestionEditor
          key={q.id}
          question={q}
          onChange={q => updateQuestion(i, q)}
          onRemove={() => removeQuestion(i)}
        />
      ))}
    </div>
  )

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">📝 Quizzes</h2>
        <button className="btn btn-primary" onClick={() => setPhase('create')}>+ Create Quiz</button>
      </div>

      {quizzes.length === 0 ? (
        <div className="no-results">No quizzes yet. Create one to get started.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Questions</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(q => (
                <tr key={q.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{q.title}</div>
                    {q.description && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{q.description}</div>}
                  </td>
                  <td>{q.questions?.length || 0}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {new Date(q.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td>
                    <label className="toggle">
                      <input type="checkbox" checked={q.active} onChange={() => toggleActive(q)} />
                      <span className="toggle-track" />
                    </label>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => deleteQuiz(q.id)} title="Delete quiz">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
