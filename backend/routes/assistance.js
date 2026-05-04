const express = require('express');
const router  = express.Router();
const db      = require('../db');

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

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('GET /assistance error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch assistance data.' });
    }
    return res.status(200).json({ success: true, data: rows });
  });
});

router.post('/', (req, res) => {
  const { building_id, question, answer } = req.body;

  if (!building_id || !question || !answer) {
    return res.status(400).json({ success: false, message: 'Building, question, and answer are required.' });
  }

  const sql = `INSERT INTO assistance (building_id, question, answer) VALUES (?, ?, ?)`;

  db.run(sql, [building_id, question, answer], function (err) {
    if (err) {
      console.error('POST /assistance error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to save Q&A entry.' });
    }
    return res.status(201).json({ success: true, message: 'Q&A entry saved successfully.', id: this.lastID });
  });
});

router.put('/:id', (req, res) => {
  const { building_id, question, answer } = req.body;
  const { id } = req.params;

  if (!building_id || !question || !answer) {
    return res.status(400).json({ success: false, message: 'Building, question, and answer are required.' });
  }

  const sql = `UPDATE assistance SET building_id = ?, question = ?, answer = ? WHERE id = ?`;

  db.run(sql, [building_id, question, answer, id], function (err) {
    if (err) {
      console.error('PUT /assistance error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to update Q&A entry.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Q&A entry not found.' });
    }
    return res.status(200).json({ success: true, message: 'Q&A entry updated successfully.' });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM assistance WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('DELETE /assistance error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to delete Q&A entry.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Q&A entry not found.' });
    }
    return res.status(200).json({ success: true, message: 'Q&A entry deleted successfully.' });
  });
});

module.exports = router;
