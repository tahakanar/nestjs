// İş mantığı + veritabanı sorguları. Değerler asla SQL'e birleştirilmez:
// $1, $2 ile ayrı gönderilir (SQL injection'a karşı)
const pool = require('../db');
const { NotFoundError } = require('../middlewares/errors');

const COLUMNS = 'id, title, done, created_at';

async function findAll(done) {
  if (done === undefined) {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM tasks ORDER BY id`);
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM tasks WHERE done = $1 ORDER BY id`,
    [done],
  );
  return rows;
}

async function findOne(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM tasks WHERE id = $1`, [id]);
  if (rows.length === 0) throw new NotFoundError('Görev bulunamadı');
  return rows[0];
}

async function create({ title }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (title) VALUES ($1) RETURNING ${COLUMNS}`,
    [title.trim()],
  );
  return rows[0];
}

async function update(id, { title, done }) {
  // COALESCE: gönderilmeyen (null) alan mevcut değerini korur
  const { rows } = await pool.query(
    `UPDATE tasks
       SET title = COALESCE($2, title),
           done  = COALESCE($3, done)
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, title === undefined ? null : title.trim(), done ?? null],
  );
  if (rows.length === 0) throw new NotFoundError('Görev bulunamadı');
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  if (rowCount === 0) throw new NotFoundError('Görev bulunamadı');
}

module.exports = { findAll, findOne, create, update, remove };
