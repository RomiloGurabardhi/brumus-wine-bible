import { useState } from 'react'
import AdminGate from '../components/admin/AdminGate'
import AdminLayout from '../components/admin/AdminLayout'
import WinesAdmin from '../components/admin/WinesAdmin'
import QuizzesAdmin from '../components/admin/QuizzesAdmin'
import ResultsAdmin from '../components/admin/ResultsAdmin'
import LeaderboardAdmin from '../components/admin/LeaderboardAdmin'
import SettingsAdmin from '../components/admin/SettingsAdmin'

function AdminContent({ section }) {
  switch (section) {
    case 'wines': return <WinesAdmin />
    case 'quizzes': return <QuizzesAdmin />
    case 'results': return <ResultsAdmin />
    case 'leaderboard': return <LeaderboardAdmin />
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
