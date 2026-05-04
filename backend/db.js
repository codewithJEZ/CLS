/**
 * ============================================================
 *  Campus Locator System — SQLite Connection (FIXED)
 *  backend/db.js
 * ============================================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// ✅ automatic path (works local + deploy)
const dbPath = path.join(__dirname, 'setup.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection failed:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

module.exports = db;