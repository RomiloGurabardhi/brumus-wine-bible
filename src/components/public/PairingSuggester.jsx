import { useState, useMemo } from 'react'

const PAIRING_KEYWORDS = {
  seafood: ['seafood', 'oyster', 'fish', 'shellfish', 'scallop', 'salmon', 'prawn', 'lobster', 'tuna', 'sole', 'turbot', 'mussel', 'crab'],
  beef: ['beef', 'steak', 'ribeye', 'burger', 'bistecca', 'braised', 'casserole', 'bbq', 'brisket'],
  lamb: ['lamb', 'shepherd'],
  poultry: ['chicken', 'duck', 'poultry', 'turkey', 'schnitzel', 'roast', 'pork', 'cutlet'],
  pasta: ['pasta', 'pizza', 'risotto', 'ravioli', 'tagliatelle', 'spaghetti', 'carbonara', 'bolognese', 'tomato'],
  cheese: ['cheese', 'parmesan', 'pecorino', 'cheddar', 'goat', 'brie', 'camembert', 'fondue'],
  veg: ['vegetable', 'salad', 'veg', 'mushroom', 'hummus', 'ratatouille', 'vegetarian', 'asparagus', 'artichoke', 'soup', 'minestrone'],
  game: ['game', 'venison', 'pheasant', 'wild', 'partridge', 'rabbit', 'hare', 'boar'],
  spicy: ['spicy', 'spice', 'asian', 'thai', 'curry', 'chilli', 'sichuan', 'szechuan', 'indian', 'jalapeño'],
  charcuterie: ['charcuterie', 'cured', 'ham', 'salami', 'prosciutto', 'pâté', 'terrine', 'sausage'],
  truffle: ['truffle', 'mushroom', 'porcini', 'fungi'],
}

function scoreWine(wine, query) {
  if (!wine.food_pairings?.length) return 0
  const q = query.toLowerCase()
  let score = 0

  // Direct text match in pairings
  wine.food_pairings.forEach(p => {
    const pl = p.toLowerCase()
    if (pl.includes(q)) score += 5
    const words = q.split(/\s+/)
    words.forEach(w => { if (w.length > 3 && pl.includes(w)) score += 2 })
  })

  // Keyword category matching
  Object.entries(PAIRING_KEYWORDS).forEach(([category, keywords]) => {
    const queryMatchesCategory = keywords.some(kw => q.includes(kw))
    if (queryMatchesCategory) {
      const wineHasCategory = wine.food_pairings.some(p =>
        keywords.some(kw => p.toLowerCase().includes(kw))
      )
      if (wineHasCategory) score += 3
    }
  })

  // Bonus: tasting notes / grape matching
  if (wine.tasting_notes?.toLowerCase().includes(q)) score += 1

  return score
}

function getPairingReason(wine, query) {
  const q = query.toLowerCase()
  const matching = wine.food_pairings.filter(p => {
    const pl = p.toLowerCase()
    return pl.includes(q) || q.split(/\s+/).some(w => w.length > 3 && pl.includes(w))
  })

  const category = Object.entries(PAIRING_KEYWORDS).find(([, kws]) =>
    kws.some(kw => q.includes(kw)) && wine.food_pairings.some(p => kws.some(kw => p.toLowerCase().includes(kw)))
  )

  const reasons = []
  if (matching.length > 0) reasons.push(`directly listed as pairing for: ${matching.slice(0, 2).join(', ')}`)
  if (wine.body) reasons.push(`${wine.body}-bodied ${wine.type}`)
  if (wine.grape) reasons.push(`${wine.grape.split('/')[0].trim()}`)

  return reasons.length > 0 ? reasons.join(' · ') : `${wine.type} from ${wine.region}`
}

export default function PairingSuggester({ wines }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return []
    return wines
      .map(w => ({ wine: w, score: scoreWine(w, query) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [wines, query])

  return (
    <div className="pairing-section">
      <div className="pairing-intro">
        <strong>Dish-to-wine pairing suggester.</strong> Type any dish or ingredient and get instant wine suggestions from our list. Works best with specific dishes (e.g. "Dover sole", "ribeye steak", "goat cheese").
      </div>

      <div className="pairing-input-wrap">
        <input
          className="pairing-input"
          type="text"
          placeholder="Type a dish, e.g. 'Dover sole', 'ribeye', 'oysters'…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button className="btn btn-secondary" onClick={() => setQuery('')}>Clear</button>
        )}
      </div>

      {query.trim().length >= 2 && results.length === 0 && (
        <div className="no-results">
          No strong matches found. Try broader terms like "seafood", "beef", "chicken", or "pasta".
        </div>
      )}

      <div className="pairing-results">
        {results.map(({ wine, score }, i) => (
          <div key={wine.id} className="pairing-result-card">
            <div className={`pairing-rank${i === 0 ? ' rank-1' : ''}`}>{i + 1}</div>
            <div className="pairing-result-info">
              <div className="pairing-result-name">{wine.name}</div>
              <div className="pairing-result-sub">
                {wine.producer} · {wine.region}
                {' · '}
                <span className={`tag ${wine.type}`} style={{ fontSize: 10, padding: '1px 7px' }}>
                  {wine.type}
                </span>
              </div>
              <div className="pairing-result-reason">{getPairingReason(wine, query)}</div>
              {wine.upsell_tip && (
                <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gold)' }}>
                  ↑ {wine.upsell_tip.split('.')[0]}.
                </div>
              )}
            </div>
            <div className="pairing-result-price">£{wine.bottle_price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
