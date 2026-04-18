import { useState, useCallback, lazy, Suspense } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps'
import { WINE_COUNTRIES, WINE_PRODUCING_ISOS, COUNTRY_ISO_MAP } from '../../lib/wineRegionsData'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function CountryPanel({ countryData, wines, onClose }) {
  const countryWines = wines.filter(
    w => w.country === countryData.name
  )

  return (
    <div className={`map-side-panel open`}>
      <div className="map-panel-header">
        <span className="map-panel-flag">{countryData.flag}</span>
        <span className="map-panel-title">{countryData.name}</span>
        <button className="btn-icon" onClick={onClose} title="Close">✕</button>
      </div>
      <div className="map-panel-body">
        <div className="map-info-section">
          <div className="map-info-label">Climate</div>
          <div className="map-info-value">{countryData.climate}</div>
        </div>
        <div className="map-info-section">
          <div className="map-info-label">Key Grapes</div>
          <div className="map-info-value">{countryData.keyGrapes.join(', ')}</div>
        </div>
        <div className="map-info-section">
          <div className="map-info-label">Styles Produced</div>
          <div className="map-info-value">
            {countryData.styles.map((s, i) => <div key={i} style={{ marginBottom: 3 }}>• {s}</div>)}
          </div>
        </div>
        <div className="map-info-section">
          <div className="map-info-label">Famous Appellations</div>
          <div className="map-info-value">{countryData.appellations.join(', ')}</div>
        </div>
        <div className="map-fact-box">{countryData.funFact}</div>

        {countryData.subRegions?.length > 0 && (
          <div className="map-info-section">
            <div className="map-info-label">Sub-regions on our list</div>
            {countryData.subRegions.map(r => (
              <div key={r.name} style={{ marginBottom: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.name}</div>
                <div style={{ color: 'var(--muted)' }}>{r.grapes}</div>
                <div style={{ color: 'var(--gold)', fontSize: 11, marginTop: 2 }}>{r.appellations}</div>
              </div>
            ))}
          </div>
        )}

        {countryWines.length > 0 && (
          <div className="map-info-section">
            <div className="map-info-label" style={{ marginBottom: 8 }}>
              Our wines from {countryData.name} ({countryWines.length})
            </div>
            <div className="map-wines-list">
              {countryWines.map(w => (
                <div key={w.id} className="map-wine-pill">
                  <div>
                    <div className="map-wine-pill-name">{w.name}</div>
                    <div className="map-wine-pill-sub">{w.region} · {w.type}</div>
                  </div>
                  <div style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 13 }}>£{w.bottle_price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WorldMap({ wines }) {
  const [position, setPosition] = useState({ coordinates: [10, 20], zoom: 1 })
  const [selectedIso, setSelectedIso] = useState(null)

  const handleGeoClick = useCallback((geo) => {
    const iso = String(geo.id)
    if (!WINE_PRODUCING_ISOS.has(iso)) return
    const countryData = WINE_COUNTRIES[iso]
    if (!countryData) return

    setSelectedIso(iso)
    if (countryData.zoomCenter) {
      setPosition({ coordinates: countryData.zoomCenter, zoom: countryData.zoomScale || 3 })
    }
  }, [])

  const handleMoveEnd = useCallback((pos) => {
    setPosition(pos)
  }, [])

  const selectedCountry = selectedIso ? WINE_COUNTRIES[selectedIso] : null

  const wineCountryCounts = {}
  wines.forEach(w => {
    if (w.country) {
      const iso = COUNTRY_ISO_MAP[w.country]
      if (iso) wineCountryCounts[iso] = (wineCountryCounts[iso] || 0) + 1
    }
  })

  return (
    <div className="map-container">
      <div className="map-main">
        <ComposableMap
          projection="geoNaturalEarth1"
          style={{ width: '100%', height: '100%' }}
          projectionConfig={{ scale: 160, center: [0, 10] }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const iso = String(geo.id)
                  const isWineCountry = WINE_PRODUCING_ISOS.has(iso)
                  const hasOurWines = wineCountryCounts[iso] > 0
                  const isSelected = selectedIso === iso
                  const countryData = WINE_COUNTRIES[iso]

                  let fill = '#2a3f5a'
                  if (isWineCountry) fill = countryData?.mapColor || '#d4c8a8'
                  if (isSelected) fill = '#e8c660'

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleGeoClick(geo)}
                      style={{
                        default: {
                          fill,
                          stroke: '#8a9ab0',
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: isWineCountry ? 'pointer' : 'default',
                          transition: 'fill 0.15s',
                        },
                        hover: {
                          fill: isWineCountry ? '#c4963a' : '#334',
                          stroke: '#8a9ab0',
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: isWineCountry ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill: '#e8c660',
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>

            {/* Markers for countries where we stock wines */}
            {Object.entries(wineCountryCounts).map(([iso, count]) => {
              const countryData = WINE_COUNTRIES[iso]
              if (!countryData?.zoomCenter) return null
              const [lon, lat] = countryData.zoomCenter
              return (
                <Marker key={iso} coordinates={[lon, lat]}>
                  <circle
                    r={4}
                    fill="#c4963a"
                    stroke="white"
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedIso(iso)
                      setPosition({ coordinates: countryData.zoomCenter, zoom: countryData.zoomScale || 3 })
                    }}
                  />
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom controls */}
        <div className="map-zoom-btns">
          <button
            className="map-zoom-btn"
            onClick={() => setPosition(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 16) }))}
          >
            +
          </button>
          <button
            className="map-zoom-btn"
            onClick={() => setPosition(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
          >
            −
          </button>
          <button
            className="map-zoom-btn"
            style={{ fontSize: 12 }}
            onClick={() => {
              setPosition({ coordinates: [10, 20], zoom: 1 })
              setSelectedIso(null)
            }}
          >
            ⌂
          </button>
        </div>

        {/* Map legend */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          right: selectedCountry ? 380 : 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          color: 'var(--muted)',
          transition: 'right 0.3s',
        }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#d4c8a8' }} />
              Wine producing
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 50, background: '#c4963a', border: '1.5px solid white' }} />
              On our list
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#e8c660' }} />
              Selected
            </div>
          </div>
        </div>
      </div>

      {selectedCountry && (
        <CountryPanel
          countryData={selectedCountry}
          wines={wines}
          onClose={() => setSelectedIso(null)}
        />
      )}
    </div>
  )
}
