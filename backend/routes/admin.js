const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  const sql = `SELECT id FROM admins WHERE username = ? AND password = ? LIMIT 1`;

  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error('Login query error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Server error. Please try again.'
      });
    }

    if (row) {
      return res.status(200).json({ success: true, message: 'Login successful.' });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  });
});

module.exports = router;
