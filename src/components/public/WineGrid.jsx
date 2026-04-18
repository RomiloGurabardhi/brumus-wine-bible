import { useMemo } from 'react'
import WineCard from './WineCard'
import WineOfWeekBanner from './WineOfWeekBanner'
import FilterBar, { matchesPairing } from './FilterBar'
import { REGION_STYLES } from '../../lib/wineRegionsData'

const DEFAULT_FILTERS = { type: 'all', body: 'all', pairing: 'all', btg: false, upsell: false }

export default function WineGrid({ wines, searchTerm, filters, onFilterChange }) {
  const featuredWine = useMemo(() => wines.find(w => w.featured), [wines])

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase()
    return wines.filter(w => {
      if (filters.type !== 'all' && w.type !== filters.type) return false
      if (filters.body !== 'all' && w.body !== filters.body) return false
      if (filters.btg && !w.by_the_glass) return false
      if (filters.upsell && !w.upsell_tip) return false
      if (!matchesPairing(w, filters.pairing)) return false
      if (s && !(
        w.name.toLowerCase().includes(s) ||
        w.producer?.toLowerCase().includes(s) ||
        w.grape?.toLowerCase().includes(s) ||
        w.region?.toLowerCase().includes(s) ||
        w.country?.toLowerCase().includes(s) ||
        w.tasting_notes?.toLowerCase().includes(s) ||
        w.food_pairings?.some(p => p.toLowerCase().includes(s))
      )) return false
      return true
    })
  }, [wines, searchTerm, filters])

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(w => {
      if (!groups[w.region]) groups[w.region] = []
      groups[w.region].push(w)
    })
    return groups
  }, [filtered])

  return (
    <>
      <FilterBar filters={filters} onChange={onFilterChange} />
      <main className="page-main">
        <WineOfWeekBanner wine={featuredWine} />

        {filtered.length === 0 && (
          <div className="no-results">No wines match your search. Try adjusting the filters.</div>
        )}

        {Object.entries(grouped).map(([region, regionWines]) => (
          <div key={region} className="region-group">
            <div className="region-header">
              <span className="region-name">{region}</span>
              {REGION_STYLES[region] && (
                <span className="region-style">{REGION_STYLES[region]}</span>
              )}
            </div>
            <div className="wines-grid">
              {regionWines.map(w => (
                <WineCard key={w.id} wine={w} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  )
}
