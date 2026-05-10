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
 *   const mapContainer = document.getElementById("mapInner");
 *
 *      mapContainer.addEventListener("click", handleCoords);
 *       mapContainer.addEventListener("touchstart", handleCoords);
 *
 *     function handleCoords(e) {
 *        const svg = document.querySelector("#mapInner svg");
 *         if (!svg) return;
 *
 *         const pt = svg.createSVGPoint();
 *
 *   if (e.touches && e.touches.length > 0) {
 *      pt.x = e.touches[0].clientX;
 *       pt.y = e.touches[0].clientY;
 *      } else {
 *         pt.x = e.clientX;
 *          pt.y = e.clientY;
 *         }
 *
 *       const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
 *
 *         console.log(`{ x: ${Math.round(svgPoint.x)}, y: ${Math.round(svgPoint.y)} }`);
 *       }
 *   3. Click along the road — copy the logged coordinates here.
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

// ── Road junction nodes ───────────────────────────────────────
export const ROAD_NODES = {
  A: { x: 357, y: 637 },
  B: { x: 333, y: 536 },
  C: { x: 318, y: 550 },
  D: { x: 296, y: 458 },
  E: { x: 439, y: 616 },
  F: { x: 418, y: 532 },
  G: { x: 411, y: 517 },
  H: { x: 390, y: 433 },
  I: { x: 700, y: 681 },
  J: { x: 667, y: 554 },
  K: { x: 655, y: 473 },
  L: { x: 632, y: 370 },
  M: { x: 767, y: 675 },
  N: { x: 734, y: 505 },
  O: { x: 698, y: 358 },
  P: { x: 813, y: 479 },
  Q: { x: 786, y: 337 },
  R: { x: 833, y: 679 },
  S: { x: 910, y: 306 },
  T: { x: 866, y: 669 },
  U: { x: 931, y: 310 },
  V: { x: 922, y: 670 },
  W: { x: 971, y: 316 },
  X: { x: 1130, y: 448 },
  Y: { x: 1140, y: 340 },
  Z: { x: 1186, y: 679 },
  A1: { x: 1213, y: 465 },
};

// ─────────────────────────────────────────
// ROAD EDGES (connections only where roads exist)
// ─────────────────────────────────────────
export const ROAD_EDGE_LIST = {
  A: ["B", "E"],
  B: ["A", "C", "G"],
  C: ["B", "D"],
  D: ["C", "H"],
  E: ["F", "J"],
  F: ["E", "G", "K"],
  G: ["F", "B", "H"],
  H: ["G", "D", "L"],
  I: ["J", "M"],
  J: ["I", "E", "K"],
  K: ["J", "L"],
  L: ["K", "H", "O"],
  M: ["I", "N", "R"],
  N: ["M", "O", "P"],
  O: ["L", "N", "Q"],
  P: ["N", "Q"],
  Q: ["O", "P", "S"],
  R: ["M", "T"],
  S: ["Q", "U"],
  T: ["R", "U", "V"],
  U: ["S", "T", "W"],
  V: ["T", "Z"],
  W: ["U", "Y"],
  X: ["Y", "A1"],
  Y: ["W", "X"],
  Z: ["V", "A1"],
  A1: ["Z", "X"],
};

/**
 * BUILDING_ENTRIES
 * Maps each building's SVG ID (uppercase) to an {x,y} exit point
 * just outside the building entrance. The nearest road node is
 * resolved automatically by findNearestNode() at routing time.
 */
