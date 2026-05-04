/**
 * ============================================================
 *  Campus Locator System — Express Server (FIXED)
 *  backend/server.js
 * ============================================================
 */

const express = require('express');
const cors = require('cors');

const adminRoute = require('./routes/admin');
const buildingsRoute = require('./routes/buildings');
const facilitiesRoute = require('./routes/facilities');
const assistanceRoute = require('./routes/assistance');

const app = express();

// ✅ FIX: use Railway dynamic port
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health Check (IMPORTANT SA DEPLOY) ───────────────────────
app.get('/', (req, res) => {
  res.send('Campus Locator API is running 🚀');
});

// ── Routes ───────────────────────────────────────────────────
app.use('/admin', adminRoute);
app.use('/buildings', buildingsRoute);
app.use('/facilities', facilitiesRoute);
app.use('/assistance', assistanceRoute);

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error Handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});