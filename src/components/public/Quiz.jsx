import { useState, useEffect } from 'react'
import { supabase, PROPERTY_ID } from '../../lib/supabase'

function generateAutoQuestions(wines) {
  const qs = []
  const shuffled = [...wines].sort(() => Math.random() - 0.5)
  const used = new Set()

  const addQ = (q) => { if (qs.length < 10) qs.push(q) }

  shuffled.forEach(wine => {
    if (used.has(wine.id)) return

    // Region question
    if (qs.length < 3 && wine.region) {
      const allRegions = [...new Set(wines.map(w => w.region))].filter(r => r !== wine.region)
      const distractors = allRegions.sort(() => Math.random() - 0.5).slice(0, 3)
      const options = shuffle([wine.region, ...distractors])
      addQ({
        id: `q-region-${wine.id}`,
        question_text: `Which region is "${wine.name}" from?`,
        type: 'multiple_choice',
        options,
        correct_answer: wine.region,
        wine_id: wine.id,
      })
      used.add(wine.id)
    }

    // Type true/false
    if (qs.length < 5 && wine.type) {
      const isRed = wine.type === 'red'
      const flip = Math.random() > 0.5
      const statement = flip ? !isRed : isRed
      addQ({
        id: `q-type-${wine.id}`,
        question_text: `True or false: "${wine.name}" is a ${flip ? 'white' : 'red'} wine.`,
        type: 'true_false',
        options: ['True', 'False'],
        correct_answer: statement ? 'True' : 'False',
        wine_id: wine.id,
      })
      used.add(wine.id)
    }

    // Body question
    if (qs.length < 7 && wine.body) {
      const bodies = ['light', 'medium', 'full'].filter(b => b !== wine.body)
      const options = shuffle([wine.body, ...bodies])
      addQ({
        id: `q-body-${wine.id}`,
        question_text: `What body does "${wine.name}" have?`,
        type: 'multiple_choice',
        options,
        correct_answer: wine.body,
        wine_id: wine.id,
      })
      used.add(wine.id)
    }

    // Grape question
    if (qs.length < 10 && wine.grape) {
      const primaryGrape = wine.grape.split('/')[0].trim()
      const allGrapes = [...new Set(wines.map(w => w.grape?.split('/')[0].trim()).filter(Boolean))]
        .filter(g => g !== primaryGrape)
      const distractors = allGrapes.sort(() => Math.random() - 0.5).slice(0, 3)
      const options = shuffle([primaryGrape, ...distractors])
      addQ({
        id: `q-grape-${wine.id}`,
        question_text: `What is the main grape variety in "${wine.name}"?`,
        type: 'multiple_choice',
        options,
        correct_answer: primaryGrape,
        wine_id: wine.id,
      })
      used.add(wine.id)
    }
  })

  return qs.slice(0, 10)
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getScoreMessage(pct) {
  if (pct === 100) return '🏆 Perfect score!'
  if (pct >= 80) return '⭐ Excellent work!'
  if (pct >= 60) return '👍 Good effort!'
  if (pct >= 40) return '📚 Keep studying!'
  return '🍷 Room to improve – review the wine guide!'
}

export default function Quiz({ wines }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('list') // list | name | playing | score
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [staffName, setStaffName] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('quizzes')
      .select('*')
      .eq('property_id', PROPERTY_ID)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setQuizzes(data || [])
        setLoading(false)
      })
  }, [])

  function startQuiz(quiz) {
    const questions = quiz.questions?.length > 0
      ? quiz.questions
      : generateAutoQuestions(wines)
    setSelectedQuiz({ ...quiz, questions })
    setPhase('name')
  }

  function beginPlaying() {
    if (!staffName.trim()) return
    setQuestionIndex(0)
    setAnswers([])
    setSelected(null)
    setShowFeedback(false)
    setScore(0)
    setPhase('playing')
  }

  function handleAnswer(option) {
    if (selected !== null) return
    setSelected(option)
    setShowFeedback(true)
    const q = selectedQuiz.questions[questionIndex]
    const correct = option === q.correct_answer
    if (correct) setScore(s => s + 1)
    setAnswers(prev => [...prev, { questionId: q.id, selected: option, correct }])
  }

  async function nextQuestion() {
    const total = selectedQuiz.questions.length
    if (questionIndex + 1 >= total) {
      setSaving(true)
      await supabase.from('quiz_results').insert({
        property_id: PROPERTY_ID,
        quiz_id: selectedQuiz.id,
        staff_name: staffName.trim(),
        score,
        total_questions: total,
        answers,
      })
      setSaving(false)
      setPhase('score')
    } else {
      setQuestionIndex(i => i + 1)
      setSelected(null)
      setShowFeedback(false)
    }
  }

  function reset() {
    setPhase('list')
    setSelectedQuiz(null)
    setStaffName('')
    setQuestionIndex(0)
    setAnswers([])
    setSelected(null)
    setShowFeedback(false)
    setScore(0)
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  return (
    <div className="quiz-section">
      {phase === 'list' && (
        <>
          <h2 className="playfair" style={{ marginBottom: 16, fontSize: 22 }}>Staff Quizzes</h2>
          {quizzes.length === 0 ? (
            <div className="no-results">No quizzes available yet. Ask your admin to create one.</div>
          ) : (
            <div className="quiz-list">
              {quizzes.map(q => (
                <div key={q.id} className="quiz-list-card">
                  <div className="quiz-list-info">
                    <div className="quiz-list-title">{q.title}</div>
                    {q.description && <div className="quiz-list-desc">{q.description}</div>}
                    <div className="quiz-list-meta">
                      {q.questions?.length || 0} questions · No login required
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => startQuiz(q)}>
                    Start Quiz →
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {phase === 'name' && (
        <div className="quiz-name-screen">
          <h2>{selectedQuiz.title}</h2>
          {selectedQuiz.description && <p>{selectedQuiz.description}</p>}
          <p style={{ marginBottom: 20 }}>
            {selectedQuiz.questions.length} questions · Enter your name to start
          </p>
          <input
            className="form-input"
            style={{ textAlign: 'center', fontSize: 16, marginBottom: 16 }}
            placeholder="Your first name…"
            value={staffName}
            onChange={e => setStaffName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && beginPlaying()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={reset}>Back</button>
            <button className="btn btn-primary" onClick={beginPlaying} disabled={!staffName.trim()}>
              Start →
            </button>
          </div>
        </div>
      )}

      {phase === 'playing' && selectedQuiz && (() => {
        const q = selectedQuiz.questions[questionIndex]
        const total = selectedQuiz.questions.length
        const progress = ((questionIndex) / total) * 100

        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--muted)' }}>
              <span>Question {questionIndex + 1} of {total}</span>
              <span>{staffName}</span>
            </div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="quiz-question-card">
              <div className="quiz-question-meta">{q.type === 'true_false' ? 'True / False' : 'Multiple Choice'}</div>
              <div className="quiz-question-text">{q.question_text}</div>
              <div className="quiz-options">
                {q.options.map(opt => {
                  let cls = 'quiz-option'
                  if (showFeedback && opt === q.correct_answer) cls += ' correct'
                  else if (showFeedback && opt === selected && opt !== q.correct_answer) cls += ' incorrect'
                  return (
                    <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={showFeedback}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  )
                })}
              </div>
              {showFeedback && (
                <div className={`quiz-feedback ${selected === q.correct_answer ? 'correct' : 'incorrect'}`}>
                  {selected === q.correct_answer ? '✓ Correct!' : `✗ Correct answer: ${q.correct_answer}`}
                </div>
              )}
              {showFeedback && (
                <div style={{ marginTop: 14, textAlign: 'right' }}>
                  <button className="btn btn-primary" onClick={nextQuestion} disabled={saving}>
                    {questionIndex + 1 >= total ? (saving ? 'Saving…' : 'See Results →') : 'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          </>
        )
      })()}

      {phase === 'score' && (
        <div className="quiz-score-card">
          <div className="quiz-score-number">{score}/{selectedQuiz.questions.length}</div>
          <div className="quiz-score-label">{Math.round((score / selectedQuiz.questions.length) * 100)}% correct</div>
          <div className="quiz-score-msg">{getScoreMessage(Math.round((score / selectedQuiz.questions.length) * 100))}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
            Well done, {staffName}! Your score has been saved.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={reset}>Back to Quizzes</button>
            <button className="btn btn-primary" onClick={() => startQuiz(selectedQuiz)}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  )
}
