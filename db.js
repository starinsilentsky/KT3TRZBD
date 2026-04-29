const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'users.db');

let db;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  TEXT NOT NULL,
        email TEXT NOT NULL
      )
    `);
    // Начальные данные
    db.run("INSERT INTO users (name, email) VALUES ('Алиса Смирнова',  'alice@example.com')");
    db.run("INSERT INTO users (name, email) VALUES ('Борис Петров',    'boris@example.com')");
    db.run("INSERT INTO users (name, email) VALUES ('Вера Козлова',    'vera@example.com')");
    save();
  }

  return db;
}

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function rowsToObjects(result) {
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

async function getAllUsers() {
  const d = await getDb();
  const result = d.exec('SELECT * FROM users ORDER BY id');
  return rowsToObjects(result);
}

async function getUserById(id) {
  const d = await getDb();
  const result = d.exec('SELECT * FROM users WHERE id = ?', [id]);
  return rowsToObjects(result)[0] || null;
}

async function createUser(name, email) {
  const d = await getDb();
  d.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  save();
}

async function updateUser(id, name, email) {
  const d = await getDb();
  d.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  save();
}

async function deleteUser(id) {
  const d = await getDb();
  d.run('DELETE FROM users WHERE id = ?', [id]);
  save();
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
