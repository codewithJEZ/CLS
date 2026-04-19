/**
 * ============================================================
 *  Campus Locator System — Buildings Routes
 *  backend/routes/buildings.js
 *
 *  Mounted at: /buildings  (in server.js)
 *  GET    /buildings          → return all buildings
 *  POST   /buildings          → insert a new building
 *  PUT    /buildings/:id      → update a building
 *  DELETE /buildings/:id      → delete a building
 *  PATCH  /buildings/:id/featured → toggle is_featured only
 * ============================================================
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /buildings ───────────────────────────────────────────
// Returns all buildings ordered by name.
// Includes is_featured so the user-side can show the Recommended badge.
router.get('/', (req, res) => {
  const sql = `
    SELECT id, name, code, description, is_featured, created_at
    FROM buildings
    ORDER BY name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ GET /buildings error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch buildings.' });
    }
    return res.status(200).json({ success: true, data: results });
  });
});

// ── POST /buildings ──────────────────────────────────────────
// Inserts a new building.
// Required: name, code   Optional: description, is_featured
router.post('/', (req, res) => {
  const { name, code, description, is_featured } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Building name and code are required.' });
  }

  const sql = `
    INSERT INTO buildings (name, code, description, is_featured)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, code, description || '', is_featured ? 1 : 0], (err, result) => {
    if (err) {
      console.error('❌ POST /buildings error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to save building.' });
    }
    return res.status(201).json({ success: true, message: 'Building saved successfully.', id: result.insertId });
  });
});

// ── PUT /buildings/:id ───────────────────────────────────────
// Updates an existing building including is_featured.
router.put('/:id', (req, res) => {
  const { name, code, description, is_featured } = req.body;
  const { id } = req.params;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Building name and code are required.' });
  }

  const sql = `
    UPDATE buildings
    SET name = ?, code = ?, description = ?, is_featured = ?
    WHERE id = ?
  `;

  db.query(sql, [name, code, description || '', is_featured ? 1 : 0, id], (err, result) => {
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

// ── PATCH /buildings/:id/featured ───────────────────────────
// Toggles is_featured for a single building without touching other fields.
// Body: { is_featured: 1 | 0 }
router.patch('/:id/featured', (req, res) => {
  const { is_featured } = req.body;
  const { id }          = req.params;

  if (is_featured === undefined) {
    return res.status(400).json({ success: false, message: 'is_featured value is required.' });
  }

  db.query(
    'UPDATE buildings SET is_featured = ? WHERE id = ?',
    [is_featured ? 1 : 0, id],
    (err, result) => {
      if (err) {
        console.error('❌ PATCH /buildings featured error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to update featured status.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Building not found.' });
      }
      return res.status(200).json({ success: true, message: `Featured status updated.` });
    }
  );
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

module.exports = router;
