const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { UnauthorizedError, ConflictError } = require('../middlewares/errors');

const SALT_ROUNDS = 10;
// Kullanıcı yoksa da bcrypt.compare çalışsın: yanıt süresinden email'in kayıtlı olup olmadığı anlaşılmasın
const DUMMY_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

async function register({ email, password }) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email.trim().toLowerCase(), hash],
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') throw new ConflictError('Bu email zaten kayıtlı'); // unique_violation
    throw err;
  }
}

async function login({ email, password }) {
  const { rows } = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [
    email.trim().toLowerCase(),
  ]);
  const user = rows[0];
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  // Email mi şifre mi yanlış, bilerek söylemiyoruz
  if (!user || !ok) throw new UnauthorizedError('Email ya da şifre hatalı');

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
  return { token };
}

module.exports = { register, login };
