// Schema del database + migrazioni + utente admin predefinito
const bcrypt = require("bcrypt");
const { db, dbGet, dbRun } = require("./database");

const TABELLE = [
  `CREATE TABLE IF NOT EXISTS utenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS marche (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS clienti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    num_tel TEXT,
    email TEXT,
    data_passaggio DATE,
    flag_ricontatto INTEGER DEFAULT 0,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS modelli (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    marche_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marche_id) REFERENCES marche(id)
  )`,
  `CREATE TABLE IF NOT EXISTS ordini (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_movimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    modello_id INTEGER,
    cliente_id INTEGER NOT NULL,
    marca_id INTEGER,
    note TEXT,
    contratto_finito INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modello_id) REFERENCES modelli(id),
    FOREIGN KEY (cliente_id) REFERENCES clienti(id),
    FOREIGN KEY (marca_id) REFERENCES marche(id)
  )`,
];

// Migrazioni idempotenti per database preesistenti
const MIGRAZIONI = [
  "ALTER TABLE clienti ADD COLUMN data_passaggio DATE",
  "ALTER TABLE clienti ADD COLUMN flag_ricontatto INTEGER DEFAULT 0",
  "ALTER TABLE clienti ADD COLUMN note TEXT",
  "ALTER TABLE ordini ADD COLUMN contratto_finito INTEGER DEFAULT 0",
];

async function initDatabase() {
  for (const sql of TABELLE) await dbRun(sql);

  for (const sql of MIGRAZIONI) {
    try {
      await dbRun(sql);
    } catch (err) {
      if (!String(err.message).includes("duplicate column")) {
        console.error("Errore migrazione:", err.message);
      }
    }
  }

  await creaAdminPredefinito();
}

async function creaAdminPredefinito() {
  const row = await dbGet("SELECT COUNT(*) as count FROM utenti");
  if (row.count === 0) {
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    await dbRun("INSERT INTO utenti (nome, password) VALUES (?, ?)", [
      "Admin",
      hashedPassword,
    ]);
    console.log("Utente di default creato: Admin / Admin123!");
  }
}

module.exports = { db, initDatabase };
