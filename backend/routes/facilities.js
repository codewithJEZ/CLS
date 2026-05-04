const express = require('express');
const router  = express.Router();
const db      = require('../db');

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

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('GET /facilities error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch facilities.' });
    }
    return res.status(200).json({ success: true, data: rows });
  });
});

router.post('/', (req, res) => {
  const { building_id, name, type, description, floor } = req.body;

  if (!building_id || !name || !type || !floor) {
    return res.status(400).json({ success: false, message: 'Building, name, type, and floor are required.' });
  }

  const sql = `INSERT INTO facilities (building_id, name, type, description, floor) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [building_id, name, type, description || '', floor], function (err) {
    if (err) {
      console.error('POST /facilities error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to save facility.' });
    }
    return res.status(201).json({ success: true, message: 'Facility saved successfully.', id: this.lastID });
  });
});

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

  db.run(sql, [building_id, name, type, description || '', floor, id], function (err) {
    if (err) {
      console.error('PUT /facilities error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to update facility.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }
    return res.status(200).json({ success: true, message: 'Facility updated successfully.' });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM facilities WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('DELETE /facilities error:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to delete facility.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Facility not found.' });
    }
    return res.status(200).json({ success: true, message: 'Facility deleted successfully.' });
  });
});

module.exports = router;
