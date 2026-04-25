import { useState, useEffect, useRef, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as topojson from 'topojson-client'
import { WINE_COUNTRIES, WINE_PRODUCING_ISOS, COUNTRY_ISO_MAP } from '../../lib/wineRegionsData'
import { WINE_REGION_POLYGONS } from '../../lib/wineRegionPolygons'
import { supabase, PROPERTY_ID } from '../../lib/supabase'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
const CARTO_TILES = [
  'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
  'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
  'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
  'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
]
const PRESET_COLORS = [
  '#b84040','#8a2828','#9060a0','#6a9e5a',
  '#d4789a','#c08040','#c49050','#508090',
]

function mapStyle() {
  return {
    version: 8,
    sources: { carto: { type: 'raster', tiles: CARTO_TILES, tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>' } },
    layers: [{ id: 'carto-tiles', type: 'raster', source: 'carto' }],
  }
}

function buildCountriesGeoJSON(wineCountryCounts) {
  return fetch(GEO_URL).then(r => r.json()).then(topology => {
    const geojson = topojson.feature(topology, topology.objects.countries)
    geojson.features = geojson.features.map(f => {
      const iso = String(f.id)
      const countryData = WINE_COUNTRIES[iso]
      return { ...f, properties: {
        iso, isWine: WINE_PRODUCING_ISOS.has(iso),
        hasOurWines: (wineCountryCounts[iso] || 0) > 0,
        mapColor: countryData?.mapColor || null,
      }}
    })
    return geojson
  })
}

// Live preview GeoJSON while drawing
function buildDrawPreview(points) {
  if (!points.length) return { type: 'FeatureCollection', features: [] }
  const features = []
  features.push({ type: 'Feature', properties: { type: 'first' },
    geometry: { type: 'Point', coordinates: points[0] } })
  if (points.length > 1) {
    features.push({ type: 'Feature', properties: { type: 'vertex' },
      geometry: { type: 'MultiPoint', coordinates: points.slice(1) } })
    features.push({ type: 'Feature', properties: { type: 'line' },
      geometry: { type: 'LineString', coordinates: [...points, points[0]] } })
  }
  if (points.length >= 3) {
    features.push({ type: 'Feature', properties: { type: 'fill' },
      geometry: { type: 'Polygon', coordinates: [[...points, points[0]]] } })
  }
  return { type: 'FeatureCollection', features }
}

function ringCentroid(ring) {
  const pts = ring.length > 1 && ring[0][0] === ring[ring.length-1][0] ? ring.slice(0,-1) : ring
  return [pts.reduce((s,c)=>s+c[0],0)/pts.length, pts.reduce((s,c)=>s+c[1],0)/pts.length]
}

function computePolygons(regionScales, regionOffsets, customFeatures = []) {
  return {
    type: 'FeatureCollection',
    features: [...WINE_REGION_POLYGONS.features, ...customFeatures].map(f => {
      const name = f.properties.name
      const scale = regionScales[name] ?? 1
      const [ox, oy] = regionOffsets[name] ?? [0, 0]
      const rings = f.geometry.coordinates.map(ring => {
        const [cx, cy] = ringCentroid(ring)
        return ring.map(([x,y]) => [cx + (x-cx)*scale + ox, cy + (y-cy)*scale + oy])
      })
      return { ...f, geometry: { ...f.geometry, coordinates: rings } }
    }),
  }
}

function getRegionHandles(regionName, regionScales, regionOffsets, customFeatures = []) {
  const feature = [...WINE_REGION_POLYGONS.features, ...customFeatures].find(f => f.properties.name === regionName)
  if (!feature) return null
  const scale = regionScales[regionName] ?? 1
  const [ox, oy] = regionOffsets[regionName] ?? [0, 0]
  const ring = feature.geometry.coordinates[0]
  const [cx, cy] = ringCentroid(ring)
  const placed = ring.map(([x,y]) => [cx + (x-cx)*scale + ox, cy + (y-cy)*scale + oy])
  const xs = placed.map(c=>c[0]), ys = placed.map(c=>c[1])
  return {
    centroid: [cx+ox, cy+oy],
    corners: [
      [Math.min(...xs), Math.max(...ys)],
      [Math.max(...xs), Math.max(...ys)],
      [Math.max(...xs), Math.min(...ys)],
      [Math.min(...xs), Math.min(...ys)],
    ],
  }
}

// ── NamingForm ────────────────────────────────────────────────────────────────

function NamingForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [style, setStyle] = useState('')

  return (
    <div className="map-draw-modal">
      <div className="map-draw-modal-inner">
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, marginBottom: 14 }}>
          Name your region
        </div>
        <input
          className="input"
          placeholder="Region name (e.g. Douro Valley)"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          style={{ marginBottom: 10 }}
        />
        <input
          className="input"
          placeholder="Style description (optional)"
          value={style}
          onChange={e => setStyle(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Colour</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)} style={{
                width: 26, height: 26, borderRadius: 5, background: c, cursor: 'pointer',
                border: color === c ? '3px solid var(--text)' : '2px solid transparent',
                boxSizing: 'border-box',
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => name.trim() && onSave(name.trim(), color, style)}>
            Save region
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CountryPanel ──────────────────────────────────────────────────────────────

function CountryPanel({ countryData, iso, wines, onClose, isAdmin, onSaveInfo }) {
  const countryWines = wines.filter(w => w.country === countryData.name)
  const panelRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  const onMouseDown = (e) => {
    isDragging.current = true
    startX.current = e.clientX
    startWidth.current = panelRef.current.offsetWidth
    e.currentTarget.classList.add('dragging')
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return
      const newWidth = Math.min(600, Math.max(260, startWidth.current + (startX.current - e.clientX)))
      panelRef.current.style.width = newWidth + 'px'
    }
    const onMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.querySelectorAll('.map-panel-resize-handle').forEach(el => el.classList.remove('dragging'))
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp) }
  }, [])

  const startEdit = () => {
    setDraft({
      climate: countryData.climate || '',
      keyGrapes: (countryData.keyGrapes || []).join('\n'),
      styles: (countryData.styles || []).join('\n'),
      appellations: (countryData.appellations || []).join('\n'),
      funFact: countryData.funFact || '',
      subRegions: (countryData.subRegions || []).map(r => ({ ...r })),
    })
  }

  const handleSave = async () => {
    setSaving(true)
    await onSaveInfo(iso, {
      climate: draft.climate,
      keyGrapes: draft.keyGrapes.split('\n').map(s => s.trim()).filter(Boolean),
      styles: draft.styles.split('\n').map(s => s.trim()).filter(Boolean),
      appellations: draft.appellations.split('\n').map(s => s.trim()).filter(Boolean),
      funFact: draft.funFact,
      subRegions: draft.subRegions,
    })
    setSaving(false)
    setDraft(null)
  }

  const updateSub = (i, key, val) =>
    setDraft(d => { const subs = [...d.subRegions]; subs[i] = { ...subs[i], [key]: val }; return { ...d, subRegions: subs } })

  const addSub = () =>
    setDraft(d => ({ ...d, subRegions: [...d.subRegions, { name: '', style: '', grapes: '', appellations: '' }] }))

  const removeSub = (i) =>
    setDraft(d => ({ ...d, subRegions: d.subRegions.filter((_, j) => j !== i) }))

  return (
    <div className="map-side-panel open" ref={panelRef}>
      <div className="map-panel-resize-handle" onMouseDown={onMouseDown} />
      <div className="map-panel-header">
        <span className="map-panel-flag">{countryData.flag}</span>
        <span className="map-panel-title">{countryData.name}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isAdmin && !draft && (
            <button className="btn btn-secondary" style={{ padding: '3px 10px', fontSize: 11 }} onClick={startEdit}>
              Edit
            </button>
          )}
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="map-panel-body">
        {draft ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="map-info-label">Climate</div>
              <textarea className="input" rows={3} value={draft.climate}
                onChange={e => setDraft(d => ({ ...d, climate: e.target.value }))}
                style={{ width: '100%', resize: 'vertical', fontSize: 12, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div className="map-info-label">Key Grapes <span style={{ fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>(one per line)</span></div>
              <textarea className="input" rows={5} value={draft.keyGrapes}
                onChange={e => setDraft(d => ({ ...d, keyGrapes: e.target.value }))}
                style={{ width: '100%', resize: 'vertical', fontSize: 12, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div className="map-info-label">Styles Produced <span style={{ fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>(one per line)</span></div>
              <textarea className="input" rows={5} value={draft.styles}
                onChange={e => setDraft(d => ({ ...d, styles: e.target.value }))}
                style={{ width: '100%', resize: 'vertical', fontSize: 12, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div className="map-info-label">Famous Appellations <span style={{ fontWeight: 400, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>(one per line)</span></div>
              <textarea className="input" rows={5} value={draft.appellations}
                onChange={e => setDraft(d => ({ ...d, appellations: e.target.value }))}
                style={{ width: '100%', resize: 'vertical', fontSize: 12, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div className="map-info-label">Fun Fact</div>
              <textarea className="input" rows={4} value={draft.funFact}
                onChange={e => setDraft(d => ({ ...d, funFact: e.target.value }))}
                style={{ width: '100%', resize: 'vertical', fontSize: 12, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <div className="map-info-label" style={{ marginBottom: 8 }}>Sub-regions</div>
              {draft.subRegions.map((r, i) => (
                <div key={i} style={{ background: '#f8f5f0', borderRadius: 6, padding: '10px', marginBottom: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sub-region {i + 1}</span>
                    <button className="btn-icon" style={{ fontSize: 11, lineHeight: 1 }} onClick={() => removeSub(i)}>✕</button>
                  </div>
                  {[['name', 'Name'], ['style', 'Style / Character'], ['grapes', 'Key Grapes'], ['appellations', 'Appellations']].map(([key, label]) => (
                    <div key={key} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                      <input className="input" value={r[key] || ''} onChange={e => updateSub(i, key, e.target.value)}
                        style={{ width: '100%', fontSize: 12, padding: '5px 8px', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              ))}
              <button className="btn btn-secondary" style={{ fontSize: 12, width: '100%' }} onClick={addSub}>
                + Add sub-region
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 4, paddingBottom: 8 }}>
              <button className="btn btn-secondary" onClick={() => setDraft(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="map-info-section"><div className="map-info-label">Climate</div><div className="map-info-value">{countryData.climate}</div></div>
            <div className="map-info-section"><div className="map-info-label">Key Grapes</div><div className="map-info-value">{countryData.keyGrapes.join(', ')}</div></div>
            <div className="map-info-section">
              <div className="map-info-label">Styles Produced</div>
              <div className="map-info-value">{countryData.styles.map((s,i) => <div key={i} style={{marginBottom:3}}>• {s}</div>)}</div>
            </div>
            <div className="map-info-section"><div className="map-info-label">Famous Appellations</div><div className="map-info-value">{countryData.appellations.join(', ')}</div></div>
            <div className="map-fact-box">{countryData.funFact}</div>
            {countryData.subRegions?.length > 0 && (
              <div className="map-info-section">
                <div className="map-info-label">Sub-regions on our list</div>
                {countryData.subRegions.map(r => (
                  <div key={r.name} style={{marginBottom:10,padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                    <div style={{fontWeight:600,marginBottom:2}}>{r.name}</div>
                    <div style={{color:'var(--muted)'}}>{r.grapes}</div>
                    <div style={{color:'var(--gold)',fontSize:11,marginTop:2}}>{r.appellations}</div>
                  </div>
                ))}
              </div>
            )}
            {countryWines.length > 0 && (
              <div className="map-info-section">
                <div className="map-info-label" style={{marginBottom:8}}>Our wines from {countryData.name} ({countryWines.length})</div>
                <div className="map-wines-list">
                  {countryWines.map(w => (
                    <div key={w.id} className="map-wine-pill">
                      <div><div className="map-wine-pill-name">{w.name}</div><div className="map-wine-pill-sub">{w.region} · {w.type}</div></div>
                      <div style={{color:'var(--accent)',fontWeight:500,fontSize:13}}>£{w.bottle_price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── WorldMap ──────────────────────────────────────────────────────────────────

export default function WorldMap({ wines, isAdmin = false }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const labelMarkersRef = useRef([])
  const handleMarkersRef = useRef([])
  const dragState = useRef(null)

  const [selectedIso, setSelectedIso] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [layersReady, setLayersReady] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regionScales, setRegionScales] = useState({})
  const [regionOffsets, setRegionOffsets] = useState({})
  const [customRegions, setCustomRegions] = useState([])
  const [deletedRegions, setDeletedRegions] = useState(new Set())
  const [countryOverrides, setCountryOverrides] = useState({})
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawPoints, setDrawPoints] = useState([])
  const [showNamingForm, setShowNamingForm] = useState(false)
  const [pendingCoords, setPendingCoords] = useState(null)

  // Refs so stable event handlers can read current state
  const isDrawingRef = useRef(false)
  const drawPointsRef = useRef([])
  const selectedRegionRef = useRef(null)
  const regionOffsetsRef = useRef({})

  useEffect(() => {
    const loadMapRegions = async () => {
      const { data, error } = await supabase
        .from('map_regions').select('*').eq('property_id', PROPERTY_ID)
      if (error) { console.error('map_regions load error:', error); return }
      if (!data) return
      const custom = []
      const deleted = new Set()
      data.forEach(row => {
        if (row.is_deleted_builtin) {
          deleted.add(row.name)
        } else {
          custom.push({
            type: 'Feature',
            properties: { name: row.name, color: row.color, style: row.style || '', labelAt: row.label_at, custom: true, dbId: row.id },
            geometry: { type: 'Polygon', coordinates: [row.coordinates] },
          })
        }
      })
      setCustomRegions(custom)
      setDeletedRegions(deleted)
    }

    const loadCountryInfo = async () => {
      const { data } = await supabase
        .from('country_info').select('*').eq('property_id', PROPERTY_ID)
      if (!data) return
      const overrides = {}
      data.forEach(row => {
        overrides[row.iso] = {
          ...(row.climate != null && { climate: row.climate }),
          ...(row.key_grapes != null && { keyGrapes: row.key_grapes }),
          ...(row.styles != null && { styles: row.styles }),
          ...(row.appellations != null && { appellations: row.appellations }),
          ...(row.fun_fact != null && { funFact: row.fun_fact }),
          ...(row.sub_regions != null && { subRegions: row.sub_regions }),
        }
      })
      setCountryOverrides(overrides)
    }

    Promise.all([loadMapRegions(), loadCountryInfo()])

    const channel = supabase
      .channel('map-regions-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_regions' }, loadMapRegions)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => { isDrawingRef.current = isDrawing }, [isDrawing])
  useEffect(() => { drawPointsRef.current = drawPoints }, [drawPoints])
  useEffect(() => { selectedRegionRef.current = selectedRegion }, [selectedRegion])
  useEffect(() => { regionOffsetsRef.current = regionOffsets }, [regionOffsets])

  const wineCountryCounts = useMemo(() => {
    const counts = {}
    wines.forEach(w => {
      if (w.country) {
        const iso = COUNTRY_ISO_MAP[w.country]
        if (iso) counts[iso] = (counts[iso] || 0) + 1
      }
    })
    return counts
  }, [wines])

  // Init map
  useEffect(() => {
    if (map.current) return
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle(),
      center: [15, 30], zoom: 1.8, minZoom: 1, maxZoom: 12,
      attributionControl: false,
    })
    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')
    map.current.on('load', () => setMapReady(true))
    return () => { if (map.current) { map.current.remove(); map.current = null } }
  }, [])

  // Add layers once map is ready
  useEffect(() => {
    if (!mapReady || !map.current) return

    buildCountriesGeoJSON(wineCountryCounts).then(geojson => {
      if (!map.current) return
      map.current.addSource('countries', { type: 'geojson', data: geojson })
      map.current.addLayer({ id: 'selected-fill', type: 'fill', source: 'countries',
        filter: ['==',['get','iso'],''], paint: { 'fill-color':'#c4963a','fill-opacity':0.22 } })
      map.current.addLayer({ id: 'wine-countries-border', type: 'line', source: 'countries',
        filter: ['==',['get','isWine'],true], paint: { 'line-color':'#9a8060','line-width':1,'line-opacity':0.35 } })
      // Outer glow (wide, soft)
      map.current.addLayer({ id: 'selected-glow', type: 'line', source: 'countries',
        filter: ['==',['get','iso'],''], paint: { 'line-color':'#c4963a','line-width':8,'line-opacity':0.2,'line-blur':4 } })
      // Crisp inner border
      map.current.addLayer({ id: 'selected-border', type: 'line', source: 'countries',
        filter: ['==',['get','iso'],''], paint: { 'line-color':'#c4963a','line-width':2.5,'line-opacity':1 } })

      map.current.on('click', 'wine-countries-fill', e => {
        if (isDrawingRef.current) return
        const iso = e.features?.[0]?.properties?.iso
        if (!iso || !WINE_COUNTRIES[iso]) return
        const countryData = WINE_COUNTRIES[iso]
        setSelectedIso(iso)
        const f = ['==',['get','iso'],iso]
        map.current.setFilter('selected-fill', f)
        map.current.setFilter('selected-glow', f)
        map.current.setFilter('selected-border', f)
        if (countryData.zoomCenter)
          map.current.flyTo({ center: countryData.zoomCenter, zoom: (countryData.zoomScale||3)+1, duration: 900 })
      })
      map.current.on('mouseenter','wine-countries-fill',()=>{ if(!isDrawingRef.current) map.current.getCanvas().style.cursor='pointer' })
      map.current.on('mouseleave','wine-countries-fill',()=>{ if(!isDrawingRef.current) map.current.getCanvas().style.cursor='' })

      // Wine region layers
      map.current.addSource('wine-regions', { type: 'geojson', data: computePolygons({},{}) })
      map.current.addLayer({ id:'wine-regions-fill', type:'fill', source:'wine-regions', minzoom:3.5,
        paint:{ 'fill-color':['get','color'],'fill-opacity':0.45 } })
      map.current.addLayer({ id:'wine-regions-border', type:'line', source:'wine-regions', minzoom:3.5,
        paint:{ 'line-color':['get','color'],'line-width':1,'line-opacity':0.8 } })
      map.current.addLayer({ id:'wine-region-selected', type:'line', source:'wine-regions', minzoom:3.5,
        filter:['==',['get','name'],''], paint:{ 'line-color':'#ffffff','line-width':2.5,'line-opacity':1 } })

      map.current.on('click','wine-regions-fill', e => {
        if (isDrawingRef.current || !isAdmin) return
        const name = e.features?.[0]?.properties?.name
        if (name) setSelectedRegion(prev => prev===name ? null : name)
      })
      map.current.on('mousedown','wine-regions-fill', e => {
        if (isDrawingRef.current) return
        const name = e.features?.[0]?.properties?.name
        if (!name || name !== selectedRegionRef.current) return
        e.preventDefault()
        const startGeo = [e.lngLat.lng, e.lngLat.lat]
        const origOffset = [...(regionOffsetsRef.current[name] ?? [0,0])]
        map.current.dragPan.disable()
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
        const onMove = (ev) => {
          const rect = mapContainer.current.getBoundingClientRect()
          const geo = map.current.unproject([ev.clientX-rect.left, ev.clientY-rect.top])
          setRegionOffsets(prev => ({ ...prev, [name]: [origOffset[0]+geo.lng-startGeo[0], origOffset[1]+geo.lat-startGeo[1]] }))
        }
        const onUp = () => {
          map.current.dragPan.enable()
          document.body.style.cursor=''
          document.body.style.userSelect=''
          document.removeEventListener('mousemove',onMove)
          document.removeEventListener('mouseup',onUp)
        }
        document.addEventListener('mousemove',onMove)
        document.addEventListener('mouseup',onUp)
      })
      map.current.on('mouseenter','wine-regions-fill',()=>{ if(!isDrawingRef.current) map.current.getCanvas().style.cursor = selectedRegionRef.current ? 'grab':'pointer' })
      map.current.on('mouseleave','wine-regions-fill',()=>{ if(!isDrawingRef.current) map.current.getCanvas().style.cursor='' })

      // Deselect region on empty click
      map.current.on('click', e => {
        if (isDrawingRef.current) return
        const f = map.current.queryRenderedFeatures(e.point, { layers:['wine-regions-fill'] })
        if (!f.length) setSelectedRegion(null)
      })

      // Draw preview layers
      map.current.addSource('draw-preview', { type:'geojson', data:{ type:'FeatureCollection', features:[] } })
      map.current.addLayer({ id:'draw-fill', type:'fill', source:'draw-preview',
        filter:['==',['get','type'],'fill'], paint:{ 'fill-color':'#c4963a','fill-opacity':0.25 } })
      map.current.addLayer({ id:'draw-line', type:'line', source:'draw-preview',
        filter:['in',['get','type'],['literal',['line']]], paint:{ 'line-color':'#c4963a','line-width':2,'line-dasharray':[4,2] } })
      map.current.addLayer({ id:'draw-vertices', type:'circle', source:'draw-preview',
        filter:['==',['get','type'],'vertex'], paint:{ 'circle-radius':5,'circle-color':'white','circle-stroke-color':'#c4963a','circle-stroke-width':2 } })
      map.current.addLayer({ id:'draw-first', type:'circle', source:'draw-preview',
        filter:['==',['get','type'],'first'], paint:{ 'circle-radius':7,'circle-color':'#c4963a','circle-stroke-color':'white','circle-stroke-width':2 } })

      // Draw click handler
      map.current.on('click', e => {
        if (!isDrawingRef.current) return
        const point = [e.lngLat.lng, e.lngLat.lat]
        const pts = drawPointsRef.current
        // Click near first point to close (when 3+ points placed)
        if (pts.length >= 3) {
          const firstPx = map.current.project(pts[0])
          const dist = Math.hypot(firstPx.x - e.point.x, firstPx.y - e.point.y)
          if (dist < 16) {
            completeDraw(pts)
            return
          }
        }
        setDrawPoints(prev => [...prev, point])
      })

      setLayersReady(true)
    })

    // Region labels
    labelMarkersRef.current.forEach(m => m.remove())
    labelMarkersRef.current = []
    WINE_REGION_POLYGONS.features.forEach(f => {
      const { name, labelAt } = f.properties
      if (!labelAt) return
      const el = document.createElement('div')
      el.className = 'map-region-label'
      el.textContent = name
      const marker = new maplibregl.Marker({ element: el, anchor:'center' }).setLngLat(labelAt).addTo(map.current)
      labelMarkersRef.current.push(marker)
    })
    const updateLabels = () => {
      const zoom = map.current.getZoom()
      labelMarkersRef.current.forEach(m => { m.getElement().style.display = zoom>=3.5 ? 'block':'none' })
    }
    map.current.on('zoom', updateLabels)
    updateLabels()

    return () => {
      if (map.current) map.current.off('zoom', updateLabels)
      labelMarkersRef.current.forEach(m => m.remove())
      labelMarkersRef.current = []
    }
  }, [mapReady])

  useEffect(() => {
    if (!mapReady || !map.current) return
    map.current.getCanvas().style.cursor = isDrawing ? 'crosshair' : ''
  }, [isDrawing, mapReady])

  // Update draw preview
  useEffect(() => {
    if (!mapReady || !map.current) return
    const source = map.current.getSource('draw-preview')
    if (source) source.setData(buildDrawPreview(drawPoints))
  }, [mapReady, drawPoints])

  // Update region polygons (filter deleted ones)
  useEffect(() => {
    if (!layersReady || !map.current) return
    const source = map.current.getSource('wine-regions')
    if (!source) return
    const data = computePolygons(regionScales, regionOffsets, customRegions)
    data.features = data.features.filter(f => !deletedRegions.has(f.properties.name))
    source.setData(data)
    // Hide labels for deleted regions
    labelMarkersRef.current.forEach(m => {
      const name = m.getElement().textContent
      m.getElement().style.display = deletedRegions.has(name) ? 'none' : (map.current.getZoom() >= 3.5 ? 'block' : 'none')
    })
  }, [layersReady, regionScales, regionOffsets, customRegions, deletedRegions])

  // Update selected region highlight + corner handles
  useEffect(() => {
    if (!mapReady || !map.current) return
    if (map.current.getLayer('wine-region-selected'))
      map.current.setFilter('wine-region-selected', ['==',['get','name'], selectedRegion||''])
    handleMarkersRef.current.forEach(m => m.remove())
    handleMarkersRef.current = []
    if (!selectedRegion) return
    const handles = getRegionHandles(selectedRegion, regionScales, regionOffsets, customRegions)
    if (!handles) return
    handles.corners.forEach(corner => {
      const el = document.createElement('div')
      el.className = 'map-resize-handle'
      el.addEventListener('mousedown', e => {
        e.preventDefault(); e.stopPropagation()
        const { centroid } = handles
        const origScale = regionScales[selectedRegion] ?? 1
        const origDist = Math.hypot(corner[0]-centroid[0], corner[1]-centroid[1])
        dragState.current = { centroid, origDist, origScale, name: selectedRegion }
        map.current.dragPan.disable()
        map.current.scrollZoom.disable()
        document.body.style.cursor = 'nwse-resize'
        document.body.style.userSelect = 'none'
        const onMove = ev => {
          if (!dragState.current) return
          const rect = mapContainer.current.getBoundingClientRect()
          const geo = map.current.unproject([ev.clientX-rect.left, ev.clientY-rect.top])
          const newDist = Math.hypot(geo.lng-centroid[0], geo.lat-centroid[1])
          const newScale = Math.max(0.15, Math.min(6, origScale*(newDist/origDist)))
          setRegionScales(prev => ({ ...prev, [dragState.current.name]: newScale }))
        }
        const onUp = () => {
          dragState.current = null
          map.current.dragPan.enable(); map.current.scrollZoom.enable()
          document.body.style.cursor=''; document.body.style.userSelect=''
          document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp)
        }
        document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp)
      })
      const marker = new maplibregl.Marker({ element: el, anchor:'center' }).setLngLat(corner).addTo(map.current)
      handleMarkersRef.current.push(marker)
    })
  }, [mapReady, selectedRegion, regionScales, regionOffsets, customRegions])

  // Wine count markers
  useEffect(() => {
    if (!mapReady || !map.current) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    Object.entries(wineCountryCounts).forEach(([iso, count]) => {
      const countryData = WINE_COUNTRIES[iso]
      if (!countryData?.zoomCenter) return
      const el = document.createElement('div')
      el.className = 'map-marker'
      el.innerHTML = `<span class="map-marker-count">${count}</span>`
      el.addEventListener('click', () => {
        setSelectedIso(iso)
        if (map.current.getLayer('selected-fill')) {
          const f = ['==',['get','iso'],iso]
          map.current.setFilter('selected-fill', f)
          map.current.setFilter('selected-glow', f)
          map.current.setFilter('selected-border', f)
        }
        map.current.flyTo({ center: countryData.zoomCenter, zoom:(countryData.zoomScale||3)+1, duration:900 })
      })
      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat(countryData.zoomCenter).addTo(map.current))
    })
  }, [mapReady, wineCountryCounts])

  const completeDraw = (pts) => {
    if (pts.length < 3) return
    setPendingCoords([...pts, pts[0]])
    setShowNamingForm(true)
    setDrawPoints([])
    setIsDrawing(false)
  }

  const saveRegion = async (name, color, style) => {
    if (!pendingCoords) return
    const pts = pendingCoords.slice(0, -1)
    const cx = pts.reduce((s,c) => s+c[0], 0) / pts.length
    const cy = pts.reduce((s,c) => s+c[1], 0) / pts.length
    const labelAt = [cx, cy]

    const { data, error } = await supabase.from('map_regions').insert({
      property_id: PROPERTY_ID,
      name, color, style,
      coordinates: pendingCoords,
      label_at: labelAt,
      is_deleted_builtin: false,
    }).select().single()

    if (error) { console.error('Error saving region:', error); return }

    setCustomRegions(prev => [...prev, {
      type: 'Feature',
      properties: { name, color, style, labelAt, custom: true, dbId: data.id },
      geometry: { type: 'Polygon', coordinates: [pendingCoords] },
    }])
    setShowNamingForm(false)
    setPendingCoords(null)
    setSelectedRegion(name)
  }

  const saveCountryInfo = async (iso, payload) => {
    const { error } = await supabase.from('country_info').upsert({
      property_id: PROPERTY_ID,
      iso,
      climate: payload.climate,
      key_grapes: payload.keyGrapes,
      styles: payload.styles,
      appellations: payload.appellations,
      fun_fact: payload.funFact,
      sub_regions: payload.subRegions,
    }, { onConflict: 'property_id,iso' })
    if (error) { console.error('Error saving country info:', error); return }
    setCountryOverrides(prev => ({ ...prev, [iso]: payload }))
  }

  const cancelDraw = () => {
    setIsDrawing(false)
    setDrawPoints([])
  }

  const handleClose = () => {
    setSelectedIso(null); setSelectedRegion(null)
    if (map.current) {
      const clear = ['==',['get','iso'],'']
      if (map.current.getLayer('selected-fill')) map.current.setFilter('selected-fill', clear)
      if (map.current.getLayer('selected-glow')) map.current.setFilter('selected-glow', clear)
      if (map.current.getLayer('selected-border')) map.current.setFilter('selected-border', clear)
    }
    map.current?.flyTo({ center:[15,30], zoom:1.8, duration:800 })
  }

  const selectedCountry = selectedIso
    ? { ...WINE_COUNTRIES[selectedIso], ...(countryOverrides[selectedIso] || {}) }
    : null

  return (
    <div className="map-container">
      <div className="map-main">
        <div ref={mapContainer} style={{ width:'100%', height:'100%' }} />

        {/* Draw mode toggle — admin only */}
        {isAdmin && !isDrawing && !showNamingForm && (
          <button className="map-draw-btn" onClick={() => { setIsDrawing(true); setSelectedRegion(null) }}>
            ✏ Draw region
          </button>
        )}

        {/* Draw mode status bar — admin only */}
        {isAdmin && isDrawing && (
          <div className="map-draw-bar">
            {drawPoints.length === 0 && 'Click to place your first point'}
            {drawPoints.length === 1 && 'Keep clicking to add more points'}
            {drawPoints.length === 2 && 'One more point to close the polygon'}
            {drawPoints.length >= 3 && `${drawPoints.length} points — click the first point (orange dot) or press Done`}
            <button className="btn btn-primary" style={{ marginLeft:10, padding:'3px 12px', fontSize:12 }}
              onClick={() => completeDraw(drawPoints)} disabled={drawPoints.length < 3}>
              Done
            </button>
            <button className="btn btn-secondary" style={{ marginLeft:6, padding:'3px 10px', fontSize:12 }}
              onClick={cancelDraw}>
              Cancel
            </button>
          </div>
        )}

        {/* Selected region toolbar — admin only */}
        {isAdmin && selectedRegion && !isDrawing && (
          <div className="map-region-toolbar">
            <span>{selectedRegion}</span>
            <button onClick={() => setRegionScales(prev => { const n={...prev}; delete n[selectedRegion]; return n })}>Reset size</button>
            <button onClick={() => setRegionOffsets(prev => { const n={...prev}; delete n[selectedRegion]; return n })}>Reset position</button>
            <button
              onClick={async () => {
                const custom = customRegions.find(r => r.properties.name === selectedRegion)
                if (custom) {
                  await supabase.from('map_regions').delete().eq('id', custom.properties.dbId)
                  setCustomRegions(prev => prev.filter(r => r.properties.name !== selectedRegion))
                } else {
                  await supabase.from('map_regions').insert({
                    property_id: PROPERTY_ID,
                    name: selectedRegion,
                    color: '',
                    coordinates: [],
                    is_deleted_builtin: true,
                  })
                  setDeletedRegions(prev => new Set([...prev, selectedRegion]))
                }
                setSelectedRegion(null)
              }}
              style={{ color: 'var(--red)' }}
            >
              Delete
            </button>
            <button onClick={() => setSelectedRegion(null)}>✕</button>
          </div>
        )}

        <div className="map-legend" style={{ right: selectedCountry ? 380 : 16 }}>
          <div className="map-legend-row"><div className="map-legend-swatch" style={{background:'#d4c8a8',opacity:0.75}}/>Wine producing</div>
          <div className="map-legend-row"><div className="map-legend-marker"/>On our list</div>
          <div className="map-legend-row"><div className="map-legend-swatch" style={{background:'#c4963a'}}/>Selected</div>
        </div>
      </div>

      {selectedCountry && (
        <CountryPanel
          countryData={selectedCountry}
          iso={selectedIso}
          wines={wines}
          onClose={handleClose}
          isAdmin={isAdmin}
          onSaveInfo={saveCountryInfo}
        />
      )}
      {showNamingForm && <NamingForm onSave={saveRegion} onCancel={() => { setShowNamingForm(false); setPendingCoords(null) }} />}
    </div>
  )
}
