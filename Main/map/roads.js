/**
 * ════════════════════════════════════════════════════════════
 * CAMPUS ROUTES TABLE
 * ════════════════════════════════════════════════════════════
 * HOW TO ADD A ROUTE:
 *   Key format:  "SVG_ID_A|SVG_ID_B"  (both UPPERCASED, pipe-separated)
 *   The key works BOTH directions automatically (A→B and B→A).
 *
 * HOW TO GET COORDINATES:
 *   1. Open map.svg in a browser with DevTools open
 *   2. In console run:
 *        document.querySelector('svg').addEventListener('click', e => {
 *          const pt = svg.createSVGPoint();
 *          pt.x = e.clientX; pt.y = e.clientY;
 *          const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
 *          console.log(`{ x: ${Math.round(svgPt.x)}, y: ${Math.round(svgPt.y)} },`);
 *        });
 *   3. Click along the road — copy the logged coordinates here.
 *
 * COLORS:
 *   Blue  (#3b82f6) = predefined road route  ← you want this
 *   Gold  (#F6AC02) = fallback straight line  ← means route not yet defined
 *
 * ── HOW TO READ THE KEY ──────────────────────────────────────
 * "ADMIN BUILDING|LIBRARY BUILDING"
 *   = Route from Admin Building  →  Library Building
 *   (also works Library Building → Admin Building — reversed automatically)
 *
 * ── NOTE ON COORDINATES ──────────────────────────────────────
 * The X,Y values below are APPROXIMATE based on the campus map image.
 * You MUST calibrate them against your actual SVG viewBox using the
 * console tool above. Adjust each point to sit on the visible road.
 * ════════════════════════════════════════════════════════════
 */
/**
 * ════════════════════════════════════════════════════════════
 * CAMPUS ROAD GRAPH — Dijkstra-based routing
 * ════════════════════════════════════════════════════════════
 *
 * All coordinates in SVG viewBox units (0 0 1440 1024).
 * Building centers computed from actual SVG path data.
 *
 * Road network structure (based on campus map image):
 *
 *  S01-S13  South Main Road     y≈668–694  (Main Gate → Gate 8)
 *  N01-N09  North Road          y≈290–460  (Gate 3 → Gate 5)
 *  W01      West Vertical mid   x≈303      (N02 ↔ S03)
 *  G01      Gate3→Admin conn.              (N01 ↔ S03)
 *  M01-M02  Mid Vertical        x≈640      (N05 ↔ S09)
 *  A01-A02  Aud. Vertical       x≈762      (N07 ↔ S12)
 *  X01      Gate8→Gate7 conn.              (S13 ↔ L06)
 *  L01-L06  East Left Vertical  x≈958      (Gate 6 → Gate 7)
 *  T01-T02  East Top Horizontal y≈285–290  (L01 → R01)
 *  C01-C04  East Center Vert.   x≈1085     (horizontal connectors)
 *  R01-R06  East Right Vertical x≈1176     (top → bottom)
 * ════════════════════════════════════════════════════════════
 */

// ── Road junction nodes ───────────────────────────────────────
export const ROAD_NODES = {
  // ── SOUTH MAIN ROAD (Main Gate → Gate 8)
  S01:{x:110,y:700},
  S02:{x:200,y:700},
  S03:{x:300,y:700},
  S04:{x:400,y:700},
  S05:{x:500,y:700},
  S06:{x:600,y:700},
  S07:{x:700,y:700},
  S08:{x:800,y:700},
  S09:{x:900,y:700},
  S10:{x:1000,y:700},

  // ── NORTH ROAD (Gate 3 → Gate 5)
  N01:{x:250,y:450},
  N02:{x:350,y:430},
  N03:{x:450,y:420},
  N04:{x:550,y:400},
  N05:{x:650,y:380},
  N06:{x:720,y:350},
  N07:{x:780,y:330},
  N08:{x:880,y:340},

  // ── WEST BLOCK (Gate 2 → Gate 3 inner)
  W01:{x:160,y:500},
  W02:{x:220,y:520},
  W03:{x:280,y:550},

  // ── ADMIN VERTICAL CONNECTOR
  A01:{x:300,y:600},

  // ── MID AREA (CEA / Engineering)
  M01:{x:550,y:600},
  M02:{x:650,y:600},

  // ── AUDITORIUM VERTICAL
  U01:{x:750,y:550},

  // ── EAST BLOCK (CAS / Nursing loop)
  E01:{x:950,y:650},
  E02:{x:950,y:550},
  E03:{x:950,y:450},
  E04:{x:1050,y:450},
  E05:{x:1150,y:450},
  E06:{x:1150,y:600},

  // ── PARKING / TSO EXTENSION
  P01:{x:1100,y:750},
};


