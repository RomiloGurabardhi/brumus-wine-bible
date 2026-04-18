import { useState } from 'react'

function printTastingNote(wine) {
  const w = window.open('', '_blank', 'width=780,height=900')
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${wine.name} – Tasting Notes</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  body { font-family: 'DM Sans', sans-serif; max-width: 680px; margin: 40px auto; padding: 0 40px; color: #1a1208; font-size: 14px; line-height: 1.6; }
  .ph { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1a1208; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; }
  .logo span { font-style: italic; font-weight: 400; color: #c4963a; }
  .date { font-size: 12px; color: #6b5e4e; }
  h1 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; margin-bottom: 4px; }
  .sub { font-size: 14px; color: #6b5e4e; margin-bottom: 20px; }
  .price { font-size: 18px; font-weight: 500; color: #8b3a1c; margin-bottom: 24px; }
  .row { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e8e0d4; font-size: 13px; }
  .lbl { font-weight: 600; min-width: 100px; flex-shrink: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b5e4e; padding-top: 1px; }
  .upsell { background: #fff8e8; border-left: 3px solid #c4963a; padding: 10px 14px; margin-top: 16px; font-size: 12.5px; border-radius: 0 8px 8px 0; }
  .upsell strong { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: #c4963a; margin-bottom: 3px; }
  .footer { margin-top: 32px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #e8e0d4; padding-top: 14px; }
  @media print { button { display: none; } }
</style>
</head>
<body>
<div class="ph">
  <div class="logo">Brumus <span>Wine Bible</span></div>
  <div class="date">Staff guide · ${date}</div>
</div>
<h1>${wine.name}</h1>
<div class="sub">${wine.producer}${wine.vintage ? ` · ${wine.vintage}` : ''} · ${wine.region}${wine.country ? ', ' + wine.country : ''}</div>
<div class="price">£${wine.bottle_price}${wine.glass_price ? ` · £${wine.glass_price}/glass` : ''}</div>
<div class="row"><div class="lbl">Grape</div><div>${wine.grape || '—'}</div></div>
<div class="row"><div class="lbl">Type</div><div>${wine.type ? wine.type.charAt(0).toUpperCase() + wine.type.slice(1) : '—'} · ${wine.body ? wine.body.charAt(0).toUpperCase() + wine.body.slice(1) : '—'} body</div></div>
<div class="row"><div class="lbl">Taste</div><div>${wine.tasting_notes || '—'}</div></div>
<div class="row"><div class="lbl">Pair with</div><div>${wine.food_pairings?.join(', ') || '—'}</div></div>
${wine.upsell_tip ? `<div class="upsell"><strong>↑ Upsell</strong>${wine.upsell_tip}</div>` : ''}
${wine.fix_tip ? `<div class="upsell" style="background:#e8f5ff;border-color:#3a7aaa"><strong style="color:#3a7aaa">ℹ Note</strong>${wine.fix_tip}</div>` : ''}
<div class="footer">Brumus Bar & Restaurant · Haymarket Hotel · Firmdale Hotels</div>
<script>setTimeout(() => { window.print(); }, 400 );<\/script>
</body></html>`)
  w.document.close()
}

export default function WineCard({ wine }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`wine-card${expanded ? ' expanded' : ''}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="card-header">
        <div className="card-title-wrap">
          <div className="wine-name">{wine.name}</div>
          <div className="wine-sub">
            {wine.producer}{wine.vintage ? ` · ${wine.vintage}` : ''}
          </div>
        </div>
        <div className="price-tag">
          <span className="price-bottle">£{wine.bottle_price}</span>
          {wine.glass_price && (
            <span className="price-glass">
              £{wine.glass_price}/gl{wine.coravin ? ' (Coravin)' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="wine-type-bar">
        <span className={`tag ${wine.type}`}>
          {wine.type?.charAt(0).toUpperCase() + wine.type?.slice(1)}
        </span>
        {wine.grape && (
          <span className="tag" style={{ background: 'var(--input-bg)', color: 'var(--muted)' }}>
            {wine.grape.split('/')[0].trim()}
          </span>
        )}
        <span className={`tag body-${wine.body}`}>
          {wine.body?.charAt(0).toUpperCase() + wine.body?.slice(1)}
        </span>
        {wine.by_the_glass && !wine.coravin && <span className="tag btg-tag">By glass</span>}
        {wine.coravin && <span className="tag coravin-tag">Coravin</span>}
        {wine.featured && <span className="tag" style={{ background: 'var(--gold)', color: '#1a1000' }}>⭐ Featured</span>}
        <span className="expand-hint">{expanded ? '▲ less' : '▼ more'}</span>
      </div>

      {expanded && (
        <div className="card-body" onClick={e => e.stopPropagation()}>
          {wine.tasting_notes && (
            <div className="detail-row">
              <span className="detail-label">Taste</span>
              <span className="detail-value">{wine.tasting_notes}</span>
            </div>
          )}
          {wine.food_pairings?.length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Pair with</span>
              <span className="detail-value">{wine.food_pairings.join(', ')}</span>
            </div>
          )}
          {wine.grape && (
            <div className="detail-row">
              <span className="detail-label">Grape</span>
              <span className="detail-value">{wine.grape}</span>
            </div>
          )}
          {wine.region && (
            <div className="detail-row">
              <span className="detail-label">Region</span>
              <span className="detail-value">{wine.region}{wine.country ? `, ${wine.country}` : ''}</span>
            </div>
          )}
          {wine.carafe_price && (
            <div className="detail-row">
              <span className="detail-label">Prices</span>
              <span className="detail-value">
                Glass £{wine.glass_price} · Carafe £{wine.carafe_price} · Bottle £{wine.bottle_price}
              </span>
            </div>
          )}
          {wine.upsell_tip && (
            <div className="upsell-box">
              <strong>↑ Upsell</strong>
              {wine.upsell_tip}
            </div>
          )}
          {wine.fix_tip && (
            <div className="fix-box">
              <strong>ℹ Note</strong>
              {wine.fix_tip}
            </div>
          )}
          <div className="card-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => printTastingNote(wine)}>
              🖨️ Print Tasting Notes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
