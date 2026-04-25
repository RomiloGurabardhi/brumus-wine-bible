import { useState, useEffect, lazy, Suspense } from 'react'
import AdminGate from '../components/admin/AdminGate'
import AdminLayout from '../components/admin/AdminLayout'
import WinesAdmin from '../components/admin/WinesAdmin'
import QuizzesAdmin from '../components/admin/QuizzesAdmin'
import ResultsAdmin from '../components/admin/ResultsAdmin'
import LeaderboardAdmin from '../components/admin/LeaderboardAdmin'
import SettingsAdmin from '../components/admin/SettingsAdmin'
import { supabase, PROPERTY_ID } from '../lib/supabase'

const WorldMap = lazy(() => import('../components/public/WorldMap'))

function MapAdmin() {
  const [wines, setWines] = useState([])
  useEffect(() => {
    supabase.from('wines').select('*').eq('property_id', PROPERTY_ID).eq('active', true)
      .then(({ data }) => { if (data) setWines(data) })
  }, [])
  return (
    <div style={{ height: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, margin: 0 }}>Map Editor</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
          Draw new wine regions, move and resize existing polygons.
        </p>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Suspense fallback={<div style={{ padding: 40, color: 'var(--muted)' }}>Loading map…</div>}>
          <WorldMap wines={wines || []} isAdmin={true} />
        </Suspense>
      </div>
    </div>
  )
}

function AdminContent({ section }) {
  switch (section) {
    case 'wines': return <WinesAdmin />
    case 'quizzes': return <QuizzesAdmin />
    case 'results': return <ResultsAdmin />
    case 'leaderboard': return <LeaderboardAdmin />
    case 'map': return <MapAdmin />
    case 'settings': return <SettingsAdmin />
    default: return <WinesAdmin />
  }
}

export default function AdminApp() {
  const [section, setSection] = useState('wines')

  return (
    <AdminGate>
      <AdminLayout active={section} onNav={setSection}>
        <AdminContent section={section} />
      </AdminLayout>
    </AdminGate>
  )
}
