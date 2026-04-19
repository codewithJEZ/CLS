/**
 * ============================================================
 *  Campus Locator System — Facilities Routes
 *  backend/routes/facilities.js
 *
 *  Mounted at: /facilities  (in server.js)
 *  GET  /facilities   → return all facilities (with building name)
 *  POST /facilities   → insert a new facility
 * ============================================================
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /facilities ──────────────────────────────────────────
// Returns all facilities joined with their building name.
// The JOIN lets the frontend display "Main Building" instead of just an ID.
router.get('/', (req, res) => {
  const sql = `
    SELECT
      f.id,
      f.building_id,
      b.name  AS building_name,
      f.name,
      f.type,
      f.description,
      f.floor,
      f.created_at
    FROM facilities f
    JOIN buildings b ON f.building_id = b.id
    ORDER BY b.name ASC, f.name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ GET /facilities error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch facilities.'
      });
    }

    return res.status(200).json({
      success: true,
      data: results
    });
  });
});

// ── POST /facilities ─────────────────────────────────────────
// Inserts a new facility.
// Required body fields: building_id, name, type, floor
// Optional body fields: description
router.post('/', (req, res) => {
  const { building_id, name, type, description, floor } = req.body;

  // Validate required fields
  if (!building_id || !name || !type || !floor) {
    return res.status(400).json({
      success: false,
      message: 'Building, name, type, and floor are required.'
    });
  }

  const sql = `
    INSERT INTO facilities (building_id, name, type, description, floor)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [building_id, name, type, description || '', floor], (err, result) => {
    if (err) {
      console.error('❌ POST /facilities error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save facility.'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Facility saved successfully.',
      id: result.insertId
    });
  });
});

module.exports = router;

// ── PUT /facilities/:id ──────────────────────────────────────
// Updates an existing facility.
router.put('/:id', (req, res) => {
  const { building_id, name, type, description, floor } = req.body;
  const { id } = req.params;

  if (!building_id || !name || !type || !floor) {
    return res.status(400).json({ success: false, message: 'Building, name, type, and floor are required.' });
  }

  const sql = `
    UPDATE facilities
    SET building_id = ?, name = ?, type = ?, description = ?, floor = ?
    WHERE id = ?
  `;

  db.query(sql, [building_id, name, type, description || '', floor, id], (err, result) => {
    if (err) {
      console.error('❌ PUT /facilities error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to update facility.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }
    return res.status(200).json({ success: true, message: 'Facility updated successfully.' });
  });
});

// ── DELETE /facilities/:id ───────────────────────────────────
// Deletes a facility by ID.
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM facilities WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ DELETE /facilities error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to delete facility.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }
    return res.status(200).json({ success: true, message: 'Facility deleted successfully.' });
  });
});
