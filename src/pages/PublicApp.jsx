import { useState, useEffect, lazy, Suspense } from 'react'
import { supabase, PROPERTY_ID } from '../lib/supabase'
import Header from '../components/public/Header'
import WineGrid from '../components/public/WineGrid'
import BTGView from '../components/public/BTGView'
import PairingSuggester from '../components/public/PairingSuggester'
import Quiz from '../components/public/Quiz'
import Leaderboard from '../components/public/Leaderboard'

const WorldMap = lazy(() => import('../components/public/WorldMap'))

const DEFAULT_FILTERS = { type: 'all', body: 'all', pairing: 'all', btg: false, upsell: false }

export default function PublicApp() {
  const [wines, setWines] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('wines')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  )

  useEffect(() => {
    supabase
      .from('wines')
      .select('*')
      .eq('property_id', PROPERTY_ID)
      .eq('active', true)
      .order('region')
      .then(({ data }) => {
        setWines(data || [])
        setLoading(false)
      })
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('brumus-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    if (tab !== 'wines' && tab !== 'btg') setSearchTerm('')
  }

  if (loading) {
    return (
      <>
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <div className="loading-wrap"><div className="spinner" /></div>
      </>
    )
  }

  return (
    <>
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="legend-bar" style={{ display: activeTab === 'wines' ? 'flex' : 'none' }}>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--gold)' }} />
          Upsell opportunity
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--fix-border)' }} />
          Extra knowledge
        </div>
        <div className="legend-item" style={{ color: 'var(--muted)', fontSize: 11 }}>
          Click any card to expand
        </div>
      </div>

      {activeTab === 'wines' && (
        <WineGrid
          wines={wines}
          searchTerm={searchTerm}
          filters={filters}
          onFilterChange={setFilters}
        />
      )}

      {activeTab === 'btg' && <BTGView wines={wines} />}

      {activeTab === 'map' && (
        <Suspense fallback={<div className="loading-wrap"><div className="spinner" /></div>}>
          <WorldMap wines={wines} />
        </Suspense>
      )}

      {activeTab === 'pairings' && <PairingSuggester wines={wines} />}

      {activeTab === 'quiz' && <Quiz wines={wines} />}

      {activeTab === 'leaderboard' && <Leaderboard />}

      <footer style={{
        marginTop: 60,
        padding: '28px 24px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--muted)',
        lineHeight: 1.8,
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text)', marginBottom: 4, letterSpacing: '0.03em' }}>
          Brumus Wine Bible
        </div>
        <div>
          Conceived by <span style={{ color: 'var(--gold)' }}>Romain</span>
          {' · '}
          Crafted by <span style={{ color: 'var(--gold)' }}>Romilo</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 11 }}>
          Brumus Bar &amp; Restaurant · Haymarket Hotel · Firmdale Hotels
        </div>
      </footer>
    </>
  )
}
