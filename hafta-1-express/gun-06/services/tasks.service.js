// Her sorgu user_id ile filtrelenir: kullanıcı yalnızca kendi görevlerini görür.
// Başkasının görevi için 403 yerine 404 döneriz (görevin var olduğunu sızdırmamak için).
const pool = require('../db');
const { NotFoundError } = require('../middlewares/errors');

const COLUMNS = 'id, title, done, created_at';

async function findAll(userId, done) {
  if (done === undefined) {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM tasks WHERE user_id = $1 ORDER BY id`,
      [userId],
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM tasks WHERE user_id = $1 AND done = $2 ORDER BY id`,
    [userId, done],
  );
  return rows;
}

async function findOne(userId, id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM tasks WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  if (rows.length === 0) throw new NotFoundError('Görev bulunamadı');
  return rows[0];
}

async function create(userId, { title }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING ${COLUMNS}`,
    [title.trim(), userId],
  );
  return rows[0];
}

async function update(userId, id, { title, done }) {
  const { rows } = await pool.query(
    `UPDATE tasks
       SET title = COALESCE($3, title),
           done  = COALESCE($4, done)
     WHERE id = $1 AND user_id = $2
     RETURNING ${COLUMNS}`,
    [id, userId, title === undefined ? null : title.trim(), done ?? null],
  );
  if (rows.length === 0) throw new NotFoundError('Görev bulunamadı');
  return rows[0];
}

async function remove(userId, id) {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  if (rowCount === 0) throw new NotFoundError('Görev bulunamadı');
}

module.exports = { findAll, findOne, create, update, remove };
