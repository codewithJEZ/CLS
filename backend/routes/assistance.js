/**
 * ============================================================
 *  Campus Locator System — Assistance (Q&A) Routes
 *  backend/routes/assistance.js
 *
 *  Mounted at: /assistance  (in server.js)
 *  GET  /assistance   → return all Q&A entries (with building name)
 *  POST /assistance   → insert a new Q&A entry
 * ============================================================
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── GET /assistance ──────────────────────────────────────────
// Returns all Q&A entries joined with their building name.
router.get('/', (req, res) => {
  const sql = `
    SELECT
      a.id,
      a.building_id,
      b.name  AS building_name,
      a.question,
      a.answer,
      a.created_at
    FROM assistance a
    JOIN buildings b ON a.building_id = b.id
    ORDER BY b.name ASC, a.question ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ GET /assistance error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch assistance data.'
      });
    }

    return res.status(200).json({
      success: true,
      data: results
    });
  });
});

// ── POST /assistance ─────────────────────────────────────────
// Inserts a new Q&A entry.
// Required body fields: building_id, question, answer
router.post('/', (req, res) => {
  const { building_id, question, answer } = req.body;

  // Validate required fields
  if (!building_id || !question || !answer) {
    return res.status(400).json({
      success: false,
      message: 'Building, question, and answer are required.'
    });
  }

  const sql = `
    INSERT INTO assistance (building_id, question, answer)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [building_id, question, answer], (err, result) => {
    if (err) {
      console.error('❌ POST /assistance error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save Q&A entry.'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Q&A entry saved successfully.',
      id: result.insertId
    });
  });
});

module.exports = router;

// ── PUT /assistance/:id ──────────────────────────────────────
// Updates an existing Q&A entry.
router.put('/:id', (req, res) => {
  const { building_id, question, answer } = req.body;
  const { id } = req.params;

  if (!building_id || !question || !answer) {
    return res.status(400).json({ success: false, message: 'Building, question, and answer are required.' });
  }

  const sql = `UPDATE assistance SET building_id = ?, question = ?, answer = ? WHERE id = ?`;

  db.query(sql, [building_id, question, answer, id], (err, result) => {
    if (err) {
      console.error('❌ PUT /assistance error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to update Q&A entry.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Q&A entry not found.' });
    }
    return res.status(200).json({ success: true, message: 'Q&A entry updated successfully.' });
  });
});

// ── DELETE /assistance/:id ───────────────────────────────────
// Deletes a Q&A entry by ID.
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM assistance WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ DELETE /assistance error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to delete Q&A entry.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Q&A entry not found.' });
    }
    return res.status(200).json({ success: true, message: 'Q&A entry deleted successfully.' });
  });
});
