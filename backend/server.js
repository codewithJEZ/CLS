/**
 * ============================================================
 *  Campus Locator System — Express Server
 *  backend/server.js
 * ============================================================
 */

const express      = require('express');
const cors         = require('cors');
const adminRoute   = require('./routes/admin');
const buildingsRoute    = require('./routes/buildings');
const facilitiesRoute   = require('./routes/facilities');
const assistanceRoute   = require('./routes/assistance');

const app  = express();
const PORT = 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
// NOTE: No /api prefix — routes are mounted directly
app.use('/admin',      adminRoute);
app.use('/buildings',  buildingsRoute);
app.use('/facilities', facilitiesRoute);
app.use('/assistance', assistanceRoute);

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
