import { state } from '../state.js';

export async function loadBuildings() {
  try {
    const [bRes, fRes, aRes] = await Promise.all([
      fetch('http://localhost:3000/buildings'),
      fetch('http://localhost:3000/facilities'),
      fetch('http://localhost:3000/assistance'),
    ]);
    const bJson = await bRes.json();
    if (!bJson.success) { state.BUILDINGS = []; state.QA_DATA = {}; return; }
    const fJson = await fRes.json();
    const allFacilities = fJson.success ? fJson.data : [];
    const aJson = await aRes.json();
    const allQA = aJson.success ? aJson.data : [];

    state.BUILDINGS = bJson.data.map(b => ({
      id: String(b.id),
      name: b.name,
      svgId: b.name.trim().toUpperCase(),
      desc: b.description || '',
      recommended: Number(b.is_featured) === 1,
      facilities: allFacilities
        .filter(f => f.building_id == b.id)
        .map(f => ({
          name: f.name,
          type: f.type || '',
          floor: f.floor || '',
          description: f.description || '',
          desc: `${f.type}${f.floor ? ' · ' + f.floor : ''}${f.description ? ' — ' + f.description : ''}`,
          icon: facilityIcon(f.type)
        }))
    }));

    state.QA_DATA = {};
    allQA.forEach(qa => {
      const key = String(qa.building_id);
      if (!state.QA_DATA[key]) state.QA_DATA[key] = [];
      state.QA_DATA[key].push({ question: qa.question, answer: qa.answer });
    });
  } catch (err) {
    console.error('loadBuildings error:', err);
    state.BUILDINGS = []; state.QA_DATA = {};
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
