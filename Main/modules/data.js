import { state } from '../state.js';

export async function loadBuildings() {
  try {
    const BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://cls-production-6400.up.railway.app';

    const [bRes, fRes, aRes] = await Promise.all([
      fetch(`${BASE_URL}/buildings`),
      fetch(`${BASE_URL}/facilities`),
      fetch(`${BASE_URL}/assistance`),
    ]);

    // SAFE PARSE (kahit success/data or raw array)
    const bRaw = await bRes.json();
    const fRaw = await fRes.json();
    const aRaw = await aRes.json();

    const buildingsData = Array.isArray(bRaw) ? bRaw : (bRaw.data || []);
    const facilitiesData = Array.isArray(fRaw) ? fRaw : (fRaw.data || []);
    const assistanceData = Array.isArray(aRaw) ? aRaw : (aRaw.data || []);

    // BUILDINGS
    state.BUILDINGS = buildingsData.map(b => ({
      id: String(b.id),
      name: b.name || '',
      svgId: (b.name || '').trim().toUpperCase(),
      desc: b.description || '',
      recommended: Number(b.is_featured) === 1,
      facilities: facilitiesData
        .filter(f => String(f.building_id) === String(b.id))
        .map(f => ({
          name: f.name || '',
          type: f.type || '',
          floor: f.floor || '',
          description: f.description || '',
          desc: `${f.type || ''}${f.floor ? ' · ' + f.floor : ''}${f.description ? ' — ' + f.description : ''}`,
          icon: facilityIcon(f.type)
        }))
    }));

    // ASSISTANCE (QA)
    state.QA_DATA = {};
    assistanceData.forEach(qa => {
      const key = String(qa.building_id);
      if (!state.QA_DATA[key]) state.QA_DATA[key] = [];
      state.QA_DATA[key].push({
        question: qa.question || '',
        answer: qa.answer || ''
      });
    });

  } catch (err) {
    console.error('loadBuildings error:', err);
    state.BUILDINGS = [];
    state.QA_DATA = {};
  }
}

export function facilityIcon(type) {
  if (!type) return 'bi-grid';

  const t = type.toLowerCase();

  if (t.includes('lab')) return 'bi-flask';
  if (t.includes('office')) return 'bi-briefcase';
  if (t.includes('classroom') || t.includes('room')) return 'bi-easel';
  if (t.includes('library')) return 'bi-book';
  if (t.includes('gym') || t.includes('sport')) return 'bi-trophy';
  if (t.includes('clinic') || t.includes('health')) return 'bi-heart-pulse';
  if (t.includes('canteen') || t.includes('caf')) return 'bi-cup-hot';
  if (t.includes('chapel') || t.includes('church')) return 'bi-buildings';
  if (t.includes('computer')) return 'bi-pc-display';
  if (t.includes('toilet') || t.includes('cr')) return 'bi-door-open';

  return 'bi-grid';
}