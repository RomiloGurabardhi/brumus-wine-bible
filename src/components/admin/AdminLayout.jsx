const NAV_ITEMS = [
  { id: 'wines', icon: '🍷', label: 'Wines' },
  { id: 'quizzes', icon: '📝', label: 'Quizzes' },
  { id: 'results', icon: '📊', label: 'Results' },
  { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
  { id: 'map', icon: '🗺️', label: 'Map Editor' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

export default function AdminLayout({ active, onNav, children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <h2>🍷 Wine Bible</h2>
          <p>Admin Panel</p>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`admin-nav-btn${active === item.id ? ' active' : ''}`}
              onClick={() => onNav(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div style={{ marginTop: 'auto', padding: '20px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <a
              href="/"
              style={{ fontSize: 12, color: 'rgba(249,246,240,0.4)', display: 'block', textAlign: 'center' }}
            >
              ← Public Guide
            </a>
          </div>
        </nav>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  )
}