// ─────────────────────────────────────────
// ROAD EDGES (connections only where roads exist)
// ─────────────────────────────────────────
export const ROAD_EDGE_LIST = [

  // ── SOUTH MAIN ROAD
  ['S01','S02'],['S02','S03'],['S03','S04'],
  ['S04','S05'],['S05','S06'],['S06','S07'],
  ['S07','S08'],['S08','S09'],['S09','S10'],

  // ── NORTH ROAD
  ['N01','N02'],['N02','N03'],['N03','N04'],
  ['N04','N05'],['N05','N06'],['N06','N07'],
  ['N07','N08'],

  // ── WEST BLOCK LOOP
  ['W01','W02'],['W02','W03'],

  // ── CONNECT WEST → SOUTH
  ['W03','S03'],

  // ── CONNECT WEST → NORTH
  ['W02','N01'],

  // ── ADMIN CONNECTOR
  ['S03','A01'],
  ['A01','N02'],

  // ── MID CONNECTORS (CEA area)
  ['S05','M01'],
  ['M01','M02'],
  ['M02','N04'],

  // ── AUDITORIUM CONNECTOR
  ['S07','U01'],
  ['U01','N06'],

  // ── EAST BLOCK LOOP (CAS/Nursing)
  ['S10','E01'],
  ['E01','E02'],
  ['E02','E03'],
  ['E03','E04'],
  ['E04','E05'],
  ['E05','E06'],
  ['E06','S09'],

  // ── PARKING EXTENSION
  ['S09','P01'],
];


// Build adjacency list
export const ROAD_GRAPH = {};
ROAD_EDGE_LIST.forEach(([a, b]) => {
  (ROAD_GRAPH[a] = ROAD_GRAPH[a] || []).push(b);
  (ROAD_GRAPH[b] = ROAD_GRAPH[b] || []).push(a);
});

/**
 * BUILDING_ENTRIES
 * Maps each building's SVG ID (uppercase) to an {x,y} exit point
 * just outside the building entrance. The nearest road node is
 * resolved automatically by findNearestNode() at routing time.
 */
export const BUILDING_ENTRIES = {
  'UNIVERSITY MUSEUM BUILDING': { x: 112, y: 694 },
  'COLLEGE OF EDUCATION BUILDING': { x: 173, y: 694 },
  'COLLEGE OF EDUCATION BUILDING EXTENSION 1': { x: 228, y: 694 },
  'GRADUATE SCHOOL BUILDING 2': { x: 279, y: 470 },
  'GRADUATE SCHOOL BUILDING': { x: 330, y: 470 },
  'INTEGRATED SCIENCE LABORATORY BUILDING': { x: 365, y: 470 },
  'PROCUREMENT AND SUPPLY BUILDING': { x: 275, y: 418 },
  'SECURITY AND GENERAL SERVICES BUILDING': { x: 313, y: 418 },
  'ELECTRICAL TECHNOLOGY BUILDING': { x: 343, y: 418 },
  'NSTP BUILDING': { x: 376, y: 408 },
  'ADMINISTRATION BUILDING': { x: 304, y: 668 },
  'THREE STOREY ACADEMIC BUILDING 2': { x: 224, y: 694 },
  'MANAGEMENT INFORMATION SYSTEM BUILDING': { x: 389, y: 668 },
  'THREE STOREY LEARNING RESOURCE CENTER': { x: 391, y: 668 },
  'STUDENT SERVICES BUILDING': { x: 512, y: 657 },
  'OLD BUILDING OF COLLEGE OF ARTS AND SCIENCES': { x: 507, y: 657 },
  'COMFORT ROOM BUILDING': { x: 540, y: 657 },
  'GENERAL SHOPROOM BUILDING': { x: 531, y: 427 },
  'ICT LABORATORY BUILDING': { x: 455, y: 658 },
  'COLLEGE OF COMPUTING STUDIES BUILDING': { x: 508, y: 657 },
  'COLLEGE OF SOCIAL SCIENCES AND PHILOSOPHY BUILDING': { x: 582, y: 657 },
  'BIDS AND AWARDS COMMITTEE OFFICE': { x: 423, y: 668 },
  'UNIVERSITY FOOD CENTER': { x: 450, y: 668 },
  'OCCUPATIONAL SAFETY AND HEALTH OFFICE BUILDING': { x: 455, y: 668 },
  'CEA MAIN BUILDING': { x: 555, y: 657 },
  'CEA EXTENSION BUILDING': { x: 561, y: 657 },
  'IE LABORATORY BUILDING': { x: 627, y: 658 },
  'CIVIL ENGINEERING AND MECHANICAL ENGINEERING LABORATORY BUILDING': { x: 661, y: 658 },
  'MEDICAL AND DENTAL CLINIC': { x: 703, y: 668 },
  'COLLEGE OF BUSINESS STUDIES BUILDING 1': { x: 771, y: 684 },
  'ENGINEERING BUILDING 1': { x: 717, y: 658 },
  'ELECTRICAL ENGINEERING BUILDING': { x: 700, y: 658 },
  'TECHNICAL VOCATIONAL BUILDING': { x: 678, y: 450 },
  'MOTORPOOL BUILDING': { x: 420, y: 408 },
  'COLLEGE OF INDUSTRIAL TECHNOLOGY BUILDING': { x: 539, y: 383 },
  'FOOD TECHNOLOGY BUILDING ': { x: 621, y: 515 },
  'INFORMATION AND TECHNOLOGY, COMPUTER ENGINEERING BUILDING': { x: 669, y: 330 },
  'UNIVERSITY AUDITORIUM': { x: 761, y: 491 },
  'JUNIOR HIGH SCHOOL BUILDING': { x: 767, y: 317 },
  'UNIVERSITY HOSTEL': { x: 849, y: 407 },
  'EXECUTIVE LOUNGE': { x: 882, y: 360 },
  'MULTI DISCIPLINARY RESOURCE AND TOURISM BUILDING': { x: 801, y: 491 },
  'COLLEGE OF BUSINESS STUDIES BUILDING 3': { x: 770, y: 510 },
  'COLLEGE OF BUSINESS STUDIES BUILDING 2': { x: 820, y: 680 },
  'COOPERATIVE EDUCATION BUILDING': { x: 857, y: 296 },
  'MULTI-PURPOSE HALL': { x: 881, y: 280 },
  'COLLEGE OF EDUCATION BUILDING 3 (EXT LOT)': { x: 1040, y: 285 },
  'COLLEGE OF ARTS AND SCIENCES BUILDING': { x: 1000, y: 450 },
  'INTEGRATED RESEARCH, TRAINING PRODUCTION CENTER BUILDING': { x: 958, y: 569 },
  'INTEGRATED RESEARCH TRAINING AND PRODUCTION CENTER EXTENSION BUILDING': { x: 958, y: 630 },
  'THREE STOREY HEALTH AND SCIENCES BUILDING': { x: 1053, y: 617 },
  'PHYSICAL EDUCATION COVERED COURT': { x: 1085, y: 528 },
  'TRANSPORTATION SERVICES OFFICE BUILDING': { x: 1271, y: 665 },
  'UNIVERSITY PHYSICAL EDUCATION FACILITIES AND UNIVERSITY POOL': { x: 1289, y: 540 },
  'DOCTOR ERNESTO NICDAO SPORTS CENTER BUILDING': { x: 1176, y: 402 },
  'INSTRUCTOR PHYSICAL EDUCATION NEW BUILDING': { x: 1265, y: 617 },
  'INSTRUCTOR PHYSICAL EDUCATION OLD BUILDING': { x: 1258, y: 304 },
};

