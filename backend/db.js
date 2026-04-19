/**
 * ============================================================
 *  Campus Locator System — MySQL Connection
 *  backend/db.js
 * ============================================================
 */

const mysql = require('mysql2');

const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'campus_locator'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL — campus_locator');
});

module.exports = db;
