export default function WineOfWeekBanner({ wine }) {
  if (!wine) return null

  return (
    <div className="wow-banner">
      <div>
        <div className="wow-label">⭐ Wine of the Week</div>
        <div className="wow-name">{wine.name}</div>
        <div className="wow-sub">
          {wine.producer}{wine.vintage ? ` · ${wine.vintage}` : ''} · {wine.region}
        </div>
        {wine.tasting_notes && (
          <div className="wow-desc">{wine.tasting_notes.split('.')[0] + '.'}</div>
        )}
        {wine.food_pairings?.length > 0 && (
          <div className="wow-pairings">
            🍽️ Pairs with: {wine.food_pairings.slice(0, 4).join(', ')}
          </div>
        )}
        {wine.upsell_tip && (
          <div className="wow-upsell">↑ {wine.upsell_tip}</div>
        )}
      </div>
      <div>
        <div className="wow-price">
          £{wine.bottle_price}
          {wine.glass_price && <small>£{wine.glass_price} / glass</small>}
        </div>
        <div style={{ marginTop: 12 }}>
          <span className={`tag ${wine.type}`} style={{ fontSize: 12 }}>
            {wine.type?.charAt(0).toUpperCase() + wine.type?.slice(1)}
          </span>
        </div>
        <div style={{ marginTop: 6 }}>
          <span className={`tag body-${wine.body}`} style={{ fontSize: 12 }}>
            {wine.body?.charAt(0).toUpperCase() + wine.body?.slice(1)} body
          </span>
        </div>
      </div>
    </div>
  )
}
