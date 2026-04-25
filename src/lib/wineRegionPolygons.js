// Approximate wine region polygons for map display.
// Shapes are hand-crafted approximations — close enough to look right, not exact cadastral boundaries.
// Colors by dominant style: red=#b84040, white=#6a9e5a, sparkling=#8060a8, rosé=#d4789a, mixed=#c08040

export const WINE_REGION_POLYGONS = {
  type: 'FeatureCollection',
  features: [

    // ── FRANCE ──────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Champagne', country: 'France', style: 'Sparkling', color: '#8060a8', labelAt: [4.0, 49.05] },
      geometry: { type: 'Polygon', coordinates: [[[3.0,48.65],[3.6,48.55],[4.5,48.55],[5.0,48.75],[5.0,49.1],[4.8,49.5],[3.2,49.45],[2.9,49.05],[3.0,48.65]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Alsace', country: 'France', style: 'White', color: '#6a9e5a', labelAt: [7.35, 48.25] },
      geometry: { type: 'Polygon', coordinates: [[[7.0,49.05],[7.75,48.95],[7.9,48.2],[7.7,47.5],[7.05,47.5],[7.0,48.2],[7.0,49.05]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Loire Valley', country: 'France', style: 'White & Rosé', color: '#78b068', labelAt: [0.5, 47.4] },
      geometry: { type: 'Polygon', coordinates: [[[-2.4,47.15],[-1.4,47.6],[0.0,47.85],[1.5,47.95],[2.8,47.65],[3.2,47.3],[2.9,46.85],[1.4,46.75],[0.0,46.9],[-1.4,46.75],[-2.4,47.15]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Burgundy', country: 'France', style: 'Pinot Noir & Chardonnay', color: '#9060a0', labelAt: [4.7, 47.1] },
      geometry: { type: 'Polygon', coordinates: [[[4.05,47.95],[5.25,48.0],[5.45,47.4],[5.3,46.1],[4.85,45.9],[4.2,46.3],[4.05,47.0],[4.05,47.95]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Beaujolais', country: 'France', style: 'Red (Gamay)', color: '#d08888', labelAt: [4.55, 46.0] },
      geometry: { type: 'Polygon', coordinates: [[[4.15,46.45],[4.9,46.45],[4.95,45.5],[4.2,45.5],[4.15,46.45]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Bordeaux', country: 'France', style: 'Red Blends', color: '#a03050', labelAt: [-0.5, 44.85] },
      geometry: { type: 'Polygon', coordinates: [[[-1.2,45.35],[0.25,45.3],[0.45,44.55],[-0.15,44.1],[-1.0,44.3],[-1.3,44.85],[-1.2,45.35]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Rhône Valley', country: 'France', style: 'Red & White Blends', color: '#c06038', labelAt: [4.85, 44.7] },
      geometry: { type: 'Polygon', coordinates: [[[4.45,45.95],[5.1,45.95],[5.35,45.1],[5.15,43.7],[4.65,43.5],[4.2,44.0],[4.35,45.1],[4.45,45.95]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Provence', country: 'France', style: 'Rosé', color: '#d4789a', labelAt: [6.0, 43.6] },
      geometry: { type: 'Polygon', coordinates: [[[4.75,44.05],[6.2,44.15],[7.6,44.25],[7.85,43.35],[6.1,43.0],[4.85,43.15],[4.75,44.05]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Languedoc', country: 'France', style: 'Red & Rosé', color: '#c07048', labelAt: [3.1, 43.5] },
      geometry: { type: 'Polygon', coordinates: [[[1.9,44.05],[4.5,44.15],[4.7,43.35],[3.1,42.45],[1.9,43.1],[1.9,44.05]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'South-West', country: 'France', style: 'Red', color: '#b05048', labelAt: [0.5, 43.9] },
      geometry: { type: 'Polygon', coordinates: [[[-1.0,44.3],[0.2,44.5],[2.0,44.1],[2.0,43.15],[0.5,43.0],[-1.5,43.3],[-1.2,44.0],[-1.0,44.3]]] },
    },

    // ── ITALY ────────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Piedmont', country: 'Italy', style: 'Nebbiolo & Barbera', color: '#a04040', labelAt: [7.9, 44.65] },
      geometry: { type: 'Polygon', coordinates: [[[6.65,44.95],[8.85,45.2],[9.05,44.1],[7.5,43.8],[6.7,44.15],[6.65,44.95]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Tuscany', country: 'Italy', style: 'Sangiovese', color: '#b05040', labelAt: [11.2, 43.4] },
      geometry: { type: 'Polygon', coordinates: [[[9.75,44.5],[12.4,44.55],[12.55,42.4],[11.2,41.95],[9.8,42.7],[9.75,44.5]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Veneto', country: 'Italy', style: 'Corvina & Pinot Grigio', color: '#c09050', labelAt: [11.5, 45.45] },
      geometry: { type: 'Polygon', coordinates: [[[10.35,46.05],[12.65,45.95],[12.8,45.05],[11.0,44.95],[10.35,45.4],[10.35,46.05]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Marche', country: 'Italy', style: 'Verdicchio', color: '#8aaa70', labelAt: [13.3, 43.5] },
      geometry: { type: 'Polygon', coordinates: [[[12.5,43.95],[13.65,44.05],[13.75,43.05],[12.55,43.0],[12.5,43.95]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Sicily', country: 'Italy', style: 'Nero d\'Avola & Grillo', color: '#c07040', labelAt: [14.2, 37.6] },
      geometry: { type: 'Polygon', coordinates: [[[12.3,38.35],[15.7,38.35],[15.7,36.9],[12.3,36.9],[12.3,38.35]]] },
    },

    // ── SPAIN ────────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Rioja', country: 'Spain', style: 'Tempranillo', color: '#a83848', labelAt: [-2.6, 42.5] },
      geometry: { type: 'Polygon', coordinates: [[[-3.55,42.95],[-1.65,42.9],[-1.65,42.1],[-3.55,42.15],[-3.55,42.95]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Rías Baixas', country: 'Spain', style: 'Albariño', color: '#70aa70', labelAt: [-8.45, 42.4] },
      geometry: { type: 'Polygon', coordinates: [[[-9.25,43.05],[-7.35,43.2],[-7.35,41.95],[-9.2,41.8],[-9.25,43.05]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Ribera del Duero', country: 'Spain', style: 'Tempranillo', color: '#983040', labelAt: [-3.75, 41.6] },
      geometry: { type: 'Polygon', coordinates: [[[-4.65,41.95],[-2.75,41.95],[-2.75,41.25],[-4.65,41.25],[-4.65,41.95]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Rueda', country: 'Spain', style: 'Verdejo', color: '#80b878', labelAt: [-4.9, 41.35] },
      geometry: { type: 'Polygon', coordinates: [[[-5.4,41.55],[-4.3,41.55],[-4.3,41.1],[-5.4,41.1],[-5.4,41.55]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Priorat', country: 'Spain', style: 'Garnacha & Cariñena', color: '#904040', labelAt: [0.75, 41.2] },
      geometry: { type: 'Polygon', coordinates: [[[0.4,41.4],[1.2,41.4],[1.2,41.0],[0.4,41.0],[0.4,41.4]]] },
    },

    // ── PORTUGAL ─────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Vinho Verde', country: 'Portugal', style: 'Alvarinho', color: '#80b870', labelAt: [-8.15, 41.7] },
      geometry: { type: 'Polygon', coordinates: [[[-8.75,42.15],[-7.3,42.15],[-7.3,41.25],[-8.75,41.25],[-8.75,42.15]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Douro Valley', country: 'Portugal', style: 'Touriga Nacional & Port', color: '#904060', labelAt: [-7.3, 41.1] },
      geometry: { type: 'Polygon', coordinates: [[[-8.15,41.3],[-6.55,41.35],[-6.55,40.75],[-8.15,40.75],[-8.15,41.3]]] },
    },

    // ── GERMANY ──────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Mosel', country: 'Germany', style: 'Riesling', color: '#8ab880', labelAt: [7.0, 50.0] },
      geometry: { type: 'Polygon', coordinates: [[[6.45,50.35],[7.4,50.35],[7.4,49.55],[6.45,49.55],[6.45,50.35]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Rheingau', country: 'Germany', style: 'Riesling', color: '#90c088', labelAt: [8.1, 50.05] },
      geometry: { type: 'Polygon', coordinates: [[[7.75,50.25],[8.55,50.25],[8.55,49.9],[7.75,49.9],[7.75,50.25]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Pfalz', country: 'Germany', style: 'Riesling & Spätburgunder', color: '#98c090', labelAt: [8.1, 49.35] },
      geometry: { type: 'Polygon', coordinates: [[[7.7,49.6],[8.55,49.6],[8.55,49.05],[7.7,49.05],[7.7,49.6]]] },
    },

    // ── AUSTRIA ──────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Wachau', country: 'Austria', style: 'Grüner Veltliner & Riesling', color: '#88b878', labelAt: [15.4, 48.35] },
      geometry: { type: 'Polygon', coordinates: [[[15.05,48.55],[15.75,48.55],[15.75,48.15],[15.05,48.15],[15.05,48.55]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Burgenland', country: 'Austria', style: 'Blaufränkisch', color: '#a06060', labelAt: [16.7, 47.55] },
      geometry: { type: 'Polygon', coordinates: [[[16.35,47.85],[17.05,47.85],[17.05,47.2],[16.35,47.2],[16.35,47.85]]] },
    },

    // ── GREECE ───────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Santorini', country: 'Greece', style: 'Assyrtiko', color: '#80a888', labelAt: [25.4, 36.4] },
      geometry: { type: 'Polygon', coordinates: [[[25.15,36.65],[25.65,36.65],[25.65,36.2],[25.15,36.2],[25.15,36.65]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Naoussa', country: 'Greece', style: 'Xinomavro', color: '#a05050', labelAt: [22.1, 40.6] },
      geometry: { type: 'Polygon', coordinates: [[[21.75,40.85],[22.45,40.85],[22.45,40.35],[21.75,40.35],[21.75,40.85]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Nemea', country: 'Greece', style: 'Agiorgitiko', color: '#a85060', labelAt: [22.65, 37.8] },
      geometry: { type: 'Polygon', coordinates: [[[22.3,38.05],[23.05,38.05],[23.05,37.55],[22.3,37.55],[22.3,38.05]]] },
    },

    // ── USA ──────────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Napa Valley', country: 'USA', style: 'Cabernet Sauvignon', color: '#a84040', labelAt: [-122.3, 38.5] },
      geometry: { type: 'Polygon', coordinates: [[[-122.7,38.75],[-122.15,38.85],[-122.0,38.2],[-122.55,38.15],[-122.7,38.75]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Sonoma', country: 'USA', style: 'Pinot Noir & Chardonnay', color: '#b06040', labelAt: [-122.85, 38.35] },
      geometry: { type: 'Polygon', coordinates: [[[-123.2,38.7],[-122.7,38.75],[-122.55,38.15],[-122.9,37.95],[-123.3,38.2],[-123.2,38.7]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Willamette Valley', country: 'USA', style: 'Pinot Noir', color: '#904848', labelAt: [-123.1, 45.2] },
      geometry: { type: 'Polygon', coordinates: [[[-123.6,45.65],[-122.5,45.65],[-122.5,44.55],[-123.6,44.55],[-123.6,45.65]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Santa Barbara', country: 'USA', style: 'Pinot Noir & Chardonnay', color: '#a06050', labelAt: [-120.1, 34.75] },
      geometry: { type: 'Polygon', coordinates: [[[-120.6,35.05],[-119.5,35.05],[-119.5,34.45],[-120.6,34.45],[-120.6,35.05]]] },
    },

    // ── AUSTRALIA ────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Barossa Valley', country: 'Australia', style: 'Shiraz', color: '#b84040', labelAt: [138.95, -34.5] },
      geometry: { type: 'Polygon', coordinates: [[[138.55,-34.2],[139.35,-34.2],[139.35,-34.8],[138.55,-34.8],[138.55,-34.2]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Margaret River', country: 'Australia', style: 'Cabernet & Chardonnay', color: '#a05038', labelAt: [115.05, -33.9] },
      geometry: { type: 'Polygon', coordinates: [[[114.7,-33.5],[115.4,-33.5],[115.4,-34.35],[114.7,-34.35],[114.7,-33.5]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Yarra Valley', country: 'Australia', style: 'Pinot Noir & Chardonnay', color: '#906050', labelAt: [145.5, -37.7] },
      geometry: { type: 'Polygon', coordinates: [[[145.0,-37.45],[146.1,-37.45],[146.1,-37.95],[145.0,-37.95],[145.0,-37.45]]] },
    },

    // ── NEW ZEALAND ──────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Marlborough', country: 'New Zealand', style: 'Sauvignon Blanc', color: '#70a868', labelAt: [173.85, -41.5] },
      geometry: { type: 'Polygon', coordinates: [[[173.2,-41.1],[174.35,-41.1],[174.35,-41.95],[173.2,-41.95],[173.2,-41.1]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Central Otago', country: 'New Zealand', style: 'Pinot Noir', color: '#984848', labelAt: [169.25, -45.1] },
      geometry: { type: 'Polygon', coordinates: [[[168.6,-44.6],[169.9,-44.6],[169.9,-45.6],[168.6,-45.6],[168.6,-44.6]]] },
    },

    // ── ARGENTINA ────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Mendoza', country: 'Argentina', style: 'Malbec', color: '#b04848', labelAt: [-68.8, -33.1] },
      geometry: { type: 'Polygon', coordinates: [[[-69.35,-32.5],[-68.2,-32.5],[-68.2,-34.0],[-69.35,-34.0],[-69.35,-32.5]]] },
    },

    // ── SOUTH AFRICA ─────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Stellenbosch', country: 'South Africa', style: 'Cabernet & Chenin Blanc', color: '#a84840', labelAt: [18.85, -33.95] },
      geometry: { type: 'Polygon', coordinates: [[[18.55,-33.7],[19.2,-33.7],[19.2,-34.25],[18.55,-34.25],[18.55,-33.7]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Swartland', country: 'South Africa', style: 'Old-vine Chenin Blanc', color: '#c09060', labelAt: [18.65, -33.3] },
      geometry: { type: 'Polygon', coordinates: [[[18.3,-33.0],[19.1,-33.0],[19.1,-33.65],[18.3,-33.65],[18.3,-33.0]]] },
    },

    // ── CHILE ────────────────────────────────────────────────────────────────

    {
      type: 'Feature',
      properties: { name: 'Maipo Valley', country: 'Chile', style: 'Cabernet Sauvignon', color: '#a84040', labelAt: [-70.85, -33.7] },
      geometry: { type: 'Polygon', coordinates: [[[-71.4,-33.4],[-70.2,-33.4],[-70.2,-34.1],[-71.4,-34.1],[-71.4,-33.4]]] },
    },
    {
      type: 'Feature',
      properties: { name: 'Casablanca Valley', country: 'Chile', style: 'Sauvignon Blanc & Pinot Noir', color: '#78aa78', labelAt: [-71.35, -33.3] },
      geometry: { type: 'Polygon', coordinates: [[[-71.7,-33.05],[-70.9,-33.05],[-70.9,-33.5],[-71.7,-33.5],[-71.7,-33.05]]] },
    },
  ],
}
