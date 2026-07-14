// Connessione SQLite + helper Promise (usati da tutti i repository)
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "..", "..", "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, "Preventivi.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Errore apertura database:", err.message);
    process.exit(1);
  }
  console.log("Database SQLite connesso:", dbPath);
});

db.run("PRAGMA foreign_keys = ON");

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = { db, dbGet, dbAll, dbRun };
