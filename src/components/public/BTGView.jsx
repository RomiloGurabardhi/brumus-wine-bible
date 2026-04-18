import WineCard from './WineCard'
import { REGION_STYLES } from '../../lib/wineRegionsData'

export default function BTGView({ wines }) {
  const btgWines = wines.filter(w => w.by_the_glass)
  const regular = btgWines.filter(w => !w.coravin)
  const coravin = btgWines.filter(w => w.coravin)

  if (btgWines.length === 0) {
    return (
      <main className="page-main">
        <div className="no-results">No by-the-glass wines configured yet. Add them in the admin panel.</div>
      </main>
    )
  }

  const Section = ({ title, subtitle, list }) => (
    <div className="region-group">
      <div className="region-header">
        <span className="region-name">{title}</span>
        {subtitle && <span className="region-style">{subtitle}</span>}
      </div>
      <div className="wines-grid">
        {list.map(w => <WineCard key={w.id} wine={w} />)}
      </div>
    </div>
  )

  const regularWhites = regular.filter(w => w.type === 'white')
  const regularReds = regular.filter(w => w.type === 'red')
  const coravinWhites = coravin.filter(w => w.type === 'white')
  const coravinReds = coravin.filter(w => w.type === 'red')

  return (
    <>
      <div className="legend-bar">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--gold)' }} />
          All by-the-glass wines showing glass price
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#2a1a5a' }} />
          Coravin – premium by the glass
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
          {btgWines.length} wines available by the glass
        </div>
      </div>
      <main className="page-main">
        {regularWhites.length > 0 && <Section title="White Wines" subtitle="By the glass & carafe" list={regularWhites} />}
        {coravinWhites.length > 0 && <Section title="White Wines" subtitle="By Coravin" list={coravinWhites} />}
        {regularReds.length > 0 && <Section title="Red Wines" subtitle="By the glass & carafe" list={regularReds} />}
        {coravinReds.length > 0 && <Section title="Red Wines" subtitle="By Coravin" list={coravinReds} />}
      </main>
    </>
  )
}
