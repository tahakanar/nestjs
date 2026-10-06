require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

// Pool: bağlantıları yeniden kullanır, her istekte yeni bağlantı açılmaz
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME,
});

module.exports = pool;
