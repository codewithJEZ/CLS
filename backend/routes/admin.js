/**
 * ============================================================
 *  Campus Locator System — Admin Routes
 *  backend/routes/admin.js
 *
 *  Mounted at: /admin  (in server.js)
 *  Full path:  POST /admin/login
 * ============================================================
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── POST /admin/login ────────────────────────────────────────
// Validates username and password against the admins table.
// Returns { success: true } on match, { success: false } otherwise.
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Reject empty submissions early
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  // BINARY makes the comparison case-sensitive
  const sql = `
    SELECT id FROM admins
    WHERE BINARY username = ? AND BINARY password = ?
    LIMIT 1
  `;

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('❌ Login query error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again.'
      });
    }

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Login successful.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials.'
    });
  });
});

module.exports = router;
