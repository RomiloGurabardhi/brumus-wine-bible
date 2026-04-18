export default function Header({ activeTab, onTabChange, searchTerm, onSearch, theme, onToggleTheme }) {
  const tabs = [
    { id: 'wines', label: '🍷 Wine Guide' },
    { id: 'btg', label: '🥂 By the Glass' },
    { id: 'map', label: '🗺️ Map' },
    { id: 'pairings', label: '🍽️ Pairings' },
    { id: 'quiz', label: '📝 Quiz' },
    { id: 'leaderboard', label: '🏆 Leaderboard' },
  ]

  return (
    <>
      <header className="site-header">
        <div className="header-logo">
          Brumus <span>Wine Bible</span>
        </div>
        <div className="header-search-wrap">
          <span className="header-search-icon">🔍</span>
          <input
            className="header-search"
            type="text"
            placeholder="Search wine, grape, food…"
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={onToggleTheme} title="Toggle dark mode">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a
            href="/admin"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(249,246,240,0.7)',
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            Admin
          </a>
        </div>
      </header>
      <nav className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}
