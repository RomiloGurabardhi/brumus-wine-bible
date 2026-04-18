import { useState } from 'react'

const TYPES = ['all', 'white', 'red', 'rosé', 'sparkling', 'orange']
const BODIES = ['all', 'light', 'medium', 'full']
const PAIRINGS = [
  { val: 'all', label: 'All' },
  { val: 'seafood', label: 'Seafood' },
  { val: 'beef', label: 'Beef/Steak' },
  { val: 'lamb', label: 'Lamb' },
  { val: 'poultry', label: 'Poultry' },
  { val: 'pasta', label: 'Pasta' },
  { val: 'cheese', label: 'Cheese' },
  { val: 'veg', label: 'Veg/Salad' },
  { val: 'game', label: 'Game' },
  { val: 'spicy', label: 'Spicy' },
]

const PAIRING_KEYWORDS = {
  seafood: ['seafood', 'oyster', 'fish', 'shellfish', 'scallop', 'salmon', 'prawn', 'lobster', 'tuna', 'sole', 'turbot'],
  beef: ['beef', 'steak', 'ribeye', 'burger', 'bistecca', 'braised', 'casserole', 'bbq'],
  lamb: ['lamb', 'shepherd'],
  poultry: ['chicken', 'duck', 'poultry', 'turkey', 'schnitzel', 'roast'],
  pasta: ['pasta', 'pizza', 'risotto', 'ravioli', 'tagliatelle'],
  cheese: ['cheese', 'parmesan', 'pecorino', 'cheddar', 'goat'],
  veg: ['vegetable', 'salad', 'veg', 'mushroom', 'hummus', 'ratatouille', 'vegetarian', 'crudités', 'minestrone', 'asparagus'],
  game: ['game', 'venison', 'pheasant', 'wild', 'partridge'],
  spicy: ['spicy', 'spice', 'asian', 'thai', 'curry', 'chilli'],
}

export function matchesPairing(wine, pairingFilter) {
  if (pairingFilter === 'all') return true
  const keywords = PAIRING_KEYWORDS[pairingFilter] || [pairingFilter]
  return wine.food_pairings?.some(p =>
    keywords.some(kw => p.toLowerCase().includes(kw))
  )
}

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="filter-bar">
      <div className="filter-row">
        <span className="filter-label">Type</span>
        {TYPES.map(v => (
          <button
            key={v}
            className={`filter-btn${filters.type === v ? ' active-type' : ''}`}
            onClick={() => onChange({ ...filters, type: v })}
          >
            {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
        <span className="filter-sep" />
        <span className="filter-label">Body</span>
        {BODIES.map(v => (
          <button
            key={v}
            className={`filter-btn${filters.body === v ? ' active-body' : ''}`}
            onClick={() => onChange({ ...filters, body: v })}
          >
            {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
        <span className="filter-sep" />
        <button
          className={`filter-btn${filters.btg ? ' active-special' : ''}`}
          onClick={() => onChange({ ...filters, btg: !filters.btg })}
        >
          🥂 By the Glass
        </button>
        <button
          className={`filter-btn${filters.upsell ? ' active-special' : ''}`}
          onClick={() => onChange({ ...filters, upsell: !filters.upsell })}
        >
          ↑ Upsells
        </button>
      </div>
      <div className="filter-row">
        <span className="filter-label">Pairs with</span>
        {PAIRINGS.map(p => (
          <button
            key={p.val}
            className={`filter-btn${filters.pairing === p.val ? ' active-pairing' : ''}`}
            onClick={() => onChange({ ...filters, pairing: p.val })}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