// ── Nearest road node helper ──────────────────────────────────
function findNearestNode(point) {
  let nearest = null;
  let minDist = Infinity;
  Object.entries(ROAD_NODES).forEach(([key, node]) => {
    const dx = node.x - point.x;
    const dy = node.y - point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) { minDist = dist; nearest = key; }
  });
  return nearest;
}

// ── Dijkstra shortest path ────────────────────────────────────
/**
 * findRoadPath(start, end)
 * Returns array of node keys from start to end (inclusive),
 * or null if no path exists.
 */
export function findRoadPath(start, end) {
  if (start === end) return [start];

  const dist = {}, prev = {};
  const nodes = Object.keys(ROAD_NODES);
  const unvisited = new Set(nodes);

  nodes.forEach(n => dist[n] = Infinity);
  dist[start] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let curr = null;
    for (const n of unvisited) {
      if (!curr || dist[n] < dist[curr]) curr = n;
    }
    if (!curr || dist[curr] === Infinity) break;
    if (curr === end) break;

    unvisited.delete(curr);

    for (const nb of (ROAD_GRAPH[curr] || [])) {
      if (!unvisited.has(nb)) continue;
      const nc = ROAD_NODES[curr], nn = ROAD_NODES[nb];
      const alt = dist[curr] + Math.hypot(nn.x - nc.x, nn.y - nc.y);
      if (alt < dist[nb]) { dist[nb] = alt; prev[nb] = curr; }
    }
  }

  // Reconstruct path
  const path = [];
  let curr = end;
  while (curr !== undefined) { path.unshift(curr); curr = prev[curr]; }
  return path[0] === start ? path : null;
}

/**
 * getRoadWaypoints(svgIdA, svgIdB)
 * Returns full {x,y} waypoint array for routing from building A to B:
 *   exitA → [road nodes] → exitB
 * Returns null if either building has no entry defined.
 */
export function getRoadWaypoints(svgIdA, svgIdB) {
  const a = svgIdA.trim().toUpperCase();
  const b = svgIdB.trim().toUpperCase();

  const entryA = BUILDING_ENTRIES[a];
  const entryB = BUILDING_ENTRIES[b];
  if (!entryA || !entryB) return null;

  const exitA = entryA;
  const exitB = entryB;

  const nodeA = findNearestNode(exitA);
  const nodeB = findNearestNode(exitB);

  const nodePath = findRoadPath(nodeA, nodeB);
  if (!nodePath) return null;

  // Build waypoint list: exitA → road nodes → exitB
  const pts = [exitA, ...nodePath.map(n => ROAD_NODES[n]), exitB];

  // Remove duplicate consecutive points (within 2px)
  return pts.filter((p, i) => {
    if (i === 0) return true;
    const q = pts[i - 1];
    return Math.abs(p.x - q.x) > 2 || Math.abs(p.y - q.y) > 2;
  });
}
