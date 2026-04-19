/**
 * ============================================================
 *  Campus Locator System — Buildings Routes
 *  backend/routes/buildings.js
 *
 *  Mounted at: /buildings  (in server.js)
 *  GET  /buildings   → return all buildings
 *  POST /buildings   → insert a new building
 * ============================================================
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /buildings ───────────────────────────────────────────
// Returns all buildings ordered by name.
router.get('/', (req, res) => {
  const sql = `
    SELECT id, name, code, description, created_at
    FROM buildings
    ORDER BY name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ GET /buildings error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch buildings.'
      });
    }

    return res.status(200).json({
      success: true,
      data: results
    });
  });
});

// ── POST /buildings ──────────────────────────────────────────
// Inserts a new building.
// Required body fields: name, code
// Optional body fields: description
router.post('/', (req, res) => {
  const { name, code, description } = req.body;

  // Validate required fields
  if (!name || !code) {
    return res.status(400).json({
      success: false,
      message: 'Building name and code are required.'
    });
  }

  const sql = `
    INSERT INTO buildings (name, code, description)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, code, description || ''], (err, result) => {
    if (err) {
      console.error('❌ POST /buildings error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save building.'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Building saved successfully.',
      id: result.insertId
    });
  });
});

module.exports = router;

// ── PUT /buildings/:id ───────────────────────────────────────
// Updates an existing building.
router.put('/:id', (req, res) => {
  const { name, code, description } = req.body;
  const { id } = req.params;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Building name and code are required.' });
  }

  const sql = `UPDATE buildings SET name = ?, code = ?, description = ? WHERE id = ?`;

  db.query(sql, [name, code, description || '', id], (err, result) => {
    if (err) {
      console.error('❌ PUT /buildings error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to update building.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Building not found.' });
    }
    return res.status(200).json({ success: true, message: 'Building updated successfully.' });
  });
});

// ── DELETE /buildings/:id ────────────────────────────────────
// Deletes a building by ID.
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM buildings WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ DELETE /buildings error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to delete building.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Building not found.' });
    }
    return res.status(200).json({ success: true, message: 'Building deleted successfully.' });
  });
});