export const BUILDING_ENTRIES = {
  "UNIVERSITY MUSEUM BUILDING": { x: 162, y: 602 },
  "COLLEGE OF EDUCATION BUILDING": { x: 185, y: 590 },
  "COLLEGE OF EDUCATION BUILDING EXTENSION 1": { x: 238, y: 577 },
  "GRADUATE SCHOOL BUILDING 2": { x: 297, y: 554 },
  "GRADUATE SCHOOL BUILDING": { x: 309, y: 506 },
  "INTEGRATED SCIENCE LABORATORY BUILDING": { x: 401, y: 477 },
  "PROCUREMENT AND SUPPLY BUILDING": { x: 275, y: 418 },
  "SECURITY AND GENERAL SERVICES BUILDING": { x: 313, y: 418 },
  "ELECTRICAL TECHNOLOGY BUILDING": { x: 343, y: 418 },
  "NSTP BUILDING": { x: 376, y: 408 },
  "ADMINISTRATION BUILDING": { x: 300, y: 555 },
  "THREE STOREY ACADEMIC BUILDING 2": { x: 232, y: 661 },
  "MANAGEMENT INFORMATION SYSTEM BUILDING": { x: 370, y: 530 },
  "THREE STOREY LEARNING RESOURCE CENTER": { x: 430, y: 620 },
  "STUDENT SERVICES BUILDING": { x: 500, y: 510 },
  "OLD BUILDING OF COLLEGE OF ARTS AND SCIENCES": { x: 525, y: 505 },
  "COMFORT ROOM BUILDING": { x: 540, y: 657 },
  "GENERAL SHOPROOM BUILDING": { x: 520, y: 395 },
  "ICT LABORATORY BUILDING": { x: 435, y: 605 },
  "COLLEGE OF COMPUTING STUDIES BUILDING": { x: 517, y: 594 },
  "COLLEGE OF SOCIAL SCIENCES AND PHILOSOPHY BUILDING": { x: 590, y: 570 },
  "BIDS AND AWARDS COMMITTEE OFFICE": { x: 423, y: 668 },
  "UNIVERSITY FOOD CENTER": { x: 450, y: 668 },
  "OCCUPATIONAL SAFETY AND HEALTH OFFICE BUILDING": { x: 455, y: 668 },
  "CEA MAIN BUILDING": { x: 564, y: 583 },
  "CEA EXTENSION BUILDING": { x: 564, y: 583 },
  "IE LABORATORY BUILDING": { x: 631, y: 562 },
  "CIVIL ENGINEERING AND MECHANICAL ENGINEERING LABORATORY BUILDING": {
    x: 678,
    y: 590,
  },
  "MEDICAL AND DENTAL CLINIC": { x: 695, y: 655 },
  "COLLEGE OF BUSINESS STUDIES BUILDING 1": { x: 771, y: 684 },
  "ENGINEERING BUILDING 1": { x: 717, y: 620 },
  "ELECTRICAL ENGINEERING BUILDING": { x: 588, y: 575 },
  "TECHNICAL VOCATIONAL BUILDING": { x: 678, y: 465 },
  "MOTORPOOL BUILDING": { x: 420, y: 408 },
  "COLLEGE OF INDUSTRIAL TECHNOLOGY BUILDING": { x: 650, y: 385 },
  "FOOD TECHNOLOGY BUILDING": { x: 660, y: 490 },
  "INFORMATION AND TECHNOLOGY, COMPUTER ENGINEERING BUILDING": {
    x: 662,
    y: 355,
  },
  "UNIVERSITY AUDITORIUM": { x: 740, y: 345 },
  "JUNIOR HIGH SCHOOL BUILDING": { x: 767, y: 317 },
  "UNIVERSITY HOSTEL": { x: 811, y: 408 },
  "EXECUTIVE LOUNGE": { x: 849, y: 326 },
  "MULTI DISCIPLINARY RESOURCE AND TOURISM BUILDING": { x: 795, y: 390 },
  "COLLEGE OF BUSINESS STUDIES BUILDING 3": { x: 740, y: 551 },
  "COLLEGE OF BUSINESS STUDIES BUILDING 2": { x: 800, y: 650 },
  "COOPERATIVE EDUCATION BUILDING": { x: 847, y: 320 },
  "MULTI-PURPOSE HALL": { x: 889, y: 311 },
  "COLLEGE OF EDUCATION BUILDING 3 (EXT LOT)": { x: 1036, y: 326 },
  "COLLEGE OF ARTS AND SCIENCES BUILDING": { x: 945, y: 440 },
  "INTEGRATED RESEARCH, TRAINING PRODUCTION CENTER BUILDING": {
    x: 930,
    y: 570,
  },
  "INTEGRATED RESEARCH TRAINING AND PRODUCTION CENTER EXTENSION BUILDING": {
    x: 920,
    y: 630,
  },
  "THREE STOREY HEALTH AND SCIENCES BUILDING": { x: 1054, y: 670 },
  "PHYSICAL EDUCATION COVERED COURT": { x: 1150, y: 455 },
  "TRANSPORTATION SERVICES OFFICE BUILDING": { x: 1236, y: 697 },
  "UNIVERSITY PHYSICAL EDUCATION FACILITIES AND UNIVERSITY POOL": {
    x: 1289,
    y: 540,
  },
  "DOCTOR ERNESTO NICDAO SPORTS CENTER BUILDING": { x: 1176, y: 350 },
  "INSTRUCTOR PHYSICAL EDUCATION NEW BUILDING": { x: 1243, y: 628 },
  "INSTRUCTOR PHYSICAL EDUCATION OLD BUILDING": { x: 1258, y: 304 },
};

// ── Nearest road node helper ──────────────────────────────────
function findNearestNode(point) {
  let nearest = null;
  let minDist = Infinity;
  Object.entries(ROAD_NODES).forEach(([key, node]) => {
    const dx = node.x - point.x;
    const dy = node.y - point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      nearest = key;
    }
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

  const dist = {},
    prev = {};
  const nodes = Object.keys(ROAD_NODES);
  const unvisited = new Set(nodes);

  nodes.forEach((n) => (dist[n] = Infinity));
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

    for (const nb of ROAD_EDGE_LIST[curr] || []) {
      if (!unvisited.has(nb)) continue;
      const nc = ROAD_NODES[curr],
        nn = ROAD_NODES[nb];
      const alt = dist[curr] + Math.hypot(nn.x - nc.x, nn.y - nc.y);
      if (alt < dist[nb]) {
        dist[nb] = alt;
        prev[nb] = curr;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let curr = end;
  while (curr !== undefined) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path[0] === start ? path : null;
}

const DIRECT_DIST_THRESHOLD = 160;

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

  if (
    Math.hypot(exitB.x - exitA.x, exitB.y - exitA.y) <= DIRECT_DIST_THRESHOLD
  ) {
    return [exitA, exitB];
  }

  const nodeA = findNearestNode(exitA);
  const nodeB = findNearestNode(exitB);

  if (nodeA === nodeB) {
    return [exitA, ROAD_NODES[nodeA], exitB];
  }

  const nodePath = findRoadPath(nodeA, nodeB);
  if (!nodePath) return null;

  // Build waypoint list: exitA → road nodes → exitB
  const pts = [exitA, ...nodePath.map((n) => ROAD_NODES[n]), exitB];

  // Remove duplicate consecutive points (within 2px)
  return pts.filter((p, i) => {
    if (i === 0) return true;
    const q = pts[i - 1];
    return Math.abs(p.x - q.x) > 2 || Math.abs(p.y - q.y) > 2;
  });
}
