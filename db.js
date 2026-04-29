require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id    SERIAL PRIMARY KEY,
      name  TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM users');
  if (rows[0].count === '0') {
    await pool.query(`
      INSERT INTO users (name, email) VALUES
        ('Алиса Смирнова',  'alice@example.com'),
        ('Борис Петров',    'boris@example.com'),
        ('Вера Козлова',    'vera@example.com')
    `);
  }
}

async function getAllUsers() {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
  return rows;
}

async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createUser(name, email) {
  await pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
}

async function updateUser(id, name, email) {
  await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, id]);
}

async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { init, getAllUsers, getUserById, createUser, updateUser, deleteUser };
